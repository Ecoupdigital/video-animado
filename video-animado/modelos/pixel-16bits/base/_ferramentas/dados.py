# Dados do vídeo pixel a partir da narração de verdade: palavras com tempo, bocas e fim.
# Lê <video>/public/narracao.wav (ou .mp3) e <video>/roteiro-falas.json e grava
#   src/dados.ts      PALAVRAS (as palavras do roteiro com os tempos da transcrição), BOCAS ([início, fim, forma]),
#                     FIM (duração da voz) e CAMINHO ("rhubarb" ou "volume")
#   src/roteiro.json  a cópia do roteiro que o episódio lê
#   src/falas.json    começo e fim de cada seção
#   public/px/ e public/sons/   os sprites do boneco e os sons
# Transcrição pelo _ferramentas/transcrever.py (mlx-whisper no Mac, faster-whisper no Linux); as palavras que a
# transcrição ouviu são trocadas pelas do roteiro, mantendo os tempos (a legenda sai com a grafia do roteiro).
# Bocas: pelo Rhubarb Lip Sync quando achado em ~/.video-animado/ (instale com _ferramentas/instalar_rhubarb.sh),
# com as 9 formas (A a H e X); sem ele, ou com --sem-rhubarb ou VIDEO_ANIMADO_SEM_RHUBARB=1 (sem apagar a
# instalação), pela força da voz por frame, com as formas X, B, C e D.
# Arquivos temporários ficam em <video>/.dados-tmp/ e são apagados no fim.
# Uso (na raiz do universo): python3 _ferramentas/dados.py <pasta-do-video> [--sem-rhubarb]
import difflib
import json
import os
import shutil
import subprocess
import sys

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import roteiro as rt  # noqa: E402

FPS = 30
FERRAMENTAS = os.environ.get('VIDEO_ANIMADO_FERRAMENTAS') or os.path.join(os.path.expanduser('~'), '.video-animado')


def achar_rhubarb():
    for raiz, _, arqs in os.walk(FERRAMENTAS):
        if 'rhubarb' in arqs:
            arq = os.path.join(raiz, 'rhubarb')
            if os.access(arq, os.X_OK):
                return arq
    return None


def duracao(arq):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arq], capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def alinhar(ouvidas, rot):
    """Troca as palavras ouvidas pelas do roteiro mantendo os tempos. ouvidas: [(w, ini, fim)]; devolve [(w, ini, fim)] com len(rot)."""
    a = [rt.norm(w) for w, _, _ in ouvidas]
    b = [rt.norm(w) for w in rot]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    novo = []
    fim_audio = ouvidas[-1][2] if ouvidas else 0.0
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == 'equal' or (op == 'replace' and a1 - a0 == b1 - b0):
            novo += [(rot[b0 + k], ouvidas[a0 + k][1], ouvidas[a0 + k][2]) for k in range(a1 - a0)]
        elif op in ('replace', 'insert'):
            t0 = ouvidas[a0][1] if a0 < len(ouvidas) else fim_audio
            t1 = ouvidas[a1 - 1][2] if op == 'replace' else (ouvidas[a1][1] if a1 < len(ouvidas) else fim_audio)
            n = b1 - b0
            passo = (t1 - t0) / n if n else 0
            novo += [(rot[b0 + k], t0 + passo * k, t0 + passo * (k + 1)) for k in range(n)]
    return novo


def bocas_rhubarb(rhubarb, wav):
    r = subprocess.run([rhubarb, '-q', '-f', 'json', '-r', 'phonetic', '--extendedShapes', 'GHX', wav], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f'o rhubarb falhou: {(r.stderr or r.stdout).strip()[:300]}')
    cues = json.loads(r.stdout)['mouthCues']
    return [[c['start'], c['end'], c['value']] for c in cues]


def bocas_volume(wav):
    """Força da voz por frame (30 fps), escalada pela fala do próprio áudio, mapeada para X, B, C e D."""
    sr = 16000
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    hop = sr // FPS
    n = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(rms)
    falando = db > -40
    ref = np.percentile(db[falando], 95) if falando.any() else -16.0
    v = np.clip((db - (ref - 24)) / 24, 0, 1)  # 24 dB abaixo do forte da voz = boca fechada
    v[~falando] = 0
    formas = np.where(v < 0.18, 'X', np.where(v < 0.45, 'B', np.where(v < 0.75, 'C', 'D')))
    # cada forma fica pelo menos 2 frames (sem tremer)
    for i in range(1, n - 1):
        if formas[i] != formas[i - 1] and formas[i] != formas[i + 1]:
            formas[i] = formas[i - 1]
    cues = []
    for i, f in enumerate(formas):
        t0, t1 = i / FPS, (i + 1) / FPS
        if cues and cues[-1][2] == f:
            cues[-1][1] = t1
        else:
            cues.append([t0, t1, str(f)])
    return cues


def principal():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        sys.exit('Uso: python3 _ferramentas/dados.py <pasta-do-video> [--sem-rhubarb]')
    ep = args[0]
    sem = '--sem-rhubarb' in sys.argv or os.environ.get('VIDEO_ANIMADO_SEM_RHUBARB') == '1'
    try:
        r = rt.ler(ep)
        rt.preparar_public(ep)
    except rt.ErroRoteiro as e:
        print(e)
        sys.exit(1)
    voz = next((os.path.join(ep, 'public', n) for n in ('narracao.wav', 'narracao.mp3') if os.path.isfile(os.path.join(ep, 'public', n))), None)
    if not voz:
        print(f'falta {os.path.join(ep, "public", "narracao.wav")} (ou .mp3): grave a voz antes')
        sys.exit(1)
    tmp = os.path.join(ep, '.dados-tmp')
    os.makedirs(tmp, exist_ok=True)
    try:
        wav = os.path.join(tmp, 'voz16.wav')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', voz, '-ac', '1', '-ar', '16000', wav], check=True)
        pal_json = os.path.join(tmp, 'palavras.json')
        s = subprocess.run([sys.executable, os.path.join(AQUI, 'transcrever.py'), wav, pal_json], capture_output=True, text=True)
        if s.returncode != 0:
            print(f'a transcrição falhou: {(s.stderr or s.stdout).strip()[-400:]}')
            sys.exit(1)
        ouvidas = [(p['texto'], p['inicio'], p['fim']) for p in json.load(open(pal_json, encoding='utf-8')) if p['texto'].strip()]
        rot = rt.todas_palavras(r)
        palavras = alinhar(ouvidas, rot)
        rhubarb = None if sem else achar_rhubarb()
        if rhubarb:
            caminho = 'rhubarb'
            bocas = bocas_rhubarb(rhubarb, wav)
        else:
            caminho = 'volume'
            bocas = bocas_volume(wav)
        fim = duracao(voz)
        falas = rt.gravar(ep, r, palavras, bocas, fim, caminho)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    motivo = {'rhubarb': f'Rhubarb em {rhubarb}', 'volume': 'pela força da voz (' + ('Rhubarb desligado' if sem else f'Rhubarb não achado em {FERRAMENTAS}; instale com bash _ferramentas/instalar_rhubarb.sh') + ')'}[caminho]
    print(f'bocas: {caminho} ({motivo})')
    print(f'{len(palavras)} palavras do roteiro ({len(ouvidas)} ouvidas), {len(bocas)} bocas, {len(falas)} seções, voz de {fim:.2f} s')
    print(' '.join(f'{w}@{a:.2f}' for w, a, _ in palavras))


if __name__ == '__main__':
    principal()
