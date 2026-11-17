# {{universo.nome}}

Reel narrado, desenhado em código, no modelo "Mesa vista de cima": uma narração inteira ensina um passo a passo, e a mesa é vista de cima, com cada ingrediente, produto ou material caindo ou aparecendo na palavra falada. Sem personagem e sem mãos: quem conduz é a voz.

Criado em {{data}} a partir do modelo `mesa` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar nome, marca, superfície, grupo, cores ou card final, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Personagens:** nenhum, nem mãos. A narração conduz; o que se usa cai na mesa.
4. **Cenas:** abertura com a mesa e a peça central vazias e o título na etiqueta, passos com a etiqueta "PASSO n DE N", os itens caindo na palavra e a faixa de legenda, card final.
5. **Visual:** mesa de {{superficie_nome}}, grupo principal {{grupo_nome}}, vertical 1080 x 1920, 30 fps, algo novo na tela a cada segundo.

## 2. Narrativa do universo

<!-- ESCREVER: que tipo de passo a passo a série ensina (de onde vêm as dúvidas, o que cada vídeo deixa pronto na mesa) e 1 a 3 formatos de vídeo (receita do começo ao fim, "o passo que todo mundo pula", "3 jeitos de..."). Frases completas, como gente fala. -->

**Estrutura do episódio (30 a 60 s, uma narração só):**
1. **Abertura (0 a 3 s):** a mesa e a peça central vazias, o título na etiqueta, a promessa dita pela voz.
2. **Os passos:** um passo por cena; a etiqueta troca para "PASSO n DE N" e o título do passo, e cada item cai ou aparece na palavra em que a voz fala dele. A quantidade e o tempo ditos são os mesmos da tela.
3. **A faixa de legenda:** a frase curta do passo, com a palavra que importa no destaque.
4. **O resultado:** a peça central pronta, com tudo o que caiu nos passos.
5. **Card final (cerca de 3 s):** {{fecho_resumo}}

**Marca:** {{marca_resumo}}

## 3. Personagens

Este universo não usa personagem nem mãos. Quem conduz o vídeo é a narração (uma voz só, o texto inteiro), e o passo a passo aparece em itens desenhados em código que caem ou aparecem na mesa na palavra falada.

<!-- ESCREVER: o jeito de narrar (ritmo, como apresenta um item, como diz quantidade e tempo, como avisa do erro comum sem dar bronca, o que nunca diz). -->

## 4. Mesa, peça central e itens

**Superfície deste universo: {{superficie_nome}}.** {{superficie_resumo}}

{{tabela_superficies}}

**Grupo principal: {{grupo_nome}}.** Peça central: {{grupo_centro}}. O grupo principal só escolhe a peça central e a amostra dos stills: o roteiro de cada vídeo usa qualquer item dos 3 grupos.

{{tabela_itens}}

Cada item entra de um de dois jeitos: **cai** (vem de cima, a sombra encosta na mesa e ele assenta) ou **aparece** (cresce num pop). Item que vira cobertura entra sobre a peça central, pedaço a pedaço (queijo, tomate, folha, sombra, botão), ou cobre a peça como camada (massa, molho, base, batom, papel, fita). O que caiu na peça central fica até o fim do vídeo; o que caiu na mesa sai quando o passo troca.

As cenas estão em `componentes/cenas.tsx`, montadas pelos dados do roteiro de cada vídeo:

| Cena (`tipo`) | O que mostra |
|---|---|
| `abertura` | a mesa, a peça central vazia e a etiqueta grande com o rótulo e o título; a faixa com a frase, se houver |
| `passo` | a etiqueta "PASSO n DE N" com o título do passo, os itens caindo ou aparecendo na palavra e a faixa com a frase e a palavra destacada |
| `final` | a peça central pronta, a pergunta na faixa e o card final por cima |

Os stills `cena-<tipo>` do `_preview` mostram cada cena com a área segura marcada; `capa` é a cena da tela de referência no grupo e na superfície deste universo.

## 5. Cores

**A cor troca destaque, faixa, etiqueta e card final; o material da mesa nunca muda** (a madeira, o mármore, o pano, a peça central e os itens ficam como são). Neste universo: {{cores_resumo}} Os tokens moram em `componentes/opcoes.json` (`paletas`, as 3 prontas com os mesmos papéis, e `superficies`, com as cores fixas do material) e os componentes pegam a cor pelo papel com `useMesa()` (`M.c.destaque`, `M.a('faixa', 0.9)`), nunca por hex fixo.

{{tabela_cores}}

**Destaque com parcimônia:** uma palavra por faixa. Uma cor de destaque por tela.

## 6. Fontes

| Papel | Fonte | Para quê |
|---|---|---|
| texto | **Inter** 600 e 800 | frase da faixa (600), título do passo e da abertura, chamada e assinatura do card final (800) |
| mono | **JetBrains Mono** 500 | "PASSO n DE N", rótulo da abertura, fontes e aviso do card final |

As fontes moram no kit, em `componentes/fontes/` (origem e licença em `fontes/ORIGEM.md` e `fontes/OFL.txt`): o vídeo sai igual com e sem internet. Tamanhos de referência (1080 de largura): título do passo 44 a 56 px, título da abertura 64 a 84 px (encolhem sozinhos com texto longo), frase da faixa 34 a 44 px, "PASSO n DE N" 28 a 32 px, letra miúda 22 px.

## 7. Grade da tela e textos

Área segura do Reels: nada importante nos **220 px do topo** nem nos **380 px de baixo** (abaixo de y 1540), nem a menos de **70 px das laterais**. O still de conferência mostra a área marcada. A mesa ocupa a tela inteira; só o texto e os itens ficam dentro da área.

| Faixa (y) | O que vai |
|---|---|
| 236 a ~520 | etiqueta de papel girada, com "PASSO n DE N" e o título (cresce com título longo) |
| ~560 a ~1380 | peça central no meio e os itens da mesa em volta dela, sem encostar na etiqueta nem na faixa |
| ~1380 a 1530 | faixa de legenda (cresce para cima com frase longa, até 3 linhas) |
| abaixo de 1540 | só a mesa |

Texto longo quebra e encolhe dentro da área segura (título do passo, frase da faixa, chamada, assinatura).

## 8. Movimento

- **Item que cai:** vem de cima, maior e com a sombra longe e borrada; em 0,4 s a sombra encosta, o item assenta com um pequeno quique. **Item que aparece:** cresce num pop e assenta.
- **Cobertura:** os pedaços entram um por vez sobre a peça central, a cerca de 0,08 s um do outro; a camada se espalha do centro para fora.
- **Etiqueta:** a de cada passo cai no lugar com o som de papel; a anterior sai.
- **Faixa:** sobe da borda de baixo da área segura no começo do passo; a palavra destacada já vem no destaque.
- **Corte entre passos:** os itens da mesa do passo anterior saem em 0,2 s; o que caiu na peça central fica.
- **Ritmo:** algo novo a cada cerca de 1 s (item, pedaço, etiqueta, faixa).
- **Som:** cama leve por baixo, que abaixa quando a voz fala (`duck.json`); o pouso do item tem um som por superfície (madeira, mármore, pano), mais o pop, o papel da etiqueta e o deslize da faixa, gerados por código (origem em `_ferramentas/sfx/ORIGEM.md`).

## 9. Itens

O modelo não tem expressões: o que se repete são os itens da biblioteca, em `componentes/itens/`, desenhados em código e vistos de cima. Folhas nos stills `itens-cozinha`, `itens-beleza`, `itens-artesanato` (cada item com o nome e o código) e `elenco` (a biblioteca inteira). Nenhum item tem rótulo, logo ou embalagem de marca: frasco, batom e cola são genéricos.

## 10. Voz

Caminho escolhido: {{voz.caminho}}. **Uma narração inteira, uma voz só**, gerada de uma vez a partir do roteiro aprovado (1 versão por vez, custo avisado antes). Um trecho que saiu errado se emenda (`_ferramentas/emendar.py`), sem gerar a narração de novo. Receita em `RECEITA.md`.

{{tabela_vozes}}

## 11. Pronúncias

<!-- ESCREVER: nomes de produto, ingrediente ou material, medidas e tempos do assunto que a voz pode errar, e como devem soar, uma linha cada. A tabela completa fica em pronuncias.md, que o transcrever.py também lê. -->

## 12. Proibições

1. Produto, embalagem, rótulo ou logo de marca real em qualquer item; nome de marca real no texto.
2. Quantidade ou tempo dito diferente do que está na tela (3 ovos ditos, 3 ovos na mesa; "48 horas" dito, "48 horas" na etiqueta).
3. Ferramenta externa de imagem ou vídeo por IA; foto de produto; imagem baixada; texto fora da área segura.
4. Mais de uma palavra destacada por faixa; mesa parada mais de 3 s sem nada novo.
5. Mãos, rosto ou personagem: a mesa é vista de cima, só com os itens.

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo e a `RECEITA.md`; confira cada quantidade, tempo e regra numa fonte que dá para citar.
2. Escreva o roteiro (a narração inteira, em cenas, um item por batida) e aprove antes da voz; passe pela lista do que nunca acontece.
3. Crie `videos/AAAA-MM-DD-slug/`, copie `_ferramentas/episodio-base/src` e grave o `roteiro-falas.json` com as cenas, os itens e a palavra de cada batida.
4. Faça a prévia sem voz (`tempos_sem_voz.py` e `previa.sh`) antes de gastar crédito de voz.
5. Use as cenas e os itens de `componentes/`; nunca desenhe um item dentro do vídeo. Item que não existe na biblioteca entra no kit primeiro.
