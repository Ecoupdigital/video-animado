# Perguntas da entrevista curta neste modelo

A Dados e história é uma **família**: um modelo com 4 temas (isométrico, linha do tempo, mapa, jornal). Não tem personagem: usa as 12 perguntas base de `references/entrevista-curta.md` (na skill) **menos a 5, a 6 e a 7** (personagem principal, aparência e elenco de apoio), sem acrescentar nenhuma: **9 perguntas**. Três são trocadas pela versão do modelo: a 8 vira `tema` (qual dos 4 temas), a 9 vira `cores-do-tema` (as cores do tema escolhido) e a 12 vira `card-final`. A 10 é a voz de uma narração inteira e a 11 junta as regras fixas do modelo às da pessoa. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [5, 6, 7], "trocar": { "8": "tema", "9": "cores-do-tema", "12": "card-final" }, "acrescentar": [] }`, com a lista `temas` e `"tema_recomendado": "isometrico"`.

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 1. Nome do universo | o nome da série (ex.: "Fôlego em Números", "A Nossa História", "Relatório de 1 Minuto"); vira o rótulo do topo, em caixa alta, a não ser que a pessoa queira outro (ex.: com o trimestre) | `universo.nome`, `universo.pasta`, `dados.rotulo` (opcional) |
| 2. Assunto e público | o que a série mostra (o resultado, a história, o caminho) e quem assiste. Se a pessoa já tiver o primeiro vídeo, grave em `amostra`: os stills de conferência mostram esse título, esse número, esse marco, esse chip e essa manchete (sem isso, os dados neutros do kit) | `universo.assunto`, `universo.publico`, `amostra` (opcional: `titulo`, `valor`, `marco`, `chip`, `manchete`) |
| 3. Tom | recomendação: "animado e direto, de quem comemora o número junto, sem exagero" (dado) ou "de documentário, calmo, com a data e o fato" (história) | `universo.tom` |
| 4. Marca | nome e cor (hex) da marca, ou nenhuma. A marca aparece no card final; a cor pode virar o destaque do tema (pergunta 9). Sem marca: `marca: null` | `marca` (`nome`, `cor`) |
| 5, 6 e 7 | **puladas**: o modelo não tem personagem; a voz conduz e o dado vira peça | (nenhum) |
| 8. Tema (`tema`) | ver abaixo | `tema` |
| 9. Cores do tema (`cores-do-tema`) | ver abaixo | `cores.origem`, `cores.pronta`, `cores.paleta` |
| 10. Voz | **uma narração inteira, uma voz só**: os 3 caminhos (clonada, pronta, áudio próprio). Recomendação: voz pronta do ElevenLabs, clara e com energia para número, ou calma de documentário para história. Com áudio próprio, a pessoa grava a narração inteira de uma vez | `voz.caminho`, `voz.voice_id` |
| 11. O que nunca pode acontecer | as proibições da pessoa **somadas às regras fixas do modelo**, que sempre valem e não se perguntam: todo número, ano e percentual que vem de fora com a fonte na tela e no card final; o número que conta chega ao valor dito pela voz; o mapa é sempre o genérico do kit (nunca uma cidade real, rua ou bairro de verdade); uma cor de destaque por tela. Recomendação para a lista da pessoa: não prometer resultado, não mostrar número sem dizer de onde veio, não comparar com concorrente pelo nome | `nunca` |
| 12. Card final (`card-final`) | ver abaixo | `fecho.chamada`, `fecho.assinatura`, `fecho.frase_assinatura`, `fecho.aviso_ia` |

**Pergunta 8 trocada: `tema`.** No lugar de cenários (o modelo não tem cenário, cada tema tem o seu fundo), a pessoa escolhe um dos 4 temas. Mostre os 4 stills `tema-<id>` (capa de cada tema) lado a lado, que saem do `_preview` do universo recém-copiado, ou as miniaturas `vitrine/tema-<id>.jpg` do kit:

- **isometrico** (Mundo isométrico): degradê escuro, piso em losango e colunas de 3 faces. O número grande conta e as colunas sobem na palavra.
- **linha-do-tempo** (Linha do tempo): papel claro, título serifado e um trilho. Cada ano entra na palavra, o último cheio.
- **mapa** (Mapa com rota): um mapa genérico desenhado (rio, quarteirões, praças). A rota anda pela rua até o pino, com o tempo em chips.
- **jornal** (Recortes de jornal): cortiça, ano grande e recortes com fita. O recorte cai na palavra e o círculo à mão marca o detalhe.
- **Recomendação pelo assunto:** número, resultado ou relatório, **isometrico**; história da marca, evolução ou retrospectiva, **linha-do-tempo**; entrega, viagem, expansão de loja ou "de onde vem o produto", **mapa**; curiosidade antiga, "você sabia" ou origem de algo, **jornal**. Sem pista no assunto, o recomendado do modelo (**isometrico**).
- Os tipos de cena valem nos 4 temas (o tema troca o visual, não o roteiro): a pessoa pode trocar de tema depois sem refazer roteiro.
- Opções para o AskUserQuestion: o tema recomendado "(Recomendado)" e os outros três.
- Campo: `"tema": "isometrico"`. Tema fora da lista: o `--aplicar` recusa, diz os aceitos e volta à pergunta 8.

**Pergunta 9 trocada: `cores-do-tema`.** As cores do tema escolhido, dizendo antes o que a cor troca nele (campo `cor_troca` do `modelo.json`): no isométrico, na linha do tempo e no mapa, todas as cores; **no jornal, só o destaque (o círculo e a caneta), as faixas (as fitas) e as etiquetas** (a cortiça, o papel, a retícula e a letra de jornal ficam). Três caminhos:

- **Cores do tema** (como vêm no modelo): `cores.origem: "tema"`.
- **Destaque na cor da marca** (só com `marca.cor`): o resto do tema fica, e o destaque vira a cor da marca, clareada ou escurecida o mínimo para ler no tema (contraste 4 contra o fundo do isométrico, o papel e o cartão da linha do tempo e do mapa, o papel do recorte no jornal): `cores.origem: "marca"`. O destaque sempre pode virar a cor da marca, em qualquer tema.
- **Uma das 3 paletas prontas do tema** (lista em `base/componentes/opcoes.json`, campo `prontas`): isométrico `noite`, `grafite`, `aurora`; linha do tempo `papel`, `areia`, `noite`; mapa `dia`, `noite`, `papel-antigo`; jornal `vermelha`, `azul`, `verde`. `cores.origem: "pronta"` e `cores.pronta: "<id>"`. Mostre o still `paletas` se a pessoa quiser ver os papéis.
- Recomendação: **destaque na cor da marca** quando há marca com cor; **cores do tema** sem marca.
- Troca fina, opcional: um papel de cor por hex em `cores.paleta` (lista de papéis em `opcoes.json`, campo `papeis`), só entre os que o tema troca (`cores_trocaveis` do tema no `modelo.json`). No jornal, só `destaque`, `faixa` e `etiqueta`.
- Opções para o AskUserQuestion: o caminho recomendado "(Recomendado)", "Cores do tema como estão", "Uma das paletas prontas" (e, nesse caso, as 3 do tema numa segunda pergunta).
- Campo: `"cores": { "origem": "marca", "pronta": null, "paleta": null }`. Papel que o tema não troca, paleta pronta de outro tema ou `origem: "marca"` sem cor de marca: o `--aplicar` recusa, diz qual e volta à pergunta 9.

**Pergunta 12 trocada: `card-final`.** O card que fecha todo vídeo, depois da voz:

- **Assinatura** (obrigatória): o @ do perfil ou o nome que assina, e uma frase curta embaixo (recomendação: "me segue pra ver o próximo capítulo").
- **Chamada:** a pergunta que o vídeo deixa no fim, antes do card (cada vídeo escreve a sua no roteiro; esta é a de referência).
- **Fontes:** todo número, ano ou percentual que vem de fora tem a fonte na legenda da cena e no card final (`fontes` da cena `final` de cada roteiro).
- **Aviso de narração por IA:** ligado. Só sai se a voz for áudio próprio (pergunta 10) e a pessoa pedir; com voz clonada ou pronta, o `--aplicar` recusa desligar.
- Opções para o AskUserQuestion: "Assinatura com o @ e a frase recomendada (Recomendado)", "Eu escrevo a assinatura e a frase".
- Campo: `fecho: { "chamada": "...", "assinatura": "@perfil", "frase_assinatura": "me segue pra ver o próximo capítulo", "aviso_ia": true }`.

**Depois das respostas:** `novo_universo.mjs --aplicar`, redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `tema-<tema escolhido>`, `folha-<tema escolhido>` e `elenco` (as peças).

Códigos aceitos em `respostas.json`: temas no `modelo.json`, paletas prontas e papéis de cor em `base/componentes/opcoes.json` (o `novo_universo.mjs --aplicar` recusa código fora deles e diz qual, com o número da pergunta).
