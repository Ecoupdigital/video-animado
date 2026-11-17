# {{universo.nome}}

Universo de animação 2D, desenhado em código, no modelo "Chapado, casa quente": personagens chapados, sem contorno, cabeça grande, humor de situação com uma dica no meio.

Criado em {{data}} a partir do modelo `chapado` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar aparência, nome, marca, cores ou cenários, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Personagens:** {{lista_personagens}}.
4. **Cenários:** <!-- ESCREVER: os lugares onde as histórias acontecem, em uma linha, com o nome da placa e da loja quando houver -->
5. **Visual:** chapado sem contorno, paleta {{paleta_nome}}, Baloo 2 + DM Sans, movimento rápido e sutil, vertical 1080 x 1920.

## 2. Narrativa do universo

<!-- ESCREVER: o que acontece na série, o conflito que se repete, de 1 a 3 formatos de vídeo (situação com dica, novelinha com capítulos, lista numerada), como começa e termina cada vídeo e a história de origem da protagonista. Usar as respostas de assunto, público e tom. Escrever como gente fala: frases curtas, uma ideia por frase. -->

**Marca:** {{marca_resumo}}

**Fecho de todo vídeo (cerca de 4 s):** {{fecho_resumo}}

**Como começa e termina.** Gancho nos 2 primeiros segundos (a situação ou a frase errada); a dica no meio, com o cartão de fonte quando o assunto pedir; piada curta do elenco e o fecho (`Fecho`, em `componentes/Texto.tsx`).

## 3. Personagens

Cada personagem tem a ficha em `personagens/<id>/FICHA.md` e o desenho em `personagens/<id>/Personagem.tsx`, gerados das respostas. Todos os humanos usam a mesma `Pessoa` (`componentes/Pessoa.tsx`), por isso o elenco tem um traço só. A folha de expressões de cada um sai do still `expressoes-<id>` do `_preview`.

{{tabela_personagens}}

<!-- ESCREVER: jeito de falar de cada personagem que fala (ritmo, bordão, o que nunca diz) e as relações entre eles, uma linha por personagem. -->

**Propriedades comuns dos humanos:** `expressao`, `falando` (0 a 1, volume da voz no frame), `olhando` (frente, esquerda, direita, cima, baixo), `escala` (1 = 400 x 900 px), `segurando` (nada, celular, objeto, bebe; com `objeto` o desenho vai na prop `objeto`), `barriga` (0 a 1), `espelhar`, `parada`.

## 4. Cenários

Componentes em `cenarios/`. Tela vertical 1080 x 1920, camadas com profundidade (fundo, meio e frente andam diferente com a prop `camera`, de -1 a 1), `zoom` centrado no chão e `hora` (`dia` ou `noite`). Os pés dos personagens ficam em y 1620 (`NoChao` em `componentes/Montagem.tsx`).

{{tabela_cenarios}}

**Hora do dia:** dia com luz quente é o padrão. A noite escurece o cenário em azul; embrulhe cada personagem em `<PersonagemNaNoite hora="noite">` para ele escurecer junto.

## 5. Cores

**Paleta {{paleta_nome}}.** Proporção: 60% fundos claros, 25% apoio (madeira e verde), 10% personagens, 5% destaque. Os componentes usam o papel da cor (`COR.fundo`, `COR.destaque`...), nunca o hex direto.

{{tabela_cores}}

Destaque nunca em texto pequeno (contraste baixo); em texto pequeno, o destaque profundo. Acerto e erro são as cores do selo de verdade e de mito. Dentro do celular, o acento é a cor da marca.

## 6. Fontes

| Fonte | Para quê | Tamanho de referência (1080 de largura) |
|---|---|---|
| **Baloo 2** (700 e 800) | título da dica, legenda palavra por palavra, selos, chamada final | legenda 76 px, título 92 px, selo 110 px |
| **DM Sans** (400, 500, 700) | cartão da fonte, aviso de personagem fictícia, telas do celular, placas | fonte 32 px, aviso 26 px |

Carregadas por `componentes/fontes.ts` (Google Fonts pelo Remotion).

## 7. Grade da tela e textos

Área segura do Reels: nada importante acima de y 250, abaixo de y 1580 nem a menos de 60 px das laterais. Texto nunca por cima do rosto de personagem.

| Faixa (y) | O que vai |
|---|---|
| 270 a 460 | título da dica (`TituloDica`) ou selo (`Selo` de mito ou verdade, texto trocável) |
| 480 a 540 | cartão da fonte (`CartaoFonte`, texto livre), só quando o assunto pedir |
| 560 a 750 | legenda palavra por palavra (`Legenda`), acima das cabeças |
| 790 a 1620 | personagens (escala até 1.0, pés em y 1620) |

Títulos sobre fundo com detalhe (cortina, quadro) ou à noite usam `TituloDica` com `cartao` (cartão branco), nunca texto claro direto no cenário.

**Celular da marca** (`componentes/CelularMarca.tsx`): a marca passa de fundo pela tela do celular, em 4 moldes com o texto por prop: `lista` (itens com marca de feito), `semana` (progresso por etapa), `conversa` (balões) e `aviso` (notificação com botão). Sem marca, a tela sai sem logo. Nada de dado inventado na tela.

**Peças de montagem** (`componentes/Montagem.tsx`): `Camera`, `NoChao`, `SFX`, `PostItTexto`, `ListaMarcada` (✓ acerto, ✗ erro, ! alerta, cada item entra no seu tempo), `Etiqueta`, `Zzz`, e para a boca e a legenda `criarBocas`, `quemFala` e `prepararPalavras`.

## 8. Movimento

- **Parado:** respira e pisca, sutil (piscada a cada ~3,5 s, nunca no frame 0). O coque balança um pouco atrasado.
- **Entrada e saída:** personagem entra deslizando pelo lado com um quique leve e sai do mesmo jeito. Nunca some no meio da tela.
- **Troca de cena:** corte seco no ritmo da fala; câmera chega um pouco mais perto de quem fala.
- **Texto:** legenda palavra por palavra, palavra falada na cor de destaque; título e selos entram com mola rápida.
- **Ritmo:** rápido, cena de 2 a 4 segundos.
- **Boca:** abre conforme o volume da fala em cada frame, só em quem fala naquele trecho (`criarBocas`), com piso para não tremer no silêncio.
- **Som:** efeito só nos momentos-chave (`pop` em texto importante, `ding` na dica, `deslize` em entrada, `suspense` antes da descoberta). Os quatro efeitos saem de `_ferramentas/gerar_sfx.py` (origem em `_ferramentas/sfx/ORIGEM.md`). Trilha, se houver, bem baixa e de biblioteca livre.
- **Nunca:** mexer tudo ao mesmo tempo, tremer, deformar o rosto, personagem sumindo sem sair de cena.

<!-- ESCREVER: o jeito de se mover da protagonista (gesto típico quando fica nervosa, quando descobre algo). -->

## 9. Expressões

10 expressões iguais para todos os humanos: **neutra, falando, feliz, surpresa, pensando, apontando, ansiosa, cansada, rindo, emocionada**. Folhas geradas pelo `_preview` (`expressoes-<id>`).

| Expressão | Quando usar |
|---|---|
| neutra | ouvindo, transição |
| falando | fala normal (a boca só abre com volume) |
| feliz | resposta boa, final |
| surpresa | a descoberta |
| pensando | antes de responder (mão no queixo) |
| apontando | mostrando o texto ou o celular |
| ansiosa | o surto (mãos no rosto) |
| cansada | fim do dia, madrugada |
| rindo | piada do fecho |
| emocionada | momento bom de verdade |

Cachorro: neutra, curioso, feliz, triste, assustado. Bebê: dormindo, acordado, chorando, rindo.

## 10. Voz

Caminho escolhido: {{voz.caminho}}. Uma voz por personagem que fala; cada fala vira um trecho de áudio (`audio/<n>-<id>.mp3`) e a boca abre pelo volume (receita em `RECEITA.md`).

{{tabela_vozes}}

Antes de gerar qualquer fala: roteiro aprovado, prévia sem voz olhada e aviso de quantos caracteres vão para a voz.

## 11. Pronúncias

<!-- ESCREVER: palavras do universo que a voz pode errar (nome da marca, termos do assunto) e como devem soar, em uma linha cada. A tabela completa fica em pronuncias.md, que o transcrever.py também lê. -->

## 12. Proibições

1. Redesenhar personagem ou cenário dentro de um vídeo: sempre importar o componente.
2. Ferramenta externa de imagem ou vídeo por IA. Se o desenho não sai, simplificar.
3. Trocar a roupa fixa de qualquer personagem.
4. Texto fora da área segura ou por cima do rosto de personagem.
5. Dado inventado na tela do celular ou no cartão de fonte.

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo, a `RECEITA.md` e as fichas em `personagens/`.
2. Escolha formato, personagens e cenários; passe o roteiro pela lista do que nunca acontece.
3. Crie `videos/AAAA-MM-DD-slug/`, copie `_ferramentas/episodio-base/src` para dentro e importe os componentes de `personagens/`, `cenarios/` e `componentes/` (os `node_modules` da raiz do universo servem para todos os vídeos). Nunca redesenhe.
4. Faça a prévia sem voz (`tempos_sem_voz.py` e `previa.sh`) antes de gastar crédito de voz.
5. Siga a grade da tela e feche com o `Fecho`.
