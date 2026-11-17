# Perguntas da entrevista curta neste modelo

O Neon retrô é um **modelo avulso** (sem temas), sem personagem: usa as 12 perguntas base de `references/entrevista-curta.md` (na skill) **menos a 5, a 6 e a 7** (personagem principal, aparência e elenco de apoio), sem acrescentar nenhuma: **9 perguntas**. Quatro são trocadas pela versão do modelo: a 8 vira `oferta` (o que, preço, preço antigo, prazo, selo, botão e o letreiro dos stills), a 9 vira `cores-do-neon` (o neon troca todas as cores), a 10 vira `voz-ou-musica` (narração inteira ou só letreiros na batida) e a 12 vira `card-final`. A 11 junta as regras fixas do modelo às da pessoa. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [5, 6, 7], "trocar": { "8": "oferta", "9": "cores-do-neon", "10": "voz-ou-musica", "12": "card-final" }, "acrescentar": [] }`.

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 1. Nome do universo | o nome da série de ofertas (ex.: "Arara Liquida", "Promo da Meia-Noite") | `universo.nome`, `universo.pasta` |
| 2. Assunto e público | o que a série anuncia (ofertas da loja, lançamentos, eventos) e quem assiste | `universo.assunto`, `universo.publico` |
| 3. Tom | recomendação: "animado e direto, de quem avisa da oferta sem empurrar" | `universo.tom` |
| 4. Marca | nome e cor (hex) da marca, ou nenhuma. A marca aparece no card final; a cor pode ir para o letreiro cheio, o destaque e o botão (pergunta 9). Nunca logo nem marca real de terceiros. Sem marca: `marca: null` | `marca` (`nome`, `cor`) |
| 5, 6 e 7 | **puladas**: o modelo não tem personagem; o letreiro e as peças conduzem | (nenhum) |
| 8. Oferta (`oferta`) | ver abaixo | `oferta`, `amostra` |
| 9. Cores do neon (`cores-do-neon`) | ver abaixo | `cores.origem`, `cores.pronta`, `cores.paleta` |
| 10. Voz ou só música (`voz-ou-musica`) | ver abaixo | `receita`, `voz.caminho`, `voz.voice_id` |
| 11. O que nunca pode acontecer | as proibições da pessoa **somadas às regras fixas do modelo**, que sempre valem e não se perguntam: **preço e prazo ditos iguais aos da tela** (e o preço antigo só se ele existiu); **nunca marca, logo ou produto real de terceiros**; **a piscada dentro da regra** (no máximo 3 quedas de brilho por segundo, só no letreiro, conferida pelo `conferir_piscada.py`); nada de pressão falsa. Recomendação para a lista da pessoa: não inventar desconto, não prometer estoque que não há, não falar mal de concorrente | `nunca` |
| 12. Card final (`card-final`) | ver abaixo | `fecho.chamada`, `fecho.assinatura`, `fecho.frase_assinatura`, `fecho.aviso_ia` |

**Pergunta 8 trocada: `oferta`.** No lugar de cenários (o cenário é fixo: céu, sol listrado, grade e varredura), a oferta que os vídeos anunciam:

- **Mostre** o still `pecas` (cada peça em 3 momentos: letreiro, preço, relógio, 3 2 1, selo e botão), que sai do `_preview` do universo recém-copiado.
- **Tipo de vídeo** (`oferta.tipo`), que guia a recomendação e o exemplo dos stills: `oferta` (liquidação, preço do dia: o preço que conta e o selo; **padrão**), `lancamento` (produto ou coleção nova: letreiro e botão), `evento` (data e hora: letreiro, contagem 3, 2, 1 e botão), `contagem` (a virada da meia-noite, a abertura, o fim da promoção: a contagem primeiro).
- **O que** (`oferta.o_que`, obrigatório): o produto, o combo ou o evento ("Jaqueta jeans", "Combo da meia-noite").
- **Preço** (`oferta.preco`) no formato brasileiro ("R$ 89,90", "R$ 1.299,90", "R$ 89"), obrigatório no tipo `oferta`; **preço antigo** (`oferta.preco_antigo`, opcional, maior que o preço): sai riscado e o preço conta dele até o novo. Só se ele existiu de verdade.
- **Prazo** (`oferta.prazo`): o texto do prazo ("só até domingo"), ou `null`. **Selo** (`oferta.selo`): curto, até 22 letras (padrão "só hoje"; `null` sem selo). **Botão** (`oferta.botao`): o que fazer agora ("chama no direct", padrão "garanta o seu").
- **Letreiro dos stills** (opcional, `amostra.letreiro`): 1 ou 2 linhas ("QUEIMA DE", "ESTOQUE"); sem ele, o da tela de referência ("PROMO DA", "MEIA-NOITE"). O letreiro de cada vídeo vem do roteiro.
- **Recomendação pelo assunto:** loja, liquidação e preço do dia, **`oferta`**; produto ou coleção nova, **`lancamento`**; show, festa, abertura, **`evento`**; virada de prazo, **`contagem`**.
- Opções para o AskUserQuestion: o tipo recomendado "(Recomendado)" e os outros; depois, o que, preço, preço antigo, prazo, selo e botão numa mensagem só ("me diz a oferta").
- Campo: `"oferta": { "tipo": "oferta", "o_que": "Jaqueta jeans", "preco": "R$ 89,90", "preco_antigo": "R$ 179,90", "prazo": "só até domingo", "selo": "só hoje", "botao": "chama no direct" }`. Preço fora do formato, oferta sem "o que", selo longo ou preço antigo menor que o preço: o `--aplicar` recusa, diz qual e volta à pergunta 8.

**Pergunta 9 trocada: `cores-do-neon`.** Diga antes: **o neon troca todas as cores** (céu, sol, grade, letreiro, destaque, botão, selo, topo e card final), e a cor da marca, se for a escolha, vai para o **letreiro cheio, o destaque (o preço e a contagem) e o botão**. Três caminhos:

- **Cores do modelo** (a paleta `synth`, as cores da tela de referência: céu roxo, sol amarelo e rosa, grade magenta, letreiro rosa e ciano): `cores.origem: "modelo"`.
- **Cor da marca** (só com `marca.cor`): no letreiro cheio, no destaque e no botão, clareada o mínimo para ler no céu (contraste 4,5): `cores.origem: "marca"`.
- **Uma das 3 paletas prontas**: `synth` (padrão), `por-do-sol` (céu vinho, sol e grade laranja, letreiro laranja e amarelo), `verde-azul` (céu petróleo, sol verde-limão e azul, grade turquesa, letreiro verde e menta). `cores.origem: "pronta"` e `cores.pronta: "<id>"`. Mostre o still `paletas` (as 3 lado a lado).
- Recomendação: **cor da marca** quando há marca com cor; **cores do modelo** sem marca.
- Troca fina, opcional: um papel de cor por hex em `cores.paleta` (`ceu`, `ceu2`, `chao`, `sol1`, `sol2`, `solFaixa`, `grade`, `contorno`, `cheio`, `destaque`, `botao`, `selo`, `topo`, `cardFinal`, `cardTexto`; lista em `base/componentes/opcoes.json`, campo `papeis`).
- Opções para o AskUserQuestion: o caminho recomendado "(Recomendado)", "Cores do modelo como estão", "Uma das paletas prontas" (e, nesse caso, as 3 numa segunda pergunta).
- Campo: `"cores": { "origem": "marca", "pronta": null, "paleta": null }`. Paleta que não existe ou `origem: "marca"` sem cor de marca: o `--aplicar` recusa, diz qual e volta à pergunta 9.

**Pergunta 10 trocada: `voz-ou-musica`.** A receita padrão dos vídeos (cada vídeo pode trocar no roteiro):

- **Narração inteira** (`receita: "narracao-inteira"`): uma voz só fala o texto inteiro, e cada letreiro e peça acende na palavra falada. **Custa crédito de voz**, avisado antes de gerar. Os 3 caminhos da voz (clonada, pronta, áudio próprio); recomendação: voz pronta do ElevenLabs, animada e clara.
- **Só letreiros na batida** (`receita: "texto-e-musica"`): sem voz, **sem crédito**. Cada cena dura compassos inteiros e cada peça acende numa batida da **cama synth do kit** (120 batidas por minuto) ou da **música da pessoa** (`public/musica.mp3`), com o andamento dela no roteiro (`bpm` e `primeira_batida`).
- **Recomendação pelo assunto:** oferta que precisa de explicação, ou marca com voz própria, **narração inteira**; promoção relâmpago, contagem e abertura de evento (mensagem em 4 a 6 letreiros curtos), **só letreiros**.
- Opções para o AskUserQuestion: a receita recomendada "(Recomendado)" e a outra; com narração, o caminho da voz numa segunda pergunta.
- Campo: `"receita": "narracao-inteira"`, `"voz": { "caminho": "pronta", "voice_id": null }`. Receita que o modelo não tem: o `--aplicar` recusa, diz as aceitas e volta à pergunta 10.

**Pergunta 12 trocada: `card-final`.** O card que fecha todo vídeo, por cima do cenário, abaixo do letreiro:

- **Assinatura** (obrigatória): o @ do perfil ou o nome que assina, e uma frase curta embaixo (recomendação: "me segue pra não perder a próxima").
- **Chamada:** a frase do card, com uma palavra destacada entre asteriscos ("Corre que a arara está *acabando*"); cada vídeo pode escrever a sua na cena `final` do roteiro.
- **Fontes:** quando o vídeo cita regra ou condição da oferta que vem de uma fonte, ela entra no card (`fontes` da cena `final`).
- **Aviso de narração por IA:** ligado nos vídeos com narração. Só sai se a voz for áudio próprio e a pessoa pedir (ou na receita só letreiros, onde não há voz).
- Opções para o AskUserQuestion: "Assinatura com o @ e a frase recomendada (Recomendado)", "Eu escrevo a assinatura e a frase".
- Campo: `fecho: { "chamada": "...", "assinatura": "@perfil", "frase_assinatura": "me segue pra não perder a próxima", "aviso_ia": true }`. Campo fora destes 4: o `--aplicar` recusa e volta à pergunta 12.

**Depois das respostas:** `novo_universo.mjs --aplicar`, redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `capa`, `pecas` e `paletas`.

Códigos aceitos em `respostas.json`: tipos de vídeo, paletas prontas e papéis de cor em `base/componentes/opcoes.json`; receitas em `modelo.json` (o `novo_universo.mjs --aplicar` recusa código fora deles e diz qual, com o número da pergunta).
