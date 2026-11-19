# Trilha de suspense sintetizada em código (sem arquivo externo), em estéreo, montada por trechos de clima.
# Uso: python3 _ferramentas/trilha.py <duracao em s> <trilha.json> <saida.wav>
# trilha.json: {"bpm": 112, "trechos": [{"de": 0, "ate": 6.5, "clima": "abertura"}, ...], "golpes": [5.3, 8.6]}
# Climas: abertura (grave e lento, coração do mundo parando), calma (quase nada, só um colchão),
# vazio (silêncio com um grave longe), tensao (baixo pulsando + cordas), correria (tensão + bateria),
# decisao (coração batendo + cordas tremendo, crescendo), final (subida até o corte).
# Golpes: pancada grave com cauda, antecedida de um sopro invertido que puxa para ela.
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

dur, cfg, saida = float(sys.argv[1]), json.load(open(sys.argv[2])), sys.argv[3]
sr = 44100; n = int(dur * sr); rng = np.random.default_rng(11)
bpm = cfg.get('bpm', 112); passo = 60 / bpm
L = np.zeros(n); R = np.zeros(n)
RE, FA, LA, SIB, DOS = 73.42, 87.31, 110.0, 116.54, 138.59  # ré menor, com a sensível


def filtro(x, corte, tipo='low'):
    return sosfilt(butter(2, corte / (sr / 2), tipo, output='sos'), x)


def serra(f, tt, desafina=0.006, vozes=5):
    s = np.zeros(len(tt))
    for v in range(vozes):
        ff = f * (1 + desafina * (v - (vozes - 1) / 2))
        s += 2 * ((ff * tt + v * 0.37) % 1) - 1
    return s / vozes


def poe(sinal, quando, pan=0.0, ganho=1.0):
    i = int(quando * sr)
    if i >= n or i < 0: return
    j = min(n, i + len(sinal)); s = sinal[: j - i] * ganho
    L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))


def bumbo(forca=1.0):
    tt = np.arange(int(0.3 * sr)) / sr
    return np.sin(2 * np.pi * (46 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 13) * forca


def coracao():
    tt = np.arange(int(0.22 * sr)) / sr
    um = np.sin(2 * np.pi * (50 + 40 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 20)
    return np.concatenate([um, np.zeros(int(0.06 * sr)), um * 0.7])


def envelope(m, sobe=0.25, desce=0.35):
    tt = np.arange(m) / sr; d = m / sr
    return np.minimum(1, tt / sobe) * np.minimum(1, np.maximum(0, (d - tt) / desce))


def cordas(notas, m, corte=900, tremolo=0.0):
    tt = np.arange(m) / sr
    s = sum(serra(f, tt) for f in notas) / len(notas)
    if np.ndim(corte):  # corte que abre com o tempo: mistura o som fechado com o aberto
        p = (corte - corte[0]) / max(1e-9, corte[-1] - corte[0])
        s = filtro(s, corte[0]) * (1 - p) + filtro(s, corte[-1]) * p
    else:
        s = filtro(s, corte)
    if tremolo: s *= 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * tremolo * tt))
    return s


def baixo_pulsando(m, t0, notas, forca=1.0):
    # colcheias no baixo, travadas na grade do andamento
    s = np.zeros(m); col = passo / 2
    k0 = int(np.ceil(t0 / col))
    k = k0
    while k * col - t0 < m / sr - 0.05:
        tt = np.arange(int(col * 0.9 * sr)) / sr
        f = notas[(k // 8) % len(notas)]
        nota = filtro(serra(f, tt, 0.003, 3), 420) * np.exp(-tt * 9) * (1.0 if k % 2 == 0 else 0.6)
        i = int((k * col - t0) * sr); j = min(m, i + len(nota)); s[i:j] += nota[: j - i]
        k += 1
    return s * forca


for tr in cfg['trechos']:
    t0, t1, clima = tr['de'], min(tr['ate'], dur), tr['clima']
    m = int((t1 - t0) * sr)
    if m <= 0: continue
    tt = np.arange(m) / sr; e = envelope(m); cresce = tt / (t1 - t0)
    if clima == 'abertura':
        grave = (np.sin(2 * np.pi * RE / 2 * tt) + 0.5 * np.sin(2 * np.pi * RE * tt)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * tt))
        poe(grave * e, t0, 0, 0.16)
        c = cordas([RE * 2, LA * 2, FA * 4], m, 700 + 900 * cresce) * e * (0.3 + 0.7 * cresce)
        poe(c, t0, -0.35, 0.2); poe(np.roll(c, 300), t0, 0.35, 0.2)
        k = 0
        while k * passo * 2 < t1 - t0 - 0.3:  # pulso lento, como um sino grave
            poe(bumbo(0.5 + 0.4 * (k * passo * 2) / (t1 - t0)), t0 + k * passo * 2, 0, 0.5); k += 1
    elif clima == 'calma':
        c = cordas([RE * 2, FA * 2, LA * 2], m, 500) * e
        poe(c, t0, -0.3, 0.07); poe(np.roll(c, 250), t0, 0.3, 0.07)
    elif clima == 'vazio':
        grave = np.sin(2 * np.pi * RE / 2 * tt) * e
        vento = filtro(rng.normal(0, 1, m), 300) * e * (0.5 + 0.5 * np.sin(2 * np.pi * 0.4 * tt))
        poe(grave, t0, 0, 0.2); poe(vento, t0, -0.5, 0.5); poe(np.roll(vento, 5000), t0, 0.5, 0.5)
    elif clima in ('tensao', 'correria'):
        forte = clima == 'correria'
        poe(baixo_pulsando(m, t0, [RE, RE, SIB / 2 * 1.0, DOS / 2]) * e, t0, 0, 0.6 if forte else 0.85)
        c = cordas([RE * 4, FA * 4], m, 1500, tremolo=bpm / 60 * 2) * e * (0.5 + 0.5 * cresce)
        poe(c, t0, -0.45, 0.12 if forte else 0.18); poe(np.roll(c, 400), t0, 0.45, 0.12 if forte else 0.18)
        k = int(np.ceil(t0 / passo))
        while k * passo < t1 - 0.1:
            poe(bumbo(0.8 if forte else 0.7), k * passo, 0, 0.5)
            th = np.arange(int(0.05 * sr)) / sr; chim = filtro(rng.normal(0, 1, len(th)), 5000, 'high') * np.exp(-th * 80)
            for sub in ((0.5,) if not forte else (0.25, 0.5, 0.75)):
                poe(chim, (k + sub) * passo, 0.3, 0.1)
            if forte and k % 2 == 1:  # caixa no contratempo
                tc = np.arange(int(0.16 * sr)) / sr
                poe(filtro(rng.normal(0, 1, len(tc)), 1200, 'high') * np.exp(-tc * 28), k * passo, -0.2, 0.22)
            k += 1
    elif clima == 'decisao':
        c = cordas([RE * 4, FA * 4, LA * 4, DOS * 4], m, 1100 + 1600 * cresce, tremolo=9) * e * (0.25 + 0.75 * cresce ** 1.5)
        poe(c, t0, -0.5, 0.2); poe(np.roll(c, 350), t0, 0.5, 0.2)
        poe(np.sin(2 * np.pi * RE / 2 * tt) * e, t0, 0, 0.14)
        q = t0; cor = coracao()
        while q < t1 - 0.4:  # o coração acelera
            poe(cor, q, 0, 0.55); q += 0.95 - 0.4 * (q - t0) / (t1 - t0)
    elif clima == 'final':
        f = 60 + 90 * cresce ** 2
        sub = np.sin(2 * np.pi * np.cumsum(f) / sr) * cresce ** 2
        c = cordas([RE * 4, FA * 4, LA * 4, DOS * 4, RE * 8], m, 1400 + 2600 * cresce, tremolo=11) * (0.3 + 0.7 * cresce ** 2)
        ee = np.minimum(1, tt / 0.3) * np.minimum(1, np.maximum(0, ((t1 - t0) - tt) / 0.04))  # corta seco no fim
        poe(sub * ee, t0, 0, 0.3); poe(c * ee, t0, -0.5, 0.26); poe(np.roll(c, 350) * ee, t0, 0.5, 0.26)
        q = t0; cor = coracao()
        while q < t1 - 0.3:
            poe(cor, q, 0, 0.6); q += max(0.3, 0.55 - 0.3 * (q - t0) / (t1 - t0))

for g in cfg.get('golpes', []):
    d = 0.9; tt = np.arange(int(d * sr)) / sr  # sopro invertido que puxa para a pancada
    puxa = filtro(rng.normal(0, 1, len(tt)), 2500) * (tt / d) ** 3
    poe(puxa, g - d, -0.4, 0.5); poe(puxa[::1], g - d, 0.4, 0.5)
    tt = np.arange(int(2.6 * sr)) / sr
    pancada = np.sin(2 * np.pi * (38 + 70 * np.exp(-tt * 8)) * tt) * np.exp(-tt * 2.2) + filtro(rng.normal(0, 1, len(tt)), 600) * np.exp(-tt * 5) * 0.6
    poe(pancada, g, 0, 0.75)

x = np.stack([L, R], axis=1)
x = np.tanh(x * 1.3) * 0.85
w = wave.open(saida, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
print('ok', saida, round(dur, 2), 's', len(cfg['trechos']), 'trechos')
