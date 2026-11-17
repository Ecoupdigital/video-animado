import React from 'react';
import { S } from '../../../componentes/anima';
import { PixelNoticia } from '../../../componentes/PixelNoticia';
import { montar, type Roteiro } from '../../../componentes/roteiro';
import roteiroJson from './roteiro.json';
import { BOCAS, FIM, PALAVRAS } from './dados';

// EPISÓDIO BASE do pixel: ponto de partida de todo vídeo. Copie src/ para videos/AAAA-MM-DD-slug/.
// É montado pelos dados: as seções, os títulos, os cards e a palavra de cada elemento vêm do roteiro.json
// (cópia do roteiro-falas.json do vídeo), e o tempo de cada palavra e a boca de cada instante do dados.ts
// (dados.py com a voz de verdade, ou tempos_sem_voz.py na prévia). Do jeito que vem:
//   - topo, título que entra por linha, card da seção (lista, conversa, selo, blocos), legenda em blocos de até
//     3 palavras e o boneco com balanço, piscada, gesto da seção e a boca pelo som;
//   - toca a narração (public/narracao.wav ou .mp3), a cama e os sons de public/sons/, só se os arquivos existirem;
//   - fecha com o card final de perfil depois da voz.
// Card fora dos moldes: escreva o componente com as mesmas peças de componentes/PixelNoticia.tsx.

const M = montar(roteiroJson as unknown as Roteiro, PALAVRAS, BOCAS as [number, number, string][], FIM);
export const DURACAO = Math.max(1, S(M.total));

export const Episodio: React.FC = () => <PixelNoticia m={M} />;
