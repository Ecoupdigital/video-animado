import OPCOES from './opcoes.json';
import { PALETA as PALETA_DO_UNIVERSO } from './universo';

// Paleta por papel. O preset padrão do modelo é "Linho e petróleo".
// Proporção: 60% linho (fundos), 25% petróleo e oliva (apoio), 10% personagens, 5% destaque (só a marca,
// a palavra falada e a chamada). componentes/universo.ts (gerado das respostas) pode trocar qualquer papel.
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
export const LINHO_E_PETROLEO: Paleta = OPCOES.paletas['linho-e-petroleo'];

const hexParaRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbParaHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();

/** Mistura a cor com preto (k de 0 a 1). */
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

const P: Paleta = { ...LINHO_E_PETROLEO, ...PALETA_DO_UNIVERSO };
const trocado = (k: PapelCor) => k in PALETA_DO_UNIVERSO;

/** Cores técnicas, iguais em todo universo do modelo: o traço, o papel, o céu de cada luz, a boca. */
const FIXAS = {
  /** O traço editorial: todo contorno de personagem, objeto e cenário. */
  tinta: '#1F2328',
  papel: '#FBF8F2',
  branco: '#FFFFFF',
  ceuDia: '#DCE6E8',
  ceuTarde: '#F2D2B0',
  ceuMadrugada: '#28344A',
  sombra: 'rgba(31, 35, 40, 0.10)',
  boca: '#5E2A26',
  rubor: '#E48A7A',
  agua: '#BFD6E0',
  caderno: '#FFFDF7',
  quadricula: '#C9DCE6',
} as const;

/**
 * Cores do desenho. Os papéis da paleta mais os nomes que os desenhos usam (linho, petróleo, oliva,
 * madeira, coral), tirados dos papéis: com a paleta do modelo saem os tons exatos da ilustração;
 * com um papel trocado nas respostas, o tom claro vem da cor nova.
 */
export const COR = {
  ...P,
  linhoClaro: P.fundo,
  linho: P.fundo2,
  linhoEscuro: P.fundo3,
  petroleo: P.apoio,
  petroleoClaro: trocado('apoio') ? clarear(P.apoio, 0.22) : '#5C7682',
  oliva: P.apoio2,
  olivaClara: P.apoio2Claro,
  madeira: P.detalhe,
  madeiraClara: trocado('detalhe') ? clarear(P.detalhe, 0.3) : '#D3B193',
  tintaSuave: P.textoSuave,
  coral: P.destaque,
  coralProfundo: P.destaqueProfundo,
  ...FIXAS,
};

/** Espessura do traço editorial (em unidades do desenho de 400 x 900). */
export const TRACO = 2.6;

export type Pele = { base: string; sombra: string };
export type TomPele = keyof typeof OPCOES.tons_pele;
export const TONS_PELE: Record<TomPele, Pele> = OPCOES.tons_pele;
export const TONS: TomPele[] = Object.keys(OPCOES.tons_pele) as TomPele[];
