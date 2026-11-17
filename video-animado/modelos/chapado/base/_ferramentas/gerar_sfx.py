# Gera os 4 efeitos sonoros do modelo por síntese, só com numpy (sem scipy, sem arquivo de fora):
#   pop.wav (texto que entra), ding.wav (a dica), deslize.wav (entrada de personagem ou tela), suspense.wav (antes da descoberta)
# Sempre iguais (semente fixa), 44,1 kHz, mono, 16 bits. Origem e licença em sfx/ORIGEM.md.
# Uso: python3 gerar_sfx.py [pasta-de-saida]     (padrão: _ferramentas/sfx/ ao lado deste arquivo)
# Outros scripts usam garantir_sfx(destino): copia os efeitos da pasta do kit e gera se faltar.
import os, shutil, sys, wave
import numpy as np

TAXA = 44100
NOMES = ['pop.wav', 'ding.wav', 'deslize.wav', 'suspense.wav']
PASTA_SFX = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')


def _t(seg):
    return np.arange(int(TAXA * seg)) / TAXA


def _bordas(x, entrada=0.003, saida=0.01):
    """Rampa curta nas pontas para não estalar."""
    n_in, n_out = int(TAXA * entrada), int(TAXA * saida)
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def _passa_faixa(x, baixo, alto):
    """Filtro passa-faixa pela FFT (corta tudo fora de baixo..alto Hz, com borda suave)."""
    espectro = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / TAXA)
    ganho = np.clip((f - baixo * 0.7) / (baixo * 0.3 + 1e-9), 0, 1) * np.clip((alto * 1.3 - f) / (alto * 0.3), 0, 1)
    return np.fft.irfft(espectro * ganho, n=len(x))


def pop():
    t = _t(0.14)
    freq = 950 * np.exp(-t * 18) + 260          # cai rápido de ~1200 Hz para ~260 Hz
    fase = 2 * np.pi * np.cumsum(freq) / TAXA
    x = np.sin(fase) * np.exp(-t * 32)
    x += 0.25 * np.sin(2 * fase) * np.exp(-t * 60)
    return _bordas(x, 0.001, 0.02)


def ding():
    t = _t(1.3)
    base = 1318.5                                # mi 6, sino claro
    x = np.zeros_like(t)
    for mult, amp, dec in [(1, 1.0, 3.2), (2.0, 0.35, 5.0), (2.76, 0.28, 6.5), (5.4, 0.12, 9.0)]:
        x += amp * np.sin(2 * np.pi * base * mult * t) * np.exp(-t * dec)
    x *= 1 - np.exp(-t * 400)                    # ataque de 2-3 ms
    return _bordas(x, 0.0, 0.05)


def deslize():
    rng = np.random.default_rng(7)
    t = _t(0.5)
    ruido = _passa_faixa(rng.standard_normal(len(t)), 500, 4500)
    env = np.sin(np.pi * np.clip(t / 0.5, 0, 1)) ** 1.6
    varredura = 0.35 * np.sin(2 * np.pi * np.cumsum(300 + 900 * t / 0.5) / TAXA) * env
    x = ruido / (np.max(np.abs(ruido)) + 1e-9) * env + varredura
    return _bordas(x, 0.005, 0.03)


def suspense():
    t = _t(1.8)
    sobe = 1 + 0.06 * t / 1.8                    # sobe um pouco o tom até o fim
    x = (np.sin(2 * np.pi * 110 * sobe * t) + 0.8 * np.sin(2 * np.pi * 116.5 * sobe * t) + 0.35 * np.sin(2 * np.pi * 220 * sobe * t))
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 5.5 * t) ** 2   # tremolo
    env = np.clip(t / 0.5, 0, 1) * np.clip((1.8 - t) / 0.35, 0, 1)
    return _bordas(x * env, 0.0, 0.05)


GERADORES = {'pop.wav': pop, 'ding.wav': ding, 'deslize.wav': deslize, 'suspense.wav': suspense}


def gravar(caminho, x, pico=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * pico
    dados = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    with wave.open(caminho, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAXA)
        w.writeframes(dados)


def gerar(pasta=PASTA_SFX):
    os.makedirs(pasta, exist_ok=True)
    for nome in NOMES:
        gravar(os.path.join(pasta, nome), GERADORES[nome]())
    return [os.path.join(pasta, n) for n in NOMES]


def garantir_sfx(destino):
    """Deixa os 4 efeitos em `destino` (public/sfx do episódio): copia da pasta do kit; se faltar, gera."""
    os.makedirs(destino, exist_ok=True)
    if not all(os.path.isfile(os.path.join(PASTA_SFX, n)) for n in NOMES):
        try:
            gerar(PASTA_SFX)
            print('efeitos gerados em', PASTA_SFX)
        except OSError:
            gerar(destino)
            return
    for n in NOMES:
        shutil.copyfile(os.path.join(PASTA_SFX, n), os.path.join(destino, n))


if __name__ == '__main__':
    pasta = sys.argv[1] if len(sys.argv) > 1 else PASTA_SFX
    for arq in gerar(pasta):
        with wave.open(arq) as w:
            print(os.path.basename(arq), round(w.getnframes() / w.getframerate(), 2), 's')
