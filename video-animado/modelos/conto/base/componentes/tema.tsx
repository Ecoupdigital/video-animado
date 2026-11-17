import React, { createContext, useContext } from 'react';
import opcoes from './opcoes.json';
import { FAMILIA } from './fontes';
import { TEMA } from './universo';

// Tema da família Conto. Os tokens moram em opcoes.json: "temas" (a lista, na ordem do catálogo), "paletas" (os
// mesmos papéis de cor em todos os temas), "prontas" (3 paletas prontas por tema) e "estilos" (o jeito do título,
// da legenda e da fala de cada tema, a cena de capa e os papéis contra os quais o destaque da marca precisa ter
// contraste). Nenhum componente lista os temas: quem desenha o que é de um tema é o módulo dele, registrado em
// componentes/temas/index.ts (traço do personagem e fundos). Os temas desta versão:
//   papel   papel recortado: kraft com fibras, peças presas por colchete, sombra projetada, faixa e tarja rasgadas
//           (troca só destaque, faixas e etiquetas: o kraft, as fibras, a sombra e as cores de recorte ficam)
//   formas  bonecos de formas: cor chapada viva, olhos grandes, braços e pernas de traço, balões de fala
//   silhuetas  céu em degradê, sol, morros em camadas; personagens escuros contra o céu, sem rosto, que falam
//           pelo gesto (troca o céu, o que ele tinge e o destaque: a silhueta e o morro da frente ficam escuros)
//   giz-de-cera  folha pautada com margem, desenho de criança em giz de traço tremido, letra de mão
//           (troca as cores dos gizes: a folha, a pauta e a margem ficam)
// O tema escolhido e as cores trocadas vêm de componentes/universo.ts (TEMA), gravado pelo --aplicar a partir das
// respostas (tema e cores). As trocas valem só para o tema escolhido. Os componentes nunca usam hex fixo: pegam o
// tema com useTema(). O _preview desenha cada tema com <ComTema id="...">.

export type Paleta = typeof opcoes.paletas.papel;
export type PapelCor = keyof Paleta;
/** id de um tema da lista do opcoes.json (texto: o tema novo entra pelo opcoes.json, sem mexer neste tipo) */
export type IdTema = string;
export const TEMAS: IdTema[] = opcoes.temas;

/** faixa rasgada (papel), selo e título grande (formas), citação serifada inclinada sobre o céu (silhuetas),
 *  título em letra de mão (giz de cera) */
export type EstiloTitulo = 'faixa-rasgada' | 'selo' | 'citacao' | 'manuscrito';
/** tarja escura rasgada (papel), texto sobre o chão com a palavra numa pílula (formas), texto claro sobre o
 *  morro escuro (silhuetas), letra de mão sobre a folha pautada (giz de cera) */
export type EstiloLegenda = 'tarja-rasgada' | 'simples' | 'clara' | 'manuscrita';
export type EstiloFala = 'legenda' | 'balao';
type Estilo = { nome: string; titulo: EstiloTitulo; legenda: EstiloLegenda; fala: EstiloFala; capa: string; cenario_capa: string; contraste: string[]; /** escala dos personagens em cena */ escala: number };

export type Tema = {
  id: IdTema;
  nome: string;
  /** fundo escuro (pela luminância do fundo: vale também para as paletas prontas escuras) */
  escuro: boolean;
  c: Paleta;
  f: typeof FAMILIA;
  estilo: Estilo;
  /** cor com transparência: a('sombra', 0.35) */
  a: (papel: PapelCor, alfa: number) => string;
  /** cor de texto legível sobre um fundo: a preferida, se tiver contraste 4,5, senão quase preto ou branco */
  sobre: (fundo: string, preferida?: string, minimo?: number) => string;
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
 *  negrito, como a palavra falada da legenda), senão quase preto ou branco. */
export const legivel = (fundo: string, preferida?: string, minimo = 4.5) => {
  if (preferida && contraste(preferida, fundo) >= minimo) return preferida;
  return contraste('#1D1D1F', fundo) >= contraste('#FFFFFF', fundo) ? '#1D1D1F' : '#FFFFFF';
};

// ---------------------------------------------------------------- tema pronto

const montar = (id: IdTema): Tema => {
  const estilos = opcoes.estilos as unknown as Record<string, Estilo>;
  const estilo = estilos[id] ?? estilos[TEMAS[0]];
  const base = (opcoes.paletas as unknown as Record<string, Paleta>)[id] ?? opcoes.paletas.papel;
  const trocas = (TEMA.id === id ? TEMA.cores : {}) as Partial<Paleta>;
  const c = { ...base, ...trocas } as Paleta;
  return {
    id,
    nome: estilo.nome,
    escuro: luminancia(c.fundo) < 0.3,
    c,
    f: FAMILIA,
    estilo,
    a: (papel, alfa) => comAlfa(c[papel], alfa),
    sobre: legivel,
  };
};

const PRONTOS: Record<string, Tema> = {};
export const temaPronto = (id: IdTema): Tema => (PRONTOS[id] ??= montar(id));

const Contexto = createContext<Tema | null>(null);
/** O tema em uso: o do <ComTema> mais próximo, senão o escolhido nas respostas. */
export const useTema = (): Tema => useContext(Contexto) ?? temaPronto(TEMA.id);
export const ComTema: React.FC<{ id?: IdTema; children: React.ReactNode }> = ({ id, children }) => (
  <Contexto.Provider value={temaPronto(id ?? TEMA.id)}>{children}</Contexto.Provider>
);
