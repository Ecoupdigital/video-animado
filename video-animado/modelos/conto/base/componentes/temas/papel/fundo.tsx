import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CHAO_Y, H, W } from '../../medidas';
import { circuloRasgado, poligonoRasgado, retanguloRasgado } from '../../recorte';
import { Placa } from '../../Texto';
import { clarear, escurecer, misturar, useTema } from '../../tema';
import type { FundoProps } from '../tipos';

// Fundos do papel recortado: kraft com fibras em toda a tela e os cenários em peças de papel com sombra projetada.
//   rua   sol de dois círculos, nuvens, colina de trás com a casa (telhado, janelas, porta e a placa com o nome do
//         lugar) e a colina da frente, onde os personagens pisam (os pés em CHAO_Y)
//   sala  parede de papel claro, janela com céu e cortinas, quadro com a placa do nome, rodapé e chão de tábua
// O kraft, as fibras, a sombra e as cores de recorte (colinas, casa, sol) não mudam com a resposta de cores: a
// resposta troca só o destaque, as faixas e as etiquetas (a placa).

const Sombra: React.FC<{ id: string }> = ({ id }) => {
  const T = useTema();
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx={6} dy={10} stdDeviation={5} floodColor={T.c.sombra} floodOpacity={0.35} />
    </filter>
  );
};

const Fibras: React.FC<{ id: string; cor: string; tam?: number }> = ({ id, cor, tam = 92 }) => (
  <pattern id={id} width={tam} height={tam} patternUnits="userSpaceOnUse">
    <path d="M6 14l18 4M44 60l14-6M60 24l12 8M16 56l10 10M76 80l8-12M84 10l-6 10M30 84l12-2" stroke={cor} strokeWidth={2.4} opacity={0.55} strokeLinecap="round" />
  </pattern>
);

const Rua: React.FC<{ lugar: string | null }> = ({ lugar }) => {
  const T = useTema();
  const frame = useCurrentFrame();
  const c = T.c;
  const giro = (frame / 30) * 6; // o sol gira devagar, como na tela de referência
  const casa = { x: 410, y: 1050, w: 260, h: 250 };
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <Sombra id="papel-sombra-rua" />
          <Fibras id="papel-fib-rua" cor={escurecer(c.fundo2, 0.05)} tam={70} />
        </defs>
        <g filter="url(#papel-sombra-rua)">
          <g transform={`rotate(${giro} 860 640)`}>
            <path d={circuloRasgado(860, 640, 118, 3, 2.2)} fill={c.sol} />
            <path d={circuloRasgado(860, 640, 78, 4, 1.8)} fill={misturar(c.sol, '#FFFFFF', 0.22)} />
          </g>
          <path d="M120 700 a52 52 0 0 1 80 -44 a64 64 0 0 1 116 12 a44 44 0 0 1 20 80 h-208 a48 48 0 0 1 -8 -48 z" fill={clarear(c.papel, 0.2)} />
          <path d="M470 560 a40 40 0 0 1 64 -32 a52 52 0 0 1 92 12 a36 36 0 0 1 12 64 h-160 a40 40 0 0 1 -8 -44 z" fill={clarear(c.papel, 0.2)} />
        </g>
        <path d={`M -40 ${CHAO_Y - 170} Q 300 ${CHAO_Y - 470} 620 ${CHAO_Y - 230} T 1160 ${CHAO_Y - 300} V ${H} H -40 Z`} fill={c.chao2} filter="url(#papel-sombra-rua)" />
        <g filter="url(#papel-sombra-rua)">
          <path d={retanguloRasgado(casa.x, casa.y, casa.w, casa.h, 8, 1.6)} fill={c.papel} />
          <path d={poligonoRasgado([[casa.x - 26, casa.y + 10], [casa.x + casa.w / 2, casa.y - 128], [casa.x + casa.w + 26, casa.y + 10]], 9, 1.8)} fill={c.enfeite} />
          <path d={retanguloRasgado(casa.x + 100, casa.y + 136, 60, 114, 10, 1.2)} fill={c.madeira} />
          <circle cx={casa.x + 148} cy={casa.y + 196} r={5} fill={c.sol} />
          <path d={retanguloRasgado(casa.x + 24, casa.y + 128, 54, 54, 11, 1.1)} fill={c.enfeite2} />
          <path d={retanguloRasgado(casa.x + casa.w - 78, casa.y + 128, 54, 54, 12, 1.1)} fill={c.enfeite2} />
        </g>
        <path d={`M -40 ${CHAO_Y - 30} Q 380 ${CHAO_Y - 190} 760 ${CHAO_Y - 50} T 1160 ${CHAO_Y - 70} V ${H} H -40 Z`} fill={c.chao} filter="url(#papel-sombra-rua)" />
        <path d={`M -40 ${CHAO_Y - 30} Q 380 ${CHAO_Y - 190} 760 ${CHAO_Y - 50} T 1160 ${CHAO_Y - 70} V ${H} H -40 Z`} fill="url(#papel-fib-rua)" opacity={0.5} />
      </svg>
      {lugar ? <Placa texto={lugar} x={casa.x - 6} y={casa.y + 22} w={casa.w + 12} h={86} ang={-2} rasgada /> : null}
    </>
  );
};

const Sala: React.FC<{ lugar: string | null }> = ({ lugar }) => {
  const T = useTema();
  const c = T.c;
  const piso = CHAO_Y - 120;
  const madeiraClara = misturar(c.madeira, '#FFFFFF', 0.42);
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <Sombra id="papel-sombra-sala" />
          <Fibras id="papel-fib-sala" cor={c.fundo2} tam={80} />
        </defs>
        <rect x={0} y={0} width={W} height={piso} fill={c.ceu2} />
        <rect x={0} y={0} width={W} height={piso} fill="url(#papel-fib-sala)" opacity={0.6} />
        {/* janela com cortinas */}
        <g filter="url(#papel-sombra-sala)">
          <path d={retanguloRasgado(110, 520, 330, 340, 21, 1.5)} fill={c.papel} />
          <path d={retanguloRasgado(130, 540, 290, 300, 22, 1.2)} fill={c.enfeite2} />
          <path d="M 180 640 a30 30 0 0 1 46 -26 a38 38 0 0 1 68 8 a26 26 0 0 1 8 48 h-118 a28 28 0 0 1 -4 -30 z" fill={clarear(c.papel, 0.3)} />
          <path d={retanguloRasgado(130, 682, 290, 12, 23, 0.8)} fill={c.papel} />
          <path d={retanguloRasgado(268, 540, 12, 300, 24, 0.8)} fill={c.papel} />
          <path d={poligonoRasgado([[86, 500], [176, 500], [150, 880], [72, 900]], 25, 1.6)} fill={c.enfeite} />
          <path d={poligonoRasgado([[374, 500], [464, 500], [478, 900], [400, 880]], 26, 1.6)} fill={c.enfeite} />
          <path d={retanguloRasgado(64, 488, 422, 22, 27, 1)} fill={c.madeira} />
        </g>
        {/* quadro (a placa com o nome vai por cima) */}
        <g filter="url(#papel-sombra-sala)">
          <path d={retanguloRasgado(600, 520, 380, 300, 28, 1.6)} fill={c.madeira} />
          <path d={retanguloRasgado(620, 540, 340, 260, 29, 1.3)} fill={c.papel} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={retanguloRasgado(660, 690 + i * 32, 260 - i * 50, 10, 30 + i, 0.6)} fill={c.traco} opacity={0.6} />
          ))}
        </g>
        {/* rodapé e chão de tábua */}
        <g filter="url(#papel-sombra-sala)">
          <path d={retanguloRasgado(-10, piso - 26, W + 20, 30, 33, 1.2)} fill={c.papel} />
          <rect x={0} y={piso} width={W} height={H - piso} fill={madeiraClara} />
        </g>
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M 0 ${piso + 40 + i * 62} L ${W} ${piso + 40 + i * 62}`} stroke={escurecer(madeiraClara, 0.14)} strokeWidth={4} opacity={0.7} />
        ))}
        {/* mesinha com um vaso */}
        <g filter="url(#papel-sombra-sala)">
          <path d={retanguloRasgado(470, piso - 160, 140, 18, 40, 1)} fill={c.madeira} />
          <path d={retanguloRasgado(486, piso - 142, 16, 150, 41, 0.8)} fill={c.madeira} />
          <path d={retanguloRasgado(578, piso - 142, 16, 150, 42, 0.8)} fill={c.madeira} />
          <path d={poligonoRasgado([[512, piso - 232], [568, piso - 232], [560, piso - 160], [520, piso - 160]], 43, 1)} fill={c.enfeite} />
          <path d={circuloRasgado(524, piso - 262, 26, 44, 1, 24)} fill={c.chao2} />
          <path d={circuloRasgado(556, piso - 270, 30, 45, 1, 24)} fill={c.chao} />
        </g>
      </svg>
      {lugar ? <Placa texto={lugar} x={630} y={560} w={320} h={110} ang={1.5} rasgada /> : null}
    </>
  );
};

export const FundoPapel: React.FC<FundoProps> = ({ cenario, lugar }) => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.c.fundo }}>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <Fibras id="papel-fib-fundo" cor={T.c.fundo2} />
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="url(#papel-fib-fundo)" />
      </svg>
      {cenario === 'sala' ? <Sala lugar={lugar} /> : <Rua lugar={lugar} />}
    </AbsoluteFill>
  );
};
