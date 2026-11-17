# Receita de vídeo: narração inteira

Parte B deste universo (modelo `dados-historia`, família com 4 temas). Uma narração inteira, uma voz só, mostra um resultado em número ou conta uma história no tempo; o título entra na palavra falada, e cada peça (o número que conta, a coluna que sobe, o marco, o trecho de rota, o recorte que cai, o círculo à mão) entra na palavra marcada do roteiro. O tema do universo (isométrico, linha do tempo, mapa ou jornal) troca o visual, não o roteiro. Nada de tempo digitado à mão: tudo sai da transcrição. Siga na ordem e rode tudo da **raiz do universo**.

## 1. Conferir antes de escrever

- **Todo número, ano e percentual que vem de fora** (pesquisa, órgão oficial, notícia, relatório de terceiro): cheque numa fonte que dá para citar e anote o nome e a data. Esse dado vai **com a fonte na tela** (campo `fonte` da cena, que sai em mono embaixo da legenda) e no card final (`fontes` da cena `final`). Número da própria pessoa (o faturamento dela, os alunos dela) também leva a origem ("sistema de matrícula da rede").
- **O número que conta chega ao valor dito na palavra:** o valor na tela é exatamente o que a voz fala (o mesmo número, o mesmo arredondamento). Nada de "quase quarenta" na voz e 38 na tela.
- **Colunas na escala certa:** as alturas saem dos valores do roteiro (a maior é a mais alta); nunca invente valor para a coluna "ficar bonita".
- **Mapa:** é sempre o desenho genérico do kit. Nunca cite rua, bairro ou cidade de verdade nos chips nem na chegada (use "Unidade Centro", "Loja nova", "Depósito").
- **Nada de promessa** que depende da situação de cada um.
- Passe tudo pela lista do que nunca acontece (seção 12 do `BRANDBOOK-ANIMACAO.md`) e pelas pronúncias (seção 11 e `pronuncias.md`).

## 2. Roteiro em cenas (aprovado antes da voz)

Leia o `BRANDBOOK-ANIMACAO.md` (seções 2, 4, 7 e 12). O roteiro é a narração inteira, dividida em cenas; cada cena usa um tipo pronto de `componentes/cenas.tsx` e marca as palavras em que as peças entram (`batidas`). Grave em `videos/AAAA-MM-DD-slug/roteiro-falas.json`:

```json
{
  "rotulo": "FÔLEGO · 3º TRIMESTRE",
  "cenas": [
    { "tipo": "abertura", "texto": "O melhor trimestre da rede: mais quarenta e dois por cento de alunos novos.",
      "titulo": "O melhor *trimestre* da rede", "valor": { "numero": 42, "prefixo": "+", "sufixo": "%" },
      "subtitulo": "de alunos novos", "fonte": "sistema de matrícula da rede (set/2026)",
      "batidas": { "valor": "quarenta", "circulo": "alunos", "subtitulo": "novos" } },
    { "tipo": "colunas", "texto": "Matrículas por mês: julho teve cento e vinte, agosto duzentas, e setembro chegou a trezentas e quarenta.",
      "titulo": "Matrículas por *mês*", "valor": { "numero": 340 },
      "colunas": [ { "rotulo": "JUL", "valor": 120 }, { "rotulo": "AGO", "valor": 200 }, { "rotulo": "SET", "valor": 340 } ],
      "batidas": { "coluna0": "julho", "coluna1": "agosto", "coluna2": "setembro", "valor": "trezentas" } },
    { "tipo": "final", "texto": "Qual unidade é a sua?", "pergunta": "Qual unidade é a *sua*?",
      "fontes": ["sistema de matrícula da rede (set/2026)"], "batidas": { "chamada": "sua" } }
  ]
}
```

- **`texto`** é exatamente o que a voz vai falar (número, ano e sigla por extenso, como em `pronuncias.md`). **`titulo`** usa palavras faladas na cena, na ordem; `*palavra*` sai no destaque. Palavra do título que não é falada (um ano em algarismo, por exemplo) entra junto com a anterior (o `timing.py` avisa).
- **Tipos e batidas** (papel → palavra do texto da cena; `"palavra#2"` para a segunda vez que ela aparece). Os 6 tipos valem nos 4 temas:

| `tipo` | Dados | Batidas |
|---|---|---|
| `abertura` | `titulo`, `rotulo` (troca o do topo só nesta cena), `valor` (o número grande), `subtitulo`, `legenda`, `fonte` | `valor` (o número começa a contar), `circulo` (o círculo à mão em volta do número), `subtitulo`, `legenda` |
| `colunas` | `titulo`, `valor`, `colunas` (1 a 5: `rotulo` e `valor`; a última sai no destaque), `legenda`, `fonte` | `coluna0`..`coluna4` (a coluna sobe), `valor` (sem ela, junto com a última coluna), `circulo` (só no jornal), `legenda` |
| `marcos` | `titulo`, `marcos` (2 a 5: `ano` e `texto`; o último cheio), `legenda`, `fonte` | `marco0`..`marco4` (o marco entra e a linha desce até ele), `legenda` |
| `rota` | `titulo`, `trechos` (1 a 3, cada um com `chip` opcional: o tempo ou a distância), `chegada` (o nome no pino), `legenda`, `fonte` | `trecho0`..`trecho2` (o trecho se desenha pela rua), `pino` (sem ela, no fim do último trecho), `legenda` |
| `recortes` | `titulo` (o ano ou a frase grande), `sub` (a linha mono embaixo), `recortes` (1 a 3: `manchete` e `foto`, que tira a retícula com `false`), `circulo` (`palavra` à mão e `recorte`, qual recorte ele marca), `legenda`, `fonte` | `recorte0`..`recorte2` (o recorte cai e assenta), `circulo`, `legenda` |
| `final` | `pergunta`, `fontes` (lista de textos) | `chamada` ("comenta aqui"), `card` (sem ela, o card final entra 0,4 s depois da voz) |

- **Valor:** `{ "numero": 1250000, "prefixo": "R$ " }` vira "R$ 1.250.000"; `{ "numero": 4.5, "casas": 1, "sufixo": " mil" }` vira "4,5 mil"; `{ "numero": 38, "prefixo": "+", "sufixo": "%" }` vira "+38%". Milhar com ponto e decimal com vírgula, sempre.
- **Peça na palavra:** a batida `valor` vai na **primeira palavra do número falado** ("quarenta" em "quarenta e dois por cento"): o contador chega ao valor em 0,7 s, enquanto a voz termina de dizer o número. A coluna sobe no nome do mês ou da unidade; o marco entra quando a voz começa o ano; o trecho de rota se desenha a partir do lugar de saída e o pino cai na palavra da chegada ou do tempo; o recorte cai na palavra da notícia; o círculo fecha no detalhe.
- Sem batida, a peça entra numa fração fixa da cena (só a ordem visual). **A primeira batida de cada cena vai nas primeiras palavras dela**, e as outras a cada cerca de 1 a 2 s: tela parada mais de 2 s sem nada entrando quebra o ritmo (ano falado por extenso é longo: deixe a frase entre dois marcos curta).
- **Mostre o roteiro para aprovação antes de gerar qualquer voz.**

## 3. Pasta do vídeo e prévia sem voz

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/        # e grave $E/roteiro-falas.json
python3 _ferramentas/tempos_sem_voz.py $E                      # words.json, timing.json, falas.json e duck.json sintéticos, efeitos em public/sfx/
npx tsc --noEmit
bash _ferramentas/previa.sh $E 1 2 3 4 5 6 7 8 9 10 11 12      # meia resolução + folha em $E/revisao/folha.png
```

Olhe a folha: o número contando, a coluna subindo, os marcos em sequência, a rota se desenhando, o recorte caindo e o círculo, algo novo a cada 1 a 2 s, título dentro da área segura, card final legível. Corrija e rode de novo. Só depois disso a voz. Para olhar um instante exato sem renderizar o vídeo: `node _ferramentas/stills.mjs $E 3.2 7.5` (grava em `$E/stills/`).

## 4. Voz (uma narração, uma voz)

- **Avise o custo antes**: quantos caracteres vão para a voz (a soma dos `texto`) e o caminho da voz (seção 10 do brandbook). **Uma versão por vez**: gere, ouça, e só gere outra se a pessoa pedir.
- A narração inteira sai de uma vez, num arquivo só: `$E/public/narracao.mp3` (ou `.wav`).
- **Trecho errado** (número trocado, ano lido errado): não gere tudo de novo. Gere só a frase certa e emende entre as duas pausas:

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
- `timing.py` casa o roteiro inteiro com o `words.json`, palavra por palavra (sem acento e sem pontuação); cada palavra do título entra no instante falado e cada batida no instante da palavra marcada. Batida cuja palavra não está no texto da cena ou não está no `words.json` sai 1 dizendo qual: corrija o texto da cena (tem de ser o que foi falado) ou a palavra no `words.json`. Número que a transcrição escreveu em algarismo ("42" no lugar de "quarenta e dois"): corrija o `words.json` para o texto do roteiro.
- **Todo tempo é em segundos do áudio final**; a conversão para frame é só em `S()`. A duração do vídeo é a da voz mais 3,2 s de card final, ou `--fim` (ou `"duracao_total"` no roteiro).
- `duck.py`: 1 onde a voz fala, 0 nas pausas; a cama leve (`sfx/cama.wav`, em laço) toca a 0,5 e cai 60% com a voz.
- Arquivo temporário só dentro da pasta do vídeo, nunca em pasta temporária do sistema.

## 6. Conferência e render

```bash
npx tsc --noEmit
node _ferramentas/stills.mjs $E <início da palavra - 0,15> <início + 0,25>   # para 3 palavras marcadas: a peça ausente antes e na tela depois
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
bash _ferramentas/frames.sh $E 1.2 3.4 5.6 ...      # um frame por tempo + $E/frames/_folha.jpg
```

- **Stills de conferência antes do render:** para 3 palavras marcadas (uma coluna que sobe com o número contando, um marco, um trecho de rota ou um recorte), um still 0,15 s antes do início dela no `words.json` (peça ausente) e um 0,25 s depois (peça na tela). O número final na tela igual ao falado; nada fora da área segura; card final com a assinatura, as fontes e o aviso.
- **"Narração gerada por IA"** aparece no card final sempre que a voz é gerada (clonada ou pronta), **ligado por padrão**. Só sai com voz de áudio próprio e `fecho.aviso_ia: false` nas respostas.
- Volume: `ffmpeg -ss 1 -t 3 -i $E/out/ep.mp4 -af volumedetect -f null -` (voz) contra o mesmo num trecho só de cama (depois da voz): a cama fica abaixo da voz e audível.
- Render final 1080 x 1920, 30 fps.

## Sons

Efeitos e cama por `_ferramentas/synth_sfx.py`, só com numpy (origem em `_ferramentas/sfx/ORIGEM.md`). O episódio toca os efeitos sozinho, nos mesmos instantes das peças (`efeitos()` em `componentes/cenas.tsx`): tique do contador (um a cada 0,1 s enquanto o número conta), subida da coluna, pop do marco e do pino, risco de marcador do trecho de rota, papel caindo e risco de caneta do círculo. Cama leve, sem clima de suspense; o card final entra limpo, só com a cama descendo.

## Ferramentas

Python 3 com numpy, ffmpeg e ffprobe; para transcrever, mlx-whisper (Mac) ou faster-whisper (Linux). Os `.sh` são bash comum (rodam no bash 3.2 do Mac). O `stills.mjs` usa o Chrome do sistema só no Linux. Nunca rode `npm install` dentro de um `node_modules` feito por link (`.motor-por-link`).
