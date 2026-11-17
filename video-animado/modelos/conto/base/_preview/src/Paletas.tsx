import React from 'react';
import { AbsoluteFill } from 'remotion';
import opcoes from '../../componentes/opcoes.json';
import { ComTema, legivel, TEMAS, useTema, type PapelCor } from '../../componentes/tema';
import { TEMA, UNIVERSO } from '../../componentes/universo';

// Still "paletas": os temas lado a lado, com cada papel de cor (o hex já com as trocas das respostas, no tema
// escolhido), as fontes do kit com acento e o que a resposta de cores troca em cada tema.

const PAPEIS = Object.keys(opcoes.paletas.papel) as PapelCor[];

const Coluna: React.FC = () => {
  const T = useTema();
  const escolhido = TEMA.id === T.id;
  const cor = legivel(T.c.fundo, T.c.titulo);
  return (
    <div style={{ width: 540, height: 1920, background: T.c.fundo, padding: '60px 34px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16, borderRight: '2px solid rgba(0,0,0,0.25)' }}>
      <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 22, color: cor, letterSpacing: '0.08em' }}>{`TEMA ${T.id.toUpperCase()}${escolhido ? ' · ESCOLHIDO' : ''}`}</div>
      <div style={{ fontFamily: T.f.serif, fontWeight: 700, fontSize: 54, lineHeight: 1.1, color: cor, overflowWrap: 'anywhere' }}>{UNIVERSO.nome}</div>
      <div style={{ fontFamily: T.f.serif, fontWeight: 700, fontStyle: 'italic', fontSize: 36, lineHeight: 1.15, color: legivel(T.c.fundo, T.c.texto) }}>Era uma vez, à tarde: ação, órgão, você</div>
      <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 44, lineHeight: 1.1, color: cor }}>
        Inter 800 com <span style={{ background: T.c.destaque, color: legivel(T.c.destaque, '#FFFFFF'), borderRadius: 10, padding: '0 8px' }}>destaque</span>
      </div>
      <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: 28, lineHeight: 1.3, color: cor }}>Inter 600: ç, ã, õ, é, ê, à, ü · 0123456789</div>
      <div style={{ fontFamily: T.f.texto, fontWeight: 400, fontSize: 26, lineHeight: 1.3, color: cor }}>Inter 400: aviso de personagem fictícia</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 6 }}>
        {PAPEIS.map((p) => (
          <div key={p}>
            <div style={{ height: 58, borderRadius: 8, background: T.c[p], border: `2px solid rgba(0,0,0,0.18)` }} />
            <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 16, color: cor, marginTop: 4 }}>{p}</div>
            <div style={{ fontFamily: T.f.texto, fontWeight: 400, fontSize: 14, color: cor }}>{T.c[p]}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 30, color: cor, marginTop: 10 }}>{T.nome}</div>
    </div>
  );
};

export const Paletas: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: 'row', background: '#000' }}>
    {TEMAS.map((t) => (
      <ComTema key={t} id={t}>
        <Coluna />
      </ComTema>
    ))}
  </AbsoluteFill>
);
