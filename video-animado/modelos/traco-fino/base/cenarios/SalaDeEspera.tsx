import React from 'react';
import { COR, TRACO } from '../componentes/cores';
import { Abajur, ALTURA, Camada, CenarioBaseProps, LARGURA, QuadroCenario, TextoQueCabe, VeuLuz, corCeu } from '../componentes/Cenario';
import { FONTE_TEXTO } from '../componentes/fontes';
import { Livros, Planta, Relogio } from '../componentes/objetos';
import { LUGARES } from '../componentes/universo';

// Sala de espera de qualquer atendimento (recepção, estúdio, escritório de serviço): parede com faixa de
// azulejo, janela com persiana, quadro, relógio, porta com a placa das respostas (cenarios.sala_espera.placa),
// fileira de cadeiras e mesinha com revistas. A placa longa encolhe e quebra em duas linhas dentro dela.
// Sem resposta, "Recepção". Os personagens sentam ou ficam de pé na frente das cadeiras.
const T = TRACO * 1.6;

const Cadeira: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x} y={1230} width={150} height={150} rx={18} fill={COR.petroleoClaro} stroke={COR.tinta} strokeWidth={T} />
    <rect x={x - 6} y={1360} width={162} height={40} rx={12} fill={COR.petroleo} stroke={COR.tinta} strokeWidth={T} />
    <rect x={x + 14} y={1400} width={12} height={70} fill={COR.tinta} />
    <rect x={x + 124} y={1400} width={12} height={70} fill={COR.tinta} />
  </g>
);

export const SalaDeEspera: React.FC<CenarioBaseProps & { placa?: string }> = ({ luz = 'manha', camera = 0, zoom = 1, placa = LUGARES.placaSalaEspera ?? 'Recepção' }) => (
  <QuadroCenario zoom={zoom}>
    <Camada camera={camera} fator={0.3}>
      <rect x={-400} y={-200} width={LARGURA + 800} height={1700} fill="#EEF1EC" />
      {/* faixa de azulejo na metade de baixo da parede */}
      <rect x={-400} y={1120} width={LARGURA + 800} height={360} fill={COR.ceuDia} />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M ${-380 + i * 120} 1120 L ${-380 + i * 120} 1480`} stroke="#C7D4D8" strokeWidth={3} />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <path key={'h' + i} d={`M -400 ${1240 + i * 120} L ${LARGURA + 400} ${1240 + i * 120}`} stroke="#C7D4D8" strokeWidth={3} />
      ))}
      <path d={`M -400 1120 L ${LARGURA + 400} 1120`} stroke={COR.tinta} strokeWidth={T} />
      {/* janela com persiana */}
      <rect x={60} y={540} width={300} height={360} fill={corCeu(luz)} stroke={COR.tinta} strokeWidth={T} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={60} y={540 + i * 30} width={300} height={16} fill={COR.papel} opacity={0.9} />
      ))}
      <rect x={36} y={900} width={348} height={20} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
      {/* quadro de formas e relógio */}
      <rect x={430} y={600} width={200} height={160} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={480 + i * 50} cy={680} r={12 + i * 8} fill="none" stroke={COR.oliva} strokeWidth={5} />
      ))}
      <Relogio x={530} y={480} raio={46} horas={10} minutos={10} />
      {/* porta com a placa */}
      <rect x={720} y={700} width={300} height={780} fill={COR.madeiraClara} stroke={COR.tinta} strokeWidth={T} />
      <rect x={750} y={940} width={240} height={500} fill="none" stroke={COR.madeira} strokeWidth={4} />
      <circle cx={760} cy={1180} r={12} fill={COR.tinta} />
      <rect x={694} y={756} width={352} height={128} rx={10} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
      <TextoQueCabe texto={placa} x={870} y={836} largura={320} max={46} min={30} k={0.55} fonte={FONTE_TEXTO} peso={700} cor={COR.tinta} />
    </Camada>
    <Camada camera={camera} fator={0.6}>
      {/* fileira de cadeiras encostada na parede */}
      <Cadeira x={-40} />
      <Cadeira x={130} />
      <Cadeira x={300} />
      {/* mesinha com revistas e planta */}
      <rect x={480} y={1370} width={190} height={22} fill={COR.madeira} stroke={COR.tinta} strokeWidth={T} />
      <rect x={500} y={1392} width={14} height={80} fill={COR.tinta} />
      <rect x={636} y={1392} width={14} height={80} fill={COR.tinta} />
      <Livros x={575} y={1370} escala={0.8} />
      <Planta x={1040} y={1480} escala={0.75} />
    </Camada>
    {/* piso vinílico claro */}
    <rect x={-300} y={1478} width={LARGURA + 600} height={ALTURA - 1478 + 200} fill="#D9D3C7" />
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d={`M -300 ${1520 + i * 60} L ${LARGURA + 300} ${1520 + i * 60}`} stroke="#C9C2B4" strokeWidth={3} />
    ))}
    <path d={`M -300 1478 L ${LARGURA + 300} 1478`} stroke={COR.tinta} strokeWidth={T} />
    <VeuLuz luz={luz} />
    {/* de madrugada, a luz que fica acesa no corredor */}
    {luz === 'madrugada' && <Abajur x={540} y={300} raio={600} />}
  </QuadroCenario>
);
