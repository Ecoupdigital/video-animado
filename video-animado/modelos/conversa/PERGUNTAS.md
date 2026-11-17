# Perguntas da entrevista curta neste modelo

A Conversa no celular é um **kit avulso** (sem temas): usa as 12 perguntas base de `references/entrevista-curta.md` (na skill) menos a 6 (aparência) e a 7 (elenco de apoio), que são puladas: **10 perguntas**. Não há personagem desenhado: quem conversa vira os 2 lados do celular. Trocadas: a 5 por `quem-conversa`, a 8 por `tela-do-chat`, a 9 por `cores-da-conversa`, a 10 por `receita-e-vozes` e a 12 por `card-final`; a 11 continua a base, com as regras fixas do kit somadas. Ordem da conversa: 1, 2, 3, 4, 5, 8, 9, 10, 11, 12. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [6, 7], "trocar": { "5": "quem-conversa", "8": "tela-do-chat", "9": "cores-da-conversa", "10": "receita-e-vozes", "12": "card-final" }, "acrescentar": [] }`, com `"receita": "vozes-por-fala"` (a padrão) e `"receitas": ["vozes-por-fala", "texto-e-musica"]`.

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 1 a 3 | iguais às da base (nome, assunto e público, tom). Na 2, opcional: o título da capa e a primeira mensagem do contato nos stills de conferência | `universo`, `amostra` |
| 4. Marca | nome, cor (hex), símbolo e palavra do fecho; símbolos: `estrela`, `circulo`, `coracao`, `folha`, `balao`, `letra`. A cor da marca pode pintar as bolhas do dono (pergunta 9). Sem marca: `marca: null` (o card final vira "Segue o perfil") | `marca` |
| 5. Quem conversa (`quem-conversa`) | ver abaixo | `personagens` (exatamente 2) |
| 6 e 7 | puladas (não há personagem desenhado nem elenco de apoio) | |
| 8. Tela do chat (`tela-do-chat`) | ver abaixo | `tela` |
| 9. Cores (`cores-da-conversa`) | ver abaixo | `cores.origem`, `cores.pronta`, `cores.paleta` |
| 10. Receita e vozes (`receita-e-vozes`) | ver abaixo | `receita`, `personagens[].voz`, `voz` |
| 11. O que nunca pode acontecer | as proibições da pessoa, somadas às regras fixas do kit (ver abaixo) | `nunca` |
| 12. Card final (`card-final`) | ver abaixo | `fecho.chamada`, `fecho.palavra`, `fecho.aviso_ficticio` |

**Pergunta 5 trocada: `quem-conversa` (os 2 lados).** Mostre o still `elenco` (o cabeçalho e uma bolha de cada lado) e o `avatares`. Pergunte numa mensagem só:

- **Quem é o dono do celular** (à direita, papel `protagonista`): em geral a marca ou a loja que atende, ou a pessoa da série. Nome e quem é numa frase. As bolhas dele ficam à direita, com o sinal de lido.
- **Quem é o contato** (à esquerda, papel `apoio`): o cliente, a amiga, o golpista. Nome (fictício), quem é numa frase, o **status** que aparece embaixo do nome (`online`, `digitando` não precisa: o kit mostra sozinho; `null` para nenhum) e o **avatar**: a inicial do nome num círculo colorido (`{ "tipo": "inicial", "cor": "#F4A6C0" }`) ou um desenho (`{ "tipo": "desenho", "desenho": "flor" }`, com `pessoa`, `flor`, `bolo`, `gato`, `casa`, `sol`). O avatar do dono fica guardado (não aparece na conversa).
- **Recomendo:** o dono é a marca, o contato um cliente com nome comum e inventado, avatar de inicial numa cor clara que combine com a marca. **Porque:** quem assiste se põe no lugar do contato, e a marca aparece respondendo bem.
- Opções para o AskUserQuestion: "A marca atende um cliente (Recomendado)", "Duas pessoas conversando (amigas, casal, família)", "Eu descrevo".
- Campos: `"personagens": [ { "id": "forno", "nome": "Forno da Vila", "papel": "protagonista", "lado": "direita", "quem_e": "...", "avatar": {...} }, { "id": "rita", "nome": "Rita", "papel": "apoio", "lado": "esquerda", "quem_e": "...", "status": "online", "avatar": {...} } ]`.
- Conversa em grupo (3 ou mais), os 2 do mesmo lado ou desenho de avatar que não existe: o `--aplicar` recusa, diz os aceitos e volta à 5.

**Pergunta 8 trocada: `tela-do-chat`.** Mostre o still `recursos`. Pergunte:

- **O fundo da conversa:** `pontos` (pontinhos espaçados, recomendado), `liso`, `grade` (quadradinhos) ou `diagonal` (listras finas).
- **Horário nas bolhas** (`horario`, ligado por padrão) e **sinal de lido** nas bolhas do dono (`lido`, ligado por padrão: o círculo vazio de enviada vira cheio com o certo quando é lida; é o sinal do kit, não o de nenhum app).
- **A hora da primeira mensagem** (`hora`, "18:30" se não disser): as seguintes andam 1 minuto a cada 3 mensagens, e o roteiro pode fixar o horário de uma mensagem.
- **Recomendo:** pontos, horário e lido ligados, a hora em que a situação acontece. **Porque:** o horário e o lido fazem a conversa parecer de verdade sem copiar nenhum app.
- Campos: `"tela": { "fundo": "pontos", "horario": true, "lido": true, "hora": "20:14" }`. Fundo que não existe: o `--aplicar` recusa e volta à 8.

**Pergunta 9 trocada: `cores-da-conversa`.** Mostre o still `paletas` (as 3 prontas lado a lado, com a capa em cada uma). Diga antes que a paleta é própria do kit, sem a cor de nenhum app de mensagem. Três caminhos:

- **Cores do modelo** (a paleta `claro`: lilás e rosa claros, cabeçalho índigo, bolha pêssego): `cores.origem: "modelo"`.
- **A cor da marca** (só com `marca.cor`): as bolhas do dono na cor da marca, com o texto legível (branco ou quase preto, o que der contraste), e a palavra destacada do título na cor da marca ajustada para ler no fundo; o resto fica do modelo: `cores.origem: "marca"`.
- **Uma das 3 paletas prontas:** `claro`, `escuro` (grafite e ameixa, bolha âmbar, destaque rosa) ou `vivo` (amarelo e laranja, cabeçalho violeta, bolha magenta): `cores.origem: "pronta"` e `cores.pronta: "<id>"`.
- **Recomendo:** a cor da marca quando há marca com cor; o `claro` sem marca. **Porque:** a bolha do dono na cor da marca liga a conversa à marca sem logo nenhum.
- Troca fina, opcional: um papel por hex em `cores.paleta` (`fundo`, `fundo2`, `celular`, `chat`, `padrao`, `cabecalho`, `cabecalhoTexto`, `bolhaEsquerda`, `textoEsquerda`, `bolhaDireita`, `textoDireita`, `titulo`, `destaque`, `horario`, `lido`, `campo`, `cardFinal`).
- Paleta pronta que não existe, papel desconhecido ou `origem: "marca"` sem cor de marca: o `--aplicar` recusa e volta à 9.

**Pergunta 10 trocada: `receita-e-vozes`.** As duas receitas do modelo:

- **Duas vozes** (`vozes-por-fala`): uma voz por lado (os 3 caminhos da base: clonada, pronta, áudio próprio), cada mensagem com voz é uma fala gravada e a bolha entra no começo da fala dela. Custa crédito de voz: avise antes quantos caracteres vão para cada voz.
- **Só texto e música** (`texto-e-musica`): sem voz, as bolhas entram no tempo de leitura, com o digitando, e toca uma cama leve gerada pelo kit (trocável pela música da própria pessoa em cada vídeo). Nenhum crédito.
- **Recomendo pelo assunto:** atendimento, pedido, golpe evitado, mal-entendido, conversa que se lê, **só texto e música**; ligação que vira mensagem, áudio que conta a história, humor que depende do jeito de falar, **duas vozes**. A receita escolhida é a padrão do universo; cada vídeo pode usar a outra no roteiro.
- Campos: `"receita": "vozes-por-fala"` (ou `"texto-e-musica"`), `"voz": { "caminho": "pronta" }` e, com duas vozes, `personagens[].voz` (`caminho`, `voice_id` escolhido na Parte B). Receita que não existe: o `--aplicar` recusa e volta à 10.

**Pergunta 11: o que nunca pode acontecer.** A base, mais as **regras fixas do kit**, que entram sempre e não precisam ser perguntadas (diga quais são): nunca imitar a cara de um app de mensagem real (logo, nome, ícone, cor, som); nunca usar conversa real, print de conversa ou nome de cliente real sem autorização por escrito; o aviso de conversa encenada fica ligado. Campo: `nunca` (as da pessoa; as do kit estão no brandbook, seção 12).

**Pergunta 12 trocada: `card-final`.** Mostre o still `vista-fecho`. Pergunte a chamada (uma pergunta curta), a palavra do "Comenta" (com a marca; o card mostra também o símbolo e o nome dela) e se mantém o aviso "Conversa encenada: <contato> e as mensagens são fictícios" (recomendado: ligado). Campos: `fecho.chamada`, `fecho.palavra`, `fecho.aviso_ficticio`. Campo a mais no card final: o `--aplicar` recusa e volta à 12.

**Depois das respostas:** `novo_universo.mjs --aplicar`, redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `capa`, `elenco`, `recursos` e `vista-conversa`.

Códigos aceitos em `respostas.json`: receitas no `modelo.json`; avatares, fundos do chat, paletas prontas, papéis de cor, imagens e reações em `base/componentes/opcoes.json` (o `novo_universo.mjs --aplicar` recusa código fora deles e diz qual, com o número da pergunta).
