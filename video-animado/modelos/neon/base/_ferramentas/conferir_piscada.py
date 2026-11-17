# Confere a piscada de um vídeo, para o neon nunca virar luz estroboscópica. Lê o vídeo pelo ffmpeg (sem arquivo
# temporário: os quadros vêm por um cano), em 270 x 480 (cada ponto é a média de 4 x 4 pontos do vídeo), e mede, por
# janela de 1 s:
#   quedas  quantas quedas de brilho houve. Uma queda conta quando, num mesmo quadro, pelo menos 1% da tela escurece
#           de repente (a luminância relativa cai 0,1 ou mais em até 2 quadros, ficando abaixo de 0,8) e volta a
#           clarear em até 8 quadros (0,27 s): é o pisca, não a peça que sai de cena. Quadros seguidos contam uma vez.
#           Mudança em área menor que 1% da tela (o algarismo do preço que conta, o segundo do relógio) não conta.
#   área    a maior parte da tela que piscou de uma vez (em %).
# Sai 1 se alguma janela de 1 s (deslizando de quadro em quadro) tiver mais de 3 quedas, ou se a área passar de 10%
# da tela; sai 0 dentro da regra. É a regra do modelo: no máximo 3 quedas de brilho por segundo, contando o acender
# do letreiro, só em partes pequenas da tela.
# Uso: python3 _ferramentas/conferir_piscada.py <vídeo.mp4>
import json, subprocess, sys
import numpy as np

LARG, ALT = 270, 480
QUEDA = 0.10
ESCURO = 0.8
VOLTA = 8
AREA_MIN = 0.01
MAX_QUEDAS = 3
MAX_AREA = 0.10


def fps_de(video):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'json', video], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f'não deu para ler {video}: {r.stderr.strip()}')
    num, den = json.loads(r.stdout)['streams'][0]['r_frame_rate'].split('/')
    return float(num) / float(den)


def luminancia(video):
    """Luminância relativa (0 a 1) de cada ponto, quadro a quadro: [quadros, ALT, LARG]."""
    cmd = ['ffmpeg', '-v', 'error', '-i', video, '-vf', f'scale={LARG}:{ALT}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    bruto = subprocess.run(cmd, capture_output=True).stdout
    q = len(bruto) // (LARG * ALT * 3)
    if q == 0:
        raise SystemExit(f'{video}: nenhum quadro lido')
    quadros = np.frombuffer(bruto[: q * LARG * ALT * 3], np.uint8).reshape(q, ALT, LARG, 3)
    # sRGB para luz linear por tabela (256 valores), de pouco em pouco quadro para não pesar na memória
    v = np.arange(256, dtype=np.float32) / 255
    tabela = np.where(v <= 0.04045, v / 12.92, ((v + 0.055) / 1.055) ** 2.4).astype(np.float32)
    L = np.empty((q, ALT, LARG), np.float32)
    for a in range(0, q, 60):
        lin = tabela[quadros[a: a + 60]]
        L[a: a + 60] = lin[..., 0] * 0.2126 + lin[..., 1] * 0.7152 + lin[..., 2] * 0.0722
    return L


def quedas(L):
    """Para cada quadro, a fração da tela que pisca nele (cai de repente e volta a clarear logo)."""
    q = L.shape[0]
    area = np.zeros(q)
    for f in range(1, q):
        antes = L[max(0, f - 2): f].max(axis=0)
        cai = (antes - L[f] >= QUEDA) & (L[f] < ESCURO)
        if not cai.any():
            continue
        # só conta se a queda é nova (não estava caindo no quadro anterior) e se volta a clarear em até VOLTA quadros
        if f >= 2:
            antes2 = L[max(0, f - 3): f - 1].max(axis=0)
            cai &= ~((antes2 - L[f - 1] >= QUEDA) & (L[f - 1] < ESCURO))
        fim = min(q, f + 1 + VOLTA)
        if fim <= f + 1:
            continue
        volta = (L[f + 1: fim] - L[f]).max(axis=0) >= QUEDA
        area[f] = float((cai & volta).mean())
    return area


def conferir(video):
    fps = fps_de(video)
    L = luminancia(video)
    area = quedas(L)
    conta = area >= AREA_MIN
    # quadros seguidos (até 2 de distância) são uma queda só
    eventos = []
    for f in np.nonzero(conta)[0]:
        if eventos and f - eventos[-1][-1] <= 2:
            eventos[-1].append(f)
        else:
            eventos.append([f])
    inicios = np.array([e[0] for e in eventos], dtype=int)
    janela = int(round(fps))
    pior = 0
    pior_em = 0.0
    for f in range(0, max(1, len(L) - janela + 1)):
        n = int(((inicios >= f) & (inicios < f + janela)).sum())
        if n > pior:
            pior, pior_em = n, f / fps
    maior = float(area.max()) if len(area) else 0.0
    print(f'{video}: {len(L)} quadros a {fps:g} fps ({len(L) / fps:.2f} s)')
    for s in range(int(np.ceil(len(L) / fps))):
        a, b = int(s * fps), int((s + 1) * fps)
        n = int(((inicios >= a) & (inicios < b)).sum())
        ar = float(area[a:b].max()) if b > a else 0.0
        print(f'  {s:3d} a {s + 1:3d} s: {n} queda(s), maior área que piscou {ar * 100:.1f}%')
    print(f'pior janela de 1 s: {pior} queda(s) (a partir de {pior_em:.2f} s); maior área que piscou: {maior * 100:.1f}% da tela')
    ok = pior <= MAX_QUEDAS and maior <= MAX_AREA
    if ok:
        print(f'ok: dentro da regra (até {MAX_QUEDAS} quedas por segundo, até {MAX_AREA * 100:.0f}% da tela)')
    else:
        motivos = []
        if pior > MAX_QUEDAS:
            motivos.append(f'{pior} quedas de brilho em 1 s (o máximo é {MAX_QUEDAS})')
        if maior > MAX_AREA:
            motivos.append(f'{maior * 100:.1f}% da tela piscando de uma vez (o máximo é {MAX_AREA * 100:.0f}%)')
        print('fora da regra da piscada: ' + '; '.join(motivos))
    return ok


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Uso: python3 _ferramentas/conferir_piscada.py <vídeo.mp4>')
    sys.exit(0 if conferir(sys.argv[1]) else 1)
