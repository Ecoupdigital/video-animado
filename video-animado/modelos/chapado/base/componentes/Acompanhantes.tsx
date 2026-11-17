import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import OPCOES from './opcoes.json';
import { COR, TONS_PELE, TomPele, clarear, escurecer, luminancia } from './cores';
import { balanco, piscada, respiracao } from './anima';
import { FONTE_TITULO } from './fontes';

// Acompanhantes do modelo, sem nome fixo: cachorro (cor configurável) e bebê.
// Os dois não falam, só reagem.

// ------------------------------------------------------------------ cachorro

export type ExpressaoCachorro = 'neutra' | 'curioso' | 'feliz' | 'triste' | 'assustado';
export const EXPRESSOES_CACHORRO: ExpressaoCachorro[] = ['neutra', 'curioso', 'feliz', 'triste', 'assustado'];

type Pelagem = { base: string; claro: string; orelha: string; risco: string };
export const CORES_CACHORRO = OPCOES.cores_cachorro as Record<string, Pelagem>;

/** Cor por nome (caramelo, preto, branco, cinza, chocolate) ou hex (tons derivados). */
export const pelagemDe = (cor: string): Pelagem =>
  CORES_CACHORRO[cor] ?? { base: cor, claro: clarear(cor, 0.6), orelha: escurecer(cor, 0.22), risco: escurecer(cor, 0.38) };

export type CachorroProps = {
  cor?: string;
  expressao?: ExpressaoCachorro;
  /** 1 = 300 x 300 px. */
  escala?: number;
  espelhar?: boolean;
  /** Desliga respiração, piscada e rabo (para imagens paradas). */
  parada?: boolean;
};

export const CachorroDesenho: React.FC<CachorroProps & { frame: number; fps: number }> = ({ cor = 'caramelo', expressao = 'neutra', frame, fps, parada = false }) => {
  const p = pelagemDe(cor);
  const escuro = luminancia(p.base) < 0.35;
  const f = parada ? 0 : frame;
  const resp = parada ? 0 : respiracao(f, fps, 2);
  const pisc = parada ? 1 : piscada(f, 5);
  const velRabo = expressao === 'feliz' ? 5 : expressao === 'triste' ? 0.4 : 1.4;
  const rabo = parada ? 0 : balanco(f, fps, velRabo) * (expressao === 'triste' ? 4 : 16);
  const tilt = expressao === 'curioso' ? -14 : 0;
  const orelha = { neutra: 0, curioso: -6, feliz: -4, triste: -6, assustado: -30 }[expressao];
  const caida = expressao === 'triste' ? 16 : 0; // orelhas descem e ficam mais compridas
  const olhoK = expressao === 'assustado' ? 1.3 : 1;
  return (
    <g>
      <ellipse cx={150} cy={292} rx={92} ry={9} fill={COR.sombra} />
      {/* rabo */}
      <g transform={`rotate(${rabo} 214 262)`}>
        <path d="M 214 262 C 262 260 272 216 258 192" stroke={p.base} strokeWidth={18} fill="none" strokeLinecap="round" />
      </g>
      <g transform={`translate(0 ${resp * 1.2})`}>
        {/* corpo sentado */}
        <path d="M 96 286 C 84 214 112 156 150 156 C 188 156 216 214 204 286 Z" fill={p.base} />
        <ellipse cx={200} cy={270} rx={34} ry={22} fill={p.base} />
        <path d="M 126 286 C 122 230 136 196 150 196 C 164 196 178 230 174 286 Z" fill={p.claro} />
        <rect x={120} y={236} width={22} height={54} rx={11} fill={p.base} />
        <rect x={158} y={236} width={22} height={54} rx={11} fill={p.base} />
        <ellipse cx={131} cy={288} rx={15} ry={7} fill={p.claro} />
        <ellipse cx={169} cy={288} rx={15} ry={7} fill={p.claro} />
      </g>
      {/* cabeça */}
      <g transform={`translate(0 ${resp * 2}) rotate(${tilt} 150 150)`}>
        <g transform={`translate(${-caida * 0.3} ${caida}) rotate(${-orelha} 104 92)`}>
          <path d="M 108 78 C 84 76 70 104 76 140 C 92 136 104 116 112 96 Z" fill={p.orelha} />
        </g>
        <g transform={`translate(${caida * 0.3} ${caida}) rotate(${orelha} 196 92)`}>
          <path d="M 192 78 C 216 76 230 104 224 140 C 208 136 196 116 188 96 Z" fill={p.orelha} />
        </g>
        <ellipse cx={150} cy={112} rx={58} ry={54} fill={p.base} />
        <ellipse cx={150} cy={138} rx={32} ry={24} fill={p.claro} />
        <ellipse cx={150} cy={124} rx={11} ry={8} fill={COR.texto} />
        {/* pelagem escura: um anel claro em volta do olho para o olho não sumir */}
        {escuro && (
          <>
            <ellipse cx={126} cy={104} rx={11 * olhoK} ry={12.5 * olhoK} fill={p.claro} />
            <ellipse cx={174} cy={104} rx={11 * olhoK} ry={12.5 * olhoK} fill={p.claro} />
          </>
        )}
        <g transform={`translate(0 104) scale(1 ${pisc}) translate(0 -104)`}>
          <ellipse cx={126} cy={104} rx={7 * olhoK} ry={8.5 * olhoK} fill={COR.texto} />
          <ellipse cx={174} cy={104} rx={7 * olhoK} ry={8.5 * olhoK} fill={COR.texto} />
          <circle cx={128.5} cy={100.5} r={2.6} fill={COR.branco} />
          <circle cx={176.5} cy={100.5} r={2.6} fill={COR.branco} />
        </g>
        {expressao === 'triste' && (
          <>
            <path d="M 114 90 l 18 -7" stroke={escuro ? p.claro : p.risco} strokeWidth={4} strokeLinecap="round" />
            <path d="M 186 90 l -18 -7" stroke={escuro ? p.claro : p.risco} strokeWidth={4} strokeLinecap="round" />
          </>
        )}
        {expressao === 'feliz' ? (
          <>
            <path d="M 136 140 Q 150 160 164 140 Z" fill={COR.boca} />
            <path d="M 144 146 q 6 18 12 0 Z" fill={COR.lingua} />
          </>
        ) : expressao === 'assustado' ? (
          <ellipse cx={150} cy={148} rx={7} ry={8} fill={COR.boca} />
        ) : expressao === 'triste' ? (
          <path d="M 140 146 q 10 -8 20 0" stroke={COR.linhaBoca} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 138 140 q 6 8 12 0 q 6 8 12 0" stroke={COR.linhaBoca} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        )}
      </g>
    </g>
  );
};

export const Cachorro: React.FC<CachorroProps> = ({ escala = 1, espelhar = false, ...rest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <svg width={300 * escala} height={300 * escala} viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
      <g transform={espelhar ? 'translate(300 0) scale(-1 1)' : undefined}>
        <CachorroDesenho {...rest} frame={frame} fps={fps} />
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ bebê

export type ExpressaoBebe = 'dormindo' | 'acordado' | 'chorando' | 'rindo';
export const EXPRESSOES_BEBE: ExpressaoBebe[] = ['dormindo', 'acordado', 'chorando', 'rindo'];

export type BebeProps = {
  expressao?: ExpressaoBebe;
  pele?: TomPele;
  /** Cor do cachinho de cabelo. */
  corCabelo?: string;
  /** 1 = 200 x 170 px. */
  escala?: number;
  espelhar?: boolean;
  parada?: boolean;
};

/** Desenho em coordenadas 0..200 x 0..170 (como grupo SVG). Manta nas cores de fundo e apoio da paleta. */
export const BebeDesenho: React.FC<BebeProps & { frame: number; fps: number }> = ({ expressao = 'dormindo', pele: tom = 'p5', corCabelo = '#3B2418', frame, fps, parada = false }) => {
  const pele = TONS_PELE[tom];
  const f = parada ? 0 : frame;
  const resp = parada ? 0 : respiracao(f, fps, 1.7);
  const pisc = parada ? 1 : piscada(f, 4);
  const choro = expressao === 'chorando' ? Math.abs(Math.sin(f / 4)) : 0;
  const hx = 62;
  const hy = 62;
  const r = 44;
  return (
    <g transform={`translate(0 ${resp * 1.2})`}>
      {/* manta */}
      <path d="M 40 70 C 30 120 70 160 120 158 C 175 156 196 118 186 88 C 176 56 130 40 96 44 C 70 46 46 52 40 70 Z" fill={COR.fundo} />
      <path d="M 100 46 C 130 70 160 110 170 140" stroke={COR.apoio2} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M 40 70 C 30 120 70 160 120 158 C 175 156 196 118 186 88" stroke={COR.fundo3} strokeWidth={3} fill="none" />
      {/* cabeça */}
      <circle cx={hx} cy={hy} r={r} fill={pele.base} />
      <circle cx={hx - r + 4} cy={hy + 4} r={8} fill={pele.base} />
      {/* cachinho curto e colado na cabeça */}
      <path d={`M ${hx - 6} ${hy - r + 2} q 6 -14 16 -4 q -8 -2 -10 6`} stroke={corCabelo} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* capuz da manta */}
      <path d={`M ${hx + r - 6} ${hy - 30} C ${hx + r + 20} ${hy} ${hx + r + 6} ${hy + 40} ${hx + 20} ${hy + r}`} stroke={COR.fundo} strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* rosto */}
      <ellipse cx={hx - 22} cy={hy + 18} rx={8} ry={5} fill={COR.rubor} opacity={0.3} />
      <ellipse cx={hx + 22} cy={hy + 18} rx={8} ry={5} fill={COR.rubor} opacity={0.3} />
      {expressao === 'dormindo' || expressao === 'rindo' ? (
        <>
          <path d={`M ${hx - 22} ${hy + 4} q 7 ${expressao === 'rindo' ? -8 : 6} 14 0`} stroke={COR.texto} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path d={`M ${hx + 8} ${hy + 4} q 7 ${expressao === 'rindo' ? -8 : 6} 14 0`} stroke={COR.texto} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </>
      ) : expressao === 'chorando' ? (
        <>
          <path d={`M ${hx - 22} ${hy + 2} l 14 4`} stroke={COR.texto} strokeWidth={4} strokeLinecap="round" />
          <path d={`M ${hx + 22} ${hy + 2} l -14 4`} stroke={COR.texto} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : (
        <g transform={`translate(0 ${hy + 4}) scale(1 ${pisc}) translate(0 ${-(hy + 4)})`}>
          <ellipse cx={hx - 15} cy={hy + 4} rx={5.5} ry={6.5} fill={COR.texto} />
          <ellipse cx={hx + 15} cy={hy + 4} rx={5.5} ry={6.5} fill={COR.texto} />
          <circle cx={hx - 13} cy={hy + 1.5} r={2} fill={COR.branco} />
          <circle cx={hx + 17} cy={hy + 1.5} r={2} fill={COR.branco} />
        </g>
      )}
      {/* boca */}
      {expressao === 'chorando' ? (
        <ellipse cx={hx} cy={hy + 26} rx={9} ry={6 + choro * 5} fill={COR.boca} />
      ) : expressao === 'rindo' ? (
        <path d={`M ${hx - 10} ${hy + 22} Q ${hx} ${hy + 22} ${hx + 10} ${hy + 22} C ${hx + 10} ${hy + 36} ${hx - 10} ${hy + 36} ${hx - 10} ${hy + 22} Z`} fill={COR.boca} />
      ) : (
        <path d={`M ${hx - 5} ${hy + 24} q 5 ${expressao === 'dormindo' ? 2 : 5} 10 0`} stroke={COR.linhaBoca} strokeWidth={3} fill="none" strokeLinecap="round" />
      )}
      {expressao === 'chorando' && (
        <>
          <path d={`M ${hx - 18} ${hy + 10} q -4 8 0 12 q 4 -4 0 -12 Z`} fill={COR.agua} />
          <path d={`M ${hx + 18} ${hy + 10} q -4 8 0 12 q 4 -4 0 -12 Z`} fill={COR.agua} />
        </>
      )}
      {expressao === 'dormindo' && (
        <text x={hx + 50} y={hy - 30 + resp * 3} fontFamily={FONTE_TITULO} fontWeight={700} fontSize={22} fill={COR.textoSuave}>
          z
        </text>
      )}
    </g>
  );
};

export const Bebe: React.FC<BebeProps> = ({ escala = 1, espelhar = false, ...rest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <svg width={200 * escala} height={170 * escala} viewBox="0 0 200 170" style={{ overflow: 'visible' }}>
      <g transform={espelhar ? 'translate(200 0) scale(-1 1)' : undefined}>
        <BebeDesenho {...rest} frame={frame} fps={fps} />
      </g>
    </svg>
  );
};
