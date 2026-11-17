import React, { createContext, useContext } from 'react';
import opcoes from './opcoes.json';
import { familia } from './fontes';
import { MARCA, TEMA } from './universo';

// Tema do dossiê: os tokens (cores por papel e estilo de cada tema) moram em opcoes.json, campos
// "paletas" e "estilos". Três temas prontos:
//   investigativo  escuro, holofote roxo, vermelho só em alerta (o dossiê original)
//   jornal         claro, papel de jornal, tinta preta e azul, manchete serifada
//   marca          escuro neutro com o destaque puxado da cor da marca (sem marca: as cores do investigativo)
// As respostas escolhem o tema (cores.tema) e podem trocar qualquer papel de cor (cores.paleta) e de
// fonte (cores.fontes); as trocas valem só para o tema escolhido. Os componentes nunca usam hex fixo:
// pegam o tema com useTema(). O _preview desenha os três temas com <ComTema nome="...">.

export type Paleta = typeof opcoes.paletas.investigativo;
export type PapelCor = keyof Paleta;
export type NomeTema = 'investigativo' | 'jornal' | 'marca';
export type PapelFonte = 'titulo' | 'texto' | 'mono';
export const TEMAS: NomeTema[] = ['investigativo', 'jornal', 'marca'];

export type Tema = {
  nome: NomeTema;
  rotulo: string;
  escuro: boolean;
  c: Paleta;
  f: Record<PapelFonte, string>;
  caixaAlta: boolean;
  pesoTitulo: number;
  tracking: number;
  /** cor com transparência: a('destaque', 0.3) */
  a: (papel: PapelCor, alfa: number) => string;
  /** sombra de texto grande (escura no tema escuro, quase nada no claro) */
  sombra: string;
};

// ---------------------------------------------------------------- cor

const hexRgb = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export const comAlfa = (hex: string, alfa: number) => {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${alfa})`;
};
const misturar = (a: string, b: string, t: number) => {
  const x = hexRgb(a);
  const y = hexRgb(b);
  return rgbHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
};
const luminancia = (h: string) => {
  const [r, g, b] = hexRgb(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const girarMatiz = (h: string, graus: number) => {
  const [r, g, b] = hexRgb(h).map((v) => v / 255);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  if (d === 0) return h;
  const s = d / (1 - Math.abs(2 * l - 1));
  let hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  hue = (hue * 60 + graus + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const [rr, gg, bb] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return rgbHex((rr + m) * 255, (gg + m) * 255, (bb + m) * 255);
};

/** Destaque, destaque2, claro e fita do tema "marca", puxados da cor da marca (legível sobre fundo escuro). */
export const coresDaMarca = (cor: string): Partial<Paleta> => {
  let destaque = cor.toUpperCase();
  // cor escura demais some no fundo escuro: clareia até ler
  for (let i = 0; i < 6 && luminancia(destaque) < 0.12; i++) destaque = misturar(destaque, '#FFFFFF', 0.18);
  const claro = misturar(destaque, '#FFFFFF', 0.5);
  return { destaque, destaque2: girarMatiz(destaque, -28), claro, fita: claro };
};

// ---------------------------------------------------------------- tema pronto

const montar = (nome: NomeTema): Tema => {
  const estilo = opcoes.estilos[nome];
  const base = opcoes.paletas[nome] as Paleta;
  const daMarca = nome === 'marca' && MARCA?.cor ? coresDaMarca(MARCA.cor) : {};
  const trocas = TEMA.nome === nome ? TEMA.cores : {};
  const c = { ...base, ...daMarca, ...trocas } as Paleta;
  const fontes = { ...estilo.fontes, ...(TEMA.nome === nome ? TEMA.fontes : {}) } as Record<PapelFonte, string>;
  const escuro = estilo.modo === 'escuro';
  return {
    nome,
    rotulo: estilo.nome,
    escuro,
    c,
    f: { titulo: familia(fontes.titulo, 'titulo'), texto: familia(fontes.texto, 'texto'), mono: familia(fontes.mono, 'mono') },
    caixaAlta: estilo.caixaAlta,
    pesoTitulo: estilo.pesoTitulo,
    tracking: estilo.tracking,
    a: (papel, alfa) => comAlfa(c[papel], alfa),
    sombra: escuro ? '0 6px 30px rgba(0,0,0,0.6)' : '0 2px 0 rgba(255,255,255,0.6)',
  };
};

const PRONTOS: Partial<Record<NomeTema, Tema>> = {};
export const temaPronto = (nome: NomeTema): Tema => (PRONTOS[nome] ??= montar(nome));

const Contexto = createContext<Tema | null>(null);
/** O tema em uso: o do <ComTema> mais próximo, senão o escolhido nas respostas. */
export const useTema = (): Tema => useContext(Contexto) ?? temaPronto(TEMA.nome);
export const ComTema: React.FC<{ nome?: NomeTema; children: React.ReactNode }> = ({ nome, children }) => (
  <Contexto.Provider value={temaPronto(nome ?? TEMA.nome)}>{children}</Contexto.Provider>
);
