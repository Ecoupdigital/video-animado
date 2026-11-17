import { cancelRender, continueRender, delayRender } from 'remotion';
import caveat from './fontes/caveat-latin-400-700.woff2';
import inter400 from './fontes/inter-latin-400-normal.woff2';
import inter600 from './fontes/inter-latin-600-normal.woff2';
import inter800 from './fontes/inter-latin-800-normal.woff2';
import lora700 from './fontes/lora-latin-700-normal.ttf';

// Fontes do modelo Conto, em arquivo dentro do kit (componentes/fontes/, origem e licença em fontes/ORIGEM.md e
// fontes/OFL.txt). O bundler põe cada arquivo no pacote do vídeo, então nada é baixado na hora do render: sai
// igual com e sem internet. Os nomes de família são do kit (ContoTexto, ContoSerif,
// ContoMao) para nunca pegar uma fonte de mesmo nome instalada na máquina.
//   texto  Inter 400, 600 e 800: legenda, balão, selo, placa, fecho
//   serif  Lora 700: título e subtítulo da faixa do papel recortado e citação das silhuetas (o itálico
//          inclinado pelo navegador)
//   mao    Caveat 400 a 700: letra de mão do giz de cera (título, legenda, placa, fecho)

export const FAMILIA = {
  texto: 'ContoTexto, Helvetica, Arial, sans-serif',
  serif: "ContoSerif, Georgia, 'Times New Roman', serif",
  mao: "ContoMao, 'Segoe Print', cursive",
} as const;
export type PapelFonte = keyof typeof FAMILIA;

const ARQUIVOS: [string, string, string, string][] = [
  ['ContoTexto', inter400, '400', 'woff2'],
  ['ContoTexto', inter600, '600', 'woff2'],
  ['ContoTexto', inter800, '800', 'woff2'],
  ['ContoSerif', lora700, '700', 'truetype'],
  ['ContoMao', caveat, '400 700', 'woff2'],
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
