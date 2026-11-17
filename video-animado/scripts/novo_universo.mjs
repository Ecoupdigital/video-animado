#!/usr/bin/env node
// Cria um universo a partir de um modelo (kit) e aplica as respostas da entrevista curta.
//
// Uso:
//   node novo_universo.mjs <modelo> <estudio> <pasta> [--forcar]
//       copia base/ do kit para <estudio>/animacao/<pasta>/ e RECEITA.md para a raiz do universo.
//       <modelo> é o id (procura primeiro em <estudio>/modelos/, depois nos modelos da skill) ou o caminho do kit.
//       Recusa pasta que já existe, a não ser com --forcar.
//       Guarda o brandbook do kit, com as lacunas, em .brandbook-modelo.md (base para reaplicar).
//       Modelo local (origem "local") com teste/respostas.json: copia as respostas dele como ponto de partida.
//   node novo_universo.mjs --aplicar <universo>
//       lê <universo>/respostas.json, confere a parte comum (universo, marca, fecho, cores, proibições) e
//       passa o resto ao aplicador.mjs do kit de origem, que confere o que é do modelo e gera os arquivos
//       (modelo de família, com "temas" no modelo.json: a resposta "tema" é conferida aqui, contra a lista,
//       e cores.paleta só troca os papéis que o tema escolhido deixa trocar, "cores_trocaveis");
//       dele (componentes/universo.ts, personagens/<id>/Personagem.tsx e FICHA.md, personagens/index.ts);
//       se o aplicador exporta depois(), roda esse passo em seguida (o pixel gera ali os sprites do boneco);
//       refaz o BRANDBOOK-ANIMACAO.md a partir de
//       .brandbook-modelo.md com as lacunas {{chave}} preenchidas, mantendo o texto já escrito no lugar
//       das marcas <!-- ESCREVER: ... -->, e lista as marcas que faltam redigir. Pode rodar quantas
//       vezes quiser: com o mesmo respostas.json, o resultado é o mesmo.
//   node novo_universo.mjs --conferir <universo>
//       sai 1 se ainda sobrar {{ ou ESCREVER: no BRANDBOOK-ANIMACAO.md.
//
// Node puro, sem dependência. Sai 1 com mensagem dizendo o que falta.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(AQUI, '..');
const BRANDBOOK = 'BRANDBOOK-ANIMACAO.md';
const MODELO_BB = '.brandbook-modelo.md';
const VALORES_BB = '.brandbook-valores.json';

const falhar = (msg) => {
  console.log(msg);
  process.exit(1);
};
const lerJson = (arq) => {
  try {
    return JSON.parse(fs.readFileSync(arq, 'utf8'));
  } catch (e) {
    falhar(`${arq}: JSON inválido ou ausente (${e.message})`);
  }
};
const ehTexto = (v) => typeof v === 'string' && v.trim().length > 0;
const ehHex = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
const ehSlug = (v) => typeof v === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(v);
const hoje = () => new Date().toISOString().slice(0, 10);
const dataBr = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? iso.split('-').reverse().join('/') : iso);
const umaLinha = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const slug = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ---------------------------------------------------------------- copiar

const acharKit = (modelo, estudio) => {
  if (fs.existsSync(path.join(modelo, 'modelo.json'))) return path.resolve(modelo);
  const candidatos = [path.join(estudio, 'modelos', modelo), path.join(SKILL, 'modelos', modelo)];
  return candidatos.find((c) => fs.existsSync(path.join(c, 'modelo.json')));
};

const copiar = (modelo, estudio, pasta, forcar) => {
  if (!ehSlug(pasta)) falhar(`nome de pasta inválido "${pasta}": use letras minúsculas, números e hífen (ex.: sorriso-em-dia)`);
  const kit = acharKit(modelo, estudio);
  if (!kit) falhar(`modelo "${modelo}" não encontrado (procurado em ${path.join(estudio, 'modelos')} e nos modelos da skill)`);
  const m = lerJson(path.join(kit, 'modelo.json'));
  const base = path.join(kit, 'base');
  if (!fs.existsSync(base)) falhar(`o kit ${m.id} não tem a pasta base/`);
  if (!fs.existsSync(path.join(kit, 'RECEITA.md'))) falhar(`o kit ${m.id} não tem RECEITA.md`);
  const destino = path.join(estudio, 'animacao', pasta);
  if (fs.existsSync(destino) && !forcar) falhar(`a pasta ${destino} já existe. Escolha outro nome ou rode de novo com --forcar para copiar por cima.`);
  fs.mkdirSync(destino, { recursive: true });
  fs.cpSync(base, destino, {
    recursive: true,
    force: true,
    filter: (src) => !src.split(path.sep).includes('node_modules'),
  });
  fs.copyFileSync(path.join(kit, 'RECEITA.md'), path.join(destino, 'RECEITA.md'));
  // o brandbook com as lacunas fica guardado: é dele que o --aplicar refaz o brandbook a cada resposta nova
  if (fs.existsSync(path.join(base, BRANDBOOK))) fs.copyFileSync(path.join(base, BRANDBOOK), path.join(destino, MODELO_BB));
  fs.rmSync(path.join(destino, VALORES_BB), { force: true });
  const origem = { id: m.id, versao: m.versao, nome: m.nome, origem: m.origem, tipo: m.tipo, receita: m.receita, copiado_em: hoje() };
  fs.writeFileSync(path.join(destino, '.modelo.json'), JSON.stringify(origem, null, 2) + '\n');
  console.log(`ok: universo criado em ${destino} a partir do modelo ${m.id} ${m.versao}`);
  const rpTeste = path.join(kit, 'teste', 'respostas.json');
  if (m.origem === 'local' && fs.existsSync(rpTeste)) {
    const rp = lerJson(rpTeste);
    rp.modelo = m.id;
    rp.versao_modelo = m.versao;
    fs.writeFileSync(path.join(destino, 'respostas.json'), JSON.stringify(rp, null, 2) + '\n');
    console.log('respostas do modelo local copiadas para respostas.json: a entrevista curta só troca o que mudar');
  }
  console.log('próximo passo: gravar respostas.json na raiz do universo e rodar');
  console.log(`  node ${path.relative(process.cwd(), fileURLToPath(import.meta.url))} --aplicar ${path.relative(process.cwd(), destino)}`);
};

// ---------------------------------------------------------------- aplicador do kit
//
// O --aplicar tem uma parte comum (este arquivo: universo, marca, fecho, cores, proibições, brandbook,
// reaplicar) e uma parte de cada kit, no aplicador.mjs da raiz do kit (aparência dos personagens, cenários,
// arquivos gerados e as lacunas do brandbook que são do modelo). O kit é achado pelo .modelo.json do
// universo: primeiro nos modelos do estúdio (<estúdio>/modelos/, quando o universo está em
// <estúdio>/animacao/<pasta>), depois nos modelos da skill. Modelo local sem aplicador usa o do modelo
// em que foi baseado (baseado_em.modelo).

const acharAplicador = async (dir, idInicial) => {
  const animacao = path.dirname(dir);
  const estudio = path.basename(animacao) === 'animacao' ? path.dirname(animacao) : null;
  const vistos = new Set();
  let id = idInicial;
  while (id && !vistos.has(id)) {
    vistos.add(id);
    const kit = [...(estudio ? [path.join(estudio, 'modelos', id)] : []), path.join(SKILL, 'modelos', id)].find((c) => fs.existsSync(path.join(c, 'modelo.json')));
    if (!kit) return { erro: `o modelo "${id}" não foi achado${estudio ? ` (procurado em ${path.join(estudio, 'modelos')} e` : ' (procurado'} nos modelos da skill)` };
    const arq = path.join(kit, 'aplicador.mjs');
    if (fs.existsSync(arq)) return { kit, aplicador: await import(pathToFileURL(arq).href), manifesto: JSON.parse(fs.readFileSync(path.join(kit, 'modelo.json'), 'utf8')) };
    const m = JSON.parse(fs.readFileSync(path.join(kit, 'modelo.json'), 'utf8'));
    id = m.baseado_em?.modelo ?? null;
  }
  return { erro: `o modelo "${idInicial}" não traz aplicador.mjs nem diz em que modelo foi baseado (baseado_em.modelo)` };
};

// ---------------------------------------------------------------- validar respostas (parte comum)

const validar = (r, kitId, opcoes, kit, semPersonagens = false, manifesto = null) => {
  const erros = [];
  if (!ehTexto(r.modelo)) erros.push('modelo: obrigatório (id do modelo, ex.: "chapado")');
  else if (kitId && r.modelo !== kitId) erros.push(`modelo: respostas são do modelo "${r.modelo}" mas o universo veio do "${kitId}"`);
  const u = r.universo;
  if (!u || typeof u !== 'object') erros.push('universo: obrigatório (nome, assunto, publico, tom)');
  else {
    for (const c of ['nome', 'assunto', 'publico', 'tom']) if (!ehTexto(u[c])) erros.push(`universo.${c}: obrigatório`);
    if (u.pasta !== undefined && !ehSlug(u.pasta)) erros.push(`universo.pasta: use letras minúsculas, números e hífen (veio ${JSON.stringify(u.pasta)})`);
  }
  if (r.marca !== undefined && r.marca !== null) {
    if (typeof r.marca !== 'object') erros.push('marca: objeto (nome, cor, simbolo, palavra_fecho) ou null para nenhuma marca');
    else {
      if (!ehTexto(r.marca.nome)) erros.push('marca.nome: obrigatório quando há marca');
      if (r.marca.cor !== undefined && r.marca.cor !== null && !ehHex(r.marca.cor)) erros.push('marca.cor: hex #RRGGBB');
      const simbolos = opcoes.simbolos_marca ?? [];
      if (r.marca.simbolo !== undefined && r.marca.simbolo !== null && simbolos.length && !simbolos.includes(r.marca.simbolo)) {
        erros.push(`marca.simbolo: "${r.marca.simbolo}" não existe (aceitos: ${simbolos.join(', ')})`);
      }
      if (r.marca.palavra_fecho !== undefined && r.marca.palavra_fecho !== null && !ehTexto(r.marca.palavra_fecho)) erros.push('marca.palavra_fecho: texto');
    }
  }
  if (r.fecho !== undefined && r.fecho !== null) {
    if (typeof r.fecho !== 'object' || Array.isArray(r.fecho)) erros.push('fecho: objeto (chamada, palavra, aviso_ficticio)');
    else {
      for (const c of ['chamada', 'palavra']) if (r.fecho[c] !== undefined && r.fecho[c] !== null && !ehTexto(r.fecho[c])) erros.push(`fecho.${c}: texto`);
      if (r.fecho.aviso_ficticio !== undefined && typeof r.fecho.aviso_ficticio !== 'boolean') erros.push('fecho.aviso_ficticio: true ou false');
    }
  }
  const ids = new Set();
  const ctx = contexto(opcoes, ids, manifesto);
  const ps = r.personagens;
  // modelo sem personagem (pula a pergunta 5): personagens é opcional e, se vier, não precisa de protagonista
  if (semPersonagens && (ps === undefined || ps === null || (Array.isArray(ps) && ps.length === 0))) {
    // nada a conferir
  } else if (semPersonagens && !Array.isArray(ps)) erros.push('personagens: lista (este modelo não usa personagem; pode ficar de fora)');
  else if (!Array.isArray(ps) || ps.length === 0) erros.push('personagens: obrigatório, ao menos a protagonista');
  else {
    if (!semPersonagens && !ps.some((p) => p && p.papel === 'protagonista')) erros.push('personagens: falta um personagem com papel "protagonista"');
    ps.forEach((p, i) => {
      const onde = `personagens[${i}]`;
      if (!p || typeof p !== 'object') return erros.push(`${onde}: objeto`);
      if (!ehSlug(p.id)) erros.push(`${onde}.id: obrigatório, minúsculas e hífen (ex.: "bia")`);
      else if (ids.has(p.id)) erros.push(`${onde}.id: "${p.id}" repetido`);
      else ids.add(p.id);
      if (!ehTexto(p.nome)) erros.push(`${onde}.nome: obrigatório`);
      if (!['protagonista', 'apoio'].includes(p.papel)) erros.push(`${onde}.papel: "protagonista" ou "apoio"`);
      if (p.idade !== undefined && (typeof p.idade !== 'number' || p.idade < 0)) erros.push(`${onde}.idade: número`);
      kit.validarPersonagem?.(p, onde, ctx, erros);
    });
  }
  kit.validar?.(r, ctx, erros);
  // família (modelo com "temas" no modelo.json): a resposta "tema" é um dos temas, e a troca de cor só
  // vale para os papéis que o tema escolhido deixa trocar (cores_trocaveis)
  const temas = Array.isArray(manifesto?.temas) ? manifesto.temas : null;
  const temaEscolhido = temas ? temas.find((t) => t && t.id === r.tema) : null;
  if (temas) {
    const aceitos = temas.map((t) => t.id).join(', ');
    if (!ehTexto(r.tema)) erros.push(`tema: obrigatório neste modelo, um dos temas (aceitos: ${aceitos}; recomendado: ${manifesto.tema_recomendado})`);
    else if (!temaEscolhido) erros.push(`tema: "${r.tema}" não existe neste modelo (aceitos: ${aceitos})`);
  }
  if (r.cores?.paleta) {
    const papeis = Object.keys(Object.values(opcoes.paletas)[0]);
    for (const [k, v] of Object.entries(r.cores.paleta)) {
      if (!papeis.includes(k)) erros.push(`cores.paleta.${k}: papel desconhecido (aceitos: ${papeis.join(', ')})`);
      else if (!ehHex(v)) erros.push(`cores.paleta.${k}: hex #RRGGBB`);
      else if (temaEscolhido && Array.isArray(temaEscolhido.cores_trocaveis) && !temaEscolhido.cores_trocaveis.includes(k)) {
        erros.push(`cores.paleta.${k}: o tema "${temaEscolhido.id}" não troca este papel (${temaEscolhido.cor_troca}; papéis que trocam: ${temaEscolhido.cores_trocaveis.join(', ')})`);
      }
    }
  }
  if (r.nunca !== undefined && (!Array.isArray(r.nunca) || r.nunca.some((x) => !ehTexto(x)))) erros.push('nunca: lista de textos');
  return erros;
};

/** Número da pergunta da entrevista curta que responde ao campo do erro (para voltar à pergunta certa). */
const perguntaDoErro = (erro, r, kit, manifesto = null) => {
  const doKit = kit.perguntaDoErro?.(erro, r);
  if (doKit !== undefined) return doKit;
  // família: o erro de tema volta à pergunta de id "tema" (o número que ela troca no modelo.json)
  if (/^tema:/.test(erro)) {
    const n = Object.entries(manifesto?.perguntas?.trocar ?? {}).find(([, id]) => id === 'tema')?.[0];
    return n ? Number(n) : null;
  }
  const m = /^personagens\[(\d+)\](\.\w+)?/.exec(erro);
  if (m) {
    const p = Array.isArray(r.personagens) ? r.personagens[Number(m[1])] : null;
    if (m[2] === '.voz') return 10;
    if (p && p.papel === 'protagonista') return m[2] === '.aparencia' ? 6 : 5;
    return 7;
  }
  const regras = [
    [/^universo(\.(nome|pasta))?:/, 1],
    [/^universo\.(assunto|publico)/, 2],
    [/^universo\.tom/, 3],
    [/^marca/, 4],
    [/^personagens:/, 5],
    [/^cenarios/, 8],
    [/^cores/, 9],
    [/^voz/, 10],
    [/^nunca/, 11],
    [/^fecho/, 12],
  ];
  const achada = regras.find(([re]) => re.test(erro));
  return achada ? achada[1] : null;
};

// ---------------------------------------------------------------- utilidades e lacunas comuns (os kits usam pelo ctx)

const ts = (v) => JSON.stringify(v, null, 2);
const comentario = (s) => umaLinha(s).replace(/\*\//g, '* /');
const nomeTipo = (id) =>
  id
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
    .replace(/^(\d)/, 'P$1');

const resumoFecho = (r) => {
  const prot = (r.personagens ?? []).find((p) => p.papel === 'protagonista')?.nome ?? 'a protagonista';
  const aviso = r.fecho?.aviso_ficticio === false ? 'sem o aviso de personagem fictícia (desligado nas respostas)' : `com o aviso "${prot} é uma personagem fictícia"`;
  if (!r.marca) {
    const chamada = r.fecho?.chamada ?? 'Gostou do episódio?';
    return `"${chamada}" e o botão "Segue o perfil" (universo sem marca), ${aviso}.`;
  }
  const chamada = r.fecho?.chamada ?? `Quer saber mais sobre ${r.marca.nome}?`;
  const palavra = (r.fecho?.palavra ?? r.marca.palavra_fecho ?? r.marca.nome.split(/\s+/)[0]).toUpperCase();
  return `"${chamada}" e "Comenta ${palavra}" com o símbolo ${r.marca.simbolo ?? 'letra'} na cor ${r.marca.cor ? `\`${r.marca.cor}\`` : 'de destaque'}, ${aviso}.`;
};

const contexto = (opcoes, ids, manifesto = null) => ({
  opcoes,
  ids,
  /** o modelo.json do kit (temas da família, perguntas) */
  manifesto,
  util: { ehTexto, ehHex, ehSlug, slug, umaLinha, comentario, nomeTipo, ts, hoje, dataBr },
  comum: {
    /** Tabela da paleta (a primeira do opcoes.json) com os papéis trocados nas respostas. */
    tabelaCores: (r) => {
      const [nomePaleta, paleta] = Object.entries(opcoes.paletas)[0];
      const final = { ...paleta, ...(r.cores?.paleta ?? {}) };
      const l = ['| Papel | Hex |', '|---|---|'];
      for (const [k, v] of Object.entries(final)) l.push(`| ${k} | \`${v}\`${r.cores?.paleta?.[k] ? ' (trocado)' : ''} |`);
      return { nome: `"${nomePaleta.replace('-', ' ').replace(/^./, (c) => c.toUpperCase())}"${r.cores?.paleta ? ' com ajustes' : ''}`, tabela: l.join('\n') };
    },
    marcaResumo: (r) =>
      r.marca
        ? `${r.marca.nome}${r.marca.cor ? `, cor \`${r.marca.cor}\`` : ''}${r.marca.simbolo ? `, símbolo ${r.marca.simbolo}` : ''}${r.marca.palavra_fecho ? `, palavra do fecho ${r.marca.palavra_fecho}` : ''}.`
        : 'nenhuma marca: celular sem logo e fecho de "me segue".',
    cenariosResumo: (r) =>
      r.cenarios
        ? Object.entries(r.cenarios)
            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${Array.isArray(v) ? v.join(', ') : v && typeof v === 'object' ? Object.entries(v).map(([a, b]) => `${a} "${b}"`).join(', ') : v}`)
            .join('; ') + '.'
        : 'a definir',
    resumoFecho,
    listaNunca: (r) => ((r.nunca ?? []).length ? r.nunca.map((n) => `- ${n}`).join('\n') : '- a definir'),
  },
});

const preencher = (texto, valores) => {
  const faltando = new Set();
  const novo = texto.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (todo, chave) => {
    const v = valores[chave];
    if (v === undefined || v === null || v === '') {
      faltando.add(chave);
      return todo;
    }
    return String(v);
  });
  return { novo, faltando: [...faltando] };
};

const achatar = (obj, prefixo = '', saida = {}) => {
  for (const [k, v] of Object.entries(obj ?? {})) {
    const chave = prefixo ? `${prefixo}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) achatar(v, chave, saida);
    else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') saida[chave] = v;
  }
  return saida;
};

const listarEscrever = (texto) =>
  texto
    .split('\n')
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => l.includes('ESCREVER:'))
    .map(([n, l]) => `  linha ${n}: ${l.replace(/.*ESCREVER:\s*/, '').replace(/\s*-->.*/, '')}`);

// ---------------------------------------------------------------- brandbook reaplicável
//
// O modelo do brandbook (.brandbook-modelo.md) tem texto fixo, lacunas {{chave}} e marcas
// <!-- ESCREVER: ... -->. Para reaplicar, o brandbook atual é lido contra o modelo: o texto fixo
// (e o valor que cada {{chave}} recebeu na última vez, guardado em .brandbook-valores.json) serve
// de âncora, e o que está entre as âncoras no lugar de cada ESCREVER é o texto escrito à mão.
// O brandbook novo é o modelo com as chaves preenchidas pelas respostas novas e esse texto de volta.

const RE_PECA = /(\{\{\s*[\w.]+\s*\}\}|<!--\s*ESCREVER:[\s\S]*?-->)/;

const pecas = (modelo) =>
  modelo.split(new RegExp(RE_PECA.source, 'g')).map((t, i) => {
    if (i % 2 === 0) return { tipo: 'texto', texto: t };
    if (t.startsWith('{{')) return { tipo: 'chave', chave: t.replace(/[{}\s]/g, ''), bruto: t };
    return { tipo: 'lacuna', bruto: t };
  });

const vazio = (v) => v === undefined || v === null || v === '';

/** Texto escrito no lugar de cada ESCREVER do brandbook atual, ou null se o texto fixo não bater. */
const extrairLacunas = (ps, atual, antigos) => {
  const seq = [];
  let iLacuna = 0;
  const empurrarTexto = (t) => {
    if (!t) return;
    const ult = seq[seq.length - 1];
    if (ult && ult.tipo === 'texto') ult.texto += t;
    else seq.push({ tipo: 'texto', texto: t });
  };
  for (const p of ps) {
    if (p.tipo === 'texto') empurrarTexto(p.texto);
    else if (p.tipo === 'chave' && antigos) empurrarTexto(vazio(antigos[p.chave]) ? p.bruto : String(antigos[p.chave]));
    else seq.push({ tipo: 'curinga', lacuna: p.tipo === 'lacuna' ? iLacuna++ : null });
  }
  const lacunas = [];
  let pos = 0;
  for (let i = 0; i < seq.length; i++) {
    const s = seq[i];
    if (s.tipo === 'texto') {
      if (!atual.startsWith(s.texto, pos)) return null;
      pos += s.texto.length;
      continue;
    }
    const prox = seq[i + 1];
    if (prox && prox.tipo !== 'texto') return null; // duas lacunas coladas: não dá para separar
    const fim = prox ? atual.indexOf(prox.texto, pos) : atual.length;
    if (fim < 0) return null;
    if (s.lacuna !== null) lacunas[s.lacuna] = atual.slice(pos, fim);
    pos = fim;
  }
  return pos === atual.length ? lacunas : null;
};

const refazerBrandbook = (modelo, atual, valores, antigos) => {
  const ps = pecas(modelo);
  const lacunas = extrairLacunas(ps, atual, antigos);
  const faltando = new Set();
  const avisos = [];
  let iLacuna = 0;
  const texto = ps
    .map((p) => {
      if (p.tipo === 'texto') return p.texto;
      if (p.tipo === 'chave') {
        const v = valores[p.chave];
        if (vazio(v)) {
          faltando.add(p.chave);
          return p.bruto;
        }
        return String(v);
      }
      const escrito = lacunas ? lacunas[iLacuna++] : undefined;
      return escrito !== undefined && !escrito.includes('ESCREVER:') ? escrito : p.bruto;
    })
    .join('');
  if (!lacunas) return { ok: false, texto, faltando: [...faltando], avisos };
  // texto escrito à mão que ainda cita um valor que mudou nas respostas
  if (antigos) {
    for (const [k, velho] of Object.entries(antigos)) {
      const novo = valores[k];
      if (vazio(velho) || String(velho).length < 4 || String(velho).includes('\n') || String(novo) === String(velho)) continue;
      lacunas.forEach((l) => {
        if (l && !l.includes('ESCREVER:') && l.includes(String(velho))) avisos.push(`texto escrito à mão ainda cita "${velho}", que mudou para "${novo ?? '(vazio)'}": revise`);
      });
    }
  }
  return { ok: true, texto, faltando: [...faltando], avisos };
};

const aplicar = async (universo) => {
  const dir = path.resolve(universo);
  if (!fs.existsSync(dir)) falhar(`universo não encontrado: ${universo}`);
  const rpPath = path.join(dir, 'respostas.json');
  if (!fs.existsSync(rpPath)) falhar(`falta ${rpPath}: grave as respostas da entrevista antes de aplicar`);
  const r = lerJson(rpPath);
  const origem = fs.existsSync(path.join(dir, '.modelo.json')) ? lerJson(path.join(dir, '.modelo.json')) : null;
  const opPath = path.join(dir, 'componentes', 'opcoes.json');
  if (!fs.existsSync(opPath)) {
    falhar(
      `falta ${opPath}: o universo não veio de um kit com personagens configuráveis (nasceu da entrevista completa). ` +
        'Aplique as respostas editando o brandbook (as duas versões) e as fichas; ver references/modelo-local.md.',
    );
  }
  const opcoes = lerJson(opPath);
  // universo sem .modelo.json (de antes do aplicador por kit): o modelo das respostas, e o chapado por último
  const { aplicador: kit, manifesto, erro } = await acharAplicador(dir, origem?.id ?? (ehTexto(r.modelo) ? r.modelo : 'chapado'));
  if (erro) falhar(`não deu para aplicar: ${erro}`);
  // o modelo que pula a pergunta 5 (personagem principal) não tem personagem: o dossiê, por exemplo
  const semPersonagens = (manifesto?.perguntas?.pular ?? []).includes(5);

  const erros = validar(r, origem?.id, opcoes, kit, semPersonagens, manifesto);
  if (erros.length) {
    console.log(`respostas.json com ${erros.length} problema(s) (refaça a pergunta indicada e grave de novo):`);
    for (const e of erros) {
      const n = perguntaDoErro(e, r, kit, manifesto);
      console.log(`  - ${n ? `[pergunta ${n}] ` : ''}${e}`);
    }
    process.exit(1);
  }

  const ctx = contexto(opcoes, new Set(), manifesto);
  const { arquivos, valores: valoresDoKit } = kit.gerar(r, ctx);
  const gerados = [];
  for (const [rel, conteudo] of arquivos) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, conteudo);
    gerados.push(rel);
  }
  // passo opcional do kit depois de gravar os arquivos (ex.: o pixel gera os sprites do boneco por script)
  if (typeof kit.depois === 'function') {
    try {
      for (const g of (await kit.depois({ dir, r, ctx })) ?? []) gerados.push(g);
    } catch (e) {
      falhar(`não deu para terminar o --aplicar: ${e.message}`);
    }
  }

  // brandbook: refeito do modelo guardado, com as lacunas {{chave}} preenchidas e o texto já escrito mantido
  const bbPath = path.join(dir, BRANDBOOK);
  let escreverLista = [];
  let faltando = [];
  let avisosBb = [];
  let falhouBb = false;
  if (fs.existsSync(bbPath)) {
    const valores = {
      ...achatar(r),
      data: dataBr(r.respondido_em || hoje()),
      versao_modelo: r.versao_modelo ?? origem?.versao ?? '',
      ...valoresDoKit,
    };
    if (!valores['voz.caminho']) valores['voz.caminho'] = 'a definir';
    const atual = fs.readFileSync(bbPath, 'utf8');
    const mbPath = path.join(dir, MODELO_BB);
    // universo de antes do .brandbook-modelo.md: o brandbook ainda com lacunas é o próprio modelo
    if (!fs.existsSync(mbPath) && /\{\{|ESCREVER:/.test(atual)) fs.writeFileSync(mbPath, atual);
    if (fs.existsSync(mbPath)) {
      const vbPath = path.join(dir, VALORES_BB);
      const antigos = fs.existsSync(vbPath) ? lerJson(vbPath) : null;
      const r2 = refazerBrandbook(fs.readFileSync(mbPath, 'utf8'), atual, valores, antigos);
      if (r2.ok) {
        fs.writeFileSync(bbPath, r2.texto);
        fs.writeFileSync(vbPath, JSON.stringify(Object.fromEntries(Object.entries(valores).map(([k, v]) => [k, String(v)])), null, 1) + '\n');
        gerados.push(BRANDBOOK);
        escreverLista = listarEscrever(r2.texto);
        faltando = r2.faltando;
        avisosBb = r2.avisos;
      } else {
        const novoPath = path.join(dir, 'BRANDBOOK-ANIMACAO.novo.md');
        fs.writeFileSync(novoPath, r2.texto);
        falhouBb = true;
        avisosBb = [
          `o ${BRANDBOOK} foi editado fora das lacunas (o texto em volta delas não bate com ${MODELO_BB}), então ele NÃO foi trocado.`,
          `A versão com as respostas novas, sem o texto das lacunas, está em ${path.basename(novoPath)}: passe para ela o que foi escrito à mão e troque os arquivos.`,
        ];
      }
    } else {
      const { novo, faltando: f } = preencher(atual, valores);
      fs.writeFileSync(bbPath, novo);
      gerados.push(BRANDBOOK);
      escreverLista = listarEscrever(novo);
      faltando = f;
      avisosBb = [`sem ${MODELO_BB}: as respostas novas não chegam às partes do brandbook já preenchidas; mude essas partes à mão`];
    }
  }

  console.log(`ok: respostas aplicadas em ${path.relative(process.cwd(), dir) || '.'}`);
  for (const g of gerados) console.log(`  gerado: ${g}`);
  if (faltando.length) console.log(`aviso: lacunas sem resposta no brandbook: ${faltando.map((c) => `{{${c}}}`).join(', ')}`);
  for (const a of avisosBb) console.log(`aviso: ${a}`);
  if (escreverLista.length) {
    console.log(`para o Claude redigir no ${BRANDBOOK} (${escreverLista.length}):`);
    for (const l of escreverLista) console.log(l);
    if (fs.existsSync(path.join(dir, 'lacunas-de-origem.md'))) console.log('  (o texto do universo de origem está em lacunas-de-origem.md, para aproveitar)');
  }
  if (falhouBb) process.exit(1);
};

// ---------------------------------------------------------------- conferir

const conferir = (universo) => {
  const bbPath = path.join(path.resolve(universo), BRANDBOOK);
  if (!fs.existsSync(bbPath)) falhar(`falta ${bbPath}`);
  const linhas = fs.readFileSync(bbPath, 'utf8').split('\n');
  const sobras = [];
  linhas.forEach((l, i) => {
    if (l.includes('{{')) sobras.push(`  linha ${i + 1}: lacuna ${(l.match(/\{\{[^}]*\}\}/g) || ['{{']).join(' ')}`);
    if (l.includes('ESCREVER:')) sobras.push(`  linha ${i + 1}: ESCREVER: ${l.replace(/.*ESCREVER:\s*/, '').replace(/\s*-->.*/, '')}`);
  });
  if (sobras.length) {
    console.log(`${BRANDBOOK} ainda tem ${sobras.length} lacuna(s):`);
    for (const s of sobras) console.log(s);
    process.exit(1);
  }
  console.log(`ok: ${BRANDBOOK} sem lacunas`);
};

// ---------------------------------------------------------------- principal

// pecas e extrairLacunas também servem ao salvar_modelo.mjs (texto das lacunas do universo de origem)
export { pecas, extrairLacunas, MODELO_BB, VALORES_BB };

const principal = async () => {
  const args = process.argv.slice(2);
  const forcar = args.includes('--forcar');
  const pos = args.filter((a) => a !== '--forcar');
  if (pos[0] === '--aplicar') {
    if (!pos[1]) falhar('Uso: node novo_universo.mjs --aplicar <universo>');
    await aplicar(pos[1]);
  } else if (pos[0] === '--conferir') {
    if (!pos[1]) falhar('Uso: node novo_universo.mjs --conferir <universo>');
    conferir(pos[1]);
  } else if (pos.length === 3 && !pos[0].startsWith('-')) {
    copiar(pos[0], path.resolve(pos[1]), pos[2], forcar);
  } else {
    falhar(
      'Uso:\n  node novo_universo.mjs <modelo> <estudio> <pasta> [--forcar]\n  node novo_universo.mjs --aplicar <universo>\n  node novo_universo.mjs --conferir <universo>',
    );
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await principal();
