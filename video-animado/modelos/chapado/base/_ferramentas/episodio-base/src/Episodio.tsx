import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COR } from '../../../componentes/cores';
import { CHAO_Y } from '../../../componentes/Cenario';
import { Fecho, Legenda, TituloDica, nomeProtagonista } from '../../../componentes/Texto';
import { Camera, criarBocas, Fala, NoChao, prepararPalavras, quemFala, s, SFX, temArquivo } from '../../../componentes/Montagem';
import { Casa, Comodo } from '../../../cenarios/Casa';
import { SalaDeEspera } from '../../../cenarios/SalaDeEspera';
import { Rua } from '../../../cenarios/Rua';
import { CENARIOS, PESSOAS, UNIVERSO } from '../../../componentes/universo';
import { EntradaElenco, PERSONAGENS } from '../../../personagens';
import falasJson from './falas.json';
import palavrasJson from './palavras.json';
import volumeJson from './volume.json';

// EPISÓDIO BASE do modelo: ponto de partida de todo vídeo. Copie src/ para videos/AAAA-MM-DD-slug/
// e edite as cenas. Do jeito que vem, ele já:
//   - acha cada personagem pelo "quem" do falas.json (id em personagens/);
//   - põe em cena as duas primeiras pessoas que falam, olhando uma para a outra;
//   - abre a boca só de quem fala (criarBocas), com a câmera um pouco mais perto dela;
//   - mostra a legenda palavra por palavra (palavras.json) e o título nos primeiros segundos;
//   - fecha com o Fecho do universo; toca a narração e os efeitos só se os arquivos existirem em public/.
// A duração sai do falas.json: fim da última fala + respiro + fecho.

const FALAS = falasJson as Fala[];
const VOLUME = volumeJson as number[];
const PALAVRAS = prepararPalavras(palavrasJson as { texto: string; inicio: number; fim: number }[]);

export const FIM_FALAS = FALAS.length ? Math.max(...FALAS.map((f) => f.fim)) : 0;
const RESPIRO = 0.6;
const SEG_FECHO = 4;
export const INICIO_FECHO = FIM_FALAS + RESPIRO;
export const DURACAO = s(INICIO_FECHO + SEG_FECHO);

const boca = criarBocas(VOLUME, FALAS);

const semAcento = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

/** Personagem do elenco pelo "quem": id exato, depois o nome sem acento. */
export const acharPersonagem = (quem: string): EntradaElenco | undefined =>
  PERSONAGENS.find((p) => p.id === quem) ?? PERSONAGENS.find((p) => semAcento(p.nome) === semAcento(quem));

type EntradaPessoa = Extract<EntradaElenco, { tipo: 'pessoa' }>;
const ehPessoa = (p: EntradaElenco | undefined): p is EntradaPessoa => p?.tipo === 'pessoa';

// Elenco em cena: as duas primeiras pessoas que falam (na ordem em que aparecem). Sem fala, a protagonista.
const QUEM_FALA = [...new Set(FALAS.map((f) => f.quem))];
const NAO_ACHADOS = QUEM_FALA.filter((q) => !acharPersonagem(q));
if (NAO_ACHADOS.length) console.warn(`falas.json: "quem" sem personagem: ${NAO_ACHADOS.join(', ')} (use o id de personagens/)`);
const PROTAGONISTA = PERSONAGENS.find((p) => ehPessoa(p) && PESSOAS[p.id]?.papel === 'protagonista') as EntradaPessoa | undefined;
const EM_CENA: EntradaPessoa[] = QUEM_FALA.map(acharPersonagem).filter(ehPessoa).slice(0, 2);
if (EM_CENA.length === 0 && PROTAGONISTA) EM_CENA.push(PROTAGONISTA);
const CACHORRO = PERSONAGENS.find((p) => p.tipo === 'cachorro');
const NO_FECHO = (PROTAGONISTA && EM_CENA.includes(PROTAGONISTA) ? PROTAGONISTA : EM_CENA[0]) as EntradaPessoa | undefined;

/** Posição x (canto esquerdo, escala 1) de cada pessoa em cena. */
const POSICOES = EM_CENA.length === 1 ? [340] : [40, 640];

/** Cenário do episódio: troque aqui (Casa, SalaDeEspera, Rua, hora, câmera). */
const Cenario: React.FC = () =>
  CENARIOS.salaEspera ? <SalaDeEspera /> : CENARIOS.casa.length ? <Casa comodo={CENARIOS.casa[0] as Comodo} listas={8} /> : CENARIOS.rua ? <Rua /> : <Casa comodo="sala" />;

export const Episodio: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const noFecho = t >= INICIO_FECHO;
  const falando = noFecho ? null : quemFala(FALAS, t);
  const iFala = EM_CENA.findIndex((p) => acharPersonagem(falando ?? '') === p);
  // câmera chega um pouco mais perto de quem fala
  const zoom = !noFecho && iFala >= 0 ? 1.06 : 1;
  const ox = iFala >= 0 ? POSICOES[iFala] + 200 : 540;

  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      {!noFecho && (
        <Camera zoom={zoom} ox={ox}>
          <Cenario />
          {EM_CENA.map((p, i) => {
            const C = p.C;
            const fala = acharPersonagem(falando ?? '') === p;
            const outro = EM_CENA.length > 1 ? (i === 0 ? 'direita' : 'esquerda') : undefined;
            return (
              <NoChao key={p.id} x={POSICOES[i]}>
                <C expressao={fala ? 'falando' : 'neutra'} falando={fala ? boca(falando!, f) : 0} olhando={outro} />
              </NoChao>
            );
          })}
          {CACHORRO && CACHORRO.tipo === 'cachorro' && (
            <div style={{ position: 'absolute', left: EM_CENA.length > 1 ? 440 : 760, top: CHAO_Y - 210 }}>
              <CACHORRO.C expressao="curioso" escala={0.7} />
            </div>
          )}
        </Camera>
      )}
      {noFecho && (
        <Camera zoom={1}>
          <Cenario />
          {NO_FECHO && (
            <NoChao x={340} escala={1.1}>
              <NO_FECHO.C expressao="feliz" escala={1.1} />
            </NoChao>
          )}
        </Camera>
      )}

      {t < 2.5 && <TituloDica texto={UNIVERSO.nome} inicio={s(0.05)} cartao />}
      {!noFecho && <Legenda palavras={PALAVRAS} />}
      {noFecho && <Fecho inicio={s(INICIO_FECHO)} personagem={NO_FECHO?.nome ?? nomeProtagonista()} />}

      {temArquivo('narracao.mp3') && <Audio src={staticFile('narracao.mp3')} />}
      <SFX arquivo="pop.wav" em={0.05} volume={0.4} />
      <SFX arquivo="ding.wav" em={INICIO_FECHO} volume={0.35} />
    </AbsoluteFill>
  );
};
