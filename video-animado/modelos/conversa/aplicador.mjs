// Aplicador do modelo Conversa no celular (kit avulso, sem temas): a parte do --aplicar que depende do kit.
// O scripts/novo_universo.mjs cuida do comum (universo, marca, fecho, cores por papel, proibições, brandbook e
// reaplicar) e chama estas funções para o que é deste modelo: os 2 lados da conversa (exatamente 2 pessoas, uma de
// cada lado: à direita o dono do celular, à esquerda o contato do cabeçalho, com avatar e status), a tela do chat
// (fundo, horário, sinal de lido, hora inicial), a origem das cores (as do modelo, a da marca nas bolhas da direita e
// no destaque, ou uma das 3 paletas prontas, mais a troca fina por papel), a receita (duas vozes ou só texto e
// música), o card final e a amostra dos stills de conferência. Os códigos aceitos vêm do opcoes.json e do
// modelo.json (receitas): nada fica escrito aqui.
//
// Contrato (o mesmo em todo kit com aplicador.mjs):
//   validarPersonagem(p, onde, ctx, erros)   campos do personagem que são do modelo
//   validar(r, ctx, erros)                    o resto das respostas que é do modelo
//   perguntaDoErro(erro, r)                   número da pergunta (ou undefined para usar a regra comum)
//   gerar(r, ctx) -> { arquivos: [[caminho, conteúdo], ...], valores: { chave: texto } }

const ORIGENS = ['modelo', 'marca', 'pronta'];
const LADOS = ['direita', 'esquerda'];
const CAMPOS_PESSOA = ['id', 'nome', 'papel', 'lado', 'idade', 'quem_e', 'status', 'avatar', 'voz'];
const CAMPOS_TELA = ['fundo', 'horario', 'lido', 'hora'];
const CAMPOS_FECHO = ['chamada', 'palavra', 'aviso_ficticio'];
const CAMPOS_AMOSTRA = ['titulo', 'mensagem'];
const COR_AVATAR = ['#F4A6C0', '#B9B4D6', '#9FD8C6', '#FFD08A'];

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
/** Texto legível sobre um fundo: a preferida, se tiver contraste 4,5, senão quase preto ou branco (como no tema.tsx). */
const legivel = (fundo, preferida) => {
  if (preferida && contraste(preferida, fundo) >= 4.5) return preferida.toUpperCase();
  return contraste('#1D1D1F', fundo) >= contraste('#FFFFFF', fundo) ? '#1D1D1F' : '#FFFFFF';
};

/** A cor da marca como destaque legível no fundo: clareia no fundo escuro, escurece no claro, até contraste 4
 *  (o mesmo cuidado dos outros kits) contra os dois lados do degradê do fundo. */
export const destaqueDaMarca = (cor, fundos) => {
  let d = cor.toUpperCase();
  const escuro = fundos.reduce((s, f) => s + luminancia(f), 0) / fundos.length < 0.35;
  for (let i = 0; i < 8 && Math.min(...fundos.map((f) => contraste(d, f))) < 4; i++) d = misturar(d, escuro ? '#FFFFFF' : '#000000', 0.14);
  return d;
};

// ---------------------------------------------------------------- validar

const ehBool = (v) => typeof v === 'boolean';
const ehHora = (v) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

const validarAvatar = (a, onde, ctx, erros) => {
  const { opcoes, util } = ctx;
  if (a === undefined || a === null) return;
  if (typeof a !== 'object' || Array.isArray(a)) return erros.push(`${onde}.avatar: objeto { "tipo": "inicial" ou "desenho", "desenho": "...", "cor": "#RRGGBB" }`);
  for (const k of Object.keys(a)) if (!['tipo', 'desenho', 'cor'].includes(k)) erros.push(`${onde}.avatar.${k}: campo desconhecido (aceitos: tipo, desenho, cor)`);
  const desenhos = Object.keys(opcoes.avatares);
  if (a.tipo !== undefined && !['inicial', 'desenho'].includes(a.tipo)) erros.push(`${onde}.avatar.tipo: "inicial" (a primeira letra do nome) ou "desenho" (veio ${JSON.stringify(a.tipo)})`);
  const tipo = a.tipo ?? (a.desenho ? 'desenho' : 'inicial');
  if (tipo === 'desenho') {
    if (!util.ehTexto(a.desenho)) erros.push(`${onde}.avatar.desenho: qual desenho (aceitos: ${desenhos.join(', ')})`);
    else if (!desenhos.includes(a.desenho)) erros.push(`${onde}.avatar.desenho: "${a.desenho}" não existe (aceitos: ${desenhos.join(', ')})`);
  } else if (a.desenho !== undefined && a.desenho !== null) erros.push(`${onde}.avatar.desenho: só vale com avatar.tipo "desenho"`);
  if (a.cor !== undefined && a.cor !== null && !util.ehHex(a.cor)) erros.push(`${onde}.avatar.cor: hex #RRGGBB (veio ${JSON.stringify(a.cor)})`);
};

export const validarPersonagem = (p, onde, ctx, erros) => {
  const { util } = ctx;
  for (const k of Object.keys(p)) if (!CAMPOS_PESSOA.includes(k)) erros.push(`${onde}.${k}: campo desconhecido (aceitos: ${CAMPOS_PESSOA.join(', ')})`);
  if (!LADOS.includes(p.lado)) erros.push(`${onde}.lado: "direita" (o dono do celular) ou "esquerda" (o contato do cabeçalho) (veio ${JSON.stringify(p.lado)})`);
  else if (p.lado === 'direita' && p.papel !== 'protagonista') erros.push(`${onde}.papel: quem fica à direita é o dono do celular, papel "protagonista"`);
  else if (p.lado === 'esquerda' && p.papel !== 'apoio') erros.push(`${onde}.papel: quem fica à esquerda é o contato do cabeçalho, papel "apoio"`);
  if (p.quem_e !== undefined && p.quem_e !== null && !util.ehTexto(p.quem_e)) erros.push(`${onde}.quem_e: texto`);
  if (p.status !== undefined && p.status !== null && !util.ehTexto(p.status)) erros.push(`${onde}.status: texto (ex.: "online") ou null para nenhum`);
  validarAvatar(p.avatar, onde, ctx, erros);
  if (p.voz !== undefined && p.voz !== null && (typeof p.voz !== 'object' || Array.isArray(p.voz))) erros.push(`${onde}.voz: objeto (caminho, voice_id)`);
};

export const validar = (r, ctx, erros) => {
  const { opcoes, util, manifesto } = ctx;
  // os 2 lados da conversa
  const ps = Array.isArray(r.personagens) ? r.personagens.filter((p) => p && typeof p === 'object') : [];
  if (Array.isArray(r.personagens) && r.personagens.length !== 2) erros.push(`personagens: a conversa é de exatamente 2 pessoas, uma de cada lado (vieram ${r.personagens.length}); conversa em grupo não existe neste modelo`);
  else if (ps.length === 2 && ps.every((p) => LADOS.includes(p.lado)) && ps[0].lado === ps[1].lado) erros.push(`personagens: as 2 pessoas estão do mesmo lado ("${ps[0].lado}"); uma fica à direita (o dono do celular) e a outra à esquerda (o contato do cabeçalho)`);
  // tela do chat
  const t = r.tela;
  if (t !== undefined && t !== null) {
    if (typeof t !== 'object' || Array.isArray(t)) erros.push('tela: objeto { "fundo": "pontos", "horario": true, "lido": true, "hora": "18:30" }');
    else {
      for (const k of Object.keys(t)) if (!CAMPOS_TELA.includes(k)) erros.push(`tela.${k}: campo desconhecido (aceitos: ${CAMPOS_TELA.join(', ')})`);
      const fundos = Object.keys(opcoes.fundos_chat);
      if (t.fundo !== undefined && t.fundo !== null && !fundos.includes(t.fundo)) erros.push(`tela.fundo: "${t.fundo}" não existe (aceitos: ${fundos.join(', ')})`);
      for (const k of ['horario', 'lido']) if (t[k] !== undefined && !ehBool(t[k])) erros.push(`tela.${k}: true ou false (veio ${JSON.stringify(t[k])})`);
      if (t.hora !== undefined && t.hora !== null && !ehHora(t.hora)) erros.push(`tela.hora: hora da primeira mensagem, HH:MM (veio ${JSON.stringify(t.hora)})`);
    }
  }
  // cores
  const prontas = Object.keys(opcoes.paletas);
  const c = r.cores;
  if (c !== undefined && c !== null) {
    if (typeof c !== 'object' || Array.isArray(c)) erros.push('cores: objeto (origem, pronta, paleta)');
    else {
      for (const k of Object.keys(c)) if (!['origem', 'pronta', 'paleta'].includes(k)) erros.push(`cores.${k}: campo desconhecido (aceitos: origem, pronta, paleta)`);
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
  // receita
  const receitas = Array.isArray(manifesto?.receitas) ? manifesto.receitas : [manifesto?.receita ?? 'vozes-por-fala'];
  if (r.receita !== undefined && r.receita !== null && !receitas.includes(r.receita)) erros.push(`receita: "${r.receita}" não existe neste modelo (aceitas: ${receitas.join(', ')})`);
  // card final
  const f = r.fecho;
  if (f && typeof f === 'object' && !Array.isArray(f)) for (const k of Object.keys(f)) if (!CAMPOS_FECHO.includes(k)) erros.push(`fecho.${k}: campo desconhecido no card final (aceitos: ${CAMPOS_FECHO.join(', ')})`);
  // amostra dos stills
  const a = r.amostra;
  if (a !== undefined && a !== null) {
    if (typeof a !== 'object' || Array.isArray(a)) erros.push('amostra: objeto (titulo, mensagem) ou null');
    else {
      for (const k of Object.keys(a)) if (!CAMPOS_AMOSTRA.includes(k)) erros.push(`amostra.${k}: campo desconhecido (aceitos: ${CAMPOS_AMOSTRA.join(', ')})`);
      for (const k of CAMPOS_AMOSTRA) if (a[k] !== undefined && a[k] !== null && !util.ehTexto(a[k])) erros.push(`amostra.${k}: texto`);
    }
  }
};

/** Quem conversa é a 5 (as 6 e 7 são puladas), a tela do chat a 8, cores a 9, receita e vozes a 10, card final a 12. */
export const perguntaDoErro = (erro) => {
  if (/^personagens\[\d+\]\.voz/.test(erro)) return 10;
  if (/^personagens/.test(erro)) return 5;
  if (/^tela/.test(erro)) return 8;
  if (/^cores/.test(erro)) return 9;
  if (/^(receita|voz)/.test(erro)) return 10;
  if (/^fecho/.test(erro)) return 12;
  if (/^amostra/.test(erro)) return 2;
  return undefined;
};

// ---------------------------------------------------------------- resolver

/** As cores resolvidas: a paleta base (a do modelo, claro, ou a pronta), a cor da marca na bolha da direita, no texto
 *  dela (legível) e no destaque (legível no fundo), e a troca fina por papel; só o que difere da base. */
export const resolverCores = (r, ctx) => {
  const { opcoes } = ctx;
  const c = r.cores ?? {};
  const origem = c.origem ?? (c.pronta ? 'pronta' : 'modelo');
  const base = origem === 'pronta' ? c.pronta : opcoes.pronta_padrao;
  const cores = opcoes.paletas[base];
  const trocas = {};
  if (origem === 'marca' && r.marca?.cor) {
    const cor = r.marca.cor.toUpperCase();
    trocas.bolhaDireita = cor;
    trocas.textoDireita = legivel(cor, contraste('#FFFFFF', cor) >= 4.5 ? '#FFFFFF' : cores.textoDireita);
    trocas.destaque = destaqueDaMarca(cor, [cores.fundo, cores.fundo2]);
  }
  Object.assign(trocas, c.paleta ?? {});
  const so = Object.fromEntries(Object.entries(trocas).filter(([k, v]) => v !== cores[k]));
  return { base, origem, pronta: origem === 'pronta' ? c.pronta : null, cores: so };
};

const ladoDe = (r, lado) => (r.personagens ?? []).find((p) => p.lado === lado);
const telaDe = (r, opcoes) => ({ fundo: r.tela?.fundo ?? 'pontos', horario: r.tela?.horario !== false, lido: r.tela?.lido !== false, hora: r.tela?.hora ?? opcoes.hora_padrao });
const receitaDe = (r, ctx) => r.receita ?? ctx.manifesto?.receita ?? 'vozes-por-fala';
const avatarDe = (p, i) => {
  const a = p.avatar ?? {};
  const tipo = a.tipo ?? (a.desenho ? 'desenho' : 'inicial');
  return { tipo, desenho: tipo === 'desenho' ? a.desenho : null, cor: (a.cor ?? COR_AVATAR[i % COR_AVATAR.length]).toUpperCase() };
};
const statusDe = (p, opcoes) => (p.status === null ? null : p.status ?? (p.lado === 'esquerda' ? opcoes.status_padrao : null));

// ---------------------------------------------------------------- gerar

const gerarUniversoTs = (r, ctx) => {
  const { ts, hoje } = ctx.util;
  const { opcoes } = ctx;
  const marca = r.marca ? { nome: r.marca.nome, cor: r.marca.cor ?? null, simbolo: r.marca.simbolo ?? null, palavraFecho: r.marca.palavra_fecho ?? null } : null;
  const cores = resolverCores(r, ctx);
  // o aviso de conversa encenada só some com aviso_ficticio: false explícito
  const fecho = { chamada: r.fecho?.chamada ?? null, palavra: r.fecho?.palavra ?? r.marca?.palavra_fecho ?? null, avisoFicticio: r.fecho?.aviso_ficticio !== false };
  const pessoas = {};
  r.personagens.forEach((p, i) => {
    pessoas[p.id] = { nome: p.nome, papel: p.papel, lado: p.lado, status: statusDe(p, opcoes), avatar: avatarDe(p, i) };
  });
  return `// Gerado por novo_universo.mjs --aplicar a partir de respostas.json em ${hoje()}.
// Não edite à mão: mude respostas.json e rode --aplicar de novo.
// Os componentes do kit leem daqui o nome, a marca, o card final, as cores já resolvidas, a tela do chat, a receita
// padrão, a amostra dos stills e os 2 lados da conversa.
import type { Paleta } from './tema';

export const UNIVERSO = ${ts({ nome: r.universo.nome, pasta: r.universo.pasta ?? null, assunto: r.universo.assunto, publico: r.universo.publico, tom: r.universo.tom })} as const;

/** null = nenhuma marca: card final de seguir o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null; palavraFecho: string | null } | null = ${ts(marca)};

/** Card final: chamada, palavra do "Comenta" e o aviso de conversa encenada (ligado se não vier false). */
export const FECHO: { chamada: string | null; palavra: string | null; avisoFicticio: boolean } = ${ts(fecho)};

/** Cores (pergunta 9), já resolvidas: a paleta base (claro, escuro, vivo) e os papéis trocados. */
export const TEMA: { origem: 'modelo' | 'marca' | 'pronta'; pronta: string | null; base: string; cores: Partial<Paleta> } = ${ts({ origem: cores.origem, pronta: cores.pronta, base: cores.base, cores: cores.cores })};

/** Tela do chat (pergunta 8): desenho do fundo da conversa, horário e sinal de lido ligados ou não, hora inicial. */
export const TELA: { fundo: string; horario: boolean; lido: boolean; hora: string } = ${ts(telaDe(r, opcoes))};

/** Receita padrão dos vídeos (pergunta 10): duas vozes, uma por lado, ou só texto e música. */
export const RECEITA: 'vozes-por-fala' | 'texto-e-musica' = ${JSON.stringify(receitaDe(r, ctx))};

/** Textos dos stills de conferência (pergunta 2, opcional): o título da capa e a primeira mensagem do contato. */
export const AMOSTRA: { titulo: string | null; mensagem: string | null } = ${ts({ titulo: r.amostra?.titulo ?? null, mensagem: r.amostra?.mensagem ?? null })};

export type Lado = 'esquerda' | 'direita';
export type Avatar = { tipo: 'inicial' | 'desenho'; desenho: string | null; cor: string };
export type PessoaDaConversa = { nome: string; papel: 'protagonista' | 'apoio'; lado: Lado; status: string | null; avatar: Avatar };
/** Os 2 lados da conversa (pergunta 5): à direita o dono do celular, à esquerda o contato do cabeçalho. */
export const PESSOAS: Record<string, PessoaDaConversa> = ${ts(pessoas)};
`;
};

const gerarFicha = (p, i, r, ctx) => {
  const { util, opcoes } = ctx;
  const av = avatarDe(p, i);
  const st = statusDe(p, opcoes);
  const dono = p.lado === 'direita';
  return `# ${p.nome}

**Lado:** ${dono ? 'direita, o dono do celular (as bolhas dele ficam à direita, com o sinal de lido)' : 'esquerda, o contato do cabeçalho (nome, avatar e status no alto da tela; as bolhas dele ficam à esquerda e o digitando aparece antes delas)'}.
**Papel:** ${p.papel}${p.idade !== undefined ? ` · ${p.idade} anos` : ''}.
**Quem é:** ${util.umaLinha(p.quem_e) || 'a definir'}.

## Na tela
- **Avatar:** ${av.tipo === 'desenho' ? `desenho \`${av.desenho}\` (${opcoes.avatares[av.desenho]})` : `a inicial "${util.umaLinha(p.nome).match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() ?? '?'}"`} num círculo \`${av.cor}\`${dono ? ' (o avatar do dono não aparece na conversa; fica guardado)' : ''}.
- **Status:** ${st ? `"${st}"` : 'nenhum'}${dono ? ' (só o do contato aparece, no cabeçalho)' : ''}.
- **Bolhas:** ${dono ? 'à direita, na cor `bolhaDireita` (a cor da marca, quando as cores vêm da marca)' : 'à esquerda, na cor `bolhaEsquerda`'}.

## Voz
${p.voz ? `Caminho: ${p.voz.caminho ?? 'a definir'}${p.voz.voice_id ? ` (\`${p.voz.voice_id}\`)` : ''}.` : 'A definir na entrevista.'} Na receita de duas vozes, cada mensagem dele com voz é um arquivo \`audio/<n>-${p.id}.mp3\`.

## No roteiro
\`"quem": "${p.id}"\` em cada mensagem dele no \`roteiro-falas.json\`.
`;
};

const tabelaLados = (r, ctx) => {
  const l = ['| Lado | Quem | Quem é | Avatar e status |', '|---|---|---|---|'];
  for (const lado of LADOS) {
    const p = ladoDe(r, lado);
    if (!p) continue;
    const i = r.personagens.indexOf(p);
    const av = avatarDe(p, i);
    const st = statusDe(p, ctx.opcoes);
    l.push(`| ${lado === 'direita' ? 'direita (dono do celular)' : 'esquerda (contato)'} | **${p.nome}** (\`${p.id}\`) | ${ctx.util.umaLinha(p.quem_e) || 'a definir'} | ${av.tipo === 'desenho' ? `desenho \`${av.desenho}\`` : 'inicial'} em \`${av.cor}\`${lado === 'esquerda' ? `, status ${st ? `"${st}"` : 'nenhum'}` : ''} |`);
  }
  return l.join('\n');
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
  const nome = opcoes.prontas[base]?.nome ?? base;
  const n = Object.keys(cores).length;
  if (origem === 'pronta') return `paleta pronta ${nome.split(':')[0].toLowerCase()} (\`${base}\`)${n ? `, com ${n} papel(éis) trocado(s) nas respostas` : ''}.`;
  if (origem === 'marca') return `paleta do modelo (claro), com a bolha da direita na cor da marca (\`${r.marca.cor.toUpperCase()}\`, texto \`${cores.textoDireita ?? opcoes.paletas[base].textoDireita}\`) e o destaque \`${cores.destaque ?? opcoes.paletas[base].destaque}\` (a cor da marca ajustada para ler no fundo).`;
  return n ? `paleta do modelo (claro), com ${n} papel(éis) trocado(s) nas respostas.` : 'paleta do modelo (claro), como vem no kit.';
};

const resumoFecho = (r) => {
  const contato = ladoDe(r, 'esquerda')?.nome ?? 'o contato';
  const aviso = r.fecho?.aviso_ficticio === false ? 'sem o aviso de conversa encenada (desligado nas respostas)' : `com o aviso "Conversa encenada: ${contato} e as mensagens são fictícios"`;
  if (!r.marca) return `"${r.fecho?.chamada ?? 'Já passou por isso?'}" e o botão "Segue o perfil" (universo sem marca), ${aviso}.`;
  const palavra = (r.fecho?.palavra ?? r.marca.palavra_fecho ?? r.marca.nome.split(/\s+/)[0]).toUpperCase();
  return `"${r.fecho?.chamada ?? `Quer conversar com ${r.marca.nome}?`}", "Comenta ${palavra}" com o símbolo ${r.marca.simbolo ?? 'letra'} na cor ${r.marca.cor ? `\`${r.marca.cor}\`` : 'de destaque'} e o nome da marca, ${aviso}.`;
};

export const gerar = (r, ctx) => {
  const { comum, opcoes } = ctx;
  const arquivos = [['componentes/universo.ts', gerarUniversoTs(r, ctx)]];
  r.personagens.forEach((p, i) => arquivos.push([`personagens/${p.id}/FICHA.md`, gerarFicha(p, i, r, ctx)]));
  const dono = ladoDe(r, 'direita');
  const contato = ladoDe(r, 'esquerda');
  const tela = telaDe(r, opcoes);
  const receita = receitaDe(r, ctx);
  const valores = {
    dono_nome: dono?.nome ?? '',
    contato_nome: contato?.nome ?? '',
    tabela_lados: tabelaLados(r, ctx),
    tela_resumo: `fundo da conversa \`${tela.fundo}\` (${opcoes.fundos_chat[tela.fundo]}), horário ${tela.horario ? 'ligado' : 'desligado'}, sinal de lido ${tela.lido ? 'ligado' : 'desligado'}, primeira mensagem às ${tela.hora}.`,
    cores_resumo: resumoCores(r, ctx),
    tabela_cores: tabelaCores(r, ctx),
    marca_resumo: comum.marcaResumo(r).replace('celular sem logo e fecho de "me segue"', 'card final de "Segue o perfil"'),
    receita_nome: receita === 'texto-e-musica' ? 'só texto e música (`texto-e-musica`)' : 'duas vozes, uma por lado (`vozes-por-fala`)',
    receita_resumo:
      receita === 'texto-e-musica'
        ? 'as bolhas entram no tempo de leitura, sem voz, com a cama de música do kit (ou a música da própria pessoa, em `public/musica.mp3` do vídeo); o digitando aparece antes das mensagens do contato.'
        : 'cada mensagem com voz é uma fala gravada, na ordem do roteiro, e a bolha entra no começo da fala dela, do lado de quem fala; mensagens marcadas `sem_voz` entram entre as falas sem empurrar as outras.',
    fecho_resumo: resumoFecho(r),
    lista_nunca: comum.listaNunca(r),
    tabela_vozes: [
      '| Lado | Quem | Caminho | voice_id |',
      '|---|---|---|---|',
      ...LADOS.map((lado) => ladoDe(r, lado))
        .filter(Boolean)
        .map((p) => `| ${p.lado} | ${p.nome} | ${p.voz?.caminho ?? r.voz?.caminho ?? 'a definir'} | ${p.voz?.voice_id ? `\`${p.voz.voice_id}\`` : 'a escolher'} |`),
    ].join('\n'),
  };
  return { arquivos, valores };
};
