import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CHAO_Y, H, W } from '../../medidas';
import { Placa } from '../../Texto';
import { comAlfa, escurecer, misturar, useTema } from '../../tema';
import type { FundoProps } from '../tipos';

// Fundos das silhuetas: céu em degradê de 4 cores (ceu no alto, fundo2, fundo e ceu2 no horizonte), sol grande
// com brilho, morro de trás na cor que o céu tinge e morro da frente escuro, onde os personagens pisam (os pés em
// CHAO_Y). Tudo o que fica na frente é silhueta: a árvore, a placa, os móveis.
//   rua   pássaros batendo asa, uma casa ao longe com a janela acesa e uma árvore no morro de trás, e a placa
//         com o nome do lugar num poste, contra o sol, no meio da cena
//   sala  parede escura com uma janela grande que mostra o céu e o sol, cortinas, luminária e mesinha em
//         silhueta e a placa pendurada na janela
// A resposta de cores troca o céu, o que ele tinge (sol, morro de trás, pássaros, luz da janela, legenda) e o
// destaque; as silhuetas, o morro da frente, a placa e os móveis ficam escuros.

/** Céu, sol e morro de trás (a mesma paisagem da rua aparece pela janela da sala). */
const Paisagem: React.FC<{ id: string; solY: number; solR: number; casa?: boolean }> = ({ id, solY, solR, casa = true }) => {
  const T = useTema();
  const c = T.c;
  const morro = CHAO_Y - 150;
  const longe = escurecer(c.chao2, 0.32);
  return (
    <>
      <defs>
        <linearGradient id={`${id}-ceu`} x1="0" y1="0" x2="0" y2={CHAO_Y} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.ceu} />
          <stop offset="0.45" stopColor={c.fundo2} />
          <stop offset="0.75" stopColor={c.fundo} />
          <stop offset="1" stopColor={c.ceu2} />
        </linearGradient>
        <radialGradient id={`${id}-brilho`} cx={540} cy={solY} r={solR * 2.1} gradientUnits="userSpaceOnUse">
          <stop offset="0.35" stopColor={c.sol} stopOpacity={0.55} />
          <stop offset="1" stopColor={c.sol} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#${id}-ceu)`} />
      <circle cx={540} cy={solY} r={solR * 2.1} fill={`url(#${id}-brilho)`} />
      <circle cx={540} cy={solY} r={solR} fill={c.sol} opacity={0.96} />
      {/* morro de trás, com uma casa e uma árvore ao longe */}
      <path d={`M -20 ${morro + 40} Q 240 ${morro - 60} 460 ${morro + 10} T 1100 ${morro - 20} V ${H} H -20 Z`} fill={c.chao2} />
      {casa ? (
        <g fill={longe}>
          <path d={`M 150 ${morro + 6} L 150 ${morro - 54} L 196 ${morro - 92} L 242 ${morro - 54} L 242 ${morro - 2} Z`} />
          <rect x={186} y={morro - 50} width={20} height={20} fill={c.enfeite2} />
          <rect x={872} y={morro - 120} width={12} height={110} />
          <circle cx={878} cy={morro - 150} r={44} />
          <circle cx={850} cy={morro - 124} r={30} />
          <circle cx={906} cy={morro - 128} r={32} />
        </g>
      ) : null}
    </>
  );
};

/** Pássaro em traço, batendo asa (a asa sobe e desce pelo frame). */
const Passaro: React.FC<{ x: number; y: number; tam: number; fase: number }> = ({ x, y, tam, fase }) => {
  const T = useTema();
  const frame = useCurrentFrame();
  const asa = Math.sin((frame / 30) * Math.PI * 4 + fase);
  const h = tam * (0.25 + 0.55 * asa);
  return (
    <path
      d={`M ${x - tam} ${y} Q ${x - tam / 2} ${y - h} ${x} ${y} Q ${x + tam / 2} ${y - h} ${x + tam} ${y}`}
      fill="none"
      stroke={T.c.traco}
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

/** Morro da frente (escuro), onde os pés pisam. */
const MorroFrente: React.FC = () => {
  const T = useTema();
  return <path d={`M -20 ${CHAO_Y + 2} Q 270 ${CHAO_Y - 30} 540 ${CHAO_Y - 6} T 1100 ${CHAO_Y - 14} V ${H} H -20 Z`} fill={T.c.chao} />;
};

const Rua: React.FC<{ lugar: string | null }> = ({ lugar }) => {
  const T = useTema();
  const c = T.c;
  const placa = { x: 380, y: 1000, w: 320, h: 112 };
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Paisagem id="sil-rua" solY={1160} solR={300} />
        <Passaro x={250} y={720} tam={34} fase={0} />
        <Passaro x={340} y={650} tam={26} fase={1.3} />
        <Passaro x={790} y={760} tam={30} fase={2.2} />
        {/* poste da placa, contra o sol */}
        {lugar ? (
          <g fill={c.silhueta}>
            <rect x={placa.x + 40} y={placa.y + 40} width={16} height={CHAO_Y - placa.y - 30} />
            <rect x={placa.x + placa.w - 56} y={placa.y + 40} width={16} height={CHAO_Y - placa.y - 30} />
          </g>
        ) : null}
        <MorroFrente />
        {/* tufos de capim na crista do morro */}
        <g stroke={c.chao} strokeWidth={6} strokeLinecap="round">
          {[60, 470, 520, 610, 1030].map((x, i) => (
            <path key={x} d={`M ${x} ${CHAO_Y - 8} l ${-8 + (i % 2) * 4} -26 M ${x + 8} ${CHAO_Y - 8} l 4 -34 M ${x + 16} ${CHAO_Y - 8} l 10 -22`} />
          ))}
        </g>
      </svg>
      {lugar ? <Placa texto={lugar} x={placa.x} y={placa.y} w={placa.w} h={placa.h} /> : null}
    </>
  );
};

const Sala: React.FC<{ lugar: string | null }> = ({ lugar }) => {
  const T = useTema();
  const c = T.c;
  const jan = { x: 110, y: 400, w: 860, h: 860 };
  const parede = c.madeira;
  const moveis = c.silhueta;
  const placa = { x: 380, y: 760, w: 320, h: 104 };
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <clipPath id="sil-sala-janela">
            <rect x={jan.x} y={jan.y} width={jan.w} height={jan.h} />
          </clipPath>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill={parede} />
        {/* a janela grande mostra o céu de fora */}
        <g clipPath="url(#sil-sala-janela)">
          <g transform={`translate(0 ${-90})`}>
            <Paisagem id="sil-sala" solY={1160} solR={260} casa={false} />
          </g>
          <Passaro x={300} y={780} tam={26} fase={0.6} />
          <Passaro x={760} y={700} tam={30} fase={2} />
        </g>
        {/* caixilho */}
        <g fill={escurecer(parede, 0.25)}>
          <rect x={jan.x - 26} y={jan.y - 26} width={jan.w + 52} height={26} />
          <rect x={jan.x - 26} y={jan.y + jan.h} width={jan.w + 52} height={34} />
          <rect x={jan.x - 26} y={jan.y} width={26} height={jan.h} />
          <rect x={jan.x + jan.w} y={jan.y} width={26} height={jan.h} />
          <rect x={jan.x + jan.w / 3 - 7} y={jan.y} width={14} height={jan.h} />
          <rect x={jan.x + (2 * jan.w) / 3 - 7} y={jan.y} width={14} height={jan.h} />
          <rect x={jan.x} y={jan.y + 300} width={jan.w} height={14} />
        </g>
        {/* cortinas */}
        <g fill={c.enfeite}>
          <path d={`M 40 330 L 200 330 Q 170 700 210 1060 Q 150 1200 190 ${CHAO_Y - 20} L 40 ${CHAO_Y - 20} Z`} />
          <path d={`M 1040 330 L 880 330 Q 910 700 870 1060 Q 930 1200 890 ${CHAO_Y - 20} L 1040 ${CHAO_Y - 20} Z`} />
        </g>
        <rect x={20} y={312} width={W - 40} height={22} rx={11} fill={escurecer(parede, 0.35)} />
        {/* luminária e mesinha com vaso, no meio, contra a janela */}
        <g fill={moveis}>
          <rect x={536} y={0} width={8} height={160} />
          <path d="M 470 230 L 610 230 L 580 160 L 500 160 Z" />
          <rect x={470} y={CHAO_Y - 170} width={140} height={18} rx={6} />
          <rect x={486} y={CHAO_Y - 160} width={14} height={164} />
          <rect x={580} y={CHAO_Y - 160} width={14} height={164} />
          <path d={`M 516 ${CHAO_Y - 170} L 564 ${CHAO_Y - 170} L 572 ${CHAO_Y - 236} L 508 ${CHAO_Y - 236} Z`} />
          <circle cx={526} cy={CHAO_Y - 270} r={30} />
          <circle cx={558} cy={CHAO_Y - 286} r={34} />
          <circle cx={548} cy={CHAO_Y - 250} r={24} />
        </g>
        {/* cordões da placa, presos no alto da janela */}
        {lugar ? (
          <g stroke={moveis} strokeWidth={5}>
            <path d={`M ${placa.x + 50} ${jan.y} L ${placa.x + 50} ${placa.y}`} />
            <path d={`M ${placa.x + placa.w - 50} ${jan.y} L ${placa.x + placa.w - 50} ${placa.y}`} />
          </g>
        ) : null}
        {/* chão */}
        <rect x={0} y={CHAO_Y - 6} width={W} height={H - CHAO_Y + 6} fill={c.chao} />
        <rect x={0} y={CHAO_Y - 6} width={W} height={6} fill={comAlfa(c.sol, 0.25)} />
        <path d={`M 0 ${CHAO_Y + 70} L ${W} ${CHAO_Y + 70}`} stroke={misturar(c.chao, c.sol, 0.08)} strokeWidth={4} />
      </svg>
      {lugar ? <Placa texto={lugar} x={placa.x} y={placa.y} w={placa.w} h={placa.h} /> : null}
    </>
  );
};

export const FundoSilhuetas: React.FC<FundoProps> = ({ cenario, lugar }) => {
  const T = useTema();
  return <AbsoluteFill style={{ background: T.c.fundo }}>{cenario === 'sala' ? <Sala lugar={lugar} /> : <Rua lugar={lugar} />}</AbsoluteFill>;
};
