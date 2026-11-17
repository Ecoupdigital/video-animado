# Perguntas da entrevista curta neste modelo

A Mesa vista de cima é um **modelo avulso** (sem temas), sem personagem nem mãos: usa as 12 perguntas base de `references/entrevista-curta.md` (na skill) **menos a 5, a 6 e a 7** (personagem principal, aparência e elenco de apoio), sem acrescentar nenhuma: **9 perguntas**. Três são trocadas pela versão do modelo: a 8 vira `superficie-e-itens` (a superfície da mesa, o grupo principal e a amostra dos stills), a 9 vira `cores-da-mesa` (destaque, faixa, etiqueta e card final; o material fica) e a 12 vira `card-final`. A 10 é a voz de uma narração inteira e a 11 junta as regras fixas do modelo às da pessoa. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [5, 6, 7], "trocar": { "8": "superficie-e-itens", "9": "cores-da-mesa", "12": "card-final" }, "acrescentar": [] }`.

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 1. Nome do universo | o nome da série (ex.: "Make do Dia", "Pizza de Domingo"); vira o rótulo da etiqueta da abertura, em caixa alta, quando não há marca | `universo.nome`, `universo.pasta` |
| 2. Assunto e público | o passo a passo que a série ensina e quem assiste | `universo.assunto`, `universo.publico` |
| 3. Tom | recomendação: "prático e animado, de quem mostra na bancada o que usa" | `universo.tom` |
| 4. Marca | nome e cor (hex) da marca, ou nenhuma. A marca aparece no card final e no rótulo da abertura; a cor pode virar a palavra destacada, o "PASSO n DE N" e a assinatura (pergunta 9). Nenhum item da mesa leva o nome nem o logo dela. Sem marca: `marca: null` | `marca` (`nome`, `cor`) |
| 5, 6 e 7 | **puladas**: o modelo não tem personagem nem mãos; a voz conduz e os itens caem na mesa | (nenhum) |
| 8. Superfície e itens (`superficie-e-itens`) | ver abaixo | `mesa.superficie`, `mesa.grupo`, `amostra` |
| 9. Cores da mesa (`cores-da-mesa`) | ver abaixo | `cores.origem`, `cores.pronta`, `cores.paleta` |
| 10. Voz | **uma narração inteira, uma voz só**: os 3 caminhos (clonada, pronta, áudio próprio). Recomendação: voz pronta do ElevenLabs, calma e próxima, de quem ensina na cozinha ou na bancada. Com áudio próprio, a pessoa grava a narração inteira de uma vez | `voz.caminho`, `voz.voice_id` |
| 11. O que nunca pode acontecer | as proibições da pessoa **somadas às regras fixas do modelo**, que sempre valem e não se perguntam: **nunca produto, embalagem, rótulo ou logo de marca real** (os itens do kit são genéricos); **quantidade e tempo ditos iguais aos da tela** ("três ovos" falado, 3 ovos na mesa; "48 horas" falado, "48 horas" na etiqueta); uma palavra destacada por faixa; nada de mãos nem rosto. Recomendação para a lista da pessoa: não prometer resultado, não ensinar o que depende de profissional, não rir de quem erra | `nunca` |
| 12. Card final (`card-final`) | ver abaixo | `fecho.chamada`, `fecho.assinatura`, `fecho.frase_assinatura`, `fecho.aviso_ia` |

**Pergunta 8 trocada: `superficie-e-itens`.** No lugar de cenários (a mesa é o cenário), três escolhas, nesta ordem:

- **Mostre** o still `superficies` (as 3 superfícies lado a lado, cada uma com uma peça central) e o `itens-<grupo>` do grupo recomendado (cada item com o nome, o código e o que vira sobre a peça central), que saem do `_preview` do universo recém-copiado.
- **Superfície** (`mesa.superficie`): `madeira` (tábuas com junta e veio, a da tela de referência; **padrão**), `marmore` (mármore claro com veios finos), `pano` (pano liso azul-acinzentado com trama leve).
- **Grupo principal** (`mesa.grupo`): `cozinha` (a peça central é a tábua redonda, onde a pizza se monta em camadas), `beleza` (a bandeja de penteadeira, onde fica o teste de cada produto), `artesanato` (a base de corte quadriculada, onde o cartão se monta). O grupo principal só escolhe a peça central e a amostra dos stills: **o roteiro de cada vídeo usa qualquer item dos 3 grupos** (22 itens: cozinha `massa`, `molho`, `queijo`, `tomate`, `folha`, `ovo`, `farinha`, `tigela`, `colher`, `prato`; beleza `base`, `pincel`, `batom`, `sombra`, `espelho`, `algodao`; artesanato `papel`, `tesoura`, `cola`, `linha`, `botao`, `fita`).
- **Recomendação pelo assunto:** receita e cozinha, **madeira com cozinha**; maquiagem e cuidado, **mármore com beleza**; artesanato, papelaria e costura, **pano com artesanato**. Sem pista no assunto, madeira com cozinha (o padrão do modelo). A pessoa pode cruzar (receita no mármore, artesanato na madeira): a cor da superfície nunca muda com a pergunta 9.
- **Amostra** (opcional): o título de um passo e a frase da faixa de um vídeo da série (com a palavra destacada entre asteriscos), para os stills de conferência saírem com o texto dela: `amostra: { "titulo": "Pele leve em 5 minutos", "frase": "Base só no *centro* do rosto" }`. Sem amostra, a do grupo.
- Opções para o AskUserQuestion: a combinação recomendada "(Recomendado)", as outras duas combinações prontas e "Eu escolho a superfície e o grupo".
- Campo: `"mesa": { "superficie": "marmore", "grupo": "beleza" }`. Superfície ou grupo fora da lista: o `--aplicar` recusa, diz os aceitos e volta à pergunta 8.

**Pergunta 9 trocada: `cores-da-mesa`.** Diga antes: **a superfície fica como está** (a madeira, o mármore e o pano, a peça central e os itens não mudam de cor); **a cor troca a palavra destacada, a faixa de legenda, a etiqueta de passo e o card final**. Três caminhos:

- **Cores do modelo** (a paleta `ambar`, com as cores da tela de referência: faixa grafite, palavra âmbar, etiqueta creme): `cores.origem: "modelo"`.
- **Cor da marca** (só com `marca.cor`): a cor da marca vai para a palavra destacada da faixa, o "PASSO n DE N" da etiqueta e a assinatura do card final, cada uma clareada ou escurecida o mínimo para ler no fundo dela (contraste 4): `cores.origem: "marca"`.
- **Uma das 3 paletas prontas**, que valem nas 3 superfícies: `ambar` (faixa grafite, palavra âmbar, etiqueta creme), `menta` (faixa verde-escura, palavra menta, etiqueta verde bem clara), `vinho` (faixa vinho, palavra rosa, etiqueta rosada). `cores.origem: "pronta"` e `cores.pronta: "<id>"`. Mostre o still `paletas` (as 3 lado a lado, na superfície do universo).
- Recomendação: **cor da marca** quando há marca com cor; **cores do modelo** sem marca.
- Troca fina, opcional: um papel de cor por hex em `cores.paleta` (`destaque`, `faixa`, `faixaTexto`, `etiqueta`, `etiquetaTexto`, `etiquetaPasso`, `cardFinal`, `cardTexto`, `cardDestaque`; lista em `base/componentes/opcoes.json`, campo `papeis`). Papel do material (tábua, junta, veio, mármore, pano, trama, sombra) é recusado: o material não muda de cor.
- Opções para o AskUserQuestion: o caminho recomendado "(Recomendado)", "Cores do modelo como estão", "Uma das paletas prontas" (e, nesse caso, as 3 numa segunda pergunta).
- Campo: `"cores": { "origem": "marca", "pronta": null, "paleta": null }`. Paleta que não existe, papel do material ou `origem: "marca"` sem cor de marca: o `--aplicar` recusa, diz qual e volta à pergunta 9.

**Pergunta 12 trocada: `card-final`.** O card que fecha todo vídeo, por cima da peça central pronta, depois da voz:

- **Assinatura** (obrigatória): o @ do perfil ou o nome que assina, e uma frase curta embaixo (recomendação: "me segue pra ver o próximo passo").
- **Chamada:** a pergunta que o card traz, com "comenta aqui" (cada vídeo pode escrever a sua na cena `final` do roteiro; esta é a de referência).
- **Fontes:** quando o vídeo dá medida, tempo ou regra que vem de uma fonte, ela entra no card (`fontes` da cena `final`).
- **Aviso de narração por IA:** ligado. Só sai se a voz for áudio próprio (pergunta 10) e a pessoa pedir; com voz clonada ou pronta, o `--aplicar` recusa desligar.
- Opções para o AskUserQuestion: "Assinatura com o @ e a frase recomendada (Recomendado)", "Eu escrevo a assinatura e a frase".
- Campo: `fecho: { "chamada": "...", "assinatura": "@perfil", "frase_assinatura": "me segue pra ver o próximo passo", "aviso_ia": true }`. Campo fora destes 4: o `--aplicar` recusa e volta à pergunta 12.

**Depois das respostas:** `novo_universo.mjs --aplicar`, redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `capa`, `itens-<grupo escolhido>` e `elenco` (a biblioteca inteira).

Códigos aceitos em `respostas.json`: superfícies, grupos e itens, paletas prontas e papéis de cor em `base/componentes/opcoes.json` (o `novo_universo.mjs --aplicar` recusa código fora deles e diz qual, com o número da pergunta).
