import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COR, TRACO } from '../componentes/cores';
import { Abajur, ALTURA, Camada, CenarioBaseProps, CHAO_Y, LARGURA, Luz, QuadroCenario, VeuLuz, corCeu } from '../componentes/Cenario';
import { Blocos, Caixa, Caneca, Carrinho, Livros, Planta } from '../componentes/objetos';

// Apartamento da protagonista: sala integrada com a cozinha, e um quarto.
// Opcionais: brinquedos no chão (casa com criança) e uma caixa de papelão com rótulo à mão, que pode
// ir esvaziando ao longo da série (`caixa={{ cheia: 0.6, rotulo: '...' }}`).
export type Comodo = 'sala' | 'quarto';
export type CaixaNaCena = { cheia?: number; rotulo?: string | null } | null;

const T = TRACO * 1.6; // traço do cenário (um pouco mais grosso que o dos personagens, que são menores)

const Chao: React.FC = () => (
  <g>
    <rect x={-300} y={1480} width={LARGURA + 600} height={ALTURA - 1480 + 200} fill={COR.madeiraClara} />
    {Array.from({ length: 9 }, (_, i) => (
      <path key={i} d={`M -300 ${1520 + i * 60} L ${LARGURA + 300} ${1520 + i * 60}`} stroke={COR.madeira} strokeWidth={3} />
    ))}
    {Array.from({ length: 14 }, (_, i) => (
      <path key={'v' + i} d={`M ${-260 + i * 130 + (i % 2) * 60} ${1480 + (i % 3) * 60} l 0 60`} stroke={COR.madeira} strokeWidth={3} />
    ))}
    <rect x={-300} y={1462} width={LARGURA + 600} height={22} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
  </g>
);

const Janela: React.FC<{ x: number; y: number; w: number; h: number; luz: Luz }> = ({ x, y, w, h, luz }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={corCeu(luz)} stroke={COR.tinta} strokeWidth={T} />
    {luz === 'madrugada' && (
      <>
        <circle cx={x + w * 0.72} cy={y + h * 0.25} r={26} fill="#F3E9CF" />
        {[
          [0.2, 0.2],
          [0.4, 0.35],
          [0.3, 0.6],
          [0.8, 0.55],
        ].map(([a, b], i) => (
          <circle key={i} cx={x + w * a} cy={y + h * b} r={3} fill="#F3E9CF" />
        ))}
      </>
    )}
    {/* prédios ao longe */}
    <path
      d={`M ${x} ${y + h} L ${x} ${y + h * 0.72} L ${x + w * 0.18} ${y + h * 0.72} L ${x + w * 0.18} ${y + h * 0.58} L ${x + w * 0.4} ${y + h * 0.58} L ${x + w * 0.4} ${y + h * 0.78} L ${x + w * 0.62} ${y + h * 0.78} L ${x + w * 0.62} ${y + h * 0.64} L ${x + w} ${y + h * 0.64} L ${x + w} ${y + h} Z`}
      fill={luz === 'madrugada' ? '#3B4862' : COR.petroleoClaro}
      opacity={0.55}
    />
    <path d={`M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h / 2} L ${x + w} ${y + h / 2}`} stroke={COR.papel} strokeWidth={12} />
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={COR.tinta} strokeWidth={T} />
    <rect x={x - 24} y={y + h} width={w + 48} height={20} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
  </g>
);

const Sala: React.FC<{ luz: Luz; camera: number; caixa: CaixaNaCena; frame: number; brinquedos: boolean }> = ({ luz, camera, caixa, frame, brinquedos }) => (
  <>
    <Camada camera={camera} fator={0.3}>
      <rect x={-400} y={-200} width={LARGURA + 800} height={1700} fill={COR.linhoClaro} />
      <Janela x={70} y={520} w={300} h={420} luz={luz} />
      {/* quadro abstrato */}
      <rect x={470} y={600} width={170} height={210} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
      <circle cx={530} cy={680} r={34} fill={COR.oliva} />
      <rect x={555} y={700} width={60} height={80} fill={COR.petroleoClaro} />
      {/* armários da cozinha ao fundo, à direita */}
      <rect x={740} y={560} width={420} height={210} fill={COR.petroleo} stroke={COR.tinta} strokeWidth={T} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={752 + i * 136} y={572} width={124} height={186} fill="none" stroke={COR.petroleoClaro} strokeWidth={3} />
          <circle cx={868 + i * 136} cy={740} r={5} fill={COR.linho} />
        </g>
      ))}
    </Camada>
    <Camada camera={camera} fator={0.6}>
      {/* bancada da cozinha */}
      <rect x={720} y={1160} width={460} height={310} fill={COR.petroleo} stroke={COR.tinta} strokeWidth={T} />
      <rect x={700} y={1130} width={500} height={34} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
      {[0, 1].map((i) => (
        <rect key={i} x={740 + i * 200} y={1190} width={180} height={250} fill="none" stroke={COR.petroleoClaro} strokeWidth={3} />
      ))}
      <Caneca x={800} y={1130} escala={1.3} frame={frame} />
      {/* pendente sobre a bancada */}
      <path d="M 960 -50 L 960 880" stroke={COR.tinta} strokeWidth={4} />
      <path d="M 900 940 Q 960 860 1020 940 Z" fill={COR.oliva} stroke={COR.tinta} strokeWidth={T} />
    </Camada>
    <Chao />
    <Camada camera={camera} fator={0.8}>
      {/* tapete */}
      <ellipse cx={420} cy={1560} rx={380} ry={60} fill={COR.olivaClara} stroke={COR.tinta} strokeWidth={T} />
      {/* sofá */}
      <rect x={20} y={1200} width={560} height={110} rx={30} fill={COR.petroleo} stroke={COR.tinta} strokeWidth={T} />
      <rect x={0} y={1290} width={600} height={150} rx={30} fill={COR.petroleo} stroke={COR.tinta} strokeWidth={T} />
      <rect x={-10} y={1260} width={70} height={190} rx={26} fill={COR.petroleoClaro} stroke={COR.tinta} strokeWidth={T} />
      <rect x={540} y={1260} width={70} height={190} rx={26} fill={COR.petroleoClaro} stroke={COR.tinta} strokeWidth={T} />
      <path d="M 300 1300 L 300 1430" stroke={COR.tinta} strokeWidth={3} />
      <rect x={90} y={1230} width={120} height={90} rx={20} fill={COR.linho} stroke={COR.tinta} strokeWidth={T} transform="rotate(-8 150 1275)" />
      {[60, 540].map((x) => (
        <rect key={x} x={x} y={1440} width={14} height={34} fill={COR.tinta} />
      ))}
      <Planta x={660} y={1470} escala={1.1} />
    </Camada>
    <Camada camera={camera} fator={1}>
      {brinquedos && <Blocos x={130} y={1600} escala={1.2} />}
      {brinquedos && <Carrinho x={880} y={1680} escala={1.3} angulo={-12} />}
      {caixa && <Caixa x={760} y={1610} escala={1.05} cheia={caixa.cheia ?? 1} rotulo={caixa.rotulo ?? null} />}
    </Camada>
  </>
);

const Quarto: React.FC<{ luz: Luz; camera: number; caixa: CaixaNaCena; brinquedos: boolean }> = ({ luz, camera, caixa, brinquedos }) => (
  <>
    <Camada camera={camera} fator={0.3}>
      <rect x={-400} y={-200} width={LARGURA + 800} height={1700} fill={COR.linhoClaro} />
      {/* meia parede pintada */}
      <rect x={-400} y={1060} width={LARGURA + 800} height={420} fill={COR.olivaClara} />
      <path d={`M -400 1060 L ${LARGURA + 400} 1060`} stroke={COR.tinta} strokeWidth={T} />
      <Janela x={640} y={500} w={300} h={400} luz={luz} />
      {/* prateleira com livros e um vaso */}
      <rect x={90} y={760} width={360} height={18} fill={COR.madeira} stroke={COR.tinta} strokeWidth={T} />
      {[COR.coralProfundo, COR.petroleo, COR.oliva, COR.madeiraClara, COR.petroleoClaro].map((c, i) => (
        <rect key={i} x={110 + i * 46} y={668 - (i % 2) * 14} width={38} height={92 + (i % 2) * 14} fill={c} stroke={COR.tinta} strokeWidth={TRACO} />
      ))}
      <circle cx={400} cy={720} r={34} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
      {/* quadro com uma paisagem simples */}
      <g transform="rotate(-3 210 930)">
        <rect x={130} y={860} width={160} height={120} fill={COR.papel} stroke={COR.tinta} strokeWidth={TRACO * 1.2} />
        <path d="M 140 966 L 190 910 L 222 944 L 248 918 L 280 966 Z" fill={COR.oliva} stroke={COR.tinta} strokeWidth={TRACO} strokeLinejoin="round" />
        <circle cx={256} cy={888} r={11} fill="#E7B75F" />
      </g>
    </Camada>
    <Chao />
    <Camada camera={camera} fator={0.8}>
      {/* cama de solteiro com manta e travesseiro */}
      <rect x={30} y={1260} width={470} height={150} rx={18} fill={COR.papel} stroke={COR.tinta} strokeWidth={T} />
      <rect x={30} y={1300} width={470} height={110} rx={12} fill={COR.petroleoClaro} stroke={COR.tinta} strokeWidth={T} />
      <path d="M 120 1300 L 120 1410 M 410 1300 L 410 1410" stroke={COR.petroleo} strokeWidth={5} />
      <rect x={10} y={1170} width={40} height={310} rx={10} fill={COR.madeira} stroke={COR.tinta} strokeWidth={T} />
      <rect x={480} y={1230} width={40} height={250} rx={10} fill={COR.madeira} stroke={COR.tinta} strokeWidth={T} />
      <rect x={60} y={1236} width={120} height={64} rx={24} fill={COR.linho} stroke={COR.tinta} strokeWidth={T} />
      {/* mesa de cabeceira com livros */}
      <rect x={600} y={1300} width={190} height={170} rx={8} fill={COR.madeiraClara} stroke={COR.tinta} strokeWidth={T} />
      <path d="M 600 1384 L 790 1384" stroke={COR.tinta} strokeWidth={TRACO} />
      <circle cx={695} cy={1346} r={6} fill={COR.tinta} />
      <circle cx={695} cy={1428} r={6} fill={COR.tinta} />
      <Livros x={695} y={1300} escala={0.9} />
    </Camada>
    <Camada camera={camera} fator={1}>
      {brinquedos && <Blocos x={880} y={1640} escala={1.2} />}
      {caixa && <Caixa x={260} y={1650} escala={1.05} cheia={caixa.cheia ?? 1} rotulo={caixa.rotulo ?? null} />}
    </Camada>
  </>
);

export const Apartamento: React.FC<
  CenarioBaseProps & {
    comodo?: Comodo;
    /** Caixa de papelão no chão (null = sem caixa). */
    caixa?: CaixaNaCena;
    /** Brinquedos no chão (casa com criança). */
    brinquedos?: boolean;
  }
> = ({ comodo = 'sala', luz = 'manha', camera = 0, zoom = 1, caixa = null, brinquedos = false }) => {
  const frame = useCurrentFrame();
  return (
    <QuadroCenario zoom={zoom}>
      {comodo === 'sala' ? <Sala luz={luz} camera={camera} caixa={caixa} frame={frame} brinquedos={brinquedos} /> : <Quarto luz={luz} camera={camera} caixa={caixa} brinquedos={brinquedos} />}
      <VeuLuz luz={luz} />
      {luz === 'madrugada' && <Abajur x={comodo === 'sala' ? 960 : 695} y={comodo === 'sala' ? 1000 : 1240} />}
    </QuadroCenario>
  );
};

export { CHAO_Y };
