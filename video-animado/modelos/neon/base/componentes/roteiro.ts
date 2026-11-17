import type { EventoLetreiro, Linhas } from './letreiro';
import { lerRelogio, type DadosContagem, type DadosOferta } from './pecas';
import { FECHO, OFERTA, type Preco } from './universo';

// Dados das cenas: o que o roteiro de cada vídeo (roteiro-falas.json) diz e o que o timing.json devolve.
// As cenas são montadas por estes dados; nenhum tempo é digitado à mão. Cada cena traz as batidas (papel -> instante):
//   narração inteira  o _ferramentas/timing.py acha o instante da palavra marcada no words.json da voz
//   só letreiros      o _ferramentas/tempos_sem_voz.py põe cada batida no tempo marcado da música (cama do kit ou a
//                     música da pessoa, pelo andamento), e cada cena dura um número inteiro de compassos
// O letreiro troca na batida "letreiro<i>" de cada cena (o letreiro i da lista "letreiros") e fica aceso até o
// próximo, mesmo nas cenas seguintes que não trazem letreiro. O que a cena não diz sai da oferta das respostas.

type ComLetreiro = { letreiros?: Linhas[] };
export type CenaDados =
  | (ComLetreiro & { tipo: 'abertura' })
  | (ComLetreiro & { tipo: 'oferta'; o_que?: string | null; preco?: Preco | null; preco_antigo?: Preco | null; selo?: string | null; prazo?: string | null })
  | (ComLetreiro & { tipo: 'contagem'; forma?: 'relogio' | 'numeros'; relogio?: string; de?: number; rotulo?: string | null; prazo?: string | null; texto_final?: string })
  | (ComLetreiro & { tipo: 'chamada'; botao?: string; prazo?: string | null })
  | { tipo: 'final'; chamada?: string | null; fontes?: string[] };

export type TipoCena = CenaDados['tipo'];
export const TIPOS_CENA: TipoCena[] = ['abertura', 'oferta', 'contagem', 'chamada', 'final'];
export type Receita = 'narracao-inteira' | 'texto-e-musica';

/** Uma cena com os tempos do timing.json (segundos do áudio final). */
export type CenaTempo = CenaDados & {
  ini: number;
  fim: number;
  /** batidas: papel -> segundo (só as marcadas no roteiro) */
  b: Record<string, number>;
};

export type Timing = {
  cenas: CenaTempo[];
  voiceEnd: number;
  total: number;
  /** a receita deste vídeo (sem ela, narração inteira) */
  receita?: Receita;
  /** false desliga a piscada do letreiro (ele acende sem tremido) */
  piscada?: boolean;
  /** só letreiros: andamento e primeira batida da música, em segundos */
  bpm?: number;
  primeiraBatida?: number;
};

/** Instante de uma batida: a marcada no roteiro, senão a fração da cena (só ordem visual, não tempo de fala). */
export const batida = (c: CenaTempo, papel: string, fracao: number) => c.b[papel] ?? c.ini + fracao * (c.fim - c.ini);

/** segundos de um tempo da música (só letreiros); na narração, 0,5 s */
export const tempoDaBatida = (timing: Timing) => (timing.receita === 'texto-e-musica' && timing.bpm ? 60 / timing.bpm : 0.5);
/** quanto o preço leva para contar: 1 s, ou 2 tempos da música */
export const contaPor = (timing: Timing) => (timing.receita === 'texto-e-musica' ? 2 * tempoDaBatida(timing) : 1);
/** passo do 3, 2, 1: 1 s, ou o número inteiro de tempos da música mais perto de 1 s (nunca menos de 1 s: a regra da piscada) */
export const passoContagem = (timing: Timing) => {
  if (timing.receita !== 'texto-e-musica') return 1;
  const b = tempoDaBatida(timing);
  return Math.max(1, Math.ceil(1 / b - 1e-6)) * b;
};

/** Todos os letreiros do vídeo, em ordem: cada um acende na batida dele e vale até o próximo. */
export const eventosLetreiro = (timing: Timing): EventoLetreiro[] =>
  timing.cenas.flatMap((c) => {
    if (c.tipo === 'final' || !c.letreiros?.length) return [];
    const n = c.letreiros.length;
    return c.letreiros.map((linhas, i) => ({ at: c.b[`letreiro${i}`] ?? (i === 0 ? c.ini : c.ini + (i * (c.fim - c.ini)) / n), linhas }));
  });

/** A oferta da cena: o que a cena diz, senão a das respostas (componentes/universo.ts). */
export const dadosOferta = (c: CenaTempo): DadosOferta => {
  if (c.tipo !== 'oferta') return { oQue: null, preco: null, antigo: null, selo: null, prazo: null };
  const tem = (k: string) => Object.prototype.hasOwnProperty.call(c, k);
  return {
    oQue: tem('o_que') ? c.o_que ?? null : OFERTA.oQue,
    preco: tem('preco') ? c.preco ?? null : OFERTA.preco,
    antigo: tem('preco_antigo') ? c.preco_antigo ?? null : tem('preco') ? null : OFERTA.precoAntigo,
    selo: tem('selo') ? c.selo ?? null : OFERTA.selo,
    prazo: tem('prazo') ? c.prazo ?? null : OFERTA.prazo,
  };
};

/** A contagem da cena: relógio a partir do "relogio" (HH:MM:SS) ou 3, 2, 1 a partir do "de". */
export const dadosContagem = (c: CenaTempo): DadosContagem => {
  if (c.tipo !== 'contagem') return { forma: 'relogio', inicio: 0, comHora: true, de: 3, rotulo: null, prazo: null, fim: '' };
  const tem = (k: string) => Object.prototype.hasOwnProperty.call(c, k);
  const rel = c.relogio ?? '02:00:00';
  return {
    forma: c.forma ?? 'relogio',
    inicio: lerRelogio(rel) ?? 7200,
    comHora: rel.split(':').length === 3,
    de: Math.max(1, Math.min(10, c.de ?? 3)),
    rotulo: tem('rotulo') ? c.rotulo ?? null : 'termina em',
    prazo: tem('prazo') ? c.prazo ?? null : OFERTA.prazo,
    fim: c.texto_final ?? 'agora',
  };
};

/** Instante do card final: a batida "card", senão 0,4 s depois da voz (na narração) ou o começo da cena. */
export const tempoDoCard = (c: CenaTempo, timing: Timing) => c.b.card ?? (timing.receita === 'texto-e-musica' ? c.ini : Math.max(c.ini, timing.voiceEnd + 0.4));

/** a chamada do card final: a da cena, senão a das respostas */
export const chamadaDo = (c: CenaTempo) => (c.tipo === 'final' && c.chamada !== undefined ? c.chamada : FECHO.chamada);

/** Tempos sintéticos (cada cena com "dur" segundos), para os stills e a folha do _preview. */
export const comTempoSintetico = (cenas: CenaDados[], dur = 6): Timing => {
  const lista: CenaTempo[] = cenas.map((c, i) => ({ ...c, ini: i * dur, fim: (i + 1) * dur, b: {} }) as CenaTempo);
  return { cenas: lista, voiceEnd: cenas.length * dur - 2.6, total: cenas.length * dur };
};
