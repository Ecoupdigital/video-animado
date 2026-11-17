import React from 'react';
import { Composition } from 'remotion';
import { DURACAO, Episodio } from './Episodio';

// Composição "ep": vertical 1080 x 1920, 30 fps. A duração sai do roteiro e do falas.json (última mensagem + card final).
export const Raiz: React.FC = () => <Composition id="ep" component={Episodio} width={1080} height={1920} fps={30} durationInFrames={DURACAO} />;
