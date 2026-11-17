import React, { createContext, useContext } from 'react';
import { Easing, spring, useCurrentFrame } from 'remotion';
import larguras from './larguras.json';

// Tempo, movimento e medida de texto do modelo Neon retrô. Todo tempo é em segundos do áudio final; a conversão
// para frame é só em S(). Tudo é desenhado pelo frame (nenhuma animação CSS): o mesmo quadro sai sempre igual.

export const FPS = 30;
export const W = 1080;
export const H = 1920;
/** segundos do áudio final -> frame */
export const S = (seg: number) => Math.round(seg * FPS);
/** Área segura do Reels: nada importante nos 220 px do topo, nos 380 px de baixo nem a menos de 70 px das laterais. */
export const SEGURA = { topo: 220, baixo: 380, lado: 70 } as const;
export const Y_MAX = H - SEGURA.baixo;
/** linha do horizonte (o sol corta aqui; abaixo, o chão e a grade), como a tela de referência (560 de 960) */
export const HORIZONTE = 1120;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
/** Tempo fixo (stills de conferência): as cenas e o cenário desenham esse instante em vez do frame. */
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
/** sobe com mola */
export const pop = (t: number, at: number, dy = 50): React.CSSProperties => {
  if (t < at) return { opacity: 0 };
  const s = spr(t, at, { damping: 15, stiffness: 210 });
  return { opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * dy}px)` };
};
export const fadeOut = (t: number, at: number, d = 0.2) => 1 - ramp(t, at, d);
/** valor que conta de "de" até "ate" em d segundos a partir de "at", e para exatamente em "ate" */
export const contar = (t: number, at: number, ate: number, d = 1, de = 0) => (t >= at + d ? ate : de + (ate - de) * Easing.out(Easing.cubic)(ramp(t, at, d)));

// ---------------------------------------------------------------- medida de texto

/** Peso da fonte de texto: 800 (o que, card final) ou 900 (letreiro, preço, selo, botão). A mono tem largura fixa. */
export type Peso = 800 | 900 | 'mono';
const TABELA: Record<'t800' | 't900', Record<string, number>> = { t800: larguras.t800, t900: larguras.t900 };

/** Largura do texto em px (tabela medida no Chrome com as fontes do kit, componentes/larguras.json). */
export const largura = (texto: string, tamanho: number, peso: Peso, espacamento = 0) => {
  let soma = 0;
  for (const ch of texto) {
    if (peso === 'mono') soma += larguras.mono;
    else soma += TABELA[peso === 800 ? 't800' : 't900'][String(ch.charCodeAt(0))] ?? 0.72;
    soma += espacamento;
  }
  return soma * tamanho;
};

/** quebra as palavras em linhas pela largura medida; palavra maior que a linha é partida */
export const quebrar = (texto: string, tamanho: number, max: number, peso: Peso, espacamento = 0) => {
  const partir = (p: string) => {
    const pedacos: string[] = [];
    let atual = '';
    for (const ch of p) {
      if (atual && largura(atual + ch, tamanho, peso, espacamento) > max) {
        pedacos.push(atual);
        atual = ch;
      } else atual += ch;
    }
    if (atual) pedacos.push(atual);
    return pedacos;
  };
  const palavras = texto
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((p) => (largura(p.replace(/\*/g, ''), tamanho, peso, espacamento) <= max ? [p] : partir(p)));
  const linhas: string[] = [];
  let atual = '';
  for (const p of palavras) {
    const tenta = atual ? `${atual} ${p}` : p;
    if (atual && largura(tenta.replace(/\*/g, ''), tamanho, peso, espacamento) > max) {
      linhas.push(atual);
      atual = p;
    } else atual = tenta;
  }
  if (atual) linhas.push(atual);
  return linhas;
};

/** Maior tamanho (até "base", de 1 em 1 px, até "minimo") em que o texto cabe em "maxLinhas" linhas de "max" px. */
export const ajustar = (texto: string, base: number, max: number, maxLinhas: number, peso: Peso, minimo = 22, espacamento = 0) => {
  const limpo = texto.replace(/\*/g, '');
  for (let s = base; s >= minimo; s -= 1) {
    const linhas = quebrar(limpo, s, max, peso, espacamento);
    if (linhas.length <= maxLinhas && !linhas.some((l) => largura(l, s, peso, espacamento) > max)) return { s, linhas: quebrar(texto, s, max, peso, espacamento) };
  }
  return { s: minimo, linhas: quebrar(texto, minimo, max, peso, espacamento) };
};

/** Trechos de um texto com *destaque*: [texto, destaque?] */
export const trechos = (texto: string): [string, boolean][] => {
  const partes: [string, boolean][] = [];
  const re = /\*([^*]+)\*/g;
  let pos = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    if (m.index > pos) partes.push([texto.slice(pos, m.index), false]);
    partes.push([m[1], true]);
    pos = m.index + m[0].length;
  }
  if (pos < texto.length) partes.push([texto.slice(pos), false]);
  return partes;
};
export const semMarcas = (texto: string) => texto.replace(/\*/g, '');
