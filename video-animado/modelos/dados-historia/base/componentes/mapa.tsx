import React from 'react';
import { misturar, type Tema } from './tema';

// O mapa da família Dados e história: UM desenho estilizado e genérico, igual em todo universo (nenhuma cidade
// real, nenhum nome de rua ou bairro), feito de formas simples em coordenadas locais (1000 x 1780): um rio do
// lado esquerdo, quarteirões em grade, praças com árvores e as ruas no vão entre eles. A rota é sempre o mesmo
// traçado pelas ruas, em 3 trechos; o roteiro diz quantos trechos a cena usa (1 a 3), o texto dos chips e o
// nome da chegada. O tema troca só a projeção e as cores:
//   mapa            o mapa colorido ocupando a tela inteira
//   linha-do-tempo  o mesmo mapa em traço fino, sobre o papel
//   jornal          o mapa impresso em tinta dentro de um recorte
//   isometrico      o mapa visto de lado, num piso em losango, com quarteirões de pouca altura
// Tudo projetado em JavaScript (a projeção é afim: a curva projetada é a curva dos pontos projetados).

export const MAPA_W = 1000;
export const MAPA_H = 1780;

type P = [number, number];
type Quadra = { x: number; y: number; w: number; h: number; praca?: boolean };

const COLS: [number, number][] = [
  [330, 500],
  [540, 700],
  [740, 880],
  [920, 1000],
];
const LINHAS: [number, number][] = [
  [0, 120],
  [160, 330],
  [370, 520],
  [560, 700],
  [740, 900],
  [940, 1080],
  [1120, 1260],
  [1300, 1440],
  [1480, 1620],
  [1660, 1780],
];
// quarteirões que se juntam (linha, coluna inicial, coluna final) e praças (linha, coluna)
const JUNTOS: [number, number, number][] = [
  [2, 0, 1],
  [5, 1, 2],
  [7, 0, 1],
  [1, 2, 3],
  [9, 1, 2],
];
const PRACAS: [number, number][] = [
  [1, 0],
  [3, 2],
  [6, 1],
  [8, 3],
  [4, 3],
  [0, 1],
];

const montarQuadras = (): Quadra[] => {
  const q: Quadra[] = [];
  LINHAS.forEach(([y0, y1], li) => {
    let ci = 0;
    while (ci < COLS.length) {
      const junto = JUNTOS.find(([l, a]) => l === li && a === ci);
      const fimC = junto ? junto[2] : ci;
      const praca = PRACAS.some(([l, c]) => l === li && c === ci);
      q.push({ x: COLS[ci][0], y: y0, w: COLS[fimC][1] - COLS[ci][0], h: y1 - y0, praca });
      ci = fimC + 1;
    }
  });
  return q;
};
export const QUADRAS = montarQuadras();

/** árvores (centro e raio) nas praças, sempre as mesmas */
export const ARVORES: [number, number, number][] = QUADRAS.filter((q) => q.praca).flatMap((q, i) => [
  [q.x + q.w * 0.3, q.y + q.h * 0.4, 22 + (i % 2) * 6] as [number, number, number],
  [q.x + q.w * 0.62, q.y + q.h * 0.62, 18 + (i % 3) * 4] as [number, number, number],
  [q.x + q.w * 0.75, q.y + q.h * 0.3, 15] as [number, number, number],
]);

/** rio: a margem direita em curvas (pontos de Bézier cúbica: início, depois trincas de controle) */
const RIO: P[] = [
  [150, 0],
  [230, 120], [170, 300], [230, 430],
  [300, 580], [170, 760], [230, 920],
  [280, 1060], [200, 1240], [260, 1400],
  [300, 1520], [230, 1660], [270, 1780],
];

/** a rota pelas ruas: 3 curvas cúbicas (saída embaixo, sobe, vira à direita, sobe, vira à esquerda até o pino) */
export const ROTA: [P, P, P, P][] = [
  [[520, 1250], [520, 1060], [520, 920], [610, 920]],
  [[610, 920], [820, 920], [900, 920], [900, 820]],
  [[900, 820], [900, 620], [900, 540], [790, 540]],
];
/** trechos de cada quantidade: quais curvas da ROTA cada trecho desenha */
export const PARTES: Record<number, number[][]> = { 1: [[0, 1, 2]], 2: [[0], [1, 2]], 3: [[0], [1], [2]] };

/** comprimento aproximado de uma curva (para dividir o tempo de um trecho de várias curvas) */
export const comprimento = (c: [P, P, P, P]) => {
  let s = 0;
  let a = c[0];
  for (let i = 1; i <= 24; i++) {
    const b = ponto(c, i / 24);
    s += Math.hypot(b[0] - a[0], b[1] - a[1]);
    a = b;
  }
  return s;
};
export const ponto = (c: [P, P, P, P], u: number): P =>
  [0, 1].map((k) => (1 - u) ** 3 * c[0][k] + 3 * (1 - u) ** 2 * u * c[1][k] + 3 * (1 - u) * u * u * c[2][k] + u ** 3 * c[3][k]) as P;

// ---------------------------------------------------------------- projeção por tema

export type Projecao = { p: (x: number, y: number) => P; escala: number; iso: boolean; clip?: P[] };

/** a projeção do mapa no tema: do ponto local para a tela (1080 x 1920) */
export const projecao = (T: Tema): Projecao => {
  if (T.id === 'isometrico') {
    // centrado na rota: o ponto local (660, 895) cai no meio do piso
    const k = 0.65;
    const p = (x: number, y: number): P => [540 + (x - 660 + (y - 895)) * k, 1000 + (y - 895 - (x - 660)) * (k / 2)];
    return { p, escala: k, iso: true, clip: [[40, 1000], [540, 750], [1040, 1000], [540, 1250]] };
  }
  if (T.id === 'jornal') {
    const s = 0.98;
    return { p: (x, y) => [540 + (x - 720) * s, 985 + (y - 900) * s], escala: s, iso: false, clip: [[96, 520], [984, 520], [984, 1430], [96, 1430]] };
  }
  const s = 1.08;
  return { p: (x, y) => [x * s, y * s], escala: s, iso: false };
};

export type CoresMapa = { chao: string; quadra: string; lado: string; praca: string; arvore: string; arvore2: string; rio: string; margem: string; rua: string; tracejado: string; contorno: string | null };

export const coresMapa = (T: Tema): CoresMapa => {
  const c = T.c;
  if (T.id === 'isometrico') {
    const quadra = misturar(c.piso, c.fundo2, 0.75);
    return { chao: c.piso, quadra, lado: misturar(quadra, '#000000', 0.35), praca: misturar(c.barra, c.piso, 0.62), arvore: misturar(c.enfeite, c.piso, 0.2), arvore2: misturar(c.enfeite, '#000000', 0.25), rio: misturar(c.barra, c.piso, 0.4), margem: misturar(c.barra, c.piso, 0.15), rua: misturar(c.piso, '#FFFFFF', 0.12), tracejado: c.linha, contorno: null };
  }
  if (T.id === 'linha-do-tempo') {
    return { chao: 'none', quadra: misturar(c.fundo, c.fundo2, 0.5), lado: c.linha, praca: misturar(c.fundo, c.barra, 0.45), arvore: misturar(c.fundo, c.barra, 0.8), arvore2: c.barra, rio: misturar(c.fundo, c.linha, 0.7), margem: c.linha, rua: c.superficie, tracejado: c.linha, contorno: c.linha };
  }
  if (T.id === 'jornal') {
    const papel = c.superficie;
    const tinta = c.tinta;
    return { chao: papel, quadra: misturar(papel, tinta, 0.13), lado: misturar(papel, tinta, 0.2), praca: misturar(papel, tinta, 0.06), arvore: misturar(papel, tinta, 0.32), arvore2: misturar(papel, tinta, 0.45), rio: misturar(papel, tinta, 0.24), margem: misturar(papel, tinta, 0.5), rua: papel, tracejado: misturar(papel, tinta, 0.45), contorno: misturar(papel, tinta, 0.35) };
  }
  return { chao: c.fundo, quadra: c.fundo2, lado: misturar(c.fundo2, '#000000', 0.08), praca: c.barra, arvore: c.enfeite, arvore2: misturar(c.enfeite, '#000000', 0.12), rio: c.piso, margem: misturar(c.piso, '#000000', 0.14), rua: c.superficie, tracejado: c.linha, contorno: null };
};

const f1 = (n: number) => n.toFixed(1);
const caminhoPontos = (pts: P[], fechar = true) => `M ${pts.map((q) => `${f1(q[0])} ${f1(q[1])}`).join(' L ')}${fechar ? ' Z' : ''}`;
/** curva cúbica local projetada, em comando SVG */
export const curvaSvg = (pr: Projecao, c: [P, P, P, P], comM = true) => {
  const [a, b, d, e] = c.map((q) => pr.p(q[0], q[1]));
  return `${comM ? `M ${f1(a[0])} ${f1(a[1])} ` : ''}C ${f1(b[0])} ${f1(b[1])} ${f1(d[0])} ${f1(d[1])} ${f1(e[0])} ${f1(e[1])}`;
};
const rioSvg = (pr: Projecao) => {
  const ini = pr.p(RIO[0][0], RIO[0][1]);
  let d = `M ${f1(pr.p(0, 0)[0])} ${f1(pr.p(0, 0)[1])} L ${f1(ini[0])} ${f1(ini[1])}`;
  for (let i = 1; i + 2 < RIO.length; i += 3) {
    const [b, c, e] = [RIO[i], RIO[i + 1], RIO[i + 2]].map((q) => pr.p(q[0], q[1]));
    d += ` C ${f1(b[0])} ${f1(b[1])} ${f1(c[0])} ${f1(c[1])} ${f1(e[0])} ${f1(e[1])}`;
  }
  const fim = pr.p(0, MAPA_H);
  return { area: `${d} L ${f1(fim[0])} ${f1(fim[1])} Z`, margem: d.replace(/^M [^L]+L/, 'M') };
};
/** a rua da rota inteira (por baixo do traço que se desenha) */
export const ruaDaRota = (pr: Projecao) => ROTA.map((c, i) => curvaSvg(pr, c, i === 0)).join(' ');

/** o mapa genérico desenhado no tema (sem a rota) */
export const MapaDesenho: React.FC<{ T: Tema; idClip: string }> = ({ T, idClip }) => {
  const pr = projecao(T);
  const k = coresMapa(T);
  const rio = rioSvg(pr);
  const alto = pr.iso ? 16 : 0;
  const sobre = (pts: P[], dy: number) => pts.map((q) => [q[0], q[1] - dy] as P);
  // no isométrico, de trás para a frente (o mais alto na tela primeiro)
  const fundoDe = (q: Quadra) => q.y + q.h / 2 - (q.x + q.w / 2);
  const quadras = pr.iso ? [...QUADRAS].sort((a, b) => fundoDe(a) - fundoDe(b)) : QUADRAS;
  const traco = T.id === 'linha-do-tempo';
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
      {pr.clip ? (
        <defs>
          <clipPath id={idClip}>
            <path d={caminhoPontos(pr.clip)} />
          </clipPath>
        </defs>
      ) : null}
      <g clipPath={pr.clip ? `url(#${idClip})` : undefined}>
        {k.chao !== 'none' ? <path d={caminhoPontos([pr.p(0, 0), pr.p(MAPA_W, 0), pr.p(MAPA_W, MAPA_H), pr.p(0, MAPA_H)])} fill={k.chao} /> : null}
        <path d={rio.area} fill={k.rio} />
        <path d={rio.margem} fill="none" stroke={k.margem} strokeWidth={traco ? 3 : 8 * pr.escala} />
        {quadras.map((q, i) => {
          const pts: P[] = [pr.p(q.x, q.y), pr.p(q.x + q.w, q.y), pr.p(q.x + q.w, q.y + q.h), pr.p(q.x, q.y + q.h)];
          const cor = q.praca ? k.praca : k.quadra;
          if (pr.iso && !q.praca) {
            // quarteirão com pouca altura: as duas faces da frente (as que encostam no canto mais baixo, d) e a tampa
            const [a, b, c, d] = pts;
            return (
              <g key={i}>
                <path d={caminhoPontos([a, d, sobre([d], alto)[0], sobre([a], alto)[0]])} fill={k.lado} />
                <path d={caminhoPontos([d, c, sobre([c], alto)[0], sobre([d], alto)[0]])} fill={misturar(k.lado, '#000000', 0.2)} />
                <path d={caminhoPontos(sobre([a, b, c, d], alto))} fill={cor} />
              </g>
            );
          }
          return <path key={i} d={caminhoPontos(pts)} fill={cor} stroke={k.contorno ?? (pr.iso ? 'none' : k.lado)} strokeWidth={k.contorno ? 2.5 : 2} />;
        })}
        {ARVORES.map(([x, y, r], i) => {
          const [cx, cy] = pr.p(x, y);
          const rr = r * pr.escala * (pr.iso ? 1.25 : 1);
          return (
            <g key={i}>
              <circle cx={cx + rr * 0.25} cy={cy + rr * 0.2 - (pr.iso ? rr * 0.6 : 0)} r={rr} fill={k.arvore2} />
              <circle cx={cx} cy={cy - (pr.iso ? rr * 0.8 : 0)} r={rr * 0.86} fill={traco ? 'none' : k.arvore} stroke={traco ? k.arvore2 : 'none'} strokeWidth={2.5} />
            </g>
          );
        })}
        {/* a rua da rota: larga, clara, com o tracejado no meio */}
        <path d={ruaDaRota(pr)} fill="none" stroke={k.rua} strokeWidth={34 * pr.escala} strokeLinecap="round" strokeLinejoin="round" />
        <path d={ruaDaRota(pr)} fill="none" stroke={k.tracejado} strokeWidth={8 * pr.escala} strokeDasharray={`${8 * pr.escala} ${20 * pr.escala}`} strokeLinecap="round" />
      </g>
    </svg>
  );
};
