# Perguntas da entrevista curta neste modelo

A Explicação é uma **família**: um modelo com 4 temas (quadro, lousa, post-its, tela de app). Não tem personagem: usa as 12 perguntas base de `references/entrevista-curta.md` (na skill) **menos a 5, a 6 e a 7** (personagem principal, aparência e elenco de apoio), sem acrescentar nenhuma: **9 perguntas**. Três são trocadas pela versão do modelo: a 8 vira `tema` (qual dos 4 temas), a 9 vira `cores-do-tema` (as cores do tema escolhido) e a 12 vira `card-final`. A 10 é a voz de uma narração inteira e a 11 junta as regras fixas do modelo às da pessoa. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [5, 6, 7], "trocar": { "8": "tema", "9": "cores-do-tema", "12": "card-final" }, "acrescentar": [] }`, com a lista `temas` e `"tema_recomendado": "quadro"`.

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 1. Nome do universo | o nome da série (ex.: "Contas em Dia", "Aula de 1 Minuto"); vira o rótulo do topo, em caixa alta, a não ser que a pessoa queira outro | `universo.nome`, `universo.pasta`, `explicacao.rotulo` (opcional) |
| 2. Assunto e público | o que a série explica e quem assiste. Se a pessoa já tiver o título do primeiro vídeo, grave em `amostra`: os stills de conferência mostram esse título (sem isso, a explicação neutra do kit) | `universo.assunto`, `universo.publico`, `amostra` (opcional: `titulo`, `item`) |
| 3. Tom | recomendação: "didático e calmo, de quem faz a conta junto, sem jargão" | `universo.tom` |
| 4. Marca | nome e cor (hex) da marca, ou nenhuma. A marca aparece no card final e na barra da janela de app ("<marca> · painel"); a cor pode virar o destaque do tema (pergunta 9). Sem marca: `marca: null` | `marca` (`nome`, `cor`) |
| 5, 6 e 7 | **puladas**: o modelo não tem personagem; a voz conduz e a explicação vira peça | (nenhum) |
| 8. Tema (`tema`) | ver abaixo | `tema` |
| 9. Cores do tema (`cores-do-tema`) | ver abaixo | `cores.origem`, `cores.pronta`, `cores.paleta` |
| 10. Voz | **uma narração inteira, uma voz só**: os 3 caminhos (clonada, pronta, áudio próprio). Recomendação: voz pronta do ElevenLabs, calma e clara, de professor. Com áudio próprio, a pessoa grava a narração inteira de uma vez | `voz.caminho`, `voz.voice_id` |
| 11. O que nunca pode acontecer | as proibições da pessoa **somadas às regras fixas do modelo**, que sempre valem e não se perguntam: número ou regra oficial com a fonte na tela e no card final; janela de app sempre genérica (nunca a cara de um app real); uma cor de destaque por tela. Recomendação para a lista da pessoa: não prometer resultado, não dar número sem dizer a regra, não ridicularizar quem erra | `nunca` |
| 12. Card final (`card-final`) | ver abaixo | `fecho.chamada`, `fecho.assinatura`, `fecho.frase_assinatura`, `fecho.aviso_ia` |

**Pergunta 8 trocada: `tema`.** No lugar de cenários (o modelo não tem cenário, cada tema tem o seu fundo), a pessoa escolhe um dos 4 temas. Mostre os 4 stills `tema-<id>` (capa de cada tema) lado a lado, que saem do `_preview` do universo recém-copiado, ou as miniaturas `vitrine/tema-<id>.jpg` do kit:

- **quadro** (Quadro de explicação): papel quadriculado, traço preto de caneta e um destaque. Passos em caixas tremidas ligadas por setas.
- **lousa** (Lousa de giz): lousa com giz, moldura de madeira e bandeja. Conta linha a linha, resultado circulado em giz.
- **post-its** (Quadro de post-its): quadro branco com colunas e post-its coloridos. A tarefa anda de coluna quando a voz fala dela.
- **tela-app** (Tela de app): degradê, selo de passo e janela de painel genérica. O cursor vai até o botão e clica no verbo.
- **Recomendação pelo assunto:** processo, método ou consultoria, **quadro**; conta, fórmula ou regra de sala de aula, **lousa**; rotina, planejamento ou bastidor, **post-its**; tutorial de ferramenta ou sistema, **tela-app**. Sem pista no assunto, o recomendado do modelo (**quadro**).
- Os tipos de cena valem nos 4 temas (o tema troca o visual, não o roteiro): a pessoa pode trocar de tema depois sem refazer roteiro.
- Opções para o AskUserQuestion: o tema recomendado "(Recomendado)" e os outros três.
- Campo: `"tema": "quadro"`. Tema fora da lista: o `--aplicar` recusa, diz os aceitos e volta à pergunta 8.

**Pergunta 9 trocada: `cores-do-tema`.** As cores do tema escolhido, dizendo antes o que a cor troca nele (campo `cor_troca` do `modelo.json`): no quadro, nos post-its e na tela de app, todas as cores; **na lousa, só a cor da lousa e o giz de destaque** (a moldura de madeira e o giz branco ficam). Três caminhos:

- **Cores do tema** (como vêm no modelo): `cores.origem: "tema"`.
- **Destaque na cor da marca** (só com `marca.cor`): o resto do tema fica, e o destaque vira a cor da marca, clareada ou escurecida o mínimo para ler no fundo do tema: `cores.origem: "marca"`. O destaque sempre pode virar a cor da marca, em qualquer tema.
- **Uma das 3 paletas prontas do tema** (lista em `base/componentes/opcoes.json`, campo `prontas`): quadro `papel-claro`, `papel-kraft`, `quadro-branco`; lousa `verde`, `preta`, `azul`; post-its `parede-clara`, `cortica`, `noite`; tela de app `violeta`, `oceano`, `grafite`. `cores.origem: "pronta"` e `cores.pronta: "<id>"`. Mostre o still `paletas` se a pessoa quiser ver os papéis.
- Recomendação: **destaque na cor da marca** quando há marca com cor; **cores do tema** sem marca.
- Troca fina, opcional: um papel de cor por hex em `cores.paleta` (lista de papéis em `opcoes.json`, campo `papeis`), só entre os que o tema troca (`cores_trocaveis` do tema no `modelo.json`). Na lousa, só `fundo` (a lousa) e `destaque` (o giz de destaque).
- Opções para o AskUserQuestion: o caminho recomendado "(Recomendado)", "Cores do tema como estão", "Uma das paletas prontas" (e, nesse caso, as 3 do tema numa segunda pergunta).
- Campo: `"cores": { "origem": "marca", "pronta": null, "paleta": null }`. Papel que o tema não troca, paleta pronta de outro tema ou `origem: "marca"` sem cor de marca: o `--aplicar` recusa, diz qual e volta à pergunta 9.

**Pergunta 12 trocada: `card-final`.** O card que fecha todo vídeo, depois da voz:

- **Assinatura** (obrigatória): o @ do perfil ou o nome que assina, e uma frase curta embaixo (recomendação: "me segue pra aprender o próximo passo").
- **Chamada:** a pergunta que o vídeo deixa no fim, antes do card (cada vídeo escreve a sua no roteiro; esta é a de referência).
- **Fontes:** quando o vídeo cita regra, número ou prazo oficial, a fonte entra no card final (`fontes` da cena `final` de cada roteiro).
- **Aviso de narração por IA:** ligado. Só sai se a voz for áudio próprio (pergunta 10) e a pessoa pedir; com voz clonada ou pronta, o `--aplicar` recusa desligar.
- Opções para o AskUserQuestion: "Assinatura com o @ e a frase recomendada (Recomendado)", "Eu escrevo a assinatura e a frase".
- Campo: `fecho: { "chamada": "...", "assinatura": "@perfil", "frase_assinatura": "me segue pra aprender o próximo passo", "aviso_ia": true }`.

**Depois das respostas:** `novo_universo.mjs --aplicar`, redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `tema-<tema escolhido>`, `folha-<tema escolhido>` e `elenco` (as peças).

Códigos aceitos em `respostas.json`: temas no `modelo.json`, paletas prontas e papéis de cor em `base/componentes/opcoes.json` (o `novo_universo.mjs --aplicar` recusa código fora deles e diz qual, com o número da pergunta).
