# Grava o duck.json do vídeo: de 0 a 1 por frame (30 fps), 1 quando a voz fala. A cama de suspense abaixa
# por ele (volume x (1 - 0,55 x duck)) e volta nas pausas.
# Uso (na raiz do universo): python3 _ferramentas/duck.py <pasta-do-video>
#   lê  <video>/public/narracao.wav (ou .mp3) pelo ffmpeg, sem arquivo temporário
#   grava <video>/src/duck.json, com o número de frames do timing.json (ou do áudio, se ainda não houver timing)
#   e deixa os efeitos e a cama em <video>/public/sfx/ (copiados do kit ou gerados pelo synth_sfx.py)
# Voz = janela de 1 frame acima de -38 dB, estendida 3 frames antes e 9 depois; sobe rápido (0,35 por frame)
# e desce devagar (0,12 por frame).
import json, os, subprocess, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth_sfx import garantir_sfx  # noqa: E402

FPS = 30
TAXA = 48000
LIMIAR_DB = -38


def envelope(ativo):
    """De uma lista 0/1 por frame para o envelope suave do ducking."""
    a = np.array(ativo, dtype=float)
    estendido = a.copy()
    for i in np.nonzero(a)[0]:
        estendido[max(0, i - 3): i + 9] = 1
    env, v = [], 0.0
    for x in estendido:
        v += (x - v) * (0.35 if x > v else 0.12)
        env.append(round(float(v), 3))
    return env


def ler_audio(arq):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-ac', '1', '-ar', str(TAXA), '-f', 'f32le', '-'], capture_output=True)
    if r.returncode != 0:
        sys.exit(f'ffmpeg não leu {arq}: {r.stderr.decode()[:200]}')
    return np.frombuffer(r.stdout, dtype='<f4')


def gravar(ep):
    arq = next((os.path.join(ep, 'public', n) for n in ('narracao.wav', 'narracao.mp3') if os.path.isfile(os.path.join(ep, 'public', n))), None)
    if not arq:
        sys.exit(f'falta {ep}/public/narracao.wav (ou .mp3)')
    x = ler_audio(arq)
    passo = TAXA // FPS
    n_audio = len(x) // passo
    tm = os.path.join(ep, 'src', 'timing.json')
    n = int(round(json.load(open(tm))['total'] * FPS)) if os.path.isfile(tm) else n_audio
    ativo = []
    for i in range(n):
        bloco = x[i * passo: (i + 1) * passo]
        rms = float(np.sqrt(np.mean(bloco ** 2))) if len(bloco) else 0.0
        ativo.append(1 if 20 * np.log10(rms + 1e-9) > LIMIAR_DB else 0)
    env = envelope(ativo)
    os.makedirs(os.path.join(ep, 'src'), exist_ok=True)
    json.dump(env, open(os.path.join(ep, 'src', 'duck.json'), 'w'))
    garantir_sfx(os.path.join(ep, 'public', 'sfx'))
    return env, arq


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Uso: python3 _ferramentas/duck.py <pasta-do-video>')
    env, arq = gravar(sys.argv[1])
    fala = sum(1 for v in env if v > 0.5)
    print(f'ok: {len(env)} frames de {os.path.basename(arq)}, {fala} com voz ({round(100 * fala / max(1, len(env)))}%); efeitos e cama em public/sfx/')
