import { loadFont as fonteInter } from '@remotion/google-fonts/Inter';
import { loadFont as fonteJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

// Fontes do pixel: Inter (título, legenda, cards) e JetBrains Mono (topo, rótulos dos cards, etiquetas),
// as mesmas da referência, pelo @remotion/google-fonts (funciona igual no Mac e no Linux).
const inter = fonteInter('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin', 'latin-ext'] });
const mono = fonteJetBrainsMono('normal', { weights: ['500', '700'], subsets: ['latin', 'latin-ext'] });

export const SANS = `${inter.fontFamily}, Helvetica, Arial, sans-serif`;
export const MONO = `${mono.fontFamily}, Menlo, Consolas, monospace`;
