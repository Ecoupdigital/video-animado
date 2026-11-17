# {{universo.nome}}

Universo de conversas no celular, desenhado em código, no modelo "Conversa no celular": um mensageiro genérico (sem a cara de nenhum app real) num celular no centro da tela, com {{contato_nome}} no cabeçalho e as bolhas dos dois lados entrando uma a uma.

Criado em {{data}} a partir do modelo `conversa` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs --stills`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar quem conversa, a tela do chat, as cores, a receita ou o card final, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Quem conversa:** {{dono_nome}} (o dono do celular, à direita) e {{contato_nome}} (o contato do cabeçalho, à esquerda).
4. **Tela do chat:** {{tela_resumo}}
5. **Visual:** {{cores_resumo}} Vertical 1080 x 1920, 30 fps. Receita padrão: {{receita_nome}}.

## 2. Narrativa do universo

<!-- ESCREVER: que conversas a série mostra (o pedido, a dúvida, a confusão, o golpe evitado), o conflito que se repete, de 1 a 3 formatos de vídeo e como começa e termina cada um. Usar as respostas de assunto, público e tom. Escrever como gente fala: frases curtas, uma ideia por frase. -->

**Marca:** {{marca_resumo}}

**Card final de todo vídeo (cerca de 4 s):** {{fecho_resumo}}

**Como começa e termina.** Abertura com o título (a palavra entre asteriscos no roteiro sai destacada) e o chat vazio por pouco mais de 1 segundo; as mensagens entrando uma a uma, com a legenda da cena embaixo do título; o card final por cima do celular.

## 3. Quem conversa

Uma conversa é sempre de 2 pessoas, uma de cada lado. A ficha de cada uma fica em `personagens/<id>/FICHA.md`, gerada das respostas. No roteiro, cada mensagem diz `quem` manda, pelo id.

{{tabela_lados}}

<!-- ESCREVER: o jeito de escrever de cada lado (frase curta ou longa, gíria, pontuação, se manda áudio, o que nunca escreve), uma linha por pessoa. -->

## 4. Tela do chat

{{tela_resumo}}

O celular fica no centro, com a moldura e a tela de cantos redondos. No alto, o cabeçalho do contato: seta de voltar, avatar (a inicial ou um desenho, num círculo colorido), nome e status. Embaixo, o campo de mensagem com o botão de enviar e o teclado sem letras, na faixa que o Reels cobre. Tudo desenhado em código, sem logo, nome, ícone ou cor de app real.

| Recurso | Como aparece | No roteiro |
|---|---|---|
| Mensagem de texto | bolha à esquerda (contato) ou à direita (dono), na cor de cada lado; texto longo quebra dentro da bolha | `"texto": "..."` |
| Digitando | três pontos que pulsam numa bolha do contato, antes da mensagem dele; do lado do dono, o texto aparece letra a letra no campo | automático, quando há tempo antes da mensagem |
| Áudio | bolha com o botão de tocar, a onda e a duração | `"tipo": "audio", "duracao": "0:07"` |
| Imagem | bolha com uma imagem simples desenhada (bolo, foto, mapa, recibo, produto, calendário) e uma legenda opcional | `"tipo": "imagem", "imagem": "bolo"` |
| Reação | um círculo pequeno preso no canto da bolha (coração, risada, espanto, estrela, certo) | `"reacao": "coracao"` |
| Horário e lido | horário no canto de cada bolha; nas do dono, o sinal de lido (círculo vazio = enviada, cheio com o certo = lida) | `"horario": "18:42"`, `"lido": false` |
| Rolagem | quando a bolha nova não cabe, a conversa sobe; cabeçalho e campo ficam parados | automático |

## 5. Cores

{{cores_resumo}} Os componentes usam o papel da cor (`T.c.bolhaDireita`, `T.c.destaque`...), nunca o hex direto. Texto sobre qualquer cor sai em quase preto ou branco quando a cor pedida não dá contraste.

{{tabela_cores}}

Paletas prontas do modelo: **claro** (lilás e rosa claros, cabeçalho índigo, bolha pêssego), **escuro** (grafite e ameixa, bolha âmbar) e **vivo** (amarelo e laranja, cabeçalho violeta, bolha magenta).

## 6. Fontes

| Fonte | Para quê | Tamanho de referência (1080 de largura) |
|---|---|---|
| **Inter 800** (`ConversaTexto`) | título da cena com a palavra destacada, nome do contato, inicial do avatar, chamada e "Comenta" do card final | título 76 px, nome 38 px, chamada 66 px |
| **Inter 600** (`ConversaTexto`) | legenda da cena, status, duração do áudio | legenda 34 px, status 26 px |
| **Inter 400** (`ConversaTexto`) | texto das bolhas, horário, campo de mensagem, aviso de conversa encenada | bolha 40 px, horário 24 px |

Os arquivos moram em `componentes/fontes/` (licença em `OFL.txt`, origem em `ORIGEM.md`): nada é baixado na hora do render. Símbolos (reação, lido, play, enviar) são desenhados em código, nunca emoji.

## 7. Grade da tela e textos

Área segura do Reels: nada importante nos 220 px do topo, nos 380 px de baixo nem a menos de 70 px das laterais. Todo texto encolhe até um mínimo e, se ainda não couber, quebra (palavra comprida quebra no meio) e corta com reticências.

| Faixa (y) | O que vai |
|---|---|
| 236 a 432 | título da cena (`Titulo`, até 3 linhas), com a palavra destacada |
| 444 a 540 | legenda da cena (`Legenda`, até 2 linhas) |
| 552 a 696 | moldura do celular e o cabeçalho do contato |
| 696 a 1424 | a conversa (as bolhas; rola quando passa da tela) |
| 1424 a 1540 | campo de mensagem e botão de enviar |
| 1540 até o fim | teclado sem letras (o Reels cobre esta faixa; nenhum texto) |

**Tipos de cena:** `abertura` (título e chat vazio ou com a primeira mensagem), `conversa` (bolhas entrando, legenda da cena), `rolagem` (conversa longa, que sobe) e `fecho` (o card final por cima do celular). Título e legenda ficam acima do celular: nunca cobrem a bolha mais nova.

## 8. Movimento

- **Bolha:** entra de baixo, com leve subida e escala, em 5 frames; a do contato vem depois do digitando, a do dono depois do texto digitado no campo.
- **Rolagem:** a conversa sobe junto com a bolha nova, em 6 frames; cabeçalho e campo ficam parados.
- **Digitando:** três pontos que pulsam, um depois do outro.
- **Reação:** surge com um pulinho, logo depois da bolha.
- **Título e legenda:** trocam por cena com um deslize curto.
- **Som:** `chegou` quando entra bolha do contato, `enviada` quando entra bolha do dono, `tecla` enquanto o dono digita, e a cama leve na receita só texto e música. Gerados por `_ferramentas/gerar_sfx.py`, sem imitar som de app real.
- **Nunca:** sacudir a tela, bolha entrando de lado, texto piscando.

## 9. Mensagens de exemplo

Os stills de conferência (`recursos`, `avatares`, `elenco`, `paletas`, `capa`, `cena-<tipo>`, `vista-<tipo>`) usam uma conversa neutra do kit (`componentes/exemplo.ts`) com os nomes deste universo; a resposta `amostra` (título e primeira mensagem) troca o texto da capa.

## 10. Voz e receita

Receita padrão: {{receita_nome}}: {{receita_resumo}} Cada vídeo pode escolher a outra no `roteiro-falas.json` (`"receita": "texto-e-musica"` ou `"vozes-por-fala"`). Caminho de voz: {{voz.caminho}}.

{{tabela_vozes}}

Antes de gerar qualquer voz: roteiro aprovado, prévia sem voz olhada e aviso de quantos caracteres vão para cada voz (receita em `RECEITA.md`).

## 11. Pronúncias

<!-- ESCREVER: palavras do universo que a voz pode errar (nome da marca, nomes, termos do assunto) e como devem soar, em uma linha cada. A tabela completa fica em pronuncias.md. -->

## 12. Proibições

1. Imitar a cara de um app de mensagem real: logo, nome, ícone, cor ou som de notificação.
2. Usar conversa real, print de conversa ou nome de cliente real sem autorização por escrito.
3. Tirar o aviso de conversa encenada sem motivo: ele fica ligado por padrão.
4. Conversa em grupo, chamada de voz ou de vídeo, figurinha ou emoji de fonte do sistema: o modelo é de 2 pessoas e desenha os símbolos em código.
5. Texto fora da área segura ou por cima da bolha mais nova.
6. Ferramenta externa de imagem ou vídeo por IA, ou imagem de fora dentro da bolha: as imagens são as desenhadas do kit.

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo, a `RECEITA.md` e as fichas em `personagens/`.
2. Escreva o roteiro em cenas e mensagens (`roteiro-falas.json`), com o título de cada cena (a palavra destacada entre asteriscos) e a legenda, e passe pela lista do que nunca acontece.
3. Crie `videos/AAAA-MM-DD-slug/` e copie `_ferramentas/episodio-base/src` para dentro (os `node_modules` da raiz do universo servem para todos os vídeos). Nunca redesenhe o celular nem as bolhas: use os componentes.
4. Faça a prévia sem voz (`tempos_sem_voz.py` e `previa.sh`) antes de gastar crédito de voz.
5. Siga a grade da tela e feche com o card final.
