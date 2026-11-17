#!/usr/bin/env node
// Gera o catálogo de modelos (HTML que abre direto do disco) e imprime a lista numerada.
//
// Uso: node catalogo.mjs [--estudio P] [--saida F] [--png F]
//
//   --estudio P   estúdio da pessoa (padrão: ~/meu-estudio se existir, senão a pasta atual).
//                 Junta os modelos da skill (modelos/) com os modelos locais (P/modelos/).
//   --saida F     onde gravar o HTML (padrão: P/modelos/catalogo.html).
//   --png F       também captura a página pelo Chrome headless (Linux e Mac) e grava o PNG.
//
// Um cartão por modelo (nome, frase, folha de frames, elenco, trecho em vídeo mudo em laço,
// para que serve, número da opção, selo "seu modelo" nos locais) e um último cartão
// "Criar um estilo novo". Modelo que não passa no conferir_kit ganha aviso no cartão; o catálogo
// nunca para por causa de um modelo ruim. A numeração da página é a mesma do terminal.
// Imagens embutidas em base64, reduzidas pelo ffmpeg (sem ffmpeg, vão como estão); o trecho
// vai por caminho file:// absoluto, com um quadro de capa embutido.
// Node puro, sem dependência.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { conferirKit } from './conferir_kit.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(AQUI, '..');
const MODELOS_SKILL = path.join(SKILL, 'modelos');
// ordem fixa dos modelos da skill (os números não mudam quando a pessoa salva um modelo local)
const ORDEM = ['chapado', 'traco-fino', 'dossie', 'pixel-16bits', 'explicacao', 'dados-historia', 'conto', 'conversa', 'mesa', 'neon'];

const args = process.argv.slice(2);
const opcao = (nome) => {
  const i = args.indexOf(nome);
  if (i < 0) return null;
  if (!args[i + 1] || args[i + 1].startsWith('--')) {
    console.log(`${nome} precisa de um valor`);
    process.exit(1);
  }
  return args[i + 1];
};
if (args.includes('-h') || args.includes('--ajuda')) {
  console.log('Uso: node catalogo.mjs [--estudio P] [--saida F] [--png F]');
  process.exit(0);
}
const padraoEstudio = () => {
  const casa = path.join(os.homedir(), 'meu-estudio');
  return fs.existsSync(casa) ? casa : process.cwd();
};
const estudio = path.resolve(opcao('--estudio') ?? padraoEstudio());
const saida = path.resolve(opcao('--saida') ?? path.join(estudio, 'modelos', 'catalogo.html'));
const png = opcao('--png') ? path.resolve(opcao('--png')) : null;

const temFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'video-animado-catalogo-'));

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const lerJson = (arq) => {
  try {
    return JSON.parse(fs.readFileSync(arq, 'utf8'));
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------- modelos

const listar = (pasta, local) => {
  if (!fs.existsSync(pasta)) return [];
  return fs
    .readdirSync(pasta, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(pasta, d.name, 'modelo.json')))
    .map((d) => ({ dir: path.join(pasta, d.name), pasta: d.name, local }));
};
const daSkill = listar(MODELOS_SKILL, false).sort((a, b) => {
  const ia = ORDEM.indexOf(a.pasta);
  const ib = ORDEM.indexOf(b.pasta);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.pasta.localeCompare(b.pasta);
});
const locais = path.resolve(path.join(estudio, 'modelos')) === path.resolve(MODELOS_SKILL) ? [] : listar(path.join(estudio, 'modelos'), true).sort((a, b) => a.pasta.localeCompare(b.pasta));
const idsSkill = new Set(daSkill.map((m) => m.pasta));

const paraServe = (dir) => {
  const ficha = path.join(dir, 'FICHA-DO-MODELO.md');
  if (!fs.existsSync(ficha)) return null;
  const linha = fs
    .readFileSync(ficha, 'utf8')
    .split('\n')
    .find((l) => /^\*\*Para que serve:?\*\*/i.test(l.trim()));
  return linha ? linha.replace(/^\s*\*\*Para que serve:?\*\*:?\s*/i, '').replace(/\*\*|`/g, '') : null;
};

let nImg = 0;
/** Imagem reduzida em base64 (JPG pelo ffmpeg; sem ffmpeg, o arquivo como está). */
const embutir = (arq, largura) => {
  if (!arq || !fs.existsSync(arq)) return null;
  let usar = arq;
  if (temFfmpeg) {
    const destino = path.join(tmp, `img-${++nImg}.jpg`);
    const ok = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', arq, '-vf', `scale='min(${largura},iw)':-2`, '-q:v', '5', destino], { stdio: 'ignore' }).status === 0;
    if (ok) usar = destino;
  }
  const ext = path.extname(usar).toLowerCase();
  const tipo = ext === '.png' ? 'png' : ext === '.webp' ? 'webp' : 'jpeg';
  return `data:image/${tipo};base64,${fs.readFileSync(usar).toString('base64')}`;
};
/** Quadro de capa do trecho (para a captura e para navegador que não toca o vídeo). */
const capa = (video) => {
  if (!temFfmpeg) return null;
  const destino = path.join(tmp, `capa-${++nImg}.jpg`);
  const ok = spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', '1.5', '-i', video, '-frames:v', '1', '-vf', "scale='min(540,iw)':-2", '-q:v', '5', destino], { stdio: 'ignore' }).status === 0;
  return ok && fs.existsSync(destino) ? `data:image/jpeg;base64,${fs.readFileSync(destino).toString('base64')}` : null;
};

const montar = ({ dir, pasta, local }) => {
  const m = lerJson(path.join(dir, 'modelo.json')) ?? {};
  const v = lerJson(path.join(dir, 'vitrine', 'vitrine.json')) ?? {};
  let conf;
  try {
    conf = conferirKit(dir);
  } catch (e) {
    conf = { erros: [`não deu para conferir (${e.message})`], avisos: [] };
  }
  const arquivos = { folha: 'folha.jpg', elenco: 'elenco.jpg', trecho: 'trecho.mp4', ...(v.arquivos ?? {}) };
  const noDisco = (k) => {
    const p = path.join(dir, 'vitrine', String(arquivos[k]));
    return fs.existsSync(p) ? p : null;
  };
  const avisos = [...conf.erros];
  if (local && idsSkill.has(pasta)) avisos.push(`tem o mesmo id de um modelo da skill; o novo_universo.mjs usa este (local)`);
  const trecho = noDisco('trecho');
  return {
    id: m.id || pasta,
    nome: v.nome_exibicao || m.nome || pasta,
    frase: v.frase || m.resumo || '',
    exemplo: v.exemplo || '',
    serve: paraServe(dir) || m.resumo || '',
    local: local || m.origem === 'local',
    folha: embutir(noDisco('folha'), 1400),
    elenco: embutir(noDisco('elenco'), 1400),
    // legenda da segunda imagem: "Elenco", ou a que o vitrine.json der (modelo sem personagem: "Peças")
    legendaElenco: v.legendas?.elenco || 'Elenco',
    // #t=1.5: o primeiro quadro mostrado já tem título e legenda (o laço depois volta ao começo)
    trecho: trecho ? `${pathToFileURL(trecho).href}#t=1.5` : null,
    capa: trecho ? capa(trecho) : null,
    avisos,
    dir,
    // modelo de família (com "temas" no modelo.json): miniatura, nome e o que a cor troca em cada tema
    temas: Array.isArray(m.temas)
      ? m.temas
          .filter((t) => t && t.id)
          .map((t) => ({ id: t.id, nome: t.nome || t.id, corTroca: t.cor_troca || '', recomendado: t.id === m.tema_recomendado, img: embutir(path.join(dir, 'vitrine', `tema-${t.id}.jpg`), 360) }))
      : [],
  };
};

const modelos = [...daSkill, ...locais].map(montar);
modelos.forEach((m, i) => (m.n = i + 1));
const nNovo = modelos.length + 1;

// ---------------------------------------------------------------- página

const cartao = (m) => {
  const imagens = [
    m.folha && `<figure class="folha"><img src="${m.folha}" alt="Frames da prévia de ${esc(m.nome)}"><figcaption>Frames da prévia</figcaption></figure>`,
    m.elenco && `<figure class="elenco"><img src="${m.elenco}" alt="${esc(m.legendaElenco)} de ${esc(m.nome)}"><figcaption>${esc(m.legendaElenco)}</figcaption></figure>`,
  ].filter(Boolean);
  const video = m.trecho
    ? `<div class="video"><video autoplay muted loop playsinline preload="metadata"${m.capa ? ` poster="${m.capa}"` : ''} src="${esc(m.trecho)}"></video><span class="rotulo">Trecho, sem som</span></div>`
    : '';
  const vazio = !video && imagens.length === 0 ? `<div class="vazio">Ainda sem vitrine. Gere com <code>node scripts/gerar_vitrine.mjs ${esc(m.id)}${m.local ? ' --estudio &lt;estúdio&gt;' : ''}</code></div>` : '';
  const avisos = m.avisos.length
    ? `<div class="aviso"><b>Aviso:</b> este modelo não passou na conferência do kit e pode não funcionar.<ul>${m.avisos
        .slice(0, 4)
        .map((a) => `<li>${esc(a)}</li>`)
        .join('')}${m.avisos.length > 4 ? `<li>e mais ${m.avisos.length - 4}</li>` : ''}</ul></div>`
    : '';
  // família: a fileira de temas (o tema se escolhe na entrevista; a família ocupa um número só)
  const temas = m.temas.length
    ? `<div class="temas"><p class="temas-tit">${m.temas.length} temas, escolhidos na entrevista</p><div class="temas-fila">${m.temas
        .map(
          (t) =>
            `<figure class="tema">${t.img ? `<img src="${t.img}" alt="Tema ${esc(t.nome)}">` : `<div class="tema-falta">falta vitrine/tema-${esc(t.id)}.jpg</div>`}<figcaption><b>${esc(t.nome)}</b>${t.recomendado ? ' <span class="rec">recomendado</span>' : ''}<span>${esc(t.corTroca)}</span></figcaption></figure>`,
        )
        .join('')}</div></div>`
    : '';
  return `<article class="cartao${m.local ? ' local' : ''}${m.temas.length ? ' familia' : ''}">
  <header><span class="num">${m.n}</span><div class="tit"><h2>${esc(m.nome)}${m.local ? ' <span class="selo">seu modelo</span>' : ''}${m.temas.length ? ' <span class="selo">família</span>' : ''}</h2><p class="frase">${esc(m.frase)}</p></div></header>
  ${video || imagens.length ? `<div class="midia${video ? '' : ' sem-video'}">${video}${imagens.length ? `<div class="imagens">${imagens.join('')}</div>` : ''}</div>` : vazio}
  ${temas}<p class="serve"><b>Para que serve:</b> ${esc(m.serve)}</p>
  <p class="rodape"><code>${esc(m.id)}</code>${m.exemplo ? ` · ${esc(m.exemplo)}` : ''} · responda <b>${m.n}</b> para escolher</p>
  ${avisos}
</article>`;
};

const cartaoNovo = `<article class="cartao novo">
  <header><span class="num">${nNovo}</span><div class="tit"><h2>Criar um estilo novo</h2><p class="frase">Do zero, do seu jeito: entrevista completa de 25 a 35 perguntas, uma por vez, e o desenho nasce em código.</p></div></header>
  <div class="mais" aria-hidden="true">+</div>
  <p class="serve"><b>Para que serve:</b> quando nenhum modelo combina com o assunto. Blocos: universo, personagens, cenários, narrativa, visual, movimento e fechamento. Em qualquer pergunta dá para dizer "decide por mim". No fim, o estilo pode virar um modelo seu e aparecer aqui.</p>
  <p class="rodape">responda <b>${nNovo}</b> para escolher</p>
</article>`;

const pagina = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Catálogo de modelos</title>
<style>
:root{--fundo:#FAF8F5;--texto:#222222;--suave:#6A6A6A;--destaque:#F5645B;--linha:#ECE6DF;--branco:#FFFFFF;--aviso:#FFF1E6}
*{box-sizing:border-box}
body{margin:0;background:var(--fundo);color:var(--texto);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:1180px;margin:0 auto;padding:40px 24px 80px}
h1{font-size:44px;line-height:1.1;margin:0 0 8px;letter-spacing:-.02em}
.lead{color:var(--suave);font-size:18px;margin:0 0 28px;max-width:820px}
.cartao{background:var(--branco);border:1px solid var(--linha);border-radius:22px;padding:22px 24px;margin:0 0 22px}
.cartao.local{border:2px solid var(--destaque)}
header{display:flex;gap:16px;align-items:flex-start}
.num{flex:none;width:46px;height:46px;border-radius:14px;background:var(--destaque);color:#fff;display:grid;place-items:center;font-weight:800;font-size:22px}
.tit h2{margin:0;font-size:26px;line-height:1.2}
.frase{margin:4px 0 0;color:var(--suave)}
.selo{display:inline-block;vertical-align:middle;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--destaque);border:2px solid var(--destaque);border-radius:99px;padding:2px 10px;margin-left:8px}
.midia{display:grid;grid-template-columns:270px 1fr;gap:18px;margin:18px 0 12px;align-items:start}
.midia.sem-video{grid-template-columns:1fr}
.video{position:relative}
.video video{width:270px;height:480px;object-fit:cover;border-radius:16px;background:#000;display:block}
.video .rotulo{position:absolute;left:10px;bottom:10px;background:rgba(0,0,0,.6);color:#fff;font-size:12px;padding:2px 8px;border-radius:99px}
.imagens{display:flex;flex-direction:column;gap:12px}
.sem-video .imagens{flex-direction:row}.sem-video .imagens figure{flex:1;min-width:0}
figure{margin:0}
figure img{width:100%;max-height:420px;object-fit:contain;display:block;border-radius:14px;background:var(--fundo)}
figcaption{font-size:13px;color:var(--suave);padding:4px 2px 0}
.vazio{margin:18px 0 12px;padding:36px 16px;border:2px dashed var(--linha);border-radius:14px;text-align:center;color:var(--suave)}
.serve{margin:6px 0}
.rodape{margin:6px 0 0;color:var(--suave);font-size:14px}
.rodape b{color:var(--destaque)}
code{font:13px ui-monospace,Menlo,Consolas,monospace;background:var(--fundo);padding:1px 6px;border-radius:6px}
.aviso{margin-top:12px;background:var(--aviso);border-left:5px solid var(--destaque);border-radius:10px;padding:10px 14px;font-size:14px}
.aviso ul{margin:6px 0 0;padding-left:18px}
.novo{border-style:dashed}
.novo .num{background:var(--texto)}
.temas{margin:4px 0 14px}.temas-tit{margin:0 0 8px;font-weight:700}
.temas-fila{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}
.tema img{width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:12px;display:block;background:var(--fundo)}
.tema figcaption{display:flex;flex-direction:column;gap:2px;font-size:13px;line-height:1.4}.tema figcaption b{color:var(--texto);font-size:14px}
.tema .rec{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--destaque)}
.tema-falta{aspect-ratio:9/16;border:2px dashed var(--linha);border-radius:12px;display:grid;place-items:center;font-size:12px;color:var(--suave);padding:8px;text-align:center}
.mais{margin:18px 0 12px;height:140px;border-radius:16px;background:repeating-linear-gradient(135deg,var(--fundo),var(--fundo) 14px,#F3EEE8 14px,#F3EEE8 28px);display:grid;place-items:center;font-size:84px;font-weight:300;color:var(--destaque)}
footer{color:var(--suave);font-size:13px;margin-top:30px}
</style></head><body><main>
<h1>Catálogo de modelos</h1>
<p class="lead">Escolha um modelo pronto e responda a entrevista curta (8 a 12 perguntas), ou crie um estilo novo do zero. Responda no chat com o número do cartão.</p>
${modelos.map(cartao).join('\n')}
${cartaoNovo}
<footer>Gerado por catalogo.mjs em ${new Date().toISOString().slice(0, 10).split('-').reverse().join('/')}. Modelos da skill e modelos locais de ${esc(path.join(estudio, 'modelos'))}.</footer>
</main>
<script>/* altura da página, lida pela captura (--png) */document.body.setAttribute('data-altura', String(document.documentElement.scrollHeight));</script>
</body></html>
`;

fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, pagina);
fs.rmSync(tmp, { recursive: true, force: true });

// ---------------------------------------------------------------- terminal

const largura = Math.max(10, ...modelos.map((m) => m.id.length));
console.log(`catálogo: ${saida}`);
for (const m of modelos) {
  console.log(`  ${String(m.n).padStart(2)}  ${m.id.padEnd(largura)}  ${m.nome}${m.local ? ' (seu modelo)' : ''}${m.avisos.length ? ' [com aviso]' : ''}`);
}
console.log(`  ${String(nNovo).padStart(2)}  ${'-'.padEnd(largura)}  Criar um estilo novo (entrevista completa, 25 a 35 perguntas)`);
for (const m of modelos) for (const a of m.avisos) console.log(`aviso: ${m.id}: ${a}`);
if (!temFfmpeg) console.log('aviso: sem ffmpeg, as imagens foram embutidas sem reduzir e os trechos ficaram sem capa');

// ---------------------------------------------------------------- captura

const acharChrome = () => {
  if (process.env.CHROME && fs.existsSync(process.env.CHROME)) return process.env.CHROME;
  if (process.platform === 'linux') {
    const fixo = '/usr/bin/google-chrome';
    if (fs.existsSync(fixo)) return fixo;
    for (const c of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
      if (spawnSync('sh', ['-c', `command -v ${c}`], { stdio: 'ignore' }).status === 0) return c;
    }
  }
  if (process.platform === 'darwin') {
    const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(mac)) return mac;
  }
  return null;
};

if (png) {
  const chrome = acharChrome();
  if (!chrome) {
    console.log('não achei o Chrome para a captura (defina CHROME com o caminho dele); o HTML foi gerado');
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(png), { recursive: true });
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'video-animado-chrome-'));
  const base = ['--headless', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--user-data-dir=${perfil}`, '--virtual-time-budget=4000'];
  // root no Linux só abre o Chrome sem a sandbox
  if (process.platform === 'linux' && typeof process.getuid === 'function' && process.getuid() === 0) base.unshift('--no-sandbox');
  const url = pathToFileURL(saida).href;
  // 1ª passada: mede a altura da página (o script dela grava data-altura no body)
  const dom = spawnSync(chrome, [...base, '--window-size=1240,1000', '--dump-dom', url], { encoding: 'utf8', timeout: 120000 });
  const medida = Number((/data-altura="(\d+)"/.exec(dom.stdout || '') || [])[1]);
  // folga: no modo headless a janela tem um pouco menos de área útil que o --window-size
  const altura = medida > 0 ? medida + 140 : 260 + modelos.length * 1000 + 600;
  if (!(medida > 0)) console.log('aviso: não deu para medir a altura da página; usei uma estimativa');
  const r = spawnSync(chrome, [...base, `--window-size=1240,${altura}`, `--screenshot=${png}`, url], { stdio: 'ignore', timeout: 120000 });
  fs.rmSync(perfil, { recursive: true, force: true });
  if (r.status !== 0 || !fs.existsSync(png)) {
    console.log(`a captura falhou (código ${r.status}); o HTML foi gerado`);
    process.exit(1);
  }
  console.log(`captura: ${png}`);
}
