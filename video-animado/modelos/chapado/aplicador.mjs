// Aplicador do modelo chapado: a parte do --aplicar que depende do kit.
// O scripts/novo_universo.mjs cuida do comum (validar universo, marca, fecho, cores e proibições, refazer o
// brandbook, reaplicar) e chama estas funções para o que é deste modelo: aparência da Pessoa, acompanhantes,
// cômodos da casa, os arquivos gerados (universo.ts, personagens, fichas, índice) e as lacunas do brandbook.
//
// Contrato (o mesmo em todo kit com aplicador.mjs):
//   validarPersonagem(p, onde, ctx, erros)   campos do personagem que são do modelo
//   validar(r, ctx, erros)                    o resto das respostas que é do modelo
//   perguntaDoErro(erro, r)                   número da pergunta (ou undefined para usar a regra comum)
//   gerar(r, ctx) -> { arquivos: [[caminho, conteúdo], ...], valores: { chave: texto } }
// ctx traz opcoes (componentes/opcoes.json do universo), ids (ids já usados), util e as lacunas comuns.

// ---------------------------------------------------------------- validar

const validarAparencia = (ap, onde, opcoes, erros, ehHex) => {
  if (!ap || typeof ap !== 'object' || Array.isArray(ap)) {
    erros.push(`${onde}.aparencia: obrigatória (objeto com preset ou pele, cabelo e roupa)`);
    return;
  }
  const campos = opcoes.campos_aparencia;
  for (const [k, v] of Object.entries(ap)) {
    const regra = campos[k];
    const lugar = `${onde}.aparencia.${k}`;
    if (!regra) {
      erros.push(`${lugar}: campo desconhecido (aceitos: ${Object.keys(campos).join(', ')})`);
      continue;
    }
    if (regra === 'preset' && !(v in opcoes.presets)) erros.push(`${lugar}: preset "${v}" não existe (aceitos: ${Object.keys(opcoes.presets).join(', ')})`);
    if (regra === 'tom' && !(v in opcoes.tons_pele)) erros.push(`${lugar}: tom "${v}" não existe (aceitos: ${Object.keys(opcoes.tons_pele).join(', ')})`);
    if (regra === 'cabelo' && !opcoes.cabelos.includes(v)) erros.push(`${lugar}: cabelo "${v}" não existe (aceitos: ${opcoes.cabelos.join(', ')})`);
    if (regra === 'baixo' && !opcoes.baixos.includes(v)) erros.push(`${lugar}: "${v}" não existe (aceitos: ${opcoes.baixos.join(', ')})`);
    if (regra === 'manga' && !opcoes.mangas.includes(v)) erros.push(`${lugar}: "${v}" não existe (aceitos: ${opcoes.mangas.join(', ')})`);
    if (regra === 'acessorio' && !opcoes.acessorios.includes(v)) erros.push(`${lugar}: "${v}" não existe (aceitos: ${opcoes.acessorios.join(', ')})`);
    if (regra === 'cor' && !ehHex(v)) erros.push(`${lugar}: cor deve ser hex #RRGGBB (veio ${JSON.stringify(v)})`);
    if (regra === 'sim-nao' && typeof v !== 'boolean') erros.push(`${lugar}: deve ser true ou false (veio ${JSON.stringify(v)})`);
    if (regra.startsWith('numero:')) {
      const [, min, max] = regra.split(':').map(Number);
      if (typeof v !== 'number' || v < min || v > max) erros.push(`${lugar}: número entre ${min} e ${max} (veio ${JSON.stringify(v)})`);
    }
  }
};

export const validarPersonagem = (p, onde, ctx, erros) => {
  if (p.barriga_padrao !== undefined && (typeof p.barriga_padrao !== 'number' || p.barriga_padrao < 0 || p.barriga_padrao > 1)) erros.push(`${onde}.barriga_padrao: número de 0 a 1`);
  validarAparencia(p.aparencia, onde, ctx.opcoes, erros, ctx.util.ehHex);
};

/** Acompanhantes com o id resolvido (id, ou o nome em minúsculas, ou o tipo). */
const acompanhantesDe = (r, util) => (r.acompanhantes ?? []).map((a) => ({ ...a, id: a.id ?? (util.ehTexto(a.nome) ? util.slug(a.nome) : a.tipo) }));

export const validar = (r, ctx, erros) => {
  const { opcoes, ids, util } = ctx;
  if (r.cenarios !== undefined && r.cenarios !== null) {
    const comodos = opcoes.comodos ?? [];
    const casa = r.cenarios.casa;
    if (casa !== undefined && (!Array.isArray(casa) || casa.some((c) => comodos.length && !comodos.includes(c)))) {
      erros.push(`cenarios.casa: lista de cômodos (aceitos: ${comodos.join(', ')})`);
    }
    for (const [k, campo] of [['sala_espera', 'placa'], ['rua', 'loja']]) {
      const v = r.cenarios[k];
      if (v !== undefined && v !== null && (typeof v !== 'object' || (v[campo] !== undefined && v[campo] !== null && !util.ehTexto(v[campo])))) erros.push(`cenarios.${k}.${campo}: texto`);
    }
  }
  if (r.acompanhantes !== undefined) {
    if (!Array.isArray(r.acompanhantes)) erros.push('acompanhantes: lista');
    else
      r.acompanhantes.forEach((a, i) => {
        const onde = `acompanhantes[${i}]`;
        if (!a || !['cachorro', 'bebe'].includes(a.tipo)) return erros.push(`${onde}.tipo: "cachorro" ou "bebe"`);
        const id = a.id ?? (util.ehTexto(a.nome) ? util.slug(a.nome) : a.tipo);
        if (!util.ehSlug(id)) erros.push(`${onde}.id: minúsculas e hífen`);
        else if (ids.has(id)) erros.push(`${onde}.id: "${id}" repetido (use "id" para diferenciar)`);
        else ids.add(id);
        if (a.tipo === 'cachorro' && a.cor !== undefined && !(a.cor in opcoes.cores_cachorro) && !util.ehHex(a.cor)) {
          erros.push(`${onde}.cor: "${a.cor}" não existe (aceitas: ${Object.keys(opcoes.cores_cachorro).join(', ')} ou hex #RRGGBB)`);
        }
        if (a.tipo === 'bebe' && a.pele !== undefined && !(a.pele in opcoes.tons_pele)) erros.push(`${onde}.pele: tom "${a.pele}" não existe`);
      });
  }
};

/** Os acompanhantes entram na pergunta 7 (elenco e acompanhantes). */
export const perguntaDoErro = (erro) => (/^acompanhantes/.test(erro) ? 7 : undefined);

// ---------------------------------------------------------------- gerar

const gerarUniversoTs = (r, acomp, util) => {
  const { ts, hoje } = util;
  const pessoas = {};
  r.personagens.forEach((p, i) => {
    pessoas[p.id] = {
      nome: p.nome,
      papel: p.papel,
      semente: i + 1,
      barriga: p.barriga_padrao ?? 0,
      aparencia: p.aparencia,
    };
  });
  const acompanhantes = {};
  for (const a of acomp) {
    acompanhantes[a.id] = a.tipo === 'cachorro' ? { tipo: 'cachorro', nome: a.nome ?? '', cor: a.cor ?? 'caramelo' } : { tipo: 'bebe', nome: a.nome ?? '', pele: a.pele ?? 'p5' };
  }
  const marca = r.marca
    ? { nome: r.marca.nome, cor: r.marca.cor ?? null, simbolo: r.marca.simbolo ?? null, palavraFecho: r.marca.palavra_fecho ?? null }
    : null;
  const lugares = {
    placaSalaEspera: r.cenarios?.sala_espera?.placa ?? null,
    lojaRua: r.cenarios?.rua?.loja ?? null,
  };
  // o aviso de personagem fictícia só some com aviso_ficticio: false explícito
  const fecho = {
    chamada: r.fecho?.chamada ?? null,
    palavra: r.fecho?.palavra ?? r.marca?.palavra_fecho ?? null,
    avisoFicticio: r.fecho?.aviso_ficticio !== false,
  };
  const cenarios = {
    casa: r.cenarios ? (r.cenarios.casa ?? []) : ['sala', 'cozinha'],
    salaEspera: Boolean(r.cenarios?.sala_espera),
    rua: Boolean(r.cenarios?.rua),
  };
  return `// Gerado por novo_universo.mjs --aplicar a partir de respostas.json em ${hoje()}.
// Não edite à mão: mude respostas.json e rode --aplicar de novo.
// Os componentes do kit leem daqui o nome, a marca, o fecho, a paleta, o elenco, os cenários e os lugares.
import type { AparenciaEntrada, TomPele } from './presets';
import type { Paleta } from './cores';

export const UNIVERSO = ${ts({ nome: r.universo.nome, pasta: r.universo.pasta ?? null, assunto: r.universo.assunto, publico: r.universo.publico, tom: r.universo.tom })} as const;

/** null = nenhuma marca: celular sem logo e fecho de seguir o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null; palavraFecho: string | null } | null = ${ts(marca)};

/** Fecho do vídeo: chamada, palavra do "Comenta" e o aviso de personagem fictícia (ligado se não vier false). */
export const FECHO: { chamada: string | null; palavra: string | null; avisoFicticio: boolean } = ${ts(fecho)};

/** Papéis da paleta trocados pelas respostas (o resto vem do preset do modelo). */
export const PALETA: Partial<Paleta> = ${ts(r.cores?.paleta ?? {})};

export type PessoaDoElenco = { nome: string; papel: 'protagonista' | 'apoio'; semente: number; barriga: number; aparencia: AparenciaEntrada };
export const PESSOAS: Record<string, PessoaDoElenco> = ${ts(pessoas)};

export type AcompanhanteDoElenco =
  | { tipo: 'cachorro'; nome: string; cor: string }
  | { tipo: 'bebe'; nome: string; pele: TomPele };
export const ACOMPANHANTES: Record<string, AcompanhanteDoElenco> = ${ts(acompanhantes)};

/** Cenários escolhidos na entrevista (cômodos da casa, sala de espera, rua). */
export const CENARIOS: { casa: string[]; salaEspera: boolean; rua: boolean } = ${ts(cenarios)};

export const LUGARES: { placaSalaEspera: string | null; lojaRua: string | null } = ${ts(lugares)};
`;
};

const gerarPessoaTsx = (p, util) => `import React from 'react';
import { Pessoa, PessoaPersonagemProps } from '../../componentes/Pessoa';
import { PESSOAS } from '../../componentes/universo';

// ${util.comentario(p.nome.toUpperCase())}${p.idade !== undefined ? `, ${p.idade} anos` : ''}, ${p.papel}. ${util.comentario(p.quem_e ?? '')}
// Desenho fixo: nunca redesenhar nas cenas, sempre importar este componente.
// Gerado por novo_universo.mjs; a aparência mora em componentes/universo.ts (vinda de respostas.json).
const EU = PESSOAS[${JSON.stringify(p.id)}];

export type ${util.nomeTipo(p.id)}Props = PessoaPersonagemProps;

export const Personagem: React.FC<PessoaPersonagemProps> = (props) => (
  <Pessoa aparencia={EU.aparencia} semente={EU.semente} barriga={EU.barriga} {...props} />
);
`;

const gerarCachorroTsx = (a, util) => `import React from 'react';
import { Cachorro, CachorroProps, EXPRESSOES_CACHORRO } from '../../componentes/Acompanhantes';
import { ACOMPANHANTES } from '../../componentes/universo';

// ${util.comentario(a.nome ? a.nome.toUpperCase() : 'CACHORRO')}, cachorro do universo. Não fala: só reage.
// Gerado por novo_universo.mjs; a cor mora em componentes/universo.ts (vinda de respostas.json).
const EU = ACOMPANHANTES[${JSON.stringify(a.id)}] as { tipo: 'cachorro'; nome: string; cor: string };

export const EXPRESSOES = EXPRESSOES_CACHORRO;

export const Personagem: React.FC<Omit<CachorroProps, 'cor'>> = (props) => <Cachorro cor={EU.cor} {...props} />;
`;

const gerarBebeTsx = (a, util) => `import React from 'react';
import { Bebe, BebeProps, EXPRESSOES_BEBE } from '../../componentes/Acompanhantes';
import { ACOMPANHANTES } from '../../componentes/universo';

// ${util.comentario(a.nome ? a.nome.toUpperCase() : 'BEBÊ')}, bebê do universo. Sempre enrolado na manta.
// Gerado por novo_universo.mjs; o tom de pele mora em componentes/universo.ts (vindo de respostas.json).
const EU = ACOMPANHANTES[${JSON.stringify(a.id)}] as { tipo: 'bebe'; nome: string; pele: BebeProps['pele'] };

export const EXPRESSOES = EXPRESSOES_BEBE;

export const Personagem: React.FC<Omit<BebeProps, 'pele'>> = (props) => <Bebe pele={EU.pele} {...props} />;
`;

const gerarIndice = (r, acomp) => {
  const imports = [];
  const linhas = [];
  r.personagens.forEach((p, i) => {
    imports.push(`import { Personagem as P${i} } from './${p.id}/Personagem';`);
    linhas.push(`  { tipo: 'pessoa', id: ${JSON.stringify(p.id)}, nome: ${JSON.stringify(p.nome)}, C: P${i} },`);
  });
  acomp.forEach((a, i) => {
    imports.push(`import { Personagem as A${i} } from './${a.id}/Personagem';`);
    linhas.push(`  { tipo: ${JSON.stringify(a.tipo)}, id: ${JSON.stringify(a.id)}, nome: ${JSON.stringify(a.nome || (a.tipo === 'bebe' ? 'Bebê' : 'Cachorro'))}, C: A${i} },`);
  });
  return `// Gerado por novo_universo.mjs --aplicar. Lista do elenco para o _preview e para os vídeos.
import React from 'react';
import type { PessoaPersonagemProps } from '../componentes/Pessoa';
import type { CachorroProps, BebeProps } from '../componentes/Acompanhantes';
${imports.join('\n')}

export type EntradaElenco =
  | { tipo: 'pessoa'; id: string; nome: string; C: React.FC<PessoaPersonagemProps> }
  | { tipo: 'cachorro'; id: string; nome: string; C: React.FC<Omit<CachorroProps, 'cor'>> }
  | { tipo: 'bebe'; id: string; nome: string; C: React.FC<Omit<BebeProps, 'pele'>> };

export const PERSONAGENS: EntradaElenco[] = [
${linhas.join('\n')}
];
`;
};

const descreverAparencia = (ap, opcoes) => {
  const base = ap.preset ? { ...opcoes.presets[ap.preset] } : {};
  const a = { ...base, ...ap };
  const itens = [];
  if (ap.preset) itens.push(`- **Preset:** \`${ap.preset}\` (o que vem abaixo troca só o que foi respondido).`);
  if (a.pele) itens.push(`- **Pele:** \`${a.pele}\` (base \`${opcoes.tons_pele[a.pele].base}\`, sombra \`${opcoes.tons_pele[a.pele].sombra}\`).`);
  if (a.cabelo) itens.push(`- **Cabelo:** \`${a.cabelo}\`${a.corCabelo ? ` \`${a.corCabelo}\`` : ''}.`);
  const roupa = [];
  if (a.topo) roupa.push(`parte de cima \`${a.topo}\` de manga ${a.manga ?? 'curta'}`);
  if (a.jaleco) roupa.push('jaleco branco por cima');
  if (a.tipoBaixo) roupa.push(`${a.tipoBaixo === 'calca' ? 'calça' : a.tipoBaixo}${a.baixo ? ` \`${a.baixo}\`` : ''}`);
  if (a.sapato) roupa.push(`sapato \`${a.sapato}\``);
  if (roupa.length) itens.push(`- **Roupa (fixa):** ${roupa.join(', ')}.`);
  const extras = ['oculos', 'barba', 'sardas', 'rugas', 'cilios'].filter((k) => a[k]).map((k) => (k === 'oculos' ? 'óculos' : k === 'cilios' ? 'cílios' : k));
  if (a.acessorio && a.acessorio !== 'nenhum') extras.push(a.acessorio === 'perolas' ? 'colar de pérolas' : a.acessorio);
  if (extras.length) itens.push(`- **Detalhes:** ${extras.join(', ')}.`);
  if (a.altura) itens.push(`- **Proporção:** altura ${a.altura} (1 = altura padrão)${a.largura ? `, tronco ${a.largura} px mais largo de cada lado` : ''}.`);
  return itens.join('\n');
};

const gerarFichaPessoa = (p, opcoes, util) => `# ${p.nome}

**Papel:** ${p.papel}${p.idade !== undefined ? ` · ${p.idade} anos` : ''}.
**Quem é:** ${util.umaLinha(p.quem_e) || 'a definir'}.

## Aparência
${descreverAparencia(p.aparencia, opcoes)}

## Voz
${p.voz ? `Caminho: ${p.voz.caminho ?? 'a definir'}${p.voz.voice_id ? ` (\`${p.voz.voice_id}\`)` : ''}.` : 'A definir na entrevista.'}

## Expressões
As 10 de todos os humanos (\`neutra, falando, feliz, surpresa, pensando, apontando, ansiosa, cansada, rindo, emocionada\`). Folha: still \`expressoes-${p.id}\` do \`_preview\`.

## Código
\`personagens/${p.id}/Personagem.tsx\` → \`<Personagem expressao="feliz" falando={v} escala={1} />\`
Objetos: \`segurando="celular"\`, \`segurando="objeto"\` com \`objeto={<Caneca x={0} y={0} />}\`, \`segurando="bebe"\`.
`;

const gerarFichaAcomp = (a) => `# ${a.nome || (a.tipo === 'bebe' ? 'Bebê' : 'Cachorro')}

**O que é:** ${a.tipo === 'cachorro' ? `cachorro${a.cor ? ` (${a.cor})` : ''}. Não fala: só reage.` : 'bebê, sempre enrolado na manta. Não fala.'}

## Expressões
${a.tipo === 'cachorro' ? '`neutra, curioso, feliz, triste, assustado`' : '`dormindo, acordado, chorando, rindo`'}. Folha: still \`expressoes-${a.id}\` do \`_preview\`.

## Código
\`personagens/${a.id}/Personagem.tsx\` → \`<Personagem expressao="${a.tipo === 'cachorro' ? 'curioso' : 'acordado'}" escala={1} />\`
`;

const tabelaPersonagens = (r, acomp, opcoes, util) => {
  const l = ['| Personagem | Quem é | Visual que identifica | Fala? |', '|---|---|---|---|'];
  for (const p of r.personagens) {
    const a = { ...(p.aparencia.preset ? opcoes.presets[p.aparencia.preset] : {}), ...p.aparencia };
    const visual = [a.cabelo && `cabelo ${a.cabelo}`, a.oculos && 'óculos', a.barba && 'barba', a.jaleco && 'jaleco', a.topo && `roupa \`${a.topo}\``].filter(Boolean).join(', ');
    l.push(`| **${p.nome}** | ${p.idade !== undefined ? `${p.idade} anos, ` : ''}${util.umaLinha(p.quem_e)} | ${visual} | sim${p.papel === 'protagonista' ? ', protagonista' : ''} |`);
  }
  for (const a of acomp) l.push(`| **${a.nome || a.tipo}** | ${a.tipo === 'cachorro' ? `cachorro ${a.cor ?? 'caramelo'}` : 'bebê'} | ${a.tipo === 'cachorro' ? 'sentado, orelhas caídas' : 'manta com faixa'} | não, só reage |`);
  return l.join('\n');
};

const COMODOS_INFO = {
  sala: ['Casa · sala', '`<Casa comodo="sala" />`', 'janela com cortina (lua à noite), sofá com almofadas, quadro, luminária, planta na frente, tapete', 'fundo2, apoio, apoio2'],
  cozinha: ['Casa · cozinha', '`<Casa comodo="cozinha" listas={8} />`', 'a geladeira de listas (post-its e a lista grande; `listas` vai de 0 a 12 ao longo da série), armários, azulejo, bancada, chaleira', 'fundo, apoio2Claro, apoio2'],
  quarto: ['Casa · quarto', '`<Casa comodo="quarto" etapaQuarto={0} />`', 'arrumado em etapas: 0 caixas de mudança, 1 cama, 2 cômoda com abajur, 3 quadros, prateleira e planta', 'apoio2Claro, fundo, apoio'],
  banheiro: ['Casa · banheiro', '`<Casa comodo="banheiro" objetosNaPia={[\'copo-escova\', \'frasco\']} />`', 'espelho oval, toalha, pia com até 4 objetos (`copo-escova`, `frasco`, `pote`, `sabonete`, `pasta`); `objetoBrilhando` e `brilho` destacam um', 'fundo, apoio2Claro, apoio2'],
};

const tabelaCenarios = (r) => {
  const c = r.cenarios ?? { casa: ['sala', 'cozinha'] };
  const l = ['| Cenário | Componente | Áreas e objetos fixos | Cores dominantes |', '|---|---|---|---|'];
  for (const comodo of c.casa ?? []) {
    const info = COMODOS_INFO[comodo];
    if (info) l.push(`| ${info.join(' | ')} |`);
  }
  if (c.sala_espera) {
    const placa = c.sala_espera.placa ?? 'Sala 1';
    l.push(`| Sala de espera | \`<SalaDeEspera />\` | porta com a placa "${placa}", cadeiras, relógio, quadro de folhas, mesinha com revistas | fundo, apoio2Claro, apoio2 |`);
  }
  if (c.rua) {
    const loja = c.rua.loja ?? 'Loja';
    l.push(`| Rua · loja | \`<Rua />\` | loja fictícia "${loja}" com toldo listrado e vitrine, calçada, árvore na frente, prédios ao fundo | céu claro, fundo, destaque no toldo |`);
  }
  if (l.length === 2) l.push('| (nenhum escolhido) | `<Casa comodo="sala" />` | a sala serve de padrão | fundo2, apoio |');
  return l.join('\n');
};

export const gerar = (r, ctx) => {
  const { opcoes, util, comum } = ctx;
  const acomp = acompanhantesDe(r, util);
  const arquivos = [['componentes/universo.ts', gerarUniversoTs(r, acomp, util)]];
  for (const p of r.personagens) {
    arquivos.push([`personagens/${p.id}/Personagem.tsx`, gerarPessoaTsx(p, util)]);
    arquivos.push([`personagens/${p.id}/FICHA.md`, gerarFichaPessoa(p, opcoes, util)]);
  }
  for (const a of acomp) {
    arquivos.push([`personagens/${a.id}/Personagem.tsx`, a.tipo === 'cachorro' ? gerarCachorroTsx(a, util) : gerarBebeTsx(a, util)]);
    arquivos.push([`personagens/${a.id}/FICHA.md`, gerarFichaAcomp(a)]);
  }
  arquivos.push(['personagens/index.ts', gerarIndice(r, acomp)]);

  const cores = comum.tabelaCores(r);
  const valores = {
    lista_personagens: [
      ...r.personagens.map((p) => `${p.nome} (${p.papel})`),
      ...acomp.map((a) => `${a.nome || a.tipo} (${a.tipo === 'cachorro' ? 'cachorro' : 'bebê'})`),
    ].join(', '),
    tabela_personagens: tabelaPersonagens(r, acomp, opcoes, util),
    tabela_cores: cores.tabela,
    paleta_nome: cores.nome,
    marca_resumo: comum.marcaResumo(r),
    cenarios_resumo: comum.cenariosResumo(r),
    tabela_cenarios: tabelaCenarios(r),
    fecho_resumo: comum.resumoFecho(r),
    lista_nunca: comum.listaNunca(r),
    tabela_vozes: ['| Personagem | Caminho | voice_id |', '|---|---|---|', ...r.personagens.map((p) => `| ${p.nome} | ${p.voz?.caminho ?? r.voz?.caminho ?? 'a definir'} | ${p.voz?.voice_id ? `\`${p.voz.voice_id}\`` : 'a escolher'} |`)].join('\n'),
  };
  return { arquivos, valores };
};
