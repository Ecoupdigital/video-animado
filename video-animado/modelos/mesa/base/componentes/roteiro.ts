import type { Entrada } from './pecas';
import { infoItem, type IdItem } from './tema';

// Dados das cenas: o que o roteiro de cada vídeo (roteiro-falas.json) diz e o que o timing.json devolve.
// As cenas são montadas por estes dados; nenhum tempo é digitado à mão. Cada cena tem a narração dela ("texto")
// e as batidas ("batidas": papel -> palavra do texto); o _ferramentas/timing.py acha o instante de cada palavra no
// words.json e grava o timing.json com ini, fim e as batidas. Um item por batida: o item i do passo cai na palavra
// da batida "item<i>" (item0, item1, ...).

/** Um item do passo: o código da biblioteca, onde cai (na mesa ou sobre a peça central), como entra e quantos. */
export type ItemCena = { item: IdItem; lugar?: 'mesa' | 'centro'; entrada?: Entrada; quantidade?: number };

export type CenaDados =
  | { tipo: 'abertura'; titulo: string; rotulo?: string; frase?: string }
  | { tipo: 'passo'; titulo: string; frase: string; itens: ItemCena[]; numero?: number; de?: number }
  | { tipo: 'final'; pergunta?: string; fontes?: string[] };

export type TipoCena = CenaDados['tipo'];
export const TIPOS_CENA: TipoCena[] = ['abertura', 'passo', 'final'];

/** Uma cena com os tempos do timing.json (segundos do áudio final). */
export type CenaTempo = CenaDados & {
  ini: number;
  fim: number;
  /** batidas: papel -> segundo (só as marcadas no roteiro) */
  b: Record<string, number>;
};

export type Timing = { cenas: CenaTempo[]; voiceEnd: number; total: number; rotulo?: string };

/** Instante de uma batida: o marcado no roteiro, senão a fração da cena (só ordem visual, não tempo de fala). */
export const batida = (c: CenaTempo, papel: string, fracao: number) => c.b[papel] ?? c.ini + fracao * (c.fim - c.ini);

/** onde o item cai: o que o roteiro diz; sem dizer, sobre a peça central se o item vira cobertura, senão na mesa */
export const lugarDe = (i: ItemCena): 'mesa' | 'centro' => (i.lugar === 'mesa' || !infoItem(i.item).noCentro ? 'mesa' : i.lugar ?? 'centro');

/** instante em que o item i do passo entra: a batida item<i>, senão espalhado pela cena */
export const tempoDoItem = (c: CenaTempo, i: number) => {
  if (c.tipo !== 'passo') return c.ini;
  const n = Math.max(1, c.itens.length);
  return batida(c, `item${i}`, 0.12 + (i * 0.62) / n);
};

/** "PASSO n DE N": o número do roteiro, senão a ordem entre os passos do vídeo */
export const numeroDoPasso = (cenas: CenaDados[], indice: number): [number, number] => {
  const passos = cenas.filter((c) => c.tipo === 'passo');
  const c = cenas[indice];
  const n = cenas.slice(0, indice + 1).filter((x) => x.tipo === 'passo').length;
  if (c.tipo !== 'passo') return [n, passos.length];
  return [c.numero ?? n, Math.max(c.de ?? passos.length, c.numero ?? n)];
};

/** Tempos sintéticos (cada cena com "dur" segundos), para os stills e a folha do _preview. */
export const comTempoSintetico = (cenas: CenaDados[], dur = 6): Timing => {
  const lista: CenaTempo[] = cenas.map((c, i) => ({ ...c, ini: i * dur, fim: (i + 1) * dur, b: {} }) as CenaTempo);
  return { cenas: lista, voiceEnd: cenas.length * dur - 2.6, total: cenas.length * dur };
};
