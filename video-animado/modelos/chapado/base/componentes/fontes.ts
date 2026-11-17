import { loadFont as carregarBaloo } from '@remotion/google-fonts/Baloo2';
import { loadFont as carregarDMSans } from '@remotion/google-fonts/DMSans';

// Fontes do universo: Baloo 2 (título e legenda) e DM Sans (fonte da dica e detalhes).
export const { fontFamily: FONTE_TITULO } = carregarBaloo('normal', { weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext'] });
export const { fontFamily: FONTE_TEXTO } = carregarDMSans('normal', { weights: ['400', '500', '700'], subsets: ['latin', 'latin-ext'] });
