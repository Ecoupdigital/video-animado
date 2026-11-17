// Grava frames exatos de um vídeo (pelo renderer do Remotion, sem renderizar o vídeo inteiro), para conferir
// o texto cinético contra o words.json, a área segura ou uma cena.
// Uso (na raiz do universo): node _ferramentas/stills.mjs <pasta-do-video> t1 t2 ... [--escala 0.5]
//   t em segundos do áudio final (convertido para frame só aqui: frame = round(t x 30))
//   saída: <pasta-do-video>/stills/t_<segundos>.png (dentro da pasta do vídeo, nada em pasta temporária do sistema)
// Usa o Chrome do sistema só no Linux (/usr/bin/google-chrome, se existir); no Mac, o navegador do Remotion.
// O bundler não segue o link do node_modules (mesmo cuidado do remotion.config.ts).
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const iE = args.indexOf('--escala');
const escala = iE >= 0 ? Number(args[iE + 1]) : 1;
const pos = args.filter((a, i) => i !== iE && i !== iE + 1);
if (pos.length < 2 || pos.slice(1).some((t) => Number.isNaN(Number(t)))) {
  console.log('Uso: node _ferramentas/stills.mjs <pasta-do-video> t1 t2 ... [--escala 0.5]');
  process.exit(1);
}
const ep = path.resolve(pos[0]);
const entrada = path.join(ep, 'src', 'index.ts');
if (!existsSync(entrada)) {
  console.log(`falta ${entrada} (copie _ferramentas/episodio-base/src para a pasta do vídeo)`);
  process.exit(1);
}
const browserExecutable = process.platform === 'linux' && existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : null;
const saida = path.join(ep, 'stills');
mkdirSync(saida, { recursive: true });
// o pacote do bundler fica dentro da pasta do vídeo e sai no fim (nada em pasta temporária do sistema)
const pacote = path.join(ep, '.stills-bundle');
const serveUrl = await bundle({
  entryPoint: entrada,
  outDir: pacote,
  publicDir: path.join(ep, 'public'),
  webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, symlinks: false } }),
});
const composition = await selectComposition({ serveUrl, id: 'ep', browserExecutable });
for (const t of pos.slice(1).map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.max(0, Math.round(t * composition.fps)));
  const arq = path.join(saida, `t_${t.toFixed(2)}.png`);
  await renderStill({ serveUrl, composition, frame, output: arq, browserExecutable, scale: escala });
  console.log(`ok ${path.relative(process.cwd(), arq)} (frame ${frame})`);
}
rmSync(pacote, { recursive: true, force: true });
