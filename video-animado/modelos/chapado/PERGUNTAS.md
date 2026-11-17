# Perguntas da entrevista curta neste modelo

O modelo usa as 12 perguntas base de `references/entrevista-curta.md` (na skill), sem pular nenhuma e sem acrescentar: **12 perguntas**. Só a pergunta 7 é trocada pela versão `elenco-e-acompanhantes`, que junta o elenco de apoio e os acompanhantes numa pergunta só. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [], "trocar": { "7": "elenco-e-acompanhantes" }, "acrescentar": [] }`.

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 4. Marca | nome, cor (hex), símbolo e palavra do fecho; mostrar o still `simbolos-marca` (`lua`, `circulo`, `estrela`, `folha`, `coracao`, `dente`, `letra`). Recomendação: a letra inicial, quando não houver logo simples. Sem marca: `marca: null` | `marca` |
| 5. Personagem principal | nome, idade e quem é; vira o personagem com papel `protagonista` | `personagens[0]` |
| 6. Aparência | mostrar a folha `opcoes-aparencia` e perguntar preset ou pele, cabelo, cor do cabelo, roupa, óculos e barba, pelos códigos da folha | `personagens[0].aparencia` |
| 7. Elenco de apoio e acompanhantes (`elenco-e-acompanhantes`) | ver abaixo | `personagens[1..]`, `acompanhantes` |
| 8. Cenários e nome do lugar | cômodos da casa (`sala`, `cozinha`, `quarto`, `banheiro`), sala de espera com o texto da placa, rua com o nome da loja (fictícia). Mostrar o still `cenarios` | `cenarios.casa`, `cenarios.sala_espera.placa`, `cenarios.rua.loja` |
| 9. Cores | paleta "Casa quente" do modelo, ou trocar papéis pela cor da marca (ex.: `destaque`) | `cores.paleta` |
| 12. Fecho | a chamada ("Quer marcar uma avaliação?"), a palavra do "Comenta" e se mostra o aviso de personagem fictícia (recomendado: sim) | `fecho.chamada`, `fecho.palavra`, `fecho.aviso_ficticio` |

**Pergunta 7 trocada: `elenco-e-acompanhantes`.** Uma pergunta só, em duas partes na mesma mensagem:

- **Elenco de apoio:** até 4 pessoas de apoio, cada uma com nome, idade, quem é e aparência própria, com silhueta diferente da protagonista (cabelo e altura). Recomendação: 2 pessoas de apoio, uma mais velha e uma da mesma idade, que fazem a escada da piada.
- **Acompanhantes:** cachorro ou bebê? Cachorro: nome e cor (`caramelo`, `preto`, `branco`, `cinza`, `chocolate` ou um hex). Bebê: tom de pele. Recomendação: um cachorro, que reage sem falar e rende piada barata.

Opções para o AskUserQuestion: "Elenco recomendado com um cachorro (Recomendado)", "Só a protagonista, sem acompanhante", "Eu descrevo o elenco". Na terceira, a pessoa responde em texto livre e o Claude converte para os códigos do `opcoes.json`, mostrando o resultado para confirmar.

**Depois das respostas:** `novo_universo.mjs --aplicar`, redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `expressoes-<id>`, `teste-cena`, `teste-celular` e `teste-fecho`.

Códigos aceitos em `respostas.json`: lista em `base/componentes/opcoes.json` (o `novo_universo.mjs --aplicar` recusa código fora dela e diz qual, com o número da pergunta).
