// Movimentos da Conversa no celular: entrada da bolha, rolagem, pontos do digitando, pulinho da reação.
// Tudo é função do frame, então o mesmo frame sempre desenha igual (o Remotion exige isso).

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** desaceleração cúbica (chega devagar) */
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/** Frames da entrada de uma bolha: a bolha está inteira 5 frames depois do começo da fala (0,17 s). */
export const QUADROS_BOLHA = 5;
/** Frames da rolagem: a conversa termina de subir junto com a bolha nova. */
export const QUADROS_ROLAGEM = 6;

/** Progresso de 0 a 1 de algo que começa no frame f0 e dura `quadros` frames (0 antes, 1 depois). */
export const progresso = (frame: number, f0: number, quadros: number) => (frame < f0 ? 0 : easeOut((frame - f0) / Math.max(1, quadros)));

/** Pulinho da reação: cresce passando um pouco do tamanho e volta (0 antes, 1 no fim). */
export const pulinho = (frame: number, f0: number, quadros = 9) => {
  if (frame < f0) return 0;
  const t = clamp01((frame - f0) / quadros);
  return t >= 1 ? 1 : Math.sin(t * Math.PI * 0.5) * (1 + 0.28 * Math.sin(t * Math.PI));
};

/** Ponto i do digitando (0, 1, 2): sobe e acende um depois do outro, num ciclo de 0,9 s. */
export const pontoDigitando = (frame: number, i: number) => {
  const ciclo = 27;
  const fase = ((frame - i * 5) % ciclo + ciclo) % ciclo;
  const t = fase < 12 ? Math.sin((fase / 12) * Math.PI) : 0;
  return { dy: -9 * t, alfa: 0.45 + 0.55 * t };
};

/** Número pseudoaleatório estável de 0 a 1 a partir de uma semente (a onda do áudio sai sempre igual). */
export const aleatorio = (semente: number) => {
  const x = Math.sin(semente * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
/** Semente a partir de um texto (mesmo texto, mesma semente). */
export const sementeDe = (texto: string) => {
  let h = 7;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) % 100003;
  return h;
};
