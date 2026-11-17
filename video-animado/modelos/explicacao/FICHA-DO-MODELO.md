# Explicação (família com 4 temas)

**Para que serve:** reel narrado que explica um processo, uma conta ou uma rotina, sem personagem. Uma narração inteira conta o passo a passo; cada caixa se desenha, cada seta liga, o resultado ganha o círculo, o post-it anda de coluna e o cursor clica no botão na palavra falada. Funciona para aula rápida, consultoria, serviço B2B, tutorial de ferramenta, planejamento e "como fazer a conta de...".

**Público típico:** perfis de educação, serviço e bastidor, que querem ensinar uma coisa por vídeo com a conta ou o passo na tela, sem gravar rosto nem tela.

**Família:** um modelo só com 4 temas, escolhidos na entrevista (pergunta 8). O tema troca o visual, não o roteiro: os mesmos tipos de cena valem nos quatro.

| Tema | Cara | O que a cor troca |
|---|---|---|
| **Quadro de explicação** (`quadro`) | papel quadriculado, traço preto de caneta e um destaque, caneta no canto | todas as cores |
| **Lousa de giz** (`lousa`) | lousa com textura e manchas de giz, moldura de madeira, bandeja com giz e apagador | só a cor da lousa e o giz de destaque |
| **Quadro de post-its** (`post-its`) | quadro branco com colunas e post-its coloridos com sombra e leve rotação | todas as cores |
| **Tela de app** (`tela-app`) | fundo em degradê, selo de passo, janela de painel genérica com menu lateral e cursor | todas as cores |

**Estrutura de episódio (30 a 60 s, uma narração):**
1. Abertura: a pergunta ou a promessa escrita à mão, já no primeiro segundo.
2. O caminho: passos em caixas ligadas por setas.
3. A conta ou o exemplo: conta linha a linha com o resultado circulado, tarefas andando de coluna ou a tela com o clique.
4. O cuidado: o erro comum ou a regra oficial, com a fonte.
5. Pergunta e card final: assinatura, fontes e "Narração gerada por IA".

**O que vem pronto:**
- **Peças:** título à mão por palavra, texto que se escreve, risco de destaque, caixa que se desenha (post-it ou cartão, conforme o tema), seta, círculo de destaque, 14 ícones desenhados em código, colunas com cartão que anda, janela de app genérica com cursor e onda do clique, card final.
- **Cenas montadas por dados:** abertura, passos, conta, colunas, tela e final. O roteiro diz o texto de cada cena e a palavra de cada batida; nenhum tempo é digitado à mão.
- **Ferramentas:** transcrição com o tempo de cada palavra, `timing.json` por batida, ducking da cama, emenda de trecho errado sem gerar a narração de novo, prévia sem voz, stills de conferência, efeitos e cama gerados por código (só numpy).
- **Fontes no kit:** Caveat, Inter e JetBrains Mono em arquivo (licença OFL), sem baixar nada na hora do render.
- **Receita:** roteiro em cenas aprovado antes da voz, uma voz com custo avisado antes, peça na palavra, número e regra com fonte, stills antes do render (`RECEITA.md`).

**Limites:** uma voz só. Não serve para diálogo nem para personagem (para isso, o chapado ou o traço fino) nem para caso investigativo (o dossiê). A janela de app é sempre um painel genérico: nunca imita a cara de um app real. Nenhuma imagem de fora, nenhuma ferramenta externa de imagem ou vídeo por IA: tudo desenhado em código.
