import React from 'react';
import { ajustar, contar, eo, largura, ramp, SEGURA, spr, trechos, W, Y_MAX } from './anima';
import { misturar, useNeon } from './tema';
import type { Preco } from './universo';

// Peças do modelo Neon retrô, sobre a grade (a zona de baixo, entre o horizonte e a borda de baixo da área segura):
// o preço que conta (com o antigo riscado), a contagem regressiva (relógio descendo ou 3, 2, 1), o selo "só hoje",
// o botão em pílula com a oferta e o card final. Todas pegam a cor do tema (useNeon) e o tempo por prop (t, em
// segundos); nenhuma pisca (só o letreiro pisca). Tudo desenhado em código, nenhuma imagem de fora; texto longo
// quebra e encolhe dentro da área segura, com o brilho dentro dela.

/** a zona das peças: do horizonte (com folga) até a borda de baixo da área segura */
export const ZONA = { topo: 1136, baixo: Y_MAX - 14 } as const;
/** largura útil das peças: a área segura menos a folga do brilho */
export const LARGURA = W - 2 * SEGURA.lado - 2 * 24;
const CX = W / 2;

// ---------------------------------------------------------------- preço

/** larguras do preço, em fração do tamanho: cada algarismo numa caixa fixa (o número não dança enquanto conta) */
const DIG = 0.7;
const PONTO = 0.32;
const RS = 0.42;
const CENT = 0.5;
/** o preço nunca fica menor que o maior letreiro (124 px) */
export const PRECO_MIN = 124;
export const PRECO_MAX = 170;

const milhar = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
/** partes do preço em centavos: "R$", a parte inteira com milhar e os centavos (ou null) */
export const partesPreco = (centavos: number, comCentavos: boolean) => {
  const c = Math.max(0, Math.round(centavos));
  return { inteiro: milhar(Math.floor(c / 100)), cent: comCentavos ? String(c % 100).padStart(2, '0') : null };
};
const larguraInteiro = (inteiro: string) => [...inteiro].reduce((a, ch) => a + (ch === '.' ? PONTO : DIG), 0);
/** largura do preço em px no tamanho s */
export const larguraPreco = (inteiro: string, comCentavos: boolean, s: number) =>
  (largura('R$', RS, 900) + 0.06 + larguraInteiro(inteiro) + (comCentavos ? 0.03 + (PONTO + 2 * DIG) * CENT : 0)) * s;

/** O preço no instante t: conta do antigo (ou de zero) até o valor, de "at" a "at + dura", e para exatamente nele. */
export const valorPreco = (t: number, at: number, preco: Preco, antigo: Preco | null, dura = 1) => Math.round(contar(t, at, preco.centavos, dura, antigo?.centavos ?? 0));

export const PrecoDesenho: React.FC<{ centavos: number; comCentavos: boolean; s: number; cx: number; y: number; opacidade?: number }> = ({ centavos, comCentavos, s, cx, y, opacidade = 1 }) => {
  const N = useNeon();
  const { inteiro, cent } = partesPreco(centavos, comCentavos);
  const w = larguraPreco(inteiro, comCentavos, s);
  const nucleo = misturar(N.c.destaque, '#FFFFFF', 0.18);
  const caixa = (ch: string, k: number, tam: number) => (
    <span key={k} style={{ display: 'inline-block', width: (ch === '.' || ch === ',' ? PONTO : DIG) * tam, textAlign: 'center' }}>
      {ch}
    </span>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: y,
        width: w,
        height: s,
        display: 'flex',
        alignItems: 'flex-start',
        whiteSpace: 'nowrap',
        fontFamily: N.f.texto,
        fontWeight: 900,
        lineHeight: 1,
        color: nucleo,
        opacity: opacidade,
        filter: `drop-shadow(0 0 ${Math.round(s * 0.05)}px ${N.c.destaque}) drop-shadow(0 0 ${Math.round(s * 0.13)}px ${N.a('destaque', 0.75)})`,
      }}
    >
      <span style={{ fontSize: s * RS, marginTop: s * 0.12, marginRight: s * 0.06 }}>R$</span>
      <span style={{ fontSize: s, display: 'flex' }}>{[...inteiro].map((ch, k) => caixa(ch, k, s))}</span>
      {cent !== null ? <span style={{ fontSize: s * CENT, marginTop: s * 0.06, marginLeft: s * 0.03, display: 'flex' }}>{[',', ...cent].map((ch, k) => caixa(ch, k, s * CENT))}</span> : null}
    </div>
  );
};

// ---------------------------------------------------------------- selo

const SELO_GIRO = -8;
export const medirSelo = (texto: string, base = 34) => {
  const t = texto.toLocaleUpperCase('pt-BR');
  const { s } = ajustar(t, base, 300, 1, 900, 22);
  const w = largura(t, s, 900, 0.04) + 2 * 26;
  const h = s * 1.0 + 2 * 16;
  // caixa do selo girado
  const r = (Math.abs(SELO_GIRO) * Math.PI) / 180;
  return { texto: t, s, w, h, bw: w * Math.cos(r) + h * Math.sin(r), bh: w * Math.sin(r) + h * Math.cos(r) };
};

/** Selo girado ("SÓ HOJE"): bate no lugar em "at" (grande e girado a mais, assenta com mola). */
export const Selo: React.FC<{ texto: string; t: number; at: number; cx: number; cy: number; base?: number }> = ({ texto, t, at, cx, cy, base }) => {
  const N = useNeon();
  if (t < at) return null;
  const m = medirSelo(texto, base);
  const s = spr(t, at, { damping: 11, stiffness: 260, mass: 0.5 });
  const esc = 1.7 - 0.7 * s;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - m.w / 2,
        top: cy - m.h / 2,
        width: m.w,
        height: m.h,
        boxSizing: 'border-box',
        borderRadius: 14,
        background: N.c.selo,
        border: `3px solid ${misturar(N.c.selo, '#FFFFFF', 0.45)}`,
        boxShadow: `0 0 14px ${N.a('selo', 0.85)}, 0 0 34px ${N.a('selo', 0.45)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: N.f.texto,
        fontWeight: 900,
        fontSize: m.s,
        letterSpacing: '0.04em',
        color: N.c.ceu,
        whiteSpace: 'nowrap',
        opacity: Math.min(1, s * 2.2),
        transform: `rotate(${SELO_GIRO - (1 - s) * 10}deg) scale(${esc})`,
      }}
    >
      {m.texto}
    </div>
  );
};

// ---------------------------------------------------------------- oferta (o que, preço antigo, preço, selo, prazo)

export type DadosOferta = { oQue: string | null; preco: Preco | null; antigo: Preco | null; selo: string | null; prazo: string | null };

/** Mede o bloco da oferta na zona de baixo: cada texto quebra e encolhe; o preço fica entre 124 e 170 px. */
export const medirOferta = (d: DadosOferta) => {
  const altMax = ZONA.baixo - ZONA.topo;
  const antigoTexto = d.antigo ? `de ${d.antigo.texto}` : null;
  const digitos = (p: Preco | null) => (p ? partesPreco(p.centavos, p.comCentavos).inteiro : '');
  const inteiroMax = d.preco ? [digitos(d.preco), digitos(d.antigo)].sort((a, b) => b.length - a.length)[0] : '';
  const gap = 12;
  for (let i = 0; i <= 25; i++) {
    const k = 1 - i * 0.02;
    const oq = d.oQue ? ajustar(d.oQue, Math.round(56 * k), LARGURA, 2, 800, 28) : null;
    const an = antigoTexto ? ajustar(antigoTexto, Math.round(44 * k), LARGURA, 1, 800, 24) : null;
    const pz = d.prazo ? ajustar(d.prazo, Math.round(34 * k), LARGURA, 2, 'mono', 20) : null;
    const seloBase = Math.max(24, Math.round(34 * k));
    const selo = d.selo ? medirSelo(d.selo, seloBase) : null;
    // o selo: ao lado do preço, se couber; senão ao lado do preço antigo; senão numa linha dele
    let sP = 0;
    let onde: 'preco' | 'antigo' | 'solto' | null = selo ? 'solto' : null;
    if (d.preco) {
      const largP = (s: number) => larguraPreco(inteiroMax, d.preco!.comCentavos, s);
      const teto = Math.max(PRECO_MIN, Math.round(PRECO_MAX * Math.max(0.8, k)));
      sP = teto;
      if (selo) {
        while (sP > PRECO_MIN && largP(sP) + selo.bw + 28 > LARGURA) sP -= 2;
        if (largP(sP) + selo.bw + 28 <= LARGURA) onde = 'preco';
        else {
          sP = teto;
          onde = an && largura(an.linhas[0], an.s, 800) + selo.bw + 40 <= LARGURA ? 'antigo' : 'solto';
        }
      }
      while (sP > PRECO_MIN && largP(sP) > LARGURA) sP -= 2;
    }
    const hAn = an ? Math.max(an.s * 1.15, onde === 'antigo' && selo ? selo.bh : 0) : 0;
    const blocos: number[] = [];
    if (oq) blocos.push(oq.linhas.length * oq.s * 1.12);
    if (selo && onde === 'solto') blocos.push(selo.bh);
    if (an) blocos.push(hAn);
    if (d.preco) blocos.push(sP * 1.02);
    if (pz) blocos.push(pz.linhas.length * pz.s * 1.25);
    const alt = blocos.reduce((a, b) => a + b, 0) + gap * (blocos.length - 1);
    if (alt <= altMax || i === 25) {
      let y = ZONA.topo + Math.max(0, (altMax - alt) / 2);
      const pos: { oq?: number; seloSolto?: number; an?: number; preco?: number; pz?: number } = {};
      if (oq) {
        pos.oq = y;
        y += oq.linhas.length * oq.s * 1.12 + gap;
      }
      if (selo && onde === 'solto') {
        pos.seloSolto = y + selo.bh / 2;
        y += selo.bh + gap;
      }
      if (an) {
        pos.an = y + (hAn - an.s * 1.15) / 2;
        y += hAn + gap;
      }
      if (d.preco) {
        pos.preco = y;
        y += sP * 1.02 + gap;
      }
      if (pz) pos.pz = y;
      // o preço (e o selo ao lado dele) centralizados; o preço antigo e o selo ao lado dele também
      const wPrecoFinal = d.preco ? larguraPreco(digitos(d.preco), d.preco.comCentavos, sP) : 0;
      const wGrupo = wPrecoFinal + (onde === 'preco' && selo ? selo.bw + 28 : 0);
      const cxPreco = CX - wGrupo / 2 + wPrecoFinal / 2;
      const wAn = an ? largura(an.linhas[0], an.s, 800) : 0;
      const wGrupoAn = wAn + (onde === 'antigo' && selo ? selo.bw + 40 : 0);
      const cxAn = CX - wGrupoAn / 2 + wAn / 2;
      const seloEm =
        !selo || !onde
          ? null
          : onde === 'preco' && pos.preco !== undefined
            ? { cx: CX + wGrupo / 2 - selo.bw / 2, cy: pos.preco + sP * 0.18 }
            : onde === 'antigo' && pos.an !== undefined && an
              ? { cx: CX + wGrupoAn / 2 - selo.bw / 2, cy: pos.an + (an.s * 1.15) / 2 }
              : pos.seloSolto !== undefined
                ? { cx: CX, cy: pos.seloSolto }
                : null;
      return { oq, an, pz, sP, pos, selo, seloBase, seloEm, cxPreco, cxAn, alt };
    }
  }
  throw new Error('medirOferta: sem medida');
};

/** O bloco da oferta: o que (em "at"), o preço antigo e o preço que conta (em "atPreco"), o selo e o prazo. */
export const Oferta: React.FC<{ d: DadosOferta; t: number; at: number; atPreco: number; atSelo: number; atPrazo: number; contaPor?: number }> = ({ d, t, at, atPreco, atSelo, atPrazo, contaPor = 1 }) => {
  const N = useNeon();
  const m = medirOferta(d);
  const fimConta = atPreco + contaPor;
  const sombra = `0 2px 0 ${N.a('ceu', 0.9)}, 0 0 18px ${N.a('ceu', 0.95)}`;
  const entra = (a: number): React.CSSProperties => {
    if (t < a) return { opacity: 0 };
    const p = eo(ramp(t, a, 0.3));
    return { opacity: p, transform: `translateY(${(1 - p) * 30}px)` };
  };
  return (
    <>
      {m.oq && m.pos.oq !== undefined ? (
        <div style={{ position: 'absolute', left: CX - LARGURA / 2, width: LARGURA, top: m.pos.oq, textAlign: 'center', fontFamily: N.f.texto, fontWeight: 800, fontSize: m.oq.s, lineHeight: 1.12, color: N.c.topo, textShadow: sombra, ...entra(at) }}>
          {m.oq.linhas.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      ) : null}
      {m.an && m.pos.an !== undefined && t >= atPreco ? (
        <div style={{ position: 'absolute', left: m.cxAn - LARGURA / 2, width: LARGURA, top: m.pos.an, display: 'flex', justifyContent: 'center', ...entra(atPreco) }}>
          <div style={{ position: 'relative', fontFamily: N.f.texto, fontWeight: 800, fontSize: m.an.s, lineHeight: 1.15, color: N.a('topo', 0.82), textShadow: sombra, whiteSpace: 'nowrap' }}>
            {m.an.linhas[0]}
            {/* o risco do preço antigo se desenha quando o preço termina de contar */}
            <div style={{ position: 'absolute', left: -6, top: '52%', height: Math.max(4, m.an.s * 0.09), width: `calc(${eo(ramp(t, fimConta, 0.25)) * 100}% + 12px)`, background: N.c.cheio, borderRadius: 4, boxShadow: `0 0 10px ${N.c.cheio}` }} />
          </div>
        </div>
      ) : null}
      {d.preco && m.pos.preco !== undefined && t >= atPreco ? (
        <PrecoDesenho centavos={valorPreco(t, atPreco, d.preco, d.antigo, contaPor)} comCentavos={d.preco.comCentavos} s={m.sP} cx={m.cxPreco} y={m.pos.preco} opacidade={Math.min(1, ramp(t, atPreco, 0.12))} />
      ) : null}
      {m.selo && d.selo && m.seloEm ? <Selo texto={d.selo} t={t} at={atSelo} cx={m.seloEm.cx} cy={m.seloEm.cy} base={m.seloBase} /> : null}
      {m.pz && m.pos.pz !== undefined ? (
        <div style={{ position: 'absolute', left: CX - LARGURA / 2, width: LARGURA, top: m.pos.pz, textAlign: 'center', fontFamily: N.f.mono, fontWeight: 500, fontSize: m.pz.s, lineHeight: 1.25, letterSpacing: '0.02em', color: N.c.topo, textShadow: sombra, ...entra(atPrazo) }}>
          {m.pz.linhas.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- contagem regressiva

/** "HH:MM:SS" ou "MM:SS" -> segundos (null se não for relógio) */
export const lerRelogio = (s: string | undefined | null) => {
  const m = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/.exec(String(s ?? '').trim());
  if (!m) return null;
  return Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]);
};
const relogio = (seg: number, comHora: boolean) => {
  const s = Math.max(0, seg);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return comHora ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
};

export type DadosContagem = { forma: 'relogio' | 'numeros'; inicio: number; comHora: boolean; de: number; rotulo: string | null; prazo: string | null; fim: string };

export const medirContagem = (d: DadosContagem) => {
  const altMax = ZONA.baixo - ZONA.topo;
  for (let i = 0; i <= 25; i++) {
    const k = 1 - i * 0.02;
    const ro = d.rotulo ? ajustar(d.rotulo.toLocaleUpperCase('pt-BR'), Math.round(36 * k), LARGURA, 1, 'mono', 22, 0.14) : null;
    const pz = d.prazo ? ajustar(d.prazo, Math.round(34 * k), LARGURA, 2, 'mono', 22) : null;
    const nChars = d.comHora ? 8 : 5;
    const sR = d.forma === 'relogio' ? Math.min(170, Math.floor(LARGURA / (nChars * 0.6))) : 0;
    const sN = d.forma === 'numeros' ? Math.round(250 * Math.max(0.7, k)) : 0;
    const blocos = [ro ? ro.s * 1.2 : 0, d.forma === 'relogio' ? sR * 1.05 : sN * 1.0, pz ? pz.linhas.length * pz.s * 1.25 : 0].filter((b) => b > 0);
    const alt = blocos.reduce((a, b) => a + b, 0) + 16 * (blocos.length - 1);
    if (alt <= altMax || i === 25) {
      let y = ZONA.topo + (altMax - alt) / 2;
      const pos: { ro?: number; num?: number; pz?: number } = {};
      if (ro) {
        pos.ro = y;
        y += ro.s * 1.2 + 16;
      }
      pos.num = y;
      y += (d.forma === 'relogio' ? sR * 1.05 : sN) + 16;
      if (pz) pos.pz = y;
      return { ro, pz, sR, sN, pos };
    }
  }
  throw new Error('medirContagem: sem medida');
};

/** Instante de cada número do 3, 2, 1 (e do texto do fim): "at" + k x "passo". */
export const passosNumeros = (d: DadosContagem, at: number, passo: number) => Array.from({ length: d.de + 1 }, (_, k) => at + k * passo);

/** A contagem: o relógio desce um segundo por segundo a partir de "inicio", ou os números trocam a cada "passo". */
export const Contagem: React.FC<{ d: DadosContagem; t: number; at: number; passo?: number }> = ({ d, t, at, passo = 1 }) => {
  const N = useNeon();
  const m = medirContagem(d);
  if (t < at) return null;
  const sombra = `0 2px 0 ${N.a('ceu', 0.9)}, 0 0 18px ${N.a('ceu', 0.95)}`;
  const p = eo(ramp(t, at, 0.3));
  let numero: React.ReactNode = null;
  if (d.forma === 'relogio') {
    const s = m.sR;
    const texto = relogio(d.inicio - Math.floor(t - at), d.comHora);
    numero = (
      <div style={{ position: 'absolute', left: 0, width: W, top: m.pos.num, textAlign: 'center', fontFamily: N.f.mono, fontWeight: 500, fontSize: s, lineHeight: 1, color: misturar(N.c.destaque, '#FFFFFF', 0.18), filter: `drop-shadow(0 0 ${Math.round(s * 0.05)}px ${N.c.destaque}) drop-shadow(0 0 ${Math.round(s * 0.13)}px ${N.a('destaque', 0.7)})` }}>
        {texto}
      </div>
    );
  } else {
    const tempos = passosNumeros(d, at, passo);
    const k = tempos.reduce((acc, x, i) => (x <= t ? i : acc), 0);
    const texto = k < d.de ? String(d.de - k) : d.fim.toLocaleUpperCase('pt-BR');
    const s = k < d.de ? m.sN : ajustar(texto, Math.round(m.sN * 0.55), LARGURA - 40, 1, 900, 40).s;
    const e = spr(t, tempos[k], { damping: 12, stiffness: 240, mass: 0.5 });
    numero = (
      <div style={{ position: 'absolute', left: 0, width: W, top: m.pos.num, height: m.sN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: N.f.texto, fontWeight: 900, fontSize: s, lineHeight: 1, color: misturar(N.c.cheio, '#FFFFFF', 0.25), transform: `skewX(-10deg) scale(${1.25 - 0.25 * e})`, textShadow: `0 0 ${Math.round(s * 0.04)}px ${N.c.cheio}, 0 0 ${Math.round(s * 0.1)}px ${N.a('cheio', 0.75)}, 0 0 ${Math.round(s * 0.2)}px ${N.a('cheio', 0.35)}` }}>{texto}</div>
      </div>
    );
  }
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: p }}>
      {m.ro && m.pos.ro !== undefined ? (
        <div style={{ position: 'absolute', left: 0, width: W, top: m.pos.ro, textAlign: 'center', fontFamily: N.f.mono, fontWeight: 500, fontSize: m.ro.s, letterSpacing: '0.14em', color: N.c.topo, textShadow: sombra }}>{m.ro.linhas[0]}</div>
      ) : null}
      {numero}
      {m.pz && m.pos.pz !== undefined ? (
        <div style={{ position: 'absolute', left: CX - LARGURA / 2, width: LARGURA, top: m.pos.pz, textAlign: 'center', fontFamily: N.f.mono, fontWeight: 500, fontSize: m.pz.s, lineHeight: 1.25, color: N.c.topo, textShadow: sombra }}>
          {m.pz.linhas.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- botão em pílula

export const medirBotao = (texto: string) => {
  const t = texto.toLocaleUpperCase('pt-BR');
  const padH = 64;
  const { s, linhas } = ajustar(t, 54, LARGURA - 2 * padH - 20, 2, 900, 30, 0.02);
  const w = Math.min(LARGURA, Math.max(...linhas.map((l) => largura(l, s, 900, 0.02))) + 2 * padH);
  const h = linhas.length * s * 1.1 + 2 * 34;
  return { s, linhas, w, h, x: CX - w / 2, y: ZONA.baixo - h - 14 };
};

/** Botão em pílula com brilho: sobe em "at" e o brilho respira devagar (sem piscar). */
export const Botao: React.FC<{ texto: string; t: number; at: number; y?: number }> = ({ texto, t, at, y }) => {
  const N = useNeon();
  if (t < at) return null;
  const m = medirBotao(texto);
  const p = spr(t, at, { damping: 14, stiffness: 200 });
  // respira: o brilho vai de 75% a 100% em 2 s, suave (nunca é uma queda brusca)
  const resp = 0.875 + 0.125 * Math.cos(((t - at) * Math.PI * 2) / 2);
  const top = y ?? m.y;
  return (
    <div
      style={{
        position: 'absolute',
        left: m.x,
        top,
        width: m.w,
        height: m.h,
        boxSizing: 'border-box',
        borderRadius: m.linhas.length > 1 ? 64 : m.h / 2,
        border: `6px solid ${misturar(N.c.botao, '#FFFFFF', 0.2)}`,
        background: N.a('ceu', 0.55),
        boxShadow: `0 0 ${Math.round(16 * resp)}px ${N.a('botao', 0.9 * resp)}, 0 0 ${Math.round(40 * resp)}px ${N.a('botao', 0.5 * resp)}, inset 0 0 ${Math.round(18 * resp)}px ${N.a('botao', 0.5 * resp)}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: N.f.texto,
        fontWeight: 900,
        fontSize: m.s,
        lineHeight: 1.1,
        letterSpacing: '0.02em',
        color: misturar(N.c.botao, '#FFFFFF', 0.15),
        textShadow: `0 0 10px ${N.a('botao', 0.8)}, 0 0 24px ${N.a('botao', 0.45)}`,
        whiteSpace: 'nowrap',
        opacity: Math.min(1, p * 1.6),
        transform: `translateY(${(1 - p) * 60}px)`,
      }}
    >
      {m.linhas.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- card final

/** Linhas já quebradas com *destaque*: cada linha em trechos [texto, destaque?], com o destaque que atravessa a quebra. */
export const linhasComDestaque = (linhas: string[]): [string, boolean][][] => {
  let aberto = false;
  return linhas.map((l) => {
    const marcas = (l.match(/\*/g) ?? []).length;
    const texto = aberto ? `*${l}` : l;
    const fecha = aberto ? marcas % 2 === 1 : marcas % 2 === 0;
    const partes = trechos(fecha ? texto : `${texto}*`);
    aberto = !fecha;
    return partes;
  });
};

/** linhas com a palavra entre asteriscos noutra cor (o destaque pode atravessar a quebra) */
export const LinhasComDestaque: React.FC<{ linhas: string[]; cor: string }> = ({ linhas, cor }) => (
  <>
    {linhasComDestaque(linhas).map((partes, i) => (
      <div key={i}>
        {partes.map(([tx, d], k) => (
          <span key={k} style={d ? { color: cor } : undefined}>
            {tx}
          </span>
        ))}
      </div>
    ))}
  </>
);

export const CARD = { x: SEGURA.lado + 30, topo: 620, baixo: Y_MAX - 16 } as const;

/** Card final: marca, chamada, assinatura, frase, fontes e o aviso de narração por IA (só quando há narração). */
export const CardFinal: React.FC<{ t: number; at: number; chamada: string | null; fontes: string[]; assinatura: string; frase: string | null; marca: { nome: string } | null; avisoIA: boolean; topoMin?: number }> = ({
  t,
  at,
  chamada,
  fontes,
  assinatura,
  frase,
  marca,
  avisoIA,
  topoMin = CARD.topo,
}) => {
  const N = useNeon();
  if (t < at) return null;
  const s = spr(t, at, { damping: 15, stiffness: 170 });
  const w = W - 2 * CARD.x;
  const interno = w - 2 * 56;
  const fts = fontes.slice(0, 3);
  // o card fica abaixo do letreiro (topoMin) e cobre o alto do sol; com texto longo, tudo encolhe até caber
  const topo = Math.max(CARD.topo, topoMin);
  const medir = (k: number) => {
    const mc = marca ? ajustar(marca.nome.toLocaleUpperCase('pt-BR'), Math.round(44 * k), interno, 2, 900, 22, 0.06) : null;
    const ch = chamada ? ajustar(chamada, Math.round(64 * k), interno, 3, 800, 26) : null;
    const as = ajustar(assinatura, Math.round(60 * k), interno, 3, 900, 22);
    const fr = frase ? ajustar(frase, Math.round(36 * k), interno, 2, 800, 22) : null;
    const gap = Math.round(26 * k);
    const pad = Math.round(56 * Math.max(0.7, k));
    const alt =
      pad * 2 + (mc ? mc.linhas.length * mc.s * 1.15 + gap : 0) + (ch ? ch.linhas.length * ch.s * 1.12 + gap : 0) + 4 + gap + as.linhas.length * as.s * 1.12 + (fr ? gap - 8 + fr.linhas.length * fr.s * 1.25 : 0) + (fts.length ? gap + fts.length * 22 * 1.4 : 0) + (avisoIA ? gap + 30 : 0);
    return { mc, ch, as, fr, gap, pad, alt };
  };
  let md = medir(1);
  for (let i = 1; i <= 20 && md.alt > CARD.baixo - topo; i++) md = medir(1 - i * 0.025);
  const { mc, ch, as, fr, gap, pad } = md;
  const h = Math.min(CARD.baixo - topo, md.alt);
  const y = Math.max(topo, Math.min(720, topo + (CARD.baixo - topo - h) / 2));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 50}px)` }}>
      <div
        style={{
          position: 'absolute',
          left: CARD.x,
          top: y,
          width: w,
          height: h,
          boxSizing: 'border-box',
          borderRadius: 34,
          background: N.c.cardFinal,
          border: `4px solid ${misturar(N.c.contorno, '#FFFFFF', 0.2)}`,
          boxShadow: `0 0 16px ${N.a('contorno', 0.8)}, 0 0 44px ${N.a('contorno', 0.35)}, inset 0 0 22px ${N.a('contorno', 0.25)}`,
          padding: pad,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap,
          overflow: 'hidden',
        }}
      >
        {mc ? (
          <div style={{ fontFamily: N.f.texto, fontWeight: 900, fontSize: mc.s, lineHeight: 1.15, letterSpacing: '0.06em', color: misturar(N.c.cheio, '#FFFFFF', 0.2), textShadow: N.brilho('cheio', 0.6) }}>
            {mc.linhas.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        ) : null}
        {ch ? (
          <div style={{ fontFamily: N.f.texto, fontWeight: 800, fontSize: ch.s, lineHeight: 1.12, color: N.c.cardTexto }}>
            <LinhasComDestaque linhas={ch.linhas} cor={N.c.destaque} />
          </div>
        ) : null}
        <div style={{ width: 120, height: 4, borderRadius: 2, background: N.a('contorno', 0.6), flexShrink: 0 }} />
        <div style={{ fontFamily: N.f.texto, fontWeight: 900, fontSize: as.s, lineHeight: 1.12, color: misturar(N.c.destaque, '#FFFFFF', 0.12), textShadow: N.brilho('destaque', 0.5) }}>
          {as.linhas.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        {fr ? (
          <div style={{ fontFamily: N.f.texto, fontWeight: 800, fontSize: fr.s, lineHeight: 1.25, color: N.a('cardTexto', 0.85), marginTop: -8 }}>
            {fr.linhas.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        ) : null}
        {fts.length ? (
          <div style={{ fontFamily: N.f.mono, fontWeight: 500, fontSize: 22, lineHeight: 1.4, color: N.a('cardTexto', 0.62), maxWidth: interno, overflowWrap: 'anywhere' }}>
            {fts.map((f, i) => (
              <div key={i}>fonte: {f}</div>
            ))}
          </div>
        ) : null}
        {avisoIA ? <div style={{ fontFamily: N.f.mono, fontWeight: 500, fontSize: 24, color: N.a('cardTexto', 0.6) }}>Narração gerada por IA</div> : null}
      </div>
    </div>
  );
};
