import React, { createContext, useContext } from 'react';
import opcoes from './opcoes.json';
import { FAMILIA } from './fontes';
import { CORES, MESA } from './universo';

// Tema do modelo Mesa vista de cima. Os tokens moram em opcoes.json:
//   paletas      os papéis que a resposta de cores troca (destaque, faixa, etiqueta, card final), em 3 prontas
//                (ambar, a padrão com as cores da tela de referência, menta e vinho) que valem nas 3 superfícies
//   superficies  o material da mesa (madeira, mármore, pano liso), com as cores fixas: nunca mudam com a cor
//   grupos       os 3 grupos de itens (cozinha, beleza, artesanato), com a peça central e a amostra de cada um
// A superfície, o grupo e as cores resolvidas vêm de componentes/universo.ts (MESA e CORES), gravado pelo
// --aplicar a partir das respostas. Os componentes pegam a cor pelo papel com useMesa() (M.c.destaque), nunca
// por hex fixo; o material sai de M.m (cores da superfície) e a sombra de M.sombra(). O _preview desenha
// as variantes com <ComMesa superficie="..." grupo="..." base="...">.

export type Paleta = typeof opcoes.paletas.ambar;
export type PapelCor = keyof Paleta;
export type IdPronta = keyof typeof opcoes.paletas;
export type IdSuperficie = keyof typeof opcoes.superficies;
export type IdGrupo = keyof typeof opcoes.grupos;
type Grupos = typeof opcoes.grupos;
/** código de cada item da biblioteca (os 3 grupos) */
export type IdItem = { [G in IdGrupo]: keyof Grupos[G]['itens'] }[IdGrupo];
export type NoCentro = 'camada' | 'pedacos' | null;
export type InfoItem = { id: IdItem; grupo: IdGrupo; nome: string; mesa: string; noCentro: NoCentro };

export const PRONTAS = Object.keys(opcoes.paletas) as IdPronta[];
export const SUPERFICIES = Object.keys(opcoes.superficies) as IdSuperficie[];
export const GRUPOS = Object.keys(opcoes.grupos) as IdGrupo[];
export const ITENS: InfoItem[] = GRUPOS.flatMap((g) =>
  Object.entries(opcoes.grupos[g].itens as Record<string, { nome: string; mesa: string; no_centro?: string }>).map(([id, v]) => ({
    id: id as IdItem,
    grupo: g,
    nome: v.nome,
    mesa: v.mesa,
    noCentro: (v.no_centro ?? null) as NoCentro,
  })),
);
export const infoItem = (id: IdItem): InfoItem => ITENS.find((i) => i.id === id) ?? ITENS[0];
export const itensDo = (g: IdGrupo) => ITENS.filter((i) => i.grupo === g);

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

// ---------------------------------------------------------------- mesa pronta

export type Mesa = {
  superficie: IdSuperficie;
  grupo: IdGrupo;
  /** nome da superfície (Madeira, Mármore, Pano liso) */
  nomeSuperficie: string;
  /** papéis que a resposta de cores troca, já resolvidos */
  c: Paleta;
  /** famílias de fonte: texto (Inter) e mono */
  f: typeof FAMILIA;
  /** cores do material da superfície (fixas) */
  m: Record<string, string>;
  /** sombra dos itens, na cor da superfície (fator multiplica a opacidade) */
  sombra: (fator?: number) => string;
  /** opacidade da sombra da superfície (madeira mais forte, mármore mais leve) */
  sombraAlfa: number;
  /** cor com transparência: a('faixa', 0.9) */
  a: (papel: PapelCor, alfa: number) => string;
};

type Superficie = { nome: string; cores: Record<string, string>; sombra_alfa: number };

export const montarMesa = (superficie: IdSuperficie, grupo: IdGrupo, base: IdPronta, trocas: Partial<Paleta>): Mesa => {
  const s = (opcoes.superficies as Record<IdSuperficie, Superficie>)[superficie];
  const c = { ...(opcoes.paletas as Record<IdPronta, Paleta>)[base], ...trocas } as Paleta;
  return {
    superficie,
    grupo,
    nomeSuperficie: s.nome,
    c,
    f: FAMILIA,
    m: s.cores,
    sombra: (fator = 1) => comAlfa(s.cores.sombra, Math.min(1, s.sombra_alfa * fator)),
    sombraAlfa: s.sombra_alfa,
    a: (papel, alfa) => comAlfa(c[papel], alfa),
  };
};

const DO_UNIVERSO = montarMesa(MESA.superficie, MESA.grupo, CORES.base, CORES.cores);

const Contexto = createContext<Mesa | null>(null);
/** A mesa em uso: a do <ComMesa> mais próximo, senão a das respostas. */
export const useMesa = (): Mesa => useContext(Contexto) ?? DO_UNIVERSO;
/** Troca superfície, grupo ou paleta só dentro dos filhos (folhas de conferência). Sem "base", fica a cor das respostas. */
export const ComMesa: React.FC<{ superficie?: IdSuperficie; grupo?: IdGrupo; base?: IdPronta; children: React.ReactNode }> = ({ superficie, grupo, base, children }) => (
  <Contexto.Provider value={montarMesa(superficie ?? MESA.superficie, grupo ?? MESA.grupo, base ?? CORES.base, base ? {} : CORES.cores)}>{children}</Contexto.Provider>
);
