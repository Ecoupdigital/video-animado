import React, { useId } from 'react';
import { COR, Pele } from './cores';

// Expressões do modelo. Todos os personagens humanos usam a mesma lista.
export type Expressao =
  | 'neutra'
  | 'falando'
  | 'feliz'
  | 'surpresa'
  | 'pensando'
  | 'apontando'
  | 'ansiosa'
  | 'cansada'
  | 'rindo'
  | 'emocionada';

export const EXPRESSOES: Expressao[] = [
  'neutra',
  'falando',
  'feliz',
  'surpresa',
  'pensando',
  'apontando',
  'ansiosa',
  'cansada',
  'rindo',
  'emocionada',
];

export type Olhar = 'frente' | 'esquerda' | 'direita' | 'cima' | 'baixo';

type TipoOlho = 'normal' | 'grande' | 'pesado' | 'fechado' | 'brilho';
type TipoBoca =
  | 'linha'
  | 'sorriso'
  | 'sorrisoAberto'
  | 'o'
  | 'torta'
  | 'dentes'
  | 'linhaBaixa'
  | 'gargalhada'
  | 'tremido';

type Spec = {
  olho: TipoOlho;
  boca: TipoBoca;
  // sobrancelha: [altura, inclinação da ponta de dentro] (negativo = sobe)
  sobr: [number, number];
  sobrDir?: [number, number]; // se a direita for diferente (pensando)
  olharPadrao?: Olhar;
  suor?: boolean;
  lagrima?: boolean;
  bochecha?: number; // opacidade do rubor
};

export const SPEC: Record<Expressao, Spec> = {
  neutra: { olho: 'normal', boca: 'linha', sobr: [0, 0] },
  falando: { olho: 'normal', boca: 'sorriso', sobr: [-3, -2] },
  feliz: { olho: 'normal', boca: 'sorrisoAberto', sobr: [-6, -3], bochecha: 0.3 },
  surpresa: { olho: 'grande', boca: 'o', sobr: [-16, -4] },
  pensando: { olho: 'normal', boca: 'torta', sobr: [-2, 2], sobrDir: [-12, -2], olharPadrao: 'cima' },
  apontando: { olho: 'normal', boca: 'sorrisoAberto', sobr: [-6, -2] },
  ansiosa: { olho: 'grande', boca: 'dentes', sobr: [-6, -10], suor: true },
  cansada: { olho: 'pesado', boca: 'linhaBaixa', sobr: [4, -3] },
  rindo: { olho: 'fechado', boca: 'gargalhada', sobr: [-8, -2], bochecha: 0.35 },
  emocionada: { olho: 'brilho', boca: 'tremido', sobr: [-4, -9], lagrima: true, bochecha: 0.3 },
};

export type FeicoesProps = {
  cx: number;
  cy: number;
  r: number; // raio da cabeça
  pele: Pele;
  corSobrancelha: string;
  expressao: Expressao;
  falando: number; // 0 a 1, volume da voz no frame
  olhando?: Olhar;
  piscar: number; // 1 aberto, 0.1 fechado
  sardas?: boolean;
  rugas?: boolean;
  corBoca?: string;
  /** Distância entre os olhos, em fração do raio. */
  aberturaOlhos?: number;
  tamanhoOlho?: number;
  cilios?: boolean;
};

const desloc = (o: Olhar): [number, number] => {
  switch (o) {
    case 'esquerda':
      return [-7, 0];
    case 'direita':
      return [7, 0];
    case 'cima':
      return [3, -7];
    case 'baixo':
      return [0, 6];
    default:
      return [0, 0];
  }
};

/** Olhos, sobrancelhas, nariz, boca e detalhes. A cabeça e o cabelo ficam no personagem. */
export const Feicoes: React.FC<FeicoesProps> = ({
  cx,
  cy,
  r,
  pele,
  corSobrancelha,
  expressao,
  falando,
  olhando,
  piscar,
  sardas,
  rugas,
  corBoca,
  aberturaOlhos = 0.38,
  tamanhoOlho = 1,
  cilios = false,
}) => {
  const id = useId().replace(/:/g, '');
  const s = SPEC[expressao];
  const olhar = olhando ?? s.olharPadrao ?? 'frente';
  const [dx, dy] = desloc(olhar);
  const ex = aberturaOlhos * r;
  const ey = cy + 0.12 * r;
  const rx = 0.125 * r * tamanhoOlho;
  const ry = 0.155 * r * tamanhoOlho;
  const f = Math.max(0, Math.min(1, falando));
  const linha = corBoca ?? COR.linhaBoca;

  const olho = (lado: -1 | 1) => {
    const x = cx + lado * ex + dx;
    const y = ey + dy;
    if (s.olho === 'fechado') {
      return (
        <path
          key={lado}
          d={`M ${x - rx * 1.1} ${y + 4} Q ${x} ${y - ry * 1.3} ${x + rx * 1.1} ${y + 4}`}
          stroke={COR.texto}
          strokeWidth={0.06 * r}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
    const k = s.olho === 'grande' ? 1.22 : 1;
    const ox = rx * k;
    const oy = ry * k;
    return (
      <g key={lado} transform={`translate(${x} ${y}) scale(1 ${piscar}) translate(${-x} ${-y})`}>
        <ellipse cx={x} cy={y} rx={ox} ry={oy} fill={COR.texto} />
        <circle cx={x + ox * 0.35} cy={y - oy * 0.4} r={ox * (s.olho === 'brilho' ? 0.42 : 0.32)} fill={COR.branco} />
        {cilios && s.olho !== 'pesado' && (
          <path
            d={`M ${x + lado * ox * 0.55} ${y - oy * 0.85} l ${lado * ox * 0.55} ${-oy * 0.32} M ${x + lado * ox * 0.85} ${y - oy * 0.5} l ${lado * ox * 0.55} ${-oy * 0.12}`}
            stroke={COR.texto}
            strokeWidth={0.03 * r}
            strokeLinecap="round"
          />
        )}
        {s.olho === 'brilho' && <circle cx={x - ox * 0.35} cy={y + oy * 0.35} r={ox * 0.18} fill={COR.branco} />}
        {s.olho === 'pesado' && (
          <>
            <rect x={x - ox * 1.3} y={y - oy * 1.4} width={ox * 2.6} height={oy * 1.25} fill={pele.base} />
            <path
              d={`M ${x - ox * 1.15} ${y - oy * 0.15} Q ${x} ${y - oy * 0.35} ${x + ox * 1.15} ${y - oy * 0.15}`}
              stroke={COR.texto}
              strokeWidth={0.035 * r}
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    );
  };

  const sobrancelha = (lado: -1 | 1) => {
    const [alt, incl] = lado === 1 && s.sobrDir ? s.sobrDir : s.sobr;
    const x = cx + lado * ex + dx * 0.5;
    const y = ey - 0.33 * r + alt + dy * 0.4;
    const larg = 0.17 * r;
    const xi = x - lado * larg; // ponta de dentro
    const xo = x + lado * larg; // ponta de fora
    return (
      <path
        key={'s' + lado}
        d={`M ${xi} ${y + incl} Q ${x} ${y - 6 + incl * 0.3} ${xo} ${y + 2}`}
        stroke={corSobrancelha}
        strokeWidth={0.06 * r}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  // boca
  const mx = cx + dx * 0.4;
  const my = cy + 0.66 * r;
  const traco = (d: string) => (
    <path d={d} stroke={linha} strokeWidth={0.05 * r} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  );
  const aberta = (w: number, h: number, curva: number, dentes = true, lingua = true) => {
    const l = mx - w / 2;
    const rr = mx + w / 2;
    const d = `M ${l} ${my} Q ${mx} ${my + curva} ${rr} ${my} C ${rr} ${my + h * 1.33} ${l} ${my + h * 1.33} ${l} ${my} Z`;
    return (
      <g>
        <defs>
          <clipPath id={`b${id}`}>
            <path d={d} />
          </clipPath>
        </defs>
        <path d={d} fill={COR.boca} />
        <g clipPath={`url(#b${id})`}>
          {dentes && <rect x={l} y={my - 4} width={w} height={Math.min(9, h * 0.35) + 4 + curva * 0.5} fill={COR.branco} />}
          {lingua && h > 12 && <ellipse cx={mx} cy={my + h} rx={w * 0.3} ry={h * 0.35} fill={COR.lingua} />}
        </g>
      </g>
    );
  };

  let boca: React.ReactNode;
  const fala = f > 0.06;
  const W = 0.42 * r;
  switch (s.boca) {
    case 'o': {
      const h = 0.13 * r + f * 0.12 * r;
      boca = <ellipse cx={mx} cy={my + h * 0.5} rx={0.09 * r + f * 0.03 * r} ry={h * 0.6} fill={COR.boca} />;
      break;
    }
    case 'gargalhada':
      boca = aberta(W * 1.25, 0.24 * r + f * 0.08 * r, 0.04 * r);
      break;
    case 'dentes': {
      const w = W * 1.15;
      const h = 0.1 * r + f * 0.12 * r;
      boca = (
        <g>
          <rect x={mx - w / 2} y={my - h / 2} width={w} height={h} rx={h * 0.45} fill={COR.boca} />
          <rect x={mx - w / 2 + 3} y={my - h / 2 + 2} width={w - 6} height={h * 0.42} rx={3} fill={COR.branco} />
        </g>
      );
      break;
    }
    case 'sorrisoAberto':
      boca = aberta(W * 1.05, 0.17 * r + f * 0.12 * r, 0.03 * r);
      break;
    default: {
      if (fala) {
        // falando: a boca abre conforme o volume
        const positivo = s.boca === 'sorriso' || s.boca === 'tremido';
        boca = aberta(W * (0.8 + f * 0.25), 0.05 * r + f * 0.2 * r, positivo ? 0.025 * r : 0, f > 0.3, f > 0.45);
      } else if (s.boca === 'linha') {
        boca = traco(`M ${mx - 0.13 * r} ${my} Q ${mx} ${my + 0.03 * r} ${mx + 0.13 * r} ${my}`);
      } else if (s.boca === 'sorriso') {
        boca = traco(`M ${mx - 0.19 * r} ${my - 0.02 * r} Q ${mx} ${my + 0.13 * r} ${mx + 0.19 * r} ${my - 0.02 * r}`);
      } else if (s.boca === 'torta') {
        boca = traco(`M ${mx - 0.13 * r} ${my + 0.02 * r} Q ${mx + 0.02 * r} ${my + 0.06 * r} ${mx + 0.16 * r} ${my - 0.04 * r}`);
      } else if (s.boca === 'linhaBaixa') {
        boca = traco(`M ${mx - 0.12 * r} ${my + 0.04 * r} Q ${mx} ${my} ${mx + 0.12 * r} ${my + 0.04 * r}`);
      } else {
        // tremido
        boca = traco(
          `M ${mx - 0.17 * r} ${my} Q ${mx - 0.085 * r} ${my + 0.07 * r} ${mx} ${my + 0.02 * r} Q ${mx + 0.085 * r} ${my + 0.07 * r} ${mx + 0.17 * r} ${my}`,
        );
      }
    }
  }

  const bochecha = s.bochecha ?? 0.18;

  return (
    <g>
      {/* rubor */}
      <ellipse cx={cx - 0.56 * r} cy={cy + 0.43 * r} rx={0.15 * r} ry={0.085 * r} fill={COR.rubor} opacity={bochecha} />
      <ellipse cx={cx + 0.56 * r} cy={cy + 0.43 * r} rx={0.15 * r} ry={0.085 * r} fill={COR.rubor} opacity={bochecha} />
      {sardas &&
        [
          [-0.2, 0.36],
          [-0.27, 0.3],
          [-0.13, 0.29],
          [0.2, 0.36],
          [0.27, 0.3],
          [0.13, 0.29],
        ].map(([a, b], i) => <circle key={i} cx={cx + a * r} cy={cy + b * r} r={0.022 * r} fill={pele.sarda} opacity={0.6} />)}
      {rugas && (
        <>
          {[-1, 1].map((l) => (
            <path
              key={l}
              d={`M ${cx + l * 0.6 * r} ${ey + 0.02 * r} q ${l * 0.06 * r} ${0.04 * r} ${l * 0.03 * r} ${0.1 * r}`}
              stroke={pele.sombra}
              strokeWidth={0.025 * r}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </>
      )}
      {sobrancelha(-1)}
      {sobrancelha(1)}
      {olho(-1)}
      {olho(1)}
      {/* nariz */}
      <path
        d={`M ${cx - 0.06 * r + dx * 0.3} ${cy + 0.36 * r} Q ${cx + dx * 0.3} ${cy + 0.44 * r} ${cx + 0.06 * r + dx * 0.3} ${cy + 0.36 * r}`}
        stroke={pele.sombra}
        strokeWidth={0.04 * r}
        fill="none"
        strokeLinecap="round"
      />
      {boca}
      {s.suor && (
        <path
          d={`M ${cx + 0.88 * r} ${cy - 0.5 * r} Q ${cx + 0.8 * r} ${cy - 0.32 * r} ${cx + 0.88 * r} ${cy - 0.28 * r} Q ${cx + 0.96 * r} ${cy - 0.32 * r} ${cx + 0.88 * r} ${cy - 0.5 * r} Z`}
          fill={COR.agua}
        />
      )}
      {s.lagrima && (
        <path
          d={`M ${cx + ex + 0.02 * r} ${ey + 0.2 * r} q ${-0.05 * r} ${0.1 * r} 0 ${0.15 * r} q ${0.05 * r} ${-0.05 * r} 0 ${-0.15 * r} Z`}
          fill={COR.agua}
        />
      )}
    </g>
  );
};
