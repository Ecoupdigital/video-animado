# Dossiê investigativo

**Para que serve:** reel narrado de caso ou notícia, sem personagem. Uma narração inteira conta o que aconteceu, quem está envolvido, como as partes se ligam e o que isso quer dizer; o texto cinético entra em cada palavra falada, e fichas, carimbos, fios, rotas, gráficos e linhas do tempo entram na palavra marcada do roteiro. Funciona para notícia de mercado, caso de bairro ou de condomínio, investigação de produto, história de empresa, "o que ninguém te contou sobre...".

**Público típico:** perfis de notícia, análise e bastidor, que querem prender nos 3 primeiros segundos com um fato forte e segurar com algo novo na tela a cada segundo. A pergunta do fim puxa comentário.

**Visual:** sem personagem e sem foto: quem é citado aparece em polaroid com silhueta. Fundo vivo (holofote, pontilhado, partículas, documentos passando), câmera viva com zoom, blur e glitch no corte, punch e tremida nos golpes, faixa de manchetes rolando. Três temas trocáveis pelas respostas: **investigativo escuro** (o original), **jornal claro** (papel de jornal, manchete serifada) e **neutro de marca** (destaque na cor da marca); cada cor e cada fonte trocáveis por papel. Vertical 1080 x 1920, ritmo rápido.

**Estrutura de episódio (40 a 75 s, uma narração):**
1. Gancho nos 3 primeiros segundos: o fato mais forte, com um número que conta ou um carimbo.
2. Quem e o quê: ficha com silhueta, cards de dado, marcos de data.
3. A ligação: fio entre as partes, rota do dinheiro ou do produto, linha do tempo.
4. O impacto: gráfico caindo, número grande, com a fonte na tela.
5. A leitura, em linguagem de suspeita ("segundo a reportagem", "X nega").
6. Pergunta e card final: assinatura, fontes, "Narração gerada por IA" e, quando cita pessoas, "suspeitas reportadas, sem acusação formal".

**O que vem pronto:**
- **Peças:** texto cinético por palavra, carimbo, selo, card, contador, traço que se desenha, polaroid com silhueta, fio vermelho com pulsos, nó de rota, gráfico caindo, linha do tempo, cartão de fonte, card final, faixa de manchetes.
- **Cenas montadas por dados:** gancho, ficha, ligação, rota, tombo, linha do tempo, fonte e final. O roteiro diz o texto de cada cena e a palavra de cada batida; nenhum tempo é digitado à mão.
- **Ferramentas:** transcrição com o tempo de cada palavra, `timing.json` por batida, ducking da cama de suspense, emenda de trecho errado sem gerar a narração de novo, prévia sem voz, stills de conferência, efeitos e cama gerados por código (só numpy).
- **Receita:** apuração com fato separado de alegação, roteiro aprovado antes da voz, uma voz com custo avisado antes, texto cinético na palavra falada, stills antes do render (`RECEITA.md`).

**Limites:** nenhuma foto de pessoa real no kit: foto só a que a própria pessoa fornece e pode usar (silhueta até lá); nunca baixar nem gerar rosto. Uma voz só. Não serve para diálogo nem para personagem (para isso, o chapado ou o traço fino). Sem ferramenta externa de imagem ou vídeo por IA. Não afirma culpa: o modelo foi feito para mostrar fato com fonte e marcar suspeita como suspeita.
