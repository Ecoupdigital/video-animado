import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Celular } from './Celular';
import { Fecho } from './Fecho';
import { H, SEGURA, W } from './medidas';
import { contatoDaConversa, type Estado } from './roteiro';
import { comAlfa, useTema } from './tema';
import { Legenda, Titulo } from './Texto';
import { TELA } from './universo';

// A cena pronta da Conversa no celular: o fundo em degradê, o título da cena com a palavra destacada, a legenda, o
// celular com a conversa e, no fecho, o card final por cima. A mesma cena serve ao episódio (por frame, a partir do
// estado da linha do tempo) e aos stills de conferência (um instante parado). Os tipos de cena:
//   abertura  o título e o chat vazio (ou com a primeira mensagem)
//   conversa  as bolhas entrando, a legenda da cena
//   rolagem   a conversa longa, que sobe quando a bolha nova não cabe
//   fecho     o card final por cima do celular, que escurece

export const Fundo: React.FC = () => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(155deg, ${T.c.fundo} 0%, ${T.c.fundo2} 100%)` }}>
      <div style={{ position: 'absolute', left: -180, top: 1180, width: 520, height: 520, borderRadius: '50%', background: comAlfa(T.c.fundo2, 0.55) }} />
      <div style={{ position: 'absolute', right: -160, top: 120, width: 460, height: 460, borderRadius: '50%', background: comAlfa(T.c.fundo, 0.6) }} />
    </AbsoluteFill>
  );
};

export const Cena: React.FC<{ estado: Estado; frame: number }> = ({ estado, frame }) => (
  <AbsoluteFill>
    <Fundo />
    <Celular contato={contatoDaConversa()} itens={estado.itens} frame={frame} campo={estado.campo} tecla={estado.tecla} fundoChat={TELA.fundo} />
    {estado.titulo ? <Titulo texto={estado.titulo.texto} k={estado.titulo.k} /> : null}
    {estado.legenda ? <Legenda texto={estado.legenda.texto} k={estado.legenda.k} /> : null}
    {estado.fecho ? <Fecho k={estado.fecho.k} pulso={estado.fecho.pulso} /> : null}
  </AbsoluteFill>
);

/** Área segura do Reels marcada por cima (stills de conferência). */
export const AreaSegura: React.FC = () => {
  const faixa = 'repeating-linear-gradient(45deg, rgba(255,40,80,0.28) 0 12px, rgba(255,40,80,0.12) 12px 24px)';
  const yb = H - SEGURA.baixo;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SEGURA.topo, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: yb, bottom: 0, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', right: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', left: SEGURA.lado, top: SEGURA.topo, width: W - 2 * SEGURA.lado, height: yb - SEGURA.topo, border: '3px dashed rgba(255,40,80,0.9)', boxSizing: 'border-box' }} />
    </AbsoluteFill>
  );
};
