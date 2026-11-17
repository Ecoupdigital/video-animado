import React from 'react';
import { AbsoluteFill } from 'remotion';
import { comAlfa, legivel, useTema } from './tema';

// Folhas de referência do _preview (expressões, opções de aparência, poses, elenco), nas cores do tema em uso:
// grade de células, cada uma com um desenho e o rótulo (o código que vai no respostas.json) embaixo.

export type ItemFolha = { rotulo: string; desenho: React.ReactNode; sub?: string };

const Celula: React.FC<{ item: ItemFolha; altura: number; tamanhoRotulo: number }> = ({ item, altura, tamanhoRotulo }) => {
  const T = useTema();
  const fundo = T.escuro ? comAlfa(T.c.papel, 0.12) : comAlfa(T.c.papel, 0.6);
  const cor = legivel(T.escuro ? T.c.fundo : T.c.papel, T.c.titulo);
  return (
    <div style={{ height: altura, background: fundo, borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 14, overflow: 'hidden', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>{item.desenho}</div>
      <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: tamanhoRotulo, color: cor, marginTop: 8, textAlign: 'center', whiteSpace: 'nowrap', maxWidth: '96%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.rotulo}</div>
      {item.sub ? <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: tamanhoRotulo * 0.75, color: comAlfa(cor, 0.7), textAlign: 'center', whiteSpace: 'nowrap', maxWidth: '96%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</div> : null}
    </div>
  );
};

/** Folha com seções (cada uma com subtítulo e a sua grade). */
export const Folha: React.FC<{ titulo: string; secoes: { titulo?: string; colunas: number; alturaCelula: number; itens: ItemFolha[]; tamanhoRotulo?: number }[] }> = ({ titulo, secoes }) => {
  const T = useTema();
  const cor = legivel(T.c.fundo, T.c.titulo);
  return (
    <AbsoluteFill style={{ backgroundColor: T.c.fundo, padding: 46, fontFamily: T.f.texto, boxSizing: 'border-box' }}>
      <div style={{ fontFamily: T.estilo.titulo === 'faixa-rasgada' ? T.f.serif : T.f.texto, fontWeight: T.estilo.titulo === 'faixa-rasgada' ? 700 : 800, fontSize: 58, color: cor, marginBottom: 6, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titulo}</div>
      {secoes.map((s, i) => (
        <div key={i} style={{ marginTop: 16, flexShrink: 0 }}>
          {s.titulo ? <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 34, color: comAlfa(cor, 0.75), marginBottom: 10 }}>{s.titulo}</div> : null}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${s.colunas}, 1fr)`, gap: 18 }}>
            {s.itens.map((it, j) => (
              <Celula key={j} item={it} altura={s.alturaCelula} tamanhoRotulo={s.tamanhoRotulo ?? 28} />
            ))}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
