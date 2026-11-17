# Gera os sons do template pixel por síntese, só com numpy e a biblioteca padrão (wave): sempre os mesmos bytes.
# Uso: python3 _ferramentas/gerar_sfx.py [pasta]   (padrão: _ferramentas/sfx ao lado deste arquivo)
#   pop.wav        entrada de etiqueta, bloco, balão
#   tick.wav       item da lista marcado
#   whoosh.wav     troca de seção
#   sino.wav       notificação do "Seguindo"
#   digitando.wav  teclas do "digitando..."
#   stamp.wav      selo carimbado
#   clique.wav     botão "Seguir"
#   cama.wav       cama chiptune de 8 s em laço, baixa (o template toca em volume 0,09)
# Também serve de módulo: garantir_sfx(pasta) copia os sons de _ferramentas/sfx (ou gera, se faltar).
import os
import shutil
import sys
import wave

import numpy as np

SR = 44100
NOMES = ['pop', 'tick', 'whoosh', 'sino', 'digitando', 'stamp', 'clique', 'cama']


def t(d, sr=SR):
    return np.arange(int(d * sr)) / sr


def env(n, a, r, sr=SR):
    """ataque linear de a segundos e queda exponencial com constante r"""
    x = np.arange(n) / sr
    e = np.exp(-x / r)
    na = max(1, int(a * sr))
    e[:na] *= np.linspace(0, 1, na)
    return e


def quadrada(f, x, duty=0.5):
    return np.where((x * f) % 1 < duty, 1.0, -1.0)


def suaviza(x, k):
    """passa-baixa de média móvel (k amostras)"""
    if k <= 1:
        return x
    return np.convolve(x, np.ones(k) / k, mode='same')


def gravar(arq, x, sr=SR, pico=0.8):
    x = np.asarray(x, dtype=np.float64)
    m = np.max(np.abs(x)) or 1.0
    x = x / m * pico
    # 10 ms de rampa nas pontas: sem estalo
    n = min(len(x) // 4, int(0.01 * sr))
    if n > 0:
        x[:n] *= np.linspace(0, 1, n)
        x[-n:] *= np.linspace(1, 0, n)
    dados = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    with wave.open(arq, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(dados)


def sons():
    rng = np.random.default_rng(16)
    out = {}
    # pop: blip de onda quadrada que sobe de tom, bem curto
    x = t(0.12)
    f = np.interp(x, [0, 0.12], [520, 1040])
    out['pop'] = suaviza(quadrada(1, np.cumsum(f) / SR, 0.5), 3) * env(len(x), 0.003, 0.035)
    # tick: dois pulsos agudos (som de marcar)
    x = t(0.09)
    a = quadrada(1800, x, 0.25) * env(len(x), 0.001, 0.012)
    b = np.zeros_like(a)
    d = int(0.035 * SR)
    b[d:] = (quadrada(2400, x, 0.25) * env(len(x), 0.001, 0.014))[: len(x) - d]
    out['tick'] = suaviza(a + 0.8 * b, 2)
    # whoosh: ruído filtrado com o filtro abrindo e fechando
    x = t(0.32)
    ruido = rng.standard_normal(len(x))
    k = np.interp(x, [0, 0.16, 0.32], [24, 4, 24]).astype(int)
    filt = np.array([ruido[max(0, i - kk): i + 1].mean() for i, kk in enumerate(k)])
    out['whoosh'] = filt * np.sin(np.pi * x / 0.32) ** 2
    # sino: duas notas de onda triangular em arpejo (notificação)
    x = t(0.55)
    tri = lambda fq, xx: 2 * np.abs(2 * ((xx * fq) % 1) - 1) - 1
    n1 = tri(1318.5, x) * env(len(x), 0.002, 0.12)
    n2 = np.zeros_like(n1)
    d = int(0.09 * SR)
    n2[d:] = (tri(1975.5, x) * env(len(x), 0.002, 0.18))[: len(x) - d]
    out['sino'] = n1 + n2
    # digitando: 6 cliques de tecla com tons e espaços sorteados (sorteio fixo)
    x = np.zeros(int(0.7 * SR))
    pos = 0.0
    for _ in range(6):
        i = int(pos * SR)
        c = t(0.03)
        clk = (rng.standard_normal(len(c)) * 0.5 + quadrada(rng.uniform(900, 1400), c, 0.3)) * env(len(c), 0.0005, 0.006)
        x[i: i + len(c)] += clk[: len(x) - i]
        pos += rng.uniform(0.08, 0.13)
    out['digitando'] = suaviza(x, 2)
    # stamp: baque grave com ruído (carimbo)
    x = t(0.3)
    f = np.interp(x, [0, 0.3], [180, 60])
    grave = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.001, 0.06)
    out['stamp'] = grave + suaviza(rng.standard_normal(len(x)), 6) * env(len(x), 0.0005, 0.02) * 0.9
    # clique: clique curto de botão
    x = t(0.06)
    out['clique'] = suaviza(quadrada(1000, x, 0.5) * env(len(x), 0.0005, 0.008) + rng.standard_normal(len(x)) * env(len(x), 0.0005, 0.004) * 0.5, 2)
    # cama: 8 s em laço, 120 bpm, baixo em onda quadrada e arpejo triangular em lá menor, fá, dó, sol
    sr = 22050
    x = np.arange(int(8 * sr)) / sr
    cama = np.zeros_like(x)
    acordes = [(220.0, [440.0, 523.25, 659.25]), (174.61, [349.23, 440.0, 523.25]), (261.63, [523.25, 659.25, 783.99]), (196.0, [392.0, 493.88, 587.33])]
    tri = lambda fq, xx: 2 * np.abs(2 * ((xx * fq) % 1) - 1) - 1
    for k, (baixo, arp) in enumerate(acordes):
        for batida in range(4):
            i0 = int((k * 2 + batida * 0.5) * sr)
            n = int(0.5 * sr)
            xx = np.arange(n) / sr
            cama[i0: i0 + n] += 0.35 * quadrada(baixo / 2, xx, 0.25) * env(n, 0.004, 0.18, sr)
            for j in range(4):
                i1 = i0 + int(j * 0.125 * sr)
                m = int(0.12 * sr)
                xm = np.arange(m) / sr
                cama[i1: i1 + m] += 0.22 * tri(arp[(batida + j) % 3], xm) * env(m, 0.002, 0.05, sr)
    out['cama'] = (suaviza(cama, 3), sr)
    return out


def gerar(pasta):
    os.makedirs(pasta, exist_ok=True)
    for nome, x in sons().items():
        if isinstance(x, tuple):
            gravar(os.path.join(pasta, f'{nome}.wav'), x[0], x[1], 0.6)
        else:
            gravar(os.path.join(pasta, f'{nome}.wav'), x)
    return NOMES


def garantir_sfx(destino):
    """Deixa os sons em destino: copia de _ferramentas/sfx (gerando lá se faltar)."""
    origem = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
    if not all(os.path.isfile(os.path.join(origem, f'{n}.wav')) for n in NOMES):
        gerar(origem)
    os.makedirs(destino, exist_ok=True)
    for n in NOMES:
        if not os.path.isfile(os.path.join(destino, f'{n}.wav')):
            shutil.copyfile(os.path.join(origem, f'{n}.wav'), os.path.join(destino, f'{n}.wav'))


if __name__ == '__main__':
    pasta = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
    nomes = gerar(pasta)
    print(f'ok {len(nomes)} sons em {pasta}: {", ".join(n + ".wav" for n in nomes)}')
