import opcoes from './opcoes.json';
import { CORES } from './universo';

// Paleta por papel. O preset é o "claro-violeta" (o da referência); o universo.ts troca qualquer papel
// (cores.paleta das respostas, ou o destaque da marca com cores.origem "marca"). Os componentes pegam a cor
// pelo papel (P.destaque), nunca por hex fixo.
export type Paleta = (typeof opcoes.paletas)['claro-violeta'];
export type PapelCor = keyof Paleta;
export const P: Paleta = { ...opcoes.paletas['claro-violeta'], ...CORES };

/** A cor com transparência (0 a 1), para sombras e véus. */
export const alfa = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
