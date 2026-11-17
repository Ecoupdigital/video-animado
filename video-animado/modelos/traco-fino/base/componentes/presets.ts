import OPCOES from './opcoes.json';
import { COR, TomPele, escurecer, clarear } from './cores';

export type { TomPele } from './cores';

// Aparência configurável do adulto e da criança. Os códigos aceitos (tons, cabelos, roupas, presets)
// moram em opcoes.json, o mesmo arquivo que o novo_universo.mjs usa para validar o respostas.json.
// Cada personagem pode ter uma aparência do antes (`antes`) que troca só o que muda; a prop `epoca`
// escolhe qual desenhar.

export type Corpo = 'adulto' | 'crianca';
export type Epoca = 'agora' | 'antes';
export type CabeloAdulto = 'chanel' | 'comprido' | 'rabo' | 'coque' | 'curto' | 'crespo' | 'careca';
export type CabeloCrianca = 'arrepiado' | 'franja' | 'marias' | 'crespo';
export type Camisa = 'aberta' | 'fechada';
export type Manga = 'sem' | 'curta' | 'longa';
export type BaixoAdulto = 'calca' | 'bermuda' | 'saia';
export type BaixoCrianca = 'bermuda' | 'saia';
export type NomePreset = keyof typeof OPCOES.presets;

export const CABELOS_ADULTO = OPCOES.cabelos_adulto as CabeloAdulto[];
export const CABELOS_CRIANCA = OPCOES.cabelos_crianca as CabeloCrianca[];
export const PRESETS_NOMES = Object.keys(OPCOES.presets) as NomePreset[];

export type AparenciaAdulto = {
  pele: TomPele;
  cabelo: CabeloAdulto;
  corCabelo: string;
  corSobrancelha: string;
  /** Fio de brilho no topo do cabelo. */
  corBrilho: string;
  cilios: boolean;
  /** Camisa aberta por cima de uma regata, ou camiseta fechada. */
  camisa: Camisa;
  topo: string;
  /** Regata que aparece na abertura da camisa. */
  porBaixo: string;
  manga: Manga;
  tipoBaixo: BaixoAdulto;
  baixo: string;
  tenis: string;
  sola: string;
  oculos: boolean;
  corOculos: string;
  barba: boolean;
  /** 0 a 1: formato do corpo (cintura e barriga). */
  barriga: number;
  /** Largura extra dos ombros. */
  ombros: number;
  /** 1 = altura padrão. */
  altura: number;
};

export type AparenciaCrianca = {
  pele: TomPele;
  cabelo: CabeloCrianca;
  corCabelo: string;
  corSobrancelha: string;
  /** Cor da camiseta. */
  topo: string;
  /** Cor das listras da camiseta (null = lisa). */
  listras: string | null;
  tipoBaixo: BaixoCrianca;
  baixo: string;
  tenis: string;
  /** Faixa do tênis (null = sem faixa). */
  faixaTenis: string | null;
  /** Cor do laço das marias-chiquinhas. */
  laco: string;
  /** Curativo no joelho. */
  curativo: boolean;
  oculos: boolean;
  corOculos: string;
  /** Altura em relação ao adulto padrão (0,56 = criança de uns 4 anos). */
  altura: number;
};

/** O que vem do respostas.json: um preset (opcional) e só os campos trocados. */
export type AparenciaEntrada = { preset?: string; [campo: string]: string | number | boolean | null | undefined | Record<string, unknown> };

const PADRAO_ADULTO = {
  pele: 'p3',
  cabelo: 'curto',
  corCabelo: '#3A2A20',
  cilios: false,
  camisa: 'fechada',
  topo: COR.petroleoClaro,
  porBaixo: COR.papel,
  manga: 'curta',
  tipoBaixo: 'calca',
  baixo: '#3E4248',
  tenis: COR.papel,
  oculos: false,
  corOculos: COR.tinta,
  barba: false,
  barriga: 0,
  ombros: 0,
  altura: 1,
} as const;

const PADRAO_CRIANCA = {
  pele: 'p3',
  cabelo: 'franja',
  corCabelo: '#4A3428',
  topo: COR.papel,
  listras: null,
  tipoBaixo: 'bermuda',
  baixo: COR.oliva,
  tenis: COR.papel,
  faixaTenis: null,
  laco: COR.coral,
  curativo: false,
  oculos: false,
  corOculos: COR.tinta,
  altura: 0.56,
} as const;

const valido = <T extends string>(v: unknown, lista: readonly string[], padrao: T): T => (typeof v === 'string' && lista.includes(v) ? (v as T) : padrao);
const presetDe = (entrada: AparenciaEntrada): Record<string, unknown> =>
  entrada.preset && entrada.preset in OPCOES.presets ? ((OPCOES.presets as Record<string, Record<string, unknown>>)[entrada.preset] ?? {}) : {};

/** Junta preset, respostas e (na época do antes) o que muda no antes. */
const juntar = (padrao: Record<string, unknown>, entrada: AparenciaEntrada, antes: AparenciaEntrada | null | undefined, epoca: Epoca) => {
  const preset = presetDe(entrada);
  const { antes: antesDoPreset, ...semAntes } = preset as { antes?: Record<string, unknown> };
  const j: Record<string, unknown> = { ...padrao, ...semAntes, ...entrada };
  if (epoca === 'antes') Object.assign(j, antesDoPreset ?? {}, antes ?? {});
  return j;
};

/** Aparência completa do adulto (cores derivadas quando não vierem). */
export const resolverAdulto = (entrada: AparenciaEntrada, antes?: AparenciaEntrada | null, epoca: Epoca = 'agora'): AparenciaAdulto => {
  const j = juntar(PADRAO_ADULTO, entrada, antes, epoca);
  const s = (k: string) => (typeof j[k] === 'string' ? (j[k] as string) : undefined);
  const n = (k: string, padrao: number) => (typeof j[k] === 'number' ? (j[k] as number) : padrao);
  const corCabelo = s('corCabelo') ?? PADRAO_ADULTO.corCabelo;
  const tenis = s('tenis') ?? PADRAO_ADULTO.tenis;
  return {
    pele: valido<TomPele>(j.pele, Object.keys(OPCOES.tons_pele), 'p3'),
    cabelo: valido<CabeloAdulto>(j.cabelo, OPCOES.cabelos_adulto, 'curto'),
    corCabelo,
    corSobrancelha: s('corSobrancelha') ?? escurecer(corCabelo, 0.15),
    corBrilho: s('corBrilho') ?? clarear(corCabelo, 0.18),
    cilios: j.cilios === true,
    camisa: valido<Camisa>(j.camisa, OPCOES.camisas, 'fechada'),
    topo: s('topo') ?? PADRAO_ADULTO.topo,
    porBaixo: s('porBaixo') ?? PADRAO_ADULTO.porBaixo,
    manga: valido<Manga>(j.manga, OPCOES.mangas, 'curta'),
    tipoBaixo: valido<BaixoAdulto>(j.tipoBaixo, OPCOES.baixos_adulto, 'calca'),
    baixo: s('baixo') ?? PADRAO_ADULTO.baixo,
    tenis,
    sola: s('sola') ?? escurecer(tenis, 0.18),
    oculos: j.oculos === true,
    corOculos: s('corOculos') ?? PADRAO_ADULTO.corOculos,
    barba: j.barba === true,
    barriga: Math.max(0, Math.min(1, n('barriga', 0))),
    ombros: n('ombros', 0),
    altura: n('altura', 1),
  };
};

/** Aparência completa da criança. */
export const resolverCrianca = (entrada: AparenciaEntrada, antes?: AparenciaEntrada | null, epoca: Epoca = 'agora'): AparenciaCrianca => {
  const j = juntar(PADRAO_CRIANCA, entrada, antes, epoca);
  const s = (k: string) => (typeof j[k] === 'string' ? (j[k] as string) : undefined);
  const corCabelo = s('corCabelo') ?? PADRAO_CRIANCA.corCabelo;
  return {
    pele: valido<TomPele>(j.pele, Object.keys(OPCOES.tons_pele), 'p3'),
    cabelo: valido<CabeloCrianca>(j.cabelo, OPCOES.cabelos_crianca, 'franja'),
    corCabelo,
    corSobrancelha: s('corSobrancelha') ?? corCabelo,
    topo: s('topo') ?? PADRAO_CRIANCA.topo,
    listras: s('listras') ?? null,
    tipoBaixo: valido<BaixoCrianca>(j.tipoBaixo, OPCOES.baixos_crianca, 'bermuda'),
    baixo: s('baixo') ?? PADRAO_CRIANCA.baixo,
    tenis: s('tenis') ?? PADRAO_CRIANCA.tenis,
    faixaTenis: s('faixaTenis') ?? null,
    laco: s('laco') ?? PADRAO_CRIANCA.laco,
    curativo: j.curativo === true,
    oculos: j.oculos === true,
    corOculos: s('corOculos') ?? PADRAO_CRIANCA.corOculos,
    altura: typeof j.altura === 'number' ? (j.altura as number) : PADRAO_CRIANCA.altura,
  };
};

/** Corpo de um preset (adulto ou criança). */
export const corpoDoPreset = (nome: string): Corpo => ((OPCOES.presets as Record<string, { corpo?: string }>)[nome]?.corpo === 'crianca' ? 'crianca' : 'adulto');
