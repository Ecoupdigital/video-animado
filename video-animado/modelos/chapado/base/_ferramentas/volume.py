# Volume da voz por frame (30 fps), de 0 a 1, com piso: vira o "falando" da boca.
# Uso: python3 _ferramentas/volume.py <narracao.mp3> <saida volume.json>
# Precisa de ffmpeg e numpy.
import json, subprocess, sys
import numpy as np

if len(sys.argv) < 3:
    sys.exit('Uso: python3 volume.py <audio> <saida.json>')
src, out = sys.argv[1], sys.argv[2]
sr, fps = 16000, 30
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
hop = sr // fps
n = len(x) // hop
rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
db = 20 * np.log10(rms)
v = np.clip((db + 42) / 26, 0, 1)        # -42 dB = boca fechada, -16 dB = aberta
v[v < 0.12] = 0                           # piso: não treme no silêncio
sm = np.copy(v)
for i in range(1, n):
    sm[i] = max(v[i], sm[i - 1] * 0.55)   # fecha mais devagar do que abre
sm[sm < 0.08] = 0                         # piso depois da suavização
json.dump([round(float(a), 3) for a in sm], open(out, 'w'))
print(n, 'frames', round(float(np.mean(sm > 0)), 2), 'com fala')
