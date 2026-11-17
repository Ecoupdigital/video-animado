import React from 'react';
import { AbsoluteFill, Audio, getStaticFiles, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COR } from './cores';
import { FONTE_TITULO } from './fontes';
import { CHAO_Y } from './Cenario';
import { Palavra } from './Texto';
import { FECHO, MARCA } from './universo';

// Peças de montagem comuns a todos os episódios: tempo, bocas, legenda, câmera, efeitos e cartões.
export const FPS = 30;
export const s = (seg: number) => Math.round(seg * FPS);

export type Fala = { quem: string; ini: number; fim: number };

/** Volume da boca de cada personagem: só abre a boca de quem está falando naquele trecho. */
export const criarBocas = (volume: number[], falas: Fala[]) => (quem: string, f: number) => {
  const t = f / FPS;
  const fala = falas.find((x) => t >= x.ini - 0.05 && t <= x.fim + 0.1);
  if (!fala || fala.quem !== quem) return 0;
  return volume[Math.max(0, f)] ?? 0;
};

/** Quem está falando no segundo t (ou null no silêncio). */
export const quemFala = (falas: Fala[], t: number): string | null => falas.find((x) => t >= x.ini - 0.05 && t <= x.fim + 0.1)?.quem ?? null;

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
export const prepararPalavras = (brutas: { texto: string; inicio: number; fim: number }[], troca: Record<string, string> = {}, remover: number[] = []): Palavra[] => {
  const palavraFecho = FECHO.palavra ?? MARCA?.palavraFecho ?? null;
  return (
    brutas
      .map((p, i) => ({ p, i }))
      // o Whisper às vezes separa palavra com hífen ("bem" e "-vindo"): junta de volta
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
      })
  );
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

/** Post-it com texto que aparece com mola. */
export const PostItTexto: React.FC<{ texto: string; x: number; y: number; ang: number; inicio: number; cor?: string; largura?: number }> = ({ texto, x, y, ang, inicio, cor = '#F3D98B', largura = 250 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: frame - inicio, fps, config: { damping: 11, stiffness: 190 } });
  if (frame < inicio) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: largura,
        padding: '26px 18px 22px',
        background: cor,
        borderRadius: 6,
        transform: `rotate(${ang}deg) scale(${k})`,
        fontFamily: FONTE_TITULO,
        fontWeight: 800,
        fontSize: texto.length > 24 ? 34 : 42,
        lineHeight: 1.05,
        color: COR.texto,
        textAlign: 'center',
        boxShadow: '0 6px 0 rgba(60,35,20,0.12)',
      }}
    >
      <div style={{ position: 'absolute', top: 8, left: largura / 2 - 8, width: 16, height: 16, borderRadius: 99, background: COR.destaque }} />
      {texto}
    </div>
  );
};

export type ItemLista = { texto: string; em: number; marca?: '✓' | '✗' | '!' | '•' | string };

/** Lista em cartão branco no topo da tela (faixa 255 a ~550): cada item entra no seu tempo (segundos). */
export const ListaMarcada: React.FC<{ itens: ItemLista[]; titulo?: string; corTitulo?: string; y?: number; tamanho?: number }> = ({ itens, titulo, corTitulo = COR.destaqueProfundo, y = 255, tamanho = 54 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const corMarca = (m?: string) => (m === '✗' || m === '!' ? COR.erro : COR.acerto);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: COR.branco, borderRadius: 28, padding: '12px 34px 16px', boxShadow: '0 6px 0 rgba(60,35,20,0.10)', display: 'flex', flexDirection: 'column', maxWidth: 960 }}>
        {titulo && <div style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: tamanho * 0.9, lineHeight: 1.15, color: corTitulo }}>{titulo}</div>}
        {itens
          .filter((e) => frame >= s(e.em))
          .map((e) => {
            const k = spring({ frame: frame - s(e.em), fps, config: { damping: 12, stiffness: 200 } });
            return (
              <div key={e.texto} style={{ display: 'flex', alignItems: 'center', gap: 20, transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: 'left center' }}>
                <span style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: tamanho, lineHeight: 1.15, color: corMarca(e.marca), width: tamanho * 0.8, textAlign: 'center' }}>{e.marca ?? '✓'}</span>
                <span style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: tamanho, lineHeight: 1.15, color: COR.texto }}>{e.texto}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

/** Etiqueta pequena (ex.: "3 escovas", "dia 7") que entra com mola numa posição livre. Texto grande: cor de destaque. */
export const Etiqueta: React.FC<{ texto: string; x: number; y: number; inicio: number; cor?: string; corTexto?: string; tamanho?: number; ang?: number }> = ({ texto, x, y, inicio, cor = COR.destaque, corTexto = COR.branco, tamanho = 54, ang = -4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: frame - inicio, fps, config: { damping: 10, stiffness: 200 } });
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
        fontFamily: FONTE_TITULO,
        fontWeight: 800,
        fontSize: tamanho,
        padding: '4px 30px 10px',
        borderRadius: 999,
        boxShadow: '0 6px 0 rgba(60,35,20,0.12)',
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </div>
  );
};

/** "Zzz" subindo devagar (sono). */
export const Zzz: React.FC<{ x: number; y: number; inicio: number }> = ({ x, y, inicio }) => {
  const frame = useCurrentFrame();
  if (frame < inicio) return null;
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = ((frame - inicio) / 30 + i * 0.6) % 1.8;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + t * 40 + i * 10,
              top: y - t * 120,
              opacity: Math.min(1, t * 2) * (1 - t / 1.8),
              fontFamily: FONTE_TITULO,
              fontWeight: 800,
              fontSize: 60 + i * 14,
              color: COR.branco,
              textShadow: '0 4px 0 rgba(30,30,60,0.35)',
            }}
          >
            z
          </div>
        );
      })}
    </>
  );
};
