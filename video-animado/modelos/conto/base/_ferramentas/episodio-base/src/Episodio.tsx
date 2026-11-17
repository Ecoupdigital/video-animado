import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Cena, criarBocas, ID_NARRADOR, Narracao, prepararPalavras, quemFala, s, SFX, type EmCena, type Fala, type TipoCena } from '../../../componentes/Montagem';
import { blocoNoFrame, type Palavra } from '../../../componentes/Texto';
import { useTema } from '../../../componentes/tema';
import { CENARIOS, NARRADOR, UNIVERSO } from '../../../componentes/universo';
import { type EntradaElenco, PERSONAGENS } from '../../../personagens';
import falasJson from './falas.json';
import palavrasJson from './palavras.json';
import volumeJson from './volume.json';

// EPISÓDIO BASE do modelo Conto: ponto de partida de todo vídeo. Copie src/ para videos/AAAA-MM-DD-slug/ e edite.
// Do jeito que vem, ele já, no tema do universo:
//   - acha cada personagem pelo "quem" do falas.json (id de personagens/, ou o nome);
//   - põe em cena os dois primeiros que falam, olhando um para o outro (o da direita espelhado);
//   - abre a boca só de quem fala, pelo volume (criarBocas); nas falas do narrador ("quem": "narrador"), todas fechadas;
//   - abre com o título por cima da cena nos primeiros segundos (faixa rasgada no papel, selo e título nas formas);
//   - mostra a fala na legenda (papel) ou no balão acima de quem fala (formas), e a do narrador na legenda;
//   - fecha com o fecho do universo; toca a narração e os efeitos só se os arquivos existirem em public/.
// A duração sai do falas.json: fim da última fala + respiro + fecho.

const FALAS = falasJson as Fala[];
const VOLUME = volumeJson as number[];
const PALAVRAS: Palavra[] = prepararPalavras(palavrasJson as { texto: string; inicio: number; fim: number }[]);

export const FIM_FALAS = FALAS.length ? Math.max(...FALAS.map((f) => f.fim)) : 0;
const RESPIRO = 0.6;
const SEG_FECHO = 4;
/** segundos com o título por cima da cena, no começo */
const SEG_TITULO = 2.2;
export const INICIO_FECHO = FIM_FALAS + RESPIRO;
export const DURACAO = s(INICIO_FECHO + SEG_FECHO);

/** Cenário do episódio (um dos de CENARIOS.lista) e a linha de situação embaixo nas formas (null = nenhuma). */
const CENARIO = CENARIOS.lista[0] ?? 'rua';
const SITUACAO = null as string | null;

const boca = criarBocas(VOLUME, FALAS);

const semAcento = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

/** Personagem do elenco pelo "quem": id exato, depois o nome sem acento. */
export const acharPersonagem = (quem: string): EntradaElenco | undefined => PERSONAGENS.find((p) => p.id === quem) ?? PERSONAGENS.find((p) => semAcento(p.nome) === semAcento(quem));

// Elenco em cena: os dois primeiros que falam (na ordem em que aparecem); se faltar, completa com o elenco.
const QUEM_FALA = [...new Set(FALAS.map((f) => f.quem))].filter((q) => q !== ID_NARRADOR);
const NAO_ACHADOS = QUEM_FALA.filter((q) => !acharPersonagem(q));
if (NAO_ACHADOS.length) console.warn(`falas.json: "quem" sem personagem: ${NAO_ACHADOS.join(', ')} (use o id de personagens/ ou "narrador")`);
if (!NARRADOR.ligado && FALAS.some((f) => f.quem === ID_NARRADOR)) console.warn('falas.json: fala do narrador, mas o narrador está desligado no universo');
const PROTAGONISTA = PERSONAGENS.find((p) => p.papel === 'protagonista') ?? PERSONAGENS[0];
const EM_CENA: EntradaElenco[] = [...new Set([...QUEM_FALA.map(acharPersonagem).filter((p): p is EntradaElenco => Boolean(p)), PROTAGONISTA, ...PERSONAGENS])].slice(0, 2);

/** Palavras de uma fala (pelo tempo). */
const palavrasDa = (fala: Fala) => PALAVRAS.filter((p) => p.inicio >= s(fala.ini) - 3 && p.inicio <= s(fala.fim) + 3);

export const Episodio: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = useTema();
  const t = f / fps;
  const noFecho = t >= INICIO_FECHO;
  const falando = noFecho ? null : quemFala(FALAS, t);
  const doNarrador = falando === ID_NARRADOR;
  const quemNaCena = falando && !doNarrador ? EM_CENA.findIndex((p) => acharPersonagem(falando) === p) : -1;
  const comTitulo = t < SEG_TITULO;
  const tipo: TipoCena = noFecho ? 'fecho' : comTitulo ? 'abertura' : doNarrador ? 'narrador' : 'dialogo';

  const elenco: EmCena[] = (noFecho ? [PROTAGONISTA] : EM_CENA).map((p, i) => ({
    id: p.id,
    C: p.C,
    expressao: noFecho ? 'feliz' : i === quemNaCena ? 'falando' : 'neutra',
    falando: noFecho ? 0 : boca(p.id, f),
  }));

  // texto da vez: o bloco da legenda (até 4 palavras) da fala atual
  const bloco = blocoNoFrame(PALAVRAS, f, 4);
  const naLegenda = T.estilo.fala === 'legenda' || doNarrador || comTitulo;
  const legenda = bloco && naLegenda ? { palavras: bloco.palavras, ativa: bloco.ativa } : SITUACAO && !naLegenda ? { palavras: SITUACAO.split(' '), ativa: -1 } : null;

  // balões (formas): o da fala atual, até o bloco da vez, e o último bloco da fala anterior do outro, se recente
  const baloes: { de: number; texto: string; k: number }[] = [];
  if (!naLegenda && !noFecho) {
    const iAtual = FALAS.findIndex((x) => t >= x.ini - 0.05 && t <= x.fim + 0.1);
    const atual = iAtual >= 0 ? FALAS[iAtual] : null;
    const anterior = FALAS[(iAtual >= 0 ? iAtual : FALAS.filter((x) => x.fim < t).length) - 1] ?? null;
    if (anterior && anterior.quem !== ID_NARRADOR && t - anterior.fim < 2.5 && (!atual || atual.quem !== anterior.quem)) {
      const de = EM_CENA.findIndex((p) => acharPersonagem(anterior.quem) === p);
      const ultimas = palavrasDa(anterior).slice(-6).map((p) => p.texto);
      if (de >= 0 && ultimas.length) baloes.push({ de, texto: ultimas.join(' '), k: 1 });
    }
    if (atual && quemNaCena >= 0 && bloco) {
      const k = spring({ frame: f - s(atual.ini), fps, config: { damping: 14, stiffness: 220 } });
      baloes.push({ de: quemNaCena, texto: bloco.palavras.join(' '), k });
    }
  }

  const kTitulo = spring({ frame: f - 2, fps, config: { damping: 16, stiffness: 170 } });
  const kFecho = spring({ frame: f - s(INICIO_FECHO), fps, config: { damping: 16, stiffness: 160 } });
  const pulso = 1 + Math.max(0, Math.sin((f - s(INICIO_FECHO)) / 6)) * 0.04;

  return (
    <AbsoluteFill style={{ backgroundColor: T.c.fundo }}>
      <Cena
        tipo={tipo}
        cenario={CENARIO}
        elenco={elenco}
        titulo={{ titulo: UNIVERSO.nome, subtitulo: CENARIOS.lugar, rotulo: `ep. 1 · ${UNIVERSO.nome}`, k: kTitulo }}
        selo={`ep. 1 · ${UNIVERSO.nome}`}
        legenda={legenda}
        baloes={baloes}
        kFecho={kFecho}
        pulsoFecho={pulso}
      />
      <Narracao />
      <SFX arquivo="pop.wav" em={0.05} volume={0.4} />
      {T.estilo.titulo === 'faixa-rasgada' ? <SFX arquivo="papel.wav" em={SEG_TITULO} volume={0.35} /> : null}
      <SFX arquivo="ding.wav" em={INICIO_FECHO} volume={0.35} />
    </AbsoluteFill>
  );
};
