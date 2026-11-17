import React from 'react';
import { COR, Pele, TRACO } from './cores';

// Rosto editorial: olhos de ponto com pálpebra em traço fino, sobrancelha fina, nariz e boca em linha.
// Adulto e criança usam o mesmo rosto (a criança com k maior). Todos os adultos usam esta lista de expressões.
export type Expressao =
  | 'neutra'
  | 'falando'
  | 'feliz'
  | 'surpresa'
  | 'pensando'
  | 'apontando'
  | 'ironica'
  | 'exausta'
  | 'aliviada';

export const EXPRESSOES: Expressao[] = ['neutra', 'falando', 'feliz', 'surpresa', 'pensando', 'apontando', 'ironica', 'exausta', 'aliviada'];

export type Olhar = 'frente' | 'esquerda' | 'direita' | 'cima' | 'baixo';

type Olho = 'normal' | 'sorrindo' | 'grande' | 'pesado' | 'fechado';
type Boca = 'linha' | 'sorriso' | 'sorrisoAberto' | 'o' | 'torta' | 'meioSorriso' | 'linhaBaixa' | 'suave';

type Spec = {
  olho: Olho;
  boca: Boca;
  /** [altura, inclinação da ponta de dentro]; negativo sobe. */
  sobr: [number, number];
  sobrDir?: [number, number];
  olhar?: Olhar;
  olheira?: boolean;
  rubor?: number;
  /** Inclinação da cabeça em graus. */
  inclinacao?: number;
};

export const SPEC: Record<Expressao, Spec> = {
  neutra: { olho: 'normal', boca: 'linha', sobr: [0, 0] },
  falando: { olho: 'normal', boca: 'sorriso', sobr: [-1.5, -1], inclinacao: 2 },
  feliz: { olho: 'sorrindo', boca: 'sorrisoAberto', sobr: [-3, -1], rubor: 0.35, inclinacao: 3 },
  surpresa: { olho: 'grande', boca: 'o', sobr: [-7, -1] },
  pensando: { olho: 'normal', boca: 'torta', sobr: [-1, 1.5], sobrDir: [-6, -1], olhar: 'cima', inclinacao: -5 },
  apontando: { olho: 'normal', boca: 'sorriso', sobr: [-3, -1] },
  ironica: { olho: 'pesado', boca: 'meioSorriso', sobr: [0, 1], sobrDir: [-5, -1], olhar: 'esquerda', inclinacao: -3 },
  exausta: { olho: 'pesado', boca: 'linhaBaixa', sobr: [1, -3.5], olheira: true, inclinacao: 5 },
  aliviada: { olho: 'fechado', boca: 'suave', sobr: [-2, -2], rubor: 0.25, inclinacao: -2 },
};

export const inclinacaoDe = (e: Expressao) => SPEC[e].inclinacao ?? 0;

const desloc = (o: Olhar): [number, number] => {
  switch (o) {
    case 'esquerda':
      return [-3, 0];
    case 'direita':
      return [3, 0];
    case 'cima':
      return [1.5, -3];
    case 'baixo':
      return [0, 3];
    default:
      return [0, 0];
  }
};

export type RostoProps = {
  cx: number;
  /** Altura da linha dos olhos. */
  cy: number;
  /** 1 = adulto. Criança usa ~1.6. */
  k?: number;
  pele: Pele;
  corSobrancelha: string;
  expressao: Expressao;
  falando: number;
  olhando?: Olhar;
  piscar: number;
  cilios?: boolean;
  /** Distância de cada olho ao centro (em unidades de k). */
  afastamento?: number;
  /** Multiplica a espessura das linhas do rosto (personagem desenhado em escala menor). */
  grossura?: number;
};

export const Rosto: React.FC<RostoProps> = ({
  cx,
  cy,
  k = 1,
  pele,
  corSobrancelha,
  expressao,
  falando,
  olhando,
  piscar,
  cilios = false,
  afastamento = 17,
  grossura = 1,
}) => {
  const s = SPEC[expressao];
  const [dx0, dy0] = desloc(olhando ?? s.olhar ?? 'frente');
  const dx = dx0 * k;
  const dy = dy0 * k;
  const f = Math.max(0, Math.min(1, falando));
  const lw = TRACO * 0.75 * Math.sqrt(k) * grossura;

  const olho = (lado: -1 | 1) => {
    const x = cx + lado * afastamento * k;
    const px = x + dx;
    const py = cy + dy;
    if (s.olho === 'fechado') {
      return (
        <path
          key={lado}
          d={`M ${x - 7 * k} ${cy - 1 * k} Q ${x} ${cy + 4 * k} ${x + 7 * k} ${cy - 1 * k}`}
          stroke={COR.tinta}
          strokeWidth={lw * 1.1}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
    const rx = (s.olho === 'grande' ? 4.4 : 3.7) * k;
    const ry = (s.olho === 'grande' ? 5.6 : s.olho === 'sorrindo' ? 3.6 : 4.6) * k;
    const tampa = s.olho === 'grande' ? 8 : 6;
    return (
      <g key={lado}>
        <g transform={`translate(${px} ${py}) scale(1 ${piscar}) translate(${-px} ${-py})`}>
          <ellipse cx={px} cy={py} rx={rx} ry={ry} fill={COR.tinta} />
          <circle cx={px + rx * 0.35} cy={py - ry * 0.4} r={rx * 0.3} fill={COR.branco} />
          {s.olho === 'pesado' && <rect x={x - 9 * k} y={cy - 10 * k} width={18 * k} height={10 * k} fill={pele.base} />}
        </g>
        {/* pálpebra de cima */}
        <path
          d={
            s.olho === 'pesado'
              ? `M ${x - 7.5 * k} ${cy - 0.5 * k} Q ${x} ${cy - 2 * k} ${x + 7.5 * k} ${cy - 0.5 * k}`
              : `M ${x - 7.5 * k} ${cy - (tampa - 3) * k} Q ${x} ${cy - (tampa + 2) * k} ${x + 7.5 * k} ${cy - (tampa - 3) * k}`
          }
          stroke={COR.tinta}
          strokeWidth={lw}
          fill="none"
          strokeLinecap="round"
        />
        {s.olho === 'sorrindo' && (
          <path d={`M ${x - 6 * k} ${cy + 5 * k} Q ${x} ${cy + 2.5 * k} ${x + 6 * k} ${cy + 5 * k}`} stroke={pele.sombra} strokeWidth={lw} fill="none" strokeLinecap="round" />
        )}
        {cilios && (
          <path
            d={`M ${x + lado * 7 * k} ${cy - (s.olho === 'pesado' ? 1 : tampa - 3) * k} l ${lado * 3 * k} ${-2.2 * k}`}
            stroke={COR.tinta}
            strokeWidth={lw}
            strokeLinecap="round"
          />
        )}
        {s.olheira && (
          <path d={`M ${x - 6 * k} ${cy + 6 * k} Q ${x} ${cy + 9 * k} ${x + 6 * k} ${cy + 6 * k}`} stroke={pele.sombra} strokeWidth={lw * 1.2} fill="none" strokeLinecap="round" />
        )}
      </g>
    );
  };

  const sobrancelha = (lado: -1 | 1) => {
    const [alt, incl] = lado === 1 && s.sobrDir ? s.sobrDir : s.sobr;
    const x = cx + lado * afastamento * k;
    const y = cy - 13 * k + alt * k;
    const xi = x - lado * 7.5 * k;
    const xo = x + lado * 7.5 * k;
    return (
      <path
        key={'s' + lado}
        d={`M ${xi} ${y + incl * k} Q ${x} ${y - 2.5 * k + incl * 0.3 * k} ${xo} ${y + 1 * k}`}
        stroke={corSobrancelha}
        strokeWidth={lw * 1.35}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  // boca
  const mx = cx + dx * 0.4;
  const my = cy + 31 * k;
  const linha = (d: string) => <path d={d} stroke={COR.tinta} strokeWidth={lw} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  let boca: React.ReactNode;
  if (f > 0.06 && s.boca !== 'o') {
    const w = (8 + f * 2.5) * k;
    const h = (2 + f * 9) * k;
    const sorri = s.boca === 'sorriso' || s.boca === 'sorrisoAberto' || s.boca === 'suave' ? 2 * k : 0;
    boca = (
      <g>
        <path d={`M ${mx - w} ${my} Q ${mx} ${my + sorri} ${mx + w} ${my} Q ${mx} ${my + h * 1.6} ${mx - w} ${my} Z`} fill={COR.boca} stroke={COR.tinta} strokeWidth={lw * 0.8} strokeLinejoin="round" />
        {f > 0.35 && <path d={`M ${mx - w * 0.7} ${my + 0.8 * k} Q ${mx} ${my + 2.6 * k} ${mx + w * 0.7} ${my + 0.8 * k}`} stroke={COR.branco} strokeWidth={1.8 * k} fill="none" strokeLinecap="round" />}
      </g>
    );
  } else {
    switch (s.boca) {
      case 'o': {
        const h = (6 + f * 3) * k;
        boca = <ellipse cx={mx} cy={my + 2 * k} rx={4.4 * k} ry={h} fill={COR.boca} stroke={COR.tinta} strokeWidth={lw * 0.8} />;
        break;
      }
      case 'sorrisoAberto':
        boca = (
          <g>
            <path d={`M ${mx - 12 * k} ${my - 1 * k} Q ${mx} ${my + 2 * k} ${mx + 12 * k} ${my - 1 * k} Q ${mx} ${my + 14 * k} ${mx - 12 * k} ${my - 1 * k} Z`} fill={COR.boca} stroke={COR.tinta} strokeWidth={lw * 0.8} strokeLinejoin="round" />
            <path d={`M ${mx - 9 * k} ${my + 0.6 * k} Q ${mx} ${my + 3.2 * k} ${mx + 9 * k} ${my + 0.6 * k}`} stroke={COR.branco} strokeWidth={2.4 * k} fill="none" strokeLinecap="round" />
          </g>
        );
        break;
      case 'sorriso':
        boca = linha(`M ${mx - 11 * k} ${my - 1 * k} Q ${mx} ${my + 7 * k} ${mx + 11 * k} ${my - 1 * k}`);
        break;
      case 'torta':
        boca = linha(`M ${mx - 8 * k} ${my + 2 * k} Q ${mx + 2 * k} ${my + 3 * k} ${mx + 10 * k} ${my - 2 * k}`);
        break;
      case 'meioSorriso':
        boca = (
          <g>
            {linha(`M ${mx - 9 * k} ${my + 1 * k} Q ${mx + 3 * k} ${my + 3 * k} ${mx + 11 * k} ${my - 4 * k}`)}
            {linha(`M ${mx + 11 * k} ${my - 4 * k} q ${1.5 * k} ${1 * k} ${1 * k} ${3 * k}`)}
          </g>
        );
        break;
      case 'linhaBaixa':
        boca = linha(`M ${mx - 10 * k} ${my + 2.5 * k} Q ${mx} ${my - 1 * k} ${mx + 10 * k} ${my + 2.5 * k}`);
        break;
      case 'suave':
        boca = linha(`M ${mx - 9 * k} ${my} Q ${mx} ${my + 5 * k} ${mx + 9 * k} ${my}`);
        break;
      default:
        boca = linha(`M ${mx - 9 * k} ${my} Q ${mx} ${my + 1.5 * k} ${mx + 9 * k} ${my}`);
    }
  }

  const rubor = s.rubor ?? 0.12;
  return (
    <g>
      <ellipse cx={cx - 26 * k} cy={cy + 15 * k} rx={7 * k} ry={4 * k} fill={COR.rubor} opacity={rubor} />
      <ellipse cx={cx + 26 * k} cy={cy + 15 * k} rx={7 * k} ry={4 * k} fill={COR.rubor} opacity={rubor} />
      {sobrancelha(-1)}
      {sobrancelha(1)}
      {olho(-1)}
      {olho(1)}
      {/* nariz: uma linha de lado, como na ilustração editorial */}
      <path
        d={`M ${cx + 1 * k + dx * 0.3} ${cy + 4 * k} Q ${cx - 3 * k + dx * 0.3} ${cy + 15 * k} ${cx + 1 * k + dx * 0.3} ${cy + 18 * k} Q ${cx + 4 * k + dx * 0.3} ${cy + 19 * k} ${cx + 6 * k + dx * 0.3} ${cy + 17 * k}`}
        stroke={pele.sombra}
        strokeWidth={lw * 1.1}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {boca}
    </g>
  );
};
