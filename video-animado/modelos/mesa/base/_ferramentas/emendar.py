# Troca um trecho errado da narração por um trecho novo, entre duas pausas, sem gerar a narração inteira de novo.
# Uso (na raiz do universo):
#   python3 _ferramentas/emendar.py <pasta-do-video> <trecho-novo.mp3|wav> <de> <ate> [palavras-do-trecho.json]
#   <de> e <ate>: segundos aproximados do começo e do fim do trecho errado na narração atual; o corte vai para a
#   pausa mais perto de cada um (silêncio abaixo de -38 dB por pelo menos 0,12 s, até 0,8 s de distância).
#   O trecho novo perde o silêncio das pontas, ganha o volume médio do trecho trocado, entra com respiro de
#   0,18 s antes e 0,30 s depois e emenda com crossfade de 15 ms.
# Grava public/narracao.wav (mono, 48 kHz, 16 bits) e guarda a anterior em public/narracao.antes-da-emenda.wav.
# Desloca o src/words.json (palavras depois do corte andam a diferença; as do trecho trocado saem, e entram
# as de palavras-do-trecho.json, se vier, com o tempo do arquivo do trecho) e o src/timing.json (ini, fim, at,
# batidas, voiceEnd e total depois do corte). Depois, rode o timing.py e o duck.py de novo.
import json, os, shutil, subprocess, sys, wave
import numpy as np

TAXA = 48000
LIMIAR_DB = -38
PAUSA_MIN = 0.12
RESPIRO_ANTES = 0.18
RESPIRO_DEPOIS = 0.30
CROSS = 0.015


def ler(arq):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-ac', '1', '-ar', str(TAXA), '-f', 'f32le', '-'], capture_output=True)
    if r.returncode != 0:
        sys.exit(f'ffmpeg não leu {arq}: {r.stderr.decode()[:200]}')
    return np.frombuffer(r.stdout, dtype='<f4').astype(np.float64)


def gravar_wav(arq, x):
    with wave.open(arq, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAXA)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def db_por_janela(x, janela=0.01):
    n = int(TAXA * janela)
    m = len(x) // n
    rms = np.sqrt(np.mean(x[: m * n].reshape(m, n) ** 2, axis=1))
    return 20 * np.log10(rms + 1e-9), janela


def pausas(x):
    """Lista de (início, fim) em segundos dos silêncios de pelo menos PAUSA_MIN."""
    db, j = db_por_janela(x)
    quieto = db < LIMIAR_DB
    res, ini = [], None
    for i, q in enumerate(list(quieto) + [False]):
        if q and ini is None:
            ini = i
        elif not q and ini is not None:
            if (i - ini) * j >= PAUSA_MIN:
                res.append((ini * j, i * j))
            ini = None
    return res


def pontas(x):
    db, j = db_por_janela(x)
    voz = np.nonzero(db > LIMIAR_DB - 2)[0]
    if not len(voz):
        sys.exit('o trecho novo está em silêncio')
    return voz[0] * j, (voz[-1] + 1) * j


def mais_perto(ps, t, lado):
    cands = [p for p in ps if min(abs(p[0] - t), abs(p[1] - t)) <= 0.8 or p[0] <= t <= p[1]]
    if not cands:
        sys.exit(f'nenhuma pausa até 0,8 s de {t} s para cortar ({lado}); pausas achadas: {", ".join(f"{a:.2f}-{b:.2f}" for a, b in ps) or "nenhuma"}')
    return min(cands, key=lambda p: min(abs(p[0] - t), abs(p[1] - t)))


def cruzar(a, b):
    n = int(CROSS * TAXA)
    if len(a) < n or len(b) < n:
        return np.concatenate([a, b])
    r = np.linspace(0, 1, n)
    meio = a[-n:] * (1 - r) + b[:n] * r
    return np.concatenate([a[:-n], meio, b[n:]])


def deslocar_timing(tm, corte, delta, fim_trocado):
    def mover(v):
        if v >= fim_trocado:
            return round(v + delta, 3)
        if v > corte:
            return round(corte, 3)
        return v
    for c in tm.get('cenas', []):
        for k in ('ini', 'fim'):
            if isinstance(c.get(k), (int, float)):
                c[k] = mover(c[k])
        for p in c.get('palavras', []):
            p['at'] = mover(p['at'])
        for k in list(c.get('b', {})):
            c['b'][k] = mover(c['b'][k])
    for k in ('voiceEnd', 'total'):
        if isinstance(tm.get(k), (int, float)):
            tm[k] = mover(tm[k])
    return tm


def main():
    if len(sys.argv) not in (5, 6):
        sys.exit('Uso: python3 _ferramentas/emendar.py <pasta-do-video> <trecho-novo> <de> <ate> [palavras-do-trecho.json]')
    ep, novo_arq, de, ate = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
    pub = os.path.join(ep, 'public')
    atual = next((os.path.join(pub, n) for n in ('narracao.wav', 'narracao.mp3') if os.path.isfile(os.path.join(pub, n))), None)
    if not atual:
        sys.exit(f'falta {pub}/narracao.wav (ou .mp3)')
    x = ler(atual)
    ps = pausas(x)
    pa = mais_perto(ps, de, 'começo')
    pb = mais_perto(ps, ate, 'fim')
    corte_a = min(pa[1], pa[0] + 0.05)        # logo depois do fim da fala anterior
    corte_b = max(pb[0], pb[1] - 0.05)        # logo antes da fala seguinte
    if corte_b <= corte_a:
        sys.exit(f'as pausas de {de} s e {ate} s são a mesma: escolha um fim depois do começo')
    novo = ler(novo_arq)
    lead, tail = pontas(novo)
    seg = novo[int(max(0, lead - 0.03) * TAXA): int((tail + 0.05) * TAXA)]
    trocado = x[int(corte_a * TAXA): int(corte_b * TAXA)]
    ref = trocado[np.abs(trocado) > 10 ** (LIMIAR_DB / 20)]
    if len(ref):
        seg = seg * (np.sqrt(np.mean(ref ** 2)) / (np.sqrt(np.mean(seg[np.abs(seg) > 10 ** (LIMIAR_DB / 20)] ** 2)) + 1e-9))
    a = x[: int(corte_a * TAXA)]
    b = x[int(corte_b * TAXA):]
    meio = np.concatenate([np.zeros(int(RESPIRO_ANTES * TAXA)), seg, np.zeros(int(RESPIRO_DEPOIS * TAXA))])
    saida = cruzar(cruzar(a, meio), b)
    novo_meio = len(saida) / TAXA - len(a) / TAXA - len(b) / TAXA
    delta = novo_meio - (corte_b - corte_a)
    inicio_trecho = corte_a + RESPIRO_ANTES - max(0, lead - 0.03)  # tempo final do instante 0 do arquivo do trecho
    shutil.copyfile(atual, os.path.join(pub, 'narracao.antes-da-emenda' + os.path.splitext(atual)[1]))
    if atual.endswith('.mp3'):
        os.remove(atual)  # a narração passa a ser o wav emendado; o mp3 antigo ficou guardado
    gravar_wav(os.path.join(pub, 'narracao.wav'), saida)

    wj = os.path.join(ep, 'src', 'words.json')
    if os.path.isfile(wj):
        words = json.load(open(wj, encoding='utf-8'))
        # o Whisper costuma esticar o início da palavra para dentro da pausa: decide pelo fim de cada palavra
        def depois(w):
            return w[2] > corte_b + 0.05 and w[1] >= corte_a

        def antes(w):
            return w[1] < corte_a - 0.02 and w[2] <= corte_a + 0.15

        mantidas = [w for w in words if antes(w) or depois(w)]
        # depois do corte: anda a diferença, com o início preso no ponto do corte (não volta para dentro do trecho novo)
        novas = [[w[0], round(max(w[1], corte_b) + delta, 3), round(w[2] + delta, 3)] if depois(w) else w for w in mantidas]
        if len(sys.argv) == 6:
            extra = json.load(open(sys.argv[5], encoding='utf-8'))
            extra = [[w[0], w[1], w[2]] if not isinstance(w, dict) else [w['texto'], w['inicio'], w['fim']] for w in extra]
            novas += [[w[0], round(w[1] + inicio_trecho, 3), round(w[2] + inicio_trecho, 3)] for w in extra]
        novas.sort(key=lambda w: w[1])
        json.dump(novas, open(wj, 'w'), ensure_ascii=False)
        print(f'words.json: {len(words) - len(mantidas)} palavra(s) do trecho trocado saíram, {len(novas) - len(mantidas)} entraram, as depois do corte andaram {delta:+.3f} s')
    tj = os.path.join(ep, 'src', 'timing.json')
    if os.path.isfile(tj):
        tm = deslocar_timing(json.load(open(tj, encoding='utf-8')), corte_a, delta, corte_b)
        json.dump(tm, open(tj, 'w'), ensure_ascii=False, indent=1)
        print('timing.json deslocado (rode o timing.py para refazer as batidas pelo words.json novo)')
    print(f'corte de {corte_a:.3f} a {corte_b:.3f} s ({corte_b - corte_a:.3f} s) trocado por {novo_meio:.3f} s; diferença {delta:+.3f} s')
    print(f'narração: {len(x) / TAXA:.3f} s -> {len(saida) / TAXA:.3f} s em {os.path.join(pub, "narracao.wav")}; depois: duck.py')


if __name__ == '__main__':
    main()
