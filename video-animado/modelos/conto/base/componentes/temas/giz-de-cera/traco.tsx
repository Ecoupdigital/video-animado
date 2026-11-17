import React from 'react';
import { TONS_PELE, type Aparencia } from '../../aparencia';
import { balanco, piscada, respiracao } from '../../anima';
import { alcancar, angulosBracos, desloc, ponta, SPEC, type Spec } from '../../rosto';
import { clarear, escurecer, luminancia, misturar, useTema } from '../../tema';
import type { TracoProps } from '../tipos';

// Traço do giz de cera: o personagem é um boneco de desenho de criança, riscado a giz. Cabeça redonda grande com a
// pele pintada, olhos de ponto, bochechas, sobrancelha de risco e boca de traço que abre pelo volume (fechada com
// volume zero); corpo de roupa pintada (vestido em triângulo, camisa e calça, camisa e saia ou macacão), braços e
// pernas de traço, mãos redondas. Tudo passa por um filtro de giz: borda tremida e grão de cera. O tremido muda a
// cada 4 frames, sempre igual para o mesmo frame e a mesma semente; parado, fica o desenho tremido da semente. Na
// pele escura, os olhos ganham um miolo claro e a boca um traço claro. Quadro de 400 x 900, pés em y 890. Campos da
// aparência que usa: pele, cabelo, corCabelo, roupa, corBaixo (os do papel recortado), cor, acessorio e corDetalhe.

type Pt = [number, number];

const CAB: Pt = [200, 292];
const R = 100;
const OMBRO_Y = 428;
const BRACO1 = 104;
const BRACO2 = 96;

/** Topo do boneco no quadro (o coque, o boné e o laço sobem). */
export const TOPO_GIZ = (ap: Aparencia) =>
  CAB[1] - R - Math.max(ap.cabelo === 'coque' ? 58 : ap.cabelo === 'cachos' ? 24 : ap.cabelo === 'curto' ? 16 : 6, ap.acessorio === 'bone' ? 26 : ap.acessorio === 'laco' ? 36 : 0);

/** Pintura de giz: a cor por baixo, mais clara, e riscos inclinados por cima (como criança pinta). */
const Hachura: React.FC<{ id: string; cor: string; ang?: number }> = ({ id, cor, ang = 35 }) => (
  <pattern id={id} width={16} height={16} patternUnits="userSpaceOnUse" patternTransform={`rotate(${ang})`}>
    <path d="M 0 8 L 16 8" stroke={escurecer(cor, 0.12)} strokeWidth={5} opacity={0.55} />
  </pattern>
);

const Pintado: React.FC<{ d: string; cor: string; hachura: string; contorno: string; larg?: number }> = ({ d, cor, hachura, contorno, larg = 7 }) => (
  <>
    <path d={d} fill={misturar(cor, '#FFFFFF', 0.12)} />
    <path d={d} fill={`url(#${hachura})`} />
    <path d={d} fill="none" stroke={contorno} strokeWidth={larg} strokeLinejoin="round" strokeLinecap="round" />
  </>
);

const Cabelo: React.FC<{ tipo: string; cor: string; hachura: string; mov: number; bone: boolean }> = ({ tipo, cor, hachura, mov, bone }) => {
  const [cx, cy] = CAB;
  const contorno = escurecer(cor, 0.25);
  const touca = `M ${cx - R - 2} ${cy - 4} Q ${cx - R - 4} ${cy - R - 14} ${cx} ${cy - R - 10} Q ${cx + R + 4} ${cy - R - 14} ${cx + R + 2} ${cy - 4} Q ${cx + R - 22} ${cy - R + 32} ${cx} ${cy - R + 36} Q ${cx - R + 22} ${cy - R + 32} ${cx - R - 2} ${cy - 4} Z`;
  const traco = (d: string, w = 9) => <path d={d} fill="none" stroke={cor} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
  switch (tipo) {
    case 'curto':
      // franja de rabiscos espetados
      return (
        <g>
          <Pintado d={touca} cor={cor} hachura={hachura} contorno={contorno} />
          {bone ? null : traco(`M ${cx - 84} ${cy - 62} L ${cx - 74} ${cy - 118} L ${cx - 52} ${cy - 84} L ${cx - 34} ${cy - 128} L ${cx - 10} ${cy - 92} L ${cx + 10} ${cy - 130} L ${cx + 32} ${cy - 92} L ${cx + 54} ${cy - 124} L ${cx + 72} ${cy - 84} L ${cx + 86} ${cy - 110}`)}
        </g>
      );
    case 'comprido':
      return (
        <g>
          {[-1, 1].map((l) => (
            <g key={l}>
              <Pintado d={`M ${cx + l * (R - 14)} ${cy - 40} Q ${cx + l * (R + 30)} ${cy + 40} ${cx + l * (R + 22 + mov * 4)} ${cy + 150} L ${cx + l * (R - 18)} ${cy + 150} Q ${cx + l * (R - 4)} ${cy + 60} ${cx + l * (R - 30)} ${cy - 30} Z`} cor={cor} hachura={hachura} contorno={contorno} />
              {traco(`M ${cx + l * (R + 2)} ${cy + 10} Q ${cx + l * (R + 16)} ${cy + 80} ${cx + l * (R + 4 + mov * 3)} ${cy + 140}`, 6)}
            </g>
          ))}
          <Pintado d={touca} cor={cor} hachura={hachura} contorno={contorno} />
        </g>
      );
    case 'coque':
      return (
        <g>
          <Pintado d={`M ${cx - 40 + mov * 2} ${cy - R - 26} a 40 38 0 1 1 80 0 a 40 38 0 1 1 -80 0 Z`} cor={cor} hachura={hachura} contorno={contorno} />
          {traco(`M ${cx - 20 + mov * 2} ${cy - R - 40} q 20 -16 40 0 q -20 16 -36 4`, 6)}
          <Pintado d={touca} cor={cor} hachura={hachura} contorno={contorno} />
        </g>
      );
    case 'cachos':
      // caracóis em volta da cabeça, riscados em espiral
      return (
        <g>
          <Pintado d={touca} cor={cor} hachura={hachura} contorno={contorno} />
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI * (0.9 + (i / 10) * 1.2);
            const x = cx + Math.cos(a) * (R + 8);
            const y = cy - 6 + Math.sin(a) * (R + 8);
            return <path key={i} d={`M ${x - 14} ${y} a 14 14 0 1 1 14 14 a 8 8 0 1 1 -6 -12`} fill="none" stroke={cor} strokeWidth={8} strokeLinecap="round" />;
          })}
        </g>
      );
    case 'rabo':
      return (
        <g>
          <g transform={`rotate(${mov * 6} ${cx + R - 10} ${cy - 50})`}>
            <Pintado d={`M ${cx + R - 20} ${cy - 66} Q ${cx + R + 70} ${cy - 70} ${cx + R + 62} ${cy + 40} Q ${cx + R + 40} ${cy + 6} ${cx + R + 6} ${cy - 30} Z`} cor={cor} hachura={hachura} contorno={contorno} />
            {traco(`M ${cx + R + 20} ${cy - 50} Q ${cx + R + 56} ${cy - 30} ${cx + R + 52} ${cy + 20}`, 6)}
          </g>
          <Pintado d={touca} cor={cor} hachura={hachura} contorno={contorno} />
        </g>
      );
    case 'careca':
      // três fios em cima, de desenho de criança
      return (
        <g>
          {traco(`M ${cx - 16} ${cy - R + 2} q -10 -24 4 -36`, 6)}
          {traco(`M ${cx} ${cy - R} q 0 -26 14 -34`, 6)}
          {traco(`M ${cx + 16} ${cy - R + 2} q 12 -22 28 -24`, 6)}
        </g>
      );
    default:
      return null;
  }
};

/** Olho de ponto (com miolo claro na pele escura). */
const Olho: React.FC<{ x: number; y: number; spec: Spec; pisc: number; ox: number; oy: number; tinta: string; claro: string; aro: boolean }> = ({ x, y, spec, pisc, ox, oy, tinta, claro, aro }) => {
  if (spec.olho === 'fechado') return <path d={`M ${x - 14} ${y + 4} Q ${x} ${y - 14} ${x + 14} ${y + 4}`} stroke={tinta} strokeWidth={7} fill="none" strokeLinecap="round" />;
  const grande = spec.olho === 'grande';
  const r = grande ? 17 : 13;
  const ry = Math.max(1.6, r * pisc * (spec.olho === 'meio' ? 0.62 : 1));
  const px = x + ox * 6;
  const py = y + oy * 5 + (spec.olho === 'meio' ? 3 : 0);
  return (
    <g>
      {aro || grande ? <ellipse cx={x} cy={y} rx={r + 8} ry={Math.max(2, (r + 8) * pisc)} fill={claro} stroke={tinta} strokeWidth={grande ? 4 : 0} /> : null}
      <ellipse cx={px} cy={py} rx={r} ry={ry} fill={tinta} />
      {spec.olho === 'meio' ? <path d={`M ${x - 16} ${y - 6} L ${x + 16} ${y - 2}`} stroke={tinta} strokeWidth={5} strokeLinecap="round" /> : null}
    </g>
  );
};

const Boca: React.FC<{ spec: Spec; v: number; x: number; y: number; tinta: string; fundo: string; lingua: string }> = ({ spec, v, x, y, tinta, fundo, lingua }) => {
  const traco = (d: string) => <path d={d} stroke={tinta} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const aberta = (w: number, h: number) => (
    <g>
      <path d={`M ${x - w / 2} ${y - 2} Q ${x} ${y - 6} ${x + w / 2} ${y - 2} Q ${x} ${y - 2 + h * 2} ${x - w / 2} ${y - 2} Z`} fill={fundo} stroke={tinta} strokeWidth={5} strokeLinejoin="round" />
      {h > 9 ? <ellipse cx={x} cy={y - 2 + h * 0.95} rx={w * 0.22} ry={h * 0.28} fill={lingua} /> : null}
    </g>
  );
  // falando: a boca abre pelo volume; com volume zero fica fechada, mesmo na expressão falando
  if (v > 0.04) {
    if (spec.boca === 'gargalhada' || spec.boca === 'sorrisoAberto') return aberta(58 + 8 * v, 14 + 12 * v);
    if (spec.boca === 'o') return <ellipse cx={x} cy={y + 6} rx={12 + 5 * v} ry={13 + 10 * v} fill={fundo} stroke={tinta} strokeWidth={5} />;
    return aberta(38 + 10 * v, 4 + 20 * v);
  }
  switch (spec.boca) {
    case 'linha':
      return traco(`M ${x - 18} ${y} Q ${x} ${y + 8} ${x + 18} ${y}`);
    case 'sorriso':
      return traco(`M ${x - 26} ${y - 4} Q ${x} ${y + 20} ${x + 26} ${y - 4}`);
    case 'sorrisoAberto':
      return aberta(52, 14);
    case 'o':
      return <ellipse cx={x} cy={y + 6} rx={12} ry={15} fill={fundo} stroke={tinta} strokeWidth={5} />;
    case 'triste':
      return traco(`M ${x - 22} ${y + 12} Q ${x} ${y - 6} ${x + 22} ${y + 12}`);
    case 'brava':
      return traco(`M ${x - 22} ${y + 6} L ${x - 8} ${y} L ${x + 8} ${y + 6} L ${x + 22} ${y}`);
    case 'torta':
      return traco(`M ${x - 20} ${y + 6} Q ${x + 2} ${y + 8} ${x + 24} ${y - 8}`);
    case 'gargalhada':
      return aberta(66, 22);
    default:
      return null;
  }
};

export const TracoGiz: React.FC<TracoProps> = ({ ap, expressao, falando, olhando, parada, frame, fps, semente, uid }) => {
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
  const dxRosto = ox * 14;
  const pulo = parada ? spec.reacao * 0.5 : spec.reacao * Math.abs(Math.sin(t * Math.PI * 2.2)) + v * 0.18 * Math.abs(Math.sin(t * Math.PI * 4));
  const treme = spec.treme && !parada ? Math.sin(t * Math.PI * 16) * 2.4 : 0;
  const giroCab = (parada ? 0 : Math.sin(t * Math.PI * 3.1) * 4 * v) + ox * 3 + (expressao === 'pensando' ? -7 : 0) + (expressao === 'triste' ? 6 : 0) + (expressao === 'rindo' ? -4 : 0);

  // giz: o tremido muda a cada 4 frames (sempre igual para o mesmo frame e a mesma semente)
  const passo = parada ? 0 : Math.floor(frame / 4) % 8;
  const semGiz = semente * 17 + passo;
  const filtro = `${uid}-giz`;
  const hRoupa = `${uid}-hr`;
  const hBaixo = `${uid}-hb`;
  const hPele = `${uid}-hp`;
  const hCabelo = `${uid}-hc`;
  const hDet = `${uid}-hd`;

  const tinta = T.c.silhueta;
  const claro = T.c.papel;
  const contornoPele = escurecer(tom.sombra, 0.28);
  const cor = ap.cor;
  const baixo = ap.corBaixo;
  const roupa = ap.roupa;
  const corBoca = escura ? misturar(pele, '#FFFFFF', 0.72) : tinta;
  const fundoBoca = escura ? escurecer(pele, 0.55) : escurecer(T.c.enfeite, 0.55);
  const lingua = clarear(T.c.enfeite, 0.3);

  // corpo
  const angs = angulosBracos(spec.bracos, v, t);
  const ombroE: Pt = [148, OMBRO_Y];
  const ombroD: Pt = [252, OMBRO_Y];
  const braco = (o: Pt, l: -1 | 1, ang: [number, number]) => {
    let cot = ponta(o[0], o[1], ang[0], BRACO1, l);
    let mao = ponta(cot[0], cot[1], ang[0] + ang[1], BRACO2, l);
    if (spec.bracos === 'queixo' && l === 1) ({ cotovelo: cot, mao } = alcancar(o, [200 + 40 + dxRosto, CAB[1] + R - 6], BRACO1, BRACO2));
    return (
      <g key={l}>
        <path d={`M ${o[0]} ${o[1]} L ${cot[0]} ${cot[1]} L ${mao[0]} ${mao[1]}`} stroke={escurecer(cor, 0.1)} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={mao[0]} cy={mao[1]} r={17} fill={pele} stroke={contornoPele} strokeWidth={5} />
      </g>
    );
  };
  const perna = (x0: number, x1: number, y0: number, corPerna: string, larg: number) => (
    <path d={`M ${x0} ${y0} L ${x1} 864 L ${x1 + (x1 < 200 ? -30 : 30)} 872`} stroke={corPerna} strokeWidth={larg} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  );
  const camisa = 'M 160 398 Q 200 390 240 398 L 266 430 L 258 560 L 142 560 L 134 430 Z';
  const corpo = (() => {
    switch (roupa) {
      case 'vestido':
        return (
          <>
            {perna(180, 170, 640, tinta, 9)}
            {perna(220, 230, 640, tinta, 9)}
            <Pintado d="M 168 398 Q 200 390 232 398 L 300 652 Q 200 668 100 652 Z" cor={cor} hachura={hRoupa} contorno={escurecer(cor, 0.3)} />
          </>
        );
      case 'camisa-saia':
        return (
          <>
            {perna(180, 170, 640, tinta, 9)}
            {perna(220, 230, 640, tinta, 9)}
            <Pintado d="M 142 548 L 258 548 L 292 652 Q 200 666 108 652 Z" cor={baixo} hachura={hBaixo} contorno={escurecer(baixo, 0.3)} />
            <Pintado d={camisa} cor={cor} hachura={hRoupa} contorno={escurecer(cor, 0.3)} />
          </>
        );
      case 'macacao':
        return (
          <>
            {perna(176, 166, 600, baixo, 30)}
            {perna(224, 234, 600, baixo, 30)}
            <Pintado d={camisa} cor={cor} hachura={hRoupa} contorno={escurecer(cor, 0.3)} />
            <Pintado d="M 152 474 L 248 474 L 256 616 L 144 616 Z" cor={baixo} hachura={hBaixo} contorno={escurecer(baixo, 0.3)} />
            <path d="M 160 478 L 154 404 M 240 478 L 246 404" stroke={escurecer(baixo, 0.1)} strokeWidth={12} strokeLinecap="round" />
            <circle cx={162} cy={490} r={7} fill={claro} />
            <circle cx={238} cy={490} r={7} fill={claro} />
          </>
        );
      default:
        // camisa e calça
        return (
          <>
            {perna(178, 166, 570, baixo, 32)}
            {perna(222, 234, 570, baixo, 32)}
            <Pintado d="M 146 548 L 254 548 L 254 600 L 146 600 Z" cor={baixo} hachura={hBaixo} contorno={escurecer(baixo, 0.3)} larg={5} />
            <Pintado d={camisa} cor={cor} hachura={hRoupa} contorno={escurecer(cor, 0.3)} />
          </>
        );
    }
  })();

  const sobr = (lado: -1 | 1) => {
    const [dy, incl] = lado === 1 && spec.sobrDir ? spec.sobrDir : spec.sobr;
    const x = 200 + lado * 38 + dxRosto;
    const y = 246 + dy * 1.2 - (spec.olho === 'grande' ? 8 : 0);
    return <path key={`s${lado}`} d={`M ${x - lado * 16} ${y + incl * 0.7} L ${x + lado * 16} ${y - incl * 0.5}`} stroke={escurecer(ap.corCabelo, 0.1)} strokeWidth={7} strokeLinecap="round" />;
  };

  return (
    <g transform={`translate(${treme} ${-pulo * 34})`}>
      <defs>
        <filter id={filtro} x="-12%" y="-8%" width="124%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency={0.42} numOctaves={2} seed={semGiz} result="ruido" />
          <feDisplacementMap in="SourceGraphic" in2="ruido" scale={7} xChannelSelector="R" yChannelSelector="G" result="tremido" />
          <feTurbulence type="fractalNoise" baseFrequency={1.3} numOctaves={1} seed={semGiz + 31} result="grao" />
          <feColorMatrix in="grao" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.4 0 0 0 2.15" result="buracos" />
          <feComposite in="tremido" in2="buracos" operator="in" />
        </filter>
        <Hachura id={hRoupa} cor={cor} />
        <Hachura id={hBaixo} cor={baixo} ang={-35} />
        <Hachura id={hPele} cor={pele} ang={20} />
        <Hachura id={hCabelo} cor={ap.corCabelo} ang={-20} />
        <Hachura id={hDet} cor={ap.corDetalhe} />
      </defs>
      <g filter={`url(#${filtro})`}>
        <g transform={`translate(200 640) scale(1 ${1 + resp * 0.006}) translate(-200 -640)`}>
          {corpo}
          {ap.acessorio === 'gravata' ? (
            <Pintado d="M 192 404 L 208 404 L 218 510 L 200 532 L 182 510 Z" cor={ap.corDetalhe} hachura={hDet} contorno={escurecer(ap.corDetalhe, 0.3)} larg={5} />
          ) : null}
        </g>
        {braco(ombroE, -1, angs.esq)}
        {braco(ombroD, 1, angs.dir)}
        <g transform={`rotate(${giroCab} 200 400)`}>
          {ap.cabelo === 'comprido' || ap.cabelo === 'rabo' || ap.cabelo === 'coque' ? <Cabelo tipo={ap.cabelo} cor={ap.corCabelo} hachura={hCabelo} mov={bal} bone={ap.acessorio === 'bone'} /> : null}
          <Pintado d={`M ${CAB[0] - R} ${CAB[1]} a ${R} ${R} 0 1 1 ${2 * R} 0 a ${R} ${R} 0 1 1 ${-2 * R} 0 Z`} cor={pele} hachura={hPele} contorno={contornoPele} larg={8} />
          {ap.cabelo !== 'comprido' && ap.cabelo !== 'rabo' && ap.cabelo !== 'coque' ? <Cabelo tipo={ap.cabelo} cor={ap.corCabelo} hachura={hCabelo} mov={bal} bone={ap.acessorio === 'bone'} /> : null}
          {/* bochechas */}
          <circle cx={142 + dxRosto} cy={318} r={17} fill={tom.bochecha} opacity={0.45 + 0.4 * spec.bochecha} />
          <circle cx={258 + dxRosto} cy={318} r={17} fill={tom.bochecha} opacity={0.45 + 0.4 * spec.bochecha} />
          {sobr(-1)}
          {sobr(1)}
          <Olho x={164 + dxRosto} y={280} spec={spec} pisc={pisc} ox={ox} oy={oy} tinta={tinta} claro={claro} aro={escura} />
          <Olho x={236 + dxRosto} y={280} spec={spec} pisc={pisc} ox={ox} oy={oy} tinta={tinta} claro={claro} aro={escura} />
          <g transform={`translate(${200 + dxRosto} 334) scale(1.2) translate(${-200 - dxRosto} -334)`}>
            <Boca spec={spec} v={v} x={200 + dxRosto} y={334} tinta={corBoca} fundo={fundoBoca} lingua={lingua} />
          </g>
          {ap.acessorio === 'oculos' ? (
            <g fill="none" stroke={ap.corDetalhe} strokeWidth={7}>
              <circle cx={164 + dxRosto} cy={280} r={30} />
              <circle cx={236 + dxRosto} cy={280} r={30} />
              <path d={`M ${194 + dxRosto} 276 Q ${200 + dxRosto} 268 ${206 + dxRosto} 276`} />
            </g>
          ) : null}
          {ap.acessorio === 'bone' ? (
            <g>
              <Pintado d={`M ${CAB[0] - R - 4} ${CAB[1] - 40} Q ${CAB[0] - R + 4} ${CAB[1] - R - 28} ${CAB[0]} ${CAB[1] - R - 26} Q ${CAB[0] + R - 4} ${CAB[1] - R - 28} ${CAB[0] + R + 4} ${CAB[1] - 40} Z`} cor={ap.corDetalhe} hachura={hDet} contorno={escurecer(ap.corDetalhe, 0.3)} />
              <Pintado d={`M ${CAB[0] + 10} ${CAB[1] - 54} L ${CAB[0] + R + 70} ${CAB[1] - 46} Q ${CAB[0] + R + 76} ${CAB[1] - 30} ${CAB[0] + R + 56} ${CAB[1] - 28} L ${CAB[0] + 10} ${CAB[1] - 36} Z`} cor={ap.corDetalhe} hachura={hDet} contorno={escurecer(ap.corDetalhe, 0.3)} larg={5} />
            </g>
          ) : null}
          {ap.acessorio === 'laco' ? (
            <g transform={`translate(${CAB[0] - 56} ${CAB[1] - R + 4}) rotate(-16)`}>
              <Pintado d="M 0 0 L -54 -36 L -50 34 Z" cor={ap.corDetalhe} hachura={hDet} contorno={escurecer(ap.corDetalhe, 0.3)} larg={5} />
              <Pintado d="M 0 0 L 54 -36 L 50 34 Z" cor={ap.corDetalhe} hachura={hDet} contorno={escurecer(ap.corDetalhe, 0.3)} larg={5} />
              <circle cx={0} cy={0} r={15} fill={escurecer(ap.corDetalhe, 0.2)} />
            </g>
          ) : null}
        </g>
      </g>
    </g>
  );
};
