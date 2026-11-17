import React from 'react';
import { largura, quebrar, ramp, SEGURA, W } from './anima';
import { misturar, useNeon } from './tema';

// Letreiro neon do modelo Neon retrô: 1 ou 2 linhas em Inter 900 inclinada em código (o kit não tem itálica). Com 2
// linhas, a de cima sai em contorno e a de baixo cheia, como a tela de referência; com 1, cheia. Cada linha tem o
// núcleo claro e o brilho na cor do papel (contorno ou cheio). Linha longa quebra (até 3 linhas cada) e o letreiro
// inteiro encolhe para caber entre o topo e o sol, dentro da área segura, com o brilho dentro dela.
//
// A piscada é acessível (a regra da fase 13, conferida no vídeo por _ferramentas/conferir_piscada.py):
//   - o letreiro acende com um tremido: 2 quadros fracos, aceso, 2 quadros de queda e aceso de vez (uma queda);
//   - pisca de leve a cada 3 s (duas quedas em 0,23 s, como a tela de referência), nunca no primeiro 1,4 s depois de
//     acender nem no último 1 s antes de trocar: com as trocas a 1 s ou mais uma da outra, nunca passa de 3 quedas
//     por segundo;
//   - o brilho nunca vai a zero numa piscada (fica em 30% a 50%); só apaga de vez quando o letreiro troca;
//   - só o letreiro pisca (área pequena da tela); "piscada": false no roteiro desliga (acende sem tremido).

export type Linhas = string[];
/** caixa do letreiro na tela: entre o topo (PLAY e contador) e o sol */
export const ZONA_LETREIRO = { topo: 316, baixo: 760, centro: 470 } as const;
/** brilho cabe dentro da área segura: o texto fica a esta distância das laterais dela */
const FOLGA_BRILHO = 34;
const LARGURA = W - 2 * SEGURA.lado - 2 * FOLGA_BRILHO;
/** inclinação do letreiro (graus) e quanto ela empurra a letra para o lado */
const INCLINA = -10;
const TAN = Math.tan((Math.abs(INCLINA) * Math.PI) / 180);
/** tamanhos da tela de referência (58 e 62 em 540 de largura): linha de cima e linha de baixo */
const BASE = { duas: [116, 124], uma: [132] } as const;
const MINIMO = 56;
const ESPACO = 0.01;

export type MedidaLetreiro = { linhas: { texto: string; s: number; contorno: boolean; y: number }[]; topo: number; baixo: number; escala: number };

export const caixaAlta = (s: string) => s.toLocaleUpperCase('pt-BR');

/** Mede o letreiro: cada linha quebra em até 3, todas encolhem juntas até caber na zona dele. */
export const medirLetreiro = (linhas: Linhas): MedidaLetreiro => {
  const ls = linhas.slice(0, 2).map(caixaAlta);
  const bases = ls.length === 2 ? BASE.duas : BASE.uma;
  const altMax = ZONA_LETREIRO.baixo - ZONA_LETREIRO.topo;
  let escolha: MedidaLetreiro | null = null;
  for (let k = 1; k >= 0.3; k -= 0.01) {
    const partes = ls.map((l, i) => {
      const s = Math.max(MINIMO, Math.round(bases[i] * k));
      const max = LARGURA - s * 0.9 * TAN;
      return { s, rows: quebrar(l, s, max, 900, ESPACO), max };
    });
    const cabe = partes.every((p) => p.rows.length <= 3 && p.rows.every((r) => largura(r, p.s, 900, ESPACO) <= p.max));
    const alt = partes.reduce((a, p) => a + p.rows.length * p.s * 1.08, 0) + (partes.length - 1) * 18;
    if ((cabe && alt <= altMax) || partes.every((p) => p.s === MINIMO)) {
      let y = Math.max(ZONA_LETREIRO.topo, Math.min(ZONA_LETREIRO.baixo - alt, ZONA_LETREIRO.centro - alt / 2));
      const topo = y;
      const linhasOut: MedidaLetreiro['linhas'] = [];
      partes.forEach((p, i) => {
        for (const r of p.rows) {
          linhasOut.push({ texto: r, s: p.s, contorno: ls.length === 2 && i === 0, y });
          y += p.s * 1.08;
        }
        y += 18;
      });
      escolha = { linhas: linhasOut, topo, baixo: y - 18, escala: k };
      break;
    }
  }
  return escolha!;
};

// ---------------------------------------------------------------- piscada

/** primeira piscada periódica (s depois de acender) e o intervalo entre elas */
export const PISCA = { primeira: 1.4, cada: 3 } as const;
/** A piscada periódica em que "u" (s depois de acender) cai, ou null: só as que terminam 1 s antes de o letreiro trocar. */
export const piscadaEm = (u: number, dura: number) => {
  if (u < PISCA.primeira) return null;
  const p = PISCA.primeira + Math.floor((u - PISCA.primeira) / PISCA.cada) * PISCA.cada;
  return p + 0.25 <= dura - 1.0 ? p : null;
};

/** Brilho do letreiro (0 a 1) no instante t: acende em "at" com o tremido, pisca de leve e apaga em "ate". */
export const brilhoLetreiro = (t: number, at: number, ate: number, piscada = true) => {
  if (t < at) return 0;
  const u = t - at;
  let b = 1;
  if (piscada) {
    // 30 quadros por segundo: 2 quadros fracos, 2 acesos, 2 de queda, aceso
    if (u < 0.066) b = 0.3;
    else if (u >= 0.133 && u < 0.2) b = 0.45;
    const p = piscadaEm(u, ate - at);
    if (p !== null) {
      if (u >= p && u < p + 0.066) b = 0.35;
      else if (u >= p + 0.166 && u < p + 0.233) b = 0.5;
    }
  } else b = Math.min(1, 0.3 + u / 0.25);
  // apaga como um tubo desligado: cai para 30% no quadro da troca e some em 0,1 s
  if (t >= ate) b *= 0.3 * (1 - ramp(t, ate, 0.1));
  return b;
};

// ---------------------------------------------------------------- desenho

const brilhoCss = (cor: string, s: number) => `drop-shadow(0 0 ${Math.round(s * 0.05)}px ${cor}) drop-shadow(0 0 ${Math.round(s * 0.14)}px ${cor})`;

/** O letreiro aceso com o brilho "b" (0 a 1). */
/** id fixo de máscara por texto e tamanho (o mesmo texto no mesmo tamanho dá a mesma máscara, em qualquer quadro) */
const idMascara = (texto: string, s: number) => {
  let h = 2166136261;
  for (const ch of `${texto}|${s}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `neon-contorno-${(h >>> 0).toString(36)}`;
};

/** Linha em contorno: a faixa de fora da letra (a letra com traço grosso menos a letra cheia), numa máscara de SVG. Assim
 *  as curvas que se cruzam dentro da letra (a fonte tem contornos sobrepostos) não aparecem, só a borda de fora. */
const LinhaContorno: React.FC<{ texto: string; s: number; traco: number; cor: string; familia: string }> = ({ texto, s, traco, cor, familia }) => {
  const h = s * 1.08;
  const id = idMascara(texto, s);
  const comum = { x: W / 2, y: h / 2 + s * 0.36, textAnchor: 'middle' as const, fontFamily: familia, fontWeight: 900, fontSize: s, letterSpacing: `${ESPACO}em` };
  return (
    <svg width={W} height={h} viewBox={`0 0 ${W} ${h}`} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-W} y={-h} width={W * 3} height={h * 3}>
          <text {...comum} fill="#fff" stroke="#fff" strokeWidth={traco * 2} strokeLinejoin="round">
            {texto}
          </text>
          <text {...comum} fill="#000">
            {texto}
          </text>
        </mask>
      </defs>
      <rect x={-W} y={-h} width={W * 3} height={h * 3} fill={cor} mask={`url(#${id})`} />
    </svg>
  );
};

export const LetreiroDesenho: React.FC<{ linhas: Linhas; b: number }> = ({ linhas, b }) => {
  const N = useNeon();
  if (b <= 0 || !linhas.length) return null;
  const m = medirLetreiro(linhas);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: b }}>
      {m.linhas.map((l, i) => {
        const cor = l.contorno ? N.c.contorno : N.c.cheio;
        const nucleo = misturar(cor, '#FFFFFF', 0.28);
        const traco = Math.max(3, Math.round(l.s * 0.05));
        const caixa: React.CSSProperties = { position: 'absolute', left: 0, width: W, top: l.y, height: l.s * 1.08, transform: `skewX(${INCLINA}deg)`, filter: brilhoCss(cor, l.s) };
        if (l.contorno)
          return (
            <div key={i} style={caixa}>
              <LinhaContorno texto={l.texto} s={l.s} traco={traco} cor={nucleo} familia={N.f.texto} />
            </div>
          );
        return (
          <div
            key={i}
            style={{
              ...caixa,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: N.f.texto,
              fontWeight: 900,
              fontSize: l.s,
              lineHeight: 1,
              letterSpacing: `${ESPACO}em`,
              whiteSpace: 'nowrap',
              color: nucleo,
            }}
          >
            {l.texto}
          </div>
        );
      })}
    </div>
  );
};

/** Um letreiro que acende em "at" e apaga em "ate" (sem "ate": fica até o fim). */
export const Letreiro: React.FC<{ linhas: Linhas; t: number; at: number; ate?: number; piscada?: boolean }> = ({ linhas, t, at, ate = Infinity, piscada = true }) => (
  <LetreiroDesenho linhas={linhas} b={brilhoLetreiro(t, at, ate, piscada)} />
);

/** Um letreiro do vídeo: o que acende em "at" (segundos) e o texto. */
export type EventoLetreiro = { at: number; linhas: Linhas };

/** A camada do letreiro: o da vez aceso, o anterior apagando (cada evento vale até o próximo). */
export const CamadaLetreiro: React.FC<{ eventos: EventoLetreiro[]; t: number; piscada?: boolean }> = ({ eventos, t, piscada = true }) => {
  const ord = [...eventos].sort((a, b) => a.at - b.at);
  const i = ord.reduce((acc, e, k) => (e.at <= t ? k : acc), -1);
  if (i < 0) return null;
  const atual = ord[i];
  const ant = i > 0 ? ord[i - 1] : null;
  return (
    <>
      {ant && t < atual.at + 0.1 ? <Letreiro linhas={ant.linhas} t={t} at={ant.at} ate={atual.at} piscada={piscada} /> : null}
      <Letreiro linhas={atual.linhas} t={t} at={atual.at} ate={ord[i + 1]?.at ?? Infinity} piscada={piscada} />
    </>
  );
};

