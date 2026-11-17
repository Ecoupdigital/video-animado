import React from 'react';
import { eo, ramp, spr } from './anima';
import type { NomeIcone, PalavraTitulo } from './roteiro';
import { trechos } from './roteiro';
import { useTema, type Tema } from './tema';

// Peças da família Explicação. Todas pegam cor e fonte do tema (useTema) e o tempo por prop (t, em segundos).
// O tema troca a cara da peça, não o que ela faz: a Caixa é caixa tremida no quadro e na lousa, post-it no
// quadro de post-its e cartão branco na tela de app; a Seta, o Circulo e o Risco são traço de caneta, de giz,
// de marcador ou traço limpo. Nenhum texto fixo de explicação: o texto vem do roteiro do vídeo ou das respostas.
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
export const LETRA = { mao: 0.42, texto: 0.58, textoForte: 0.62, mono: 0.62 } as const;

/** quebra as palavras em linhas pela largura estimada; devolve as linhas e a largura de cada uma */
export const quebrar = (texto: string, s: number, largura: number, letra: number) => {
  const palavras = texto.split(/\s+/).filter(Boolean);
  const espaco = s * 0.28;
  const linhas: { palavras: string[]; largura: number }[] = [];
  let atual: string[] = [];
  let x = 0;
  for (const p of palavras) {
    const w = p.length * letra * s;
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

/** maior tamanho de fonte (até "base") em que o texto cabe na caixa; devolve o tamanho e as linhas */
export const ajustar = (texto: string, base: number, largura: number, alturaMax: number, letra: number, linha = 1.2, minimo = 22) => {
  for (let s = base; s > minimo; s -= 2) {
    const ls = quebrar(texto, s, largura, letra);
    const maior = Math.max(0, ...texto.split(/\s+/).map((p) => p.length * letra * s));
    if (ls.length * s * linha <= alturaMax && maior <= largura) return { s, linhas: ls };
  }
  return { s: minimo, linhas: quebrar(texto, minimo, largura, letra) };
};

// ---------------------------------------------------------------- caminhos tremidos

const f1 = (n: number) => n.toFixed(1);
const pt = (p: number[]) => `${f1(p[0])} ${f1(p[1])}`;

/** caixa desenhada à mão: quatro lados levemente tortos e a ponta passando do começo */
export const caminhoCaixa = (x: number, y: number, w: number, h: number, sem: number, amp: number) => {
  const r = sorteio(sem);
  const j = (k = 1) => (r() - 0.5) * 2 * amp * k;
  const a = [x + j(), y + j()];
  const b = [x + w + j(), y + j()];
  const c = [x + w + j(), y + h + j()];
  const d = [x + j(), y + h + j()];
  const fim = [a[0] + amp * 1.2 + Math.abs(j(0.5)), a[1] + j(0.4)];
  const lado = (p: number[], q: number[]) => `C ${pt([p[0] + (q[0] - p[0]) * 0.33 + j(0.7), p[1] + (q[1] - p[1]) * 0.33 + j(0.7)])} ${pt([p[0] + (q[0] - p[0]) * 0.66 + j(0.7), p[1] + (q[1] - p[1]) * 0.66 + j(0.7)])} ${pt(q)}`;
  return `M ${pt(a)} ${lado(a, b)} ${lado(b, c)} ${lado(c, d)} ${lado(d, fim)}`;
};

/** seta de (x1, y1) a (x2, y2): haste levemente curva e as duas pernas da ponta */
export const caminhoSeta = (x1: number, y1: number, x2: number, y2: number, sem: number, amp: number, cabeca = 30) => {
  const r = sorteio(sem);
  const j = (k = 1) => (r() - 0.5) * 2 * amp * k;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.max(1, Math.hypot(dx, dy));
  const [nx, ny] = [-dy / L, dx / L];
  const curva = amp * 1.2;
  const c1 = [x1 + dx * 0.33 + nx * curva + j(0.4), y1 + dy * 0.33 + ny * curva + j(0.4)];
  const c2 = [x1 + dx * 0.66 - nx * curva + j(0.4), y1 + dy * 0.66 - ny * curva + j(0.4)];
  const ang = Math.atan2(dy, dx);
  const perna = (s: number) => [x2 - Math.cos(ang + s * 0.5) * cabeca + j(0.3), y2 - Math.sin(ang + s * 0.5) * cabeca + j(0.3)];
  return `M ${pt([x1, y1])} C ${pt(c1)} ${pt(c2)} ${pt([x2, y2])} M ${pt(perna(1))} L ${pt([x2, y2])} L ${pt(perna(-1))}`;
};

/** círculo de destaque à mão: uma volta e um pouco, que não fecha exatamente */
export const caminhoCirculo = (cx: number, cy: number, rx: number, ry: number, sem: number, amp: number) => {
  const r = sorteio(sem);
  const pts: number[][] = [];
  const ini = (200 * Math.PI) / 180;
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const a = ini + (i / n) * Math.PI * 2.18;
    const k = 1 + (r() - 0.5) * 0.07 * (amp > 0 ? 1 : 0) - (i === n ? 0.06 : 0);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  // Catmull-Rom para Bézier: passa por todos os pontos
  let d = `M ${pt(pts[0])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${pt([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${pt([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${pt(p2)}`;
  }
  return d;
};

/** risco de destaque embaixo de uma palavra ou linha */
export const caminhoRisco = (x1: number, y: number, x2: number, sem: number, amp: number) => {
  const r = sorteio(sem);
  const j = (k = 1) => (r() - 0.5) * 2 * amp * k;
  return `M ${pt([x1, y + j(0.6)])} C ${pt([x1 + (x2 - x1) * 0.3, y + 10 + j()])} ${pt([x1 + (x2 - x1) * 0.65, y - 8 + j()])} ${pt([x2, y + 6 + j(0.6)])}`;
};

/** quanto o traço treme no tema (em px): caneta e giz tremem, marcador treme menos, tela não treme */
export const tremor = (T: Tema) => 10 * T.rabisco;

// ---------------------------------------------------------------- traço e camada de desenho

/** filtros do tema (textura do giz); entram uma vez na tela, dentro do fundo */
export const FiltrosTema: React.FC = () => {
  const T = useTema();
  if (!T.giz) return null;
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <filter id={`giz-${T.id}`} filterUnits="userSpaceOnUse" x={-400} y={-400} width={2400} height={3200}>
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={2} seed={3} result="ruido" />
          <feDisplacementMap in="SourceGraphic" in2="ruido" scale={3.5} xChannelSelector="R" yChannelSelector="G" result="torto" />
          <feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves={1} seed={9} result="grao" />
          <feColorMatrix in="grao" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55" result="mascara" />
          <feComposite in="torto" in2="mascara" operator="in" />
        </filter>
        <filter id={`mancha-${T.id}`} filterUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={3} seed={5} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.11 -0.02" />
        </filter>
      </defs>
    </svg>
  );
};

/** camada SVG do tamanho da tela, com a textura de giz quando o tema pede */
export const Desenho: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const T = useTema();
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style }}>
      <g filter={T.filtro}>{children}</g>
    </svg>
  );
};

/** traço que se desenha: p de 0 a 1 */
export const Traco: React.FC<{ d: string; p: number; cor?: string; largura?: number; opacidade?: number }> = ({ d, p, cor, largura = 7, opacidade = 1 }) => {
  const T = useTema();
  if (p <= 0) return null;
  const parcial = p < 0.999;
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={cor ?? T.c.traco}
      strokeWidth={largura}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={parcial ? '1 1' : undefined}
      strokeDashoffset={parcial ? 1 - p : undefined}
      opacity={opacidade}
    />
  );
};

/** progresso de um traço que começa em "at" e leva "d" segundos */
export const desenhar = (t: number, at: number, d = 0.5) => eo(ramp(t, at, d));

// ---------------------------------------------------------------- texto

/** cor do destaque sobre uma superfície (na tela de app o amarelo não lê no branco: usa o destaque2) */
export const destaqueSobre = (T: Tema, superficie: boolean) => (superficie && T.id === 'tela-app' ? T.c.destaque2 : T.c.destaque);

/** família e peso do "texto à mão" no tema (Caveat; na tela de app, Inter) */
export const fonteMao = (T: Tema) => (T.id === 'tela-app' ? { fontFamily: T.f.texto, fontWeight: 700, letra: LETRA.textoForte, linha: 1.18 } : { fontFamily: T.f.mao, fontWeight: 700, letra: LETRA.mao, linha: 1.2 });

/** texto que se escreve da esquerda para a direita; *trecho* sai no destaque; encolhe para caber */
export const TextoMao: React.FC<{
  t: number;
  at: number;
  texto: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
  tamanho: number;
  cor?: string;
  corDestaque?: string;
  alinhar?: 'left' | 'center';
  meio?: boolean;
  d?: number;
}> = ({ t, at, texto, x, y, largura, altura, tamanho, cor, corDestaque, alinhar = 'left', meio = false, d }) => {
  const T = useTema();
  if (t < at) return null;
  const fm = fonteMao(T);
  const limpo = texto.replace(/\*/g, '');
  const { s, linhas } = ajustar(limpo, tamanho, largura, altura, fm.letra, fm.linha, 20);
  const dur = d ?? Math.min(1.1, 0.25 + 0.03 * limpo.length);
  const p = eo(ramp(t, at, dur));
  const alto = linhas.length * s * fm.linha;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: meio ? y + (altura - alto) / 2 : y,
        width: largura,
        fontFamily: fm.fontFamily,
        fontWeight: fm.fontWeight,
        fontSize: s,
        lineHeight: fm.linha,
        color: cor ?? T.c.traco,
        textAlign: alinhar,
        clipPath: p < 1 ? `inset(-20% ${(1 - p) * 100}% -20% -2%)` : undefined,
        filter: T.filtro,
        overflowWrap: 'break-word',
      }}
    >
      {trechos(texto).map(([tx, dest], i) => (
        <span key={i} style={dest ? { color: corDestaque ?? T.c.destaque } : undefined}>
          {tx}
        </span>
      ))}
    </div>
  );
};

/** medida do título: tamanho, linhas e a largura da última linha (para o risco embaixo) */
export const medirTitulo = (T: Tema, palavras: string[], tamanho: number, largura: number, alturaMax: number) => {
  const letra = T.tituloMao ? LETRA.mao : LETRA.textoForte;
  const linha = T.tituloMao ? 1.18 : 1.08;
  const { s, linhas } = ajustar(palavras.join(' '), tamanho, largura, alturaMax, letra, linha, 34);
  return { s, linhas, linha, alto: linhas.length * s * linha };
};

/** título: cada palavra se escreve no instante em que é falada; *palavra* no destaque */
export const Titulo: React.FC<{ t: number; palavras: PalavraTitulo[]; topo?: number; tamanho?: number; alturaMax?: number; alinhar?: 'left' | 'center'; saida?: number }> = ({
  t,
  palavras,
  topo = 300,
  tamanho,
  alturaMax,
  alinhar = 'left',
  saida,
}) => {
  const T = useTema();
  // nos post-its o título fica na parede, acima do quadro (que começa em y 560)
  alturaMax = alturaMax ?? (T.id === 'post-its' ? 236 : 250);
  const base = tamanho ?? (T.tituloMao ? 118 : 86);
  const m = medirTitulo(T, palavras.map((p) => p.w), base, 900, alturaMax);
  const o = saida !== undefined ? 1 - ramp(t, saida, 0.2) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        top: topo,
        left: 90,
        width: 900,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: alinhar === 'center' ? 'center' : 'flex-start',
        columnGap: m.s * 0.28,
        opacity: o,
        filter: T.filtro,
      }}
    >
      {palavras.map((x, i) => {
        const on = t >= x.at;
        const p = on ? eo(ramp(t, x.at, 0.22)) : 0;
        return (
          <span
            key={i}
            style={{
              fontFamily: T.f.titulo,
              fontWeight: T.pesoTitulo,
              fontSize: m.s,
              lineHeight: m.linha,
              letterSpacing: T.tituloMao ? '0' : '-0.02em',
              color: x.d ? T.c.destaque : T.c.titulo,
              opacity: on ? 1 : 0,
              clipPath: p < 1 ? `inset(-25% ${(1 - p) * 100}% -25% -5%)` : undefined,
              transform: T.tituloMao ? undefined : `translateY(${(1 - p) * 18}px)`,
              display: 'inline-block',
            }}
          >
            {x.w}
          </span>
        );
      })}
    </div>
  );
};

/** texto de apoio da cena (legenda), embaixo, dentro da área segura */
export const Legenda: React.FC<{ t: number; at: number; texto: string }> = ({ t, at, texto }) => {
  const T = useTema();
  if (t < at) return null;
  const { s } = ajustar(texto, 38, 900, 100, LETRA.texto, 1.25, 22);
  const p = eo(ramp(t, at, 0.35));
  return (
    <div style={{ position: 'absolute', left: 90, width: 900, top: 1420, fontFamily: T.f.texto, fontWeight: 600, fontSize: s, lineHeight: 1.25, color: T.c.texto, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
      {texto}
    </div>
  );
};

/** rótulo do topo (mono) e, na tela de app, o selo "PASSO n DE N" */
export const Topo: React.FC<{ rotulo: string; passo?: [number, number] | null }> = ({ rotulo, passo }) => {
  const T = useTema();
  const comSelo = T.id === 'tela-app' && passo;
  const tam = Math.max(18, Math.min(28, 900 / (LETRA.mono * Math.max(1, rotulo.length) + 4)));
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 232, height: 56, display: 'flex', alignItems: 'center', gap: 22 }}>
      {comSelo ? (
        <div style={{ flexShrink: 0, background: T.a('superficie', 0.16), borderRadius: 40, padding: '10px 26px', fontFamily: T.f.texto, fontWeight: 800, fontSize: 28, letterSpacing: '0.04em', color: T.c.titulo }}>
          PASSO {passo![0]} DE {passo![1]}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: T.f.mono,
          fontWeight: 500,
          fontSize: comSelo ? Math.min(tam, 22) : tam,
          letterSpacing: '0.12em',
          color: T.id === 'tela-app' ? T.c.texto : T.c.suave,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          filter: T.filtro,
        }}
      >
        {rotulo}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- ícones (48 x 48, traço)

const ICONES: Record<NomeIcone, string[]> = {
  moeda: ['M24 6 a18 18 0 1 1 -0.1 0', 'M30 17 c-2 -3 -10 -4 -12 0 c-2 5 12 4 12 10 c0 5 -10 6 -13 1', 'M24 11 v26'],
  calendario: ['M9 12 h30 v28 h-30 z', 'M9 20 h30', 'M17 7 v9', 'M31 7 v9', 'M16 27 h4', 'M28 27 h4', 'M16 34 h4'],
  documento: ['M12 6 h17 l9 9 v27 h-26 z', 'M29 6 v9 h9', 'M18 23 h14', 'M18 30 h14', 'M18 37 h9'],
  relogio: ['M24 6 a18 18 0 1 1 -0.1 0', 'M24 13 v12 l8 5'],
  grafico: ['M8 8 v32 h33', 'M14 33 l8 -9 l7 5 l11 -14', 'M34 14 h6 v6'],
  pessoa: ['M24 7 a8 8 0 1 1 -0.1 0', 'M9 41 c1 -10 7 -15 15 -15 c8 0 14 5 15 15'],
  check: ['M24 6 a18 18 0 1 1 -0.1 0', 'M15 24 l6 7 l13 -14'],
  alerta: ['M24 6 l19 34 h-38 z', 'M24 18 v11', 'M24 34 v1'],
  etiqueta: ['M6 15 h22 l12 9 l-12 9 h-22 z', 'M13 24 a2.5 2.5 0 1 1 -0.1 0'],
  lampada: ['M24 6 c-8 0 -13 6 -13 13 c0 6 5 9 6 14 h14 c1 -5 6 -8 6 -14 c0 -7 -5 -13 -13 -13', 'M18 38 h12', 'M20 43 h8'],
  carteira: ['M7 14 h30 v26 h-30 z', 'M7 14 l22 -7 l3 7', 'M30 23 h11 v9 h-11 z', 'M34 27.5 h1'],
  porcento: ['M12 38 l24 -28', 'M14 9 a5 5 0 1 1 -0.1 0', 'M34 29 a5 5 0 1 1 -0.1 0'],
  casa: ['M7 22 l17 -15 l17 15', 'M11 19 v21 h26 v-21', 'M20 40 v-11 h8 v11'],
  lista: ['M8 11 h5 v5 h-5 z', 'M19 13.5 h21', 'M8 22 h5 v5 h-5 z', 'M19 24.5 h21', 'M8 33 h5 v5 h-5 z', 'M19 35.5 h21'],
};
export const NOMES_ICONES = Object.keys(ICONES) as NomeIcone[];

/** ícone desenhado em código, que se desenha (p de 0 a 1); centro em (x, y) */
export const Icone: React.FC<{ nome: NomeIcone; x: number; y: number; tamanho: number; p?: number; cor?: string }> = ({ nome, x, y, tamanho, p = 1, cor }) => {
  const T = useTema();
  if (p <= 0) return null;
  const tracos = ICONES[nome] ?? ICONES.check;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" style={{ position: 'absolute', left: x - tamanho / 2, top: y - tamanho / 2, overflow: 'visible', filter: T.filtro }}>
      {tracos.map((d, i) => {
        const pi = Math.max(0, Math.min(1, p * tracos.length - i));
        return pi > 0 ? (
          <path
            key={i}
            d={d}
            pathLength={1}
            fill="none"
            stroke={cor ?? T.c.traco}
            strokeWidth={T.id === 'tela-app' ? 3.6 : 3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pi < 1 ? '1 1' : undefined}
            strokeDashoffset={pi < 1 ? 1 - pi : undefined}
          />
        ) : null;
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- caixa (um passo) e cartão

const COR_NOTA = ['nota1', 'nota2', 'nota3', 'nota4', 'nota5'] as const;
export const corNota = (T: Tema, i: number) => T.c[COR_NOTA[((i % 5) + 5) % 5]];

/** fundo da caixa conforme o tema: traço que se desenha (quadro, lousa), post-it que cola, cartão que sobe */
export const FundoCaixa: React.FC<{ t: number; at: number; x: number; y: number; w: number; h: number; indice: number; sem: number; cor?: string }> = ({ t, at, x, y, w, h, indice, sem, cor }) => {
  const T = useTema();
  if (t < at) return null;
  if (T.id === 'post-its') {
    const s = spr(t, at, { damping: 13, stiffness: 230, mass: 0.6 });
    const rot = (sorteio(sem)() - 0.5) * 6;
    return (
      <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) scale(${0.7 + 0.3 * s})`, opacity: Math.min(1, s * 1.6), background: cor ?? corNota(T, indice), boxShadow: '2px 10px 14px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.15)' }}>
        <div style={{ height: 26, background: 'rgba(0,0,0,0.06)' }} />
      </div>
    );
  }
  if (T.id === 'tela-app') {
    const s = spr(t, at, { damping: 16, stiffness: 200 });
    return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, background: T.c.superficie, boxShadow: `0 18px 40px ${T.a('moldura2', 0.35)}`, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 50}px)` }} />;
  }
  return (
    <Desenho>
      <Traco d={caminhoCaixa(x, y, w, h, sem, tremor(T))} p={desenhar(t, at, 0.55)} cor={cor ?? T.c.traco} largura={T.giz ? 8 : 7} />
    </Desenho>
  );
};

/** onde fica o texto dentro da caixa de um passo (a cena usa para circular o resultado) */
export const textoDaCaixa = (T: Tema, x: number, y: number, w: number, h: number, texto: string, comIcone: boolean) => {
  const tamIcone = Math.min(h * 0.56, 110);
  const margem = T.id === 'post-its' ? 34 : 30;
  const xTexto = comIcone ? x + margem + tamIcone + 26 : x + margem;
  const largura = x + w - xTexto - 24;
  const altura = h - (T.id === 'post-its' ? 34 : 16);
  const fm = fonteMao(T);
  const { s, linhas } = ajustar(texto.replace(/\*/g, ''), T.id === 'tela-app' ? 50 : 66, largura, altura, fm.letra, fm.linha, 20);
  const alto = linhas.length * s * fm.linha;
  const yTexto = y + (T.id === 'post-its' ? 26 : 8) + (altura - alto) / 2;
  return { x: xTexto, y: yTexto, largura: Math.min(largura, Math.max(...linhas.map((l) => l.largura))), alto, tamIcone, margem };
};

/** um passo: caixa (do tema) com ícone à esquerda e o texto que se escreve */
export const Caixa: React.FC<{ t: number; at: number; x: number; y: number; w: number; h: number; texto: string; icone?: NomeIcone; indice: number; destaque?: boolean }> = ({
  t,
  at,
  x,
  y,
  w,
  h,
  texto,
  icone,
  indice,
  destaque,
}) => {
  const T = useTema();
  if (t < at) return null;
  const sem = semente(`caixa${indice}${texto}`);
  const tamIcone = Math.min(h * 0.56, 110);
  const margem = T.id === 'post-its' ? 34 : 30;
  const xTexto = icone ? x + margem + tamIcone + 26 : x + margem;
  const corTexto = destaque ? destaqueSobre(T, true) : T.c.traco;
  const corIcone = T.id === 'tela-app' ? T.c.destaque2 : destaque ? destaqueSobre(T, true) : T.c.traco;
  const yMeio = y + h / 2 + (T.id === 'post-its' ? 10 : 0);
  return (
    <>
      <FundoCaixa t={t} at={at} x={x} y={y} w={w} h={h} indice={indice} sem={sem} />
      {icone && T.id === 'tela-app' && t >= at + 0.15 ? (
        <div style={{ position: 'absolute', left: x + margem - 8, top: yMeio - tamIcone / 2 - 8, width: tamIcone + 16, height: tamIcone + 16, borderRadius: 999, background: T.c.nota4, opacity: eo(ramp(t, at + 0.15, 0.3)) }} />
      ) : null}
      {icone ? <Icone nome={icone} x={x + margem + tamIcone / 2} y={yMeio} tamanho={tamIcone * (T.id === 'tela-app' ? 0.7 : 1)} p={desenhar(t, at + 0.2, 0.45)} cor={corIcone} /> : null}
      <TextoMao t={t} at={at + 0.3} texto={texto} x={xTexto} y={y + (T.id === 'post-its' ? 26 : 8)} largura={x + w - xTexto - 24} altura={h - (T.id === 'post-its' ? 34 : 16)} tamanho={T.id === 'tela-app' ? 50 : 66} cor={corTexto} meio />
    </>
  );
};

/** cartão de coluna (post-it, caixa tremida ou cartão de quadro de tarefas), com o texto já escrito ao entrar */
export const Cartao: React.FC<{ t: number; at: number; x: number; y: number; w: number; h: number; texto: string; indice: number; erguido?: number; feito?: boolean }> = ({
  t,
  at,
  x,
  y,
  w,
  h,
  texto,
  indice,
  erguido = 0,
  feito,
}) => {
  const T = useTema();
  if (t < at) return null;
  const sem = semente(`cartao${indice}${texto}`);
  const s = spr(t, at, { damping: 14, stiffness: 220, mass: 0.6 });
  const rot0 = (sorteio(sem)() - 0.5) * (T.id === 'post-its' ? 7 : T.id === 'tela-app' ? 0 : 3);
  const sombra = T.id === 'post-its' ? `${2 + erguido * 6}px ${8 + erguido * 22}px ${12 + erguido * 18}px rgba(0,0,0,${0.22 + erguido * 0.08})` : T.id === 'tela-app' ? `0 ${6 + erguido * 18}px ${14 + erguido * 20}px ${T.a('moldura2', 0.18 + erguido * 0.15)}` : 'none';
  const fundo = T.id === 'post-its' ? corNota(T, indice) : T.id === 'tela-app' ? T.c.superficie : 'transparent';
  const fm = fonteMao(T);
  const tam = ajustar(texto, T.id === 'tela-app' ? 36 : 48, w - (feito ? 74 : 40), h - 36, fm.letra, fm.linha, 18).s;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot0 * (1 - erguido) + erguido * 4}deg) scale(${(0.75 + 0.25 * s) * (1 + erguido * 0.06)})`, opacity: Math.min(1, s * 1.6) }}>
      <div style={{ position: 'absolute', inset: 0, background: fundo, boxShadow: sombra, borderRadius: T.id === 'tela-app' ? 18 : 0, borderLeft: T.id === 'tela-app' ? `10px solid ${feito ? T.c.ok : T.c.destaque2}` : undefined }}>
        {T.id === 'post-its' ? <div style={{ height: 20, background: 'rgba(0,0,0,0.06)' }} /> : null}
      </div>
      {T.id === 'quadro' || T.id === 'lousa' ? (
        <svg width={w + 40} height={h + 40} viewBox={`-20 -20 ${w + 40} ${h + 40}`} style={{ position: 'absolute', left: -20, top: -20, overflow: 'visible' }}>
          <g filter={T.filtro}>
            <path d={caminhoCaixa(0, 0, w, h, sem, tremor(T) * 0.7)} fill={T.id === 'quadro' ? T.a('superficie', 0.85) : 'none'} stroke={feito ? T.c.ok : T.c.traco} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: T.id === 'tela-app' ? 28 : 20,
          right: feito ? 50 : 16,
          top: T.id === 'post-its' ? 26 : 12,
          bottom: 10,
          display: 'flex',
          alignItems: 'center',
          fontFamily: fm.fontFamily,
          fontWeight: fm.fontWeight,
          fontSize: tam,
          lineHeight: fm.linha,
          color: T.c.traco,
          filter: T.filtro,
        }}
      >
        <span>{texto}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- seta, círculo e risco

/** seta do tema entre dois pontos, que se desenha a partir de "at" */
export const Seta: React.FC<{ t: number; at: number; de: [number, number]; para: [number, number]; sem?: number }> = ({ t, at, de, para, sem = 7 }) => {
  const T = useTema();
  if (t < at) return null;
  const cor = T.id === 'lousa' ? T.c.destaque2 : T.id === 'tela-app' ? T.c.titulo : T.c.traco;
  return (
    <Desenho>
      <Traco d={caminhoSeta(de[0], de[1], para[0], para[1], sem, T.id === 'tela-app' ? 0 : tremor(T) * 0.6, 30)} p={desenhar(t, at, 0.4)} cor={cor} largura={T.id === 'tela-app' ? 9 : 7} />
    </Desenho>
  );
};

/** círculo de destaque em volta de um centro (cx, cy) com raios rx, ry */
export const Circulo: React.FC<{ t: number; at: number; cx: number; cy: number; rx: number; ry: number; sem?: number }> = ({ t, at, cx, cy, rx, ry, sem = 11 }) => {
  const T = useTema();
  if (t < at) return null;
  if (T.id === 'tela-app') {
    const p = eo(ramp(t, at, 0.4));
    return (
      <div
        style={{
          position: 'absolute',
          left: cx - rx,
          top: cy - ry,
          width: rx * 2,
          height: ry * 2,
          borderRadius: ry,
          border: `9px solid ${T.c.destaque}`,
          boxShadow: `0 0 34px ${T.a('destaque', 0.7)}`,
          opacity: p,
          transform: `scale(${1.25 - 0.25 * p})`,
        }}
      />
    );
  }
  return (
    <Desenho>
      <Traco d={caminhoCirculo(cx, cy, rx, ry, sem, tremor(T))} p={desenhar(t, at, 0.55)} cor={T.c.destaque} largura={T.giz ? 9 : 10} />
    </Desenho>
  );
};

/** risco de destaque embaixo do título (em y), de x1 a x2 */
export const Risco: React.FC<{ t: number; at: number; x1: number; x2: number; y: number }> = ({ t, at, x1, x2, y }) => {
  const T = useTema();
  if (t < at) return null;
  if (T.id === 'tela-app') {
    const p = eo(ramp(t, at, 0.35));
    return <div style={{ position: 'absolute', left: x1, top: y - 5, width: (x2 - x1) * p, height: 10, borderRadius: 10, background: T.c.destaque }} />;
  }
  return (
    <Desenho>
      <Traco d={caminhoRisco(x1, y, x2, 5, Math.max(4, tremor(T)))} p={desenhar(t, at, 0.45)} cor={T.giz ? T.c.traco : T.c.destaque} largura={12} />
    </Desenho>
  );
};

// ---------------------------------------------------------------- janela de app, cursor e onda do clique

export type LayoutJanela = {
  x: number;
  y: number;
  w: number;
  h: number;
  barra: number;
  menu: number;
  conteudo: { x: number; y: number; w: number; h: number };
  botao: { x: number; y: number; w: number; h: number };
  grade: { x: number; y: number; w: number; h: number }[];
};

/** onde fica cada parte da janela (a cena usa para levar o cursor até o botão) */
export const layoutJanela = (x: number, y: number, w: number, h: number): LayoutJanela => {
  const barra = 84;
  const menu = Math.round(w * 0.25);
  const conteudo = { x: x + menu + 34, y: y + barra + 36, w: w - menu - 68, h: h - barra - 72 };
  const botao = { w: 240, h: 86, x: conteudo.x + conteudo.w - 240, y: conteudo.y };
  const gy = conteudo.y + 140;
  const gw = (conteudo.w - 26) / 2;
  const gh = Math.min(200, (conteudo.y + conteudo.h - gy - 26) / 2);
  const grade = [0, 1, 2, 3].map((i) => ({ x: conteudo.x + (i % 2) * (gw + 26), y: gy + Math.floor(i / 2) * (gh + 26), w: gw, h: gh }));
  return { x, y, w, h, barra, menu, conteudo, botao, grade };
};

/** janela de painel genérica (nunca a cara de um app real): barra com 3 bolinhas e o endereço, menu lateral,
 *  título da seção, botão e itens. Na tela de app, colorida; no quadro e na lousa, desenhada à mão; nos
 *  post-its, uma folha impressa presa com fita. */
export const Janela: React.FC<{
  t: number;
  at: number;
  L: LayoutJanela;
  endereco: string;
  secao: string;
  botao: string;
  menu?: string[];
  itens?: string[];
  novo?: string;
  tNovo?: number;
  aperto?: number;
}> = ({ t, at, L, endereco, secao, botao, menu, itens, novo, tNovo = 9999, aperto = 0 }) => {
  const T = useTema();
  if (t < at) return null;
  const s = spr(t, at, { damping: 18, stiffness: 170 });
  const esbocada = T.id === 'quadro' || T.id === 'lousa';
  const tinta = T.c.traco;
  const corBotao = esbocada ? T.c.destaque : T.c.destaque2;
  const itensMenu = (menu && menu.length ? menu : ['', '', '', '']).slice(0, 5);
  const sem = semente(`janela${secao}`);
  const tamSecao = Math.min(54, (L.conteudo.w - L.botao.w - 30) / (LETRA.textoForte * Math.max(1, secao.length)));
  const textoBotao = `+ ${botao}`;
  const tamBotao = Math.min(38, (L.botao.w - 30) / (LETRA.textoForte * textoBotao.length));
  const fm = fonteMao(T);
  const fonte = esbocada ? fm.fontFamily : T.f.texto;
  const g = (i: number) => L.grade[i];
  const lista = (itens ?? []).slice(0, novo ? 3 : 4);
  const itemNovo = novo && t >= tNovo;
  const entra = Math.min(1, s * 1.4);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: entra, transform: `translateY(${(1 - s) * 80}px)` }}>
      {/* corpo da janela */}
      {esbocada ? (
        <Desenho>
          <path d={caminhoCaixa(L.x, L.y, L.w, L.h, sem, tremor(T) * 0.6)} fill={T.id === 'quadro' ? T.a('superficie', 0.9) : 'none'} stroke={tinta} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <path d={caminhoRisco(L.x + 4, L.y + L.barra, L.x + L.w - 4, sem + 1, 3)} fill="none" stroke={tinta} strokeWidth={5} strokeLinecap="round" />
          <path d={`M ${L.x + L.menu} ${L.y + L.barra + 6} C ${L.x + L.menu + 4} ${L.y + L.h * 0.5}, ${L.x + L.menu - 3} ${L.y + L.h * 0.8}, ${L.x + L.menu + 2} ${L.y + L.h - 8}`} fill="none" stroke={tinta} strokeWidth={4} strokeLinecap="round" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={L.x + 44 + i * 40} cy={L.y + L.barra / 2} r={11} fill="none" stroke={tinta} strokeWidth={4} />
          ))}
        </Desenho>
      ) : (
        <>
          <div style={{ position: 'absolute', left: L.x, top: L.y, width: L.w, height: L.h, borderRadius: 36, background: T.c.superficie, boxShadow: T.id === 'tela-app' ? `0 30px 60px ${T.a('moldura2', 0.45)}` : '3px 14px 22px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
            <div style={{ height: L.barra, background: T.c.moldura }} />
            <div style={{ position: 'absolute', left: 0, top: L.barra, width: L.menu, bottom: 0, background: T.a('linha', 0.45) }} />
          </div>
          {(T.id === 'tela-app' ? [T.c.nota1, T.c.nota2, T.c.nota3] : [T.c.nota2, T.c.nota1, T.c.nota4]).map((c, i) => (
            <div key={i} style={{ position: 'absolute', left: L.x + 34 + i * 40, top: L.y + L.barra / 2 - 12, width: 24, height: 24, borderRadius: 12, background: c }} />
          ))}
          {T.id === 'post-its'
            ? [
                [L.x + 30, L.y - 22, -8],
                [L.x + L.w - 170, L.y - 22, 7],
              ].map(([fx, fy, r], i) => <div key={i} style={{ position: 'absolute', left: fx, top: fy, width: 140, height: 46, background: T.a('moldura2', 0.45), transform: `rotate(${r}deg)` }} />)
            : null}
        </>
      )}
      {/* endereço genérico */}
      <div
        style={{
          position: 'absolute',
          left: L.x + 164,
          top: L.y + L.barra / 2 - 22,
          width: L.w - 220,
          height: 44,
          borderRadius: 22,
          background: esbocada ? 'transparent' : T.c.superficie,
          border: esbocada ? `3px solid ${T.a('traco', 0.6)}` : 'none',
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px',
          boxSizing: 'border-box',
          fontFamily: T.f.mono,
          fontSize: 24,
          color: esbocada ? T.a('traco', 0.75) : T.c.suave,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          filter: T.filtro,
        }}
      >
        {endereco}
      </div>
      {/* menu lateral */}
      {itensMenu.map((m, i) => {
        const ativo = i === 1;
        const top = L.y + L.barra + 46 + i * 74;
        return (
          <React.Fragment key={i}>
            {ativo ? <div style={{ position: 'absolute', left: L.x + 18, top: top - 14, width: L.menu - 36, height: 58, borderRadius: 14, background: esbocada ? T.a('destaque', 0.18) : T.c.nota4 }} /> : null}
            {m ? (
              <div style={{ position: 'absolute', left: L.x + 34, top: top - 6, width: L.menu - 52, fontFamily: fonte, fontWeight: esbocada ? 700 : 600, fontSize: esbocada ? 36 : 26, color: ativo ? (esbocada ? T.c.destaque : T.c.destaque2) : esbocada ? tinta : T.c.suave, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', filter: T.filtro }}>
                {m}
              </div>
            ) : (
              <div style={{ position: 'absolute', left: L.x + 36, top, width: [150, 120, 136, 104][i % 4], height: 22, borderRadius: 11, background: ativo ? (esbocada ? T.c.destaque : T.c.destaque2) : esbocada ? T.a('traco', 0.35) : T.c.linha }} />
            )}
          </React.Fragment>
        );
      })}
      {/* título da seção */}
      <div style={{ position: 'absolute', left: L.conteudo.x, top: L.conteudo.y + 6, width: L.conteudo.w - L.botao.w - 20, fontFamily: esbocada ? fm.fontFamily : T.f.texto, fontWeight: 800, fontSize: esbocada ? tamSecao * 1.3 : tamSecao, lineHeight: 1.15, color: tinta, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', filter: T.filtro }}>
        {secao}
      </div>
      {/* botão */}
      <div
        style={{
          position: 'absolute',
          left: L.botao.x,
          top: L.botao.y,
          width: L.botao.w,
          height: L.botao.h,
          borderRadius: 22,
          background: esbocada ? T.a('destaque', 0.16 + aperto * 0.2) : corBotao,
          border: esbocada ? `6px solid ${corBotao}` : 'none',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: esbocada ? fm.fontFamily : T.f.texto,
          fontWeight: 800,
          fontSize: esbocada ? tamBotao * 1.35 : tamBotao,
          color: esbocada ? corBotao : T.c.superficie,
          transform: `scale(${1 - aperto * 0.08})`,
          boxShadow: esbocada ? 'none' : `0 ${10 - aperto * 8}px 20px ${T.a('destaque2', 0.35)}`,
          filter: T.filtro,
        }}
      >
        {textoBotao}
      </div>
      {/* itens (cartões da seção) */}
      {[0, 1, 2, 3].map((i) => {
        const caixa = g(i);
        const k = itemNovo ? i - 1 : i;
        const texto = itemNovo && i === 0 ? novo! : k >= 0 && k < lista.length ? lista[k] : '';
        const destacado = itemNovo && i === 0;
        const pN = destacado ? spr(t, tNovo, { damping: 13, stiffness: 240 }) : 1;
        return (
          <div key={i} style={{ position: 'absolute', left: caixa.x, top: caixa.y, width: caixa.w, height: caixa.h, transform: destacado ? `scale(${0.8 + 0.2 * pN})` : undefined, opacity: destacado ? Math.min(1, pN * 1.5) : 1 }}>
            {esbocada ? (
              <svg width={caixa.w + 20} height={caixa.h + 20} viewBox={`-10 -10 ${caixa.w + 20} ${caixa.h + 20}`} style={{ position: 'absolute', left: -10, top: -10, overflow: 'visible' }}>
                <g filter={T.filtro}>
                  <path d={caminhoCaixa(0, 0, caixa.w, caixa.h, sem + 10 + i, tremor(T) * 0.4)} fill={destacado ? T.a('destaque', 0.15) : 'none'} stroke={destacado ? T.c.destaque : T.a('traco', 0.7)} strokeWidth={5} strokeLinecap="round" />
                </g>
              </svg>
            ) : (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: destacado ? T.c.nota4 : T.c.nota5, border: `3px solid ${destacado ? T.c.destaque2 : T.c.linha}` }} />
            )}
            {texto ? (
              <div style={{ position: 'absolute', left: 24, right: 20, top: 22, fontFamily: esbocada ? fm.fontFamily : T.f.texto, fontWeight: esbocada ? 700 : 700, fontSize: esbocada ? 44 : 32, lineHeight: 1.15, color: destacado ? (esbocada ? T.c.destaque : T.c.destaque2) : tinta, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', filter: T.filtro }}>
                {texto}
              </div>
            ) : (
              <div style={{ position: 'absolute', left: 24, top: 30, width: [110, 150, 90, 130][i], height: 18, borderRadius: 9, background: esbocada ? T.a('traco', 0.3) : T.c.linha }} />
            )}
            <div style={{ position: 'absolute', left: 24, top: caixa.h - 52, width: caixa.w * 0.45, height: 14, borderRadius: 7, background: esbocada ? T.a('traco', 0.2) : T.a('suave', 0.35) }} />
          </div>
        );
      })}
    </div>
  );
};

/** ponteiro do mouse (ponta em x, y); "aperto" de 0 a 1 encolhe no clique */
export const Cursor: React.FC<{ x: number; y: number; aperto?: number; opacidade?: number }> = ({ x, y, aperto = 0, opacidade = 1 }) => {
  const T = useTema();
  const esbocada = T.id === 'quadro' || T.id === 'lousa';
  return (
    <svg width={90} height={110} viewBox="-4 -4 44 54" style={{ position: 'absolute', left: x - 4 * 2.2, top: y - 4 * 2.2, width: 44 * 2.2, height: 54 * 2.2, overflow: 'visible', opacity: opacidade, transform: `scale(${1 - aperto * 0.15})`, transformOrigin: '8px 8px', filter: T.filtro ?? (T.id === 'tela-app' ? 'drop-shadow(0 6px 8px rgba(15,23,42,0.35))' : undefined) }}>
      <path
        d="M0 0 L0 40 L11 30 L19 48 L27 44 L19 27 L34 27Z"
        fill={esbocada ? T.c.fundo : T.id === 'tela-app' ? T.c.traco : T.c.traco}
        stroke={esbocada ? T.c.traco : T.c.superficie}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** onda do clique saindo do centro (x, y), a partir de "at" */
export const Onda: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  const T = useTema();
  if (t < at || t > at + 0.9) return null;
  const p = ramp(t, at, 0.7);
  const r = 34 + eo(p) * 120;
  return <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, border: `8px solid ${T.c.destaque}`, boxSizing: 'border-box', opacity: 1 - p, filter: T.filtro }} />;
};

// ---------------------------------------------------------------- card final

/** card final: assinatura, frase, marca, fontes e o aviso de narração por IA */
export const CardFinal: React.FC<{ t: number; at: number; fontes: string[]; assinatura: string; frase: string | null; marca: { nome: string; cor: string | null } | null; avisoIA: boolean }> = ({
  t,
  at,
  fontes,
  assinatura,
  frase,
  marca,
  avisoIA,
}) => {
  const T = useTema();
  if (t < at) return null;
  const s = spr(t, at, { damping: 16, stiffness: 180 });
  const x = 110;
  const w = 860;
  const y = 560;
  const h = 760;
  const fm = fonteMao(T);
  // a assinatura (um @ longo não tem espaço): o tamanho em que ela cabe em até 3 linhas, quebrando onde precisar
  let tamAss = T.id === 'tela-app' ? 76 : 104;
  while (tamAss > 30 && Math.ceil((assinatura.length * fm.letra * tamAss) / (w - 130)) * tamAss * 1.1 > 250) tamAss -= 2;
  const corDest = destaqueSobre(T, T.id !== 'quadro' && T.id !== 'lousa');
  const escuroNoCard = T.id === 'lousa';
  const corTexto = escuroNoCard ? T.c.texto : T.c.traco;
  const corMiuda = escuroNoCard ? T.c.suave : T.id === 'tela-app' ? T.c.suave : T.a('traco', 0.62);
  const sem = semente(`final${assinatura}`);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 40}px)` }}>
      {T.id === 'post-its' ? (
        <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: T.c.nota1, transform: 'rotate(-1.5deg)', boxShadow: '4px 16px 24px rgba(0,0,0,0.22)' }}>
          <div style={{ height: 40, background: 'rgba(0,0,0,0.06)' }} />
        </div>
      ) : T.id === 'tela-app' ? (
        <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 40, background: T.c.superficie, boxShadow: `0 30px 60px ${T.a('moldura2', 0.45)}` }} />
      ) : (
        <Desenho>
          <Traco d={caminhoCaixa(x, y, w, h, sem, tremor(T) * 0.8)} p={desenhar(t, at, 0.6)} largura={7} />
        </Desenho>
      )}
      <div style={{ position: 'absolute', left: x + 60, width: w - 120, top: y + 90, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18, filter: T.filtro }}>
        {marca ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: T.f.texto, fontWeight: 800, fontSize: Math.min(40, 1400 / Math.max(1, marca.nome.length)), color: corTexto, maxWidth: w - 120 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: corDest, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{marca.nome}</span>
          </div>
        ) : null}
        <div style={{ fontFamily: fm.fontFamily, fontWeight: fm.fontWeight, fontSize: tamAss, lineHeight: 1.1, color: corDest, overflowWrap: 'anywhere', maxWidth: w - 120 }}>{assinatura}</div>
        {frase ? <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: Math.min(40, 1500 / Math.max(1, frase.length)), lineHeight: 1.25, color: corTexto }}>{frase}</div> : null}
        {fontes.length ? (
          <div style={{ marginTop: 16, fontFamily: T.f.mono, fontSize: 22, lineHeight: 1.4, color: corMiuda }}>
            {fontes.slice(0, 3).map((f, i) => (
              <div key={i}>fonte: {f}</div>
            ))}
          </div>
        ) : null}
      </div>
      {avisoIA ? <div style={{ position: 'absolute', left: x, width: w, top: y + h - 70, textAlign: 'center', fontFamily: T.f.mono, fontSize: 22, color: corMiuda, filter: T.filtro }}>Narração gerada por IA</div> : null}
    </div>
  );
};
