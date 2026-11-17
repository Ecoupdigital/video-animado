import React from 'react';
import { Img, staticFile } from 'remotion';
import { caber, contar, eo, fadeOut, focus, pop, ramp, spr } from './anima';
import { useTema } from './tema';
import { FOTOS } from './fotos';
import type { Marco, PalavraTitulo, Valor } from './roteiro';
import { temArquivo } from './arquivos';

// Peças do dossiê. Todas pegam cor e fonte do tema (useTema) e o tempo por prop (t, em segundos).
// Nenhuma tem texto de caso fixo: o texto vem do roteiro do vídeo ou das respostas.

/** texto mono (rótulos, HUD, faixa) */
export const Mono: React.FC<{ children: React.ReactNode; tamanho?: number; cor?: string; style?: React.CSSProperties }> = ({ children, tamanho = 28, cor, style }) => {
  const T = useTema();
  return <span style={{ fontFamily: T.f.mono, fontWeight: 500, fontSize: tamanho, color: cor ?? T.c.suave, letterSpacing: '0.02em', ...style }}>{children}</span>;
};

/** estilo de número ou palavra grande */
export const useGrande = () => {
  const T = useTema();
  return (tamanho: number, cor?: string): React.CSSProperties => ({
    fontFamily: T.f.titulo,
    fontWeight: T.pesoTitulo,
    fontSize: tamanho,
    lineHeight: 0.95,
    letterSpacing: `${T.tracking * 1.4}em`,
    color: cor ?? T.c.titulo,
    textTransform: T.caixaAlta ? 'uppercase' : 'none',
    textAlign: 'center',
  });
};

/** selo curto ("X nega", "em apuração") */
export const Selo: React.FC<{ children: React.ReactNode; cor?: string; solido?: boolean; tamanho?: number; style?: React.CSSProperties }> = ({ children, cor, solido, tamanho = 26, style }) => {
  const T = useTema();
  const c = cor ?? T.c.destaque;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        borderRadius: 4,
        fontFamily: T.f.texto,
        fontWeight: 700,
        fontSize: tamanho,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        background: solido ? c : `${c}${T.escuro ? '22' : '18'}`,
        color: solido ? (T.escuro ? '#FFFFFF' : T.c.papel) : c,
        border: `${T.escuro ? 1 : 2}px solid ${c}66`,
        maxWidth: 900,
        textAlign: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** carimbo que bate; encolhe para caber em "largura" (nunca sobre o rosto: quem posiciona é a cena) */
export const Carimbo: React.FC<{ t: number; at: number; x: number; y: number; rot?: number; cor?: string; tamanho?: number; largura?: number; children: string }> = ({
  t,
  at,
  x,
  y,
  rot = -7,
  cor,
  tamanho = 58,
  largura = 820,
  children,
}) => {
  const T = useTema();
  if (t < at) return null;
  const c = cor ?? T.c.alerta;
  const s = spr(t, at, { damping: 10, stiffness: 320 });
  // largura do texto em caixa alta pesada: ~0,64 em por letra, mais o respiro
  const tam = Math.min(tamanho, (largura - tamanho * 0.8) / (0.72 * Math.max(1, children.length)));
  const fs = Math.max(26, tam);
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot + Math.sin(t * 2.2) * 1.2}deg) scale(${(2.2 - 1.2 * s) * (1 + 0.02 * Math.sin(t * 5))})`, opacity: Math.min(1, s * 1.6) }}>
      <div
        style={{
          fontFamily: T.f.titulo,
          fontWeight: 900,
          fontSize: fs,
          lineHeight: 1.05,
          letterSpacing: '0.04em',
          color: c,
          padding: `${fs * 0.2}px ${fs * 0.38}px`,
          border: `${Math.max(4, fs * 0.1)}px solid ${c}`,
          borderRadius: 6,
          background: T.escuro ? T.a('fundo', 0.85) : T.a('papel', 0.88),
          boxShadow: T.escuro ? `0 0 50px ${c}55` : `0 6px 18px ${T.a('tinta', 0.15)}`,
          whiteSpace: fs > 27 ? 'nowrap' : 'normal',
          maxWidth: largura,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** tamanho do título que cabe em "alturaMax", simulando a quebra de linha pelas palavras */
const tamanhoTitulo = (palavras: string[], base: number, largura: number, alturaMax: number, larguraLetra: number) => {
  for (let s = base; s > 36; s -= 2) {
    const gap = s * 0.24;
    let linhas = 1;
    let x = 0;
    for (const p of palavras) {
      const w = p.length * larguraLetra * s;
      if (x > 0 && x + gap + w > largura) {
        linhas++;
        x = w;
      } else x += (x > 0 ? gap : 0) + w;
    }
    const maior = Math.max(...palavras.map((p) => p.length * larguraLetra * s));
    if (linhas * s * 1.06 <= alturaMax && maior <= largura) return s;
  }
  return 36;
};

/** título cinético: cada palavra entra (com mola) no instante em que é falada */
export const Titulo: React.FC<{ t: number; palavras: PalavraTitulo[]; topo?: number; tamanho?: number; alturaMax?: number; saida?: number; alinhar?: 'center' | 'left' }> = ({
  t,
  palavras,
  topo = 330,
  tamanho = 104,
  alturaMax = 260,
  saida,
  alinhar = 'center',
}) => {
  const T = useTema();
  const o = saida !== undefined ? fadeOut(t, saida, 0.15) : 1;
  // largura média da letra em em (medida nos stills: Inter 900 em caixa alta ~0,74; Playfair minúscula ~0,6)
  const larguraLetra = T.caixaAlta ? 0.76 : 0.62;
  const s = tamanhoTitulo(palavras.map((p) => p.w), tamanho, 940, alturaMax, larguraLetra);
  return (
    <div style={{ position: 'absolute', top: topo, left: 70, right: 70, display: 'flex', flexWrap: 'wrap', justifyContent: alinhar === 'center' ? 'center' : 'flex-start', columnGap: s * 0.24, rowGap: s * 0.06, opacity: o }}>
      {palavras.map((x, i) => {
        const on = t >= x.at;
        const k = on ? spr(t, x.at, { damping: 15, stiffness: 260, mass: 0.5 }) : 0;
        const cor = x.d ? T.c.destaque : T.c.titulo;
        return (
          <span
            key={i}
            style={{
              fontFamily: T.f.titulo,
              fontWeight: T.pesoTitulo,
              fontSize: s,
              lineHeight: 1.04,
              letterSpacing: `${T.tracking}em`,
              textTransform: T.caixaAlta ? 'uppercase' : 'none',
              color: cor,
              opacity: on ? Math.min(1, k * 1.5) : 0,
              transform: `translateY(${(1 - k) * 34}px)`,
              textShadow: x.d && T.escuro ? `0 0 50px ${T.a('destaque', 0.55)}` : T.sombra,
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

/** silhueta neutra (cabeça e ombros), sem rosto */
export const Silhueta: React.FC<{ id: string }> = ({ id }) => {
  const T = useTema();
  const topo = T.escuro ? T.c.apagado : T.c.discreto;
  const base = T.escuro ? T.c.fundo2 : T.c.suave;
  return (
    <svg viewBox="0 0 200 240" width="100%" height="100%" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={topo} />
          <stop offset="1" stopColor={base} />
        </linearGradient>
        <radialGradient id={`rim-${id}`} cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor={T.a('destaque', 0.35)} />
          <stop offset="1" stopColor={T.a('destaque', 0)} />
        </radialGradient>
      </defs>
      <rect width="200" height="240" fill={`url(#rim-${id})`} />
      <ellipse cx="100" cy="92" rx="40" ry="48" fill={`url(#sg-${id})`} />
      <path d="M22 240 C26 178 60 150 100 150 C140 150 174 178 178 240 Z" fill={`url(#sg-${id})`} />
      <text x="100" y="104" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="44" fill={T.a('claro', 0.3)}>
        ?
      </text>
    </svg>
  );
};

/** Altura total da polaroid para a largura w (moldura, foto e ficha). */
export const alturaPolaroid = (w: number) => w * 1.24;
/** y do fim do rosto da silhueta, a partir do centro da polaroid (carimbo só abaixo disso ou ao lado). */
export const fimDoRosto = (w: number) => 0.02 * w;
/** y do centro do carimbo sobre os ombros da silhueta: abaixo do rosto e acima do nome da ficha */
export const yOmbros = (y: number, w: number) => y + 0.22 * w;

/** polaroid de dossiê: silhueta (ou a foto que a pessoa forneceu), fita e ficha com nome e papel */
export const Polaroid: React.FC<{ t: number; at: number; x: number; y: number; w: number; nome: string; papel: string; rot?: number; foto?: string; etiqueta?: string; apagada?: number; id?: string }> = ({
  t,
  at,
  x,
  y,
  w,
  nome,
  papel,
  rot = -3,
  foto,
  etiqueta,
  apagada = 1,
  id = 'p',
}) => {
  const T = useTema();
  if (t < at) return null;
  const s = spr(t, at, { damping: 16, stiffness: 170 });
  const h = w * 1.18;
  const sway = Math.sin(t * 1.4 + x * 0.01) * 1.6;
  const bob = Math.sin(t * 1.1 + y * 0.01) * 8;
  // foto só quando registrada em componentes/fotos.ts e o arquivo existe em public/
  const arquivo = foto ? FOTOS[foto] : undefined;
  const comFoto = arquivo && temArquivo(arquivo);
  // nome numa linha quando dá; longo encolhe até w*0,045 e quebra em duas linhas
  const letra = T.caixaAlta ? 0.7 : 0.56;
  const tamNome = Math.max(w * 0.045, Math.min(w * 0.085, (w * 0.86) / (letra * Math.max(1, nome.length))));
  const tamPapel = Math.max(w * 0.032, Math.min(w * 0.046, (w * 0.86) / (0.62 * Math.max(1, papel.length))));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%,-50%) rotate(${rot * s + sway}deg) translateY(${(1 - s) * 120 + bob}px) scale(${0.85 + 0.15 * s})`, opacity: Math.min(1, s * 1.4) * apagada }}>
      <div style={{ background: T.c.papel, padding: w * 0.045, paddingBottom: w * 0.23, borderRadius: 3, boxShadow: T.escuro ? '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)' : `0 26px 50px ${T.a('tinta', 0.25)}, 0 0 0 1px ${T.a('tinta', 0.12)}`, position: 'relative' }}>
        <div style={{ width: '100%', height: h * 0.82, overflow: 'hidden', background: T.escuro ? T.c.fundo2 : T.c.fundo2, position: 'relative' }}>
          {comFoto ? <Img src={staticFile(arquivo)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.35) contrast(1.1)' }} /> : <Silhueta id={`${id}-${T.nome}`} />}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${T.a('tinta', 0)} 55%, ${T.a('tinta', 0.5)} 100%)` }} />
          <div style={{ position: 'absolute', left: 12, top: 10 }}>
            <Mono tamanho={w * 0.045} cor={T.escuro ? 'rgba(232,232,240,0.7)' : T.a('tinta', 0.55)}>
              REC · ARQ
            </Mono>
          </div>
        </div>
        <div style={{ position: 'absolute', left: w * 0.05, right: w * 0.05, bottom: w * 0.02, height: w * 0.21, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: T.f.titulo, fontWeight: 900, fontSize: tamNome, lineHeight: 1, color: T.c.tinta, letterSpacing: '-0.01em', textTransform: T.caixaAlta ? 'uppercase' : 'none', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {nome}
          </div>
          <div style={{ fontFamily: T.f.mono, fontWeight: 600, fontSize: tamPapel, color: T.escuro ? T.c.destaque : T.c.destaque, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {papel}
          </div>
        </div>
        <div style={{ position: 'absolute', top: -w * 0.05, left: '50%', width: w * 0.36, height: w * 0.1, transform: 'translateX(-50%) rotate(2deg)', background: T.a('fita', 0.6), boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }} />
      </div>
      {etiqueta ? (
        <div style={{ position: 'absolute', right: -w * 0.06, top: w * 0.08, transform: 'rotate(6deg)' }}>
          <Selo solido cor={T.c.destaque} tamanho={w * 0.05}>
            {etiqueta}
          </Selo>
        </div>
      ) : null}
    </div>
  );
};

/** card de dado (cargo, valor, empresa), com faixa de cor em cima */
export const Card: React.FC<{ t: number; at: number; x: number; y: number; w: number; cor?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, x, y, w, cor, children, style }) => {
  const T = useTema();
  if (t < at) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: 'translate(-50%,0)' }}>
      <div style={pop(t, at, 60)}>
        <div
          style={{
            background: T.escuro ? `linear-gradient(135deg, ${T.a('superficie', 0.94)}, ${T.a('fundo2', 0.9)})` : T.c.superficie,
            border: `1px solid ${T.escuro ? 'rgba(255,255,255,0.08)' : T.c.apagado}`,
            borderTop: `4px solid ${cor ?? T.c.destaque}`,
            borderRadius: 6,
            padding: '24px 30px',
            boxShadow: T.escuro ? '0 30px 70px rgba(0,0,0,0.55)' : `0 16px 34px ${T.a('tinta', 0.12)}`,
            ...style,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/** linha de dado de card: rótulo mono em cima, valor embaixo (encolhe com texto longo) */
export const Dado: React.FC<{ rotulo: string; valor: string; sub?: string; cor?: string; tamanho?: number; cabe?: number }> = ({ rotulo, valor, sub, cor, tamanho = 42, cabe = 22 }) => {
  const T = useTema();
  return (
    <div>
      <Mono tamanho={22}>{rotulo}</Mono>
      <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: caber(valor, tamanho, cabe), lineHeight: 1.15, color: cor ?? T.c.titulo }}>{valor}</div>
      {sub ? <Mono tamanho={24} cor={T.c.claro}>{sub}</Mono> : null}
    </div>
  );
};

const formatar = (n: number, casas: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** contador: o número conta até o valor (número de 1 dígito não conta: aparece já com o valor final) */
export const Contador: React.FC<{ t: number; at: number; valor: Valor; tamanho?: number; cor?: string; d?: number }> = ({ t, at, valor, tamanho = 220, cor, d = 0.8 }) => {
  const grande = useGrande();
  const T = useTema();
  if (t < at) return null;
  const casas = valor.casas ?? 0;
  const umDigito = Math.abs(valor.numero) < 10 && casas === 0;
  const n = umDigito ? valor.numero : contar(t, at, valor.numero, d);
  const sinal = n < 0 ? '−' : '';
  const texto = `${sinal}${valor.prefixo ?? ''}${formatar(Math.abs(n), casas)}${valor.sufixo ?? ''}`;
  // cabe em 880 px: largura média do algarismo e da letra grande ~0,7 em em caixa alta, ~0,6 em minúscula serifada
  const tam = Math.min(tamanho, 880 / ((T.caixaAlta ? 0.7 : 0.6) * Math.max(1, texto.length)));
  return (
    <div style={{ ...focus(t, at, 0.25), textAlign: 'center' }}>
      <div style={{ ...grande(tam, cor ?? (valor.numero < 0 ? T.c.alerta : T.c.titulo)), whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{texto}</div>
    </div>
  );
};

/** traço SVG que se desenha (p de 0 a 1) */
export const Traco: React.FC<{ d: string; p: number; cor?: string; w?: number; tracejado?: string }> = ({ d, p, cor, w = 4, tracejado }) => {
  const T = useTema();
  return (
    <path d={d} pathLength={1} fill="none" stroke={cor ?? T.c.destaque} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: tracejado ?? '1', strokeDashoffset: tracejado ? undefined : 1 - p }} />
  );
};

/** fio vermelho que liga duas fichas, com pulsos correndo depois de desenhado */
export const Fio: React.FC<{ t: number; at: number; de: [number, number]; para: [number, number]; cor?: string }> = ({ t, at, de, para, cor }) => {
  const T = useTema();
  const c = cor ?? T.c.alerta;
  const p = eo(ramp(t, at, 0.6));
  const c1 = [de[0] + (para[0] - de[0]) * 0.4, de[1] + (para[1] - de[1]) * 0.15];
  const c2 = [de[0] + (para[0] - de[0]) * 0.6, de[1] + (para[1] - de[1]) * 0.85];
  const d = `M${de[0]} ${de[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${para[0]} ${para[1]}`;
  const ponto = (u: number) => [0, 1].map((k) => (1 - u) ** 3 * de[k] + 3 * (1 - u) ** 2 * u * c1[k] + 3 * (1 - u) * u * u * c2[k] + u ** 3 * para[k]);
  return (
    <svg style={{ position: 'absolute', inset: 0 }} width={1080} height={1920}>
      {t >= at ? <Traco d={d} p={p} cor={c} w={5} /> : null}
      {p >= 1
        ? [0, 0.5].map((o, k) => {
            const [px, py] = ponto((t * 0.6 + o) % 1);
            return <circle key={k} cx={px} cy={py} r={9} fill={T.c.alertaSuave} style={{ filter: `drop-shadow(0 0 10px ${c})` }} />;
          })
        : null}
    </svg>
  );
};

/** nó de rota que pulsa */
export const No: React.FC<{ t: number; at: number; x: number; y: number; nome: string; sub?: string; cor?: string }> = ({ t, at, x, y, nome, sub, cor }) => {
  const T = useTema();
  if (t < at) return null;
  const c = cor ?? T.c.destaque;
  const s = spr(t, at, { damping: 12, stiffness: 240 });
  const pulso = 1 + 0.25 * Math.sin(t * 6);
  return (
    <div style={{ position: 'absolute', left: x - 150, top: y - 15, width: 300, transform: `scale(${s})`, transformOrigin: '150px 15px' }}>
      <div style={{ width: 30, height: 30, borderRadius: 15, background: c, boxShadow: `0 0 ${30 * pulso}px ${c}`, margin: '0 auto' }} />
      <div style={{ marginTop: 14, textAlign: 'center', width: 300 }}>
        <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: caber(nome, 38, 11, 26), lineHeight: 1.05, color: T.c.titulo, textTransform: 'uppercase' }}>{nome}</div>
        {sub ? <Mono tamanho={caber(sub, 22, 20, 17)}>{sub}</Mono> : null}
      </div>
    </div>
  );
};

/** gráfico caindo: linha que se desenha, área e setas descendo */
export const Grafico: React.FC<{ t: number; at: number; topo?: number; d?: number }> = ({ t, at, topo = 560, d = 2.2 }) => {
  const T = useTema();
  const p = eo(ramp(t, at, d));
  const pts = [[0, 120], [90, 100], [170, 140], [250, 110], [330, 210], [410, 190], [490, 290], [570, 330], [650, 300], [730, 420], [810, 470], [870, 520]];
  const caminho = pts.map((q, i) => `${i ? 'L' : 'M'}${105 + q[0]} ${topo + q[1]}`).join(' ');
  const gid = `queda-${T.nome}`;
  return (
    <svg style={{ position: 'absolute', inset: 0 }} width={1080} height={1920}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T.a('alerta', 0.35)} />
          <stop offset="1" stopColor={T.a('alerta', 0)} />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={105} x2={975} y1={topo + 40 + i * 150} y2={topo + 40 + i * 150} stroke={T.escuro ? 'rgba(255,255,255,0.06)' : T.a('tinta', 0.1)} />
      ))}
      <path d={`${caminho} L975 ${topo + 590} L105 ${topo + 590} Z`} fill={`url(#${gid})`} opacity={p} />
      {t >= at ? <Traco d={caminho} p={p} cor={T.c.alerta} w={7} /> : null}
      {p >= 1 ? <circle cx={975} cy={topo + 520} r={12 + 6 * Math.sin(t * 8)} fill={T.c.alerta} style={{ filter: `drop-shadow(0 0 16px ${T.c.alerta})` }} /> : null}
      {Array.from({ length: 10 }).map((_, k) => {
        const yy = ((t - at) * (160 + k * 23) + k * 140) % 560;
        return t > at + 0.2 ? (
          <text key={k} x={140 + k * 85} y={topo + yy} fontFamily="sans-serif" fontSize={30 + (k % 3) * 8} fill={T.a('alerta', 0.22)}>
            ▼
          </text>
        ) : null;
      })}
    </svg>
  );
};

/** linha do tempo: a linha se desenha e cada marco acende no seu instante */
export const LinhaDoTempo: React.FC<{ t: number; topo: number; marcos: (Marco & { at: number })[]; esquerda?: number; direita?: number }> = ({ t, topo, marcos, esquerda = 100, direita = 100 }) => {
  const T = useTema();
  if (!marcos.length || t < marcos[0].at) return null;
  const largura = 1080 - esquerda - direita;
  const fimLinha = marcos[marcos.length - 1].at;
  const p = eo(ramp(t, marcos[0].at, Math.max(0.6, fimLinha - marcos[0].at + 0.3)));
  const n = marcos.length;
  const col = largura / n;
  return (
    <div style={{ position: 'absolute', left: esquerda, width: largura, top: topo }}>
      <svg width={largura} height={20} style={{ position: 'absolute', top: 1, left: 0 }}>
        <line x1={col / 2} x2={col / 2 + (largura - col) * p} y1={10} y2={10} stroke={T.c.destaque} strokeWidth={3} />
      </svg>
      <div style={{ display: 'flex' }}>
        {marcos.map((m, i) => {
          const c = m.alerta ? T.c.alerta : T.c.claro;
          return (
            <div key={i} style={{ width: col, textAlign: 'center', ...pop(t, m.at, 30) }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: c, boxShadow: `0 0 20px ${c}`, margin: '0 auto' }} />
              <div style={{ fontFamily: T.f.mono, fontWeight: 600, fontSize: caber(m.data, 34, 6, 24), color: T.c.titulo, marginTop: 10 }}>{m.data}</div>
              <Mono tamanho={caber(m.texto, 24, Math.round(col / 15), 18)} cor={c} style={{ display: 'block', padding: '0 6px', lineHeight: 1.2 }}>
                {m.texto}
              </Mono>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** cartão de fonte: de onde veio o fato */
export const CartaoFonte: React.FC<{ t: number; at: number; x: number; y: number; w: number; veiculo: string; data?: string; texto: string }> = ({ t, at, x, y, w, veiculo, data, texto }) => {
  const T = useTema();
  return (
    <Card t={t} at={at} x={x} y={y} w={w} cor={T.c.claro}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ width: 64, height: 80, border: `3px solid ${T.c.claro}`, borderRadius: 4, position: 'relative', flexShrink: 0 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: 'absolute', left: 10, right: 10, top: 14 + i * 14, height: 4, background: T.c.claro, opacity: 0.6 }} />
          ))}
        </div>
        <div style={{ minWidth: 0 }}>
          <Mono tamanho={22}>FONTE{data ? ` · ${data}` : ''}</Mono>
          <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: caber(veiculo, 40, 24, 28), lineHeight: 1.1, color: T.c.titulo }}>{veiculo}</div>
          <Mono tamanho={caber(texto, 24, 40, 19)} cor={T.c.claro}>
            {texto}
          </Mono>
        </div>
      </div>
    </Card>
  );
};

/** texto que se digita, com cursor */
export const Digitando: React.FC<{ t: number; at: number; texto: string; cps?: number; tamanho?: number; cor?: string }> = ({ t, at, texto, cps = 28, tamanho = 28, cor }) => {
  const T = useTema();
  if (t < at) return null;
  const n = Math.min(texto.length, Math.floor((t - at) * cps));
  const cursor = Math.floor(t * 3) % 2 === 0 ? '▌' : ' ';
  return (
    <Mono tamanho={tamanho} cor={cor ?? T.c.claro}>
      {texto.slice(0, n)}
      {cursor}
    </Mono>
  );
};

/** card final: assinatura das respostas (com o nome da marca, se houver), fontes, aviso de narração por IA
 * e, quando o caso cita pessoas, a linha de que são suspeitas reportadas, sem acusação formal */
export const CardFinal: React.FC<{ t: number; at: number; fontes: string[]; citaPessoas: boolean; assinatura: string; frase: string | null; marca: { nome: string; cor: string | null } | null; avisoIA: boolean }> = ({
  t,
  at,
  fontes,
  citaPessoas,
  assinatura,
  frase,
  marca,
  avisoIA,
}) => {
  const T = useTema();
  if (t < at) return null;
  // assinatura longa: encolhe e, se precisar, quebra em duas linhas
  // até 84 px numa linha; mais longa, encolhe para caber em duas linhas de 860 px (nunca abaixo de 40)
  const n = Math.max(1, assinatura.length);
  const tamAss = 860 / (0.62 * n) >= 60 ? Math.min(84, 860 / (0.62 * n)) : Math.max(40, Math.min(60, (2 * 860) / (0.64 * n)));
  const linhas = [
    avisoIA ? 'Narração gerada por IA.' : null,
    fontes.length ? `Fontes: ${fontes.join(', ')}.` : 'Fontes: na legenda do post.',
    citaPessoas ? 'Suspeitas reportadas, sem acusação formal contra as pessoas citadas.' : null,
  ].filter(Boolean) as string[];
  const miuda = linhas.join(' ');
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 300, bottom: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...focus(t, at, 0.35) }}>
      {marca ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: marca.cor && T.nome !== 'investigativo' ? marca.cor : T.c.destaque }} />
          <Mono tamanho={30} cor={T.c.suave} style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {marca.nome}
          </Mono>
        </div>
      ) : null}
      <div style={{ fontFamily: T.f.titulo, fontWeight: T.pesoTitulo, fontSize: tamAss, lineHeight: 1.05, color: T.c.titulo, letterSpacing: '-0.02em', textAlign: 'center', overflowWrap: 'anywhere', maxWidth: 860 }}>{assinatura}</div>
      {frase ? (
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <Mono tamanho={caber(frase, 30, 40, 22)} cor={T.c.claro}>
            {frase}
          </Mono>
        </div>
      ) : null}
      <div style={{ marginTop: 80, maxWidth: 880, textAlign: 'center', lineHeight: 1.6 }}>
        <Mono tamanho={caber(miuda, 23, 200, 18)} cor={T.escuro ? T.c.discreto : T.c.suave}>
          {miuda}
        </Mono>
      </div>
    </div>
  );
};
