import type React from 'react';
import type { Aparencia } from '../aparencia';
import type { Expressao, Olhar } from '../rosto';

// O que cada módulo de tema entrega (componentes/temas/<id>/): o traço do personagem e os fundos com os cenários.
// Os ids de expressão, de olhar e de cenário são os mesmos em todos os temas.

/** Props do traço: desenha o personagem num quadro de 400 x 900 (pés em y 890), já com a aparência resolvida. */
export type TracoProps = {
  ap: Aparencia;
  expressao: Expressao;
  /** 0 a 1, volume da fala no frame: a boca abre junto (fechada com 0, mesmo na expressão falando) */
  falando: number;
  olhando: Olhar;
  /** sem respiração, piscada, balanço nem pulinho (folhas de referência) */
  parada: boolean;
  frame: number;
  fps: number;
  semente: number;
  /** id único da instância (filtros e padrões do SVG) */
  uid: string;
};

/** Props do fundo: o cenário (id de opcoes.cenarios) e o nome do lugar, que vai na placa. */
export type FundoProps = { cenario: string; lugar: string | null };

export type ModuloTema = {
  Traco: React.FC<TracoProps>;
  /** tela inteira (1080 x 1920): fundo do tema e o cenário, com o chão em CHAO_Y */
  Fundo: React.FC<FundoProps>;
  /** topo da cabeça (com cabelo e acessório) no quadro de 400 x 900, para o balão de fala ficar acima dela */
  topo: (ap: Aparencia) => number;
};
