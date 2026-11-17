import React from 'react';
import { COR } from '../componentes/cores';
import { Camada, CenarioBaseProps, CHAO_Y, Noite, QuadroCenario, TextoQueCabe } from '../componentes/Cenario';
import { FONTE_TITULO } from '../componentes/fontes';
import { LUGARES } from '../componentes/universo';

// RUA com uma loja de bairro. O nome da fachada vem das respostas (cenarios.rua.loja) ou da prop `loja`;
// sem resposta, "Loja". Loja fictícia, nunca uma marca real. Nome longo encolhe ou quebra em duas linhas.
export type RuaProps = CenarioBaseProps & {
  /** Nome da loja na fachada (padrão: o das respostas). */
  loja?: string;
};

export const LOJA_PADRAO = 'Loja';

/** Produtos genéricos na vitrine: caixa, vaso com planta e pacote. */
const Vitrine: React.FC = () => (
  <g>
    <rect x={280} y={1200} width={90} height={70} rx={8} fill={COR.detalhe} />
    <rect x={290} y={1150} width={70} height={50} rx={8} fill={COR.destaque} />
    <rect x={318} y={1150} width={14} height={50} fill={COR.branco} opacity={0.6} />
    <path d="M 410 1270 L 470 1270 L 462 1210 L 418 1210 Z" fill={COR.apoio} />
    <ellipse cx={428} cy={1180} rx={16} ry={36} fill={COR.acerto} transform="rotate(-20 428 1180)" />
    <ellipse cx={454} cy={1176} rx={16} ry={40} fill={COR.apoio2} transform="rotate(18 454 1176)" />
    <rect x={510} y={1170} width={90} height={100} rx={10} fill={COR.fundo3} />
    <path d="M 535 1170 q 0 -30 20 -30 q 20 0 20 30" stroke={COR.apoioEscuro} strokeWidth={6} fill="none" />
  </g>
);

export const Rua: React.FC<RuaProps> = ({ hora = 'dia', camera = 0, zoom = 1, loja = LUGARES.lojaRua ?? LOJA_PADRAO }) => (
  <QuadroCenario zoom={zoom}>
    <Camada camera={camera} fator={0.3}>
      <rect x={-300} y={-200} width={1680} height={2400} fill={hora === 'dia' ? COR.ceuDia : COR.ceuNoite} />
      {hora === 'noite' && (
        <g>
          <circle cx={820} cy={300} r={60} fill={COR.fundo} />
          <circle cx={848} cy={284} r={54} fill={COR.ceuNoite} />
        </g>
      )}
      {/* prédios ao fundo */}
      {(
        [
          [-200, 520, 260, COR.fundo3],
          [60, 640, 220, COR.fundo2],
          [880, 480, 300, COR.fundo3],
        ] as [number, number, number, string][]
      ).map(([x, y, w, c], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={1400} fill={c} />
          {Array.from({ length: 6 }, (_, j) => (
            <rect
              key={j}
              x={x + 40 + (j % 2) * (w / 2)}
              y={y + 60 + Math.floor(j / 2) * 140}
              width={60}
              height={80}
              rx={6}
              fill={hora === 'noite' ? COR.detalhe : COR.fundo}
              opacity={hora === 'noite' ? 0.7 : 0.8}
            />
          ))}
        </g>
      ))}
    </Camada>
    <Camada camera={camera} fator={0.6}>
      {/* fachada da loja */}
      <rect x={180} y={620} width={720} height={900} fill={COR.fundo} />
      <rect x={180} y={620} width={720} height={40} fill={COR.apoio} />
      <rect x={240} y={690} width={600} height={130} rx={14} fill={COR.branco} />
      <TextoQueCabe texto={loja} x={540} y={782} largura={560} max={72} min={46} k={0.52} fonte={FONTE_TITULO} cor={COR.texto} />
      {/* toldo listrado */}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M ${200 + i * 85} 850 L ${285 + i * 85} 850 L ${285 + i * 85} 930 Q ${242 + i * 85} 960 ${200 + i * 85} 930 Z`} fill={i % 2 ? COR.fundo : COR.destaque} />
      ))}
      {/* vitrine */}
      <rect x={230} y={980} width={400} height={440} rx={12} fill={hora === 'dia' ? '#EAF2EE' : '#F6E3B8'} />
      <rect x={230} y={1270} width={400} height={20} fill={COR.apoio} />
      <Vitrine />
      {/* porta */}
      <rect x={680} y={980} width={170} height={540} rx={10} fill={COR.apoio} />
      <rect x={700} y={1000} width={130} height={300} rx={8} fill={hora === 'dia' ? '#EAF2EE' : '#F6E3B8'} />
      <circle cx={820} cy={1340} r={10} fill={COR.detalhe} />
      {/* calçada e rua */}
      <rect x={-300} y={CHAO_Y - 100} width={1680} height={190} fill="#E3D6C6" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-300 + i * 150} y={CHAO_Y - 100} width={4} height={190} fill="#CDBFAF" />
      ))}
      <rect x={-300} y={CHAO_Y + 90} width={1680} height={30} fill="#CDBFAF" />
      <rect x={-300} y={CHAO_Y + 120} width={1680} height={400} fill="#9A938B" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-260 + i * 220} y={CHAO_Y + 220} width={110} height={14} rx={7} fill={COR.fundo} opacity={0.7} />
      ))}
    </Camada>
    <Noite hora={hora} />
    <Camada camera={camera} fator={1.3}>
      {/* árvore na frente */}
      <rect x={960} y={1000} width={36} height={600} rx={14} fill={COR.apoioEscuro} />
      <circle cx={980} cy={900} r={170} fill={COR.apoio2} />
      <circle cx={1080} cy={1000} r={110} fill={COR.acerto} />
      <circle cx={880} cy={990} r={100} fill={COR.acerto} />
      {hora === 'noite' && (
        <g>
          <rect x={-60} y={700} width={16} height={900} fill={COR.texto} />
          <ellipse cx={-52} cy={700} rx={40} ry={20} fill={COR.detalhe} />
          <ellipse cx={-52} cy={760} rx={180} ry={140} fill={COR.detalhe} opacity={0.15} />
        </g>
      )}
    </Camada>
  </QuadroCenario>
);
