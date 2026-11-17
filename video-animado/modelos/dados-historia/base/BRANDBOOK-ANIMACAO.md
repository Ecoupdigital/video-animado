# {{universo.nome}}

Reel narrado, desenhado em código, no modelo "Dados e história": uma narração inteira mostra um resultado em número ou conta uma história no tempo, e o número que conta, a coluna que sobe, o marco que entra, a rota que se desenha, o recorte que cai e o círculo à mão entram na palavra falada. Sem personagem: quem conduz é a voz.

Criado em {{data}} a partir do modelo `dados-historia` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar nome, marca, tema, cores, rótulo ou card final, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Personagens:** nenhum. A narração conduz; o dado vira número e coluna, a história vira marco, rota ou recorte.
4. **Cenas:** abertura com o número grande, número com colunas, marcos da linha do tempo, rota no mapa, recortes de jornal e card final.
5. **Visual:** tema {{tema_nome}}, vertical 1080 x 1920, 30 fps, algo novo na tela a cada segundo.

## 2. Narrativa do universo

<!-- ESCREVER: que tipo de dado ou de história a série conta (de onde vêm os números, que pergunta cada vídeo responde) e 1 a 3 formatos de vídeo (o resultado do mês, a história da marca em 5 anos, o caminho do produto até o cliente, "você sabia que em 19xx..."). Frases completas, como gente fala. -->

**Estrutura do episódio (30 a 60 s, uma narração só):**
1. **Abertura (0 a 3 s):** o número ou a pergunta, já no primeiro segundo; o número conta enquanto a voz diz o valor.
2. **O dado:** as colunas sobem uma por vez, cada uma na palavra do mês ou da unidade.
3. **A história:** os marcos entram na palavra de cada ano; ou a rota se desenha até o pino; ou os recortes caem na palavra da notícia.
4. **O detalhe:** o círculo à mão marca o que importa (o número, o recorte, a pessoa).
5. **Card final (cerca de 3 s):** {{fecho_resumo}}

**Rótulo do topo:** "{{rotulo}}".

**Marca:** {{marca_resumo}}

## 3. Personagens

Este universo não usa personagem. Quem conduz o vídeo é a narração (uma voz só, o texto inteiro), e o dado ou a história aparece em peças desenhadas em código que entram na palavra falada: o número conta até o valor dito, a coluna sobe no mês, o marco entra no ano, a rota se desenha até o pino, o recorte cai na notícia e o círculo fecha no detalhe.

<!-- ESCREVER: o jeito de narrar (ritmo, como diz um número em voz alta, como apresenta um ano, como conta a virada da história, o que nunca diz). -->

## 4. Tema e cenas

**Tema deste universo: {{tema_nome}}.** {{tema_resumo}}

A família tem 4 temas. O tema troca o visual, não o roteiro: os mesmos tipos de cena valem nos quatro.

{{tabela_temas}}

As cenas estão em `componentes/cenas.tsx`, montadas pelos dados do roteiro de cada vídeo:

| Cena (`tipo`) | O que mostra | Peças |
|---|---|---|
| `abertura` | rótulo, título palavra por palavra, o número grande que conta e o círculo à mão em volta dele, subtítulo | `Titulo`, `Contador`, `Circulo` |
| `colunas` | o número grande e de 1 a 5 colunas que sobem, cada uma com o mês ou a unidade embaixo; a última no destaque | `Contador`, `Coluna` |
| `marcos` | o trilho com a linha que se desenha e de 2 a 5 marcos (ano e frase); o último cheio | `Marco` |
| `rota` | o mapa genérico, a rota que se desenha pela rua em 1 a 3 trechos, o ponto de saída, o pino, os chips de tempo e a chegada | `Saida`, `Pino`, `Chip` |
| `recortes` | o ano ou o título grande, de 1 a 3 recortes que caem com fita e o círculo à mão com uma palavra escrita | `Recorte`, `Fita`, `Circulo` |
| `final` | a pergunta, "comenta aqui" e o card final | `CardFinal` |

Os stills `cena-<tipo>-<tema>` do `_preview` mostram cada cena nos 4 temas, com a área segura marcada; `tema-<id>` é a capa de cada tema. O mapa é um desenho só, estilizado e genérico, igual em todo universo: nenhuma cidade real, nenhum nome de rua ou bairro. Só a rota (quantos trechos), os chips e a chegada mudam por vídeo.

## 5. Cores

**Tema {{tema_nome}}: {{tema_cor_troca}}.** Neste universo: {{cores_resumo}} Os tokens moram em `componentes/opcoes.json` (`paletas`, os mesmos papéis nos 4 temas, e `prontas`, 3 paletas prontas por tema) e os componentes pegam a cor pelo papel com `useTema()` (`T.c.destaque`, `T.a('linha', 0.3)`), nunca por hex fixo.

{{tabela_cores}}

**Destaque com parcimônia:** o número grande, a coluna do resultado, a linha e a rota que se desenham e o círculo à mão. Uma cor de destaque por tela.

## 6. Fontes

| Papel | Fonte | Para quê |
|---|---|---|
| serifada | **Lora** 700 | título e número grande da linha do tempo e do jornal, ano, manchete do recorte |
| texto | **Inter** 400, 600, 800 e 900 | título do isométrico e do mapa, número grande do isométrico e do mapa, cartões, legenda |
| mono | **JetBrains Mono** 500 | rótulo do topo, mês da coluna, letra miúda do card final |
| mão | **Caveat** 700 | a palavra escrita à mão dentro do círculo |

As fontes moram no kit, em `componentes/fontes/` (origem e licença em `fontes/ORIGEM.md` e `fontes/OFL.txt`): o vídeo sai igual com e sem internet. Tamanhos de referência (1080 de largura): título 76 a 116 px (encolhe sozinho com texto longo), número grande 170 a 230 px (encolhe para caber, com milhar, vírgula, `%` e `R$`), ano do marco 60 px, manchete 40 a 64 px, rótulo mono 26 a 30 px, letra miúda 22 px.

## 7. Grade da tela e textos

Área segura do Reels: nada importante nos **220 px do topo** nem nos **380 px de baixo** (abaixo de y 1540), nem a menos de **70 px das laterais**. O still de conferência mostra a área marcada.

| Faixa (y) | O que vai |
|---|---|
| 232 a 280 | rótulo do topo ("{{rotulo}}") |
| 300 a 620 | título (palavra por palavra, na hora em que é falada) e o número grande |
| 620 a 1390 | peça principal da cena (colunas, marcos, mapa com a rota, recortes) |
| 1408 a 1530 | legenda curta da cena e a fonte do dado |
| abaixo de 1540 | só fundo: piso, mapa, cortiça |

Texto longo quebra e encolhe dentro da área segura (título, rótulo, frase do marco, chip, manchete, assinatura). Número grande encolhe para caber na largura sem cortar. Serifada e letra de mão com acento nunca encostam na linha de cima: o kit dá folga de linha de 1,12 na Lora e 1,2 na Caveat.

## 8. Movimento

- **Número:** conta de zero até o valor em 0,7 s a partir da palavra marcada (a primeira palavra do número falado), com um tique a cada 0,1 s; número de um algarismo aparece já no valor.
- **Coluna:** sobe com mola curta na palavra do mês ou da unidade; a última, no destaque, ganha a moeda de enfeite no isométrico e o círculo à mão no jornal.
- **Marco:** o ponto cresce no trilho e o cartão entra deslizando; a linha desce até o marco aceso.
- **Rota:** cada trecho se desenha pela rua a partir da palavra; o pino cai e quica no fim; o chip de tempo aparece no fim do trecho.
- **Recorte:** cai girando de cima, assenta com sombra e a fita cola 0,3 s depois; o círculo à mão se desenha em 0,55 s e a palavra aparece dentro.
- **Corte entre cenas:** a cena nova entra com um deslize curto (0,25 s); no tema mapa, o mapa aparece inteiro só na cena de rota (nas outras, fica apagado por um véu para o texto ler).
- **Ritmo:** algo novo a cada cerca de 1 s.
- **Som:** cama leve por baixo, que abaixa quando a voz fala (`duck.json`); tique do contador, subida da coluna, pop do marco e do pino, risco da rota, papel caindo e risco de caneta do círculo, gerados por código (origem em `_ferramentas/sfx/ORIGEM.md`).

## 9. Peças

O modelo não tem expressões: o que se repete são as peças, em `componentes/pecas.tsx`, todas com o tema. Folha no still `elenco` (peças lado a lado).

| Peça | Quando usar |
|---|---|
| `Titulo` | título da cena; `*palavra*` no roteiro sai no destaque |
| `Contador` | número grande que conta até o valor (`numero`, `prefixo`, `sufixo`, `casas`) |
| `Coluna` | coluna de 3 faces no isométrico, barra chapada na linha do tempo e no mapa, barra impressa no jornal |
| `Piso`, `Bloco`, `Moeda` | piso em losango, cubo de enfeite e moeda (isométrico) |
| `Marco` | ponto no trilho e cartão com o ano e a frase; o último cheio |
| `Saida`, `Pino`, `Chip` | ponto de saída da rota, pino de chegada e chip de tempo |
| `Recorte` e `Fita` | papel com manchete, retícula e linhas de texto, que cai e assenta com fita |
| `Circulo` | círculo de destaque à mão, com uma palavra escrita dentro (opcional) |
| `CardFinal` | assinatura, frase, marca, fontes e o aviso de narração por IA |

## 10. Voz

Caminho escolhido: {{voz.caminho}}. **Uma narração inteira, uma voz só**, gerada de uma vez a partir do roteiro aprovado (1 versão por vez, custo avisado antes). Um trecho que saiu errado se emenda (`_ferramentas/emendar.py`), sem gerar a narração de novo. Receita em `RECEITA.md`.

{{tabela_vozes}}

## 11. Pronúncias

<!-- ESCREVER: nomes, siglas, números, anos e valores do assunto que a voz pode errar, e como devem soar, uma linha cada. A tabela completa fica em pronuncias.md, que o transcrever.py também lê. -->

## 12. Proibições

1. Número, ano ou percentual que vem de fora sem a fonte na tela (legenda) e no card final.
2. Mapa de cidade real reconhecível, nome de rua ou de bairro de verdade: só o mapa genérico do kit.
3. Ferramenta externa de imagem ou vídeo por IA; imagem baixada; texto fora da área segura.
4. Número que conta para um valor diferente do que a voz diz; coluna fora de escala (as alturas saem dos valores).
5. Mais de uma cor de destaque na mesma tela; texto parado mais de 3 s sem nada novo.

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo e a `RECEITA.md`; confira cada número, ano e percentual numa fonte que dá para citar.
2. Escreva o roteiro (a narração inteira, em cenas) e aprove antes da voz; passe pela lista do que nunca acontece.
3. Crie `videos/AAAA-MM-DD-slug/`, copie `_ferramentas/episodio-base/src` e grave o `roteiro-falas.json` com as cenas e as palavras de cada batida.
4. Faça a prévia sem voz (`tempos_sem_voz.py` e `previa.sh`) antes de gastar crédito de voz.
5. Use as peças e as cenas de `componentes/`; nunca redesenhe uma peça dentro do vídeo.
