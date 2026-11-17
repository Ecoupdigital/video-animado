import React from 'react';
import { clipRasgado, retanguloRasgado } from './recorte';
import { LEGENDA, SEGURA, W } from './medidas';
import { comAlfa, escurecer, legivel, misturar, useTema } from './tema';
import { FECHO, MARCA, PESSOAS } from './universo';

// Textos do Conto: título de abertura, legenda, balão de fala, placa do lugar e fecho. O jeito de cada um vem do
// estilo do tema em uso (opcoes.json, "estilos"): faixa rasgada e tarja rasgada no papel recortado, selo, balões e
// legenda simples nas formas, citação serifada inclinada sobre o céu e legenda clara sobre o morro escuro nas
// silhuetas, título e legenda em letra de mão sobre a folha pautada no giz de cera. Todo texto cabe na área segura (220 px do topo, 380 de baixo, 70 de lado): o tamanho
// encolhe até um mínimo e, se ainda não couber, quebra (palavra comprida quebra no meio) e corta com reticências.
// Nenhum texto de marca fixo: a marca, o fecho e os nomes vêm de componentes/universo.ts ou de prop.

export type Palavra = { texto: string; inicio: number; fim: number }; // em frames

const LARGURA_UTIL = W - 2 * SEGURA.lado;

// ---------------------------------------------------------------- caber

/** Quantas linhas o texto ocupa com até `porLinha` caracteres por linha (palavra maior que a linha quebra no meio). */
export const contarLinhas = (texto: string, porLinha: number): number => {
  const cap = Math.max(1, porLinha);
  let linhas = 0;
  let atual = 0;
  for (const p of texto.split(/\s+/).filter(Boolean)) {
    if (p.length > cap) {
      if (atual) linhas++;
      linhas += Math.floor(p.length / cap);
      atual = p.length % cap;
      continue;
    }
    if (!atual) atual = p.length;
    else if (atual + 1 + p.length <= cap) atual += 1 + p.length;
    else {
      linhas++;
      atual = p.length;
    }
  }
  return linhas + (atual ? 1 : 0);
};

/**
 * Maior tamanho de fonte (de `max` até `min`) com que o texto cabe em `linhas` linhas de `largura` px.
 * `k` é a largura média de um caractere em fração do tamanho (Inter 800 ~0.58, Lora 700 ~0.56, caixa alta ~0.68).
 */
export const tamanhoQueCabe = (texto: string, largura: number, max: number, min: number, linhas: number, k = 0.58): number => {
  for (let fs = max; fs > min; fs -= 2) if (contarLinhas(texto, Math.floor(largura / (fs * k))) <= linhas) return fs;
  return min;
};

/** Estilo de bloco com no máximo `n` linhas (o que passar vira reticências) e quebra no meio da palavra comprida. */
export const linhasMax = (n: number): React.CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: n,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  overflowWrap: 'anywhere',
});

/** Agrupa as palavras em blocos de até `max` palavras, quebrando nas pausas e no fim de frase. */
export const agruparPalavras = (palavras: Palavra[], max = 4, pausa = 9): Palavra[][] => {
  const blocos: Palavra[][] = [];
  let atual: Palavra[] = [];
  palavras.forEach((p, i) => {
    const anterior = palavras[i - 1];
    const quebra = atual.length >= max || (anterior && p.inicio - anterior.fim > pausa) || (anterior && /[.?!]$/.test(anterior.texto));
    if (quebra && atual.length) {
      blocos.push(atual);
      atual = [];
    }
    atual.push(p);
  });
  if (atual.length) blocos.push(atual);
  return blocos;
};

/** O bloco da legenda no frame e a palavra acesa (a última que começou). */
export const blocoNoFrame = (palavras: Palavra[], frame: number, max = 4): { palavras: string[]; ativa: number } | null => {
  const blocos = agruparPalavras(palavras, max);
  const bloco = [...blocos].reverse().find((b) => frame >= b[0].inicio - 2 && frame <= b[b.length - 1].fim + 6);
  if (!bloco) return null;
  let ativa = -1;
  bloco.forEach((p, i) => {
    if (frame >= p.inicio && frame <= p.fim + 4) ativa = i;
  });
  return { palavras: bloco.map((p) => p.texto), ativa };
};

/** Sombra de papel (a mesma das peças) para blocos de texto recortados. */
const sombraPapel = (cor: string) => `drop-shadow(5px 8px 4px ${comAlfa(cor, 0.35)})`;

/** Começo do texto à mão no giz de cera: logo depois da margem do caderno (x 140 no fundo do giz). */
export const MARGEM_GIZ = 172;
const LARGURA_GIZ = W - SEGURA.lado - MARGEM_GIZ;

/** Filtro de giz para texto (letra de mão um pouco tremida), num SVG vazio ao lado do texto. Mesmo id em todo
 *  lugar: a definição é sempre a mesma, então o navegador usa qualquer uma. */
export const ID_GIZ_TEXTO = 'conto-giz-texto';
export const FiltroGizTexto: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <filter id={ID_GIZ_TEXTO} x="-5%" y="-10%" width="110%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency={0.55} numOctaves={2} seed={3} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={3.2} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

/** Sombra macia que segura texto claro sobre o céu das silhuetas. */
const sombraCeu = (cor: string) => `0 2px 14px ${comAlfa(cor, 0.6)}, 0 0 3px ${comAlfa(cor, 0.4)}`;

// ---------------------------------------------------------------- título de abertura

/**
 * Título da abertura no estilo do tema: faixa de papel rasgada com serifada (papel recortado) ou selo escuro com
 * o rótulo e o título grande embaixo (formas). `k` vai de 0 a 1 (entrada).
 */
export const Titulo: React.FC<{ titulo: string; subtitulo?: string | null; rotulo?: string | null; k?: number; topo?: number }> = ({ titulo, subtitulo, rotulo, k = 1, topo = SEGURA.topo + 24 }) => {
  const T = useTema();
  const entrada: React.CSSProperties = { opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * -40}px) scale(${0.9 + 0.1 * k})` };
  if (T.estilo.titulo === 'citacao') {
    // silhuetas: citação serifada inclinada, entre aspas, sobre o céu; o lugar embaixo, sem serifa
    const texto = `“${titulo}”`;
    const fsT = tamanhoQueCabe(texto, LARGURA_UTIL - 60, 86, 44, 3, 0.5);
    const fsS = subtitulo ? tamanhoQueCabe(subtitulo, LARGURA_UTIL - 60, 42, 28, 2, 0.58) : 0;
    return (
      <div style={{ position: 'absolute', left: SEGURA.lado, width: LARGURA_UTIL, top: topo, textAlign: 'center', ...entrada }}>
        <div style={{ fontFamily: T.f.serif, fontWeight: 700, fontStyle: 'italic', fontSize: fsT, lineHeight: 1.14, color: legivel(T.c.ceu, T.c.titulo), textShadow: sombraCeu(T.c.ceu), padding: '0 24px', ...linhasMax(3) }}>{texto}</div>
        {subtitulo ? (
          <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: fsS, lineHeight: 1.2, marginTop: 18, color: legivel(T.c.ceu, T.c.texto), textShadow: sombraCeu(T.c.ceu), letterSpacing: '0.03em', ...linhasMax(2) }}>{subtitulo}</div>
        ) : null}
      </div>
    );
  }
  if (T.estilo.titulo === 'manuscrito') {
    // giz de cera: título à mão, logo depois da margem do caderno, com o traço um pouco tremido
    const fsT = tamanhoQueCabe(titulo, LARGURA_GIZ, 112, 56, 2, 0.42);
    const fsS = subtitulo ? tamanhoQueCabe(subtitulo, LARGURA_GIZ, 62, 38, 2, 0.4) : 0;
    return (
      <div style={{ position: 'absolute', left: MARGEM_GIZ, width: LARGURA_GIZ, top: topo - 12, ...entrada }}>
        <FiltroGizTexto />
        <div style={{ fontFamily: T.f.mao, fontWeight: 700, fontSize: fsT, lineHeight: 1.08, color: legivel(T.c.fundo, T.c.titulo), filter: `url(#${ID_GIZ_TEXTO})`, ...linhasMax(2) }}>{titulo}</div>
        {subtitulo ? (
          <div style={{ fontFamily: T.f.mao, fontWeight: 600, fontSize: fsS, lineHeight: 1.1, marginTop: 4, color: legivel(T.c.fundo, T.c.texto), filter: `url(#${ID_GIZ_TEXTO})`, ...linhasMax(2) }}>{subtitulo}</div>
        ) : null}
      </div>
    );
  }
  if (T.estilo.titulo === 'faixa-rasgada') {
    const fsT = tamanhoQueCabe(titulo, LARGURA_UTIL - 90, 70, 38, 2, 0.56);
    const fsS = subtitulo ? tamanhoQueCabe(subtitulo, LARGURA_UTIL - 90, 46, 28, 2, 0.54) : 0;
    return (
      <div style={{ position: 'absolute', left: SEGURA.lado, width: LARGURA_UTIL, top: topo, filter: sombraPapel(T.c.sombra), ...entrada }}>
        <div style={{ background: T.c.faixa, clipPath: clipRasgado(11, 22, 9), padding: '34px 44px 36px', textAlign: 'center', transform: 'rotate(-1deg)' }}>
          <div style={{ fontFamily: T.f.serif, fontWeight: 700, fontSize: fsT, lineHeight: 1.12, color: legivel(T.c.faixa, T.c.titulo), ...linhasMax(2) }}>{titulo}</div>
          {subtitulo ? (
            <div style={{ fontFamily: T.f.serif, fontWeight: 700, fontStyle: 'italic', fontSize: fsS, lineHeight: 1.15, marginTop: 8, color: legivel(T.c.faixa, T.c.texto), ...linhasMax(2) }}>{subtitulo}</div>
          ) : null}
        </div>
      </div>
    );
  }
  // selo + título grande
  const textoSelo = (rotulo ?? '').toUpperCase();
  const fsSelo = tamanhoQueCabe(textoSelo, LARGURA_UTIL - 70, 36, 24, 2, 0.7);
  const fsT = tamanhoQueCabe(titulo, LARGURA_UTIL, 92, 46, 3, 0.6);
  return (
    <div style={{ position: 'absolute', left: SEGURA.lado, width: LARGURA_UTIL, top: topo, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26, ...entrada }}>
      {textoSelo ? (
        <div style={{ background: T.c.faixa, color: legivel(T.c.faixa, T.c.sobre), fontFamily: T.f.texto, fontWeight: 800, fontSize: fsSelo, lineHeight: 1.15, padding: '16px 34px 18px', borderRadius: 60, maxWidth: LARGURA_UTIL, boxSizing: 'border-box', letterSpacing: '0.02em', ...linhasMax(2) }}>
          {textoSelo}
        </div>
      ) : null}
      <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: fsT, lineHeight: 1.05, color: legivel(T.c.fundo, T.c.titulo), maxWidth: LARGURA_UTIL, ...linhasMax(3) }}>{titulo}</div>
      {subtitulo ? <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: tamanhoQueCabe(subtitulo, LARGURA_UTIL, 46, 30, 2), lineHeight: 1.15, color: legivel(T.c.fundo, T.c.texto), ...linhasMax(2) }}>{subtitulo}</div> : null}
    </div>
  );
};

/** Selo pequeno do episódio no topo (formas), durante a cena. */
export const SeloTopo: React.FC<{ texto: string }> = ({ texto }) => {
  const T = useTema();
  const t = texto.toUpperCase();
  const fs = tamanhoQueCabe(t, LARGURA_UTIL - 70, 34, 22, 1, 0.7);
  return (
    <div style={{ position: 'absolute', left: SEGURA.lado, top: SEGURA.topo + 24, maxWidth: LARGURA_UTIL, background: T.c.faixa, color: legivel(T.c.faixa, T.c.sobre), fontFamily: T.f.texto, fontWeight: 800, fontSize: fs, lineHeight: 1.15, padding: '15px 32px 17px', borderRadius: 60, boxSizing: 'border-box', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {t}
    </div>
  );
};

// ---------------------------------------------------------------- legenda

/**
 * Legenda embaixo, entre o chão e o fim da área segura, no estilo do tema: tarja escura rasgada com a palavra
 * falada no destaque (papel recortado) ou texto direto sobre o chão com a palavra falada numa pílula (formas).
 * `palavras` é o bloco da vez; `ativa` o índice da palavra acesa (-1 = nenhuma).
 */
export const Legenda: React.FC<{ palavras: string[]; ativa?: number; k?: number }> = ({ palavras, ativa = -1, k = 1 }) => {
  const T = useTema();
  const texto = palavras.join(' ');
  const altura = LEGENDA.base - LEGENDA.topo;
  if (!texto) return null;
  if (T.estilo.legenda === 'tarja-rasgada') {
    // uma linha até 52 px; em duas, até 40 px, para a tarja caber entre o chão e o fim da área segura
    const umaLinha = contarLinhas(texto, Math.floor((LARGURA_UTIL - 80) / (34 * 0.6))) <= 1;
    const fs = umaLinha ? tamanhoQueCabe(texto, LARGURA_UTIL - 80, 52, 34, 1, 0.6) : tamanhoQueCabe(texto, LARGURA_UTIL - 80, 40, 30, 2, 0.6);
    const cor = legivel(T.c.tarja, T.c.sobre);
    const corDestaque = legivel(T.c.tarja, T.c.destaque, 3);
    return (
      <div style={{ position: 'absolute', left: SEGURA.lado, width: LARGURA_UTIL, top: LEGENDA.topo, height: altura, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: sombraPapel(T.c.sombra), transform: `scale(${0.92 + 0.08 * k})` }}>
        <div style={{ background: T.c.tarja, clipPath: clipRasgado(23, 20, 12), padding: umaLinha ? '20px 40px 22px' : '14px 36px 16px', maxWidth: LARGURA_UTIL, boxSizing: 'border-box', textAlign: 'center', transform: 'rotate(0.6deg)' }}>
          <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: fs, lineHeight: 1.12, color: cor, ...linhasMax(2) }}>
            {palavras.map((p, i) => (
              <span key={i} style={{ color: i === ativa ? corDestaque : cor }}>
                {p}
                {i < palavras.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (T.estilo.legenda === 'clara') {
    // silhuetas: texto claro direto sobre o morro escuro, a palavra falada na cor do destaque
    const fs = tamanhoQueCabe(texto, LARGURA_UTIL - 40, 54, 34, 2, 0.57);
    const cor = legivel(T.c.chao, T.c.texto);
    const corDestaque = legivel(T.c.chao, T.c.destaque, 3);
    return (
      <div style={{ position: 'absolute', left: SEGURA.lado, width: LARGURA_UTIL, top: LEGENDA.topo, height: altura, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.92 + 0.08 * k})` }}>
        <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: fs, lineHeight: 1.22, color: cor, textAlign: 'center', letterSpacing: '0.01em', ...linhasMax(2) }}>
          {palavras.map((p, i) => (
            <span key={i} style={{ color: i === ativa ? corDestaque : cor }}>
              {p}
              {i < palavras.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (T.estilo.legenda === 'manuscrita') {
    // giz de cera: letra de mão sobre a folha pautada, a palavra falada no giz do destaque, sublinhada à mão
    const fs = tamanhoQueCabe(texto, LARGURA_GIZ - 10, 72, 46, 2, 0.42);
    const cor = legivel(T.c.fundo, T.c.texto);
    const corDestaque = legivel(T.c.fundo, T.c.destaque, 3);
    return (
      <div style={{ position: 'absolute', left: MARGEM_GIZ, width: LARGURA_GIZ, top: LEGENDA.topo, height: altura, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.92 + 0.08 * k})` }}>
        <FiltroGizTexto />
        <div style={{ fontFamily: T.f.mao, fontWeight: 700, fontSize: fs, lineHeight: 1.08, color: cor, textAlign: 'center', filter: `url(#${ID_GIZ_TEXTO})`, ...linhasMax(2) }}>
          {palavras.map((p, i) => (
            <span
              key={i}
              style={
                i === ativa
                  ? { color: corDestaque, textDecorationLine: 'underline', textDecorationStyle: 'wavy', textDecorationColor: corDestaque, textDecorationThickness: 4, textUnderlineOffset: 10 }
                  : undefined
              }
            >
              {p}
              {i < palavras.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
      </div>
    );
  }
  const fs = tamanhoQueCabe(texto, LARGURA_UTIL - 20, 50, 32, 2, 0.6);
  const cor = legivel(T.c.chao, T.c.texto);
  const corPilula = T.c.destaque;
  return (
    <div style={{ position: 'absolute', left: SEGURA.lado, width: LARGURA_UTIL, top: LEGENDA.topo, height: altura, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.92 + 0.08 * k})` }}>
      <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: fs, lineHeight: 1.25, color: cor, textAlign: 'center', ...linhasMax(2) }}>
        {palavras.map((p, i) => (
          <React.Fragment key={i}>
            <span style={i === ativa ? { background: corPilula, color: legivel(corPilula, '#FFFFFF'), borderRadius: 14, padding: '0 10px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' } : undefined}>{p}</span>
            {i < palavras.length - 1 ? ' ' : ''}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- balão de fala

export const MEDIDA_BALAO = { larguraMax: 600, maxFonte: 46, minFonte: 30, linhas: 3 } as const;

/**
 * Balão de fala (formas): claro ou escuro, acima da cabeça de quem fala, com o rabinho apontando para ele.
 * `x` é o centro de quem fala e `y` o topo da cabeça (px na tela). Fica sempre dentro da área segura.
 */
/** Tamanho do balão para o texto (o mesmo cálculo do desenho): largura, altura sem o rabinho e a fonte. */
export const medirBalao = (texto: string) => {
  const { larguraMax, maxFonte, minFonte, linhas } = MEDIDA_BALAO;
  const fs = tamanhoQueCabe(texto, larguraMax - 64, maxFonte, minFonte, linhas, 0.6);
  const porLinha = Math.floor((larguraMax - 64) / (fs * 0.6));
  const n = Math.min(linhas, contarLinhas(texto, porLinha));
  const largura = Math.min(larguraMax, Math.max(220, (n > 1 ? larguraMax - 64 : Math.min(texto.length, porLinha) * fs * 0.6) + 64));
  return { largura, altura: n * fs * 1.15 + 48, fs };
};

export const Balao: React.FC<{ texto: string; x: number; y: number; base?: number; escuro?: boolean; k?: number }> = ({ texto, x, y, base, escuro = false, k = 1 }) => {
  const T = useTema();
  if (!texto) return null;
  const fundo = escuro ? T.c.tarja : T.c.papel;
  const cor = escuro ? legivel(fundo, T.c.sobre) : legivel(fundo, T.c.titulo);
  const { linhas } = MEDIDA_BALAO;
  const { largura, altura, fs } = medirBalao(texto);
  const rabo = 46;
  // a ponta do rabinho fica acima da cabeça; o balão nunca sobe para dentro do selo do topo
  const baseY = Math.max(SEGURA.topo + 110 + altura + rabo, base !== undefined ? base + rabo : y - 30);
  const topo = baseY - rabo - altura;
  const esq = Math.max(SEGURA.lado, Math.min(W - SEGURA.lado - largura, x - largura / 2));
  const raboX = Math.max(esq + 48, Math.min(esq + largura - 48, x));
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 0, opacity: Math.min(1, k * 1.5), transform: `scale(${0.85 + 0.15 * k})`, transformOrigin: `${raboX}px ${baseY}px` }}>
      <svg width={W} height={baseY + 4} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <path d={`M ${raboX - 22} ${baseY - rabo - 2} L ${raboX + (x > raboX ? 30 : x < raboX ? -30 : 4)} ${baseY} L ${raboX + 24} ${baseY - rabo - 2} Z`} fill={fundo} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: esq,
          top: topo,
          width: largura,
          minHeight: altura,
          boxSizing: 'border-box',
          background: fundo,
          borderRadius: 46,
          padding: '22px 32px 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: escuro ? 'none' : `0 6px 0 ${comAlfa(T.c.sombra, 0.25)}`,
        }}
      >
        <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: fs, lineHeight: 1.15, color: cor, ...linhasMax(linhas) }}>{texto}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- placa do lugar

/** Placa com o nome do lugar (dentro do cenário): o texto encolhe e quebra em até 2 linhas. */
export const Placa: React.FC<{ texto: string; x: number; y: number; w: number; h: number; ang?: number; rasgada?: boolean }> = ({ texto, x, y, w, h, ang = 0, rasgada = false }) => {
  const T = useTema();
  if (T.estilo.titulo === 'citacao' || T.estilo.titulo === 'manuscrito') return <PlacaDesenhada texto={texto} x={x} y={y} w={w} h={h} ang={ang} />;
  const fs = tamanhoQueCabe(texto, w - 36, Math.min(48, (h - 20) / 1.1), 18, 2, 0.6);
  const cor = legivel(T.c.etiqueta, '#FFFFFF');
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${ang}deg)`, filter: rasgada ? sombraPapel(T.c.sombra) : undefined }}>
      {rasgada ? (
        <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d={retanguloRasgado(0, 0, w, h, 77, 1.8, 12)} fill={T.c.etiqueta} />
        </svg>
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: T.c.etiqueta, borderRadius: 18, boxShadow: `0 6px 0 ${comAlfa(T.c.sombra, 0.35)}` }} />
      )}
      <div style={{ position: 'absolute', inset: 0, padding: '6px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: fs, lineHeight: 1.08, color: cor, ...linhasMax(2) }}>{texto}</div>
      </div>
    </div>
  );
};

/**
 * Placa das silhuetas e do giz de cera. Silhuetas: tábua escura (a cor da placa) recortada contra o céu, letra
 * clara na cor do horizonte. Giz de cera: quadro riscado a giz na cor da placa, com o miolo claro e letra de mão.
 */
const PlacaDesenhada: React.FC<{ texto: string; x: number; y: number; w: number; h: number; ang: number }> = ({ texto, x, y, w, h, ang }) => {
  const T = useTema();
  const giz = T.estilo.titulo === 'manuscrito';
  if (giz) {
    const miolo = misturar(T.c.etiqueta, T.c.fundo, 0.86);
    const fs = tamanhoQueCabe(texto, w - 44, Math.min(64, (h - 22) / 1.05), 24, 2, 0.42);
    return (
      <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${ang}deg)` }}>
        <FiltroGizTexto />
        <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: `url(#${ID_GIZ_TEXTO})` }}>
          <path d={`M 8 10 Q ${w / 2} 2 ${w - 8} 8 Q ${w - 2} ${h / 2} ${w - 6} ${h - 8} Q ${w / 2} ${h - 2} 6 ${h - 6} Q 2 ${h / 2} 8 10 Z`} fill={miolo} stroke={T.c.etiqueta} strokeWidth={8} strokeLinejoin="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, padding: '6px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: T.f.mao, fontWeight: 700, fontSize: fs, lineHeight: 1.02, color: legivel(miolo, T.c.etiqueta), filter: `url(#${ID_GIZ_TEXTO})`, ...linhasMax(2) }}>{texto}</div>
        </div>
      </div>
    );
  }
  const fs = tamanhoQueCabe(texto, w - 36, Math.min(46, (h - 20) / 1.1), 18, 2, 0.6);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${ang}deg)` }}>
      <div style={{ position: 'absolute', inset: 0, background: T.c.etiqueta, borderRadius: 8 }} />
      <div style={{ position: 'absolute', inset: 0, padding: '6px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: fs, lineHeight: 1.08, letterSpacing: '0.02em', color: legivel(T.c.etiqueta, T.c.ceu2), ...linhasMax(2) }}>{texto}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- símbolo da marca

export type SimboloNome = 'estrela' | 'circulo' | 'coracao' | 'folha' | 'balao' | 'letra';
export const SIMBOLOS: SimboloNome[] = ['estrela', 'circulo', 'coracao', 'folha', 'balao', 'letra'];

const estrela = (cx: number, cy: number, fora: number, dentro: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? dentro : fora;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');

/** Primeira letra do nome da marca (sem contar espaço), em maiúscula. */
export const inicialDe = (nome: string) => (nome.trim().match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase();

/** Símbolo da marca, desenhado em código. Sem `simbolo` (ou fora da lista), a letra inicial. */
export const SimboloMarca: React.FC<{ simbolo?: string | null; tamanho?: number; cor: string; corFundo: string; nome?: string }> = ({ simbolo, tamanho = 80, cor, corFundo, nome = MARCA?.nome ?? '' }) => {
  const T = useTema();
  const s = (SIMBOLOS as string[]).includes(simbolo ?? '') ? (simbolo as SimboloNome) : 'letra';
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
      {s === 'circulo' && (
        <>
          <circle cx={100} cy={100} r={74} fill="none" stroke={cor} strokeWidth={30} />
          <circle cx={100} cy={100} r={26} fill={cor} />
        </>
      )}
      {s === 'estrela' && <polygon fill={cor} points={estrela(100, 106, 96, 42)} strokeLinejoin="round" stroke={cor} strokeWidth={10} />}
      {s === 'folha' && (
        <g transform="rotate(35 100 100)">
          <path fill={cor} d="M 100 8 C 168 44 176 132 100 170 C 24 132 32 44 100 8 Z" />
          <path d="M 100 44 L 100 150" stroke={corFundo} strokeWidth={9} strokeLinecap="round" />
          <rect x={93} y={160} width={14} height={36} rx={7} fill={cor} />
        </g>
      )}
      {s === 'coracao' && <path fill={cor} d="M 100 182 C 40 140 6 104 10 66 C 14 30 62 14 100 52 C 138 14 186 30 190 66 C 194 104 160 140 100 182 Z" />}
      {s === 'balao' && (
        <g>
          <path fill={cor} d="M 40 24 L 160 24 Q 190 24 190 54 L 190 120 Q 190 150 160 150 L 92 150 L 46 188 L 54 150 L 40 150 Q 10 150 10 120 L 10 54 Q 10 24 40 24 Z" />
          <circle cx={62} cy={87} r={13} fill={corFundo} />
          <circle cx={100} cy={87} r={13} fill={corFundo} />
          <circle cx={138} cy={87} r={13} fill={corFundo} />
        </g>
      )}
      {s === 'letra' && (
        <>
          <circle cx={100} cy={100} r={96} fill={cor} />
          <text x={100} y={100} dy="0.36em" textAnchor="middle" fontFamily={T.f.texto} fontWeight={800} fontSize={116} fill={corFundo}>
            {inicialDe(nome)}
          </text>
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- fecho

/** Nome da protagonista do elenco (ou do primeiro personagem), para o aviso de personagem fictícia. */
export const nomeProtagonista = (): string | null => {
  const lista = Object.values(PESSOAS);
  return (lista.find((p) => p.papel === 'protagonista') ?? lista[0])?.nome ?? null;
};

/**
 * Fecho de todo vídeo (cerca de 4 s), no topo da tela, com a protagonista embaixo (a cena a põe no chão).
 * Com marca: chamada + "Comenta <PALAVRA>" com o símbolo. Sem marca: chamada + "Segue o perfil".
 * O aviso "<protagonista> é uma personagem fictícia" fica ligado, a não ser que o fecho.aviso_ficticio das
 * respostas seja false ou a prop `aviso` seja false. `k` vai de 0 a 1 (entrada).
 */
export const Fecho: React.FC<{ k?: number; pulso?: number; chamada?: string; palavra?: string | null; aviso?: boolean; personagem?: string | null }> = ({
  k = 1,
  pulso = 1,
  chamada,
  palavra,
  aviso = FECHO.avisoFicticio,
  personagem = nomeProtagonista(),
}) => {
  const T = useTema();
  if (T.estilo.titulo === 'citacao' || T.estilo.titulo === 'manuscrito') return <FechoDesenhado k={k} pulso={pulso} chamada={chamada} palavra={palavra} aviso={aviso} personagem={personagem} />;
  const comMarca = MARCA !== null;
  const papel = T.estilo.titulo === 'faixa-rasgada';
  const palavraFinal = (palavra ?? FECHO.palavra ?? MARCA?.palavraFecho ?? (MARCA ? MARCA.nome.split(/\s+/)[0] : '')).toUpperCase();
  const textoChamada = chamada ?? FECHO.chamada ?? (comMarca ? `Quer saber mais sobre ${MARCA!.nome}?` : 'Gostou da história?');
  const corPilula = MARCA?.cor ?? T.c.destaque;
  const corTextoPilula = legivel(corPilula, '#FFFFFF');
  const fundoCartao = papel ? T.c.faixa : T.c.papel;
  const corChamada = legivel(fundoCartao, T.c.titulo);
  const fsChamada = tamanhoQueCabe(textoChamada, LARGURA_UTIL - 100, 70, 40, 3, papel ? 0.56 : 0.6);
  const textoPilula = comMarca ? palavraFinal : 'Segue o perfil';
  const fsPilula = tamanhoQueCabe(textoPilula, comMarca ? 470 : 560, 62, 30, 1, 0.68);
  const avisoTexto = personagem ? `${personagem} é uma personagem fictícia` : '';
  return (
    <div style={{ position: 'absolute', left: SEGURA.lado, width: LARGURA_UTIL, top: SEGURA.topo + 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * -60}px)` }}>
      <div style={{ width: '100%', filter: papel ? sombraPapel(T.c.sombra) : undefined }}>
        <div
          style={{
            background: fundoCartao,
            clipPath: papel ? clipRasgado(41, 22, 6) : undefined,
            borderRadius: papel ? 0 : 40,
            padding: papel ? '44px 46px 48px' : '36px 40px 40px',
            textAlign: 'center',
            boxShadow: papel ? undefined : `0 8px 0 ${comAlfa(T.c.sombra, 0.3)}`,
          }}
        >
          <div style={{ fontFamily: papel ? T.f.serif : T.f.texto, fontWeight: papel ? 700 : 800, fontSize: fsChamada, lineHeight: 1.08, color: corChamada, ...linhasMax(3) }}>{textoChamada}</div>
          <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            {comMarca && <span style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 52, color: corChamada }}>Comenta</span>}
            <span
              style={{
                background: corPilula,
                color: corTextoPilula,
                fontFamily: T.f.texto,
                fontWeight: 800,
                fontSize: fsPilula,
                padding: '6px 30px 10px',
                borderRadius: 999,
                transform: `scale(${pulso})`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
                maxWidth: LARGURA_UTIL - 100,
                boxSizing: 'border-box',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {comMarca ? (
                <SimboloMarca simbolo={MARCA!.simbolo} tamanho={Math.round(fsPilula * 0.85)} cor={corTextoPilula} corFundo={corPilula} />
              ) : (
                <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
                  <circle cx={22} cy={22} r={20} fill={corTextoPilula} />
                  <path d="M 22 12 L 22 32 M 12 22 L 32 22" stroke={corPilula} strokeWidth={6} strokeLinecap="round" />
                </svg>
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{textoPilula}</span>
            </span>
          </div>
        </div>
      </div>
      {aviso && avisoTexto ? (
        <div style={{ fontFamily: T.f.texto, fontWeight: 400, fontSize: 30, lineHeight: 1.2, color: legivel(T.c.papel, T.c.titulo), background: comAlfa(T.c.papel, 0.9), padding: '8px 20px', borderRadius: 14, maxWidth: LARGURA_UTIL, boxSizing: 'border-box', textAlign: 'center', ...linhasMax(2) }}>
          {avisoTexto}
        </div>
      ) : null}
    </div>
  );
};

/**
 * Fecho das silhuetas e do giz de cera (as mesmas partes do fecho de sempre). Silhuetas: cartão escuro e
 * translúcido sobre o céu, chamada em serifada inclinada. Giz de cera: chamada à mão direto na folha, a palavra
 * numa pílula de giz.
 */
const FechoDesenhado: React.FC<{ k: number; pulso: number; chamada?: string; palavra?: string | null; aviso: boolean; personagem: string | null }> = ({ k, pulso, chamada, palavra, aviso, personagem }) => {
  const T = useTema();
  const giz = T.estilo.titulo === 'manuscrito';
  const comMarca = MARCA !== null;
  const palavraFinal = (palavra ?? FECHO.palavra ?? MARCA?.palavraFecho ?? (MARCA ? MARCA.nome.split(/\s+/)[0] : '')).toUpperCase();
  const textoChamada = chamada ?? FECHO.chamada ?? (comMarca ? `Quer saber mais sobre ${MARCA!.nome}?` : 'Gostou da história?');
  const corPilula = MARCA?.cor ?? T.c.destaque;
  const corTextoPilula = legivel(corPilula, '#FFFFFF');
  const fundoCartao = giz ? T.c.fundo : T.c.silhueta;
  const corChamada = giz ? legivel(T.c.fundo, T.c.titulo) : legivel(T.c.silhueta, T.c.titulo);
  const fsChamada = giz ? tamanhoQueCabe(textoChamada, LARGURA_GIZ - 20, 100, 52, 3, 0.42) : tamanhoQueCabe(textoChamada, LARGURA_UTIL - 110, 74, 40, 3, 0.5);
  const textoPilula = comMarca ? palavraFinal : 'Segue o perfil';
  const fsPilula = giz ? tamanhoQueCabe(textoPilula, comMarca ? 470 : 560, 76, 36, 1, 0.5) : tamanhoQueCabe(textoPilula, comMarca ? 470 : 560, 62, 30, 1, 0.68);
  const avisoTexto = personagem ? `${personagem} é uma personagem fictícia` : '';
  const fonteMao: React.CSSProperties = giz ? { fontFamily: T.f.mao, fontWeight: 700, filter: `url(#${ID_GIZ_TEXTO})` } : {};
  return (
    <div style={{ position: 'absolute', left: giz ? MARGEM_GIZ : SEGURA.lado, width: giz ? LARGURA_GIZ : LARGURA_UTIL, top: SEGURA.topo + 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * -60}px)` }}>
      {giz ? <FiltroGizTexto /> : null}
      <div
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: comAlfa(fundoCartao, giz ? 0.95 : 0.55),
          border: giz ? `6px dashed ${comAlfa(T.c.titulo, 0.55)}` : undefined,
          borderRadius: 40,
          padding: giz ? '24px 24px 30px' : '40px 46px 44px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: giz ? T.f.mao : T.f.serif, fontWeight: 700, fontStyle: giz ? 'normal' : 'italic', fontSize: fsChamada, lineHeight: giz ? 1.05 : 1.12, color: corChamada, ...(giz ? { filter: `url(#${ID_GIZ_TEXTO})` } : {}), padding: giz ? 0 : '0 12px', ...linhasMax(3) }}>{textoChamada}</div>
        <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          {comMarca && <span style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: giz ? 66 : 52, color: corChamada, ...fonteMao }}>Comenta</span>}
          <span
            style={{
              background: corPilula,
              color: corTextoPilula,
              fontFamily: T.f.texto,
              fontWeight: 800,
              fontSize: fsPilula,
              padding: giz ? '0 30px 4px' : '6px 30px 10px',
              borderRadius: 999,
              border: giz ? `5px solid ${escurecer(corPilula, 0.22)}` : undefined,
              transform: `scale(${pulso}) rotate(${giz ? -2 : 0}deg)`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              maxWidth: (giz ? LARGURA_GIZ : LARGURA_UTIL) - 100,
              boxSizing: 'border-box',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {comMarca ? (
              <SimboloMarca simbolo={MARCA!.simbolo} tamanho={Math.round(fsPilula * (giz ? 0.7 : 0.85))} cor={corTextoPilula} corFundo={corPilula} />
            ) : (
              <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
                <circle cx={22} cy={22} r={20} fill={corTextoPilula} />
                <path d="M 22 12 L 22 32 M 12 22 L 32 22" stroke={corPilula} strokeWidth={6} strokeLinecap="round" />
              </svg>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', ...(giz ? { fontFamily: T.f.mao, fontWeight: 700 } : {}) }}>{textoPilula}</span>
          </span>
        </div>
      </div>
      {aviso && avisoTexto ? (
        <div style={{ fontFamily: T.f.texto, fontWeight: 400, fontSize: 30, lineHeight: 1.2, color: legivel(T.c.papel, T.c.titulo), background: comAlfa(T.c.papel, 0.9), padding: '8px 20px', borderRadius: 14, maxWidth: giz ? LARGURA_GIZ : LARGURA_UTIL, boxSizing: 'border-box', textAlign: 'center', ...linhasMax(2) }}>
          {avisoTexto}
        </div>
      ) : null}
    </div>
  );
};
