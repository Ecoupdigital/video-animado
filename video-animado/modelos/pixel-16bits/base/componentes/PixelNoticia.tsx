import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile } from 'remotion';
import { cabe, clamp, ent, pop, S, useT } from './anima';
import { temArquivo } from './arquivos';
import { alfa, P } from './cores';
import { MONO, SANS } from './fontes';
import { norm, type Card, type Gesto, type Montado, type SecaoT } from './roteiro';
import { SimboloPx } from './simbolo';
import { MARCA, PERFIL, TOPO } from './universo';

// TEMPLATE PixelNoticia: monta o vídeo inteiro pelos dados (roteiro + palavras + bocas). Faixas da tela, de cima
// para baixo: topo (232), título em 2 linhas (290), card branco (496 a 876), legenda acima da cabeça (896 a 976)
// e o boneco (990 até o fim, rosto entre 1030 e 1540). Tudo dentro da área segura, menos o peito do boneco.

const CARD = { x: 80, y: 496, w: 920, h: 380, padX: 40, padY: 30 } as const;
const BONECO = { x: 156, y: 990, w: 768, h: 960 } as const;
const LEG_Y = 896;
const VALIDAS = new Set(['X', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
const PISCA = (() => {
  const out: number[] = [];
  let t = 0.6;
  for (let k = 0; k < 400; k++) {
    out.push(t);
    t += 2.4 + ((k * 37) % 11) / 10;
  }
  return out;
})();

// ---------------------------------------------------------------- tempo

export const secaoEm = (m: Montado, t: number) => {
  const i = m.secoes.findIndex((s) => t >= s.a && t < s.b);
  return i >= 0 ? i : t < 0 ? 0 : m.secoes.length - 1;
};
const gestoEm = (m: Montado, t: number): { gesto: Gesto; desde: number } => {
  if (t >= m.fim) return { gesto: m.final.gesto, desde: m.fim };
  const s = m.secoes[secaoEm(m, t)];
  if (!s) return { gesto: 'nada', desde: 0 };
  // o primeiro gesto entra depois de 0,8 s parado, como quem respira antes de falar
  if (s.k === 0 && t < 0.8) return { gesto: 'nada', desde: 0 };
  return { gesto: s.gesto ?? 'uma', desde: s.k === 0 ? 0.8 : s.a };
};

// ---------------------------------------------------------------- boneco

export const Boneco: React.FC<{ m: Montado; t: number; boca?: string; olho?: 'aberto' | 'fechado'; gesto?: Gesto; y?: number }> = ({ m, t, boca, olho, gesto, y }) => {
  const c = m.bocas.find((b) => t >= b[0] && t < b[1]);
  const forma = boca ?? (c && VALIDAS.has(c[2]) ? c[2] : 'X');
  const o = olho ?? (PISCA.some((p) => t >= p && t < p + 0.12) ? 'fechado' : 'aberto');
  const g = gestoEm(m, t);
  const troca = g.desde > 0 && t >= g.desde && t < g.desde + 0.07; // 2 quadros de antecipação na troca de gesto
  const bob = (Math.sin(t * 2.2) > 0 ? 0 : 6) + (troca ? -6 : 0);
  return (
    <div style={{ position: 'absolute', left: BONECO.x, top: (y ?? BONECO.y) + bob, width: BONECO.w, height: BONECO.h }}>
      <Img src={staticFile(`px/${forma}_${o}_${gesto ?? g.gesto}.png`)} style={{ width: BONECO.w, height: BONECO.h, imageRendering: 'pixelated' }} />
    </div>
  );
};

// ---------------------------------------------------------------- topo, título, legenda

export const Topo: React.FC = () => {
  const ass = TOPO.assinatura;
  const ponto = ass.lastIndexOf('.');
  const [corpo, fim] = ponto > 0 ? [ass.slice(0, ponto), ass.slice(ponto)] : [ass, ''];
  const total = TOPO.rotulo.length + ass.length * 1.06 + 3;
  const f = cabe("x".repeat(Math.ceil(total)), CARD.w, 28, 20, true);
  return (
    <div style={{ position: 'absolute', left: CARD.x, width: CARD.w, top: 232, height: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, fontFamily: MONO, fontSize: f, color: P.suave, whiteSpace: 'nowrap' }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{TOPO.rotulo}</span>
      <span style={{ color: P.tinta, fontWeight: 500, letterSpacing: '0.04em', flexShrink: 0 }}>
        {corpo}
        <span style={{ color: P.destaque }}>{fim}</span>
      </span>
    </div>
  );
};

export const Titulo: React.FC<{ linhas: string[]; destaque: string[]; t: number; a: number }> = ({ linhas, destaque, t, a }) => {
  const dest = new Set(destaque.flatMap((d) => d.split(/\s+/)).map(norm));
  const ls = linhas.slice(0, 3);
  const max = ls.length > 2 ? 62 : 82;
  const f = Math.min(...ls.map((l) => cabe(l, CARD.w, max, 40)));
  const lh = Math.round(f * 1.16);
  return (
    <div style={{ position: 'absolute', left: CARD.x, width: CARD.w, top: 290, height: 186, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: f, lineHeight: `${lh}px`, letterSpacing: '-0.035em', color: P.tinta }}>
      {ls.map((txt, k) => {
        const e = ent(t, a + k * 0.1, 0.32);
        return (
          <div key={k} style={{ overflow: 'hidden', height: lh, whiteSpace: 'nowrap' }}>
            <div style={{ transform: `translateY(${(1 - e) * lh}px)` }}>
              {txt.split(' ').map((w, j) => (
                <span key={j} style={{ color: dest.has(norm(w)) ? P.destaque : P.tinta }}>
                  {w}
                  {j < txt.split(' ').length - 1 ? ' ' : ''}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Blocos de até 3 palavras, quebrando depois de pontuação. */
export const blocosDe = (m: Montado) => {
  const out: { s: number; ws: string[] }[] = [];
  let cur: { s: number; ws: string[] } | null = null;
  m.palavras.forEach((p, i) => {
    if (!cur) cur = { s: p.s, ws: [] };
    cur.ws.push(p.w);
    const prox = m.palavras[i + 1];
    if (/[.,:;!?]$/.test(p.w) || cur.ws.length >= 3 || !prox) {
      out.push(cur);
      cur = null;
    }
  });
  return out;
};

export const Legenda: React.FC<{ m: Montado; t: number; blocos: { s: number; ws: string[] }[] }> = ({ m, t, blocos }) => {
  let idx = -1;
  blocos.forEach((b, i) => {
    if (t >= b.s - 0.03) idx = i;
  });
  if (idx < 0 || t >= m.fim) return null;
  const b = blocos[idx];
  if (!blocos[idx + 1] && t > b.s + 1.4) return null;
  const s = interpolate(t, [b.s - 0.03, b.s + 0.06], [0.9, 1], clamp);
  const txt = b.ws.map((w) => w.replace(/[.,:;]$/, '')).join(' ');
  const f = cabe(txt, 860, 50, 30);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: LEG_Y, height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: P.tinta, borderRadius: 8, padding: '10px 24px', fontFamily: SANS, fontWeight: 700, fontSize: f, color: '#fff', letterSpacing: '-0.01em', transform: `scale(${s})`, boxShadow: `0 8px 24px ${alfa(P.tinta, 0.25)}`, whiteSpace: 'nowrap' }}>
        {b.ws.map((w, i) => (
          <span key={i} style={{ color: m.realce.has(norm(w)) ? P.destaqueClaro : '#fff' }}>
            {w.replace(/[.,:;]$/, '')}
            {i < b.ws.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- moldes de card

const Rotulo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: MONO, fontSize: 24, color: P.suave, letterSpacing: '0.02em', marginBottom: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</div>
);
const umaLinha: React.CSSProperties = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

/** instante de cada elemento do card: a palavra marcada ou, sem ela, um depois do outro a partir do começo */
const quando = (s: SecaoT, em: string | undefined, i: number) => s.em(em, s.a + 0.35 + i * 0.4);

const Lista: React.FC<{ c: Extract<Card, { molde: 'lista' }>; s: SecaoT; t: number }> = ({ c, s, t }) => {
  const itens = c.itens.slice(0, c.titulo ? 4 : 5);
  const f = itens.length > 4 ? 30 : 34;
  return (
    <div>
      {c.titulo ? <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: cabe(c.titulo, 840, 40, 28), color: P.tinta, marginBottom: 12, opacity: ent(t, s.a + 0.1), ...umaLinha }}>{c.titulo}</div> : null}
      {itens.map((it, i) => {
        const a = quando(s, it.em, i);
        const e = ent(t, a - 0.05, 0.25);
        const marca = pop(t, a + 0.2);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: itens.length > 3 ? '8px 0' : '13px 0', borderBottom: `2px solid ${P.linha}`, opacity: 0.25 + 0.75 * e, transform: `translateX(${(1 - e) * -24}px)` }}>
            <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 6, background: marca > 0 ? P.acerto : P.apagado, color: '#fff', fontFamily: SANS, fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.75 + 0.25 * Math.min(1.2, marca)})` }}>
              {marca > 0.2 ? '✓' : ''}
            </div>
            <div style={{ flex: 1, fontFamily: SANS, fontWeight: 600, fontSize: f, color: P.tinta, ...umaLinha }}>{it.texto}</div>
            {it.nota ? <div style={{ fontFamily: MONO, fontSize: 22, color: P.suave, flexShrink: 0, maxWidth: 260, ...umaLinha }}>{it.nota}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

const Conversa: React.FC<{ c: Extract<Card, { molde: 'conversa' }>; s: SecaoT; t: number }> = ({ c, s, t }) => {
  const msgs = c.mensagens.slice(0, 3);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {msgs.map((msg, i) => {
        const a = quando(s, msg.em, i);
        const dir = (msg.lado ?? (i % 2 ? 'dir' : 'esq')) === 'dir';
        const digitando = dir && t >= a - 0.7 && t < a;
        const e = ent(t, a, 0.25);
        const f = msg.texto.length > 70 ? 26 : msg.texto.length > 45 ? 29 : 33;
        if (t < a - 0.7 || (!dir && t < a)) return <div key={i} style={{ height: 0 }} />;
        return (
          <div key={i} style={{ alignSelf: dir ? 'flex-end' : 'flex-start', maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: dir ? 'flex-end' : 'flex-start', opacity: digitando ? 1 : e, transform: `translateY(${digitando ? 0 : (1 - e) * 18}px)` }}>
            <div style={{ fontFamily: SANS, fontSize: 23, fontWeight: 600, color: dir ? P.destaque : P.suave, marginBottom: 6, ...umaLinha, maxWidth: 600 }}>{msg.quem}</div>
            <div style={{ fontFamily: SANS, fontSize: f, lineHeight: 1.25, color: P.tinta, background: dir ? P.balaoResposta : P.balao, borderRadius: 12, padding: '14px 22px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {digitando ? <span style={{ fontFamily: MONO, color: P.suave }}>digitando{'.'.repeat(1 + (Math.floor(t * 4) % 3))}</span> : msg.texto}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Selo: React.FC<{ c: Extract<Card, { molde: 'selo' }>; s: SecaoT; t: number }> = ({ c, s, t }) => {
  const a = s.em(c.em, s.a + 0.6);
  const st = interpolate(t, [a, a + 0.14], [2.2, 1], clamp);
  const icone = c.icone ?? MARCA?.simbolo ?? 'estrela';
  const fTit = cabe(c.titulo, 620, 46, 28);
  const fSelo = cabe(c.selo, 560, 38, 22, true);
  const etiquetas = (c.etiquetas ?? []).slice(0, 4);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 34, height: 170 }}>
        <div style={{ opacity: ent(t, s.a + 0.1), flexShrink: 0 }}>
          <SimboloPx nome={icone} tamanho={128} cor={P.destaque} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fTit, color: P.tinta, ...umaLinha, opacity: ent(t, s.a + 0.15) }}>{c.titulo}</div>
          {t >= a ? (
            <div style={{ display: 'inline-block', marginTop: 12, border: `5px solid ${P.destaque}`, color: P.destaque, fontFamily: MONO, fontWeight: 700, fontSize: fSelo, padding: '4px 18px', borderRadius: 6, transform: `scale(${st}) rotate(-6deg)`, opacity: Math.min(1, 3 - st), whiteSpace: 'nowrap' }}>{c.selo}</div>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap', maxHeight: 76, overflow: 'hidden' }}>
        {etiquetas.map((e, i) => (
          <div key={i} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: '#fff', background: P.tinta, borderRadius: 8, padding: '12px 24px', transform: `scale(${pop(t, quando(s, e.em, i + 1))})`, maxWidth: 400, ...umaLinha }}>{e.texto}</div>
        ))}
      </div>
    </div>
  );
};

const Blocos: React.FC<{ c: Extract<Card, { molde: 'blocos' }>; s: SecaoT; t: number }> = ({ c, s, t }) => {
  const bs = c.blocos.slice(0, 4);
  const colunas = bs.length <= 2 ? bs.length : 2;
  const larg = (840 - (colunas - 1) * 20) / colunas;
  const alt = bs.length > 2 ? 128 : 250;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colunas}, 1fr)`, gap: 20 }}>
      {bs.map((b, i) => {
        const p = pop(t, quando(s, b.em, i));
        // antes da palavra, o bloco fica apagado, só com o rótulo; o valor entra com mola
        return (
          <div key={i} style={{ height: alt, boxSizing: 'border-box', background: P.fundo, borderRadius: 10, borderLeft: `8px solid ${p > 0 ? (i === 0 ? P.destaque : i === 1 ? P.destaqueClaro : P.apagado) : P.apagado}`, padding: '16px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 0.45 + 0.55 * Math.min(1, p * 2) }}>
            <div style={{ fontFamily: MONO, fontSize: 22, color: P.suave, ...umaLinha }}>{b.rotulo}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: cabe(b.valor, larg - 50, bs.length > 2 ? 56 : 84, 26), color: P.tinta, letterSpacing: '-0.02em', ...umaLinha, transform: `scale(${p})`, transformOrigin: 'left center', opacity: Math.min(1, p * 2) }}>{b.valor}</div>
          </div>
        );
      })}
    </div>
  );
};

export const CardDaSecao: React.FC<{ s: SecaoT; t: number }> = ({ s, t }) => {
  const c = s.card;
  return (
    <div>
      <Rotulo>{c.rotulo ?? '// notícia'}</Rotulo>
      {c.molde === 'lista' ? <Lista c={c} s={s} t={t} /> : null}
      {c.molde === 'conversa' ? <Conversa c={c} s={s} t={t} /> : null}
      {c.molde === 'selo' ? <Selo c={c} s={s} t={t} /> : null}
      {c.molde === 'blocos' ? <Blocos c={c} s={s} t={t} /> : null}
    </div>
  );
};

/** Card final de perfil: rosto do boneco, @, frase e "Seguir" virando "Seguindo". */
export const CardFinal: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const seguiu = t >= a + 1.1;
  const aperta = interpolate(t, [a + 1.0, a + 1.1, a + 1.25], [1, 0.9, 1], clamp);
  const fA = cabe(PERFIL.arroba, 600, 44, 24);
  const frase = PERFIL.frase ?? '';
  const fF = frase.length > 60 ? 24 : 28;
  return (
    <div>
      <Rotulo>
        {MARCA?.simbolo ? <SimboloPx nome={MARCA.simbolo} tamanho={22} cor={P.destaque} style={{ verticalAlign: '-3px', marginRight: 10 }} /> : null}
        {PERFIL.rotulo}
      </Rotulo>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 8 }}>
        <div style={{ width: 170, height: 170, flexShrink: 0, borderRadius: 85, padding: 6, boxSizing: 'border-box', background: `linear-gradient(45deg, ${P.destaque}, ${P.destaqueClaro})` }}>
          <div style={{ width: 158, height: 158, borderRadius: 79, overflow: 'hidden', background: P.linha, position: 'relative' }}>
            <Img src={staticFile('px/X_aberto_nada.png')} style={{ position: 'absolute', left: -82, top: -18, width: 320, height: 400, imageRendering: 'pixelated' }} />
          </div>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: fA, color: P.tinta, ...umaLinha }}>{PERFIL.arroba}</div>
          {frase ? <div style={{ fontFamily: SANS, fontSize: fF, lineHeight: 1.3, color: P.suave, marginTop: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{frase}</div> : null}
          <div style={{ display: 'inline-block', marginTop: 16, transform: `scale(${aperta})`, background: seguiu ? P.apagado : P.destaque, color: seguiu ? P.tinta : '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 30, padding: '12px 48px', borderRadius: 8 }}>{seguiu ? 'Seguindo ✓' : 'Seguir'}</div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- sons

/** Sons do vídeo: um por coisa que aparece, nos instantes da montagem. [segundo, nome, volume] */
export const sonsDe = (m: Montado): [number, string, number][] => {
  const out: [number, string, number][] = [];
  for (const s of m.secoes) {
    if (s.k > 0) out.push([s.a, 'whoosh', 0.18]);
    const c = s.card;
    if (c.molde === 'lista') c.itens.slice(0, 5).forEach((it, i) => out.push([quando(s, it.em, i) + 0.2, 'tick', 0.3]));
    if (c.molde === 'conversa')
      c.mensagens.slice(0, 3).forEach((msg, i) => {
        const a = quando(s, msg.em, i);
        const dir = (msg.lado ?? (i % 2 ? 'dir' : 'esq')) === 'dir';
        if (dir) out.push([a - 0.7, 'digitando', 0.22]);
        out.push([a, 'pop', 0.3]);
      });
    if (c.molde === 'selo') {
      out.push([s.em(c.em, s.a + 0.6) + 0.08, 'stamp', 0.45]);
      (c.etiquetas ?? []).slice(0, 4).forEach((e, i) => out.push([quando(s, e.em, i + 1), 'pop', 0.3]));
    }
    if (c.molde === 'blocos') c.blocos.slice(0, 4).forEach((b, i) => out.push([quando(s, b.em, i), 'pop', 0.3]));
  }
  out.push([m.fim, 'whoosh', 0.18], [m.fim + 1.1, 'clique', 0.5], [m.fim + 1.14, 'sino', 0.28]);
  return out.filter(([a]) => a >= 0 && a < m.total);
};

// ---------------------------------------------------------------- montagem

export const PixelNoticia: React.FC<{ m: Montado; comSom?: boolean; narracao?: string | null }> = ({ m, comSom = true, narracao }) => {
  const t = useT();
  const blocos = React.useMemo(() => blocosDe(m), [m]);
  const noFinal = t >= m.fim || m.secoes.length === 0;
  const s = m.secoes[secaoEm(m, t)];
  const ultima = m.secoes[m.secoes.length - 1];
  // a primeira seção já está na tela no quadro 0 (é a capa do vídeo); as outras entram na virada
  const a = noFinal ? m.fim : s.k === 0 ? -0.4 : s.a;
  const e = ent(t, a, 0.32);
  const sai = !noFinal ? interpolate(t, [s.b - 0.12, s.b], [0, 1], clamp) : 0;
  const voz = narracao === null ? null : [narracao, 'narracao.wav', 'narracao.mp3'].find((x) => x && temArquivo(x)) ?? null;
  const fimCama = S(m.total);
  return (
    <AbsoluteFill style={{ background: P.fundo, overflow: 'hidden' }}>
      {comSom && voz ? <Audio src={staticFile(voz)} /> : null}
      {comSom && temArquivo('sons/cama.wav') ? <Audio src={staticFile('sons/cama.wav')} loop volume={(f) => 0.09 * interpolate(f, [0, 12, fimCama - 18, fimCama], [0, 1, 1, 0], clamp)} /> : null}
      {comSom
        ? sonsDe(m).map(([at, n, v], k) =>
            temArquivo(`sons/${n}.wav`) ? (
              <Sequence key={k} from={S(at)} durationInFrames={S(1.5)} layout="none">
                <Audio src={staticFile(`sons/${n}.wav`)} volume={v} />
              </Sequence>
            ) : null,
          )
        : null}
      <Topo />
      {noFinal ? <Titulo linhas={m.final.titulo} destaque={ultima?.destaque ?? []} t={t} a={m.final.titulo === ultima?.titulo ? ultima.a : m.fim} /> : <Titulo linhas={s.titulo} destaque={s.destaque ?? []} t={t} a={s.k === 0 ? -0.5 : s.a} />}
      <div
        style={{
          position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, background: P.superficie, borderRadius: 8, boxSizing: 'border-box', overflow: 'hidden',
          padding: `${CARD.padY}px ${CARD.padX}px`, boxShadow: `0 18px 40px ${alfa(P.tinta, 0.1)}, 0 2px 6px ${alfa(P.tinta, 0.06)}`,
          transform: `translateY(${(1 - e) * 30 - sai * 10}px) scale(${0.97 + 0.03 * e})`, opacity: Math.max(0, e - sai * 0.9),
        }}
      >
        {noFinal ? <CardFinal t={t} a={m.fim} /> : <CardDaSecao s={s} t={t} />}
      </div>
      <Boneco m={m} t={t} />
      <Legenda m={m} t={t} blocos={blocos} />
    </AbsoluteFill>
  );
};
