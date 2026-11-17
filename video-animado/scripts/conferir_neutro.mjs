#!/usr/bin/env node
// Procura termo proibido (nome de marca ou pessoa do exemplo) num kit ou num universo.
//
// Uso: node conferir_neutro.mjs <pasta> [--termos a,b,c]
//
// Termos: a lista padrão abaixo, mais os "termos_proibidos" do modelo.json da pasta (se houver),
// mais os de --termos; num universo, também os do kit de origem (pelo .modelo.json).
// Conta por palavra inteira, sem diferença de caixa.
// Ignora vitrine/ e videos/ (únicos lugares onde o exemplo pode aparecer), node_modules/, out/
// e arquivos binários. No modelo.json, a linha de "termos_proibidos" é pulada (é a própria lista).
// Sai 1 e imprime arquivo:linha:termo para cada achado; sai 0 se nada for achado.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PADRAO = ['Ciclua', 'Nina', 'Carol', 'NVIDIA', 'Jensen', 'Jonathan', 'jonathanrenan', 'FEBRASGO', 'Caderneta', 'gestante'];
const PULAR_PASTAS = new Set(['vitrine', 'videos', 'node_modules', '.git', 'out', 'frames']);
const BINARIOS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.mp3', '.wav', '.m4a', '.mov', '.ttf', '.otf', '.woff', '.woff2', '.ico', '.pdf', '.zip', '.safetensors']);

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('-')) {
  console.log('Uso: node conferir_neutro.mjs <pasta> [--termos a,b,c]');
  process.exit(1);
}
const raiz = path.resolve(args[0]);
if (!fs.existsSync(raiz) || !fs.statSync(raiz).isDirectory()) {
  console.log(`pasta não encontrada: ${args[0]}`);
  process.exit(1);
}
const termos = new Set(PADRAO);
const iT = args.indexOf('--termos');
if (iT >= 0) {
  if (!args[iT + 1]) {
    console.log('--termos precisa de uma lista separada por vírgula');
    process.exit(1);
  }
  for (const t of args[iT + 1].split(',')) if (t.trim()) termos.add(t.trim());
}
const mj = path.join(raiz, 'modelo.json');
if (fs.existsSync(mj)) {
  try {
    const m = JSON.parse(fs.readFileSync(mj, 'utf8'));
    for (const t of m.termos_proibidos || []) termos.add(String(t));
  } catch {
    console.log('aviso: modelo.json ilegível, usando só a lista padrão');
  }
}

// universo: o .modelo.json diz de que kit veio; os termos proibidos desse kit também valem aqui
// (kit no estúdio do universo ou nos modelos da skill; modelo local segue baseado_em.modelo)
const origem = path.join(raiz, '.modelo.json');
if (fs.existsSync(origem)) {
  const skill = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const animacao = path.dirname(raiz);
  const estudio = path.basename(animacao) === 'animacao' ? path.dirname(animacao) : null;
  const vistos = new Set();
  let id = null;
  try {
    id = JSON.parse(fs.readFileSync(origem, 'utf8')).id ?? null;
  } catch {
    console.log('aviso: .modelo.json ilegível, sem os termos do kit de origem');
  }
  while (id && !vistos.has(id)) {
    vistos.add(id);
    const kit = [...(estudio ? [path.join(estudio, 'modelos', id)] : []), path.join(skill, 'modelos', id)].find((c) => fs.existsSync(path.join(c, 'modelo.json')));
    if (!kit) break;
    const m = JSON.parse(fs.readFileSync(path.join(kit, 'modelo.json'), 'utf8'));
    for (const t of m.termos_proibidos || []) termos.add(String(t));
    id = m.baseado_em?.modelo ?? null;
  }
}

const escapar =(s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// palavra inteira com letras acentuadas: nada de letra, número ou _ colado antes ou depois
const regras = [...termos].map((t) => [t, new RegExp(`(?<![\\p{L}\\p{N}_])${escapar(t)}(?![\\p{L}\\p{N}_])`, 'iu')]);

const achados = [];
const varrer = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!PULAR_PASTAS.has(e.name)) varrer(p);
      continue;
    }
    if (!e.isFile()) continue;
    if (BINARIOS.has(path.extname(e.name).toLowerCase())) continue;
    const texto = fs.readFileSync(p, 'utf8');
    if (texto.includes('\u0000')) continue;
    const ehManifesto = e.name === 'modelo.json';
    texto.split('\n').forEach((linha, i) => {
      if (ehManifesto && linha.includes('"termos_proibidos"')) return;
      for (const [t, re] of regras) if (re.test(linha)) achados.push(`${path.relative(process.cwd(), p)}:${i + 1}:${t}`);
    });
  }
};
varrer(raiz);

if (achados.length) {
  for (const a of achados) console.log(a);
  console.log(`${achados.length} termo(s) proibido(s) fora de vitrine/ e videos/`);
  process.exit(1);
}
console.log(`ok: nenhum termo proibido em ${path.relative(process.cwd(), raiz) || '.'} (${termos.size} termos conferidos)`);
