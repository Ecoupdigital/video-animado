// Roteiro do vídeo pixel e o tempo de cada coisa, tirado das palavras da narração (dados.ts).
// O roteiro diz as seções: texto falado, título em 2 linhas, palavras de destaque, gesto e o card, com a palavra
// em que cada elemento do card entra (campo "em"). Nenhum tempo é digitado à mão: a seção começa na primeira
// palavra dela e cada elemento entra quando a palavra marcada é falada.

export type Gesto = 'nada' | 'uma' | 'duas' | 'ombros';
export const GESTOS: Gesto[] = ['nada', 'uma', 'duas', 'ombros'];
export type Palavra = { i: number; w: string; s: number };
/** [início, fim, forma] em segundos; formas A a H e X (Rhubarb) */
export type Boca = [number, number, string];

export type Item = { texto: string; nota?: string; em?: string };
export type CardLista = { molde: 'lista'; rotulo?: string; titulo?: string; itens: Item[] };
export type Mensagem = { quem: string; texto: string; em?: string; lado?: 'esq' | 'dir' };
export type CardConversa = { molde: 'conversa'; rotulo?: string; mensagens: Mensagem[] };
export type CardSelo = { molde: 'selo'; rotulo?: string; titulo: string; selo: string; em?: string; icone?: string; etiquetas?: Item[] };
export type Bloco = { rotulo: string; valor: string; em?: string };
export type CardBlocos = { molde: 'blocos'; rotulo?: string; blocos: Bloco[] };
export type Card = CardLista | CardConversa | CardSelo | CardBlocos;
export const MOLDES = ['lista', 'conversa', 'selo', 'blocos'] as const;

export type Secao = { texto: string; titulo: string[]; destaque?: string[]; legenda?: string[]; gesto?: Gesto; card: Card };
export type Final = { duracao?: number; titulo?: string[]; gesto?: Gesto };
export type Roteiro = { secoes: Secao[]; final?: Final };

/** palavra sem acento, sem pontuação, minúscula (para casar o roteiro com a transcrição) */
export const norm = (w: string) =>
  w
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export type SecaoT = Secao & {
  /** índice */
  k: number;
  /** começo e fim da seção, em segundos */
  a: number;
  b: number;
  /** palavras da seção em PALAVRAS: [w0, w1) */
  w0: number;
  w1: number;
  /** segundo em que a palavra "em" é falada nesta seção (ou o padrão) */
  em: (palavra: string | undefined, padrao: number) => number;
};
export type Montado = {
  secoes: SecaoT[];
  /** fim da voz e começo do card final */
  fim: number;
  /** duração total, com o card final */
  total: number;
  final: Required<Pick<Final, 'duracao' | 'gesto'>> & { titulo: string[] };
  palavras: Palavra[];
  bocas: Boca[];
  /** palavras de destaque da legenda (normalizadas) */
  realce: Set<string>;
};

const ANTES = 0.15;

export const montar = (r: Roteiro, palavras: Palavra[], bocas: Boca[], fimVoz: number): Montado => {
  const secs = r.secoes ?? [];
  const contagem = secs.map((s) => s.texto.split(/\s+/).filter(Boolean).length);
  const total = contagem.reduce((a, b) => a + b, 0);
  const ultimaPalavra = palavras.length ? palavras[palavras.length - 1].s : 0;
  const fim = Math.max(fimVoz, ultimaPalavra + 0.3);
  // se a transcrição não tem o mesmo número de palavras do roteiro, reparte pela proporção
  const idx = (n: number) => (palavras.length === total || total === 0 ? n : Math.round((n * palavras.length) / total));
  let acc = 0;
  const secoes: SecaoT[] = secs.map((s, k) => {
    const w0 = idx(acc);
    acc += contagem[k];
    const w1 = idx(acc);
    return { ...s, k, w0, w1, a: 0, b: 0, em: () => 0 };
  });
  secoes.forEach((s, k) => {
    s.a = k === 0 ? 0 : Math.max(0, (palavras[s.w0]?.s ?? 0) - ANTES);
  });
  secoes.forEach((s, k) => {
    s.b = k + 1 < secoes.length ? secoes[k + 1].a : fim;
    const ws = palavras.slice(s.w0, s.w1);
    s.em = (palavra, padrao) => {
      if (!palavra) return padrao;
      const alvo = palavra.split(/\s+/).map(norm).filter(Boolean);
      for (let i = 0; i + alvo.length <= ws.length; i++) {
        if (alvo.every((a, j) => norm(ws[i + j].w) === a)) return ws[i].s;
      }
      return padrao;
    };
  });
  const realce = new Set<string>();
  for (const s of secs) for (const w of [...(s.destaque ?? []), ...(s.legenda ?? [])]) for (const p of w.split(/\s+/)) realce.add(norm(p));
  const fin = r.final ?? {};
  const ultima = secs[secs.length - 1];
  const final = { duracao: fin.duracao ?? 3, gesto: fin.gesto ?? 'uma', titulo: fin.titulo ?? ultima?.titulo ?? [] };
  return { secoes, fim, total: fim + final.duracao, final, palavras, bocas, realce };
};

/** Palavras e bocas sintéticas a partir do roteiro (prévia e stills, sem voz): cerca de 2,8 palavras por segundo. */
export const tempoSintetico = (r: Roteiro, ritmo = 2.8, pausa = 0.35) => {
  const palavras: Palavra[] = [];
  const bocas: Boca[] = [];
  const ciclo = ['C', 'B', 'D', 'B'];
  let t = 0.2;
  for (const s of r.secoes) {
    const ps = s.texto.split(/\s+/).filter(Boolean);
    const d = Math.max(0.9, ps.length / ritmo);
    const pesos = ps.map((p) => p.length + 1);
    const tot = pesos.reduce((a, b) => a + b, 0);
    for (const [j, p] of ps.entries()) {
      const fatia = (d * pesos[j]) / tot;
      palavras.push({ i: palavras.length, w: p, s: Math.round(t * 100) / 100 });
      const n = Math.max(1, Math.round((fatia * 0.85) / 0.09));
      for (let q = 0; q < n; q++) bocas.push([t + q * 0.09, t + (q + 1) * 0.09, ciclo[(palavras.length + q) % ciclo.length]]);
      t += fatia;
    }
    t += pausa;
  }
  return { palavras, bocas, fim: Math.round(t * 100) / 100 };
};
