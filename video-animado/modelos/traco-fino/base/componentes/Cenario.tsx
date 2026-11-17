import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COR } from './cores';

// Base dos cenários: tela vertical 1080 x 1920, 3 camadas com profundidade.
// Os personagens pisam na linha CHAO_Y (pés em y = 1640 com escala 1).
export const LARGURA = 1080;
export const ALTURA = 1920;
export const CHAO_Y = 1640;

/** Luz da cena. O cenário é desenhado uma vez só e a luz vem por cima, em multiply. */
export type Luz = 'manha' | 'tarde' | 'madrugada';
export const LUZES: Luz[] = ['manha', 'tarde', 'madrugada'];

export type CenarioBaseProps = {
  luz?: Luz;
  /** -1 a 1: anda a câmera para os lados (cada camada mexe diferente). */
  camera?: number;
  /** 1 = normal. Zoom centrado no meio do chão. */
  zoom?: number;
};

/** Camada com parallax. fator 0.3 = fundo, 0.6 = meio, 1 = frente. */
export const Camada: React.FC<{ camera: number; fator: number; children: React.ReactNode }> = ({ camera, fator, children }) => (
  <g transform={`translate(${-camera * 140 * fator} 0)`}>{children}</g>
);

export const QuadroCenario: React.FC<{ zoom: number; children: React.ReactNode }> = ({ zoom, children }) => (
  <svg width="100%" height="100%" viewBox={`0 0 ${LARGURA} ${ALTURA}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
    <g transform={`translate(${LARGURA / 2} ${CHAO_Y}) scale(${zoom}) translate(${-LARGURA / 2} ${-CHAO_Y})`}>{children}</g>
  </svg>
);

/** Cor do céu pela luz. */
export const corCeu = (luz: Luz) => (luz === 'madrugada' ? COR.ceuMadrugada : luz === 'tarde' ? COR.ceuTarde : COR.ceuDia);

/** Véu de luz por cima do cenário (dentro do SVG). Manhã não tem véu. */
export const VeuLuz: React.FC<{ luz: Luz }> = ({ luz }) =>
  luz === 'manha' ? null : (
    <rect
      x={-600}
      y={-400}
      width={LARGURA + 1200}
      height={ALTURA + 800}
      fill={luz === 'tarde' ? '#F6C99A' : '#7F8FB8'}
      opacity={luz === 'tarde' ? 0.32 : 1}
      style={{ mixBlendMode: 'multiply' }}
    />
  );

/** Luz quente de abajur na madrugada (centro em x, y). Vai por cima do véu. */
export const Abajur: React.FC<{ x: number; y: number; raio?: number }> = ({ x, y, raio = 520 }) => (
  <g style={{ mixBlendMode: 'screen' }}>
    <defs>
      <radialGradient id={`abajur-${x}-${y}`}>
        <stop offset="0%" stopColor="#7A5A2E" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#7A5A2E" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={raio} fill={`url(#abajur-${x}-${y})`} />
  </g>
);

/** Personagem na mesma luz do cenário (filtro CSS, sem redesenhar). */
export const NaLuz: React.FC<{ luz: Luz; children: React.ReactNode }> = ({ luz, children }) =>
  luz === 'manha' ? (
    <>{children}</>
  ) : (
    <div style={{ filter: luz === 'tarde' ? 'sepia(0.18) saturate(1.05) brightness(0.98)' : 'brightness(0.72) saturate(0.8) hue-rotate(-8deg)' }}>{children}</div>
  );

/**
 * Lembrança: tudo que for "antes" passa por aqui (cenário e personagens; selo, legenda, caderno e fecho
 * ficam de fora). Tons apagados e quentes, em sépia, com vinheta suave. intensidade 0 a 1 (para o dissolve).
 */
export const Lembranca: React.FC<{ intensidade?: number; children: React.ReactNode }> = ({ intensidade = 1, children }) => {
  const k = Math.max(0, Math.min(1, intensidade));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `sepia(${0.55 * k}) saturate(${1 - 0.5 * k}) contrast(${1 - 0.1 * k}) brightness(${1 + 0.04 * k})` }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,45,30,0.38) 100%)',
          opacity: k,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Texto de placa (SVG) que sempre cabe em `largura`: encolhe até `min` numa linha; se ainda não couber,
 * quebra em duas linhas. Centro horizontal em x; `y` é a linha de base quando cabe numa linha (com duas,
 * o bloco fica centrado na mesma altura).
 */
export const TextoQueCabe: React.FC<{ texto: string; x: number; y: number; largura: number; max: number; min: number; k?: number; fonte: string; peso?: number; cor: string }> = ({
  texto,
  x,
  y,
  largura,
  max,
  min,
  k = 0.56,
  fonte,
  peso = 600,
  cor,
}) => {
  const tamanhoUma = Math.min(max, largura / Math.max(1, texto.length * k));
  if (tamanhoUma >= min || !texto.includes(' ')) {
    return (
      <text x={x} y={y} textAnchor="middle" fontFamily={fonte} fontWeight={peso} fontSize={tamanhoUma} fill={cor}>
        {texto}
      </text>
    );
  }
  const palavras = texto.split(/\s+/);
  let melhor: [string, string] = [texto, ''];
  for (let i = 1; i < palavras.length; i++) {
    const a = palavras.slice(0, i).join(' ');
    const b = palavras.slice(i).join(' ');
    if (!melhor[1] || Math.max(a.length, b.length) < Math.max(melhor[0].length, melhor[1].length)) melhor = [a, b];
  }
  const maior = Math.max(melhor[0].length, melhor[1].length);
  const tamanho = Math.max(min * 0.6, Math.min(max * 0.8, largura / (maior * k)));
  return (
    <text x={x} y={y - tamanho * 0.55} textAnchor="middle" fontFamily={fonte} fontWeight={peso} fontSize={tamanho} fill={cor}>
      <tspan x={x}>{melhor[0]}</tspan>
      <tspan x={x} dy={tamanho * 1.05}>
        {melhor[1]}
      </tspan>
    </text>
  );
};
