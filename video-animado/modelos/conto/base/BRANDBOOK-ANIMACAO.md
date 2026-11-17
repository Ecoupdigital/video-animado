# {{universo.nome}}

Universo de contos animados, desenhado em código, no modelo "Conto com personagem" (família com temas), no tema {{tema_nome}}: personagens fixos que conversam, uma voz por personagem, a boca abrindo pelo volume da fala.

Criado em {{data}} a partir do modelo `conto` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs --stills`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar tema, aparência, nome, marca, cores, cenários ou narrador, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Personagens:** {{lista_personagens}}.
4. **Cenários:** {{cenarios_resumo}}
5. **Visual:** tema {{tema_nome}}: {{tema_resumo}} Cores: {{cores_resumo}} Vertical 1080 x 1920, 30 fps.

## 2. Narrativa do universo

<!-- ESCREVER: o que acontece na série, o conflito que se repete, de 1 a 3 formatos de vídeo (situação com dica, conto com começo, meio e fim, novelinha em capítulos), como começa e termina cada vídeo e quem é a protagonista. Usar as respostas de assunto, público e tom. Escrever como gente fala: frases curtas, uma ideia por frase. -->

**Marca:** {{marca_resumo}}

**Narrador:** {{narrador_resumo}}

**Fecho de todo vídeo (cerca de 4 s):** {{fecho_resumo}}

**Como começa e termina.** Abertura com o título nos 2 primeiros segundos (a faixa rasgada no papel, o selo e o título nas formas, a citação entre aspas sobre o céu nas silhuetas, o título à mão no giz de cera), a situação em diálogo de dois, a fala do narrador quando a história pede, e o fecho (`Fecho`, em `componentes/Texto.tsx`).

## 3. Personagens

Cada personagem tem a ficha em `personagens/<id>/FICHA.md` e o desenho em `personagens/<id>/Personagem.tsx`, gerados das respostas. Todos usam o mesmo `Personagem` (`componentes/Personagem.tsx`), que desenha no traço do tema: por isso o elenco tem um traço só, e trocar de tema troca o traço de todos juntos. A aparência é um objeto só para todos os temas; a cor principal e o acessório fazem cada um ser reconhecido em qualquer traço (nas silhuetas, que são escuras, o contorno: formato do corpo, altura, cabelo e acessório). As folhas saem dos stills `expressoes-<id>-<tema>` do `_preview`.

{{tabela_personagens}}

<!-- ESCREVER: jeito de falar de cada personagem que fala (ritmo, bordão, o que nunca diz) e as relações entre eles, uma linha por personagem. -->

**Propriedades de todo personagem:** `expressao`, `falando` (0 a 1, volume da voz no frame; com 0 a boca fica fechada), `olhando` (frente, esquerda, direita, cima, baixo), `escala` (1 = 400 x 900 px; em cena, 0,82), `espelhar`, `parada`.

## 4. Cenários

Os mesmos cenários em todos os temas, cada um desenhado no traço do tema (`componentes/temas/<tema>/fundo.tsx`), com o chão em y 1395 (`CHAO_Y` em `componentes/medidas.ts`): os pés dos personagens pisam ali.

{{tabela_cenarios}}

**Temas do modelo** (o tema troca o visual, não o roteiro):

{{tabela_temas}}

## 5. Cores

**Tema {{tema_nome}}.** O que a resposta de cores troca neste tema: {{tema_cor_troca}}. Os componentes usam o papel da cor (`T.c.fundo`, `T.c.destaque`...), nunca o hex direto. As cores dos personagens (pele, cabelo, roupa, corpo) moram na aparência de cada um, não na paleta.

{{tabela_cores}}

Destaque só na palavra falada e na pílula do fecho. Texto sobre qualquer cor sai em quase preto ou branco quando a cor pedida não dá contraste.

## 6. Fontes

| Fonte | Para quê | Tamanho de referência (1080 de largura) |
|---|---|---|
| **Lora 700** (`ContoSerif`) | título e subtítulo (inclinado) da faixa rasgada do papel recortado, chamada do fecho no papel; citação inclinada do título e chamada do fecho nas silhuetas | título 70 px (citação 86 px), subtítulo 46 px |
| **Inter 800** (`ContoTexto`) | legenda, balão de fala, selo do episódio, título das formas, "Comenta" | legenda 52 px, balão 46 px, título 92 px |
| **Inter 400 e 600** (`ContoTexto`) | aviso de personagem fictícia, placa do lugar, rótulos; legenda clara das silhuetas | aviso 26 px, legenda das silhuetas 54 px |
| **Caveat 600 e 700** (`ContoMao`) | letra de mão do giz de cera: título, legenda, placa e chamada do fecho | título 112 px, legenda 72 px |

Os arquivos moram em `componentes/fontes/` (licença em `OFL.txt`, origem em `ORIGEM.md`): nada é baixado na hora do render.

## 7. Grade da tela e textos

Área segura do Reels: nada importante nos 220 px do topo, nos 380 px de baixo nem a menos de 70 px das laterais. Texto nunca por cima do rosto de personagem. Todo texto encolhe até um mínimo e, se ainda não couber, quebra (palavra comprida quebra no meio) e corta com reticências.

| Faixa (y) | O que vai |
|---|---|
| 244 a ~470 | título da abertura (`Titulo`), selo do episódio (`SeloTopo`, formas), fecho (`Fecho`); no giz de cera, o título e o fecho começam depois da margem do caderno (x 172) |
| ~480 a ~900 | balões de fala (`Balao`, formas), acima da cabeça de quem fala, com o rabinho para ele |
| ~650 a 1395 | personagens (escala 0,82, pés em y 1395) |
| 1408 a 1532 | legenda (`Legenda`): tarja escura rasgada no papel, texto sobre o chão com a palavra numa pílula nas formas, texto claro sobre o morro escuro nas silhuetas, letra de mão com a palavra sublinhada no giz de cera |

**Tipos de cena** (valem em todos os temas): `abertura` (título, a protagonista no cenário), `dialogo` (dois personagens olhando um para o outro, só quem fala de boca aberta; nas silhuetas, só quem fala gesticula), `narrador` (os dois em cena, todas as bocas fechadas, a fala na legenda) e `fecho`.

## 8. Movimento

- **Parado:** respira e pisca, sutil (piscada a cada ~3,5 s, nunca no frame 0).
- **Fala:** a boca abre pelo volume, só em quem fala (`criarBocas`). No papel, a cabeça balança no pescoço e o braço gesticula girando no colchete; nas formas, o boneco quica (achata e estica) no ritmo da voz. Nas silhuetas não há boca: quem fala gesticula com o braço e tira a cabeça do eixo, os dois pelo volume (com volume zero, repouso). No giz de cera, a boca abre pelo volume e o traço de giz treme a cada 4 frames.
- **Reação:** surpresa e riso dão um pulinho; brava treme; feliz acena.
- **Texto:** legenda em blocos de até 4 palavras, a palavra falada no destaque; título e balões entram com mola rápida.
- **Ritmo:** cena de 2 a 4 segundos, corte seco no ritmo da fala.
- **Som:** efeito só nos momentos-chave (`pop` no título e no balão, `ding` no fecho, `deslize` em entrada, `papel` na virada de cena do papel recortado, `boing` no pulinho das formas). Os cinco saem de `_ferramentas/gerar_sfx.py` (origem em `_ferramentas/sfx/ORIGEM.md`).
- **Nunca:** mexer tudo ao mesmo tempo, deformar o rosto, personagem sumindo sem sair de cena.

<!-- ESCREVER: o jeito de se mover da protagonista (gesto típico quando explica, quando se surpreende). -->

## 9. Expressões

8 expressões iguais para todos e em todos os temas: **neutra, falando, feliz, triste, surpresa, brava, pensando, rindo**. Folhas geradas pelo `_preview` (`expressoes-<id>-<tema>`; olhares, espelho e boca de 0 a 1 em `poses-<tema>`).

| Expressão | Quando usar |
|---|---|
| neutra | ouvindo, transição, fala do narrador |
| falando | fala normal (a boca só abre com volume) |
| feliz | resposta boa, chegada, final |
| triste | o erro, a decepção |
| surpresa | a descoberta |
| brava | a bronca, o "de novo?!" |
| pensando | antes de responder (mão no queixo) |
| rindo | piada, fecho |

## 10. Voz

Caminho escolhido: {{voz.caminho}}. Uma voz por personagem que fala{{narrador_voz}}; cada fala vira um trecho de áudio (`audio/<n>-<id>.mp3`, o narrador como `<n>-narrador.mp3`) e a boca abre pelo volume (receita em `RECEITA.md`).

{{tabela_vozes}}

Antes de gerar qualquer fala: roteiro aprovado, prévia sem voz olhada e aviso de quantos caracteres vão para a voz.

## 11. Pronúncias

<!-- ESCREVER: palavras do universo que a voz pode errar (nome da marca, nomes dos personagens, termos do assunto) e como devem soar, em uma linha cada. A tabela completa fica em pronuncias.md, que o transcrever.py também lê. -->

## 12. Proibições

1. Redesenhar personagem ou cenário dentro de um vídeo: sempre importar o componente.
2. Ferramenta externa de imagem ou vídeo por IA. Se o desenho não sai, simplificar.
3. Trocar a aparência de um personagem no meio da série (cor principal e acessório são a identidade dele).
4. Texto fora da área segura ou por cima do rosto de personagem.
5. No papel recortado, mudar o kraft, as fibras, a sombra ou as cores de recorte: a cor troca só destaque, faixas e etiquetas.
6. Nas silhuetas, clarear a silhueta, o morro da frente, a placa ou os móveis: a cor troca só o céu, o que ele tinge e o destaque.
7. No giz de cera, mudar a folha, a pauta ou a margem: a cor troca só as cores dos gizes.

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo, a `RECEITA.md` e as fichas em `personagens/`.
2. Escreva o roteiro em falas (`roteiro-falas.json`, uma fala por item, com o `quem` de cada uma) e passe pela lista do que nunca acontece.
3. Crie `videos/AAAA-MM-DD-slug/`, copie `_ferramentas/episodio-base/src` para dentro e importe os componentes de `personagens/` e `componentes/` (os `node_modules` da raiz do universo servem para todos os vídeos). Nunca redesenhe.
4. Faça a prévia sem voz (`tempos_sem_voz.py` e `previa.sh`) antes de gastar crédito de voz.
5. Siga a grade da tela e feche com o `Fecho`.
