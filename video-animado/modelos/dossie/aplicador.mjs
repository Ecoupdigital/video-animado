// Aplicador do modelo dossiê: a parte do --aplicar que depende do kit.
// O scripts/novo_universo.mjs cuida do comum (universo, marca, fecho, cores por papel, proibições, brandbook,
// reaplicar) e chama estas funções para o que é deste modelo: sem personagem (o modelo pula a pergunta 5),
// o tema visual (um dos 3, com cores e fontes trocáveis papel por papel), o rótulo do topo e as manchetes
// da faixa, o card final (assinatura, frase, aviso de narração por IA) e o caso dos stills de conferência.
//
// Contrato (o mesmo em todo kit com aplicador.mjs):
//   validarPersonagem(p, onde, ctx, erros)   campos do personagem que são do modelo
//   validar(r, ctx, erros)                    o resto das respostas que é do modelo
//   perguntaDoErro(erro, r)                   número da pergunta (ou undefined para usar a regra comum)
//   gerar(r, ctx) -> { arquivos: [[caminho, conteúdo], ...], valores: { chave: texto } }

const NOMES_TEMA = { investigativo: 'Investigativo escuro', jornal: 'Jornal claro', marca: 'Neutro de marca' };
const PAPEIS_COR = {
  fundo: 'fundo da tela',
  fundo2: 'segundo fundo (degradê, interior da polaroid)',
  superficie: 'cards e fichas',
  apagado: 'linhas da grade, trilhos, silhueta',
  destaque: 'palavra-chave do título, barra de progresso, fio do caminho',
  destaque2: 'segundo nó da rota, card de empresa',
  claro: 'texto mono de apoio, fita da polaroid, pontos',
  ouro: 'valor em dinheiro, número de destaque',
  titulo: 'texto cinético e números grandes',
  texto: 'texto dos cards e da faixa',
  suave: 'rótulos mono, legendas pequenas',
  discreto: 'letra miúda do card final',
  alerta: 'só alerta: carimbo, queda, fio vermelho, bloqueio',
  alertaSuave: 'pulso do fio, selo do canto',
  papel: 'papel da polaroid',
  tinta: 'texto sobre o papel da polaroid',
  fita: 'fita adesiva da polaroid',
};

// ---------------------------------------------------------------- validar

export const validarPersonagem = (p, onde, ctx, erros) => {
  erros.push(`${onde}: o dossiê não usa personagem (as pessoas do caso entram nas cenas de cada vídeo, pelo roteiro); tire "personagens" das respostas`);
};

export const validar = (r, ctx, erros) => {
  const { opcoes, util } = ctx;
  const d = r.dossie;
  if (d !== undefined && d !== null) {
    if (typeof d !== 'object' || Array.isArray(d)) erros.push('dossie: objeto (rotulo, selo, manchetes)');
    else {
      for (const k of Object.keys(d)) if (!['rotulo', 'selo', 'manchetes'].includes(k)) erros.push(`dossie.${k}: campo desconhecido (aceitos: rotulo, selo, manchetes)`);
      for (const k of ['rotulo', 'selo']) if (d[k] !== undefined && d[k] !== null && !util.ehTexto(d[k])) erros.push(`dossie.${k}: texto`);
      if (d.manchetes !== undefined && d.manchetes !== null) {
        if (!Array.isArray(d.manchetes) || d.manchetes.length === 0 || d.manchetes.some((m) => !util.ehTexto(m))) erros.push('dossie.manchetes: lista de 1 a 8 manchetes (textos curtos)');
        else if (d.manchetes.length > 8) erros.push(`dossie.manchetes: no máximo 8 (vieram ${d.manchetes.length})`);
      }
    }
  }
  const c = r.cores;
  if (c !== undefined && c !== null) {
    if (typeof c !== 'object' || Array.isArray(c)) erros.push('cores: objeto (tema, paleta, fontes)');
    else {
      if (c.tema !== undefined && c.tema !== null && !opcoes.temas.includes(c.tema)) erros.push(`cores.tema: tema "${c.tema}" não existe (aceitos: ${opcoes.temas.join(', ')})`);
      if (c.fontes !== undefined && c.fontes !== null) {
        if (typeof c.fontes !== 'object' || Array.isArray(c.fontes)) erros.push(`cores.fontes: objeto com os papéis ${opcoes.papeis_fonte.join(', ')}`);
        else
          for (const [k, v] of Object.entries(c.fontes)) {
            if (!opcoes.papeis_fonte.includes(k)) erros.push(`cores.fontes.${k}: papel de fonte desconhecido (aceitos: ${opcoes.papeis_fonte.join(', ')})`);
            else if (!opcoes.fontes.includes(v)) erros.push(`cores.fontes.${k}: fonte "${v}" não existe no modelo (aceitas: ${opcoes.fontes.join(', ')})`);
          }
      }
    }
  }
  const f = r.fecho;
  if (!f || typeof f !== 'object' || Array.isArray(f) || !util.ehTexto(f.assinatura)) erros.push('fecho.assinatura: obrigatória (o @ do perfil ou o nome que assina o card final)');
  if (f && typeof f === 'object') {
    if (f.frase_assinatura !== undefined && f.frase_assinatura !== null && !util.ehTexto(f.frase_assinatura)) erros.push('fecho.frase_assinatura: texto ou null');
    if (f.aviso_ia !== undefined && typeof f.aviso_ia !== 'boolean') erros.push('fecho.aviso_ia: true ou false');
    if (f.aviso_ia === false && r.voz?.caminho !== 'audio-proprio') erros.push(`fecho.aviso_ia: o aviso "Narração gerada por IA" só sai quando a voz é áudio próprio (voz.caminho "audio-proprio"; veio ${JSON.stringify(r.voz?.caminho ?? null)})`);
  }
  const caso = r.caso;
  if (caso !== undefined && caso !== null) {
    if (typeof caso !== 'object' || Array.isArray(caso)) erros.push('caso: objeto (titulo, nome, papel) ou null');
    else for (const k of ['titulo', 'nome', 'papel']) if (caso[k] !== undefined && caso[k] !== null && !util.ehTexto(caso[k])) erros.push(`caso.${k}: texto`);
  }
};

export const perguntaDoErro = (erro) => {
  if (/^dossie/.test(erro)) return 8;
  if (/^caso/.test(erro)) return 2;
  if (/^personagens/.test(erro)) return 2;
  if (/^fecho\.aviso_ia/.test(erro)) return 12;
  return undefined;
};

// ---------------------------------------------------------------- gerar

const temaDe = (r) => r.cores?.tema ?? 'investigativo';

const gerarUniversoTs = (r, util) => {
  const { ts, hoje } = util;
  const marca = r.marca ? { nome: r.marca.nome, cor: r.marca.cor ?? null } : null;
  const d = r.dossie ?? {};
  const dossie = {
    rotulo: d.rotulo ?? `// DOSSIÊ · ${r.universo.nome.toUpperCase()}`,
    selo: d.selo ?? 'CASO ABERTO',
    manchetes: d.manchetes ?? [],
  };
  const tema = { nome: temaDe(r), cores: r.cores?.paleta ?? {}, fontes: r.cores?.fontes ?? {} };
  // o aviso de narração por IA só some com voz de áudio próprio e aviso_ia: false (o validar confere)
  const fecho = {
    chamada: r.fecho?.chamada ?? null,
    assinatura: r.fecho.assinatura,
    fraseAssinatura: r.fecho?.frase_assinatura === undefined ? 'me segue pra ver o próximo caso' : r.fecho.frase_assinatura,
    avisoIA: !(r.fecho?.aviso_ia === false && r.voz?.caminho === 'audio-proprio'),
  };
  const caso = r.caso && (r.caso.titulo || r.caso.nome) ? { titulo: r.caso.titulo ?? r.universo.nome, nome: r.caso.nome ?? 'Pessoa A', papel: r.caso.papel ?? 'citada no caso' } : null;
  return `// Gerado por novo_universo.mjs --aplicar a partir de respostas.json em ${hoje()}.
// Não edite à mão: mude respostas.json e rode --aplicar de novo.
// Os componentes do kit leem daqui o nome, a marca, o tema (com as trocas de cor e fonte), o rótulo do topo,
// as manchetes da faixa, o card final e o caso dos stills de conferência.
import type { NomeTema, Paleta, PapelFonte } from './tema';

export const UNIVERSO = ${ts({ nome: r.universo.nome, pasta: r.universo.pasta ?? null, assunto: r.universo.assunto, publico: r.universo.publico, tom: r.universo.tom })} as const;

/** null = nenhuma marca: o tema "marca" cai nas cores do investigativo e o card final mostra só a assinatura. */
export const MARCA: { nome: string; cor: string | null } | null = ${ts(marca)};

/** Rótulo do topo, selo do canto e manchetes da faixa rolando. */
export const DOSSIE: { rotulo: string; selo: string; manchetes: string[] } = ${ts(dossie)};

/** Tema escolhido e os papéis de cor e fonte trocados nas respostas (valem só para o tema escolhido). */
export const TEMA: { nome: NomeTema; cores: Partial<Paleta>; fontes: Partial<Record<PapelFonte, string>> } = ${ts(tema)};

/** Card final: chamada, assinatura e o aviso de narração por IA (ligado, a não ser com áudio próprio). */
export const FECHO: { chamada: string | null; assinatura: string; fraseAssinatura: string | null; avisoIA: boolean } = ${ts(fecho)};

/** Caso dos stills de conferência (null = o caso neutro do kit, em componentes/exemplo.ts). */
export const CASO: { titulo: string; nome: string; papel: string } | null = ${ts(caso)};
`;
};

const tabelaCores = (r, opcoes) => {
  const nome = temaDe(r);
  const base = opcoes.paletas[nome];
  const trocas = r.cores?.paleta ?? {};
  const l = ['| Papel | Hex | Onde usa |', '|---|---|---|'];
  for (const [k, v] of Object.entries(base)) {
    let hex = trocas[k] ?? v;
    let nota = trocas[k] ? ' (trocado)' : '';
    if (!trocas[k] && nome === 'marca' && opcoes.papeis_derivados_da_marca.includes(k)) nota = r.marca?.cor ? ' (puxado da marca na tela)' : ' (sem marca: o do investigativo)';
    l.push(`| ${k} | \`${hex}\`${nota} | ${PAPEIS_COR[k] ?? ''} |`);
  }
  return l.join('\n');
};

const tabelaFontes = (r, opcoes) => {
  const nome = temaDe(r);
  const fontes = { ...opcoes.estilos[nome].fontes, ...(r.cores?.fontes ?? {}) };
  const uso = { titulo: 'texto cinético, números grandes, carimbo', texto: 'cards, fichas, card final', mono: 'rótulo do topo, HUD, faixa, rótulos dos cards' };
  const l = ['| Papel | Fonte | Para quê |', '|---|---|---|'];
  for (const p of opcoes.papeis_fonte) l.push(`| ${p} | **${fontes[p]}**${r.cores?.fontes?.[p] ? ' (trocada)' : ''} | ${uso[p]} |`);
  return l.join('\n');
};

const resumoCard = (r) => {
  const partes = [];
  if (r.fecho?.chamada) partes.push(`a pergunta "${r.fecho.chamada}" com "comenta aqui"`);
  partes.push(`a assinatura ${r.fecho.assinatura}${r.fecho.frase_assinatura === null ? '' : ` ("${r.fecho.frase_assinatura ?? 'me segue pra ver o próximo caso'}")`}`);
  if (r.marca) partes.push(`o nome da marca ${r.marca.nome}`);
  partes.push('as fontes do vídeo');
  partes.push(r.fecho?.aviso_ia === false && r.voz?.caminho === 'audio-proprio' ? 'sem o aviso de narração por IA (voz de áudio próprio)' : 'o aviso "Narração gerada por IA"');
  partes.push('e, quando o caso cita pessoas, "suspeitas reportadas, sem acusação formal"');
  return partes.join(', ') + '.';
};

export const gerar = (r, ctx) => {
  const { opcoes, util, comum } = ctx;
  const arquivos = [['componentes/universo.ts', gerarUniversoTs(r, util)]];
  const nome = temaDe(r);
  const d = r.dossie ?? {};
  const manchetes = d.manchetes ?? [];
  const valores = {
    tema_nome: `${NOMES_TEMA[nome]} (\`${nome}\`)${r.cores?.paleta || r.cores?.fontes ? ', com trocas das respostas' : ''}`,
    tabela_cores: tabelaCores(r, opcoes),
    tabela_fontes: tabelaFontes(r, opcoes),
    marca_resumo: r.marca ? `${r.marca.nome}${r.marca.cor ? `, cor \`${r.marca.cor}\`` : ''}${nome === 'marca' ? ' (o destaque do tema sai dela)' : ''}.` : 'nenhuma marca: o card final mostra só a assinatura.',
    rotulo: d.rotulo ?? `// DOSSIÊ · ${r.universo.nome.toUpperCase()}`,
    selo: d.selo ?? 'CASO ABERTO',
    lista_manchetes: manchetes.length ? manchetes.map((m) => `- ${m}`).join('\n') : '- (nenhuma: a faixa só aparece nos vídeos que trouxerem manchetes no roteiro)',
    fecho_resumo: resumoCard(r),
    lista_nunca: comum.listaNunca(r),
    tabela_vozes: ['| Quem | Caminho | voice_id |', '|---|---|---|', `| narração (uma voz só, o texto inteiro) | ${r.voz?.caminho ?? 'a definir'} | ${r.voz?.voice_id ? `\`${r.voz.voice_id}\`` : 'a escolher'} |`].join('\n'),
  };
  return { arquivos, valores };
};
