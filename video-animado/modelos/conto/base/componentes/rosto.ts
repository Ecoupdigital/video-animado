// Expressões e poses do Conto: os mesmos nomes e a mesma receita em todos os temas. Cada módulo de tema
// (componentes/temas/<id>/traco.tsx) lê esta receita e desenha no traço dele: o papel recortado com olhos de
// ponto e braço de duas peças presas por colchete, as formas com olhos grandes e braço de traço.

export type Expressao = 'neutra' | 'falando' | 'feliz' | 'triste' | 'surpresa' | 'brava' | 'pensando' | 'rindo';
export const EXPRESSOES: Expressao[] = ['neutra', 'falando', 'feliz', 'triste', 'surpresa', 'brava', 'pensando', 'rindo'];

export type Olhar = 'frente' | 'esquerda' | 'direita' | 'cima' | 'baixo';
export const OLHARES: Olhar[] = ['frente', 'esquerda', 'direita', 'cima', 'baixo'];

export type TipoOlho = 'aberto' | 'grande' | 'meio' | 'fechado';
export type TipoBoca = 'linha' | 'sorriso' | 'sorrisoAberto' | 'o' | 'triste' | 'brava' | 'torta' | 'gargalhada';
export type PoseBracos = 'repouso' | 'gesto' | 'aceno' | 'caido' | 'cima' | 'cintura' | 'queixo' | 'barriga';

export type Spec = {
  olho: TipoOlho;
  boca: TipoBoca;
  /** sobrancelha: [altura, inclinação]; altura negativa sobe; inclinação positiva desce a ponta de dentro (bravo),
   *  negativa sobe a ponta de dentro (triste) */
  sobr: [number, number];
  /** sobrancelha direita diferente (pensando) */
  sobrDir?: [number, number];
  /** rubor das bochechas (0 a 1) */
  bochecha: number;
  bracos: PoseBracos;
  /** 0 a 1: quanto o corpo reage (pulinho das formas, salto do boneco de papel) */
  reacao: number;
  /** tremidinha de raiva */
  treme?: boolean;
  olharPadrao?: Olhar;
};

export const SPEC: Record<Expressao, Spec> = {
  neutra: { olho: 'aberto', boca: 'linha', sobr: [0, 0], bochecha: 0.55, bracos: 'repouso', reacao: 0 },
  falando: { olho: 'aberto', boca: 'sorriso', sobr: [-4, 0], bochecha: 0.6, bracos: 'gesto', reacao: 0 },
  feliz: { olho: 'aberto', boca: 'sorrisoAberto', sobr: [-8, -2], bochecha: 0.85, bracos: 'aceno', reacao: 0.25 },
  triste: { olho: 'meio', boca: 'triste', sobr: [0, -9], bochecha: 0.3, bracos: 'caido', reacao: 0, olharPadrao: 'baixo' },
  surpresa: { olho: 'grande', boca: 'o', sobr: [-14, 0], bochecha: 0.5, bracos: 'cima', reacao: 0.6 },
  brava: { olho: 'aberto', boca: 'brava', sobr: [4, 11], bochecha: 0.75, bracos: 'cintura', reacao: 0, treme: true },
  pensando: { olho: 'aberto', boca: 'torta', sobr: [-2, 3], sobrDir: [-12, -3], bochecha: 0.45, bracos: 'queixo', reacao: 0, olharPadrao: 'cima' },
  rindo: { olho: 'fechado', boca: 'gargalhada', sobr: [-6, -2], bochecha: 0.9, bracos: 'barriga', reacao: 0.5 },
};

/** Deslocamento da pupila (em fração do raio do olho) para cada olhar. */
export const desloc = (o: Olhar): [number, number] => {
  switch (o) {
    case 'esquerda':
      return [-1, 0.05];
    case 'direita':
      return [1, 0.05];
    case 'cima':
      return [0.25, -0.9];
    case 'baixo':
      return [0, 0.85];
    default:
      return [0, 0];
  }
};

/**
 * Ângulos do braço (graus) para cada pose: [ombro, cotovelo] de cada lado, medidos a partir do braço caído;
 * positivo abre para fora e para cima, o cotovelo soma ao ombro. `v` é o volume da fala e `t` o tempo em
 * segundos (o aceno e o gesto oscilam; parado, t = 0).
 */
export const angulosBracos = (pose: PoseBracos, v: number, t: number): { esq: [number, number]; dir: [number, number] } => {
  const osc = Math.sin(t * Math.PI * 2.4);
  const repouso: [number, number] = [16, -6];
  switch (pose) {
    case 'gesto':
      return { esq: repouso, dir: [30 + 34 * v + 6 * osc * v, 48 * v] };
    case 'aceno':
      return { esq: repouso, dir: [148, 18 + 22 * osc] };
    case 'caido':
      return { esq: [5, 0], dir: [5, 0] };
    case 'cima':
      return { esq: [138, 22], dir: [138, 22] };
    case 'cintura':
      return { esq: [50, -74], dir: [50, -74] };
    case 'queixo':
      return { esq: repouso, dir: [96, -206] };
    case 'barriga':
      return { esq: [24, -78], dir: [24, -78] };
    default:
      return { esq: repouso, dir: repouso };
  }
};

/** Ponta do segmento: parte de (x, y), com o ângulo a partir do braço caído (lado -1 = esquerda da tela). */
export const ponta = (x: number, y: number, ang: number, comp: number, lado: -1 | 1): [number, number] => {
  const r = (ang * Math.PI) / 180;
  return [x + lado * Math.sin(r) * comp, y + Math.cos(r) * comp];
};

/**
 * Braço de duas peças que leva a mão até um ponto (mão no queixo, na cintura): devolve o cotovelo e a mão.
 * O cotovelo dobra para baixo. Ponto fora do alcance: a mão vai o mais perto que dá, na direção dele.
 */
export const alcancar = (ombro: [number, number], alvo: [number, number], l1: number, l2: number): { cotovelo: [number, number]; mao: [number, number] } => {
  const dx = alvo[0] - ombro[0];
  const dy = alvo[1] - ombro[1];
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01));
  const a = Math.atan2(dy, dx);
  const b = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const opcoes = [a + b, a - b].map((ang) => [ombro[0] + Math.cos(ang) * l1, ombro[1] + Math.sin(ang) * l1] as [number, number]);
  const cotovelo = opcoes[0][1] >= opcoes[1][1] ? opcoes[0] : opcoes[1];
  const k = Math.atan2(alvo[1] - cotovelo[1], alvo[0] - cotovelo[0]);
  return { cotovelo, mao: [cotovelo[0] + Math.cos(k) * l2, cotovelo[1] + Math.sin(k) * l2] };
};
