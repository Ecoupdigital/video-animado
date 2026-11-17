import React, { createContext, useContext } from 'react';
import opcoes from './opcoes.json';
import { FAMILIA } from './fontes';
import { TEMA } from './universo';

// Cores da Conversa no celular. Os tokens moram em opcoes.json: "papeis" (o que cada cor pinta), "paletas" (as 3
// prontas, claro, escuro e vivo, com os mesmos papéis; a primeira, claro, é a do modelo) e "papeis_da_marca" (o
// que a cor da marca troca: a bolha da direita, o texto dela e o destaque). A paleta própria do kit não lembra a
// de nenhum app de mensagem real. As cores escolhidas vêm de componentes/universo.ts (TEMA), gravado pelo --aplicar
// a partir das respostas (cores): a base (claro, escuro ou vivo) e as trocas já resolvidas. Os componentes nunca
// usam hex fixo: pegam a paleta com useTema(). O _preview desenha cada paleta pronta com <ComPaleta id="...">.

export type Paleta = typeof opcoes.paletas.claro;
export type PapelCor = keyof Paleta;
export type IdPaleta = string;
export const PALETAS = Object.keys(opcoes.paletas) as IdPaleta[];

export type Tema = {
  /** a paleta base (claro, escuro, vivo) */
  id: IdPaleta;
  nome: string;
  /** fundo escuro (pela luminância do chat) */
  escuro: boolean;
  c: Paleta;
  f: typeof FAMILIA;
  /** cor com transparência: a('celular', 0.35) */
  a: (papel: PapelCor, alfa: number) => string;
};

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
export const escurecer = (h: string, t: number) => misturar(h, '#000000', t);
export const clarear = (h: string, t: number) => misturar(h, '#FFFFFF', t);
export const luminancia = (h: string) => {
  const [r, g, b] = hexRgb(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contraste = (a: string, b: string) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
/** Cor de texto legível sobre um fundo: a preferida, se tiver contraste `minimo` (4,5; 3 para palavra grande em
 *  negrito e para ícone), senão quase preto ou branco. */
export const legivel = (fundo: string, preferida?: string, minimo = 4.5) => {
  if (preferida && contraste(preferida, fundo) >= minimo) return preferida;
  return contraste('#1D1D1F', fundo) >= contraste('#FFFFFF', fundo) ? '#1D1D1F' : '#FFFFFF';
};
/** Pior contraste do texto contra os fundos dados (o título lê sobre os dois lados do degradê). */
export const legivelEm = (fundos: string[], preferida: string, minimo = 4.5) => {
  if (fundos.every((f) => contraste(preferida, f) >= minimo)) return preferida;
  const escuro = fundos.every((f) => contraste('#1D1D1F', f) >= contraste('#FFFFFF', f));
  return escuro ? '#1D1D1F' : '#FFFFFF';
};

// ---------------------------------------------------------------- paleta pronta

const montar = (id: IdPaleta, comTrocas: boolean): Tema => {
  const paletas = opcoes.paletas as unknown as Record<string, Paleta>;
  const base = paletas[id] ?? paletas[PALETAS[0]];
  const trocas = (comTrocas ? TEMA.cores : {}) as Partial<Paleta>;
  const c = { ...base, ...trocas } as Paleta;
  return {
    id,
    nome: (opcoes.prontas as Record<string, { nome: string }>)[id]?.nome ?? id,
    escuro: luminancia(c.chat) < 0.3,
    c,
    f: FAMILIA,
    a: (papel, alfa) => comAlfa(c[papel], alfa),
  };
};

const PRONTOS: Record<string, Tema> = {};
/** A paleta do universo (a base escolhida com as trocas das respostas). */
export const temaDoUniverso = (): Tema => (PRONTOS['__universo'] ??= montar(TEMA.base, true));
/** Uma das 3 paletas prontas como vem no modelo (o still "paletas"). */
export const temaPronto = (id: IdPaleta): Tema => (PRONTOS[id] ??= montar(id, false));

const Contexto = createContext<Tema | null>(null);
/** A paleta em uso: a do <ComPaleta> mais próximo, senão a do universo. */
export const useTema = (): Tema => useContext(Contexto) ?? temaDoUniverso();
/** Sem id: a do universo. Com id: a paleta pronta, sem as trocas das respostas. */
export const ComPaleta: React.FC<{ id?: IdPaleta; children: React.ReactNode }> = ({ id, children }) => (
  <Contexto.Provider value={id ? temaPronto(id) : temaDoUniverso()}>{children}</Contexto.Provider>
);
