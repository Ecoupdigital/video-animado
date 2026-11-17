import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from 'remotion';
import { clamp, FPS, S, useT } from './anima';
import { temArquivo } from './arquivos';
import { CENAS, efeitos } from './cenas';
import { CameraViva, Clarao, Documentos, Faixa, Fundo, Grao, Hud, useTremida, Vinheta } from './fundo';
import type { Timing } from './roteiro';
import { useTema } from './tema';

// Montagem do dossiê: o fundo vivo, as cenas do timing.json com a câmera viva, os documentos, a faixa, o HUD,
// o clarão, a vinheta e o grão, a narração (se existir), a cama com ducking pelo duck.json e os efeitos de
// cada cena nos mesmos instantes das peças. Usada pelo episódio base e pelo _preview.

export const Efeito: React.FC<{ at: number; arquivo: string; vol: number; off?: number }> = ({ at, arquivo, vol, off = 0 }) =>
  temArquivo(`sfx/${arquivo}`) ? (
    <Sequence from={Math.max(0, S(at) + off)} durationInFrames={S(3)} layout="none">
      <Audio src={staticFile(`sfx/${arquivo}`)} volume={vol} />
    </Sequence>
  ) : null;

/** cama de suspense (sfx/cama.wav, 8 s em laço): abaixa quando a voz fala (duck de 0 a 1) e some no último segundo */
export const Cama: React.FC<{ total: number; duck: number[]; volume?: number }> = ({ total, duck, volume = 0.55 }) => {
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
              return volume * (1 - 0.55 * d) * interpolate(g, [0, 20], [0, 1], clamp) * interpolate(g, [total - 30, total], [1, 0], clamp);
            }}
          />
        </Sequence>
      ))}
    </>
  );
};

/** narracao: arquivo em public/ (sem a prop: narracao.wav ou narracao.mp3, o que existir; null: sem voz) */
export const Dossie: React.FC<{ timing: Timing; duck: number[]; narracao?: string | null; comSom?: boolean }> = ({ timing, duck, narracao, comSom = true }) => {
  const T = useTema();
  const t = useT();
  const f = Math.round(t * FPS);
  const total = S(timing.total);
  const fx = timing.cenas.map((c) => efeitos(c, timing.voiceEnd));
  const golpes = fx.flatMap((e) => e.golpes);
  const batidas = fx.flatMap((e) => e.batidas);
  const cortes = timing.cenas.slice(1).map((c) => c.ini);
  const punch: [number, number][] = [...golpes.map((x) => [x, 0.07] as [number, number]), ...batidas.map((x) => [x, 0.035] as [number, number])];
  const { x, y } = useTremida(golpes, batidas);
  const voz = narracao === null ? null : [narracao, 'narracao.wav', 'narracao.mp3'].find((a) => a && temArquivo(a)) ?? null;
  return (
    <AbsoluteFill style={{ background: T.c.fundo }}>
      <Fundo />
      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px)` }}>
        {timing.cenas.map((c, i) => {
          const de = S(c.ini);
          const ate = Math.min(total, i === timing.cenas.length - 1 ? total : S(c.fim));
          if (f < de || f >= ate) return null;
          const Cena = CENAS[c.tipo];
          return (
            <CameraViva key={i} idx={i} gf={f} lf={f - de} dur={ate - de} punch={punch}>
              <Cena c={c} voiceEnd={timing.voiceEnd} />
            </CameraViva>
          );
        })}
      </AbsoluteFill>
      <Documentos />
      <Faixa manchetes={timing.manchetes} fimVoz={timing.voiceEnd} />
      <Hud total={timing.total} />
      <Clarao golpes={golpes} />
      <Vinheta />
      <Grao />
      {comSom ? (
        <>
          {voz ? <Audio src={staticFile(voz)} /> : null}
          <Cama total={total} duck={duck} />
          {fx.flatMap((e, i) => e.sons.map((s, k) => <Efeito key={`${i}-${k}`} {...s} />))}
          {cortes.map((c, i) => (
            <Efeito key={`w${i}`} at={c} arquivo={i % 3 === 2 ? 'glitch.wav' : 'whoosh.wav'} vol={i % 3 === 2 ? 0.3 : 0.28} off={-5} />
          ))}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
