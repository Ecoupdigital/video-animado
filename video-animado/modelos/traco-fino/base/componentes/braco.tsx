import React from 'react';
import { COR, Pele, TRACO } from './cores';

// Braço do adulto: dois segmentos com contorno (manga e antebraço) e a mão oval.

export type Ponto = [number, number];

/** Braço de dois segmentos com contorno: manga até o cotovelo (ou até o punho) e antebraço de pele. */
export const Braco: React.FC<{
  ombro: Ponto;
  cotovelo: Ponto;
  mao: Ponto;
  pele: Pele;
  manga: string;
  /** 0 = sem manga, 1 = até o cotovelo, 2 = até o punho. */
  manga_ate?: number;
  espessura?: number;
  apontar?: Ponto | null;
}> = ({ ombro, cotovelo, mao, pele, manga, manga_ate = 1, espessura = 30, apontar }) => {
  const seg = (a: Ponto, b: Ponto, cor: string, larg: number, key: string) => (
    <g key={key}>
      <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`} stroke={COR.tinta} strokeWidth={larg + TRACO * 2} strokeLinecap="round" />
      <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`} stroke={cor} strokeWidth={larg} strokeLinecap="round" />
    </g>
  );
  const corAntebraco = manga_ate >= 2 ? manga : pele.base;
  const corBraco = manga_ate >= 1 ? manga : pele.base;
  return (
    <g>
      {seg(cotovelo, mao, corAntebraco, espessura * 0.82, 'a')}
      {seg(ombro, cotovelo, corBraco, manga_ate >= 1 ? espessura * 1.12 : espessura, 'b')}
      {/* junta do cotovelo sem costura aparente */}
      <circle cx={cotovelo[0]} cy={cotovelo[1]} r={(manga_ate >= 1 ? espessura * 1.12 : espessura * 0.82) / 2 - 0.5} fill={corBraco} />
      {manga_ate === 1 && (
        <path
          d={`M ${cotovelo[0] - espessura * 0.62} ${cotovelo[1]} L ${cotovelo[0] + espessura * 0.62} ${cotovelo[1]}`}
          stroke={COR.tinta}
          strokeWidth={TRACO * 0.8}
          transform={`rotate(${(Math.atan2(cotovelo[1] - ombro[1], cotovelo[0] - ombro[0]) * 180) / Math.PI - 90} ${cotovelo[0]} ${cotovelo[1]})`}
        />
      )}
      {manga_ate >= 2 && (
        <path
          d={`M ${mao[0] - espessura * 0.5} ${mao[1]} L ${mao[0] + espessura * 0.5} ${mao[1]}`}
          stroke={COR.tinta}
          strokeWidth={TRACO * 0.8}
          transform={`rotate(${(Math.atan2(mao[1] - cotovelo[1], mao[0] - cotovelo[0]) * 180) / Math.PI - 90} ${mao[0]} ${mao[1]}) translate(0 ${-espessura * 0.45})`}
        />
      )}
      {apontar && <path d={`M ${mao[0]} ${mao[1]} l ${apontar[0]} ${apontar[1]}`} stroke={COR.tinta} strokeWidth={7 + TRACO * 2} strokeLinecap="round" />}
      {apontar && <path d={`M ${mao[0]} ${mao[1]} l ${apontar[0]} ${apontar[1]}`} stroke={pele.base} strokeWidth={7} strokeLinecap="round" />}
      <ellipse cx={mao[0]} cy={mao[1]} rx={espessura * 0.48} ry={espessura * 0.56} fill={pele.base} stroke={COR.tinta} strokeWidth={TRACO} />
    </g>
  );
};
