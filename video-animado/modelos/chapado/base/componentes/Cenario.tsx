import React from 'react';

// Base dos cenários: tela vertical 1080 x 1920, camadas com profundidade (parallax).
// Os personagens pisam na linha CHAO_Y (pés em y = 1620 com escala 1).
export const LARGURA = 1080;
export const ALTURA = 1920;
export const CHAO_Y = 1620;

export type Hora = 'dia' | 'noite';

export type CenarioBaseProps = {
  hora?: Hora;
  /** -1 a 1: anda a câmera para os lados (cada camada mexe diferente). */
  camera?: number;
  /** 1 = normal. Zoom centrado no meio do chão. */
  zoom?: number;
};

/** Camada com parallax. fator 0.3 = fundo, 0.6 = meio, 1 = frente (acima de 1, passa na frente de tudo). */
export const Camada: React.FC<{ camera: number; fator: number; children: React.ReactNode }> = ({ camera, fator, children }) => (
  <g transform={`translate(${-camera * 140 * fator} 0)`}>{children}</g>
);

export const QuadroCenario: React.FC<{ zoom: number; children: React.ReactNode }> = ({ zoom, children }) => (
  <svg width="100%" height="100%" viewBox={`0 0 ${LARGURA} ${ALTURA}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
    <g transform={`translate(${LARGURA / 2} ${CHAO_Y}) scale(${zoom}) translate(${-LARGURA / 2} ${-CHAO_Y})`}>{children}</g>
  </svg>
);

/** Escurece a cena à noite, deixando um pouco de luz quente. */
export const Noite: React.FC<{ hora: Hora }> = ({ hora }) =>
  hora === 'noite' ? <rect x={-400} y={-200} width={LARGURA + 800} height={ALTURA + 400} fill="#9EABD6" style={{ mixBlendMode: 'multiply' }} /> : null;

/** À noite, embrulhe cada personagem nisto para ele escurecer junto com o cenário (luz de abajur, um pouco mais clara). */
export const PersonagemNaNoite: React.FC<{ hora: Hora; children: React.ReactNode }> = ({ hora, children }) =>
  hora === 'noite' ? <div style={{ filter: 'brightness(0.8) saturate(0.85) hue-rotate(-6deg)' }}>{children}</div> : <>{children}</>;

/**
 * Texto de placa ou fachada (SVG) que sempre cabe em `largura`: encolhe até `min` numa linha;
 * se ainda não couber, quebra em duas linhas. Centro horizontal em x; `y` é a linha de base da
 * primeira linha quando o texto cabe em uma (com duas, o bloco fica centrado na mesma altura).
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
  peso = 800,
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
  // duas linhas o mais equilibradas possível
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
