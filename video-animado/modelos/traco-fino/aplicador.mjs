// Aplicador do modelo traço fino: a parte do --aplicar que depende do kit.
// O scripts/novo_universo.mjs cuida do comum (universo, marca, fecho, cores, proibições, brandbook, reaplicar)
// e chama estas funções para o que é deste modelo: adulto e criança configuráveis (com a aparência do antes),
// a narradora única, o antes e agora, os cenários (apartamento, escritório, escola, sala de espera), os
// arquivos gerados (universo.ts, personagens, fichas, índice) e as lacunas do brandbook.
//
// Contrato (o mesmo em todo kit com aplicador.mjs):
//   validarPersonagem(p, onde, ctx, erros)   campos do personagem que são do modelo
//   validar(r, ctx, erros)                    o resto das respostas que é do modelo
//   perguntaDoErro(erro, r)                   número da pergunta (ou undefined para usar a regra comum)
//   gerar(r, ctx) -> { arquivos: [[caminho, conteúdo], ...], valores: { chave: texto } }

const CENARIOS_ACEITOS = ['apartamento', 'escritorio', 'escola', 'sala_espera'];

/** Corpo do personagem: o que veio, senão o do preset, senão adulto. */
const corpoDe = (p, opcoes) => p.corpo ?? opcoes.presets[p.aparencia?.preset]?.corpo ?? 'adulto';

// ---------------------------------------------------------------- validar

const validarCampos = (ap, lugar, campos, corpo, opcoes, util, erros, comPreset) => {
  for (const [k, v] of Object.entries(ap)) {
    const regra = campos[k];
    const onde = `${lugar}.${k}`;
    if (!regra || (regra === 'preset' && !comPreset)) {
      const aceitos = Object.keys(campos).filter((c) => comPreset || campos[c] !== 'preset');
      erros.push(`${onde}: campo desconhecido para ${corpo === 'crianca' ? 'criança' : 'adulto'} (aceitos: ${aceitos.join(', ')})`);
      continue;
    }
    if (regra === 'preset') {
      if (!(v in opcoes.presets)) erros.push(`${onde}: preset "${v}" não existe (aceitos: ${Object.keys(opcoes.presets).join(', ')})`);
      else if ((opcoes.presets[v].corpo ?? 'adulto') !== corpo) erros.push(`${onde}: o preset "${v}" é de ${opcoes.presets[v].corpo === 'crianca' ? 'criança' : 'adulto'}, e o personagem é ${corpo === 'crianca' ? 'criança' : 'adulto'}`);
    }
    if (regra === 'tom' && !(v in opcoes.tons_pele)) erros.push(`${onde}: tom "${v}" não existe (aceitos: ${Object.keys(opcoes.tons_pele).join(', ')})`);
    if (regra === 'cabelo-adulto' && !opcoes.cabelos_adulto.includes(v)) erros.push(`${onde}: cabelo "${v}" não existe (aceitos: ${opcoes.cabelos_adulto.join(', ')})`);
    if (regra === 'cabelo-crianca' && !opcoes.cabelos_crianca.includes(v)) erros.push(`${onde}: cabelo "${v}" não existe para criança (aceitos: ${opcoes.cabelos_crianca.join(', ')})`);
    if (regra === 'camisa' && !opcoes.camisas.includes(v)) erros.push(`${onde}: "${v}" não existe (aceitos: ${opcoes.camisas.join(', ')})`);
    if (regra === 'manga' && !opcoes.mangas.includes(v)) erros.push(`${onde}: "${v}" não existe (aceitos: ${opcoes.mangas.join(', ')})`);
    if (regra === 'baixo-adulto' && !opcoes.baixos_adulto.includes(v)) erros.push(`${onde}: "${v}" não existe (aceitos: ${opcoes.baixos_adulto.join(', ')})`);
    if (regra === 'baixo-crianca' && !opcoes.baixos_crianca.includes(v)) erros.push(`${onde}: "${v}" não existe para criança (aceitos: ${opcoes.baixos_crianca.join(', ')})`);
    if (regra === 'cor' && !util.ehHex(v)) erros.push(`${onde}: cor deve ser hex #RRGGBB (veio ${JSON.stringify(v)})`);
    if (regra === 'cor-ou-nada' && v !== null && !util.ehHex(v)) erros.push(`${onde}: cor hex #RRGGBB ou null (veio ${JSON.stringify(v)})`);
    if (regra === 'sim-nao' && typeof v !== 'boolean') erros.push(`${onde}: deve ser true ou false (veio ${JSON.stringify(v)})`);
    if (regra.startsWith('numero:')) {
      const [, min, max] = regra.split(':').map(Number);
      if (typeof v !== 'number' || v < min || v > max) erros.push(`${onde}: número entre ${min} e ${max} (veio ${JSON.stringify(v)})`);
    }
  }
};

export const validarPersonagem = (p, onde, ctx, erros) => {
  const { opcoes, util } = ctx;
  if (p.corpo !== undefined && !opcoes.corpos.includes(p.corpo)) erros.push(`${onde}.corpo: "${p.corpo}" não existe (aceitos: ${opcoes.corpos.join(', ')})`);
  const corpo = corpoDe(p, opcoes);
  if (p.papel === 'protagonista' && corpo === 'crianca') erros.push(`${onde}.corpo: a protagonista é a narradora e precisa ser adulta (criança não fala neste modelo)`);
  const campos = corpo === 'crianca' ? opcoes.campos_crianca : opcoes.campos_adulto;
  if (!p.aparencia || typeof p.aparencia !== 'object' || Array.isArray(p.aparencia)) erros.push(`${onde}.aparencia: obrigatória (objeto com preset ou pele, cabelo e roupa)`);
  else validarCampos(p.aparencia, `${onde}.aparencia`, campos, corpo, opcoes, util, erros, true);
  if (p.aparencia_antes !== undefined && p.aparencia_antes !== null) {
    if (typeof p.aparencia_antes !== 'object' || Array.isArray(p.aparencia_antes)) erros.push(`${onde}.aparencia_antes: objeto só com o que muda no antes (ex.: { "cabelo": "comprido" }) ou null`);
    else validarCampos(p.aparencia_antes, `${onde}.aparencia_antes`, campos, corpo, opcoes, util, erros, false);
  }
  if (p.voz !== undefined && p.voz !== null && p.papel !== 'protagonista') erros.push(`${onde}.voz: neste modelo só a narradora (a protagonista) tem voz; tire a voz de ${p.nome ?? p.id}`);
};

export const validar = (r, ctx, erros) => {
  const { opcoes, util } = ctx;
  const aa = r.antes_e_agora;
  if (aa !== undefined && aa !== null) {
    if (typeof aa !== 'object' || Array.isArray(aa)) erros.push('antes_e_agora: objeto (virada, rotulo_antes, rotulo_agora)');
    else {
      for (const [k, v] of Object.entries(aa)) {
        if (!['virada', 'rotulo_antes', 'rotulo_agora'].includes(k)) erros.push(`antes_e_agora.${k}: campo desconhecido (aceitos: virada, rotulo_antes, rotulo_agora)`);
        else if (v !== null && !util.ehTexto(v)) erros.push(`antes_e_agora.${k}: texto`);
      }
    }
  }
  const c = r.cenarios;
  if (c !== undefined && c !== null) {
    if (typeof c !== 'object' || Array.isArray(c)) erros.push(`cenarios: objeto (aceitos: ${CENARIOS_ACEITOS.join(', ')})`);
    else {
      for (const k of Object.keys(c)) if (!CENARIOS_ACEITOS.includes(k)) erros.push(`cenarios.${k}: cenário que o modelo não tem (aceitos: ${CENARIOS_ACEITOS.join(', ')})`);
      if (c.apartamento !== undefined && (!Array.isArray(c.apartamento) || c.apartamento.some((x) => !opcoes.comodos.includes(x)))) erros.push(`cenarios.apartamento: lista de cômodos (aceitos: ${opcoes.comodos.join(', ')})`);
      if (c.escritorio !== undefined && typeof c.escritorio !== 'boolean') erros.push('cenarios.escritorio: true ou false');
      for (const [k, campo] of [['escola', 'nome'], ['sala_espera', 'placa']]) {
        const v = c[k];
        if (v !== undefined && v !== null && (typeof v !== 'object' || (v[campo] !== undefined && v[campo] !== null && !util.ehTexto(v[campo])))) erros.push(`cenarios.${k}.${campo}: texto`);
      }
    }
  }
};

export const perguntaDoErro = (erro, r) => {
  if (/^antes_e_agora/.test(erro)) return 2;
  const m = /^personagens\[(\d+)\]\.(corpo|aparencia_antes)/.exec(erro);
  if (m) {
    const p = Array.isArray(r.personagens) ? r.personagens[Number(m[1])] : null;
    if (p && p.papel === 'protagonista') return m[2] === 'corpo' ? 5 : 6;
    return 7;
  }
  return undefined;
};

// ---------------------------------------------------------------- gerar

const narradoraDe = (r) => r.personagens.find((p) => p.papel === 'protagonista');

const gerarUniversoTs = (r, opcoes, util) => {
  const { ts, hoje } = util;
  const pessoas = {};
  r.personagens.forEach((p, i) => {
    pessoas[p.id] = { nome: p.nome, papel: p.papel, corpo: corpoDe(p, opcoes), semente: i + 1, aparencia: p.aparencia, antes: p.aparencia_antes ?? null };
  });
  const marca = r.marca ? { nome: r.marca.nome, cor: r.marca.cor ?? null, simbolo: r.marca.simbolo ?? null, palavraFecho: r.marca.palavra_fecho ?? null } : null;
  // o aviso de personagem fictícia só some com aviso_ficticio: false explícito
  const fecho = { chamada: r.fecho?.chamada ?? null, palavra: r.fecho?.palavra ?? r.marca?.palavra_fecho ?? null, avisoFicticio: r.fecho?.aviso_ficticio !== false };
  const tempo = {
    virada: r.antes_e_agora?.virada ?? null,
    rotuloAntes: r.antes_e_agora?.rotulo_antes || 'ANTES',
    rotuloAgora: r.antes_e_agora?.rotulo_agora || 'AGORA',
  };
  const c = r.cenarios ?? { apartamento: ['sala'] };
  const cenarios = { apartamento: c.apartamento ?? [], escritorio: c.escritorio === true, escola: Boolean(c.escola), salaEspera: Boolean(c.sala_espera) };
  const lugares = { nomeEscola: c.escola?.nome ?? null, placaSalaEspera: c.sala_espera?.placa ?? null };
  return `// Gerado por novo_universo.mjs --aplicar a partir de respostas.json em ${hoje()}.
// Não edite à mão: mude respostas.json e rode --aplicar de novo.
// Os componentes do kit leem daqui o nome, a marca, o fecho, os rótulos do antes e do agora, a paleta,
// o elenco, os cenários e os lugares.
import type { AparenciaEntrada } from './presets';
import type { Paleta } from './cores';

export const UNIVERSO = ${ts({ nome: r.universo.nome, pasta: r.universo.pasta ?? null, assunto: r.universo.assunto, publico: r.universo.publico, tom: r.universo.tom })} as const;

/** null = nenhuma marca: celular sem logo e fecho de seguir o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null; palavraFecho: string | null } | null = ${ts(marca)};

/** Fecho do vídeo: chamada, palavra do "Comenta" e o aviso de personagem fictícia (ligado se não vier false). */
export const FECHO: { chamada: string | null; palavra: string | null; avisoFicticio: boolean } = ${ts(fecho)};

/** Antes e agora: a virada da série e os rótulos dos selos (sem rótulo nas respostas, ANTES e AGORA). */
export const TEMPO: { virada: string | null; rotuloAntes: string; rotuloAgora: string } = ${ts(tempo)};

/** Papéis da paleta trocados pelas respostas (o resto vem do preset do modelo). */
export const PALETA: Partial<Paleta> = ${ts(r.cores?.paleta ?? {})};

export type PessoaDoElenco = {
  nome: string;
  papel: 'protagonista' | 'apoio';
  corpo: 'adulto' | 'crianca';
  semente: number;
  aparencia: AparenciaEntrada;
  /** O que muda no antes (só os campos trocados), ou null. */
  antes: AparenciaEntrada | null;
};
export const PESSOAS: Record<string, PessoaDoElenco> = ${ts(pessoas)};

/** Cenários escolhidos na entrevista. */
export const CENARIOS: { apartamento: string[]; escritorio: boolean; escola: boolean; salaEspera: boolean } = ${ts(cenarios)};

export const LUGARES: { nomeEscola: string | null; placaSalaEspera: string | null } = ${ts(lugares)};
`;
};

const gerarPersonagemTsx = (p, corpo, util) => {
  const adulto = corpo === 'adulto';
  const comp = adulto ? 'Adulto' : 'Crianca';
  const props = adulto ? 'AdultoPersonagemProps' : 'CriancaPersonagemProps';
  const papel = p.papel === 'protagonista' ? 'protagonista e narradora (a única voz do universo)' : adulto ? 'apoio, aparece em cena e não fala (a narradora conta por ele)' : 'criança, não fala: age, e a narradora conta o que ela fez';
  return `import React from 'react';
import { ${comp}, ${props} } from '../../componentes/${adulto ? 'adulto' : 'crianca'}';
import { PESSOAS } from '../../componentes/universo';

// ${util.comentario(p.nome.toUpperCase())}${p.idade !== undefined ? `, ${p.idade} anos` : ''}, ${papel}. ${util.comentario(p.quem_e ?? '')}
// Desenho fixo: nunca redesenhar nas cenas, sempre importar este componente. epoca="antes" desenha a aparência do antes.
// Gerado por novo_universo.mjs; a aparência mora em componentes/universo.ts (vinda de respostas.json).
const EU = PESSOAS[${JSON.stringify(p.id)}];

export type ${util.nomeTipo(p.id)}Props = ${props};

export const Personagem: React.FC<${props}> = (props) => <${comp} aparencia={EU.aparencia} antes={EU.antes} semente={EU.semente} {...props} />;
`;
};

const gerarIndice = (r, opcoes) => {
  const imports = [];
  const linhas = [];
  r.personagens.forEach((p, i) => {
    imports.push(`import { Personagem as P${i} } from './${p.id}/Personagem';`);
    linhas.push(`  { tipo: ${JSON.stringify(corpoDe(p, opcoes))}, id: ${JSON.stringify(p.id)}, nome: ${JSON.stringify(p.nome)}, C: P${i} },`);
  });
  return `// Gerado por novo_universo.mjs --aplicar. Lista do elenco para o _preview e para os vídeos.
import React from 'react';
import type { AdultoPersonagemProps } from '../componentes/adulto';
import type { CriancaPersonagemProps } from '../componentes/crianca';
${imports.join('\n')}

export type EntradaElenco =
  | { tipo: 'adulto'; id: string; nome: string; C: React.FC<AdultoPersonagemProps> }
  | { tipo: 'crianca'; id: string; nome: string; C: React.FC<CriancaPersonagemProps> };

export const PERSONAGENS: EntradaElenco[] = [
${linhas.join('\n')}
];
`;
};

const NOMES_ROUPA = { calca: 'calça', bermuda: 'bermuda', saia: 'saia' };

/** Aparência em tópicos (preset, pele, cabelo, roupa, detalhes) e o que muda no antes. */
const descrever = (p, corpo, opcoes) => {
  const preset = p.aparencia.preset ? opcoes.presets[p.aparencia.preset] ?? {} : {};
  const { antes: antesDoPreset, ...semAntes } = preset;
  const a = { ...semAntes, ...p.aparencia };
  const itens = [];
  if (p.aparencia.preset) itens.push(`- **Preset:** \`${p.aparencia.preset}\` (o que vem abaixo troca só o que foi respondido).`);
  if (a.pele) itens.push(`- **Pele:** \`${a.pele}\` (base \`${opcoes.tons_pele[a.pele].base}\`, sombra \`${opcoes.tons_pele[a.pele].sombra}\`).`);
  if (a.cabelo) itens.push(`- **Cabelo:** \`${a.cabelo}\`${a.corCabelo ? ` \`${a.corCabelo}\`` : ''}.`);
  const roupa = [];
  if (corpo === 'adulto') {
    if (a.topo) roupa.push(`${a.camisa === 'aberta' ? 'camisa aberta' : 'camiseta'} \`${a.topo}\`${a.manga ? `, manga ${a.manga}` : ''}${a.camisa === 'aberta' && a.porBaixo ? `, regata \`${a.porBaixo}\` por baixo` : ''}`);
  } else if (a.topo) roupa.push(`camiseta \`${a.topo}\`${a.listras ? ` com listras \`${a.listras}\`` : ''}`);
  if (a.tipoBaixo || a.baixo) roupa.push(`${NOMES_ROUPA[a.tipoBaixo ?? (corpo === 'adulto' ? 'calca' : 'bermuda')]}${a.baixo ? ` \`${a.baixo}\`` : ''}`);
  if (a.tenis) roupa.push(`tênis \`${a.tenis}\`${a.faixaTenis ? ` com faixa \`${a.faixaTenis}\`` : ''}`);
  if (roupa.length) itens.push(`- **Roupa (fixa):** ${roupa.join(', ')}.`);
  const extras = [a.oculos && 'óculos', a.barba && 'barba', a.cilios && 'cílios', a.curativo && 'curativo no joelho', a.barriga && `barriga ${a.barriga}`, a.ombros && `ombros +${a.ombros}`].filter(Boolean);
  if (extras.length) itens.push(`- **Detalhes:** ${extras.join(', ')}.`);
  if (a.altura) itens.push(`- **Altura:** ${a.altura} da altura do adulto padrão.`);
  const antes = { ...(antesDoPreset ?? {}), ...(p.aparencia_antes ?? {}) };
  if (Object.keys(antes).length) itens.push(`- **No antes** (\`epoca="antes"\`, a cena passa por \`<Lembranca>\`): ${Object.entries(antes).map(([k, v]) => `${k} \`${v}\``).join(', ')}; o resto igual.`);
  return itens.join('\n');
};

const gerarFicha = (p, corpo, opcoes, util) => {
  const narradora = p.papel === 'protagonista';
  const adulto = corpo === 'adulto';
  return `# ${p.nome}

**Papel:** ${narradora ? 'protagonista e narradora (a única voz do universo)' : adulto ? 'apoio, aparece em cena e não fala' : 'criança, aparece em cena e não fala'}${p.idade !== undefined ? ` · ${p.idade} anos` : ''}.
**Quem é:** ${util.umaLinha(p.quem_e) || 'a definir'}.

## Aparência
${descrever(p, corpo, opcoes)}

## Voz
${narradora ? (p.voz ? `Caminho: ${p.voz.caminho ?? 'a definir'}${p.voz.voice_id ? ` (\`${p.voz.voice_id}\`)` : ''}.` : 'A definir na entrevista.') : 'Não fala: a narradora conta o que ' + (adulto ? 'ele ou ela disse e fez.' : 'a criança fez.')}

## Expressões
${adulto ? 'As 9 de todos os adultos (`neutra, falando, feliz, surpresa, pensando, apontando, ironica, exausta, aliviada`).' : 'As 6 da criança (`neutra, feliz, travesso, surpresa, emburrado, dormindo`) e 3 poses (`parado, correndo, bracos-pra-cima`).'} Folha: still \`expressoes-${p.id}\` do \`_preview\`.

## Código
${adulto ? `\`personagens/${p.id}/Personagem.tsx\` → \`<Personagem expressao="feliz"${narradora ? ' falando={v}' : ''} escala={1} />\`
Objetos: \`segurando="celular"\` (de costas, olha para baixo), \`"caderno"\`, \`"caixa"\`, \`"mostrando"\` (tela virada para quem está ao lado).` : `\`personagens/${p.id}/Personagem.tsx\` → \`<Personagem expressao="feliz" pose="correndo" escala={1} />\``}
O antes: \`epoca="antes"\` dentro de \`<Lembranca>\`.
`;
};

const tabelaPersonagens = (r, opcoes, util) => {
  const l = ['| Personagem | Quem é | Visual que identifica | Fala? |', '|---|---|---|---|'];
  for (const p of r.personagens) {
    const corpo = corpoDe(p, opcoes);
    const { antes: _a, ...preset } = p.aparencia.preset ? opcoes.presets[p.aparencia.preset] ?? {} : {};
    const a = { ...preset, ...p.aparencia };
    const visual = [corpo === 'crianca' && 'criança', a.cabelo && `cabelo ${a.cabelo}`, a.oculos && 'óculos', a.barba && 'barba', a.topo && `roupa \`${a.topo}\``].filter(Boolean).join(', ');
    const fala = p.papel === 'protagonista' ? 'sim, narradora (a única voz)' : 'não, a narradora conta';
    l.push(`| **${p.nome}** | ${p.idade !== undefined ? `${p.idade} anos, ` : ''}${util.umaLinha(p.quem_e)} | ${visual} | ${fala} |`);
  }
  return l.join('\n');
};

const CENARIOS_INFO = {
  sala: ['Apartamento · sala', '`<Apartamento comodo="sala" />`', 'sala integrada com a cozinha: janela com prédios, quadro, armários, bancada com caneca, pendente, sofá, tapete, planta; `brinquedos` e `caixa` opcionais', 'fundo, apoio, apoio2'],
  quarto: ['Apartamento · quarto', '`<Apartamento comodo="quarto" />`', 'meia parede pintada, janela, prateleira com livros, quadro, cama de solteiro com manta, mesa de cabeceira', 'apoio2Claro, fundo, apoio'],
};

const tabelaCenarios = (r) => {
  const c = r.cenarios ?? { apartamento: ['sala'] };
  const l = ['| Cenário | Componente | Áreas e objetos fixos | Cores dominantes |', '|---|---|---|---|'];
  for (const comodo of c.apartamento ?? []) if (CENARIOS_INFO[comodo]) l.push(`| ${CENARIOS_INFO[comodo].join(' | ')} |`);
  if (c.escritorio) l.push('| Escritório | `<Escritorio />` | janelão com a cidade, mesa com monitor de planilha, caneca, planta | fundo, apoio, fundo2 |');
  if (c.escola) l.push(`| Porta da escola | \`<Escola />\` | muro com formas pintadas, portão, placa "${c.escola.nome ?? 'Escola'}", calçada, árvore | céu, fundo2, apoio2 |`);
  if (c.sala_espera) l.push(`| Sala de espera | \`<SalaDeEspera />\` | porta com a placa "${c.sala_espera.placa ?? 'Recepção'}", fileira de cadeiras, relógio, quadro, mesinha com revistas, planta | fundo, céu, apoio2 |`);
  if (l.length === 2) l.push('| (nenhum escolhido) | `<Apartamento comodo="sala" />` | a sala serve de padrão | fundo, apoio |');
  return l.join('\n');
};

const resumoAntesAgora = (r, util) => {
  const aa = r.antes_e_agora ?? {};
  const rotulos = `selos "${aa.rotulo_antes || 'ANTES'} · detalhe do episódio" e "${aa.rotulo_agora || 'AGORA'} · detalhe do episódio"`;
  return aa.virada ? `${util.umaLinha(aa.virada)} (${rotulos}).` : `a definir na entrevista (${rotulos}).`;
};

export const gerar = (r, ctx) => {
  const { opcoes, util, comum } = ctx;
  const narradora = narradoraDe(r);
  const arquivos = [['componentes/universo.ts', gerarUniversoTs(r, opcoes, util)]];
  for (const p of r.personagens) {
    const corpo = corpoDe(p, opcoes);
    arquivos.push([`personagens/${p.id}/Personagem.tsx`, gerarPersonagemTsx(p, corpo, util)]);
    arquivos.push([`personagens/${p.id}/FICHA.md`, gerarFicha(p, corpo, opcoes, util)]);
  }
  arquivos.push(['personagens/index.ts', gerarIndice(r, opcoes)]);

  const cores = comum.tabelaCores(r);
  const valores = {
    lista_personagens: r.personagens.map((p) => `${p.nome} (${p.papel === 'protagonista' ? 'narradora' : corpoDe(p, opcoes) === 'crianca' ? 'criança, não fala' : 'apoio, não fala'})`).join(', '),
    narradora: narradora?.nome ?? 'a protagonista',
    antes_agora_resumo: resumoAntesAgora(r, util),
    rotulo_antes: r.antes_e_agora?.rotulo_antes || 'ANTES',
    rotulo_agora: r.antes_e_agora?.rotulo_agora || 'AGORA',
    tabela_personagens: tabelaPersonagens(r, opcoes, util),
    tabela_cores: cores.tabela,
    paleta_nome: `"Linho e petróleo"${r.cores?.paleta ? ' com ajustes' : ''}`,
    marca_resumo: comum.marcaResumo(r),
    cenarios_resumo: comum.cenariosResumo(r),
    tabela_cenarios: tabelaCenarios(r),
    fecho_resumo: comum.resumoFecho(r),
    lista_nunca: comum.listaNunca(r),
    tabela_vozes: [
      '| Personagem | Caminho | voice_id |',
      '|---|---|---|',
      `| ${narradora?.nome ?? 'narradora'} (narradora, a única voz) | ${narradora?.voz?.caminho ?? r.voz?.caminho ?? 'a definir'} | ${narradora?.voz?.voice_id ? `\`${narradora.voz.voice_id}\`` : 'a escolher'} |`,
    ].join('\n'),
  };
  return { arquivos, valores };
};
