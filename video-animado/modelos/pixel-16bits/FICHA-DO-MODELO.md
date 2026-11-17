# Pixel 16 bits

**Para que serve:** notícia curta (15 a 35 s) apresentada por um boneco pixel art 16 bits que fala. Uma narração inteira conta a notícia; o título entra por linha, um card branco mostra o que a voz está dizendo (lista que se marca, conversa em balões, selo carimbado, blocos com número) e a legenda corre em blocos de até 3 palavras. A boca do boneco mexe pelo som da voz. Funciona para notícia do nicho (tecnologia, saúde de pet, finanças do dia a dia, novidade de produto), "isso é verdade?" e "o que muda pra você".

**Público típico:** perfis de notícia e de explicação rápida que querem um rosto fixo e reconhecível sem gravar vídeo, com cara de jogo antigo e leitura fácil no celular.

**Visual:** fundo claro liso, topo com rótulo e assinatura do perfil, título em Inter ExtraBold com palavras de destaque, card branco com sombra, legenda numa tarja escura acima da cabeça e o boneco do peito para cima, embaixo. O boneco é desenhado por código a partir de um `aparencia.json`: tom de pele (8), cabelo (7 tipos, com careca, crespo, comprido e cacheado), cor do cabelo, barba (nenhuma, cheia, curta), óculos, cor da roupa e estampa no peito (">_", o símbolo da marca, a inicial ou nenhuma). 72 sprites por boneco: 9 bocas, olho aberto e fechado, 4 gestos.

**Estrutura de episódio (uma narração, 4 a 7 seções):**
1. Gancho com a notícia numa frase e o título já na tela.
2. O que é: o card mostra o fato.
3. O que muda para quem assiste.
4. O "mas": o limite, o cuidado, o que ainda não se sabe (selo carimbado, gesto de ombros).
5. Card final de perfil depois da voz: rosto do boneco, @, frase e "Seguir" virando "Seguindo".

**O que vem pronto:**
- **Gerador do boneco:** `gerador/personagem.py`, `sprites.py` (os 72 sprites) e `opcoes.py` (a folha de opções com os códigos), só com numpy e Pillow.
- **Template `PixelNoticia` montado por dados:** o roteiro diz as seções (texto falado, título em 2 linhas, palavras de destaque, gesto, card e a palavra em que cada coisa do card entra); nenhum tempo é digitado à mão.
- **Moldes de card:** lista, conversa, selo e blocos, mais o card final de perfil.
- **Bocas pelo som:** Rhubarb Lip Sync quando instalado (`_ferramentas/instalar_rhubarb.sh`, sem root, em `~/.video-animado/`); sem ele, pela força da voz.
- **Ferramentas:** transcrição com o tempo de cada palavra e a grafia do roteiro, prévia sem voz com boca sintética, efeitos e cama chiptune gerados por código (só numpy).
- **Receita:** roteiro curto em seções aprovado antes da voz, uma voz com custo avisado antes, stills de conferência antes do render (`RECEITA.md`).

**Limites:** um boneco só, sempre de frente (não anda, não vira de lado, não contracena). Sem cenário desenhado. Sem logo de empresa de terceiros: os cards usam o símbolo da marca do universo, letras e formas. Sem ferramenta externa de imagem ou vídeo por IA. Não serve para diálogo entre personagens (para isso, o chapado ou o traço fino) nem para investigação com fichas e fios (o dossiê).
