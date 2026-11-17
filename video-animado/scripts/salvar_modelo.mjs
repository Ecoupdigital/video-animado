#!/usr/bin/env node
// Salva um universo pronto como modelo local, no formato de kit, para voltar no catálogo.
//
// Uso: node salvar_modelo.mjs <universo> <estudio> <id>
//
// Cria <estudio>/modelos/<id>/ com:
//   base/                 o universo sem videos/, imagens/, node_modules nem áudio (os efeitos se refazem
//                         pelo _ferramentas/gerar_sfx.py); o brandbook volta a ter as lacunas quando o
//                         universo guarda o modelo dele (.brandbook-modelo.md), e o texto escrito nelas
//                         vai para base/lacunas-de-origem.md
//   modelo.json           origem "local", tipo e receita do modelo de origem (universo da entrevista
//                         completa, sem .modelo.json: tipo pelo que tem em personagens/ e receita padrão, com aviso)
//   RECEITA.md            a do universo; sem ela, uma receita que aponta para a Parte B de sempre
//   FICHA-DO-MODELO.md, PERGUNTAS.md
//   teste/respostas.json  as respostas do universo (com o id novo); teste/roteiro-falas.json do último vídeo
//   vitrine/              vitrine.json e, a partir de imagens/ e videos/ do universo, elenco.jpg, folha.jpg
//                         e trecho.mp4 (o que faltar vira aviso com o comando que gera)
// Sai 1 se o id já existir (no estúdio ou nos modelos da skill) ou se o universo não for achado.
// Node puro, sem dependência; ffmpeg para as imagens e o trecho da vitrine.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { conferirKit } from './conferir_kit.mjs';
import { extrairLacunas, pecas, MODELO_BB, VALORES_BB } from './novo_universo.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(AQUI, '..');
const BRANDBOOK = 'BRANDBOOK-ANIMACAO.md';
const LIMITE_TRECHO = 2 * 1024 * 1024;

const falhar = (msg) => {
  console.log(msg);
  process.exit(1);
};
const lerJson = (arq) => {
  try {
    return JSON.parse(fs.readFileSync(arq, 'utf8'));
  } catch {
    return null;
  }
};
const ehSlug = (v) => typeof v === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(v);
const hoje = () => new Date().toISOString().slice(0, 10);
const rel = (p) => path.relative(process.cwd(), p) || '.';
const avisos = [];
const aviso = (m) => avisos.push(m);

// JSON com listas curtas numa linha só (o conferir_neutro pula a linha inteira de "termos_proibidos")
const jsonBonito = (v) => JSON.stringify(v, null, 2).replace(/\[\s+([^\[\]{}]*?)\s+\]/g, (_, dentro) => `[${dentro.replace(/\s*\n\s*/g, ' ')}]`) + '\n';

// ---------------------------------------------------------------- entrada

const args = process.argv.slice(2);
if (args.length !== 3) falhar('Uso: node salvar_modelo.mjs <universo> <estudio> <id>');
const universo = path.resolve(args[0]);
const estudio = path.resolve(args[1]);
const id = args[2];
if (!ehSlug(id)) falhar(`id inválido "${id}": use letras minúsculas, números e hífen (ex.: consultorio-sorriso)`);
if (!fs.existsSync(path.join(universo, BRANDBOOK))) falhar(`universo não encontrado ou sem ${BRANDBOOK}: ${args[0]}`);
const destino = path.join(estudio, 'modelos', id);
if (fs.existsSync(destino)) falhar(`o id "${id}" já existe em ${rel(path.join(estudio, 'modelos'))}: escolha outro nome para o modelo`);
if (fs.existsSync(path.join(SKILL, 'modelos', id))) falhar(`o id "${id}" já é de um modelo da skill: escolha outro nome para o modelo`);

const origem = lerJson(path.join(universo, '.modelo.json'));
const respostas = lerJson(path.join(universo, 'respostas.json'));
const brandbook = fs.readFileSync(path.join(universo, BRANDBOOK), 'utf8');
const titulo = (brandbook.match(/^#\s+(.+)$/m) || [])[1]?.trim();
const nomeUniverso = respostas?.universo?.nome || titulo || path.basename(universo);
const acharKit = (kid) => [path.join(estudio, 'modelos', kid), path.join(SKILL, 'modelos', kid)].find((c) => fs.existsSync(path.join(c, 'modelo.json')));
const kitOrigem = origem?.id ? acharKit(origem.id) : null;
const mOrigem = kitOrigem ? lerJson(path.join(kitOrigem, 'modelo.json')) : null;
if (!origem) aviso('o universo não tem .modelo.json (nasceu da entrevista completa): tipo e receita padrão');
else if (!kitOrigem) aviso(`o modelo de origem "${origem.id}" não foi achado: perguntas e stills de prova padrão`);

// ---------------------------------------------------------------- base

const FORA_RAIZ = new Set([
  'videos', 'imagens', 'out', 'frames', 'revisao', 'respostas.json', 'RECEITA.md', '.modelo.json', MODELO_BB, VALORES_BB,
  'BRANDBOOK-ANIMACAO.html', 'BRANDBOOK-ANIMACAO.novo.md', 'lacunas-de-origem.md',
]);
const FORA_PASTA = new Set(['node_modules', '.cache', '.git']);
const AUDIO_VIDEO = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.mp4', '.mov', '.webm']);
const base = path.join(destino, 'base');
fs.mkdirSync(base, { recursive: true });
// cópia com filtro (nunca cp -r: o node_modules do universo é o motor)
fs.cpSync(universo, base, {
  recursive: true,
  filter: (src) => {
    const r = path.relative(universo, src);
    if (!r) return true;
    const partes = r.split(path.sep);
    if (FORA_RAIZ.has(partes[0])) return false;
    if (partes.some((p) => FORA_PASTA.has(p))) return false;
    return !AUDIO_VIDEO.has(path.extname(src).toLowerCase());
  },
});

// brandbook: de volta às lacunas, com o texto escrito guardado à parte
const mbPath = path.join(universo, MODELO_BB);
if (fs.existsSync(mbPath)) {
  const modeloBb = fs.readFileSync(mbPath, 'utf8');
  fs.writeFileSync(path.join(base, BRANDBOOK), modeloBb);
  const vb = lerJson(path.join(universo, VALORES_BB));
  const ps = pecas(modeloBb);
  const lacunas = extrairLacunas(ps, brandbook, vb);
  const instrucoes = ps.filter((p) => p.tipo === 'lacuna').map((p) => p.bruto.replace(/<!--\s*ESCREVER:\s*/, '').replace(/\s*-->$/, ''));
  if (!lacunas) {
    aviso(`o ${BRANDBOOK} do universo foi editado fora das lacunas: o texto escrito à mão não foi guardado em lacunas-de-origem.md`);
  } else {
    const escritas = lacunas.map((t, i) => [i, t]).filter(([, t]) => t && !t.includes('ESCREVER:'));
    if (escritas.length) {
      const md = [
        `# Texto das lacunas no universo de origem (${nomeUniverso})`,
        '',
        `O que foi escrito no lugar de cada marca \`ESCREVER\` do brandbook do universo de origem. Ao criar um universo a partir deste modelo, aproveite o que servir e adapte às respostas novas; o \`--conferir\` só passa quando as marcas do \`${BRANDBOOK}\` forem redigidas.`,
        '',
        ...escritas.flatMap(([i, t]) => [`## Lacuna ${i + 1}: ${instrucoes[i]}`, '', t.trim(), '']),
      ].join('\n');
      fs.writeFileSync(path.join(base, 'lacunas-de-origem.md'), md);
    }
  }
} else if (/\{\{|ESCREVER:/.test(brandbook)) {
  aviso(`o ${BRANDBOOK} do universo ainda tem lacunas: o modelo sai com elas`);
}

// ---------------------------------------------------------------- manifesto, receita, ficha, perguntas

const temPersonagem = fs.existsSync(path.join(universo, 'personagens')) && fs.readdirSync(path.join(universo, 'personagens'), { withFileTypes: true }).some((d) => d.isDirectory());
const tipo = origem?.tipo || mOrigem?.tipo || (temPersonagem ? 'personagens' : 'sem-personagem');
const receita = origem?.receita || mOrigem?.receita || 'vozes-por-fala';
const configuravel = fs.existsSync(path.join(universo, 'componentes', 'opcoes.json'));
const modelo = {
  id,
  nome: nomeUniverso,
  versao: '1.0',
  origem: 'local',
  tipo,
  receita,
  resumo: `Estilo salvo do universo ${nomeUniverso}${origem?.id ? ` (feito a partir do modelo ${origem.id} ${origem.versao ?? ''})`.replace(' )', ')') : ' (entrevista completa)'}.`,
  perguntas: mOrigem?.perguntas ?? { pular: [], trocar: {}, acrescentar: [] },
  termos_proibidos: [],
  stills_prova: mOrigem?.stills_prova ?? ['expressoes-*'],
  criado_em: hoje(),
  baseado_em: { universo: path.basename(universo), modelo: origem?.id ?? null, versao: origem?.versao ?? null },
};
fs.writeFileSync(path.join(destino, 'modelo.json'), jsonBonito(modelo));

if (fs.existsSync(path.join(universo, 'RECEITA.md'))) {
  fs.copyFileSync(path.join(universo, 'RECEITA.md'), path.join(destino, 'RECEITA.md'));
} else {
  fs.writeFileSync(
    path.join(destino, 'RECEITA.md'),
    `# Receita de vídeo: Parte B de sempre\n\nO universo de origem (${nomeUniverso}) nasceu da entrevista completa e não tinha receita própria. Siga os passos de sempre da Parte B da SKILL.md (\`/video-animado\`), lendo antes o \`BRANDBOOK-ANIMACAO.md\` e as fichas em \`personagens/\`.\n`,
  );
}

const u = respostas?.universo ?? {};
const elenco = (respostas?.personagens ?? []).map((p) => `${p.nome} (${p.papel}${p.quem_e ? `: ${p.quem_e}` : ''})`);
const acomp = (respostas?.acompanhantes ?? []).map((a) => `${a.nome || a.tipo} (${a.tipo === 'bebe' ? 'bebê' : a.tipo})`);
const fichaOrigem = kitOrigem && fs.existsSync(path.join(kitOrigem, 'FICHA-DO-MODELO.md')) ? fs.readFileSync(path.join(kitOrigem, 'FICHA-DO-MODELO.md'), 'utf8') : '';
const estrutura = (fichaOrigem.match(/\*\*Estrutura de episódio[^\n]*\n(?:\d+\..*\n?)+/) || [])[0]?.trim();
fs.writeFileSync(
  path.join(destino, 'FICHA-DO-MODELO.md'),
  [
    `# ${nomeUniverso} (modelo local)`,
    '',
    `**Para que serve:** ${u.assunto ? `vídeos sobre ${u.assunto}` : `vídeos no estilo do universo ${nomeUniverso}`}. Mesmo desenho, elenco, cenários e receita do universo de origem; a entrevista curta troca o que é configuração (nome, assunto, marca, cores, voz, proibições, fecho${configuravel ? ', e também o elenco, pela aparência de cada personagem' : ''}).`,
    '',
    `**Público típico:** ${u.publico || 'o mesmo do universo de origem'}. **Tom:** ${u.tom || 'o do universo de origem'}.`,
    '',
    `**Elenco do universo de origem:** ${[...elenco, ...acomp].join('; ') || 'ver personagens/ na base'}.`,
    '',
    ...(estrutura ? [estrutura, ''] : []),
    `**De onde veio:** universo \`${path.basename(universo)}\`${origem?.id ? `, criado do modelo \`${origem.id}\` ${origem.versao ?? ''}` : ', criado pela entrevista completa'}, salvo em ${hoje().split('-').reverse().join('/')}.`,
    '',
    configuravel
      ? '**Trocar personagem:** pela entrevista curta, como no modelo de origem: a aparência de cada um vai no `respostas.json` e o `novo_universo.mjs --aplicar` refaz os personagens.'
      : '**Trocar personagem:** os personagens foram desenhados à mão neste universo; trocar um deles é o Claude editando o `Personagem.tsx` pela `FICHA.md` (ver `references/modelo-local.md` na skill). O `--aplicar` não serve para este modelo.',
    '',
    '**Limites:** os mesmos do universo de origem; sem ferramenta externa de imagem ou vídeo por IA.',
    '',
  ].join('\n'),
);

const pgOrigem = kitOrigem && fs.existsSync(path.join(kitOrigem, 'PERGUNTAS.md')) ? fs.readFileSync(path.join(kitOrigem, 'PERGUNTAS.md'), 'utf8') : null;
const notaPg = `> Modelo local salvo do universo ${nomeUniverso}. As respostas do universo de origem estão em \`teste/respostas.json\` e o \`novo_universo.mjs\` copia esse arquivo para o universo novo como ponto de partida: a entrevista curta pergunta o que muda e mantém o resto.\n`;
fs.writeFileSync(
  path.join(destino, 'PERGUNTAS.md'),
  pgOrigem
    ? pgOrigem.replace(/^(# .*\n)/, `$1\n${notaPg}`)
    : `# Perguntas da entrevista curta neste modelo\n\n${notaPg}\nUsa as 12 perguntas base de \`references/entrevista-curta.md\` (na skill). As perguntas 1 a 4 e 8 a 12 trocam configuração e são aplicadas pelo Claude no brandbook (as duas versões) e nas fichas; nas perguntas 5 a 7, trocar personagem é o Claude editando o \`Personagem.tsx\` pela \`FICHA.md\`.\n`,
);

// ---------------------------------------------------------------- teste

fs.mkdirSync(path.join(destino, 'teste'), { recursive: true });
if (respostas) {
  fs.writeFileSync(path.join(destino, 'teste', 'respostas.json'), JSON.stringify({ ...respostas, modelo: id, versao_modelo: '1.0' }, null, 2) + '\n');
} else {
  aviso('o universo não tem respostas.json: teste/respostas.json leva só o nome; complete pela entrevista curta');
  fs.writeFileSync(path.join(destino, 'teste', 'respostas.json'), JSON.stringify({ modelo: id, versao_modelo: '1.0', universo: { nome: nomeUniverso } }, null, 2) + '\n');
}
const videos = path.join(universo, 'videos');
const porData = (arqs) => arqs.filter((a) => fs.existsSync(a)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
const eps = fs.existsSync(videos) ? fs.readdirSync(videos, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => path.join(videos, d.name)) : [];
const roteiro = porData(eps.map((e) => path.join(e, 'roteiro-falas.json')))[0];
if (roteiro) fs.copyFileSync(roteiro, path.join(destino, 'teste', 'roteiro-falas.json'));
else aviso('nenhum videos/*/roteiro-falas.json no universo: o modelo sai sem teste/roteiro-falas.json (o gerar_vitrine.mjs precisa dele para o trecho)');

// ---------------------------------------------------------------- vitrine

const vitrine = path.join(destino, 'vitrine');
fs.mkdirSync(vitrine, { recursive: true });
fs.writeFileSync(
  path.join(vitrine, 'vitrine.json'),
  JSON.stringify(
    {
      nome_exibicao: nomeUniverso,
      frase: u.assunto ? `${u.assunto.charAt(0).toUpperCase()}${u.assunto.slice(1)}.` : `O estilo do universo ${nomeUniverso}.`,
      exemplo: `Exemplo: ${nomeUniverso}`,
      arquivos: { folha: 'folha.jpg', elenco: 'elenco.jpg', trecho: 'trecho.mp4' },
    },
    null,
    2,
  ) + '\n',
);
const temFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
const ff = (argv) => spawnSync('ffmpeg', ['-v', 'error', '-y', ...argv], { stdio: 'ignore' }).status === 0;
const cmdStill = (sid) => `(cd ${rel(universo)} && npx remotion still _preview/src/index.ts ${sid} imagens/${sid}.png)`;
const prot = (respostas?.personagens ?? []).find((p) => p.papel === 'protagonista') ?? (respostas?.personagens ?? [])[0];

if (!temFfmpeg) {
  aviso('sem ffmpeg: a vitrine sai sem imagens e sem trecho; instale o ffmpeg e gere com gerar_vitrine.mjs');
} else {
  // elenco: as expressões da protagonista (o desenho de verdade do universo)
  const candElenco = [
    prot && path.join(universo, 'imagens', `expressoes-${prot.id}.png`),
    prot && path.join(universo, 'personagens', prot.id, 'expressoes.png'),
    // universo da entrevista completa: personagens/<nome>/expressoes.png, o primeiro que houver
    ...(fs.existsSync(path.join(universo, 'personagens'))
      ? fs.readdirSync(path.join(universo, 'personagens')).sort().map((d) => path.join(universo, 'personagens', d, 'expressoes.png'))
      : []),
    path.join(universo, 'imagens', 'elenco.png'),
  ].filter(Boolean);
  const elenco = candElenco.find((c) => fs.existsSync(c));
  if (elenco && ff(['-i', elenco, '-vf', "scale='min(1600,iw)':-2", '-q:v', '4', path.join(vitrine, 'elenco.jpg')])) {
    console.log(`vitrine: elenco.jpg de ${rel(elenco)}`);
  } else {
    aviso(`vitrine sem elenco.jpg: falta imagens/expressoes-${prot?.id ?? '<protagonista>'}.png; gere com ${cmdStill(`expressoes-${prot?.id ?? '<id>'}`)} (ou node _preview/gerar-html.mjs --stills) e salve o modelo de novo com outro id`);
  }

  // folha: a folha de frames do último vídeo; sem vídeo, os stills de teste lado a lado
  const folhaVideo = porData(eps.flatMap((e) => [path.join(e, 'revisao', 'folha.png'), path.join(e, 'frames', '_folha.jpg')]))[0];
  const testes = ['teste-cena', 'teste-fecho', 'teste-noite'].map((sid) => path.join(universo, 'imagens', `${sid}.png`)).filter((p) => fs.existsSync(p));
  let folhaOk = false;
  if (folhaVideo) folhaOk = ff(['-i', folhaVideo, '-vf', "scale='min(1800,iw)':-2", '-q:v', '4', path.join(vitrine, 'folha.jpg')]);
  else if (testes.length) {
    const filtro = `${testes.map((_, i) => `[${i}:v]scale=-2:640,pad=iw+12:ih:6:0:color=0xFAF8F5[f${i}]`).join(';')};${testes.map((_, i) => `[f${i}]`).join('')}hstack=inputs=${testes.length}`;
    folhaOk = ff([...testes.flatMap((t) => ['-i', t]), '-filter_complex', testes.length > 1 ? filtro : `[0:v]scale=-2:640`, '-frames:v', '1', '-q:v', '4', path.join(vitrine, 'folha.jpg')]);
  }
  if (folhaOk) console.log(`vitrine: folha.jpg de ${folhaVideo ? rel(folhaVideo) : testes.map((t) => path.basename(t, '.png')).join(', ')}`);
  else aviso(`vitrine sem folha.jpg: nenhum vídeo com folha de frames e faltam imagens/teste-cena.png e teste-fecho.png; gere com ${cmdStill('teste-cena')}`);

  // trecho: 5 s do último vídeo renderizado ou da última prévia, sem áudio
  const video = porData(eps.flatMap((e) => [path.join(e, 'out', 'ep.mp4'), path.join(e, 'revisao', 'previa.mp4')]))[0];
  const trecho = path.join(vitrine, 'trecho.mp4');
  if (video && ff(['-t', '5', '-i', video, '-an', '-vf', "scale='min(540,iw)':-2", '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', trecho])) {
    if (fs.statSync(trecho).size > LIMITE_TRECHO) {
      fs.rmSync(trecho);
      aviso('o trecho passou de 2 MB e foi descartado; gere com gerar_vitrine.mjs');
    } else console.log(`vitrine: trecho.mp4 de ${rel(video)}`);
  } else {
    aviso(`vitrine sem trecho.mp4: o universo não tem vídeo renderizado nem prévia; ${roteiro ? `gere com node ${rel(path.join(AQUI, 'gerar_vitrine.mjs'))} ${id} --estudio ${rel(estudio)}` : 'faça um vídeo (ou a prévia sem voz) e gere com gerar_vitrine.mjs'}`);
  }
}

// ---------------------------------------------------------------- fim

const conf = conferirKit(destino);
for (const a of avisos) console.log(`aviso: ${a}`);
for (const a of conf.avisos) console.log(`aviso: ${a}`);
if (conf.erros.length) {
  console.log(`modelo salvo em ${rel(destino)}, mas com ${conf.erros.length} problema(s) no kit:`);
  for (const e of conf.erros) console.log(`  - ${e}`);
  process.exit(1);
}
console.log(`ok: modelo local "${id}" salvo em ${rel(destino)} (${nomeUniverso}, ${tipo}, ${receita})`);
console.log(`próximo passo: node ${rel(path.join(AQUI, 'catalogo.mjs'))} --estudio ${rel(estudio)}  (o modelo aparece com o selo "seu modelo")`);
