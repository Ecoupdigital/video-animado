import React from 'react';
import { S } from '../../../componentes/anima';
import { Dossie } from '../../../componentes/Montagem';
import type { Timing } from '../../../componentes/roteiro';
import { ComTema } from '../../../componentes/tema';
import timingJson from './timing.json';
import duckJson from './duck.json';

// EPISÓDIO BASE do dossiê: ponto de partida de todo vídeo. Copie src/ para videos/AAAA-MM-DD-slug/.
// É montado pelos dados: as cenas, os títulos e as batidas vêm do timing.json (gravado pelo timing.py a
// partir do roteiro-falas.json e do words.json), e o ducking da cama do duck.json (duck.py). Do jeito que vem:
//   - desenha cada cena do roteiro (gancho, ficha, ligacao, rota, tombo, linha, fonte, final) com as peças do kit,
//     o texto cinético entrando na palavra falada e cada peça na batida marcada;
//   - fundo vivo, câmera viva com zoom, blur e glitch no corte, punch e tremida nos golpes, faixa de manchetes;
//   - toca a narração (public/narracao.wav ou .mp3), a cama com ducking e os efeitos, só se os arquivos existirem;
//   - fecha com o card final (assinatura, fontes, aviso de narração por IA).
// Cena fora dos tipos prontos: escreva o componente com as mesmas peças (componentes/pecas.tsx) e registre em CENAS.
// Todo tempo é em segundos do áudio final; frame só por S().

const TIMING = timingJson as unknown as Timing;
const DUCK = duckJson as unknown as number[];
export const DURACAO = Math.max(1, S(TIMING.total || 1));

export const Episodio: React.FC = () => (
  <ComTema>
    <Dossie timing={TIMING} duck={DUCK} />
  </ComTema>
);
