import { getInfo as infoInter, loadFont as fonteInter } from '@remotion/google-fonts/Inter';
import { getInfo as infoInterTight, loadFont as fonteInterTight } from '@remotion/google-fonts/InterTight';
import { getInfo as infoJetBrainsMono, loadFont as fonteJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import { getInfo as infoPlayfairDisplay, loadFont as fontePlayfairDisplay } from '@remotion/google-fonts/PlayfairDisplay';
import { getInfo as infoMerriweather, loadFont as fonteMerriweather } from '@remotion/google-fonts/Merriweather';
import { getInfo as infoSourceSans3, loadFont as fonteSourceSans3 } from '@remotion/google-fonts/SourceSans3';
import { getInfo as infoSourceCodePro, loadFont as fonteSourceCodePro } from '@remotion/google-fonts/SourceCodePro';
import { getInfo as infoIBMPlexMono, loadFont as fonteIBMPlexMono } from '@remotion/google-fonts/IBMPlexMono';
import { getInfo as infoOswald, loadFont as fonteOswald } from '@remotion/google-fonts/Oswald';
import { getInfo as infoFraunces, loadFont as fonteFraunces } from '@remotion/google-fonts/Fraunces';
import { getInfo as infoDMSans, loadFont as fonteDMSans } from '@remotion/google-fonts/DMSans';
import { getInfo as infoArchivo, loadFont as fonteArchivo } from '@remotion/google-fonts/Archivo';
import { getInfo as infoSpaceGrotesk, loadFont as fonteSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { getInfo as infoRobotoMono, loadFont as fonteRobotoMono } from '@remotion/google-fonts/RobotoMono';
import { getInfo as infoLora, loadFont as fonteLora } from '@remotion/google-fonts/Lora';

// Fontes do dossiê, todas do Google Fonts pelo @remotion/google-fonts (a lista aceita está em opcoes.json,
// campo "fontes"). Cada tema usa três papéis: título (o texto cinético), texto (cards e fichas) e mono
// (rótulos, HUD, faixa). Só as fontes usadas pelos temas e pelas trocas das respostas são carregadas.

type Carregar = (estilo: 'normal', o: { weights: string[]; subsets: string[] }) => { fontFamily: string };
type Info = () => { fonts: Record<string, Record<string, unknown>> };
const CATALOGO: Record<string, [Info, Carregar]> = {
  Inter: [infoInter as Info, fonteInter as Carregar],
  InterTight: [infoInterTight as Info, fonteInterTight as Carregar],
  JetBrainsMono: [infoJetBrainsMono as Info, fonteJetBrainsMono as Carregar],
  PlayfairDisplay: [infoPlayfairDisplay as Info, fontePlayfairDisplay as Carregar],
  Merriweather: [infoMerriweather as Info, fonteMerriweather as Carregar],
  SourceSans3: [infoSourceSans3 as Info, fonteSourceSans3 as Carregar],
  SourceCodePro: [infoSourceCodePro as Info, fonteSourceCodePro as Carregar],
  IBMPlexMono: [infoIBMPlexMono as Info, fonteIBMPlexMono as Carregar],
  Oswald: [infoOswald as Info, fonteOswald as Carregar],
  Fraunces: [infoFraunces as Info, fonteFraunces as Carregar],
  DMSans: [infoDMSans as Info, fonteDMSans as Carregar],
  Archivo: [infoArchivo as Info, fonteArchivo as Carregar],
  SpaceGrotesk: [infoSpaceGrotesk as Info, fonteSpaceGrotesk as Carregar],
  RobotoMono: [infoRobotoMono as Info, fonteRobotoMono as Carregar],
  Lora: [infoLora as Info, fonteLora as Carregar],
};
const PESOS = ['400', '500', '600', '700', '800', '900'];
const RESERVA: Record<string, string> = { mono: 'Menlo, Consolas, monospace', titulo: 'Helvetica, Arial, sans-serif', texto: 'Helvetica, Arial, sans-serif' };

const carregadas: Record<string, string> = {};
/** Carrega a fonte pelo id do opcoes.json (uma vez só) e devolve a família CSS, com reserva. */
export const familia = (id: string, papel: 'titulo' | 'texto' | 'mono' = 'texto'): string => {
  const item = CATALOGO[id];
  if (!item) return RESERVA[papel];
  if (!carregadas[id]) {
    const [info, carregar] = item;
    const pesos = PESOS.filter((p) => p in (info().fonts.normal ?? {}));
    carregadas[id] = carregar('normal', { weights: pesos.length ? pesos : ['400'], subsets: ['latin', 'latin-ext'] }).fontFamily;
  }
  return `${carregadas[id]}, ${RESERVA[papel]}`;
};

export const FONTES_ACEITAS = Object.keys(CATALOGO);
