// Gera BRANDBOOK-ANIMACAO.html a partir do BRANDBOOK-ANIMACAO.md (mesmo conteúdo) + imagens embutidas.
//
// Uso (na raiz do universo):
//   node _preview/gerar-html.mjs            monta o HTML com as imagens que já existem em imagens/
//   node _preview/gerar-html.mjs --stills   antes, gera com o Remotion os stills que faltam em imagens/
//
// As galerias usam a superfície e o grupo das respostas: a capa, a abertura e o card final, as 3 superfícies, os
// itens do grupo principal, as 3 paletas prontas e a biblioteca inteira. Cada imagem é o still do _preview com o mesmo id
// (imagens/<id>.png). Imagem que falta vira aviso com o comando que a produz.
// As fontes da página são as do kit (componentes/fontes/), embutidas: a página abre sem internet.
// Conversão para JPG pelo ffmpeg (Mac e Linux); sem ffmpeg, no Mac usa o sips como atalho; sem os
// dois, embute o PNG direto. As cores da página vêm das cores do universo (componentes/universo.ts): o papel da
// etiqueta no fundo, o texto dela e o "PASSO n DE N" no destaque.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { marked } from 'marked';

const BRANDBOOK = 'BRANDBOOK-ANIMACAO.md';
if (!existsSync(BRANDBOOK)) {
  console.log(`falta ${BRANDBOOK}: rode este script na raiz do universo`);
  process.exit(1);
}
const lerJson = (arq, padrao) => (existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : padrao);
const r = lerJson('respostas.json', {});
const opcoes = lerJson('componentes/opcoes.json', { paletas: {}, pronta_padrao: 'ambar', grupo_padrao: 'cozinha' });
// a superfície, o grupo e as cores já resolvidas pelo --aplicar
const universo = existsSync('componentes/universo.ts') ? readFileSync('componentes/universo.ts', 'utf8') : '';
const bloco = (nome) => {
  const m = new RegExp(`export const ${nome}[^=]*=\\s*(\\{[\\s\\S]*?\\n\\});`).exec(universo);
  return m ? JSON.parse(m[1]) : null;
};
const MESA = bloco('MESA') ?? { superficie: 'madeira', grupo: opcoes.grupo_padrao };
const CORES = bloco('CORES') ?? { base: opcoes.pronta_padrao, cores: {} };
const grupo = MESA.grupo;
const P = { ...(opcoes.paletas[CORES.base] ?? Object.values(opcoes.paletas)[0] ?? {}), ...(CORES.cores ?? {}) };

// ---------------------------------------------------------------- imagens pedidas

const SECOES = {
  1: [{ ids: [['capa', 'Capa: um passo com a peça central pronta'], ['vista-abertura', 'Abertura'], ['vista-final', 'Card final']], classe: 'tres' }],
  4: [
    { ids: [['superficies', 'As 3 superfícies (madeira, mármore, pano liso)']], classe: '' },
    { ids: [[`itens-${grupo}`, `Itens do grupo principal (${grupo}), com o que cada um vira sobre a peça central`], ['vista-passo', 'Um passo: etiqueta, itens na mesa e faixa']], classe: 'tres' },
  ],
  5: [{ ids: [['paletas', 'As 3 paletas prontas: a superfície fica, a cor troca destaque, faixa, etiqueta e card final']], classe: '' }],
  9: [{ ids: [['elenco', 'A biblioteca inteira (22 itens) e as 3 peças centrais']], classe: 'meia' }],
};
const todosIds = [...new Set(Object.values(SECOES).flatMap((s) => s.flatMap((g) => g.ids.map(([id]) => id))))];

// ---------------------------------------------------------------- stills que faltam (--stills)

const png = (id) => `imagens/${id}.png`;
mkdirSync('imagens/_jpg', { recursive: true });
if (process.argv.includes('--stills')) {
  for (const id of todosIds) {
    if (existsSync(png(id))) continue;
    console.log(`gerando ${png(id)}`);
    const rr = spawnSync('npx', ['remotion', 'still', '_preview/src/index.ts', id, png(id), '--log=error'], { stdio: 'inherit' });
    if (rr.status !== 0) console.log(`aviso: o still "${id}" falhou`);
  }
}

// ---------------------------------------------------------------- conversão

const tem = (cmd, args) => spawnSync(cmd, args, { stdio: 'ignore' }).status === 0;
const temFfmpeg = tem('ffmpeg', ['-version']);
// sips só como atalho no Mac, quando não há ffmpeg
const temSips = !temFfmpeg && process.platform === 'darwin' && spawnSync('sh', ['-c', 'command -v sips'], { stdio: 'ignore' }).status === 0;
if (!temFfmpeg && !temSips) console.log('aviso: sem ffmpeg, as imagens vão em PNG (página mais pesada)');

const faltando = [];
const imagem = (id, legenda, largura) => {
  const origem = png(id);
  if (!existsSync(origem)) {
    faltando.push(id);
    return `<figure class="falta"><div>falta a imagem <code>${origem}</code><br>still <code>${id}</code> do _preview</div><figcaption>${legenda}</figcaption></figure>`;
  }
  let arquivo = origem;
  let tipo = 'png';
  const saida = `imagens/_jpg/${id}.jpg`;
  if (temFfmpeg) {
    const ok = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', origem, '-vf', `scale='min(${largura},iw)':-2`, '-q:v', '4', saida], { stdio: 'ignore' }).status === 0;
    if (ok) [arquivo, tipo] = [saida, 'jpeg'];
  } else if (temSips) {
    const ok = spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78', '-Z', String(largura), origem, '--out', saida], { stdio: 'ignore' }).status === 0;
    if (ok) [arquivo, tipo] = [saida, 'jpeg'];
  }
  const b64 = readFileSync(arquivo).toString('base64');
  return `<figure><img src="data:image/${tipo};base64,${b64}" alt="${legenda}" loading="lazy"><figcaption>${legenda}</figcaption></figure>`;
};
const galeria = ({ ids, classe }) => {
  const largura = classe === 'tres' || classe === 'quatro' ? 700 : classe === 'meia' ? 900 : 1800;
  return `<div class="galeria ${classe}">${ids.map(([id, leg]) => imagem(id, leg, largura)).join('')}</div>`;
};

// ---------------------------------------------------------------- fontes do kit, embutidas

const fonte = (familia, arquivo, peso) =>
  existsSync(`componentes/fontes/${arquivo}`) ? `@font-face{font-family:${familia};font-weight:${peso};src:url(data:font/woff2;base64,${readFileSync(`componentes/fontes/${arquivo}`).toString('base64')}) format('woff2')}` : '';
const fontes = [fonte('MesaTexto', 'inter-latin-600-normal.woff2', '600'), fonte('MesaTexto', 'inter-latin-800-normal.woff2', '800'), fonte('MesaMono', 'jetbrains-mono-latin-500-normal.woff2', '500')].join('\n');

// ---------------------------------------------------------------- página

let html = marked.parse(readFileSync(BRANDBOOK, 'utf8'));
for (const [n, grupos] of Object.entries(SECOES)) {
  const re = new RegExp(`(<h2[^>]*>${n}\\. [^<]*</h2>)`);
  if (!re.test(html)) {
    console.log(`aviso: seção ${n} não achada no brandbook; imagens dela ficaram de fora`);
    continue;
  }
  html = html.replace(re, `$1${grupos.map(galeria).join('')}`);
}
// amostra de cor ao lado de cada hex
html = html.replace(/<code>(#[0-9A-Fa-f]{6})<\/code>/g, '<button class="cor" data-hex="$1" title="Copiar $1"><span style="background:$1"></span><code>$1</code></button>');

const titulo = r.universo?.nome ?? 'Universo';
const borda = 'rgba(0,0,0,0.12)';
const sup = '#FFFFFF';
const pagina = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<style>
${fontes}
:root{--fundo:${P.etiqueta};--sup:${sup};--destaque:${P.etiquetaPasso};--titulo:${P.etiquetaTexto};--borda:${borda}}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--fundo);color:var(--titulo);font:16px/1.6 MesaTexto,system-ui,sans-serif}
main{max-width:1080px;margin:0 auto;padding:40px 20px 120px}
p,li,td{color:var(--titulo)}
h1{font-family:MesaTexto;font-weight:800;font-size:clamp(48px,9vw,96px);line-height:1.05;margin:20px 0 10px;color:var(--titulo)}
h1+p{font-size:20px;max-width:760px}
h2{font-weight:800;font-size:clamp(28px,5vw,40px);margin:72px 0 16px;padding-top:24px;border-top:1px solid var(--borda);color:var(--titulo)}
h2::before{content:'//';font-family:MesaMono,monospace;color:var(--destaque);margin-right:12px;font-size:.7em}
h3{font-size:22px;color:var(--titulo)}
a{color:var(--destaque)}
strong{color:var(--titulo)}
table{width:100%;border-collapse:collapse;background:var(--sup);border-radius:8px;overflow:hidden;margin:16px 0;font-size:15px;display:block;overflow-x:auto}
th,td{padding:10px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--borda)}
th{font-weight:800;color:var(--titulo)}
code{font-family:MesaMono,monospace;font-size:.85em;background:var(--sup);padding:1px 6px;border-radius:4px}
.galeria{display:grid;gap:14px;margin:18px 0}.galeria.tres{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.galeria.quatro{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.galeria.meia{max-width:520px}
figure{margin:0;background:var(--sup);border:1px solid var(--borda);border-top:3px solid var(--destaque);border-radius:8px;padding:10px}figure img{width:100%;height:auto;display:block;border-radius:4px}
figure.falta div{padding:40px 16px;text-align:center;color:var(--destaque);border:2px dashed var(--borda);border-radius:6px}
figcaption{font-family:MesaMono,monospace;font-size:12px;color:var(--titulo);opacity:.75;padding:6px 4px 0}
button.cor{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
button.cor span{width:18px;height:18px;border-radius:4px;border:1px solid var(--borda);display:inline-block}
.aviso{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--destaque);color:#111;padding:8px 16px;border-radius:99px;opacity:0;transition:opacity .2s}
.aviso.on{opacity:1}
</style></head><body><main>${html}</main><div class="aviso" id="aviso">copiado</div>
<script>document.querySelectorAll('button.cor').forEach(b=>b.addEventListener('click',()=>{try{navigator.clipboard.writeText(b.dataset.hex)}catch(e){}const a=document.getElementById('aviso');a.textContent=b.dataset.hex+' copiado';a.classList.add('on');setTimeout(()=>a.classList.remove('on'),1200)}))</script>
</body></html>`;
writeFileSync('BRANDBOOK-ANIMACAO.html', pagina);
for (const id of [...new Set(faltando)]) console.log(`aviso: falta ${png(id)}; gere com: npx remotion still _preview/src/index.ts ${id} ${png(id)}  (ou rode com --stills)`);
console.log('ok BRANDBOOK-ANIMACAO.html', Math.round(pagina.length / 1024), 'KB', faltando.length ? `(${new Set(faltando).size} imagem(ns) faltando)` : '');
