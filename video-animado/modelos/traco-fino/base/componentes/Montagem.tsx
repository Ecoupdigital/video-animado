import React from 'react';
import { AbsoluteFill, Audio, getStaticFiles, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COR } from './cores';
import { FONTE_TEXTO } from './fontes';
import { CHAO_Y } from './Cenario';
import { Palavra } from './Texto';
import { FECHO, MARCA } from './universo';

// Peças de montagem comuns a todos os episódios: tempo, boca da narradora, legenda por frase, câmera,
// trilha, efeitos e etiqueta. Nenhum texto de marca fixo: a palavra do fecho vem de componentes/universo.ts.
export const FPS = 30;
export const s = (seg: number) => Math.round(seg * FPS);

/** Quem fala de quando a quando (segundos). `tempo` diz se a fala é do antes ou do agora (do roteiro). */
export type Fala = { quem: string; ini: number; fim: number; tempo?: 'antes' | 'agora' };

/** Volume da boca: só abre a boca de quem está falando naquele trecho (neste modelo, a narradora). */
export const criarBocas = (volume: number[], falas: Fala[]) => (quem: string, f: number) => {
  const t = f / FPS;
  const fala = falas.find((x) => t >= x.ini - 0.05 && t <= x.fim + 0.1);
  if (!fala || fala.quem !== quem) return 0;
  return volume[Math.max(0, f)] ?? 0;
};

/** A fala do segundo t (ou undefined no silêncio). */
export const falaEm = (falas: Fala[], t: number): Fala | undefined => falas.find((x) => t >= x.ini - 0.05 && t <= x.fim + 0.1);

const semAcento = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * Palavras do Whisper (em segundos) viram palavras da legenda (em frames), com as correções do episódio.
 *   troca: { "<índice>": "texto" } ou { "<texto do Whisper>": "texto" }
 *   remover: índices que somem (palavra duplicada, ruído)
 * Correções do universo, sem termo fixo: junta palavra que o Whisper separa em "-parte",
 * e depois de "Comenta" a palavra do fecho (respostas.json) sai em maiúsculas.
 */
export const prepararPalavras = (brutas: { texto: string; inicio: number; fim: number }[], troca: Record<string, string> = {}, remover: number[] = []): (Palavra & { fim: number })[] => {
  const palavraFecho = FECHO.palavra ?? MARCA?.palavraFecho ?? null;
  return brutas
    .map((p, i) => ({ p, i }))
    .map(({ p, i }) => (brutas[i + 1]?.texto.startsWith('-') ? { p: { ...p, texto: p.texto + brutas[i + 1].texto, fim: brutas[i + 1].fim }, i } : { p, i }))
    .filter(({ p }) => !p.texto.startsWith('-'))
    .filter(({ i }) => !remover.includes(i))
    .map(({ p, i }) => {
      let texto = troca[String(i)] ?? troca[p.texto] ?? p.texto;
      if (palavraFecho && /^comenta[,:]?$/i.test(brutas[i - 1]?.texto ?? '') && semAcento(texto).startsWith(semAcento(palavraFecho))) {
        const pontuacao = texto.match(/[.!?,]+$/)?.[0] ?? '.';
        texto = palavraFecho.toUpperCase() + pontuacao;
      }
      return { texto, inicio: s(p.inicio), fim: s(p.fim) };
    });
};

/**
 * Legenda de frase inteira. As palavras são repartidas pelas falas pelo NÚMERO de palavras de cada fala do roteiro
 * (o tempo da transcrição chega uns décimos adiantado e jogaria a 1ª palavra da fala seguinte na anterior).
 * Fala longa (mais de 11 palavras) se divide no ponto final mais perto do meio; bloco com mais de 10 palavras,
 * na vírgula mais perto do meio. O cartão de uma fala fica até a 1ª palavra da seguinte (ou até o fim dela + 0,6 s).
 */
export const legendaDasFalas = (palavras: (Palavra & { fim: number })[], textos: string[]) => {
  const blocos: (Palavra & { fim: number })[][] = [];
  let i = 0;
  for (const tx of textos) {
    const n = tx.trim().split(/\s+/).filter(Boolean).length;
    const da = palavras.slice(i, i + n);
    i += n;
    if (da.length > 11) {
      const pontos = da.map((p, j) => (/[.?!]$/.test(p.texto) ? j : -1)).filter((j) => j > 1 && j < da.length - 2);
      if (pontos.length) {
        const meio = pontos.reduce((x, y) => (Math.abs(y - da.length / 2) < Math.abs(x - da.length / 2) ? y : x));
        blocos.push(da.slice(0, meio + 1), da.slice(meio + 1));
        continue;
      }
    }
    blocos.push(da);
  }
  for (let k = 0; k < blocos.length; k++) {
    const b = blocos[k];
    if (b.length <= 10) continue;
    const cortes = b.map((p, j) => (/[,.?!:]$/.test(p.texto) ? j : -1)).filter((j) => j > 1 && j < b.length - 3);
    if (!cortes.length) continue;
    const meio = cortes.reduce((x, y) => (Math.abs(y - b.length / 2) < Math.abs(x - b.length / 2) ? y : x));
    blocos.splice(k, 1, b.slice(0, meio + 1), b.slice(meio + 1));
    k++;
  }
  return (f: number): Palavra[] => {
    for (let k = blocos.length - 1; k >= 0; k--) {
      const b = blocos[k];
      if (!b.length || f < b[0].inicio - 4) continue;
      const ultima = b[b.length - 1];
      const proxima = blocos[k + 1]?.[0]?.inicio ?? Infinity;
      const ate = Math.min(proxima - 4, ultima.fim + s(0.6));
      return f <= ate ? b : [];
    }
    return [];
  };
};

/** Personagem com os pés no chão do cenário. */
export const NoChao: React.FC<{ x: number; escala?: number; dy?: number; children: React.ReactNode }> = ({ x, escala = 1, dy = 0, children }) => (
  <div style={{ position: 'absolute', left: x, top: CHAO_Y - 890 * escala + dy }}>{children}</div>
);

/** Câmera: zoom e deslocamento aplicados ao cenário e aos personagens juntos. */
export const Camera: React.FC<{ zoom: number; ox?: number; oy?: number; children: React.ReactNode }> = ({ zoom, ox = 540, oy = CHAO_Y, children }) => (
  <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${ox}px ${oy}px` }}>{children}</AbsoluteFill>
);

/** O arquivo existe na pasta public/ do episódio? (no render e no Studio; fora deles, a lista vem vazia). */
export const temArquivo = (nome: string) => getStaticFiles().some((f) => f.name === nome);

/** Efeito sonoro num instante (segundos). Arquivos em public/sfx/; se o arquivo não existe, fica mudo. */
export const SFX: React.FC<{ arquivo: string; em: number; volume?: number }> = ({ arquivo, em, volume = 0.5 }) =>
  temArquivo(`sfx/${arquivo}`) ? (
    <Sequence from={s(em)} durationInFrames={s(1.5)} layout="none">
      <Audio src={staticFile(`sfx/${arquivo}`)} volume={volume} />
    </Sequence>
  ) : null;

/**
 * Trilha de fundo (public/trilha.wav, gerada pelo _ferramentas/trilha.py): volume fixo baixo, bem abaixo da
 * voz, com entrada de 1 s e saída de 1,5 s. Se o arquivo não existe, fica muda.
 */
export const Trilha: React.FC<{ duracao: number; volume?: number; arquivo?: string }> = ({ duracao, volume = 0.09, arquivo = 'trilha.wav' }) =>
  temArquivo(arquivo) ? (
    <Audio src={staticFile(arquivo)} volume={(fr) => interpolate(fr, [0, s(1), duracao - s(1.5), duracao], [0, volume, volume, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
  ) : null;

/** Etiqueta em pílula que entra com mola numa posição livre (ex.: "20 minutos", "semana 3"). */
export const Etiqueta: React.FC<{ texto: string; x: number; y: number; inicio: number; cor?: string; corTexto?: string; tamanho?: number; ang?: number }> = ({
  texto,
  x,
  y,
  inicio,
  cor = COR.destaque,
  corTexto = COR.branco,
  tamanho = 40,
  ang = -3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: frame - inicio, fps, config: { damping: 12, stiffness: 180 } });
  if (frame < inicio) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `rotate(${ang}deg) scale(${k})`,
        background: cor,
        color: corTexto,
        border: `3px solid ${COR.tinta}`,
        borderRadius: 99,
        padding: '12px 30px',
        fontFamily: FONTE_TEXTO,
        fontWeight: 700,
        fontSize: tamanho,
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </div>
  );
};
