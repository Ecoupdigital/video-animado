import OPCOES from './opcoes.json';
import { PALETA as PALETA_DO_UNIVERSO } from './universo';

// Paleta por papel. O preset padrão do modelo é "Casa quente".
// Proporção: 60% fundos claros, 25% apoio (madeira e verde), 10% personagens, 5% destaque.
// componentes/universo.ts (gerado das respostas) pode trocar qualquer papel.
export type PapelCor =
  | 'fundo'
  | 'fundo2'
  | 'fundo3'
  | 'apoio'
  | 'apoioEscuro'
  | 'apoio2'
  | 'apoio2Claro'
  | 'destaque'
  | 'destaqueProfundo'
  | 'texto'
  | 'textoSuave'
  | 'acerto'
  | 'erro'
  | 'detalhe';
export type Paleta = Record<PapelCor, string>;

export const PALETAS: Record<string, Paleta> = OPCOES.paletas;
export const CASA_QUENTE: Paleta = OPCOES.paletas['casa-quente'];

/** Cores técnicas, iguais em todo universo do modelo (boca, água, sombra no chão, céu). */
const FIXAS = {
  branco: '#FFFFFF',
  sombra: 'rgba(60, 35, 20, 0.12)',
  agua: '#BFE0EE',
  boca: '#4A1C1C',
  lingua: '#E0736B',
  linhaBoca: '#5A2A20',
  rubor: '#E0735A',
  ceuDia: '#DCE9E4',
  ceuNoite: '#2F3550',
  ceuNoiteClaro: '#454C6B',
} as const;

export const COR = { ...CASA_QUENTE, ...PALETA_DO_UNIVERSO, ...FIXAS };

export type Pele = { base: string; sombra: string; sarda: string };
export type TomPele = keyof typeof OPCOES.tons_pele;
export const TONS_PELE: Record<TomPele, Pele> = OPCOES.tons_pele;
export const TONS: TomPele[] = Object.keys(OPCOES.tons_pele) as TomPele[];

const hexParaRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbParaHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();

/** Mistura a cor com preto (k de 0 a 1). Para gola, sombra de roupa e mecha de cabelo. */
export const escurecer = (hex: string, k: number): string => {
  const [r, g, b] = hexParaRgb(hex);
  return rgbParaHex(r * (1 - k), g * (1 - k), b * (1 - k));
};

/** Mistura a cor com branco (k de 0 a 1). */
export const clarear = (hex: string, k: number): string => {
  const [r, g, b] = hexParaRgb(hex);
  return rgbParaHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k);
};

/** Luminância de 0 (preto) a 1 (branco). */
export const luminancia = (hex: string): number => {
  const [r, g, b] = hexParaRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
