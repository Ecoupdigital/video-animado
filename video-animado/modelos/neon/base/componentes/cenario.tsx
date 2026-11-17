import React from 'react';
import { H, HORIZONTE, SEGURA, W } from './anima';
import { useNeon } from './tema';

// Cenário do modelo Neon retrô, desenhado em código a partir da tela de referência (SVG de 540 x 960, aqui em
// 1080 x 1920): céu em degradê até o horizonte (y 1120), chão escuro, sol com degradê das duas pontas cortado no
// horizonte e por 3 faixas, grade em perspectiva andando para a frente num laço sem salto, e a varredura de TV por
// cima de tudo. O topo traz o "PLAY" com o triângulo desenhado e o contador de fita, que conta o tempo do vídeo.
// Tudo pelo tempo t (segundos): nenhuma animação CSS. O cenário nunca pisca: a grade só anda, a varredura é fixa.

/** sol: centro no horizonte, raio 340 (170 na tela de referência) */
export const SOL = { cx: W / 2, cy: HORIZONTE, r: 340 } as const;
/** faixas que cortam o sol (y e altura): 8, 12 e 16 px na tela de referência, em dobro aqui */
const FAIXAS: [number, number][] = [
  [940, 16],
  [1000, 24],
  [1060, 32],
];

/** só letras, números e hífen no id de SVG (o url(#id) não aceita espaço nem vírgula) */
const idSeguro = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '-');

// ---------------------------------------------------------------- grade

/** perspectiva da grade: a linha de profundidade z fica em y = HORIZONTE + K / z */
const K = 1650;
/** uma linha nova a cada PERIODO segundos (a grade anda uma linha por período, sempre igual: o laço não tem salto) */
export const PERIODO = 0.9;
const Z_MAX = 140;
/** linhas radiais: 17 da tela de referência, do horizonte (passo de 40 px) até a borda de baixo (passo de 240 px) */
const RADIAIS = Array.from({ length: 17 }, (_, i) => i - 8);

/** As linhas horizontais no instante t: y e opacidade (some perto do horizonte, para a linha nova nascer sem saltar). */
export const linhasHorizontais = (t: number) => {
  const fase = ((t / PERIODO) % 1 + 1) % 1;
  const linhas: { y: number; alfa: number }[] = [];
  for (let k = 1; k <= Z_MAX; k++) {
    const z = k - fase;
    if (z <= 0.05) continue;
    const dy = K / z;
    const y = HORIZONTE + dy;
    if (y > H + 10) continue;
    // a linha nasce transparente no horizonte e ganha cor ao descer
    const alfa = Math.max(0, Math.min(1, (dy - 6) / 70));
    if (alfa <= 0) continue;
    linhas.push({ y, alfa });
  }
  return linhas;
};

export const Grade: React.FC<{ t: number; chave?: string }> = ({ t, chave: bruta = 'n' }) => {
  const N = useNeon();
  const chave = idSeguro(bruta);
  const linhas = linhasHorizontais(t);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <clipPath id={`${chave}-neon-chao`}>
          <rect x={0} y={HORIZONTE} width={W} height={H - HORIZONTE} />
        </clipPath>
        <linearGradient id={`${chave}-neon-grade-some`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.06" stopColor="#fff" stopOpacity={0.55} />
          <stop offset="0.25" stopColor="#fff" stopOpacity={1} />
        </linearGradient>
        <mask id={`${chave}-neon-grade-mascara`}>
          <rect x={0} y={HORIZONTE} width={W} height={H - HORIZONTE} fill={`url(#${chave}-neon-grade-some)`} />
        </mask>
      </defs>
      <g clipPath={`url(#${chave}-neon-chao)`} stroke={N.c.grade} strokeOpacity={0.7} strokeWidth={4}>
        <g mask={`url(#${chave}-neon-grade-mascara)`}>
          {RADIAIS.map((d) => (
            <line key={d} x1={W / 2 + d * 40} y1={HORIZONTE} x2={W / 2 + d * 240} y2={H} />
          ))}
        </g>
        {linhas.map((l, i) => (
          <line key={i} x1={0} x2={W} y1={l.y} y2={l.y} strokeOpacity={0.7 * l.alfa} strokeWidth={Math.min(4, 1.5 + (l.y - HORIZONTE) / 90)} />
        ))}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- céu e sol

export const CeuESol: React.FC<{ chave?: string }> = ({ chave: bruta = 'n' }) => {
  const N = useNeon();
  const chave = idSeguro(bruta);
  const { cx, cy, r } = SOL;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs>
        <linearGradient id={`${chave}-neon-ceu`} x1="0" y1="0" x2="0" y2={HORIZONTE} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={N.c.ceu} />
          <stop offset="1" stopColor={N.c.ceu2} />
        </linearGradient>
        <linearGradient id={`${chave}-neon-sol`} x1="0" y1={cy - r} x2="0" y2={cy + r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={N.c.sol1} />
          <stop offset="1" stopColor={N.c.sol2} />
        </linearGradient>
        <radialGradient id={`${chave}-neon-halo`} cx={cx} cy={cy} r={r * 1.55} gradientUnits="userSpaceOnUse">
          <stop offset="0.6" stopColor={N.c.sol2} stopOpacity={0.32} />
          <stop offset="1" stopColor={N.c.sol2} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${chave}-neon-acima`}>
          <rect x={0} y={0} width={W} height={HORIZONTE} />
        </clipPath>
        <clipPath id={`${chave}-neon-disco`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={W} height={HORIZONTE} fill={`url(#${chave}-neon-ceu)`} />
      <rect x={0} y={HORIZONTE} width={W} height={H - HORIZONTE} fill={N.c.chao} />
      <g clipPath={`url(#${chave}-neon-acima)`}>
        <circle cx={cx} cy={cy} r={r * 1.55} fill={`url(#${chave}-neon-halo)`} />
        <circle cx={cx} cy={cy} r={r} fill={`url(#${chave}-neon-sol)`} />
        <g clipPath={`url(#${chave}-neon-disco)`} fill={N.c.solFaixa}>
          {FAIXAS.map(([y, h]) => (
            <rect key={y} x={cx - r} y={y} width={2 * r} height={h} />
          ))}
        </g>
      </g>
      {/* o horizonte: uma linha fina na cor da grade */}
      <rect x={0} y={HORIZONTE - 1} width={W} height={3} fill={N.c.grade} opacity={0.85} />
    </svg>
  );
};

// ---------------------------------------------------------------- varredura e topo

/** Linhas de varredura de TV, fixas, por cima de tudo: 4 px pretos a 22% a cada 8 px (2 a cada 4 na tela de referência). */
export const Varredura: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 4px, rgba(0,0,0,0) 4px, rgba(0,0,0,0) 8px)',
    }}
  />
);

/** tempo de fita: mm:ss */
export const fita = (seg: number) => {
  const s = Math.max(0, Math.floor(seg));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const TOPO_Y = SEGURA.topo + 16;
export const TOPO_TAM = 36;

/** "PLAY" com o triângulo desenhado (nunca o glifo da fonte) e o contador de fita, dentro da área segura. */
export const Topo: React.FC<{ t: number; tempo?: number }> = ({ t, tempo }) => {
  const N = useNeon();
  const s = TOPO_TAM;
  const comum: React.CSSProperties = { position: 'absolute', top: TOPO_Y, fontFamily: N.f.mono, fontWeight: 500, fontSize: s, lineHeight: 1, color: N.c.topo, letterSpacing: '0.08em', textShadow: `0 0 8px ${N.a('topo', 0.45)}` };
  return (
    <>
      <div style={{ ...comum, left: SEGURA.lado + 10, display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={s * 0.8} height={s * 0.9} viewBox="0 0 8 9" style={{ filter: `drop-shadow(0 0 6px ${N.a('topo', 0.5)})` }}>
          <polygon points="0,0 8,4.5 0,9" fill={N.c.topo} />
        </svg>
        <span>PLAY</span>
      </div>
      <div style={{ ...comum, right: SEGURA.lado + 10, textAlign: 'right' }}>{fita(tempo ?? t)}</div>
    </>
  );
};

/** O cenário inteiro (sem o topo nem a varredura, que a montagem põe por cima das peças). */
export const Cenario: React.FC<{ t: number; chave?: string }> = ({ t, chave = 'n' }) => (
  <>
    <CeuESol chave={chave} />
    <Grade t={t} chave={chave} />
  </>
);
