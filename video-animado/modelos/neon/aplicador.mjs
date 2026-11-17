// Aplicador do modelo Neon retrô (kit avulso, sem temas): a parte do --aplicar que depende do kit.
// O scripts/novo_universo.mjs cuida do comum (universo, marca, fecho, cores por papel, proibições, brandbook e
// reaplicar) e chama estas funções para o que é deste modelo: sem personagem (o modelo pula as perguntas 5 a 7),
// a oferta (pergunta 8: o que, preço, preço antigo, prazo, selo e texto do botão, mais o letreiro dos stills), a
// origem das cores (pergunta 9: as do modelo, a da marca no letreiro cheio, no destaque e no botão, ou uma das 3
// paletas prontas, mais a troca fina por papel; o neon troca todas as cores, céu, sol e grade também), a receita
// (pergunta 10: narração inteira ou só letreiros na batida da música) e o card final (pergunta 12). Os códigos
// aceitos vêm do opcoes.json e do modelo.json (receitas): nada fica escrito aqui.
//
// Contrato (o mesmo em todo kit com aplicador.mjs):
//   validarPersonagem(p, onde, ctx, erros)   campos do personagem que são do modelo
//   validar(r, ctx, erros)                    o resto das respostas que é do modelo
//   perguntaDoErro(erro, r)                   número da pergunta (ou undefined para usar a regra comum)
//   gerar(r, ctx) -> { arquivos: [[caminho, conteúdo], ...], valores: { chave: texto } }

const ORIGENS = ['modelo', 'marca', 'pronta'];
const CAMPOS_OFERTA = ['tipo', 'o_que', 'preco', 'preco_antigo', 'prazo', 'selo', 'botao'];
const CAMPOS_CORES = ['origem', 'pronta', 'paleta'];
const CAMPOS_FECHO = ['chamada', 'assinatura', 'frase_assinatura', 'aviso_ia'];
const CAMPOS_AMOSTRA = ['letreiro'];
const FRASE_PADRAO = 'me segue pra não perder a próxima';
/** o selo é curto ("só hoje", "última chance"): passou disso, não cabe no selo girado */
const MAX_SELO = 22;
/** o maior preço que o preço que conta mostra (6 dígitos com centavos) */
const MAX_INTEIRO = 999999;

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

/** A cor da marca legível sobre o céu: clareia (o céu é escuro) o mínimo até contraste 4,5. */
export const legivelSobre = (cor, fundo, alvo = 4.5) => {
  let d = cor.toUpperCase();
  const escuro = luminancia(fundo) < 0.35;
  for (let i = 0; i < 30 && contraste(d, fundo) < alvo; i++) d = misturar(d, escuro ? '#FFFFFF' : '#000000', 0.08);
  return d;
};

// ---------------------------------------------------------------- preço no formato brasileiro

/** "R$ 1.299,90", "1299,90", "R$ 89" -> { texto: "R$ 1.299,90", centavos, comCentavos }; null se não for preço. */
export const lerPreco = (v) => {
  if (typeof v !== 'string') return null;
  const m = /^(?:R\$\s?)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/.exec(v.trim());
  if (!m) return null;
  const inteiro = Number(m[1].replace(/\./g, ''));
  if (!Number.isFinite(inteiro) || inteiro > MAX_INTEIRO) return null;
  const cent = m[2] === undefined ? null : m[2].padEnd(2, '0');
  const milhar = String(inteiro).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return { texto: `R$ ${milhar}${cent === null ? '' : `,${cent}`}`, centavos: inteiro * 100 + (cent === null ? 0 : Number(cent)), comCentavos: cent !== null };
};

// ---------------------------------------------------------------- validar

export const validarPersonagem = (p, onde, ctx, erros) => {
  erros.push(`${onde}: o modelo Neon retrô não usa personagem (o letreiro e as peças conduzem, na voz ou na batida); tire "personagens" das respostas`);
};

const ehLinhas = (v, util) => Array.isArray(v) && v.length >= 1 && v.length <= 2 && v.every((l) => util.ehTexto(l));

export const validar = (r, ctx, erros) => {
  const { opcoes, util, manifesto } = ctx;
  // oferta (pergunta 8)
  const o = r.oferta;
  const tipos = Object.keys(opcoes.tipos_de_video);
  if (!o || typeof o !== 'object' || Array.isArray(o)) erros.push('oferta: obrigatória (o_que, preco, preco_antigo, prazo, selo, botao), a pergunta 8');
  else {
    for (const k of Object.keys(o)) if (!CAMPOS_OFERTA.includes(k)) erros.push(`oferta.${k}: campo desconhecido (aceitos: ${CAMPOS_OFERTA.join(', ')})`);
    if (o.tipo !== undefined && o.tipo !== null && !tipos.includes(o.tipo)) erros.push(`oferta.tipo: "${o.tipo}" não existe (aceitos: ${tipos.join(', ')})`);
    if (!util.ehTexto(o.o_que)) erros.push('oferta.o_que: obrigatório (o que está em oferta ou o que se lança, ex.: "Jaqueta jeans")');
    const tipo = o.tipo ?? 'oferta';
    if (o.preco === undefined || o.preco === null) {
      if (tipo === 'oferta') erros.push('oferta.preco: obrigatório no vídeo de oferta (formato brasileiro, como "R$ 1.299,90")');
    } else if (!lerPreco(o.preco)) erros.push(`oferta.preco: ${JSON.stringify(o.preco)} não é um preço (formato brasileiro, como "R$ 1.299,90" ou "R$ 89", até R$ 999.999,99)`);
    if (o.preco_antigo !== undefined && o.preco_antigo !== null) {
      const antigo = lerPreco(o.preco_antigo);
      const novo = lerPreco(o.preco);
      if (!antigo) erros.push(`oferta.preco_antigo: ${JSON.stringify(o.preco_antigo)} não é um preço (formato brasileiro, como "R$ 1.299,90", ou null)`);
      else if (o.preco === undefined || o.preco === null) erros.push('oferta.preco_antigo: só vale com oferta.preco (o preço antigo aparece riscado ao lado do novo)');
      else if (novo && antigo.centavos <= novo.centavos) erros.push(`oferta.preco_antigo: ${antigo.texto} não é maior que o preço ${novo.texto} (o antigo sai riscado e o preço conta dele até o novo)`);
    }
    for (const k of ['prazo', 'botao']) if (o[k] !== undefined && o[k] !== null && !util.ehTexto(o[k])) erros.push(`oferta.${k}: texto${k === 'prazo' ? ' ou null' : ''}`);
    if (o.selo !== undefined && o.selo !== null) {
      if (!util.ehTexto(o.selo)) erros.push('oferta.selo: texto curto (ex.: "só hoje") ou null para não ter selo');
      else if (o.selo.trim().length > MAX_SELO) erros.push(`oferta.selo: "${o.selo}" tem ${o.selo.trim().length} letras; o selo é curto, até ${MAX_SELO} (ex.: "só hoje", "última chance"); o texto longo vai no prazo ou no botão`);
    }
  }
  // letreiro dos stills (pergunta 8)
  const a = r.amostra;
  if (a !== undefined && a !== null) {
    if (typeof a !== 'object' || Array.isArray(a)) erros.push('amostra: objeto { "letreiro": ["LINHA 1", "LINHA 2"] } ou null');
    else {
      for (const k of Object.keys(a)) if (!CAMPOS_AMOSTRA.includes(k)) erros.push(`amostra.${k}: campo desconhecido (aceitos: ${CAMPOS_AMOSTRA.join(', ')})`);
      if (a.letreiro !== undefined && a.letreiro !== null && !ehLinhas(a.letreiro, util)) erros.push('amostra.letreiro: lista de 1 ou 2 linhas de texto (o letreiro neon dos stills)');
    }
  }
  // cores (pergunta 9)
  const prontas = Object.keys(opcoes.paletas);
  const c = r.cores;
  if (c !== undefined && c !== null) {
    if (typeof c !== 'object' || Array.isArray(c)) erros.push('cores: objeto (origem, pronta, paleta)');
    else {
      for (const k of Object.keys(c)) if (!CAMPOS_CORES.includes(k)) erros.push(`cores.${k}: campo desconhecido (aceitos: ${CAMPOS_CORES.join(', ')})`);
      if (c.origem !== undefined && c.origem !== null && !ORIGENS.includes(c.origem)) erros.push(`cores.origem: "${c.origem}" não existe (aceitos: ${ORIGENS.join(', ')})`);
      if (c.origem === 'marca' && !r.marca?.cor) erros.push('cores.origem: "marca" pede a cor da marca (marca.cor, pergunta 4); sem marca, use "modelo" ou uma pronta');
      const pede = c.origem === 'pronta' || ((c.origem === undefined || c.origem === null) && c.pronta);
      if (pede) {
        if (!util.ehTexto(c.pronta)) erros.push(`cores.pronta: qual das 3 paletas prontas (aceitas: ${prontas.join(', ')})`);
        else if (!prontas.includes(c.pronta)) erros.push(`cores.pronta: "${c.pronta}" não é paleta pronta deste modelo (aceitas: ${prontas.join(', ')})`);
      } else if (c.pronta !== undefined && c.pronta !== null) erros.push(`cores.pronta: só vale com cores.origem "pronta" (veio origem "${c.origem}")`);
      if (c.paleta !== undefined && c.paleta !== null && (typeof c.paleta !== 'object' || Array.isArray(c.paleta))) erros.push('cores.paleta: objeto papel -> hex, ou null');
    }
  }
  // receita (pergunta 10)
  const receitas = Array.isArray(manifesto?.receitas) ? manifesto.receitas : [manifesto?.receita ?? 'narracao-inteira'];
  if (r.receita !== undefined && r.receita !== null && !receitas.includes(r.receita)) erros.push(`receita: "${r.receita}" não existe neste modelo (aceitas: ${receitas.join(', ')}: narração inteira, ou só letreiros na batida da música)`);
  // card final (pergunta 12)
  const f = r.fecho;
  if (!f || typeof f !== 'object' || Array.isArray(f) || !util.ehTexto(f.assinatura)) erros.push('fecho.assinatura: obrigatória (o @ do perfil ou o nome que assina o card final)');
  if (f && typeof f === 'object' && !Array.isArray(f)) {
    for (const k of Object.keys(f)) if (!CAMPOS_FECHO.includes(k)) erros.push(`fecho.${k}: campo desconhecido no card final (aceitos: ${CAMPOS_FECHO.join(', ')})`);
    if (f.frase_assinatura !== undefined && f.frase_assinatura !== null && !util.ehTexto(f.frase_assinatura)) erros.push('fecho.frase_assinatura: texto ou null');
    if (f.aviso_ia !== undefined && typeof f.aviso_ia !== 'boolean') erros.push('fecho.aviso_ia: true ou false');
    const receita = r.receita ?? manifesto?.receita ?? 'narracao-inteira';
    if (f.aviso_ia === false && receita === 'narracao-inteira' && r.voz?.caminho !== 'audio-proprio')
      erros.push(`fecho.aviso_ia: o aviso "Narração gerada por IA" só sai quando a voz é áudio próprio (voz.caminho "audio-proprio"; veio ${JSON.stringify(r.voz?.caminho ?? null)})`);
  }
};

/** Oferta e letreiro dos stills são a 8 (as 5, 6 e 7 são puladas), cores a 9, receita e voz a 10, card final a 12. */
export const perguntaDoErro = (erro) => {
  if (/^(oferta|amostra)/.test(erro)) return 8;
  if (/^cores/.test(erro)) return 9;
  if (/^(receita|voz)/.test(erro)) return 10;
  if (/^fecho/.test(erro)) return 12;
  if (/^personagens/.test(erro)) return 2;
  return undefined;
};

// ---------------------------------------------------------------- resolver

/** As cores resolvidas: a paleta base (a do modelo, synth, ou a pronta), a cor da marca no letreiro cheio, no destaque
 *  e no botão (clareada até contraste 4,5 contra o céu do horizonte, o mais claro) e a troca fina por papel; só o que difere da base. */
export const resolverCores = (r, ctx) => {
  const { opcoes } = ctx;
  const c = r.cores ?? {};
  const origem = c.origem ?? (c.pronta ? 'pronta' : 'modelo');
  const base = origem === 'pronta' ? c.pronta : opcoes.pronta_padrao;
  const cores = opcoes.paletas[base];
  const trocas = {};
  if (origem === 'marca' && r.marca?.cor) {
    const ceu = (c.paleta ?? {}).ceu2 ?? cores.ceu2;
    for (const papel of opcoes.papeis_da_marca) trocas[papel] = legivelSobre(r.marca.cor, ceu);
  }
  Object.assign(trocas, c.paleta ?? {});
  const so = Object.fromEntries(Object.entries(trocas).filter(([k, v]) => k in cores && v.toUpperCase() !== cores[k].toUpperCase()).map(([k, v]) => [k, v.toUpperCase()]));
  return { base, origem, pronta: origem === 'pronta' ? c.pronta : null, cores: so };
};

const receitaDe = (r, ctx) => r.receita ?? ctx.manifesto?.receita ?? 'narracao-inteira';

const ofertaDe = (r, opcoes) => {
  const o = r.oferta;
  return {
    tipo: o.tipo ?? 'oferta',
    oQue: o.o_que.trim(),
    preco: o.preco === undefined || o.preco === null ? null : lerPreco(o.preco),
    precoAntigo: o.preco_antigo === undefined || o.preco_antigo === null ? null : lerPreco(o.preco_antigo),
    prazo: o.prazo === undefined || o.prazo === null ? null : o.prazo.trim(),
    selo: o.selo === null ? null : (o.selo ?? opcoes.oferta_padrao.selo).trim(),
    botao: (o.botao ?? opcoes.oferta_padrao.botao).trim(),
  };
};

// ---------------------------------------------------------------- gerar

const gerarUniversoTs = (r, ctx) => {
  const { ts, hoje } = ctx.util;
  const { opcoes } = ctx;
  const marca = r.marca ? { nome: r.marca.nome, cor: r.marca.cor ?? null } : null;
  const cores = resolverCores(r, ctx);
  const receita = receitaDe(r, ctx);
  const fecho = {
    chamada: r.fecho?.chamada ?? null,
    assinatura: r.fecho.assinatura,
    fraseAssinatura: r.fecho?.frase_assinatura === undefined ? FRASE_PADRAO : r.fecho.frase_assinatura,
    avisoIA: !(r.fecho?.aviso_ia === false && (r.voz?.caminho === 'audio-proprio' || receita !== 'narracao-inteira')),
  };
  const amostra = r.amostra?.letreiro ? { letreiro: r.amostra.letreiro.map((l) => l.trim()) } : null;
  return `// Gerado por novo_universo.mjs --aplicar a partir de respostas.json em ${hoje()}.
// Não edite à mão: mude respostas.json e rode --aplicar de novo.
// Os componentes do kit leem daqui o nome, a marca, a oferta, as cores já resolvidas, a receita, o card final e o
// letreiro dos stills de conferência.
import type { IdPronta, Paleta } from './tema';

export const UNIVERSO = ${ts({ nome: r.universo.nome, pasta: r.universo.pasta ?? null, assunto: r.universo.assunto, publico: r.universo.publico, tom: r.universo.tom })} as const;

/** null = nenhuma marca: o card final mostra só a assinatura. */
export const MARCA: { nome: string; cor: string | null } | null = ${ts(marca)};

/** Preço já lido da resposta: o texto como sai na tela (formato brasileiro) e o valor em centavos (para contar). */
export type Preco = { texto: string; centavos: number; comCentavos: boolean };

/** A oferta (pergunta 8): o que, preço, preço antigo, prazo, selo e texto do botão; o tipo de vídeo guia o exemplo. */
export const OFERTA: { tipo: 'oferta' | 'lancamento' | 'evento' | 'contagem'; oQue: string; preco: Preco | null; precoAntigo: Preco | null; prazo: string | null; selo: string | null; botao: string } = ${ts(ofertaDe(r, opcoes))};

/** Cores (pergunta 9), já resolvidas: a paleta base (synth, por-do-sol, verde-azul) e os papéis trocados. */
export const CORES: { origem: 'modelo' | 'marca' | 'pronta'; pronta: IdPronta | null; base: IdPronta; cores: Partial<Paleta> } = ${ts(cores)};

/** Receita padrão dos vídeos (pergunta 10): narração inteira ou só letreiros na batida da música. */
export const RECEITA: 'narracao-inteira' | 'texto-e-musica' = ${JSON.stringify(receita)};

/** Card final: chamada, assinatura e o aviso de narração por IA (só na receita de narração, e ligado a não ser com áudio próprio). */
export const FECHO: { chamada: string | null; assinatura: string; fraseAssinatura: string | null; avisoIA: boolean } = ${ts(fecho)};

/** Letreiro dos stills de conferência (null = o do opcoes.json, o da tela de referência): 1 ou 2 linhas. */
export const AMOSTRA: { letreiro: string[] } | null = ${ts(amostra)};
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
    return `paleta do modelo (synth), com a cor da marca (\`${r.marca.cor.toUpperCase()}\`) no letreiro cheio (\`${cores.cheio ?? opcoes.paletas[base].cheio}\`), no destaque (\`${cores.destaque ?? opcoes.paletas[base].destaque}\`) e no botão (\`${cores.botao ?? opcoes.paletas[base].botao}\`), clareada o mínimo para ler no céu (contraste 4,5).`;
  return n ? `paleta do modelo (synth), com ${n} papel(éis) trocado(s) nas respostas.` : 'paleta do modelo (synth), como vem no kit: as cores da tela de referência.';
};

const resumoOferta = (r, opcoes) => {
  const o = ofertaDe(r, opcoes);
  const partes = [`**${o.oQue}**`];
  if (o.preco) partes.push(o.precoAntigo ? `de ${o.precoAntigo.texto} por ${o.preco.texto}` : `por ${o.preco.texto}`);
  if (o.prazo) partes.push(`prazo: ${o.prazo}`);
  partes.push(o.selo ? `selo "${o.selo}"` : 'sem selo');
  partes.push(`botão "${o.botao}"`);
  return `${partes.join(', ')} (vídeo de ${opcoes.tipos_de_video[o.tipo].split(':')[0]}).`;
};

const resumoCard = (r, ctx) => {
  const receita = receitaDe(r, ctx);
  const partes = [];
  partes.push(r.fecho?.chamada ? `a chamada "${r.fecho.chamada}"` : 'a chamada da cena final');
  partes.push(`a assinatura ${r.fecho.assinatura}${r.fecho.frase_assinatura === null ? '' : ` ("${r.fecho.frase_assinatura ?? FRASE_PADRAO}")`}`);
  if (r.marca) partes.push(`o nome da marca ${r.marca.nome}`);
  partes.push('as fontes, quando o vídeo citar regra ou condição da oferta');
  if (receita !== 'narracao-inteira') partes.push('e, nos vídeos com narração, o aviso "Narração gerada por IA"');
  else partes.push(r.fecho?.aviso_ia === false && r.voz?.caminho === 'audio-proprio' ? 'e sem o aviso de narração por IA (voz de áudio próprio)' : 'e o aviso "Narração gerada por IA"');
  return partes.join(', ') + '.';
};

export const gerar = (r, ctx) => {
  const { comum, opcoes } = ctx;
  const receita = receitaDe(r, ctx);
  const arquivos = [['componentes/universo.ts', gerarUniversoTs(r, ctx)]];
  const m = opcoes.musica;
  const valores = {
    oferta_resumo: resumoOferta(r, opcoes),
    cores_resumo: resumoCores(r, ctx),
    tabela_cores: tabelaCores(r, ctx),
    tabela_prontas: ['| Pronta | Como é |', '|---|---|', ...Object.entries(opcoes.prontas).map(([id, p]) => `| \`${id}\`${id === opcoes.pronta_padrao ? ' (padrão)' : ''} | ${p.nome} |`)].join('\n'),
    marca_resumo: r.marca
      ? `${r.marca.nome}${r.marca.cor ? `, cor \`${r.marca.cor}\`` : ''}${r.cores?.origem === 'marca' ? ' (o letreiro cheio, o destaque e o botão saem dela)' : ''}. O nome da marca só aparece no card final e no texto da oferta; nunca logo nem marca real de terceiros.`
      : 'nenhuma marca: o card final mostra só a assinatura.',
    fecho_resumo: resumoCard(r, ctx),
    lista_nunca: comum.listaNunca(r),
    receita_nome: receita === 'texto-e-musica' ? 'só letreiros na batida da música (`texto-e-musica`)' : 'narração inteira (`narracao-inteira`)',
    receita_resumo:
      receita === 'texto-e-musica'
        ? `sem voz: cada cena dura um número inteiro de compassos e cada peça acende numa batida da cama synth do kit (${m.bpm} batidas por minuto, ${m.tempos_por_compasso} por compasso) ou da música da pessoa (public/musica.mp3, com o andamento no roteiro). Nenhum crédito de voz.`
        : 'uma voz só fala o texto inteiro e cada letreiro e peça acende na palavra marcada do roteiro; a cama synth fica baixa por baixo. Custo de voz avisado antes.',
    tabela_vozes: ['| Quem | Caminho | voice_id |', '|---|---|---|', `| narração (uma voz só, o texto inteiro${receita === 'texto-e-musica' ? '; só nos vídeos com narração' : ''}) | ${r.voz?.caminho ?? 'a definir'} | ${r.voz?.voice_id ? `\`${r.voz.voice_id}\`` : 'a escolher'} |`].join('\n'),
  };
  return { arquivos, valores };
};
