#!/usr/bin/env node
// Confere se a SKILL.md nova manteve o que os agentes já leem: a Parte B, as Armadilhas e as duas
// passagens do passo 0 que levam à Parte B (a frase de pular para a Parte B e o parágrafo
// "Universo que já tem episódios").
//
// Uso: node conferir_parte_b.mjs <SKILL.md antiga> <SKILL.md nova>
//
// Cada linha não vazia dessas partes na versão antiga precisa estar na nova, igual (só espaço no fim
// da linha é ignorado), dentro da mesma seção e na mesma ordem. Linha nova acrescentada no meio é
// permitida. Sai 1 listando cada linha que sumiu, mudou ou trocou de ordem; sai 0 se tudo bate.
// Node puro, sem dependência.

import fs from 'node:fs';

const SECOES = [
  {
    nome: 'passo 0',
    titulo: /^### 0\./,
    // só as duas passagens que levam à Parte B; o resto do passo 0 pode crescer
    filtro: (l) => l.includes('pule pra Parte B') || l.startsWith('**Universo que já tem episódios:**'),
  },
  { nome: 'Parte B', titulo: /^### Parte B\b/ },
  { nome: 'Armadilhas', titulo: /^## Armadilhas\b/ },
];

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Uso: node conferir_parte_b.mjs <SKILL.md antiga> <SKILL.md nova>');
  process.exit(1);
}
const ler = (arq) => {
  if (!fs.existsSync(arq)) {
    console.log(`arquivo não encontrado: ${arq}`);
    process.exit(1);
  }
  return fs.readFileSync(arq, 'utf8').split('\n').map((l) => l.replace(/\s+$/, ''));
};
const antigo = ler(args[0]);
const novo = ler(args[1]);

const nivel = (l) => (/^(#{1,6})\s/.exec(l) || [])[1]?.length ?? 0;

/** Linhas da seção: do título até o próximo título de nível igual ou maior, sem as vazias. */
const secao = (linhas, re) => {
  const i = linhas.findIndex((l) => re.test(l));
  if (i < 0) return null;
  const n = nivel(linhas[i]);
  const saida = [linhas[i]];
  for (let j = i + 1; j < linhas.length; j++) {
    const nj = nivel(linhas[j]);
    if (nj && nj <= n) break;
    if (linhas[j].trim()) saida.push(linhas[j]);
  }
  return saida;
};

const curto = (l) => (l.length > 110 ? `${l.slice(0, 107)}...` : l);
/** O pedaço da linha em volta da primeira diferença com a outra (linha longa cortada no começo e no fim). */
const trecho = (a, b) => {
  let d = 0;
  while (d < a.length && a[d] === b[d]) d++;
  const ini = Math.max(0, d - 50);
  const fim = Math.min(a.length, d + 60);
  return `${ini > 0 ? '...' : ''}${a.slice(ini, fim)}${fim < a.length ? '...' : ''}`;
};
// parecida = mesmo começo (as linhas daqui são longas e começam diferente umas das outras)
const parecida = (l, linhas) => linhas.find((x) => x !== l && x.slice(0, 30) === l.slice(0, 30));

const problemas = [];
const contagem = [];
for (const s of SECOES) {
  const velhas = secao(antigo, s.titulo);
  if (!velhas) {
    console.log(`aviso: a SKILL.md antiga não tem a seção ${s.nome}; nada a conferir nela`);
    continue;
  }
  const alvo = s.filtro ? velhas.filter(s.filtro) : velhas;
  const novas = secao(novo, s.titulo);
  if (!novas) {
    problemas.push(`${s.nome}: a seção sumiu da SKILL.md nova (título "${velhas[0]}")`);
    continue;
  }
  let cursor = 0;
  for (const l of alvo) {
    const k = novas.indexOf(l, cursor);
    if (k >= 0) {
      cursor = k + 1;
      continue;
    }
    if (novas.includes(l)) {
      problemas.push(`${s.nome}: trocou de ordem: "${curto(l)}"`);
      continue;
    }
    const p = parecida(l, novas);
    problemas.push(p ? `${s.nome}: linha mudou:\n      antes: "${trecho(l, p)}"\n      agora: "${trecho(p, l)}"` : `${s.nome}: linha sumiu: "${curto(l)}"`);
  }
  contagem.push(`${alvo.length} do ${s.nome}`.replace('do Armadilhas', 'das Armadilhas').replace('do Parte B', 'da Parte B'));
}

if (problemas.length) {
  console.log(`${problemas.length} linha(s) antiga(s) da Parte B, das Armadilhas ou do passo 0 não bate(m) com a SKILL.md nova:`);
  for (const p of problemas) console.log(`  - ${p}`);
  process.exit(1);
}
console.log(`ok: Parte B intacta (${contagem.join(', ')}; todas iguais e na mesma ordem)`);
