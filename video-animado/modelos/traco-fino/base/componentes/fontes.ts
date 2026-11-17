import { loadFont as carregarFraunces } from '@remotion/google-fonts/Fraunces';
import { loadFont as carregarDMSans } from '@remotion/google-fonts/DMSans';
import { loadFont as carregarCaveat } from '@remotion/google-fonts/Caveat';

// Fontes do universo: Fraunces (título, legenda e chamada, editorial), DM Sans (telas do celular, fonte,
// selo, aviso) e Caveat (letra de mão, só no caderno e nos rabiscos).
export const { fontFamily: FONTE_TITULO } = carregarFraunces('normal', { weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext'] });
export const { fontFamily: FONTE_TEXTO } = carregarDMSans('normal', { weights: ['400', '500', '700'], subsets: ['latin', 'latin-ext'] });
export const { fontFamily: FONTE_MAO } = carregarCaveat('normal', { weights: ['500', '700'], subsets: ['latin', 'latin-ext'] });
