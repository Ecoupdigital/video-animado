import React from 'react';
import { piscada, quique, respiracao } from '../../anima';
import { alcancar, angulosBracos, desloc, ponta, SPEC, type Spec } from '../../rosto';
import { escurecer, useTema } from '../../tema';
import type { Aparencia } from '../../aparencia';
import type { TracoProps } from '../tipos';

// Traço dos bonecos de formas: o corpo é uma forma em cor chapada viva (pílula, retângulo, círculo ou triângulo),
// com olhos grandes de pupila, sobrancelha, boca de traço que abre pelo volume, braços e pernas de traço, sombra
// elíptica no chão e squash and stretch na fala e na reação. Quadro de 400 x 900, pés em y 890. Campos da
// aparência que usa: corpo, olhos, sobrancelha, cor (o corpo e os braços), acessorio e corDetalhe.

type Geo = {
  /** contorno do corpo */
  d: string;
  topo: number;
  /** meia largura do corpo na altura do topo do acessório */
  meiaTopo: number;
  base: number;
  olhoY: number;
  olhoDx: number;
  olhoR: number;
  bocaY: number;
  ombroY: number;
  ombroDx: number;
  pernaDx: number;
};

const GEO: Record<string, Geo> = {
  pilula: { d: 'M 98 452 A 102 102 0 0 1 302 452 L 302 698 A 102 102 0 0 1 98 698 Z', topo: 350, meiaTopo: 76, base: 800, olhoY: 482, olhoDx: 47, olhoR: 32, bocaY: 568, ombroY: 616, ombroDx: 96, pernaDx: 38 },
  retangulo: { d: 'M 96 470 Q 96 440 126 440 L 274 440 Q 304 440 304 470 L 304 770 Q 304 800 274 800 L 126 800 Q 96 800 96 770 Z', topo: 440, meiaTopo: 88, base: 800, olhoY: 556, olhoDx: 46, olhoR: 31, bocaY: 640, ombroY: 660, ombroDx: 100, pernaDx: 42 },
  circulo: { d: 'M 42 636 A 158 158 0 1 1 358 636 A 158 158 0 1 1 42 636 Z', topo: 478, meiaTopo: 80, base: 792, olhoY: 600, olhoDx: 48, olhoR: 33, bocaY: 686, ombroY: 664, ombroDx: 150, pernaDx: 44 },
  triangulo: { d: 'M 164 410 Q 200 368 236 410 L 342 766 Q 350 800 316 800 L 84 800 Q 50 800 58 766 Z', topo: 384, meiaTopo: 34, base: 800, olhoY: 616, olhoDx: 42, olhoR: 29, bocaY: 694, ombroY: 680, ombroDx: 104, pernaDx: 54 },
};

const TINTA = '#1D1D1F';

const Olho: React.FC<{ x: number; y: number; r: number; tipo: string; spec: Spec; pisc: number; ox: number; oy: number; corpo: string; lado: -1 | 1; uid: string }> = ({
  uid,
  x,
  y,
  r,
  tipo,
  spec,
  pisc,
  ox,
  oy,
  corpo,
  lado,
}) => {
  if (spec.olho === 'fechado') return <path d={`M ${x - r * 0.75} ${y + r * 0.2} Q ${x} ${y - r * 0.75} ${x + r * 0.75} ${y + r * 0.2}`} stroke={TINTA} strokeWidth={8} fill="none" strokeLinecap="round" />;
  const g = spec.olho === 'grande' ? 1.22 : 1;
  if (tipo === 'pontos') {
    const rp = 13 * g;
    return (
      <g>
        <ellipse cx={x + ox * 4} cy={y + oy * 4} rx={rp} ry={Math.max(1.5, rp * pisc)} fill={TINTA} />
        {pisc > 0.5 ? <circle cx={x + ox * 4 + 4} cy={y + oy * 4 - 4} r={4} fill="#FFFFFF" /> : null}
      </g>
    );
  }
  const rr = (tipo === 'grandes' ? r * 1.22 : r) * g;
  const rp = rr * 0.46;
  const px = x + ox * (rr - rp) * 0.8;
  const py = y + oy * (rr - rp) * 0.8;
  // pálpebra: sonolento sempre meio fechado; triste caído para fora; piscada fecha de cima
  const fechado = Math.max(1 - pisc, tipo === 'sonolentos' ? 0.42 : 0, spec.olho === 'meio' ? 0.38 : 0);
  const id = `${uid}-olho${lado}`;
  return (
    <g>
      <clipPath id={id}>
        <circle cx={x} cy={y} r={rr} />
      </clipPath>
      <circle cx={x} cy={y} r={rr} fill="#FFFFFF" />
      <g clipPath={`url(#${id})`}>
        <circle cx={px} cy={py} r={rp} fill={TINTA} />
        <circle cx={px + rp * 0.35} cy={py - rp * 0.35} r={rp * 0.32} fill="#FFFFFF" />
        {fechado > 0.02 ? (
          <path
            d={`M ${x - rr - 2} ${y - rr - 2} L ${x + rr + 2} ${y - rr - 2} L ${x + rr + 2} ${y - rr + fechado * rr * 2 + (spec.olho === 'meio' ? lado * 6 : 0)} L ${x - rr - 2} ${y - rr + fechado * rr * 2 - (spec.olho === 'meio' ? lado * 6 : 0)} Z`}
            fill={escurecer(corpo, 0.12)}
          />
        ) : null}
      </g>
    </g>
  );
};

const Boca: React.FC<{ spec: Spec; v: number; x: number; y: number }> = ({ spec, v, x, y }) => {
  const lingua = '#FF7A8A';
  const aberta = (rx: number, ry: number) => (
    <g>
      <ellipse cx={x} cy={y + ry * 0.4} rx={rx} ry={ry} fill={TINTA} />
      {ry > 10 ? <ellipse cx={x} cy={y + ry * 0.95} rx={rx * 0.55} ry={ry * 0.35} fill={lingua} /> : null}
    </g>
  );
  if (v > 0.04) {
    if (spec.boca === 'gargalhada' || spec.boca === 'sorrisoAberto') return aberta(32 + 6 * v, 18 + 14 * v);
    return aberta(18 + 12 * v, 5 + 25 * v);
  }
  const traco = (d: string) => <path d={d} stroke={TINTA} strokeWidth={8} fill="none" strokeLinecap="round" />;
  switch (spec.boca) {
    case 'linha':
      return traco(`M ${x - 18} ${y} Q ${x} ${y + 8} ${x + 18} ${y}`);
    case 'sorriso':
      return traco(`M ${x - 28} ${y - 4} Q ${x} ${y + 20} ${x + 28} ${y - 4}`);
    case 'sorrisoAberto':
      return (
        <g>
          <path d={`M ${x - 30} ${y - 4} Q ${x} ${y - 8} ${x + 30} ${y - 4} Q ${x} ${y + 40} ${x - 30} ${y - 4} Z`} fill={TINTA} />
          <ellipse cx={x} cy={y + 18} rx={13} ry={6} fill={lingua} />
        </g>
      );
    case 'o':
      return <ellipse cx={x} cy={y + 6} rx={16} ry={21} fill={TINTA} />;
    case 'triste':
      return traco(`M ${x - 22} ${y + 10} Q ${x} ${y - 8} ${x + 22} ${y + 10}`);
    case 'brava':
      return traco(`M ${x - 22} ${y + 6} L ${x + 22} ${y + 6}`);
    case 'torta':
      return traco(`M ${x - 20} ${y + 6} Q ${x + 2} ${y + 6} ${x + 22} ${y - 6}`);
    case 'gargalhada':
      return (
        <g>
          <path d={`M ${x - 36} ${y - 6} Q ${x} ${y - 10} ${x + 36} ${y - 6} Q ${x} ${y + 52} ${x - 36} ${y - 6} Z`} fill={TINTA} />
          <ellipse cx={x} cy={y + 26} rx={16} ry={8} fill={lingua} />
        </g>
      );
    default:
      return null;
  }
};

/** Topo do boneco no quadro (o boné e o laço sobem um pouco). */
export const TOPO_FORMAS = (ap: Aparencia) => (GEO[ap.corpo] ?? GEO.pilula).topo - (ap.acessorio === 'bone' ? 64 : ap.acessorio === 'laco' ? 30 : 0);

export const TracoFormas: React.FC<TracoProps> = ({ ap, expressao, falando, olhando, parada, frame, fps, semente, uid }) => {
  const T = useTema();
  const spec = SPEC[expressao];
  const g = GEO[ap.corpo] ?? GEO.pilula;
  const v = Math.max(0, Math.min(1, falando));
  const t = parada ? 0 : frame / fps;
  const pisc = parada ? 1 : piscada(frame, semente);
  const resp = parada ? 0 : respiracao(frame, fps, semente);
  const q = quique(v, spec.reacao, frame, parada, fps);
  const ol = olhando === 'frente' && spec.olharPadrao ? spec.olharPadrao : olhando;
  const [ox, oy] = desloc(ol);
  const cor = ap.cor;
  const dxRosto = ox * 10;
  const angs = angulosBracos(spec.bracos, v, t);
  const treme = spec.treme && !parada ? Math.sin(t * Math.PI * 16) * 2.2 : 0;
  const sy = q.sy + resp * 0.006;
  const sx = q.sx - resp * 0.004;
  const braco = (lado: -1 | 1, ang: [number, number]) => {
    const o: [number, number] = [200 + lado * (g.ombroDx - 6), g.ombroY];
    let c = ponta(o[0], o[1], ang[0], 84, lado);
    let m = ponta(c[0], c[1], ang[0] + ang[1], 76, lado);
    // mão no queixo: o braço de dentro vai até logo abaixo da boca
    if (spec.bracos === 'queixo' && lado === 1) ({ cotovelo: c, mao: m } = alcancar(o, [200 + 34 + dxRosto, g.bocaY + 30], 84, 76));
    return <path key={lado} d={`M ${o[0]} ${o[1]} L ${c[0]} ${c[1]} L ${m[0]} ${m[1]}`} stroke={escurecer(cor, 0.1)} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  };
  const sobr = (lado: -1 | 1) => {
    if (ap.sobrancelha === 'nenhuma') return null;
    const [dy, incl] = lado === 1 && spec.sobrDir ? spec.sobrDir : spec.sobr;
    const x = 200 + lado * g.olhoDx + dxRosto;
    const r = ap.olhos === 'grandes' ? g.olhoR * 1.22 : g.olhoR;
    const y = g.olhoY - r - (ap.acessorio === 'oculos' ? 26 : 16) + dy * 1.3;
    return (
      <path
        key={`s${lado}`}
        d={`M ${x - lado * 20} ${y + incl * 0.9} L ${x + lado * 20} ${y - incl * 0.6}`}
        stroke={TINTA}
        strokeWidth={ap.sobrancelha === 'grossa' ? 13 : 7}
        strokeLinecap="round"
      />
    );
  };
  const topo = g.topo;
  return (
    <g>
      {/* sombra elíptica: encolhe quando o boneco sobe */}
      <ellipse cx={200} cy={886} rx={104 * (1 + q.dy / 300)} ry={15} fill={T.c.sombra} opacity={0.45} />
      <g transform={`translate(${treme} ${q.dy}) translate(200 886) scale(${sx} ${sy}) translate(-200 -886)`}>
        {/* pernas de traço */}
        <path
          d={`M ${200 - g.pernaDx} ${g.base - 10} L ${200 - g.pernaDx - 8} 884 M ${200 + g.pernaDx} ${g.base - 10} L ${200 + g.pernaDx + 8} 884`}
          stroke={T.c.silhueta}
          strokeWidth={15}
          strokeLinecap="round"
        />
        <path d={g.d} fill={cor} />
        {braco(-1, angs.esq)}
        {braco(1, angs.dir)}
        {/* bochechas */}
        <ellipse cx={200 - g.olhoDx - 18 + dxRosto} cy={g.olhoY + g.olhoR + 18} rx={18} ry={10} fill="#FF6B8F" opacity={0.5 + 0.3 * spec.bochecha} />
        <ellipse cx={200 + g.olhoDx + 18 + dxRosto} cy={g.olhoY + g.olhoR + 18} rx={18} ry={10} fill="#FF6B8F" opacity={0.5 + 0.3 * spec.bochecha} />
        <Olho x={200 - g.olhoDx + dxRosto} y={g.olhoY} r={g.olhoR} tipo={ap.olhos} spec={spec} pisc={pisc} ox={ox} oy={oy} corpo={cor} lado={-1} uid={uid} />
        <Olho x={200 + g.olhoDx + dxRosto} y={g.olhoY} r={g.olhoR} tipo={ap.olhos} spec={spec} pisc={pisc} ox={ox} oy={oy} corpo={cor} lado={1} uid={uid} />
        {sobr(-1)}
        {sobr(1)}
        <Boca spec={spec} v={v} x={200 + dxRosto} y={g.bocaY} />
        {ap.acessorio === 'oculos' ? (
          <g fill="none" stroke={ap.corDetalhe} strokeWidth={7}>
            <circle cx={200 - g.olhoDx + dxRosto} cy={g.olhoY} r={(ap.olhos === 'grandes' ? g.olhoR * 1.22 : g.olhoR) + 9} />
            <circle cx={200 + g.olhoDx + dxRosto} cy={g.olhoY} r={(ap.olhos === 'grandes' ? g.olhoR * 1.22 : g.olhoR) + 9} />
            <path d={`M ${200 - 8 + dxRosto} ${g.olhoY - 4} L ${200 + 8 + dxRosto} ${g.olhoY - 4}`} />
          </g>
        ) : null}
        {ap.acessorio === 'gravata' ? (
          <g>
            <path d={`M 186 ${g.bocaY + 46} L 214 ${g.bocaY + 46} L 208 ${g.bocaY + 64} L 192 ${g.bocaY + 64} Z`} fill={escurecer(ap.corDetalhe, 0.18)} />
            <path d={`M 192 ${g.bocaY + 64} L 208 ${g.bocaY + 64} L 220 ${g.bocaY + 150} L 200 ${g.bocaY + 172} L 180 ${g.bocaY + 150} Z`} fill={ap.corDetalhe} />
          </g>
        ) : null}
        {ap.acessorio === 'bone' ? (
          <g>
            <path d={`M ${200 - g.meiaTopo - 30} ${topo + 34} Q ${200 - g.meiaTopo - 24} ${topo - 58} 200 ${topo - 60} Q ${200 + g.meiaTopo + 24} ${topo - 58} ${200 + g.meiaTopo + 30} ${topo + 34} Z`} fill={ap.corDetalhe} />
            <path d={`M 196 ${topo + 20} L ${200 + g.meiaTopo + 112} ${topo + 30} Q ${200 + g.meiaTopo + 118} ${topo + 44} ${200 + g.meiaTopo + 98} ${topo + 48} L 196 ${topo + 42} Z`} fill={escurecer(ap.corDetalhe, 0.2)} />
            <circle cx={200} cy={topo - 58} r={9} fill={escurecer(ap.corDetalhe, 0.25)} />
          </g>
        ) : null}
        {ap.acessorio === 'laco' ? (
          <g transform={`translate(${200 - Math.max(30, g.meiaTopo * 0.6)} ${topo + 6}) rotate(-16)`}>
            <path d="M 0 0 L -52 -34 L -48 34 Z" fill={ap.corDetalhe} />
            <path d="M 0 0 L 52 -34 L 48 34 Z" fill={ap.corDetalhe} />
            <circle cx={0} cy={0} r={15} fill={escurecer(ap.corDetalhe, 0.2)} />
          </g>
        ) : null}
      </g>
    </g>
  );
};
