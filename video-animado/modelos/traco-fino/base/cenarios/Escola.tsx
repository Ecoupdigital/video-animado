import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COR, TRACO } from '../componentes/cores';
import { balanco } from '../componentes/anima';
import { Camada, CenarioBaseProps, LARGURA, QuadroCenario, TextoQueCabe, VeuLuz, corCeu } from '../componentes/Cenario';
import { FONTE_TITULO } from '../componentes/fontes';
import { LUGARES } from '../componentes/universo';

// Porta da escola: chegada, saída, primeiro dia. O nome na placa vem das respostas (cenarios.escola.nome);
// nome longo encolhe e quebra em duas linhas dentro da placa. Sem resposta, "Escola".
const T = TRACO * 1.6;

export const Escola: React.FC<CenarioBaseProps & { nome?: string }> = ({ luz = 'manha', camera = 0, zoom = 1, nome = LUGARES.nomeEscola ?? 'Escola' }) => {
  const frame = useCurrentFrame();
  const vento = balanco(frame, 30, 0.4) * 4;
  return (
    <QuadroCenario zoom={zoom}>
      <Camada camera={camera} fator={0.3}>
        <rect x={-400} y={-200} width={LARGURA + 800} height={1700} fill={corCeu(luz)} />
        {/* nuvens, ou estrelas de madrugada */}
        {luz !== 'madrugada'
          ? [
              [180, 420],
              [760, 300],
            ].map(([x, y], i) => <path key={i} d={`M ${x} ${y} q 30 -50 80 -20 q 40 -40 90 0 q 50 0 40 40 L ${x} ${y + 20} q -40 -10 0 -20 Z`} fill={COR.papel} opacity={0.9} />)
          : [
              [160, 300],
              [420, 220],
              [700, 340],
              [900, 200],
            ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.5} fill="#F3E9CF" />)}
      </Camada>
      <Camada camera={camera} fator={0.6}>
        {/* muro e fachada */}
        <rect x={-300} y={760} width={LARGURA + 600} height={720} fill={COR.linho} stroke={COR.tinta} strokeWidth={T} />
        <rect x={-300} y={720} width={LARGURA + 600} height={50} fill={COR.olivaClara} stroke={COR.tinta} strokeWidth={T} />
        {/* formas pintadas no muro, sóbrias */}
        <circle cx={120} cy={1040} r={70} fill={COR.olivaClara} />
        <rect x={180} y={1100} width={110} height={110} fill={COR.ceuDia} transform="rotate(12 235 1155)" />
        <path d="M 860 1200 l 70 -120 l 70 120 Z" fill={COR.madeiraClara} />
        {/* portão */}
        <rect x={370} y={900} width={340} height={580} fill={COR.oliva} stroke={COR.tinta} strokeWidth={T} />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M ${400 + i * 46} 920 L ${400 + i * 46} 1470`} stroke={COR.tinta} strokeWidth={4} opacity={0.5} />
        ))}
        <path d="M 540 900 L 540 1480" stroke={COR.tinta} strokeWidth={T} />
        {/* placa com o nome da escola */}
        <rect x={330} y={772} width={420} height={110} rx={10} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
        <TextoQueCabe texto={nome} x={540} y={841} largura={380} max={44} min={30} k={0.52} fonte={FONTE_TITULO} peso={600} cor={COR.tinta} />
      </Camada>
      {/* calçada */}
      <rect x={-300} y={1480} width={LARGURA + 600} height={600} fill="#D8D2C6" />
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M ${-200 + i * 160} 1480 L ${-260 + i * 160} 1920`} stroke="#C3BCAE" strokeWidth={4} />
      ))}
      <path d={`M -300 1480 L ${LARGURA + 300} 1480`} stroke={COR.tinta} strokeWidth={T} />
      <Camada camera={camera} fator={0.95}>
        {/* árvore na calçada */}
        <rect x={900} y={1100} width={44} height={420} fill={COR.madeira} stroke={COR.tinta} strokeWidth={T} />
        <g transform={`rotate(${vento} 922 1100)`}>
          <circle cx={922} cy={960} r={170} fill={COR.oliva} stroke={COR.tinta} strokeWidth={T} />
          <circle cx={820} cy={1050} r={100} fill={COR.oliva} stroke={COR.tinta} strokeWidth={T} />
          <circle cx={1030} cy={1060} r={110} fill={COR.oliva} stroke={COR.tinta} strokeWidth={T} />
        </g>
        <rect x={870} y={1500} width={104} height={30} rx={4} fill="#C3BCAE" stroke={COR.tinta} strokeWidth={TRACO} />
      </Camada>
      <VeuLuz luz={luz} />
    </QuadroCenario>
  );
};
