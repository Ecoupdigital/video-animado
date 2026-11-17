# Receita de vídeo: narração inteira

Parte B deste universo (modelo `mesa`, Mesa vista de cima). Uma narração inteira, uma voz só, ensina um passo a passo; a mesa é vista de cima, e cada item (ingrediente, produto ou material) cai ou aparece na palavra marcada do roteiro, a etiqueta de papel troca de passo e a faixa de legenda traz a frase com a palavra destacada. A superfície (madeira, mármore ou pano) e a peça central (do grupo principal) são do universo; o roteiro de cada vídeo usa qualquer item dos 3 grupos. Nada de tempo digitado à mão: tudo sai da transcrição. Siga na ordem e rode tudo da **raiz do universo**.

## 1. Conferir antes de escrever

- **Quantidade, tempo e regra:** cheque numa fonte que dá para citar quando o vídeo der medida, tempo de preparo, validade ou regra de uso (receita testada, instrução do fabricante, norma). Esse dado vai com a fonte no card final (`fontes` da cena `final`).
- **Quantidade e tempo ditos são os mesmos da tela:** "três tomates" falado, `"quantidade": 3` no item; "quarenta e oito horas" falado, "48 horas" no título do passo.
- **Nenhum produto de marca real:** os itens do kit são genéricos (frasco sem rótulo, batom e cola sem marca). Nunca cite marca real no texto da voz nem na tela.
- **Nada de promessa** que depende de cada um ("pele perfeita", "nunca mais erra o ponto").
- Passe tudo pela lista do que nunca acontece (seção 12 do `BRANDBOOK-ANIMACAO.md`) e pelas pronúncias (seção 11 e `pronuncias.md`).

## 2. Roteiro em cenas (aprovado antes da voz)

Leia o `BRANDBOOK-ANIMACAO.md` (seções 2, 4, 7 e 12). O roteiro é a narração inteira, dividida em cenas; cada cena usa um tipo pronto de `componentes/cenas.tsx` e marca as palavras em que os itens entram (`batidas`). Grave em `videos/AAAA-MM-DD-slug/roteiro-falas.json`:

```json
{
  "rotulo": "MAKE DO DIA · PELE LEVE",
  "cenas": [
    { "tipo": "abertura", "texto": "Make de cinco minutos para sair de casa, com tudo na bancada.",
      "titulo": "Make de *5 minutos* para sair de casa", "frase": "Tudo na bancada antes de começar" },
    { "tipo": "passo", "texto": "Base: duas gotas no dorso da mão, um risco de teste na bandeja e o pincel espalhando do centro para fora.",
      "titulo": "Base em 2 gotas", "frase": "Base só no *centro* do rosto",
      "itens": [ { "item": "base", "lugar": "mesa" }, { "item": "base" }, { "item": "pincel" } ],
      "batidas": { "item0": "base", "item1": "risco", "item2": "pincel" } },
    { "tipo": "final", "texto": "E você, qual passo sempre pula? Comenta aqui.",
      "pergunta": "Qual passo você sempre *pula*?", "fontes": [], "batidas": { "card": "aqui" } }
  ]
}
```

- **`texto`** é exatamente o que a voz vai falar (número e medida por extenso, como em `pronuncias.md`). **`titulo`** é o título na etiqueta (curto: de 2 a 6 palavras); **`frase`** é a faixa de legenda, com `*palavra*` no destaque (uma palavra por faixa).
- **Tipos e batidas** (papel → palavra do texto da cena; `"palavra#2"` para a segunda vez que ela aparece):

| `tipo` | Dados | Batidas |
|---|---|---|
| `abertura` | `titulo` (na etiqueta grande), `rotulo` (o rótulo mono da etiqueta só nesta cena; sem ele, o `rotulo` do roteiro ou o nome da marca), `frase` (faixa, opcional) | `faixa` (só fora da primeira cena: a primeira já está na tela no quadro 0) |
| `passo` | `titulo`, `frase`, `itens` (lista), `numero` e `de` (opcionais: "PASSO 3 DE 5" num vídeo que mostra só parte da receita; sem eles, a ordem dos passos do vídeo) | `item0`, `item1`, ... (o item i cai ou aparece nesta palavra), `faixa` |
| `final` | `pergunta` (sem ela, a chamada do card final das respostas), `fontes` (lista de textos) | `faixa`, `card` (sem ela, o card final entra 0,4 s depois da voz) |

- **Cada item:** `{ "item": "<código>", "lugar": "mesa" ou "centro", "entrada": "cai" ou "aparece", "quantidade": n }`. O código é um dos 22 da biblioteca (seção 4 do brandbook; o `timing.py` recusa outro e diz os aceitos). Sem `lugar`, o item que vira cobertura cai sobre a peça central (massa, molho, queijo, tomate, folha, farinha, base, batom, sombra, papel, cola, botão, fita) e os outros caem na mesa; `"lugar": "mesa"` põe o item inteiro na mesa. Sem `entrada`, ele **cai**. `quantidade` na mesa vira um grupinho de até 6 no mesmo lugar; sobre a peça central, o número de pedaços (até 12).
- **Um item por batida**, na palavra em que a voz fala dele ("o **queijo**", "duas gotas de **base**"). **A primeira batida do passo vai na primeira ou na segunda palavra dele**, e as outras a cada cerca de 1 s: mesa parada mais de 1 s sem nada entrando quebra o ritmo.
- **Até 4 itens na mesa por passo** (com etiqueta e faixa curtas cabem até 6; o `timing.py` avisa). Mais que isso, divida o passo em dois. O que cai sobre a peça central não conta: ela vai juntando tudo até o fim do vídeo, e a peça pronta aparece no final.
- **Quantidade e tempo ditos iguais aos da tela** (seção 1). Item que não existe na biblioteca entra no kit primeiro (`componentes/itens/` e `opcoes.json`), nunca desenhado dentro do vídeo.
- Mostre o roteiro para aprovação **antes de gerar qualquer voz**.

## 3. Pasta do vídeo e prévia sem voz

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/        # e grave $E/roteiro-falas.json
python3 _ferramentas/tempos_sem_voz.py $E                      # words.json, timing.json, falas.json e duck.json sintéticos, efeitos em public/sfx/
npx tsc --noEmit
bash _ferramentas/previa.sh $E 1 2 3 4 5 6 7 8 9 10 11 12      # meia resolução + folha em $E/revisao/folha.png
```

Olhe a folha: algo novo a cada cerca de 1 s, etiqueta trocando de passo, itens em sequência sem cobrir a etiqueta, a faixa nem outro item, card final legível. Corrija e rode de novo. Só depois disso a voz. Para olhar um instante exato sem renderizar o vídeo: `node _ferramentas/stills.mjs $E 3.2 7.5` (grava em `$E/stills/`).

## 4. Voz (uma narração, uma voz)

- **Avise o custo antes**: quantos caracteres vão para a voz (a soma dos `texto`) e o caminho da voz (seção 10 do brandbook). **Uma versão por vez**: gere, ouça, e só gere outra se a pessoa pedir.
- A narração inteira sai de uma vez, num arquivo só: `$E/public/narracao.mp3` (ou `.wav`).
- **Trecho errado** (medida lida errado, nome trocado): não gere tudo de novo. Gere só a frase certa e emende entre as duas pausas:

```bash
python3 _ferramentas/emendar.py $E trecho-novo.mp3 <segundo-do-começo> <segundo-do-fim> [palavras-do-trecho.json]
```

O corte vai para a pausa mais perto de cada ponto (silêncio abaixo de -38 dB), o trecho novo entra com respiro de 0,18 s antes e 0,30 s depois e crossfade de 15 ms, no volume do trecho trocado; `words.json` e `timing.json` andam a diferença. A narração anterior fica em `public/narracao.antes-da-emenda.*`. Depois, rode o `timing.py` e o `duck.py`.

## 5. Tempo de cada palavra, batidas e ducking

```bash
python3 _ferramentas/transcrever.py $E/public/narracao.mp3 $E/src/words.json   # [["palavra", início, fim], ...]
python3 _ferramentas/timing.py $E [--fim 15]                                     # timing.json e falas.json pelo roteiro
python3 _ferramentas/duck.py $E                                                  # duck.json (a cama abaixa quando a voz fala) e os efeitos em public/sfx/
```

- `transcrever.py`: mlx-whisper no Mac, faster-whisper no Linux, com os nomes do universo e os nomes próprios do roteiro no prompt.
- `timing.py` confere cada item contra a biblioteca do kit e casa o roteiro inteiro com o `words.json`, palavra por palavra (sem acento e sem pontuação); cada batida entra no instante da palavra marcada. Item fora da biblioteca, ou batida cuja palavra não está no texto da cena ou no `words.json`, sai 1 dizendo qual: corrija o roteiro (o texto tem de ser o que foi falado) ou a palavra no `words.json`.
- **Todo tempo é em segundos do áudio final**; a conversão para frame é só em `S()`. A duração do vídeo é a da voz mais 3,2 s de card final, ou `--fim` (ou `"duracao_total"` no roteiro).
- `duck.py`: 1 onde a voz fala, 0 nas pausas; a cama leve (`sfx/cama.wav`, em laço) toca a 0,5 e cai 60% com a voz.
- Arquivo temporário só dentro da pasta do vídeo, nunca em pasta temporária do sistema.

## 6. Conferência e render

```bash
npx tsc --noEmit
node _ferramentas/stills.mjs $E <início da palavra - 0,15> <início + 0,25>   # para 3 itens: ausente antes e assentado na mesa depois
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
bash _ferramentas/frames.sh $E 1.2 3.4 5.6 ...      # um frame por tempo + $E/frames/_folha.jpg
```

- **Stills de conferência antes do render:** para 3 itens marcados, um still 0,15 s antes do início da palavra no `words.json` (item ausente) e um 0,25 s depois (item já assentado: a queda leva 0,22 s). Nada fora da área segura, card final com a assinatura, as fontes e o aviso.
- **"Narração gerada por IA"** aparece no card final sempre que a voz é gerada (clonada ou pronta), **ligado por padrão**. Só sai com voz de áudio próprio e `fecho.aviso_ia: false` nas respostas.
- Volume: `ffmpeg -ss 1 -t 3 -i $E/out/ep.mp4 -af volumedetect -f null -` (voz) contra o mesmo num trecho só de cama (depois da voz): a cama fica abaixo da voz e audível.
- Render final 1080 x 1920, 30 fps.

## Sons

Efeitos e cama por `_ferramentas/synth_sfx.py`, só com numpy (origem em `_ferramentas/sfx/ORIGEM.md`). O episódio toca os efeitos sozinho, nos mesmos instantes dos itens (`efeitos()` em `componentes/cenas.tsx`): o pouso do item tem um som por superfície (madeira, mármore, pano), o pedaço sobre a peça central um toque curto, o item que aparece um pop, a etiqueta o som de papel e a faixa um deslize. Cama leve, sem clima de suspense; o card final entra com um pop e a cama descendo.

## Ferramentas

Python 3 com numpy, ffmpeg e ffprobe; para transcrever, mlx-whisper (Mac) ou faster-whisper (Linux). Os `.sh` são bash comum (rodam no bash 3.2 do Mac). O `stills.mjs` usa o Chrome do sistema só no Linux. Nunca rode `npm install` dentro de um `node_modules` feito por link (`.motor-por-link`).
