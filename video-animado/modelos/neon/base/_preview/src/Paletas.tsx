import React from 'react';
import { AbsoluteFill } from 'remotion';
import { H, TempoFixo, W } from '../../componentes/anima';
import { EXEMPLO } from '../../componentes/exemplo';
import { NeonVista } from '../../componentes/Montagem';
import { comTempoSintetico } from '../../componentes/roteiro';
import opcoes from '../../componentes/opcoes.json';
import { ComNeon, PAPEIS, PRONTAS, useNeon, type IdPronta } from '../../componentes/tema';
import { CORES } from '../../componentes/universo';

// Still "paletas": as 3 paletas prontas lado a lado, cada uma com a capa (a chamada do exemplo: letreiro e botão) e
// os 15 papéis com o hex. O neon troca todas as cores: céu, sol, grade, letreiro, destaque, botão, selo e card.

const EX = comTempoSintetico(EXEMPLO);
const tCapa = EX.cenas.find((c) => c.tipo === 'chamada')!.fim - 0.25;

const Coluna: React.FC<{ id: IdPronta }> = ({ id }) => {
  const N = useNeon();
  const escolhida = CORES.base === id && CORES.origem === 'pronta';
  const escala = 0.6;
  return (
    <div style={{ width: 720, height: 1920, background: '#0B0614', borderRight: '3px solid #000', padding: '30px 36px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: N.f.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.08em', color: '#F5F2FA' }}>{`PALETA ${id.toUpperCase()}${escolhida ? ' · DESTE UNIVERSO' : ''}${id === opcoes.pronta_padrao ? ' · PADRÃO' : ''}`}</div>
      <div style={{ fontFamily: N.f.texto, fontWeight: 800, fontSize: 24, lineHeight: 1.3, color: '#D6D0E2', minHeight: 62 }}>{opcoes.prontas[id].nome}</div>
      <div style={{ width: W * escala, height: H * escala, position: 'relative', overflow: 'hidden', borderRadius: 14 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${escala})`, transformOrigin: '0 0' }}>
          <TempoFixo.Provider value={tCapa}>
            <NeonVista timing={EX} duck={[]} comSom={false} chave={`pal-${id}`} />
          </TempoFixo.Provider>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {PAPEIS.map((p) => (
          <div key={p}>
            <div style={{ height: 46, borderRadius: 8, background: N.c[p], border: '2px solid rgba(255,255,255,0.25)' }} />
            <div style={{ fontFamily: N.f.mono, fontWeight: 500, fontSize: 15, color: '#F5F2FA', marginTop: 4 }}>{p}</div>
            <div style={{ fontFamily: N.f.mono, fontWeight: 500, fontSize: 14, color: '#A79FB8' }}>{N.c[p]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Paletas: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: 'row', background: '#000' }}>
    {PRONTAS.map((id) => (
      <ComNeon key={id} base={id}>
        <Coluna id={id} />
      </ComNeon>
    ))}
  </AbsoluteFill>
);
