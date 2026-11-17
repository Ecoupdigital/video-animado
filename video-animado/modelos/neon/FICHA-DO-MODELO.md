# Neon retrô

**Para que serve:** reel de oferta, lançamento, evento ou contagem regressiva, sem personagem, com cara de fita dos anos 80: o letreiro neon acende e troca na palavra falada (narração inteira) ou na batida da música (só letreiros), o preço conta até o valor, a contagem desce, o selo bate e o botão chama. Funciona para liquidação, promoção do dia, lançamento de produto ou coleção, show, festa e abertura de loja.

**Público típico:** lojas, restaurantes, produtores de evento e perfis que postam promoção toda semana e querem um vídeo que chame atenção sem gravar ninguém.

**Modelo avulso** (sem temas), com **duas receitas**, escolhidas na entrevista (pergunta 10) e trocáveis por vídeo:

| Receita | Como é |
|---|---|
| **Narração inteira** (`narracao-inteira`, padrão) | uma voz só fala o texto inteiro; cada letreiro e peça acende na palavra falada. Custa crédito de voz, avisado antes |
| **Só letreiros** (`texto-e-musica`) | sem voz e sem crédito: cada cena dura compassos inteiros e cada peça acende numa batida da cama synth do kit (120 batidas por minuto) ou da música da pessoa |

**O neon troca todas as cores**, em 3 paletas prontas ou na cor da marca (no letreiro cheio, no destaque e no botão):

| Paleta | Cara |
|---|---|
| **Synth** (`synth`, padrão) | céu roxo, sol amarelo e rosa, grade magenta, letreiro rosa e ciano: a tela de referência |
| **Pôr do sol** (`por-do-sol`) | céu vinho, sol e grade laranja, letreiro laranja e amarelo |
| **Verde e azul** (`verde-azul`) | céu petróleo, sol verde-limão e azul, grade turquesa, letreiro verde e menta |

**Estrutura de episódio (15 a 30 s):**
1. Abertura: o letreiro acende com a promessa.
2. Oferta: o que é, o preço antigo riscado, o preço que conta até o valor e o selo.
3. Contagem: o relógio descendo até o fim do prazo, ou 3, 2, 1.
4. Chamada: o botão em pílula com o que fazer agora.
5. Card final: chamada, assinatura, frase e, com narração, "Narração gerada por IA".

**O que vem pronto:**
- **Cenário:** céu em degradê, sol listrado cortado no horizonte, grade em perspectiva andando para a frente num laço sem salto, varredura de TV por cima e, no topo, o "PLAY" com o triângulo desenhado e o contador de fita.
- **Peças:** letreiro neon de 1 ou 2 linhas (contorno e cheio, inclinado, com brilho), preço que conta (formato brasileiro, com vírgula e milhar, termina exatamente no valor), contagem (relógio ou 3, 2, 1), selo girado, botão em pílula e card final.
- **Piscada acessível:** no máximo 3 quedas de brilho por segundo, contando o acender, só no letreiro (abaixo de 10% da tela), o brilho nunca vai a zero; o `conferir_piscada.py` mede no vídeo antes de entregar, e `"piscada": false` desliga.
- **Cenas montadas por dados:** abertura, oferta, contagem, chamada e final. O roteiro diz o texto (ou os compassos) de cada cena, os letreiros e a batida de cada peça; nenhum tempo é digitado à mão.
- **Ferramentas:** transcrição com o tempo de cada palavra, `timing.json` por batida, tempos na batida da música, ducking da cama, emenda de trecho errado, prévia sem voz, stills de conferência, efeitos e cama synth gerados por código (só numpy).
- **Fontes no kit:** Inter e JetBrains Mono em arquivo (licença OFL), sem baixar nada na hora do render.
- **Receita:** roteiro em cenas aprovado antes da voz, preço e prazo ditos iguais aos da tela, piscada conferida, uma voz com custo avisado antes (`RECEITA.md`).

**Limites:** sem personagem, sem foto de produto, sem logo ou marca real de terceiros. Uma voz só na narração. Não detecta sozinho a batida de uma música de fora: o roteiro diz o andamento dela. Dois letreiros nunca acendem a menos de 1 s um do outro. Selo curto (até 22 letras). Nenhuma imagem de fora, nenhuma ferramenta externa de imagem ou vídeo por IA: tudo desenhado em código.
