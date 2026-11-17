# Perguntas da entrevista curta neste modelo

O modelo usa as 12 perguntas base de `references/entrevista-curta.md` (na skill), sem pular nenhuma e sem acrescentar: **12 perguntas**. Duas são trocadas pela versão do modelo: a 2 vira `assunto-e-virada` (assunto, público, a virada do antes e agora e os rótulos dos selos) e a 7 vira `apoio-e-crianca` (elenco de apoio, com criança). A 10 vale só para a narradora. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [], "trocar": { "2": "assunto-e-virada", "7": "apoio-e-crianca" }, "acrescentar": [] }`.

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 2. Assunto e público (`assunto-e-virada`) | ver abaixo | `universo.assunto`, `universo.publico`, `antes_e_agora` |
| 4. Marca | nome, cor (hex), símbolo e palavra do fecho; mostrar o still `simbolos-marca` (`lua`, `circulo`, `estrela`, `folha`, `coracao`, `dente`, `letra`). Recomendação: a letra inicial, quando não houver logo simples. Sem marca: `marca: null` (celular sem logo, fecho de seguir o perfil) | `marca` |
| 5. Personagem principal | a **narradora**: nome, idade e quem é. É adulta (criança não fala neste modelo) e é a única voz | `personagens[0]` com `papel: "protagonista"`, `corpo: "adulto"` |
| 6. Aparência | mostrar a folha `opcoes-aparencia` e perguntar preset ou pele, cabelo, cor do cabelo, roupa, óculos e barba, pelos códigos da folha; **e o que muda no antes** (cabelo, roupa), só o que muda. Recomendação: no antes, trocar o cabelo e a parte de cima da roupa, para o antes se reconhecer de longe | `personagens[0].aparencia`, `personagens[0].aparencia_antes` |
| 7. Elenco de apoio com criança (`apoio-e-crianca`) | ver abaixo | `personagens[1..]` |
| 8. Cenários e nome do lugar | apartamento (`sala`, `quarto`), escritório, porta da escola com o nome da escola, sala de espera com o texto da placa. Mostrar o still `cenarios` (as três luzes). Recomendação: a sala do apartamento e um cenário do assunto | `cenarios.apartamento`, `cenarios.escritorio`, `cenarios.escola.nome`, `cenarios.sala_espera.placa` |
| 9. Cores | paleta "Linho e petróleo" do modelo, ou trocar papéis pela cor da marca (ex.: `destaque`) | `cores.paleta` |
| 10. Voz | **só da narradora**: os 3 caminhos (clonada, pronta, áudio próprio). Os outros personagens não têm voz; o `--aplicar` recusa voz em quem não é a narradora | `voz.caminho`, `personagens[0].voz` |
| 12. Fecho | a chamada, a palavra do "Comenta" e se mostra o aviso "<narradora> é uma personagem fictícia" (recomendado: sim) | `fecho.chamada`, `fecho.palavra`, `fecho.aviso_ficticio` |

**Pergunta 2 trocada: `assunto-e-virada`.** Uma pergunta só, em duas partes na mesma mensagem:

- **Assunto e público:** "Sobre o que são os vídeos, e quem assiste?" (como na base).
- **A virada:** "O que a narradora fazia antes e o que mudou? E como a gente chama o antes e o agora nos selos?" Recomendação: uma frase de virada concreta (o jeito antigo contra o jeito de agora) e os rótulos ANTES e AGORA, que servem para qualquer assunto; rótulos próprios só se forem curtos (até 14 letras, como SEM PLANO e COM PLANO). Rótulo longo encolhe e quebra no selo, mas lê pior.
- Opções para o AskUserQuestion: "Virada sugerida com ANTES e AGORA (Recomendado)", "Virada sugerida com rótulos próprios", "Eu descrevo".
- Campo: `antes_e_agora: { "virada": "...", "rotulo_antes": "ANTES", "rotulo_agora": "AGORA" }`. Sem rótulos, os selos dizem ANTES e AGORA.

**Pergunta 7 trocada: `apoio-e-crianca`.** Uma pergunta só, em duas partes na mesma mensagem:

- **Adultos de apoio:** até 3, cada um com nome, idade, quem é e aparência própria, com silhueta diferente da narradora (cabelo e altura). Eles aparecem e reagem, mas não falam: a narradora conta o que disseram.
- **Criança:** tem uma criança na história? Nome, idade e aparência pelos códigos de criança da folha (`corpo: "crianca"`: cabelo `arrepiado`, `franja`, `marias`, `crespo`; camiseta lisa ou listrada; bermuda ou saia; altura de 0,45 a 0,7 do adulto). A criança não fala: age, e a narradora conta.
- Recomendação: um adulto de apoio e uma criança, que fazem a reação e a virada de humor sem pesar a cena.
- Opções para o AskUserQuestion: "Um adulto e uma criança (Recomendado)", "Só a narradora", "Eu descrevo o elenco". Na terceira, a pessoa responde em texto livre e o Claude converte para os códigos do `opcoes.json`, mostrando o resultado para confirmar.

**Depois das respostas:** `novo_universo.mjs --aplicar`, redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `expressoes-<id>`, `teste-antes`, `teste-agora`, `teste-celular` e `teste-fecho`.

Códigos aceitos em `respostas.json`: lista em `base/componentes/opcoes.json` (o `novo_universo.mjs --aplicar` recusa código fora dela e diz qual, com o número da pergunta).
