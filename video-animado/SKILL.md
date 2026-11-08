---
name: video-animado
description: Cria vídeos narrados com animação 2D, tudo em código no Remotion e sem ferramenta externa de vídeo. Serve para qualquer pessoa. Primeiro procura um brandbook de animação (um "universo" com personagens, cenários e narrativa); se não existir, conduz uma entrevista detalhada, uma pergunta por vez com opções recomendadas, e gera o brandbook em HTML mais a ficha de cada personagem. Depois usa esse brandbook como referência para escrever o roteiro, gerar a narração e montar o vídeo animado. Pode ter nenhum, um ou vários personagens. Use SEMPRE que a pessoa pedir vídeo animado, vídeo narrado com animação, avatar 2D, personagem animado, brandbook de animação, universo de personagens, "módulo 7" do curso, ou "faz um vídeo com o desenho/boneco falando", mesmo sem citar a skill.
---

# /video-animado

Faz vídeo narrado com animação 2D **desenhada em código (SVG + Remotion)**. Regra que não se quebra: **nenhuma ferramenta externa de imagem ou vídeo por IA** (nada de Kling, Veo, Flow, Magnific, geradores de imagem). Personagem, cenário e objetos nascem de formas, caminhos SVG e texto. Isso mantém o personagem idêntico em toda cena e o processo copiável.

Estado: criada em 08/11/2026, **ainda não testada de ponta a ponta**. Na primeira execução real, anote em "Armadilhas" o que quebrar.

## Como falar com a pessoa

- Português do Brasil, tom de professor prático, tratamento "tu" se a pessoa usa "tu", senão "você". Sem travessão.
- A pessoa pode não ser técnica. Diga o que aconteceu e o que muda pra ela. Código e caminhos só se ela pedir.
- Toda pergunta usa AskUserQuestion, **uma por vez**, com 2 a 4 opções, a recomendada primeiro e marcada "(Recomendado)". Quando a pessoa disser "decide por mim", "tanto faz" ou algo parecido, escolha a recomendada e siga, dizendo o que escolheu.
- Nunca pergunte o que dá pra descobrir olhando os arquivos.

## Onde as coisas vivem

- **Estúdio:** a pasta de trabalho de vídeo da pessoa. Procure `~/meu-estudio/`; se não existir, pergunte onde fica, ou use a pasta atual.
- **Brandbooks de animação:** `<estúdio>/animacao/<nome-do-universo>/`
  - `BRANDBOOK-ANIMACAO.html`: versão bonita, pra ver e compartilhar
  - `BRANDBOOK-ANIMACAO.md`: a versão que o Claude lê (mesmas regras; **se uma mudar, muda nas duas**)
  - `personagens/<nome>/`: `FICHA.md`, `Personagem.tsx` (o desenho em código) e `expressoes.png`
  - `cenarios/`: um componente por cenário (`Casa.tsx`, `Rua.tsx`…)
  - `pronuncias.md` (opcional): como cada termo deve soar na voz e aparecer na legenda
- **Vídeos:** `<estúdio>/animacao/<nome-do-universo>/videos/AAAA-MM-DD-slug/`
- **Entrega:** `~/Downloads/AAAA-MM-DD_<slug>_animado.mp4`

Um brandbook é um **universo** (um "mundo" com nome próprio). Dentro dele há 0, 1 ou vários personagens.

## Fluxo

### 0. Achar o brandbook

Procure sozinha: pasta `animacao/` no estúdio e na pasta atual, e arquivos `BRANDBOOK-ANIMACAO.*`. Liste o que achou e pergunte:
- **Usar um destes** (um por universo achado)
- **Apontar outro caminho** (inclusive um brandbook recebido de outra pessoa)
- **Criar um novo**

Se não achar nada, diga isso e vá direto pra criar. Se usar um existente, leia o `.md` e as fichas e pule pra Parte B.

### Parte A. Criar o brandbook (primeira vez)

Avise no começo: "vou fazer umas 25 a 35 perguntas, uma por vez, e em qualquer uma tu pode dizer 'decide por mim'". Entre os blocos, faça um resumo curto do que ficou decidido e pergunte se está certo. Banco de perguntas e opções em `references/perguntas.md` (leia antes de começar).

Os 7 blocos, nesta ordem:
1. **Universo:** nome (sugira 3 nomes), assunto dos vídeos, público, tom.
2. **Personagens:** quantos (0, 1 ou vários). Para cada um, a ficha completa (gênero, idade, rosto, cabelo, roupa, personalidade, acompanhantes como cachorro, bebê ou planta, voz).
3. **Cenários:** quais existem (casa, escritório, rua, natureza, espaço abstrato…), quais cômodos ou lugares, hora do dia, objetos fixos.
4. **Narrativa:** o que cada personagem faz, como se comporta, onde frequenta, como fala, o que nunca faria, como os personagens se relacionam.
5. **Visual:** estilo do desenho possível em código, paleta (hex exatos com proporção de uso), fontes, nível de detalhe.
6. **Movimento:** entrada e saída de cena, expressões, ritmo, respiração e piscar, regras de animação, o que nunca fazer.
7. **Fechamento:** resumo geral, voz da narração (ver abaixo), nome final do brandbook.

**Sem personagem** também vale: vídeo só de cenários, texto e formas. Nesse caso pule o bloco 2 e os blocos 3 a 6 falam só do mundo e do ritmo.

**Voz da narração**, salva no brandbook para não perguntar de novo, com 3 caminhos:
1. voz clonada da pessoa no ElevenLabs;
2. voz pronta do ElevenLabs, que a skill sugere conforme o personagem;
3. a pessoa já tem o áudio gravado e a skill só usa.
Com vários personagens, cada ficha guarda a voz do personagem.

**Entregas da Parte A:**
- `BRANDBOOK-ANIMACAO.md` e `BRANDBOOK-ANIMACAO.html` (estrutura em `references/brandbook-html.md`).
- Para cada personagem: `FICHA.md`, `Personagem.tsx` com propriedades `expressao`, `falando`, `olhando`, `escala` (a boca acompanha o volume da narração) e `expressoes.png`, uma imagem com todas as expressões lado a lado.
- Um componente por cenário.
- Uma imagem de teste com o personagem dentro de um cenário.

**Só siga quando a pessoa aprovar de olho** as expressões e a imagem de teste. Se o desenho em código não sair bom, simplifique o desenho (menos detalhe, mais forma). Nunca troque por ferramenta externa.

### Parte B. Fazer o vídeo

1. **Pergunta única** (só o que faltar): tema, duração (30 a 60 s por padrão), formato (vertical 1080x1920 por padrão, 30 fps), quais personagens e cenários entram.
2. **Roteiro pra ser OUVIDO.** Frases curtas, número escrito como se fala, sem parênteses nem sigla difícil. Do lado de cada frase: a cena, quem aparece, a expressão e o que surge na tela. Respeite a narrativa do brandbook. Salve em `videos/<data-slug>/roteiro.md` e **só siga com a aprovação da pessoa**.
3. **Narração**, pelo caminho de voz salvo no brandbook. Mostre o áudio e espere aprovação. Frase estranha: gere de novo só aquela frase. Use o `pronuncias.md` se existir. Salve `narracao.mp3`.
4. **Tempo de cada palavra.** Transcreva a narração com timestamps por palavra (a ferramenta de transcrição que o estúdio já tem, a do curso de edição: mlx-whisper no Mac). Corrija erros típicos do Whisper em nomes de produtos e termos técnicos. Se a pessoa não tiver transcritor instalado, diga e ajude a instalar antes de seguir.
5. **Projeto Remotion** em `videos/<data-slug>/` (use a skill `remotion-best-practices`). Um áudio de fundo (`narracao.mp3`). Cada cena importa os componentes do brandbook, **nunca redesenha** personagem ou cenário. Boca: extraia o volume do áudio por frame e use como `falando`, com um piso pra não tremer no silêncio. Cada elemento nasce na palavra que o cita. Legenda palavra por palavra no estilo do brandbook. Hooks do React nunca dentro de `if` ou depois de `return` antecipado.
6. **Conferir antes de renderizar.** `npx tsc --noEmit`, depois um frame de cada cena. Olhe a imagem: personagem inteiro e igual à ficha, texto sem sobrepor nem estourar a largura, expressão e cena certas no tempo certo. Mostre os frames à pessoa.
7. **Renderizar e entregar.** mp4 (H.264, áudio AAC) em `~/Downloads/`. Gere um contact sheet e olhe. Diga o que tem em cada cena, a duração, o que ela deve conferir de ouvido (você não ouve áudio) e onde está o projeto.
8. **Ajustes.** A pessoa pede em palavras comuns ("o boneco tá sério demais", "aparece mais rápido"). Se a regra vale pros próximos vídeos, atualize o brandbook (as duas versões); se vale só pra este, o projeto.

### Sugestão de nome

Sempre que o brandbook for criado, sugira 3 nomes de universo (curtos, fáceis de falar) e deixe a pessoa escolher ou digitar outro. O nome vira o nome da pasta (kebab-case) e o título do HTML.

## Armadilhas

- Personagem fora do brandbook: toda cena importa o mesmo componente.
- Boca mexendo sem fala, ou parada com fala: sincronizar pela amplitude, com piso.
- Ferramenta externa por preguiça: se o desenho não sai, simplifique.
- Gastar crédito de voz sem o roteiro aprovado.
- Salvar o brandbook só em HTML: o Claude lê o `.md`, mantenha os dois iguais.
- (Preencher na primeira execução real.)
