# Gera os efeitos sonoros do modelo Mesa vista de cima por síntese, só com numpy (nenhuma outra biblioteca, nenhum
# arquivo de fora) e o módulo wave:
#   pouso-madeira, pouso-marmore, pouso-pano (o item encostando na mesa: um som por superfície), pedaco (pedaço
#   caindo sobre a peça central), pop (item que aparece, card final), papel (a etiqueta de papel chegando),
#   deslize (a faixa de legenda subindo) e a cama leve (cama.wav, 8 s em laço). Sempre iguais (semente fixa).
#   Origem e licença em sfx/ORIGEM.md.
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


def _bordas(x, entrada=0.002, saida=0.01, taxa=TAXA):
    n_in, n_out = int(taxa * entrada), int(taxa * saida)
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def _batida(rng, dur, tom, queda, ruido_de, ruido_ate, ruido, ataque=0.0008):
    """Um objeto encostando: um tom grave que cai rápido mais um estalo de ruído filtrado."""
    t = _t(dur)
    x = np.sin(2 * np.pi * tom * t) * np.exp(-t * queda)
    x += _filtro(rng.standard_normal(len(t)), ruido_de, ruido_ate) * np.exp(-t * queda * 2.2) * ruido
    return _bordas(x, ataque, 0.02)


def pouso_madeira(rng):
    # tok de madeira: grave redondo e uma ressonância média curta
    t = _t(0.22)
    x = _batida(rng, 0.22, 170, 38, 250, 2600, 0.9)
    x += np.sin(2 * np.pi * 430 * t) * np.exp(-t * 55) * 0.45
    return x


def pouso_marmore(rng):
    # pedra: estalo seco e agudo com um anel curto
    t = _t(0.16)
    x = _batida(rng, 0.16, 260, 60, 1800, 9000, 1.2, 0.0003)
    x += np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 70) * 0.25
    return x


def pouso_pano(rng):
    # pano: baque abafado, sem estalo
    return _batida(rng, 0.2, 95, 30, 80, 650, 1.1, 0.004)


def pedaco(rng):
    # pedaço pequeno caindo na peça central: toque curto e leve
    return _batida(rng, 0.09, 520, 80, 1200, 6000, 0.6, 0.0005)


def papel(rng):
    """A etiqueta de papel chegando: farfalhar curto de 1500 a 8000 Hz com envelope irregular e um toque no fim."""
    t = _t(0.32)
    ruido = _filtro(rng.standard_normal(len(t)), 1500, 8000)
    env = np.sin(np.pi * np.clip(t / 0.26, 0, 1)) ** 1.5
    tremido = 0.55 + 0.45 * (rng.uniform(size=len(t) // 300 + 1).repeat(300)[: len(t)])
    x = ruido * env * tremido
    m = t >= 0.24
    tt = t[m] - 0.24
    x[m] += _filtro(rng.standard_normal(m.sum()), 600, 4000) * np.exp(-tt * 80) * 0.8
    return _bordas(x, 0.004, 0.03)


def pop(rng):
    t = _t(0.18)
    x = np.sin(2 * np.pi * (320 * np.exp(-t * 30) + 140) * t) * np.exp(-t * 32)
    x += _filtro(rng.standard_normal(len(t)), 900, 5000) * np.exp(-t * 90) * 0.35
    return _bordas(np.tanh(x * 1.3), 0.0008, 0.02)


def deslize(rng):
    t = _t(0.35)
    env = np.sin(np.pi * t / 0.35) ** 2
    x = _filtro(rng.standard_normal(len(t)), 400, 3200) * env
    return _bordas(x, 0.005, 0.03)


def cama(rng):
    """Cama leve de 8 s que emenda em laço: acorde maior suave, baixo redondo e notas de piano baixinho."""
    taxa = TAXA_CAMA
    D = 9.0
    t = _t(D, taxa)
    # acordes de 2 s: dó, lá menor, fá, sol (com sétima suave), senoides com leve trêmulo
    acordes = [(261.63, 329.63, 392.0, 493.88), (220.0, 261.63, 329.63, 392.0), (174.61, 220.0, 261.63, 329.63), (196.0, 246.94, 293.66, 349.23)]
    pad = np.zeros_like(t)
    baixo = np.zeros_like(t)
    for i in range(int(D / 2) + 1):
        ac = acordes[i % 4]
        ini = i * 2.0
        m = (t >= ini - 0.3) & (t < ini + 2.3)
        u = np.clip((t[m] - (ini - 0.3)) / 2.6, 0, 1)
        env = np.sin(np.pi * u) ** 1.5
        for k, f in enumerate(ac):
            pad[m] += np.sin(2 * np.pi * f * t[m] + k) * env * 0.18 * (1 + 0.08 * np.sin(2 * np.pi * 0.5 * t[m]))
        baixo[m] += np.sin(2 * np.pi * ac[0] / 2 * t[m]) * env * 0.25
    # notas curtas de "piano" (senoide com harmônicos e decaimento) a cada meio segundo, notas do acorde
    notas = np.zeros_like(t)
    for j in range(int(D / 0.5)):
        ini = j * 0.5
        ac = acordes[int(ini // 2) % 4]
        f = ac[[0, 2, 1, 3, 2, 1, 3, 2][j % 8]] * 2
        m = t >= ini
        tt = t[m] - ini
        nota = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 5) * np.minimum(1, tt / 0.004)
        notas[m] += nota * (0.16 if j % 2 == 0 else 0.1)
    x = _filtro(pad, alto=2500, taxa=taxa) + baixo + _filtro(notas, alto=5000, taxa=taxa)
    # laço sem estalo: o último segundo (que repete o primeiro no compasso) entra cruzado no começo
    L = int(8 * taxa)
    um = int(taxa)
    saida = x[:L].copy()
    rampa = np.linspace(0, 1, um)
    saida[:um] = x[:um] * rampa + x[L: L + um] * (1 - rampa)
    return saida


EFEITOS = [
    ('pouso-madeira.wav', pouso_madeira), ('pouso-marmore.wav', pouso_marmore), ('pouso-pano.wav', pouso_pano),
    ('pedaco.wav', pedaco), ('pop.wav', pop), ('papel.wav', papel), ('deslize.wav', deslize), ('cama.wav', cama),
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
        rng = np.random.default_rng(11 + NOMES.index(nome))
        x = fn(rng)
        _salvar(os.path.join(pasta, nome), x, TAXA_CAMA if nome == 'cama.wav' else TAXA, 0.6 if nome == 'cama.wav' else 0.89)
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
