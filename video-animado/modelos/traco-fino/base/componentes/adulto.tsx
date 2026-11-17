import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COR, Pele, TONS_PELE, TRACO, escurecer } from './cores';
import { balanco, piscada, respiracao } from './anima';
import { Expressao, Olhar, Rosto, inclinacaoDe } from './rosto';
import { Braco, Ponto } from './braco';
import { AparenciaAdulto, AparenciaEntrada, Epoca, resolverAdulto } from './presets';
import { Caixa, CadernoNaMao, CelularDeCostas, CelularMostrando } from './objetos';

// Corpo adulto realista (cerca de 7 cabeças de altura) num quadro de 400 x 900, pés em y = 890.
// Traço editorial: toda forma tem contorno fino em tinta. Todo adulto do universo é uma configuração
// deste corpo (pele, cabelo, roupa, óculos, barba, barriga, ombros, altura), vinda do respostas.json.

export type Segurando = 'nada' | 'celular' | 'caderno' | 'caixa' | 'mostrando';

type Pose = { esq: { cotovelo: Ponto; mao: Ponto; apontar?: Ponto | null }; dir: { cotovelo: Ponto; mao: Ponto; apontar?: Ponto | null } };

/** Ombros em (140, 192) e (260, 192). "esq" e "dir" do ponto de vista de quem assiste. */
export const poseAdulto = (e: Expressao, segurando: Segurando, t: number): Pose => {
  const gesto = Math.sin(t * 5) * 5;
  const repEsq = { cotovelo: [127, 334] as Ponto, mao: [133, 458] as Ponto };
  const repDir = { cotovelo: [273, 334] as Ponto, mao: [267, 458] as Ponto };
  if (segurando === 'celular') return { esq: { cotovelo: [142, 335], mao: [188, 300] }, dir: { cotovelo: [258, 335], mao: [212, 300] } };
  if (segurando === 'caderno') return { esq: { cotovelo: [130, 330], mao: [168, 318] }, dir: { cotovelo: [272, 330], mao: [238, 296] } };
  if (segurando === 'mostrando') return { esq: { cotovelo: [112, 336], mao: [70, 484] }, dir: { cotovelo: [273, 334], mao: [267, 458] } };
  if (segurando === 'caixa') return { esq: { cotovelo: [118, 320], mao: [140, 400] }, dir: { cotovelo: [282, 320], mao: [260, 400] } };
  switch (e) {
    case 'falando':
      return { esq: repEsq, dir: { cotovelo: [286, 322], mao: [302, 240 + gesto] } };
    case 'feliz':
      return { esq: { cotovelo: [116, 326], mao: [96, 438] }, dir: { cotovelo: [284, 326], mao: [304, 438] } };
    case 'surpresa':
      return { esq: { cotovelo: [128, 322], mao: [172, 252] }, dir: { cotovelo: [272, 322], mao: [228, 252] } };
    case 'pensando':
      return { esq: { cotovelo: [156, 300], mao: [192, 166] }, dir: { cotovelo: [268, 330], mao: [176, 318] } };
    case 'apontando':
      return { esq: repEsq, dir: { cotovelo: [306, 188], mao: [350, 108], apontar: [16, -20] } };
    case 'ironica':
      return { esq: repEsq, dir: { cotovelo: [312, 316], mao: [266, 404] } };
    case 'exausta':
      return { esq: { cotovelo: [130, 342], mao: [140, 472] }, dir: { cotovelo: [270, 342], mao: [260, 472] } };
    case 'aliviada':
      return { esq: repEsq, dir: { cotovelo: [268, 318], mao: [214, 238] } };
    default:
      return { esq: repEsq, dir: repDir };
  }
};

// ---------------------------------------------------------------- cabelo (camadas: costas, atrás da cabeça, frente)

type Camadas = { costas?: React.ReactNode; atras?: React.ReactNode; frente?: React.ReactNode };

const forma = (d: string, cor: string, key?: string) => <path key={key} d={d} fill={cor} stroke={COR.tinta} strokeWidth={TRACO} strokeLinejoin="round" />;

/** Topo com risca de lado e mechas retas até `fim` (y): o corte reto da ilustração. */
const franjaLateral = (cor: string, brilho: string, fim: number) => (
  <g>
    {forma('M 151 94 C 144 38 174 20 202 22 C 238 24 256 50 250 98 C 244 70 226 52 204 48 C 192 66 172 80 151 94 Z', cor)}
    {forma(`M 152 76 C 145 110 143 ${fim - 30} 144 ${fim} L 170 ${fim} C 164 ${fim - 34} 160 108 164 84 Z`, cor)}
    {forma(`M 248 76 C 255 110 257 ${fim - 30} 256 ${fim} L 232 ${fim} C 238 ${fim - 34} 240 108 236 84 Z`, cor)}
    <path d="M 214 34 Q 234 40 240 58" stroke={brilho} strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

/** Cabelo puxado para trás (rabo e coque): linha da testa até a têmpora. */
const puxado = (cor: string, brilho: string) => (
  <g>
    {forma('M 151 88 C 143 24 257 24 249 88 C 244 62 226 48 200 48 C 174 48 156 62 151 88 Z', cor)}
    <path d="M 214 46 Q 230 50 236 64" stroke={brilho} strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

/** Cachos pequenos desenhados por cima do volume (textura do crespo). */
const cachos = (pontos: [number, number][], cor: string) =>
  pontos.map(([x, y], i) => <path key={i} d={`M ${x - 7} ${y + 2} q 4 -9 11 -4 q 4 5 -2 8`} stroke={cor} strokeWidth={2.4} fill="none" strokeLinecap="round" />);

export const cabeloAdulto = (a: AparenciaAdulto): Camadas => {
  const c = a.corCabelo;
  switch (a.cabelo) {
    case 'chanel':
      return { atras: forma('M 146 66 C 140 14 260 14 254 66 L 258 150 Q 230 157 200 155 Q 170 157 142 150 Z', c), frente: franjaLateral(c, a.corBrilho, 150) };
    case 'comprido':
      return {
        costas: forma('M 146 70 C 140 14 260 14 254 70 L 268 290 Q 200 304 132 290 Z', c),
        atras: forma('M 146 66 C 140 14 260 14 254 66 L 258 150 Q 230 157 200 155 Q 170 157 142 150 Z', c),
        frente: franjaLateral(c, a.corBrilho, 250),
      };
    case 'rabo':
      // o rabo fica atrás do tronco (camada das costas): passa por trás do ombro e do braço
      return {
        costas: (
          <g>
            {forma('M 230 40 C 268 42 286 84 282 132 C 280 170 264 198 250 210 C 256 180 258 150 252 120 C 248 96 240 76 224 60 Z', c)}
            <ellipse cx={236} cy={50} rx={9} ry={12} fill={escurecer(c, 0.25)} stroke={COR.tinta} strokeWidth={TRACO} transform="rotate(30 236 50)" />
          </g>
        ),
        frente: puxado(c, a.corBrilho),
      };
    case 'coque':
      return {
        atras: (
          <g>
            <circle cx={200} cy={22} r={27} fill={c} stroke={COR.tinta} strokeWidth={TRACO} />
            <path d="M 184 22 Q 200 30 216 22" stroke={escurecer(c, 0.3)} strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d="M 178 44 Q 200 52 222 44" stroke={COR.tinta} strokeWidth={TRACO} fill="none" />
          </g>
        ),
        frente: puxado(c, a.corBrilho),
      };
    case 'curto':
      return { frente: forma('M 152 74 C 146 22 254 22 248 74 C 240 54 222 46 200 46 C 178 46 160 54 152 74 Z', c) };
    case 'crespo':
      return {
        atras: (
          <g>
            {forma('M 200 -4 C 136 -8 108 40 116 94 C 120 128 138 140 156 136 L 244 136 C 262 140 280 128 284 94 C 292 40 264 -8 200 -4 Z', c)}
            {cachos([[132, 60], [126, 96], [140, 22], [268, 60], [274, 96], [258, 22], [170, 4], [228, 4]], escurecer(c, 0.35))}
          </g>
        ),
        frente: forma('M 152 88 C 146 30 254 30 248 88 C 242 66 224 54 200 54 C 176 54 158 66 152 88 Z', c),
      };
    default:
      return {};
  }
};

const Barba: React.FC<{ cor: string }> = ({ cor }) => (
  <g>
    <path d="M 156 96 C 158 128 176 146 200 146 C 224 146 242 128 244 96 C 238 116 224 130 200 130 C 176 130 162 116 156 96 Z" fill={cor} stroke={COR.tinta} strokeWidth={TRACO} strokeLinejoin="round" />
    <path d="M 186 112 Q 200 106 214 112 Q 200 116 186 112 Z" fill={cor} />
  </g>
);

/** Óculos de armação fina, por cima dos olhos (rosto em cx 200, olhos em y 88, afastados 17). */
export const Oculos: React.FC<{ cx: number; cy: number; afast: number; k?: number; cor: string; espessura?: number }> = ({ cx, cy, afast, k = 1, cor, espessura = TRACO * 0.9 }) => {
  const w = 24 * k;
  const h = 18 * k;
  return (
    <g fill={COR.branco} fillOpacity={0.18} stroke={cor} strokeWidth={espessura}>
      <rect x={cx - afast * k - w / 2} y={cy - h / 2 - 1 * k} width={w} height={h} rx={6 * k} />
      <rect x={cx + afast * k - w / 2} y={cy - h / 2 - 1 * k} width={w} height={h} rx={6 * k} />
      <path d={`M ${cx - afast * k + w / 2} ${cy - 2 * k} Q ${cx} ${cy - 6 * k} ${cx + afast * k - w / 2} ${cy - 2 * k}`} fill="none" />
    </g>
  );
};

/**
 * Barriga como formato do corpo (nunca um oval por cima da roupa): o tronco alarga na cintura e a barriga
 * cai um pouco por cima do cós, com o contorno só embaixo e uma sombra fina do lado direito. b de 0 a 1.
 */
const Barriga: React.FC<{ b: number; cor: string; ladoCintura: number; yCintura: number }> = ({ b, cor, ladoCintura, yCintura }) => {
  if (b <= 0.08) return null;
  const w = ladoCintura; // meia largura na cintura
  const yb = 446 + b * 20; // ponto mais baixo da barriga, por cima do cós
  const lados = `M ${200 - w} ${yCintura} C ${200 - w - 10 * b} ${yCintura + 50} ${200 - w + 4} ${yb - 4} 200 ${yb} C ${200 + w - 4} ${yb - 4} ${200 + w + 10 * b} ${yCintura + 50} ${200 + w} ${yCintura}`;
  return (
    <g>
      <path d={lados + ' Z'} fill={cor} />
      <path d={`M ${200 + w * 0.55} ${yb - 10} Q ${200 + w + 6 * b} ${yCintura + 50} ${200 + w} ${yCintura + 8}`} stroke={escurecer(cor, 0.12)} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={lados} fill="none" stroke={COR.tinta} strokeWidth={TRACO} strokeLinecap="round" />
    </g>
  );
};

const MANGA: Record<AparenciaAdulto['manga'], number> = { sem: 0, curta: 1, longa: 2 };

export type CorpoAdultoProps = {
  frame: number;
  fps: number;
  semente: number;
  parada: boolean;
  aparencia: AparenciaAdulto;
  expressao: Expressao;
  falando: number;
  olhando?: Olhar;
  segurando: Segurando;
  /** Desenhado na mão (celular, caderno, caixa). */
  objetoNaMao?: React.ReactNode;
};

export const CorpoAdulto: React.FC<CorpoAdultoProps> = (p) => {
  const a = p.aparencia;
  const pele: Pele = TONS_PELE[a.pele];
  const f = p.parada ? 0 : p.frame;
  const t = f / p.fps;
  const resp = p.parada ? 0 : respiracao(f, p.fps, p.semente);
  const pisc = p.parada ? 1 : piscada(f, p.semente);
  const b = a.barriga;
  const O = a.ombros;
  const caido = p.expressao === 'exausta' ? 6 : 0;
  const incl = inclinacaoDe(p.expressao) + (p.parada ? 0 : balanco(f, p.fps, 0.33, p.semente) * 1);
  const olhar: Olhar | undefined = (p.segurando === 'celular' || p.segurando === 'caderno') && !p.olhando ? 'baixo' : p.olhando;
  const pose = poseAdulto(p.expressao, p.segurando, t);
  const sw = TRACO;
  const aberta = a.camisa === 'aberta';
  const ombroE: Ponto = [140 - O * 0.7, 192 + caido];
  const ombroD: Ponto = [260 + O * 0.7, 192 + caido];
  const maoNoRosto = p.expressao === 'pensando' && p.segurando === 'nada';
  const cabelo = cabeloAdulto(a);

  // tronco (de ombro a ombro, cintura, quadril). A barriga empurra a cintura para fora.
  const cint = 52 - b * 6 + O * 0.4;
  const barr = b * 26;
  const tronco = `M ${130 - O} ${182 + caido} Q 200 ${168 + caido} ${270 + O} ${182 + caido}
    Q ${276 + O} ${214 + caido} ${262 + O * 0.6} 240
    Q ${200 + cint + barr * 0.6} 300 ${200 + cint + barr} ${370 - b * 10}
    Q ${200 + 70 + barr * 0.4} 420 268 456 L 132 456
    Q ${200 - 70 - barr * 0.4} 420 ${200 - cint - barr} ${370 - b * 10}
    Q ${200 - cint - barr * 0.6} 300 ${138 - O * 0.6} 240
    Q ${124 - O} ${214 + caido} ${130 - O} ${182 + caido} Z`;

  const braco = (lado: 'esq' | 'dir') => (
    <Braco
      key={lado}
      ombro={lado === 'esq' ? ombroE : ombroD}
      cotovelo={pose[lado].cotovelo}
      mao={pose[lado].mao}
      apontar={pose[lado].apontar}
      pele={pele}
      manga={a.topo}
      manga_ate={MANGA[a.manga]}
    />
  );

  const perna = (l: -1 | 1) => {
    // l = -1 perna da esquerda de quem assiste, 1 da direita
    const x = (v: number) => 200 + l * v;
    if (a.tipoBaixo === 'calca') {
      return <path key={l} d={`M ${x(66)} 448 L ${x(1)} 448 L ${x(1)} 512 L ${x(9)} 848 L ${x(54)} 848 Q ${x(64)} 640 ${x(66)} 448 Z`} fill={a.baixo} stroke={COR.tinta} strokeWidth={sw} strokeLinejoin="round" />;
    }
    const topoPele = a.tipoBaixo === 'bermuda' ? 590 : 520;
    return (
      <g key={l}>
        <path d={`M ${x(58)} ${topoPele} L ${x(6)} ${topoPele} L ${x(9)} 848 L ${x(54)} 848 Q ${x(60)} ${topoPele + 120} ${x(58)} ${topoPele} Z`} fill={pele.base} stroke={COR.tinta} strokeWidth={sw} strokeLinejoin="round" />
        {a.tipoBaixo === 'bermuda' && (
          <path d={`M ${x(66)} 448 L ${x(1)} 448 L ${x(1)} 512 L ${x(4)} 606 L ${x(62)} 606 Q ${x(65)} 520 ${x(66)} 448 Z`} fill={a.baixo} stroke={COR.tinta} strokeWidth={sw} strokeLinejoin="round" />
        )}
      </g>
    );
  };

  return (
    <g>
      <ellipse cx={200} cy={889} rx={96} ry={9} fill={COR.sombra} />
      {perna(-1)}
      {perna(1)}
      {a.tipoBaixo === 'saia' && <path d="M 134 446 L 266 446 L 286 640 Q 200 656 114 640 Z" fill={a.baixo} stroke={COR.tinta} strokeWidth={sw} strokeLinejoin="round" />}
      {/* tênis */}
      {[-1, 1].map((l) => (
        <g key={l}>
          <path
            d={`M ${200 + l * 8} 888 L ${200 + l * 8} 858 Q ${200 + l * 10} 842 ${200 + l * 30} 842 L ${200 + l * 48} 842 Q ${200 + l * 66} 850 ${200 + l * 64} 888 Z`}
            fill={a.tenis}
            stroke={COR.tinta}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d={`M ${200 + l * 8} 880 L ${200 + l * 64} 880`} stroke={a.sola} strokeWidth={6} />
          <path d={`M ${200 + l * 8} 888 L ${200 + l * 64} 888`} stroke={COR.tinta} strokeWidth={sw} strokeLinecap="round" />
        </g>
      ))}

      {cabelo.costas && <g transform={`translate(0 ${resp * 1.6 + caido + 14})`}>{cabelo.costas}</g>}
      <g transform={`translate(0 ${resp * 1})`}>
        {/* pescoço */}
        <path d={`M 185 140 L 184 ${184 + caido} L 216 ${184 + caido} L 215 140 Z`} fill={pele.base} stroke={COR.tinta} strokeWidth={sw} />
        <path d={`M 186 ${162} Q 200 ${170} 214 ${162}`} stroke={pele.sombra} strokeWidth={sw} fill="none" />
        {/* tronco */}
        <path d={tronco} fill={a.topo} stroke={COR.tinta} strokeWidth={sw} strokeLinejoin="round" />
        {aberta ? (
          <>
            {/* regata por baixo, aparecendo na abertura da camisa */}
            <path
              d={`M 178 ${178 + caido} Q 200 ${200 + caido} 222 ${178 + caido} L ${236 + barr * 0.55} ${372 - b * 10} Q ${238 + barr * 0.3} 420 232 455 L 168 455 Q ${162 - barr * 0.3} 420 ${164 - barr * 0.55} ${372 - b * 10} Z`}
              fill={a.porBaixo}
              stroke={COR.tinta}
              strokeWidth={sw}
              strokeLinejoin="round"
            />
            {/* gola da camisa */}
            <path d={`M 172 ${176 + caido} L 186 ${214 + caido} L 178 ${176 + caido} Z`} fill={a.topo} stroke={COR.tinta} strokeWidth={sw} strokeLinejoin="round" />
            <path d={`M 228 ${176 + caido} L 214 ${214 + caido} L 222 ${176 + caido} Z`} fill={a.topo} stroke={COR.tinta} strokeWidth={sw} strokeLinejoin="round" />
          </>
        ) : (
          <path d={`M 178 ${178 + caido} Q 200 ${196 + caido} 222 ${178 + caido}`} stroke={COR.tinta} strokeWidth={sw} fill="none" strokeLinecap="round" />
        )}
        {/* cós */}
        <path d="M 133 446 L 267 446" stroke={COR.tinta} strokeWidth={sw} />
        {b > 0.08 && <Barriga b={b} cor={aberta ? a.porBaixo : a.topo} ladoCintura={cint + barr} yCintura={370 - b * 10} />}
        {!maoNoRosto && braco('esq')}
        {!maoNoRosto && braco('dir')}
        {p.objetoNaMao}
      </g>

      <g transform={`translate(0 ${resp * 1.6 + caido + 14}) rotate(${incl} 200 150)`}>
        {cabelo.atras}
        {/* orelhas */}
        <ellipse cx={155} cy={90} rx={7} ry={12} fill={pele.base} stroke={COR.tinta} strokeWidth={sw} />
        <ellipse cx={245} cy={90} rx={7} ry={12} fill={pele.base} stroke={COR.tinta} strokeWidth={sw} />
        {/* cabeça */}
        <path d="M 154 80 C 154 26 246 26 246 80 C 246 118 228 140 200 142 C 172 140 154 118 154 80 Z" fill={pele.base} stroke={COR.tinta} strokeWidth={sw} />
        {a.barba && <Barba cor={a.corCabelo} />}
        <Rosto cx={200} cy={88} pele={pele} corSobrancelha={a.corSobrancelha} expressao={p.expressao} falando={p.falando} olhando={olhar} piscar={pisc} cilios={a.cilios} />
        {a.oculos && <Oculos cx={200} cy={88} afast={17} cor={a.corOculos} />}
        {cabelo.frente}
      </g>
      {maoNoRosto && (
        <g transform={`translate(0 ${resp})`}>
          {braco('dir')}
          {braco('esq')}
        </g>
      )}
    </g>
  );
};

/** Moldura SVG comum: escala, espelho e altura relativa (1 = altura do adulto padrão). */
export const MolduraPersonagem: React.FC<{ escala: number; espelhar: boolean; altura?: number; children: React.ReactNode }> = ({ escala, espelhar, altura = 1, children }) => (
  <svg width={400 * escala} height={900 * escala} viewBox="0 0 400 900" style={{ overflow: 'visible' }}>
    <g transform={espelhar ? 'translate(400 0) scale(-1 1)' : undefined}>
      <g transform={`translate(${200 * (1 - altura)} ${900 * (1 - altura)}) scale(${altura})`}>{children}</g>
    </g>
  </svg>
);

/** Props que a Parte B usa em todo adulto do elenco. */
export type AdultoPersonagemProps = {
  expressao?: Expressao;
  /** 0 a 1: volume da voz no frame (abre a boca). */
  falando?: number;
  olhando?: Olhar;
  segurando?: Segurando;
  escala?: number;
  espelhar?: boolean;
  /** Desliga respiração e piscada (folhas e imagens paradas). */
  parada?: boolean;
  /** "antes" desenha a aparência do antes (só o que muda); a cena passa por <Lembranca>. */
  epoca?: Epoca;
};

/** Adulto configurável: aparência do respostas.json (ou de um preset), mais a do antes. */
export const Adulto: React.FC<AdultoPersonagemProps & { aparencia: AparenciaEntrada; antes?: AparenciaEntrada | null; semente?: number }> = ({
  aparencia,
  antes = null,
  semente = 1,
  expressao = 'neutra',
  falando = 0,
  olhando,
  segurando = 'nada',
  escala = 1,
  espelhar = false,
  parada = false,
  epoca = 'agora',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = resolverAdulto(aparencia, antes, epoca);
  const objeto =
    segurando === 'celular' ? (
      <CelularDeCostas x={200} y={292} />
    ) : segurando === 'caderno' ? (
      <CadernoNaMao x={202} y={312} />
    ) : segurando === 'caixa' ? (
      <Caixa x={200} y={440} escala={0.78} />
    ) : segurando === 'mostrando' ? (
      <CelularMostrando x={56} y={480} escala={1.5} angulo={-24} />
    ) : null;
  return (
    <MolduraPersonagem escala={escala} espelhar={espelhar} altura={a.altura}>
      <CorpoAdulto frame={frame} fps={fps} semente={semente} parada={parada} aparencia={a} expressao={expressao} falando={falando} olhando={olhando} segurando={segurando} objetoNaMao={objeto} />
    </MolduraPersonagem>
  );
};
