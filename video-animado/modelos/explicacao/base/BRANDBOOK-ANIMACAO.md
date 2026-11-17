# {{universo.nome}}

Reel narrado, desenhado em código, no modelo "Explicação": uma narração inteira explica um processo, uma conta ou uma rotina, e as caixas, setas, círculos, post-its e o clique do cursor entram na palavra falada. Sem personagem: quem conduz é a voz.

Criado em {{data}} a partir do modelo `explicacao` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar nome, marca, tema, cores, rótulo ou card final, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Personagens:** nenhum. A narração conduz; o que se explica vira caixa, conta, post-it ou tela.
4. **Cenas:** abertura com título à mão, passos ligados por setas, conta linha a linha com o resultado circulado, colunas com o cartão que anda, tela com clique e card final.
5. **Visual:** tema {{tema_nome}}, vertical 1080 x 1920, 30 fps, algo novo na tela a cada segundo.

## 2. Narrativa do universo

<!-- ESCREVER: que tipo de explicação a série faz (de onde vêm as dúvidas, que pergunta cada vídeo responde) e 1 a 3 formatos de vídeo (passo a passo, a conta do mês, "o erro que todo mundo comete em..."). Frases completas, como gente fala. -->

**Estrutura do episódio (30 a 60 s, uma narração só):**
1. **Abertura (0 a 3 s):** a pergunta ou a promessa da explicação, escrita à mão na tela enquanto a voz fala.
2. **O caminho:** os passos em caixas ligadas por setas, um por vez, cada um na palavra falada.
3. **A conta ou o exemplo:** a conta linha a linha, com o resultado circulado; ou as tarefas andando de coluna; ou a tela com o clique no botão certo.
4. **O cuidado:** o erro comum ou a regra que vale (com a fonte quando for dado oficial).
5. **Card final (cerca de 3 s):** {{fecho_resumo}}

**Rótulo do topo:** "{{rotulo}}".

**Marca:** {{marca_resumo}}

## 3. Personagens

Este universo não usa personagem. Quem conduz o vídeo é a narração (uma voz só, o texto inteiro), e a explicação aparece em peças desenhadas em código que entram na palavra falada: a caixa se desenha quando a voz diz o passo, a seta liga ao próximo, o círculo fecha no resultado, o post-it anda quando a voz fala da tarefa, o cursor clica no verbo.

<!-- ESCREVER: o jeito de narrar (ritmo, como apresenta um passo, como diz a conta em voz alta, como avisa do erro comum sem dar bronca, o que nunca diz). -->

## 4. Tema e cenas

**Tema deste universo: {{tema_nome}}.** {{tema_resumo}}

A família tem 4 temas. O tema troca o visual, não o roteiro: os mesmos tipos de cena valem nos quatro.

{{tabela_temas}}

As cenas estão em `componentes/cenas.tsx`, montadas pelos dados do roteiro de cada vídeo:

| Cena (`tipo`) | O que mostra | Peças |
|---|---|---|
| `abertura` | rótulo, título escrito à mão palavra por palavra, risco de destaque embaixo, ícone e subtítulo | `Titulo`, `Risco`, `Icone`, `TextoMao` |
| `passos` | de 2 a 4 caixas que se desenham, ligadas por setas, cada uma com ícone e texto | `Caixa`, `Seta`, `Icone` |
| `conta` | a conta linha a linha e o resultado circulado | `TextoMao`, `Circulo` |
| `colunas` | 2 ou 3 colunas com cartões; o cartão anda de coluna na palavra falada | `Colunas`, `Cartao` |
| `tela` | janela de painel genérica com menu lateral; o cursor vai até o botão e clica | `Janela`, `Cursor`, `Onda` |
| `final` | a pergunta escrita, "comenta aqui" e o card final | `CardFinal` |

Os stills `cena-<tipo>-<tema>` do `_preview` mostram cada cena nos 4 temas, com a área segura marcada; `tema-<id>` é a capa de cada tema.

## 5. Cores

**Tema {{tema_nome}}: {{tema_cor_troca}}.** Neste universo: {{cores_resumo}} Os tokens moram em `componentes/opcoes.json` (`paletas`, os mesmos papéis nos 4 temas, e `prontas`, 3 paletas prontas por tema) e os componentes pegam a cor pelo papel com `useTema()` (`T.c.destaque`, `T.a('traco', 0.3)`), nunca por hex fixo.

{{tabela_cores}}

**Destaque com parcimônia:** o risco do título, o círculo do resultado e a palavra-chave. Uma cor de destaque por tela.

## 6. Fontes

| Papel | Fonte | Para quê |
|---|---|---|
| mão | **Caveat** 600 e 700 | títulos do quadro e da lousa, caixas, post-its, conta |
| texto | **Inter** 400, 600, 800 e 900 | texto de apoio, janela de app, título da tela de app e dos post-its |
| mono | **JetBrains Mono** 500 | rótulo do topo, endereço da janela, letra miúda do card final |

As fontes moram no kit, em `componentes/fontes/` (origem e licença em `fontes/ORIGEM.md` e `fontes/OFL.txt`): o vídeo sai igual com e sem internet. Tamanhos de referência (1080 de largura): título à mão 96 a 130 px (encolhe sozinho com texto longo), título em Inter 72 a 92 px, texto de caixa 54 a 66 px, conta 76 a 96 px, rótulo mono 26 a 30 px, letra miúda 22 px.

## 7. Grade da tela e textos

Área segura do Reels: nada importante nos **220 px do topo** nem nos **380 px de baixo** (abaixo de y 1540), nem a menos de **70 px das laterais**. O still de conferência mostra a área marcada.

| Faixa (y) | O que vai |
|---|---|
| 232 a 280 | rótulo do topo ("{{rotulo}}"); na tela de app, o selo de passo |
| 300 a 560 | título (palavra por palavra, na hora em que é falada) |
| 600 a 1380 | peça principal da cena (caixas e setas, conta, colunas, janela) |
| 1400 a 1530 | legenda curta da cena |
| abaixo de 1540 | só fundo: caneta, bandeja da lousa, borda do quadro |

Texto longo quebra e encolhe dentro da área segura (título, rótulo, texto de caixa, assinatura). Letra de mão com acento nunca encosta na linha de cima: o kit dá folga de linha de 1,15 na Caveat.

## 8. Movimento

- **Traço que se desenha:** caixas, setas, risco e círculo se desenham em 0,4 a 0,6 s a partir da palavra; o texto da caixa se escreve da esquerda para a direita logo depois.
- **Post-it:** entra com um pop (cresce e assenta com leve rotação) e, quando a voz fala da tarefa, sobe, anda para a outra coluna e assenta de novo.
- **Tela:** a janela sobe do fundo; o cursor vai até o botão em 0,6 s e o clique cai na palavra, com a onda saindo do botão.
- **Corte entre cenas:** a cena nova entra com um deslize curto (0,25 s); nada de tremida, zoom forte ou glitch.
- **Ritmo:** algo novo a cada cerca de 1 s (palavra, caixa, seta, linha da conta, cartão).
- **Som:** cama leve por baixo, que abaixa quando a voz fala (`duck.json`); risco de caneta (ou de giz, na lousa), pop do post-it, deslize e clique, gerados por código (origem em `_ferramentas/sfx/ORIGEM.md`).

## 9. Peças

O modelo não tem expressões: o que se repete são as peças, em `componentes/pecas.tsx`, todas com o tema. Folha no still `elenco` (peças lado a lado).

| Peça | Quando usar |
|---|---|
| `Titulo` | título da cena; `*palavra*` no roteiro sai no destaque |
| `TextoMao` | texto que se escreve (letra de mão; na tela de app, Inter) |
| `Risco` | risco de destaque embaixo de uma palavra |
| `Caixa` | um passo: caixa tremida (quadro e lousa), post-it (post-its) ou cartão (tela de app), com ícone e texto |
| `Seta` | liga um passo ao próximo |
| `Circulo` | fecha no resultado |
| `Icone` | moeda, calendário, documento, relógio, gráfico, pessoa, check, alerta, etiqueta, lâmpada, carteira, porcento, casa, lista |
| `Colunas` e `Cartao` | quadro de colunas e o cartão que anda de uma para outra |
| `Janela`, `Cursor` e `Onda` | painel genérico (nunca a cara de um app real), o cursor e a onda do clique |
| `CardFinal` | assinatura, frase, marca, fontes e o aviso de narração por IA |

## 10. Voz

Caminho escolhido: {{voz.caminho}}. **Uma narração inteira, uma voz só**, gerada de uma vez a partir do roteiro aprovado (1 versão por vez, custo avisado antes). Um trecho que saiu errado se emenda (`_ferramentas/emendar.py`), sem gerar a narração de novo. Receita em `RECEITA.md`.

{{tabela_vozes}}

## 11. Pronúncias

<!-- ESCREVER: nomes, siglas, números e valores do assunto que a voz pode errar, e como devem soar, uma linha cada. A tabela completa fica em pronuncias.md, que o transcrever.py também lê. -->

## 12. Proibições

1. Número ou regra oficial sem a fonte na tela e no card final.
2. Janela de app com a cara, o nome ou o logo de um app real: só o painel genérico, com o endereço genérico ou o nome da marca da pessoa.
3. Ferramenta externa de imagem ou vídeo por IA; imagem baixada; texto fora da área segura.
4. Mais de uma cor de destaque na mesma tela; texto parado mais de 3 s sem nada novo.
5. Prometer resultado que depende da situação de cada um.

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo e a `RECEITA.md`; confira cada regra e número oficial numa fonte que dá para citar.
2. Escreva o roteiro (a narração inteira, em cenas) e aprove antes da voz; passe pela lista do que nunca acontece.
3. Crie `videos/AAAA-MM-DD-slug/`, copie `_ferramentas/episodio-base/src` e grave o `roteiro-falas.json` com as cenas e as palavras de cada batida.
4. Faça a prévia sem voz (`tempos_sem_voz.py` e `previa.sh`) antes de gastar crédito de voz.
5. Use as peças e as cenas de `componentes/`; nunca redesenhe uma peça dentro do vídeo.
