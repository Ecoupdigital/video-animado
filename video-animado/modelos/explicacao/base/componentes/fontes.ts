import { cancelRender, continueRender, delayRender } from 'remotion';
import caveat from './fontes/caveat-latin-400-700.woff2';
import inter400 from './fontes/inter-latin-400-normal.woff2';
import inter600 from './fontes/inter-latin-600-normal.woff2';
import inter800 from './fontes/inter-latin-800-normal.woff2';
import inter900 from './fontes/inter-latin-900-normal.woff2';
import mono500 from './fontes/jetbrains-mono-latin-500-normal.woff2';

// Fontes do modelo Explicação, em arquivo dentro do kit (componentes/fontes/, origem e licença em
// fontes/ORIGEM.md e fontes/OFL.txt). O bundler põe cada arquivo no pacote do vídeo, então nada é baixado
// na hora do render: sai igual com e sem internet. Os nomes de família são do kit (ExpMao, ExpTexto,
// ExpMono) para nunca pegar uma fonte de mesmo nome instalada na máquina.
//   mao    Caveat 400 a 700: letra de mão (títulos do quadro e da lousa, caixas, post-its, giz)
//   texto  Inter 400, 600, 800 e 900: texto de apoio, janela de app, título da tela de app e dos post-its
//   mono   JetBrains Mono 500: rótulo do topo, endereço da janela, letra miúda

export const FAMILIA = {
  mao: "ExpMao, 'Segoe Print', cursive",
  texto: 'ExpTexto, Helvetica, Arial, sans-serif',
  mono: 'ExpMono, Menlo, Consolas, monospace',
} as const;
export type PapelFonte = keyof typeof FAMILIA;

const ARQUIVOS: [string, string, string][] = [
  ['ExpMao', caveat, '400 700'],
  ['ExpTexto', inter400, '400'],
  ['ExpTexto', inter600, '600'],
  ['ExpTexto', inter800, '800'],
  ['ExpTexto', inter900, '900'],
  ['ExpMono', mono500, '500'],
];

// o render espera as fontes carregarem antes do primeiro quadro
if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
  const espera = delayRender('fontes do kit (componentes/fontes/)');
  Promise.all(
    ARQUIVOS.map(([familia, arquivo, peso]) => {
      const f = new FontFace(familia, `url(${arquivo}) format('woff2')`, { weight: peso, style: 'normal' });
      document.fonts.add(f);
      return f.load();
    }),
  )
    .then(() => continueRender(espera))
    .catch((e) => cancelRender(e));
}
