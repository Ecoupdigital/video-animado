import React from 'react';
import { Expressao } from './rosto';

export type Ponto = [number, number];

export type BracoProps = {
  ombro: Ponto;
  cotovelo: Ponto;
  mao: Ponto;
  pele: string;
  manga: string;
  /** 0 a 1: quanto do braço a manga cobre (0.45 = manga curta, 1.1 = até o cotovelo e um pouco além). */
  comprimentoManga?: number;
  espessura?: number;
  apontar?: Ponto | null; // direção do dedo, se estiver apontando
  /** Contorno da mão (usar o tom de sombra da pele quando a mão encosta no rosto). */
  contornoMao?: string;
};

const meio = (a: Ponto, b: Ponto, t: number): Ponto => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export const Braco: React.FC<BracoProps> = ({
  ombro,
  cotovelo,
  mao,
  pele,
  manga,
  comprimentoManga = 0.5,
  espessura = 30,
  apontar,
  contornoMao,
}) => {
  const fim = comprimentoManga <= 1 ? meio(ombro, cotovelo, comprimentoManga) : meio(cotovelo, mao, comprimentoManga - 1);
  const mangaD =
    comprimentoManga <= 1
      ? `M ${ombro[0]} ${ombro[1]} L ${fim[0]} ${fim[1]}`
      : `M ${ombro[0]} ${ombro[1]} L ${cotovelo[0]} ${cotovelo[1]} L ${fim[0]} ${fim[1]}`;
  return (
    <g>
      <path
        d={`M ${ombro[0]} ${ombro[1]} L ${cotovelo[0]} ${cotovelo[1]} L ${mao[0]} ${mao[1]}`}
        stroke={pele}
        strokeWidth={espessura}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={mangaD} stroke={manga} strokeWidth={espessura * 1.32} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {apontar && (
        <path
          d={`M ${mao[0]} ${mao[1]} L ${mao[0] + apontar[0]} ${mao[1] + apontar[1]}`}
          stroke={pele}
          strokeWidth={espessura * 0.36}
          strokeLinecap="round"
        />
      )}
      <circle cx={mao[0]} cy={mao[1]} r={espessura * 0.58} fill={pele} stroke={contornoMao} strokeWidth={contornoMao ? 3.5 : 0} />
    </g>
  );
};

export type Segurando = 'nada' | 'celular' | 'objeto' | 'bebe';

export type Pose = {
  esq: { cotovelo: Ponto; mao: Ponto; apontar?: Ponto | null };
  dir: { cotovelo: Ponto; mao: Ponto; apontar?: Ponto | null };
};

/**
 * Poses dos braços para um corpo de 400 x 900 com ombros em (146, 420) e (254, 420).
 * "esq" e "dir" são do ponto de vista de quem assiste.
 * Com segurando="objeto" a mão direita sobe até (292, 410), onde a Pessoa desenha o objeto.
 */
export const poseDe = (expressao: Expressao, segurando: Segurando, barriga: number, t: number): Pose => {
  const balancoMao = Math.sin(t * 5) * 6; // gesto de quem fala
  const repousoEsq = { cotovelo: [120, 525] as Ponto, mao: [126, 615] as Ponto };
  const repousoDir = { cotovelo: [280, 525] as Ponto, mao: [274, 615] as Ponto };
  const maoNaBarriga = { cotovelo: [288, 520] as Ponto, mao: [250, 585] as Ponto };
  const dirBase = barriga > 0.45 ? maoNaBarriga : repousoDir;

  if (segurando === 'celular') {
    return {
      esq: { cotovelo: [128, 545], mao: [176, 492] },
      dir: { cotovelo: [272, 545], mao: [224, 492] },
    };
  }
  if (segurando === 'objeto') {
    return {
      esq: repousoEsq,
      dir: { cotovelo: [306, 500], mao: [292, 410] },
    };
  }
  if (segurando === 'bebe') {
    return {
      esq: { cotovelo: [122, 560], mao: [236, 600] },
      dir: { cotovelo: [292, 545], mao: [268, 530] },
    };
  }

  switch (expressao) {
    case 'apontando':
      return { esq: repousoEsq, dir: { cotovelo: [318, 385], mao: [344, 305], apontar: [10, -26] } };
    case 'pensando':
      return { esq: { cotovelo: [112, 500], mao: [160, 372], apontar: [14, -8] }, dir: dirBase };
    case 'ansiosa':
      return {
        esq: { cotovelo: [98, 470], mao: [96, 318 + balancoMao * 0.3] },
        dir: { cotovelo: [302, 470], mao: [304, 318 - balancoMao * 0.3] },
      };
    case 'surpresa':
      return { esq: { cotovelo: [88, 440], mao: [66, 360] }, dir: { cotovelo: [312, 440], mao: [334, 360] } };
    case 'feliz':
      return { esq: { cotovelo: [104, 505], mao: [80, 585] }, dir: { cotovelo: [296, 505], mao: [320, 585] } };
    case 'rindo':
      return { esq: repousoEsq, dir: { cotovelo: [282, 525], mao: [236, 575] } };
    case 'emocionada':
      return { esq: { cotovelo: [128, 525], mao: [184, 470] }, dir: { cotovelo: [272, 525], mao: [216, 470] } };
    case 'cansada':
      return { esq: { cotovelo: [128, 540], mao: [138, 640] }, dir: { cotovelo: [272, 540], mao: [262, 640] } };
    case 'falando':
      return { esq: repousoEsq, dir: { cotovelo: [292, 535], mao: [318, 458 + balancoMao] } };
    default:
      return { esq: repousoEsq, dir: dirBase };
  }
};
