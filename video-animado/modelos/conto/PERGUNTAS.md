# Perguntas da entrevista curta neste modelo

O Conto é uma **família com personagem**: um modelo com 4 temas (papel recortado, bonecos de formas, silhuetas e giz de cera). Usa as 12 perguntas base de `references/entrevista-curta.md` (na skill), sem pular nenhuma e sem acrescentar: **12 perguntas**. Só a 8 é trocada pela versão `tema`, que escolhe o tema e o cenário com o nome do lugar. **A ordem muda numa coisa:** a 8 (tema) é feita logo depois da 4 (marca), antes da 5, porque a aparência dos personagens (6 e 7) é perguntada já no traço do tema escolhido. Ordem da conversa: 1, 2, 3, 4, **8**, 5, 6, 7, 9, 10, 11, 12. Uma pergunta por vez, a recomendação primeiro; "decide por mim" escolhe a recomendada. Cada resposta vira um campo do `respostas.json`.

`modelo.json`: `"perguntas": { "pular": [], "trocar": { "8": "tema" }, "acrescentar": [] }`, com a lista `temas` e `"tema_recomendado": "formas"` (pendente: confirmar com o dono).

| Pergunta base | Neste modelo | Campo |
|---|---|---|
| 1 a 3 | iguais às da base (nome, assunto e público, tom) | `universo` |
| 4. Marca | nome, cor (hex), símbolo e palavra do fecho; símbolos: `estrela`, `circulo`, `coracao`, `folha`, `balao`, `letra`. Recomendação: a letra inicial, quando não houver logo simples. Sem marca: `marca: null` (o fecho vira "Segue o perfil") | `marca` |
| 8. Tema e cenário (`tema`) | **feita logo depois da 4**; ver abaixo | `tema`, `cenarios.lista`, `cenarios.lugar` |
| 5. Personagem principal | nome, idade e quem é; vira o personagem com papel `protagonista` | `personagens[0]` |
| 6. Aparência | mostrar a folha `opcoes-aparencia-<tema escolhido>` e perguntar pelos códigos dela; ver abaixo | `personagens[0].aparencia` |
| 7. Elenco de apoio | 1 personagem de apoio (o diálogo é de dois; até 3 no total), com nome, idade, quem é e aparência pela mesma folha, com cor principal e acessório diferentes da protagonista | `personagens[1..]` |
| 9. Cores | ver abaixo | `cores.origem`, `cores.pronta`, `cores.paleta` |
| 10. Voz e narrador | ver abaixo | `personagens[].voz`, `narrador` |
| 11. O que nunca pode acontecer | as proibições da pessoa | `nunca` |
| 12. Fecho | a chamada, a palavra do "Comenta" e o aviso de personagem fictícia (recomendado: ligado) | `fecho.chamada`, `fecho.palavra`, `fecho.aviso_ficticio` |

**Pergunta 8 trocada: `tema` (tema, cenário e nome do lugar).** Feita logo depois da 4. Mostre os 4 stills `tema-papel`, `tema-formas`, `tema-silhuetas` e `tema-giz-de-cera` lado a lado (saem do `_preview` do universo recém-copiado, depois do `preparar_motor.sh`) ou as miniaturas `vitrine/tema-<id>.jpg` do kit:

- **formas** (Bonecos de formas): cor chapada viva, bonecos de forma simples com olhos grandes que quicam na fala, balões de fala. Bom para **humor e situação do dia a dia de um nicho**, com dois ou três personagens fixos.
- **papel** (Papel recortado): kraft, bonecos de peças de papel com colchete e sombra, faixa de título e tarja rasgadas. Bom para **história com começo, meio e fim**: origem da marca, caso de cliente, conteúdo infantil, de preferência com narrador.
- **silhuetas** (Silhuetas): céu em degradê com sol grande, morros em camadas, árvore e pássaros; os personagens são silhuetas escuras, sem rosto, reconhecidas pelo contorno e pela altura, que falam pelo gesto; título em citação serifada inclinada. Bom para **história emocional, homenagem, data comemorativa e depoimento**, com narração próxima e lenta.
- **giz-de-cera** (Giz de cera): folha de caderno pautada com margem e desenho de criança em giz de traço tremido, sol girando, arco-íris, casa e bonecos de cabeça redonda; letra de mão. Bom para **família, infância e saúde explicada para criança**, com voz de criança pronta ou narração de adulto.
- **Recomendação pelo assunto:** humor, situação, "quem nunca", **formas**; história, origem, caso contado do começo ao fim, **papel**; emoção, homenagem, data comemorativa, depoimento, **silhuetas**; família, infância, saúde para criança, **giz-de-cera**. Sem pista, o recomendado do modelo (**formas**, pendente).
- O tema troca só o visual: os tipos de cena, os personagens e os cenários valem nos 4, e dá para trocar depois sem refazer a entrevista (a aparência guarda os campos de todos os temas).
- Na mesma pergunta, **o cenário e o nome do lugar**: mostre o still `cenarios-<tema>` e pergunte onde as histórias acontecem (`sala`, lado de dentro; `rua`, lado de fora; os dois, na ordem do mais usado) e o nome do lugar que vai na placa (fictício, ou o da marca). Recomendação: os dois cenários, com o nome do lugar da marca.
- Opções para o AskUserQuestion: o tema recomendado "(Recomendado)" e os outros 3. O cenário e o lugar vêm em texto livre na mesma resposta, ou pela recomendação.
- Campos: `"tema": "formas"`, `"cenarios": { "lista": ["sala", "rua"], "lugar": "Escola Ponte" }`. Tema fora da lista ou cenário que não existe: o `--aplicar` recusa, diz os aceitos e volta à pergunta 8.

**Perguntas 6 e 7: aparência.** Um objeto só por personagem, para todos os temas: campos comuns e campos de cada tema. Pergunte pelos códigos da folha do tema escolhido; os campos dos outros temas saem do preset e ficam guardados para quando trocar de tema. Recomende cores principais e acessórios **diferentes** entre os personagens (nas silhuetas, contornos diferentes: formato, altura, cabelo e acessório): é o que faz cada um ser reconhecido nos 4 traços.

- **Comuns:** `preset` (`coque-oculos`, `bone-camiseta`, `cachos-laco`, `careca-gravata`), `cor` (a cor principal: a roupa de cima no papel, o corpo nas formas), `acessorio` (`nenhum`, `oculos`, `bone`, `laco`, `gravata`) e `corDetalhe` (a cor do acessório).
- **Papel recortado:** `pele` (`p1` mais clara a `p8` mais escura), `cabelo` (`curto`, `comprido`, `coque`, `cachos`, `rabo`, `careca`), `corCabelo`, `roupa` (`camisa-calca`, `camisa-saia`, `vestido`, `macacao`), `corBaixo`, `sapato`.
- **Bonecos de formas:** `corpo` (`pilula`, `retangulo`, `circulo`, `triangulo`), `olhos` (`redondos`, `grandes`, `pontos`, `sonolentos`), `sobrancelha` (`fina`, `grossa`, `nenhuma`).
- **Silhuetas:** campos próprios `formato` (`reto`, calça; `vestido`, saia rodada; `largo`, ombros largos; `redondo`, barriga) e `altura` (`baixa`, `media`, `alta`); lê o `cabelo` do papel recortado e o `acessorio` comum, que aparecem no contorno (os óculos e a gravata como recortes por onde passa o céu). A silhueta é escura: `cor` e as cores do papel não aparecem nela.
- **Giz de cera:** nenhum campo próprio; lê do papel recortado `pele`, `cabelo`, `corCabelo`, `roupa` e `corBaixo`, mais a `cor` principal (a roupa de cima), o `acessorio` e a `corDetalhe`: a mesma resposta desenha o mesmo personagem no papel e no giz.
- Opções para o AskUserQuestion: "Visual recomendado (Recomendado)" (um preset com a cor da marca ou uma cor que combina), "Outro preset", "Eu descrevo". Na terceira, a pessoa responde em texto livre e o Claude converte para os códigos, mostrando o resultado para confirmar.
- Código fora da lista: o `--aplicar` recusa, diz os aceitos e volta à 6 (protagonista) ou à 7 (apoio).

**Pergunta 9: cores do tema.** Diga antes o que a cor troca no tema escolhido (`cor_troca` do tema no `modelo.json`): **nas formas, todas as cores; no papel recortado, só o destaque (a palavra falada na tarja), as faixas (a faixa do título) e as etiquetas (a placa do lugar)**: o kraft, as fibras, a sombra e as cores de recorte ficam; **nas silhuetas, o céu (as 4 cores do degradê), o que ele tinge (sol, morro de trás, pássaros, luz da janela e legenda) e o destaque**: as silhuetas, o morro da frente, a placa e os móveis ficam escuros; **no giz de cera, as cores dos gizes** (sol, arco-íris, chão, casa, janela, porta, placa, título, legenda e destaque): a folha, a pauta e a margem ficam. As cores dos personagens são da aparência (6 e 7), não daqui. Três caminhos:

- **Cores do tema** (como vêm no modelo): `cores.origem: "tema"`.
- **Destaque na cor da marca** (só com `marca.cor`): o resto fica e o destaque vira a cor da marca, clareada ou escurecida o mínimo para ler (contraste 4 contra a tarja no papel, contra o chão nas formas e o morro escuro nas silhuetas, contra a folha no giz de cera): `cores.origem: "marca"`.
- **Uma das 3 paletas prontas do tema** (`prontas` em `base/componentes/opcoes.json`): papel `laranja`, `azul`, `vermelha`; formas `sol`, `menta`, `noite`; silhuetas `por-do-sol`, `noite`, `amanhecer`; giz de cera `classica`, `pastel`, `forte` (3 caixas de giz). `cores.origem: "pronta"` e `cores.pronta: "<id>"`. Mostre o still `paletas` se a pessoa quiser ver os papéis.
- Recomendação: **destaque na cor da marca** quando há marca com cor; **cores do tema** sem marca.
- Troca fina, opcional: um papel por hex em `cores.paleta`, só entre os `cores_trocaveis` do tema (no papel: `destaque`, `faixa`, `etiqueta`; nas silhuetas: `ceu`, `fundo2`, `fundo`, `ceu2`, `sol`, `chao2`, `traco`, `texto`, `destaque`, `enfeite2`; no giz de cera: `ceu`, `ceu2`, `sol`, `chao`, `chao2`, `enfeite`, `enfeite2`, `madeira`, `etiqueta`, `titulo`, `texto`, `destaque`).
- Papel que o tema não troca, paleta pronta de outro tema ou `origem: "marca"` sem cor de marca: o `--aplicar` recusa, diz qual e volta à 9.

**Pergunta 10: voz e narrador.** Uma voz por personagem que fala (os 3 caminhos da base: clonada, pronta, áudio próprio), e **se a história tem narrador**: uma voz a mais, sem rosto, que conta o que a cena não mostra; nas falas dele (`quem: "narrador"`) ninguém abre a boca. Recomendação: narrador ligado no papel recortado (história contada), nas silhuetas (história emocional, homenagem, depoimento: voz próxima e lenta, que pode levar o vídeo quase inteiro) e no giz de cera (voz de criança pronta, a criança que desenhou conta, ou narração de adulto calma); desligado nas formas (situação em diálogo). Nas silhuetas ninguém tem boca: quem fala gesticula. Campos: `personagens[].voz` e `"narrador": { "ligado": true, "voz": { "caminho": "pronta", "voice_id": null } }` (ou `false`). Narrador em formato errado: o `--aplicar` recusa e volta à 10.

**Depois das respostas:** `novo_universo.mjs --aplicar`, redigir as marcas `ESCREVER` do brandbook, `--conferir`, e mostrar para aprovação de olho os stills `expressoes-<id>-<tema>` de cada personagem, `elenco`, `tema-<tema>` e `cena-dialogo-<tema>`.

Códigos aceitos em `respostas.json`: temas no `modelo.json`; aparência, cenários, paletas prontas e papéis de cor em `base/componentes/opcoes.json` (o `novo_universo.mjs --aplicar` recusa código fora deles e diz qual, com o número da pergunta).
