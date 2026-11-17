import React from 'react';
import { COR, escurecer } from '../componentes/cores';
import { Camada, CenarioBaseProps, CHAO_Y, Noite, QuadroCenario, TextoQueCabe } from '../componentes/Cenario';
import { FONTE_TEXTO } from '../componentes/fontes';
import { LUGARES } from '../componentes/universo';

// SALA DE ESPERA de um atendimento (consultório, escritório, salão, repartição). A placa da porta vem
// das respostas (cenarios.sala_espera.placa) ou da prop `placa`; sem resposta, "Sala 1".
// Sem objeto de assunto em destaque: é um lugar calmo, o vídeo põe o que precisar.
export type SalaDeEsperaProps = CenarioBaseProps & {
  /** Texto da placa da porta (padrão: o das respostas). */
  placa?: string;
};

export const PLACA_PADRAO = 'Sala 1';

export const SalaDeEspera: React.FC<SalaDeEsperaProps> = ({ hora = 'dia', camera = 0, zoom = 1, placa = LUGARES.placaSalaEspera ?? PLACA_PADRAO }) => (
  <QuadroCenario zoom={zoom}>
    <Camada camera={camera} fator={0.3}>
      <rect x={-300} y={-200} width={1680} height={2400} fill={COR.fundo} />
      <rect x={-300} y={1080} width={1680} height={420} fill={COR.apoio2Claro} />
      <rect x={-300} y={1072} width={1680} height={14} fill={COR.apoio2} />
      {/* relógio */}
      <circle cx={540} cy={640} r={70} fill={COR.branco} stroke={COR.apoio} strokeWidth={12} />
      <path d="M 540 640 L 540 595 M 540 640 L 575 655" stroke={COR.texto} strokeWidth={7} strokeLinecap="round" />
      {/* porta com placa */}
      <rect x={780} y={700} width={280} height={800} rx={14} fill={COR.apoio} />
      {/* placa no alto da porta: fica acima da cabeça de quem está em pé na frente */}
      <rect x={808} y={724} width={224} height={72} rx={10} fill={COR.fundo} />
      <TextoQueCabe texto={placa} x={920} y={770} largura={204} max={30} min={20} k={0.58} fonte={FONTE_TEXTO} peso={700} cor={COR.texto} />
      <rect x={810} y={820} width={220} height={260} rx={10} fill={COR.apoioEscuro} opacity={0.35} />
      <circle cx={1020} cy={1150} r={14} fill={COR.detalhe} />
      {/* quadro com folhas */}
      <rect x={60} y={620} width={300} height={240} rx={10} fill={COR.branco} />
      <ellipse cx={170} cy={760} rx={36} ry={80} fill={COR.apoio2} transform="rotate(-20 170 760)" />
      <ellipse cx={250} cy={750} rx={36} ry={90} fill={COR.acerto} transform="rotate(18 250 750)" />
      <rect x={-300} y={CHAO_Y - 130} width={1680} height={600} fill={COR.fundo3} />
      <rect x={-300} y={CHAO_Y - 150} width={1680} height={22} fill={COR.fundo} />
    </Camada>
    <Camada camera={camera} fator={0.6}>
      {/* fileira de cadeiras */}
      {[-40, 180, 400].map((x) => (
        <g key={x}>
          <rect x={x} y={1200} width={190} height={200} rx={36} fill={COR.apoio2} />
          <rect x={x - 10} y={1360} width={210} height={70} rx={24} fill={escurecer(COR.apoio2, 0.1)} />
          <rect x={x + 20} y={1430} width={14} height={90} rx={6} fill={COR.texto} />
          <rect x={x + 156} y={1430} width={14} height={90} rx={6} fill={COR.texto} />
        </g>
      ))}
      {/* mesinha com revistas */}
      <rect x={640} y={1380} width={150} height={20} rx={8} fill={COR.apoioEscuro} />
      <rect x={705} y={1400} width={20} height={120} fill={COR.apoioEscuro} />
      <rect x={652} y={1350} width={110} height={30} rx={4} fill={COR.destaque} />
      <rect x={662} y={1330} width={100} height={22} rx={4} fill={COR.detalhe} />
    </Camada>
    <Noite hora={hora} />
  </QuadroCenario>
);
