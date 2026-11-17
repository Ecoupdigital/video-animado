import opcoes from './opcoes.json';

// Aparência de um personagem do Conto: um objeto só, para todos os temas (decisão 8 do planejamento).
//   campos comuns (opcoes.aparencia.comum): preset, cor (principal), corDetalhe, acessorio
//   campos de cada tema (opcoes.aparencia.<tema>): o papel usa pele, cabelo, roupa...; as formas usam corpo, olhos...
// O que o tema em uso não usa fica guardado e é ignorado; o que falta vem do preset (o da resposta, senão o
// preset padrão do lugar do personagem no elenco). Assim, trocar só o tema dá os mesmos personagens, reconhecíveis
// pela cor principal e pelo acessório. Tema novo: acrescente os campos dele em opcoes.aparencia e nos presets.

export type NomePreset = keyof typeof opcoes.presets;
export const PRESETS = opcoes.presets as Record<string, Record<string, string>>;
export const LISTAS = opcoes.listas as Record<string, string[]>;
export const TONS_PELE = opcoes.tons_pele as Record<string, { base: string; sombra: string; bochecha: string }>;
export const TONS = Object.keys(TONS_PELE);

/** O que vem das respostas: qualquer campo de opcoes.aparencia (conferido pelo --aplicar). */
export type AparenciaEntrada = { preset?: string } & Record<string, string | undefined>;

/** Aparência resolvida: todos os campos de todos os temas preenchidos. */
export type Aparencia = {
  cor: string;
  corDetalhe: string;
  acessorio: string;
  /** campos de cada tema (pele, cabelo, corpo...), lidos pelo módulo do tema */
  [campo: string]: string;
};

/** Preset padrão pelo lugar no elenco (semente 1 = o primeiro da lista preset_padrao). */
export const presetPadrao = (semente: number): string => {
  const l = opcoes.preset_padrao;
  return l[(Math.max(1, semente) - 1) % l.length];
};

export const resolverAparencia = (entrada: AparenciaEntrada, semente = 1): Aparencia => {
  const base = PRESETS[presetPadrao(semente)];
  const doPreset = entrada.preset && PRESETS[entrada.preset] ? PRESETS[entrada.preset] : {};
  const proprio = Object.fromEntries(Object.entries(entrada).filter(([k, v]) => k !== 'preset' && typeof v === 'string')) as Record<string, string>;
  return { ...base, ...doPreset, ...proprio } as Aparencia;
};
