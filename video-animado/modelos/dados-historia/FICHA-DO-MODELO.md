# Dados e história (família com 4 temas)

**Para que serve:** reel narrado que mostra um resultado em número ou conta uma história no tempo, sem personagem. Uma narração inteira diz o dado ou a história; o número conta até o valor dito, cada coluna sobe na palavra do mês, cada marco entra no ano, a rota se desenha até o pino, o recorte cai na notícia e o círculo à mão fecha no detalhe. Funciona para resultado do mês ou do trimestre, relatório, case com número, história da marca, retrospectiva, entrega e expansão de loja, "de onde vem o produto" e curiosidade antiga.

**Público típico:** perfis de negócio, marca e conteúdo que querem mostrar número ou bastidor por vídeo, com o dado na tela e a fonte, sem gravar rosto nem tela.

**Família:** um modelo só com 4 temas, escolhidos na entrevista (pergunta 8). O tema troca o visual, não o roteiro: os mesmos tipos de cena valem nos quatro.

| Tema | Cara | O que a cor troca |
|---|---|---|
| **Mundo isométrico** (`isometrico`) | degradê escuro, piso em losango, colunas de 3 faces, cubos e moeda de enfeite, número grande no destaque | todas as cores |
| **Linha do tempo** (`linha-do-tempo`) | papel claro, título serifado, trilho com a linha que se desenha e cartões de marco, o último cheio | todas as cores |
| **Mapa com rota** (`mapa`) | mapa estilizado e genérico (rio, quarteirões, praças, árvores), rota pela rua, pino, chips de tempo e cartão do topo | todas as cores |
| **Recortes de jornal** (`jornal`) | cortiça, ano serifado grande, recortes girados com sombra, manchete, retícula, fitas e círculo à mão | só o destaque, as faixas e as etiquetas (cortiça, papel e retícula ficam) |

**Estrutura de episódio (30 a 60 s, uma narração):**
1. Abertura: o número ou a pergunta, já no primeiro segundo, com o número contando.
2. O dado: colunas subindo, uma por mês ou por unidade.
3. A história: marcos no ano, a rota até o pino ou os recortes caindo.
4. O detalhe: o círculo à mão no que importa, com a fonte do dado.
5. Pergunta e card final: assinatura, fontes e "Narração gerada por IA".

**O que vem pronto:**
- **Peças:** título por palavra, número que conta (milhar, vírgula, `%` e `R$`), coluna (de 3 faces, chapada ou impressa, conforme o tema), piso, cubo e moeda, marco com trilho, mapa genérico com rota, ponto de saída, pino e chip, recorte com manchete, retícula e fita, círculo à mão com palavra, card final.
- **Cenas montadas por dados:** abertura, colunas, marcos, rota, recortes e final. O roteiro diz o texto de cada cena e a palavra de cada batida; nenhum tempo é digitado à mão.
- **Ferramentas:** transcrição com o tempo de cada palavra, `timing.json` por batida, ducking da cama, emenda de trecho errado sem gerar a narração de novo, prévia sem voz, stills de conferência, efeitos e cama gerados por código (só numpy).
- **Fontes no kit:** Lora, Inter, JetBrains Mono e Caveat em arquivo (licença OFL), sem baixar nada na hora do render.
- **Receita:** roteiro em cenas aprovado antes da voz, uma voz com custo avisado antes, peça na palavra, todo número, ano e percentual de fora com fonte na tela, o número chegando ao valor dito, stills antes do render (`RECEITA.md`).

**Limites:** uma voz só. Não serve para diálogo nem para personagem (para isso, o chapado ou o traço fino), nem para caso investigativo (o dossiê), nem para passo a passo de processo (a Explicação). O mapa é sempre o desenho genérico do kit: nunca uma cidade real, um nome de rua ou de bairro de verdade. Nenhuma imagem de fora, nenhuma ferramenta externa de imagem ou vídeo por IA: tudo desenhado em código.
