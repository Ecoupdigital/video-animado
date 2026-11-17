import React from 'react';
import { eo, ramp, W } from './anima';
import { DESENHOS } from './itens';
import { entrada, semente, sorteio, type Caixa, type Entrada } from './pecas';
import { useMesa, type IdGrupo, type IdItem } from './tema';

// A peça central de cada grupo, no meio da mesa, e o que cai sobre ela (cobertura):
//   cozinha     tábua redonda de madeira com cabo e anel pontilhado (a da tela de referência)
//   beleza      bandeja redonda de penteadeira, de cerâmica rosada com friso dourado
//   artesanato  base de corte verde quadriculada, com régua nas bordas
// A peça e a cobertura ficam numa camada só (um SVG do tamanho da tela), com a sombra na cor da superfície.
// O que cai na peça central fica até o fim do vídeo: a cobertura é a soma de todas as cenas até o instante t.

export const CENTRO = { x: W / 2, y: 930 } as const;
/** raio (ou meia altura, na base de corte) de cada peça central; os pedaços e camadas usam esta medida */
export const RAIO: Record<IdGrupo, number> = { cozinha: 350, beleza: 350, artesanato: 240 };
const BASE_CORTE = { w: 560, h: 480 };

/** a peça central ocupa este lugar: o item da mesa que encostar nela não entra */
export const ocupaCentro = (g: IdGrupo, c: { x: number; y: number; r: number }) => {
  if (g === 'artesanato') {
    const x = CENTRO.x - BASE_CORTE.w / 2;
    const y = CENTRO.y - BASE_CORTE.h / 2;
    const px = Math.max(x, Math.min(c.x, x + BASE_CORTE.w));
    const py = Math.max(y, Math.min(c.y, y + BASE_CORTE.h));
    return Math.hypot(c.x - px, c.y - py) < c.r;
  }
  const R = RAIO[g];
  if (Math.hypot(c.x - CENTRO.x, c.y - CENTRO.y) < R + c.r) return true;
  // o cabo da tábua desce do meio, quase reto
  if (g === 'cozinha') return c.x + c.r > CENTRO.x - 50 && c.x - c.r < CENTRO.x + 30 && c.y + c.r > CENTRO.y;
  return false;
};
/** caixa da peça central na tela */
export const caixaCentro = (g: IdGrupo): Caixa =>
  g === 'artesanato'
    ? { x: CENTRO.x - BASE_CORTE.w / 2, y: CENTRO.y - BASE_CORTE.h / 2, w: BASE_CORTE.w, h: BASE_CORTE.h }
    : { x: CENTRO.x - RAIO[g], y: CENTRO.y - RAIO[g], w: 2 * RAIO[g], h: 2 * RAIO[g] + (g === 'cozinha' ? 140 : 0) };

// ---------------------------------------------------------------- as 3 peças

const Tabua: React.FC<{ R: number }> = ({ R }) => (
  <g>
    <g transform={`rotate(8 0 ${R * 0.9})`}>
      <rect x={-R * 0.093} y={R * 0.86} width={R * 0.186} height={R * 0.56} rx={R * 0.085} fill="#B98250" />
      <circle cx={0} cy={R * 1.31} r={R * 0.03} fill="#8A5A30" />
    </g>
    <circle r={R} fill="#C8915C" />
    {[0.9, 0.74, 0.55, 0.36].map((k, i) => (
      <circle key={i} r={R * k} fill="none" stroke="#B98250" strokeWidth={2.5} opacity={0.35 - i * 0.05} />
    ))}
    <circle r={R - 6} fill="none" stroke="#B07A46" strokeWidth={5} strokeDasharray="3 16" strokeLinecap="round" />
    <path d={`M${-R * 0.78} ${-R * 0.42} A${R * 0.9} ${R * 0.9} 0 0 1 ${-R * 0.2} ${-R * 0.88}`} stroke="#D7A774" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
  </g>
);

const Bandeja: React.FC<{ R: number }> = ({ R }) => (
  <g>
    <circle r={R} fill="#E8C8C1" />
    <circle r={R * 0.96} fill="#EED3CD" />
    <circle r={R * 0.88} fill="#F6E6E2" />
    <circle r={R * 0.88} fill="none" stroke="#C9A46A" strokeWidth={4} />
    <circle r={R * 0.83} fill="none" stroke="#EAD3CD" strokeWidth={2} />
    <path d={`M${-R * 0.82} ${-R * 0.36} A${R * 0.9} ${R * 0.9} 0 0 1 ${-R * 0.3} ${-R * 0.85}`} stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.65} />
  </g>
);

const BaseCorte: React.FC = () => {
  const { w, h } = BASE_CORTE;
  const x0 = -w / 2;
  const y0 = -h / 2;
  const m = 26;
  const passo = 21.6;
  const finas: string[] = [];
  const grossas: string[] = [];
  for (let i = 0; x0 + m + i * passo <= w / 2 - m + 0.1; i++) (i % 5 ? finas : grossas).push(`M${(x0 + m + i * passo).toFixed(1)} ${y0 + m}V${h / 2 - m}`);
  for (let i = 0; y0 + m + i * passo <= h / 2 - m + 0.1; i++) (i % 5 ? finas : grossas).push(`M${x0 + m} ${(y0 + m + i * passo).toFixed(1)}H${w / 2 - m}`);
  const marcas: string[] = [];
  for (let i = 0; x0 + m + i * (passo / 2) <= w / 2 - m + 0.1; i++) marcas.push(`M${(x0 + m + i * (passo / 2)).toFixed(1)} ${y0 + 6}v${i % 10 === 0 ? 16 : i % 2 ? 7 : 11}`);
  for (let i = 0; y0 + m + i * (passo / 2) <= h / 2 - m + 0.1; i++) marcas.push(`M${x0 + 6} ${(y0 + m + i * (passo / 2)).toFixed(1)}h${i % 10 === 0 ? 16 : i % 2 ? 7 : 11}`);
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={20} fill="#2E7A59" />
      <rect x={x0 + m} y={y0 + m} width={w - 2 * m} height={h - 2 * m} fill="#33845F" />
      <path d={finas.join('')} stroke="#5AA27E" strokeWidth={1.4} opacity={0.8} />
      <path d={grossas.join('')} stroke="#86C3A3" strokeWidth={2.4} opacity={0.9} />
      <path d={`M${x0 + m} ${h / 2 - m} L${w / 2 - m - 40} ${y0 + m}`} stroke="#86C3A3" strokeWidth={1.6} opacity={0.5} />
      <path d={`M${x0 + m + 140} ${h / 2 - m} L${w / 2 - m} ${y0 + m + 100}`} stroke="#86C3A3" strokeWidth={1.6} opacity={0.5} />
      <path d={marcas.join('')} stroke="#CFE8DA" strokeWidth={2} />
    </g>
  );
};

/** a peça central do grupo, sem nada em cima */
export const PecaCentral: React.FC<{ grupo: IdGrupo }> = ({ grupo }) =>
  grupo === 'cozinha' ? <Tabua R={RAIO.cozinha} /> : grupo === 'beleza' ? <Bandeja R={RAIO.beleza} /> : <BaseCorte />;

// ---------------------------------------------------------------- cobertura

export type Cobertura = { item: IdItem; at: number; entrada: Entrada; quantidade?: number };

/** onde cai cada pedaço: as posições do item (as da referência na pizza) e, passando delas, sorteio fixo pela semente */
export const posicoesPedacos = (item: IdItem, n: number, R: number): [number, number, number][] => {
  const D = DESENHOS[item];
  const fixas = (D.posicoes ?? []).map(([x, y, a]) => [x * R, y * R, a] as [number, number, number]);
  const lista = fixas.slice(0, n);
  const r = sorteio(semente(`pedacos-${item}`));
  const minimo = R * 0.16;
  for (let tentativa = 0; lista.length < n && tentativa < 600; tentativa++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * R * 0.6;
    const p: [number, number, number] = [Math.cos(a) * d, Math.sin(a) * d, Math.round(r() * 120 - 60)];
    if (lista.every(([x, y]) => Math.hypot(x - p[0], y - p[1]) > minimo * (tentativa > 300 ? 0.6 : 1))) lista.push(p);
  }
  return lista;
};

const UmaCobertura: React.FC<{ c: Cobertura; t: number; R: number; k: string; filtro: string }> = ({ c, t, R, k, filtro }) => {
  const D = DESENHOS[c.item];
  if (D.Camada) {
    const C = D.Camada;
    if (D.espalha === 'centro') {
      // espalha do meio para fora (molho)
      const p = eo(ramp(t, c.at, 0.5));
      return (
        <g transform={`scale(${0.12 + 0.88 * p})`} opacity={Math.min(1, p * 4)}>
          <C R={R} />
        </g>
      );
    }
    if (D.espalha === 'esquerda') {
      // risca da esquerda para a direita (base, batom, fita)
      const p = eo(ramp(t, c.at, 0.45));
      return (
        <g>
          <defs>
            <clipPath id={`risca-${k}`}>
              <rect x={-R * 1.3} y={-R * 1.3} width={R * 2.6 * p} height={R * 2.6} />
            </clipPath>
          </defs>
          <g clipPath={`url(#risca-${k})`} filter={filtro}>
            <C R={R} />
          </g>
        </g>
      );
    }
    // cai como uma folha (massa, papel)
    const e = entrada(t, c.at, c.entrada, 140);
    if (!e) return null;
    return (
      <g transform={`translate(0 ${e.dy}) scale(${e.escala})`} opacity={e.opacidade} filter={filtro}>
        <C R={R} />
      </g>
    );
  }
  if (D.Pedaco) {
    const P = D.Pedaco;
    const n = Math.max(1, Math.min(12, c.quantidade ?? D.pedacos ?? 4));
    return (
      <>
        {posicoesPedacos(c.item, n, R).map(([x, y, a], i) => {
          const e = entrada(t, c.at + i * 0.08, c.entrada, 70);
          if (!e) return null;
          return (
            <g key={i} transform={`translate(${x} ${y + e.dy}) rotate(${a}) scale(${e.escala})`} opacity={e.opacidade} filter={filtro}>
              <P i={i} R={R} />
            </g>
          );
        })}
      </>
    );
  }
  return null;
};

/** a peça central do grupo em uso e o que já caiu sobre ela até o instante t (na ordem em que caiu) */
export const MesaCentral: React.FC<{ t: number; cobertura: Cobertura[]; chave?: string }> = ({ t, cobertura, chave = 'c' }) => {
  const M = useMesa();
  const R = RAIO[M.grupo];
  const filtro = `url(#sombra-pedaco-${chave})`;
  const ordem = cobertura.map((c, i) => ({ c, i })).sort((a, b) => a.c.at - b.c.at || a.i - b.i);
  return (
    <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <filter id={`sombra-peca-${chave}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx={6} dy={18} stdDeviation={16} floodColor={M.m.sombra} floodOpacity={M.sombraAlfa} />
        </filter>
        <filter id={`sombra-pedaco-${chave}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx={2} dy={5} stdDeviation={4} floodColor="#000000" floodOpacity={0.28} />
        </filter>
      </defs>
      <g transform={`translate(${CENTRO.x} ${CENTRO.y})`}>
        <g filter={`url(#sombra-peca-${chave})`}>
          <PecaCentral grupo={M.grupo} />
        </g>
        {ordem.map(({ c, i }) => (t >= c.at ? <UmaCobertura key={i} c={c} t={t} R={R} k={`${chave}-${i}`} filtro={filtro} /> : null))}
      </g>
    </svg>
  );
};
