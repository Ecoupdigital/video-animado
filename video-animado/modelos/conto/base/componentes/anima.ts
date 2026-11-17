// Movimentos comuns a todos os personagens do Conto, em qualquer tema: piscar, respirar, balançar e quicar.
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
export const respiracao = (frame: number, fps = 30, semente = 0): number => Math.sin((frame / fps) * Math.PI * 0.55 + semente);

/** Balanço (aceno, cabelo, braço que gesticula). */
export const balanco = (frame: number, fps = 30, velocidade = 1.3, semente = 0): number => Math.sin((frame / fps) * Math.PI * velocidade + semente);

/** Ponto entre dois valores. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Quique (squash and stretch) dos bonecos: achata e estica pelo volume da fala e pela reação da expressão.
 * Devolve a escala x, a escala y e o pulo (px para cima, no desenho de 900 de altura).
 */
export const quique = (falando: number, reacao: number, frame: number, parada: boolean, fps = 30) => {
  const v = Math.max(0, Math.min(1, falando));
  // reação: um pulinho contínuo e leve (surpresa, rindo); parado, só a pose
  const pulo = parada ? reacao * 0.5 : reacao * Math.abs(Math.sin((frame / fps) * Math.PI * 2.2));
  const estica = v * 0.075 + pulo * 0.05;
  return { sx: 1 - estica * 0.6, sy: 1 + estica, dy: -(v * 14 + pulo * 26) };
};
