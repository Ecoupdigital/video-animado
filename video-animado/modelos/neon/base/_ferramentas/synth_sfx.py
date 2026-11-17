# Gera os sons do modelo Neon retrô por síntese, só com numpy (nenhuma outra biblioteca, nenhum arquivo de fora) e
# o módulo wave:
#   zumbido  o neon acendendo (o tremido do letreiro: fraco, aceso, uma queda e aceso de vez), agudo, sem grave
#   tique    o tique do preço contando, do relógio e do 3, 2, 1
#   deslize  a peça que entra (o que, selo, botão, card final)
#   cama     a cama synth em laço: 8 s, 120 batidas por minuto, 4 compassos de 4 tempos (um acorde por compasso: lá
#            menor, fá, dó e sol), bumbo em todo tempo (a primeira batida em 0 s), palma no 2 e no 4, chimbal no
#            contratempo, baixo em colcheias e um pad. O andamento está declarado em sfx/ORIGEM.md e no opcoes.json
#            ("musica"): é por ele que a receita só letreiros põe cada peça numa batida.
# Sempre iguais (semente fixa por efeito). Origem e licença em sfx/ORIGEM.md.
# Uso: python3 synth_sfx.py [pasta-de-saida]     (padrão: _ferramentas/sfx/ ao lado deste arquivo)
# Outros scripts usam garantir_sfx(destino): copia os efeitos da pasta do kit e gera os que faltarem.
import os, shutil, sys, wave
import numpy as np

TAXA = 44100
TAXA_CAMA = 22050
PASTA_SFX = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
# andamento da cama (o mesmo do opcoes.json, "musica"): 120 batidas por minuto, a primeira em 0 s, 4 tempos por compasso
BPM = 120
PRIMEIRA_BATIDA = 0.0
TEMPOS_POR_COMPASSO = 4
DURACAO_CAMA = 8.0


def _t(seg, taxa=TAXA):
    return np.arange(int(round(taxa * seg))) / taxa


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


def zumbido(rng):
    """Tubo de neon acendendo: zumbido de 240 Hz com harmônicos e um chiado, no envelope do tremido do letreiro."""
    t = _t(0.42)
    serra = sum(np.sin(2 * np.pi * 240 * k * t) / k for k in range(1, 9))
    chiado = _filtro(rng.standard_normal(len(t)), 2500, 9000) * 0.35
    env = np.ones_like(t)
    env[t < 0.066] = 0.3
    env[(t >= 0.133) & (t < 0.2)] = 0.45
    env *= np.exp(-np.clip(t - 0.2, 0, None) * 9)
    x = _filtro((serra + chiado) * env, 200)
    # estalo do acendimento
    x[: int(TAXA * 0.004)] += _filtro(rng.standard_normal(int(TAXA * 0.004)), 1500) * 0.8
    return _bordas(x, 0.001, 0.04)


def tique(rng):
    t = _t(0.05)
    x = np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 120) + _filtro(rng.standard_normal(len(t)), 3000, 9000) * np.exp(-t * 160) * 0.6
    return _bordas(x, 0.0005, 0.01)


def deslize(rng):
    t = _t(0.35)
    env = np.sin(np.pi * t / 0.35) ** 2
    x = _filtro(rng.standard_normal(len(t)), 500, 4000) * env
    return _bordas(x, 0.005, 0.03)


def cama(rng):
    """Cama synth de 8 s em laço, 120 batidas por minuto (16 tempos): bumbo em todo tempo, palma no 2 e no 4,
    chimbal no contratempo, baixo em colcheias e pad nos acordes de lá menor, fá, dó e sol (um por compasso). O que
    passa do fim volta para o começo, então o laço emenda sem estalo e sem buraco."""
    taxa = TAXA_CAMA
    batida = 60.0 / BPM
    n = int(round(DURACAO_CAMA * taxa))
    x = np.zeros(n + taxa)  # 1 s de sobra para as caudas, que depois voltam para o começo

    def soma(som, inicio):
        i = int(round(inicio * taxa))
        x[i: i + len(som)] += som[: len(x) - i]

    tb = _t(0.32, taxa)
    bumbo = np.sin(2 * np.pi * (45 * tb + (110 - 45) / 28 * (1 - np.exp(-tb * 28)))) * np.exp(-tb * 9)
    bumbo[: int(taxa * 0.002)] *= np.linspace(0, 1, int(taxa * 0.002))
    tp = _t(0.2, taxa)
    palma = _filtro(rng.standard_normal(len(tp)), 900, 5000, taxa) * np.exp(-tp * 22) * 0.55
    tc = _t(0.05, taxa)
    chimbal = _filtro(rng.standard_normal(len(tc)), 6000, None, taxa) * np.exp(-tc * 90) * 0.22
    acordes = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (130.81, 164.81, 196.0), (196.0, 246.94, 293.66)]
    graves = [55.0, 43.65, 65.41, 49.0]
    tempos = int(round(DURACAO_CAMA / batida))
    for k in range(tempos):
        ini = PRIMEIRA_BATIDA + k * batida
        soma(bumbo, ini)
        if k % 2 == 1:
            soma(palma, ini)
        soma(chimbal, ini + batida / 2)
    # baixo em colcheias (serra filtrada) e pad (senoides desafinadas), um acorde por compasso
    compasso = TEMPOS_POR_COMPASSO * batida
    for c in range(int(round(DURACAO_CAMA / compasso))):
        ac = acordes[c % 4]
        tcmp = _t(compasso, taxa)
        pad = sum(np.sin(2 * np.pi * f * (1 + d) * tcmp) for f in ac for d in (-0.003, 0.003)) * 0.06
        pad *= np.minimum(1, tcmp / 0.25) * np.minimum(1, (compasso - tcmp) / 0.25)
        soma(_filtro(pad, alto=2200, taxa=taxa), c * compasso)
        tbx = _t(batida / 2, taxa)
        nota = sum(np.sin(2 * np.pi * graves[c % 4] * 2 * h * tbx) / h for h in range(1, 6)) * np.exp(-tbx * 7) * 0.22
        nota = _filtro(nota, alto=700, taxa=taxa)
        nota[: int(taxa * 0.003)] *= np.linspace(0, 1, int(taxa * 0.003))
        for e in range(TEMPOS_POR_COMPASSO * 2):
            soma(nota, c * compasso + e * batida / 2)
    saida = x[:n].copy()
    saida[: len(x) - n] += x[n:]
    return saida


EFEITOS = [('zumbido.wav', zumbido), ('tique.wav', tique), ('deslize.wav', deslize), ('cama.wav', cama)]
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
        rng = np.random.default_rng(31 + NOMES.index(nome))
        x = fn(rng)
        _salvar(os.path.join(pasta, nome), x, TAXA_CAMA if nome == 'cama.wav' else TAXA, 0.6 if nome == 'cama.wav' else 0.85)
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
