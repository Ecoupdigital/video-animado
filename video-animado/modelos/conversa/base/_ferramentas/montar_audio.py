# Receita de duas vozes: junta os trechos de voz de um vídeo (um arquivo por mensagem com voz), corta o silêncio das
# pontas, põe a pausa escolhida depois de cada um, normaliza (-15 LUFS) e gera:
#   public/narracao.mp3, src/falas.json (quem fala de quando a quando), src/roteiro.json e public/sfx/ (os sons)
# O nome do arquivo diz quem fala: "<ordem>-<id do lado>.<ext>" (1-rita.mp3, 2-forno.mp3). Os arquivos vão na
# ordem das mensagens com voz do roteiro-falas.json (as marcadas "sem_voz" não têm arquivo): o "quem" do arquivo n
# tem de ser o da n-ésima mensagem com voz, e a quantidade tem de bater. Quem não é um dos 2 lados: sai 1.
# Uso (na raiz do universo): python3 _ferramentas/montar_audio.py <pasta-do-video> 1-rita.mp3:0.3 2-forno.mp3:0.3 ...
# Precisa de ffmpeg e ffprobe. Os arquivos ficam em <pasta-do-video>/audio/; o temporário em audio/_cortado/.
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_sfx import garantir_sfx  # noqa: E402
from roteiro_conversa import gravar, id_de, ler  # noqa: E402

if len(sys.argv) < 3:
    sys.exit('Uso: python3 montar_audio.py <pasta-do-video> 1-<id>.mp3:0.3 2-<id>.mp3:0.3 ...')
ep = sys.argv[1]
segs = []
for a in sys.argv[2:]:
    nome, _, pausa = a.partition(':')
    segs.append((nome, float(pausa or 0.3)))
roteiro, receita, msgs, u = ler(ep)
com_voz = [m for m in msgs if not m.get('sem_voz')]
if len(com_voz) != len(segs):
    sys.exit(f'o roteiro tem {len(com_voz)} mensagem(ns) com voz e vieram {len(segs)} arquivo(s): um arquivo por mensagem com voz, na ordem (marque "sem_voz": true nas que não falam)')
au = os.path.join(ep, 'audio')
tmp = os.path.join(au, '_cortado')
os.makedirs(tmp, exist_ok=True)
os.makedirs(os.path.join(ep, 'public'), exist_ok=True)


def dur(f):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True)
    return float(r.stdout)


corte = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse'
arqs, falas, t = [], [], 0.0
for k, (nome, pausa) in enumerate(segs):
    origem = os.path.join(au, nome)
    if not os.path.isfile(origem):
        sys.exit(f'falta o arquivo {origem}')
    base = os.path.splitext(nome)[0]
    if '-' not in base:
        sys.exit(f'nome "{nome}" sem quem fala: use <ordem>-<id>.mp3 (ex.: 1-rita.mp3)')
    quem = id_de(base.split('-', 1)[1], u)
    if quem is None:
        sys.exit(f'audio/{nome}: "{base.split("-", 1)[1]}" não é um dos 2 lados deste universo (aceitos: {", ".join(p["id"] for p in u["pessoas"])})')
    if quem != com_voz[k]['quem']:
        sys.exit(f'audio/{nome}: a {k + 1}ª mensagem com voz do roteiro é de "{com_voz[k]["quem"]}", não de "{quem}" ("{str(com_voz[k].get("texto") or com_voz[k]["tipo"])[:40]}")')
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
roteiro['receita'] = 'vozes-por-fala'
gravar(ep, roteiro)
with open(os.path.join(ep, 'src', 'falas.json'), 'w') as f:
    json.dump(falas, f, ensure_ascii=False, indent=1)
garantir_sfx(os.path.join(ep, 'public', 'sfx'))
print('duração', round(dur(narracao), 2))
print(json.dumps(falas, ensure_ascii=False))
