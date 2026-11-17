import { cancelRender, continueRender, delayRender } from 'remotion';
import inter400 from './fontes/inter-latin-400-normal.woff2';
import inter600 from './fontes/inter-latin-600-normal.woff2';
import inter800 from './fontes/inter-latin-800-normal.woff2';

// Fontes do modelo Conversa no celular, em arquivo dentro do kit (componentes/fontes/, origem e licença em
// fontes/ORIGEM.md e fontes/OFL.txt). O bundler põe cada arquivo no pacote do vídeo, então nada é baixado na hora
// do render: sai igual com e sem internet. O nome de família é do kit (ConversaTexto) para nunca pegar uma fonte
// de mesmo nome instalada na máquina.
//   texto  Inter 400 (bolha, horário, campo), 600 (legenda, status, duração) e 800 (título, nome, card final)

export const FAMILIA = {
  texto: 'ConversaTexto, Helvetica, Arial, sans-serif',
} as const;
export type PapelFonte = keyof typeof FAMILIA;

const ARQUIVOS: [string, string, string][] = [
  ['ConversaTexto', inter400, '400'],
  ['ConversaTexto', inter600, '600'],
  ['ConversaTexto', inter800, '800'],
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
