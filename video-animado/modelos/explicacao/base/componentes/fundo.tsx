import React from 'react';
import { AbsoluteFill } from 'remotion';
import { H, SEGURA, W } from './anima';
import { FiltrosTema } from './pecas';
import { useTema } from './tema';

// Fundo de cada tema, desenhado em código (nenhuma imagem de fora), igual à tela de referência do tema:
//   quadro    papel com grade de 60 px e a caneta no canto de baixo
//   lousa     moldura de madeira, lousa com manchas de giz, bandeja com o giz e o apagador
//   post-its  parede e o quadro branco com borda (as colunas são da cena "colunas")
//   tela-app  degradê na diagonal com duas manchas de luz
// O que fica abaixo de y 1540 (caneta, bandeja, borda do quadro) é só fundo: nada de texto ali.

const Quadro: React.FC = () => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.c.fundo }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={`grade-${T.id}`} width={60} height={60} patternUnits="userSpaceOnUse">
            <path d="M60 0H0V60" fill="none" stroke={T.c.fundo2} strokeWidth={2} />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#grade-${T.id})`} />
        <g transform="rotate(-35 820 1702)">
          <rect x={820} y={1680} width={220} height={44} rx={12} fill={T.c.moldura} />
          <rect x={796} y={1680} width={44} height={44} rx={8} fill={T.c.moldura2} />
          <path d="M796 1690 L760 1702 L796 1714 Z" fill={T.c.moldura2} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Lousa: React.FC = () => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.c.moldura }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`borda-${T.id}`} cx="0.5" cy="0.45" r="0.75">
            <stop offset="0.6" stopColor={T.c.fundo2} stopOpacity={0} />
            <stop offset="1" stopColor={T.c.fundo2} stopOpacity={0.85} />
          </radialGradient>
        </defs>
        {/* veios da madeira */}
        {[14, 22, 1830, 1890].map((y, i) => (
          <path key={i} d={`M0 ${y} C 300 ${y + 6}, 700 ${y - 6}, ${W} ${y + 3}`} stroke={T.a('moldura2', 0.6)} strokeWidth={3} fill="none" />
        ))}
        <rect x={36} y={36} width={W - 72} height={1760} rx={12} fill={T.c.fundo} />
        <rect x={36} y={36} width={W - 72} height={1760} rx={12} fill={`url(#borda-${T.id})`} />
        <rect x={36} y={36} width={W - 72} height={1760} filter={`url(#mancha-${T.id})`} />
        {/* pó de giz de apagado */}
        {[
          [300, 760, 260, 70, -8],
          [760, 1180, 220, 60, 6],
          [420, 1480, 300, 50, -3],
        ].map(([cx, cy, rx, ry, r], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={T.a('traco', 0.035)} transform={`rotate(${r} ${cx} ${cy})`} />
        ))}
        {/* bandeja, giz e apagador */}
        <rect x={0} y={1796} width={W} height={124} fill={T.c.moldura2} />
        <rect x={0} y={1796} width={W} height={20} fill={T.a('moldura', 0.9)} />
        <rect x={600} y={1752} width={180} height={44} rx={20} fill={T.c.traco} />
        <rect x={820} y={1736} width={180} height={60} rx={10} fill={T.c.fundo2} />
        <rect x={820} y={1736} width={180} height={24} rx={8} fill={T.c.suave} />
      </svg>
    </AbsoluteFill>
  );
};

const PostIts: React.FC = () => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.c.fundo }}>
      <div style={{ position: 'absolute', left: 40, top: 560, width: 1000, height: 1250, borderRadius: 20, background: T.c.fundo2, border: `6px solid ${T.c.moldura}`, boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
      {[110, 970].map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x - 14, top: 540, width: 28, height: 28, borderRadius: 14, background: T.c.moldura2 }} />
      ))}
    </AbsoluteFill>
  );
};

const TelaApp: React.FC = () => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${T.c.fundo} 0%, ${T.c.fundo2} 100%)` }}>
      <div style={{ position: 'absolute', left: -240, top: 1150, width: 760, height: 760, borderRadius: 380, background: T.a('superficie', 0.06) }} />
      <div style={{ position: 'absolute', left: 700, top: -160, width: 560, height: 560, borderRadius: 280, background: T.a('superficie', 0.07) }} />
    </AbsoluteFill>
  );
};

/** o fundo do tema em uso, com os filtros do tema (textura do giz) */
export const Fundo: React.FC = () => {
  const T = useTema();
  const F = T.id === 'lousa' ? Lousa : T.id === 'post-its' ? PostIts : T.id === 'tela-app' ? TelaApp : Quadro;
  return (
    <>
      <FiltrosTema />
      <F />
    </>
  );
};

/** área segura do Reels marcada (stills de conferência) */
export const AreaSegura: React.FC = () => {
  const faixa = 'repeating-linear-gradient(45deg, rgba(255,40,80,0.28) 0 12px, rgba(255,40,80,0.12) 12px 24px)';
  const yb = H - SEGURA.baixo;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SEGURA.topo, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: yb, bottom: 0, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', right: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', left: SEGURA.lado, top: SEGURA.topo, width: W - 2 * SEGURA.lado, height: yb - SEGURA.topo, border: '3px dashed rgba(255,40,80,0.9)', boxSizing: 'border-box' }} />
    </AbsoluteFill>
  );
};
