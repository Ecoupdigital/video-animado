// Medidas da tela da Conversa no celular (vertical 1080 x 1920, 30 fps).
// Tudo que é texto fica dentro da área segura do Reels (220 px do topo, 380 de baixo, 70 de lado): o título e a
// legenda em cima do celular, as bolhas e o campo de mensagem dentro dele. O celular continua para baixo da borda
// do vídeo, com o teclado na faixa de baixo (que o Reels cobre): ali não vai texto nenhum.

export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** segundos -> frame */
export const s = (seg: number) => Math.round(seg * FPS);
/** Área segura do Reels: nada importante nos 220 px do topo, nos 380 px de baixo nem a menos de 70 px das laterais. */
export const SEGURA = { topo: 220, baixo: 380, lado: 70 } as const;
export const Y_MAX = H - SEGURA.baixo;
export const LARGURA_UTIL = W - 2 * SEGURA.lado;

/** Título da cena (até 3 linhas, encolhe) e legenda (até 2 linhas), entre o topo da área segura e o celular. */
export const TITULO = { topo: SEGURA.topo + 16, base: 432 } as const;
export const LEGENDA = { topo: 444, base: 540 } as const;

/** O celular: moldura, tela, cabeçalho do contato, conversa, campo de mensagem e teclado. */
export const CELULAR = { x: 130, y: 552, w: 820, borda: 16, raio: 72 } as const;
export const TELA = { x: CELULAR.x + CELULAR.borda, y: CELULAR.y + CELULAR.borda, w: CELULAR.w - 2 * CELULAR.borda, raio: 56 } as const;
export const CABECALHO = { y: TELA.y, h: 128, avatar: 82 } as const;
/** Faixa do campo de mensagem: o texto do campo termina antes do limite de baixo da área segura (y 1540). */
export const CAMPO = { y: 1424, h: 116, pilula: 88, botao: 88 } as const;
export const CHAT = { y: CABECALHO.y + CABECALHO.h, h: CAMPO.y - (CABECALHO.y + CABECALHO.h), pad: 22, padTopo: 24, padBaixo: 18 } as const;
/** Teclado: da faixa de baixo até a borda do vídeo (sem letra nas teclas). */
export const TECLADO = { y: CAMPO.y + CAMPO.h, h: H - (CAMPO.y + CAMPO.h) } as const;

/** Bolha: fonte, linha, margens, largura máxima e espaço entre bolhas. */
export const BOLHA = { fonte: 40, linha: 52, padX: 26, padY: 16, max: 650, gap: 14, raio: 30, hora: 24 } as const;
