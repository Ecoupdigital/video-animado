import React from 'react';
import { eo, H, ramp, SEGURA, spr, W } from './anima';
import { useMesa } from './tema';

// Peças do modelo Mesa vista de cima, por cima da mesa: a etiqueta de papel girada com o passo, a faixa de legenda
// com a palavra destacada, o card final e o movimento de entrada dos itens (cai ou aparece). Todas pegam a cor do
// tema (useMesa: só destaque, faixa, etiqueta e card final mudam com a resposta de cores) e o tempo por prop
// (t, em segundos). Nenhum texto fixo de passo a passo: o texto vem do roteiro do vídeo ou das respostas.
// Tudo desenhado em código (SVG e CSS); nenhuma imagem de fora.

// ---------------------------------------------------------------- aleatório fixo e medida de texto

/** gerador de números fixo pela semente (o mesmo desenho a cada render) */
export const sorteio = (semente: number) => {
  let a = semente >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};
export const semente = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** largura média da letra, em em (medida no Chrome com as fontes do kit, com folga) */
export const LETRA = { texto: 0.6, forte: 0.64, mono: 0.62 } as const;

/** quebra as palavras em linhas pela largura estimada; palavra maior que a linha é partida */
export const quebrar = (texto: string, s: number, largura: number, letra: number) => {
  const cabe = Math.max(1, Math.floor(largura / (letra * s)));
  const palavras = texto
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((p) => (p.length <= cabe ? [p] : (p.match(new RegExp(`.{1,${cabe}}`, 'g')) as string[])));
  const espaco = s * 0.28;
  const linhas: { palavras: string[]; largura: number }[] = [];
  let atual: string[] = [];
  let x = 0;
  for (const p of palavras) {
    const w = p.replace(/\*/g, '').length * letra * s;
    if (atual.length && x + espaco + w > largura) {
      linhas.push({ palavras: atual, largura: x });
      atual = [p];
      x = w;
    } else {
      x += (atual.length ? espaco : 0) + w;
      atual.push(p);
    }
  }
  if (atual.length) linhas.push({ palavras: atual, largura: x });
  return linhas;
};

/** maior tamanho de fonte (até "base") em que o texto cabe em "maxLinhas" linhas; devolve o tamanho e as linhas */
export const ajustar = (texto: string, base: number, largura: number, maxLinhas: number, letra: number, minimo = 22) => {
  for (let s = base; s > minimo; s -= 1) {
    const ls = quebrar(texto, s, largura, letra);
    const maior = Math.max(0, ...texto.split(/\s+/).map((p) => p.replace(/\*/g, '').length * letra * s));
    if (ls.length <= maxLinhas && maior <= largura) return { s, linhas: ls };
  }
  return { s: minimo, linhas: quebrar(texto, minimo, largura, letra) };
};

/** Trechos de um texto com *destaque*: [texto, destaque?] */
export const trechos = (texto: string): [string, boolean][] => {
  const partes: [string, boolean][] = [];
  const re = /\*([^*]+)\*/g;
  let pos = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    if (m.index > pos) partes.push([texto.slice(pos, m.index), false]);
    partes.push([m[1], true]);
    pos = m.index + m[0].length;
  }
  if (pos < texto.length) partes.push([texto.slice(pos), false]);
  return partes;
};
export const semMarcas = (texto: string) => texto.replace(/\*/g, '');

/** texto com a palavra entre asteriscos noutra cor */
export const ComDestaque: React.FC<{ texto: string; cor: string }> = ({ texto, cor }) => (
  <>
    {trechos(texto).map(([tx, d], i) => (
      <span key={i} style={d ? { color: cor } : undefined}>
        {tx}
      </span>
    ))}
  </>
);

// ---------------------------------------------------------------- caixas na tela

/** caixa na tela; "giro" (graus, em volta do meio) quando é a etiqueta girada: "x, y, w, h" são então a caixa sem giro */
export type Caixa = { x: number; y: number; w: number; h: number; giro?: number };
const cruzaReto = (a: Caixa, b: Caixa, folga: number) => a.x < b.x + b.w + folga && b.x < a.x + a.w + folga && a.y < b.y + b.h + folga && b.y < a.y + a.h + folga;
/** a caixa "a" (reta) encosta na "b" (reta ou girada)? Na girada, os cantos de "a" vão para o eixo dela. */
export const cruza = (a: Caixa, b: Caixa, folga = 0) => {
  if (!b.giro) return cruzaReto(a, b, folga);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const r = (-b.giro * Math.PI) / 180;
  const cantos = [
    [a.x, a.y],
    [a.x + a.w, a.y],
    [a.x, a.y + a.h],
    [a.x + a.w, a.y + a.h],
  ].map(([x, y]) => [cx + (x - cx) * Math.cos(r) - (y - cy) * Math.sin(r), cy + (x - cx) * Math.sin(r) + (y - cy) * Math.cos(r)]);
  const xs = cantos.map((c) => c[0]);
  const ys = cantos.map((c) => c[1]);
  const local = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  return cruzaReto(local, { x: b.x, y: b.y, w: b.w, h: b.h }, folga);
};
/** a área segura do Reels como caixa (o que fica dentro dela é visto em todo celular) */
export const AREA: Caixa = { x: SEGURA.lado, y: SEGURA.topo, w: W - 2 * SEGURA.lado, h: H - SEGURA.topo - SEGURA.baixo };

// ---------------------------------------------------------------- etiqueta de papel

const GIRO = -6;
const RAD = (Math.abs(GIRO) * Math.PI) / 180;
/** canto de cima à esquerda da caixa da etiqueta girada (dentro da área segura, com folga) */
const ETQ_X = AREA.x + 14;
const ETQ_Y = AREA.y + 16;

export type MedidaEtiqueta = { w: number; h: number; cx: number; cy: number; caixa: Caixa; girada: Caixa; sMono: number; sTitulo: number; linhas: number; padE: number; padD: number; padV: number };

/** Medida da etiqueta: o título quebra em até 3 linhas e encolhe; a etiqueta cresce até caber, girada dentro da área segura. */
export const medirEtiqueta = (titulo: string, rotulo: string, grande = false): MedidaEtiqueta => {
  const padE = grande ? 84 : 80;
  const padD = 40;
  const padV = grande ? 34 : 26;
  const wMax = grande ? 880 : 800;
  const base = grande ? 70 : 54;
  const minimo = grande ? 38 : 32;
  const sMono = Math.max(20, Math.min(30, (wMax - padE - padD) / (LETRA.mono * 1.1 * Math.max(1, rotulo.length))));
  // menos linhas primeiro: uma linha se couber até 80% do tamanho, duas até 70%, senão até 3 linhas encolhendo
  const caber = (n: number, piso: number) => {
    const r = ajustar(semMarcas(titulo), base, wMax - padE - padD, n, LETRA.forte, piso);
    return r.linhas.length <= n && r.s > piso ? r : null;
  };
  const { s, linhas } = caber(1, base * 0.8) ?? caber(2, base * 0.7) ?? ajustar(semMarcas(titulo), base, wMax - padE - padD, 3, LETRA.forte, minimo);
  const largura = Math.max(...linhas.map((l) => l.largura), LETRA.mono * 1.1 * sMono * rotulo.length);
  const w = Math.min(wMax, Math.max(grande ? 640 : 560, largura + padE + padD + 40));
  const h = padV * 2 + sMono * 1.25 + 10 + linhas.length * s * 1.12;
  // caixa da etiqueta girada (eixos da tela)
  const bw = w * Math.cos(RAD) + h * Math.sin(RAD);
  const bh = w * Math.sin(RAD) + h * Math.cos(RAD);
  const caixa = { x: ETQ_X, y: ETQ_Y, w: bw, h: bh };
  const cx = ETQ_X + bw / 2;
  const cy = ETQ_Y + bh / 2;
  // a própria etiqueta, girada (com a sombra embaixo): é ela que os itens não podem tocar
  const girada = { x: cx - w / 2, y: cy - h / 2, w, h: h + 16, giro: GIRO };
  return { w, h, cx, cy, caixa, girada, sMono, sTitulo: s, linhas: linhas.length, padE, padD, padV };
};

/** etiqueta de papel girada: o rótulo mono ("PASSO 3 DE 5") e o título; cai no lugar em "at" (sem "at", já está lá) */
export const Etiqueta: React.FC<{ t: number; at?: number; rotulo: string; titulo: string; grande?: boolean; saida?: number }> = ({ t, at, rotulo, titulo, grande, saida }) => {
  const M = useMesa();
  const m = medirEtiqueta(titulo, rotulo, grande);
  if (at !== undefined && t < at) return null;
  const p = at === undefined ? 1 : eo(ramp(t, at, 0.32));
  const s = at === undefined ? 1 : spr(t, at, { damping: 13, stiffness: 190 });
  const sai = saida !== undefined ? 1 - ramp(t, saida, 0.2) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: m.cx - m.w / 2,
        top: m.cy - m.h / 2,
        width: m.w,
        height: m.h,
        boxSizing: 'border-box',
        background: M.c.etiqueta,
        borderRadius: 12,
        transform: `translateY(${(1 - p) * -60}px) rotate(${GIRO - (1 - s) * 5}deg) scale(${1.12 - 0.12 * s})`,
        opacity: Math.min(1, p * 2) * sai,
        boxShadow: `0 ${10 + (1 - p) * 30}px ${22 + (1 - p) * 30}px ${M.sombra(0.95 - (1 - p) * 0.4)}`,
        padding: `${m.padV}px ${m.padD}px ${m.padV}px ${m.padE}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      {/* furo do barbante, como a etiqueta pendurada da tela de referência */}
      <div style={{ position: 'absolute', left: 30, top: m.h / 2 - 15, width: 30, height: 30, borderRadius: 15, background: M.sombra(0.5), boxShadow: `inset 0 3px 4px ${M.sombra(1.4)}` }} />
      <div style={{ position: 'absolute', left: 36, top: m.h / 2 - 9, width: 18, height: 18, borderRadius: 9, border: `3px solid ${M.c.etiquetaPasso}`, boxSizing: 'border-box', opacity: 0.55 }} />
      <div style={{ fontFamily: M.f.mono, fontWeight: 500, fontSize: m.sMono, lineHeight: 1.25, letterSpacing: '0.1em', color: M.c.etiquetaPasso, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rotulo}</div>
      <div style={{ fontFamily: M.f.texto, fontWeight: 800, fontSize: m.sTitulo, lineHeight: 1.12, letterSpacing: '-0.01em', color: M.c.etiquetaTexto, overflowWrap: 'anywhere' }}>
        <ComDestaque texto={titulo} cor={M.c.etiquetaPasso} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- faixa de legenda

const FAIXA_BAIXO = H - SEGURA.baixo - 12;
export type MedidaFaixa = { s: number; w: number; h: number; caixa: Caixa; linhas: number };

/** Medida da faixa: até 3 linhas, a fonte encolhe; cresce para cima a partir da borda de baixo da área segura. */
export const medirFaixa = (frase: string): MedidaFaixa => {
  const padH = 40;
  const padV = 24;
  const wMax = AREA.w - 20;
  const { s, linhas } = ajustar(semMarcas(frase), 44, wMax - 2 * padH, 3, LETRA.texto, 26);
  const largura = Math.max(...linhas.map((l) => l.largura));
  const w = Math.min(wMax, Math.max(420, largura + 2 * padH + 44));
  const h = padV * 2 + linhas.length * s * 1.25;
  return { s, w, h, linhas: linhas.length, caixa: { x: W / 2 - w / 2, y: FAIXA_BAIXO - h, w, h } };
};

/** faixa escura de legenda com a frase e a palavra entre asteriscos no destaque; sobe em "at" (sem "at", já está lá) */
export const Faixa: React.FC<{ t: number; at?: number; frase: string; saida?: number }> = ({ t, at, frase, saida }) => {
  const M = useMesa();
  if (at !== undefined && t < at) return null;
  const m = medirFaixa(frase);
  const p = at === undefined ? 1 : eo(ramp(t, at, 0.3));
  const sai = saida !== undefined ? 1 - ramp(t, saida, 0.2) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: m.caixa.x,
        top: m.caixa.y,
        width: m.w,
        height: m.h,
        boxSizing: 'border-box',
        borderRadius: 28,
        background: M.a('faixa', 0.9),
        boxShadow: `0 10px 24px ${M.sombra(0.7)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
        opacity: p * sai,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      <div style={{ fontFamily: M.f.texto, fontWeight: 600, fontSize: m.s, lineHeight: 1.25, color: M.c.faixaTexto, textAlign: 'center', overflowWrap: 'anywhere' }}>
        <ComDestaque texto={frase} cor={M.c.destaque} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- entrada dos itens

export type Entrada = 'cai' | 'aparece';
/** tempo da queda até a sombra encostar na mesa */
export const QUEDA = 0.22;

/** Movimento de um item a partir de "at": "cai" (vem de cima, maior, com a sombra longe e borrada; assenta com um
 *  pequeno quique) ou "aparece" (pop). Devolve null antes de "at". "altura" de 0 (na mesa) a 1 (no alto) guia a sombra. */
export const entrada = (t: number, at: number, tipo: Entrada, distancia = 220) => {
  if (t < at) return null;
  if (tipo === 'aparece') {
    const s = spr(t, at, { damping: 11, stiffness: 230, mass: 0.6 });
    return { escala: Math.max(0, s), dy: 0, opacidade: Math.min(1, s * 2.5), altura: 0 };
  }
  const p = Math.min(1, (t - at) / QUEDA);
  const altura = 1 - p * p;
  if (p < 1) return { escala: 1 + 0.32 * altura, dy: -distancia * altura, opacidade: Math.min(1, p * 3.5), altura };
  // assentou: quique curto e amortecido
  const d = t - at - QUEDA;
  const quique = Math.exp(-d * 9) * Math.sin(d * 26) * 0.05;
  return { escala: 1 - quique, dy: 0, opacidade: 1, altura: 0 };
};

/** sombra CSS de um item na mesa (segue a cor da superfície), mais longe e mais borrada quanto mais alto */
export const sombraItem = (sombra: (f?: number) => string, altura: number, forca = 1) =>
  `drop-shadow(${4 + altura * 20}px ${12 + altura * 60}px ${12 + altura * 26}px ${sombra(forca * (1 - 0.55 * altura))})`;

// ---------------------------------------------------------------- card final

/** card final: marca, chamada, "comenta aqui", assinatura, frase, fontes e o aviso de narração por IA */
export const CardFinal: React.FC<{ t: number; at: number; chamada: string | null; fontes: string[]; assinatura: string; frase: string | null; marca: { nome: string; cor: string | null } | null; avisoIA: boolean }> = ({
  t,
  at,
  chamada,
  fontes,
  assinatura,
  frase,
  marca,
  avisoIA,
}) => {
  const M = useMesa();
  if (t < at) return null;
  const s = spr(t, at, { damping: 15, stiffness: 170 });
  const x = 120;
  const w = W - 2 * x;
  const y = 500;
  const interno = w - 120;
  const ch = chamada ? ajustar(semMarcas(chamada), 76, interno, 3, LETRA.forte, 34) : null;
  // a assinatura (um @ longo não tem espaço): o tamanho em que ela cabe em até 3 linhas, quebrando onde precisar
  let tamAss = 70;
  while (tamAss > 28 && Math.ceil((assinatura.length * LETRA.forte * tamAss) / interno) * tamAss * 1.12 > 200) tamAss -= 2;
  const fr = frase ? ajustar(frase, 40, interno, 2, LETRA.texto, 24) : null;
  const tamMarca = marca ? ajustar(marca.nome, 38, interno - 40, 2, LETRA.forte, 24).s : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 60}px)` }}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          maxHeight: 1500 - y,
          boxSizing: 'border-box',
          borderRadius: 26,
          background: M.c.cardFinal,
          transform: 'rotate(-1.5deg)',
          boxShadow: `0 26px 50px ${M.sombra(1.2)}`,
          padding: `64px 60px ${avisoIA ? 110 : 64}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 26,
        }}
      >
        {marca ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: interno, fontFamily: M.f.texto, fontWeight: 800, fontSize: tamMarca, lineHeight: 1.15, color: M.c.cardTexto }}>
            <span style={{ width: 20, height: 20, borderRadius: 10, background: M.c.cardDestaque, flexShrink: 0 }} />
            <span style={{ overflowWrap: 'anywhere' }}>{marca.nome}</span>
          </div>
        ) : null}
        {ch ? (
          <div style={{ fontFamily: M.f.texto, fontWeight: 800, fontSize: ch.s, lineHeight: 1.12, letterSpacing: '-0.01em', color: M.c.cardTexto, maxWidth: interno, overflowWrap: 'anywhere' }}>
            <ComDestaque texto={chamada!} cor={M.c.cardDestaque} />
          </div>
        ) : null}
        <div style={{ padding: '14px 34px', borderRadius: 40, background: M.c.cardDestaque, color: M.c.cardFinal, fontFamily: M.f.texto, fontWeight: 800, fontSize: 38 }}>comenta aqui</div>
        <div style={{ width: 120, height: 4, borderRadius: 2, background: M.a('cardTexto', 0.18), marginTop: 6 }} />
        <div style={{ fontFamily: M.f.texto, fontWeight: 800, fontSize: tamAss, lineHeight: 1.12, color: M.c.cardDestaque, overflowWrap: 'anywhere', maxWidth: interno }}>{assinatura}</div>
        {fr ? <div style={{ fontFamily: M.f.texto, fontWeight: 600, fontSize: fr.s, lineHeight: 1.25, color: M.c.cardTexto, maxWidth: interno }}>{frase}</div> : null}
        {fontes.length ? (
          <div style={{ fontFamily: M.f.mono, fontWeight: 500, fontSize: 22, lineHeight: 1.4, color: M.a('cardTexto', 0.62), maxWidth: interno, overflowWrap: 'anywhere' }}>
            {fontes.slice(0, 3).map((f, i) => (
              <div key={i}>fonte: {f}</div>
            ))}
          </div>
        ) : null}
        {avisoIA ? <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, fontFamily: M.f.mono, fontWeight: 500, fontSize: 24, color: M.a('cardTexto', 0.6) }}>Narração gerada por IA</div> : null}
      </div>
    </div>
  );
};
