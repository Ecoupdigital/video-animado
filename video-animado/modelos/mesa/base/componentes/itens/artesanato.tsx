import React from 'react';
import type opcoes from '../opcoes.json';
import type { Biblioteca } from './index';

// Itens de artesanato, vistos de cima (caixa de -100 a 100). O bastão de cola não tem rótulo nem letra. Na peça
// central (a base de corte quadriculada), o cartão se monta: o papel cai como uma folha dobrada, a fita atravessa
// com o laço, a cola marca as pontas e os botões entram embaixo. Cores do material, fixas.

type Id = keyof typeof opcoes.grupos.artesanato.itens;

const CORES_BOTAO = ['#3D7DD8', '#F2B33D', '#E35D8A', '#3FA57A'];

const Papel: React.FC = () => (
  <g>
    <rect x={-58} y={-74} width={116} height={148} rx={4} fill="#F6D365" transform="rotate(-14)" />
    <rect x={-58} y={-74} width={116} height={148} rx={4} fill="#8FD3BD" transform="rotate(3) translate(4 -2)" />
    <g transform="rotate(16) translate(10 4)">
      <rect x={-58} y={-74} width={116} height={148} rx={4} fill="#F4978E" />
      <path d="M58 -74 L58 -44 L28 -74Z" fill="#F9C0B9" />
      <path d="M28 -74 L58 -44" stroke="#E07F76" strokeWidth={2} />
    </g>
  </g>
);

const Tesoura: React.FC = () => (
  <g transform="rotate(-20) translate(0 6)">
    {/* lâminas */}
    <g transform="rotate(-11)">
      <path d="M-9 4 L-3 -96 Q0 -100 3 -96 L9 4Z" fill="#C3CAD3" />
      <path d="M0 4 L0 -94" stroke="#E9EDF2" strokeWidth={2.5} />
    </g>
    <g transform="rotate(11)">
      <path d="M-9 4 L-3 -96 Q0 -100 3 -96 L9 4Z" fill="#AEB7C2" />
      <path d="M-2 4 L-2 -94" stroke="#D5DBE2" strokeWidth={2} />
    </g>
    {/* cabos */}
    <path d="M-6 6 L-22 40" stroke="#D9485A" strokeWidth={14} strokeLinecap="round" />
    <path d="M6 6 L22 40" stroke="#D9485A" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={-32} cy={62} rx={24} ry={30} fill="none" stroke="#E04F5F" strokeWidth={13} transform="rotate(18 -32 62)" />
    <ellipse cx={32} cy={62} rx={24} ry={30} fill="none" stroke="#E04F5F" strokeWidth={13} transform="rotate(-18 32 62)" />
    <circle cx={0} cy={4} r={8} fill="#7D8792" />
    <circle cx={-2} cy={2} r={3} fill="#C3CAD3" />
  </g>
);

const Cola: React.FC = () => (
  <g transform="rotate(34)">
    <rect x={-28} y={-40} width={56} height={136} rx={12} fill="#F3F2EF" />
    <rect x={10} y={-34} width={12} height={124} rx={6} fill="#E1DFD9" />
    <rect x={-20} y={-34} width={7} height={124} rx={3.5} fill="#FFFFFF" />
    <rect x={-28} y={14} width={56} height={34} fill="#7C5CC4" />
    <rect x={-30} y={-96} width={60} height={58} rx={12} fill="#7C5CC4" />
    {[-86, -76, -66, -56].map((y) => (
      <path key={y} d={`M-30 ${y} H30`} stroke="#6647AE" strokeWidth={2.5} />
    ))}
    <rect x={-22} y={-92} width={6} height={48} rx={3} fill="#A891E0" opacity={0.6} />
  </g>
);

const Linha: React.FC = () => (
  <g transform="rotate(-22)">
    <path d="M40 22 C78 30 88 70 60 92 C44 104 30 96 26 88" stroke="#D94F70" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <rect x={-50} y={-76} width={100} height={18} rx={5} fill="#D7AE84" />
    <rect x={-50} y={58} width={100} height={18} rx={5} fill="#D7AE84" />
    <rect x={-40} y={-58} width={80} height={116} fill="#D94F70" />
    {Array.from({ length: 19 }).map((_, i) => (
      <path key={i} d={`M-40 ${-55 + i * 6} H40`} stroke="#B8395A" strokeWidth={1.4} opacity={0.6} />
    ))}
    <rect x={-32} y={-58} width={9} height={116} fill="#F07A97" opacity={0.6} />
    <path d="M-50 -67 H50 M-50 67 H50" stroke="#BC8F63" strokeWidth={2} opacity={0.7} />
  </g>
);

const BotaoDesenho: React.FC<{ r: number; cor: string }> = ({ r, cor }) => {
  const f = r / 66;
  return (
    <g>
      <circle r={r} fill={cor} />
      <circle r={r * 0.86} fill="none" stroke="#FFFFFF" strokeWidth={5 * f} opacity={0.3} />
      <circle r={r * 0.72} fill="#000000" opacity={0.1} />
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([x, y], i) => (
        <circle key={i} cx={x * 17 * f} cy={y * 17 * f} r={7.5 * f} fill="#000000" opacity={0.55} />
      ))}
      <path d={`M${-r * 0.7} ${-r * 0.3} A${r * 0.78} ${r * 0.78} 0 0 1 ${-r * 0.2} ${-r * 0.75}`} stroke="#FFFFFF" strokeWidth={5 * f} fill="none" strokeLinecap="round" opacity={0.45} />
    </g>
  );
};
const Botao: React.FC = () => <BotaoDesenho r={68} cor={CORES_BOTAO[0]} />;

const Fita: React.FC = () => (
  <g>
    <path d="M44 30 L94 84 L84 90 L80 76 L68 96 L60 88 L34 44Z" fill="#E35D8A" />
    <circle r={78} fill="#E35D8A" />
    {[70, 62, 54, 46].map((r) => (
      <circle key={r} r={r} fill="none" stroke="#C9467A" strokeWidth={1.6} opacity={0.6} />
    ))}
    <circle r={38} fill="none" stroke="#D7AE84" strokeWidth={14} />
    <path d="M-52 -50 A72 72 0 0 1 10 -72" stroke="#F49AB9" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
  </g>
);

// ---------------------------------------------------------------- na base de corte (o cartão)

/** o cartão na base de corte (R = metade da altura da base) */
export const CARTAO = { w: 1.36, h: 1.6 } as const;

const CamadaPapel: React.FC<{ R: number }> = ({ R }) => {
  const w = CARTAO.w * R;
  const h = CARTAO.h * R;
  return (
    <g transform="rotate(-2)">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#F4978E" />
      <rect x={0} y={-h / 2} width={w / 2} height={h} rx={6} fill="#F7A69E" />
      <path d={`M0 ${-h / 2} V${h / 2}`} stroke="#E07F76" strokeWidth={3} />
    </g>
  );
};
const CamadaFita: React.FC<{ R: number }> = ({ R }) => {
  const w = CARTAO.w * R;
  const y = -0.32 * R;
  const k = R / 250;
  return (
    <g transform="rotate(-2)">
      <rect x={-w / 2 - 6} y={y - 16 * k} width={w + 12} height={32 * k} fill="#E35D8A" />
      <rect x={-w / 2 - 6} y={y - 16 * k} width={w + 12} height={7 * k} fill="#F49AB9" opacity={0.6} />
      <g transform={`translate(0 ${y}) scale(${k})`}>
        <path d="M0 0 C-30 -46 -84 -40 -76 -6 C-70 22 -30 14 0 0Z" fill="#D94A7B" />
        <path d="M0 0 C30 -46 84 -40 76 -6 C70 22 30 14 0 0Z" fill="#D94A7B" />
        <path d="M-4 4 L-34 70 L-22 66 L-16 80 L4 10Z" fill="#E35D8A" />
        <path d="M4 4 L34 70 L22 66 L16 80 L-4 10Z" fill="#E35D8A" />
        <circle r={14} fill="#C9467A" />
      </g>
    </g>
  );
};
const PedacoCola: React.FC<{ i: number; R: number }> = ({ R }) => (
  <g>
    <circle r={R * 0.06} fill="#FFFFFF" opacity={0.6} />
    <circle r={R * 0.06} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.85} />
    <circle cx={-R * 0.018} cy={-R * 0.018} r={R * 0.018} fill="#FFFFFF" opacity={0.95} />
  </g>
);
const PedacoBotao: React.FC<{ i: number; R: number }> = ({ i, R }) => <BotaoDesenho r={R * 0.1} cor={CORES_BOTAO[(i + 1) % CORES_BOTAO.length]} />;

export const ARTESANATO: Biblioteca<Id> = {
  papel: { Mesa: Papel, Camada: CamadaPapel },
  tesoura: { Mesa: Tesoura },
  cola: {
    Mesa: Cola,
    Pedaco: PedacoCola,
    pedacos: 4,
    posicoes: [
      [-0.54, -0.68, 0],
      [0.54, -0.7, 0],
      [-0.56, 0.66, 0],
      [0.52, 0.68, 0],
    ],
  },
  linha: { Mesa: Linha },
  botao: {
    Mesa: Botao,
    Pedaco: PedacoBotao,
    pedacos: 3,
    posicoes: [
      [-0.32, 0.36, 0],
      [0.0, 0.42, 0],
      [0.32, 0.36, 0],
    ],
  },
  fita: { Mesa: Fita, Camada: CamadaFita, espalha: 'esquerda' },
};
