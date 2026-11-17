// Aplicador do modelo pixel-16bits: a parte do --aplicar que depende do kit.
// O scripts/novo_universo.mjs cuida do comum (universo, marca, fecho, cores por papel, proibições, brandbook,
// reaplicar) e chama estas funções para o que é deste modelo: um boneco só (a pergunta 7 é pulada), a
// aparência pixel dele (pergunta 6, códigos em base/componentes/opcoes.json), o rótulo e a assinatura do
// topo (pergunta 8) e o card final de perfil (pergunta 12). Depois de gravar os arquivos, o passo "depois"
// gera os 72 sprites do boneco em public/px/ e a folha de opções em public/opcoes.png (python3 gerador/...).
//
// Contrato (o mesmo em todo kit com aplicador.mjs):
//   validarPersonagem(p, onde, ctx, erros)   campos do personagem que são do modelo
//   validar(r, ctx, erros)                    o resto das respostas que é do modelo
//   perguntaDoErro(erro, r)                   número da pergunta (ou undefined para usar a regra comum)
//   gerar(r, ctx) -> { arquivos: [[caminho, conteúdo], ...], valores: { chave: texto } }
//   depois({ dir, r, ctx }) -> [arquivos gerados]   opcional: roda depois que os arquivos foram gravados

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const CAMPOS = ['pele', 'cabelo', 'corCabelo', 'barba', 'oculos', 'roupa', 'estampa', 'simbolo', 'inicial', 'corEstampa', 'cilios'];
const PAPEIS_COR = {
  fundo: 'fundo da tela',
  superficie: 'card branco, card final',
  tinta: 'título, texto dos cards, tarja da legenda',
  suave: 'topo, rótulos mono, texto de apoio',
  linha: 'divisórias da lista e dos blocos',
  apagado: 'caixa de marcar vazia, botão "Seguindo"',
  destaque: 'palavras de destaque do título, selo carimbado, botão "Seguir", fim da assinatura',
  destaqueClaro: 'palavras de destaque na legenda (sobre a tarja escura)',
  acerto: 'item marcado da lista',
  aviso: 'barra e etiqueta de atenção',
  balao: 'balão da conversa',
  balaoResposta: 'balão de resposta da conversa',
};

const ehLetra = (v) => typeof v === 'string' && /^[A-Za-z0-9]$/.test(v.normalize('NFD').replace(/[̀-ͯ]/g, ''));
const inicialDe = (nome) => {
  const m = String(nome ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().match(/[A-Z0-9]/);
  return m ? m[0] : null;
};

// ---------------------------------------------------------------- validar

const validarAparencia = (ap, onde, r, ctx, erros) => {
  const { opcoes, util } = ctx;
  const lugar = `${onde}.aparencia`;
  if (!ap || typeof ap !== 'object' || Array.isArray(ap)) {
    erros.push(`${lugar}: obrigatória (objeto com ${CAMPOS.join(', ')})`);
    return;
  }
  const codigoOuHex = (v, lista) => lista.includes(v) || util.ehHex(v);
  for (const [k, v] of Object.entries(ap)) {
    const l = `${lugar}.${k}`;
    if (!CAMPOS.includes(k)) erros.push(`${l}: campo desconhecido (aceitos: ${CAMPOS.join(', ')})`);
    else if (k === 'pele' && !(v in opcoes.peles)) erros.push(`${l}: tom "${v}" não existe (aceitos: ${Object.keys(opcoes.peles).join(', ')})`);
    else if (k === 'cabelo' && !opcoes.cabelos.includes(v)) erros.push(`${l}: cabelo "${v}" não existe (aceitos: ${opcoes.cabelos.join(', ')})`);
    else if (k === 'corCabelo' && !codigoOuHex(v, Object.keys(opcoes.cores_cabelo))) erros.push(`${l}: "${v}" não existe (aceitos: ${Object.keys(opcoes.cores_cabelo).join(', ')} ou hex #RRGGBB)`);
    else if (k === 'barba' && !opcoes.barbas.includes(v)) erros.push(`${l}: barba "${v}" não existe (aceitos: ${opcoes.barbas.join(', ')})`);
    else if (k === 'oculos' && v !== null && !codigoOuHex(v, Object.keys(opcoes.cores_oculos))) erros.push(`${l}: "${v}" não existe (aceitos: null, ${Object.keys(opcoes.cores_oculos).join(', ')} ou hex #RRGGBB)`);
    else if (k === 'roupa' && !codigoOuHex(v, Object.keys(opcoes.roupas))) erros.push(`${l}: roupa "${v}" não existe (aceitos: ${Object.keys(opcoes.roupas).join(', ')} ou hex #RRGGBB)`);
    else if (k === 'estampa' && !opcoes.estampas.includes(v)) erros.push(`${l}: estampa "${v}" não existe (aceitos: ${opcoes.estampas.join(', ')})`);
    else if (k === 'simbolo' && v !== null && !opcoes.simbolos_marca.includes(v)) erros.push(`${l}: símbolo "${v}" não existe (aceitos: ${opcoes.simbolos_marca.join(', ')})`);
    else if (k === 'inicial' && v !== null && !ehLetra(v)) erros.push(`${l}: uma letra de A a Z ou um número (veio ${JSON.stringify(v)})`);
    else if (k === 'corEstampa' && v !== null && !util.ehHex(v)) erros.push(`${l}: hex #RRGGBB (veio ${JSON.stringify(v)})`);
    else if (k === 'cilios' && typeof v !== 'boolean') erros.push(`${l}: true ou false`);
  }
  for (const k of ['pele', 'cabelo', 'roupa']) if (ap[k] === undefined) erros.push(`${lugar}.${k}: obrigatório (folha de opções, pergunta 6)`);
  const est = ap.estampa ?? (r.marca ? 'simbolo' : 'terminal');
  if (!r.marca && (est === 'simbolo' || est === 'inicial') && !(est === 'simbolo' ? ap.simbolo : ap.inicial)) {
    erros.push(`${lugar}.estampa: sem marca, a estampa fica "terminal" ou "nenhuma" (ou diga o símbolo ou a inicial)`);
  }
  if (r.marca && est === 'simbolo' && !ap.simbolo && !r.marca.simbolo) erros.push(`${lugar}.estampa: "simbolo" pede marca.simbolo ou aparencia.simbolo (aceitos: ${opcoes.simbolos_marca.join(', ')})`);
};

export const validarPersonagem = (p, onde, ctx, erros) => {
  if (p.voz !== undefined && p.voz !== null && typeof p.voz !== 'object') erros.push(`${onde}.voz: objeto (caminho, voice_id)`);
};

export const validar = (r, ctx, erros) => {
  const { opcoes, util } = ctx;
  const ps = Array.isArray(r.personagens) ? r.personagens : [];
  if (ps.length > 1) erros.push(`personagens: o pixel tem um boneco só (a protagonista); vieram ${ps.length}`);
  const prot = ps.find((p) => p && p.papel === 'protagonista');
  if (prot) validarAparencia(prot.aparencia, `personagens[${ps.indexOf(prot)}]`, r, ctx, erros);
  const t = r.topo;
  if (t !== undefined && t !== null) {
    if (typeof t !== 'object' || Array.isArray(t)) erros.push('topo: objeto (rotulo, assinatura)');
    else {
      for (const k of Object.keys(t)) if (!['rotulo', 'assinatura'].includes(k)) erros.push(`topo.${k}: campo desconhecido (aceitos: rotulo, assinatura)`);
      for (const k of ['rotulo', 'assinatura']) if (t[k] !== undefined && t[k] !== null && !util.ehTexto(t[k])) erros.push(`topo.${k}: texto`);
    }
  }
  const f = r.fecho;
  if (!f || typeof f !== 'object' || Array.isArray(f) || !util.ehTexto(f.perfil)) erros.push('fecho.perfil: obrigatório (o @ do perfil que aparece no card final)');
  if (f && typeof f === 'object') {
    if (f.frase !== undefined && f.frase !== null && !util.ehTexto(f.frase)) erros.push('fecho.frase: texto ou null');
    if (f.rotulo !== undefined && f.rotulo !== null && !util.ehTexto(f.rotulo)) erros.push('fecho.rotulo: texto ou null');
  }
  const c = r.cores;
  if (c && c.origem !== undefined && c.origem !== null && !['modelo', 'marca', 'sugerida'].includes(c.origem)) erros.push(`cores.origem: "${c.origem}" (aceitos: modelo, marca, sugerida)`);
  if (c && c.origem === 'marca' && !r.marca?.cor) erros.push('cores.origem: "marca" pede marca.cor');
};

export const perguntaDoErro = (erro) => {
  if (/^personagens:/.test(erro)) return 7;
  if (/^personagens\[\d+\]\.aparencia/.test(erro)) return 6;
  if (/^topo/.test(erro)) return 8;
  if (/^fecho/.test(erro)) return 12;
  return undefined;
};

// ---------------------------------------------------------------- gerar

const protagonista = (r) => (r.personagens ?? []).find((p) => p.papel === 'protagonista');

/** Aparência completa do boneco, com a estampa e a cor resolvidas pela marca. */
export const aparenciaFinal = (r, opcoes) => {
  const ap = { ...protagonista(r).aparencia };
  const m = r.marca;
  const final = {
    pele: ap.pele,
    cabelo: ap.cabelo,
    corCabelo: ap.corCabelo ?? 'castanho',
    barba: ap.barba ?? 'nenhuma',
    oculos: ap.oculos ?? null,
    roupa: ap.roupa,
    estampa: ap.estampa ?? (m ? (m.simbolo ? 'simbolo' : 'inicial') : 'terminal'),
    simbolo: null,
    inicial: null,
    corEstampa: ap.corEstampa ?? (m?.cor ?? opcoes.cor_estampa_padrao),
    cilios: ap.cilios ?? false,
  };
  if (final.estampa === 'simbolo') final.simbolo = ap.simbolo ?? m?.simbolo ?? null;
  if (final.estampa === 'inicial') final.inicial = inicialDe(ap.inicial ?? m?.nome);
  return final;
};

const claro = (hex, t) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
};

const coresDe = (r) => {
  const cores = {};
  if (r.cores?.origem === 'marca' && r.marca?.cor) {
    cores.destaque = r.marca.cor.toUpperCase();
    cores.destaqueClaro = claro(r.marca.cor, 0.35);
  }
  return { ...cores, ...(r.cores?.paleta ?? {}) };
};

export const topoDe = (r) => ({
  rotulo: r.topo?.rotulo ?? `// ${r.universo.nome.toLowerCase()}`,
  assinatura: r.topo?.assinatura ?? (r.marca ? r.marca.nome : r.universo.nome).toUpperCase(),
});

export const perfilDe = (r) => ({
  arroba: r.fecho.perfil,
  frase: r.fecho.frase === undefined ? 'me segue pra mais' : r.fecho.frase,
  rotulo: r.fecho.rotulo ?? (r.marca ? `// ${r.marca.nome.toLowerCase()}` : '// perfil'),
});

const gerarUniversoTs = (r, opcoes, util) => {
  const { ts, hoje } = util;
  const marca = r.marca ? { nome: r.marca.nome, cor: r.marca.cor ?? null, simbolo: r.marca.simbolo ?? null } : null;
  const p = protagonista(r);
  return `// Gerado por novo_universo.mjs --aplicar a partir de respostas.json em ${hoje()}.
// Não edite à mão: mude respostas.json e rode --aplicar de novo.
// Os componentes do kit leem daqui o nome, a marca, o topo, o card final de perfil e as trocas de cor.
import type { Paleta } from './cores';

export const UNIVERSO = ${ts({ nome: r.universo.nome, pasta: r.universo.pasta ?? null, assunto: r.universo.assunto, publico: r.universo.publico, tom: r.universo.tom })} as const;

/** null = nenhuma marca: estampa ">_" ou nenhuma e card final só com o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null } | null = ${ts(marca)};

/** Topo de todo vídeo: rótulo à esquerda e assinatura à direita (o pedaço depois do último ponto sai no destaque). */
export const TOPO: { rotulo: string; assinatura: string } = ${ts(topoDe(r))};

/** Card final de perfil: o @, a frase e o rótulo em cima do card. */
export const PERFIL: { arroba: string; frase: string | null; rotulo: string } = ${ts(perfilDe(r))};

/** O boneco do universo (os 72 sprites dele ficam em public/px/, gerados pelo --aplicar). */
export const BONECO: { nome: string } = ${ts({ nome: p.nome })};

/** Papéis de cor trocados nas respostas (o resto vem do preset claro-violeta). */
export const CORES: Partial<Paleta> = ${ts(coresDe(r))};
`;
};

const DESCR = {
  pele: (v) => `tom ${v}`,
  cabelo: (v) => `cabelo ${v}`,
  corCabelo: (v) => `cor do cabelo ${v}`,
  barba: (v) => (v === 'nenhuma' ? 'sem barba' : `barba ${v}`),
  oculos: (v) => (v ? `óculos ${v}` : 'sem óculos'),
  roupa: (v) => `roupa ${v}`,
};

const tabelaAparencia = (ap) => {
  const l = ['| Campo | Código |', '|---|---|'];
  for (const [k, v] of Object.entries(ap)) if (v !== null) l.push(`| ${k} | \`${v}\` |`);
  return l.join('\n');
};

const tabelaCores = (r, opcoes) => {
  const base = opcoes.paletas['claro-violeta'];
  const trocas = coresDe(r);
  const l = ['| Papel | Hex | Onde usa |', '|---|---|---|'];
  for (const [k, v] of Object.entries(base)) l.push(`| ${k} | \`${trocas[k] ?? v}\`${trocas[k] ? ' (trocado)' : ''} | ${PAPEIS_COR[k] ?? ''} |`);
  return l.join('\n');
};

export const gerar = (r, ctx) => {
  const { opcoes, util, comum } = ctx;
  const ap = aparenciaFinal(r, opcoes);
  const p = protagonista(r);
  const topo = topoDe(r);
  const perfil = perfilDe(r);
  const arquivos = [
    ['componentes/universo.ts', gerarUniversoTs(r, opcoes, util)],
    ['aparencia.json', JSON.stringify(ap, null, 2) + '\n'],
  ];
  const estampa = { terminal: '">_"', simbolo: `o símbolo ${ap.simbolo}`, inicial: `a inicial ${ap.inicial}`, nenhuma: 'nenhuma' }[ap.estampa];
  const valores = {
    boneco_nome: p.nome,
    boneco_quem: p.quem_e ? util.umaLinha(p.quem_e) : 'apresentador das notícias do universo',
    boneco_resumo: `${Object.entries(DESCR).map(([k, f]) => f(ap[k])).join(', ')}, estampa ${estampa}${ap.estampa === 'nenhuma' ? '' : ` na cor \`${ap.corEstampa}\``}`,
    tabela_aparencia: tabelaAparencia(ap),
    marca_resumo: r.marca
      ? `${r.marca.nome}${r.marca.cor ? `, cor \`${r.marca.cor}\`` : ''}${r.marca.simbolo ? `, símbolo ${r.marca.simbolo}` : ''}${r.cores?.origem === 'marca' ? ' (o destaque do vídeo sai da cor da marca)' : ''}.`
      : 'nenhuma marca: estampa ">_" ou nenhuma, sem logo, e o card final só com o perfil.',
    topo_rotulo: topo.rotulo,
    topo_assinatura: topo.assinatura,
    perfil_arroba: perfil.arroba,
    perfil_frase: perfil.frase ?? '(sem frase)',
    perfil_rotulo: perfil.rotulo,
    tabela_cores: tabelaCores(r, opcoes),
    lista_nunca: comum.listaNunca(r),
    tabela_vozes: ['| Quem | Caminho | voice_id |', '|---|---|---|', `| ${p.nome} (narração inteira, uma voz) | ${r.voz?.caminho ?? 'a definir'} | ${r.voz?.voice_id ? `\`${r.voz.voice_id}\`` : 'a escolher'} |`].join('\n'),
  };
  return { arquivos, valores };
};

// ---------------------------------------------------------------- depois: sprites e folha de opções

export const depois = ({ dir }) => {
  const py = process.env.PYTHON || 'python3';
  const rodar = (args) => {
    const s = spawnSync(py, args, { cwd: dir, encoding: 'utf8' });
    if (s.error) throw new Error(`${py} não rodou (${s.error.message}); instale o Python 3 com numpy e Pillow`);
    if (s.status !== 0) throw new Error(`${args.join(' ')} falhou: ${(s.stdout + s.stderr).trim()}`);
  };
  rodar([path.join('gerador', 'sprites.py'), 'aparencia.json', path.join('public', 'px')]);
  rodar([path.join('gerador', 'opcoes.py'), path.join('public', 'opcoes.png'), 'aparencia.json']);
  return ['public/px/ (72 sprites)', 'public/opcoes.png'];
};
