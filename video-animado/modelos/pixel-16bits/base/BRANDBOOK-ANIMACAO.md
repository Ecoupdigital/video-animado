# {{universo.nome}}

Reel de notícia curta, desenhado em código, no modelo "Pixel 16 bits": um boneco pixel art apresenta a notícia com a boca mexendo pelo som da voz, enquanto o título entra por linha, um card branco mostra o que a voz diz e a legenda corre em blocos de até 3 palavras.

Criado em {{data}} a partir do modelo `pixel-16bits` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar nome, marca, boneco, topo, cores ou card final, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Personagem:** {{boneco_nome}}, boneco pixel 16 bits ({{boneco_resumo}}).
4. **Cenário:** nenhum desenhado: fundo claro liso, topo com "{{topo_rotulo}}" e "{{topo_assinatura}}", título, card branco e o boneco embaixo.
5. **Visual:** pixel art de 128 x 160 ampliada 6 vezes sem suavizar, vertical 1080 x 1920, 30 fps, 15 a 35 s por vídeo.

## 2. Narrativa do universo

<!-- ESCREVER: que tipo de notícia a série conta, de onde vêm as notícias e que pergunta cada vídeo responde para o público, e 1 a 3 formatos de vídeo (notícia do dia, "isso é verdade?", "o que muda pra você"). Frases completas, como gente fala. -->

**Estrutura do episódio (15 a 35 s, uma narração só, 4 a 7 seções):**
1. **Gancho (0 a 3 s):** a notícia numa frase, com o título já na tela.
2. **O que é:** o card mostra o fato (lista, conversa, selo ou blocos).
3. **O que muda:** o detalhe que importa para quem assiste.
4. **O cuidado ou o limite:** o "mas" da notícia, num selo carimbado.
5. **Card final de perfil (cerca de 2 a 3 s depois da voz):** {{perfil_arroba}}, "{{perfil_frase}}", e "Seguir" virando "Seguindo".

**Topo de todo vídeo:** "{{topo_rotulo}}" à esquerda e "{{topo_assinatura}}" à direita (o pedaço depois do último ponto sai no destaque).

**Marca:** {{marca_resumo}}

## 3. Personagens

**{{boneco_nome}}:** {{boneco_quem}}. Um boneco só, sempre de frente, do peito para cima. É o rosto do universo: não muda de roupa nem de cabelo entre vídeos.

{{tabela_aparencia}}

A aparência está em `aparencia.json` (gerado das respostas) e os 72 sprites em `public/px/` (9 bocas x 2 olhos x 4 gestos), refeitos pelo `--aplicar` ou por `python3 gerador/sprites.py aparencia.json public/px`. A folha de opções (`public/opcoes.png`) mostra cada código.

<!-- ESCREVER: o jeito do boneco apresentar (como abre o vídeo, que gesto usa para cada tipo de frase, o que ele nunca faz). -->

## 4. Cenários

Este universo não tem cenário desenhado: tudo acontece sobre o fundo claro liso (`fundo`), com o topo, o título, o card branco e o boneco sempre no mesmo lugar (seção 7). O que muda de um vídeo para outro é o card de cada seção.

| Molde de card (`molde`) | O que mostra |
|---|---|
| `lista` | itens que entram um por um e se marcam (caixa verde com o visto), com rótulo à direita |
| `conversa` | balões de mensagem, quem pergunta e quem responde, com "digitando" |
| `selo` | título do assunto e um selo carimbado (ATENÇÃO, BETA, NOVO...), com etiquetas que entram |
| `blocos` | 2 a 4 blocos com rótulo mono e valor grande, entrando um por um |
| card final | rosto do boneco num anel, o @, a frase e "Seguir" virando "Seguindo" |

Os stills `card-lista`, `card-conversa`, `card-selo`, `card-blocos` e `card-final` do `_preview` mostram cada molde com o universo.

## 5. Cores

Preset **claro e violeta** (o do modelo), com as trocas das respostas. Os componentes pegam a cor pelo papel (`P.destaque`), nunca por hex fixo; o preset fica em `componentes/opcoes.json` (`paletas`). Proporção: 75% fundo e card, 18% tinta, 7% destaque.

{{tabela_cores}}

**Acerto** só no item marcado da lista; **aviso** só no que pede atenção. Sem vermelho de erro: o pixel não dá bronca.

## 6. Fontes

| Papel | Fonte | Tamanho (1080 de largura) |
|---|---|---|
| título | **Inter** ExtraBold (800) | 82 px, encolhe sozinho com título longo |
| legenda | **Inter** Bold (700) | 50 px, numa tarja escura |
| cards | **Inter** 500 a 800 | 28 a 58 px |
| topo e rótulos | **JetBrains Mono** 500 | 22 a 28 px |

Carregadas por `componentes/fontes.ts` (Google Fonts pelo `@remotion/google-fonts`).

## 7. Grade da tela e textos

Área segura do Reels: nada importante nos **220 px do topo** nem nos **380 px de baixo** (abaixo de y 1540), nem a menos de **70 px das laterais**. O still de conferência mostra a área marcada.

| Faixa (y) | O que vai |
|---|---|
| 232 a 268 | topo: "{{topo_rotulo}}" e "{{topo_assinatura}}" |
| 290 a 476 | título em 2 linhas (encolhe e quebra com texto longo) |
| 496 a 876 | card branco da seção |
| 896 a 976 | legenda em blocos de até 3 palavras, acima da cabeça |
| 990 a 1950 | o boneco (rosto entre 1030 e 1540; o peito passa da área segura, de propósito) |

A legenda nunca cobre o rosto. Título, @ e frase longos quebram ou encolhem dentro da área.

## 8. Movimento

- **Boneco:** balança 6 px no ritmo da fala, pisca a cada 2 a 4 s, troca de gesto na virada de seção com 2 quadros de antecipação (sobe e volta). Sprite sempre nítido (`imageRendering: pixelated`).
- **Boca:** pelo som. Com o Rhubarb instalado, as 9 formas (A a H e X) saem dos fonemas; sem ele, pela força da voz, com as formas X, B, C e D. O `dados.ts` de cada vídeo diz qual caminho foi usado.
- **Título:** cada linha sobe por trás de uma máscara, a segunda 0,1 s depois da primeira, na virada da seção.
- **Card:** entra subindo com fade; cada elemento entra na palavra marcada no roteiro.
- **Legenda:** bloco novo a cada até 3 palavras, quebrando na pontuação, com um pulo de escala na entrada.
- **Som:** cama chiptune baixa e um som por coisa que aparece (`pop`, `tick`, `whoosh`, `sino`, `digitando`, `stamp`, `clique`), gerados por código (origem em `_ferramentas/sfx/ORIGEM.md`).

## 9. Expressões

O pixel não tem folha de expressões: tem 4 gestos (`nada`, `uma`, `duas`, `ombros`) e as bocas pelo som. Still `elenco`.

| Gesto | Quando usar |
|---|---|
| `nada` | frase neutra, explicação |
| `uma` | apontar ou apresentar uma coisa |
| `duas` | notícia grande, "olha isso" |
| `ombros` | o "mas", o limite, o que ainda não se sabe |

## 10. Voz

Caminho escolhido: {{voz.caminho}}. **Uma narração inteira, uma voz só**, gerada de uma vez a partir do roteiro aprovado (1 versão por vez, custo avisado antes). Velocidade só pelo `atempo` do ffmpeg. Receita em `RECEITA.md`.

{{tabela_vozes}}

## 11. Pronúncias

<!-- ESCREVER: nomes, siglas, números e termos do assunto que a voz pode errar, e como devem soar, uma linha cada. A tabela completa fica em pronuncias.md, que o transcrever.py também lê. -->

## 12. Proibições

1. Logo de empresa de terceiros na tela: o card usa o símbolo da marca do universo, letras e formas.
2. Notícia sem fonte: o roteiro diz de onde veio, e boato não vira lançamento.
3. Ferramenta externa de imagem ou vídeo por IA; sprite suavizado; boneco redesenhado à mão dentro do vídeo.
4. Texto fora da área segura; legenda sobre o rosto.

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo e a `RECEITA.md`; cheque a notícia em uma fonte que dá para citar.
2. Escreva o roteiro em seções (texto falado, título em 2 linhas, gesto e card) e aprove antes da voz; passe pela lista do que nunca acontece.
3. Crie `videos/AAAA-MM-DD-slug/`, copie `_ferramentas/episodio-base/src` e grave o `roteiro-falas.json`.
4. Faça a prévia sem voz (`tempos_sem_voz.py` e `previa.sh`) antes de gastar crédito de voz.
5. Use os moldes de card e o boneco de `componentes/` e `public/px/`; nunca redesenhe o boneco dentro do vídeo.
