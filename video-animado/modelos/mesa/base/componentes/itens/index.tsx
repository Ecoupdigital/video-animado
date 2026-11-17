import React from 'react';
import type { IdGrupo, IdItem } from '../tema';
import { ARTESANATO } from './artesanato';
import { BELEZA } from './beleza';
import { COZINHA } from './cozinha';

// Biblioteca de itens da mesa: 22 itens em 3 grupos, cada um desenhado em código e visto de cima. Os códigos
// moram em opcoes.json ("grupos"), que o _ferramentas/timing.py também lê para recusar item fora da lista; aqui
// cada código tem o desenho (o TypeScript recusa compilar se faltar um). Nenhum rótulo, logo ou embalagem
// reconhecível: frasco, batom, estojo e cola são genéricos. As cores dos itens são do material: não mudam com a
// resposta de cores.
//
// Cada item tem:
//   Mesa     o item deitado na mesa, numa caixa de -100 a 100 (o kit desenha em 170 px)
//   Camada   (opcional) o que ele vira quando cobre a peça central (massa, molho, base, batom, papel, fita),
//            centrado no meio da peça, em px, com R = raio da peça
//   Pedaco   (opcional) um pedaço espalhado sobre a peça central (queijo, tomate, folha, farinha, sombra, cola, botão)
//   posicoes onde os pedaços caem por padrão, em frações de R (x, y, giro em graus); os da pizza são os da tela
//            de referência. Passou da lista, o kit sorteia com semente fixa.

export type Desenho = {
  Mesa: React.FC;
  Camada?: React.FC<{ R: number }>;
  Pedaco?: React.FC<{ i: number; R: number }>;
  posicoes?: [number, number, number][];
  /** pedaços por padrão, quando o roteiro não diz a quantidade */
  pedacos?: number;
  /** a camada se espalha do centro para fora (molho, papel não: cai) */
  espalha?: 'centro' | 'esquerda';
};
export type Biblioteca<G extends string> = Record<G, Desenho>;

export const DESENHOS: Record<IdItem, Desenho> = { ...COZINHA, ...BELEZA, ...ARTESANATO };

/** o item na mesa, num quadrado de "tamanho" px */
export const ItemSvg: React.FC<{ id: IdItem; tamanho?: number; style?: React.CSSProperties }> = ({ id, tamanho = 170, style }) => {
  const D = DESENHOS[id].Mesa;
  return (
    <svg width={tamanho} height={tamanho} viewBox="-100 -100 200 200" style={{ overflow: 'visible', display: 'block', ...style }}>
      <D />
    </svg>
  );
};

export type { IdGrupo };
