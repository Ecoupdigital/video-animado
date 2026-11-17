# Transcreve a narração com o tempo de cada palavra.
# Uso: python3 _ferramentas/transcrever.py <audio> <saida palavras.json> [termos extras]
# O prompt da transcrição leva os nomes e termos do universo (respostas.json e pronuncias.md da raiz
# do universo), para os nomes saírem escritos certo. Mac: mlx-whisper (whisper-large-v3-turbo).
# Linux: faster-whisper large-v3 na CPU. Mesma saída nos dois: [{"texto", "inicio", "fim"}] em segundos.
import json, os, sys

if len(sys.argv) < 3:
    sys.exit('Uso: python3 transcrever.py <audio> <saida.json> [termos extras]')
audio, saida = sys.argv[1], sys.argv[2]


def raiz_do_universo(inicio):
    d = os.path.abspath(inicio)
    while True:
        if os.path.isfile(os.path.join(d, 'respostas.json')) or os.path.isfile(os.path.join(d, 'BRANDBOOK-ANIMACAO.md')):
            return d
        pai = os.path.dirname(d)
        if pai == d:
            return None
        d = pai


def termos_do_universo():
    raiz = raiz_do_universo(os.path.dirname(os.path.abspath(audio))) or raiz_do_universo(os.getcwd())
    termos = []
    if not raiz:
        return termos
    rp = os.path.join(raiz, 'respostas.json')
    if os.path.isfile(rp):
        r = json.load(open(rp, encoding='utf-8'))
        termos.append((r.get('universo') or {}).get('nome'))
        marca = r.get('marca') or {}
        termos += [marca.get('nome'), marca.get('palavra_fecho')]
        termos.append((r.get('fecho') or {}).get('palavra'))
        termos += [p.get('nome') for p in r.get('personagens', [])]
        termos += [a.get('nome') for a in r.get('acompanhantes', [])]
    pr = os.path.join(raiz, 'pronuncias.md')
    if os.path.isfile(pr):
        for linha in open(pr, encoding='utf-8'):
            cols = [c.strip() for c in linha.strip().strip('|').split('|')]
            if linha.startswith('|') and len(cols) >= 2 and cols[0] and cols[0] != 'Termo' and not set(cols[0]) <= set('-: '):
                termos.append(cols[0])
    vistos, unicos = set(), []
    for t in termos:
        if t and t.lower() not in vistos:
            vistos.add(t.lower())
            unicos.append(t)
    return unicos


termos = termos_do_universo() + (sys.argv[3:] if len(sys.argv) > 3 else [])
prompt = ', '.join(termos) + '.' if termos else None
print('prompt:', prompt)
try:
    import mlx_whisper
    r = mlx_whisper.transcribe(audio, path_or_hf_repo='mlx-community/whisper-large-v3-turbo', language='pt', word_timestamps=True, initial_prompt=prompt)
    words = [{'texto': w['word'].strip(), 'inicio': round(w['start'], 3), 'fim': round(w['end'], 3)} for s in r['segments'] for w in s['words']]
except ImportError:
    from faster_whisper import WhisperModel
    m = WhisperModel('large-v3', device='cpu', compute_type='int8')
    segs, _ = m.transcribe(audio, language='pt', word_timestamps=True, initial_prompt=prompt)
    words = [{'texto': w.word.strip(), 'inicio': round(w.start, 3), 'fim': round(w.end, 3)} for s in segs for w in s.words]
json.dump(words, open(saida, 'w'), ensure_ascii=False, indent=1)
print(' | '.join(f"{i}:{w['texto']}@{w['inicio']}" for i, w in enumerate(words)))
