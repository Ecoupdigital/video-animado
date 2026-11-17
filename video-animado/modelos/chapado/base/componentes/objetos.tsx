import React from 'react';
import { COR } from './cores';

// Objetos comuns do modelo, desenhados em código. Cores por papel da paleta.
// Para pôr na mão de uma Pessoa: segurando="objeto" e objeto={<Caneca x={0} y={30} escala={0.7} />}
// (a origem 0,0 é o centro da mão direita).

/** Celular visto por trás, na mão do personagem (centro em x, y). */
export const CelularNaMao: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-30} y={-50} width={60} height={100} rx={12} fill="#2B2B2B" />
    <rect x={-27} y={-47} width={54} height={94} rx={10} fill="#3A3A3A" />
    <circle cx={-14} cy={-33} r={6} fill="#1C1C1C" />
    <circle cx={-14} cy={-33} r={2.5} fill="#5A6B7A" />
  </g>
);

/** Folha de papel com linhas (receita, lista, bilhete). Centro em (x, y). */
export const Papel: React.FC<{ x: number; y: number; escala?: number; angulo?: number; linhas?: number }> = ({ x, y, escala = 1, angulo = -8, linhas = 4 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angulo}) scale(${escala})`}>
    <rect x={-34} y={-46} width={68} height={92} rx={6} fill={COR.branco} />
    <rect x={-34} y={-46} width={68} height={14} rx={6} fill={COR.apoio2Claro} />
    {Array.from({ length: linhas }, (_, i) => (
      <rect key={i} x={-24} y={-22 + i * 14} width={i === linhas - 1 ? 30 : 48} height={5} rx={2.5} fill={COR.fundo3} />
    ))}
  </g>
);

/** Caneca com fumaça (a fumaça sobe com o frame). Centro da base em (x, y). */
export const Caneca: React.FC<{ x: number; y: number; escala?: number; frame?: number }> = ({ x, y, escala = 1, frame = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {[-14, 2, 18].map((dx, i) => {
      const fase = ((frame / 30 + i * 0.4) % 1.2) / 1.2;
      return (
        <path key={i} d={`M ${dx} ${-70 - fase * 40} q 10 -14 0 -28 q -10 -14 0 -28`} stroke="#B9A99A" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8 * (1 - fase)} />
      );
    })}
    <path d="M 30 -48 q 26 0 26 20 q 0 20 -26 20" stroke={COR.destaqueProfundo} strokeWidth={9} fill="none" />
    <rect x={-34} y={-62} width={68} height={62} rx={12} fill={COR.destaque} />
    <rect x={-34} y={-62} width={68} height={12} rx={6} fill="#5A3A2A" />
  </g>
);

/** Sacola de loja (faixa na cor de destaque). Centro da base em (x, y). */
export const Sacola: React.FC<{ x: number; y: number; escala?: number; cor?: string }> = ({ x, y, escala = 1, cor = COR.fundo }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <path d="M -24 -120 q 0 -40 24 -40 q 24 0 24 40" stroke={COR.apoioEscuro} strokeWidth={7} fill="none" />
    <rect x={-60} y={-122} width={120} height={122} rx={8} fill={cor} />
    <rect x={-60} y={-76} width={120} height={20} fill={COR.destaque} />
  </g>
);

/** Prato fundo branco visto de lado, com arroz, feijão e salada. `cheio` deixa a comida em montanha. Centro da base em (x, y). */
export const Prato: React.FC<{ x: number; y: number; escala?: number; cheio?: boolean }> = ({ x, y, escala = 1, cheio = false }) => {
  const h = cheio ? 2.1 : 1;
  // montinho: meia elipse apoiada na borda do prato (y -26), nunca desce abaixo dela
  const monte = (cx: number, rx: number, ry: number, cor: string) => <path d={`M ${cx - rx} -26 A ${rx} ${ry} 0 0 1 ${cx + rx} -26 Z`} fill={cor} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      {monte(-26, 40, 18 * h, '#F7F1E4')}
      {monte(20, 32, 14 * h, '#5A3A2A')}
      <ellipse cx={12} cy={-26 - 10 * h} rx={9} ry={4} fill="#6E4A36" />
      {monte(52, 22, 12 * h, COR.apoio2)}
      {monte(58, 12, 8 * h, COR.acerto)}
      <ellipse cx={0} cy={-26} rx={80} ry={10} fill="#E9DCCB" />
      <path d="M -80 -26 Q -70 0 -30 0 L 30 0 Q 70 0 80 -26 Z" fill={COR.branco} />
      <path d="M -80 -26 Q -70 0 -30 0 L -10 0 Q -50 -2 -62 -24 Z" fill="#EADFD0" />
      <rect x={-34} y={-2} width={68} height={6} rx={3} fill="#DCD0BF" />
    </g>
  );
};

/** Mala de rodinha fechada. Base no centro (x, y): as rodinhas tocam o chão em y. */
export const Mala: React.FC<{ x: number; y: number; escala?: number; cor?: string }> = ({ x, y, escala = 1, cor = COR.detalhe }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-34} y={-330} width={10} height={90} rx={4} fill="#6A6A6A" />
    <rect x={24} y={-330} width={10} height={90} rx={4} fill="#6A6A6A" />
    <rect x={-40} y={-338} width={80} height={16} rx={8} fill="#4A4A4A" />
    <rect x={-90} y={-250} width={180} height={236} rx={26} fill={cor} />
    <rect x={-48} y={-232} width={10} height={200} rx={5} fill="rgba(0,0,0,0.10)" />
    <rect x={-5} y={-232} width={10} height={200} rx={5} fill="rgba(0,0,0,0.10)" />
    <rect x={38} y={-232} width={10} height={200} rx={5} fill="rgba(0,0,0,0.10)" />
    <rect x={-30} y={-262} width={60} height={16} rx={8} fill={COR.apoioEscuro} />
    <circle cx={-62} cy={-10} r={10} fill="#4A4A4A" />
    <circle cx={62} cy={-10} r={10} fill="#4A4A4A" />
  </g>
);

/** Objetos genéricos de pia de banheiro (o cenário Casa, cômodo banheiro, recebe a lista em objetosNaPia). */
export type ObjetoPia = 'copo-escova' | 'frasco' | 'pote' | 'sabonete' | 'pasta';
export const OBJETOS_PIA: ObjetoPia[] = ['copo-escova', 'frasco', 'pote', 'sabonete', 'pasta'];

/** Um objeto de pia com a base apoiada em (x, y). */
export const ObjetoDePia: React.FC<{ tipo: ObjetoPia; x: number; y: number; escala?: number; angulo?: number }> = ({ tipo, x, y, escala = 1, angulo = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angulo}) scale(${escala})`}>
    {tipo === 'copo-escova' && (
      <g>
        <rect x={-6} y={-96} width={8} height={70} rx={4} fill={COR.destaque} transform="rotate(-10 -2 -30)" />
        <rect x={-10} y={-104} width={12} height={20} rx={4} fill={COR.branco} transform="rotate(-10 -2 -30)" />
        <rect x={4} y={-90} width={8} height={64} rx={4} fill={COR.detalhe} transform="rotate(12 8 -30)" />
        <rect x={2} y={-98} width={12} height={20} rx={4} fill={COR.branco} transform="rotate(12 8 -30)" />
        <path d="M -24 -52 L 24 -52 L 20 0 L -20 0 Z" fill={COR.apoio2Claro} />
        <rect x={-24} y={-56} width={48} height={8} rx={4} fill={COR.apoio2} />
      </g>
    )}
    {tipo === 'frasco' && (
      <g>
        <rect x={-22} y={-72} width={44} height={72} rx={12} fill={COR.apoio2} />
        <rect x={-14} y={-50} width={28} height={26} rx={5} fill={COR.branco} opacity={0.75} />
        <rect x={-7} y={-88} width={14} height={18} rx={3} fill={COR.texto} />
        <rect x={-7} y={-96} width={26} height={8} rx={4} fill={COR.texto} />
      </g>
    )}
    {tipo === 'pote' && (
      <g>
        <rect x={-26} y={-50} width={52} height={50} rx={12} fill={COR.detalhe} />
        <rect x={-29} y={-62} width={58} height={16} rx={6} fill={COR.apoioEscuro} />
      </g>
    )}
    {tipo === 'sabonete' && (
      <g>
        <ellipse cx={0} cy={-6} rx={34} ry={9} fill={COR.branco} />
        <rect x={-22} y={-26} width={44} height={20} rx={10} fill={COR.fundo3} />
        <circle cx={18} cy={-34} r={5} fill={COR.branco} opacity={0.9} />
        <circle cx={26} cy={-44} r={3.5} fill={COR.branco} opacity={0.9} />
      </g>
    )}
    {tipo === 'pasta' && (
      <g>
        <rect x={-9} y={-14} width={18} height={14} rx={3} fill={COR.texto} />
        <path d="M -14 -14 L 14 -14 L 22 -84 L -22 -84 Z" fill={COR.branco} />
        <rect x={-22} y={-90} width={44} height={8} rx={2} fill="#E0E0E0" />
        <rect x={-14} y={-60} width={28} height={10} rx={5} fill={COR.destaque} />
      </g>
    )}
  </g>
);
