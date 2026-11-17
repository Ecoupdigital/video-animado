import React from 'react';
import { AbsoluteFill } from 'remotion';
import opcoes from '../../componentes/opcoes.json';
import { ComPaleta, legivel, PALETAS, useTema, type PapelCor } from '../../componentes/tema';
import { TEMA } from '../../componentes/universo';

// Still "paletas": as 3 paletas prontas lado a lado (claro, escuro, vivo), cada uma com a capa do universo nela
// (sem as trocas das respostas) e cada papel de cor com o hex. A paleta que o universo usa vem marcada.

const PAPEIS = Object.keys(opcoes.paletas.claro) as PapelCor[];

const Coluna: React.FC<{ Capa: React.FC }> = ({ Capa }) => {
  const T = useTema();
  const escolhida = TEMA.base === T.id;
  const cor = legivel(T.c.fundo, T.c.titulo);
  return (
    <div style={{ width: 540, height: 1700, background: T.c.fundo, display: 'flex', flexDirection: 'column', borderRight: '2px solid rgba(0,0,0,0.25)', boxSizing: 'border-box' }}>
      <div style={{ width: 540, height: 960, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: 1080, height: 1920, transform: 'scale(0.5)', transformOrigin: '0 0', position: 'absolute', left: 0, top: 0 }}>
          <Capa />
        </div>
      </div>
      <div style={{ padding: '26px 30px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 24, letterSpacing: '0.08em', color: cor }}>{`PRONTA ${T.id.toUpperCase()}${escolhida ? ` · ${TEMA.origem === 'marca' ? 'BASE DA MARCA' : 'ESCOLHIDA'}` : ''}`}</div>
        <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: 24, lineHeight: 1.25, color: cor }}>{T.nome}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 6 }}>
          {PAPEIS.map((p) => (
            <div key={p}>
              <div style={{ height: 52, borderRadius: 8, background: T.c[p], border: '2px solid rgba(0,0,0,0.18)' }} />
              <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 15, color: cor, marginTop: 4, overflowWrap: 'anywhere' }}>{p}</div>
              <div style={{ fontFamily: T.f.texto, fontWeight: 400, fontSize: 14, color: cor }}>{T.c[p]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Paletas: React.FC<{ Capa: React.FC }> = ({ Capa }) => (
  <AbsoluteFill style={{ flexDirection: 'row', background: '#000' }}>
    {PALETAS.map((id) => (
      <ComPaleta key={id} id={id}>
        <Coluna Capa={Capa} />
      </ComPaleta>
    ))}
  </AbsoluteFill>
);
