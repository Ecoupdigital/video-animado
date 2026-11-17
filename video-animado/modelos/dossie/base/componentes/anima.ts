import React, { createContext, useContext } from 'react';
import { Easing, spring, useCurrentFrame } from 'remotion';

// Tempo e movimento do dossiê. Todo tempo é em segundos do áudio final; a conversão para frame é só em S().

export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** segundos do áudio final -> frame */
export const S = (seg: number) => Math.round(seg * FPS);
/** Área segura do Reels: nada importante nos 220 px do topo, nos 380 px de baixo nem a menos de 70 px das laterais. */
export const SEGURA = { topo: 220, baixo: 380, lado: 70 } as const;
export const Y_MAX = H - SEGURA.baixo;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
/** Tempo fixo (stills de conferência): as cenas e o fundo desenham esse instante em vez do frame. */
export const TempoFixo = createContext<number | null>(null);
/** tempo atual em segundos (o fixo, se houver) */
export const useT = () => {
  const frame = useCurrentFrame();
  const fixo = useContext(TempoFixo);
  return fixo ?? frame / FPS;
};
export const ramp = (t: number, a: number, d = 0.4) => Math.max(0, Math.min(1, (t - a) / d));
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const spr = (t: number, at: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({ frame: Math.round((t - at) * FPS), fps: FPS, config: { damping: cfg.damping ?? 14, stiffness: cfg.stiffness ?? 200, mass: cfg.mass ?? 0.6 } });

/** entra desfocado e foca */
export const focus = (t: number, at: number, d = 0.4): React.CSSProperties => {
  if (t < at) return { opacity: 0 };
  const p = eo(ramp(t, at, d));
  return { opacity: p, filter: p < 1 ? `blur(${(1 - p) * 16}px)` : undefined, transform: `scale(${1.08 - 0.08 * p})` };
};
/** sobe com mola */
export const pop = (t: number, at: number, dy = 50): React.CSSProperties => {
  if (t < at) return { opacity: 0 };
  const s = spr(t, at, { damping: 15, stiffness: 210 });
  return { opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * dy}px)` };
};
export const fadeOut = (t: number, at: number, d = 0.2) => 1 - ramp(t, at, d);
/** valor que conta de "de" até "ate" em d segundos a partir de "at" */
export const contar = (t: number, at: number, ate: number, d = 1, de = 0) => de + (ate - de) * Easing.out(Easing.cubic)(ramp(t, at, d));
/** ponto numa curva de Bézier cúbica (u de 0 a 1) */
export const bezier = (p0: number[], p1: number[], p2: number[], p3: number[], u: number) =>
  [0, 1].map((k) => (1 - u) ** 3 * p0[k] + 3 * (1 - u) ** 2 * u * p1[k] + 3 * (1 - u) * u * u * p2[k] + u ** 3 * p3[k]);
/** tamanho de fonte que cabe: encolhe com o número de letras a partir de "cabe" letras */
export const caber = (texto: string, tamanho: number, cabe: number, minimo = tamanho * 0.45) => {
  const n = texto.length;
  return n <= cabe ? tamanho : Math.max(minimo, tamanho * Math.sqrt(cabe / n));
};
