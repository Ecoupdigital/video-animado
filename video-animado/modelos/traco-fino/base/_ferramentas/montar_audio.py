# Junta os trechos de voz da narradora (um arquivo por fala), corta o silêncio das pontas,
# põe a pausa escolhida depois de cada um, normaliza (-15 LUFS) e gera:
#   public/narracao.mp3, src/falas.json (quem fala de quando a quando, com o "tempo" antes ou agora do roteiro),
#   src/textos.json (o texto de cada fala, que a legenda reparte por frase), public/sfx/ (os 4 efeitos) e
#   public/trilha.wav (trilha.py, da duração da narração mais o fecho; não troca uma trilha que já existe)
# O nome do arquivo diz quem fala: "<ordem>-<id da narradora>.<ext>" (1-rita.mp3, 2-rita.mp3).
# O roteiro-falas.json da pasta do episódio dá o texto e o tempo de cada fala, na mesma ordem dos arquivos.
# Uso (na raiz do universo): python3 _ferramentas/montar_audio.py <pasta-do-episodio> 1-rita.mp3:0.3 2-rita.mp3:0.3 ...
# Precisa de ffmpeg e ffprobe. Os arquivos ficam em <pasta-do-episodio>/audio/.
import json, os, subprocess, sys
from gerar_sfx import garantir_sfx
from trilha import gerar_trilha

FECHO = 4.6  # respiro de 0,6 s mais os 4 s do fecho do episódio base

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
        sys.exit(f'nome "{nome}" sem quem fala: use <ordem>-<id>.mp3 (ex.: 1-rita.mp3)')
    quem = base.split('-', 1)[1]
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
roteiro_arq = os.path.join(ep, 'roteiro-falas.json')
roteiro = json.load(open(roteiro_arq, encoding='utf-8')) if os.path.isfile(roteiro_arq) else []
if roteiro and len(roteiro) != len(falas):
    print(f'aviso: o roteiro-falas.json tem {len(roteiro)} falas e vieram {len(falas)} arquivos; a legenda reparte pelo número de palavras de cada fala, confira a ordem')
for i, fala in enumerate(falas):
    if i < len(roteiro) and roteiro[i].get('tempo') in ('antes', 'agora'):
        fala['tempo'] = roteiro[i]['tempo']
with open(os.path.join(ep, 'src', 'falas.json'), 'w') as f:
    json.dump(falas, f, ensure_ascii=False, indent=1)
with open(os.path.join(ep, 'src', 'textos.json'), 'w') as f:
    json.dump([str(x.get('texto', '')).strip() for x in roteiro[:len(falas)]], f, ensure_ascii=False, indent=1)
if not roteiro:
    print('aviso: sem roteiro-falas.json, textos.json vazio: a legenda reparte as palavras pelo tempo de cada fala')
garantir_sfx(os.path.join(ep, 'public', 'sfx'))
trilha = os.path.join(ep, 'public', 'trilha.wav')
if not os.path.isfile(trilha):
    gerar_trilha(trilha, round(dur(narracao) + FECHO + 0.5, 1))
    print('trilha gerada em', trilha)
print('duração', round(dur(narracao), 2))
print(json.dumps(falas, ensure_ascii=False))
