#!/usr/bin/env node
// Confere se um kit de modelo está completo e se o modelo.json é válido.
//
// Uso:
//   node conferir_kit.mjs <id-do-modelo | caminho-do-kit>
//   node conferir_kit.mjs --todos [pasta-de-modelos]
//
// Com um kit: sai 0 quando tudo existe e o modelo.json está certo; sai 1 listando o que falta.
// Também conta a entrevista curta (12 perguntas base - puladas + acrescentadas) e reprova fora de 8 a 12.
// Modelo de família (com "temas"): confere os temas, o tema recomendado, a pergunta "tema" e a de cores.
// Modelo com mais de uma receita ("receitas"): confere a lista, que inclui a "receita" padrão.
// Com --todos: confere cada kit da pasta (padrão: modelos/ da skill) e compara as dependências
// dos package.json de base/ entre os kits; sai 1 se alguma divergir.
// Node puro, sem dependência.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(AQUI, '..');
const MODELOS = path.join(SKILL, 'modelos');

export const TIPOS = ['personagens', 'sem-personagem', 'pixel'];
export const RECEITAS = ['vozes-por-fala', 'narradora-unica', 'narracao-inteira', 'sprites-por-som', 'texto-e-musica'];
export const ORIGENS = ['skill', 'local'];

const ARQUIVOS = [
  'modelo.json',
  'FICHA-DO-MODELO.md',
  'PERGUNTAS.md',
  'RECEITA.md',
  'vitrine/vitrine.json',
  'base/package.json',
  'base/BRANDBOOK-ANIMACAO.md',
  'teste/respostas.json',
];
const PASTAS = ['base'];

const lerJson = (arq, erros) => {
  try {
    return JSON.parse(fs.readFileSync(arq, 'utf8'));
  } catch (e) {
    erros.push(`${arq}: JSON inválido (${e.message})`);
    return null;
  }
};

const ehTexto = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * Família (modelo com vários temas): "temas" (id, nome, resumo, cor_troca, cores_trocaveis) e "tema_recomendado".
 * A entrevista tem a pergunta de id "tema" (em trocar ou acrescentar) e mantém a de cores (9 fora de pular).
 * Se o opcoes.json de base/componentes/ tiver "paletas", cada tema tem a sua, com os mesmos papéis, e os
 * cores_trocaveis são papéis dela. A miniatura de cada tema na vitrine (tema-<id>.jpg) falta só como aviso.
 */
const conferirFamilia = (dir, m, erros, avisos) => {
  if (!Array.isArray(m.temas) || m.temas.length < 2) {
    erros.push('modelo.json: "temas" deve ser lista com 2 temas ou mais (modelo de família)');
    return;
  }
  const op = path.join(dir, 'base', 'componentes', 'opcoes.json');
  let paletas = null;
  if (fs.existsSync(op)) {
    try {
      const o = JSON.parse(fs.readFileSync(op, 'utf8'));
      if (o && o.paletas && typeof o.paletas === 'object') paletas = o.paletas;
    } catch {
      // o JSON inválido não é desta conferência
    }
  }
  const papeisDe = (id) => (paletas && paletas[id] && typeof paletas[id] === 'object' ? Object.keys(paletas[id]) : null);
  const ids = [];
  let referencia = null;
  m.temas.forEach((t, i) => {
    const onde = `modelo.json: temas[${i}]`;
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      erros.push(`${onde}: objeto (id, nome, resumo, cor_troca, cores_trocaveis)`);
      return;
    }
    if (!ehTexto(t.id) || !/^[a-z0-9][a-z0-9-]*$/.test(t.id)) erros.push(`${onde}.id: obrigatório, minúsculas, números e hífen`);
    else if (ids.includes(t.id)) erros.push(`${onde}.id: "${t.id}" repetido`);
    else ids.push(t.id);
    for (const c of ['nome', 'resumo', 'cor_troca']) if (!ehTexto(t[c])) erros.push(`${onde}.${c}: obrigatório (texto)`);
    const tr = t.cores_trocaveis;
    if (!Array.isArray(tr) || tr.length === 0 || tr.some((x) => !ehTexto(x))) erros.push(`${onde}.cores_trocaveis: lista dos papéis de cor que a resposta de cores pode trocar neste tema`);
    else if (new Set(tr).size !== tr.length) erros.push(`${onde}.cores_trocaveis: papel repetido`);
    if (paletas && ehTexto(t.id)) {
      const papeis = papeisDe(t.id);
      if (!papeis) erros.push(`base/componentes/opcoes.json: falta a paleta do tema "${t.id}" em "paletas"`);
      else {
        if (referencia === null) referencia = papeis;
        else if (papeis.join(',') !== referencia.join(',')) erros.push(`base/componentes/opcoes.json: a paleta do tema "${t.id}" não tem os mesmos papéis, na mesma ordem, da primeira (${referencia.join(', ')})`);
        if (Array.isArray(tr)) for (const p of tr) if (ehTexto(p) && !papeis.includes(p)) erros.push(`${onde}.cores_trocaveis: "${p}" não é papel da paleta do tema (aceitos: ${papeis.join(', ')})`);
      }
    }
    if (ehTexto(t.id) && !fs.existsSync(path.join(dir, 'vitrine', `tema-${t.id}.jpg`))) avisos.push(`vitrine/tema-${t.id}.jpg (miniatura do tema) ainda não existe: gere com gerar_vitrine.mjs`);
  });
  if (!ehTexto(m.tema_recomendado)) erros.push(`modelo.json: família precisa de "tema_recomendado" (o id de um dos temas: ${ids.join(', ')})`);
  else if (!ids.includes(m.tema_recomendado)) erros.push(`modelo.json: "tema_recomendado" é "${m.tema_recomendado}", que não está em "temas" (aceitos: ${ids.join(', ')})`);
  const pg = m.perguntas;
  if (pg && typeof pg === 'object' && !Array.isArray(pg)) {
    const trocar = pg.trocar && typeof pg.trocar === 'object' && !Array.isArray(pg.trocar) ? Object.values(pg.trocar) : [];
    const acrescentar = Array.isArray(pg.acrescentar) ? pg.acrescentar : [];
    if (![...trocar, ...acrescentar].includes('tema')) erros.push('modelo.json: família precisa da pergunta de id "tema" em "perguntas.trocar" ou "perguntas.acrescentar" (a pessoa escolhe o tema na entrevista)');
    if (Array.isArray(pg.pular) && pg.pular.includes(9)) erros.push('modelo.json: família não pode pular a pergunta 9 (cores): a cor de cada tema se escolhe nela');
  }
};

/** Confere um kit. Devolve { erros, avisos, pacote } (pacote = package.json de base/). */
export const conferirKit = (dir) => {
  const erros = [];
  const avisos = [];
  let total = null;
  for (const p of PASTAS) {
    if (!fs.existsSync(path.join(dir, p)) || !fs.statSync(path.join(dir, p)).isDirectory()) erros.push(`falta a pasta ${p}/`);
  }
  for (const a of ARQUIVOS) {
    if (!fs.existsSync(path.join(dir, a))) erros.push(`falta o arquivo ${a}`);
  }

  const mjPath = path.join(dir, 'modelo.json');
  if (fs.existsSync(mjPath)) {
    const m = lerJson(mjPath, erros);
    if (m) {
      for (const c of ['id', 'nome', 'versao', 'origem', 'tipo', 'receita', 'resumo', 'criado_em']) {
        if (!ehTexto(m[c])) erros.push(`modelo.json: campo obrigatório "${c}" ausente ou vazio`);
      }
      if (ehTexto(m.id) && m.id !== path.basename(dir)) {
        erros.push(`modelo.json: "id" é "${m.id}" mas a pasta do kit se chama "${path.basename(dir)}"`);
      }
      if (ehTexto(m.tipo) && !TIPOS.includes(m.tipo)) erros.push(`modelo.json: "tipo" inválido "${m.tipo}" (aceitos: ${TIPOS.join(', ')})`);
      if (ehTexto(m.receita) && !RECEITAS.includes(m.receita)) erros.push(`modelo.json: "receita" inválida "${m.receita}" (aceitas: ${RECEITAS.join(', ')})`);
      // receitas que o kit declara (opcional): a pessoa escolhe uma delas na entrevista; a "receita" é a padrão
      if (m.receitas !== undefined) {
        if (!Array.isArray(m.receitas) || m.receitas.length === 0 || m.receitas.some((x) => !ehTexto(x))) erros.push('modelo.json: "receitas" deve ser lista com as receitas que o kit declara (ex.: ["vozes-por-fala", "texto-e-musica"])');
        else {
          for (const x of m.receitas) if (!RECEITAS.includes(x)) erros.push(`modelo.json: "receitas" tem "${x}", que não existe (aceitas: ${RECEITAS.join(', ')})`);
          if (new Set(m.receitas).size !== m.receitas.length) erros.push('modelo.json: "receitas" tem receita repetida');
          if (ehTexto(m.receita) && !m.receitas.includes(m.receita)) erros.push(`modelo.json: a "receita" padrão "${m.receita}" precisa estar em "receitas" (${m.receitas.join(', ')})`);
        }
      }
      if (ehTexto(m.origem) && !ORIGENS.includes(m.origem)) erros.push(`modelo.json: "origem" inválida "${m.origem}" (aceitas: ${ORIGENS.join(', ')})`);
      if (ehTexto(m.versao) && !/^\d+\.\d+(\.\d+)?$/.test(m.versao)) erros.push(`modelo.json: "versao" deve ser como 1.0 (veio "${m.versao}")`);
      if (ehTexto(m.criado_em) && !/^\d{4}-\d{2}-\d{2}$/.test(m.criado_em)) erros.push(`modelo.json: "criado_em" deve ser AAAA-MM-DD (veio "${m.criado_em}")`);
      const pg = m.perguntas;
      if (!pg || typeof pg !== 'object' || Array.isArray(pg)) {
        erros.push('modelo.json: campo obrigatório "perguntas" ausente (objeto com pular, trocar e acrescentar)');
      } else {
        if (!Array.isArray(pg.pular) || pg.pular.some((n) => !Number.isInteger(n) || n < 1 || n > 12)) erros.push('modelo.json: "perguntas.pular" deve ser lista de números de 1 a 12');
        if (!pg.trocar || typeof pg.trocar !== 'object' || Array.isArray(pg.trocar)) erros.push('modelo.json: "perguntas.trocar" deve ser objeto (número da pergunta: nova pergunta)');
        if (!Array.isArray(pg.acrescentar) || pg.acrescentar.some((x) => !ehTexto(x))) erros.push('modelo.json: "perguntas.acrescentar" deve ser lista de textos');
        const pular = Array.isArray(pg.pular) ? pg.pular : [];
        const acrescentar = Array.isArray(pg.acrescentar) ? pg.acrescentar : [];
        if (pg.trocar && typeof pg.trocar === 'object' && !Array.isArray(pg.trocar)) {
          for (const [n, nova] of Object.entries(pg.trocar)) {
            const num = Number(n);
            if (!Number.isInteger(num) || num < 1 || num > 12) erros.push(`modelo.json: "perguntas.trocar" tem a chave "${n}" (use o número da pergunta, de 1 a 12)`);
            else if (pular.includes(num)) erros.push(`modelo.json: a pergunta ${num} está em "pular" e em "trocar"`);
            if (!ehTexto(nova)) erros.push(`modelo.json: "perguntas.trocar.${n}" deve ser o id da pergunta nova`);
          }
        }
        if (new Set(pular).size !== pular.length) erros.push('modelo.json: "perguntas.pular" tem número repetido');
        // a entrevista curta tem as 12 perguntas base, menos as puladas, mais as acrescentadas (trocar não muda a conta)
        total = 12 - new Set(pular).size + acrescentar.length;
        if (total < 8 || total > 12) {
          erros.push(`entrevista curta com ${total} perguntas (12 - ${new Set(pular).size} puladas + ${acrescentar.length} acrescentadas): precisa ficar entre 8 e 12`);
        }
        // cada pergunta trocada ou acrescentada precisa estar descrita no PERGUNTAS.md
        const pgMd = path.join(dir, 'PERGUNTAS.md');
        if (fs.existsSync(pgMd)) {
          const texto = fs.readFileSync(pgMd, 'utf8');
          const ids = [...acrescentar, ...Object.values(pg.trocar && typeof pg.trocar === 'object' ? pg.trocar : {})].filter(ehTexto);
          for (const id of ids) if (!texto.includes(id)) erros.push(`PERGUNTAS.md não descreve a pergunta "${id}" (citada em modelo.json)`);
        }
      }
      if (m.temas !== undefined) conferirFamilia(dir, m, erros, avisos);
      else if (m.tema_recomendado !== undefined) erros.push('modelo.json: "tema_recomendado" sem "temas" (só modelo de família tem tema)');
      if (!Array.isArray(m.termos_proibidos) || m.termos_proibidos.some((x) => !ehTexto(x))) {
        erros.push('modelo.json: "termos_proibidos" deve ser lista de textos');
      } else if (m.origem === 'skill' && m.termos_proibidos.length === 0) {
        erros.push('modelo.json: modelo da skill precisa de "termos_proibidos" (só modelo local pode ter lista vazia)');
      }
      if (!Array.isArray(m.stills_prova) || m.stills_prova.length === 0 || m.stills_prova.some((x) => !ehTexto(x))) {
        erros.push('modelo.json: "stills_prova" deve ser lista de ids de still');
      }
      // termos_proibidos fica numa linha só: o conferir_neutro.mjs pula essa linha ao varrer o kit
      const linhas = fs.readFileSync(mjPath, 'utf8').split('\n');
      const iT = linhas.findIndex((l) => l.includes('"termos_proibidos"'));
      if (iT >= 0 && !linhas[iT].includes(']')) erros.push('modelo.json: "termos_proibidos" precisa ficar numa linha só (o conferir_neutro pula essa linha)');
    }
  }

  const vjPath = path.join(dir, 'vitrine', 'vitrine.json');
  if (fs.existsSync(vjPath)) {
    const v = lerJson(vjPath, erros);
    if (v) {
      for (const c of ['nome_exibicao', 'frase', 'exemplo']) if (!ehTexto(v[c])) erros.push(`vitrine/vitrine.json: campo obrigatório "${c}" ausente ou vazio`);
      if (!v.arquivos || typeof v.arquivos !== 'object') {
        erros.push('vitrine/vitrine.json: campo obrigatório "arquivos" ausente');
      } else {
        for (const [k, nome] of Object.entries(v.arquivos)) {
          if (!fs.existsSync(path.join(dir, 'vitrine', String(nome)))) avisos.push(`vitrine/${nome} (${k}) ainda não existe: gere com gerar_vitrine.mjs`);
        }
      }
    }
  }

  const rpPath = path.join(dir, 'teste', 'respostas.json');
  if (fs.existsSync(rpPath)) lerJson(rpPath, erros);

  let pacote = null;
  const pkPath = path.join(dir, 'base', 'package.json');
  if (fs.existsSync(pkPath)) {
    pacote = lerJson(pkPath, erros);
    if (pacote) {
      const deps = { ...(pacote.dependencies || {}), ...(pacote.devDependencies || {}) };
      const rem = Object.entries(deps).filter(([n]) => n === 'remotion' || n.startsWith('@remotion/'));
      if (!deps.remotion) erros.push('base/package.json: falta a dependência "remotion"');
      const versoes = new Set(rem.map(([, v]) => v));
      if (versoes.size > 1) erros.push(`base/package.json: remotion e @remotion/* com versões diferentes (${[...versoes].join(', ')})`);
      for (const [n, v] of rem) if (!/^\d+\.\d+\.\d+$/.test(v)) erros.push(`base/package.json: "${n}" precisa de versão fixa (veio "${v}")`);
      for (const n of ['react', 'react-dom', 'typescript', '@types/react']) {
        if (!deps[n]) erros.push(`base/package.json: falta a dependência "${n}"`);
        else if (!/^\d+\.\d+\.\d+$/.test(deps[n])) erros.push(`base/package.json: "${n}" precisa de versão fixa (veio "${deps[n]}")`);
      }
    }
  }
  return { erros, avisos, pacote, total };
};

const resolverKit = (arg) => {
  if (fs.existsSync(arg) && fs.statSync(arg).isDirectory()) return path.resolve(arg);
  return path.join(MODELOS, arg);
};

const imprimir = (nome, { erros, avisos, total }) => {
  for (const a of avisos) console.log(`  aviso: ${a}`);
  if (erros.length === 0) {
    console.log(`ok: kit ${nome} completo${total !== null ? ` (entrevista curta com ${total} perguntas)` : ''}`);
  } else {
    console.log(`kit ${nome} com ${erros.length} problema(s):`);
    for (const e of erros) console.log(`  - ${e}`);
  }
};

const principal = () => {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--ajuda')) {
    console.log('Uso: node conferir_kit.mjs <id-do-modelo | caminho-do-kit>\n     node conferir_kit.mjs --todos [pasta-de-modelos]');
    process.exit(args.length === 0 ? 1 : 0);
  }
  if (args[0] === '--todos') {
    const pasta = path.resolve(args[1] || MODELOS);
    if (!fs.existsSync(pasta)) {
      console.log(`pasta de modelos não encontrada: ${pasta}`);
      process.exit(1);
    }
    const kits = fs
      .readdirSync(pasta, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(pasta, d.name, 'modelo.json')))
      .map((d) => d.name)
      .sort();
    if (kits.length === 0) {
      console.log(`nenhum kit em ${pasta}`);
      process.exit(1);
    }
    let falhou = false;
    const deps = {};
    for (const k of kits) {
      const r = conferirKit(path.join(pasta, k));
      imprimir(k, r);
      if (r.erros.length) falhou = true;
      if (r.pacote) deps[k] = { ...(r.pacote.dependencies || {}), ...(r.pacote.devDependencies || {}) };
    }
    // versões iguais entre kits: cada dependência que aparece em mais de um kit tem de ter a mesma versão
    const porDep = {};
    for (const [k, d] of Object.entries(deps)) for (const [n, v] of Object.entries(d)) (porDep[n] ||= []).push([k, v]);
    const divergentes = Object.entries(porDep).filter(([, l]) => new Set(l.map(([, v]) => v)).size > 1);
    if (divergentes.length) {
      falhou = true;
      console.log('dependências com versões diferentes entre kits:');
      for (const [n, l] of divergentes) console.log(`  - ${n}: ${l.map(([k, v]) => `${k}=${v}`).join(', ')}`);
    } else {
      console.log(`ok: dependências iguais nos ${kits.length} kit(s) (${kits.join(', ')})`);
    }
    process.exit(falhou ? 1 : 0);
  }
  const dir = resolverKit(args[0]);
  if (!fs.existsSync(dir)) {
    console.log(`kit não encontrado: ${args[0]} (procurado em ${dir})`);
    process.exit(1);
  }
  const r = conferirKit(dir);
  imprimir(path.basename(dir), r);
  process.exit(r.erros.length ? 1 : 0);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
