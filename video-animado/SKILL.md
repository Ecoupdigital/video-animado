---
name: video-animado
description: Cria vídeos narrados com animação 2D, tudo em código no Remotion e sem ferramenta externa de vídeo. Serve para qualquer pessoa. Primeiro procura um brandbook de animação (um "universo" com personagens, cenários e narrativa); se não existir, abre um catálogo de modelos prontos (a pessoa escolhe um modelo e responde uma entrevista curta de 8 a 12 perguntas) ou, em "Criar um estilo novo", conduz uma entrevista detalhada, uma pergunta por vez com opções recomendadas, e gera o brandbook em HTML mais a ficha de cada personagem. Depois usa esse brandbook como referência para escrever o roteiro, gerar a narração e montar o vídeo animado. Pode ter nenhum, um ou vários personagens. Use SEMPRE que a pessoa pedir vídeo animado, vídeo narrado com animação, avatar 2D, personagem animado, brandbook de animação, universo de personagens, catálogo de modelos de animação, "módulo 7" do curso, ou "faz um vídeo com o desenho/boneco falando", mesmo sem citar a skill.
---

# /video-animado

Faz vídeo narrado com animação 2D **desenhada em código (SVG + Remotion)**. Regra que não se quebra: **nenhuma ferramenta externa de imagem ou vídeo por IA** (nada de Kling, Veo, Flow, Magnific, geradores de imagem). Personagem, cenário e objetos nascem de formas, caminhos SVG e texto. Isso mantém o personagem idêntico em toda cena e o processo copiável.

Estado: criada em 08/11/2026. Partes A e B testadas de verdade em 08 e 09/11/2026 (universo Nina Pesquisou, Ciclua, episódios 1 a 5, os eps. 2 a 5 feitos em lote). Continue anotando em "Armadilhas" o que quebrar.

Desde 16/11/2026: catálogo de modelos prontos com entrevista curta, e estilo novo salvo como modelo local da pessoa. A Parte B não mudou.

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

- **Modelos locais e catálogo:** `<estúdio>/modelos/<id>/` (estilos salvos pela pessoa, no mesmo formato dos modelos da skill em `modelos/`) e `<estúdio>/modelos/catalogo.html`.
- Universo que nasceu de um modelo tem também, na raiz, `respostas.json` (as respostas da entrevista curta) e `RECEITA.md` (a receita de vídeo do modelo).

Um brandbook é um **universo** (um "mundo" com nome próprio). Dentro dele há 0, 1 ou vários personagens.

## Fluxo

### 0. Achar o brandbook

Procure sozinha: pasta `animacao/` no estúdio e na pasta atual, e arquivos `BRANDBOOK-ANIMACAO.*`. Liste o que achou e pergunte:
- **Usar um destes** (um por universo achado)
- **Apontar outro caminho** (inclusive um brandbook recebido de outra pessoa)
- **Criar um novo**

Se não achar nada, diga isso e vá direto pra criar. Se usar um existente, leia o `.md` e as fichas e pule pra Parte B.

**Criar um novo** começa pelo catálogo de modelos (passo 1 abaixo).

**Universo que já tem episódios:** antes de propor tema, olhe `videos/` (o `roteiro.md` do último episódio e quantos já existem) e as peças prontas em `componentes/` e `_ferramentas/`. Assim a sessão nova mantém a continuidade sem a pessoa explicar: número do próximo episódio, fase em que o personagem está (ex.: barriga que cresce), regra de frequência do produto (ex.: 3 pra 1), ganchos prometidos ("Parte 2 amanhã") e temas já usados. Se o universo é de uma marca, procure também a nota do projeto (no vault do Jonathan: `01-projetos/<marca>/social/<universo>/overview.md`, com a tabela de episódios e as pendências).

### 1. Catálogo de modelos (universo novo)

Gere o catálogo com `node scripts/catalogo.mjs --estudio <estúdio>`. No Mac, abra o HTML para a pessoa; no Linux, acrescente `--png <arquivo>` e mostre a imagem. Ele junta os modelos da skill, os modelos locais da pessoa (selo "seu modelo") e o cartão "Criar um estilo novo". Faça a **pergunta única**: até 3 modelos, o recomendado primeiro e o modelo local com preferência, mais "Criar um estilo novo"; qualquer outro modelo entra pelo número do catálogo. Como abrir, mostrar e montar a pergunta: `references/catalogo.md`.

- **Modelo escolhido:** siga "Modelo do catálogo", logo abaixo.
- **Criar um estilo novo:** Parte A (entrevista completa).

### Modelo do catálogo

1. **Nome e cópia.** Faça a pergunta 1 da entrevista curta (nome, com 3 sugestões) e copie o modelo para a pasta do nome: `node scripts/novo_universo.mjs <id> <estúdio> <pasta>`, depois `bash scripts/preparar_motor.sh <universo>` (as folhas das perguntas seguintes saem do `_preview` do universo).
2. **Entrevista curta**, de 8 a 12 perguntas, uma por vez: `references/entrevista-curta.md` e o `PERGUNTAS.md` do modelo. Grave as respostas em `<universo>/respostas.json`.
3. **Aplicar:** `node scripts/novo_universo.mjs --aplicar <universo>`. Resposta recusada volta à pergunta indicada, com o motivo.
4. **Lacunas:** redija as marcas `ESCREVER` do `BRANDBOOK-ANIMACAO.md` que o script listar e confira com `--conferir`.
5. **Folhas:** `npx tsc --noEmit` e `node _preview/gerar-html.mjs --stills` na raiz do universo (expressões, cenários, imagens de teste e o HTML do brandbook).
6. **Aprovação de olho** das expressões e das imagens de teste, como na Parte A. Depois, Parte B, seguindo a `RECEITA.md` do universo.

Para mudar uma resposta depois, edite o `respostas.json` e rode `--aplicar` de novo: o texto já escrito nas lacunas fica.

### Parte A. Criar o brandbook (primeira vez)

É o caminho **Criar um estilo novo** do catálogo. No fim, depois da aprovação de olho, ofereça salvar o estilo como modelo local da pessoa (`node scripts/salvar_modelo.mjs <universo> <estúdio> <id>`; quando e como em `references/modelo-local.md`).

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

**Clipe piloto antes de tudo o mais.** Imagem parada não mostra ritmo, voz nem movimento, e a pessoa só descobre o que não gosta quando vê o vídeo andando. Com 1 personagem e 1 ou 2 cenários prontos, monte um clipe de 8 a 10 s com voz, movimento, cortes, legenda e som, dentro da Regra de dinamismo, e mostre. Só depois do piloto aprovado desenhe o resto (outros cenários, elenco de apoio, brandbook completo). Diga antes quantos caracteres de voz o piloto gasta.

**Só siga quando a pessoa aprovar de olho** as expressões e a imagem de teste. Se o desenho em código não sair bom, simplifique o desenho (menos detalhe, mais forma). Nunca troque por ferramenta externa.

### Parte B. Fazer o vídeo

**Receita do modelo.** Universo com `RECEITA.md` na raiz (nasceu de um modelo do catálogo) segue a receita do modelo, que detalha estes passos para ele. Sem `RECEITA.md` (universos de antes do catálogo, criados pela Parte A), siga os passos abaixo como sempre.

1. **Pergunta única** (só o que faltar): tema, duração (30 a 60 s por padrão), formato (vertical 1080x1920 por padrão, 30 fps), quais personagens e cenários entram.
2. **Gancho e roteiro pra ser OUVIDO** (leia `references/roteiro.md`). Primeiro 3 opções de gancho de tipos diferentes, a pessoa escolhe. Depois o roteiro: frases curtas, número escrito como se fala, sem parênteses nem sigla difícil, sem as frases proibidas da lista. Do lado de cada frase: a cena, quem aparece, a expressão e o que surge na tela. Respeite a narrativa do brandbook. Ao final, liste à parte as afirmações de fato que a pessoa precisa confirmar. Salve em `videos/<data-slug>/roteiro.md` e **só siga com a aprovação da pessoa**.
   - **Ação e corte em cada fala.** Do lado de cada frase, escreva também o que o personagem FAZ (verbo de ação dentro de um cenário) e quantos planos a frase tem. Fala com mais de 3 s precisa de dois planos ou mais (ver Regra de dinamismo).
   - **Série:** abertura fixa e fecho fixo do brandbook entram com as palavras da pessoa, sem resumir. Antes de pedir a aprovação, releia o que ela disse na conversa sobre o formato e confira se o roteiro tem cada ponto.
3. **Narração**, pelo caminho de voz salvo no brandbook. Mostre o áudio e espere aprovação. Frase estranha: gere de novo só aquela frase. Use o `pronuncias.md` se existir. Salve `narracao.mp3`.
4. **Tempo de cada palavra.** Transcreva a narração com timestamps por palavra (a ferramenta de transcrição que o estúdio já tem, a do curso de edição: mlx-whisper no Mac). Corrija erros típicos do Whisper em nomes de produtos e termos técnicos. Se a pessoa não tiver transcritor instalado, diga e ajude a instalar antes de seguir.
5. **Projeto Remotion** em `videos/<data-slug>/` (use a skill `remotion-best-practices`). Um áudio de fundo (`narracao.mp3`). Cada cena importa os componentes do brandbook, **nunca redesenha** personagem ou cenário. Boca: extraia o volume do áudio por frame e use como `falando`, com um piso pra não tremer no silêncio. Cada elemento nasce na palavra que o cita. Legenda palavra por palavra no estilo do brandbook. Hooks do React nunca dentro de `if` ou depois de `return` antecipado.
6. **Conferir antes de renderizar.** `npx tsc --noEmit`, depois um frame de cada cena. Olhe a imagem: personagem inteiro e igual à ficha, texto sem sobrepor nem estourar a largura, dentro da área segura, boca batendo com a voz, expressão e cena certas no tempo certo. Detalhes em `references/conferencias.md`.
7. **Renderizar, conferir e entregar.** mp4 (H.264, áudio AAC) em `~/Downloads/`. Rode `scripts/checar_video.py` (volume, tamanho, silêncio), gere um contact sheet e chame o **revisor independente** (subagente que não viu a montagem, briefing em `references/conferencias.md`). Corrija o que for grave ou médio e renderize de novo. Entregue também a capa e a legenda do post, e ofereça os formatos 1:1 e 16:9 (`references/roteiro.md`). Diga o que tem em cada cena, a duração, o que o revisor achou e o que mudou, o que ela deve conferir de ouvido (você não ouve áudio) e onde está o projeto.
   - **Dinamismo:** rode `scripts/checar_dinamismo.py` no mp4 antes de chamar o revisor. Reprovado não vai para a pessoa: acrescente planos nos trechos apontados e renderize de novo.
   - **Fechar o aprendizado:** quando a pessoa aprovar o primeiro vídeo de um universo (ou aprovar depois de várias correções), antes de encerrar atualize o brandbook nas duas versões e a ficha com o que foi aprovado de fato, e escreva ou atualize o `RECEITA.md` na raiz do universo: o que foi reprovado e com que palavras, a estrutura do roteiro, a voz, o ritmo, o som, os comandos e a pasta do vídeo modelo a copiar. Sem isso o próximo vídeo sai do brandbook velho e repete os erros.
8. **Ajustes.** A pessoa pede em palavras comuns ("o boneco tá sério demais", "aparece mais rápido") ou pelo tempo ("muda o título em 0:12"). Converta tempo em frame, mexa só na cena afetada e mostre o trecho antes de renderizar tudo. Se a regra vale pros próximos vídeos, atualize o brandbook (as duas versões); se vale só pra este, o projeto.

## Regra de dinamismo (vale para todo vídeo, de qualquer universo)

O erro que mais custa retrabalho é entregar vídeo lento e parado. Quem assiste vive na era dos cortes: se a imagem não muda, a pessoa passa. Estas metas valem do clipe piloto ao vídeo final, e o `scripts/checar_dinamismo.py <video.mp4> [palavras.json]` mede as quatro primeiras no mp4 pronto (sai reprovado se alguma falhar):

1. **Nenhum trecho com mais de 3 s sem corte.** Corte é troca de plano, de cenário ou de enquadramento (aberto para fechado, personagem para objeto, frente para lado). Zoom lento no mesmo plano não conta.
2. **Média de até 2,5 s por plano.** Um vídeo de 35 s tem pelo menos 14 planos.
3. **Primeiro corte até os 2 s** e algo se mexendo já no primeiro frame. Nada de abertura contemplativa.
4. **Fala a partir de 2,6 palavras por segundo.** Voz lenta: acelere a narração (`atempo` de 1,08 a 1,15) e encurte as pausas entre falas para 0,2 a 0,3 s.
5. **O personagem sempre faz alguma coisa** dentro de um cenário: anda, pega, abre, corre, cai. Personagem parado de frente só em corte curto de reação, de até 2 s.
6. **A cada fala entra algo novo na tela** (objeto, texto grande, outro lugar) e a câmera nunca fica imóvel (aproxima, acompanha, treme no susto).
7. **Som marca o corte:** efeito curto na troca de plano e trilha que muda de clima com a história (`scripts/trilha.py`, trilha de suspense por trechos de clima, feita em código). Silêncio só de propósito, antes de um susto.
8. **Rápido demais também reprova.** Corte existe para a história andar, não para bater meta. Plano dura pelo menos 1,2 s (só o clarão de um susto pode ser menor), a média não desce de 1,6 s por plano e a história continua dentro do cenário: objeto citado numa palavra entra como adesivo por cima da cena, sem trocar a tela inteira. Tela cheia de objeto só quando ele é o assunto da fala inteira, e fica até a fala acabar. O `checar_dinamismo.py` reprova mais de 2 planos com menos de 1 s e média abaixo de 1,6 s.

Cena longa no mesmo lugar (o personagem atravessa a casa, por exemplo) se resolve com planos encaixados: detalhe da mão, do objeto, do rosto, e volta. Medido no 100 Dias no Escuro (18/11/2026): a primeira versão, reprovada como "lenta e estática", tinha 2 cortes em 45 s; a versão aceita tinha 13 em 36 s e ainda deixava 8,7 s seguidos na mesma sala.

### Sugestão de nome

Sempre que o brandbook for criado, sugira 3 nomes de universo (curtos, fáceis de falar) e deixe a pessoa escolher ou digitar outro. O nome vira o nome da pasta (kebab-case) e o título do HTML.

## Armadilhas

- Personagem fora do brandbook: toda cena importa o mesmo componente.
- Boca mexendo sem fala, ou parada com fala: sincronizar pela amplitude, com piso.
- Ferramenta externa por preguiça: se o desenho não sai, simplifique.
- Gastar crédito de voz sem o roteiro aprovado. Antes de gerar a narração, diga quantos caracteres vão para a voz e espere o sim.
- Entregar sem passar pelo revisor independente: quem montou não enxerga os próprios erros.
- Salvar o brandbook só em HTML: o Claude lê o `.md`, mantenha os dois iguais.
- Mão encostada no rosto some (mesma cor da pele): dê contorno à mão com o tom de sombra da pele e desenhe o braço depois da cabeça.
- Fios soltos de cabelo saindo do topo viram "antenas": fio solto curto e colado na forma.
- Elenco com traço único: faça uma base comum (rosto, braços, piscar, respirar) e cada personagem vira configuração dela. Muito mais rápido e consistente.
- Imagem parada renderiza o frame 0: tudo que entra com mola some. Nas folhas de referência passe início negativo ou uma prop `parada`.
- Legenda colocada embaixo cai na área dos botões do Instagram: defina a grade da tela (título, fonte, legenda, personagens) já na Parte A, no brandbook.
- Noite com retângulo escuro por cima deixa a cena "suja": use cor azulada com `mixBlendMode: multiply` no cenário e filtro de brilho no personagem.
- Brandbook: gere o HTML a partir do `.md` por script (marked + `sips` para comprimir as imagens em JPEG embutido), assim os dois nunca divergem.
- Instale o Remotion uma vez na raiz do universo; os vídeos em `videos/` usam o mesmo `node_modules` (o disco do Mac vive cheio).
- No zsh, comando guardado em variável não se divide em palavras: use função para repetir `npx remotion still`.
- Parte B, transcritor: no Mac do Jonathan o mlx-whisper não está no PATH; ele vive em `~/.cache/editar-reel/venv/bin/python` (modelo `mlx-community/whisper-large-v3-turbo`). Corrija "para" → "pra" e nomes na legenda.
- Parte B, várias vozes: gere um trecho por personagem, junte com ffmpeg (`concat` + `loudnorm=I=-15`) e guarde a janela de tempo de cada personagem para mandar o volume só para a boca de quem fala.
- Parte B, boca: volume por frame com suavização exponencial nunca chega a zero; aplique o piso depois de suavizar, senão a boca fica aberta o vídeo todo.
- Parte B, legenda: uma palavra em coral por vez (a última que começou) e troque para o bloco novo assim que a primeira palavra dele chega.
- Parte B, cenário que falta no roteiro (ex.: banheiro): crie no componente do universo e registre no brandbook, nunca desenhe dentro do vídeo.
- Parte B, câmera: zoom aplicado ao cenário e aos personagens juntos (transform CSS no conjunto), senão a perspectiva quebra.
- Parte B, texto claro sobre cena noturna ou sobre fundo com detalhe fica ilegível: título sempre em cartão branco (`display: inline-block`, senão o cartão de uma linha corta a outra).
- Parte B, render: rode da raiz do universo com `--public-dir=videos/<slug>/public`; 51 s renderizam em ~45 s no Mac.
- Universo ligado a uma marca existente: leia o brandbook e as regras da marca antes da entrevista e transforme as proibições dela nas proibições do universo.
- Parte B, vários episódios de uma vez (09/11/2026, eps. 2 a 5 da Nina): aprovar os roteiros juntos numa pergunta só, gerar todos os trechos de voz em paralelo, juntar com um script do universo (`_ferramentas/montar_audio.py`: corta silêncio das pontas, pausa escolhida entre falas, `falas.json` com quem fala quando) e conferir cada episódio por uma prévia em meia resolução com folha de frames (`_ferramentas/previa.sh`) antes do render final. Peças repetidas (câmera, chão, post-it, lista, selo) vão para um componente do universo, não para cada vídeo.
- Parte B, Whisper: escreve palavra estrangeira errada ("bodies" virou "bóris"), separa "pré" de "-natal" e às vezes repete a última palavra; corrija na legenda pelo índice da palavra.
- Parte B, novelinha: episódio que continua outro precisa abrir com um resumo de uma frase da parte anterior ("Na parte um..."). Quem chega pelo feed não viu o episódio anterior; o revisor marcou isso como grave no ep. 2 da Nina.
- Parte B, o que o revisor pegou nos eps. 2 a 5 e vale conferir antes dele: fala que promete mais do que a fonte diz ("ali mesmo"); imagem que contradiz a fala (dizer "tô dormindo no sofá" em pé, selo MITO na tela enquanto a frase dita é verdadeira); personagem de apoio que some entre cenas da mesma sala; celular do app flutuando em tela cheia por muitos segundos (vira cara de anúncio, prefira o celular na mão do personagem); número na tela do app que muda e confunde.
- Parte B, dica com nuance (ex.: risco fraquinho no teste): se a história deixa uma conclusão que pode ensinar errado, escreva a regra certa na tela com a fonte.
- Ao terminar um lote, registre onde a próxima sessão vai procurar: tabela de episódios e pendências na nota do projeto, memória apontando pra ela, e esta lista de armadilhas.
- Universo que precisa ir pra outra máquina (no caso do Jonathan, o vault que sincroniza com a VPS): o projeto mora no vault e a pasta do estúdio vira "motor" com o `node_modules` (1,1 GB, nunca no vault) e um link por item do projeto. Pra funcionar: `remotion.config.ts` com `Config.overrideWebpackConfig((c) => ({ ...c, resolve: { ...c.resolve, symlinks: false } }))`, `"preserveSymlinks": true` no `tsconfig.json` e `node --preserve-symlinks --preserve-symlinks-main` nos scripts Node. Tudo roda a partir do motor. No `.gitignore` do vault, mp4, mp3, wav, frames e prévias ficam fora do git. Feito na Nina Pesquisou em 09/11/2026 (`01-projetos/ciclua/social/nina-pesquisou/animacao/`).
- Render na VPS Linux (10/11/2026, Nina Pesquisou): funciona igual ao Mac. Segundo motor com os mesmos links; no `remotion.config.ts`, `Config.setBrowserExecutable("/usr/bin/google-chrome")` só quando `process.platform === "linux"`; transcrição com faster-whisper `large-v3` (CPU, int8, ~30 s pra 1 min de fala) no lugar do mlx-whisper, que só existe no Mac (o `transcrever.py` tenta um e cai no outro). Voz direto pela API do ElevenLabs (`/v1/text-to-speech/<voice_id>`, `model_id` `eleven_v4`) quando não há conector. Modo automático (rotina sem pessoa): um agente revisor separado substitui as aprovações de roteiro e de vídeo.
- Segundo universo da mesma marca (11/11/2026, Segunda Viagem do Ciclua): reaproveite a infraestrutura (motor com `cp -al` do `node_modules` do primeiro, `_ferramentas/`, `CelularCiclua`, gerador do HTML), mas o desenho nasce novo para os dois perfis não se confundirem no feed. Proporção realista com traço fino puxa público mais velho que o boneco cabeçudo sem contorno.
- Corpo realista: cabelo comprido que cai nas costas precisa de uma camada desenhada antes do tronco (`cabeloCostas`), senão vira um bloco por cima da roupa; braço fino demais vira palito (espessura ~30 no quadro de 400 x 900); pescoço curto (a cabeça desce até quase o ombro).
- Personagem menor no mesmo quadro (criança com moldura 0,56): divida a espessura do traço pela escala, senão a criança fica com contorno mais fino que os adultos.
- ElevenLabs na VPS: a chave do OpenBot (`ELEVENLABS_API_KEY` em `/var/lib/openbot/.claude/settings.json`) só gera voz e não lista vozes; para escolher vozes use o conector (`creative_list_voices`) e gere as amostras pela API.
- Legenda de frase inteira (Segunda Viagem, ep. 1): reparta as palavras do Whisper pelas falas pelo NÚMERO de palavras de cada fala do roteiro, não pelo tempo (o Whisper adianta uns décimos e joga a 1ª palavra da fala seguinte no cartão anterior). Se o Whisper repetir uma palavra na pausa ("agora. Agora."), transcreva a fala sozinha antes de regravar: em geral é alucinação, não voz.
- Piada física (Segunda Viagem, ep. 1): o revisor reprova se a ação só existe na narração ("ele lambeu"). Encene de verdade (pose nova, objeto na altura certa) e use zoom curto, até ~1,45x, com o rosto de todo mundo abaixo do cartão da legenda, entrada de ~0,8 s e saída de ~0,6 s com easing, terminando antes do fecho. A última fala (a chamada) não ganha legenda, porque o cartão do fecho já mostra o texto.
- Lembrança com dissolve: comece a cena do antes no MESMO enquadramento em que o agora termina, senão aparecem duas pessoas de tamanhos diferentes no meio da passagem; e tire do antes os objetos que ainda não existiam (brinquedos de um filho que não tinha nascido).
- Vídeo que vende recurso do app (Segunda Viagem, ep. 2): confira no CÓDIGO que a usuária daquela fase chega ao recurso, não só que a tela existe. O revisor achou que a tela de sintomas existia mas não tinha atalho na gestação, e o resumo Premium sairia vazio; o vídeo virou PR no app (#25 do ciclua) e só publica depois. Peça ao revisor para ler o código do app junto com os frames.
- Estimativa de crédito de voz: conte os caracteres do texto exato antes de prometer (no ep. 2 estimei 690 e deram 815). E transcreva a fala de chamada sozinha: "comenta Ciclua" às vezes sai "comenta a Ciclua"; "comenta: Ciclua," resolveu.
- Vídeo lento e parado (100 Dias no Escuro, 18/11/2026): foi o motivo de três versões reprovadas. Siga a Regra de dinamismo desde o piloto e meça com `scripts/checar_dinamismo.py`; não confie no olho de quem montou.
- Aprovar estilo por imagem parada: a pessoa aprovou as imagens e reprovou o vídeo. O portão de aprovação é o clipe piloto de 8 a 10 s com voz e som, antes do brandbook completo.
- Estilo perguntado só em palavras: comece o bloco Visual pedindo um vídeo ou perfil de referência ("queria que parecesse com qual?"). Sem referência, mostre 3 versões lado a lado em imagem.
- Som escolhido por lista de texto: "ambiente + efeitos" no papel virou "faltou trilha, faltou emoção" no vídeo. Som se escolhe ouvindo, no piloto.
- Formato da série perdido no resumo: a pessoa descreveu a abertura ("o mundo apagou, quem salva o Davi são vocês") e o roteiro saiu com outras palavras. Guarde abertura e fecho fixos no brandbook, literais.
- Áudio ou imagem mostrados junto com uma caixa de pergunta ficam escondidos atrás dela: mostre a mídia numa mensagem normal e pergunte só na seguinte.
- Corrigir vídeo lento enchendo de corte (100 Dias no Escuro, 18/11/2026): para passar no medidor entraram 8 telas de objeto, algumas de meio segundo, e a pessoa reprovou: "muito rápido, não dá pra entender o que tá acontecendo". A versão com 25 cortes em 36 s (média 1,4 s) foi reprovada; a de 13 cortes estava lenta. O alvo fica entre as duas, perto de 1,7 a 2,2 s por plano, e medidor aprovado não dispensa assistir o trecho mexido.
- Efeito sonoro em toda troca de cena (100 Dias no Escuro, 18/11/2026): um "vupt" sintético em cada um dos 31 cortes foi reprovado como "barulho estranho, muito ruim". Corte comum não leva efeito: a trilha segura. Efeito só no que acontece na história (estouro, apagão, objeto que surge, a virada), poucos por vídeo e baixos. Quem monta não ouve o resultado, então peça para a pessoa ouvir o piloto antes de espalhar um som pelo vídeo.

