import React from 'react';
import { Composition } from 'remotion';
import { DURACAO, Episodio } from './Episodio';

// Composição "ep": vertical 1080 x 1920, 30 fps. A duração é o fim da voz (dados.ts) mais o card final.
export const Raiz: React.FC = () => <Composition id="ep" component={Episodio} width={1080} height={1920} fps={30} durationInFrames={DURACAO} />;
