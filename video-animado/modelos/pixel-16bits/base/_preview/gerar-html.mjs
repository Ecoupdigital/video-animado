// Gera BRANDBOOK-ANIMACAO.html a partir do BRANDBOOK-ANIMACAO.md (mesmo conteúdo) + imagens embutidas.
//
// Uso (na raiz do universo):
//   node _preview/gerar-html.mjs            monta o HTML com as imagens que já existem em imagens/
//   node _preview/gerar-html.mjs --stills   antes, gera com o Remotion os stills que faltam em imagens/
//
// As galerias mostram o boneco nos 4 gestos, a folha de opções e o vídeo com um card de cada molde e o card final.
// Cada imagem é o still do _preview com o mesmo id (imagens/<id>.png). Imagem que falta vira aviso com o comando
// que a produz. Conversão para JPG pelo ffmpeg (Mac e Linux); sem ffmpeg, no Mac usa o sips como atalho; sem os
// dois, embute o PNG direto. As cores da página vêm da paleta do universo.
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
const opcoes = lerJson('componentes/opcoes.json', { paletas: {} });
const P = { ...(Object.values(opcoes.paletas)[0] ?? {}) };
if (r.cores?.origem === 'marca' && r.marca?.cor) P.destaque = r.marca.cor;
Object.assign(P, r.cores?.paleta ?? {});

// ---------------------------------------------------------------- imagens pedidas

const SECOES = {
  3: [{ ids: [['elenco', 'O boneco nos 4 gestos e de olho fechado']], classe: '' }, { ids: [['opcoes-aparencia', 'Folha de opções do boneco, com os códigos']], classe: 'meia' }],
  4: [{ ids: [['vista-lista', 'Lista'], ['vista-conversa', 'Conversa'], ['vista-selo', 'Selo'], ['vista-blocos', 'Blocos'], ['vista-final', 'Card final']], classe: 'tres' }],
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
  const largura = classe === 'tres' ? 700 : classe === 'meia' ? 900 : 1600;
  return `<div class="galeria ${classe}">${ids.map(([id, leg]) => imagem(id, leg, largura)).join('')}</div>`;
};

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
const borda = 'rgba(0,0,0,0.1)';
const pagina = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
:root{--fundo:${P.fundo};--sup:${P.superficie};--apagado:${P.linha};--destaque:${P.destaque};--alerta:${P.aviso};--titulo:${P.tinta};--texto:${P.tinta};--suave:${P.suave};--borda:${borda}}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--fundo);color:var(--texto);font:16px/1.6 Inter,system-ui,sans-serif}
main{max-width:1080px;margin:0 auto;padding:40px 20px 120px}
h1{font-weight:900;font-size:clamp(44px,8vw,88px);line-height:1;margin:20px 0 10px;color:var(--titulo);letter-spacing:-0.03em}
h1+p{font-size:20px;max-width:760px}
h2{font-weight:800;font-size:clamp(28px,5vw,40px);margin:72px 0 16px;padding-top:24px;border-top:1px solid var(--borda);color:var(--titulo)}
h2::before{content:'//';font-family:'JetBrains Mono',monospace;color:var(--destaque);margin-right:12px;font-size:.7em}
h3{font-size:22px;color:var(--titulo)}
a{color:var(--destaque)}
strong{color:var(--titulo)}
table{width:100%;border-collapse:collapse;background:var(--sup);border-radius:8px;overflow:hidden;margin:16px 0;font-size:15px;display:block;overflow-x:auto}
th,td{padding:10px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--borda)}
th{background:var(--apagado);font-weight:700;color:var(--titulo)}
code{font-family:'JetBrains Mono',monospace;font-size:.85em;background:var(--apagado);padding:1px 6px;border-radius:4px}
.galeria{display:grid;gap:14px;margin:18px 0}.galeria.tres{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.galeria.meia{max-width:520px}
figure{margin:0;background:var(--sup);border:1px solid var(--borda);border-top:3px solid var(--destaque);border-radius:8px;padding:10px}figure img{width:100%;height:auto;display:block;border-radius:4px}
figure.falta div{padding:40px 16px;text-align:center;color:var(--alerta);border:2px dashed var(--borda);border-radius:6px}
figcaption{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--suave);padding:6px 4px 0}
button.cor{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
button.cor span{width:18px;height:18px;border-radius:4px;border:1px solid var(--borda);display:inline-block}
.aviso{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--destaque);color:#fff;padding:8px 16px;border-radius:99px;opacity:0;transition:opacity .2s}
.aviso.on{opacity:1}
blockquote{border-left:4px solid var(--destaque);margin:0;padding:4px 16px;background:var(--sup);border-radius:6px}
</style></head><body><main>${html}</main><div class="aviso" id="aviso">copiado</div>
<script>document.querySelectorAll('button.cor').forEach(b=>b.addEventListener('click',()=>{try{navigator.clipboard.writeText(b.dataset.hex)}catch(e){}const a=document.getElementById('aviso');a.textContent=b.dataset.hex+' copiado';a.classList.add('on');setTimeout(()=>a.classList.remove('on'),1200)}))</script>
</body></html>`;
writeFileSync('BRANDBOOK-ANIMACAO.html', pagina);
for (const id of [...new Set(faltando)]) console.log(`aviso: falta ${png(id)}; gere com: npx remotion still _preview/src/index.ts ${id} ${png(id)}  (ou rode com --stills)`);
console.log('ok BRANDBOOK-ANIMACAO.html', Math.round(pagina.length / 1024), 'KB', faltando.length ? `(${new Set(faltando).size} imagem(ns) faltando)` : '');
