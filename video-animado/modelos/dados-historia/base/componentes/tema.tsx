import React, { createContext, useContext } from 'react';
import opcoes from './opcoes.json';
import { FAMILIA } from './fontes';
import { TEMA } from './universo';

// Tema da família Dados e história. Os tokens moram em opcoes.json: "paletas" (os mesmos papéis de cor nos 4
// temas), "prontas" (3 paletas prontas por tema) e "estilos" (fonte do título e do número, a cor do número, a
// cena de capa e os papéis contra os quais o destaque da marca precisa ter contraste). Quatro temas:
//   isometrico      degradê escuro, piso em losango, colunas de 3 faces, cubos e moeda de enfeite
//   linha-do-tempo  papel claro, título serifado, trilho com a linha que se desenha e cartões de marco
//   mapa            mapa estilizado genérico (rio, quarteirões, praças, árvores), rota, pino e chips de tempo
//   jornal          cortiça, ano serifado grande, recortes girados com fita e círculo à mão (troca só destaque,
//                   faixas e etiquetas: a cortiça, o papel e a retícula ficam)
// O tema escolhido e as cores trocadas vêm de componentes/universo.ts (TEMA), gravado pelo --aplicar a partir
// das respostas (tema e cores). As trocas valem só para o tema escolhido. Os componentes nunca usam hex fixo:
// pegam o tema com useTema(). O _preview desenha os 4 temas com <ComTema id="...">.

export type Paleta = typeof opcoes.paletas.isometrico;
export type PapelCor = keyof Paleta;
export type IdTema = 'isometrico' | 'linha-do-tempo' | 'mapa' | 'jornal';
export const TEMAS = opcoes.temas as IdTema[];

export type Tema = {
  id: IdTema;
  nome: string;
  /** fundo escuro (pela luminância do fundo: vale também para as paletas prontas escuras) */
  escuro: boolean;
  c: Paleta;
  /** famílias de fonte: mão (Caveat), texto (Inter), mono, serifada (Lora) e as do título e do número deste tema */
  f: { mao: string; texto: string; mono: string; serif: string; titulo: string; numero: string };
  serifado: boolean;
  pesoTitulo: number;
  pesoNumero: number;
  /** cor do número grande (no jornal, o ano sai na cor do título, como letra de jornal) */
  corNumero: string;
  /** cena que vira a capa do tema (still tema-<id>) */
  capa: string;
  /** cor com transparência: a('destaque', 0.3) */
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
export const luminancia = (h: string) => {
  const [r, g, b] = hexRgb(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** face de coluna e de cubo isométrico: a cor base, uma mais escura (lado direito) e uma mais clara (tampa) */
export const faces = (cor: string) => ({ esquerda: cor, direita: misturar(cor, '#000000', 0.32), tampa: misturar(cor, '#FFFFFF', 0.45) });

// ---------------------------------------------------------------- tema pronto

type Estilo = { nome: string; modo: string; titulo: 'texto' | 'serif'; peso_titulo: number; numero: 'texto' | 'serif'; peso_numero: number; cor_numero: PapelCor; capa: string; contraste: string[] };

const montar = (id: IdTema): Tema => {
  const estilo = (opcoes.estilos as unknown as Record<IdTema, Estilo>)[id];
  const base = (opcoes.paletas as Record<IdTema, Paleta>)[id];
  const trocas = (TEMA.id === id ? TEMA.cores : {}) as Partial<Paleta>;
  const c = { ...base, ...trocas } as Paleta;
  const serifado = estilo.titulo === 'serif';
  return {
    id,
    nome: estilo.nome,
    escuro: luminancia(c.fundo) < 0.3,
    c,
    f: { ...FAMILIA, titulo: serifado ? FAMILIA.serif : FAMILIA.texto, numero: estilo.numero === 'serif' ? FAMILIA.serif : FAMILIA.texto },
    serifado,
    pesoTitulo: estilo.peso_titulo,
    pesoNumero: estilo.peso_numero,
    corNumero: c[estilo.cor_numero],
    capa: estilo.capa,
    a: (papel, alfa) => comAlfa(c[papel], alfa),
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
