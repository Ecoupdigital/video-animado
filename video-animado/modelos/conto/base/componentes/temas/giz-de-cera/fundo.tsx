import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CHAO_Y, H, W } from '../../medidas';
import { Placa } from '../../Texto';
import { escurecer, misturar, useTema } from '../../tema';
import type { FundoProps } from '../tipos';

// Fundos do giz de cera: folha de caderno (o papel claro, a pauta a cada 80 px e a margem vermelha em x 140) e o
// desenho de criança por cima, riscado a giz: borda tremida e grão de cera por um filtro que muda a cada 4 frames
// (sempre igual para o mesmo frame). A pauta e a margem são impressas: não tremem.
//   rua   sol girando, arco-íris de 4 faixas, nuvem, casa com telhado, porta e a placa com o nome do lugar,
//         chão verde de traço com capim e flores
//   sala  janela com cortinas, quadro com a placa do nome, mesinha com vaso de flor e o chão de tábua riscado
// A resposta de cores troca as cores dos gizes; a folha, a pauta e a margem ficam.

/** Margem do caderno (x) e espaço da pauta. */
export const MARGEM_X = 140;
const PAUTA = 80;

/** Filtro de giz para o desenho do fundo: tremido e grão, com a semente mudando a cada 4 frames. */
const FiltroGiz: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const semente = 5 + (Math.floor(frame / 4) % 8);
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency={0.36} numOctaves={2} seed={semente} result="ruido" />
      <feDisplacementMap in="SourceGraphic" in2="ruido" scale={9} xChannelSelector="R" yChannelSelector="G" result="tremido" />
      <feTurbulence type="fractalNoise" baseFrequency={1.1} numOctaves={1} seed={semente + 40} result="grao" />
      <feColorMatrix in="grao" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.2 0 0 0 2" result="buracos" />
      <feComposite in="tremido" in2="buracos" operator="in" />
    </filter>
  );
};

/** Pintura de giz (riscos inclinados por cima da cor clara). */
const Hachura: React.FC<{ id: string; cor: string; ang?: number }> = ({ id, cor, ang = 35 }) => (
  <pattern id={id} width={18} height={18} patternUnits="userSpaceOnUse" patternTransform={`rotate(${ang})`}>
    <path d="M 0 9 L 18 9" stroke={cor} strokeWidth={6} opacity={0.5} />
  </pattern>
);

const Folha: React.FC = () => {
  const T = useTema();
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      <rect x={0} y={0} width={W} height={H} fill={T.c.fundo} />
      {Array.from({ length: Math.floor(H / PAUTA) }, (_, i) => (
        <path key={i} d={`M 0 ${(i + 1) * PAUTA - 1} H ${W}`} stroke={T.c.fundo2} strokeWidth={2.4} />
      ))}
      <path d={`M ${MARGEM_X} 0 V ${H}`} stroke={T.c.faixa} strokeWidth={4} />
    </svg>
  );
};

/** Chão verde de traço, com capim e flores nas pontas (longe dos personagens). */
const Chao: React.FC = () => {
  const T = useTema();
  const c = T.c;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M 40 ${CHAO_Y + 4} Q 300 ${CHAO_Y - 22} 560 ${CHAO_Y - 2} T 1050 ${CHAO_Y - 4}`} stroke={c.chao} strokeWidth={22} />
      <g stroke={c.chao2} strokeWidth={7}>
        {[90, 430, 650, 990].map((x) => (
          <path key={x} d={`M ${x} ${CHAO_Y - 6} l -10 -30 M ${x + 10} ${CHAO_Y - 8} l 2 -38 M ${x + 20} ${CHAO_Y - 6} l 12 -28`} />
        ))}
      </g>
      {[
        [64, c.enfeite],
        [1016, c.ceu],
      ].map(([x, cor]) => (
        <g key={String(x)}>
          <path d={`M ${x} ${CHAO_Y - 8} L ${x} ${CHAO_Y - 90}`} stroke={c.chao2} strokeWidth={7} />
          <circle cx={Number(x)} cy={CHAO_Y - 104} r={16} fill={c.ceu2} stroke={String(cor)} strokeWidth={14} />
        </g>
      ))}
    </g>
  );
};

const Rua: React.FC<{ lugar: string | null }> = ({ lugar }) => {
  const T = useTema();
  const frame = useCurrentFrame();
  const c = T.c;
  const giro = (frame / 30) * 36; // o sol dá uma volta a cada 10 s, como na tela de referência
  const sol = { x: 890, y: 500, r: 76 };
  const casa = { x: 400, y: 1110, w: 280, h: CHAO_Y - 1110 };
  const placa = { x: casa.x + 26, y: casa.y + 26, w: casa.w - 52, h: 96 };
  const faixas = [c.enfeite, c.sol, c.chao, c.ceu];
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <FiltroGiz id="giz-rua" />
          <Hachura id="giz-rua-casa" cor={escurecer(c.enfeite, 0.05)} />
          <Hachura id="giz-rua-telhado" cor={escurecer(c.madeira, 0.2)} ang={-30} />
          <Hachura id="giz-rua-sol" cor={c.sol} ang={20} />
          <Hachura id="giz-rua-porta" cor={escurecer(c.madeira, 0.15)} ang={80} />
        </defs>
        <g filter="url(#giz-rua)" strokeLinecap="round" strokeLinejoin="round">
          {/* sol girando */}
          <g transform={`rotate(${giro} ${sol.x} ${sol.y})`}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              return <path key={i} d={`M ${sol.x + Math.cos(a) * (sol.r + 26)} ${sol.y + Math.sin(a) * (sol.r + 26)} L ${sol.x + Math.cos(a) * (sol.r + 64)} ${sol.y + Math.sin(a) * (sol.r + 64)}`} stroke={c.sol} strokeWidth={15} />;
            })}
            <circle cx={sol.x} cy={sol.y} r={sol.r} fill={c.ceu2} stroke={c.sol} strokeWidth={15} />
            <circle cx={sol.x} cy={sol.y} r={sol.r - 8} fill="url(#giz-rua-sol)" />
          </g>
          {/* arco-íris de 4 faixas */}
          {faixas.map((cor, i) => {
            const r = 300 - i * 40;
            const meia = 220 - i * 30;
            const y = 640 + i * 30;
            return <path key={i} d={`M ${560 - meia} ${y} A ${r} ${r} 0 0 1 ${560 + meia} ${y}`} fill="none" stroke={cor} strokeWidth={24} />;
          })}
          {/* nuvem */}
          <path d="M 190 520 q -6 -50 46 -50 q 20 -44 70 -24 q 44 -26 64 20 q 46 4 34 54 Z" fill={misturar(c.ceu, c.fundo, 0.82)} stroke={misturar(c.ceu, c.fundo, 0.35)} strokeWidth={9} />
          {/* casa */}
          <path d={`M ${casa.x} ${casa.y} L ${casa.x + casa.w} ${casa.y} L ${casa.x + casa.w} ${casa.y + casa.h} L ${casa.x} ${casa.y + casa.h} Z`} fill={misturar(c.enfeite, c.fundo, 0.62)} />
          <path d={`M ${casa.x} ${casa.y} L ${casa.x + casa.w} ${casa.y} L ${casa.x + casa.w} ${casa.y + casa.h} L ${casa.x} ${casa.y + casa.h} Z`} fill="url(#giz-rua-casa)" stroke={escurecer(c.enfeite, 0.12)} strokeWidth={13} />
          <path d={`M ${casa.x - 34} ${casa.y + 16} L ${casa.x + casa.w / 2} ${casa.y - 150} L ${casa.x + casa.w + 34} ${casa.y + 16}`} fill={misturar(c.madeira, c.fundo, 0.45)} stroke={escurecer(c.madeira, 0.35)} strokeWidth={18} />
          <path d={`M ${casa.x - 34} ${casa.y + 16} L ${casa.x + casa.w / 2} ${casa.y - 150} L ${casa.x + casa.w + 34} ${casa.y + 16} Z`} fill="url(#giz-rua-telhado)" />
          <circle cx={casa.x + casa.w / 2} cy={casa.y - 50} r={30} fill={misturar(c.enfeite2, c.fundo, 0.4)} stroke={escurecer(c.enfeite2, 0.25)} strokeWidth={10} />
          <path d={`M ${casa.x + casa.w / 2 - 38} ${casa.y + casa.h} L ${casa.x + casa.w / 2 - 38} ${casa.y + 150} L ${casa.x + casa.w / 2 + 38} ${casa.y + 150} L ${casa.x + casa.w / 2 + 38} ${casa.y + casa.h}`} fill={misturar(c.madeira, c.fundo, 0.2)} stroke={escurecer(c.madeira, 0.3)} strokeWidth={10} />
          <path d={`M ${casa.x + casa.w / 2 - 38} ${casa.y + casa.h} L ${casa.x + casa.w / 2 - 38} ${casa.y + 150} L ${casa.x + casa.w / 2 + 38} ${casa.y + 150} L ${casa.x + casa.w / 2 + 38} ${casa.y + casa.h} Z`} fill="url(#giz-rua-porta)" />
          <circle cx={casa.x + casa.w / 2 + 22} cy={casa.y + 220} r={6} fill={c.silhueta} />
          <Chao />
        </g>
      </svg>
      {lugar ? <Placa texto={lugar} x={placa.x} y={placa.y} w={placa.w} h={placa.h} ang={-2} /> : null}
    </>
  );
};

const Sala: React.FC<{ lugar: string | null }> = ({ lugar }) => {
  const T = useTema();
  const c = T.c;
  // o quadro com a placa fica no meio, entre os dois personagens; a janela à esquerda, acima da cabeça
  const jan = { x: 140, y: 540, w: 220, h: 240 };
  const quadro = { x: 412, y: 540, w: 300, h: 220 };
  const piso = CHAO_Y;
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <FiltroGiz id="giz-sala" />
          <Hachura id="giz-sala-vidro" cor={c.enfeite2} />
          <Hachura id="giz-sala-cortina" cor={c.enfeite} ang={80} />
        </defs>
        <g filter="url(#giz-sala)" strokeLinecap="round" strokeLinejoin="round">
          {/* janela com o céu e o sol lá fora */}
          <rect x={jan.x} y={jan.y} width={jan.w} height={jan.h} fill={misturar(c.enfeite2, c.fundo, 0.6)} />
          <rect x={jan.x} y={jan.y} width={jan.w} height={jan.h} fill="url(#giz-sala-vidro)" stroke={escurecer(c.madeira, 0.2)} strokeWidth={14} />
          <circle cx={jan.x + 160} cy={jan.y + 70} r={30} fill={c.ceu2} stroke={c.sol} strokeWidth={10} />
          <path d={`M ${jan.x + jan.w / 2} ${jan.y} V ${jan.y + jan.h} M ${jan.x} ${jan.y + jan.h / 2} H ${jan.x + jan.w}`} stroke={escurecer(c.madeira, 0.2)} strokeWidth={12} />
          {/* cortinas */}
          <path d={`M ${jan.x - 40} ${jan.y - 30} L ${jan.x + 60} ${jan.y - 30} Q ${jan.x + 20} ${jan.y + 160} ${jan.x + 50} ${jan.y + jan.h + 40} L ${jan.x - 40} ${jan.y + jan.h + 40} Z`} fill={misturar(c.enfeite, c.fundo, 0.55)} stroke={escurecer(c.enfeite, 0.15)} strokeWidth={9} />
          <path d={`M ${jan.x - 40} ${jan.y - 30} L ${jan.x + 60} ${jan.y - 30} Q ${jan.x + 20} ${jan.y + 160} ${jan.x + 50} ${jan.y + jan.h + 40} L ${jan.x - 40} ${jan.y + jan.h + 40} Z`} fill="url(#giz-sala-cortina)" />
          <path d={`M ${jan.x + jan.w + 40} ${jan.y - 30} L ${jan.x + jan.w - 60} ${jan.y - 30} Q ${jan.x + jan.w - 20} ${jan.y + 160} ${jan.x + jan.w - 50} ${jan.y + jan.h + 40} L ${jan.x + jan.w + 40} ${jan.y + jan.h + 40} Z`} fill={misturar(c.enfeite, c.fundo, 0.55)} stroke={escurecer(c.enfeite, 0.15)} strokeWidth={9} />
          <path d={`M ${jan.x + jan.w + 40} ${jan.y - 30} L ${jan.x + jan.w - 60} ${jan.y - 30} Q ${jan.x + jan.w - 20} ${jan.y + 160} ${jan.x + jan.w - 50} ${jan.y + jan.h + 40} L ${jan.x + jan.w + 40} ${jan.y + jan.h + 40} Z`} fill="url(#giz-sala-cortina)" />
          <path d={`M ${jan.x - 56} ${jan.y - 34} H ${jan.x + jan.w + 40}`} stroke={escurecer(c.madeira, 0.3)} strokeWidth={12} />
          {/* quadro na parede (a placa com o nome vai por cima) */}
          <path d={`M ${quadro.x + quadro.w / 2} ${quadro.y - 70} L ${quadro.x + 40} ${quadro.y} M ${quadro.x + quadro.w / 2} ${quadro.y - 70} L ${quadro.x + quadro.w - 40} ${quadro.y}`} stroke={c.traco} strokeWidth={6} fill="none" />
          <circle cx={quadro.x + quadro.w / 2} cy={quadro.y - 72} r={9} fill={c.traco} />
          <rect x={quadro.x} y={quadro.y} width={quadro.w} height={quadro.h} fill={misturar(c.madeira, c.fundo, 0.75)} stroke={c.madeira} strokeWidth={18} />
          {/* mesinha com vaso de flor, no meio */}
          <path d={`M 450 ${piso - 160} H 630 M 470 ${piso - 160} L 462 ${piso} M 610 ${piso - 160} L 618 ${piso}`} stroke={c.madeira} strokeWidth={16} fill="none" />
          <path d={`M 510 ${piso - 166} L 500 ${piso - 240} L 580 ${piso - 240} L 570 ${piso - 166} Z`} fill={misturar(c.ceu, c.fundo, 0.5)} stroke={escurecer(c.ceu, 0.15)} strokeWidth={9} />
          <path d={`M 540 ${piso - 240} Q 530 ${piso - 300} 544 ${piso - 340}`} stroke={c.chao2} strokeWidth={8} fill="none" />
          <circle cx={544} cy={piso - 360} r={20} fill={c.ceu2} stroke={c.enfeite} strokeWidth={14} />
          {/* chão de tábua riscado */}
          <path d={`M 40 ${piso + 2} Q 540 ${piso - 14} 1050 ${piso + 2}`} stroke={c.madeira} strokeWidth={18} fill="none" />
        </g>
      </svg>
      {lugar ? <Placa texto={lugar} x={quadro.x + 24} y={quadro.y + 40} w={quadro.w - 48} h={quadro.h - 80} ang={1.5} /> : null}
    </>
  );
};

export const FundoGiz: React.FC<FundoProps> = ({ cenario, lugar }) => (
  <AbsoluteFill>
    <Folha />
    {cenario === 'sala' ? <Sala lugar={lugar} /> : <Rua lugar={lugar} />}
  </AbsoluteFill>
);
