// Geometria de recorte: borda de papel levemente rasgada, sempre igual para a mesma semente (o Remotion pede
// que o mesmo frame desenhe igual). Usada pelo traço e pelos fundos do papel recortado e pela faixa e pela tarja
// rasgadas dos textos.

export type Pt = [number, number];

/** Número de 0 a 1 que depende só da semente e do índice. */
export const ruido = (semente: number, i: number): number => {
  const x = Math.sin(semente * 127.1 + i * 311.7 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};

const f = (n: number) => n.toFixed(1);
const caminho = (pts: Pt[]) => `M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L ')} Z`;

/** Polígono com a borda rasgada: cada lado é dividido em pedaços de ~passo px e cada ponto anda até amp px. */
export const poligonoRasgado = (pts: Pt[], semente: number, amp = 1.6, passo = 14): string => {
  const saida: Pt[] = [];
  let k = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    const comp = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.round(comp / passo));
    const nx = comp ? -(y2 - y1) / comp : 0;
    const ny = comp ? (x2 - x1) / comp : 0;
    for (let j = 0; j < n; j++) {
      const t = j / n;
      const d = j === 0 ? 0 : (ruido(semente, k++) - 0.5) * 2 * amp;
      saida.push([x1 + (x2 - x1) * t + nx * d, y1 + (y2 - y1) * t + ny * d]);
    }
  }
  return caminho(saida);
};

export const retanguloRasgado = (x: number, y: number, w: number, h: number, semente: number, amp = 1.6, passo = 14) =>
  poligonoRasgado(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    semente,
    amp,
    passo,
  );

/** Círculo (ou elipse) de papel: n pontos com o raio variando até amp px. */
export const circuloRasgado = (cx: number, cy: number, r: number, semente: number, amp = 1.3, n = 48, ry = r): string => {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const d = (ruido(semente, i) - 0.5) * 2 * amp;
    pts.push([cx + Math.cos(a) * (r + d), cy + Math.sin(a) * (ry + d)]);
  }
  return caminho(pts);
};

/** Peça comprida de pontas redondas entre dois pontos (braço, perna de traço), com a borda rasgada. */
export const capsulaRasgada = (a: Pt, b: Pt, largura: number, semente: number, amp = 1.1): string => {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const r = largura / 2;
  const pts: Pt[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const t = ang - Math.PI / 2 + (i / n) * Math.PI;
    pts.push([x2 + Math.cos(t) * r, y2 + Math.sin(t) * r]);
  }
  for (let i = 0; i <= n; i++) {
    const t = ang + Math.PI / 2 + (i / n) * Math.PI;
    pts.push([x1 + Math.cos(t) * r, y1 + Math.sin(t) * r]);
  }
  return poligonoRasgado(pts, semente, amp, 10);
};

/**
 * Pontos de uma borda rasgada em porcentagem, para o clip-path de um bloco de texto de altura livre
 * (faixa do título, tarja da legenda): `polygon(...)` com o recorte nas bordas de cima e de baixo.
 */
export const clipRasgado = (semente: number, dentes = 18, fundoDente = 7): string => {
  const cima: string[] = [];
  const baixo: string[] = [];
  for (let i = 0; i <= dentes; i++) {
    const x = (i / dentes) * 100;
    cima.push(`${x.toFixed(2)}% ${(ruido(semente, i) * fundoDente).toFixed(2)}%`);
    baixo.push(`${(100 - x).toFixed(2)}% ${(100 - ruido(semente, i + 50) * fundoDente).toFixed(2)}%`);
  }
  return `polygon(${[...cima, ...baixo].join(', ')})`;
};
