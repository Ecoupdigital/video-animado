import { cancelRender, continueRender, delayRender } from 'remotion';
import inter600 from './fontes/inter-latin-600-normal.woff2';
import inter800 from './fontes/inter-latin-800-normal.woff2';
import mono500 from './fontes/jetbrains-mono-latin-500-normal.woff2';

// Fontes do modelo Mesa vista de cima, em arquivo dentro do kit (componentes/fontes/, origem e licença em
// fontes/ORIGEM.md e fontes/OFL.txt). O bundler põe cada arquivo no pacote do vídeo, então nada é baixado
// na hora do render: sai igual com e sem internet. Os nomes de família são do kit (MesaTexto, MesaMono)
// para nunca pegar uma fonte de mesmo nome instalada na máquina.
//   texto  Inter 600 e 800: frase da faixa, título do passo na etiqueta, título da abertura, card final
//   mono   JetBrains Mono 500: "PASSO n DE N", rótulo da abertura, fontes e aviso do card final

export const FAMILIA = {
  texto: 'MesaTexto, Helvetica, Arial, sans-serif',
  mono: 'MesaMono, Menlo, Consolas, monospace',
} as const;
export type PapelFonte = keyof typeof FAMILIA;

const ARQUIVOS: [string, string, string][] = [
  ['MesaTexto', inter600, '600'],
  ['MesaTexto', inter800, '800'],
  ['MesaMono', mono500, '500'],
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
