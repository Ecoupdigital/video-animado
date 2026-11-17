import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COR } from '../../../componentes/cores';
import { Lembranca, Luz, NaLuz } from '../../../componentes/Cenario';
import { Fecho, Legenda, SeloTempo, nomeProtagonista } from '../../../componentes/Texto';
import { Camera, criarBocas, Fala, falaEm, legendaDasFalas, NoChao, prepararPalavras, s, SFX, temArquivo, Trilha } from '../../../componentes/Montagem';
import { Apartamento, Comodo } from '../../../cenarios/Apartamento';
import { Escritorio } from '../../../cenarios/Escritorio';
import { Escola } from '../../../cenarios/Escola';
import { SalaDeEspera } from '../../../cenarios/SalaDeEspera';
import { CENARIOS, PESSOAS } from '../../../componentes/universo';
import { EntradaElenco, PERSONAGENS } from '../../../personagens';
import falasJson from './falas.json';
import palavrasJson from './palavras.json';
import volumeJson from './volume.json';
import textosJson from './textos.json';

// EPISÓDIO BASE do modelo: ponto de partida de todo vídeo. Copie src/ para videos/AAAA-MM-DD-slug/
// e edite as cenas. Do jeito que vem, ele já:
//   - põe a narradora (a protagonista) em cena; só a boca dela abre, pelo volume da voz (criarBocas);
//   - mostra o agora no primeiro cenário escolhido e, nas falas com "tempo": "antes" (do roteiro), dissolve
//     para a lembrança em sépia com a aparência do antes; o selo do tempo acompanha;
//   - mostra a legenda por frase, repartida pelo número de palavras de cada fala (textos.json);
//   - põe a criança do elenco (se houver) no agora, sem falar;
//   - toca a narração, a trilha (abaixo da voz) e os efeitos só se os arquivos existirem em public/;
//   - fecha com o Fecho do universo depois da última fala (sem efeito por cima: só a trilha).
// A duração sai do falas.json: fim da última fala + respiro + fecho.

const FALAS = falasJson as Fala[];
const VOLUME = volumeJson as number[];
const PALAVRAS = prepararPalavras(palavrasJson as { texto: string; inicio: number; fim: number }[]);
// sem textos.json, cada fala leva as palavras que começam dentro dela
const TEXTOS = (textosJson as string[]).length
  ? (textosJson as string[])
  : FALAS.map((f) => PALAVRAS.filter((p) => p.inicio >= s(f.ini - 0.2) && p.inicio <= s(f.fim)).map((p) => p.texto).join(' '));
const legendaEm = legendaDasFalas(PALAVRAS, TEXTOS);

export const FIM_FALAS = FALAS.length ? Math.max(...FALAS.map((f) => f.fim)) : 0;
const RESPIRO = 0.6;
const SEG_FECHO = 4;
export const INICIO_FECHO = FIM_FALAS + RESPIRO;
export const DURACAO = s(INICIO_FECHO + SEG_FECHO);

// Detalhe de cada selo neste episódio (o rótulo vem das respostas): troque pelo do roteiro.
const DETALHE_AGORA = '';
const DETALHE_ANTES = '';
const DISSOLVE = 0.45;

const boca = criarBocas(VOLUME, FALAS);

type Adulto = Extract<EntradaElenco, { tipo: 'adulto' }>;
type Crianca = Extract<EntradaElenco, { tipo: 'crianca' }>;
const NARRADORA = (PERSONAGENS.find((p) => p.tipo === 'adulto' && PESSOAS[p.id]?.papel === 'protagonista') ?? PERSONAGENS.find((p) => p.tipo === 'adulto')) as Adulto | undefined;
const CRIANCA = PERSONAGENS.find((p) => p.tipo === 'crianca') as Crianca | undefined;
const OUTRAS_VOZES = [...new Set(FALAS.map((f) => f.quem))].filter((q) => q !== NARRADORA?.id);
if (OUTRAS_VOZES.length) console.warn(`falas.json: só a narradora (${NARRADORA?.id}) fala neste modelo; estas falas ficam sem boca: ${OUTRAS_VOZES.join(', ')}`);

// trechos do antes: de pouco antes da 1ª fala do antes até pouco antes da próxima fala do agora (ou do fecho)
const TRECHOS_ANTES: [number, number][] = [];
FALAS.forEach((f, i) => {
  if (f.tempo !== 'antes' || FALAS[i - 1]?.tempo === 'antes') return;
  const proxAgora = FALAS.slice(i).find((x) => x.tempo !== 'antes');
  TRECHOS_ANTES.push([f.ini - 0.2, (proxAgora ? proxAgora.ini : INICIO_FECHO) - 0.3]);
});
const opacidadeAntes = (t: number) =>
  Math.max(
    0,
    ...TRECHOS_ANTES.map(([a, b]) =>
      Math.min(interpolate(t, [a, a + DISSOLVE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), interpolate(t, [b, b + DISSOLVE], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })),
    ),
  );

/** Cenário do agora: o primeiro escolhido nas respostas. Troque aqui (cenário, luz, câmera). */
const CenarioAgora: React.FC<{ luz?: Luz }> = ({ luz = 'manha' }) =>
  CENARIOS.apartamento.length ? (
    <Apartamento comodo={CENARIOS.apartamento[0] as Comodo} luz={luz} brinquedos={Boolean(CRIANCA)} />
  ) : CENARIOS.escritorio ? (
    <Escritorio luz={luz} />
  ) : CENARIOS.salaEspera ? (
    <SalaDeEspera luz={luz} />
  ) : CENARIOS.escola ? (
    <Escola luz={luz} />
  ) : (
    <Apartamento comodo="sala" luz={luz} />
  );

export const Episodio: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const noFecho = t >= INICIO_FECHO;
  const fala = noFecho ? undefined : falaEm(FALAS, t);
  const falandoAgora = fala && fala.quem === NARRADORA?.id;
  const nBoca = NARRADORA ? boca(NARRADORA.id, f) : 0;
  const opAntes = noFecho ? 0 : opacidadeAntes(t);
  const noAntes = opAntes > 0.5;
  const N = NARRADORA?.C;

  const agora = (
    <Camera zoom={noFecho ? 1 : interpolate(t, [0, Math.max(1, FIM_FALAS)], [1.04, 1.12])} ox={500} oy={1100}>
      <CenarioAgora />
      {CRIANCA && (
        <NoChao x={40}>
          <CRIANCA.C expressao="feliz" olhando="direita" />
        </NoChao>
      )}
      {N && (
        <NoChao x={320}>
          <N expressao={noFecho ? 'apontando' : falandoAgora ? 'falando' : 'ironica'} falando={noFecho ? 0 : nBoca} />
        </NoChao>
      )}
    </Camera>
  );

  const antes = (
    <Lembranca>
      <Camera zoom={1.04} ox={500} oy={1100}>
        <Apartamento comodo="sala" luz="madrugada" />
        {N && (
          <NoChao x={320}>
            <NaLuz luz="madrugada">
              <N epoca="antes" expressao="exausta" falando={nBoca} />
            </NaLuz>
          </NoChao>
        )}
      </Camera>
    </Lembranca>
  );

  const legenda = noFecho ? [] : legendaEm(f);

  return (
    <AbsoluteFill style={{ backgroundColor: COR.linhoClaro }}>
      {opAntes < 1 && <AbsoluteFill>{agora}</AbsoluteFill>}
      {opAntes > 0 && <AbsoluteFill style={{ opacity: opAntes }}>{antes}</AbsoluteFill>}

      {!noFecho && FALAS.length > 0 && (noAntes ? <SeloTempo tempo="antes" detalhe={DETALHE_ANTES} /> : <SeloTempo tempo="agora" detalhe={DETALHE_AGORA} />)}
      {legenda.length > 0 && <Legenda palavras={legenda} />}
      {noFecho && <Fecho inicio={s(INICIO_FECHO)} personagem={NARRADORA?.nome ?? nomeProtagonista()} />}

      {temArquivo('narracao.mp3') && <Audio src={staticFile('narracao.mp3')} />}
      <Trilha duracao={DURACAO} />
      {TRECHOS_ANTES.map(([a]) => (
        <SFX key={a} arquivo="deslize.wav" em={Math.max(0, a)} volume={0.3} />
      ))}
    </AbsoluteFill>
  );
};
