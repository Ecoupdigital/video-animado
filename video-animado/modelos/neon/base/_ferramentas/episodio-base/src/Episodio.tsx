import React from 'react';
import { S } from '../../../componentes/anima';
import { NeonVista } from '../../../componentes/Montagem';
import type { Timing } from '../../../componentes/roteiro';
import timingJson from './timing.json';
import duckJson from './duck.json';

// EPISÓDIO BASE do modelo Neon retrô: ponto de partida de todo vídeo. Copie src/ para videos/AAAA-MM-DD-slug/.
// É montado pelos dados, nas cores e na oferta do universo (componentes/universo.ts): as cenas, os letreiros e as
// batidas vêm do timing.json (gravado pelo timing.py, na narração, ou pelo tempos_sem_voz.py, na prévia e na receita
// só letreiros), e o ducking da cama do duck.json (duck.py). Do jeito que vem:
//   - desenha o céu, o sol listrado, a grade andando, a varredura de TV, o "PLAY" e o contador de fita;
//   - acende cada letreiro na batida dele (a palavra falada ou o tempo da música), com a piscada acessível, e o deixa
//     aceso até o próximo;
//   - monta cada cena (abertura, oferta, contagem, chamada, final) na zona de baixo, com as peças nas batidas;
//   - toca a narração (public/narracao.wav ou .mp3, só na narração inteira) com a cama baixa e o ducking, ou só a
//     música (a da pessoa, public/musica.mp3 ou .wav, ou a cama do kit), e os efeitos, só se os arquivos existirem;
//   - fecha com o card final (chamada, assinatura, fontes e, na narração, o aviso de narração por IA).
// Peça que não existe entra no kit (componentes/pecas.tsx), nunca desenhada dentro do vídeo.
// Todo tempo é em segundos do áudio final; frame só por S().

const TIMING = timingJson as unknown as Timing;
const DUCK = duckJson as unknown as number[];
export const DURACAO = Math.max(1, S(TIMING.total || 1));

export const Episodio: React.FC = () => <NeonVista timing={TIMING} duck={DUCK} />;
