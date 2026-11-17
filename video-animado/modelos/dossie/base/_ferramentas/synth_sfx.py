# Gera os efeitos sonoros do dossiê por síntese, só com numpy (nenhuma outra biblioteca, nenhum arquivo de fora) e o módulo wave:
#   boom, hit, stamp, whoosh, whoosh_soft, tick, glitch, riser, counter_roll, typing_short, thump, blip, error
#   e a cama de suspense (cama.wav, 8 s em laço). Sempre iguais (semente fixa). Origem e licença em sfx/ORIGEM.md.
# Uso: python3 synth_sfx.py [pasta-de-saida]     (padrão: _ferramentas/sfx/ ao lado deste arquivo)
# Outros scripts usam garantir_sfx(destino): copia os efeitos da pasta do kit e gera os que faltarem.
import os, shutil, sys, wave
import numpy as np

TAXA = 44100
TAXA_CAMA = 22050
PASTA_SFX = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')


def _t(seg, taxa=TAXA):
    return np.arange(int(taxa * seg)) / taxa


def _filtro(x, baixo=None, alto=None, taxa=TAXA):
    """Filtro pela FFT com borda suave: passa-alta acima de "baixo", passa-baixa abaixo de "alto" (Hz)."""
    espectro = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / taxa)
    ganho = np.ones_like(f)
    if baixo:
        ganho *= np.clip((f - baixo * 0.6) / (baixo * 0.4 + 1e-9), 0, 1)
    if alto:
        ganho *= np.clip((alto * 1.4 - f) / (alto * 0.4), 0, 1)
    return np.fft.irfft(espectro * ganho, n=len(x))


def _seno_varrido(freq, taxa=TAXA):
    return np.sin(2 * np.pi * np.cumsum(freq) / taxa)


def _bordas(x, entrada=0.002, saida=0.01, taxa=TAXA):
    n_in, n_out = int(taxa * entrada), int(taxa * saida)
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def boom(rng):
    t = _t(2.2)
    x = _seno_varrido(95 * np.exp(-t * 2.2) + 32) * np.exp(-t * 1.6) * 1.4
    x += _filtro(rng.standard_normal(len(t)), alto=3500) * np.exp(-t * 40) * 0.5
    x += _filtro(rng.standard_normal(len(t)), alto=400) * np.exp(-t * 5) * 0.6
    return _bordas(np.tanh(x * 1.6), 0.001, 0.2)


def hit(rng):
    t = _t(0.9)
    x = _seno_varrido(140 * np.exp(-t * 18) + 45) * np.exp(-t * 7) * 1.3
    x += _filtro(rng.standard_normal(len(t)), 800, 6000) * np.exp(-t * 30) * 0.7
    return _bordas(np.tanh(x * 1.8), 0.001, 0.1)


def stamp(rng):
    t = _t(0.55)
    x = np.sin(2 * np.pi * 72 * t) * np.exp(-t * 22) * 1.2
    x += _filtro(rng.standard_normal(len(t)), 180, 3200) * np.exp(-t * 45) * 0.9
    tapa = np.zeros_like(t)
    i = int(0.028 * TAXA)
    tapa[i:] = _filtro(rng.standard_normal(len(t) - i), 1500, 7000) * np.exp(-t[: len(t) - i] * 80) * 0.5
    return _bordas(np.tanh((x + tapa) * 1.5), 0.001, 0.08)


def whoosh(rng, dur=0.7, baixo=300, alto=5000):
    t = _t(dur)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1) ** 0.8) ** 2
    ruido = rng.standard_normal(len(t))
    # três faixas que se sucedem: o ar "passa" do grave ao agudo
    faixas = [(baixo, baixo * 4), (baixo * 3, alto * 0.5), (alto * 0.4, alto)]
    x = np.zeros_like(t)
    for k, (a, b) in enumerate(faixas):
        centro = (k + 1) / 4
        peso = np.exp(-((t / dur - centro) ** 2) / 0.03)
        x += _filtro(ruido, a, b) * peso
    return _bordas(x * env, 0.005, 0.05)


def whoosh_soft(rng):
    t = _t(0.6)
    env = np.sin(np.pi * t / 0.6) ** 2
    return _bordas(_filtro(rng.standard_normal(len(t)), 150, 1800) * env, 0.005, 0.05)


def tick(rng):
    t = _t(0.12)
    x = _filtro(rng.standard_normal(len(t)), 2500, 7000) * np.exp(-t * 120) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * 0.5
    return _bordas(x, 0.0005, 0.01)


def glitch(rng):
    t = _t(0.25)
    quadrada = np.sign(np.sin(2 * np.pi * 70 * t)) * 0.4
    x = _filtro(quadrada + rng.standard_normal(len(t)) * 0.6, 300, 9000) * np.exp(-t * 14)
    x[int(TAXA * 0.05): int(TAXA * 0.08)] = 0
    x[int(TAXA * 0.13): int(TAXA * 0.145)] = 0
    return _bordas(x, 0.001, 0.02)


def riser(rng):
    t = _t(2.5)
    x = _seno_varrido(120 + 900 * (t / 2.5) ** 2) * 0.4 + _filtro(rng.standard_normal(len(t)), 1500) * 0.5
    return _bordas(x * (t / 2.5) ** 2.2, 0.01, 0.03)


def counter_roll(rng):
    t = _t(1.0)
    x = np.zeros_like(t)
    clique = tick(rng)[: int(0.03 * TAXA)]
    pos = 0.0
    passo = 0.028
    while pos < 0.9:
        i = int(pos * TAXA)
        n = min(len(clique), len(x) - i)
        x[i: i + n] += clique[:n] * (0.6 + 0.4 * pos)
        pos += passo
        passo *= 1.07  # desacelera como um contador que para
    return _bordas(x, 0.001, 0.05)


def typing_short(rng):
    t = _t(0.9)
    x = np.zeros_like(t)
    pos = 0.02
    while pos < 0.8:
        n = int(0.025 * TAXA)
        i = int(pos * TAXA)
        tt = np.arange(n) / TAXA
        tecla = _filtro(rng.standard_normal(n), 1500, 6000) * np.exp(-tt * 180) * rng.uniform(0.6, 1.0)
        x[i: i + n] += tecla[: len(x) - i]
        pos += rng.uniform(0.055, 0.11)
    return _bordas(x, 0.001, 0.03)


def thump(rng):
    t = _t(0.5)
    x = np.sin(2 * np.pi * (55 + 30 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
    x += _filtro(rng.standard_normal(len(t)), alto=500) * np.exp(-t * 25) * 0.4
    return _bordas(np.tanh(x * 1.4), 0.001, 0.05)


def blip(rng):
    t = _t(0.18)
    x = _seno_varrido(1200 + 400 * np.clip(t / 0.04, 0, 1)) * np.exp(-t * 28)
    x += 0.3 * _seno_varrido(2400 + 800 * np.clip(t / 0.04, 0, 1)) * np.exp(-t * 40)
    return _bordas(x, 0.002, 0.02)


def error(rng):
    t = _t(0.45)
    x = np.zeros_like(t)
    for ini, f in [(0.0, 220.0), (0.2, 175.0)]:
        m = (t >= ini) & (t < ini + 0.2)
        tt = t[m] - ini
        tom = sum(np.sin(2 * np.pi * f * h * tt) / h for h in (1, 3, 5))
        x[m] = tom * np.exp(-tt * 6) * np.minimum(1, tt / 0.004)
    return _bordas(x, 0.002, 0.03)


def cama(rng):
    """Cama de suspense de 8 s que emenda em laço: pad grave, coração a 60 bpm e tique-taque."""
    taxa = TAXA_CAMA
    D = 9.0
    t = _t(D, taxa)
    pad = np.zeros_like(t)
    for m, a in [(1, 0.5), (2, 0.35), (1.5, 0.18), (2.4, 0.06)]:
        for d in (-0.6, 0.0, 0.7):
            fase = rng.uniform()
            pad += (2 * (((36.71 * m + d) * t + fase) % 1) - 1) * a / 3
    pad = _filtro(pad, alto=220, taxa=taxa)
    kd = _t(0.35, taxa)
    kick = np.sin(2 * np.pi * np.cumsum(60 * np.exp(-kd * 9) + 38) / taxa) * np.exp(-kd * 11)
    coracao = np.zeros_like(t)
    for i in range(int(D)):
        for off, am in ((0.0, 1.0), (0.22, 0.6)):
            s = int((i + off) * taxa)
            e = min(s + len(kick), len(coracao))
            coracao[s:e] += kick[: e - s] * am
    coracao = _filtro(coracao, alto=160, taxa=taxa)
    tique = np.zeros_like(t)
    n = int(taxa * 0.03)
    tk = _filtro(rng.standard_normal(n), 3000, 8000, taxa=taxa) * np.exp(-np.arange(n) / taxa * 150)
    for i in range(int(D / 0.5)):
        s = int(i * 0.5 * taxa)
        e = min(s + n, len(tique))
        tique[s:e] += tk[: e - s] * (0.25 if i % 2 else 0.18)
    x = pad * 0.55 + coracao * 0.75 + tique * 0.5
    # laço sem estalo: o último segundo (que repete o primeiro, no compasso) entra cruzado no começo
    L = int(8 * taxa)
    um = int(taxa)
    saida = x[:L].copy()
    rampa = np.linspace(0, 1, um)
    saida[:um] = x[:um] * rampa + x[L: L + um] * (1 - rampa)
    return saida


EFEITOS = [
    ('boom.wav', boom), ('hit.wav', hit), ('stamp.wav', stamp), ('whoosh.wav', whoosh), ('whoosh_soft.wav', whoosh_soft),
    ('tick.wav', tick), ('glitch.wav', glitch), ('riser.wav', riser), ('counter_roll.wav', counter_roll),
    ('typing_short.wav', typing_short), ('thump.wav', thump), ('blip.wav', blip), ('error.wav', error), ('cama.wav', cama),
]
NOMES = [n for n, _ in EFEITOS]


def _salvar(caminho, x, taxa, pico):
    x = x / (np.max(np.abs(x)) or 1) * pico
    dados = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    with wave.open(caminho, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taxa)
        w.writeframes(dados)


def gerar(pasta):
    os.makedirs(pasta, exist_ok=True)
    for nome, fn in EFEITOS:
        # semente por efeito: refazer um só dá o mesmo arquivo
        rng = np.random.default_rng(7 + NOMES.index(nome))
        x = fn(rng)
        _salvar(os.path.join(pasta, nome), x, TAXA_CAMA if nome == 'cama.wav' else TAXA, 0.7 if nome == 'cama.wav' else 0.89)
    return [os.path.join(pasta, n) for n in NOMES]


def garantir_sfx(destino):
    """Deixa os efeitos em destino: copia da pasta do kit (_ferramentas/sfx/) e gera os que faltarem."""
    os.makedirs(destino, exist_ok=True)
    faltam = []
    for n in NOMES:
        alvo = os.path.join(destino, n)
        if os.path.isfile(alvo):
            continue
        origem = os.path.join(PASTA_SFX, n)
        if os.path.isfile(origem):
            shutil.copyfile(origem, alvo)
        else:
            faltam.append(n)
    if faltam:
        gerar(destino)


if __name__ == '__main__':
    pasta = sys.argv[1] if len(sys.argv) > 1 else PASTA_SFX
    arquivos = gerar(pasta)
    print(f'ok: {len(arquivos)} efeitos em {pasta}')
