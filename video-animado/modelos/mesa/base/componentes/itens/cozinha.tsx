import React from 'react';
import type opcoes from '../opcoes.json';
import type { Biblioteca } from './index';

// Itens de cozinha, vistos de cima (caixa de -100 a 100). Na peça central (a tábua redonda), a pizza se monta em
// camadas como na tela de referência: massa (borda e disco), molho, e os pedaços de queijo, tomate e folha nas
// posições da referência; a farinha polvilha. Cores do material, fixas.

type Id = keyof typeof opcoes.grupos.cozinha.itens;

/** folha pontuda com a nervura, deitada no eixo x a partir da origem */
export const Folha: React.FC<{ c?: number; l?: number; cor?: string; nervura?: string }> = ({ c = 52, l = 28, cor = '#2E7D32', nervura = '#7CC47F' }) => (
  <g>
    <path d={`M0 0 C${c * 0.25} ${-l / 2} ${c * 0.75} ${-l / 2} ${c} 0 C${c * 0.75} ${l / 2} ${c * 0.25} ${l / 2} 0 0Z`} fill={cor} />
    <path d={`M${c * 0.06} 0 L${c * 0.9} 0`} stroke={nervura} strokeWidth={Math.max(1.2, l * 0.07)} strokeLinecap="round" opacity={0.7} />
  </g>
);

/** estrela de 5 pontas (cabinho do tomate) */
const estrela = (r: number, ri: number) =>
  Array.from({ length: 10 })
    .map((_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? ri : r;
      return `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
    })
    .join('') + 'Z';

const Massa: React.FC = () => (
  <g>
    <path d="M-88 -12 C-92 -52 -54 -90 -8 -90 C40 -92 86 -60 90 -14 C94 34 64 86 10 90 C-44 94 -86 40 -88 -12Z" fill="#FBF6EA" opacity={0.9} />
    <circle r={70} fill="#E6C487" />
    <circle cx={-5} cy={-6} r={64} fill="#F1D6A0" />
    <ellipse cx={-24} cy={-26} rx={28} ry={15} fill="#F9E9C8" opacity={0.85} transform="rotate(-32 -24 -26)" />
    <path d="M-30 30 Q-6 44 26 24" stroke="#D8B176" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
    {[
      [-30, -6, 3],
      [8, -30, 2.5],
      [24, 12, 3.5],
      [-6, 22, 2],
      [36, -16, 2],
      [-40, 18, 2.5],
      [70, 50, 2.5],
      [-72, -50, 3],
      [78, -30, 2],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.85} />
    ))}
  </g>
);

const Molho: React.FC = () => (
  <g>
    <circle r={86} fill="#F4F1EC" />
    <circle r={86} fill="none" stroke="#DDD6CC" strokeWidth={3} />
    <circle r={71} fill="#E4DDD3" />
    <circle r={64} fill="#C62828" />
    <circle r={64} fill="#D84315" opacity={0.35} />
    <ellipse cx={-22} cy={-30} rx={24} ry={10} fill="#FFFFFF" opacity={0.32} transform="rotate(-28 -22 -30)" />
    {[
      [14, 10, 20],
      [-18, 16, -40],
      [26, -22, 70],
      [-4, -8, 10],
      [-30, -4, 120],
    ].map(([x, y, a], i) => (
      <ellipse key={i} cx={x} cy={y} rx={5} ry={2.4} fill="#2E6B2A" opacity={0.85} transform={`rotate(${a} ${x} ${y})`} />
    ))}
    <path d="M70 -46 A84 84 0 0 0 30 -78" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
  </g>
);

const Queijo: React.FC = () => (
  <g transform="rotate(-18)">
    <path d="M-88 4 L66 -66 A168 168 0 0 1 66 74 Z" fill="#E7A93A" />
    <path d="M-80 4 L60 -56 A154 154 0 0 1 60 64 Z" fill="#F8CD5A" />
    <path d="M-80 4 L60 -56 L20 -20 Z" fill="#FBDB82" opacity={0.7} />
    {[
      [-26, 2, 9, 7],
      [10, 26, 13, 10],
      [24, -24, 8, 6],
      [44, 12, 7, 6],
      [-50, 8, 5, 4],
      [-6, -10, 5, 4],
    ].map(([x, y, rx, ry], i) => (
      <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#E3B03F" />
    ))}
  </g>
);

const Tomate: React.FC = () => (
  <g>
    <circle r={70} fill="#C62828" />
    <circle cx={-4} cy={-4} r={64} fill="#E53935" />
    <ellipse cx={-28} cy={-28} rx={20} ry={11} fill="#FFCDD2" opacity={0.6} transform="rotate(-38 -28 -28)" />
    <path d={estrela(28, 9)} fill="#2E7D32" transform="rotate(12)" />
    <circle r={6} fill="#1B5E20" />
  </g>
);

const RAMO: [number, number, number, number][] = [
  // x, y do ponto do caule, ângulo da folha, tamanho
  [-44, 46, -110, 0.85],
  [-44, 46, 30, 0.8],
  [-6, 8, -120, 1],
  [-6, 8, 40, 1],
  [30, -28, -125, 1.05],
  [30, -28, 45, 1],
  [58, -60, -60, 1.1],
  [58, -60, -15, 0.95],
];
const Ramo: React.FC = () => (
  <g>
    <path d="M-76 80 C-40 40 0 6 62 -64" stroke="#3E7B2C" strokeWidth={6} fill="none" strokeLinecap="round" />
    {RAMO.map(([x, y, a, k], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(${k})`}>
        <Folha c={58} l={32} cor={i % 3 === 0 ? '#2E7D32' : '#388E3C'} />
      </g>
    ))}
  </g>
);

const Ovo: React.FC = () => (
  <g transform="rotate(58)">
    <path d="M0 -76 C34 -76 54 -26 54 14 C54 50 30 72 0 72 C-30 72 -54 50 -54 14 C-54 -26 -34 -76 0 -76Z" fill="#E7D6BC" />
    <path d="M-6 -72 C26 -72 46 -26 46 12 C46 44 26 62 -2 64 C-28 64 -48 44 -48 10 C-48 -28 -32 -72 -6 -72Z" fill="#F5ECDD" />
    <ellipse cx={-18} cy={-30} rx={12} ry={24} fill="#FFFFFF" opacity={0.85} transform="rotate(-10 -18 -30)" />
    <path d="M30 30 C26 48 14 58 -2 60" stroke="#DCC8A8" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);

const Farinha: React.FC = () => (
  <g transform="rotate(-8)">
    {/* saco de papel kraft aberto, com a boca dobrada, e a farinha dentro */}
    <rect x={-62} y={-78} width={124} height={160} rx={10} fill="#C59A62" />
    <path d="M-62 40 L62 40 L62 72 Q62 82 52 82 L-52 82 Q-62 82 -62 72Z" fill="#B48850" />
    <rect x={-70} y={-86} width={140} height={34} rx={8} fill="#D8B27C" />
    <path d="M-66 -60 H66" stroke="#B48850" strokeWidth={3} />
    <path d="M-50 -52 C-52 -10 -40 28 0 30 C40 28 52 -10 50 -52Z" fill="#E9E1CF" />
    <path d="M-44 -50 C-44 -18 -30 16 0 18 C30 16 44 -18 44 -50Z" fill="#F7F2E6" />
    <path d="M-22 -40 C-20 -20 -8 -6 6 -8 C20 -10 26 -26 24 -42Z" fill="#FFFDF8" />
    {[
      [78, 30, 3],
      [84, 50, 2],
      [72, 66, 2.5],
      [-80, 20, 2.5],
      [90, 10, 1.8],
      [-86, 44, 2],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#FBF8F0" />
    ))}
  </g>
);

const Tigela: React.FC = () => (
  <g>
    <circle r={90} fill="#6F97AB" />
    <circle r={80} fill="#F6F3EE" />
    <circle r={62} fill="#EEEAE3" />
    <circle r={40} fill="#E6E1D8" />
    <path d="M-56 -58 A80 80 0 0 1 20 -78" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
    <path d="M-80 30 A86 86 0 0 1 -86 -10" stroke="#8DB0C2" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);

const Colher: React.FC = () => (
  <g transform="rotate(-38)">
    <rect x={-11} y={-6} width={22} height={104} rx={11} fill="#C48F59" />
    <ellipse cx={0} cy={-52} rx={32} ry={44} fill="#C48F59" />
    <ellipse cx={0} cy={-54} rx={24} ry={35} fill="#B07A45" />
    <ellipse cx={-7} cy={-64} rx={7} ry={14} fill="#CFA06D" opacity={0.8} />
    <path d="M-4 6 L-4 88 M4 14 L4 80" stroke="#A56E3C" strokeWidth={1.6} opacity={0.6} />
    <circle cx={0} cy={86} r={4} fill="#8A5A30" />
  </g>
);

const Prato: React.FC = () => (
  <g>
    <circle r={94} fill="#FBFAF7" />
    <circle r={94} fill="none" stroke="#E2DDD4" strokeWidth={3} />
    <circle r={66} fill="#F1EEE8" />
    <circle r={66} fill="none" stroke="#E2DDD4" strokeWidth={2.5} />
    <path d="M-66 -54 A86 86 0 0 1 -10 -86" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
    <circle r={80} fill="none" stroke="#8FB3C6" strokeWidth={2} opacity={0.7} />
  </g>
);

// ---------------------------------------------------------------- na tábua (a pizza)

const CamadaMassa: React.FC<{ R: number }> = ({ R }) => (
  <g>
    <circle r={R * 0.82} fill="#E9B872" />
    <circle r={R * 0.71} fill="#F3D39B" />
    {[0.3, 1.4, 2.6, 3.9, 5.1].map((a, i) => (
      <circle key={i} cx={Math.cos(a) * R * 0.77} cy={Math.sin(a) * R * 0.77} r={R * 0.018} fill="#D9A55E" opacity={0.8} />
    ))}
  </g>
);
const CamadaMolho: React.FC<{ R: number }> = ({ R }) => (
  <g>
    <circle r={R * 0.68} fill="#C62828" />
    <circle r={R * 0.68} fill="#D84315" opacity={0.35} />
  </g>
);

const TAM_QUEIJO = [
  [0.159, 0.103],
  [0.14, 0.093],
  [0.168, 0.112],
  [0.131, 0.084],
  [0.112, 0.084],
  [0.121, 0.084],
];
const PedacoQueijo: React.FC<{ i: number; R: number }> = ({ i, R }) => {
  const [rx, ry] = TAM_QUEIJO[i % TAM_QUEIJO.length];
  return (
    <g>
      <ellipse rx={rx * R} ry={ry * R} fill="#FBE7A6" />
      <ellipse cx={-rx * R * 0.25} cy={-ry * R * 0.3} rx={rx * R * 0.45} ry={ry * R * 0.35} fill="#FFF4CF" opacity={0.8} />
    </g>
  );
};
const PedacoTomate: React.FC<{ i: number; R: number }> = ({ R }) => (
  <g>
    <circle r={R * 0.103} fill="#E53935" />
    <circle r={R * 0.07} fill="#EF5350" />
    <circle cx={-R * 0.023} cy={-R * 0.014} r={R * 0.012} fill="#FFCDD2" />
    <circle cx={R * 0.023} cy={R * 0.019} r={R * 0.012} fill="#FFCDD2" />
    <circle cx={R * 0.02} cy={-R * 0.03} r={R * 0.01} fill="#FFCDD2" />
  </g>
);
const PedacoFolha: React.FC<{ i: number; R: number }> = ({ R }) => (
  <g transform={`translate(${-R * 0.084} 0)`}>
    <Folha c={R * 0.168} l={R * 0.09} />
  </g>
);
const PedacoFarinha: React.FC<{ i: number; R: number }> = ({ i, R }) => (
  <g>
    {Array.from({ length: 7 }).map((_, k) => {
      const a = k * 2.4 + i;
      const d = (k % 4) * R * 0.022;
      return <circle key={k} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={R * (0.008 + (k % 3) * 0.004)} fill="#FFFFFF" opacity={0.85} />;
    })}
  </g>
);

export const COZINHA: Biblioteca<Id> = {
  massa: { Mesa: Massa, Camada: CamadaMassa },
  molho: { Mesa: Molho, Camada: CamadaMolho, espalha: 'centro' },
  queijo: {
    Mesa: Queijo,
    Pedaco: PedacoQueijo,
    pedacos: 6,
    posicoes: [
      [-0.234, -0.187, 0],
      [0.234, -0.234, 0],
      [-0.047, 0.234, 0],
      [0.327, 0.234, 0],
      [-0.327, 0.234, 0],
      [0.093, -0.514, 0],
    ],
  },
  tomate: {
    Mesa: Tomate,
    Pedaco: PedacoTomate,
    pedacos: 3,
    posicoes: [
      [-0.374, -0.047, 0],
      [0.421, -0.047, 0],
      [0.14, 0.514, 0],
    ],
  },
  folha: {
    Mesa: Ramo,
    Pedaco: PedacoFolha,
    pedacos: 5,
    posicoes: [
      [-0.14, -0.374, -30],
      [0.187, 0, 20],
      [-0.234, 0.421, 60],
      [0.374, 0.421, -50],
      [0.023, -0.14, 10],
    ],
  },
  ovo: { Mesa: Ovo },
  farinha: { Mesa: Farinha, Pedaco: PedacoFarinha, pedacos: 14 },
  tigela: { Mesa: Tigela },
  colher: { Mesa: Colher },
  prato: { Mesa: Prato },
};
