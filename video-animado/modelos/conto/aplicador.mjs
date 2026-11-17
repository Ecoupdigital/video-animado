// Aplicador do modelo Conto (família com temas e personagens): a parte do --aplicar que depende do kit.
// O scripts/novo_universo.mjs cuida do comum (universo, marca, fecho, cores por papel, proibições, brandbook,
// reaplicar e, por ser família, a resposta "tema" e os papéis que cada tema deixa trocar) e chama estas funções
// para o que é deste modelo: a aparência de cada personagem num objeto só para todos os temas (campos comuns e
// campos de cada tema, conferidos contra opcoes.json), os cenários e o nome do lugar, o narrador opcional, a
// origem das cores do tema (as do tema, a da marca no destaque ou uma das 3 paletas prontas do tema) e os
// arquivos gerados (universo.ts com as cores já resolvidas, personagens/<id>/Personagem.tsx e FICHA.md, índice).
// Nenhum tema fica escrito aqui: a lista, os campos de aparência e os estilos vêm do opcoes.json e do modelo.json.
//
// Contrato (o mesmo em todo kit com aplicador.mjs):
//   validarPersonagem(p, onde, ctx, erros)   campos do personagem que são do modelo
//   validar(r, ctx, erros)                    o resto das respostas que é do modelo
//   perguntaDoErro(erro, r)                   número da pergunta (ou undefined para usar a regra comum)
//   gerar(r, ctx) -> { arquivos: [[caminho, conteúdo], ...], valores: { chave: texto } }

const ORIGENS = ['tema', 'marca', 'pronta'];
const ID_NARRADOR = 'narrador';

// ---------------------------------------------------------------- cor (igual à do tema.tsx)

const hexRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const misturar = (a, b, t) => {
  const x = hexRgb(a);
  const y = hexRgb(b);
  return rgbHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
};
const luminancia = (h) => {
  const [r, g, b] = hexRgb(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** A cor da marca como destaque legível no tema: clareia no fundo escuro, escurece no claro, até contraste 4
 *  (o mesmo cuidado das outras famílias) contra os papéis em que o destaque aparece (estilos.<tema>.contraste). */
export const destaqueDaMarca = (cor, fundos) => {
  let d = cor.toUpperCase();
  const escuro = fundos.reduce((s, f) => s + luminancia(f), 0) / fundos.length < 0.35;
  for (let i = 0; i < 8 && Math.min(...fundos.map((f) => contraste(d, f))) < 4; i++) d = misturar(d, escuro ? '#FFFFFF' : '#000000', 0.14);
  return d;
};

// ---------------------------------------------------------------- temas e aparência (do opcoes.json)

const temaDe = (r, ctx) => r.tema ?? ctx.manifesto?.tema_recomendado ?? ctx.opcoes.temas[0];
const infoTema = (r, ctx) => (ctx.manifesto?.temas ?? []).find((t) => t.id === temaDe(r, ctx)) ?? null;
const nomeTema = (id, ctx) => (ctx.manifesto?.temas ?? []).find((t) => t.id === id)?.nome ?? id;

/** De qual seção vem cada campo de aparência: "comum" ou o id do tema. */
const secoesAparencia = (opcoes) => Object.entries(opcoes.aparencia).map(([secao, campos]) => ({ secao, campos }));

const aceitosDe = (regra, opcoes) => {
  if (regra === 'preset') return Object.keys(opcoes.presets);
  if (regra === 'tom') return Object.keys(opcoes.tons_pele);
  if (regra.startsWith('lista:')) return opcoes.listas[regra.slice(6)] ?? [];
  return null;
};

const validarAparencia = (ap, onde, ctx, erros) => {
  const { opcoes, util } = ctx;
  if (ap === undefined || ap === null) return; // tudo do preset padrão do lugar no elenco
  if (typeof ap !== 'object' || Array.isArray(ap)) {
    erros.push(`${onde}.aparencia: objeto (preset, cor, acessorio e os campos de cada tema)`);
    return;
  }
  const secoes = secoesAparencia(opcoes);
  for (const [k, v] of Object.entries(ap)) {
    const lugar = `${onde}.aparencia.${k}`;
    const achada = secoes.find((s) => k in s.campos);
    if (!achada) {
      const lista = secoes.map((s) => `${s.secao === 'comum' ? 'comuns' : `tema ${s.secao}`}: ${Object.keys(s.campos).join(', ')}`).join('; ');
      erros.push(`${lugar}: campo desconhecido (aceitos: ${lista})`);
      continue;
    }
    const regra = achada.campos[k];
    // campo de outro tema que não o escolhido também é conferido: fica guardado para quando trocar de tema
    const doTema = achada.secao !== 'comum' ? achada.secao : null;
    if (regra === 'cor') {
      if (!util.ehHex(v)) erros.push(`${lugar}: cor em hex #RRGGBB (veio ${JSON.stringify(v)})`);
      continue;
    }
    const aceitos = aceitosDe(regra, opcoes);
    if (aceitos && !aceitos.includes(v)) {
      const oque = regra === 'preset' ? 'preset' : regra === 'tom' ? 'tom de pele' : k;
      erros.push(`${lugar}: ${oque} ${JSON.stringify(v)} não existe${doTema ? ` no tema ${doTema}` : ''} (aceitos: ${aceitos.join(', ')})`);
    }
  }
};

export const validarPersonagem = (p, onde, ctx, erros) => {
  const { util } = ctx;
  if (p.id === ID_NARRADOR) erros.push(`${onde}.id: "${ID_NARRADOR}" é reservado para as falas do narrador (pergunta 10); escolha outro id`);
  if (p.quem_e !== undefined && p.quem_e !== null && !util.ehTexto(p.quem_e)) erros.push(`${onde}.quem_e: texto`);
  validarAparencia(p.aparencia, onde, ctx, erros);
  if (p.voz !== undefined && p.voz !== null && (typeof p.voz !== 'object' || Array.isArray(p.voz))) erros.push(`${onde}.voz: objeto (caminho, voice_id)`);
};

const validarNarrador = (n, util, erros) => {
  if (n === undefined || n === null || n === false) return;
  if (n === true) return;
  if (typeof n !== 'object' || Array.isArray(n)) return erros.push(`narrador: true, false ou objeto { "ligado": true, "voz": { "caminho": "pronta" } } (veio ${JSON.stringify(n)})`);
  for (const k of Object.keys(n)) if (!['ligado', 'nome', 'voz'].includes(k)) erros.push(`narrador.${k}: campo desconhecido (aceitos: ligado, nome, voz)`);
  if (typeof n.ligado !== 'boolean') erros.push(`narrador.ligado: true ou false (veio ${JSON.stringify(n.ligado)})`);
  if (n.nome !== undefined && n.nome !== null && !util.ehTexto(n.nome)) erros.push('narrador.nome: texto (só para a ficha e o brandbook; o narrador não aparece na tela)');
  if (n.voz !== undefined && n.voz !== null && (typeof n.voz !== 'object' || Array.isArray(n.voz))) erros.push('narrador.voz: objeto (caminho, voice_id)');
};

export const validar = (r, ctx, erros) => {
  const { opcoes, util } = ctx;
  const tema = temaDe(r, ctx);
  const prontas = opcoes.prontas?.[tema] ?? {};
  const c = r.cores;
  if (c !== undefined && c !== null) {
    if (typeof c !== 'object' || Array.isArray(c)) erros.push('cores: objeto (origem, pronta, paleta)');
    else {
      for (const k of Object.keys(c)) if (!['origem', 'pronta', 'paleta'].includes(k)) erros.push(`cores.${k}: campo desconhecido neste modelo (aceitos: origem, pronta, paleta; o tema é a resposta "tema", da pergunta 8)`);
      if (c.origem !== undefined && c.origem !== null && !ORIGENS.includes(c.origem)) erros.push(`cores.origem: "${c.origem}" não existe (aceitos: ${ORIGENS.join(', ')})`);
      if (c.origem === 'marca' && !r.marca?.cor) erros.push('cores.origem: "marca" pede a cor da marca (marca.cor, pergunta 4)');
      const pede = c.origem === 'pronta' || ((c.origem === undefined || c.origem === null) && c.pronta);
      if (pede) {
        if (!util.ehTexto(c.pronta)) erros.push(`cores.pronta: qual das 3 paletas prontas do tema "${tema}" (aceitas: ${Object.keys(prontas).join(', ')})`);
        else if (!prontas[c.pronta]) erros.push(`cores.pronta: "${c.pronta}" não é paleta pronta do tema "${tema}" (aceitas: ${Object.keys(prontas).join(', ')})`);
      } else if (c.pronta !== undefined && c.pronta !== null) erros.push(`cores.pronta: só vale com cores.origem "pronta" (veio origem "${c.origem}")`);
      if (c.paleta !== undefined && c.paleta !== null && (typeof c.paleta !== 'object' || Array.isArray(c.paleta))) erros.push('cores.paleta: objeto papel -> hex, ou null');
    }
  }
  const ce = r.cenarios;
  if (ce !== undefined && ce !== null) {
    const ids = Object.keys(opcoes.cenarios);
    if (typeof ce !== 'object' || Array.isArray(ce)) erros.push(`cenarios: objeto { "lista": [${ids.map((i) => `"${i}"`).join(', ')}], "lugar": "nome do lugar" }`);
    else {
      for (const k of Object.keys(ce)) if (!['lista', 'lugar'].includes(k)) erros.push(`cenarios.${k}: campo desconhecido (aceitos: lista, lugar)`);
      if (ce.lista !== undefined && (!Array.isArray(ce.lista) || ce.lista.length === 0 || ce.lista.some((x) => !ids.includes(x)))) erros.push(`cenarios.lista: lista com 1 ou mais cenários (aceitos: ${ids.join(', ')}; veio ${JSON.stringify(ce.lista)})`);
      if (ce.lugar !== undefined && ce.lugar !== null && !util.ehTexto(ce.lugar)) erros.push('cenarios.lugar: texto (o nome do lugar, que vai na placa) ou null');
    }
  }
  validarNarrador(r.narrador, util, erros);
};

/** O narrador é perguntado na 10 (vozes). */
export const perguntaDoErro = (erro) => (/^narrador/.test(erro) ? 10 : undefined);

// ---------------------------------------------------------------- resolver

/** As cores trocadas do tema, resolvidas: paleta pronta, destaque da marca e trocas por papel, só nos papéis que o tema troca. */
export const resolverCores = (r, ctx) => {
  const { opcoes } = ctx;
  const tema = temaDe(r, ctx);
  const info = infoTema(r, ctx);
  const trocaveis = info?.cores_trocaveis ?? Object.keys(opcoes.paletas[tema]);
  const base = opcoes.paletas[tema];
  const c = r.cores ?? {};
  const origem = c.origem ?? (c.pronta ? 'pronta' : 'tema');
  let trocas = {};
  if (origem === 'pronta') trocas = { ...(opcoes.prontas[tema][c.pronta]?.cores ?? {}) };
  if (origem === 'marca' && r.marca?.cor) {
    const final = { ...base, ...trocas };
    const papeis = opcoes.estilos?.[tema]?.contraste ?? ['fundo'];
    trocas.destaque = destaqueDaMarca(r.marca.cor, papeis.map((p) => final[p]));
  }
  Object.assign(trocas, c.paleta ?? {});
  const so = Object.fromEntries(Object.entries(trocas).filter(([k, v]) => trocaveis.includes(k) && v !== base[k]));
  return { tema, origem, pronta: origem === 'pronta' ? c.pronta : null, cores: so, trocaveis };
};

const narradorDe = (r) => {
  const n = r.narrador;
  if (n === true) return { ligado: true, nome: 'Narrador', voz: null };
  if (n && typeof n === 'object') return { ligado: n.ligado === true, nome: n.nome ?? 'Narrador', voz: n.voz ?? null };
  return { ligado: false, nome: 'Narrador', voz: null };
};

const cenariosDe = (r, opcoes) => ({ lista: r.cenarios?.lista ?? Object.keys(opcoes.cenarios), lugar: r.cenarios?.lugar ?? null });

/** Aparência resolvida (preset padrão do lugar no elenco, preset da resposta, campos da resposta), como no aparencia.ts. */
const resolverAparencia = (ap, semente, opcoes) => {
  const l = opcoes.preset_padrao;
  const base = opcoes.presets[l[(Math.max(1, semente) - 1) % l.length]];
  const doPreset = ap?.preset ? opcoes.presets[ap.preset] ?? {} : {};
  const proprio = Object.fromEntries(Object.entries(ap ?? {}).filter(([k]) => k !== 'preset'));
  return { ...base, ...doPreset, ...proprio };
};

// ---------------------------------------------------------------- gerar

const gerarUniversoTs = (r, ctx) => {
  const { ts, hoje } = ctx.util;
  const { opcoes } = ctx;
  const marca = r.marca ? { nome: r.marca.nome, cor: r.marca.cor ?? null, simbolo: r.marca.simbolo ?? null, palavraFecho: r.marca.palavra_fecho ?? null } : null;
  const cores = resolverCores(r, ctx);
  const tema = { id: cores.tema, origem: cores.origem, pronta: cores.pronta, cores: cores.cores };
  // o aviso de personagem fictícia só some com aviso_ficticio: false explícito
  const fecho = { chamada: r.fecho?.chamada ?? null, palavra: r.fecho?.palavra ?? r.marca?.palavra_fecho ?? null, avisoFicticio: r.fecho?.aviso_ficticio !== false };
  const n = narradorDe(r);
  const pessoas = {};
  r.personagens.forEach((p, i) => {
    pessoas[p.id] = { nome: p.nome, papel: p.papel, semente: i + 1, aparencia: p.aparencia ?? {} };
  });
  return `// Gerado por novo_universo.mjs --aplicar a partir de respostas.json em ${hoje()}.
// Não edite à mão: mude respostas.json e rode --aplicar de novo.
// Os componentes do kit leem daqui o nome, a marca, o fecho, o tema com as cores já resolvidas, os cenários,
// o lugar, o narrador e o elenco (a aparência como veio das respostas; o que falta sai do preset).
import type { AparenciaEntrada } from './aparencia';
import type { IdTema, Paleta } from './tema';

export const UNIVERSO = ${ts({ nome: r.universo.nome, pasta: r.universo.pasta ?? null, assunto: r.universo.assunto, publico: r.universo.publico, tom: r.universo.tom })} as const;

/** null = nenhuma marca: fecho de seguir o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null; palavraFecho: string | null } | null = ${ts(marca)};

/** Fecho do vídeo: chamada, palavra do "Comenta" e o aviso de personagem fictícia (ligado se não vier false). */
export const FECHO: { chamada: string | null; palavra: string | null; avisoFicticio: boolean } = ${ts(fecho)};

/** Tema escolhido (pergunta 8) e as cores trocadas (pergunta 9), já resolvidas: só os papéis que o tema troca. */
export const TEMA: { id: IdTema; origem: 'tema' | 'marca' | 'pronta'; pronta: string | null; cores: Partial<Paleta> } = ${ts(tema)};

/** Cenários escolhidos (pergunta 8) e o nome do lugar, que vai na placa. */
export const CENARIOS: { lista: string[]; lugar: string | null } = ${ts(cenariosDe(r, opcoes))};

/** Narrador (pergunta 10): falas com quem "narrador" não abrem a boca de ninguém. */
export const NARRADOR: { ligado: boolean; nome: string } = ${ts({ ligado: n.ligado, nome: n.nome })};

export type PessoaDoElenco = { nome: string; papel: 'protagonista' | 'apoio'; semente: number; aparencia: AparenciaEntrada };
export const PESSOAS: Record<string, PessoaDoElenco> = ${ts(pessoas)};
`;
};

const gerarPersonagemTsx = (p, util) => `import React from 'react';
import { Personagem as Desenho, type PersonagemProps } from '../../componentes/Personagem';
import { PESSOAS } from '../../componentes/universo';

// ${util.comentario(p.nome.toUpperCase())}${p.idade !== undefined ? `, ${p.idade} anos` : ''}, ${p.papel}. ${util.comentario(p.quem_e ?? '')}
// Desenho fixo: nunca redesenhar nas cenas, sempre importar este componente. Sai no traço do tema em uso.
// Gerado por novo_universo.mjs; a aparência mora em componentes/universo.ts (vinda de respostas.json).
const EU = PESSOAS[${JSON.stringify(p.id)}];

export type ${util.nomeTipo(p.id)}Props = PersonagemProps;

export const Personagem: React.FC<PersonagemProps> = (props) => <Desenho aparencia={EU.aparencia} semente={EU.semente} {...props} />;
`;

const gerarIndice = (r) => {
  const imports = [];
  const linhas = [];
  r.personagens.forEach((p, i) => {
    imports.push(`import { Personagem as P${i} } from './${p.id}/Personagem';`);
    linhas.push(`  { id: ${JSON.stringify(p.id)}, nome: ${JSON.stringify(p.nome)}, papel: ${JSON.stringify(p.papel)}, C: P${i} },`);
  });
  return `// Gerado por novo_universo.mjs --aplicar. Lista do elenco para o _preview e para os vídeos.
import React from 'react';
import type { PersonagemProps } from '../componentes/Personagem';
${imports.join('\n')}

export type EntradaElenco = { id: string; nome: string; papel: 'protagonista' | 'apoio'; C: React.FC<PersonagemProps> };

export const PERSONAGENS: EntradaElenco[] = [
${linhas.join('\n')}
];
`;
};

const descreverAparencia = (p, i, ctx) => {
  const { opcoes } = ctx;
  const a = resolverAparencia(p.aparencia, i + 1, opcoes);
  const veio = p.aparencia ?? {};
  const marca = (k) => (k in veio ? '' : ' (do preset)');
  const itens = [];
  itens.push(`- **Preset:** \`${veio.preset ?? `${opcoes.preset_padrao[i % opcoes.preset_padrao.length]} (padrão do ${i + 1}º do elenco)`}\` (o que vem abaixo troca só o que foi respondido).`);
  itens.push(`- **Em todos os temas:** cor principal \`${a.cor}\`${marca('cor')}, acessório \`${a.acessorio}\`${marca('acessorio')}${a.acessorio !== 'nenhum' ? ` na cor \`${a.corDetalhe}\`` : ''}.`);
  // campos que um tema lê de outro (campos_divididos): as silhuetas leem o cabelo do papel, o giz de cera lê a
  // pele, o cabelo, a roupa e as cores do papel; a linha do tema diz os dele e os que divide
  const divididos = opcoes.campos_divididos ?? {};
  const deQuem = (k) => Object.entries(opcoes.aparencia).find(([sec, campos]) => sec !== 'comum' && k in campos)?.[0];
  const parteDividida = (tema) =>
    (divididos[tema] ?? []).length ? `campos divididos com o ${nomeTema(deQuem(divididos[tema][0]), ctx).toLowerCase()}: ${divididos[tema].map((k) => `${k} \`${a[k]}\`${marca(k)}`).join(', ')}` : '';
  for (const [secao, campos] of Object.entries(opcoes.aparencia)) {
    if (secao === 'comum') continue;
    const partes = Object.keys(campos).map((k) => `${k} \`${a[k]}\`${marca(k)}`);
    const dividida = parteDividida(secao);
    itens.push(`- **No tema ${nomeTema(secao, ctx)} (\`${secao}\`):** ${partes.join(', ')}${dividida ? `; ${dividida}` : ''}.`);
  }
  // tema sem campo próprio: só os que divide
  for (const tema of ctx.opcoes.temas) {
    if (tema in opcoes.aparencia || !(divididos[tema] ?? []).length) continue;
    itens.push(`- **No tema ${nomeTema(tema, ctx)} (\`${tema}\`):** nenhum campo próprio; ${parteDividida(tema)}.`);
  }
  return itens.join('\n');
};

/** "a e b", "a, b e c" */
const listaComE = (l) => (l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}`);

const gerarFicha = (p, i, ctx) => {
  const { util } = ctx;
  const temas = ctx.opcoes.temas;
  return `# ${p.nome}

**Papel:** ${p.papel}${p.idade !== undefined ? ` · ${p.idade} anos` : ''}.
**Quem é:** ${util.umaLinha(p.quem_e) || 'a definir'}.

## Aparência

Um objeto só para todos os temas: a cor principal e o acessório fazem o personagem ser reconhecido em qualquer traço.

${descreverAparencia(p, i, ctx)}

## Voz
${p.voz ? `Caminho: ${p.voz.caminho ?? 'a definir'}${p.voz.voice_id ? ` (\`${p.voz.voice_id}\`)` : ''}.` : 'A definir na entrevista.'}

## Expressões
As 8 de todo personagem (\`neutra, falando, feliz, triste, surpresa, brava, pensando, rindo\`). Folhas: stills ${listaComE(temas.map((t) => `\`expressoes-${p.id}-${t}\``))} do \`_preview\`.

## Código
\`personagens/${p.id}/Personagem.tsx\` → \`<Personagem expressao="feliz" falando={v} olhando="direita" escala={0.82} />\` (sai no traço do tema do universo; dentro de \`<ComTema id="...">\`, no daquele tema).
`;
};

const tabelaPersonagens = (r, ctx) => {
  const l = ['| Personagem | Quem é | Visual que identifica (todos os temas) | Fala? |', '|---|---|---|---|'];
  r.personagens.forEach((p, i) => {
    const a = resolverAparencia(p.aparencia, i + 1, ctx.opcoes);
    l.push(`| **${p.nome}** | ${p.idade !== undefined ? `${p.idade} anos, ` : ''}${ctx.util.umaLinha(p.quem_e) || 'a definir'} | cor \`${a.cor}\`${a.acessorio !== 'nenhum' ? `, ${a.acessorio === 'oculos' ? 'óculos' : a.acessorio === 'bone' ? 'boné' : a.acessorio === 'laco' ? 'laço' : a.acessorio}` : ''} | sim${p.papel === 'protagonista' ? ', protagonista' : ''} |`);
  });
  const n = narradorDe(r);
  if (n.ligado) l.push(`| **${n.nome}** (narrador) | voz que conta a história, sem rosto | não aparece na tela | sim, \`quem: "narrador"\`, sem boca |`);
  return l.join('\n');
};

const tabelaCenarios = (r, ctx) => {
  const { opcoes } = ctx;
  const ce = cenariosDe(r, opcoes);
  const l = ['| Cenário | Tipo | O que tem | Placa |', '|---|---|---|---|'];
  for (const id of ce.lista) {
    const info = opcoes.cenarios[id];
    l.push(`| ${info.nome} (\`${id}\`) | ${info.tipo} | ${info.resumo} | ${ce.lugar ? `"${ce.lugar}"` : 'sem placa (nenhum lugar nas respostas)'} |`);
  }
  return l.join('\n');
};

const tabelaCores = (r, ctx) => {
  const { opcoes } = ctx;
  const { tema, cores, trocaveis } = resolverCores(r, ctx);
  const base = opcoes.paletas[tema];
  const l = ['| Papel | Hex | Troca neste tema | Onde usa |', '|---|---|---|---|'];
  for (const [k, v] of Object.entries(base)) {
    const hex = cores[k] ?? v;
    l.push(`| ${k} | \`${hex}\`${cores[k] ? ' (trocado)' : ''} | ${trocaveis.includes(k) ? 'sim' : 'não'} | ${opcoes.papeis?.[k] ?? ''} |`);
  }
  return l.join('\n');
};

const resumoCores = (r, ctx) => {
  const { opcoes } = ctx;
  const { tema, origem, pronta, cores } = resolverCores(r, ctx);
  const n = Object.keys(cores).length;
  if (origem === 'pronta') return `paleta pronta "${opcoes.prontas[tema][pronta].nome}" (\`${pronta}\`)${n ? `, ${n} papel(éis) diferente(s) do tema` : ''}.`;
  if (origem === 'marca') return `as cores do tema, com o destaque puxado da cor da marca (\`${r.marca.cor}\` ficou \`${cores.destaque ?? opcoes.paletas[tema].destaque}\` para ler no tema).`;
  return n ? `as cores do tema, com ${n} papel(éis) trocado(s) nas respostas.` : 'as cores do tema, como vêm no modelo.';
};

const tabelaTemas = (ctx) => {
  const l = ['| Tema | O que é | O que a cor troca |', '|---|---|---|'];
  for (const t of ctx.manifesto?.temas ?? []) l.push(`| **${t.nome}** (\`${t.id}\`) | ${t.resumo} | ${t.cor_troca} |`);
  return l.join('\n');
};

export const gerar = (r, ctx) => {
  const { comum, util } = ctx;
  const info = infoTema(r, ctx);
  const arquivos = [['componentes/universo.ts', gerarUniversoTs(r, ctx)]];
  r.personagens.forEach((p, i) => {
    arquivos.push([`personagens/${p.id}/Personagem.tsx`, gerarPersonagemTsx(p, util)]);
    arquivos.push([`personagens/${p.id}/FICHA.md`, gerarFicha(p, i, ctx)]);
  });
  arquivos.push(['personagens/index.ts', gerarIndice(r)]);
  const n = narradorDe(r);
  const ce = cenariosDe(r, ctx.opcoes);
  const valores = {
    tema_nome: `${info?.nome ?? temaDe(r, ctx)} (\`${temaDe(r, ctx)}\`)`,
    tema_resumo: info?.resumo ?? '',
    tema_cor_troca: info?.cor_troca ?? '',
    tabela_temas: tabelaTemas(ctx),
    cores_resumo: resumoCores(r, ctx),
    tabela_cores: tabelaCores(r, ctx),
    marca_resumo: comum.marcaResumo(r).replace('celular sem logo e fecho de "me segue"', 'fecho de "Segue o perfil"'),
    lista_personagens: [...r.personagens.map((p) => `${p.nome} (${p.papel})`), ...(n.ligado ? [`${n.nome} (narrador, só voz)`] : [])].join(', '),
    tabela_personagens: tabelaPersonagens(r, ctx),
    cenarios_resumo: `${ce.lista.map((id) => ctx.opcoes.cenarios[id].nome.toLowerCase()).join(' e ')}${ce.lugar ? `, com a placa "${ce.lugar}"` : ''}.`,
    tabela_cenarios: tabelaCenarios(r, ctx),
    narrador_voz: n.ligado ? ', mais uma para o narrador' : ' (sem narrador)',
    narrador_resumo: n.ligado ? `ligado: as falas com \`quem: "narrador"\` contam a história, com uma voz própria, e ninguém abre a boca nelas.` : 'desligado: só os personagens falam (para ligar, `narrador: { "ligado": true }` nas respostas).',
    fecho_resumo: comum.resumoFecho(r),
    lista_nunca: comum.listaNunca(r),
    tabela_vozes: [
      '| Quem | Caminho | voice_id |',
      '|---|---|---|',
      ...r.personagens.map((p) => `| ${p.nome} | ${p.voz?.caminho ?? r.voz?.caminho ?? 'a definir'} | ${p.voz?.voice_id ? `\`${p.voz.voice_id}\`` : 'a escolher'} |`),
      ...(n.ligado ? [`| ${n.nome} (narrador) | ${n.voz?.caminho ?? r.voz?.caminho ?? 'a definir'} | ${n.voz?.voice_id ? `\`${n.voz.voice_id}\`` : 'a escolher'} |`] : []),
    ].join('\n'),
  };
  return { arquivos, valores };
};
