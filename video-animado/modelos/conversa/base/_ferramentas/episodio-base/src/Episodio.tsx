import React from 'react';
import { AbsoluteFill, Audio, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Cena } from '../../../componentes/Cenas';
import { FPS } from '../../../componentes/medidas';
import { estadoNoTempo, idDe, linhaDoTempo, type Fala, type Roteiro } from '../../../componentes/roteiro';
import { UNIVERSO } from '../../../componentes/universo';
import falasJson from './falas.json';
import roteiroJson from './roteiro.json';

// EPISÓDIO BASE da Conversa no celular: ponto de partida de todo vídeo. Copie src/ para videos/AAAA-MM-DD-slug/.
// Do jeito que vem, ele já:
//   - lê o roteiro (src/roteiro.json, gravado pelo tempos_sem_voz.py ou pelo montar_audio.py a partir do
//     roteiro-falas.json do vídeo) e o falas.json;
//   - na receita de duas vozes, põe cada bolha com voz no começo da fala dela, do lado de quem fala, e as "sem_voz"
//     entre as falas, sem empurrar as outras; na receita só texto e música, cada bolha no tempo de leitura;
//   - se a primeira fala começa antes de 1,2 s, abre com o título e o chat vazio e desloca tudo (a narração junto);
//   - mostra o digitando antes das mensagens do contato e o texto sendo digitado no campo antes das do dono;
//   - troca título e legenda por cena, rola a conversa quando a bolha nova não cabe e fecha com o card final;
//   - toca a narração (public/narracao.mp3, deslocada), os sons (public/sfx/) e, na receita só texto e música, a
//     cama do kit ou a música da pessoa (public/musica.mp3 ou musica.wav), só se os arquivos existirem.
// A duração sai da linha do tempo: a última mensagem, o respiro e os 4 s do card final.

const ROTEIRO = roteiroJson as unknown as Roteiro;
const FALAS = falasJson as Fala[];
const LT = linhaDoTempo(ROTEIRO, FALAS);
export const DURACAO = Math.max(LT.duracao, 2 * FPS);

// fala do falas.json com "quem" diferente da mensagem do roteiro: avisa (o montar_audio.py já confere)
LT.eventos.forEach((e) => {
  if (!idDe(e.quem)) console.warn(`roteiro.json: "${e.quem}" não é um dos 2 lados do universo`);
});

/** O arquivo existe na pasta public/ do vídeo? (no render e no Studio). */
const temArquivo = (nome: string) => getStaticFiles().some((f) => f.name === nome);

/** Som num instante (segundos). Arquivos em public/sfx/; se o arquivo não existe, fica mudo. */
const Som: React.FC<{ arquivo: string; em: number; volume?: number }> = ({ arquivo, em, volume = 0.5 }) =>
  temArquivo(`sfx/${arquivo}`) ? (
    <Sequence from={Math.max(0, Math.round(em * FPS))} durationInFrames={Math.round(1.2 * FPS)} layout="none">
      <Audio src={staticFile(`sfx/${arquivo}`)} volume={volume} />
    </Sequence>
  ) : null;

/** Música da receita só texto: a da pessoa (public/musica.mp3 ou .wav) ou a cama do kit em laço, entrando e saindo suave. */
const Musica: React.FC<{ total: number; volume?: number }> = ({ total, volume = 0.32 }) => {
  const propria = ['musica.mp3', 'musica.wav'].find(temArquivo);
  const suave = (g: number) => volume * interpolate(g, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * interpolate(g, [total - 36, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (propria) return <Audio src={staticFile(propria)} volume={(f) => suave(f)} />;
  if (!temArquivo('sfx/cama.wav')) return null;
  const pedaco = 8 * FPS;
  return (
    <>
      {Array.from({ length: Math.ceil(total / pedaco) }).map((_, i) => (
        <Sequence key={i} from={i * pedaco} durationInFrames={Math.min(pedaco, total - i * pedaco)} layout="none">
          <Audio src={staticFile('sfx/cama.wav')} volume={(f) => suave(i * pedaco + f)} />
        </Sequence>
      ))}
    </>
  );
};

/** Os toques de tecla enquanto o dono digita no campo. */
const Teclas: React.FC = () => (
  <>
    {LT.eventos
      .filter((e) => e.lado === 'direita' && e.digita)
      .flatMap((e) => {
        const [a, b] = e.digita!;
        const n = Math.max(1, Math.floor((b - a - 0.15) / 0.12));
        return Array.from({ length: n }, (_, k) => <Som key={`t${e.i}-${k}`} arquivo="tecla.wav" em={a + k * 0.12} volume={0.16} />);
      })}
  </>
);

export const Episodio: React.FC = () => {
  const f = useCurrentFrame();
  const estado = estadoNoTempo(LT, f, UNIVERSO.nome);
  const leitura = LT.receita === 'texto-e-musica';
  return (
    <AbsoluteFill>
      <Cena estado={estado} frame={f} />
      {temArquivo('narracao.mp3') && !leitura ? (
        <Sequence from={Math.round(LT.deslocamento * FPS)} layout="none">
          <Audio src={staticFile('narracao.mp3')} />
        </Sequence>
      ) : null}
      {leitura ? <Musica total={DURACAO} /> : null}
      {LT.eventos.map((e) => (
        <Som key={`m${e.i}`} arquivo={e.lado === 'esquerda' ? 'chegou.wav' : 'enviada.wav'} em={e.entra} volume={leitura ? 0.5 : 0.22} />
      ))}
      <Teclas />
    </AbsoluteFill>
  );
};
