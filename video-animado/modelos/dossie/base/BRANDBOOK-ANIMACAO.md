# {{universo.nome}}

Reel narrado, desenhado em código, no modelo "Dossiê investigativo": uma narração inteira conta um caso ou uma notícia, e o texto cinético, os carimbos, as fichas, os fios, as rotas e os gráficos entram na palavra falada. Sem personagem e sem foto: pessoa citada aparece como silhueta.

Criado em {{data}} a partir do modelo `dossie` versão {{versao_modelo}} · par deste arquivo: `BRANDBOOK-ANIMACAO.html` (mesmo conteúdo, com as imagens; gere de novo com `node _preview/gerar-html.mjs`, rodado na raiz do universo, sempre que este arquivo mudar). As respostas da entrevista ficam em `respostas.json`; para trocar nome, marca, tema, cores, fontes, rótulo, manchetes ou card final, mude o `respostas.json` e rode de novo `novo_universo.mjs --aplicar`.

## 1. Resumo em 5 linhas

1. **Assunto e público:** {{universo.assunto}}. Público: {{universo.publico}}.
2. **Tom:** {{universo.tom}}.
3. **Personagens:** nenhum. A narração conduz; quem é citado no caso aparece em ficha com silhueta.
4. **Cenas:** gancho com número, ficha, ligação com fio, rota, tombo, linha do tempo, cartão de fonte e card final, sobre o fundo vivo do tema.
5. **Visual:** tema {{tema_nome}}, vertical 1080 x 1920, 30 fps, ritmo rápido (algo novo a cada segundo).

## 2. Narrativa do universo

<!-- ESCREVER: que tipo de caso a série conta (de onde vêm os fatos, que pergunta cada vídeo responde) e 1 a 3 formatos de vídeo (caso do dia, linha do tempo de uma história, "o que ninguém te contou sobre..."). Frases completas, como gente fala. -->

**Estrutura do episódio (40 a 75 s, uma narração só):**
1. **Gancho (0 a 3 s):** o fato mais forte numa frase, com um número ou um carimbo, já no primeiro segundo.
2. **Quem e o quê:** ficha de quem está no caso (silhueta, nome, papel) e o que se sabe.
3. **A ligação:** fio entre as partes, rota do dinheiro ou do produto, linha do tempo das datas.
4. **O impacto:** o número que mudou (tombo, contador), com a fonte na tela.
5. **A leitura:** o que isso quer dizer, sem afirmar culpa ("segundo a reportagem", "X nega").
6. **Card final (cerca de 3 s):** {{fecho_resumo}}

**Rótulo do topo:** "{{rotulo}}", com o selo "{{selo}}" piscando no canto.

**Manchetes da faixa rolando** (as do vídeo, quando o roteiro trouxer, substituem estas):

{{lista_manchetes}}

**Marca:** {{marca_resumo}}

## 3. Personagens

Este universo não usa personagem. Quem conduz o vídeo é a narração (uma voz só, o texto inteiro), com o texto cinético entrando em cada palavra falada. Pessoas e empresas do caso entram nas cenas pelo roteiro do vídeo, sempre em `Polaroid` com **silhueta**: nenhum rosto é baixado nem gerado. Foto só entra se a própria pessoa do universo colocar uma foto que pode usar em `public/fotos/` do vídeo e registrar em `componentes/fotos.ts` (o registro nasce vazio).

<!-- ESCREVER: o jeito de narrar (ritmo, como apresenta uma pessoa citada, como diz o que é suspeita e o que é fato, o que nunca diz). -->

## 4. Cenas e fundo

Não há cenário desenhado: cada cena é uma composição de peças sobre o **fundo vivo** do tema (`componentes/fundo.tsx`): holofote varrendo (luz quente no tema claro), pontilhado que desce, partículas de texto subindo, documentos borrados passando em parallax no primeiro plano, grão, vinheta, o rótulo do topo e a barra de progresso. As cenas de exemplo estão em `componentes/cenas.tsx`, montadas pelos dados do roteiro:

| Cena (`tipo`) | O que mostra | Peças |
|---|---|---|
| `gancho` | título cinético, rótulo mono, número grande que conta, linhas de arquivo se escrevendo, ficha e carimbo | `Titulo`, `Contador`, `Digitando`, `Polaroid`, `Carimbo` |
| `ficha` | a pessoa ou empresa citada: polaroid com silhueta, card de dados e marcos de data | `Polaroid`, `Card`, `LinhaDoTempo`, `Carimbo` |
| `ligacao` | duas fichas ligadas pelo fio vermelho com pulsos, cards de empresa e valor, selo de quem nega | `Fio`, `Polaroid`, `Card`, `Selo` |
| `rota` | mapa em grade, nós que pulsam e o caminho se desenhando, desvio em alerta, bloqueio | `No`, `Traco`, `Card` |
| `tombo` | gráfico caindo com setas e o valor da queda | `Grafico`, `Contador` |
| `linha` | linha do tempo com as datas acendendo | `LinhaDoTempo` |
| `fonte` | cartão de fonte com veículo e data | `CartaoFonte` |
| `final` | pergunta, "comenta aqui" e o card final | `CardFinal` |

Os stills `cena-<tipo>-<tema>` do `_preview` mostram cada cena nos 3 temas, com a área segura marcada.

## 5. Cores

**Tema {{tema_nome}}.** Os três temas prontos (investigativo escuro, jornal claro, neutro de marca) estão no still `temas`; os tokens moram em `componentes/opcoes.json` (`paletas` e `estilos`) e os componentes pegam a cor pelo papel com `useTema()` (`T.c.destaque`, `T.a('alerta', 0.3)`), nunca por hex fixo. Proporção: 70% fundo, 20% texto e cards, 8% destaque, 2% alerta.

{{tabela_cores}}

**Vermelho (`alerta`) só em alerta:** carimbo, queda, fio que liga suspeitos, bloqueio. Nunca em título comum nem em número positivo.

## 6. Fontes

{{tabela_fontes}}

Carregadas por `componentes/fontes.ts` (Google Fonts pelo `@remotion/google-fonts`), só as que os temas e as trocas usam. Tamanhos de referência (1080 de largura): título cinético 84 a 120 px (encolhe sozinho com texto longo), número grande 150 a 250 px, card 38 a 52 px, rótulo mono 22 a 34 px, faixa 26 px, letra miúda do card final 22 px.

## 7. Grade da tela e textos

Área segura do Reels: nada importante nos **220 px do topo** nem nos **380 px de baixo** (abaixo de y 1540), nem a menos de **70 px das laterais**. O still de conferência mostra a área marcada.

| Faixa (y) | O que vai |
|---|---|
| 0 a 8 | barra de progresso (sem texto) |
| 230 a 270 | rótulo do topo ("{{rotulo}}") e o selo "{{selo}}" |
| 300 a 620 | título cinético (palavra por palavra, na hora em que é falada) |
| 560 a 1300 | peça principal da cena (polaroid, fio, rota, gráfico, número) |
| 1240 a 1440 | cards, marcos de data, selos |
| 1462 a 1540 | faixa rolando com as manchetes |

**Carimbo de acusação nunca cai sobre o rosto da silhueta:** fica sobre a ficha (a faixa de baixo da polaroid) ou ao lado dela. Texto longo quebra e encolhe dentro da área segura (título, nome da ficha, assinatura). Número de 1 dígito não conta: aparece já com o valor final.

## 8. Movimento

- **Câmera viva:** cada cena entra com zoom de 0,86 para 1, blur que limpa e um giro leve; sai com zoom para 1,22 e blur. Durante a cena, deriva lenta e zoom de 6%.
- **Punch:** nos golpes (`boom`) e batidas (`hit`), a câmera dá um soco de zoom de 3 a 7% e treme; no golpe, um clarão rápido.
- **Glitch no corte:** separação de cor de 10 px nos 4 primeiros e 3 últimos frames de cada cena, com o som `glitch` ou `whoosh`.
- **Texto cinético:** cada palavra entra com mola no instante em que é falada (tempo do `words.json`); a palavra-chave no destaque.
- **Ritmo:** algo novo a cada cerca de 1 s (palavra, card, nó, data, contador).
- **Som:** cama de suspense por baixo, que abaixa quando a voz fala (`duck.json`) e volta nas pausas; efeitos `boom`, `hit`, `stamp`, `whoosh`, `tick`, `glitch`, `riser`, `contador` e outros, gerados por código (origem em `_ferramentas/sfx/ORIGEM.md`).
- **Nunca:** tremer o vídeo inteiro o tempo todo, texto parado por mais de 3 s, entrar duas peças grandes no mesmo frame.

## 9. Peças

O dossiê não tem expressões: o que se repete são as peças, em `componentes/pecas.tsx`, todas com o tema. Folha no still `elenco` (peças lado a lado).

| Peça | Quando usar |
|---|---|
| `Titulo` | título cinético; `*palavra*` no roteiro sai no destaque |
| `Carimbo` | a acusação ou o fato que muda o caso ("suspeita de ...", "negou"), sempre sobre a ficha ou ao lado |
| `Selo` | rótulo curto ("X nega", "em apuração", "fonte oficial") |
| `Card` | dado com rótulo mono (cargo, valor, empresa) |
| `Contador` | número que sobe ou cai até o valor (1 dígito aparece pronto) |
| `Traco` | linha SVG que se desenha |
| `Polaroid` | ficha de pessoa ou empresa, com silhueta (ou a foto que a pessoa fornecer), fita e etiqueta |
| `Fio` | fio vermelho com pulsos ligando duas fichas |
| `No` | nó de rota que pulsa |
| `Grafico` | linha caindo com área e setas |
| `LinhaDoTempo` | datas acendendo numa linha que se desenha |
| `CartaoFonte` | de onde veio o fato (veículo, data) |
| `CardFinal` | assinatura, fontes, aviso de narração por IA e a linha de sem acusação formal |
| `Faixa` | manchetes rolando no rodapé |

## 10. Voz

Caminho escolhido: {{voz.caminho}}. **Uma narração inteira, uma voz só**, gerada de uma vez a partir do roteiro aprovado (1 versão por vez, custo avisado antes). Um trecho que saiu errado se emenda (`_ferramentas/emendar.py`), sem gerar a narração de novo. Receita em `RECEITA.md`.

{{tabela_vozes}}

## 11. Pronúncias

<!-- ESCREVER: nomes, siglas, números e valores do assunto que a voz pode errar, e como devem soar, uma linha cada. A tabela completa fica em pronuncias.md, que o transcrever.py também lê. -->

## 12. Proibições

1. Afirmar culpa: o roteiro usa linguagem de suspeita ("suspeita de", "segundo a reportagem", "X nega"), e fato confirmado é separado de alegação.
2. Foto de pessoa real que a própria pessoa do universo não forneceu; baixar ou gerar rosto. Até lá, silhueta.
3. Carimbo de acusação sobre o rosto de quem não é acusado.
4. Fato sem fonte na tela e no card final; frase inventada atribuída a alguém.
5. Ferramenta externa de imagem ou vídeo por IA; texto fora da área segura; vermelho fora de alerta.

O que nunca acontece neste universo:

{{lista_nunca}}

## 13. Como usar em um vídeo novo

1. Leia este arquivo e a `RECEITA.md`; cheque cada fato na web e separe fato confirmado de alegação.
2. Escreva o roteiro (a narração inteira) e aprove antes da voz; passe pela lista do que nunca acontece.
3. Crie `videos/AAAA-MM-DD-slug/`, copie `_ferramentas/episodio-base/src` e grave o `roteiro-falas.json` com as cenas e as palavras de cada batida.
4. Faça a prévia sem voz (`tempos_sem_voz.py` e `previa.sh`) antes de gastar crédito de voz.
5. Use as peças e as cenas de `componentes/`; nunca redesenhe uma peça dentro do vídeo.
