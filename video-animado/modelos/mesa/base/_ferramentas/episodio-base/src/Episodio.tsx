import React from 'react';
import { S } from '../../../componentes/anima';
import { MesaVista } from '../../../componentes/Montagem';
import type { Timing } from '../../../componentes/roteiro';
import timingJson from './timing.json';
import duckJson from './duck.json';

// EPISÓDIO BASE do modelo Mesa vista de cima: ponto de partida de todo vídeo. Copie src/ para videos/AAAA-MM-DD-slug/.
// É montado pelos dados, na superfície, no grupo e nas cores do universo (componentes/universo.ts): as cenas, os
// itens e as batidas vêm do timing.json (gravado pelo timing.py a partir do roteiro-falas.json e do words.json), e
// o ducking da cama do duck.json (duck.py). Do jeito que vem:
//   - desenha a mesa e a peça central, e cada cena do roteiro (abertura, passo, final) por cima;
//   - cada item cai ou aparece na palavra da batida dele (item0, item1, ...): na mesa ou sobre a peça central, onde
//     fica até o fim; a etiqueta troca de passo e a faixa traz a frase com a palavra destacada;
//   - toca a narração (public/narracao.wav ou .mp3), a cama leve com ducking e os efeitos, só se os arquivos existirem;
//   - fecha com o card final (chamada, assinatura, fontes, aviso de narração por IA).
// Item que não existe na biblioteca entra no kit (componentes/itens/ e opcoes.json), nunca desenhado dentro do vídeo.
// Todo tempo é em segundos do áudio final; frame só por S().

const TIMING = timingJson as unknown as Timing;
const DUCK = duckJson as unknown as number[];
export const DURACAO = Math.max(1, S(TIMING.total || 1));

export const Episodio: React.FC = () => <MesaVista timing={TIMING} duck={DUCK} />;
