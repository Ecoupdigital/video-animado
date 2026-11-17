// Movimentos sutis comuns a todos os personagens: piscar e respirar.
// Tudo é função do frame, então o mesmo frame sempre desenha igual (o Remotion exige isso).

/** Escala vertical dos olhos (1 = aberto). Pisca a cada ~3,5 s, nunca no frame 0. */
export const piscada = (frame: number, semente = 0): number => {
  const periodo = 97 + (semente % 5) * 7; // períodos diferentes por personagem
  const pos = (frame + 20 + semente * 13) % periodo;
  const seq = [0.55, 0.1, 0.1, 0.55];
  const inicio = periodo - seq.length;
  if (pos >= inicio) return seq[pos - inicio];
  return 1;
};

/** Valor entre -1 e 1 que oscila devagar (respiração). */
export const respiracao = (frame: number, fps = 30, semente = 0): number =>
  Math.sin((frame / fps) * Math.PI * 0.55 + semente);

/** Balanço com atraso (coque, orelha, rabo). */
export const balanco = (frame: number, fps = 30, velocidade = 1.3, semente = 0): number =>
  Math.sin((frame / fps) * Math.PI * velocidade + semente);

/** Ponto entre dois pontos. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
