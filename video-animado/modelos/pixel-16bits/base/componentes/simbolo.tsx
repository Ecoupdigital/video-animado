import React from 'react';
import opcoes from './opcoes.json';

// Símbolo em pixel (os mesmos desenhos da estampa do boneco, de componentes/opcoes.json), em SVG nítido.
// Serve ao card de selo e ao card final; nunca um logo de empresa de terceiros.

const MAPAS = opcoes.simbolos_px as Record<string, string[]>;
const LETRAS = opcoes.letras_px as Record<string, string[]>;
export const SIMBOLOS = Object.keys(MAPAS).filter((k) => k !== 'terminal');

/** mapa de pixels de um símbolo, de uma letra ou do ">_" */
export const mapaDe = (nome: string): string[] => MAPAS[nome] ?? LETRAS[nome.toUpperCase()] ?? MAPAS.estrela;

export const SimboloPx: React.FC<{ nome: string; tamanho: number; cor: string; style?: React.CSSProperties }> = ({ nome, tamanho, cor, style }) => {
  const mapa = mapaDe(nome);
  const w = Math.max(...mapa.map((l) => l.length));
  const h = mapa.length;
  const lado = Math.max(w, h);
  return (
    <svg viewBox={`${-(lado - w) / 2} ${-(lado - h) / 2} ${lado} ${lado}`} width={tamanho} height={tamanho} shapeRendering="crispEdges" style={style}>
      {mapa.flatMap((linha, y) => [...linha].map((c, x) => (c === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={cor} /> : null)))}
    </svg>
  );
};
