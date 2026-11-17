import React, { createContext, useContext } from 'react';
import opcoes from './opcoes.json';
import { FAMILIA } from './fontes';
import { TEMA } from './universo';

// Tema da família Explicação. Os tokens moram em opcoes.json: "paletas" (os mesmos papéis de cor nos 4 temas),
// "prontas" (3 paletas prontas por tema) e "estilos" (letra de mão no título, giz, quanto o traço treme, a cena
// de capa e os papéis derivados). Quatro temas:
//   quadro    papel quadriculado, traço preto de caneta e um destaque
//   lousa     lousa com giz, moldura de madeira e bandeja (troca só a cor da lousa e o giz de destaque)
//   post-its  parede, quadro branco com colunas e post-its coloridos
//   tela-app  degradê, selo de passo e janela de painel genérica com cursor
// O tema escolhido e as cores trocadas vêm de componentes/universo.ts (TEMA), gravado pelo --aplicar a partir
// das respostas (tema e cores). As trocas valem só para o tema escolhido. Os componentes nunca usam hex fixo:
// pegam o tema com useTema(). O _preview desenha os 4 temas com <ComTema id="...">.

export type Paleta = typeof opcoes.paletas.quadro;
export type PapelCor = keyof Paleta;
export type IdTema = 'quadro' | 'lousa' | 'post-its' | 'tela-app';
export const TEMAS = opcoes.temas as IdTema[];

export type Tema = {
  id: IdTema;
  nome: string;
  escuro: boolean;
  c: Paleta;
  /** famílias de fonte: mão (Caveat), texto (Inter), mono e a do título deste tema */
  f: { mao: string; texto: string; mono: string; titulo: string };
  /** título em letra de mão (quadro e lousa) ou em Inter pesada (post-its e tela de app) */
  tituloMao: boolean;
  pesoTitulo: number;
  /** traço de giz (filtro de textura) */
  giz: boolean;
  /** quanto o traço treme: 1 caneta, 0,7 marcador, 0 traço limpo de tela */
  rabisco: number;
  /** cena que vira a capa do tema (still tema-<id>) */
  capa: string;
  /** cor com transparência: a('destaque', 0.3) */
  a: (papel: PapelCor, alfa: number) => string;
  /** filtro CSS do giz (url(#...)) ou undefined */
  filtro: string | undefined;
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

// ---------------------------------------------------------------- tema pronto

type Estilo = { nome: string; modo: string; titulo_mao: boolean; giz: boolean; rabisco: number; capa: string; derivados: Record<string, [string, string, number]> };

const montar = (id: IdTema): Tema => {
  const estilo = (opcoes.estilos as unknown as Record<IdTema, Estilo>)[id];
  const base = (opcoes.paletas as Record<IdTema, Paleta>)[id];
  const trocas = (TEMA.id === id ? TEMA.cores : {}) as Partial<Paleta>;
  const c = { ...base, ...trocas } as Paleta;
  // papéis que acompanham outro (na lousa, a mancha e o cartão saem da cor da lousa)
  for (const [papel, [de, alvo, t]] of Object.entries(estilo.derivados)) {
    if (!(papel in trocas)) (c as Record<string, string>)[papel] = misturar((c as Record<string, string>)[de], alvo, t);
  }
  return {
    id,
    nome: estilo.nome,
    escuro: estilo.modo === 'escuro',
    c,
    f: { ...FAMILIA, titulo: estilo.titulo_mao ? FAMILIA.mao : FAMILIA.texto },
    tituloMao: estilo.titulo_mao,
    pesoTitulo: estilo.titulo_mao ? 700 : id === 'post-its' ? 900 : 800,
    giz: estilo.giz,
    rabisco: estilo.rabisco,
    capa: estilo.capa,
    a: (papel, alfa) => comAlfa(c[papel], alfa),
    filtro: estilo.giz ? `url(#giz-${id})` : undefined,
  };
};

const PRONTOS: Partial<Record<IdTema, Tema>> = {};
export const temaPronto = (id: IdTema): Tema => (PRONTOS[id] ??= montar(id));

const Contexto = createContext<Tema | null>(null);
/** O tema em uso: o do <ComTema> mais próximo, senão o escolhido nas respostas. */
export const useTema = (): Tema => useContext(Contexto) ?? temaPronto(TEMA.id);
export const ComTema: React.FC<{ id?: IdTema; children: React.ReactNode }> = ({ id, children }) => (
  <Contexto.Provider value={temaPronto(id ?? TEMA.id)}>{children}</Contexto.Provider>
);
