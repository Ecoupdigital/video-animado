import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COR, TONS_PELE, TRACO, escurecer } from './cores';
import { balanco, piscada, respiracao } from './anima';
import { Ponto } from './braco';
import { Expressao, Olhar, Rosto } from './rosto';
import { Oculos, MolduraPersonagem } from './adulto';
import { AparenciaCrianca, AparenciaEntrada, Epoca, resolverCrianca } from './presets';

// Corpo de criança no mesmo traço: desenhado no quadro de 400 x 900 e encolhido pela altura da aparência
// (0,56 do adulto padrão = uns 4 anos). A criança não fala: a boca só muda com a expressão, e a
// narradora conta o que ela fez. Cabelo, roupa, óculos e curativo vêm do respostas.json.
export type ExpressaoCrianca = 'neutra' | 'feliz' | 'travesso' | 'surpresa' | 'emburrado' | 'dormindo';
export const EXPRESSOES_CRIANCA: ExpressaoCrianca[] = ['neutra', 'feliz', 'travesso', 'surpresa', 'emburrado', 'dormindo'];
export type PoseCrianca = 'parado' | 'correndo' | 'bracos-pra-cima';
export const POSES_CRIANCA: PoseCrianca[] = ['parado', 'correndo', 'bracos-pra-cima'];

const ROSTO: Record<ExpressaoCrianca, Expressao> = {
  neutra: 'neutra',
  feliz: 'feliz',
  travesso: 'ironica',
  surpresa: 'surpresa',
  emburrado: 'exausta',
  dormindo: 'aliviada',
};

const membro = (a: Ponto, b: Ponto, c: Ponto, cor: string, larg: number, s: number, key: string) => (
  <g key={key}>
    <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`} stroke={COR.tinta} strokeWidth={larg + s * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`} stroke={cor} strokeWidth={larg} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/** Cabelo da criança em duas camadas: atrás da cabeça e na frente. `S` é a grossura do traço no quadro. */
const cabeloCrianca = (a: AparenciaCrianca, S: number): { atras?: React.ReactNode; frente?: React.ReactNode } => {
  const c = a.corCabelo;
  const forma = (d: string, cor = c) => <path d={d} fill={cor} stroke={COR.tinta} strokeWidth={S} strokeLinejoin="round" />;
  switch (a.cabelo) {
    case 'arrepiado':
      return {
        frente: forma(
          'M 108 136 C 104 92 130 62 160 58 L 150 30 L 182 50 L 186 14 L 208 46 L 226 18 L 236 54 L 268 34 L 262 70 C 286 84 298 110 292 140 C 276 112 250 98 222 100 C 214 112 200 116 186 112 C 162 108 128 112 108 136 Z',
        ),
      };
    case 'franja':
      return {
        atras: forma('M 104 170 C 96 80 140 48 200 48 C 260 48 304 80 296 170 L 286 196 L 114 196 Z'),
        frente: forma('M 106 150 C 98 72 146 50 200 50 C 254 50 302 72 294 150 C 282 118 264 104 240 102 C 214 110 186 110 160 102 C 136 104 118 118 106 150 Z'),
      };
    case 'marias': {
      const laco = (x: number) => (
        <g>
          <path d={`M ${x} 128 l -16 -12 l 0 24 Z M ${x} 128 l 16 -12 l 0 24 Z`} fill={a.laco} stroke={COR.tinta} strokeWidth={S * 0.7} strokeLinejoin="round" />
          <circle cx={x} cy={128} r={6} fill={a.laco} stroke={COR.tinta} strokeWidth={S * 0.7} />
        </g>
      );
      return {
        atras: (
          <g>
            {forma('M 108 122 C 70 116 48 150 54 192 C 58 222 74 240 86 252 C 84 220 90 190 114 166 Z')}
            {forma('M 292 122 C 330 116 352 150 346 192 C 342 222 326 240 314 252 C 316 220 310 190 286 166 Z')}
            {laco(102)}
            {laco(298)}
          </g>
        ),
        frente: forma('M 106 146 C 100 70 150 50 200 50 C 250 50 300 70 294 146 C 286 112 262 94 226 92 L 200 70 L 174 92 C 138 94 114 112 106 146 Z'),
      };
    }
    case 'crespo':
      return {
        atras: (
          <g>
            {forma('M 200 26 C 120 22 76 70 84 136 C 88 176 104 196 124 200 L 276 200 C 296 196 312 176 316 136 C 324 70 280 22 200 26 Z')}
            {[[110, 80], [96, 130], [150, 40], [250, 40], [290, 80], [304, 130]].map(([x, y], i) => (
              <path key={i} d={`M ${x - 9} ${y + 3} q 5 -12 14 -5 q 5 6 -3 10`} stroke={escurecer(c, 0.35)} strokeWidth={3} fill="none" strokeLinecap="round" />
            ))}
          </g>
        ),
        frente: forma('M 110 140 C 104 74 150 56 200 56 C 250 56 296 74 290 140 C 278 110 250 96 200 96 C 150 96 122 110 110 140 Z'),
      };
    default:
      return {};
  }
};

export type CriancaPersonagemProps = {
  expressao?: ExpressaoCrianca;
  pose?: PoseCrianca;
  olhando?: Olhar;
  escala?: number;
  espelhar?: boolean;
  /** Desliga respiração, piscada e passada (folhas e imagens paradas). */
  parada?: boolean;
  /** "antes" desenha a aparência do antes (só o que muda). */
  epoca?: Epoca;
};

/** Criança configurável. Não fala: a boca só muda com a expressão. */
export const Crianca: React.FC<CriancaPersonagemProps & { aparencia: AparenciaEntrada; antes?: AparenciaEntrada | null; semente?: number }> = ({
  aparencia,
  antes = null,
  semente = 3,
  expressao = 'neutra',
  pose = 'parado',
  olhando,
  escala = 1,
  espelhar = false,
  parada = false,
  epoca = 'agora',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = resolverCrianca(aparencia, antes, epoca);
  const S = TRACO / a.altura; // traço com a mesma grossura dos adultos depois de encolhido
  const f = parada ? 0 : frame;
  const t = f / fps;
  const resp = parada ? 0 : respiracao(f, fps, semente);
  const pisc = parada || expressao === 'dormindo' ? 1 : piscada(f, semente);
  const corre = pose === 'correndo';
  const passo = corre && !parada ? Math.sin(t * Math.PI * 4) : corre ? 0.8 : 0;
  const pulo = corre && !parada ? Math.abs(Math.sin(t * Math.PI * 4)) * -14 : 0;
  const pele = TONS_PELE[a.pele];
  const cabelo = cabeloCrianca(a, S);
  const clip = `camiseta-crianca-${semente}`;

  // pernas
  const pernaE: [Ponto, Ponto, Ponto] = corre
    ? [[176, 590], [160 - passo * 40, 700], [150 - passo * 70, 830 + Math.max(0, passo) * -20]]
    : [[176, 590], [172, 712], [170, 832]];
  const pernaD: [Ponto, Ponto, Ponto] = corre
    ? [[224, 590], [240 + passo * 40, 700], [250 + passo * 70, 830 + Math.max(0, -passo) * -20]]
    : [[224, 590], [228, 712], [230, 832]];
  // braços
  const bracoE: [Ponto, Ponto, Ponto] =
    pose === 'bracos-pra-cima' ? [[132, 296], [96, 210], [92, 118]] : corre ? [[132, 296], [104 + passo * 30, 380], [96 + passo * 60, 450]] : [[132, 296], [116, 400], [120, 488]];
  const bracoD: [Ponto, Ponto, Ponto] =
    pose === 'bracos-pra-cima' ? [[268, 296], [304, 210], [308, 118]] : corre ? [[268, 296], [296 - passo * 30, 380], [304 - passo * 60, 450]] : [[268, 296], [284, 400], [280, 488]];

  const tenis = (p: Ponto, key: string) => (
    <g key={key}>
      <path d={`M ${p[0] - 34} ${p[1] + 50} L ${p[0] - 34} ${p[1] + 22} Q ${p[0] - 30} ${p[1] - 2} ${p[0] - 2} ${p[1] - 2} Q ${p[0] + 32} ${p[1]} ${p[0] + 36} ${p[1] + 50} Z`} fill={a.tenis} stroke={COR.tinta} strokeWidth={S} strokeLinejoin="round" />
      {a.faixaTenis && <path d={`M ${p[0] - 34} ${p[1] + 40} L ${p[0] + 36} ${p[1] + 40}`} stroke={a.faixaTenis} strokeWidth={8} />}
    </g>
  );
  const camiseta = 'M 128 268 Q 200 252 272 268 Q 296 300 286 360 L 278 524 L 122 524 L 114 360 Q 104 300 128 268 Z';
  const listras = a.listras ? Array.from({ length: 8 }, (_, i) => <rect key={i} x={100} y={296 + i * 38} width={200} height={16} fill={a.listras!} />) : null;

  return (
    <MolduraPersonagem escala={escala} espelhar={espelhar} altura={a.altura}>
      <g transform={`translate(0 ${pulo})`}>
        <ellipse cx={200} cy={889 - pulo} rx={110} ry={14} fill={COR.sombra} />
        {membro(pernaE[0], pernaE[1], pernaE[2], pele.base, 46, S, 'pe')}
        {membro(pernaD[0], pernaD[1], pernaD[2], pele.base, 46, S, 'pd')}
        {a.curativo && (
          <g transform={`translate(${pernaE[1][0]} ${pernaE[1][1]}) rotate(-20)`}>
            <rect x={-18} y={-8} width={36} height={16} rx={7} fill="#E9C8A6" stroke={COR.tinta} strokeWidth={S * 0.6} />
            <rect x={-6} y={-6} width={12} height={12} rx={3} fill="#D9B08C" />
          </g>
        )}
        {tenis(pernaE[2], 'te')}
        {tenis(pernaD[2], 'td')}

        <g transform={`translate(0 ${resp * 2})`}>
          {a.tipoBaixo === 'bermuda' ? (
            <path d="M 124 512 L 276 512 L 286 616 L 208 616 L 200 572 L 192 616 L 114 616 Z" fill={a.baixo} stroke={COR.tinta} strokeWidth={S} strokeLinejoin="round" />
          ) : (
            <path d="M 124 506 L 276 506 L 302 624 Q 200 640 98 624 Z" fill={a.baixo} stroke={COR.tinta} strokeWidth={S} strokeLinejoin="round" />
          )}
          {membro(bracoE[0], bracoE[1], bracoE[2], pele.base, 40, S, 'be')}
          {membro(bracoD[0], bracoD[1], bracoD[2], pele.base, 40, S, 'bd')}
          <circle cx={bracoE[2][0]} cy={bracoE[2][1]} r={22} fill={pele.base} stroke={COR.tinta} strokeWidth={S} />
          <circle cx={bracoD[2][0]} cy={bracoD[2][1]} r={22} fill={pele.base} stroke={COR.tinta} strokeWidth={S} />
          {/* camiseta, lisa ou listrada */}
          <defs>
            <clipPath id={clip}>
              <path d={camiseta} />
            </clipPath>
          </defs>
          <path d={camiseta} fill={a.topo} />
          {listras && <g clipPath={`url(#${clip})`}>{listras}</g>}
          <path d={camiseta} fill="none" stroke={COR.tinta} strokeWidth={S} strokeLinejoin="round" />
          {/* mangas curtas */}
          <path d="M 130 270 L 92 338 L 128 356 L 146 300 Z" fill={a.topo} stroke={COR.tinta} strokeWidth={S} strokeLinejoin="round" transform={pose === 'bracos-pra-cima' ? 'rotate(30 132 296)' : undefined} />
          <path d="M 270 270 L 308 338 L 272 356 L 254 300 Z" fill={a.topo} stroke={COR.tinta} strokeWidth={S} strokeLinejoin="round" transform={pose === 'bracos-pra-cima' ? 'rotate(-30 268 296)' : undefined} />
          <path d="M 176 262 Q 200 280 224 262" stroke={COR.tinta} strokeWidth={S} fill="none" strokeLinecap="round" />
        </g>

        <g transform={`translate(0 ${resp * 3}) rotate(${parada ? 0 : balanco(f, fps, 0.5, semente) * 2} 200 250)`}>
          {cabelo.atras}
          <ellipse cx={110} cy={162} rx={14} ry={20} fill={pele.base} stroke={COR.tinta} strokeWidth={S} />
          <ellipse cx={290} cy={162} rx={14} ry={20} fill={pele.base} stroke={COR.tinta} strokeWidth={S} />
          <ellipse cx={200} cy={152} rx={92} ry={96} fill={pele.base} stroke={COR.tinta} strokeWidth={S} />
          <Rosto cx={200} cy={168} k={1.9} afastamento={15} grossura={1.35} pele={pele} corSobrancelha={a.corSobrancelha} expressao={ROSTO[expressao]} falando={0} olhando={olhando} piscar={pisc} />
          {a.oculos && <Oculos cx={200} cy={168} afast={15} k={1.9} cor={a.corOculos} espessura={S * 0.9} />}
          {cabelo.frente}
        </g>
      </g>
    </MolduraPersonagem>
  );
};
