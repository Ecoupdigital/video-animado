import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COR, TONS_PELE, clarear, escurecer } from './cores';
import { balanco, piscada, respiracao } from './anima';
import { Expressao, Feicoes, Olhar } from './rosto';
import { Braco, poseDe, Segurando } from './braco';
import { CelularNaMao, Papel } from './objetos';
import { BebeDesenho, ExpressaoBebe } from './Acompanhantes';
import { Aparencia, AparenciaEntrada, TipoCabelo, resolverAparencia } from './presets';

// Pessoa do modelo chapado: qualquer personagem humano sai daqui, por aparência.
// Mesmo esqueleto, rosto e braços para todo o elenco, para o universo ter um traço só.
// Corpo em 400 x 900 (pés em y 890), cabeça com centro em (200, 256).

export type PessoaPersonagemProps = {
  expressao?: Expressao;
  /** 0 a 1: volume da fala no frame (a boca abre junto). */
  falando?: number;
  olhando?: Olhar;
  /** 1 = 400 x 900 px. */
  escala?: number;
  segurando?: Segurando;
  /** Desenho do objeto quando segurando="objeto" (origem no centro da mão direita). */
  objeto?: React.ReactNode;
  expressaoBebe?: ExpressaoBebe;
  /** 0 a 1. */
  barriga?: number;
  espelhar?: boolean;
  /** Desliga respiração, piscada e balanço (para imagens paradas de referência). */
  parada?: boolean;
};

export type PessoaProps = PessoaPersonagemProps & {
  aparencia: AparenciaEntrada;
  /** Muda o ritmo da piscada e da respiração entre personagens. */
  semente?: number;
};

const INCLINACAO: Partial<Record<Expressao, number>> = {
  pensando: -6,
  feliz: 3,
  rindo: 5,
  emocionada: -3,
  cansada: 4,
  falando: 2,
};

const JALECO = '#F4F6F7';
const JALECO_SOMBRA = '#D9E0E4';
const MANGA: Record<Aparencia['manga'], number> = { curta: 0.44, longa: 0.95 };

/** Raio de cabeça para o qual cada cabelo foi desenhado; o desenho escala para o raio da pessoa. */
const RAIO_REF: Record<TipoCabelo, number> = {
  coque: 118,
  'curto-liso': 112,
  'crespo-curto': 110,
  cachos: 110,
  armado: 114,
  comprido: 112,
  careca: 112,
};

const escalaCabeca = (tipo: TipoCabelo, r: number) => {
  const k = r / RAIO_REF[tipo];
  return k === 1 ? undefined : `translate(200 256) scale(${k}) translate(-200 -256)`;
};

const arco = (n: number, de: number, ate: number, rx: number, ry: number, cy: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = Math.PI * (de + (i / (n - 1)) * (ate - de));
    return [200 + Math.cos(a) * rx, cy + Math.sin(a) * ry] as const;
  });
const CACHOS_CRESPO = arco(11, 1.08, 1.92, 104, 104, 256);
const NUVEM_CACHOS = arco(14, 0.92, 2.08, 128, 120, 236);

/** Parte do cabelo que fica atrás do tronco (só o comprido desce até os ombros). */
const CabeloCostas: React.FC<{ a: Aparencia }> = ({ a }) =>
  a.cabelo === 'comprido' ? (
    <g transform={escalaCabeca('comprido', a.raioCabeca)}>
      <path d="M 84 250 C 76 150 138 116 200 116 C 262 116 324 150 316 250 L 322 468 Q 200 490 78 468 Z" fill={a.corCabelo} />
    </g>
  ) : null;

/** Cabelo atrás da cabeça (antes das orelhas e do rosto). */
const CabeloAtras: React.FC<{ a: Aparencia; coque: number }> = ({ a, coque }) => {
  const c = a.corCabelo;
  switch (a.cabelo) {
    case 'coque':
      return (
        <g transform={escalaCabeca('coque', a.raioCabeca)}>
          <g transform={`rotate(${coque} 200 165)`}>
            <circle cx={200} cy={110} r={58} fill={c} />
            {/* pontas do coque: curtas e coladas, sem virar antena */}
            <path d="M 166 72 q -11 -3 -12 -15 q 5 6 13 6" fill={c} />
            <path d="M 236 71 q 11 -2 13 -14 q -6 6 -13 5" fill={c} />
            <path d="M 252 128 q 22 10 20 40" stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" />
            <path d="M 176 96 q 22 -16 46 -4" stroke={clarear(c, 0.13)} strokeWidth={5} fill="none" strokeLinecap="round" />
            <ellipse cx={200} cy={160} rx={36} ry={11} fill={a.prendedor} />
          </g>
        </g>
      );
    case 'curto-liso':
      return (
        <g transform={escalaCabeca('curto-liso', a.raioCabeca)}>
          <path d="M 84 268 C 76 150 140 120 200 120 C 260 120 324 150 316 268 Z" fill={c} />
        </g>
      );
    case 'cachos':
      return (
        <g transform={escalaCabeca('cachos', a.raioCabeca)} fill={c}>
          <circle cx={200} cy={200} r={128} />
          {NUVEM_CACHOS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={44} />
          ))}
        </g>
      );
    case 'armado':
      return (
        <g transform={escalaCabeca('armado', a.raioCabeca)} fill={c}>
          <circle cx={200} cy={176} r={104} />
          <circle cx={112} cy={222} r={58} />
          <circle cx={288} cy={222} r={58} />
          <circle cx={104} cy={278} r={36} />
          <circle cx={296} cy={278} r={36} />
        </g>
      );
    default:
      return null;
  }
};

/** Cabelo na frente da cabeça (franja, contorno), depois do rosto e da barba. */
const CabeloFrente: React.FC<{ a: Aparencia }> = ({ a }) => {
  const c = a.corCabelo;
  switch (a.cabelo) {
    case 'coque':
      return (
        <g transform={escalaCabeca('coque', a.raioCabeca)} fill={c}>
          {/* franja repartida de lado */}
          <path d="M 82 262 C 74 168 140 134 200 134 C 262 134 328 168 318 262 C 312 214 290 188 244 176 C 214 196 168 200 140 194 C 112 206 90 230 82 262 Z" />
          <path d="M 156 188 Q 116 198 108 252 Q 128 214 176 196 Z" />
          {/* fios soltos colados no rosto */}
          <path d="M 100 214 q -18 40 -4 86" stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 302 214 q 16 44 2 84" stroke={c} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'curto-liso':
      return (
        <g transform={escalaCabeca('curto-liso', a.raioCabeca)} fill={c}>
          <path d="M 88 254 C 82 168 140 140 200 140 C 262 140 320 170 312 254 C 306 214 288 192 256 182 C 226 206 168 208 126 196 C 104 212 92 230 88 254 Z" />
          <path d="M 126 196 Q 104 214 100 250 Q 112 218 146 202 Z" />
          <path d="M 200 152 Q 240 156 262 176" stroke={clarear(c, 0.14)} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'crespo-curto':
      return (
        <g transform={escalaCabeca('crespo-curto', a.raioCabeca)} fill={c}>
          <path d="M 92 238 C 86 152 150 130 200 130 C 250 130 314 152 308 238 C 300 196 276 178 200 176 C 124 178 100 196 92 238 Z" />
          {CACHOS_CRESPO.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={17} />
          ))}
        </g>
      );
    case 'cachos':
      return (
        <g transform={escalaCabeca('cachos', a.raioCabeca)} fill={c}>
          <circle cx={140} cy={168} r={34} />
          <circle cx={186} cy={150} r={36} />
          <circle cx={236} cy={152} r={34} />
          <circle cx={274} cy={180} r={28} />
          <circle cx={110} cy={206} r={22} />
        </g>
      );
    case 'armado':
      return (
        <g transform={escalaCabeca('armado', a.raioCabeca)}>
          <circle cx={146} cy={168} r={44} fill={c} />
          <circle cx={200} cy={154} r={48} fill={c} />
          <circle cx={254} cy={168} r={44} fill={c} />
          <path d="M 130 150 q 18 -14 36 -4 M 190 134 q 18 -12 34 0 M 240 152 q 18 -12 34 0" stroke={escurecer(c, 0.12)} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'comprido':
      return (
        <g transform={escalaCabeca('comprido', a.raioCabeca)} fill={c}>
          {/* risca no meio */}
          <path d="M 86 262 C 80 168 138 134 200 134 C 262 134 320 168 314 262 C 306 214 268 184 206 178 L 200 166 L 194 178 C 132 184 94 214 86 262 Z" />
          {/* mechas da frente, coladas no rosto até o ombro */}
          <path d="M 86 250 Q 80 312 92 374 L 120 368 Q 104 312 110 236 Z" />
          <path d="M 314 250 Q 320 312 308 374 L 280 368 Q 296 312 290 236 Z" />
        </g>
      );
    case 'careca':
      return <ellipse cx={164} cy={176} rx={30} ry={13} fill={COR.branco} opacity={0.16} transform={`rotate(-30 164 176)`} />;
    default:
      return null;
  }
};

const Barba: React.FC<{ a: Aparencia }> = ({ a }) => {
  const k = a.raioCabeca / 110;
  return (
    <g transform={k === 1 ? undefined : `translate(200 256) scale(${k}) translate(-200 -256)`} fill={a.corCabelo}>
      <path d="M 306 284 A 110 110 0 0 1 94 284 C 108 336 150 350 200 350 C 250 350 292 336 306 284 Z" />
      <path d="M 172 318 Q 200 304 228 318 L 222 324 Q 200 314 178 324 Z" />
    </g>
  );
};

const Oculos: React.FC<{ a: Aparencia }> = ({ a }) => {
  const r = a.raioCabeca;
  const ex = 0.38 * r;
  const ey = 256 + 0.12 * r;
  const ro = (0.17 * a.tamanhoOlho + 0.06) * r;
  const sw = 0.04 * r;
  return (
    <g stroke={a.corOculos} strokeWidth={sw} fill="none" strokeLinecap="round">
      <circle cx={200 - ex} cy={ey} r={ro} fill={COR.branco} fillOpacity={0.14} />
      <circle cx={200 + ex} cy={ey} r={ro} fill={COR.branco} fillOpacity={0.14} />
      <path d={`M ${200 - ex + ro} ${ey - ro * 0.15} Q 200 ${ey - ro * 0.45} ${200 + ex - ro} ${ey - ro * 0.15}`} />
      <path d={`M ${200 - ex - ro} ${ey - ro * 0.2} L ${200 - r + 4} ${ey - ro * 0.35}`} />
      <path d={`M ${200 + ex + ro} ${ey - ro * 0.2} L ${200 + r - 4} ${ey - ro * 0.35}`} />
    </g>
  );
};

export const PessoaDesenho: React.FC<PessoaProps & { frame: number; fps: number }> = ({
  aparencia,
  semente = 0,
  expressao = 'neutra',
  falando = 0,
  olhando,
  segurando = 'nada',
  objeto,
  expressaoBebe = 'dormindo',
  barriga = 0,
  parada = false,
  frame,
  fps,
}) => {
  const a = resolverAparencia(aparencia);
  const pele = TONS_PELE[a.pele];
  const b = Math.max(0, Math.min(1, barriga));
  const f = parada ? 0 : frame;
  const resp = parada ? 0 : respiracao(f, fps, semente);
  const pisc = parada ? 1 : piscada(f, semente);
  const t = f / fps;
  const incl = (INCLINACAO[expressao] ?? 0) + (parada ? 0 : balanco(f, fps, 0.35, semente) * 1.2);
  const coque = parada ? 0 : balanco(f, fps, 1.1, 0.8 + semente) * 3 + incl * 0.5;
  const pose = poseDe(expressao, segurando, b, t);
  const L = a.largura;
  const r = a.raioCabeca;
  const olhar: Olhar | undefined = segurando === 'celular' && !olhando ? 'baixo' : olhando;
  const maoNoRosto = segurando === 'nada' && (expressao === 'pensando' || expressao === 'ansiosa');
  const naFrente = segurando !== 'nada' || expressao === 'emocionada' || expressao === 'rindo' || b > 0.45;
  const corManga = a.jaleco ? JALECO : a.topo;
  const tamManga = a.jaleco ? 1.6 : MANGA[a.manga];
  const jardineira = a.tipoBaixo === 'jardineira';
  const jeansSombra = escurecer(a.baixo, 0.2);
  const jeansLuz = clarear(a.baixo, 0.25);
  const cabecaT = `translate(0 ${resp * 2.2 + (expressao === 'cansada' ? 8 : 0)}) rotate(${incl} 200 390)`;

  // Tronco muito largo esconde o braço em repouso: afasta cotovelo e mão para fora, na proporção
  // da distância do centro (mão perto do peito ou no rosto fica onde está).
  const folga = Math.max(0, L - 12) * 0.9;
  const afastar = (x: number, lado: 'esq' | 'dir', mao: boolean) => {
    if (folga === 0 || (mao && maoNoRosto)) return x;
    const k = Math.max(0, Math.min(1, (Math.abs(x - 200) - 30) / 40));
    return x + (lado === 'esq' ? -1 : 1) * folga * k;
  };
  const braco = (lado: 'esq' | 'dir') => (
    <Braco
      ombro={lado === 'esq' ? [146 - L * 0.6, 420] : [254 + L * 0.6, 420]}
      cotovelo={[afastar(pose[lado].cotovelo[0], lado, false), pose[lado].cotovelo[1]]}
      mao={[afastar(pose[lado].mao[0], lado, true), pose[lado].mao[1]]}
      apontar={pose[lado].apontar}
      pele={pele.base}
      manga={corManga}
      comprimentoManga={tamManga}
      contornoMao={pele.sombra}
    />
  );

  const rx = 64 + b * 46;
  const ry = 50 + b * 44;
  const by = 612 - b * 6;
  const corBarriga = jardineira ? a.baixo : a.topo;
  const sombraBarriga = jardineira ? jeansSombra : escurecer(a.topo, 0.15);
  const luzBarriga = jardineira ? jeansLuz : clarear(a.topo, 0.25);

  return (
    <g>
      <ellipse cx={200} cy={890} rx={120 + L} ry={13} fill={COR.sombra} />
      {a.acessorio === 'mochila' && <rect x={118 - L} y={430} width={164 + 2 * L} height={220} rx={36} fill={COR.apoio} />}
      <g transform={cabecaT}>
        <CabeloCostas a={a} />
      </g>

      {/* pernas */}
      {a.tipoBaixo === 'saia' ? (
        <>
          <rect x={160} y={700} width={34} height={162} rx={16} fill={pele.base} />
          <rect x={206} y={700} width={34} height={162} rx={16} fill={pele.base} />
        </>
      ) : (
        <>
          <rect x={150 - L * 0.3} y={680} width={46 + L * 0.3} height={182} rx={20} fill={a.baixo} />
          <rect x={204} y={680} width={46 + L * 0.3} height={182} rx={20} fill={a.baixo} />
          {jardineira && (
            <>
              <rect x={148 - L * 0.3} y={832} width={50 + L * 0.3} height={20} rx={8} fill={jeansLuz} />
              <rect x={202} y={832} width={50 + L * 0.3} height={20} rx={8} fill={jeansLuz} />
            </>
          )}
        </>
      )}
      {/* sapatos */}
      <path d="M 130 884 Q 126 852 160 850 L 190 850 Q 202 852 200 884 Z" fill={a.sapato} />
      <path d="M 270 884 Q 274 852 240 850 L 210 850 Q 198 852 200 884 Z" fill={a.sapato} />
      {a.faixaSapato && (
        <>
          <path d="M 140 866 L 186 862" stroke={a.faixaSapato} strokeWidth={5} strokeLinecap="round" />
          <path d="M 260 866 L 214 862" stroke={a.faixaSapato} strokeWidth={5} strokeLinecap="round" />
        </>
      )}
      <rect x={126} y={877} width={76} height={11} rx={5} fill={a.sola} />
      <rect x={198} y={877} width={76} height={11} rx={5} fill={a.sola} />

      <g transform={`translate(0 ${resp * 1.2})`}>
        {!naFrente && !maoNoRosto && braco('esq')}
        {!naFrente && !maoNoRosto && braco('dir')}
        {/* tronco */}
        <path
          d={`M ${146 - L} 412 Q 200 ${396 - L * 0.2} ${254 + L} 412 Q ${270 + L} 470 ${262 + L} 640 L ${138 - L} 640 Q ${130 - L} 470 ${146 - L} 412 Z`}
          fill={a.topo}
        />
        <path d="M 178 404 Q 200 424 222 404" stroke={a.gola} strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* parte de baixo */}
        {a.tipoBaixo === 'calca' && (
          <path d={`M ${138 - L} 628 L ${262 + L} 628 Q ${268 + L} 660 ${262 + L} 712 L ${138 - L} 712 Q ${132 - L} 660 ${138 - L} 628 Z`} fill={a.baixo} />
        )}
        {a.tipoBaixo === 'saia' && <path d={`M ${138 - L} 628 L ${262 + L} 628 L ${290 + L} 760 Q 200 776 ${110 - L} 760 Z`} fill={a.baixo} />}
        {jardineira && <path d={`M ${138 - L} 598 L ${262 + L} 598 Q ${268 + L} 650 ${262 + L} 712 L ${138 - L} 712 Q ${132 - L} 650 ${138 - L} 598 Z`} fill={a.baixo} />}
        {!jardineira && <rect x={138 - L} y={622} width={124 + 2 * L} height={12} rx={6} fill={a.baixoLuz} />}
        {/* barriga */}
        {b > 0 && (
          <g>
            <ellipse cx={200} cy={by} rx={rx} ry={ry} fill={corBarriga} />
            <path
              d={`M ${200 + rx * 0.55} ${by + ry * 0.78} A ${rx} ${ry} 0 0 0 ${200 + rx * 0.98} ${by + ry * 0.15}`}
              stroke={sombraBarriga}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx={200 - rx * 0.38} cy={by - ry * 0.35} rx={14 + b * 10} ry={9 + b * 6} fill={luzBarriga} opacity={0.7} />
          </g>
        )}
        {/* peitilho e alças da jardineira */}
        {jardineira && (
          <>
            <rect x={166} y={500} width={68} height={110} rx={10} fill={a.baixo} />
            <path d="M 172 508 L 158 418" stroke={a.baixo} strokeWidth={15} strokeLinecap="round" />
            <path d="M 228 508 L 242 418" stroke={a.baixo} strokeWidth={15} strokeLinecap="round" />
            <rect x={184} y={520} width={32} height={26} rx={5} fill={jeansSombra} opacity={0.5} />
            <circle cx={174} cy={512} r={6} fill={COR.detalhe} />
            <circle cx={226} cy={512} r={6} fill={COR.detalhe} />
          </>
        )}
        {/* jaleco aberto por cima */}
        {a.jaleco && (
          <>
            <path d={`M ${146 - L} 412 Q 166 402 184 406 L 192 704 L ${132 - L} 704 Q ${126 - L} 520 ${146 - L} 412 Z`} fill={JALECO} />
            <path d={`M ${254 + L} 412 Q 234 402 216 406 L 208 704 L ${268 + L} 704 Q ${274 + L} 520 ${254 + L} 412 Z`} fill={JALECO} />
            <path d="M 184 406 L 168 474 L 190 456 Z" fill={JALECO_SOMBRA} />
            <path d="M 216 406 L 232 474 L 210 456 Z" fill={JALECO_SOMBRA} />
            <rect x={150 - L * 0.5} y={560} width={30} height={6} rx={3} fill={JALECO_SOMBRA} />
            <rect x={222 + L * 0.5} y={500} width={24} height={6} rx={3} fill={JALECO_SOMBRA} />
          </>
        )}
        {a.acessorio === 'perolas' &&
          Array.from({ length: 9 }, (_, i) => {
            const k = i / 8;
            return <circle key={i} cx={168 + k * 64} cy={414 + Math.sin(k * Math.PI) * 26} r={7} fill={COR.branco} stroke="#E5DDD3" strokeWidth={2} />;
          })}
        {a.acessorio === 'mochila' && (
          <g>
            <path d="M 162 414 L 168 566" stroke={COR.apoioEscuro} strokeWidth={16} strokeLinecap="round" />
            <path d="M 238 414 L 232 566" stroke={COR.apoioEscuro} strokeWidth={16} strokeLinecap="round" />
            <rect x={158} y={500} width={20} height={14} rx={4} fill={COR.detalhe} />
            <rect x={222} y={500} width={20} height={14} rx={4} fill={COR.detalhe} />
          </g>
        )}
        {/* pescoço */}
        <rect x={184} y={360} width={32} height={48} rx={12} fill={pele.sombra} />
        {segurando === 'bebe' && (
          <g transform="translate(118 455) scale(0.95)">
            <BebeDesenho expressao={expressaoBebe} frame={f} fps={fps} parada={parada} />
          </g>
        )}
        {naFrente && !maoNoRosto && braco('esq')}
        {naFrente && !maoNoRosto && braco('dir')}
        {segurando === 'celular' && <CelularNaMao x={200} y={478} />}
        {segurando === 'objeto' && <g transform="translate(292 410)">{objeto ?? <Papel x={8} y={-40} escala={0.9} />}</g>}
      </g>

      {/* cabeça */}
      <g transform={cabecaT}>
        <CabeloAtras a={a} coque={coque} />
        {a.cabelo !== 'comprido' && (
          <>
            <circle cx={200 - r - 2} cy={268} r={0.17 * r} fill={pele.sombra} />
            <circle cx={200 + r + 2} cy={268} r={0.17 * r} fill={pele.sombra} />
          </>
        )}
        <circle cx={200} cy={256} r={r} fill={pele.base} />
        {a.barba && <Barba a={a} />}
        <CabeloFrente a={a} />
        <Feicoes
          cx={200}
          cy={256}
          r={r}
          pele={pele}
          corSobrancelha={a.corSobrancelha}
          expressao={expressao}
          falando={falando}
          olhando={olhar}
          piscar={pisc}
          sardas={a.sardas}
          rugas={a.rugas}
          cilios={a.cilios}
          tamanhoOlho={a.tamanhoOlho}
        />
        {a.oculos && <Oculos a={a} />}
      </g>
      {/* mão no rosto: braços por cima da cabeça, com contorno no tom de sombra da pele */}
      {maoNoRosto && (
        <g transform={`translate(0 ${resp * 1.2})`}>
          {braco('esq')}
          {braco('dir')}
        </g>
      )}
    </g>
  );
};

/** Moldura SVG comum: escala, espelho e altura relativa (1 = altura padrão). */
export const MolduraPersonagem: React.FC<{
  escala: number;
  espelhar: boolean;
  altura?: number;
  children: React.ReactNode;
}> = ({ escala, espelhar, altura = 1, children }) => (
  <svg width={400 * escala} height={900 * escala} viewBox="0 0 400 900" style={{ overflow: 'visible' }}>
    <g transform={espelhar ? 'translate(400 0) scale(-1 1)' : undefined}>
      <g transform={`translate(${200 * (1 - altura)} ${900 * (1 - altura)}) scale(${altura})`}>{children}</g>
    </g>
  </svg>
);

export const Pessoa: React.FC<PessoaProps> = ({ escala = 1, espelhar = false, ...rest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const altura = resolverAparencia(rest.aparencia).altura;
  return (
    <MolduraPersonagem escala={escala} espelhar={espelhar} altura={altura}>
      <PessoaDesenho {...rest} frame={frame} fps={fps} />
    </MolduraPersonagem>
  );
};
