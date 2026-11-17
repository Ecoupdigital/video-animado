// Dados das cenas: o que o roteiro de cada vídeo (roteiro-falas.json) diz e o que o timing.json devolve.
// As cenas são montadas por estes dados; nenhum tempo é digitado à mão. Cada cena tem a narração dela
// ("texto") e as batidas ("batidas": papel -> palavra do texto); o _ferramentas/timing.py acha o instante
// de cada palavra no words.json e grava o timing.json com ini, fim, as palavras do título e as batidas.

export type Pessoa = { nome: string; papel: string; foto?: string; etiqueta?: string };
export type Valor = { numero: number; prefixo?: string; sufixo?: string; casas?: number; legenda?: string };
export type Marco = { data: string; texto: string; alerta?: boolean };

export type CenaDados =
  | { tipo: 'gancho'; titulo: string; rotulo?: string; valor?: Valor; linha?: string; pessoa?: Pessoa; carimbo?: string }
  | { tipo: 'ficha'; titulo: string; pessoa: Pessoa; campos?: { rotulo: string; valor: string }[]; marcos?: Marco[]; carimbo?: string }
  | { tipo: 'ligacao'; titulo: string; de: Pessoa; para: Pessoa; cards?: { rotulo: string; valor: string; sub?: string }[]; selo?: string; carimbo?: string }
  | { tipo: 'rota'; titulo: string; nos: { nome: string; sub?: string }[]; bloqueio?: string; card?: { titulo: string; sub?: string } }
  | { tipo: 'tombo'; titulo: string; rotulo?: string; valor: Valor }
  | { tipo: 'linha'; titulo: string; marcos: Marco[] }
  | { tipo: 'fonte'; titulo: string; fontes: { veiculo: string; data?: string; texto: string }[] }
  | { tipo: 'final'; pergunta: string; fontes: string[]; cita_pessoas?: boolean; selo?: string };

export type TipoCena = CenaDados['tipo'];
export const TIPOS_CENA: TipoCena[] = ['gancho', 'ficha', 'ligacao', 'rota', 'tombo', 'linha', 'fonte', 'final'];

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

export type Timing = { cenas: CenaTempo[]; voiceEnd: number; total: number; manchetes?: string[] };

/** Instante de uma batida: o marcado no roteiro, senão a fração da cena (só ordem visual, não tempo de fala). */
export const batida = (c: CenaTempo, papel: string, fracao: number) => c.b[papel] ?? c.ini + fracao * (c.fim - c.ini);

/** Palavras de um título com *destaque*, distribuídas a partir de "ini" (para os stills sem narração). */
export const palavrasDe = (titulo: string, ini: number, passo = 0.18): PalavraTitulo[] =>
  titulo
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => {
      const d = /^\*.*\*[.,:;!?]*$/.test(w) || /^\*/.test(w) || /\*[.,:;!?]*$/.test(w);
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
