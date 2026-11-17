import React from 'react';
import { TONS_PELE, type Aparencia } from '../../aparencia';
import { balanco, piscada, respiracao } from '../../anima';
import { capsulaRasgada, circuloRasgado, poligonoRasgado, type Pt } from '../../recorte';
import { alcancar, angulosBracos, desloc, ponta, SPEC, type Spec } from '../../rosto';
import { clarear, escurecer, luminancia, misturar, useTema } from '../../tema';
import type { TracoProps } from '../tipos';

// Traço do papel recortado: o personagem é um boneco de peças de papel (cabeça, cabelo, camisa, saia ou calça,
// braços em duas peças, mãos, pernas, sapatos) presas por colchete nos ombros, nos cotovelos e nos quadris, com a
// borda levemente rasgada, fibras no papel e sombra projetada. Olhos de ponto com brilho, bochechas, boca de traço
// que abre pelo volume. Quadro de 400 x 900, pés em y 890. Campos da aparência que usa: pele, cabelo, corCabelo,
// roupa, cor (camisa ou vestido), corBaixo, sapato, acessorio e corDetalhe.

const CAB: Pt = [200, 252];
const R = 98;
const OMBRO_E: Pt = [134, 418];
const OMBRO_D: Pt = [266, 418];
const BRACO1 = 100;
const BRACO2 = 92;
/** a cabeça é desenhada no raio R e ampliada (cabeça grande, de livro infantil), com o centro em CAB_Y */
const K_CABECA = 1.18;
const CAB_Y = 250;
const LARG_BRACO = 34;

const Colchete: React.FC<{ x: number; y: number; cor: string }> = ({ x, y, cor }) => (
  <g>
    <circle cx={x} cy={y} r={7} fill={cor} />
    <circle cx={x - 2} cy={y - 2} r={2.6} fill={clarear(cor, 0.55)} />
  </g>
);

/** Fibras do papel por cima de uma peça (recortadas pelo clip da peça). */
const Fibras: React.FC<{ id: string; cor: string }> = ({ id, cor }) => (
  <pattern id={id} width={46} height={46} patternUnits="userSpaceOnUse">
    <path d="M3 7l9 2M22 30l7-3M30 12l6 4M8 28l5 5M38 40l4-6" stroke={cor} strokeWidth={1.3} opacity={0.5} />
  </pattern>
);

const Peca: React.FC<{ d: string; cor: string; fibras?: string }> = ({ d, cor, fibras }) => (
  <>
    <path d={d} fill={cor} />
    {fibras ? <path d={d} fill={`url(#${fibras})`} /> : null}
  </>
);

const Cabelo: React.FC<{ tipo: string; cor: string; parte: 'atras' | 'frente'; mov: number; s: number }> = ({ tipo, cor, parte, mov, s }) => {
  const luz = clarear(cor, 0.16);
  if (parte === 'atras') {
    if (tipo === 'comprido') return <Peca d={poligonoRasgado([[100, 236], [116, 150], [200, 132], [284, 150], [300, 236], [314, 452], [258, 468], [200, 462], [142, 468], [86, 452]], s + 1, 1.6)} cor={cor} />;
    if (tipo === 'coque')
      return (
        <g transform={`rotate(${mov * 3} 200 170)`}>
          <Peca d={circuloRasgado(200, 132, 46, s + 2, 1.5)} cor={cor} />
          <path d="M 176 118 Q 200 100 224 116" stroke={luz} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      );
    if (tipo === 'cachos')
      return (
        <g>
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI * (0.92 + (i / 10) * 1.16);
            return <path key={i} d={circuloRasgado(200 + Math.cos(a) * 104, 236 + Math.sin(a) * 96, 40, s + 10 + i, 1.4, 28)} fill={cor} />;
          })}
          <path d={circuloRasgado(108, 300, 34, s + 30, 1.3, 28)} fill={cor} />
          <path d={circuloRasgado(292, 300, 34, s + 31, 1.3, 28)} fill={cor} />
        </g>
      );
    if (tipo === 'rabo')
      return (
        <g transform={`rotate(${mov * 5} 286 196)`}>
          <Peca d={poligonoRasgado([[270, 178], [318, 196], [344, 262], [334, 340], [308, 370], [300, 300], [282, 236]], s + 3, 1.5)} cor={cor} />
          <path d="M 312 230 Q 330 270 318 330" stroke={luz} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      );
    return null;
  }
  // frente: a "touca" de cabelo por cima da cabeça (a mesma forma da tela de referência)
  if (tipo === 'careca')
    return (
      <g>
        <Peca d={poligonoRasgado([[100, 248], [106, 222], [124, 212], [122, 262], [108, 276]], s + 4, 1.1)} cor={cor} />
        <Peca d={poligonoRasgado([[300, 248], [294, 222], [276, 212], [278, 262], [292, 276]], s + 5, 1.1)} cor={cor} />
      </g>
    );
  const touca = poligonoRasgado(
    [
      [102, 250],
      [104, 196],
      [130, 160],
      [168, 144],
      [202, 142],
      [240, 144],
      [274, 160],
      [298, 196],
      [300, 252],
      [286, 222],
      [266, 206],
      [236, 200],
      [202, 196],
      [168, 200],
      [138, 206],
      [118, 222],
    ],
    s + 6,
    1.5,
  );
  return (
    <g>
      <Peca d={touca} cor={cor} />
      {tipo === 'comprido' ? <Peca d={poligonoRasgado([[102, 250], [96, 330], [114, 352], [126, 262]], s + 7, 1.2)} cor={cor} /> : null}
      {tipo === 'comprido' ? <Peca d={poligonoRasgado([[298, 250], [304, 330], [286, 352], [274, 262]], s + 8, 1.2)} cor={cor} /> : null}
      {tipo === 'cachos'
        ? [136, 170, 204, 238, 268].map((x, i) => <path key={x} d={circuloRasgado(x, 186 + (i % 2) * 6, 22, s + 40 + i, 1.1, 24)} fill={cor} />)
        : null}
      <path d="M 150 170 Q 188 156 230 162" stroke={luz} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

/** Olho de ponto com brilho; na pele escura ganha um aro claro para ler bem. */
const Olho: React.FC<{ x: number; y: number; spec: Spec; pisc: number; ox: number; oy: number; aro: boolean }> = ({ x, y, spec, pisc, ox, oy, aro }) => {
  if (spec.olho === 'fechado') return <path d={`M ${x - 11} ${y + 3} Q ${x} ${y - 9} ${x + 11} ${y + 3}`} stroke="#2B2B2B" strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  const r = spec.olho === 'grande' ? 14.5 : 11.5;
  const ry = r * pisc * (spec.olho === 'meio' ? 0.72 : 1);
  return (
    <g>
      {aro ? <ellipse cx={x} cy={y} rx={r + 5} ry={Math.max(1, ry + 5 * pisc)} fill="#FFF8F0" /> : null}
      <ellipse cx={x + ox * 5} cy={y + oy * 4.5 + (spec.olho === 'meio' ? 2 : 0)} rx={r} ry={Math.max(1, ry)} fill="#2B2B2B" />
      {pisc > 0.5 ? <circle cx={x + ox * 5 + r * 0.32} cy={y + oy * 4.5 - r * 0.32} r={r * 0.32} fill="#FFFFFF" /> : null}
    </g>
  );
};

const Boca: React.FC<{ spec: Spec; v: number; cor: string; escura: boolean; dx: number }> = (props) => (
  <g transform={`translate(${200 + props.dx} 300) scale(1.25) translate(${-200 - props.dx} -300)`}>
    <BocaDesenho {...props} />
  </g>
);

const BocaDesenho: React.FC<{ spec: Spec; v: number; cor: string; escura: boolean; dx: number }> = ({ spec, v, cor, escura, dx }) => {
  const cx = 200 + dx;
  const y = 300;
  const fundo = escura ? '#2A0D09' : '#5A1E16';
  const lingua = '#E5736B';
  const contorno = escura ? { stroke: cor, strokeWidth: 3 } : {};
  const aberta = (w: number, h: number) => (
    <g>
      <path d={`M ${cx - w / 2} ${y - 2} Q ${cx} ${y - 5} ${cx + w / 2} ${y - 2} Q ${cx} ${y - 2 + h * 2} ${cx - w / 2} ${y - 2} Z`} fill={fundo} {...contorno} />
      {h > 7 ? <ellipse cx={cx} cy={y - 2 + h * 0.95} rx={w * 0.22} ry={h * 0.3} fill={lingua} /> : null}
    </g>
  );
  // falando: a boca abre pelo volume; com volume zero fica fechada (mesmo na expressão falando)
  if (v > 0.04) {
    if (spec.boca === 'gargalhada' || spec.boca === 'sorrisoAberto') return aberta(46 + 6 * v, 10 + 10 * v);
    if (spec.boca === 'o') return <ellipse cx={cx} cy={y + 2} rx={8 + 4 * v} ry={8 + 9 * v} fill={fundo} {...contorno} />;
    return aberta(28 + 8 * v, 3 + 15 * v);
  }
  const traco = (d: string) => <path d={d} stroke={cor} strokeWidth={5} fill="none" strokeLinecap="round" />;
  switch (spec.boca) {
    case 'linha':
      return traco(`M ${cx - 13} ${y} Q ${cx} ${y + 6} ${cx + 13} ${y}`);
    case 'sorriso':
      return traco(`M ${cx - 17} ${y - 2} Q ${cx} ${y + 12} ${cx + 17} ${y - 2}`);
    case 'sorrisoAberto':
      return aberta(40, 11);
    case 'o':
      return <ellipse cx={cx} cy={y + 2} rx={9} ry={12} fill={fundo} {...contorno} />;
    case 'triste':
      return traco(`M ${cx - 15} ${y + 8} Q ${cx} ${y - 4} ${cx + 15} ${y + 8}`);
    case 'brava':
      return traco(`M ${cx - 16} ${y + 6} Q ${cx} ${y - 1} ${cx + 16} ${y + 6}`);
    case 'torta':
      return traco(`M ${cx - 14} ${y + 5} Q ${cx + 2} ${y + 4} ${cx + 16} ${y - 4}`);
    case 'gargalhada':
      return aberta(52, 17);
    default:
      return null;
  }
};

const Braco: React.FC<{ ombro: Pt; lado: -1 | 1; ang: [number, number]; manga: string; mao: string; colchete: string; fibras: string; s: number; alvo?: Pt }> = ({
  alvo,
  ombro,
  lado,
  ang,
  manga,
  mao,
  colchete,
  fibras,
  s,
}) => {
  let cot = ponta(ombro[0], ombro[1], ang[0], BRACO1, lado);
  let fim = ponta(cot[0], cot[1], ang[0] + ang[1], BRACO2 + 14, lado);
  // mão num ponto (queixo): o braço dobra no cotovelo para chegar lá
  if (alvo) ({ cotovelo: cot, mao: fim } = alcancar(ombro, alvo, BRACO1, BRACO2 + 14));
  const k = Math.atan2(fim[1] - cot[1], fim[0] - cot[0]);
  const mp: Pt = [fim[0] - Math.cos(k) * 14, fim[1] - Math.sin(k) * 14];
  return (
    <g>
      <Peca d={capsulaRasgada(cot, mp, LARG_BRACO - 2, s + 2)} cor={manga} fibras={fibras} />
      <path d={circuloRasgado(fim[0], fim[1], 21, s + 3, 1, 24)} fill={mao} />
      <Peca d={capsulaRasgada(ombro, cot, LARG_BRACO, s + 1)} cor={manga} fibras={fibras} />
      <Colchete x={ombro[0]} y={ombro[1]} cor={colchete} />
      <Colchete x={cot[0]} y={cot[1]} cor={colchete} />
    </g>
  );
};

/** Topo da cabeça no quadro (o coque e o boné sobem mais). */
export const TOPO_PAPEL = (ap: Aparencia) => (ap.cabelo === 'coque' ? 50 : ap.acessorio === 'bone' ? 92 : ap.cabelo === 'cachos' ? 80 : 112);

export const TracoPapel: React.FC<TracoProps> = ({ ap, expressao, falando, olhando, parada, frame, fps, semente, uid }) => {
  const T = useTema();
  const spec = SPEC[expressao];
  const v = Math.max(0, Math.min(1, falando));
  const tom = TONS_PELE[ap.pele] ?? TONS_PELE.p2;
  const pele = tom.base;
  const escura = luminancia(pele) < 0.16;
  const t = parada ? 0 : frame / fps;
  const pisc = parada ? 1 : piscada(frame, semente);
  const resp = parada ? 0 : respiracao(frame, fps, semente);
  const bal = parada ? 0 : balanco(frame, fps, 1.1, semente);
  const ol = olhando === 'frente' && spec.olharPadrao ? spec.olharPadrao : olhando;
  const [ox, oy] = desloc(ol);
  // a cabeça vira um pouco para onde olha e balança com a fala
  const dxRosto = ox * 13;
  const giroCabeca = (parada ? 0 : Math.sin(t * Math.PI * 3.1) * 3 * v) + ox * 2 + (expressao === 'pensando' ? -5 : 0) + (expressao === 'triste' ? 4 : 0);
  // fantoche de papel: o corpo inteiro gira de leve no pé, pula na reação e treme na raiva
  const pulo = parada ? spec.reacao * 10 : spec.reacao * Math.abs(Math.sin(t * Math.PI * 2.2)) * 22 + v * 6 * Math.abs(Math.sin(t * Math.PI * 4));
  const giro = resp * 0.8 + (spec.treme && !parada ? Math.sin(t * Math.PI * 18) * 1.2 : 0);
  const angs = angulosBracos(spec.bracos, v, t);
  const roupa = ap.roupa;
  const cor = ap.cor;
  const baixo = ap.corBaixo;
  const colchete = T.c.traco;
  const fib = `fib-${uid}`;
  const sombra = `sombra-${uid}`;
  const pernasPele = roupa === 'vestido' || roupa === 'camisa-saia';
  const sobr = (lado: -1 | 1): [number, number] => (lado === 1 && spec.sobrDir ? spec.sobrDir : spec.sobr);
  const corSobr = escurecer(ap.corCabelo, 0.15);
  const corBoca = escura ? '#F6C2B4' : '#8A3B2A';

  const tronco =
    roupa === 'vestido'
      ? poligonoRasgado([[126, 402], [274, 402], [296, 540], [318, 726], [82, 726], [104, 540]], semente + 20, 1.6)
      : poligonoRasgado([[124, 402], [276, 402], [288, 512], [292, 624], [108, 624], [112, 512]], semente + 20, 1.6);

  return (
    <g transform={`translate(0 ${-pulo}) rotate(${giro} 200 890)`}>
      <defs>
        <filter id={sombra} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx={6} dy={10} stdDeviation={4.5} floodColor={T.c.sombra} floodOpacity={0.35} />
        </filter>
        <Fibras id={fib} cor={T.c.fundo2} />
      </defs>
      <g filter={`url(#${sombra})`}>
        <Cabelo tipo={ap.cabelo} cor={ap.corCabelo} parte="atras" mov={bal} s={semente * 7} />
        {/* pernas e sapatos */}
        {pernasPele ? (
          <>
            <Peca d={poligonoRasgado([[158, 710], [188, 710], [188, 862], [158, 862]], semente + 30, 1)} cor={tom.sombra} />
            <Peca d={poligonoRasgado([[212, 710], [242, 710], [242, 862], [212, 862]], semente + 31, 1)} cor={tom.sombra} />
          </>
        ) : (
          <>
            <Peca d={poligonoRasgado([[146, 606], [192, 606], [192, 862], [146, 862]], semente + 30, 1.3)} cor={baixo} fibras={fib} />
            <Peca d={poligonoRasgado([[208, 606], [254, 606], [254, 862], [208, 862]], semente + 31, 1.3)} cor={baixo} fibras={fib} />
          </>
        )}
        <path d={poligonoRasgado([[136, 850], [194, 850], [198, 884], [126, 884]], semente + 32, 1)} fill={ap.sapato} />
        <path d={poligonoRasgado([[206, 850], [264, 850], [274, 884], [202, 884]], semente + 33, 1)} fill={ap.sapato} />
        {/* tronco */}
        <rect x={182} y={344} width={36} height={66} rx={6} fill={tom.sombra} />
        <Peca d={tronco} cor={cor} fibras={fib} />
        {roupa === 'camisa-saia' ? <Peca d={poligonoRasgado([[112, 604], [288, 604], [316, 726], [84, 726]], semente + 21, 1.6)} cor={baixo} fibras={fib} /> : null}
        {roupa === 'macacao' ? (
          <g>
            <Peca d={poligonoRasgado([[150, 488], [250, 488], [262, 624], [138, 624]], semente + 22, 1.3)} cor={baixo} fibras={fib} />
            <path d="M 158 490 L 150 406 M 242 490 L 250 406" stroke={baixo} strokeWidth={15} strokeLinecap="round" />
            <circle cx={160} cy={500} r={6} fill={clarear(baixo, 0.5)} />
            <circle cx={240} cy={500} r={6} fill={clarear(baixo, 0.5)} />
          </g>
        ) : null}
        {roupa !== 'vestido' && roupa !== 'camisa-saia' ? (
          <>
            <Colchete x={170} y={614} cor={colchete} />
            <Colchete x={230} y={614} cor={colchete} />
          </>
        ) : null}
        {/* gola */}
        <path d="M 172 404 L 200 430 L 228 404" stroke={escurecer(cor, 0.18)} strokeWidth={5} fill="none" strokeLinejoin="round" />
        {ap.acessorio === 'gravata' ? (
          <g>
            <path d={poligonoRasgado([[189, 408], [211, 408], [215, 432], [185, 432]], semente + 23, 0.8)} fill={escurecer(ap.corDetalhe, 0.15)} />
            <path d={poligonoRasgado([[187, 432], [213, 432], [222, 548], [200, 574], [178, 548]], semente + 24, 1)} fill={ap.corDetalhe} />
          </g>
        ) : null}
      </g>
      {/* cabeça: peça própria, gira no pescoço */}
      <g filter={`url(#${sombra})`} transform={`rotate(${giroCabeca} 200 370) translate(200 ${CAB_Y}) scale(${K_CABECA}) translate(-200 ${-CAB[1]})`}>
        <Peca d={circuloRasgado(CAB[0], CAB[1], R, semente + 40, 1.4)} cor={pele} fibras={fib} />
        {ap.cabelo === 'careca' ? <ellipse cx={176} cy={196} rx={26} ry={13} fill={clarear(pele, 0.28)} opacity={0.7} /> : null}
        <Cabelo tipo={ap.cabelo} cor={ap.corCabelo} parte="frente" mov={bal} s={semente * 7} />
        {/* bochechas */}
        <circle cx={142 + dxRosto} cy={290} r={14} fill={tom.bochecha} opacity={0.35 + 0.45 * spec.bochecha} />
        <circle cx={258 + dxRosto} cy={290} r={14} fill={tom.bochecha} opacity={0.35 + 0.45 * spec.bochecha} />
        {/* sobrancelhas */}
        {([-1, 1] as const).map((lado) => {
          const [dy, incl] = sobr(lado);
          const x = 200 + lado * 36 + dxRosto;
          const y = 226 + dy;
          return (
            <path
              key={lado}
              d={`M ${x - lado * 14} ${y + incl * 0.6} L ${x + lado * 14} ${y - incl * 0.4}`}
              stroke={corSobr}
              strokeWidth={6}
              strokeLinecap="round"
            />
          );
        })}
        <Olho x={164 + dxRosto} y={258} spec={spec} pisc={pisc} ox={ox} oy={oy} aro={escura} />
        <Olho x={236 + dxRosto} y={258} spec={spec} pisc={pisc} ox={ox} oy={oy} aro={escura} />
        <Boca spec={spec} v={v} cor={corBoca} escura={escura} dx={dxRosto} />
        {ap.acessorio === 'oculos' ? (
          <g fill="none" stroke={ap.corDetalhe} strokeWidth={5}>
            <circle cx={164 + dxRosto} cy={258} r={25} />
            <circle cx={236 + dxRosto} cy={258} r={25} />
            <path d={`M ${189 + dxRosto} ${254} Q ${200 + dxRosto} ${246} ${211 + dxRosto} ${254}`} fill="none" />
          </g>
        ) : null}
        {ap.acessorio === 'bone' ? (
          <g>
            <Peca d={poligonoRasgado([[98, 222], [110, 166], [150, 136], [200, 128], [250, 136], [290, 166], [302, 222]], semente + 50, 1.4)} cor={ap.corDetalhe} fibras={fib} />
            <path d={poligonoRasgado([[196, 210], [340, 218], [338, 236], [196, 234]], semente + 51, 1.2)} fill={escurecer(ap.corDetalhe, 0.2)} />
            <circle cx={200} cy={132} r={7} fill={escurecer(ap.corDetalhe, 0.25)} />
          </g>
        ) : null}
        {ap.acessorio === 'laco' ? (
          <g transform="rotate(-18 146 160)">
            <path d={poligonoRasgado([[146, 160], [100, 130], [104, 190]], semente + 52, 1.1)} fill={ap.corDetalhe} />
            <path d={poligonoRasgado([[146, 160], [192, 130], [188, 190]], semente + 53, 1.1)} fill={ap.corDetalhe} />
            <circle cx={146} cy={160} r={13} fill={escurecer(ap.corDetalhe, 0.2)} />
          </g>
        ) : null}
      </g>
      {/* braços: duas peças cada, presas por colchete no ombro e no cotovelo */}
      <g filter={`url(#${sombra})`}>
        <Braco ombro={OMBRO_E} lado={-1} ang={angs.esq} manga={misturar(cor, '#000000', 0.06)} mao={pele} colchete={colchete} fibras={fib} s={semente * 3 + 60} />
        <Braco ombro={OMBRO_D} lado={1} ang={angs.dir} manga={misturar(cor, '#000000', 0.06)} mao={pele} colchete={colchete} fibras={fib} s={semente * 3 + 70} alvo={spec.bracos === 'queixo' ? [222 + dxRosto, 362] : undefined} />
      </g>
    </g>
  );
};
