import { cancelRender, continueRender, delayRender } from 'remotion';
import inter800 from './fontes/inter-latin-800-normal.woff2';
import inter900 from './fontes/inter-latin-900-normal.woff2';
import mono500 from './fontes/jetbrains-mono-latin-500-normal.woff2';

// Fontes do modelo Neon retrô, em arquivo dentro do kit (componentes/fontes/, origem e licença em fontes/ORIGEM.md
// e fontes/OFL.txt). O bundler põe cada arquivo no pacote do vídeo, então nada é baixado na hora do render: sai
// igual com e sem internet. Os nomes de família são do kit (NeonTexto, NeonMono) para nunca pegar uma fonte de
// mesmo nome instalada na máquina.
//   texto  Inter 800 e 900: letreiro (900, inclinado em código), preço, contagem, selo, botão, card final
//   mono   JetBrains Mono 500: "PLAY" e contador de fita, relógio da contagem, prazo, aviso do card final

export const FAMILIA = {
  texto: 'NeonTexto, Helvetica, Arial, sans-serif',
  mono: 'NeonMono, Menlo, Consolas, monospace',
} as const;
export type PapelFonte = keyof typeof FAMILIA;

const ARQUIVOS: [string, string, string][] = [
  ['NeonTexto', inter800, '800'],
  ['NeonTexto', inter900, '900'],
  ['NeonMono', mono500, '500'],
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
