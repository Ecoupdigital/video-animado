#!/usr/bin/env node
// Gera a vitrine de um modelo: folha de frames da prévia, still do elenco e um trecho de vídeo mudo.
//
// Uso: node gerar_vitrine.mjs <id-do-modelo | caminho-do-kit> [--estudio P]
//
// Monta um universo temporário a partir do kit (novo_universo.mjs), aplica vitrine/exemplo.json
// (ou teste/respostas.json, se o kit não tiver exemplo), liga o motor (preparar_motor.sh, que
// respeita VIDEO_ANIMADO_MOTOR), faz a prévia sem voz do roteiro vitrine/roteiro-falas.json
// (ou teste/roteiro-falas.json) e grava em <kit>/vitrine/:
//   folha.jpg    frames da prévia (previa.sh) lado a lado, um por fala e um no fecho
//   elenco.jpg   o still "elenco" do _preview
//   trecho.mp4   de 4 a 6 s da prévia, H.264, sem áudio, até 2 MB
//   tema-<id>.jpg  só no modelo de família (com "temas" no modelo.json): a miniatura de cada tema, do still
//                  tema-<id>, até ~150 KB; a folha, as peças e o trecho saem no tema recomendado
// O universo temporário nasce em <P>/animacao/ (padrão: uma pasta temporária do sistema) e é
// apagado no fim, inclusive quando algo falha. Com --estudio, o id é procurado primeiro em
// <P>/modelos/ (modelo local) e depois nos modelos da skill.
// Sai 1 se algum passo falhar ou se o trecho passar de 2 MB.
// Node puro, sem dependência. Precisa de ffmpeg, python3 (com numpy) e do Chrome do Remotion.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(AQUI, '..');
const LIMITE_TRECHO = 2 * 1024 * 1024;
const LIMITE_JPG = 300 * 1024;
const LIMITE_MINIATURA = 150 * 1024;

const args = process.argv.slice(2);
const iE = args.indexOf('--estudio');
const estudioArg = iE >= 0 ? args[iE + 1] : null;
const pos = args.filter((a, i) => !(i === iE || i === iE + 1) && !a.startsWith('--'));
if (pos.length !== 1 || (iE >= 0 && !estudioArg)) {
  console.log('Uso: node gerar_vitrine.mjs <id-do-modelo | caminho-do-kit> [--estudio P]');
  process.exit(1);
}

const lerJson = (arq) => JSON.parse(fs.readFileSync(arq, 'utf8'));
const tamanho = (arq) => fs.statSync(arq).size;
const kb = (n) => `${Math.round(n / 1024)} KB`;

const acharKit = (modelo, estudio) => {
  if (fs.existsSync(path.join(modelo, 'modelo.json'))) return path.resolve(modelo);
  const candidatos = [...(estudio ? [path.join(estudio, 'modelos', modelo)] : []), path.join(SKILL, 'modelos', modelo)];
  return candidatos.find((c) => fs.existsSync(path.join(c, 'modelo.json')));
};

const rodar = (cmd, argv, opcoes = {}) => {
  const r = spawnSync(cmd, argv, { stdio: 'inherit', ...opcoes });
  if (r.error) throw new Error(`${cmd} não rodou (${r.error.message})`);
  if (r.status !== 0) throw new Error(`${cmd} ${argv.slice(0, 3).join(' ')} saiu com código ${r.status}`);
};
const ffmpeg = (argv) => rodar('ffmpeg', ['-v', 'error', '-y', ...argv]);

/** Converte uma imagem para JPG com a largura máxima dada, baixando a qualidade até ficar abaixo do limite (300 KB). */
const paraJpg = (origem, destino, largura, limite = LIMITE_JPG) => {
  for (const [w, q] of [[largura, 3], [largura, 5], [Math.round(largura * 0.8), 6], [Math.round(largura * 0.65), 8]]) {
    ffmpeg(['-i', origem, '-vf', `scale='min(${w},iw)':-2`, '-q:v', String(q), destino]);
    if (tamanho(destino) <= limite) return;
  }
  console.log(`aviso: ${path.basename(destino)} ficou com ${kb(tamanho(destino))} (acima de ${kb(limite)})`);
};

const kit = acharKit(pos[0], estudioArg ? path.resolve(estudioArg) : null);
if (!kit) {
  console.log(`modelo "${pos[0]}" não encontrado${estudioArg ? ` (procurado em ${path.join(path.resolve(estudioArg), 'modelos')} e` : ' (procurado'} nos modelos da skill)`);
  process.exit(1);
}
const modelo = lerJson(path.join(kit, 'modelo.json'));
const temas = Array.isArray(modelo.temas) ? modelo.temas.filter((t) => t && t.id) : [];
const vitrine = path.join(kit, 'vitrine');
const primeiro = (...rels) => rels.map((r) => path.join(kit, r)).find((p) => fs.existsSync(p));
const respostasOrigem = primeiro('vitrine/exemplo.json', 'teste/respostas.json');
const roteiroOrigem = primeiro('vitrine/roteiro-falas.json', 'teste/roteiro-falas.json');
if (!respostasOrigem) {
  console.log(`o kit ${modelo.id} não tem vitrine/exemplo.json nem teste/respostas.json`);
  process.exit(1);
}
if (!roteiroOrigem) {
  console.log(`o kit ${modelo.id} não tem vitrine/roteiro-falas.json nem teste/roteiro-falas.json ([{"quem": "<id>", "texto": "..."}])`);
  process.exit(1);
}
for (const cmd of [['ffmpeg', ['-version']], ['python3', ['--version']]]) {
  if (spawnSync(cmd[0], cmd[1], { stdio: 'ignore' }).status !== 0) {
    console.log(`falta ${cmd[0]} (instale e rode de novo)`);
    process.exit(1);
  }
}
let vj = {};
if (fs.existsSync(path.join(vitrine, 'vitrine.json'))) vj = lerJson(path.join(vitrine, 'vitrine.json'));
const nomes = { folha: 'folha.jpg', elenco: 'elenco.jpg', trecho: 'trecho.mp4', ...(vj.arquivos ?? {}) };

// ---------------------------------------------------------------- universo temporário

const estudio = estudioArg ? path.resolve(estudioArg) : fs.mkdtempSync(path.join(os.tmpdir(), 'video-animado-vitrine-'));
const animacaoExistia = fs.existsSync(path.join(estudio, 'animacao'));
const pasta = `vitrine-${modelo.id}-${process.pid}`;
const universo = path.join(estudio, 'animacao', pasta);
const limpar = () => {
  try {
    // node_modules do universo é cp -al ou link: apagar só desfaz os links, o motor de origem fica intacto
    fs.rmSync(universo, { recursive: true, force: true });
    if (!estudioArg) fs.rmSync(estudio, { recursive: true, force: true });
    else if (!animacaoExistia) fs.rmdirSync(path.join(estudio, 'animacao'));
  } catch {
    // a pasta já foi apagada ou não está vazia; nada a fazer
  }
};
for (const sinal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sinal, () => {
    limpar();
    process.exit(1);
  });
}

const gerar = () => {
  const node = process.execPath;
  rodar(node, [path.join(AQUI, 'novo_universo.mjs'), kit, estudio, pasta, '--forcar']);
  const respostas = lerJson(respostasOrigem);
  respostas.modelo = modelo.id;
  // família: a vitrine sai no tema recomendado (as miniaturas mostram os outros)
  if (temas.length) respostas.tema = modelo.tema_recomendado;
  fs.writeFileSync(path.join(universo, 'respostas.json'), JSON.stringify(respostas, null, 2) + '\n');
  rodar(node, [path.join(AQUI, 'novo_universo.mjs'), '--aplicar', universo]);
  rodar('bash', [path.join(AQUI, 'preparar_motor.sh'), universo]);

  // elenco
  const tmp = path.join(universo, '_vitrine');
  fs.mkdirSync(tmp, { recursive: true });
  console.log('gerando o still elenco');
  rodar('npx', ['remotion', 'still', '_preview/src/index.ts', 'elenco', path.join(tmp, 'elenco.png'), '--log=error'], { cwd: universo });
  for (const t of temas) {
    console.log(`gerando o still tema-${t.id}`);
    rodar('npx', ['remotion', 'still', '_preview/src/index.ts', `tema-${t.id}`, path.join(tmp, `tema-${t.id}.png`), '--log=error'], { cwd: universo });
  }

  // prévia sem voz do roteiro do exemplo
  const ep = path.join(universo, 'videos', 'vitrine');
  fs.mkdirSync(ep, { recursive: true });
  fs.cpSync(path.join(universo, '_ferramentas', 'episodio-base', 'src'), path.join(ep, 'src'), { recursive: true });
  fs.copyFileSync(roteiroOrigem, path.join(ep, 'roteiro-falas.json'));
  rodar('python3', [path.join(universo, '_ferramentas', 'tempos_sem_voz.py'), ep], { cwd: universo });
  const falas = lerJson(path.join(ep, 'src', 'falas.json'));
  const fimFalas = Math.max(...falas.map((f) => f.fim));
  // um frame no meio de cada fala (até 5) e um no fecho, que começa 0,6 s depois da última fala
  const tempos = [...falas.slice(0, 5).map((f) => (f.ini + f.fim) / 2), fimFalas + 0.6 + 2].map((t) => t.toFixed(2));
  console.log(`prévia sem voz (frames em ${tempos.join(', ')} s)`);
  rodar('bash', [path.join(universo, '_ferramentas', 'previa.sh'), ep], { cwd: universo });
  const previa = path.join(ep, 'revisao', 'previa.mp4');
  // folha de frames da prévia, lado a lado, sem o tempo escrito (o previa.sh escreve; aqui é vitrine)
  const folhaPng = path.join(tmp, 'folha.png');
  ffmpeg([
    ...tempos.flatMap((t) => ['-ss', t, '-i', previa]),
    '-filter_complex',
    `${tempos.map((_, i) => `[${i}:v]trim=end_frame=1,scale=360:-2,pad=iw+12:ih:6:0:color=0xFAF8F5,setpts=PTS-STARTPTS[f${i}]`).join(';')};${tempos.map((_, i) => `[f${i}]`).join('')}hstack=inputs=${tempos.length}`,
    '-frames:v',
    '1',
    folhaPng,
  ]);

  // trecho: do começo até o fim da fala que termina mais perto de 5,5 s, entre 4 e 6 s
  const tv = vj.trecho ?? {};
  const inicio = Number(tv.inicio ?? 0);
  let duracao = Number(tv.duracao ?? 0);
  if (!duracao) {
    const fins = falas.map((f) => f.fim + 0.4 - inicio).filter((d) => d >= 4 && d <= 6);
    duracao = fins.length ? fins[fins.length - 1] : 5;
  }
  duracao = Math.min(6, Math.max(4, duracao));
  const trecho = path.join(tmp, 'trecho.mp4');
  ffmpeg(['-ss', String(inicio), '-t', duracao.toFixed(2), '-i', previa, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', trecho]);
  if (tamanho(trecho) > LIMITE_TRECHO) {
    throw new Error(`o trecho ficou com ${kb(tamanho(trecho))}, acima de 2 MB: encurte com "trecho": { "duracao": 4 } no vitrine.json`);
  }

  // grava na vitrine
  fs.mkdirSync(vitrine, { recursive: true });
  paraJpg(folhaPng, path.join(vitrine, nomes.folha), 1800);
  paraJpg(path.join(tmp, 'elenco.png'), path.join(vitrine, nomes.elenco), 1600);
  fs.copyFileSync(trecho, path.join(vitrine, nomes.trecho));
  for (const t of temas) paraJpg(path.join(tmp, `tema-${t.id}.png`), path.join(vitrine, `tema-${t.id}.jpg`), 540, LIMITE_MINIATURA);
  console.log(`ok: vitrine do modelo ${modelo.id} em ${path.relative(process.cwd(), vitrine) || vitrine}`);
  console.log(`  ${nomes.folha} ${kb(tamanho(path.join(vitrine, nomes.folha)))}`);
  console.log(`  ${nomes.elenco} ${kb(tamanho(path.join(vitrine, nomes.elenco)))}`);
  console.log(`  ${nomes.trecho} ${kb(tamanho(path.join(vitrine, nomes.trecho)))}, ${duracao.toFixed(2)} s, sem áudio`);
  for (const t of temas) console.log(`  tema-${t.id}.jpg ${kb(tamanho(path.join(vitrine, `tema-${t.id}.jpg`)))}`);
};

let codigo = 0;
try {
  gerar();
} catch (e) {
  console.log(`falhou: ${e.message}`);
  codigo = 1;
} finally {
  limpar();
}
process.exit(codigo);
