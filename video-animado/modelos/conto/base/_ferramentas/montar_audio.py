# Junta os trechos de voz de um episódio (um arquivo por fala), corta o silêncio das pontas,
# põe a pausa escolhida depois de cada um, normaliza (-15 LUFS) e gera:
#   public/narracao.mp3, src/falas.json (quem fala de quando a quando) e public/sfx/ (os efeitos)
# O nome do arquivo diz quem fala: "<ordem>-<id do personagem>.<ext>" (1-bia.mp3, 2-seu-ademar.mp3); a fala do
# narrador (se ligado no universo) é "<ordem>-narrador.mp3". Quem não é personagem nem o narrador ligado: sai 1.
# Uso (na raiz do universo): python3 _ferramentas/montar_audio.py <pasta-do-episodio> 1-bia.mp3:0.3 2-seu-ademar.mp3:0.3 ...
# Precisa de ffmpeg e ffprobe. Os arquivos ficam em <pasta-do-episodio>/audio/.
import json, os, subprocess, sys
from gerar_sfx import garantir_sfx

if len(sys.argv) < 3:
    sys.exit('Uso: python3 montar_audio.py <pasta-do-episodio> 1-<id>.mp3:0.3 2-<id>.mp3:0.3 ...')
ep = sys.argv[1]
segs = []
for a in sys.argv[2:]:
    nome, _, pausa = a.partition(':')
    segs.append((nome, float(pausa or 0.3)))
au = os.path.join(ep, 'audio')
tmp = os.path.join(au, '_cortado')
os.makedirs(tmp, exist_ok=True)
os.makedirs(os.path.join(ep, 'public'), exist_ok=True)
os.makedirs(os.path.join(ep, 'src'), exist_ok=True)


def elenco_do_universo(pasta):
    """Ids e nomes dos personagens e se o narrador está ligado, lidos do respostas.json da raiz do universo."""
    d = os.path.abspath(pasta)
    while not os.path.isfile(os.path.join(d, 'respostas.json')):
        pai = os.path.dirname(d)
        if pai == d:
            return None
        d = pai
    r = json.load(open(os.path.join(d, 'respostas.json'), encoding='utf-8'))
    n = r.get('narrador')
    ligado = n is True or (isinstance(n, dict) and n.get('ligado') is True)
    return {'ids': [p.get('id') for p in r.get('personagens', [])], 'nomes': [p.get('nome') or '' for p in r.get('personagens', [])], 'narrador': ligado}


def conferir_quem(quem, onde, elenco):
    """Sai 1 dizendo qual fala tem um "quem" que não é personagem do universo nem o narrador ligado."""
    if elenco is None:
        return
    import unicodedata
    simples = lambda t: ''.join(c for c in unicodedata.normalize('NFD', str(t)) if unicodedata.category(c) != 'Mn').lower().replace(' ', '-')
    if quem == 'narrador':
        if not elenco['narrador']:
            sys.exit(f'{onde}: "narrador", mas o narrador está desligado neste universo (para ligar: "narrador": {{ "ligado": true }} no respostas.json e --aplicar)')
        return
    if quem in elenco['ids'] or simples(quem) in [simples(x) for x in elenco['nomes']]:
        return
    extra = ' ou "narrador"' if elenco['narrador'] else ' (o narrador está desligado)'
    sys.exit(f'{onde}: "{quem}" não é personagem deste universo (aceitos: {", ".join(elenco["ids"])}{extra})')


elenco = elenco_do_universo(ep)


def dur(f):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True)
    return float(r.stdout)


corte = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse'
arqs, falas, t = [], [], 0.0
for nome, pausa in segs:
    origem = os.path.join(au, nome)
    if not os.path.isfile(origem):
        sys.exit(f'falta o arquivo {origem}')
    base = os.path.splitext(nome)[0]
    if '-' not in base:
        sys.exit(f'nome "{nome}" sem quem fala: use <ordem>-<id>.mp3 (ex.: 1-bia.mp3)')
    quem = base.split('-', 1)[1]
    conferir_quem(quem, f'audio/{nome}', elenco)
    out = os.path.join(tmp, base + '.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', origem, '-af', f'aresample=44100,{corte},apad=pad_dur={pausa}', '-ac', '1', out], check=True)
    d = dur(out)
    falas.append({'quem': quem, 'ini': round(t, 3), 'fim': round(t + d - pausa, 3)})
    t += d
    arqs.append(out)
lista = os.path.join(tmp, 'lista.txt')
with open(lista, 'w') as f:
    f.write(''.join(f"file '{os.path.abspath(a)}'\n" for a in arqs))
narracao = os.path.join(ep, 'public', 'narracao.mp3')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '192k', narracao], check=True)
with open(os.path.join(ep, 'src', 'falas.json'), 'w') as f:
    json.dump(falas, f, ensure_ascii=False, indent=1)
garantir_sfx(os.path.join(ep, 'public', 'sfx'))
print('duração', round(dur(narracao), 2))
print(json.dumps(falas, ensure_ascii=False))
