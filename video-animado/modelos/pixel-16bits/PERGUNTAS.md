# Perguntas da entrevista curta neste modelo

O pixel tem **um boneco só**: usa as 12 perguntas base de `references/entrevista-curta.md` (na skill) **menos a 7** (elenco de apoio), sem acrescentar nenhuma: **11 perguntas**. Três são trocadas pela versão do modelo: a 6 vira `aparencia-pixel`, a 8 vira `topo-rotulo-assinatura` e a 12 vira `card-final-perfil`. A 10 é a voz de uma narração inteira. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [7], "trocar": { "6": "aparencia-pixel", "8": "topo-rotulo-assinatura", "12": "card-final-perfil" }, "acrescentar": [] }`.

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 1. Nome do universo | o nome da série de notícias (ex.: "Plantão Pet", "IA em 30 segundos"); vira o rótulo padrão do topo | `universo.nome`, `universo.pasta` |
| 2. Assunto e público | que notícia a série conta e quem assiste | `universo.assunto`, `universo.publico` |
| 3. Tom | recomendação: "claro e animado, sem enrolação"; o pixel combina com ritmo rápido | `universo.tom` |
| 4. Marca | nome, cor (hex) e símbolo (folha de símbolos: a linha "Estampa" da folha de opções) ou nenhuma. A marca dá a estampa do peito (símbolo ou inicial na cor dela), o rótulo do card final e, com `cores.origem: "marca"`, o destaque do vídeo. Sem marca: `marca: null` (estampa ">_" ou nenhuma, card final só com o perfil) | `marca` (`nome`, `cor`, `simbolo`) |
| 5. Personagem principal | quem apresenta: nome, idade e quem é numa frase (é o rosto do perfil, em pixel) | `personagens[0]` (`id`, `nome`, `papel: "protagonista"`, `idade`, `quem_e`) |
| 6. Aparência pixel (`aparencia-pixel`) | ver abaixo | `personagens[0].aparencia` |
| 7 | **pulada**: o boneco é único (não há elenco de apoio no pixel) | (nenhum) |
| 8. Topo (`topo-rotulo-assinatura`) | ver abaixo | `topo.rotulo`, `topo.assinatura` |
| 9. Cores | do modelo (claro e violeta), da marca (o destaque vira a cor da marca) ou trocas por papel | `cores.origem`, `cores.paleta` |
| 10. Voz | **uma narração inteira, uma voz só**: os 3 caminhos (clonada, pronta, áudio próprio). Recomendação: voz pronta do ElevenLabs, animada e clara. Com áudio próprio, a pessoa grava a narração inteira de uma vez | `voz.caminho`, `voz.voice_id` |
| 11. O que nunca pode acontecer | as proibições da pessoa **somadas às regras fixas do modelo** (nenhum logo de empresa de terceiros, notícia com fonte, sprite nunca suavizado nem redesenhado à mão) | `nunca` |
| 12. Card final (`card-final-perfil`) | ver abaixo | `fecho.perfil`, `fecho.frase`, `fecho.rotulo` |

**Pergunta 6 trocada: `aparencia-pixel`.** Antes de perguntar, gere e mostre a folha de opções do universo recém-copiado (não precisa do Remotion): `python3 gerador/opcoes.py imagens/opcoes-aparencia.png`. Pergunte numa mensagem só, a partir da descrição da pergunta 5:

- **Tom de pele** `pele`: `p1` (mais clara) a `p8` (mais escura).
- **Cabelo** `cabelo`: `curto`, `raspado`, `careca`, `coque`, `crespo`, `comprido`, `cacheado`; **cor** `corCabelo`: `castanho`, `escuro`, `preto`, `loiro`, `ruivo`, `grisalho`, `branco` ou hex.
- **Barba** `barba`: `nenhuma`, `cheia`, `curta`. **Óculos** `oculos`: `null` ou a cor (`preto`, `tartaruga`, `dourado`, `vermelho`, `azul`, `branco` ou hex). **Cílios** `cilios`: `true` ou `false`.
- **Roupa** `roupa`: `grafite`, `preto`, `branco`, `cinza`, `azul`, `verde`, `vinho`, `coral`, `mostarda`, `roxo` ou hex.
- **Estampa no peito** `estampa`: `simbolo` (o da marca), `inicial` (a da marca), `terminal` (">_") ou `nenhuma`; cor `corEstampa` (padrão: a cor da marca). Estampa que some na roupa ganha contorno sozinha.
- Recomendação: a roupa numa cor que não seja a da marca (a estampa aparece melhor) e a estampa com o símbolo da marca; sem marca, ">_" ou nenhuma.
- Opções para o AskUserQuestion: "Boneco montado pela descrição (Recomendado)" (mostre os códigos escolhidos), "Eu escolho os códigos na folha".
- Depois de gravar: `--aplicar` gera os 72 sprites; mostre o still `elenco` para aprovação de olho.
- Campo: `personagens[0].aparencia: { "pele": "p7", "cabelo": "cacheado", "corCabelo": "preto", "barba": "nenhuma", "oculos": "preto", "roupa": "verde", "estampa": "simbolo", "corEstampa": "#F2B544", "cilios": true }`. Código fora da lista: o `--aplicar` recusa, diz o campo, os aceitos e a pergunta 6.

**Pergunta 8 trocada: `topo-rotulo-assinatura`.** No lugar de cenários (o pixel não tem cenário), o topo de todo vídeo:

- **Rótulo** (esquerda, mono, cinza): o tipo do conteúdo, como comentário de código. Recomendação: `// <assunto em 1 ou 2 palavras>` (ex.: `// plantão pet`, `// notícia de IA`).
- **Assinatura** (direita, mono, caixa alta): o perfil ou a marca; o pedaço depois do último ponto sai no destaque (ex.: `BICHOBOM.VET`). Recomendação: o @ sem a arroba, em caixa alta.
- Texto longo encolhe para caber na linha.
- Opções para o AskUserQuestion: "Rótulo e assinatura sugeridos (Recomendado)", "Eu escrevo".
- Campo: `topo: { "rotulo": "// plantão pet", "assinatura": "BICHOBOM.VET" }`.

**Pergunta 12 trocada: `card-final-perfil`.** O card que fecha todo vídeo, depois da voz:

- **Perfil** (obrigatório): o @ que aparece grande ao lado do rosto do boneco.
- **Frase**: uma linha curta embaixo do @ (recomendação: o que a pessoa ganha seguindo, até 40 letras). `null` tira a frase.
- **Rótulo** em cima do card (opcional): padrão `// <nome da marca>` ou `// perfil` sem marca.
- O botão "Seguir" vira "Seguindo" com um clique; sem logo de rede social.
- Opções para o AskUserQuestion: "Perfil com a frase recomendada (Recomendado)", "Eu escrevo a frase".
- Campo: `fecho: { "perfil": "@bichobom.vet", "frase": "notícia de pet sem susto, toda semana" }`.

**Depois das respostas:** `novo_universo.mjs --aplicar` (gera `universo.ts`, `aparencia.json`, os 72 sprites em `public/px/` e a folha em `public/opcoes.png`), redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `elenco`, `card-lista` e `card-final`.

Códigos aceitos em `respostas.json`: lista em `base/componentes/opcoes.json` (o `novo_universo.mjs --aplicar` recusa código fora dela e diz qual, com o número da pergunta).
