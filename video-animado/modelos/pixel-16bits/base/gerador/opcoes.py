# Folha de opções do boneco pixel: cabelos, cores de cabelo, tons de pele, barbas, óculos, roupas e estampas,
# cada um com o código que vai no aparencia.json (pergunta 6 da entrevista curta).
# Uso: python3 gerador/opcoes.py <saida.png> [aparencia.json | respostas.json]
#      com uma aparência, as variações partem dela (só o campo da linha muda); sem, de um boneco neutro.
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import personagem as pg  # noqa: E402

FUNDO = (244, 243, 249)
TINTA = (12, 13, 24)
SUAVE = (92, 93, 120)
DESTAQUE = (91, 76, 224)
LARGURA = 2060
NEUTRO = {'pele': 'p4', 'cabelo': 'curto', 'corCabelo': 'escuro', 'barba': 'nenhuma', 'oculos': None, 'roupa': 'grafite', 'estampa': 'nenhuma'}


# fonte com acento: a do sistema (Linux ou Mac); sem nenhuma, a do Pillow, com o texto sem acento
CANDIDATAS = ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf',
              '/System/Library/Fonts/Supplemental/Arial.ttf', '/Library/Fonts/Arial.ttf', '/System/Library/Fonts/Helvetica.ttc']
ARQ_FONTE = next((c for c in CANDIDATAS if os.path.isfile(c)), None)


def fonte(t):
    return ImageFont.truetype(ARQ_FONTE, t) if ARQ_FONTE else ImageFont.load_default(size=t)


def txt(s):
    if ARQ_FONTE:
        return s
    import unicodedata
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def recorte(ap, caixa, k, gestos='nada', boca='X'):
    img, fig = pg.desenhar(ap, boca, 'aberto', gestos)
    out = np.zeros((pg.H, pg.W, 3), np.uint8)
    out[:] = (255, 255, 255)
    out[fig] = img[fig]
    im = Image.fromarray(out).crop(caixa)
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


def secao(titulo, dica, celulas, colunas):
    """celulas: [(imagem, código)]. Devolve a faixa da seção."""
    cw = max(i.width for i, _ in celulas)
    ch = max(i.height for i, _ in celulas)
    gap = 18
    linhas = (len(celulas) + colunas - 1) // colunas
    topo = 86
    alt = topo + linhas * (ch + 50 + gap)
    faixa = Image.new('RGB', (LARGURA, alt), FUNDO)
    d = ImageDraw.Draw(faixa)
    d.text((40, 18), txt(titulo), fill=TINTA, font=fonte(40))
    d.text((40, 62), txt(dica), fill=SUAVE, font=fonte(20))
    for n, (im, cod) in enumerate(celulas):
        x = 40 + (n % colunas) * (cw + gap)
        y = topo + (n // colunas) * (ch + 50 + gap)
        d.rectangle([x - 2, y - 2, x + cw + 1, y + ch + 1], outline=(214, 212, 228))
        faixa.paste(im, (x + (cw - im.width) // 2, y))
        tf = fonte(26)
        w = d.textlength(cod, font=tf)
        while w > cw and tf.size > 12:
            tf = fonte(tf.size - 2)
            w = d.textlength(cod, font=tf)
        d.text((x + (cw - w) / 2, y + ch + 10), cod, fill=DESTAQUE, font=tf)
    return faixa


def folha(base, saida):
    O = pg.OPCOES
    cab = (28, 0, 112, 100)  # cabeça
    peito = (48, 96, 112, 130)  # estampa
    S = []

    def var(**k):
        a = dict(base)
        a.update(k)
        return pg.resolver(a)

    S.append(secao('Cabelo  ·  "cabelo"', 'tipo do cabelo', [(recorte(var(cabelo=c), (24, 0, 116, 118), 3), c) for c in O['cabelos']], 7))
    S.append(secao('Cor do cabelo  ·  "corCabelo"', 'código ou hex #RRGGBB (a cor vira luz, base, sombra e contorno)', [(recorte(var(corCabelo=c), cab, 2), c) for c in O['cores_cabelo']], 8))
    S.append(secao('Tom de pele  ·  "pele"', 'p1 (mais clara) a p8 (mais escura)', [(recorte(var(pele=c), cab, 2), c) for c in O['peles']], 8))
    S.append(secao('Barba  ·  "barba"', 'nenhuma, cheia ou curta (por fazer)', [(recorte(var(barba=c), (36, 30, 104, 100), 3), c) for c in O['barbas']], 7))
    S.append(secao('Óculos  ·  "oculos"', 'null (sem óculos), código da cor ou hex', [(recorte(var(oculos=None), (36, 30, 104, 70), 3), 'null')] + [(recorte(var(oculos=c), (36, 30, 104, 70), 3), c) for c in O['cores_oculos']], 7))
    S.append(secao('Roupa  ·  "roupa"', 'código ou hex #RRGGBB', [(recorte(var(roupa=c, estampa='nenhuma'), (0, 92, 128, 160), 1), c) for c in O['roupas']], 10))
    est = [(recorte(var(estampa='terminal'), peito, 3), 'terminal'), (recorte(var(estampa='inicial', inicial='A'), peito, 3), 'inicial (A)'), (recorte(var(estampa='nenhuma'), peito, 3), 'nenhuma')]
    est += [(recorte(var(estampa='simbolo', simbolo=s), peito, 3), f'simbolo: {s}') for s in O['simbolos_marca']]
    S.append(secao('Estampa no peito  ·  "estampa"', 'terminal (>_), simbolo da marca, inicial da marca ou nenhuma; na cor "corEstampa" (padrão: a cor da marca)', est, 7))
    cabec = Image.new('RGB', (LARGURA, 110), FUNDO)
    d = ImageDraw.Draw(cabec)
    d.text((40, 24), txt('Opções do boneco pixel'), fill=TINTA, font=fonte(52))
    d.text((40, 82), txt('Cada imagem muda só um campo; o código embaixo é o que vai no aparencia.json (componentes/opcoes.json).'), fill=SUAVE, font=fonte(22))
    partes = [cabec] + S
    alt = sum(p.height for p in partes) + 30
    out = Image.new('RGB', (LARGURA, alt), FUNDO)
    y = 0
    for p in partes:
        out.paste(p, (0, y))
        y += p.height
    out.save(saida)
    return out.size


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('Uso: python3 gerador/opcoes.py <saida.png> [aparencia.json | respostas.json]')
    try:
        base = dict(pg.ler(sys.argv[2])) if len(sys.argv) > 2 else pg.resolver(NEUTRO)
    except pg.ErroAparencia as e:
        print(e)
        sys.exit(1)
    for k in ('simbolo', 'inicial'):
        if base.get('estampa') != {'simbolo': 'simbolo', 'inicial': 'inicial'}[k]:
            base[k] = None
    pasta = os.path.dirname(os.path.abspath(sys.argv[1]))
    os.makedirs(pasta, exist_ok=True)
    w, h = folha(base, sys.argv[1])
    print(f'ok {sys.argv[1]} ({w} x {h})')
