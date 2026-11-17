import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from 'remotion';
import { clamp, FPS, S, useT } from './anima';
import { temArquivo } from './arquivos';
import { Cenario, Topo, Varredura } from './cenario';
import { CENAS, efeitos, saindo, zumbidos } from './cenas';
import { CamadaLetreiro } from './letreiro';
import { eventosLetreiro, type Timing } from './roteiro';

// Montagem do modelo Neon retrô: o cenário (céu, sol, grade andando), o letreiro (o da vez aceso, trocando na batida
// de cada cena e valendo até o próximo), a cena da vez na zona das peças com a anterior saindo por baixo em 0,22 s,
// o topo (PLAY e o contador de fita) e a varredura de TV por cima de tudo. O som: a narração (receita de narração
// inteira, se existir) com a cama synth baixa e o ducking do duck.json, ou só a música (receita só letreiros: a
// música da pessoa, public/musica.mp3 ou .wav, ou a cama do kit em laço, cheia); e os efeitos nos instantes das
// peças. Usada pelo episódio base e pelo _preview.

export const Efeito: React.FC<{ at: number; arquivo: string; vol: number }> = ({ at, arquivo, vol }) =>
  temArquivo(`sfx/${arquivo}`) ? (
    <Sequence from={Math.max(0, S(at))} durationInFrames={S(2)} layout="none">
      <Audio src={staticFile(`sfx/${arquivo}`)} volume={vol} />
    </Sequence>
  ) : null;

/** A música por baixo: a da pessoa (public/musica.mp3 ou .wav) ou a cama do kit (sfx/cama.wav, 8 s em laço). Com voz,
 *  abaixa quando ela fala (duck de 0 a 1); só letreiros, toca cheia. Entra em 0,3 s e some no último segundo. */
export const Musica: React.FC<{ total: number; duck: number[]; volume: number; comVoz: boolean }> = ({ total, duck, volume, comVoz }) => {
  const propria = ['musica.mp3', 'musica.wav'].find((a) => temArquivo(a));
  const vol = (g: number) => {
    const d = comVoz && duck.length ? duck[Math.min(g, duck.length - 1)] ?? 0 : 0;
    return volume * (1 - 0.6 * d) * interpolate(g, [0, 9], [0, 1], clamp) * interpolate(g, [total - 30, total], [1, 0], clamp);
  };
  if (propria) return <Audio src={staticFile(propria)} volume={(f) => vol(f)} />;
  if (!temArquivo('sfx/cama.wav')) return null;
  const pedaco = S(8);
  return (
    <>
      {Array.from({ length: Math.ceil(total / pedaco) }).map((_, i) => (
        <Sequence key={i} from={i * pedaco} durationInFrames={Math.min(pedaco, total - i * pedaco)} layout="none">
          <Audio src={staticFile('sfx/cama.wav')} volume={(f) => vol(i * pedaco + f)} />
        </Sequence>
      ))}
    </>
  );
};

/** narracao: arquivo em public/ (sem a prop: narracao.wav ou narracao.mp3, o que existir; null: sem voz) */
export const NeonVista: React.FC<{ timing: Timing; duck: number[]; narracao?: string | null; comSom?: boolean; chave?: string; comTopo?: boolean }> = ({ timing, duck, narracao, comSom = true, chave = 'v', comTopo = true }) => {
  const t = useT();
  const f = Math.round(t * FPS);
  const total = S(timing.total);
  const soMusica = timing.receita === 'texto-e-musica';
  const voz = soMusica || narracao === null ? null : [narracao, 'narracao.wav', 'narracao.mp3'].find((a) => a && temArquivo(a)) ?? null;
  const ativa = timing.cenas.findIndex((c, i) => {
    const de = S(c.ini);
    const ate = i === timing.cenas.length - 1 ? total : S(c.fim);
    return f >= de && f < Math.min(total, ate);
  });
  const indice = ativa >= 0 ? ativa : t >= timing.total ? timing.cenas.length - 1 : -1;
  const c = indice >= 0 ? timing.cenas[indice] : null;
  const ant = indice > 0 ? timing.cenas[indice - 1] : null;
  const Cena = c ? CENAS[c.tipo] : null;
  const Anterior = ant ? CENAS[ant.tipo] : null;
  const opAnt = ant ? saindo(t, ant.fim) : 0;
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <Cenario t={t} chave={chave} />
      <CamadaLetreiro eventos={eventosLetreiro(timing)} t={t} piscada={timing.piscada !== false} />
      {ant && Anterior && opAnt > 0 ? (
        <AbsoluteFill style={{ opacity: opAnt }}>
          <Anterior c={ant} timing={timing} indice={indice - 1} primeira={indice - 1 === 0} t={t} />
        </AbsoluteFill>
      ) : null}
      {c && Cena ? (
        <AbsoluteFill key={indice}>
          <Cena c={c} timing={timing} indice={indice} primeira={indice === 0} t={t} />
        </AbsoluteFill>
      ) : null}
      {comTopo ? <Topo t={t} /> : null}
      <Varredura />
      {comSom ? (
        <>
          {voz ? <Audio src={staticFile(voz)} /> : null}
          <Musica total={total} duck={duck} volume={soMusica ? 0.62 : 0.4} comVoz={Boolean(voz)} />
          {zumbidos(timing).map((s, k) => (
            <Efeito key={`z${k}`} {...s} />
          ))}
          {timing.cenas.flatMap((cc, i) => efeitos(cc, timing, i).map((s, k) => <Efeito key={`${i}-${k}`} {...s} />))}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
