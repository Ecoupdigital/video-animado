# Junta os trechos de voz de um episódio (um arquivo por fala), corta o silêncio das pontas,
# põe a pausa escolhida depois de cada um, normaliza (-15 LUFS) e gera:
#   public/narracao.mp3, src/falas.json (quem fala de quando a quando) e public/sfx/ (os 4 efeitos)
# O nome do arquivo diz quem fala: "<ordem>-<id do personagem>.<ext>" (1-bia.mp3, 2-seu-ademar.mp3).
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
