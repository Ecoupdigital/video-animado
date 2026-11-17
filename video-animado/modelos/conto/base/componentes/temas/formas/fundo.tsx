import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CHAO_Y, H, W } from '../../medidas';
import { Placa } from '../../Texto';
import { escurecer, useTema } from '../../tema';
import type { FundoProps } from '../tipos';

// Fundos dos bonecos de formas: cor chapada viva, chão numa faixa de outra cor (os pés em CHAO_Y), um círculo
// grande e um bloco claro de enfeite (como na tela de referência) e os cenários em formas simples, sem contorno.
//   rua   prédio baixo com porta, duas janelas e a placa com o nome do lugar, e uma árvore redonda
//   sala  janela com vidro, quadro com a placa do nome, luminária e um vaso
// As formas trocam todas as cores (fundo, chão, enfeites, placa e destaque).

const Rua: React.FC<{ lugar: string | null }> = ({ lugar }) => {
  const T = useTema();
  const c = T.c;
  const p = { x: 400, y: 980, w: 280, h: CHAO_Y - 980 };
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x={p.x} y={p.y} width={p.w} height={p.h + 10} rx={22} fill={c.fundo2} />
        <rect x={p.x - 14} y={p.y - 14} width={p.w + 28} height={36} rx={18} fill={escurecer(c.fundo2, 0.08)} />
        <rect x={p.x + 104} y={p.y + 230} width={72} height={p.h - 220} rx={14} fill={c.madeira} />
        <circle cx={p.x + 162} cy={p.y + 330} r={6} fill={c.fundo2} />
        <rect x={p.x + 26} y={p.y + 238} width={60} height={70} rx={12} fill={c.enfeite2} />
        <rect x={p.x + p.w - 86} y={p.y + 238} width={60} height={70} rx={12} fill={c.enfeite2} />
        {/* árvore redonda, longe dos personagens */}
        <rect x={980} y={CHAO_Y - 230} width={22} height={240} rx={11} fill={c.madeira} />
        <circle cx={991} cy={CHAO_Y - 270} r={74} fill={c.chao2} />
      </svg>
      {lugar ? <Placa texto={lugar} x={p.x + 16} y={p.y + 52} w={p.w - 32} h={128} /> : null}
    </>
  );
};

const Sala: React.FC<{ lugar: string | null }> = ({ lugar }) => {
  const T = useTema();
  const c = T.c;
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* janela */}
        <rect x={120} y={560} width={300} height={330} rx={26} fill={c.papel} />
        <rect x={142} y={582} width={256} height={286} rx={16} fill={c.enfeite2} />
        <rect x={262} y={582} width={16} height={286} fill={c.papel} />
        <rect x={142} y={716} width={256} height={16} fill={c.papel} />
        {/* quadro (a placa com o nome vai por cima) */}
        <rect x={620} y={560} width={330} height={250} rx={22} fill={c.madeira} />
        <rect x={638} y={578} width={294} height={214} rx={14} fill={c.papel} />
        {/* luminária e vaso no meio, atrás dos personagens */}
        <rect x={532} y={CHAO_Y - 300} width={16} height={300} rx={8} fill={c.silhueta} />
        <path d={`M 490 ${CHAO_Y - 300} L 590 ${CHAO_Y - 300} L 566 ${CHAO_Y - 372} L 514 ${CHAO_Y - 372} Z`} fill={c.enfeite2} />
        <rect x={470} y={CHAO_Y - 18} width={140} height={28} rx={14} fill={escurecer(c.chao, 0.12)} />
      </svg>
      {lugar ? <Placa texto={lugar} x={654} y={620} w={262} h={130} /> : null}
    </>
  );
};

export const FundoFormas: React.FC<FundoProps> = ({ cenario, lugar }) => {
  const T = useTema();
  const c = T.c;
  return (
    <AbsoluteFill style={{ background: c.fundo }}>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={920} cy={330} r={180} fill={c.sol} />
        <rect x={-40} y={1060} width={320} height={360} rx={24} fill={c.enfeite} opacity={0.7} />
        <rect x={0} y={CHAO_Y - 6} width={W} height={H - CHAO_Y + 6} fill={c.chao} />
        <rect x={0} y={CHAO_Y - 6} width={W} height={14} fill={c.chao2} />
      </svg>
      {cenario === 'sala' ? <Sala lugar={lugar} /> : <Rua lugar={lugar} />}
    </AbsoluteFill>
  );
};
