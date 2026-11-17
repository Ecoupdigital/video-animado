# Boneco pixel art 16 bits (128 x 160), desenhado pixel a pixel em código a partir de um aparencia.json.
# Sem gerador de imagem: só numpy e Pillow.
#
# Uso: python3 gerador/personagem.py <aparencia.json | respostas.json> [pasta]
#      grava <pasta>/personagem-claro.png e personagem-escuro.png (6x, sem suavizar).
#
# aparencia.json (códigos aceitos em ../componentes/opcoes.json):
#   pele       p1 (mais clara) a p8 (mais escura)
#   cabelo     curto, raspado, careca, coque, crespo, comprido, cacheado
#   corCabelo  código de cores_cabelo (castanho, escuro, preto, loiro, ruivo, grisalho, branco) ou hex #RRGGBB
#   barba      nenhuma, cheia, curta
#   oculos     null (sem óculos), código de cores_oculos ou hex
#   roupa      código de roupas (grafite, preto, branco, cinza, azul, verde, vinho, coral, mostarda, roxo) ou hex
#   estampa    terminal (">_"), simbolo (um dos simbolos_marca), inicial (letra), nenhuma
#   simbolo    com estampa "simbolo": um dos simbolos_marca
#   inicial    com estampa "inicial": uma letra ou número
#   corEstampa hex (padrão: cor_estampa_padrao); estampa que some na roupa ganha contorno
#   cilios     true ou false
# Um respostas.json também serve: usa a aparência da protagonista e a marca (cor e símbolo) para a estampa.
#
# desenhar(ap, boca, olho, gestos) devolve (img RGB, figura): é o que o sprites.py usa para os 72 sprites.
import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
OPCOES = json.load(open(os.path.join(AQUI, '..', 'componentes', 'opcoes.json'), encoding='utf-8'))
W, H = OPCOES['tamanho']
S = 8
PADRAO = {
    'pele': 'p3', 'cabelo': 'curto', 'corCabelo': 'castanho', 'barba': 'nenhuma', 'oculos': None,
    'roupa': 'grafite', 'estampa': 'nenhuma', 'simbolo': None, 'inicial': None, 'corEstampa': None, 'cilios': False,
}
CAMPOS = list(PADRAO)


class ErroAparencia(Exception):
    pass


def hx(c):
    return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))


def ehhex(v):
    return isinstance(v, str) and len(v) == 7 and v[0] == '#' and all(ch in '0123456789abcdefABCDEF' for ch in v[1:])


def lum(c):
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255


def rampa(h):
    """Rampa [luz, base, sombra, sombra funda, contorno] de uma cor hex qualquer (mesmas razões das rampas do kit)."""
    c = hx(h)
    cl = lambda t: '#%02X%02X%02X' % tuple(max(0, min(255, round(v))) for v in t)
    if lum(c) > 0.55:
        return [cl([v + (255 - v) * 0.6 for v in c]), h.upper(), cl([v * 0.84 for v in c]), cl([v * 0.70 for v in c]), cl([v * 0.32 for v in c])]
    return [cl([v + (255 - v) * 0.3 for v in c]), h.upper(), cl([v * 0.66 for v in c]), cl([v * 0.43 for v in c]), cl([v * 0.21 for v in c])]


def aceitos(lista):
    return ', '.join(lista)


def resolver(entrada):
    """Confere a aparência e devolve o dicionário completo. Código fora da lista levanta ErroAparencia."""
    if not isinstance(entrada, dict):
        raise ErroAparencia('aparência: objeto com os campos ' + aceitos(CAMPOS))
    marca = None
    if 'personagens' in entrada:
        ps = entrada.get('personagens') or []
        prot = next((p for p in ps if isinstance(p, dict) and p.get('papel') == 'protagonista'), ps[0] if ps else None)
        if not prot or not isinstance(prot.get('aparencia'), dict):
            raise ErroAparencia('respostas.json sem personagem com aparencia')
        marca = entrada.get('marca')
        entrada = prot['aparencia']
    for k in entrada:
        if k not in PADRAO:
            raise ErroAparencia(f'aparência: campo "{k}" desconhecido (aceitos: {aceitos(CAMPOS)})')
    ap = dict(PADRAO)
    ap.update({k: v for k, v in entrada.items()})
    O = OPCOES

    def codigo(campo, lista):
        if ap[campo] not in lista:
            raise ErroAparencia(f'{campo}: "{ap[campo]}" não existe (aceitos: {aceitos(lista)})')

    codigo('pele', list(O['peles']))
    codigo('cabelo', O['cabelos'])
    codigo('barba', O['barbas'])
    codigo('estampa', O['estampas'])
    if not (ap['corCabelo'] in O['cores_cabelo'] or ehhex(ap['corCabelo'])):
        raise ErroAparencia(f'corCabelo: "{ap["corCabelo"]}" não existe (aceitos: {aceitos(list(O["cores_cabelo"]))} ou hex #RRGGBB)')
    if not (ap['roupa'] in O['roupas'] or ehhex(ap['roupa'])):
        raise ErroAparencia(f'roupa: "{ap["roupa"]}" não existe (aceitos: {aceitos(list(O["roupas"]))} ou hex #RRGGBB)')
    if ap['oculos'] is not None and not (ap['oculos'] in O['cores_oculos'] or ehhex(ap['oculos'])):
        raise ErroAparencia(f'oculos: "{ap["oculos"]}" não existe (aceitos: null, {aceitos(list(O["cores_oculos"]))} ou hex #RRGGBB)')
    if ap['corEstampa'] is None and marca and ehhex(marca.get('cor')):
        ap['corEstampa'] = marca['cor']
    if ap['corEstampa'] is None:
        ap['corEstampa'] = O['cor_estampa_padrao']
    if not ehhex(ap['corEstampa']):
        raise ErroAparencia(f'corEstampa: "{ap["corEstampa"]}" (aceito: hex #RRGGBB)')
    if ap['estampa'] == 'simbolo':
        if ap['simbolo'] is None and marca:
            ap['simbolo'] = marca.get('simbolo')
        if ap['simbolo'] not in O['simbolos_marca']:
            raise ErroAparencia(f'simbolo: "{ap["simbolo"]}" não existe (aceitos: {aceitos(O["simbolos_marca"])})')
    if ap['estampa'] == 'inicial':
        if ap['inicial'] is None and marca and marca.get('nome'):
            ap['inicial'] = inicial_de(marca['nome'])
        if not isinstance(ap['inicial'], str) or inicial_de(ap['inicial']) not in O['letras_px']:
            raise ErroAparencia(f'inicial: "{ap["inicial"]}" (aceito: uma letra de A a Z ou número)')
        ap['inicial'] = inicial_de(ap['inicial'])
    if not isinstance(ap['cilios'], bool):
        raise ErroAparencia('cilios: true ou false')
    return ap


def inicial_de(nome):
    import unicodedata
    for ch in unicodedata.normalize('NFD', str(nome)).upper():
        if ch in OPCOES['letras_px']:
            return ch
    return ''


def ler(arq):
    try:
        dados = json.load(open(arq, encoding='utf-8'))
    except (OSError, ValueError) as e:
        raise ErroAparencia(f'{arq}: JSON inválido ou ausente ({e})')
    return resolver(dados)


def cores_de(ap):
    O = OPCOES
    pele = O['peles'][ap['pele']]
    cab = O['cores_cabelo'].get(ap['corCabelo']) or rampa(ap['corCabelo'])
    rou = O['roupas'].get(ap['roupa']) or rampa(ap['roupa'])
    c = dict(
        sk_hi=pele['luz'], sk=pele['base'], sk_s1=pele['sombra'], sk_s2=pele['sombra2'], sk_ol=pele['contorno'],
        hr_hi=cab[0], hr=cab[1], hr_s=cab[2], hr_d=cab[3], hr_ol=cab[4],
        sh_hi=rou[0], sh=rou[1], sh_s=rou[2], sh_d=rou[3], sh_ol=rou[4],
        white='#FFFFFF', iris='#7A4A2A', pup='#1C100A', mouth=pele['boca'], teeth='#FFF7EE', lip=pele['labio'],
        vi=ap['corEstampa'],
    )
    if ap['oculos'] is not None:
        c['oc'] = O['cores_oculos'].get(ap['oculos']) or ap['oculos']
    C = {k: hx(v) for k, v in c.items()}
    # linha debaixo do lábio: na barba cheia é a sombra do cabelo (como no exemplo); sem barba, sombra da pele
    C['sob'] = C['hr_s'] if ap['barba'] == 'cheia' else C['sk_s1']
    return C


# ---------------------------------------------------------------- formas (iguais às do desenho original)

def _samp(im):
    return np.array(im)[S // 2::S, S // 2::S] > 127


def sm(pts, n=14):
    out = []
    L = len(pts)
    for i in range(L):
        p0, p1, p2, p3 = pts[(i - 1) % L], pts[i], pts[(i + 1) % L], pts[(i + 2) % L]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    return out


def poly(pts, smooth=True):
    if smooth:
        pts = sm(pts)
    im = Image.new('L', (W * S, H * S), 0)
    ImageDraw.Draw(im).polygon([((x + .5) * S, (y + .5) * S) for x, y in pts], fill=255)
    return _samp(im)


def blob(cx, cy, rx, ry):
    im = Image.new('L', (W * S, H * S), 0)
    ImageDraw.Draw(im).ellipse([(cx + .5 - rx) * S, (cy + .5 - ry) * S, (cx + .5 + rx) * S, (cy + .5 + ry) * S], fill=255)
    return _samp(im)


def cap(p0, p1, r0, r1=None):
    r1 = r0 if r1 is None else r1
    pts = []
    a = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    for k in range(13):
        t = a + math.pi / 2 + math.pi * k / 12
        pts.append((p0[0] + r0 * math.cos(t), p0[1] + r0 * math.sin(t)))
    for k in range(13):
        t = a - math.pi / 2 + math.pi * k / 12
        pts.append((p1[0] + r1 * math.cos(t), p1[1] + r1 * math.sin(t)))
    return poly(pts, False)


def line(pts, w=1.0, smooth=True):
    if smooth and len(pts) > 2:
        q = [pts[0]] + pts + [pts[-1]]
        out = []
        for i in range(1, len(q) - 2):
            p0, p1, p2, p3 = q[i - 1], q[i], q[i + 1], q[i + 2]
            for k in range(10):
                t = k / 10
                t2, t3 = t * t, t * t * t
                out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
        pts = out + [pts[-1]]
    im = Image.new('L', (W * S, H * S), 0)
    ImageDraw.Draw(im).line([((x + .5) * S, (y + .5) * S) for x, y in pts], fill=255, width=max(1, int(w * S)), joint='curve')
    return _samp(im)


def sh(m, dx, dy):
    r = np.zeros_like(m)
    ys, xs = np.nonzero(m)
    y2, x2 = ys + dy, xs + dx
    ok = (y2 >= 0) & (y2 < H) & (x2 >= 0) & (x2 < W)
    r[y2[ok], x2[ok]] = True
    return r


def dil(m):
    return m | sh(m, 1, 0) | sh(m, -1, 0) | sh(m, 0, 1) | sh(m, 0, -1)


def dil8(m):
    r = dil(m)
    return r | sh(m, 1, 1) | sh(m, -1, 1) | sh(m, 1, -1) | sh(m, -1, -1)


YY, XX = np.mgrid[0:H, 0:W]
BG, SHIRT, HAIRB, NECK, EAR, FACE, HAIR, HAND = -1, 0, 1, 2, 3, 4, 5, 6

# bocas pelo som (formas de Rhubarb, com G, H e X): operações (hl x0 x1 y cor) e (px x y cor)
BOCAS = {
    'X': [('hl', 63, 75, 73, 'mouth'), ('px', 62, 72, 'mouth'), ('px', 76, 72, 'mouth'), ('hl', 65, 73, 75, 'lip'), ('hl', 66, 72, 76, 'sob')],
    'A': [('hl', 63, 75, 73, 'mouth'), ('hl', 64, 74, 74, 'lip'), ('hl', 66, 72, 75, 'sob')],
    'B': [('hl', 62, 76, 72, 'mouth'), ('hl', 63, 75, 73, 'teeth'), ('hl', 63, 75, 74, 'mouth'), ('px', 61, 71, 'mouth'), ('px', 77, 71, 'mouth'), ('hl', 65, 73, 76, 'lip'), ('hl', 66, 72, 77, 'sob')],
    'C': [('hl', 62, 76, 72, 'mouth'), ('hl', 62, 76, 73, 'teeth'), ('hl', 63, 75, 74, 'teeth'), ('hl', 63, 75, 75, 'mouth'), ('px', 61, 71, 'mouth'), ('px', 77, 71, 'mouth'), ('px', 61, 72, 'mouth'), ('px', 77, 72, 'mouth'), ('px', 62, 74, 'mouth'), ('px', 76, 74, 'mouth'), ('hl', 65, 73, 77, 'lip'), ('hl', 66, 72, 78, 'sob')],
    'D': [('hl', 62, 76, 71, 'mouth'), ('hl', 62, 76, 72, 'teeth'), ('hl', 62, 76, 73, 'mouth'), ('hl', 62, 76, 74, 'mouth'), ('hl', 62, 76, 75, 'mouth'), ('hl', 65, 73, 75, 'lip'), ('hl', 63, 75, 76, 'mouth'), ('px', 61, 71, 'mouth'), ('px', 77, 71, 'mouth'), ('px', 61, 72, 'mouth'), ('px', 77, 72, 'mouth'), ('px', 61, 73, 'mouth'), ('px', 77, 73, 'mouth'), ('px', 61, 74, 'mouth'), ('px', 77, 74, 'mouth'), ('hl', 65, 73, 78, 'lip'), ('hl', 66, 72, 79, 'sob')],
    'E': [('hl', 64, 74, 71, 'mouth'), ('hl', 64, 74, 72, 'teeth'), ('hl', 64, 74, 73, 'mouth'), ('hl', 64, 74, 74, 'mouth'), ('hl', 65, 73, 75, 'mouth'), ('px', 63, 72, 'mouth'), ('px', 75, 72, 'mouth'), ('px', 63, 73, 'mouth'), ('px', 75, 73, 'mouth'), ('hl', 66, 72, 77, 'lip')],
    'F': [('hl', 67, 71, 72, 'mouth'), ('hl', 66, 72, 73, 'mouth'), ('hl', 67, 71, 74, 'mouth'), ('hl', 66, 72, 75, 'lip'), ('px', 66, 72, 'lip'), ('px', 72, 72, 'lip')],
    'G': [('hl', 62, 76, 72, 'mouth'), ('hl', 63, 75, 73, 'teeth'), ('hl', 64, 74, 74, 'lip'), ('hl', 66, 72, 75, 'sob')],
    'H': [('hl', 62, 76, 72, 'mouth'), ('hl', 62, 76, 73, 'teeth'), ('hl', 63, 75, 74, 'mouth'), ('hl', 64, 74, 75, 'lip'), ('px', 61, 72, 'mouth'), ('px', 77, 72, 'mouth'), ('hl', 65, 73, 77, 'lip'), ('hl', 66, 72, 78, 'sob')],
}
# gestos de mão: (centro, ângulo, lado, cotovelo) de cada mão
GESTOS = {
    'nada': [],
    'uma': [((24, 138), 124, 1, (30, 182))],
    'duas': [((24, 138), 124, 1, (30, 182)), ((104, 135), 50, -1, (98, 182))],
    'ombros': [((21, 140), 135, 1, (32, 184)), ((107, 137), 45, -1, (96, 184))],
}


def desenhar(ap, boca='C', olho='aberto', gestos='duas'):
    """Desenha o boneco e devolve (img RGB HxWx3, figura HxW bool)."""
    if boca not in BOCAS or olho not in ('aberto', 'fechado') or gestos not in GESTOS:
        raise ErroAparencia(f'sprite {boca}_{olho}_{gestos} não existe')
    C = cores_de(ap)
    img = np.zeros((H, W, 3), np.uint8)
    mat = np.full((H, W), BG, int)

    def put(m, c, mid=None):
        img[m] = C[c]
        if mid is not None:
            mat[m] = mid

    def px(x, y, c):
        img[y, x] = C[c]

    def hl(x0, x1, y, c):
        img[y, x0:x1 + 1] = C[c]

    estilo = ap['cabelo']

    # ================= CAMISETA =================
    torso = poly([(54, 97), (40, 100), (24, 105), (13, 114), (8, 130), (5, 150), (4, 164), (124, 164), (123, 150), (120, 130), (115, 114), (104, 105), (88, 100), (84, 97), (77, 102), (69, 104), (61, 102)])
    put(torso, 'sh', SHIRT)
    put(torso & poly([(22, 108), (38, 101), (52, 99), (53, 102), (40, 105), (27, 111), (17, 121), (13, 134), (10, 133), (13, 118)]), 'sh_hi')
    put(torso & poly([(98, 104), (116, 114), (122, 134), (125, 164), (104, 164), (108, 140), (106, 120)]), 'sh_s')
    put(torso & poly([(30, 164), (34, 138), (44, 126), (48, 128), (42, 142), (44, 164)]), 'sh_s')
    put(torso & poly([(58, 112), (70, 116), (84, 112), (84, 114), (70, 119), (58, 115)]), 'sh_s')
    for pts in [[(20, 124), (26, 136), (28, 150)], [(110, 122), (104, 134), (102, 148)], [(62, 124), (66, 136), (64, 150)], [(88, 126), (84, 138), (86, 152)], [(46, 108), (52, 112), (56, 120)], [(92, 108), (88, 114), (86, 120)]]:
        put(torso & line(pts), 'sh_d')
    for pts in [[(22, 123), (28, 135), (30, 148)], [(64, 123), (68, 135), (66, 148)]]:
        put(torso & line(pts), 'sh_hi')

    # ================= PESCOÇO =================
    neck = poly([(56, 78), (83, 78), (84, 97), (77, 102), (69, 104), (61, 102), (54, 97)], False)
    put(neck, 'sk_s1', NECK)
    put(neck & (YY < 94), 'sk_s2')
    put(neck & poly([(56, 92), (62, 95), (62, 101), (56, 98)], False), 'sk')
    for x, y in [(79, 97), (81, 95), (80, 99)]:
        px(x, y, 'sk_ol')
    gola = torso & (dil(dil(dil(neck)))) & ~neck
    put(gola, 'sh_hi')
    put(torso & dil(gola) & ~gola & ~neck, 'sh_d')

    # ================= CABELO DE TRÁS (comprido e cacheado: atrás do pescoço, na frente da roupa) =================
    if estilo in ('comprido', 'cacheado'):
        cabelo_tras(estilo, put, img, mat, neck, C)

    # ================= ORELHAS E ROSTO =================
    if estilo not in ('comprido', 'cacheado'):
        earL = poly([(42, 51), (44, 47), (48, 48), (49, 58), (47, 63), (44, 62), (42, 57)])
        earR = poly([(89, 50), (92, 48), (94, 52), (93, 59), (90, 62), (88, 58)])
        put(earL, 'sk', EAR)
        put(earR, 'sk_s1', EAR)
        put(earL & poly([(44, 51), (46, 50), (47, 57), (45, 60)], False), 'sk_s1')
        put(earR & (XX >= 92), 'sk_s2')
    face = poly([(47, 42), (49, 30), (58, 22), (72, 20), (84, 24), (90, 34), (91, 50), (89, 64), (83, 78), (70, 86), (57, 82), (49, 70), (46, 56)])
    put(face, 'sk', FACE)
    if estilo != 'curto':
        # cabeça inteira (o curto do exemplo cobre o alto com o cabelo e não precisa)
        cranio = poly([(47, 52), (46, 42), (45, 34), (48, 24), (55, 16), (64, 11), (75, 10), (85, 13), (91, 20), (94, 30), (93, 41), (91, 52), (70, 50)])
        put(cranio & ~face, 'sk', FACE)
        face = face | cranio
    put(face & poly([(84, 24), (92, 34), (92, 62), (86, 72), (82, 68), (85, 56), (85, 40), (82, 30)]), 'sk_s1')
    put(face & poly([(52, 38), (58, 34), (66, 33), (67, 36), (60, 38), (54, 41)]), 'sk_hi')

    # ================= CABELO =================
    if estilo == 'curto':
        hair = poly([(46, 46), (44, 36), (46, 25), (53, 15), (63, 9), (75, 7), (86, 10), (93, 17), (96, 27), (94, 38), (91, 47), (89, 41), (86, 34), (79, 30), (69, 29), (59, 31), (53, 35), (49, 41)])
        fadeL = poly([(45, 45), (50, 38), (51, 49), (48, 53), (45, 52)], False)
        fadeR = poly([(88, 38), (92, 44), (92, 52), (89, 52), (87, 46)], False)
        for f in (fadeL, fadeR):
            f = f & (face | f) & ~hair
            put(f, 'sk_s1', FACE)
            put(f & ((XX + YY) % 2 == 0), 'hr_s')
            put(f & (YY < 44) & ((XX + YY) % 2 == 1), 'hr')
        cast = face & ~hair & (sh(hair, 0, 1) | sh(hair, 0, 2) | sh(hair, 1, 2))
        put(cast, 'sk_s1')
        put(hair, 'hr', HAIR)
        put(hair & poly([(84, 9), (94, 17), (97, 28), (94, 40), (90, 47), (88, 38), (88, 26), (86, 16)]), 'hr_s')
        put(hair & (sh(face & ~hair, 0, -1) | sh(face & ~hair, 0, -2) | sh(face & ~hair, 0, -3)), 'hr_d')
        for pts in [[(50, 26), (56, 17), (66, 12), (76, 11)], [(54, 30), (60, 22), (70, 17), (82, 16)], [(48, 34), (51, 27)], [(62, 28), (70, 23), (80, 22), (86, 25)]]:
            put(hair & line(pts, 1.9), 'hr_hi')
        for pts in [[(52, 31), (57, 21), (67, 15), (79, 13)], [(58, 31), (65, 25), (75, 20), (86, 20)], [(68, 29), (76, 26), (86, 28)], [(47, 38), (49, 29), (55, 19)]]:
            put(hair & line(pts, 1.0), 'hr_s')
    else:
        cabelo_frente(estilo, put, img, mat, face, C)

    # ================= BARBA =================
    if ap['barba'] == 'cheia':
        beard = poly([(46, 53), (46, 66), (51, 78), (59, 87), (69, 91), (79, 87), (86, 78), (91, 66), (92, 53), (89, 54), (87, 62), (83, 67), (77, 67), (72, 64), (68, 65), (64, 64), (59, 67), (54, 67), (50, 62), (48, 55)])
        put(beard, 'hr', HAIR)
        put(beard & poly([(84, 66), (92, 54), (92, 68), (86, 80), (78, 88), (70, 91), (72, 84), (80, 78)]), 'hr_s')
        put(beard & poly([(56, 84), (69, 88), (80, 84), (79, 88), (69, 92), (58, 88)]), 'hr_d')
        put(beard & poly([(47, 60), (49, 60), (52, 72), (57, 80), (55, 81), (49, 73)]), 'hr_hi')
        put(beard & poly([(58, 67), (64, 64), (68, 65), (72, 64), (78, 67), (80, 70), (74, 69), (68, 69), (62, 69), (56, 70)]), 'hr_s')
        for x, y in [(55, 74), (60, 82), (65, 85), (74, 85), (79, 80), (83, 73), (52, 68), (86, 70), (62, 78), (76, 79), (69, 82)]:
            px(x, y, 'hr_d')
        for x, y in [(53, 76), (58, 84), (64, 81), (72, 87), (51, 66)]:
            px(x, y, 'hr_hi')
    elif ap['barba'] == 'curta':
        # barba por fazer: pontos do cabelo sobre a pele do queixo e do buço, sem mudar o contorno do rosto
        area = face & poly([(47, 58), (48, 68), (53, 78), (60, 84), (70, 87), (80, 83), (86, 75), (90, 62), (90, 56), (87, 63), (83, 69), (77, 69), (72, 66), (68, 67), (64, 66), (59, 69), (53, 68), (49, 62)])
        put(area & ((XX + 2 * YY) % 4 == 0), 'sk_s2')
        put(area & ((XX + 2 * YY) % 8 == 2), 'hr_s')
        put(area & sh(area, 0, -1) & ~sh(area, 0, -2) & ((XX % 2) == 0), 'hr_s')
        buco = face & poly([(59, 68), (64, 66), (68, 67), (72, 66), (78, 68), (78, 70), (60, 70)], False)
        put(buco & ((XX + YY) % 2 == 1), 'sk_s2')
    else:
        # sem barba: o queixo ganha uma sombra leve, como a luz do rosto
        put(face & poly([(60, 82), (70, 85), (80, 80), (78, 83), (70, 87), (62, 84)], False), 'sk_s1')
        hl(66, 72, 70, 'sk_s1')

    # boca
    for op in BOCAS[boca]:
        if op[0] == 'hl':
            hl(op[1], op[2], op[3], op[4])
        else:
            px(op[1], op[2], op[3])

    # ================= OLHOS, SOBRANCELHAS, NARIZ =================
    for y, x0, x1 in [(42, 56, 64), (43, 54, 66), (44, 53, 66), (45, 52, 55)]:
        hl(x0, x1, y, 'hr_d')
    for y, x0, x1 in [(42, 76, 84), (43, 74, 86), (44, 74, 87), (45, 85, 88)]:
        hl(x0, x1, y, 'hr_d')
    hl(56, 64, 42, 'hr_s')
    hl(76, 84, 42, 'hr_s')
    hl(54, 66, 46, 'sk_s1')
    hl(55, 65, 47, 'sk_s1')
    hl(74, 87, 46, 'sk_s2')
    hl(75, 86, 47, 'sk_s2')
    hl(67, 68, 47, 'sk_s1')
    hl(72, 73, 47, 'sk_s1')

    def um_olho(x0, larg, ix):
        hl(x0, x0 + larg, 48, 'hr_ol')
        px(x0 - 1, 49, 'hr_ol')
        px(x0 + larg + 1, 49, 'hr_ol')
        for y in (49, 50, 51):
            hl(x0, x0 + larg, y, 'white')
        px(x0, 51, 'sk_s1')
        px(x0 + larg, 51, 'sk_s1')
        for y in (49, 50, 51):
            hl(ix, ix + 3, y, 'iris')
        hl(ix + 1, ix + 2, 50, 'pup')
        hl(ix + 1, ix + 2, 49, 'pup')
        px(ix + 1, 49, 'white')
        hl(x0 + 1, x0 + larg - 1, 52, 'sk_s1')

    um_olho(55, 8, 58)
    um_olho(75, 7, 77)
    if olho == 'fechado':
        for x0, l in ((55, 8), (75, 7)):
            for y in (48, 49, 50, 51, 52):
                hl(x0, x0 + l, y, 'sk')
        hl(55, 63, 50, 'hr_ol')
        hl(75, 82, 50, 'hr_ol')
        hl(56, 62, 49, 'sk_s1')
        hl(76, 81, 49, 'sk_s2')
        px(54, 49, 'sk_s1')
        px(64, 49, 'sk_s1')
        px(74, 49, 'sk_s2')
        px(83, 49, 'sk_s2')
    if ap['cilios']:
        if olho == 'aberto':
            for x, y in [(53, 48), (54, 47), (84, 48), (85, 47)]:
                px(x, y, 'hr_ol')
        else:
            for x, y in [(54, 51), (83, 51)]:
                px(x, y, 'hr_ol')
    put(poly([(71, 47), (73, 47), (75, 57), (77, 61), (74, 64), (70, 63), (72, 58)], False) & face, 'sk_s1')
    for y in range(52, 59):
        px(70, y, 'sk_hi')
    px(69, 59, 'sk_hi')
    px(70, 59, 'sk_hi')
    px(69, 60, 'sk_hi')
    px(67, 62, 'sk_s2')
    px(68, 63, 'sk_s2')
    hl(69, 73, 63, 'sk_s1')
    px(74, 63, 'sk_s2')
    px(75, 62, 'sk_s2')
    px(66, 61, 'sk_s1')
    px(76, 61, 'sk_s2')

    # ================= CONTORNOS =================
    OL = {SHIRT: 'sh_ol', HAIRB: 'hr_ol', NECK: 'sk_ol', EAR: 'sk_ol', FACE: 'sk_ol', HAIR: 'hr_ol'}
    base_mat = mat.copy()
    for m_id, col in OL.items():
        A = base_mat == m_id
        viz = np.zeros_like(A)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nbm = np.roll(np.roll(base_mat, dy, 0), dx, 1)
            viz |= A & (nbm != m_id) & (nbm < m_id)
        viz[:, 0] = viz[:, -1] = False
        viz[-1, :] = False
        img[viz] = C[col]

    # ================= ÓCULOS (depois do contorno: a armação fica inteira por cima do rosto) =================
    if ap['oculos'] is not None:
        oculos(img, C)

    # ================= MÃOS =================
    def mao(c, ang, lado, cot):
        a = math.radians(ang)
        d = (math.cos(a), -math.sin(a))
        p = (math.sin(a) * lado, math.cos(a) * lado)
        P = lambda u, v: (c[0] + d[0] * u + p[0] * v, c[1] + d[1] * u + p[1] * v)
        braco = cap(cot, P(-5, 0), 9, 7)
        palma = poly([P(-9, -8), P(-9, 7.5), P(-4, 10), P(4, 10.2), P(7, 8.5), P(7.5, 0), P(7, -9.5), P(2, -10.6), P(-5, -10)], False)
        dedos = []
        for off, sp, ln, r in [(-7.8, 24, 11, 1.9), (-2.7, 9, 15, 2.1), (2.6, -3, 16, 2.2), (7.6, -15, 14, 2.1)]:
            b = P(6, off)
            aa = math.radians(ang + lado * sp)
            dedos.append(cap(b, (b[0] + math.cos(aa) * ln, b[1] - math.sin(aa) * ln), r + .2, r))
        b = P(-3, 8.5)
        aa = math.radians(ang - lado * 62)
        polegar = cap(b, (b[0] + math.cos(aa) * 11, b[1] - math.sin(aa) * 11), 3.2, 2.5)
        base = braco | palma
        put(dil(base), 'sk_ol', HAND)
        put(base, 'sk')
        put(braco & ~palma & ~sh(braco, -2, 0), 'sk_s1')
        put(braco & ~palma & ~sh(braco, -1, 0), 'sk_s2')
        put(palma & ~sh(palma, -1, -1) & ~sh(palma, -2, -1), 'sk_s1')
        for q in dedos + [polegar]:
            put(dil(q) & ~palma, 'sk_ol', HAND)
            put(q, 'sk')
            put(q & ~sh(q, -1, 0) & ~palma, 'sk_s1')
            put(q & ~sh(q, 1, 1) & ~sh(q, 1, 0) & ~sh(q, 0, 1) & ~palma, 'sk_hi')
        put(line([P(-6, 6), P(-1, 2), P(3, -5)]) & palma, 'sk_s1')
        put(line([P(4, 8), P(5, 0), P(4.5, -8)]) & palma, 'sk_s1')
        put(line([P(-9, -6), P(-9.5, 5)]) & base, 'sk_s1')

    for g in GESTOS[gestos]:
        mao(*g)

    # ================= ESTAMPA NO PEITO =================
    estampa(ap, img, mat, C)

    return img, mat != BG


def estampa(ap, img, mat, C):
    tipo = ap['estampa']
    if tipo == 'nenhuma':
        return
    if tipo == 'terminal':
        mapa = OPCOES['simbolos_px']['terminal']
    elif tipo == 'simbolo':
        mapa = OPCOES['simbolos_px'][ap['simbolo']]
    else:
        mapa = OPCOES['letras_px'][ap['inicial']]
    x0, y0 = OPCOES['origem_estampa'][tipo]
    m = np.zeros((H, W), bool)
    for dy, linha in enumerate(mapa):
        for dx, ch in enumerate(linha):
            if ch == 'X':
                m[y0 + dy, x0 + dx] = True
    m &= mat == SHIRT
    # estampa que some na roupa (cor parecida) ganha contorno: escuro em roupa clara, claro em roupa escura
    ls, le = lum(C['sh']), lum(C['vi'])
    if abs(ls - le) < 0.22:
        borda = dil8(m) & ~m & (mat == SHIRT)
        img[borda] = C['sh_ol'] if ls > 0.45 else (255, 255, 255)
    img[m] = C['vi']


def oculos(img, C):
    # armação retangular nos dois olhos, ponte no nariz e haste até a orelha
    oc = C['oc']
    lente = tuple(min(255, int(v * 0.15 + 255 * 0.85)) for v in C['sk'])
    for x0, x1 in ((52, 66), (73, 87)):
        img[46, x0:x1 + 1] = oc
        img[54, x0 + 1:x1] = oc
        img[47:54, x0] = oc
        img[47:54, x1] = oc
        img[47, x0 + 2] = lente
        img[48, x0 + 1] = lente
    img[48, 67:73] = oc
    img[47, 46:52] = oc
    img[47, 88:92] = oc


def _ondas(pts, r):
    """Silhueta suave com a borda em ondas de cacho: o polígono mais um círculo a cada passo do contorno."""
    m = poly(pts)
    contorno = sm(pts, 30)
    passo = max(1, int(len(contorno) / (sum(math.dist(contorno[i], contorno[i - 1]) for i in range(len(contorno))) / (r * 1.5))))
    for x, y in contorno[::passo]:
        m |= blob(x, y, r, r)
    return m


def _cachos(put, area, claro, escuro, semente=1):
    """Cachos em arcos de 3 a 4 pixels, espalhados por um sorteio fixo (o mesmo arquivo dá sempre o mesmo desenho)."""
    rng = np.random.default_rng(semente)
    luz = np.zeros((H, W), bool)
    som = np.zeros((H, W), bool)
    ys, xs = np.nonzero(area)
    if len(xs) == 0:
        return
    for _ in range(len(xs) // 9):
        i = rng.integers(len(xs))
        x, y = xs[i], ys[i]
        forma = rng.integers(3)
        if forma == 0:
            arco_l = [(-1, 0), (-1, -1), (0, -2), (1, -2)]
            arco_s = [(1, -1), (1, 0), (0, 1)]
        elif forma == 1:
            arco_l = [(0, -1), (1, -1), (2, 0)]
            arco_s = [(-1, 0), (-1, 1), (0, 2), (1, 2)]
        else:
            arco_l = [(-1, -1), (0, -1)]
            arco_s = [(1, 0), (1, 1), (0, 1)]
        for dx, dy in arco_l:
            if 0 <= y + dy < H and 0 <= x + dx < W:
                luz[y + dy, x + dx] = True
        for dx, dy in arco_s:
            if 0 <= y + dy < H and 0 <= x + dx < W:
                som[y + dy, x + dx] = True
    put(area & som & ~luz, escuro)
    put(area & luz, claro)


def cabelo_tras(estilo, put, img, mat, neck, C):
    if estilo == 'comprido':
        tras = poly([(48, 22), (40, 36), (37, 56), (36, 80), (35, 100), (38, 110), (48, 112), (56, 106), (84, 106), (92, 112), (102, 110), (104, 98), (103, 76), (101, 52), (97, 32), (90, 20), (70, 12)])
        tras &= ~neck
        put(tras, 'hr_s', HAIRB)
        for xs in ([40, 39, 39, 40], [45, 44, 44, 46], [94, 96, 97, 97], [99, 100, 101, 100]):
            put(tras & line([(xs[0], 50), (xs[1], 70), (xs[2], 90), (xs[3], 108)], 1.0), 'hr')
        put(tras & (YY > 104) & ((XX + YY) % 2 == 0), 'hr_d')
    else:
        base = [(70, 4), (84, 6), (96, 14), (103, 28), (105, 46), (106, 66), (107, 86), (105, 102), (97, 109), (89, 104), (84, 96), (70, 92), (56, 96), (50, 104), (42, 109), (34, 102), (32, 86), (33, 66), (35, 46), (37, 28), (44, 14), (56, 6)]
        tras = _ondas(base, 5.0) & ~neck
        put(tras, 'hr_s', HAIRB)
        _cachos(put, tras & ~dil(~tras), 'hr', 'hr_d', semente=3)


def cabelo_frente(estilo, put, img, mat, face, C):
    if estilo == 'careca':
        put(face & poly([(56, 16), (64, 12), (72, 12), (70, 15), (62, 17), (57, 20)]), 'sk_hi')
        put(face & poly([(86, 16), (92, 24), (94, 34), (91, 38), (89, 28)]), 'sk_s1')
        return
    if estilo == 'raspado':
        hair = face & poly([(46, 46), (45, 34), (48, 24), (55, 16), (64, 11), (75, 10), (85, 13), (91, 20), (94, 30), (93, 41), (91, 47), (89, 41), (86, 34), (79, 30), (69, 29), (59, 31), (53, 35), (49, 41)])
        cast = face & ~hair & sh(hair, 0, 1)
        put(cast, 'sk_s1')
        put(hair, 'sk_s1', HAIR)
        put(hair & ((XX + YY) % 2 == 0), 'hr_s')
        put(hair & ((XX + YY) % 4 == 1), 'hr')
        put(hair & (XX > 86) & ((XX + YY) % 2 == 1), 'hr_d')
        return
    if estilo == 'coque':
        hair = poly([(46, 46), (44, 36), (46, 25), (53, 16), (63, 11), (75, 10), (86, 12), (93, 18), (96, 28), (94, 39), (91, 47), (89, 40), (86, 31), (79, 25), (69, 23), (59, 25), (52, 31), (48, 40)])
        coque = blob(71, 8, 9, 7)
        put(coque, 'hr', HAIR)
        put(coque & (XX > 74), 'hr_s')
        put(coque & line([(65, 5), (71, 3), (76, 5)], 1.4), 'hr_hi')
        cast = face & ~hair & (sh(hair, 0, 1) | sh(hair, 0, 2))
        put(cast, 'sk_s1')
        put(hair, 'hr', HAIR)
        put(hair & (sh(face & ~hair, 0, -1) | sh(face & ~hair, 0, -2)), 'hr_d')
        put(hair & poly([(84, 11), (94, 18), (97, 28), (94, 40), (90, 47), (88, 36), (87, 24)]), 'hr_s')
        for pts in [[(50, 30), (56, 20), (66, 14), (76, 13)], [(56, 27), (64, 19), (74, 16), (84, 17)], [(47, 38), (50, 30)]]:
            put(hair & line(pts, 1.4), 'hr_hi')
        put(coque & sh(hair, 0, -1) & ~hair, 'hr_d')
        return
    if estilo == 'crespo':
        hair = blob(70, 25, 31, 24) & ~(face & poly([(48, 52), (49, 38), (55, 31), (63, 29), (72, 28), (82, 30), (88, 36), (91, 52), (100, 60), (40, 60)], False))
        hair &= YY < 50
        cast = face & ~hair & (sh(hair, 0, 1) | sh(hair, 0, 2))
        put(cast, 'sk_s1')
        put(hair, 'hr', HAIR)
        put(hair & (XX > 88), 'hr_s')
        _cachos(put, hair & ~dil(~hair), 'hr_hi', 'hr_s', semente=5)
        put(hair & (sh(face & ~hair, 0, -1)), 'hr_d')
        return
    if estilo == 'comprido':
        hair = poly([(44, 60), (42, 44), (44, 30), (51, 17), (62, 10), (75, 8), (87, 11), (94, 19), (97, 30), (97, 46), (95, 62), (92, 52), (90, 38), (84, 28), (74, 25), (64, 30), (56, 36), (50, 46), (47, 60)])
        cast = face & ~hair & (sh(hair, 0, 1) | sh(hair, 0, 2) | sh(hair, 1, 2))
        put(cast, 'sk_s1')
        put(hair, 'hr', HAIR)
        put(hair & poly([(86, 10), (95, 18), (98, 30), (98, 48), (95, 62), (92, 48), (90, 32), (88, 20)]), 'hr_s')
        put(hair & (sh(face & ~hair, 0, -1) | sh(face & ~hair, 0, -2)), 'hr_d')
        for pts in [[(48, 40), (52, 26), (62, 16), (76, 12)], [(46, 52), (47, 38), (52, 28)], [(60, 28), (68, 20), (80, 17), (90, 22)]]:
            put(hair & line(pts, 1.6), 'hr_hi')
        for pts in [[(56, 34), (64, 24), (76, 20)], [(70, 26), (80, 23), (90, 28)]]:
            put(hair & line(pts, 1.0), 'hr_s')
        return
    if estilo == 'cacheado':
        base = [(70, 2), (84, 4), (95, 12), (101, 24), (102, 38), (99, 52), (95, 56), (92, 46), (88, 38), (80, 33), (70, 31), (60, 33), (52, 38), (48, 46), (45, 56), (41, 52), (38, 38), (39, 24), (45, 12), (56, 4)]
        hair = _ondas(base, 4.0)
        cast = face & ~hair & (sh(hair, 0, 1) | sh(hair, 0, 2))
        put(cast, 'sk_s1')
        put(hair, 'hr', HAIR)
        put(hair & (XX > 90), 'hr_s')
        _cachos(put, hair & ~dil(~hair), 'hr_hi', 'hr_d', semente=7)
        put(hair & sh(face & ~hair, 0, -1), 'hr_d')
        return


# ---------------------------------------------------------------- linha de comando

def salvar_retrato(ap, saida, fundo, k=6):
    img, fig = desenhar(ap)
    out = np.zeros((H, W, 3), np.uint8)
    out[:] = hx(fundo)
    out[fig] = img[fig]
    Image.fromarray(out).resize((W * k, H * k), Image.NEAREST).save(saida)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('Uso: python3 gerador/personagem.py <aparencia.json | respostas.json> [pasta]')
    try:
        ap = ler(sys.argv[1])
    except ErroAparencia as e:
        print(e)
        sys.exit(1)
    pasta = sys.argv[2] if len(sys.argv) > 2 else '.'
    os.makedirs(pasta, exist_ok=True)
    salvar_retrato(ap, os.path.join(pasta, 'personagem-claro.png'), '#F4F3F9')
    salvar_retrato(ap, os.path.join(pasta, 'personagem-escuro.png'), '#1A1B3A')
    print(f'ok {pasta}/personagem-claro.png e personagem-escuro.png')
