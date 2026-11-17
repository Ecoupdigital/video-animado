import React, { createContext, useContext } from 'react';
import opcoes from './opcoes.json';
import { FAMILIA } from './fontes';
import { CORES } from './universo';

// Tema do modelo Neon retrô. Os tokens moram em opcoes.json:
//   paletas  os papéis de cor (céu, chão, sol nas duas pontas, faixas do sol, grade, letreiro em contorno e cheio,
//            destaque, botão, selo, texto do topo, card final), em 3 prontas: synth (a padrão, as cores da tela
//            de referência), por-do-sol e verde-azul. O neon troca todas as cores: céu, sol e grade também.
// As cores resolvidas vêm de componentes/universo.ts (CORES), gravado pelo --aplicar a partir das respostas: a base
// (uma das prontas) e os papéis trocados (a cor da marca no letreiro cheio, no destaque e no botão, ou a troca fina).
// Os componentes pegam a cor pelo papel com useNeon() (N.c.cheio, N.a('ceu', 0.8)), nunca por hex fixo. O _preview
// desenha as variantes com <ComNeon base="...">.

export type Paleta = typeof opcoes.paletas.synth;
export type PapelCor = keyof Paleta;
export type IdPronta = keyof typeof opcoes.paletas;

export const PRONTAS = Object.keys(opcoes.paletas) as IdPronta[];
export const PAPEIS = Object.keys(opcoes.paletas.synth) as PapelCor[];

// ---------------------------------------------------------------- cor

export const hexRgb = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export const comAlfa = (hex: string, alfa: number) => {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${alfa})`;
};
export const misturar = (a: string, b: string, t: number) => {
  const x = hexRgb(a);
  const y = hexRgb(b);
  return rgbHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
};

// ---------------------------------------------------------------- neon pronto

export type Neon = {
  /** a paleta base (synth, por-do-sol, verde-azul) */
  base: IdPronta;
  /** papéis de cor, já resolvidos */
  c: Paleta;
  /** famílias de fonte: texto (Inter) e mono */
  f: typeof FAMILIA;
  /** cor com transparência: a('ceu', 0.8) */
  a: (papel: PapelCor, alfa: number) => string;
  /** brilho de neon em volta de um texto ou de uma linha (CSS text-shadow ou drop-shadow), na cor do papel */
  brilho: (papel: PapelCor, forca?: number) => string;
};

export const montarNeon = (base: IdPronta, trocas: Partial<Paleta>): Neon => {
  const c = { ...(opcoes.paletas as Record<IdPronta, Paleta>)[base], ...trocas } as Paleta;
  const a = (papel: PapelCor, alfa: number) => comAlfa(c[papel], alfa);
  // o mesmo brilho da tela de referência (desfoque somado duas vezes ao traço): dois halos, um curto e um largo
  const brilho = (papel: PapelCor, forca = 1) => `0 0 ${Math.round(10 * forca)}px ${a(papel, 0.9)}, 0 0 ${Math.round(26 * forca)}px ${a(papel, 0.6)}`;
  return { base, c, f: FAMILIA, a, brilho };
};

const DO_UNIVERSO = montarNeon(CORES.base, CORES.cores);

const Contexto = createContext<Neon | null>(null);
/** O neon em uso: o do <ComNeon> mais próximo, senão o das respostas. */
export const useNeon = (): Neon => useContext(Contexto) ?? DO_UNIVERSO;
/** Troca a paleta só dentro dos filhos (folhas de conferência). Sem "base", fica a cor das respostas; com "trocas", a troca fina por cima. */
export const ComNeon: React.FC<{ base?: IdPronta; trocas?: Partial<Paleta>; children: React.ReactNode }> = ({ base, trocas, children }) => (
  <Contexto.Provider value={montarNeon(base ?? CORES.base, base ? trocas ?? {} : { ...CORES.cores, ...(trocas ?? {}) })}>{children}</Contexto.Provider>
);
