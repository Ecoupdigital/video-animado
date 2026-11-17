import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COR, TRACO } from '../componentes/cores';
import { Abajur, Camada, CenarioBaseProps, LARGURA, QuadroCenario, VeuLuz, corCeu } from '../componentes/Cenario';
import { Caneca, Planta } from '../componentes/objetos';

// Escritório: mesa com monitor de planilha, caneca e planta, diante de um janelão com a cidade.
const T = TRACO * 1.6;

export const Escritorio: React.FC<CenarioBaseProps> = ({ luz = 'manha', camera = 0, zoom = 1 }) => {
  const frame = useCurrentFrame();
  const ceu = corCeu(luz);
  return (
    <QuadroCenario zoom={zoom}>
      <Camada camera={camera} fator={0.3}>
        <rect x={-400} y={-200} width={LARGURA + 800} height={1700} fill={COR.linhoClaro} />
        {/* janelão com a cidade */}
        <rect x={-100} y={380} width={1280} height={760} fill={ceu} stroke={COR.tinta} strokeWidth={T} />
        {[
          [-60, 760, 160],
          [130, 640, 140],
          [300, 820, 180],
          [520, 580, 150],
          [700, 700, 170],
          [900, 620, 160],
          [1080, 760, 140],
        ].map(([x, y, w], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={1140 - y} fill={luz === 'madrugada' ? '#3B4862' : COR.petroleoClaro} opacity={0.7} />
            {Array.from({ length: 4 }, (_, j) => (
              <rect key={j} x={x + 22} y={y + 30 + j * 70} width={w - 44} height={22} fill={luz === 'madrugada' ? '#E9D8A6' : COR.papel} opacity={0.5} />
            ))}
          </g>
        ))}
        {[180, 540, 900].map((x) => (
          <path key={x} d={`M ${x} 380 L ${x} 1140`} stroke={COR.tinta} strokeWidth={T} />
        ))}
      </Camada>
      <Camada camera={camera} fator={0.6}>
        <rect x={-400} y={1140} width={LARGURA + 800} height={400} fill={COR.linho} />
        <Planta x={960} y={1430} escala={1.4} />
      </Camada>
      <rect x={-300} y={1460} width={LARGURA + 600} height={600} fill={COR.linhoEscuro} />
      <Camada camera={camera} fator={0.85}>
        {/* mesa */}
        <rect x={80} y={1250} width={760} height={30} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
        <rect x={110} y={1280} width={20} height={330} fill={COR.tinta} />
        <rect x={790} y={1280} width={20} height={330} fill={COR.tinta} />
        {/* monitor com planilha */}
        <rect x={300} y={930} width={400} height={260} rx={10} fill={COR.tinta} />
        <rect x={314} y={944} width={372} height={232} fill={COR.papel} />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M 314 ${974 + i * 30} L 686 ${974 + i * 30}`} stroke={COR.quadricula} strokeWidth={2} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <path key={'c' + i} d={`M ${390 + i * 80} 944 L ${390 + i * 80} 1176`} stroke={COR.quadricula} strokeWidth={2} />
        ))}
        <rect x={314} y={944} width={372} height={30} fill={COR.oliva} opacity={0.5} />
        <rect x={480} y={1190} width={40} height={50} fill={COR.tinta} />
        <rect x={430} y={1236} width={140} height={14} rx={6} fill={COR.tinta} />
        <Caneca x={230} y={1250} escala={1.3} frame={frame} />
        <rect x={600} y={1226} width={150} height={24} rx={4} fill={COR.petroleo} stroke={COR.tinta} strokeWidth={TRACO} />
      </Camada>
      <VeuLuz luz={luz} />
      {/* de madrugada, só a luz do monitor */}
      {luz === 'madrugada' && <Abajur x={500} y={1060} raio={440} />}
    </QuadroCenario>
  );
};
