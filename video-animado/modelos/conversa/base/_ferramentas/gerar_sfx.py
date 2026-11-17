# Gera os sons do modelo Conversa no celular por síntese, só com numpy (nenhuma outra biblioteca, nenhum arquivo de
# fora) e o módulo wave:
#   chegou.wav  (bolha do contato entrando), enviada.wav (bolha do dono entrando), tecla.wav (o dono digitando)
#   cama.wav    cama leve de 8 s em laço, para a receita só texto e música (trocável pela música da pessoa:
#               public/musica.mp3 ou public/musica.wav do vídeo)
# Nenhum imita som de notificação de app real: são tons e ruídos feitos aqui. Sempre iguais (semente fixa por som).
# Origem e licença em sfx/ORIGEM.md.
# Uso: python3 gerar_sfx.py [pasta-de-saida]     (padrão: _ferramentas/sfx/ ao lado deste arquivo)
# Outros scripts usam garantir_sfx(destino): copia os sons da pasta do kit e gera os que faltarem.
import os, shutil, sys, wave
import numpy as np

TAXA = 44100
TAXA_CAMA = 22050
PASTA_SFX = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')


def _t(seg, taxa=TAXA):
    return np.arange(int(taxa * seg)) / taxa


def _bordas(x, entrada=0.002, saida=0.01, taxa=TAXA):
    """Rampa curta nas pontas para não estalar."""
    n_in, n_out = int(taxa * entrada), int(taxa * saida)
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def _filtro(x, baixo=None, alto=None, taxa=TAXA):
    """Filtro pela FFT com borda suave: corta abaixo de "baixo" e acima de "alto" (Hz)."""
    espectro = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / taxa)
    ganho = np.ones_like(f)
    if baixo:
        ganho *= np.clip((f - baixo * 0.6) / (baixo * 0.4 + 1e-9), 0, 1)
    if alto:
        ganho *= np.clip((alto * 1.4 - f) / (alto * 0.4), 0, 1)
    return np.fft.irfft(espectro * ganho, n=len(x))


def chegou(rng):
    """Bolha do contato: uma nota de madeira (como marimba) que sobe um pouco, curta e macia."""
    t = _t(0.32)
    freq = 620 + 160 * (1 - np.exp(-t * 40))
    fase = 2 * np.pi * np.cumsum(freq) / TAXA
    x = np.sin(fase) * np.exp(-t * 14) + 0.35 * np.sin(4 * fase) * np.exp(-t * 38) + 0.12 * np.sin(2 * fase) * np.exp(-t * 20)
    x += 0.04 * _filtro(rng.standard_normal(len(t)), 2000, 6000) * np.exp(-t * 120)
    return _bordas(x, 0.001, 0.04)


def enviada(rng):
    """Bolha do dono: um sopro curto que sobe, com um toque leve no fim."""
    t = _t(0.24)
    ruido = _filtro(rng.standard_normal(len(t)), 900, 7000)
    ruido /= np.max(np.abs(ruido)) + 1e-9
    env = np.sin(np.pi * np.clip(t / 0.2, 0, 1)) ** 2
    sopro = ruido * env * 0.55
    varre = 0.4 * np.sin(2 * np.pi * np.cumsum(500 + 1400 * np.clip(t / 0.2, 0, 1)) / TAXA) * env
    toque = np.where(t > 0.16, np.sin(2 * np.pi * 1500 * (t - 0.16)) * np.exp(-(t - 0.16) * 70), 0) * 0.5
    return _bordas(sopro + varre + toque, 0.003, 0.02)


def tecla(rng):
    """Toque de tecla: um clique seco e baixo."""
    t = _t(0.05)
    x = _filtro(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 260)
    x += 0.6 * np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 200)
    return _bordas(x, 0.0005, 0.008)


def cama(rng):
    """Cama leve de 8 s que emenda em laço: acordes de fá, ré menor, si bemol e dó, notas dedilhadas em colcheia e
    um chocalho baixinho nos contratempos."""
    taxa = TAXA_CAMA
    D = 9.0
    t = _t(D, taxa)
    acordes = [(174.61, 220.0, 261.63, 349.23), (146.83, 220.0, 293.66, 349.23), (116.54, 233.08, 293.66, 349.23), (130.81, 196.0, 261.63, 329.63)]
    pad = np.zeros_like(t)
    for i in range(int(D / 2) + 1):
        ac = acordes[i % 4]
        ini = i * 2.0
        m = (t >= ini - 0.25) & (t < ini + 2.25)
        u = np.clip((t[m] - (ini - 0.25)) / 2.5, 0, 1)
        env = np.sin(np.pi * u) ** 1.4
        for k, f in enumerate(ac[1:]):
            pad[m] += np.sin(2 * np.pi * f * t[m] + k) * env * 0.12
        pad[m] += np.sin(2 * np.pi * ac[0] * t[m]) * env * 0.2
    dedilhado = np.zeros_like(t)
    ordem = [1, 2, 3, 2, 1, 3, 2, 3]
    for j in range(int(D / 0.25)):
        ini = j * 0.25
        ac = acordes[int(ini // 2) % 4]
        f = ac[ordem[j % 8]] * 2
        m = t >= ini
        tt = t[m] - ini
        nota = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt) + 0.1 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 7) * np.minimum(1, tt / 0.003)
        dedilhado[m] += nota * (0.13 if j % 2 == 0 else 0.08)
    chocalho = np.zeros_like(t)
    ruido = _filtro(rng.standard_normal(len(t)), 5000, None, taxa)
    for j in range(int(D / 0.5)):
        ini = j * 0.5 + 0.25
        m = (t >= ini) & (t < ini + 0.08)
        chocalho[m] += ruido[m] * np.exp(-(t[m] - ini) * 60) * 0.05
    x = _filtro(pad, alto=2200, taxa=taxa) + _filtro(dedilhado, alto=4500, taxa=taxa) + chocalho
    # laço sem estalo: o último segundo (que repete o primeiro no compasso) entra cruzado no começo
    L = int(8 * taxa)
    um = int(taxa)
    saida = x[:L].copy()
    rampa = np.linspace(0, 1, um)
    saida[:um] = x[:um] * rampa + x[L: L + um] * (1 - rampa)
    return saida


EFEITOS = [('chegou.wav', chegou), ('enviada.wav', enviada), ('tecla.wav', tecla), ('cama.wav', cama)]
NOMES = [n for n, _ in EFEITOS]


def _salvar(caminho, x, taxa, pico):
    x = x / (np.max(np.abs(x)) or 1) * pico
    dados = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    with wave.open(caminho, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taxa)
        w.writeframes(dados)


def gerar(pasta=PASTA_SFX):
    os.makedirs(pasta, exist_ok=True)
    for nome, fn in EFEITOS:
        # semente por som: refazer um só dá o mesmo arquivo
        rng = np.random.default_rng(23 + NOMES.index(nome))
        _salvar(os.path.join(pasta, nome), fn(rng), TAXA_CAMA if nome == 'cama.wav' else TAXA, 0.6 if nome == 'cama.wav' else 0.85)
    return [os.path.join(pasta, n) for n in NOMES]


def garantir_sfx(destino):
    """Deixa os sons em destino (public/sfx do vídeo): copia da pasta do kit; se faltar algum lá, gera."""
    os.makedirs(destino, exist_ok=True)
    if not all(os.path.isfile(os.path.join(PASTA_SFX, n)) for n in NOMES):
        try:
            gerar(PASTA_SFX)
            print('sons gerados em', PASTA_SFX)
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
