# Gera os 72 sprites do boneco (9 bocas x 2 olhos x 4 gestos) a partir de um aparencia.json.
# Uso: python3 gerador/sprites.py <aparencia.json | respostas.json> <pasta>   (ex.: public/px)
# Nomes: <boca>_<olho>_<gesto>.png, 128 x 160, RGBA (fundo transparente), sem suavizar.
# O mesmo arquivo dá sempre os mesmos sprites. Aparência com código fora da lista sai 1 dizendo o campo e os aceitos.
import itertools
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import personagem as pg  # noqa: E402


def gerar(ap, pasta):
    os.makedirs(pasta, exist_ok=True)
    n = 0
    for b, o, m in itertools.product(pg.OPCOES['bocas'], pg.OPCOES['olhos'], pg.OPCOES['gestos']):
        img, fig = pg.desenhar(ap, b, o, m)
        rgba = np.zeros((pg.H, pg.W, 4), np.uint8)
        rgba[..., :3] = img
        rgba[..., 3] = fig * 255
        Image.fromarray(rgba).save(os.path.join(pasta, f'{b}_{o}_{m}.png'))
        n += 1
    return n


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit('Uso: python3 gerador/sprites.py <aparencia.json | respostas.json> <pasta>')
    try:
        ap = pg.ler(sys.argv[1])
    except pg.ErroAparencia as e:
        print(e)
        sys.exit(1)
    n = gerar(ap, sys.argv[2])
    print(f'ok {n} sprites em {sys.argv[2]}')
