# {{universo.nome}}

Reel de oferta, lançamento, evento ou contagem regressiva, desenhado em código, no modelo "Neon retrô": céu escuro, sol listrado cortado no horizonte, grade em perspectiva andando para a frente e linhas de varredura de TV por cima. O letreiro neon acende e troca na palavra falada (narração inteira) ou na batida da música (só letreiros), e as peças da oferta entram no tempo certo. Sem personagem: quem conduz é o letreiro.

Criado em {{data}} a partir do modelo `neon` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar nome, marca, oferta, cores, receita ou card final, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Personagens:** nenhum. O letreiro neon conduz; as peças da oferta entram no tempo da voz ou da batida.
4. **Cenas:** abertura com o letreiro, oferta com o preço que conta e o selo, contagem regressiva, chamada com o botão em pílula, card final.
5. **Visual:** céu, sol listrado e grade retrô, letreiro neon com brilho, varredura de TV, "PLAY" e contador de fita no topo; vertical 1080 x 1920, 30 fps; receita padrão: {{receita_nome}}.

## 2. Narrativa do universo

<!-- ESCREVER: que tipo de oferta, lançamento ou evento a série anuncia (de onde vêm as ofertas, com que frequência, o que cada vídeo deixa claro: o que é, quanto custa, até quando) e 1 a 3 formatos de vídeo (a oferta do dia, a contagem para a virada, o lançamento). Frases completas, como gente fala. -->

**A oferta deste universo:** {{oferta_resumo}}

**Estrutura do episódio (15 a 30 s):**
1. **Abertura (0 a 3 s):** o letreiro acende com a promessa ("queima de estoque", "promo da meia-noite").
2. **Oferta:** o que é, o preço antigo riscado e o preço que conta até o valor, o selo batendo.
3. **Contagem:** o relógio descendo até o fim do prazo, ou 3, 2, 1.
4. **Chamada:** o botão em pílula com o que fazer agora.
5. **Card final (cerca de 3 s):** {{fecho_resumo}}

**Receita padrão:** {{receita_nome}}: {{receita_resumo}}

**Marca:** {{marca_resumo}}

## 3. Personagens

Este universo não usa personagem. Quem conduz o vídeo é o letreiro neon, que acende e troca na palavra falada ou na batida, e as peças da oferta (preço, contagem, selo, botão) entram no mesmo tempo.

<!-- ESCREVER: o jeito de anunciar (ritmo, como diz o preço e o prazo, que palavras viram letreiro, o que nunca diz: pressão falsa, desconto inventado). -->

## 4. Cenário e peças

O cenário é fixo e nunca pisca: céu em degradê, sol listrado cortado no horizonte (y 1120), grade em perspectiva andando para a frente num laço sem salto, linhas de varredura de TV por cima de tudo, e no topo o "PLAY" com o triângulo desenhado e o contador de fita, que conta o tempo do vídeo.

| Peça | Como é |
|---|---|
| letreiro | 1 ou 2 linhas em Inter 900 inclinada: a de cima em contorno, a de baixo cheia, com brilho. Acende na batida, pisca de leve (no máximo 3 quedas de brilho por segundo, nunca apagando) e troca na palavra seguinte |
| preço | o preço antigo riscado e o novo contando dele até o valor, que termina exatamente no número da oferta, com vírgula e milhar |
| contagem | o relógio descendo a partir do prazo (HH:MM:SS) ou 3, 2, 1 |
| selo | o selo girado ("só hoje"), que bate no lugar |
| botão | a pílula com brilho e o texto da oferta |
| card final | chamada, assinatura, frase e o aviso de narração por IA, quando há narração |

As cenas estão em `componentes/cenas.tsx`, montadas pelos dados do roteiro de cada vídeo:

| Cena (`tipo`) | O que mostra |
|---|---|
| `abertura` | o letreiro grande, sozinho sobre o cenário |
| `oferta` | o que é a oferta, o preço antigo riscado, o preço que conta, o selo e o prazo |
| `contagem` | o relógio descendo ou 3, 2, 1, com o rótulo e o prazo |
| `chamada` | o botão em pílula com o texto da oferta |
| `final` | o card final por cima do cenário |

O letreiro fica no alto em todas as cenas e só troca quando o roteiro pede. Os stills `cena-<tipo>` do `_preview` mostram cada cena com a área segura marcada; `capa` é a cena da tela de referência (letreiro e botão) com a oferta deste universo.

## 5. Cores

**O neon troca todas as cores:** céu, sol, faixas do sol, grade, letreiro, destaque, botão, selo, texto do topo e card final. Neste universo: {{cores_resumo}} Os tokens moram em `componentes/opcoes.json` (`paletas`, as 3 prontas com os mesmos papéis) e os componentes pegam a cor pelo papel com `useNeon()` (`N.c.cheio`, `N.a('ceu', 0.8)`), nunca por hex fixo.

{{tabela_prontas}}

{{tabela_cores}}

**Brilho com parcimônia:** o brilho é do letreiro, do preço e do botão. Uma palavra destacada por chamada.

## 6. Fontes

| Papel | Fonte | Para quê |
|---|---|---|
| texto | **Inter** 800 e 900 | letreiro (900, inclinado em código), preço, contagem 3, 2, 1, selo, botão (900); o que é a oferta, preço antigo, card final (800) |
| mono | **JetBrains Mono** 500 | "PLAY" e contador de fita, relógio da contagem, prazo, aviso do card final |

As fontes moram no kit, em `componentes/fontes/` (origem e licença em `fontes/ORIGEM.md` e `fontes/OFL.txt`): o vídeo sai igual com e sem internet. Tamanhos de referência (1080 de largura): letreiro 100 a 130 px (encolhe com texto longo), preço 130 a 170 px (nunca menor que o letreiro), botão 44 a 56 px, topo 34 px.

## 7. Grade da tela e textos

Área segura do Reels: nada importante nos **220 px do topo** nem nos **380 px de baixo** (abaixo de y 1540), nem a menos de **70 px das laterais**. Na tela de referência o "PLAY", o contador e o botão ficam fora dela; aqui ficam dentro.

| Faixa (y) | O que vai |
|---|---|
| 236 a 290 | "PLAY" e contador de fita |
| ~310 a ~700 | letreiro (1 ou 2 linhas, encolhe com texto longo) |
| ~780 a 1120 | sol listrado (nenhum texto em cima dele) |
| 1130 a 1530 | as peças: oferta, contagem ou botão, sobre a grade |
| abaixo de 1540 | só a grade |

Texto longo quebra e encolhe dentro da área segura (letreiro, o que é, preço, prazo, botão, chamada, assinatura), e o brilho também fica dentro.

## 8. Movimento e piscada

- **Letreiro:** acende na batida (de apagado a aceso, com um tremido) e troca na palavra seguinte; o anterior apaga.
- **Piscada acessível:** no máximo 3 quedas de brilho por segundo, contando o acender; só no letreiro (área pequena da tela, abaixo de 10%); o brilho nunca vai a zero. Fundo, grade e varredura nunca piscam. A piscada desliga com `"piscada": false` no roteiro. Antes de entregar, `python3 _ferramentas/conferir_piscada.py <vídeo>` mede.
- **Preço:** conta do preço antigo (ou de zero) até o valor em cerca de 1 s e para exatamente nele; o risco do antigo se desenha.
- **Contagem:** o relógio desce um segundo por segundo; o 3, 2, 1 troca na batida ou a cada segundo.
- **Selo:** bate no lugar (grande para o tamanho, girado). **Botão:** sobe e o brilho respira devagar.
- **Grade:** anda para a frente sem parar, num laço sem salto; o contador de fita conta o tempo do vídeo.
- **Som:** cama synth em laço (120 batidas por minuto), baixa por baixo da voz (`duck.json`) ou cheia na receita só letreiros; o zumbido do neon acendendo, o tique da contagem e o deslize, gerados por código (origem em `_ferramentas/sfx/ORIGEM.md`).

## 9. Peças

O modelo não tem expressões: o que se repete são as peças, em `componentes/letreiro.tsx` e `componentes/pecas.tsx`, desenhadas em código. Folhas nos stills `pecas` (cada peça em 3 momentos), `elenco` (as peças juntas) e `paletas` (as 3 prontas). Nenhuma peça tem logo ou marca real.

## 10. Voz ou só música

Receita: {{receita_nome}}. Caminho da voz: {{voz.caminho}}. **Narração inteira, uma voz só**, gerada de uma vez a partir do roteiro aprovado (1 versão por vez, custo avisado antes); ou **só letreiros**, sem voz e sem crédito, na batida da cama do kit ou da música da pessoa (com o andamento no roteiro). Receita em `RECEITA.md`.

{{tabela_vozes}}

## 11. Pronúncias

<!-- ESCREVER: nomes de produto, preços, datas e horas do assunto que a voz pode errar, e como devem soar, uma linha cada (preço por extenso: "oitenta e nove e noventa"). A tabela completa fica em pronuncias.md, que o transcrever.py também lê. -->

## 12. Proibições

1. Logo, marca ou produto de terceiros; foto de produto; imagem baixada; ferramenta externa de imagem ou vídeo por IA.
2. Preço ou prazo dito diferente do que está na tela; desconto em cima de preço que nunca existiu.
3. Piscada acima de 3 por segundo, em área grande ou apagando de vez; fundo, grade ou varredura piscando.
4. Texto fora da área segura ou em cima do sol; mais de uma palavra destacada por chamada.
5. Pressão falsa ("últimas unidades" sem ser verdade, prazo que não acaba).

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo e a `RECEITA.md`; confira o preço, o preço antigo e o prazo com quem vende.
2. Escolha a receita (narração inteira ou só letreiros) e escreva o roteiro em cenas, com a palavra ou a batida de cada letreiro e peça; aprove antes de qualquer voz.
3. Crie `videos/AAAA-MM-DD-slug/`, copie `_ferramentas/episodio-base/src` e grave o `roteiro-falas.json`.
4. Faça a prévia (`tempos_sem_voz.py` e `previa.sh`) e confira a piscada (`conferir_piscada.py`) antes de gastar crédito de voz.
5. Use as cenas e as peças de `componentes/`; nunca desenhe uma peça dentro do vídeo.
