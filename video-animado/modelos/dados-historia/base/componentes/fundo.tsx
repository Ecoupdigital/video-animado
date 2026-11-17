import React from 'react';
import { AbsoluteFill } from 'remotion';
import { H, SEGURA, W } from './anima';
import { MapaDesenho } from './mapa';
import { useTema } from './tema';

// Fundo de cada tema, desenhado em código (nenhuma imagem de fora), igual à tela de referência do tema:
//   isometrico      degradê escuro de cima para baixo, com um brilho fraco
//   linha-do-tempo  papel claro com manchas leves
//   mapa            o mapa genérico (componentes/mapa.tsx) na tela inteira; fora da cena de rota, um véu do
//                   fundo por cima deixa o mapa apagado para o texto ler
//   jornal          cortiça com pontos claros e escuros (a cortiça não muda com a cor)

const Isometrico: React.FC = () => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${T.c.fundo} 0%, ${T.c.fundo2} 100%)` }}>
      <div style={{ position: 'absolute', left: 140, top: 820, width: 800, height: 600, borderRadius: '50%', background: `radial-gradient(closest-side, ${T.a('barra', 0.12)}, transparent)` }} />
    </AbsoluteFill>
  );
};

const LinhaDoTempo: React.FC = () => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.c.fundo }}>
      {[
        [180, 520, 520, 300],
        [760, 1260, 600, 360],
        [300, 1640, 700, 300],
      ].map(([x, y, w, h], i) => (
        <div key={i} style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: '50%', background: `radial-gradient(closest-side, ${T.c.fundo2}, transparent)` }} />
      ))}
    </AbsoluteFill>
  );
};

const Mapa: React.FC<{ veu: number }> = ({ veu }) => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.c.fundo }}>
      <MapaDesenho T={T} idClip={`clip-fundo-${T.id}`} />
      {veu > 0 ? <AbsoluteFill style={{ background: T.c.fundo, opacity: 0.72 * veu }} /> : null}
    </AbsoluteFill>
  );
};

const Jornal: React.FC = () => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.c.fundo }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={`cortica-${T.id}`} width={44} height={44} patternUnits="userSpaceOnUse">
            <rect width={44} height={44} fill={T.c.fundo} />
            <circle cx={10} cy={14} r={3.2} fill={T.c.fundo2} />
            <circle cx={32} cy={30} r={2.6} fill={T.c.enfeite} />
            <circle cx={24} cy={6} r={2} fill={T.c.fundo2} />
            <circle cx={4} cy={36} r={1.8} fill={T.c.enfeite} />
          </pattern>
          <radialGradient id={`borda-${T.id}`} cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.65" stopColor="#000000" stopOpacity={0} />
            <stop offset="1" stopColor="#000000" stopOpacity={0.22} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#cortica-${T.id})`} />
        <rect width={W} height={H} fill={`url(#borda-${T.id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** o fundo do tema em uso; "veu" (0 a 1) apaga o mapa fora da cena de rota */
export const Fundo: React.FC<{ veu?: number }> = ({ veu = 0 }) => {
  const T = useTema();
  if (T.id === 'mapa') return <Mapa veu={veu} />;
  if (T.id === 'linha-do-tempo') return <LinhaDoTempo />;
  if (T.id === 'jornal') return <Jornal />;
  return <Isometrico />;
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
