import React from 'react';
import type opcoes from '../opcoes.json';
import type { Biblioteca } from './index';

// Itens de beleza, deitados na mesa e vistos de cima (caixa de -100 a 100). Nenhum tem rótulo, logo, letra ou o
// formato de um produto conhecido: o frasco é de vidro liso, o batom e o estojo são genéricos. Na peça central (a
// bandeja de penteadeira), cada produto deixa o teste da cor: o risco de base, o risco de batom e os toques de sombra,
// em lugares diferentes da bandeja para nunca cobrir um ao outro. Cores do material, fixas.

type Id = keyof typeof opcoes.grupos.beleza.itens;

const CORES_SOMBRA = ['#E2B6A0', '#C98B8B', '#A0705A', '#6B4A63'];

const Base: React.FC = () => (
  <g transform="rotate(-32)">
    {/* bomba */}
    <rect x={-22} y={-98} width={44} height={30} rx={7} fill="#2B2A2E" />
    <rect x={16} y={-92} width={30} height={10} rx={4} fill="#2B2A2E" />
    <rect x={-16} y={-70} width={32} height={18} rx={3} fill="#C9C1B9" />
    {/* vidro e o líquido */}
    <rect x={-42} y={-54} width={84} height={136} rx={20} fill="#EEE5DC" />
    <rect x={-34} y={-44} width={68} height={118} rx={13} fill="#DFAE87" />
    <rect x={-34} y={20} width={68} height={54} rx={13} fill="#D49E76" />
    <rect x={-27} y={-38} width={8} height={100} rx={4} fill="#FFFFFF" opacity={0.5} />
    <rect x={20} y={-30} width={5} height={60} rx={2.5} fill="#FFFFFF" opacity={0.3} />
  </g>
);

const Pincel: React.FC = () => (
  <g transform="rotate(38)">
    <path d="M-9 22 L-5 98 Q0 103 5 98 L9 22Z" fill="#3B2B33" />
    <rect x={-14} y={-22} width={28} height={46} rx={4} fill="#D8BFA2" />
    <path d="M-14 -8 H14 M-14 4 H14" stroke="#BFA182" strokeWidth={2} />
    <path d="M-14 -22 C-30 -50 -24 -90 0 -98 C24 -90 30 -50 14 -22Z" fill="#F1E3D2" />
    <path d="M-20 -62 C-18 -84 -10 -94 0 -98 C10 -94 18 -84 20 -62 C8 -68 -8 -68 -20 -62Z" fill="#C79B7D" />
    <path d="M-6 -28 C-10 -50 -8 -74 -2 -90" stroke="#FFFFFF" strokeWidth={2.5} fill="none" opacity={0.6} />
  </g>
);

const Batom: React.FC = () => (
  <g transform="rotate(-34) translate(-18 8)">
    {/* tampa ao lado */}
    <rect x={44} y={-34} width={40} height={84} rx={8} fill="#1F1B1D" />
    <rect x={44} y={36} width={40} height={6} fill="#C9A24B" />
    <rect x={50} y={-28} width={6} height={60} rx={3} fill="#FFFFFF" opacity={0.18} />
    {/* tubo, luva e a bala */}
    <rect x={-22} y={0} width={44} height={92} rx={7} fill="#C9A24B" />
    <rect x={-22} y={20} width={44} height={5} fill="#A98535" />
    <rect x={-14} y={6} width={6} height={80} rx={3} fill="#E9CF8A" opacity={0.7} />
    <rect x={-16} y={-30} width={32} height={32} rx={3} fill="#DDBF73" />
    <path d="M-14 -30 L-14 -62 Q-12 -70 0 -76 L14 -84 L14 -30Z" fill="#B3123B" />
    <path d="M-9 -34 L-9 -62" stroke="#E45A7C" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
  </g>
);

const Sombra: React.FC = () => (
  <g transform="rotate(-8)">
    <rect x={-80} y={-80} width={160} height={160} rx={20} fill="#2B2A2F" />
    <rect x={-80} y={-84} width={160} height={10} rx={5} fill="#46444B" />
    <rect x={-70} y={-70} width={140} height={140} rx={13} fill="#3A3840" />
    {CORES_SOMBRA.map((c, i) => {
      const x = i % 2 ? 34 : -34;
      const y = i < 2 ? -34 : 34;
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={28} fill="#1E1D21" />
          <circle cx={x} cy={y} r={25} fill={c} />
          <ellipse cx={x - 8} cy={y - 9} rx={10} ry={6} fill="#FFFFFF" opacity={0.28} transform={`rotate(-30 ${x - 8} ${y - 9})`} />
        </g>
      );
    })}
  </g>
);

const Espelho: React.FC = () => (
  <g transform="rotate(28) translate(0 4)">
    {/* cabo largo, do mesmo material da moldura */}
    <path d="M-15 30 L-11 84 Q0 100 11 84 L15 30Z" fill="#D9A68C" />
    <path d="M-7 40 L-5 80" stroke="#F0CDBB" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
    {/* moldura larga com bolinhas em volta */}
    <ellipse cx={0} cy={-22} rx={70} ry={66} fill="#D9A68C" />
    {Array.from({ length: 22 }).map((_, i) => {
      const a = (i / 22) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 63} cy={-22 + Math.sin(a) * 59} r={3.2} fill="#F3D4C3" />;
    })}
    <ellipse cx={0} cy={-22} rx={54} ry={50} fill="#BF8A70" />
    {/* vidro prateado com reflexo */}
    <ellipse cx={0} cy={-22} rx={50} ry={46} fill="#DCE5EA" />
    <ellipse cx={10} cy={-14} rx={40} ry={36} fill="#C9D6DD" />
    <path d="M-30 -44 L-6 -66 L8 -60 L-22 -32Z" fill="#FFFFFF" opacity={0.8} />
    <path d="M-36 -24 L-14 -46 L-8 -42 L-30 -18Z" fill="#FFFFFF" opacity={0.6} />
  </g>
);

const Disco: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={44} fill="#FFFFFF" />
    <circle r={44} fill="none" stroke="#E4E0DA" strokeWidth={2.5} />
    <circle r={36} fill="none" stroke="#EFECE7" strokeWidth={2} />
    {Array.from({ length: 25 }).map((_, i) => {
      const cx = ((i % 5) - 2) * 12;
      const cy = (Math.floor(i / 5) - 2) * 12;
      return cx * cx + cy * cy < 31 * 31 ? <circle key={i} cx={cx} cy={cy} r={1.7} fill="#E3DED7" /> : null;
    })}
  </g>
);
const Algodao: React.FC = () => (
  <g>
    <Disco x={-30} y={-24} />
    <Disco x={30} y={-34} />
    <Disco x={2} y={30} />
  </g>
);

// ---------------------------------------------------------------- na bandeja (os testes de cor)

const CamadaBase: React.FC<{ R: number }> = ({ R }) => {
  const k = R / 290;
  return (
    <g transform={`translate(${-R * 0.2} ${-R * 0.3}) rotate(-14) scale(${k})`}>
      <path d="M-110 -12 C-80 -40 20 -38 104 -22 C124 -16 124 14 100 20 C30 32 -60 34 -108 16 C-124 8 -122 -4 -110 -12Z" fill="#DFAE87" />
      <path d="M-80 -6 C-30 -20 30 -18 80 -8" stroke="#ECC6A6" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
    </g>
  );
};
const CamadaBatom: React.FC<{ R: number }> = ({ R }) => {
  const k = R / 290;
  return (
    <g transform={`translate(${R * 0.26} ${R * 0.08}) rotate(-24) scale(${k})`}>
      <path d="M-86 -8 C-60 -24 40 -26 86 -14 C98 -10 98 10 86 14 C40 24 -60 22 -86 10 C-96 4 -96 -2 -86 -8Z" fill="#B3123B" />
      <path d="M-66 -6 C-20 -14 30 -14 70 -6" stroke="#E45A7C" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
    </g>
  );
};
const PedacoSombra: React.FC<{ i: number; R: number }> = ({ i, R }) => (
  <g>
    <ellipse rx={R * 0.09} ry={R * 0.05} fill={CORES_SOMBRA[i % CORES_SOMBRA.length]} />
    <ellipse cx={-R * 0.02} cy={-R * 0.012} rx={R * 0.04} ry={R * 0.016} fill="#FFFFFF" opacity={0.25} />
  </g>
);

export const BELEZA: Biblioteca<Id> = {
  base: { Mesa: Base, Camada: CamadaBase, espalha: 'esquerda' },
  pincel: { Mesa: Pincel },
  batom: { Mesa: Batom, Camada: CamadaBatom, espalha: 'esquerda' },
  sombra: {
    Mesa: Sombra,
    Pedaco: PedacoSombra,
    pedacos: 4,
    posicoes: [
      [-0.36, 0.42, -12],
      [-0.12, 0.5, -6],
      [0.12, 0.52, 4],
      [0.36, 0.44, 12],
    ],
  },
  espelho: { Mesa: Espelho },
  algodao: { Mesa: Algodao },
};
