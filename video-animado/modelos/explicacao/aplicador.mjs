// Aplicador do modelo Explicação (família com 4 temas): a parte do --aplicar que depende do kit.
// O scripts/novo_universo.mjs cuida do comum (universo, marca, fecho, cores por papel, proibições, brandbook,
// reaplicar e, por ser família, a resposta "tema" e os papéis que cada tema deixa trocar) e chama estas funções
// para o que é deste modelo: sem personagem (o modelo pula a pergunta 5), a origem das cores do tema (as do tema,
// a da marca no destaque ou uma das 3 paletas prontas do tema), o rótulo do topo, o card final e a amostra dos
// stills de conferência. As cores saem resolvidas no componentes/universo.ts: só os papéis que o tema troca.
//
// Contrato (o mesmo em todo kit com aplicador.mjs):
//   validarPersonagem(p, onde, ctx, erros)   campos do personagem que são do modelo
//   validar(r, ctx, erros)                    o resto das respostas que é do modelo
//   perguntaDoErro(erro, r)                   número da pergunta (ou undefined para usar a regra comum)
//   gerar(r, ctx) -> { arquivos: [[caminho, conteúdo], ...], valores: { chave: texto } }

const ORIGENS = ['tema', 'marca', 'pronta'];
const FRASE_PADRAO = 'me segue pra aprender o próximo passo';
const ENDERECO_GENERICO = 'seu painel · início';

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

/** A cor da marca como destaque legível no fundo do tema: clareia no fundo escuro, escurece no claro, até contraste 4 (texto legível). */
export const destaqueDaMarca = (cor, fundos) => {
  let d = cor.toUpperCase();
  const escuro = fundos.reduce((s, f) => s + luminancia(f), 0) / fundos.length < 0.35;
  for (let i = 0; i < 8 && Math.min(...fundos.map((f) => contraste(d, f))) < 4; i++) d = misturar(d, escuro ? '#FFFFFF' : '#000000', 0.14);
  return d;
};

// ---------------------------------------------------------------- validar

const temaDe = (r, ctx) => r.tema ?? ctx.manifesto?.tema_recomendado ?? 'quadro';
const infoTema = (r, ctx) => (ctx.manifesto?.temas ?? []).find((t) => t.id === temaDe(r, ctx)) ?? null;

export const validarPersonagem = (p, onde, ctx, erros) => {
  erros.push(`${onde}: o modelo Explicação não usa personagem (a narração conduz e as peças entram na palavra falada); tire "personagens" das respostas`);
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
  const e = r.explicacao;
  if (e !== undefined && e !== null) {
    if (typeof e !== 'object' || Array.isArray(e)) erros.push('explicacao: objeto (rotulo)');
    else {
      for (const k of Object.keys(e)) if (k !== 'rotulo') erros.push(`explicacao.${k}: campo desconhecido (aceito: rotulo)`);
      if (e.rotulo !== undefined && e.rotulo !== null && !util.ehTexto(e.rotulo)) erros.push('explicacao.rotulo: texto (o rótulo do topo de todo vídeo)');
    }
  }
  const f = r.fecho;
  if (!f || typeof f !== 'object' || Array.isArray(f) || !util.ehTexto(f.assinatura)) erros.push('fecho.assinatura: obrigatória (o @ do perfil ou o nome que assina o card final)');
  if (f && typeof f === 'object') {
    if (f.frase_assinatura !== undefined && f.frase_assinatura !== null && !util.ehTexto(f.frase_assinatura)) erros.push('fecho.frase_assinatura: texto ou null');
    if (f.aviso_ia !== undefined && typeof f.aviso_ia !== 'boolean') erros.push('fecho.aviso_ia: true ou false');
    if (f.aviso_ia === false && r.voz?.caminho !== 'audio-proprio') erros.push(`fecho.aviso_ia: o aviso "Narração gerada por IA" só sai quando a voz é áudio próprio (voz.caminho "audio-proprio"; veio ${JSON.stringify(r.voz?.caminho ?? null)})`);
  }
  const a = r.amostra;
  if (a !== undefined && a !== null) {
    if (typeof a !== 'object' || Array.isArray(a)) erros.push('amostra: objeto (titulo, item) ou null');
    else for (const k of ['titulo', 'item']) if (a[k] !== undefined && a[k] !== null && !util.ehTexto(a[k])) erros.push(`amostra.${k}: texto`);
  }
};

export const perguntaDoErro = (erro) => {
  if (/^explicacao/.test(erro)) return 1;
  if (/^amostra/.test(erro)) return 2;
  if (/^personagens/.test(erro)) return 2;
  if (/^fecho\.aviso_ia/.test(erro)) return 12;
  return undefined;
};

// ---------------------------------------------------------------- gerar

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
    trocas.destaque = destaqueDaMarca(r.marca.cor, [final.fundo, final.fundo2]);
  }
  Object.assign(trocas, c.paleta ?? {});
  const so = Object.fromEntries(Object.entries(trocas).filter(([k, v]) => trocaveis.includes(k) && v !== base[k]));
  return { tema, origem, pronta: origem === 'pronta' ? c.pronta : null, cores: so, trocaveis };
};

const gerarUniversoTs = (r, ctx) => {
  const { ts, hoje } = ctx.util;
  const marca = r.marca ? { nome: r.marca.nome, cor: r.marca.cor ?? null } : null;
  const cores = resolverCores(r, ctx);
  const tema = { id: cores.tema, origem: cores.origem, pronta: cores.pronta, cores: cores.cores };
  const explicacao = { rotulo: r.explicacao?.rotulo ?? r.universo.nome.toUpperCase(), endereco: r.marca ? `${r.marca.nome} · painel` : ENDERECO_GENERICO };
  const fecho = {
    chamada: r.fecho?.chamada ?? null,
    assinatura: r.fecho.assinatura,
    fraseAssinatura: r.fecho?.frase_assinatura === undefined ? FRASE_PADRAO : r.fecho.frase_assinatura,
    avisoIA: !(r.fecho?.aviso_ia === false && r.voz?.caminho === 'audio-proprio'),
  };
  const amostra = r.amostra && (r.amostra.titulo || r.amostra.item) ? { titulo: r.amostra.titulo ?? null, item: r.amostra.item ?? null } : null;
  return `// Gerado por novo_universo.mjs --aplicar a partir de respostas.json em ${hoje()}.
// Não edite à mão: mude respostas.json e rode --aplicar de novo.
// Os componentes do kit leem daqui o nome, a marca, o tema com as cores já resolvidas, o rótulo do topo,
// o endereço da janela de app, o card final e a amostra dos stills de conferência.
import type { IdTema, Paleta } from './tema';

export const UNIVERSO = ${ts({ nome: r.universo.nome, pasta: r.universo.pasta ?? null, assunto: r.universo.assunto, publico: r.universo.publico, tom: r.universo.tom })} as const;

/** null = nenhuma marca: o card final mostra só a assinatura e a janela de app usa o endereço genérico. */
export const MARCA: { nome: string; cor: string | null } | null = ${ts(marca)};

/** Tema escolhido (pergunta 8) e as cores trocadas (pergunta 9), já resolvidas: só os papéis que o tema troca. */
export const TEMA: { id: IdTema; origem: 'tema' | 'marca' | 'pronta'; pronta: string | null; cores: Partial<Paleta> } = ${ts(tema)};

/** Rótulo do topo de todo vídeo (o roteiro de cada vídeo pode trocar) e o endereço da janela de app. */
export const EXPLICACAO: { rotulo: string; endereco: string } = ${ts(explicacao)};

/** Card final: chamada, assinatura e o aviso de narração por IA (ligado, a não ser com áudio próprio). */
export const FECHO: { chamada: string | null; assinatura: string; fraseAssinatura: string | null; avisoIA: boolean } = ${ts(fecho)};

/** Explicação dos stills de conferência (null = a neutra do kit, em componentes/exemplo.ts). */
export const AMOSTRA: { titulo: string | null; item: string | null } | null = ${ts(amostra)};
`;
};

const tabelaCores = (r, ctx) => {
  const { opcoes } = ctx;
  const { tema, cores, trocaveis } = resolverCores(r, ctx);
  const base = opcoes.paletas[tema];
  const l = ['| Papel | Hex | Troca neste tema | Onde usa |', '|---|---|---|---|'];
  for (const [k, v] of Object.entries(base)) {
    const hex = cores[k] ?? v;
    const nota = cores[k] ? ' (trocado)' : '';
    l.push(`| ${k} | \`${hex}\`${nota} | ${trocaveis.includes(k) ? 'sim' : 'não'} | ${opcoes.papeis?.[k] ?? ''} |`);
  }
  return l.join('\n');
};

const resumoCores = (r, ctx) => {
  const { opcoes } = ctx;
  const { tema, origem, pronta, cores } = resolverCores(r, ctx);
  const n = Object.keys(cores).length;
  if (origem === 'pronta') return `paleta pronta "${opcoes.prontas[tema][pronta].nome}" (\`${pronta}\`)${n ? `, ${n} papel(éis) diferente(s) do tema` : ''}.`;
  if (origem === 'marca') return `as cores do tema, com o destaque puxado da cor da marca (\`${r.marca.cor}\` ficou \`${cores.destaque ?? opcoes.paletas[tema].destaque}\` para ler no fundo).`;
  return n ? `as cores do tema, com ${n} papel(éis) trocado(s) nas respostas.` : 'as cores do tema, como vêm no modelo.';
};

const tabelaTemas = (ctx) => {
  const l = ['| Tema | O que é | O que a cor troca |', '|---|---|---|'];
  for (const t of ctx.manifesto?.temas ?? []) l.push(`| **${t.nome}** (\`${t.id}\`) | ${t.resumo} | ${t.cor_troca} |`);
  return l.join('\n');
};

const resumoCard = (r) => {
  const partes = [];
  if (r.fecho?.chamada) partes.push(`a pergunta "${r.fecho.chamada}" com "comenta aqui"`);
  partes.push(`a assinatura ${r.fecho.assinatura}${r.fecho.frase_assinatura === null ? '' : ` ("${r.fecho.frase_assinatura ?? FRASE_PADRAO}")`}`);
  if (r.marca) partes.push(`o nome da marca ${r.marca.nome}`);
  partes.push('as fontes do dado, quando o vídeo citar regra ou número oficial');
  partes.push(r.fecho?.aviso_ia === false && r.voz?.caminho === 'audio-proprio' ? 'e sem o aviso de narração por IA (voz de áudio próprio)' : 'e o aviso "Narração gerada por IA"');
  return partes.join(', ') + '.';
};

export const gerar = (r, ctx) => {
  const { comum } = ctx;
  const info = infoTema(r, ctx);
  const arquivos = [['componentes/universo.ts', gerarUniversoTs(r, ctx)]];
  const valores = {
    tema_nome: `${info?.nome ?? temaDe(r, ctx)} (\`${temaDe(r, ctx)}\`)`,
    tema_resumo: info?.resumo ?? '',
    tema_cor_troca: info?.cor_troca ?? '',
    tabela_temas: tabelaTemas(ctx),
    cores_resumo: resumoCores(r, ctx),
    tabela_cores: tabelaCores(r, ctx),
    marca_resumo: r.marca ? `${r.marca.nome}${r.marca.cor ? `, cor \`${r.marca.cor}\`` : ''}${r.cores?.origem === 'marca' ? ' (o destaque do tema sai dela)' : ''}; a janela de app mostra "${r.marca.nome} · painel" na barra.` : `nenhuma marca: o card final mostra só a assinatura e a janela de app mostra "${ENDERECO_GENERICO}".`,
    rotulo: r.explicacao?.rotulo ?? r.universo.nome.toUpperCase(),
    fecho_resumo: resumoCard(r),
    lista_nunca: comum.listaNunca(r),
    tabela_vozes: ['| Quem | Caminho | voice_id |', '|---|---|---|', `| narração (uma voz só, o texto inteiro) | ${r.voz?.caminho ?? 'a definir'} | ${r.voz?.voice_id ? `\`${r.voz.voice_id}\`` : 'a escolher'} |`].join('\n'),
  };
  return { arquivos, valores };
};
