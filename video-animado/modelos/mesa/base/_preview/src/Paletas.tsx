import React from 'react';
import { AbsoluteFill } from 'remotion';
import { H, TempoFixo, W } from '../../componentes/anima';
import { EXEMPLO } from '../../componentes/exemplo';
import { MesaVista } from '../../componentes/Montagem';
import { comTempoSintetico } from '../../componentes/roteiro';
import opcoes from '../../componentes/opcoes.json';
import { ComMesa, PRONTAS, useMesa, type IdPronta, type PapelCor } from '../../componentes/tema';
import { CORES } from '../../componentes/universo';

// Still "paletas": as 3 paletas prontas lado a lado, cada uma com a capa (o último passo do exemplo, na superfície
// e no grupo do universo) e os 9 papéis com o hex. A superfície é a mesma nas três: a cor troca destaque, faixa,
// etiqueta e card final, nunca o material da mesa.

const EX = comTempoSintetico(EXEMPLO);
const tCapa = EX.cenas.filter((c) => c.tipo === 'passo').pop()!.fim - 0.25;
const PAPEIS = Object.keys(opcoes.paletas.ambar) as PapelCor[];

const Coluna: React.FC<{ id: IdPronta }> = ({ id }) => {
  const M = useMesa();
  const escolhida = CORES.base === id;
  const escala = 0.6;
  return (
    <div style={{ width: 720, height: 1920, background: '#1B1A1D', borderRight: '3px solid #000', padding: '30px 36px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontFamily: M.f.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.08em', color: '#F5F2EE' }}>{`PALETA ${id.toUpperCase()}${escolhida ? ' · DESTE UNIVERSO' : ''}${id === opcoes.pronta_padrao ? ' · PADRÃO' : ''}`}</div>
      <div style={{ fontFamily: M.f.texto, fontWeight: 600, fontSize: 24, lineHeight: 1.3, color: '#D8D4CE', minHeight: 62 }}>{opcoes.prontas[id].nome}</div>
      <div style={{ width: W * escala, height: H * escala, position: 'relative', overflow: 'hidden', borderRadius: 14 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${escala})`, transformOrigin: '0 0' }}>
          <TempoFixo.Provider value={tCapa}>
            <MesaVista timing={EX} duck={[]} comSom={false} chave={`pal-${id}`} />
          </TempoFixo.Provider>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {PAPEIS.map((p) => (
          <div key={p}>
            <div style={{ height: 56, borderRadius: 8, background: M.c[p], border: '2px solid rgba(255,255,255,0.25)' }} />
            <div style={{ fontFamily: M.f.mono, fontWeight: 500, fontSize: 17, color: '#F5F2EE', marginTop: 4 }}>{p}</div>
            <div style={{ fontFamily: M.f.mono, fontWeight: 500, fontSize: 16, color: '#A8A29E' }}>{M.c[p]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Paletas: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: 'row', background: '#000' }}>
    {PRONTAS.map((id) => (
      <ComMesa key={id} base={id}>
        <Coluna id={id} />
      </ComMesa>
    ))}
  </AbsoluteFill>
);
