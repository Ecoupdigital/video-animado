// Dados das cenas: o que o roteiro de cada vídeo (roteiro-falas.json) diz e o que o timing.json devolve.
// As cenas são montadas por estes dados; nenhum tempo é digitado à mão. Cada cena tem a narração dela
// ("texto") e as batidas ("batidas": papel -> palavra do texto); o _ferramentas/timing.py acha o instante
// de cada palavra no words.json e grava o timing.json com ini, fim, as palavras do título e as batidas.
// Os tipos de cena valem nos 4 temas: o tema troca o visual, não o roteiro.

export type NomeIcone =
  | 'moeda'
  | 'calendario'
  | 'documento'
  | 'relogio'
  | 'grafico'
  | 'pessoa'
  | 'check'
  | 'alerta'
  | 'etiqueta'
  | 'lampada'
  | 'carteira'
  | 'porcento'
  | 'casa'
  | 'lista';

export type Passo = { texto: string; icone?: NomeIcone };
export type Cartao = { texto: string; coluna: number; vai?: number };
export type Tela = { secao: string; botao: string; menu?: string[]; itens?: string[]; novo?: string };

export type CenaDados =
  | { tipo: 'abertura'; titulo: string; rotulo?: string; subtitulo?: string; icone?: NomeIcone }
  | { tipo: 'passos'; titulo: string; passos: Passo[]; legenda?: string }
  | { tipo: 'conta'; titulo: string; linhas: string[]; resultado: string; legenda?: string }
  | { tipo: 'colunas'; titulo: string; colunas: string[]; cartoes: Cartao[]; legenda?: string }
  | { tipo: 'tela'; titulo: string; tela: Tela; legenda?: string }
  | { tipo: 'final'; pergunta: string; fontes?: string[] };

export type TipoCena = CenaDados['tipo'];
export const TIPOS_CENA: TipoCena[] = ['abertura', 'passos', 'conta', 'colunas', 'tela', 'final'];

/** Palavra do título com o instante em que é falada (d = destaque, marcada com *palavra* no roteiro). */
export type PalavraTitulo = { w: string; at: number; d?: boolean };

/** Uma cena com os tempos do timing.json (segundos do áudio final). */
export type CenaTempo = CenaDados & {
  ini: number;
  fim: number;
  /** palavras do título (ou da pergunta do final), cada uma no instante falado */
  palavras: PalavraTitulo[];
  /** batidas: papel -> segundo (só as marcadas no roteiro) */
  b: Record<string, number>;
};

export type Timing = { cenas: CenaTempo[]; voiceEnd: number; total: number; rotulo?: string };

/** Instante de uma batida: o marcado no roteiro, senão a fração da cena (só ordem visual, não tempo de fala). */
export const batida = (c: CenaTempo, papel: string, fracao: number) => c.b[papel] ?? c.ini + fracao * (c.fim - c.ini);

/** Palavras de um título com *destaque*, distribuídas a partir de "ini" (para os stills sem narração). */
export const palavrasDe = (titulo: string, ini: number, passo = 0.18): PalavraTitulo[] =>
  titulo
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => {
      const d = /^\*/.test(w) || /\*[.,:;!?]*$/.test(w);
      return { w: w.replace(/\*/g, ''), at: ini + 0.1 + i * passo, d: d || undefined };
    });

/** Tempos sintéticos (cada cena com "dur" segundos), para os stills e a folha do _preview. */
export const comTempoSintetico = (cenas: CenaDados[], dur = 6): Timing => {
  const lista: CenaTempo[] = cenas.map((c, i) => {
    const ini = i * dur;
    const fim = (i + 1) * dur;
    const titulo = c.tipo === 'final' ? c.pergunta : c.titulo;
    return { ...c, ini, fim, palavras: palavrasDe(titulo, ini), b: {} } as CenaTempo;
  });
  const voiceEnd = cenas.length * dur - 2.6;
  return { cenas: lista, voiceEnd, total: cenas.length * dur };
};

/** Trechos de um texto com *destaque*: [texto, destaque?] (para linhas de conta e textos de caixa). */
export const trechos = (texto: string): [string, boolean][] => {
  const partes: [string, boolean][] = [];
  const re = /\*([^*]+)\*/g;
  let pos = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    if (m.index > pos) partes.push([texto.slice(pos, m.index), false]);
    partes.push([m[1], true]);
    pos = m.index + m[0].length;
  }
  if (pos < texto.length) partes.push([texto.slice(pos), false]);
  return partes;
};
export const semMarcas = (texto: string) => texto.replace(/\*/g, '');
