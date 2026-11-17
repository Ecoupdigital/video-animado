# Receita de vídeo: narração inteira

Parte B deste universo (modelo `dossie`). Uma narração inteira, uma voz só, conta um caso ou uma notícia; o texto cinético entra na palavra falada, e cada peça (ficha, carimbo, fio, rota, gráfico, linha do tempo) entra na palavra marcada do roteiro. Nada de tempo digitado à mão: tudo sai da transcrição. Siga na ordem e rode tudo da **raiz do universo**.

## 1. Apuração (antes de escrever)

- **Cheque cada fato na web**, em pelo menos uma fonte que dá para citar (reportagem, documento, comunicado oficial, ata). Anote veículo, data e link de cada um.
- **Separe fato confirmado de alegação.** Fato confirmado: o que um documento ou mais de uma fonte séria afirmam. Alegação: o que alguém disse, suspeita, investigação em andamento. No roteiro, cada alegação ganha a palavra que diz que é alegação.
- **Linguagem de suspeita, nunca de culpa:** "suspeita de", "segundo a reportagem", "a investigação apura", "X nega". Nunca "roubou", "desviou", "é culpado". Quem é citado e negou, aparece negando (o `selo` da ligação ou do final serve para isso).
- **Nenhuma frase inventada** atribuída a alguém, nem citação "parafraseada" entre aspas.
- Passe tudo pela lista do que nunca acontece (seção 12 do `BRANDBOOK-ANIMACAO.md`) e pelas pronúncias (seção 11 e `pronuncias.md`).

## 2. Roteiro (aprovado antes da voz)

Leia o `BRANDBOOK-ANIMACAO.md` (seções 2, 7, 9 e 12). O roteiro é a narração inteira, dividida em cenas; cada cena usa um tipo pronto de `componentes/cenas.tsx` e marca as palavras em que as peças entram (`batidas`). Grave em `videos/AAAA-MM-DD-slug/roteiro-falas.json`:

```json
{
  "manchetes": ["MANCHETE CURTA DA FAIXA", "OUTRA MANCHETE"],
  "cenas": [
    { "tipo": "gancho", "texto": "A reforma do salão custou o triplo do orçamento aprovado.",
      "titulo": "a reforma custou o *triplo*", "rotulo": "CUSTO FINAL",
      "valor": { "numero": 3, "sufixo": "x", "legenda": "o triplo do aprovado" },
      "pessoa": { "nome": "Construtora Alfa", "papel": "empresa da obra" }, "carimbo": "suspeita de sobrepreço",
      "batidas": { "valor": "triplo", "pessoa": "orçamento", "carimbo": "aprovado" } },
    { "tipo": "final", "texto": "A administradora nega. E aí, você aprovaria essa obra?",
      "pergunta": "e aí, você *aprovaria*?", "selo": "a administradora nega", "fontes": ["ata da assembleia (12/04)"],
      "cita_pessoas": true, "batidas": { "selo": "nega", "chamada": "obra" } }
  ]
}
```

- **`texto`** é exatamente o que a voz vai falar (número e sigla por extenso, como em `pronuncias.md`). **`titulo`** usa palavras faladas na cena, na ordem; `*palavra*` sai no destaque. Palavra do título que não é falada entra junto com a anterior (o `timing.py` avisa).
- **Tipos e batidas** (papel → palavra do texto da cena; `"palavra#2"` para a segunda vez que ela aparece):

| `tipo` | Dados | Batidas |
|---|---|---|
| `gancho` | `titulo`, `rotulo`, `valor` (`numero`, `prefixo`, `sufixo`, `casas`, `legenda`), `linha` (texto que se digita), `pessoa`, `carimbo` | `rotulo`, `valor`, `linha`, `pessoa`, `carimbo` |
| `ficha` | `titulo`, `pessoa` (`nome`, `papel`, `etiqueta`, `foto`), `campos` (até 3, `rotulo` e `valor`), `marcos` (`data`, `texto`, `alerta`), `carimbo` | `pessoa`, `campos`, `marco0`..., `carimbo` |
| `ligacao` | `titulo`, `de` e `para` (pessoas), `cards` (até 2), `selo`, `carimbo` | `de`, `para`, `fio`, `card0`, `card1`, `selo`, `carimbo` |
| `rota` | `titulo`, `nos` (2 a 4, `nome` e `sub`), `bloqueio`, `card` (`titulo`, `sub`) | `no0`..., `bloqueio`, `card` |
| `tombo` | `titulo`, `rotulo`, `valor` | `queda`, `valor` |
| `linha` | `titulo`, `marcos` (até 5) | `marco0`... |
| `fonte` | `titulo`, `fontes` (até 3, `veiculo`, `data`, `texto`) | `fonte0`... |
| `final` | `pergunta`, `fontes` (lista de textos), `cita_pessoas`, `selo` | `selo`, `chamada`, `card` (sem ela, o card final entra 0,4 s depois da voz) |

- Sem batida, a peça entra numa fração fixa da cena (só a ordem visual). Número de 1 dígito não conta: aparece pronto.
- **A primeira batida de cada cena vai na primeira ou na segunda palavra dela** (a ficha, o primeiro nó, o primeiro marco), e as outras a cada cerca de 1 s: tela parada mais de 1 s sem nada entrando quebra o ritmo do dossiê.
- **Carimbo de acusação** só sobre quem é suspeito, e nunca sobre o rosto: as cenas põem o carimbo sobre os ombros da silhueta, acima do nome. Quem não é acusado não ganha carimbo.
- **Foto:** só a que a própria pessoa do universo fornece e pode usar, em `public/fotos/` do vídeo, registrada em `componentes/fotos.ts` (`"foto": "ana"` na pessoa). Sem isso, silhueta. Nunca baixar nem gerar rosto de pessoa real.
- **Fato com fonte na tela** (cartão de fonte, card de investigação) **e no card final** (`fontes` da cena `final`). `cita_pessoas: true` acrescenta "Suspeitas reportadas, sem acusação formal contra as pessoas citadas." (padrão quando o caso cita pessoas).
- Mostre o roteiro para aprovação **antes de gerar qualquer voz**.

## 3. Pasta do vídeo e prévia sem voz

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/        # e grave $E/roteiro-falas.json
python3 _ferramentas/tempos_sem_voz.py $E                      # words.json, timing.json, falas.json e duck.json sintéticos, efeitos em public/sfx/
npx tsc --noEmit
bash _ferramentas/previa.sh $E 1 2 3 4 5 6 7 8 9 10 11 12      # meia resolução + folha em $E/revisao/folha.png
```

Olhe a folha: algo novo a cada cerca de 1 s, título dentro da área segura, carimbo fora do rosto, nada sobre a faixa, card final legível. Corrija e rode de novo. Só depois disso a voz. Para olhar um instante exato sem renderizar o vídeo: `node _ferramentas/stills.mjs $E 3.2 7.5` (grava em `$E/stills/`).

## 4. Voz (uma narração, uma voz)

- **Avise o custo antes**: quantos caracteres vão para a voz (a soma dos `texto`) e o caminho da voz (seção 10 do brandbook). **Uma versão por vez**: gere, ouça, e só gere outra se a pessoa pedir.
- A narração inteira sai de uma vez, num arquivo só: `$E/public/narracao.mp3` (ou `.wav`).
- **Trecho errado** (palavra em inglês, número lido errado): não gere tudo de novo. Gere só a frase certa e emende entre as duas pausas:

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
- `timing.py` casa o roteiro inteiro com o `words.json`, palavra por palavra (sem acento e sem pontuação); cada palavra do título entra no instante falado e cada batida no instante da palavra marcada. Batida cuja palavra não está no texto da cena ou não está no `words.json` sai 1 dizendo qual: corrija o texto da cena (tem de ser o que foi falado) ou a palavra no `words.json`.
- **Todo tempo é em segundos do áudio final**; a conversão para frame é só em `S()`. A duração do vídeo é a da voz mais 3,2 s de card final, ou `--fim` (ou `"duracao_total"` no roteiro).
- `duck.py`: 1 onde a voz fala, 0 nas pausas; a cama (`sfx/cama.wav`, em laço) toca a 0,55 e cai 55% com a voz.

## 6. Conferência e render

```bash
npx tsc --noEmit
node _ferramentas/stills.mjs $E <início de 3 palavras do título - 0,15> <início + 0,25>   # a palavra ausente antes e na tela depois
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
bash _ferramentas/frames.sh $E 1.2 3.4 5.6 ...      # um frame por tempo + $E/frames/_folha.jpg
```

- **Stills de conferência antes do render:** para 3 palavras do título, um still 0,15 s antes do início dela no `words.json` (ausente) e um 0,25 s depois (na tela). Nada fora da área segura, carimbo fora do rosto, card final com a assinatura, as fontes e o aviso.
- **"Narração gerada por IA"** aparece no card final sempre que a voz é gerada (clonada ou pronta). Só sai com voz de áudio próprio e `fecho.aviso_ia: false` nas respostas.
- Volume: `ffmpeg -ss 1 -t 3 -i $E/out/ep.mp4 -af volumedetect -f null -` (voz) contra o mesmo num trecho só de cama (depois da voz): a cama fica abaixo da voz e audível.
- Render final 1080 x 1920, 30 fps.

## Sons

Efeitos e cama por `_ferramentas/synth_sfx.py`, só com numpy (origem em `_ferramentas/sfx/ORIGEM.md`). O episódio toca os efeitos sozinho, nos mesmos instantes das peças (`efeitos()` em `componentes/cenas.tsx`): boom no número grande e na queda (com punch, tremida e clarão), hit nas fichas, stamp no carimbo, tick em card, nó e data, whoosh e glitch nos cortes, riser antes dos golpes. O card final entra limpo, só com a cama descendo.

## Ferramentas

Python 3 com numpy, ffmpeg e ffprobe; para transcrever, mlx-whisper (Mac) ou faster-whisper (Linux). Os `.sh` são bash comum (rodam no bash 3.2 do Mac). O `stills.mjs` usa o Chrome do sistema só no Linux. Arquivo temporário só dentro da pasta do vídeo. Nunca rode `npm install` dentro de um `node_modules` feito por link (`.motor-por-link`).
