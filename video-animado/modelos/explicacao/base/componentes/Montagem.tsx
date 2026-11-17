import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from 'remotion';
import { clamp, eo, FPS, ramp, S, useT } from './anima';
import { temArquivo } from './arquivos';
import { CENAS, efeitos } from './cenas';
import { Fundo } from './fundo';
import { Topo } from './pecas';
import type { Timing } from './roteiro';
import { useTema } from './tema';
import { EXPLICACAO } from './universo';

// Montagem da família Explicação: o fundo do tema, o rótulo do topo (e o selo de passo na tela de app), as cenas
// do timing.json com um deslize curto na entrada, a narração (se existir), a cama leve com ducking pelo duck.json
// e os efeitos de cada cena nos mesmos instantes das peças. Usada pelo episódio base e pelo _preview.
// Sem tremida, zoom forte nem glitch: é explicação, não suspense.

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

/** narracao: arquivo em public/ (sem a prop: narracao.wav ou narracao.mp3, o que existir; null: sem voz) */
export const Explicacao: React.FC<{ timing: Timing; duck: number[]; narracao?: string | null; comSom?: boolean }> = ({ timing, duck, narracao, comSom = true }) => {
  const T = useTema();
  const t = useT();
  const f = Math.round(t * FPS);
  const total = S(timing.total);
  const voz = narracao === null ? null : [narracao, 'narracao.wav', 'narracao.mp3'].find((a) => a && temArquivo(a)) ?? null;
  const passos = timing.cenas.filter((c) => c.tipo !== 'final').length;
  const ativa = timing.cenas.findIndex((c, i) => {
    const de = S(c.ini);
    const ate = i === timing.cenas.length - 1 ? total : S(c.fim);
    return f >= de && f < Math.min(total, ate);
  });
  const c = ativa >= 0 ? timing.cenas[ativa] : null;
  const rotulo = (c && c.tipo === 'abertura' && c.rotulo) || timing.rotulo || EXPLICACAO.rotulo;
  const Cena = c ? CENAS[c.tipo] : null;
  // a primeira cena já está na tela no quadro 0 (capa do reel); as outras entram com um deslize curto
  const p = c && ativa > 0 ? eo(ramp(t, c.ini, 0.25)) : 1;
  return (
    <AbsoluteFill style={{ background: T.c.fundo }}>
      <Fundo />
      <Topo rotulo={rotulo} passo={c && c.tipo !== 'final' ? [ativa + 1, passos] : null} />
      {c && Cena ? (
        <AbsoluteFill key={ativa} style={{ opacity: p, transform: `translateX(${(1 - p) * 70}px)` }}>
          <Cena c={c} voiceEnd={timing.voiceEnd} />
        </AbsoluteFill>
      ) : null}
      {comSom ? (
        <>
          {voz ? <Audio src={staticFile(voz)} /> : null}
          <Cama total={total} duck={duck} />
          {timing.cenas.flatMap((cc, i) => efeitos(cc, T).sons.map((s, k) => <Efeito key={`${i}-${k}`} {...s} />))}
          {timing.cenas.slice(1).map((cc, i) => (
            <Efeito key={`w${i}`} at={cc.ini} arquivo="deslize.wav" vol={0.18} off={-3} />
          ))}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
