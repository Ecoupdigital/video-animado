import OPCOES from './opcoes.json';
import { COR, TomPele, escurecer } from './cores';

export type { TomPele } from './cores';

// Aparência configurável da Pessoa. Os códigos aceitos (tons, cabelos, presets) moram em
// opcoes.json, o mesmo arquivo que o novo_universo.mjs usa para validar o respostas.json.

export type TipoCabelo = 'coque' | 'curto-liso' | 'crespo-curto' | 'cachos' | 'armado' | 'comprido' | 'careca';
export type TipoBaixo = 'calca' | 'saia' | 'jardineira';
export type Manga = 'curta' | 'longa';
export type Acessorio = 'nenhum' | 'perolas' | 'mochila';
export type NomePreset = keyof typeof OPCOES.presets;

export const CABELOS = OPCOES.cabelos as TipoCabelo[];
export const PRESETS_NOMES = Object.keys(OPCOES.presets) as NomePreset[];

export type Aparencia = {
  pele: TomPele;
  cabelo: TipoCabelo;
  corCabelo: string;
  corSobrancelha: string;
  /** Cor da parte de cima (camiseta, blusa). */
  topo: string;
  gola: string;
  manga: Manga;
  tipoBaixo: TipoBaixo;
  /** Cor da parte de baixo (calça, saia ou jardineira). */
  baixo: string;
  baixoLuz: string;
  sapato: string;
  sola: string;
  faixaSapato: string | null;
  oculos: boolean;
  corOculos: string;
  barba: boolean;
  sardas: boolean;
  rugas: boolean;
  cilios: boolean;
  jaleco: boolean;
  acessorio: Acessorio;
  /** Cor do elástico do coque. */
  prendedor: string;
  /** 1 = altura padrão. */
  altura: number;
  /** Pixels extras do tronco de cada lado. */
  largura: number;
  raioCabeca: number;
  tamanhoOlho: number;
};

/** O que vem do respostas.json: um preset (opcional) e só os campos trocados. */
export type AparenciaEntrada = Partial<Omit<Aparencia, 'pele' | 'cabelo' | 'manga' | 'tipoBaixo' | 'acessorio'>> & {
  preset?: string;
  pele?: string;
  cabelo?: string;
  manga?: string;
  tipoBaixo?: string;
  acessorio?: string;
};

/** Ponto de partida sem preset: pessoa neutra de cabelo curto. */
const PADRAO = {
  pele: 'p4',
  cabelo: 'curto-liso',
  corCabelo: '#2B1B12',
  topo: '#7A9CC6',
  manga: 'curta',
  tipoBaixo: 'calca',
  baixo: '#4A5568',
  sapato: '#4A4A4A',
  oculos: false,
  corOculos: '#2B2B2B',
  barba: false,
  sardas: false,
  rugas: false,
  cilios: false,
  jaleco: false,
  acessorio: 'nenhum',
  altura: 1,
  largura: 0,
  raioCabeca: 112,
  tamanhoOlho: 1.1,
} as const;

const valido = <T extends string>(v: string | undefined, lista: readonly string[], padrao: T): T => (v && lista.includes(v) ? (v as T) : padrao);

/** Junta padrão, preset e respostas numa aparência completa (cores derivadas quando não vierem). */
export const resolverAparencia = (entrada: AparenciaEntrada): Aparencia => {
  const preset = entrada.preset && entrada.preset in OPCOES.presets ? (OPCOES.presets as Record<string, Record<string, unknown>>)[entrada.preset] : {};
  const j = { ...PADRAO, ...preset, ...entrada } as Record<string, unknown>;
  const s = (k: string) => (typeof j[k] === 'string' ? (j[k] as string) : undefined);
  const n = (k: string, padrao: number) => (typeof j[k] === 'number' ? (j[k] as number) : padrao);
  const b = (k: string) => j[k] === true;
  const topo = s('topo') ?? PADRAO.topo;
  const baixo = s('baixo') ?? PADRAO.baixo;
  const corCabelo = s('corCabelo') ?? PADRAO.corCabelo;
  const sapato = s('sapato') ?? PADRAO.sapato;
  return {
    pele: valido<TomPele>(s('pele'), Object.keys(OPCOES.tons_pele), 'p4'),
    cabelo: valido<TipoCabelo>(s('cabelo'), OPCOES.cabelos, 'curto-liso'),
    corCabelo,
    corSobrancelha: s('corSobrancelha') ?? corCabelo,
    topo,
    gola: s('gola') ?? escurecer(topo, 0.1),
    manga: valido<Manga>(s('manga'), OPCOES.mangas, 'curta'),
    tipoBaixo: valido<TipoBaixo>(s('tipoBaixo'), OPCOES.baixos, 'calca'),
    baixo,
    baixoLuz: s('baixoLuz') ?? escurecer(baixo, 0.07),
    sapato,
    sola: s('sola') ?? escurecer(sapato, 0.3),
    faixaSapato: s('faixaSapato') ?? null,
    oculos: b('oculos'),
    corOculos: s('corOculos') ?? PADRAO.corOculos,
    barba: b('barba'),
    sardas: b('sardas'),
    rugas: b('rugas'),
    cilios: b('cilios'),
    jaleco: b('jaleco'),
    acessorio: valido<Acessorio>(s('acessorio'), OPCOES.acessorios, 'nenhum'),
    prendedor: s('prendedor') ?? COR.apoio2,
    altura: n('altura', 1),
    largura: n('largura', 0),
    raioCabeca: n('raioCabeca', 112),
    tamanhoOlho: n('tamanhoOlho', 1.1),
  };
};

/** Presets do modelo, já resolvidos (para folhas e para o elenco de exemplo). */
export const PRESETS: Record<NomePreset, Aparencia> = Object.fromEntries(
  PRESETS_NOMES.map((nome) => [nome, resolverAparencia({ preset: nome })]),
) as Record<NomePreset, Aparencia>;
