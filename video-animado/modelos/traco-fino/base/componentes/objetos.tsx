import React from 'react';
import { COR, TRACO } from './cores';
import { FONTE_MAO } from './fontes';
import { MARCA } from './universo';

// Objetos do universo, no mesmo traço dos personagens. Coordenadas: centro da base em (x, y), salvo quando dito.

/** Celular visto por trás, nas mãos (centro em x, y). */
export const CelularDeCostas: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-17} y={-30} width={34} height={60} rx={7} fill="#2A2D31" stroke={COR.tinta} strokeWidth={TRACO} />
    <circle cx={-8} cy={-20} r={3.5} fill="#15171A" />
  </g>
);

/** Celular com a tela virada para quem está ao lado (centro em x, y): tela clara com um ponto na cor da marca. */
export const CelularMostrando: React.FC<{ x: number; y: number; escala?: number; angulo?: number }> = ({ x, y, escala = 1, angulo = -12 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angulo}) scale(${escala})`}>
    <rect x={-17} y={-30} width={34} height={60} rx={7} fill="#2A2D31" stroke={COR.tinta} strokeWidth={TRACO} />
    <rect x={-13} y={-25} width={26} height={50} rx={4} fill="#F7F7F7" />
    <circle cx={0} cy={-8} r={7} fill={MARCA?.cor ?? COR.destaque} />
    <rect x={-9} y={6} width={18} height={4} rx={2} fill="#DDDDDD" />
    <rect x={-9} y={14} width={12} height={4} rx={2} fill="#DDDDDD" />
  </g>
);

/** Caderno quadriculado aberto nas mãos, com a costura no meio (centro em x, y). */
export const CadernoNaMao: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <rect x={-40} y={-26} width={80} height={54} rx={4} fill={COR.caderno} stroke={COR.tinta} strokeWidth={TRACO} transform="rotate(-8)" />
    {[-14, -4, 6, 16].map((yy) => (
      <path key={yy} d={`M -32 ${yy} L 32 ${yy - 9}`} stroke={COR.quadricula} strokeWidth={1.6} />
    ))}
    <path d="M 0 -30 L 2 30" stroke={COR.tinta} strokeWidth={TRACO} transform="rotate(-8)" />
  </g>
);

/**
 * Caixa de papelão aberta, com coisas dentro. `cheia` de 0 a 1 (vai esvaziando ao longo da série);
 * `rotulo` escreve à mão na frente (ou nada).
 */
export const Caixa: React.FC<{ x: number; y: number; escala?: number; cheia?: number; aberta?: boolean; rotulo?: string | null }> = ({ x, y, escala = 1, cheia = 1, aberta = true, rotulo = null }) => {
  const coisas = Math.round(Math.max(0, Math.min(1, cheia)) * 4);
  const cores = [COR.papel, COR.olivaClara, '#E9C9B8', COR.ceuDia];
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      {aberta && (
        <>
          <path d="M -90 -96 L -112 -128 L -40 -128 L -30 -96 Z" fill={COR.madeiraClara} stroke={COR.tinta} strokeWidth={TRACO} strokeLinejoin="round" />
          <path d="M 90 -96 L 112 -128 L 40 -128 L 30 -96 Z" fill={COR.madeiraClara} stroke={COR.tinta} strokeWidth={TRACO} strokeLinejoin="round" />
        </>
      )}
      {Array.from({ length: coisas }, (_, i) => (
        <path
          key={i}
          d={`M ${-70 + i * 36} -96 q 0 -${22 + (i % 2) * 8} 18 -${22 + (i % 2) * 8} q 18 0 18 ${22 + (i % 2) * 8} Z`}
          fill={cores[i % cores.length]}
          stroke={COR.tinta}
          strokeWidth={TRACO * 0.8}
        />
      ))}
      <rect x={-90} y={-96} width={180} height={96} fill={COR.madeiraClara} stroke={COR.tinta} strokeWidth={TRACO} />
      <path d="M -90 -96 L 90 -96" stroke={COR.madeira} strokeWidth={5} />
      {rotulo && (
        <text x={0} y={-36} textAnchor="middle" fontFamily={FONTE_MAO} fontWeight={700} fontSize={Math.min(34, 300 / Math.max(1, rotulo.length * 0.5))} fill={COR.tinta} transform="rotate(-3)">
          {rotulo}
        </text>
      )}
    </g>
  );
};

/** Vaso com planta (costela-de-adão simplificada). */
export const Planta: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {[
      [-50, -170, -30],
      [40, -190, 25],
      [-10, -230, -5],
      [60, -120, 50],
      [-70, -110, -55],
    ].map(([dx, dy, a], i) => (
      <g key={i}>
        <path d={`M 0 -70 Q ${dx * 0.4} ${dy * 0.6} ${dx} ${dy}`} stroke={COR.tinta} strokeWidth={TRACO} fill="none" />
        <ellipse cx={dx} cy={dy} rx={34} ry={22} transform={`rotate(${a} ${dx} ${dy})`} fill={COR.oliva} stroke={COR.tinta} strokeWidth={TRACO} />
      </g>
    ))}
    <path d="M -46 -80 L 46 -80 L 36 0 L -36 0 Z" fill={COR.linho} stroke={COR.tinta} strokeWidth={TRACO} strokeLinejoin="round" />
  </g>
);

/** Caneca com fumaça (a fumaça sobe com o frame). */
export const Caneca: React.FC<{ x: number; y: number; escala?: number; frame?: number }> = ({ x, y, escala = 1, frame = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {[-8, 6].map((dx, i) => {
      const fase = ((frame / 30 + i * 0.5) % 1.4) / 1.4;
      return <path key={i} d={`M ${dx} ${-46 - fase * 30} q 7 -10 0 -20 q -7 -10 0 -20`} stroke={COR.tintaSuave} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.7 * (1 - fase)} />;
    })}
    <path d="M 20 -32 q 16 0 16 12 q 0 12 -16 12" stroke={COR.tinta} strokeWidth={TRACO} fill="none" />
    <rect x={-22} y={-40} width={44} height={40} rx={6} fill={COR.papel} stroke={COR.tinta} strokeWidth={TRACO} />
  </g>
);

/** Brinquedo jogado no chão: carrinho. */
export const Carrinho: React.FC<{ x: number; y: number; escala?: number; angulo?: number }> = ({ x, y, escala = 1, angulo = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${angulo}) scale(${escala})`}>
    <path d="M -34 -12 L -34 -26 Q -20 -44 4 -44 L 20 -44 L 34 -26 L 34 -12 Z" fill={COR.petroleoClaro} stroke={COR.tinta} strokeWidth={TRACO} strokeLinejoin="round" />
    <circle cx={-20} cy={-10} r={10} fill={COR.tinta} />
    <circle cx={20} cy={-10} r={10} fill={COR.tinta} />
  </g>
);

/** Bloquinhos de montar empilhados. */
export const Blocos: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {[
      [-30, -30, COR.olivaClara],
      [4, -30, COR.ceuDia],
      [-14, -62, COR.madeiraClara],
    ].map(([bx, by, c], i) => (
      <rect key={i} x={bx as number} y={by as number} width={30} height={30} rx={3} fill={c as string} stroke={COR.tinta} strokeWidth={TRACO} />
    ))}
  </g>
);

/** Pilha de livros deitados (prateleira, mesa). Base em (x, y). */
export const Livros: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {[
      [-50, -22, 100, COR.petroleo],
      [-42, -42, 86, COR.oliva],
      [-46, -60, 90, COR.coralProfundo],
    ].map(([bx, by, w, c], i) => (
      <rect key={i} x={bx as number} y={by as number} width={w as number} height={20} rx={3} fill={c as string} stroke={COR.tinta} strokeWidth={TRACO} />
    ))}
  </g>
);

/** Relógio de parede (ponteiros num horário fixo). Centro em (x, y). */
export const Relogio: React.FC<{ x: number; y: number; raio?: number; horas?: number; minutos?: number }> = ({ x, y, raio = 46, horas = 10, minutos = 10 }) => {
  const am = (minutos / 60) * 360 - 90;
  const ah = ((horas % 12) / 12) * 360 + (minutos / 60) * 30 - 90;
  const p = (ang: number, r: number) => [x + Math.cos((ang * Math.PI) / 180) * r, y + Math.sin((ang * Math.PI) / 180) * r];
  const [mx, my] = p(am, raio * 0.78);
  const [hx, hy] = p(ah, raio * 0.52);
  return (
    <g>
      <circle cx={x} cy={y} r={raio} fill={COR.papel} stroke={COR.tinta} strokeWidth={TRACO * 1.4} />
      <path d={`M ${x} ${y} L ${mx} ${my} M ${x} ${y} L ${hx} ${hy}`} stroke={COR.tinta} strokeWidth={TRACO * 1.4} strokeLinecap="round" />
      <circle cx={x} cy={y} r={4} fill={COR.tinta} />
    </g>
  );
};
