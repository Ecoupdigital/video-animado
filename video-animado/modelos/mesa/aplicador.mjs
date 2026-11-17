// Aplicador do modelo Mesa vista de cima (kit avulso, sem temas): a parte do --aplicar que depende do kit.
// O scripts/novo_universo.mjs cuida do comum (universo, marca, fecho, cores por papel, proibições, brandbook e
// reaplicar) e chama estas funções para o que é deste modelo: sem personagem (o modelo pula as perguntas 5 a 7),
// a superfície da mesa e o grupo principal (pergunta 8, com a amostra dos stills), a origem das cores (pergunta 9:
// as do modelo, a da marca no destaque, no "PASSO n DE N" e na assinatura, ou uma das 3 paletas prontas, mais a
// troca fina por papel) e o card final (pergunta 12). A cor troca destaque, faixa, etiqueta e card final, nunca o
// material da mesa. Os códigos aceitos vêm do opcoes.json: nada fica escrito aqui.
//
// Contrato (o mesmo em todo kit com aplicador.mjs):
//   validarPersonagem(p, onde, ctx, erros)   campos do personagem que são do modelo
//   validar(r, ctx, erros)                    o resto das respostas que é do modelo
//   perguntaDoErro(erro, r)                   número da pergunta (ou undefined para usar a regra comum)
//   gerar(r, ctx) -> { arquivos: [[caminho, conteúdo], ...], valores: { chave: texto } }

const ORIGENS = ['modelo', 'marca', 'pronta'];
const CAMPOS_MESA = ['superficie', 'grupo'];
const CAMPOS_CORES = ['origem', 'pronta', 'paleta'];
const CAMPOS_FECHO = ['chamada', 'assinatura', 'frase_assinatura', 'aviso_ia'];
const CAMPOS_AMOSTRA = ['titulo', 'frase', 'numero', 'de'];
const FRASE_PADRAO = 'me segue pra ver o próximo passo';

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

/** A cor da marca legível sobre um fundo: clareia no fundo escuro, escurece no claro, até contraste 4 (o mesmo cuidado dos outros kits). */
export const legivelSobre = (cor, fundo) => {
  let d = cor.toUpperCase();
  const escuro = luminancia(fundo) < 0.35;
  for (let i = 0; i < 12 && contraste(d, fundo) < 4; i++) d = misturar(d, escuro ? '#FFFFFF' : '#000000', 0.14);
  return d;
};

// ---------------------------------------------------------------- validar

const superficieDe = (r, opcoes) => r.mesa?.superficie ?? opcoes.superficie_padrao;
const grupoDe = (r, opcoes) => r.mesa?.grupo ?? opcoes.grupo_padrao;
/** papéis de cor do material (as 3 superfícies): a resposta de cores nunca troca */
const papeisDoMaterial = (opcoes) => [...new Set(Object.values(opcoes.superficies).flatMap((s) => Object.keys(s.cores)))];

export const validarPersonagem = (p, onde, ctx, erros) => {
  erros.push(`${onde}: o modelo Mesa vista de cima não usa personagem (a narração conduz e os itens caem na palavra falada); tire "personagens" das respostas`);
};

export const validar = (r, ctx, erros) => {
  const { opcoes, util } = ctx;
  // superfície e grupo (pergunta 8)
  const m = r.mesa;
  const superficies = Object.keys(opcoes.superficies);
  const grupos = Object.keys(opcoes.grupos);
  if (m !== undefined && m !== null) {
    if (typeof m !== 'object' || Array.isArray(m)) erros.push('mesa: objeto { "superficie": "madeira", "grupo": "cozinha" }');
    else {
      for (const k of Object.keys(m)) if (!CAMPOS_MESA.includes(k)) erros.push(`mesa.${k}: campo desconhecido (aceitos: ${CAMPOS_MESA.join(', ')})`);
      if (m.superficie !== undefined && m.superficie !== null && !superficies.includes(m.superficie)) erros.push(`mesa.superficie: "${m.superficie}" não existe (aceitas: ${superficies.join(', ')})`);
      if (m.grupo !== undefined && m.grupo !== null && !grupos.includes(m.grupo)) erros.push(`mesa.grupo: "${m.grupo}" não existe (aceitos: ${grupos.join(', ')}; o roteiro de cada vídeo usa itens dos 3 grupos, o grupo principal só escolhe a peça central e a amostra)`);
    }
  }
  // cores (pergunta 9)
  const prontas = Object.keys(opcoes.paletas);
  const papeis = Object.keys(opcoes.paletas[opcoes.pronta_padrao]);
  const material = papeisDoMaterial(opcoes);
  const c = r.cores;
  if (c !== undefined && c !== null) {
    if (typeof c !== 'object' || Array.isArray(c)) erros.push('cores: objeto (origem, pronta, paleta)');
    else {
      for (const k of Object.keys(c)) if (!CAMPOS_CORES.includes(k)) erros.push(`cores.${k}: campo desconhecido (aceitos: ${CAMPOS_CORES.join(', ')}; a superfície é a resposta "mesa", da pergunta 8)`);
      if (c.origem !== undefined && c.origem !== null && !ORIGENS.includes(c.origem)) erros.push(`cores.origem: "${c.origem}" não existe (aceitos: ${ORIGENS.join(', ')})`);
      if (c.origem === 'marca' && !r.marca?.cor) erros.push('cores.origem: "marca" pede a cor da marca (marca.cor, pergunta 4); sem marca, use "modelo" ou uma pronta');
      const pede = c.origem === 'pronta' || ((c.origem === undefined || c.origem === null) && c.pronta);
      if (pede) {
        if (!util.ehTexto(c.pronta)) erros.push(`cores.pronta: qual das 3 paletas prontas (aceitas: ${prontas.join(', ')})`);
        else if (!prontas.includes(c.pronta)) erros.push(`cores.pronta: "${c.pronta}" não é paleta pronta deste modelo (aceitas: ${prontas.join(', ')})`);
      } else if (c.pronta !== undefined && c.pronta !== null) erros.push(`cores.pronta: só vale com cores.origem "pronta" (veio origem "${c.origem}")`);
      if (c.paleta !== undefined && c.paleta !== null) {
        if (typeof c.paleta !== 'object' || Array.isArray(c.paleta)) erros.push('cores.paleta: objeto papel -> hex, ou null');
        else
          for (const k of Object.keys(c.paleta))
            if (material.includes(k)) erros.push(`cores.paleta.${k}: é cor do material da mesa, e o material não muda de cor (a madeira, o mármore e o pano ficam como são); a resposta de cores troca só destaque, faixa, etiqueta e card final (papéis: ${papeis.join(', ')})`);
      }
    }
  }
  // card final (pergunta 12)
  const f = r.fecho;
  if (!f || typeof f !== 'object' || Array.isArray(f) || !util.ehTexto(f.assinatura)) erros.push('fecho.assinatura: obrigatória (o @ do perfil ou o nome que assina o card final)');
  if (f && typeof f === 'object' && !Array.isArray(f)) {
    for (const k of Object.keys(f)) if (!CAMPOS_FECHO.includes(k)) erros.push(`fecho.${k}: campo desconhecido no card final (aceitos: ${CAMPOS_FECHO.join(', ')})`);
    if (f.frase_assinatura !== undefined && f.frase_assinatura !== null && !util.ehTexto(f.frase_assinatura)) erros.push('fecho.frase_assinatura: texto ou null');
    if (f.aviso_ia !== undefined && typeof f.aviso_ia !== 'boolean') erros.push('fecho.aviso_ia: true ou false');
    if (f.aviso_ia === false && r.voz?.caminho !== 'audio-proprio') erros.push(`fecho.aviso_ia: o aviso "Narração gerada por IA" só sai quando a voz é áudio próprio (voz.caminho "audio-proprio"; veio ${JSON.stringify(r.voz?.caminho ?? null)})`);
  }
  // amostra dos stills (pergunta 8)
  const a = r.amostra;
  if (a !== undefined && a !== null) {
    if (typeof a !== 'object' || Array.isArray(a)) erros.push('amostra: objeto (titulo, frase, numero, de) ou null');
    else {
      for (const k of Object.keys(a)) if (!CAMPOS_AMOSTRA.includes(k)) erros.push(`amostra.${k}: campo desconhecido (aceitos: ${CAMPOS_AMOSTRA.join(', ')})`);
      for (const k of ['titulo', 'frase']) if (a[k] !== undefined && a[k] !== null && !util.ehTexto(a[k])) erros.push(`amostra.${k}: texto`);
      for (const k of ['numero', 'de']) if (a[k] !== undefined && a[k] !== null && (!Number.isInteger(a[k]) || a[k] < 1 || a[k] > 99)) erros.push(`amostra.${k}: número inteiro de 1 a 99`);
      if (Number.isInteger(a.numero) && Number.isInteger(a.de) && a.numero > a.de) erros.push(`amostra.numero: o passo ${a.numero} passa do total ${a.de}`);
    }
  }
};

/** Superfície, grupo e amostra são a 8 (as 5, 6 e 7 são puladas), cores a 9, card final a 12. */
export const perguntaDoErro = (erro) => {
  if (/^(mesa|amostra)/.test(erro)) return 8;
  if (/^cores/.test(erro)) return 9;
  if (/^fecho/.test(erro)) return 12;
  if (/^personagens/.test(erro)) return 2;
  return undefined;
};

// ---------------------------------------------------------------- resolver

/** As cores resolvidas: a paleta base (a do modelo, ambar, ou a pronta), a cor da marca no destaque (legível na faixa),
 *  no "PASSO n DE N" (legível na etiqueta) e na assinatura (legível no card), e a troca fina por papel; só o que difere da base. */
export const resolverCores = (r, ctx) => {
  const { opcoes } = ctx;
  const c = r.cores ?? {};
  const origem = c.origem ?? (c.pronta ? 'pronta' : 'modelo');
  const base = origem === 'pronta' ? c.pronta : opcoes.pronta_padrao;
  const cores = opcoes.paletas[base];
  const trocas = {};
  if (origem === 'marca' && r.marca?.cor) {
    const final = { ...cores, ...(c.paleta ?? {}) };
    trocas.destaque = legivelSobre(r.marca.cor, final.faixa);
    trocas.etiquetaPasso = legivelSobre(r.marca.cor, final.etiqueta);
    trocas.cardDestaque = legivelSobre(r.marca.cor, final.cardFinal);
  }
  Object.assign(trocas, c.paleta ?? {});
  const so = Object.fromEntries(Object.entries(trocas).filter(([k, v]) => k in cores && v.toUpperCase() !== cores[k].toUpperCase()).map(([k, v]) => [k, v.toUpperCase()]));
  return { base, origem, pronta: origem === 'pronta' ? c.pronta : null, cores: so };
};

const amostraDe = (r) => {
  const a = r.amostra;
  if (!a) return null;
  const x = { titulo: a.titulo ?? null, frase: a.frase ?? null, numero: a.numero ?? null, de: a.de ?? null };
  return Object.values(x).some((v) => v !== null) ? x : null;
};

// ---------------------------------------------------------------- gerar

const gerarUniversoTs = (r, ctx) => {
  const { ts, hoje } = ctx.util;
  const { opcoes } = ctx;
  const marca = r.marca ? { nome: r.marca.nome, cor: r.marca.cor ?? null } : null;
  const cores = resolverCores(r, ctx);
  const mesa = { superficie: superficieDe(r, opcoes), grupo: grupoDe(r, opcoes) };
  const fecho = {
    chamada: r.fecho?.chamada ?? null,
    assinatura: r.fecho.assinatura,
    fraseAssinatura: r.fecho?.frase_assinatura === undefined ? FRASE_PADRAO : r.fecho.frase_assinatura,
    avisoIA: !(r.fecho?.aviso_ia === false && r.voz?.caminho === 'audio-proprio'),
  };
  return `// Gerado por novo_universo.mjs --aplicar a partir de respostas.json em ${hoje()}.
// Não edite à mão: mude respostas.json e rode --aplicar de novo.
// Os componentes do kit leem daqui o nome, a marca, a superfície e o grupo principal, as cores já resolvidas,
// o card final e a amostra dos stills de conferência.
import type { IdGrupo, IdPronta, IdSuperficie, Paleta } from './tema';

export const UNIVERSO = ${ts({ nome: r.universo.nome, pasta: r.universo.pasta ?? null, assunto: r.universo.assunto, publico: r.universo.publico, tom: r.universo.tom })} as const;

/** null = nenhuma marca: o card final mostra só a assinatura. */
export const MARCA: { nome: string; cor: string | null } | null = ${ts(marca)};

/** Superfície da mesa e grupo principal (pergunta 8): o grupo escolhe a peça central e a amostra dos stills. */
export const MESA: { superficie: IdSuperficie; grupo: IdGrupo } = ${ts(mesa)};

/** Cores (pergunta 9), já resolvidas: a paleta base (ambar, menta, vinho) e os papéis trocados. O material da mesa nunca muda. */
export const CORES: { origem: 'modelo' | 'marca' | 'pronta'; pronta: IdPronta | null; base: IdPronta; cores: Partial<Paleta> } = ${ts(cores)};

/** Card final: chamada, assinatura e o aviso de narração por IA (ligado, a não ser com áudio próprio). */
export const FECHO: { chamada: string | null; assinatura: string; fraseAssinatura: string | null; avisoIA: boolean } = ${ts(fecho)};

/** Textos dos stills de conferência (null = os do grupo, em opcoes.json): título do passo, frase da faixa e "PASSO n DE N". */
export const AMOSTRA: { titulo: string | null; frase: string | null; numero: number | null; de: number | null } | null = ${ts(amostraDe(r))};
`;
};

const tabelaCores = (r, ctx) => {
  const { opcoes } = ctx;
  const { base, cores } = resolverCores(r, ctx);
  const l = ['| Papel | Hex | Onde usa |', '|---|---|---|'];
  for (const [k, v] of Object.entries(opcoes.paletas[base])) l.push(`| ${k} | \`${cores[k] ?? v}\`${cores[k] ? ' (trocado)' : ''} | ${opcoes.papeis[k] ?? ''} |`);
  return l.join('\n');
};

const resumoCores = (r, ctx) => {
  const { opcoes } = ctx;
  const { base, origem, cores } = resolverCores(r, ctx);
  const nome = (opcoes.prontas[base]?.nome ?? base).split(':')[0].toLowerCase();
  const n = Object.keys(cores).length;
  if (origem === 'pronta') return `paleta pronta ${nome} (\`${base}\`)${n ? `, com ${n} papel(éis) trocado(s) nas respostas` : ''}.`;
  if (origem === 'marca')
    return `paleta do modelo (âmbar), com a cor da marca (\`${r.marca.cor.toUpperCase()}\`) na palavra destacada da faixa (\`${cores.destaque ?? opcoes.paletas[base].destaque}\`), no "PASSO n DE N" da etiqueta (\`${cores.etiquetaPasso ?? opcoes.paletas[base].etiquetaPasso}\`) e na assinatura do card final (\`${cores.cardDestaque ?? opcoes.paletas[base].cardDestaque}\`), cada uma ajustada para ler no fundo dela.`;
  return n ? `paleta do modelo (âmbar), com ${n} papel(éis) trocado(s) nas respostas.` : 'paleta do modelo (âmbar), como vem no kit: as cores da tela de referência.';
};

const tabelaItens = (opcoes) => {
  const l = ['| Grupo | Peça central | Itens (código: o que é na mesa; sobre a peça central) |', '|---|---|---|'];
  for (const [g, info] of Object.entries(opcoes.grupos)) {
    const itens = Object.entries(info.itens)
      .map(([id, v]) => `\`${id}\` ${v.mesa}${v.no_centro === 'camada' ? ' (cobre a peça central)' : v.no_centro === 'pedacos' ? ' (espalha em pedaços sobre a peça central)' : ''}`)
      .join('; ');
    l.push(`| **${info.nome}** (\`${g}\`) | ${info.centro} | ${itens} |`);
  }
  return l.join('\n');
};

const resumoCard = (r) => {
  const partes = [];
  partes.push(r.fecho?.chamada ? `a pergunta "${r.fecho.chamada}" com "comenta aqui"` : 'a pergunta da cena final com "comenta aqui"');
  partes.push(`a assinatura ${r.fecho.assinatura}${r.fecho.frase_assinatura === null ? '' : ` ("${r.fecho.frase_assinatura ?? FRASE_PADRAO}")`}`);
  if (r.marca) partes.push(`o nome da marca ${r.marca.nome}`);
  partes.push('as fontes, quando o vídeo citar regra, número ou tempo oficial');
  partes.push(r.fecho?.aviso_ia === false && r.voz?.caminho === 'audio-proprio' ? 'e sem o aviso de narração por IA (voz de áudio próprio)' : 'e o aviso "Narração gerada por IA"');
  return partes.join(', ') + '.';
};

export const gerar = (r, ctx) => {
  const { comum, opcoes } = ctx;
  const sup = superficieDe(r, opcoes);
  const grupo = grupoDe(r, opcoes);
  const infoSup = opcoes.superficies[sup];
  const infoGrupo = opcoes.grupos[grupo];
  const arquivos = [['componentes/universo.ts', gerarUniversoTs(r, ctx)]];
  const valores = {
    superficie_nome: `${infoSup.nome} (\`${sup}\`)`,
    superficie_resumo: infoSup.resumo,
    grupo_nome: `${infoGrupo.nome} (\`${grupo}\`)`,
    grupo_centro: infoGrupo.centro,
    tabela_superficies: ['| Superfície | Como é |', '|---|---|', ...Object.entries(opcoes.superficies).map(([id, s]) => `| **${s.nome}** (\`${id}\`)${id === sup ? ' · deste universo' : ''} | ${s.resumo} |`)].join('\n'),
    tabela_itens: tabelaItens(opcoes),
    cores_resumo: resumoCores(r, ctx),
    tabela_cores: tabelaCores(r, ctx),
    marca_resumo: r.marca ? `${r.marca.nome}${r.marca.cor ? `, cor \`${r.marca.cor}\`` : ''}${r.cores?.origem === 'marca' ? ' (o destaque, o "PASSO n DE N" e a assinatura saem dela)' : ''}. Nenhum item da mesa leva o nome, o rótulo ou o logo da marca.` : 'nenhuma marca: o card final mostra só a assinatura.',
    fecho_resumo: resumoCard(r),
    lista_nunca: comum.listaNunca(r),
    tabela_vozes: ['| Quem | Caminho | voice_id |', '|---|---|---|', `| narração (uma voz só, o texto inteiro) | ${r.voz?.caminho ?? 'a definir'} | ${r.voz?.voice_id ? `\`${r.voz.voice_id}\`` : 'a escolher'} |`].join('\n'),
  };
  return { arquivos, valores };
};
