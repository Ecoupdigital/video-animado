# Entrevista curta (modelo do catálogo)

Quando a pessoa escolhe um modelo no catálogo, o desenho, os cenários e a receita já vêm prontos. A entrevista curta troca só o que é da pessoa: nome, assunto, tom, marca, elenco, lugares, cores, voz, proibições e fecho. São **12 perguntas base**, ajustadas por modelo, e a entrevista de cada modelo fica **entre 8 e 12 perguntas** (o `conferir_kit.mjs` confere a conta).

## Regras

- **Uma pergunta por vez**, com AskUserQuestion, 2 a 4 opções, a recomendada primeiro e marcada "(Recomendado)". Cada pergunta abaixo traz a pergunta, a recomendação, o porquê, as opções e o campo do `respostas.json`.
- **"Decide por mim"**, "tanto faz" ou parecido: escolha a recomendada, diga o que escolheu e siga.
- **Avise no começo**: "são até 12 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'".
- **Pergunta que os arquivos já respondem é pulada.** Antes de perguntar, olhe o que já existe: brandbook ou regras de marca no estúdio (marca, cores, proibições), `respostas.json` parcial no universo (sessão interrompida), voz já salva em outro universo da pessoa. Diga o que aproveitou ("Usei a cor da marca que já está no teu brandbook de 2026-10") e não pergunte de novo.
- **Ajustes do modelo** vêm de dois lugares, lidos antes da primeira pergunta:
  - `modelo.json`, campo `perguntas`: `pular` (números que saem), `trocar` (número que vira outra pergunta, com o id dela) e `acrescentar` (ids de pergunta a mais, feitas no fim, antes do fecho).
  - `PERGUNTAS.md` do modelo: o texto de cada pergunta trocada ou acrescentada, as opções do modelo (códigos, folhas para mostrar) e o campo de cada resposta.
  - Exemplos: o Dossiê não tem personagem e pula 5, 6 e 7 (`"pular": [5, 6, 7]`, 9 perguntas); o Pixel tem um boneco só, pula a 7 e troca a 6 pelas opções do boneco pixel, a 8 pelo rótulo e pela assinatura do topo e a 12 pelo card final de perfil (`"pular": [7], "trocar": { "6": "aparencia-pixel", "8": "topo-rotulo-assinatura", "12": "card-final-perfil" }`, 11 perguntas); o chapado troca a 7 por `elenco-e-acompanhantes` (12 perguntas).
- **Total:** 12 menos as puladas mais as acrescentadas (trocar não muda a conta). Fora de 8 a 12, o kit não passa no `conferir_kit.mjs`.
- **Família (modelo com vários temas):** a entrevista ganha a pergunta de **tema** (id `tema`, no lugar de uma base, em geral a 8, ou acrescentada) e **mantém a de cores** (a 9 nunca é pulada). O total continua entre 8 e 12: a família pula o que não usa para caber. Na pergunta de tema, mostre a capa de cada tema (stills `tema-<id>` ou as miniaturas `vitrine/tema-<id>.jpg` do kit) e recomende pelo assunto; diga que o tema troca só o visual e dá para trocar depois sem refazer roteiro. Na de cores, diga antes o que a cor troca no tema escolhido (`cor_troca` do tema no `modelo.json`) e ofereça três caminhos: as cores do tema, o destaque na cor da marca (sempre possível, em qualquer tema) ou uma das 3 paletas prontas do tema. Tema fora da lista volta à pergunta de tema; papel de cor que o tema não troca volta à de cores.
  - Exemplo, a Explicação (`"pular": [5, 6, 7], "trocar": { "8": "tema", "9": "cores-do-tema", "12": "card-final" }`, 9 perguntas): sem personagem; a 8 escolhe entre quadro, lousa, post-its e tela de app; a 9 diz "no quadro a cor troca tudo; na lousa, só a cor da lousa e o giz de destaque" e oferece as cores do tema, o destaque da marca ou as paletas prontas (`papel-claro`, `papel-kraft`, `quadro-branco` no quadro; `verde`, `preta`, `azul` na lousa...). Respostas: `"tema": "quadro"`, `"cores": { "origem": "marca" }`. A entrevista inteira de um teste está em `modelos/explicacao/teste/entrevista.md`.
  - Segundo exemplo, a Dados e história (`"pular": [5, 6, 7], "trocar": { "8": "tema", "9": "cores-do-tema", "12": "card-final" }`, 9 perguntas): sem personagem; a 8 escolhe entre isométrico (número e resultado), linha do tempo (história da marca), mapa (entrega, viagem, expansão) e jornal (curiosidade antiga); a 9 diz "no isométrico, na linha do tempo e no mapa a cor troca tudo; no jornal, só o destaque, as fitas e as etiquetas (a cortiça, o papel e a retícula ficam)" e oferece as cores do tema, o destaque da marca ou as paletas prontas (`noite`, `grafite`, `aurora` no isométrico; `vermelha`, `azul`, `verde` no jornal...). Respostas: `"tema": "isometrico"`, `"cores": { "origem": "marca" }`. A entrevista inteira de um teste está em `modelos/dados-historia/teste/entrevista.md`.
  - Família com personagem, o Conto (`"pular": [], "trocar": { "8": "tema" }`, 12 perguntas): a 8 escolhe entre 4 temas, bonecos de formas (humor e situação do nicho), papel recortado (história com começo, meio e fim), silhuetas (história emocional, homenagem, data comemorativa, depoimento) e giz de cera (família, infância, saúde explicada para criança), e, na mesma pergunta, o cenário (sala, rua) e o nome do lugar da placa. **Nela a pergunta de tema vem antes da 5**, logo depois da 4: a aparência dos personagens (6 e 7) é perguntada já no traço do tema escolhido, mostrando a folha `opcoes-aparencia-<tema>`. A aparência é um objeto só para todos os temas (cor principal e acessório em comum, os campos de cada tema guardados), então trocar de tema depois não refaz a entrevista. A 9 diz "nas formas a cor troca tudo; no papel recortado, só o destaque, a faixa do título e a placa; nas silhuetas, o céu, o que ele tinge e o destaque; no giz de cera, as cores dos gizes" e oferece as cores do tema, o destaque da marca ou as paletas prontas (`sol`, `menta`, `noite` nas formas; `laranja`, `azul`, `vermelha` no papel; `por-do-sol`, `noite`, `amanhecer` nas silhuetas; `classica`, `pastel`, `forte` no giz de cera). A 10 pede uma voz por personagem e pergunta se há narrador (`narrador: { "ligado": true }`), recomendado nas silhuetas (voz próxima e lenta) e no giz de cera (voz de criança pronta ou narração de adulto). Respostas: `"tema": "formas"`, `"cenarios": { "lista": ["sala", "rua"], "lugar": "..." }`. A entrevista inteira de um teste está em `modelos/conto/teste/entrevista.md`.
- **Kit avulso com duas receitas, a Conversa no celular** (`"pular": [6, 7], "trocar": { "5": "quem-conversa", "8": "tela-do-chat", "9": "cores-da-conversa", "10": "receita-e-vozes", "12": "card-final" }`, 10 perguntas): sem personagem desenhado. A 5 pede os 2 lados da conversa (o dono do celular, à direita, em geral a marca; o contato do cabeçalho, à esquerda, com status e avatar de inicial ou desenho); a 8, a tela do chat (fundo pontos, liso, grade ou diagonal, horário, sinal de lido, hora da primeira mensagem); a 9 diz que a paleta é própria do kit, sem a cor de nenhum app, e oferece as cores do modelo (`claro`), a cor da marca nas bolhas do dono e no destaque, ou uma das 3 prontas (`claro`, `escuro`, `vivo`); a 10 escolhe a receita, **duas vozes** (uma por lado, cada bolha entra no começo da fala dela, custa crédito) ou **só texto e música** (bolhas no tempo de leitura, cama leve, nenhum crédito), recomendando pelo assunto; a 11 soma as regras fixas do kit (nunca imitar app real, nunca conversa ou nome de cliente real sem autorização, aviso de conversa encenada ligado); a 12 é o card final. Respostas: `"receita": "texto-e-musica"`, `"tela": { "fundo": "pontos" }`, `"cores": { "origem": "marca" }`. A entrevista inteira de um teste está em `modelos/conversa/teste/entrevista.md`.
- **Kit avulso sem personagem, a Mesa vista de cima** (`"pular": [5, 6, 7], "trocar": { "8": "superficie-e-itens", "9": "cores-da-mesa", "12": "card-final" }`, 9 perguntas): sem personagem nem mãos. A 8 mostra os stills `superficies` e `itens-<grupo>` e escolhe a superfície (`madeira`, `marmore`, `pano`) e o grupo principal (`cozinha`, `beleza`, `artesanato`, que escolhe a peça central e a amostra), recomendando pelo assunto (receita na madeira com cozinha, maquiagem no mármore com beleza, artesanato no pano) e dizendo que o roteiro de cada vídeo usa qualquer item dos 3 grupos; a 9 diz antes que a superfície fica e a cor troca destaque, faixa, etiqueta e card final, e oferece as cores do modelo (`ambar`), a cor da marca (na palavra destacada, no "PASSO n DE N" e na assinatura) ou uma das 3 prontas (`ambar`, `menta`, `vinho`); a 10 é a voz de uma narração inteira; a 11 soma as regras fixas do kit (nunca produto, embalagem ou logo de marca real; quantidade e tempo ditos iguais aos da tela); a 12 é o card final. Respostas: `"mesa": { "superficie": "marmore", "grupo": "beleza" }`, `"cores": { "origem": "marca" }`. A entrevista inteira de um teste está em `modelos/mesa/teste/entrevista.md`.
- **Kit avulso sem personagem e com duas receitas, o Neon retrô** (`"pular": [5, 6, 7], "trocar": { "8": "oferta", "9": "cores-do-neon", "10": "voz-ou-musica", "12": "card-final" }`, 9 perguntas): oferta, lançamento, evento e contagem regressiva. A 8 mostra o still `pecas` e pede a oferta (o tipo de vídeo, recomendado pelo assunto: `oferta`, `lancamento`, `evento`, `contagem`; o que, o preço e o preço antigo no formato brasileiro, o prazo, o selo curto e o texto do botão; o letreiro dos stills); a 9 diz antes que o neon troca todas as cores e oferece as cores do modelo (`synth`), a cor da marca (no letreiro cheio, no destaque e no botão) ou uma das 3 prontas (`synth`, `por-do-sol`, `verde-azul`); a 10 escolhe entre narração inteira (custa crédito de voz) e só letreiros na batida (sem crédito, com a cama synth do kit ou a música da pessoa com o andamento), recomendando pelo assunto; a 11 soma as regras fixas do kit (preço e prazo ditos iguais aos da tela; nunca marca, logo ou produto real de terceiros; a piscada dentro da regra); a 12 é o card final. Respostas: `"oferta": { "o_que": "Jaqueta jeans", "preco": "R$ 89,90", ... }`, `"cores": { "origem": "marca" }`, `"receita": "narracao-inteira"`. A entrevista inteira de um teste está em `modelos/neon/teste/entrevista.md`.
- **Resposta inválida volta à pergunta, com o motivo.** O `novo_universo.mjs --aplicar` recusa código fora da lista e diz o campo e o número da pergunta (`[pergunta 6] personagens[0].aparencia.cabelo: cabelo "moicano" não existe (aceitos: ...)`). Refaça só aquela pergunta, dizendo em palavras comuns o que não deu ("esse corte de cabelo não existe no modelo; os que existem são ..."), grave de novo e aplique.
- **Mostre a imagem antes de perguntar** quando o `PERGUNTAS.md` pedir (folha de opções de aparência, símbolos de marca, cenários). Os stills saem do `_preview` do universo recém-copiado: `npx remotion still _preview/src/index.ts <id> imagens/<id>.png`, depois do `preparar_motor.sh`.

## As 12 perguntas base

### 1. Nome do universo

- **Pergunta:** "Que nome a gente dá pra esse universo?" Sugira 3 nomes curtos e fáceis de falar, a partir do assunto (se já souber) ou do modelo, e deixe digitar outro.
- **Recomendo:** o primeiro dos 3 nomes sugeridos, o mais curto e falável.
- **Porque:** o nome vira título de todo vídeo, da pasta e do brandbook; nome curto se lembra e cabe no cartão do título.
- **Opções:** os 3 nomes sugeridos; "Outro" (a pessoa digita).
- **Campo:** `universo.nome` e `universo.pasta` (o nome em minúsculas com hífen, ex.: `sorriso-em-dia`).

### 2. Assunto e público

- **Pergunta:** "Sobre o que são os vídeos, e quem assiste?"
- **Recomendo:** um assunto do dia a dia com situações engraçadas e uma resposta certa para dar, para um público de uma faixa de idade só.
- **Porque:** o formato dos modelos é situação, dica e piada; público amplo demais deixa o tom sem rumo.
- **Opções:** 2 ou 3 formulações tiradas do que a pessoa já contou; "Eu descrevo".
- **Campo:** `universo.assunto` e `universo.publico` (texto livre, uma frase cada).

### 3. Tom

- **Pergunta:** "Qual o tom da série?"
- **Recomendo:** leve e acolhedor, que ri da situação sem humilhar ninguém.
- **Porque:** é o tom que o desenho dos modelos com personagem sustenta e o que mais rende salvamento e compartilhamento.
- **Opções:** "Leve e acolhedor (Recomendado)", "Irônico e rápido", "Didático e calmo", "Outro".
- **Campo:** `universo.tom`.

### 4. Marca

- **Pergunta:** "Os vídeos são de uma marca? Se sim: nome, cor, símbolo e a palavra do 'Comenta'."
- **Recomendo:** com marca, usando a cor dela e a letra inicial como símbolo quando não houver logo simples.
- **Porque:** a marca aparece no celular e no fecho, e o "Comenta <PALAVRA>" puxa a conversa para o direct.
- **Opções:** "Com a minha marca (Recomendado)", "Sem marca (fecho de seguir o perfil)". Na primeira, pergunte nome, cor e palavra numa mensagem só e mostre a folha de símbolos do modelo.
- **Campo:** `marca` (`nome`, `cor` em hex, `simbolo`, `palavra_fecho`), ou `marca: null`.

### 5. Personagem principal

- **Pergunta:** "Quem é a pessoa principal? Nome, idade e quem ela é numa frase."
- **Recomendo:** alguém do mesmo mundo do público, com um defeito engraçado (ansiosa, esquecida, exagerada).
- **Porque:** o público se reconhece nela, e o defeito gera o conflito de cada episódio.
- **Opções:** 2 personagens sugeridos a partir do assunto; "Eu descrevo".
- **Campo:** `personagens[0]` (`id`, `nome`, `papel: "protagonista"`, `idade`, `quem_e`).

### 6. Aparência

- **Pergunta:** "Como ela é?" Mostre a folha de opções de aparência do modelo e pergunte pelos códigos dela.
- **Recomendo:** começar de um preset do modelo e trocar só o que for preciso (pele, cabelo, cor da roupa).
- **Porque:** o preset já foi conferido no traço do modelo; trocar poucos campos mantém o desenho bonito.
- **Opções:** os presets do modelo que combinam com a descrição; "Montar do zero pelos códigos da folha".
- **Campo:** `personagens[0].aparencia` (códigos do `PERGUNTAS.md` e de `base/componentes/opcoes.json`).

### 7. Elenco de apoio

- **Pergunta:** "Quem mais aparece? Para cada um: manter o papel sugerido, trocar ou tirar."
- **Recomendo:** 2 pessoas de apoio com silhueta diferente da protagonista (cabelo e altura).
- **Porque:** duas pessoas fazem a escada da piada sem pesar cada cena; silhuetas diferentes se reconhecem de longe.
- **Opções:** "Elenco recomendado (Recomendado)", "Só a protagonista", "Eu descrevo o elenco".
- **Campo:** `personagens[1..]` (cada um com `papel: "apoio"` e aparência própria). Modelos com acompanhantes juntam aqui os `acompanhantes` (ver o `PERGUNTAS.md`).

### 8. Cenários e nome do lugar

- **Pergunta:** "Onde as histórias acontecem? E qual o nome do lugar (placa, loja)?" Mostre a folha de cenários do modelo.
- **Recomendo:** um cenário de casa e um cenário do assunto (sala de espera, rua com a loja), com nomes fictícios.
- **Porque:** dois ou três cenários bastam para variar as cenas, e nome fictício evita parecer anúncio de empresa real.
- **Opções:** combinações de cenários do modelo; "Eu escolho".
- **Campo:** `cenarios` (cômodos, `sala_espera.placa`, `rua.loja`, conforme o modelo).

### 9. Cores

- **Pergunta:** "Que cores a série usa?"
- **Recomendo:** a paleta do modelo, com o destaque trocado pela cor da marca quando houver.
- **Porque:** a paleta do modelo já foi testada com os personagens e os cenários; o destaque na cor da marca liga o vídeo à marca.
- **Opções:** "Paleta do modelo com a cor da marca (Recomendado)", "Paleta do modelo como está", "3 paletas sugeridas a partir da marca".
- **Campo:** `cores.origem` (`modelo` ou `marca`) e `cores.paleta` (papéis trocados, em hex, ou `null`).

### 10. Voz

- **Pergunta:** "Como fica a voz?" Os 3 caminhos de voz:
  1. voz clonada da pessoa no ElevenLabs;
  2. voz pronta do ElevenLabs, que a skill sugere conforme o personagem;
  3. áudio que a pessoa já tem gravado.
- **Recomendo:** voz pronta do ElevenLabs, uma por personagem que fala.
- **Porque:** não pede gravação nem clonagem, e cada personagem soa diferente.
- **Opções:** os 3 caminhos, com a voz pronta primeiro.
- **Campo:** `voz.caminho` (`clonada`, `pronta` ou `audio-proprio`) e `personagens[].voz` (`caminho` e `voice_id`, escolhido depois na Parte B).

### 11. O que nunca pode acontecer

- **Pergunta:** "O que nunca pode aparecer ou ser dito nesses vídeos?"
- **Recomendo:** 3 proibições: prometer resultado, dado sem fonte na tela e rir de quem está do outro lado.
- **Porque:** cobre os riscos mais comuns de assunto de serviço e de saúde; o roteiro de cada vídeo passa por essa lista.
- **Opções:** a lista recomendada adaptada ao assunto; "Eu escrevo a lista". Se o estúdio tiver regras de marca, transforme as proibições delas nas do universo.
- **Campo:** `nunca` (lista de textos).

### 12. Fecho

- **Pergunta:** "Como termina cada vídeo? A chamada, a palavra do 'Comenta' e o aviso de personagem fictícia."
- **Recomendo:** uma pergunta curta que leva ao próximo passo, a palavra da marca e o aviso ligado.
- **Porque:** o fecho igual em todo vídeo vira marca registrada, e o aviso evita que alguém tome a personagem por pessoa real.
- **Opções:** 2 chamadas sugeridas; "Eu escrevo a chamada".
- **Campo:** `fecho.chamada`, `fecho.palavra`, `fecho.aviso_ficticio` (`true` por padrão).

## Gravar e aplicar

1. Junte as respostas em `<universo>/respostas.json` (formato em `formato-kit.md`), com `modelo`, `versao_modelo` e `respondido_em` (AAAA-MM-DD). Nos modelos locais, o `novo_universo.mjs` já deixa um `respostas.json` com as respostas do modelo: troque só o que mudou.
2. `node scripts/novo_universo.mjs --aplicar <universo>`. Problema: volte à pergunta indicada.
3. Redija as marcas `ESCREVER` que o script listar e confira com `--conferir`.

**Mudar uma resposta depois:** edite o `respostas.json` e rode `--aplicar` de novo. O script refaz `componentes/universo.ts`, os personagens e as partes preenchidas do brandbook a partir do modelo guardado em `.brandbook-modelo.md`, e mantém o texto já escrito no lugar das marcas `ESCREVER`. Se esse texto citar um valor que mudou (o nome antigo da loja, por exemplo), o script avisa para revisar. Rodar duas vezes seguidas dá o mesmo resultado. Se alguém editou o brandbook fora das lacunas, o script não troca o arquivo: grava a versão nova em `BRANDBOOK-ANIMACAO.novo.md` e diz o que fazer. Depois de reaplicar, gere de novo o HTML (`node _preview/gerar-html.mjs`).
