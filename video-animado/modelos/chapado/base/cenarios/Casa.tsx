import React from 'react';
import { COR, escurecer } from '../componentes/cores';
import { ObjetoDePia, ObjetoPia } from '../componentes/objetos';
import { Camada, CenarioBaseProps, CHAO_Y, Hora, Noite, QuadroCenario } from '../componentes/Cenario';

// CASA da protagonista: sala, cozinha (com a geladeira de listas), quarto (arrumado em etapas) e banheiro.
// Cores por papel da paleta; nada de texto nem de objeto de assunto fixo (o vídeo põe o objeto dele).
export type Comodo = 'sala' | 'cozinha' | 'quarto' | 'banheiro';
export const COMODOS: Comodo[] = ['sala', 'cozinha', 'quarto', 'banheiro'];

export type CasaProps = CenarioBaseProps & {
  comodo?: Comodo;
  /** Quantas listas e post-its na geladeira (cresce ao longo da série). */
  listas?: number;
  /** Quarto: 0 = só caixas de mudança, 1 = cama montada, 2 = cômoda com abajur, 3 = quarto pronto (quadros, prateleira, planta). */
  etapaQuarto?: 0 | 1 | 2 | 3;
  /** Banheiro: objetos na pia, da esquerda para a direita (até 4). */
  objetosNaPia?: ObjetoPia[];
  /** Índice do objeto da pia que brilha, ou -1. */
  objetoBrilhando?: number;
  /** 0 a 1. */
  brilho?: number;
};

const VERDE_ESCURO = COR.acerto;
const VERDE_MEDIO = escurecer(COR.apoio2, 0.1);

const Janela: React.FC<{ x: number; y: number; w: number; h: number; hora: Hora; cortina?: string | null }> = ({ x, y, w, h, hora, cortina = COR.apoio2 }) => (
  <g>
    <rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} rx={18} fill={COR.fundo} />
    <rect x={x} y={y} width={w} height={h} rx={8} fill={hora === 'dia' ? COR.ceuDia : COR.ceuNoite} />
    {hora === 'dia' ? (
      <>
        <ellipse cx={x + w * 0.3} cy={y + h * 0.3} rx={w * 0.18} ry={h * 0.05} fill={COR.branco} opacity={0.8} />
        <ellipse cx={x + w * 0.65} cy={y + h * 0.5} rx={w * 0.14} ry={h * 0.04} fill={COR.branco} opacity={0.7} />
        <rect x={x} y={y + h * 0.72} width={w} height={h * 0.28} fill={COR.apoio2} opacity={0.55} />
      </>
    ) : (
      <>
        <circle cx={x + w * 0.66} cy={y + h * 0.3} r={w * 0.11} fill={COR.fundo} />
        <circle cx={x + w * 0.71} cy={y + h * 0.27} r={w * 0.1} fill={COR.ceuNoite} />
        <rect x={x} y={y + h * 0.72} width={w} height={h * 0.28} fill={COR.ceuNoiteClaro} />
      </>
    )}
    <rect x={x + w / 2 - 7} y={y} width={14} height={h} fill={COR.fundo} />
    <rect x={x} y={y + h * 0.45} width={w} height={14} fill={COR.fundo} />
    {cortina && (
      <>
        <path d={`M ${x - 40} ${y - 40} Q ${x + w * 0.12} ${y + h * 0.5} ${x - 30} ${y + h + 60} L ${x - 70} ${y + h + 60} L ${x - 70} ${y - 40} Z`} fill={cortina} />
        <path d={`M ${x + w + 40} ${y - 40} Q ${x + w * 0.88} ${y + h * 0.5} ${x + w + 30} ${y + h + 60} L ${x + w + 70} ${y + h + 60} L ${x + w + 70} ${y - 40} Z`} fill={cortina} />
        <rect x={x - 90} y={y - 52} width={w + 180} height={14} rx={7} fill={COR.apoioEscuro} />
      </>
    )}
  </g>
);

const Piso: React.FC<{ cor: string; rodape?: string }> = ({ cor, rodape = COR.fundo }) => (
  <g>
    <rect x={-300} y={CHAO_Y - 130} width={1680} height={600} fill={cor} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={-300} y={CHAO_Y - 70 + i * 90} width={1680} height={4} fill={COR.apoioEscuro} opacity={0.25} />
    ))}
    <rect x={-300} y={CHAO_Y - 150} width={1680} height={22} fill={rodape} />
  </g>
);

const Planta: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <ellipse cx={-40} cy={-150} rx={30} ry={70} fill={VERDE_ESCURO} transform="rotate(-25 -40 -150)" />
    <ellipse cx={40} cy={-160} rx={30} ry={75} fill={COR.apoio2} transform="rotate(22 40 -160)" />
    <ellipse cx={0} cy={-190} rx={28} ry={80} fill={VERDE_ESCURO} />
    <path d="M -60 -90 L 60 -90 L 46 0 L -46 0 Z" fill={COR.apoio} />
    <rect x={-66} y={-100} width={132} height={18} rx={6} fill={COR.apoioEscuro} />
  </g>
);

/** Post-it com linhas. */
const PostIt: React.FC<{ x: number; y: number; cor: string; ang: number; w?: number; h?: number; linhas?: number }> = ({ x, y, cor, ang, w = 92, h = 92, linhas = 3 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={cor} />
    {Array.from({ length: linhas }, (_, i) => (
      <rect key={i} x={-w / 2 + 12} y={-h / 2 + 20 + i * 18} width={w - 24 - (i % 2) * 18} height={5} rx={2.5} fill={COR.texto} opacity={0.35} />
    ))}
    <circle cx={0} cy={-h / 2 + 6} r={6} fill={COR.destaque} />
  </g>
);

const CORES_POSTIT = ['#F3D98B', '#F6C9A8', '#CFE0CC', COR.branco, '#F3D98B', '#F6C9A8'];
// posições fixas: a geladeira é sempre igual, só ganha mais papel
const POS_POSTIT: [number, number, number][] = [
  [700, 720, -6],
  [800, 760, 4],
  [895, 712, -3],
  [720, 860, 5],
  [850, 880, -5],
  [760, 1060, 3],
  [880, 1090, -4],
  [700, 1200, -2],
  [820, 1230, 6],
  [905, 1340, -6],
  [720, 1370, 4],
  [835, 1440, -3],
];

const Geladeira: React.FC<{ listas: number }> = ({ listas }) => (
  <g>
    <rect x={630} y={620} width={340} height={1000} rx={34} fill="#F4F1EC" />
    <rect x={630} y={1600} width={340} height={20} rx={8} fill="#DCD6CD" />
    <rect x={630} y={960} width={340} height={10} fill="#DCD6CD" />
    <rect x={650} y={680} width={16} height={220} rx={8} fill="#CFC8BE" />
    <rect x={650} y={1000} width={16} height={260} rx={8} fill="#CFC8BE" />
    {/* lista grande da casa */}
    <g transform="translate(880 1180) rotate(3)">
      <rect x={-60} y={-110} width={120} height={220} rx={6} fill={COR.branco} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={-46} y={-86 + i * 24} width={12} height={12} rx={3} fill="none" stroke={COR.destaqueProfundo} strokeWidth={2.5} />
          <rect x={-28} y={-82 + i * 24} width={70 - (i % 3) * 14} height={5} rx={2.5} fill={COR.texto} opacity={0.4} />
        </g>
      ))}
    </g>
    {POS_POSTIT.slice(0, Math.max(0, Math.min(listas, POS_POSTIT.length))).map(([x, y, a], i) => (
      <PostIt key={i} x={x} y={y} ang={a} cor={CORES_POSTIT[i % CORES_POSTIT.length]} />
    ))}
  </g>
);

const Sala: React.FC<{ hora: Hora; camera: number }> = ({ hora, camera }) => (
  <>
    <Camada camera={camera} fator={0.3}>
      <rect x={-300} y={-200} width={1680} height={2400} fill={COR.fundo2} />
      <Janela x={150} y={560} w={380} h={480} hora={hora} />
      {/* quadro */}
      <rect x={640} y={640} width={300} height={220} rx={10} fill={COR.apoio} />
      <rect x={660} y={660} width={260} height={180} rx={6} fill={COR.fundo} />
      <circle cx={760} cy={750} r={46} fill={COR.destaque} opacity={0.85} />
      <circle cx={790} cy={735} r={40} fill={COR.fundo} />
      <rect x={830} y={720} width={60} height={80} rx={30} fill={COR.apoio2} />
      <Piso cor={COR.apoio} />
    </Camada>
    <Camada camera={camera} fator={0.6}>
      {/* tapete */}
      <ellipse cx={600} cy={CHAO_Y + 30} rx={420} ry={70} fill={COR.fundo} />
      {/* sofá */}
      <rect x={560} y={1150} width={520} height={240} rx={60} fill={COR.apoio2} />
      <rect x={530} y={1300} width={580} height={190} rx={50} fill={VERDE_MEDIO} />
      <rect x={600} y={1250} width={170} height={120} rx={30} fill={COR.detalhe} />
      <rect x={800} y={1240} width={170} height={130} rx={30} fill={COR.fundo3} />
      <rect x={560} y={1480} width={30} height={40} rx={6} fill={COR.apoioEscuro} />
      <rect x={1050} y={1480} width={30} height={40} rx={6} fill={COR.apoioEscuro} />
      {/* luminária */}
      <rect x={1100} y={900} width={10} height={600} fill={COR.texto} />
      <path d="M 1040 900 L 1170 900 L 1140 800 L 1070 800 Z" fill={COR.fundo} />
      {hora === 'noite' && <ellipse cx={1105} cy={960} rx={160} ry={120} fill={COR.detalhe} opacity={0.25} />}
    </Camada>
    <Noite hora={hora} />
    <Camada camera={camera} fator={1.3}>
      <Planta x={70} y={CHAO_Y + 60} k={1.2} />
    </Camada>
  </>
);

const Cozinha: React.FC<{ hora: Hora; camera: number; listas: number }> = ({ hora, camera, listas }) => (
  <>
    <Camada camera={camera} fator={0.3}>
      <rect x={-300} y={-200} width={1680} height={2400} fill={COR.fundo} />
      {/* armários de cima */}
      <rect x={-200} y={560} width={760} height={300} rx={16} fill={COR.apoio2Claro} />
      {[-180, 70, 320].map((x) => (
        <g key={x}>
          <rect x={x} y={580} width={220} height={260} rx={12} fill={COR.apoio2Claro} stroke={escurecer(COR.apoio2Claro, 0.1)} strokeWidth={6} />
          <rect x={x + 190} y={690} width={10} height={50} rx={5} fill={COR.apoioEscuro} />
        </g>
      ))}
      {/* azulejo */}
      <rect x={-300} y={1000} width={900} height={250} fill={COR.fundo2} />
      {Array.from({ length: 9 }, (_, i) =>
        Array.from({ length: 3 }, (_, j) => <rect key={`${i}-${j}`} x={-290 + i * 100} y={1008 + j * 82} width={92} height={74} rx={6} fill={COR.fundo3} opacity={0.5} />),
      )}
      <Janela x={150} y={860} w={240} h={120} hora={hora} cortina={null} />
      <Piso cor={COR.fundo3} />
    </Camada>
    <Camada camera={camera} fator={0.6}>
      {/* bancada */}
      <rect x={-300} y={1250} width={900} height={34} rx={8} fill={COR.apoio} />
      <rect x={-280} y={1284} width={860} height={226} fill={COR.apoio2} />
      {[-260, -20, 220, 460].map((x) => (
        <g key={x}>
          <rect x={x} y={1300} width={220} height={190} rx={10} fill={VERDE_MEDIO} />
          <rect x={x + 90} y={1320} width={40} height={10} rx={5} fill={COR.apoioEscuro} />
        </g>
      ))}
      {/* chaleira e pote */}
      <path d="M 40 1250 Q 40 1170 100 1170 Q 160 1170 160 1250 Z" fill={COR.destaque} />
      <rect x={90} y={1150} width={20} height={20} rx={6} fill={COR.texto} />
      <rect x={230} y={1180} width={70} height={70} rx={12} fill={COR.branco} />
      <rect x={230} y={1180} width={70} height={16} rx={6} fill={COR.apoio} />
      <Geladeira listas={listas} />
    </Camada>
    <Noite hora={hora} />
  </>
);

/** Caixa de mudança fechada com fita. */
const Caixa: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={COR.apoio} />
    <rect x={x} y={y} width={w} height={24} fill={COR.apoioEscuro} />
    <rect x={x + w / 2 - 15} y={y} width={30} height={h} fill={COR.fundo3} opacity={0.6} />
  </g>
);

const Quarto: React.FC<{ hora: Hora; camera: number; etapa: number }> = ({ hora, camera, etapa }) => (
  <>
    <Camada camera={camera} fator={0.3}>
      <rect x={-300} y={-200} width={1680} height={2400} fill={COR.apoio2Claro} />
      {/* faixa de parede */}
      <rect x={-300} y={1100} width={1680} height={390} fill={COR.fundo} />
      <rect x={-300} y={1092} width={1680} height={14} fill={COR.apoio} />
      <Janela x={640} y={560} w={300} h={380} hora={hora} cortina={COR.fundo} />
      {etapa >= 3 && (
        <g>
          {/* quadros */}
          <rect x={140} y={640} width={150} height={150} rx={12} fill={COR.fundo} />
          <circle cx={215} cy={715} r={40} fill={COR.detalhe} />
          <rect x={320} y={680} width={130} height={130} rx={12} fill={COR.fundo} />
          <path d="M 340 780 L 385 700 L 430 780 Z" fill={COR.apoio2} />
          {/* prateleira com livros */}
          <rect x={120} y={900} width={360} height={16} rx={6} fill={COR.apoioEscuro} />
          {[COR.destaque, COR.apoio2, COR.detalhe, COR.fundo3, VERDE_ESCURO].map((c, i) => (
            <rect key={i} x={140 + i * 34} y={900 - (60 + (i % 2) * 14)} width={26} height={60 + (i % 2) * 14} rx={4} fill={c} />
          ))}
          <rect x={330} y={860} width={70} height={40} rx={10} fill={COR.branco} />
        </g>
      )}
      <Piso cor={COR.apoio} />
    </Camada>
    <Camada camera={camera} fator={0.6}>
      {etapa === 0 && (
        <g>
          <Caixa x={120} y={1330} w={260} h={190} />
          <Caixa x={170} y={1180} w={190} h={150} />
          <Caixa x={700} y={1380} w={220} h={140} />
        </g>
      )}
      {etapa >= 1 && (
        <g>
          {/* cama de solteiro: cabeceira alta, pé baixo, colchão, travesseiro e manta dobrada */}
          <rect x={70} y={1110} width={46} height={420} rx={16} fill={COR.apoioEscuro} />
          <rect x={540} y={1300} width={40} height={230} rx={14} fill={COR.apoioEscuro} />
          <rect x={100} y={1380} width={450} height={110} rx={14} fill={COR.apoio} />
          <rect x={104} y={1290} width={440} height={100} rx={26} fill={COR.branco} />
          <rect x={124} y={1236} width={160} height={74} rx={30} fill={COR.fundo2} />
          <path d="M 270 1290 L 544 1290 L 544 1400 L 250 1400 Q 236 1340 270 1290 Z" fill={COR.apoio2} />
          <rect x={262} y={1316} width={282} height={18} fill={VERDE_MEDIO} />
        </g>
      )}
      {etapa >= 2 && (
        <g>
          {/* cômoda com abajur */}
          <rect x={700} y={1250} width={320} height={270} rx={16} fill={COR.fundo} />
          <rect x={690} y={1236} width={340} height={26} rx={10} fill={COR.apoio} />
          {[1290, 1370, 1450].map((y) => (
            <g key={y}>
              <rect x={720} y={y} width={280} height={64} rx={10} fill={COR.fundo2} />
              <circle cx={860} cy={y + 32} r={8} fill={COR.apoioEscuro} />
            </g>
          ))}
          <rect x={900} y={1150} width={12} height={86} fill={COR.texto} />
          <path d="M 850 1150 L 962 1150 L 940 1070 L 872 1070 Z" fill={COR.detalhe} />
          <rect x={870} y={1222} width={72} height={16} rx={6} fill={COR.texto} />
        </g>
      )}
      {etapa >= 3 && <Planta x={620} y={1525} k={0.75} />}
    </Camada>
    <Noite hora={hora} />
    {hora === 'noite' && etapa >= 2 && (
      <Camada camera={camera} fator={0.6}>
        <ellipse cx={906} cy={1160} rx={170} ry={110} fill={COR.detalhe} opacity={0.22} />
      </Camada>
    )}
  </>
);

const Banheiro: React.FC<{ hora: Hora; camera: number; objetos: ObjetoPia[]; brilhando: number; brilho: number }> = ({ hora, camera, objetos, brilhando, brilho }) => (
  <>
    <Camada camera={camera} fator={0.3}>
      <rect x={-300} y={-200} width={1680} height={2400} fill={COR.fundo} />
      {/* azulejo até meia parede */}
      <rect x={-300} y={980} width={1680} height={520} fill={COR.apoio2Claro} />
      {Array.from({ length: 16 }, (_, i) =>
        Array.from({ length: 6 }, (_, j) => <rect key={`${i}-${j}`} x={-290 + i * 110} y={988 + j * 86} width={102} height={78} rx={6} fill={escurecer(COR.apoio2Claro, 0.06)} opacity={0.6} />),
      )}
      {/* espelho */}
      <ellipse cx={720} cy={760} rx={190} ry={230} fill={COR.apoio} />
      <ellipse cx={720} cy={760} rx={170} ry={210} fill={hora === 'dia' ? '#EAF2EE' : '#C9D3E8'} />
      <path d="M 640 640 L 700 600 M 630 700 L 740 620" stroke={COR.branco} strokeWidth={14} strokeLinecap="round" opacity={0.7} />
      {/* toalha */}
      <rect x={120} y={760} width={180} height={18} rx={9} fill={COR.apoioEscuro} />
      <rect x={140} y={770} width={140} height={300} rx={18} fill={COR.fundo3} />
      <rect x={140} y={1010} width={140} height={22} fill={COR.destaque} opacity={0.8} />
      <Piso cor={COR.fundo3} />
    </Camada>
    <Camada camera={camera} fator={0.6}>
      {/* bancada da pia */}
      <rect x={430} y={1250} width={700} height={36} rx={10} fill={COR.apoio} />
      <rect x={450} y={1286} width={660} height={234} fill={COR.apoio2} />
      {[470, 790].map((x) => (
        <g key={x}>
          <rect x={x} y={1300} width={300} height={200} rx={12} fill={VERDE_MEDIO} />
          <rect x={x + 130} y={1320} width={40} height={10} rx={5} fill={COR.apoioEscuro} />
        </g>
      ))}
      {/* cuba e torneira */}
      <ellipse cx={900} cy={1250} rx={120} ry={24} fill={COR.branco} />
      <rect x={885} y={1160} width={30} height={80} rx={10} fill="#C9C3BA" />
      <rect x={885} y={1160} width={80} height={24} rx={10} fill="#C9C3BA" />
      {/* objetos na pia (genéricos, escolhidos pelo vídeo) */}
      {objetos.slice(0, 4).map((tipo, i) => (
        <g key={i}>
          {i === brilhando && brilho > 0 && <ellipse cx={490 + i * 80} cy={1190} rx={48} ry={90} fill={COR.detalhe} opacity={0.5 * brilho} />}
          <ObjetoDePia tipo={tipo} x={490 + i * 80} y={1252} angulo={[-3, 2, -2, 3][i]} />
        </g>
      ))}
    </Camada>
    <Noite hora={hora} />
  </>
);

export const Casa: React.FC<CasaProps> = ({ comodo = 'sala', hora = 'dia', camera = 0, zoom = 1, listas = 8, etapaQuarto = 0, objetosNaPia = [], objetoBrilhando = -1, brilho = 0 }) => (
  <QuadroCenario zoom={zoom}>
    {comodo === 'sala' && <Sala hora={hora} camera={camera} />}
    {comodo === 'cozinha' && <Cozinha hora={hora} camera={camera} listas={listas} />}
    {comodo === 'quarto' && <Quarto hora={hora} camera={camera} etapa={etapaQuarto} />}
    {comodo === 'banheiro' && <Banheiro hora={hora} camera={camera} objetos={objetosNaPia} brilhando={objetoBrilhando} brilho={brilho} />}
  </QuadroCenario>
);
