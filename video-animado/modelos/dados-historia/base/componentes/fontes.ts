import { cancelRender, continueRender, delayRender } from 'remotion';
import caveat from './fontes/caveat-latin-400-700.woff2';
import inter400 from './fontes/inter-latin-400-normal.woff2';
import inter600 from './fontes/inter-latin-600-normal.woff2';
import inter800 from './fontes/inter-latin-800-normal.woff2';
import inter900 from './fontes/inter-latin-900-normal.woff2';
import mono500 from './fontes/jetbrains-mono-latin-500-normal.woff2';
import lora700 from './fontes/lora-latin-700-normal.ttf';

// Fontes do modelo Dados e história, em arquivo dentro do kit (componentes/fontes/, origem e licença em
// fontes/ORIGEM.md e fontes/OFL.txt). O bundler põe cada arquivo no pacote do vídeo, então nada é baixado
// na hora do render: sai igual com e sem internet. Os nomes de família são do kit (DadMao, DadTexto, DadMono,
// DadSerif) para nunca pegar uma fonte de mesmo nome instalada na máquina.
//   mao    Caveat 400 a 700: a palavra escrita à mão dentro do círculo
//   texto  Inter 400, 600, 800 e 900: título do isométrico e do mapa, número grande, cartões, legenda
//   mono   JetBrains Mono 500: rótulo do topo, mês da coluna, chip, letra miúda
//   serif  Lora 700: título e número da linha do tempo e do jornal, manchete do recorte

export const FAMILIA = {
  mao: "DadMao, 'Segoe Print', cursive",
  texto: 'DadTexto, Helvetica, Arial, sans-serif',
  mono: 'DadMono, Menlo, Consolas, monospace',
  serif: "DadSerif, Georgia, 'Times New Roman', serif",
} as const;
export type PapelFonte = keyof typeof FAMILIA;

const ARQUIVOS: [string, string, string, string][] = [
  ['DadMao', caveat, '400 700', 'woff2'],
  ['DadTexto', inter400, '400', 'woff2'],
  ['DadTexto', inter600, '600', 'woff2'],
  ['DadTexto', inter800, '800', 'woff2'],
  ['DadTexto', inter900, '900', 'woff2'],
  ['DadMono', mono500, '500', 'woff2'],
  ['DadSerif', lora700, '700', 'truetype'],
];

// o render espera as fontes carregarem antes do primeiro quadro
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  const espera = delayRender('fontes do kit (componentes/fontes/)');
  Promise.all(
    ARQUIVOS.map(([familia, arquivo, peso, formato]) => {
      const f = new FontFace(familia, `url(${arquivo}) format('${formato}')`, { weight: peso, style: 'normal' });
      document.fonts.add(f);
      return f.load();
    }),
  )
    .then(() => continueRender(espera))
    .catch((e) => cancelRender(e));
}
