import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COR } from './cores';
import { FONTE_TEXTO, FONTE_TITULO } from './fontes';

type Item = { rotulo: string; desenho: React.ReactNode };

const Celula: React.FC<{ item: Item; altura: number; tamanhoRotulo?: number }> = ({ item, altura, tamanhoRotulo = 30 }) => (
  <div
    style={{
      height: altura,
      background: COR.branco,
      borderRadius: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 16,
      overflow: 'hidden',
    }}
  >
    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>{item.desenho}</div>
    <div style={{ fontSize: tamanhoRotulo, fontWeight: 700, color: COR.texto, marginTop: 10, textAlign: 'center', whiteSpace: 'nowrap' }}>{item.rotulo}</div>
  </div>
);

/** Folha de referência: grade de células com um desenho e um rótulo embaixo. */
export const Folha: React.FC<{
  titulo: string;
  colunas: number;
  itens: Item[];
  alturaCelula: number;
  fundo?: string;
}> = ({ titulo, colunas, itens, alturaCelula, fundo = COR.fundo }) => (
  <AbsoluteFill style={{ backgroundColor: fundo, padding: 50, fontFamily: FONTE_TEXTO }}>
    <div style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 64, color: COR.texto, marginBottom: 20 }}>{titulo}</div>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colunas}, 1fr)`, gap: 20 }}>
      {itens.map((it, i) => (
        <Celula key={i} item={it} altura={alturaCelula} />
      ))}
    </div>
  </AbsoluteFill>
);

/** Folha com seções (cada uma com subtítulo e sua grade). */
export const FolhaSecoes: React.FC<{
  titulo: string;
  secoes: { titulo: string; colunas: number; alturaCelula: number; itens: Item[] }[];
  fundo?: string;
}> = ({ titulo, secoes, fundo = COR.fundo }) => (
  <AbsoluteFill style={{ backgroundColor: fundo, padding: 50, fontFamily: FONTE_TEXTO }}>
    <div style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: 64, color: COR.texto, marginBottom: 10 }}>{titulo}</div>
    {secoes.map((s) => (
      <div key={s.titulo} style={{ marginTop: 18 }}>
        <div style={{ fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: 40, color: COR.textoSuave, marginBottom: 12 }}>{s.titulo}</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${s.colunas}, 1fr)`, gap: 20 }}>
          {s.itens.map((it, i) => (
            <Celula key={i} item={it} altura={s.alturaCelula} tamanhoRotulo={26} />
          ))}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
