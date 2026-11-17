import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from 'remotion';
import { clamp, FPS, S, useT } from './anima';
import { temArquivo } from './arquivos';
import { CENAS, efeitos, saindo } from './cenas';
import { MesaCentral, type Cobertura } from './centro';
import { lugarDe, tempoDoItem, type Timing } from './roteiro';
import { Superficie } from './superficie';
import { useMesa } from './tema';

// Montagem do modelo Mesa vista de cima: a superfície, a peça central com tudo o que já caiu sobre ela (a cobertura
// soma todas as cenas até o instante t e fica até o fim), a cena da vez por cima (etiqueta, itens da mesa, faixa,
// card final) com a anterior saindo por baixo em 0,22 s, a narração (se existir), a cama leve com ducking pelo
// duck.json e os efeitos de cada cena nos mesmos instantes dos itens. Usada pelo episódio base e pelo _preview.
// Sem tremida, zoom nem glitch: é passo a passo.

export const Efeito: React.FC<{ at: number; arquivo: string; vol: number; off?: number }> = ({ at, arquivo, vol, off = 0 }) =>
  temArquivo(`sfx/${arquivo}`) ? (
    <Sequence from={Math.max(0, S(at) + off)} durationInFrames={S(2)} layout="none">
      <Audio src={staticFile(`sfx/${arquivo}`)} volume={vol} />
    </Sequence>
  ) : null;

/** cama leve (sfx/cama.wav, 8 s em laço): abaixa quando a voz fala (duck de 0 a 1) e some no último segundo */
export const Cama: React.FC<{ total: number; duck: number[]; volume?: number }> = ({ total, duck, volume = 0.5 }) => {
  if (!temArquivo('sfx/cama.wav')) return null;
  const pedaco = S(8);
  const n = Math.ceil(total / pedaco);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <Sequence key={i} from={i * pedaco} durationInFrames={Math.min(pedaco, total - i * pedaco)} layout="none">
          <Audio
            src={staticFile('sfx/cama.wav')}
            volume={(f) => {
              const g = i * pedaco + f;
              const d = duck.length ? duck[Math.min(g, duck.length - 1)] ?? 0 : 0;
              return volume * (1 - 0.6 * d) * interpolate(g, [0, 20], [0, 1], clamp) * interpolate(g, [total - 30, total], [1, 0], clamp);
            }}
          />
        </Sequence>
      ))}
    </>
  );
};

/** tudo o que cai sobre a peça central no vídeo inteiro, com o instante de cada um */
export const coberturaDe = (timing: Timing): Cobertura[] =>
  timing.cenas.flatMap((c) => (c.tipo === 'passo' ? c.itens.map((ic, i) => ({ ic, at: tempoDoItem(c, i) })).filter(({ ic }) => lugarDe(ic) === 'centro').map(({ ic, at }) => ({ item: ic.item, at, entrada: ic.entrada ?? 'cai', quantidade: ic.quantidade })) : []));

/** narracao: arquivo em public/ (sem a prop: narracao.wav ou narracao.mp3, o que existir; null: sem voz) */
export const MesaVista: React.FC<{ timing: Timing; duck: number[]; narracao?: string | null; comSom?: boolean; chave?: string }> = ({ timing, duck, narracao, comSom = true, chave = 'v' }) => {
  const M = useMesa();
  const t = useT();
  const f = Math.round(t * FPS);
  const total = S(timing.total);
  const voz = narracao === null ? null : [narracao, 'narracao.wav', 'narracao.mp3'].find((a) => a && temArquivo(a)) ?? null;
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
    <AbsoluteFill style={{ background: '#000' }}>
      <Superficie />
      <MesaCentral t={t} cobertura={coberturaDe(timing)} chave={chave} />
      {ant && Anterior && opAnt > 0 ? (
        <AbsoluteFill style={{ opacity: opAnt }}>
          <Anterior c={ant} timing={timing} indice={indice - 1} primeira={false} t={t} />
        </AbsoluteFill>
      ) : null}
      {c && Cena ? (
        <AbsoluteFill key={indice}>
          <Cena c={c} timing={timing} indice={indice} primeira={indice === 0} t={t} />
        </AbsoluteFill>
      ) : null}
      {comSom ? (
        <>
          {voz ? <Audio src={staticFile(voz)} /> : null}
          <Cama total={total} duck={duck} />
          {timing.cenas.flatMap((cc, i) => efeitos(cc, timing, i, M.superficie, M.grupo).map((s, k) => <Efeito key={`${i}-${k}`} {...s} />))}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
