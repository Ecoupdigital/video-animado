#!/usr/bin/env node
// Confere se a skill roda igual no Mac e no Linux.
//
// Uso: node conferir_portabilidade.mjs <pasta>
//
// Em código (.sh .mjs .js .cjs .ts .tsx .py .json):
//   - caminho de máquina (/var/lib/openbot, /home/, /root/, /Users/) fora da lista de detecção
//     do preparar_motor.sh (linhas entre "# deteccao:inicio" e "# deteccao:fim");
//   - setBrowserExecutable sem a condição process.platform === 'linux';
//   - zsh chamado por script; sips usado sem alternativa (command -v sips ou shutil.which).
// Em script shell (.sh), também:
//   - primeira linha diferente de #!/usr/bin/env bash; erro de sintaxe em bash -n;
//   - recurso de bash 4 (declare -A, mapfile, readarray, ${x,,}, ${x^^}, globstar) ou glob de zsh.
// Em documentação (.md .html) as mesmas ocorrências viram só aviso.
// O próprio conferir_portabilidade.mjs fica de fora (contém as palavras que procura).
// Sai 1 se houver erro; 0 se só houver avisos ou nada.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const EU = fileURLToPath(import.meta.url);
const CODIGO = new Set(['.sh', '.mjs', '.js', '.cjs', '.ts', '.tsx', '.py', '.json']);
const DOCS = new Set(['.md', '.html']);
const PULAR = new Set(['node_modules', '.git', 'out', 'frames', 'videos']);

// montados por partes para este arquivo não se acusar
const CAMINHOS = [['/var', '/lib/openbot'], ['/ho', 'me/'], ['/ro', 'ot/'], ['/Us', 'ers/']].map((p) => p.join(''));
const BASH4 = [
  [/\bdeclare\s+-[a-zA-Z]*A/, 'declare -A (bash 4)'],
  [/\b(local|typeset)\s+-[a-zA-Z]*A\b/, 'array associativo (bash 4)'],
  [/\bmapfile\b/, 'mapfile (bash 4)'],
  [/\breadarray\b/, 'readarray (bash 4)'],
  [/\$\{[A-Za-z_][A-Za-z0-9_]*(\[[^\]]*\])?(,,?|\^\^?)\}/, '${x,,} ou ${x^^} (bash 4)'],
  [/shopt\s+-s\s+globstar/, 'globstar (bash 4)'],
  [/\bsetopt\b/, 'setopt (zsh)'],
];

const args = process.argv.slice(2);
if (args.length !== 1 || args[0].startsWith('-')) {
  console.log('Uso: node conferir_portabilidade.mjs <pasta>');
  process.exit(1);
}
const raiz = path.resolve(args[0]);
if (!fs.existsSync(raiz) || !fs.statSync(raiz).isDirectory()) {
  console.log(`pasta não encontrada: ${args[0]}`);
  process.exit(1);
}

const erros = [];
const avisos = [];
const rel = (p) => path.relative(process.cwd(), p);
const ehComentario = (l, ext) => {
  const t = l.trim();
  if (ext === '.sh' || ext === '.py') return t.startsWith('#');
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
};

const conferirArquivo = (p) => {
  const ext = path.extname(p).toLowerCase();
  const doc = DOCS.has(ext);
  if (!doc && !CODIGO.has(ext)) return;
  const texto = fs.readFileSync(p, 'utf8');
  const linhas = texto.split('\n');
  const anotar = (i, motivo) => (doc ? avisos : erros).push(`${rel(p)}:${i + 1}: ${motivo}`);

  let naDeteccao = false;
  const temAlternativaSips = /command -v sips|which sips|shutil\.which\(\s*['"]sips/.test(texto);
  linhas.forEach((l, i) => {
    if (ext === '.sh' && l.includes('# deteccao:inicio')) naDeteccao = true;
    if (ext === '.sh' && l.includes('# deteccao:fim')) {
      naDeteccao = false;
      return;
    }
    if (!naDeteccao) for (const c of CAMINHOS) if (l.includes(c)) anotar(i, `caminho de máquina "${c}"`);
    if (!doc && !ehComentario(l, ext)) {
      if (/\bzsh\b/.test(l)) anotar(i, 'chama zsh (use bash)');
      if (/\bsips\b/.test(l) && !temAlternativaSips) anotar(i, 'sips sem alternativa (só existe no Mac)');
    }
    if (doc) {
      if (/\bsips\b/.test(l)) anotar(i, 'cita sips (só existe no Mac)');
      if (/\bzsh\b/.test(l)) anotar(i, 'cita zsh');
    }
  });
  if (!doc && texto.includes('setBrowserExecutable') && !/process\.platform\s*===\s*['"]linux['"]/.test(texto)) {
    erros.push(`${rel(p)}: setBrowserExecutable sem a condição process.platform === 'linux'`);
  }

  if (ext === '.sh') {
    if (linhas[0] !== '#!/usr/bin/env bash') erros.push(`${rel(p)}:1: primeira linha deve ser #!/usr/bin/env bash (veio "${linhas[0]}")`);
    const r = spawnSync('bash', ['-n', p], { encoding: 'utf8' });
    if (r.status !== 0) erros.push(`${rel(p)}: bash -n falhou: ${(r.stderr || '').trim()}`);
    linhas.forEach((l, i) => {
      if (ehComentario(l, ext)) return;
      for (const [re, motivo] of BASH4) if (re.test(l)) erros.push(`${rel(p)}:${i + 1}: ${motivo}`);
      if (/(^|\s)[^\s'"]*\*\*\/[^\s'"]*/.test(l)) erros.push(`${rel(p)}:${i + 1}: glob ** (zsh ou globstar do bash 4)`);
    });
  }
};

const varrer = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!PULAR.has(e.name)) varrer(p);
    } else if (e.isFile() && p !== EU && e.name !== path.basename(EU)) {
      // o próprio conferidor (e cópias dele) contém as palavras que procura
      conferirArquivo(p);
    }
  }
};
varrer(raiz);

for (const a of avisos) console.log(`aviso: ${a}`);
if (erros.length) {
  for (const e of erros) console.log(`erro: ${e}`);
  console.log(`${erros.length} problema(s) de portabilidade`);
  process.exit(1);
}
console.log(`ok: ${rel(raiz) || '.'} portável (${avisos.length} aviso(s) em documentação)`);
