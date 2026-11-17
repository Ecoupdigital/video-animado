import React from 'react';
import { AbsoluteFill } from 'remotion';
import opcoes from '../../componentes/opcoes.json';
import { ComTema, TEMAS, useTema, type PapelCor } from '../../componentes/tema';
import { TEMA, UNIVERSO } from '../../componentes/universo';

// Still "paletas": os 4 temas lado a lado, com cada papel de cor (o hex já com as trocas das respostas, no tema
// escolhido), as 3 fontes do kit com acento e o que a resposta de cores troca em cada tema.

const PAPEIS = Object.keys(opcoes.paletas.quadro) as PapelCor[];

const Coluna: React.FC = () => {
  const T = useTema();
  const escolhido = TEMA.id === T.id;
  return (
    <div style={{ width: 540, height: 1920, background: T.c.fundo, padding: '60px 34px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16, borderRight: '2px solid rgba(0,0,0,0.25)' }}>
      <div style={{ fontFamily: T.f.mono, fontSize: 22, color: T.c.texto, letterSpacing: '0.08em' }}>{`TEMA ${T.id.toUpperCase()}${escolhido ? ' · ESCOLHIDO' : ''}`}</div>
      <div style={{ fontFamily: T.f.titulo, fontWeight: T.pesoTitulo, fontSize: T.tituloMao ? 78 : 56, lineHeight: 1.1, color: T.c.titulo }}>
        {UNIVERSO.nome} <span style={{ color: T.c.destaque }}>à mão</span>
      </div>
      <div style={{ fontFamily: T.f.mao, fontWeight: 600, fontSize: 46, lineHeight: 1.15, color: T.c.titulo }}>Ação, órgão, você, à beça: ç ã õ é</div>
      <div style={{ fontFamily: T.f.texto, fontSize: 28, lineHeight: 1.35, color: T.c.texto }}>Texto de apoio em Inter, com acentuação: ação, órgão, você.</div>
      <div style={{ fontFamily: T.f.mono, fontSize: 24, color: T.c.suave }}>MONO · 0123456789 · R$ 1.250,00</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
        {PAPEIS.map((p) => (
          <div key={p}>
            <div style={{ height: 78, borderRadius: 8, background: T.c[p], border: `2px solid ${T.a('traco', 0.25)}` }} />
            <div style={{ fontFamily: T.f.mono, fontSize: 17, color: T.c.texto, marginTop: 4 }}>{p}</div>
            <div style={{ fontFamily: T.f.mono, fontSize: 15, color: T.c.suave }}>{T.c[p]}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 30, color: T.c.titulo, marginTop: 14 }}>{T.nome}</div>
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
