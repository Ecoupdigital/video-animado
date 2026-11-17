import React from 'react';
import { AbsoluteFill, Audio, getStaticFiles, Sequence, staticFile } from 'remotion';
import { resolverAparencia } from './aparencia';
import { CENTROS, CHAO_Y, FPS, H, s, SEGURA, W } from './medidas';
import type { PersonagemProps } from './Personagem';
import type { Expressao, Olhar } from './rosto';
import { TEMAS, useTema } from './tema';
import { MODULOS } from './temas';
import { Balao, Fecho, Legenda, medirBalao, SeloTopo, Titulo, type Palavra } from './Texto';
import { CENARIOS, FECHO, MARCA, PESSOAS } from './universo';

// Montagem do Conto: tempo, bocas, legenda, som e a cena pronta (fundo do tema, cenário, personagens no chão,
// título, balão ou legenda, fecho). A mesma cena serve ao episódio (por frame) e aos stills de conferência
// (um instante parado). Os tipos de cena valem em todos os temas:
//   abertura  o título (faixa rasgada ou selo e título) com a protagonista no cenário
//   dialogo   dois personagens olhando um para o outro, só quem fala de boca aberta; a fala no balão (formas)
//             ou na legenda (papel)
//   narrador  os dois em cena, todas as bocas fechadas; a fala do narrador na legenda
//   fecho     a chamada, "Comenta <PALAVRA>" e o aviso, com a protagonista embaixo

export { FPS, s };
export type TipoCena = 'abertura' | 'dialogo' | 'narrador' | 'fecho';
export const TIPOS_CENA: TipoCena[] = ['abertura', 'dialogo', 'narrador', 'fecho'];

export type Fala = { quem: string; ini: number; fim: number };
export const ID_NARRADOR = 'narrador';

/** Volume da boca de cada personagem: só abre a boca de quem está falando naquele trecho (o narrador não tem boca). */
export const criarBocas = (volume: number[], falas: Fala[]) => (quem: string, f: number) => {
  const t = f / FPS;
  const fala = falas.find((x) => t >= x.ini - 0.05 && t <= x.fim + 0.1);
  if (!fala || fala.quem !== quem || quem === ID_NARRADOR) return 0;
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

/** O arquivo existe na pasta public/ do episódio? (no render e no Studio; fora deles, a lista vem vazia). */
export const temArquivo = (nome: string) => getStaticFiles().some((f) => f.name === nome);

/** Efeito sonoro num instante (segundos). Arquivos em public/sfx/; se o arquivo não existe, fica mudo. */
export const SFX: React.FC<{ arquivo: string; em: number; volume?: number }> = ({ arquivo, em, volume = 0.5 }) =>
  temArquivo(`sfx/${arquivo}`) ? (
    <Sequence from={s(em)} durationInFrames={s(1.5)} layout="none">
      <Audio src={staticFile(`sfx/${arquivo}`)} volume={volume} />
    </Sequence>
  ) : null;

/** Narração montada (public/narracao.mp3), se existir. */
export const Narracao: React.FC = () => (temArquivo('narracao.mp3') ? <Audio src={staticFile('narracao.mp3')} /> : null);

/** Personagem com os pés no chão do cenário: x é o centro dele na tela. */
export const NoChao: React.FC<{ x: number; escala: number; children: React.ReactNode }> = ({ x, escala, children }) => (
  <div style={{ position: 'absolute', left: x - 200 * escala, top: CHAO_Y + 6 - 890 * escala }}>{children}</div>
);

/** Área segura do Reels marcada por cima (stills de conferência). */
export const AreaSegura: React.FC = () => {
  const faixa = 'repeating-linear-gradient(45deg, rgba(255,40,80,0.28) 0 12px, rgba(255,40,80,0.12) 12px 24px)';
  const yb = H - SEGURA.baixo;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SEGURA.topo, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: yb, bottom: 0, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', right: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', left: SEGURA.lado, top: SEGURA.topo, width: W - 2 * SEGURA.lado, height: yb - SEGURA.topo, border: '3px dashed rgba(255,40,80,0.9)', boxSizing: 'border-box' }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- cena pronta

/** Centro de cada personagem em cena: um sozinho fica à esquerda (como na tela de referência do papel), dois
 *  ficam nas pontas e o cenário aparece no meio. A escala é a do tema (opcoes.json, estilos.<tema>.escala). */
export const POSICOES = CENTROS;

export type EmCena = { id: string; C: React.FC<PersonagemProps>; expressao: Expressao; falando: number; olhando?: Olhar };
export type TextoNaTela = { palavras: string[]; ativa: number; k?: number };
export type BalaoNaTela = { de: number; texto: string; k?: number };

/** Topo da cabeça do personagem em cena (px na tela), no traço do tema. */
const topoNaTela = (id: string, modulo: (typeof MODULOS)[string], escala: number) => {
  const p = PESSOAS[id];
  const ap = resolverAparencia(p?.aparencia ?? {}, p?.semente ?? 1);
  return CHAO_Y + 6 - 890 * escala + modulo.topo(ap) * escala;
};

export const Cena: React.FC<{
  tipo: TipoCena;
  cenario?: string;
  lugar?: string | null;
  /** 1 (abertura, fecho) ou 2 personagens (diálogo, narrador) */
  elenco: EmCena[];
  titulo?: { titulo: string; subtitulo?: string | null; rotulo?: string | null; k?: number } | null;
  /** selo do episódio no topo (formas), fora da abertura */
  selo?: string | null;
  /** legenda embaixo (papel: as falas; formas: a fala do narrador ou a situação) */
  legenda?: TextoNaTela | null;
  /** balões de fala (formas): de = índice no elenco; o primeiro é claro, o segundo escuro */
  baloes?: BalaoNaTela[];
  kFecho?: number;
  pulsoFecho?: number;
}> = ({ tipo, cenario = CENARIOS.lista[0] ?? 'rua', lugar = CENARIOS.lugar, elenco, titulo, selo, legenda, baloes = [], kFecho = 1, pulsoFecho = 1 }) => {
  const T = useTema();
  const M = MODULOS[T.id] ?? MODULOS[TEMAS[0]];
  const xs: readonly number[] = tipo === 'fecho' ? POSICOES.fecho : elenco.length > 1 ? POSICOES.dois : POSICOES.um;
  const escala = tipo === 'fecho' ? T.estilo.escala * 0.9 : T.estilo.escala;
  // dois balões: o mais recente fica acima de quem fala; o anterior sobe para não cobrir o recente (como na tela
  // de referência das formas, um em cima do outro)
  const lugarBalao = (i: number): number | undefined => {
    if (baloes.length < 2 || i === baloes.length - 1) return undefined;
    const ult = baloes[baloes.length - 1];
    const pu = elenco[ult.de];
    if (!pu) return undefined;
    const base = Math.min(topoNaTela(pu.id, M, escala) - 30, CHAO_Y);
    const topoUlt = base - 46 - medirBalao(ult.texto).altura;
    return topoUlt - 26;
  };
  return (
    <AbsoluteFill>
      <M.Fundo cenario={cenario} lugar={lugar} />
      {elenco.slice(0, xs.length).map((p, i) => {
        const C = p.C;
        const olhando: Olhar = p.olhando ?? (elenco.length > 1 ? (i === 0 ? 'direita' : 'esquerda') : 'frente');
        // o da direita fica espelhado: o braço que gesticula e o boné apontam para o outro, não para fora da tela
        const espelhar = elenco.length > 1 && i === 1;
        return (
          <NoChao key={p.id} x={xs[i]} escala={escala}>
            <C expressao={p.expressao} falando={p.falando} olhando={olhando} escala={escala} espelhar={espelhar} />
          </NoChao>
        );
      })}
      {tipo !== 'abertura' && tipo !== 'fecho' && selo && T.estilo.titulo === 'selo' ? <SeloTopo texto={selo} /> : null}
      {baloes.map((b, i) => {
        const p = elenco[b.de];
        if (!p) return null;
        return <Balao key={i} texto={b.texto} x={xs[b.de]} y={topoNaTela(p.id, M, escala)} base={lugarBalao(i)} escuro={b.de % 2 === 1} k={b.k ?? 1} />;
      })}
      {titulo && tipo === 'abertura' ? <Titulo titulo={titulo.titulo} subtitulo={titulo.subtitulo} rotulo={titulo.rotulo} k={titulo.k ?? 1} /> : null}
      {legenda && tipo !== 'fecho' ? <Legenda palavras={legenda.palavras} ativa={legenda.ativa} k={legenda.k ?? 1} /> : null}
      {tipo === 'fecho' ? <Fecho k={kFecho} pulso={pulsoFecho} /> : null}
    </AbsoluteFill>
  );
};
