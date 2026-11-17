// Medidas da tela do Conto (vertical 1080 x 1920, 30 fps), iguais em todos os temas.

export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** segundos -> frame */
export const s = (seg: number) => Math.round(seg * FPS);
/** Área segura do Reels: nada importante nos 220 px do topo, nos 380 px de baixo nem a menos de 70 px das laterais. */
export const SEGURA = { topo: 220, baixo: 380, lado: 70 } as const;
export const Y_MAX = H - SEGURA.baixo;
/** Linha do chão: os pés dos personagens pisam aqui (escala 1 = 400 x 900). Abaixo dela, chão e a legenda. */
export const CHAO_Y = 1395;
/** Centro (x) de cada personagem em cena: um sozinho, dois (nas pontas, o cenário no meio) e no fecho. */
export const CENTROS = { um: [330], dois: [W / 2 - 300, W / 2 + 300], fecho: [360] } as const;
/** Faixa da legenda (tarja ou legenda simples): entre o chão e o limite de baixo da área segura. */
export const LEGENDA = { topo: 1408, base: Y_MAX - 8 } as const;
