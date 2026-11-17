import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';

// Tempo e movimento do pixel. Todo tempo é em segundos do áudio final; a conversão para frame é só em S().

export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** segundos -> frame */
export const S = (seg: number) => Math.round(seg * FPS);
/** Área segura do Reels: nada importante nos 220 px do topo, nos 380 px de baixo nem a menos de 70 px das laterais. */
export const SEGURA = { topo: 220, baixo: 380, lado: 70 } as const;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
/** Tempo fixo (stills de conferência): desenha esse instante em vez do frame. */
export const TempoFixo = createContext<number | null>(null);
export const useT = () => {
  const frame = useCurrentFrame();
  const fixo = useContext(TempoFixo);
  return fixo ?? frame / FPS;
};
/** entra com mola (0 a 1, passa um pouco de 1) */
export const pop = (t: number, a: number, d = 0.22) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
/** entra suave (0 a 1) */
export const ent = (t: number, a: number, d = 0.3) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

/** Largura aproximada de um texto, em "em" (Inter): serve para encolher a fonte antes de passar da largura. */
export const largura = (txt: string, mono = false) => {
  if (mono) return txt.length * 0.6;
  let w = 0;
  for (const c of txt) {
    if (c === ' ') w += 0.26;
    else if ('iljtfrI.,:;!|\'"'.includes(c)) w += 0.32;
    else if ('mwMW@'.includes(c)) w += 0.86;
    else if (/[A-ZÀ-Ý0-9#%&]/.test(c)) w += 0.68;
    else w += 0.57;
  }
  return w;
};
/** maior fonte (até max) em que o texto cabe na largura dada, sem passar de min */
export const cabe = (txt: string, larguraPx: number, max: number, min: number, mono = false) =>
  Math.max(min, Math.min(max, Math.floor(larguraPx / Math.max(0.01, largura(txt, mono)))));

/** Área segura marcada (still de conferência). */
export const AreaSegura: React.FC = () => {
  const faixa = 'repeating-linear-gradient(45deg, rgba(255,40,80,0.28) 0 12px, rgba(255,40,80,0.12) 12px 24px)';
  const yb = H - SEGURA.baixo;
  return React.createElement(
    AbsoluteFill,
    { style: { pointerEvents: 'none' } },
    React.createElement('div', { style: { position: 'absolute', left: 0, right: 0, top: 0, height: SEGURA.topo, background: faixa } }),
    React.createElement('div', { style: { position: 'absolute', left: 0, right: 0, top: yb, bottom: 0, background: faixa } }),
    React.createElement('div', { style: { position: 'absolute', left: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa } }),
    React.createElement('div', { style: { position: 'absolute', right: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa } }),
    React.createElement('div', { style: { position: 'absolute', left: SEGURA.lado, top: SEGURA.topo, width: W - 2 * SEGURA.lado, height: yb - SEGURA.topo, border: '3px dashed rgba(255,40,80,0.9)', boxSizing: 'border-box' } }),
  );
};
