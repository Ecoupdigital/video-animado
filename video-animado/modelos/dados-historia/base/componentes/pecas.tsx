import React from 'react';
import { contar, eo, ramp, spr } from './anima';
import type { PalavraTitulo, Valor } from './roteiro';
import { trechos, valorEscrito } from './roteiro';
import { faces, misturar, useTema, type Tema } from './tema';

// Peças da família Dados e história. Todas pegam cor e fonte do tema (useTema) e o tempo por prop (t, em
// segundos). O tema troca a cara da peça, não o que ela faz: a Coluna é coluna de 3 faces no isométrico,
// barra chapada na linha do tempo e no mapa e barra impressa em retícula no jornal; o Marco é cartão com
// ponto no trilho, alfinete no mapa e recorte no jornal; o Recorte é papel que cai e assenta com fita.
// Nenhum texto fixo de dado ou de história: o texto vem do roteiro do vídeo ou das respostas.
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
export const LETRA = { mao: 0.42, texto: 0.58, textoForte: 0.62, mono: 0.62, serif: 0.6 } as const;
export const letraTitulo = (T: Tema) => (T.serifado ? LETRA.serif : LETRA.textoForte);

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
export const ajustar = (texto: string, base: number, largura: number, alturaMax: number, letra: number, linha = 1.2, minimo = 20) => {
  for (let s = base; s > minimo; s -= 2) {
    const ls = quebrar(texto, s, largura, letra);
    const maior = Math.max(0, ...texto.split(/\s+/).map((p) => p.length * letra * s));
    if (ls.length * s * linha <= alturaMax && maior <= largura) return { s, linhas: ls };
  }
  return { s: minimo, linhas: quebrar(texto, minimo, largura, letra) };
};

/** quanto o algarismo da fonte do número é mais largo que a conta de larguraNumero (Lora 700 e Inter 800 a 900, medidos no Chrome) */
const fatorNumero = (T: Tema) => (T.f.numero === T.f.serif ? 1.26 : 1.06);
/** largura de um número escrito, em em (algarismo, separador, símbolo) */
const larguraNumero = (texto: string) =>
  [...texto].reduce((s, ch) => s + (/[0-9]/.test(ch) ? 0.66 : /[.,]/.test(ch) ? 0.3 : ch === ' ' ? 0.3 : ch === '%' ? 0.95 : /[+−-]/.test(ch) ? 0.64 : ch === '$' ? 0.64 : 0.7), 0);

// ---------------------------------------------------------------- caminhos à mão

const f1 = (n: number) => n.toFixed(1);
const pt = (p: number[]) => `${f1(p[0])} ${f1(p[1])}`;

/** círculo de destaque à mão: uma volta e um pouco, que não fecha exatamente */
export const caminhoCirculo = (cx: number, cy: number, rx: number, ry: number, sem: number, amp = 1) => {
  const r = sorteio(sem);
  const pts: number[][] = [];
  const ini = (200 * Math.PI) / 180;
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const a = ini + (i / n) * Math.PI * 2.18;
    const k = 1 + (r() - 0.5) * 0.07 * amp - (i === n ? 0.06 : 0);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
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
      stroke={cor ?? T.c.destaque}
      strokeWidth={largura}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={parcial ? '1 1' : undefined}
      strokeDashoffset={parcial ? 1 - p : undefined}
      opacity={opacidade}
    />
  );
};
/** camada SVG do tamanho da tela */
export const Desenho: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style }}>
    {children}
  </svg>
);
/** progresso de um traço que começa em "at" e leva "d" segundos */
export const desenhar = (t: number, at: number, d = 0.5) => eo(ramp(t, at, d));

// ---------------------------------------------------------------- texto

/** medida do título: tamanho, linhas e altura */
export const medirTitulo = (T: Tema, palavras: string[], tamanho: number, largura: number, alturaMax: number) => {
  const letra = letraTitulo(T);
  const linha = T.serifado ? 1.12 : 1.08;
  const { s, linhas } = ajustar(palavras.join(' '), tamanho, largura, alturaMax, letra, linha, 34);
  return { s, linhas, linha, alto: linhas.length * s * linha };
};

/** título: cada palavra entra no instante em que é falada; *palavra* no destaque */
export const Titulo: React.FC<{ t: number; palavras: PalavraTitulo[]; topo?: number; tamanho?: number; alturaMax?: number; largura?: number; esquerda?: number; alinhar?: 'left' | 'center'; cor?: string }> = ({
  t,
  palavras,
  topo = 300,
  tamanho,
  alturaMax = 200,
  largura = 900,
  esquerda = 90,
  alinhar = 'left',
  cor,
}) => {
  const T = useTema();
  const base = tamanho ?? (T.serifado ? 92 : 84);
  const m = medirTitulo(T, palavras.map((p) => p.w), base, largura, alturaMax);
  return (
    <div style={{ position: 'absolute', top: topo, left: esquerda, width: largura, display: 'flex', flexWrap: 'wrap', justifyContent: alinhar === 'center' ? 'center' : 'flex-start', columnGap: m.s * 0.28 }}>
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
              letterSpacing: T.serifado ? '0' : '-0.02em',
              color: x.d ? T.c.destaque : cor ?? T.c.titulo,
              opacity: p,
              transform: `translateY(${(1 - p) * 18}px)`,
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

/** texto com *trecho* no destaque, que entra com um fade curto */
export const Texto: React.FC<{ t: number; at: number; texto: string; x: number; y: number; largura: number; altura: number; tamanho: number; fonte?: string; peso?: number; cor?: string; corDestaque?: string; alinhar?: 'left' | 'center' | 'right'; letra?: number; linha?: number; meio?: boolean; caixa?: boolean }> = ({
  t,
  at,
  texto,
  x,
  y,
  largura,
  altura,
  tamanho,
  fonte,
  peso = 600,
  cor,
  corDestaque,
  alinhar = 'left',
  letra = LETRA.texto,
  linha = 1.22,
  meio = false,
  caixa = false,
}) => {
  const T = useTema();
  if (t < at) return null;
  const limpo = texto.replace(/\*/g, '');
  const { s, linhas } = ajustar(limpo, tamanho, largura, altura, letra, linha, 18);
  const alto = linhas.length * s * linha;
  const p = eo(ramp(t, at, 0.3));
  return (
    <div style={{ position: 'absolute', left: x, top: meio ? y + (altura - alto) / 2 : y, width: largura, fontFamily: fonte ?? T.f.texto, fontWeight: peso, fontSize: s, lineHeight: linha, color: cor ?? T.c.texto, textAlign: alinhar, opacity: p, transform: `translateY(${(1 - p) * 12}px)`, overflowWrap: 'anywhere' }}>
      <span style={caixa ? { display: 'inline-block', background: T.c.superficie, padding: '8px 20px', borderRadius: 16, boxShadow: '0 6px 14px rgba(0,0,0,0.18)' } : undefined}>
        {trechos(texto).map(([tx, dest], i) => (
          <span key={i} style={dest ? { color: corDestaque ?? T.c.destaque } : undefined}>
            {tx}
          </span>
        ))}
      </span>
    </div>
  );
};

/** rótulo do topo (mono), dentro da área segura */
export const Topo: React.FC<{ rotulo: string }> = ({ rotulo }) => {
  const T = useTema();
  const tam = Math.max(18, Math.min(28, 900 / (LETRA.mono * Math.max(1, rotulo.length) * 1.12 + 2)));
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 232, height: 56, display: 'flex', alignItems: 'center', justifyContent: T.id === 'jornal' ? 'center' : 'flex-start' }}>
      <div
        style={{
          fontFamily: T.f.mono,
          fontWeight: 500,
          fontSize: tam,
          letterSpacing: '0.12em',
          color: T.id === 'jornal' ? T.c.texto : T.c.suave,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          // no mapa, o rótulo vai numa etiqueta clara para ler em cima do desenho
          ...(T.id === 'mapa' ? { background: T.a('superficie', 0.92), padding: '6px 18px', borderRadius: 14, border: `2px solid ${T.c.linha}` } : {}),
        }}
      >
        {rotulo}
      </div>
    </div>
  );
};

/** legenda da cena (e a fonte do dado, em mono), embaixo, dentro da área segura: faixa clara no isométrico,
 *  tarja escura no mapa, tira de papel com fita no jornal, texto solto na linha do tempo */
export const Legenda: React.FC<{ t: number; at: number; texto?: string; fonte?: string }> = ({ t, at, texto, fonte }) => {
  const T = useTema();
  if (t < at || (!texto && !fonte)) return null;
  const p = eo(ramp(t, at, 0.35));
  const comFaixa = T.id !== 'linha-do-tempo';
  const pad = comFaixa ? 28 : 0;
  const larg = 900 - pad * 2;
  const alturaTexto = fonte ? 74 : 100;
  const { s } = texto ? ajustar(texto, 38, larg, alturaTexto, LETRA.texto, 1.25, 20) : { s: 0 };
  const fundo = T.id === 'isometrico' ? T.a('faixa', 0.09) : T.id === 'mapa' ? T.a('etiqueta', 0.9) : T.id === 'jornal' ? T.c.superficie : 'transparent';
  const cor = T.id === 'mapa' ? T.c.sobre : T.id === 'jornal' ? T.c.tinta : T.c.texto;
  const corFonte = T.id === 'mapa' ? T.a('sobre', 0.72) : T.id === 'jornal' ? misturar(T.c.tinta, T.c.superficie, 0.35) : T.c.suave;
  return (
    <div style={{ position: 'absolute', left: 90, width: 900, top: 1408, opacity: p, transform: `translateY(${(1 - p) * 14}px) rotate(${T.id === 'jornal' ? -0.8 : 0}deg)` }}>
      <div style={{ background: fundo, borderRadius: T.id === 'jornal' ? 2 : 22, padding: comFaixa ? `18px ${pad}px` : 0, boxShadow: T.id === 'jornal' ? '2px 8px 14px rgba(0,0,0,0.25)' : undefined, textAlign: T.id === 'isometrico' ? 'center' : 'left' }}>
        {texto ? <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: s, lineHeight: 1.25, color: cor }}>{texto}</div> : null}
        {fonte ? <div style={{ marginTop: texto ? 6 : 0, fontFamily: T.f.mono, fontSize: 22, color: corFonte, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>fonte: {fonte}</div> : null}
      </div>
      {T.id === 'jornal' ? <div style={{ position: 'absolute', left: -18, top: -14, width: 120, height: 40, background: T.a('faixa', 0.8), transform: 'rotate(-14deg)' }} /> : null}
    </div>
  );
};

// ---------------------------------------------------------------- número que conta

/** número grande que conta de 0 até o valor em "d" segundos a partir de "at" (número de 1 dígito não conta);
 *  o tamanho sai do texto final, para caber na largura sem cortar nem mudar de tamanho enquanto conta */
export const Contador: React.FC<{ t: number; at: number; valor: Valor; x: number; y: number; largura: number; tamanho?: number; cor?: string; d?: number; alinhar?: 'left' | 'center' }> = ({
  t,
  at,
  valor,
  x,
  y,
  largura,
  tamanho = 220,
  cor,
  d = 0.7,
  alinhar = 'left',
}) => {
  const T = useTema();
  if (t < at) return null;
  const casas = valor.casas ?? 0;
  const final = valorEscrito(valor);
  const tam = Math.min(tamanho, largura / Math.max(1, larguraNumero(final) * fatorNumero(T)));
  const umDigito = Math.abs(valor.numero) < 10 && casas === 0;
  const bruto = umDigito ? valor.numero : contar(t, at, valor.numero, d);
  const n = casas ? bruto : Math.round(bruto);
  const p = eo(ramp(t, at, 0.2));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: largura, textAlign: alinhar, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <span style={{ fontFamily: T.f.numero, fontWeight: T.pesoNumero, fontSize: tam, lineHeight: 1.08, color: cor ?? T.corNumero, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', letterSpacing: T.serifado ? 0 : '-0.02em' }}>{valorEscrito(valor, n)}</span>
    </div>
  );
};
/** altura do número grande (para empilhar o resto da cena embaixo) */
export const alturaContador = (valor: Valor, largura: number, tamanho: number, T: Tema) => Math.min(tamanho, largura / Math.max(1, larguraNumero(valorEscrito(valor)) * fatorNumero(T))) * 1.08;
/** largura do número já no tamanho em que ele cabe */
export const larguraContador = (valor: Valor, largura: number, tamanho: number, T: Tema) => (alturaContador(valor, largura, tamanho, T) / 1.08) * larguraNumero(valorEscrito(valor)) * fatorNumero(T);

// ---------------------------------------------------------------- coluna (isométrica, chapada ou impressa)

/** losango do piso isométrico (centro, meia largura, meia altura) */
export const Piso: React.FC<{ cx: number; cy: number; mw: number; mh: number; opacidade?: number }> = ({ cx, cy, mw, mh, opacidade = 1 }) => {
  const T = useTema();
  return (
    <path d={`M ${cx} ${cy - mh} L ${cx + mw} ${cy} L ${cx} ${cy + mh} L ${cx - mw} ${cy} Z`} fill={T.c.piso} stroke={T.c.linha} strokeWidth={4} opacity={opacidade} />
  );
};

/** bloco isométrico de 3 faces: base em (cx, cy) (centro do losango de baixo), meia largura a, altura h */
export const Bloco: React.FC<{ cx: number; cy: number; a: number; h: number; cor: string }> = ({ cx, cy, a, h, cor }) => {
  const F = faces(cor);
  const m = a / 2;
  return (
    <g>
      <path d={`M ${f1(cx - a)} ${f1(cy)} L ${f1(cx)} ${f1(cy + m)} L ${f1(cx)} ${f1(cy + m - h)} L ${f1(cx - a)} ${f1(cy - h)} Z`} fill={F.esquerda} />
      <path d={`M ${f1(cx)} ${f1(cy + m)} L ${f1(cx + a)} ${f1(cy)} L ${f1(cx + a)} ${f1(cy - h)} L ${f1(cx)} ${f1(cy + m - h)} Z`} fill={F.direita} />
      <path d={`M ${f1(cx)} ${f1(cy - m - h)} L ${f1(cx + a)} ${f1(cy - h)} L ${f1(cx)} ${f1(cy + m - h)} L ${f1(cx - a)} ${f1(cy - h)} Z`} fill={F.tampa} />
    </g>
  );
};

/** moeda de enfeite (isométrico), centro em (cx, cy), com o símbolo escrito */
export const Moeda: React.FC<{ cx: number; cy: number; r?: number; simbolo?: string }> = ({ cx, cy, r = 48, simbolo = 'R$' }) => {
  const T = useTema();
  return (
    <g>
      <ellipse cx={cx} cy={cy + r * 0.25} rx={r} ry={r / 2} fill={misturar(T.c.destaque2, '#000000', 0.2)} />
      <ellipse cx={cx} cy={cy} rx={r} ry={r / 2} fill={misturar(T.c.destaque2, '#FFFFFF', 0.35)} />
      <text x={cx} y={cy + r * 0.2} textAnchor="middle" fontFamily={T.f.texto} fontWeight={800} fontSize={r * 0.55} fill={misturar(T.c.destaque2, '#000000', 0.45)}>
        {simbolo}
      </text>
    </g>
  );
};

/** quanto a coluna cresceu (0 a 1) a partir de "at": sobe em 0,6 s e assenta */
export const subida = (t: number, at: number) => (t < at ? 0 : Math.min(1, spr(t, at, { damping: 15, stiffness: 120, mass: 0.7 })));

/** coluna do gráfico no tema: no isométrico, base em (x, y) centro do losango; nos outros, base no meio de baixo */
export const Coluna: React.FC<{ t: number; at: number; x: number; y: number; largura: number; altura: number; destaque?: boolean; rotulo?: string; idPadrao?: string }> = ({ t, at, x, y, largura, altura, destaque, rotulo, idPadrao }) => {
  const T = useTema();
  if (t < at) return null;
  const u = subida(t, at);
  const h = Math.max(4, altura * u);
  const pr = eo(ramp(t, at + 0.15, 0.3));
  const corRot = destaque ? T.c.destaque : T.id === 'jornal' ? T.c.tinta : T.c.suave;
  const rot = rotulo ? (
    <text x={x} y={T.id === 'isometrico' ? y + largura / 2 / 2 + 56 : y + 50} textAnchor="middle" fontFamily={T.f.mono} fontWeight={500} fontSize={Math.min(32, (largura * 1.5) / (LETRA.mono * Math.max(1, rotulo.length)))} fill={corRot} opacity={pr}>
      {rotulo}
    </text>
  ) : null;
  if (T.id === 'isometrico') {
    const a = largura / 2;
    return (
      <g>
        <Bloco cx={x} cy={y} a={a} h={h} cor={destaque ? T.c.destaque : T.c.barra} />
        {rot}
      </g>
    );
  }
  const w = largura;
  const cor = destaque ? T.c.destaque : T.c.barra;
  if (T.id === 'jornal') {
    return (
      <g>
        <rect x={x - w / 2} y={y - h} width={w} height={h} fill={destaque ? T.c.tinta : `url(#${idPadrao ?? 'reticula'})`} stroke={T.c.tinta} strokeWidth={4} />
        {rot}
      </g>
    );
  }
  const r = Math.min(16, w / 4, h / 2);
  return (
    <g>
      <path d={`M ${f1(x - w / 2)} ${f1(y)} L ${f1(x - w / 2)} ${f1(y - h + r)} Q ${f1(x - w / 2)} ${f1(y - h)} ${f1(x - w / 2 + r)} ${f1(y - h)} L ${f1(x + w / 2 - r)} ${f1(y - h)} Q ${f1(x + w / 2)} ${f1(y - h)} ${f1(x + w / 2)} ${f1(y - h + r)} L ${f1(x + w / 2)} ${f1(y)} Z`} fill={cor} />
      {rot}
    </g>
  );
};

/** padrão de retícula (pontos de jornal): fundo do papel um pouco mais escuro e pontos de tinta */
export const Reticula: React.FC<{ id: string; passo?: number }> = ({ id, passo = 14 }) => {
  const T = useTema();
  const fundo = misturar(T.c.superficie, T.c.tinta, 0.14);
  const ponto = misturar(T.c.tinta, T.c.superficie, 0.3);
  return (
    <defs>
      <pattern id={id} width={passo} height={passo} patternUnits="userSpaceOnUse">
        <rect width={passo} height={passo} fill={fundo} />
        <circle cx={passo / 2} cy={passo / 2} r={passo * 0.31} fill={ponto} />
      </pattern>
    </defs>
  );
};

// ---------------------------------------------------------------- marco da linha do tempo

/** marco: o ponto no trilho (em x) e o cartão com o ano e a frase; o último fica cheio no destaque */
export const Marco: React.FC<{ t: number; at: number; trilho: number; x: number; y: number; w: number; h: number; ano: string; texto: string; ultimo?: boolean; indice: number }> = ({
  t,
  at,
  trilho,
  x,
  y,
  w,
  h,
  ano,
  texto,
  ultimo,
  indice,
}) => {
  const T = useTema();
  if (t < at) return null;
  const s = spr(t, at, { damping: 13, stiffness: 220, mass: 0.6 });
  const e = Math.min(1, s * 1.5);
  const cy = y + h / 2;
  const jornal = T.id === 'jornal';
  const rot = jornal ? (sorteio(semente(`marco${indice}${ano}`))() - 0.5) * 4 : 0;
  const cheio = ultimo;
  const fundoCartao = jornal ? T.c.superficie : cheio ? T.c.destaque : T.id === 'isometrico' ? T.a('superficie', 0.92) : T.c.superficie;
  const corAno = jornal ? (cheio ? T.c.destaque : T.c.titulo) : cheio ? T.c.sobre : T.c.destaque;
  const corTexto = jornal ? T.c.tinta : cheio ? T.a('sobre', 0.88) : T.c.tinta;
  const tamAno = Math.min(60, (w * 0.62) / (0.66 * Math.max(1, ano.length)));
  const { s: tamTexto } = ajustar(texto, 38, w - 56, h - tamAno * 1.15 - 28, LETRA.texto, 1.2, 18);
  const r = cheio ? 34 : 26;
  const marcador =
    T.id === 'mapa' && cheio ? (
      <Pino x={trilho} y={cy + 10} t={t} at={at} tamanho={70} />
    ) : (
      <div
        style={{
          position: 'absolute',
          left: trilho - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          boxSizing: 'border-box',
          background: cheio ? T.c.destaque : jornal ? T.c.etiqueta : T.id === 'isometrico' ? T.c.fundo : T.c.superficie,
          border: jornal ? `6px solid ${misturar(T.c.etiqueta, '#FFFFFF', 0.3)}` : `10px solid ${T.c.destaque}`,
          boxShadow: T.id === 'isometrico' ? `0 0 26px ${T.a('destaque', 0.7)}` : jornal ? '2px 6px 8px rgba(0,0,0,0.35)' : undefined,
          transform: `scale(${0.4 + 0.6 * s})`,
        }}
      />
    );
  return (
    <>
      {marcador}
      <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: e, transform: `translateX(${(1 - s) * -40}px) rotate(${rot}deg)`, transformOrigin: 'left center' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: fundoCartao,
            borderRadius: jornal ? 2 : 30,
            border: jornal || cheio ? 'none' : `3px solid ${T.c.linha}`,
            boxShadow: jornal ? '3px 10px 16px rgba(0,0,0,0.3)' : T.id === 'mapa' ? '0 10px 24px rgba(0,0,0,0.12)' : undefined,
          }}
        />
        {jornal ? <div style={{ position: 'absolute', left: w * 0.38, top: -16, width: 130, height: 36, background: T.a('faixa', 0.78), transform: `rotate(${rot * -2 + 4}deg)` }} /> : null}
        <div style={{ position: 'absolute', left: 28, right: 28, top: 14, fontFamily: jornal ? T.f.serif : T.f.texto, fontWeight: jornal ? 700 : 900, fontSize: tamAno, lineHeight: 1.12, color: corAno, whiteSpace: 'nowrap' }}>{ano}</div>
        <div style={{ position: 'absolute', left: 28, right: 28, top: 18 + tamAno * 1.12, fontFamily: T.f.texto, fontWeight: 600, fontSize: tamTexto, lineHeight: 1.2, color: corTexto, overflowWrap: 'anywhere' }}>{texto}</div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- rota: ponto de saída, pino e chip

/** pino de chegada (ponta em x, y), que cai e quica de leve */
export const Pino: React.FC<{ t: number; at: number; x: number; y: number; tamanho?: number }> = ({ t, at, x, y, tamanho = 96 }) => {
  const T = useTema();
  if (t < at) return null;
  const s = spr(t, at, { damping: 11, stiffness: 240, mass: 0.6 });
  const queda = (1 - s) * -120;
  const cor = T.id === 'jornal' ? T.c.destaque : T.c.destaque2;
  const L = tamanho;
  return (
    <svg width={L} height={L * 1.3} viewBox="-50 -110 100 130" style={{ position: 'absolute', left: x - L / 2, top: y - L * 1.3 * (110 / 130), overflow: 'visible', opacity: Math.min(1, s * 2), transform: `translateY(${queda}px)` }}>
      <ellipse cx={0} cy={4} rx={20 * Math.min(1, s)} ry={7 * Math.min(1, s)} fill="rgba(0,0,0,0.22)" />
      <path d="M0 0 C -30 -34 -44 -52 -44 -70 A 44 44 0 0 1 44 -70 C 44 -52 30 -34 0 0 Z" fill={cor} />
      <circle cx={0} cy={-70} r={17} fill={T.id === 'isometrico' ? T.c.fundo : T.c.superficie} />
    </svg>
  );
};

/** ponto de saída da rota */
export const Saida: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  const T = useTema();
  if (t < at) return null;
  const s = spr(t, at, { damping: 14, stiffness: 220 });
  const borda = T.id === 'isometrico' ? T.c.etiqueta : T.id === 'jornal' ? T.c.tinta : T.c.etiqueta;
  return <div style={{ position: 'absolute', left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: 26, boxSizing: 'border-box', background: T.id === 'isometrico' ? T.c.fundo : T.c.superficie, border: `10px solid ${borda}`, transform: `scale(${s})` }} />;
};

/** chip de tempo (ou de distância) na rota, centrado em (x, y); encolhe para caber até "max" de largura */
export const Chip: React.FC<{ t: number; at: number; x: number; y: number; texto: string; max?: number }> = ({ t, at, x, y, texto, max = 520 }) => {
  const T = useTema();
  if (t < at) return null;
  const s = spr(t, at, { damping: 13, stiffness: 240 });
  // uma linha até 34 px; texto longo quebra em até 2 linhas e encolhe, sem cortar
  const umaLinha = (max - 56) / (LETRA.textoForte * Math.max(1, texto.length));
  const { s: tam, linhas } = umaLinha >= 26 ? { s: Math.min(34, umaLinha), linhas: [{ palavras: [texto], largura: texto.length * LETRA.textoForte * Math.min(34, umaLinha) }] } : ajustar(texto, 30, max - 56, 2 * 30 * 1.15, LETRA.textoForte, 1.15, 16);
  const w = Math.min(max, Math.max(...linhas.map((l) => l.largura)) + 60);
  const alto = linhas.length > 1 ? linhas.length * tam * 1.15 + 26 : 68;
  const xx = Math.max(70 + w / 2, Math.min(1010 - w / 2, x));
  return (
    <div
      style={{
        position: 'absolute',
        left: xx - w / 2,
        top: y - alto / 2,
        width: w,
        height: alto,
        borderRadius: Math.min(34, alto / 2),
        lineHeight: 1.15,
        textAlign: 'center',
        padding: '0 24px',
        boxSizing: 'border-box',
        background: T.c.etiqueta,
        color: T.c.sobre,
        fontFamily: T.f.texto,
        fontWeight: 800,
        fontSize: tam,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 18px rgba(0,0,0,0.25)',
        opacity: Math.min(1, s * 1.6),
        transform: `scale(${0.7 + 0.3 * s}) rotate(${T.id === 'jornal' ? -2 : 0}deg)`,
      }}
    >
      {texto}
    </div>
  );
};

// ---------------------------------------------------------------- recorte de jornal e fita

/** fita adesiva translúcida, que assenta logo depois do papel */
export const Fita: React.FC<{ t: number; at: number; x: number; y: number; w?: number; rot?: number }> = ({ t, at, x, y, w = 180, rot = -8 }) => {
  const T = useTema();
  if (t < at) return null;
  const p = eo(ramp(t, at, 0.18));
  return <div style={{ position: 'absolute', left: x - w / 2, top: y - 28, width: w, height: 56, background: T.a('faixa', T.id === 'isometrico' ? 0.28 : 0.78), transform: `rotate(${rot}deg) scale(${1.15 - 0.15 * p})`, opacity: p, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }} />;
};

/** recorte: o papel cai girando de cima e assenta (com sombra), com a manchete serifada, a retícula da foto
 *  (opcional) e as linhas de texto em duas colunas; a fita assenta 0,3 s depois */
export const Recorte: React.FC<{ t: number; at: number; x: number; y: number; w: number; h: number; rot: number; manchete: string; foto?: boolean; indice: number; comFita?: boolean; linhas?: boolean }> = ({
  t,
  at,
  x,
  y,
  w,
  h,
  rot,
  manchete,
  foto = true,
  indice,
  comFita = true,
  linhas: comLinhas = true,
}) => {
  const T = useTema();
  if (t < at) return null;
  const s = spr(t, at, { damping: 12, stiffness: 150, mass: 0.8 });
  const e = Math.min(1, s * 1.8);
  const queda = (1 - s) * -260;
  const giro = rot + (1 - s) * 14 * (indice % 2 ? -1 : 1);
  const id = `ret-${indice}-${T.id}`;
  const pad = Math.max(22, w * 0.06);
  const largura = w - pad * 2;
  const { s: tam, linhas } = ajustar(manchete, Math.min(64, w * 0.105), largura, h * 0.36, LETRA.serif, 1.12, 20);
  const altoManchete = linhas.length * tam * 1.12;
  // folga em cima para a fita, que cola na borda de cima do papel
  const topo = pad + 16;
  const yFoto = topo + altoManchete + 16;
  const altoFoto = foto ? Math.min(h * 0.28, h - yFoto - pad - 40) : 0;
  const yLinhas = yFoto + altoFoto + (foto ? 22 : 6);
  const nLinhas = comLinhas ? Math.max(0, Math.floor((h - yLinhas - pad) / 26)) : 0;
  const corLinha = T.id === 'jornal' ? T.c.linha : misturar(T.c.superficie, T.c.tinta, 0.25);
  const sombra = T.escuro ? '0 18px 30px rgba(0,0,0,0.45)' : '4px 14px 20px rgba(0,0,0,0.32)';
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: e, transform: `translateY(${queda}px) rotate(${giro}deg)` }}>
        <div style={{ position: 'absolute', inset: 0, background: T.c.superficie, boxShadow: sombra, border: T.id === 'isometrico' ? `2px solid ${T.c.linha}` : undefined }} />
        <div style={{ position: 'absolute', left: pad, top: topo, width: largura, fontFamily: T.f.serif, fontWeight: 700, fontSize: tam, lineHeight: 1.12, color: T.c.tinta, overflowWrap: 'anywhere' }}>{manchete}</div>
        <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Reticula id={id} />
          {foto && altoFoto > 20 ? <rect x={pad} y={yFoto} width={largura} height={altoFoto} fill={`url(#${id})`} /> : null}
          {Array.from({ length: nLinhas }).map((_, i) =>
            [0, 1].map((col) => (
              <rect key={`${i}-${col}`} x={pad + col * (largura / 2 + 6)} y={yLinhas + i * 26} width={largura / 2 - 6 - (i === nLinhas - 1 && col === 1 ? largura * 0.18 : 0)} height={10} fill={corLinha} />
            )),
          )}
        </svg>
      </div>
      {comFita ? <Fita t={t} at={at + 0.32} x={x + w * (indice % 2 ? 0.7 : 0.32)} y={y - 8} rot={indice % 2 ? 12 : -8} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- círculo à mão

/** círculo de destaque à mão em volta de (cx, cy), que se desenha; com "palavra", escrita à mão no meio */
export const Circulo: React.FC<{ t: number; at: number; cx: number; cy: number; rx: number; ry: number; palavra?: string; sem?: number }> = ({ t, at, cx, cy, rx, ry, palavra, sem = 11 }) => {
  const T = useTema();
  if (t < at) return null;
  const p = desenhar(t, at, 0.55);
  const tam = palavra ? Math.min(96, ry * 1.05, (rx * 1.6) / (LETRA.mao * Math.max(1, palavra.length))) : 0;
  const halo = T.escuro ? T.c.fundo : T.c.superficie;
  return (
    <>
      <Desenho>
        <Traco d={caminhoCirculo(cx, cy, rx, ry, sem)} p={p} cor={T.c.destaque} largura={11} />
      </Desenho>
      {palavra ? (
        <div style={{ position: 'absolute', left: cx - rx, top: cy - tam * 0.62, width: rx * 2, textAlign: 'center', fontFamily: T.f.mao, fontWeight: 700, fontSize: tam, lineHeight: 1.2, color: T.c.destaque, opacity: eo(ramp(t, at + 0.35, 0.25)), whiteSpace: 'nowrap', textShadow: `0 0 4px ${halo}, 0 0 8px ${halo}, 0 0 14px ${halo}` }}>{palavra}</div>
      ) : null}
    </>
  );
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
  // a assinatura (um @ longo não tem espaço): o tamanho em que ela cabe em até 3 linhas, quebrando onde precisar
  const letra = T.serifado ? LETRA.serif : LETRA.textoForte;
  // uma linha só quando cabe a partir de 60 px; senão, o maior tamanho que cabe em até 3 linhas
  let tamAss = Math.min(96, (w - 130) / (assinatura.length * letra));
  if (tamAss < 60) tamAss = 96;
  while (tamAss > 30 && Math.ceil((assinatura.length * letra * tamAss) / (w - 130)) * tamAss * 1.1 > 250) tamAss -= 2;
  const jornal = T.id === 'jornal';
  const corTexto = T.c.tinta;
  const corMiuda = misturar(T.c.tinta, T.c.superficie, 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 40}px)` }}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          borderRadius: jornal ? 2 : 40,
          background: T.id === 'isometrico' ? T.a('superficie', 0.94) : T.c.superficie,
          border: T.id === 'linha-do-tempo' || T.id === 'isometrico' ? `3px solid ${T.c.linha}` : undefined,
          boxShadow: T.escuro ? '0 30px 60px rgba(0,0,0,0.45)' : jornal ? '6px 18px 26px rgba(0,0,0,0.35)' : '0 20px 44px rgba(0,0,0,0.14)',
          transform: jornal ? 'rotate(-1.5deg)' : undefined,
        }}
      />
      {jornal ? (
        <>
          <div style={{ position: 'absolute', left: x + 60, top: y - 22, width: 190, height: 52, background: T.a('faixa', 0.8), transform: 'rotate(-9deg)' }} />
          <div style={{ position: 'absolute', left: x + w - 250, top: y - 18, width: 190, height: 52, background: T.a('faixa', 0.8), transform: 'rotate(8deg)' }} />
        </>
      ) : (
        <div style={{ position: 'absolute', left: x, top: y, width: w, height: 16, borderRadius: '40px 40px 0 0', background: T.c.destaque }} />
      )}
      <div style={{ position: 'absolute', left: x + 60, width: w - 120, top: y + 50, height: h - 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 18 }}>
        {marca ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: T.f.texto, fontWeight: 800, fontSize: Math.min(40, 1400 / Math.max(1, marca.nome.length)), color: corTexto, maxWidth: w - 120 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: T.c.destaque, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{marca.nome}</span>
          </div>
        ) : null}
        <div style={{ fontFamily: T.f.titulo, fontWeight: T.serifado ? 700 : 900, fontSize: tamAss, lineHeight: 1.1, color: T.c.destaque, overflowWrap: 'anywhere', maxWidth: w - 120, letterSpacing: T.serifado ? 0 : '-0.02em' }}>{assinatura}</div>
        {frase ? <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: Math.min(40, 1500 / Math.max(1, frase.length)), lineHeight: 1.25, color: corTexto }}>{frase}</div> : null}
        {fontes.length ? (
          <div style={{ marginTop: 16, fontFamily: T.f.mono, fontSize: 22, lineHeight: 1.4, color: corMiuda }}>
            {fontes.slice(0, 3).map((f, i) => (
              <div key={i}>fonte: {f}</div>
            ))}
          </div>
        ) : null}
      </div>
      {avisoIA ? <div style={{ position: 'absolute', left: x, width: w, top: y + h - 70, textAlign: 'center', fontFamily: T.f.mono, fontSize: 22, color: corMiuda }}>Narração gerada por IA</div> : null}
    </div>
  );
};
