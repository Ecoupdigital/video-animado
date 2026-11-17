# Receita de vídeo: narração inteira ou só letreiros na batida

Parte B deste universo (modelo `neon`, Neon retrô). O vídeo anuncia uma oferta, um lançamento, um evento ou uma contagem regressiva sobre o cenário fixo (céu, sol listrado, grade andando, varredura de TV, "PLAY" e contador de fita). O letreiro neon acende e troca no tempo certo, e as peças (o preço que conta, a contagem, o selo, o botão, o card final) entram nas batidas marcadas. Duas receitas, escolhidas na entrevista (pergunta 10) e trocáveis por vídeo (`"receita"` no roteiro):

- **Narração inteira** (`narracao-inteira`, padrão): uma voz só fala o texto inteiro; cada letreiro e cada peça acende na **palavra falada** marcada no roteiro. Custa crédito de voz (avisado antes).
- **Só letreiros** (`texto-e-musica`): sem voz, sem crédito. Cada cena dura um **número inteiro de compassos** e cada peça acende numa **batida da música**: a cama synth do kit (120 batidas por minuto, a primeira em 0 s) ou a música da pessoa, com o andamento dela no roteiro.

**Quando usar cada uma:** narração quando a oferta precisa de explicação (o que é, por que vale, a condição) ou quando a marca tem voz própria; só letreiros quando a mensagem cabe em 4 a 6 letreiros curtos (promoção relâmpago, contagem para a virada, abertura de evento), para postar rápido e sem custo.

Nada de tempo digitado à mão: tudo sai da transcrição (narração) ou do andamento (música). Siga na ordem e rode tudo da **raiz do universo**.

## 1. Conferir antes de escrever

- **Preço, preço antigo e prazo** conferidos com quem vende, no dia. O preço antigo só se ele existiu de verdade.
- **Preço e prazo ditos são os mesmos da tela:** "oitenta e nove e noventa" falado, `"preco": "R$ 89,90"` na tela; "até domingo" falado, "só até domingo" no prazo. O preço termina de contar exatamente no valor.
- **Nenhuma marca real de terceiros**, nem logo, nem foto de produto: o kit desenha tudo em código.
- **Nada de pressão falsa** ("últimas unidades" sem ser verdade, prazo que não acaba).
- Passe tudo pela lista do que nunca acontece (seção 12 do `BRANDBOOK-ANIMACAO.md`) e pelas pronúncias (seção 11 e `pronuncias.md`).

## 2. Roteiro em cenas e batidas (aprovado antes de qualquer voz)

Leia o `BRANDBOOK-ANIMACAO.md` (seções 2, 4, 7, 8 e 12). Cada cena usa um tipo pronto de `componentes/cenas.tsx`. Grave em `videos/AAAA-MM-DD-slug/roteiro-falas.json`.

**Narração inteira** (cada cena com `texto`, e cada batida é uma palavra do texto da cena; `"palavra#2"` para a segunda vez que ela aparece):

```json
{
  "receita": "narracao-inteira",
  "cenas": [
    { "tipo": "abertura", "texto": "Queima de estoque na arara: tudo da estação passada pela metade.",
      "letreiros": [["QUEIMA DE", "ESTOQUE"], ["PELA", "METADE"]], "batidas": { "letreiro1": "tudo" } },
    { "tipo": "oferta", "texto": "A jaqueta jeans saiu de cento e setenta e nove e noventa por oitenta e nove e noventa, só hoje.",
      "letreiros": [["JAQUETA", "JEANS"]], "batidas": { "letreiro0": "jaqueta", "o_que": "jaqueta", "preco": "saiu", "selo": "hoje" } },
    { "tipo": "final", "texto": "Corre que a arara está acabando.", "batidas": { "card": "corre" } }
  ]
}
```

**Só letreiros** (cada cena com `compassos`, e cada batida é o **número do tempo** dentro da cena: 1 é o primeiro tempo dela; um compasso tem 4 tempos):

```json
{
  "receita": "texto-e-musica",
  "cenas": [
    { "tipo": "abertura", "compassos": 2, "letreiros": [["QUEIMA DE", "ESTOQUE"], ["ATÉ", "50% OFF"]], "batidas": { "letreiro0": 1, "letreiro1": 5 } },
    { "tipo": "oferta", "compassos": 2, "letreiros": [["JAQUETA", "JEANS"]], "batidas": { "o_que": 1, "preco": 2, "selo": 5, "prazo": 6 } },
    { "tipo": "final", "compassos": 2, "batidas": { "card": 1 } }
  ]
}
```

Com a música da pessoa (`public/musica.mp3` ou `.wav`, que toca no lugar da cama), o roteiro diz o andamento dela: `"bpm": 118, "primeira_batida": 0.42` (o segundo da primeira batida na música). Sem isso, o `tempos_sem_voz.py` sai 1 dizendo o que falta.

- **Tipos e batidas:**

| `tipo` | Dados (o que a cena não diz sai da oferta das respostas) | Batidas |
|---|---|---|
| `abertura` | `letreiros` (obrigatório) | `letreiro0`, `letreiro1`, ... |
| `oferta` | `o_que`, `preco` e `preco_antigo` (formato brasileiro), `selo`, `prazo` | `o_que`, `preco` (começa a contar: 1 s, ou 2 tempos da música), `selo`, `prazo`, `letreiro<i>` |
| `contagem` | `forma` (`relogio` desce a partir do `relogio`, HH:MM:SS; `numeros` faz o 3, 2, 1 a partir do `de`, com o `texto_final` depois), `rotulo`, `prazo` | `contagem`, `letreiro<i>` |
| `chamada` | `botao` (o texto da pílula), `prazo` | `botao`, `letreiro<i>` |
| `final` | `chamada` (sem ela, a das respostas), `fontes` | `card` (sem ela, 0,4 s depois da voz, ou no começo da cena na música) |

- **Letreiro:** cada um com 1 ou 2 linhas (a de cima em contorno, a de baixo cheia), sempre em caixa alta. Ele fica aceso até o próximo, mesmo nas cenas sem letreiro. **Dois letreiros nunca acendem a menos de 1 s um do outro** (o `timing.py` e o `tempos_sem_voz.py` recusam): é o que segura a piscada em até 3 quedas de brilho por segundo.
- **Piscada:** o letreiro acende com um tremido e pisca de leve a cada 3 s, nunca no último 1 s antes de trocar. `"piscada": false` no roteiro desliga (acende sem tremido).
- **Algo novo a cada 1 a 2 s** (letreiro, preço, selo, botão), e o preço dito na palavra em que ele começa a contar.
- Mostre o roteiro para aprovação **antes de gerar qualquer voz**.

## 3. Pasta do vídeo e prévia sem voz

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/        # e grave $E/roteiro-falas.json
python3 _ferramentas/tempos_sem_voz.py $E                      # narração: tempos sintéticos; só letreiros: tempos na batida
npx tsc --noEmit
bash _ferramentas/previa.sh $E 0.3 2.3 4.3 6.3 8.3 10.3        # meia resolução + folha em $E/revisao/folha.png
python3 _ferramentas/conferir_piscada.py $E/revisao/previa.mp4 # a piscada dentro da regra
```

Olhe a folha: letreiro trocando, preço contando até o valor, selo, contagem, botão e card legíveis e dentro da área segura. Na receita só letreiros, a prévia já é o vídeo final (não há voz): renderize em resolução cheia com `npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public`.

## 4. Voz (só na narração inteira)

- **Avise o custo antes**: quantos caracteres vão para a voz (a soma dos `texto`) e o caminho da voz (seção 10 do brandbook). **Uma versão por vez**: gere, ouça, e só gere outra se a pessoa pedir.
- A narração inteira sai de uma vez, num arquivo só: `$E/public/narracao.mp3` (ou `.wav`).
- **Trecho errado** (preço lido errado, nome trocado): gere só a frase certa e emende entre as duas pausas, sem refazer tudo:

```bash
python3 _ferramentas/emendar.py $E trecho-novo.mp3 <segundo-do-começo> <segundo-do-fim> [palavras-do-trecho.json]
```

Depois, rode o `timing.py` e o `duck.py`.

## 5. Tempo de cada palavra, batidas e ducking (narração)

```bash
python3 _ferramentas/transcrever.py $E/public/narracao.mp3 $E/src/words.json   # [["palavra", início, fim], ...]
python3 _ferramentas/timing.py $E [--fim 15]                                     # timing.json e falas.json pelo roteiro
python3 _ferramentas/duck.py $E                                                  # duck.json e os efeitos em public/sfx/
```

- `timing.py` confere cada cena (tipo, campos, preço no formato brasileiro, a regra do letreiro) e casa o roteiro inteiro com o `words.json`, palavra por palavra; cada batida entra no instante da palavra marcada. Tipo de cena que não existe, preço errado, ou batida cuja palavra não está no texto da cena ou no `words.json`: sai 1 dizendo qual.
- **Todo tempo é em segundos do áudio final**; a conversão para frame é só em `S()`. A duração é a da voz mais 3,2 s de card final, ou `--fim` (ou `"duracao_total"` no roteiro).
- A cama synth toca baixa e cai 60% com a voz; a voz fica acima dela.
- Arquivo temporário só dentro da pasta do vídeo, nunca em pasta temporária do sistema.

## 6. Conferência e render

```bash
npx tsc --noEmit
node _ferramentas/stills.mjs $E <início da palavra - 0,15> <início + 0,25>   # para 3 letreiros: o anterior antes, o novo aceso depois
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
python3 _ferramentas/conferir_piscada.py $E/out/ep.mp4                       # sai 0: no máximo 3 quedas por segundo, abaixo de 10% da tela
bash _ferramentas/frames.sh $E 1.2 3.4 5.6 ...                               # um frame por tempo + $E/frames/_folha.jpg
```

- **A piscada é conferida antes de entregar**, sempre: o `conferir_piscada.py` lê o vídeo e diz, por janela de 1 s, quantas quedas de brilho houve e a maior parte da tela que piscou. Sai 1 acima de 3 por segundo ou de 10% da tela; aí, espace os letreiros ou desligue a piscada (`"piscada": false`).
- **"Narração gerada por IA"** aparece no card final sempre que a voz é gerada (clonada ou pronta). Só sai com voz de áudio próprio e `fecho.aviso_ia: false`. Na receita só letreiros não há voz, e o aviso não aparece.
- Volume: `ffmpeg -ss 1 -t 3 -i $E/out/ep.mp4 -af volumedetect -f null -` (voz) contra o mesmo num trecho só de cama: a cama fica abaixo da voz e audível.
- Render final 1080 x 1920, 30 fps.

## Sons

Efeitos e cama por `_ferramentas/synth_sfx.py`, só com numpy (origem e o andamento da cama em `_ferramentas/sfx/ORIGEM.md`). O episódio toca os efeitos sozinho: o zumbido do neon em cada letreiro que acende, o tique do preço contando e da contagem, e o deslize das peças que entram. A cama tem bumbo em todo tempo, para a batida se ouvir.

## Ferramentas

Python 3 com numpy, ffmpeg e ffprobe; para transcrever, mlx-whisper (Mac) ou faster-whisper (Linux). Os `.sh` são bash comum (rodam no bash 3.2 do Mac). O `stills.mjs` usa o Chrome do sistema só no Linux. Nunca rode `npm install` dentro de um `node_modules` feito por link (`.motor-por-link`).
