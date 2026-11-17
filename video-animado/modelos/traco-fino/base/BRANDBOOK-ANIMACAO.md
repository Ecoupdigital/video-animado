# {{universo.nome}}

Universo de animação 2D, desenhado em código, no modelo "Traço fino, antes e agora": ilustração editorial de traço fino, gente de proporção real, uma narradora que conta como era antes e como é agora.

Criado em {{data}} a partir do modelo `traco-fino` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar aparência, nome, marca, rótulos, cores ou cenários, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Personagens:** {{lista_personagens}}.
4. **Cenários:** <!-- ESCREVER: os lugares onde as histórias acontecem, em uma linha, com o nome da escola e da placa quando houver -->
5. **Visual:** traço editorial fino em tinta, proporção realista, corpo inteiro, paleta {{paleta_nome}}, Fraunces + DM Sans + Caveat, vertical 1080 x 1920, 30 fps.

## 2. Narrativa do universo

**Antes e agora:** {{antes_agora_resumo}}

<!-- ESCREVER: a história de origem da narradora (o que ela fazia antes e o que mudou), o conflito que se repete (uma situação do agora puxa uma lembrança do antes; a volta ao agora mostra o mesmo problema resolvido) e 1 a 3 formatos de vídeo. Usar as respostas de assunto, público, tom e virada. Escrever como gente fala: frases completas, uma ideia por frase, sem frase picada que obriga a adivinhar o sentido. -->

**Estrutura do episódio (30 a 60 s):**
1. **Gancho (0 a 3 s):** o agora, já no meio da cena, com uma fala da narradora.
2. **Antes:** dissolve para a lembrança apagada em sépia (`<Lembranca>`), com a aparência do antes (`epoca="antes"`), o caderno ou o caos. Selo "{{rotulo_antes}} · detalhe do episódio".
3. **Agora:** volta à cor cheia; o mesmo problema resolvido (celular na mão e a tela em destaque, quando houver marca). Selo "{{rotulo_agora}} · detalhe do episódio".
4. **Elenco:** quem aparece faz uma ação que tem sentido na história; só a narradora fala.
5. **Fecho (cerca de 4 s):** {{fecho_resumo}}

**Marca:** {{marca_resumo}}

## 3. Personagens

Cada personagem tem a ficha em `personagens/<id>/FICHA.md` e o desenho em `personagens/<id>/Personagem.tsx`, gerados das respostas. Todos os adultos usam o mesmo corpo (`componentes/adulto.tsx`) e todas as crianças o mesmo corpo de criança (`componentes/crianca.tsx`), com o mesmo rosto (`componentes/rosto.tsx`): o elenco tem um traço só. A folha de expressões de cada um sai do still `expressoes-<id>` do `_preview`.

{{tabela_personagens}}

**Narradora:** {{narradora}}, a única voz do universo. Os outros aparecem e reagem; a narradora conta o que disseram e fizeram.

<!-- ESCREVER: o jeito de falar da narradora (ritmo, humor, o que nunca diz) e as relações entre os personagens, uma linha por personagem. -->

**Propriedades do adulto:** `expressao`, `falando` (0 a 1, volume da voz no frame, só na narradora), `olhando` (frente, esquerda, direita, cima, baixo), `escala` (1 = 400 x 900 px), `segurando` (nada, celular, caderno, caixa, mostrando), `espelhar`, `parada`, `epoca` (`agora` ou `antes`: a aparência do antes troca só o que muda). **Da criança:** `expressao`, `pose` (parado, correndo, bracos-pra-cima), `olhando`, `escala`, `espelhar`, `parada`, `epoca`. Criança não fala: a boca só muda com a expressão.

## 4. Cenários

Componentes em `cenarios/`. Tela vertical 1080 x 1920, camadas com profundidade (fundo, meio e frente andam diferente com a prop `camera`, de -1 a 1), `zoom` centrado no chão e `luz` (`manha`, `tarde`, `madrugada`). Os pés dos personagens ficam em y 1640 (`NoChao` em `componentes/Montagem.tsx`).

{{tabela_cenarios}}

**Luz:** manhã é o padrão. Tarde esquenta tudo; madrugada escurece em azul com a luz quente de um abajur. Embrulhe cada personagem em `<NaLuz luz="...">` para ele ficar na mesma luz do cenário. **O antes** vai inteiro (cenário e personagens) dentro de `<Lembranca>`; selo, legenda, caderno e fecho ficam fora dela.

## 5. Cores

**Paleta {{paleta_nome}}.** Proporção: 60% linho (fundos), 25% petróleo e oliva (apoio), 10% personagens, 5% destaque. Os componentes usam o papel da cor (`COR.fundo`, `COR.destaque`...) ou o nome do desenho tirado dele (`COR.linho`, `COR.petroleo`, `COR.oliva`); o traço é sempre tinta `#1F2328`.

{{tabela_cores}}

Destaque só na marca, na palavra falada e na chamada; em texto pequeno, o destaque profundo. Dentro do celular, o acento é a cor da marca.

## 6. Fontes

| Fonte | Para quê | Tamanho de referência (1080 de largura) |
|---|---|---|
| **Fraunces** (500 a 700) | legenda de frase inteira, chamada do fecho, placas | legenda 66 px, chamada 64 px |
| **DM Sans** (400, 500, 700) | selo do tempo, cartão da fonte, aviso de personagem fictícia, telas do celular | selo 34 px, fonte 28 px, aviso 26 px |
| **Caveat** (500, 700) | letra de mão: caderno e rótulo de caixa | caderno 58 px, título 72 px |

Carregadas por `componentes/fontes.ts` (Google Fonts pelo Remotion).

## 7. Grade da tela e textos

Área segura do Reels: nada importante acima de y 130, abaixo de y 1650 nem a menos de 70 px das laterais; nada essencial à direita de x 960 abaixo de y 1100. Texto nunca por cima do rosto.

| Faixa (y) | O que vai |
|---|---|
| 130 a 230 | selo do tempo (`SeloTempo`: "{{rotulo_antes}}" ou "{{rotulo_agora}}", mais o detalhe do episódio) |
| 300 a 620 | legenda de frase inteira (`Legenda`), palavra falada no destaque profundo |
| 640 a 1300 | caderno (`Caderno`) ou celular grande, quando aparecem |
| 700 a 1640 | personagens (pés em y 1640) |
| 1500 a 1600 | cartão da fonte (`CartaoFonte`, texto livre), à esquerda, só quando o assunto pedir |

**Celular da marca** (`componentes/CelularMarca.tsx`): a marca passa de fundo pela tela, em 4 moldes com o texto por prop: `lista` (itens com marca de feito), `semana` (progresso por etapa), `conversa` (balões) e `aviso` (notificação com botão). Sem marca, a tela sai sem logo. Nada de dado inventado na tela.

**Caderno** (`Caderno`): o jeito antigo de resolver; cada linha se escreve no seu frame, pode ser riscada (`riscado`) ou destacada (`destaque`).

**Peças de montagem** (`componentes/Montagem.tsx`): `Camera`, `NoChao`, `SFX`, `Trilha`, `Etiqueta`, e para a boca e a legenda `criarBocas`, `falaEm`, `prepararPalavras` e `legendaDasFalas` (reparte a legenda por frase pelo número de palavras de cada fala).

## 8. Movimento

- **Parado:** respira e pisca, sutil (piscada a cada ~3,5 s, nunca no frame 0). A cabeça balança de leve.
- **Antes e agora:** dissolve de cerca de 0,45 s entre o agora e a lembrança, com um `deslize` baixo na entrada da lembrança.
- **Câmera:** zoom lento (1,0 a 1,18) e deslocamento suave para o celular quando ele entra.
- **Texto:** a frase inteira aparece de uma vez; a palavra dita acende. Selo e caderno entram com mola.
- **Ritmo:** calmo, cena de 3 a 6 segundos.
- **Boca:** só a da narradora abre, pelo volume da voz em cada frame (`criarBocas`), com piso para não tremer no silêncio.
- **Som:** trilha de piano elétrico gerada por código (`_ferramentas/trilha.py`), em volume fixo baixo (0,09), com entrada de 1 s e saída de 1,5 s; efeitos só nos momentos-chave (origem em `_ferramentas/sfx/ORIGEM.md`).
- **Nunca:** mexer tudo ao mesmo tempo, tremer, deformar o rosto, personagem sumindo sem sair de cena.

<!-- ESCREVER: o jeito de se mover da narradora (gesto típico quando lembra do antes, quando resolve no agora). -->

## 9. Expressões

9 expressões iguais para todos os adultos: **neutra, falando, feliz, surpresa, pensando, apontando, irônica (`ironica`), exausta, aliviada**. Criança: **neutra, feliz, travesso, surpresa, emburrado, dormindo**, e as poses parado, correndo e braços pra cima. Folhas geradas pelo `_preview` (`expressoes-<id>`).

| Expressão | Quando usar |
|---|---|
| neutra | ouvindo, transição |
| falando | fala normal (a boca só abre com volume) |
| feliz | resposta boa, fecho |
| surpresa | a descoberta |
| pensando | antes de responder (mão no queixo) |
| apontando | mostrando o texto ou o celular |
| ironica | meio sorriso de lado: o humor seco |
| exausta | o antes (olheira, ombro caído) |
| aliviada | o agora resolvido (olhos fechados, mão no peito) |

## 10. Voz

Caminho escolhido: {{voz.caminho}}. **Uma voz só: a da narradora.** Cada fala do roteiro vira um trecho de áudio (`audio/<n>-<id-da-narradora>.mp3`), a boca dela abre pelo volume e a legenda vem por frase (receita em `RECEITA.md`).

{{tabela_vozes}}

Antes de gerar qualquer fala: roteiro aprovado, prévia sem voz olhada e aviso de quantos caracteres vão para a voz.

## 11. Pronúncias

<!-- ESCREVER: palavras do universo que a voz pode errar (nome da marca, termos do assunto) e como devem soar, em uma linha cada. A tabela completa fica em pronuncias.md, que o transcrever.py também lê. -->

## 12. Proibições

1. Redesenhar personagem ou cenário dentro de um vídeo: sempre importar o componente.
2. Ferramenta externa de imagem ou vídeo por IA. Se o desenho não sai, simplificar.
3. Trocar a roupa fixa de qualquer personagem (o antes troca só o que está na aparência do antes).
4. Texto fora da área segura, por cima do rosto ou dentro da `<Lembranca>`.
5. Outra voz além da narradora; dado inventado na tela do celular ou no cartão de fonte.

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo, a `RECEITA.md` e as fichas em `personagens/`.
2. Escolha a lembrança do antes e o problema resolvido no agora; passe o roteiro pela lista do que nunca acontece.
3. Crie `videos/AAAA-MM-DD-slug/`, copie `_ferramentas/episodio-base/src` para dentro e importe os componentes de `personagens/`, `cenarios/` e `componentes/` (os `node_modules` da raiz do universo servem para todos os vídeos). Nunca redesenhe.
4. Faça a prévia sem voz (`tempos_sem_voz.py` e `previa.sh`) antes de gastar crédito de voz.
5. Siga a grade da tela, ponha o antes dentro da `<Lembranca>` e feche com o `Fecho`.
