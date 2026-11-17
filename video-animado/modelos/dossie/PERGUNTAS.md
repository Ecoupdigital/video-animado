# Perguntas da entrevista curta neste modelo

O dossiê não tem personagem: usa as 12 perguntas base de `references/entrevista-curta.md` (na skill) **menos a 5, a 6 e a 7** (personagem principal, aparência e elenco de apoio), sem acrescentar nenhuma: **9 perguntas**. Três são trocadas pela versão do modelo: a 8 vira `rotulo-e-manchetes`, a 9 vira `tema-visual` e a 12 vira `card-final`. A 10 é a voz de uma narração inteira e a 11 junta as regras fixas do modelo às da pessoa. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [5, 6, 7], "trocar": { "8": "rotulo-e-manchetes", "9": "tema-visual", "12": "card-final" }, "acrescentar": [] }`.

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 1. Nome do universo | o nome da série de casos (ex.: "Caso do Condomínio", "Dossiê do Bairro"); vira o rótulo padrão do topo | `universo.nome`, `universo.pasta` |
| 2. Assunto e público | que tipo de caso a série conta e quem assiste. Se a pessoa já tiver o primeiro caso, grave também o título, quem é citado e o papel dele: os stills de conferência mostram esse caso (sem isso, o caso neutro do kit) | `universo.assunto`, `universo.publico`, `caso` (opcional) |
| 3. Tom | recomendação: "sério e direto, com suspense, sem acusar ninguém"; o dossiê não combina com humor de situação | `universo.tom` |
| 4. Marca | nome e cor (hex) da marca, ou nenhuma. O dossiê não usa símbolo nem palavra do "Comenta": a marca aparece no card final (nome com um ponto na cor) e, no tema "marca", dá o destaque das cores. Sem marca: `marca: null` (o card final mostra só a assinatura) | `marca` (`nome`, `cor`) |
| 5, 6 e 7 | **puladas**: o dossiê não tem personagem; quem é citado entra em cada vídeo, pelo roteiro, como ficha com silhueta | (nenhum) |
| 8. Rótulo e manchetes (`rotulo-e-manchetes`) | ver abaixo | `dossie.rotulo`, `dossie.selo`, `dossie.manchetes` |
| 9. Tema visual (`tema-visual`) | ver abaixo | `cores.tema`, `cores.paleta`, `cores.fontes` |
| 10. Voz | **uma narração inteira, uma voz só**: os 3 caminhos (clonada, pronta, áudio próprio). Recomendação: voz pronta do ElevenLabs, firme e calma. Com áudio próprio, a pessoa grava a narração inteira de uma vez | `voz.caminho`, `voz.voice_id` |
| 11. O que nunca pode acontecer | as proibições da pessoa **somadas às regras fixas do modelo**, que sempre valem e não se perguntam: linguagem de suspeita (nunca afirmar culpa, "X nega"); foto só a que a própria pessoa fornece (silhueta até lá); carimbo de acusação nunca sobre o rosto de quem não é acusado; fato com fonte na tela e no card final. Recomendação para a lista da pessoa: não citar nome de quem não é figura pública, não mostrar documento que não pode ser mostrado, não usar dado sem fonte | `nunca` |
| 12. Card final (`card-final`) | ver abaixo | `fecho.chamada`, `fecho.assinatura`, `fecho.frase_assinatura`, `fecho.aviso_ia` |

**Pergunta 8 trocada: `rotulo-e-manchetes`.** No lugar de cenários (o dossiê não tem cenário, só o fundo vivo), uma pergunta só, em duas partes na mesma mensagem:

- **Rótulo do topo e selo:** "Que rótulo vai no topo de todo vídeo, e que selo pisca no canto?" Recomendação: `// DOSSIÊ · <ASSUNTO EM UMA PALAVRA>` e `CASO ABERTO` (ou `EM APURAÇÃO`). Rótulo longo encolhe para caber na linha.
- **Manchetes da faixa:** 3 ou 4 manchetes curtas (até 40 letras) que rolam no rodapé, no tom do assunto. Cada vídeo pode trazer as dele no roteiro; estas são as do universo. Recomendação: frases de fato ou de alegação marcada ("X NEGA..."), nunca de acusação.
- Opções para o AskUserQuestion: "Rótulo e manchetes sugeridos (Recomendado)", "Só o rótulo, manchetes em cada vídeo", "Eu escrevo".
- Campo: `dossie: { "rotulo": "// DOSSIÊ · CONDOMÍNIO", "selo": "EM APURAÇÃO", "manchetes": ["...", "..."] }` (1 a 8 manchetes).

**Pergunta 9 trocada: `tema-visual`.** Mostre o still `temas` (os 3 temas lado a lado) e, se a pessoa quiser ver o movimento, as folhas `folha-investigativo`, `folha-jornal` e `folha-marca`:

- **investigativo:** escuro, holofote roxo, vermelho só em alerta. O dossiê original.
- **jornal:** claro, papel de jornal, manchete serifada, tinta preta e azul.
- **marca:** escuro neutro com o destaque na cor da marca (sem marca, cai nas cores do investigativo).
- Recomendação: **marca** quando há marca com cor forte; **investigativo** sem marca; **jornal** para assunto local, de bairro ou de serviço público.
- Troca fina, opcional: qualquer papel de cor (`fundo`, `destaque`, `alerta`... lista em `base/componentes/opcoes.json`, campo `paletas`) e qualquer papel de fonte (`titulo`, `texto`, `mono`, com uma fonte da lista `fontes`). As trocas valem só para o tema escolhido.
- Opções para o AskUserQuestion: o tema recomendado "(Recomendado)", os outros dois, "Tema com cores ou fontes trocadas".
- Campo: `cores: { "tema": "jornal", "paleta": { "destaque": "#7A2E1F" }, "fontes": null }`. Tema fora da lista, papel inexistente ou fonte fora da lista: o `--aplicar` recusa e diz qual, com o número da pergunta.

**Pergunta 12 trocada: `card-final`.** O card que fecha todo vídeo, depois da voz:

- **Assinatura** (obrigatória): o @ do perfil ou o nome que assina, e uma frase curta embaixo (recomendação: "me segue pra ver o próximo caso").
- **Chamada:** a pergunta que o vídeo deixa no fim, antes do card (cada vídeo escreve a sua no roteiro; esta é a de referência).
- **Fontes:** vêm do roteiro de cada vídeo (cena `final`); o card mostra sempre.
- **Aviso de narração por IA:** ligado. Só sai se a voz for áudio próprio (pergunta 10) e a pessoa pedir; com voz clonada ou pronta, o `--aplicar` recusa desligar.
- **"Suspeitas reportadas, sem acusação formal contra as pessoas citadas."** entra sozinho quando o caso cita pessoas.
- Opções para o AskUserQuestion: "Assinatura com o @ e a frase recomendada (Recomendado)", "Eu escrevo a assinatura e a frase".
- Campo: `fecho: { "chamada": "...", "assinatura": "@perfil", "frase_assinatura": "me segue pra ver o próximo caso", "aviso_ia": true }`.

**Depois das respostas:** `novo_universo.mjs --aplicar`, redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `temas`, `folha-<tema escolhido>` e `elenco` (as peças).

Códigos aceitos em `respostas.json`: lista em `base/componentes/opcoes.json` (o `novo_universo.mjs --aplicar` recusa código fora dela e diz qual, com o número da pergunta).
