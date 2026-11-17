import React from 'react';
import type { Aparencia } from '../../aparencia';
import { balanco, lerp, respiracao } from '../../anima';
import { alcancar, angulosBracos, ponta, SPEC, type Olhar } from '../../rosto';
import { useTema } from '../../tema';
import type { TracoProps } from '../tipos';

// Traço das silhuetas: o personagem é uma figura inteira escura (a cor "silhueta" do tema) contra o céu, sem rosto
// nem boca. Quem é quem se lê pelo contorno: o formato do corpo (reto, vestido, largo, redondo), a altura (baixa,
// media, alta), o cabelo e o acessório (os óculos e a gravata aparecem como recortes por onde o céu passa). A
// expressão está na pose: braços, inclinação e altura da cabeça, pulinho e tremida. O olhar de lado vira perfil (o
// nariz aponta para onde olha). A fala aparece pelo gesto do braço e por um balanço leve da cabeça, os dois puxados
// pelo volume: com volume zero, braço e cabeça ficam em repouso, mesmo na expressão falando. Quadro de 400 x 900,
// pés em y 890. Campos da aparência que usa: formato, altura, cabelo (dividido com o papel recortado) e acessorio.

type Pt = [number, number];

/** Cabeça: centro e raio no quadro, antes da escala da altura. */
const CAB: Pt = [200, 196];
const R = 68;
const BRACO1 = 118;
const BRACO2 = 112;

type Corpo = {
  /** contorno do tronco (com saia, no vestido) */
  tronco: string;
  /** contorno das duas pernas */
  pernas: string;
  ombro: number;
  ombroY: number;
  /** espessura do braço */
  braco: number;
  /** pés: centro x de cada um */
  pes: [number, number];
};

const CORPOS: Record<string, Corpo> = {
  reto: {
    tronco: 'M 152 298 Q 200 288 248 298 Q 268 304 266 334 L 254 566 L 146 566 L 134 334 Q 132 304 152 298 Z',
    pernas: 'M 146 550 L 198 550 L 196 872 L 160 872 Z M 202 550 L 254 550 L 240 872 L 204 872 Z',
    ombro: 60,
    ombroY: 322,
    braco: 30,
    pes: [172, 228],
  },
  vestido: {
    tronco: 'M 156 298 Q 200 290 244 298 Q 262 304 258 334 L 236 440 Q 268 520 300 640 Q 200 664 100 640 Q 132 520 164 440 L 142 334 Q 138 304 156 298 Z',
    pernas: 'M 162 630 L 188 630 L 186 872 L 166 872 Z M 212 630 L 238 630 L 234 872 L 214 872 Z',
    ombro: 56,
    ombroY: 322,
    braco: 26,
    pes: [172, 228],
  },
  largo: {
    tronco: 'M 132 302 Q 200 290 268 302 Q 292 308 288 340 L 272 430 L 260 572 L 140 572 L 128 430 L 112 340 Q 108 308 132 302 Z',
    pernas: 'M 142 556 L 198 556 L 196 872 L 154 872 Z M 202 556 L 258 556 L 246 872 L 204 872 Z',
    ombro: 80,
    ombroY: 330,
    braco: 34,
    pes: [170, 230],
  },
  redondo: {
    tronco: 'M 152 298 Q 200 288 248 298 Q 266 304 266 330 Q 300 400 298 470 Q 296 576 200 590 Q 104 576 102 470 Q 100 400 134 330 Q 134 304 152 298 Z',
    pernas: 'M 150 560 L 198 560 L 196 872 L 160 872 Z M 202 560 L 250 560 L 240 872 L 204 872 Z',
    ombro: 62,
    ombroY: 324,
    braco: 30,
    pes: [174, 226],
  },
};

const ALTURAS: Record<string, number> = { baixa: 0.78, media: 0.9, alta: 1 };

/** Quanto o cabelo e o acessório sobem acima do alto da cabeça (no desenho de altura 1). */
const acimaDaCabeca = (ap: Aparencia) =>
  Math.max(ap.cabelo === 'coque' ? 56 : ap.cabelo === 'cachos' ? 26 : ap.cabelo === 'curto' ? 14 : ap.cabelo === 'comprido' ? 8 : 0, ap.acessorio === 'bone' ? 18 : ap.acessorio === 'laco' ? 34 : 0);

/** Topo da silhueta no quadro (cabelo e acessório inclusive), já na altura dela. */
export const TOPO_SILHUETAS = (ap: Aparencia) => {
  const k = ALTURAS[ap.altura] ?? 1;
  return 890 - (890 - (CAB[1] - R - acimaDaCabeca(ap))) * k;
};

/** Cabelo em contorno, em volta da cabeça (centro em CAB). `lado` é para onde a figura está virada (1 = direita). */
const Cabelo: React.FC<{ tipo: string; mov: number; lado: -1 | 1 }> = ({ tipo, mov, lado }) => {
  const [cx, cy] = CAB;
  switch (tipo) {
    case 'curto': {
      // touca um pouco maior que a cabeça, com mechas espetadas em cima
      const pontas = [-0.82, -0.5, -0.18, 0.14, 0.46, 0.78].map((f, i) => {
        const x = cx + f * 66;
        const base = cy - Math.sqrt(Math.max(0, 1 - f * f)) * (R + 2);
        return `M ${x - 15} ${base + 10} L ${x + (i % 2 ? 8 : -6)} ${base - 16} L ${x + 15} ${base + 10} Z`;
      });
      return (
        <>
          <path d={`M ${cx - R - 6} ${cy + 6} Q ${cx - R - 8} ${cy - R - 10} ${cx} ${cy - R - 8} Q ${cx + R + 8} ${cy - R - 10} ${cx + R + 6} ${cy + 6} Z`} />
          <path d={pontas.join(' ')} />
        </>
      );
    }
    case 'comprido':
      // cabelo que desce pelos dois lados até passar dos ombros, balançando de leve
      return (
        <path
          d={`M ${cx - R - 8} ${cy} Q ${cx - R - 10} ${cy - R - 14} ${cx} ${cy - R - 8} Q ${cx + R + 10} ${cy - R - 14} ${cx + R + 8} ${cy} Q ${cx + R + 22 + mov * 3} ${cy + 110} ${cx + R + 26 + mov * 5} ${cy + 176} L ${cx + 40} ${cy + 168} L ${cx} ${cy + 40} L ${cx - 40} ${cy + 168} L ${cx - R - 26 + mov * 5} ${cy + 176} Q ${cx - R - 22 + mov * 3} ${cy + 110} ${cx - R - 8} ${cy} Z`}
        />
      );
    case 'coque':
      return (
        <>
          <path d={`M ${cx - R - 4} ${cy} Q ${cx - R - 6} ${cy - R - 8} ${cx} ${cy - R - 6} Q ${cx + R + 6} ${cy - R - 8} ${cx + R + 4} ${cy} Z`} />
          <circle cx={cx + mov * 2} cy={cy - R - 22} r={36} />
          <rect x={cx - 20} y={cy - R - 10} width={40} height={18} />
        </>
      );
    case 'cachos':
      // nuvem de cachos em volta da cabeça: o contorno fica bem maior
      return (
        <>
          {Array.from({ length: 13 }, (_, i) => {
            const a = Math.PI * (0.86 + (i / 12) * 1.28);
            return <circle key={i} cx={cx + Math.cos(a) * (R + 4)} cy={cy - 4 + Math.sin(a) * (R + 2)} r={i % 2 ? 26 : 30} />;
          })}
          <circle cx={cx - R - 6} cy={cy + 30} r={24} />
          <circle cx={cx + R + 6} cy={cy + 30} r={24} />
        </>
      );
    case 'rabo': {
      // rabo de cavalo para trás (o lado contrário de onde olha), balançando
      const x0 = cx - lado * (R - 8);
      return (
        <>
          <path d={`M ${cx - R - 4} ${cy + 2} Q ${cx - R - 6} ${cy - R - 8} ${cx} ${cy - R - 6} Q ${cx + R + 6} ${cy - R - 8} ${cx + R + 4} ${cy + 2} Z`} />
          <g transform={`rotate(${mov * 6 * lado} ${x0} ${cy - 30})`}>
            <path d={`M ${x0} ${cy - 50} Q ${x0 - lado * 70} ${cy - 40} ${x0 - lado * 74} ${cy + 60} Q ${x0 - lado * 70} ${cy + 120} ${x0 - lado * 44} ${cy + 140} Q ${x0 - lado * 46} ${cy + 60} ${x0 - lado * 6} ${cy - 10} Z`} />
            <circle cx={x0 - lado * 14} cy={cy - 34} r={16} />
          </g>
        </>
      );
    }
    case 'careca':
      // sem cabelo: as orelhas marcam o contorno
      return (
        <>
          <ellipse cx={cx - R - 4} cy={cy + 8} rx={12} ry={18} />
          <ellipse cx={cx + R + 4} cy={cy + 8} rx={12} ry={18} />
        </>
      );
    default:
      return null;
  }
};

export const TracoSilhuetas: React.FC<TracoProps> = ({ ap, expressao, falando, olhando, parada, frame, fps, semente, uid }) => {
  const T = useTema();
  const spec = SPEC[expressao];
  const c = CORPOS[ap.formato] ?? CORPOS.reto;
  const k = ALTURAS[ap.altura] ?? 1;
  const v = Math.max(0, Math.min(1, falando));
  const t = parada ? 0 : frame / fps;
  const resp = parada ? 0 : respiracao(frame, fps, semente);
  const bal = parada ? 0 : balanco(frame, fps, 1.1, semente);
  const ol: Olhar = olhando === 'frente' && spec.olharPadrao ? spec.olharPadrao : olhando;
  // para que lado a figura está virada: o olhar de lado vira perfil; olhando para cima ou para baixo, o perfil
  // fica para a direita do desenho (o espelho do personagem da direita inverte)
  const perfil = ol !== 'frente';
  const lado: -1 | 1 = ol === 'esquerda' ? -1 : 1;

  // corpo: pulinho da reação, tremida da raiva e um leve inclinar na fala
  const pulo = parada ? spec.reacao * 0.5 : spec.reacao * Math.abs(Math.sin(t * Math.PI * 2.2));
  const dy = -pulo * 44;
  const treme = spec.treme && !parada ? Math.sin(t * Math.PI * 16) * 2.6 : 0;
  // triste e brava pendem para a frente (para onde olha), rindo joga o corpo para trás
  const inclina = ((expressao === 'triste' ? 4 : 0) + (expressao === 'brava' ? 4 : 0) + (expressao === 'rindo' ? -5 : 0) + v * 1.6) * lado;

  // cabeça: inclinação e altura pela expressão; na fala, fora do eixo e balançando pelo volume
  const osc = Math.sin(t * Math.PI * 3.1);
  const fala = v * (6 + 4 * osc);
  const aceno = -Math.abs(Math.sin(t * Math.PI * 4)) * 7 * v;
  const giroBase: Record<string, number> = { neutra: 0, falando: 0, feliz: -8, triste: 12, surpresa: 0, brava: 8, pensando: -12, rindo: -18 };
  const sobeBase: Record<string, number> = { neutra: 0, falando: 0, feliz: -4, triste: 18, surpresa: -10, brava: 12, pensando: 0, rindo: -10 };
  const riso = expressao === 'rindo' && !parada ? Math.abs(Math.sin(t * Math.PI * 5)) * 6 : 0;
  const giroCab = (giroBase[expressao] ?? 0) * lado + fala * lado + (ol === 'cima' ? -6 : ol === 'baixo' ? 8 : 0) * lado;
  const sobeCab = (sobeBase[expressao] ?? 0) + aceno - riso + (ol === 'cima' ? -6 : ol === 'baixo' ? 10 : 0) + resp * 1.2;
  const pescoco: Pt = [200, 290];
  const cabT = `translate(0 ${sobeCab}) rotate(${giroCab} ${pescoco[0]} ${pescoco[1]})`;

  // braços: a pose da expressão; o gesto da fala nasce do repouso e cresce com o volume (volume zero = repouso)
  const repouso: [number, number] = [16, -6];
  const angs = angulosBracos(spec.bracos, v, t);
  if (spec.bracos === 'gesto') {
    const g = Math.min(1, v / 0.12);
    const gesto: [number, number] = [26 + 72 * v + 14 * osc * v, 30 + 62 * v + 10 * osc * v];
    angs.dir = [lerp(repouso[0], gesto[0], g), lerp(repouso[1], gesto[1], g)];
  }
  const ombroE: Pt = [200 - c.ombro, c.ombroY];
  const ombroD: Pt = [200 + c.ombro, c.ombroY];
  const queixo: Pt = [200 + 22 * lado, CAB[1] + R * 0.95 + sobeCab];
  const braco = (o: Pt, l: -1 | 1, ang: [number, number]) => {
    let cot = ponta(o[0], o[1], ang[0], BRACO1, l);
    let mao = ponta(cot[0], cot[1], ang[0] + ang[1], BRACO2, l);
    if (spec.bracos === 'queixo' && l === 1) ({ cotovelo: cot, mao } = alcancar(o, queixo, BRACO1, BRACO2));
    // braço afinando do ombro para o punho, mão redonda
    return (
      <g key={l} stroke={T.c.silhueta} strokeLinecap="round" fill="none">
        <path d={`M ${o[0]} ${o[1]} L ${cot[0]} ${cot[1]}`} strokeWidth={c.braco} />
        <path d={`M ${cot[0]} ${cot[1]} L ${mao[0]} ${mao[1]}`} strokeWidth={c.braco * 0.8} />
        <circle cx={mao[0]} cy={mao[1]} r={c.braco * 0.6} fill={T.c.silhueta} stroke="none" />
      </g>
    );
  };

  // recortes por onde o céu passa (máscara): as lentes dos óculos e o contorno da gravata
  const [cx, cy] = CAB;
  const lentes =
    ap.acessorio === 'oculos'
      ? perfil
        ? [[cx + lado * 40, cy - 2, 17]]
        : [
            [cx - 27, cy - 2, 18],
            [cx + 27, cy - 2, 18],
          ]
      : [];
  const gravata = ap.acessorio === 'gravata';
  const idMascara = `${uid}-sil`;
  const nariz = perfil
    ? ol === 'cima'
      ? `M ${cx + lado * (R - 14)} ${cy - 30} L ${cx + lado * (R + 18)} ${cy - 22} L ${cx + lado * (R - 2)} ${cy + 2} Z`
      : ol === 'baixo'
        ? `M ${cx + lado * (R - 12)} ${cy + 4} L ${cx + lado * (R + 14)} ${cy + 26} L ${cx + lado * (R - 12)} ${cy + 30} Z`
        : `M ${cx + lado * (R - 10)} ${cy - 16} L ${cx + lado * (R + 20)} ${cy + 10} L ${cx + lado * (R - 6)} ${cy + 18} Z`
    : null;

  return (
    <g transform={`translate(${treme} ${dy}) rotate(${inclina} 200 890) translate(200 890) scale(${k}) translate(-200 -890)`}>
      <defs>
        <mask id={idMascara} maskUnits="userSpaceOnUse" x={-300} y={-300} width={1000} height={1500}>
          <rect x={-300} y={-300} width={1000} height={1500} fill="#FFFFFF" />
          <g transform={cabT} fill="#000000">
            {lentes.map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
          {gravata ? (
            <g fill="none" stroke="#000000" strokeWidth={7} strokeLinejoin="round">
              <path d="M 174 296 L 200 322 L 226 296" />
              <path d="M 192 318 L 208 318 L 216 446 L 200 468 L 184 446 Z" />
            </g>
          ) : null}
        </mask>
      </defs>
      <g mask={`url(#${idMascara})`} fill={T.c.silhueta}>
        <path d={c.pernas} />
        <ellipse cx={c.pes[0] - 8} cy={878} rx={30} ry={13} />
        <ellipse cx={c.pes[1] + 8} cy={878} rx={30} ry={13} />
        <g transform={`translate(200 566) scale(1 ${1 + resp * 0.006}) translate(-200 -566)`}>
          <path d={c.tronco} />
        </g>
        <path d="M 182 250 L 218 250 L 222 312 L 178 312 Z" />
        {braco(ombroE, -1, angs.esq)}
        {braco(ombroD, 1, angs.dir)}
        <g transform={cabT}>
          <Cabelo tipo={ap.cabelo} mov={bal} lado={lado} />
          <ellipse cx={cx} cy={cy + 2} rx={R - 3} ry={R + 2} />
          {nariz ? <path d={nariz} /> : null}
          {perfil ? <ellipse cx={cx + lado * 30} cy={cy + R - 8} rx={30} ry={14} /> : null}
          {/* óculos de frente: as hastes passam um pouco do contorno da cabeça */}
          {ap.acessorio === 'oculos' && !perfil ? (
            <>
              <rect x={cx - R - 12} y={cy - 8} width={22} height={7} rx={3} />
              <rect x={cx + R - 10} y={cy - 8} width={22} height={7} rx={3} />
            </>
          ) : null}
          {ap.acessorio === 'bone' ? (
            <>
              <path d={`M ${cx - R - 6} ${cy - 16} Q ${cx - R - 4} ${cy - R - 20} ${cx} ${cy - R - 18} Q ${cx + R + 4} ${cy - R - 20} ${cx + R + 6} ${cy - 16} Z`} />
              <path d={`M ${cx} ${cy - 34} L ${cx + lado * (R + 58)} ${cy - 28} Q ${cx + lado * (R + 70)} ${cy - 14} ${cx + lado * (R + 52)} ${cy - 6} L ${cx} ${cy - 12} Z`} />
            </>
          ) : null}
          {ap.acessorio === 'laco' ? (
            <g transform={`translate(${cx - lado * 42} ${cy - R + 2}) rotate(${-18 * lado})`}>
              <path d="M 0 0 C -18 -44 -62 -46 -58 -6 C -60 34 -20 36 0 0 Z" />
              <path d="M 0 0 C 18 -44 62 -46 58 -6 C 60 34 20 36 0 0 Z" />
              <circle cx={0} cy={0} r={15} />
            </g>
          ) : null}
        </g>
      </g>
    </g>
  );
};
