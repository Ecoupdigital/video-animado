# Receita de vídeo: narração inteira

Parte B deste universo (modelo `explicacao`, família com 4 temas). Uma narração inteira, uma voz só, explica um processo, uma conta ou uma rotina; o título se escreve na palavra falada, e cada peça (caixa, seta, círculo, linha da conta, post-it que anda, clique do cursor) entra na palavra marcada do roteiro. O tema do universo (quadro, lousa, post-its ou tela de app) troca o visual, não o roteiro. Nada de tempo digitado à mão: tudo sai da transcrição. Siga na ordem e rode tudo da **raiz do universo**.

## 1. Conferir antes de escrever

- **Regra, número, prazo ou alíquota oficial:** cheque numa fonte que dá para citar (lei, órgão oficial, norma, documento) e anote o nome e a data. Esse dado vai com a fonte na tela (legenda) e no card final (`fontes` da cena `final`).
- **Nada de promessa** que depende da situação de cada um ("você vai pagar menos", "dá para fazer em 5 minutos").
- Passe tudo pela lista do que nunca acontece (seção 12 do `BRANDBOOK-ANIMACAO.md`) e pelas pronúncias (seção 11 e `pronuncias.md`).

## 2. Roteiro em cenas (aprovado antes da voz)

Leia o `BRANDBOOK-ANIMACAO.md` (seções 2, 4, 7 e 12). O roteiro é a narração inteira, dividida em cenas; cada cena usa um tipo pronto de `componentes/cenas.tsx` e marca as palavras em que as peças entram (`batidas`). Grave em `videos/AAAA-MM-DD-slug/roteiro-falas.json`:

```json
{
  "rotulo": "CONTAS EM DIA · PRÓ-LABORE",
  "cenas": [
    { "tipo": "abertura", "texto": "Como definir o seu pró-labore sem misturar as contas.",
      "titulo": "Como definir o seu *pró-labore*", "subtitulo": "sem misturar as contas", "icone": "carteira",
      "batidas": { "risco": "sem", "icone": "misturar" } },
    { "tipo": "passos", "texto": "Primeiro, separe as contas. Depois, defina um valor fixo. Aí, pague o INSS em dia.",
      "titulo": "Três *passos*", "passos": [ { "texto": "Separar as contas", "icone": "carteira" },
        { "texto": "Valor fixo por mês", "icone": "calendario" }, { "texto": "= INSS em dia", "icone": "check" } ],
      "batidas": { "passo0": "separe", "passo1": "defina", "passo2": "pague" } },
    { "tipo": "final", "texto": "Ficou alguma dúvida sobre o seu pró-labore?",
      "pergunta": "Ficou alguma *dúvida*?", "fontes": ["Receita Federal (2026)"], "batidas": { "chamada": "dúvida" } }
  ]
}
```

- **`texto`** é exatamente o que a voz vai falar (número e sigla por extenso, como em `pronuncias.md`). **`titulo`** usa palavras faladas na cena, na ordem; `*palavra*` sai no destaque. Palavra do título que não é falada entra junto com a anterior (o `timing.py` avisa).
- **Tipos e batidas** (papel → palavra do texto da cena; `"palavra#2"` para a segunda vez que ela aparece). Os 6 tipos valem nos 4 temas:

| `tipo` | Dados | Batidas |
|---|---|---|
| `abertura` | `titulo`, `rotulo` (troca o do topo só nesta cena), `subtitulo`, `icone` | `risco` (o risco embaixo do título), `icone`, `subtitulo` |
| `passos` | `titulo`, `passos` (2 a 4, `texto` e `icone`; o último sai no destaque e ganha o círculo), `legenda` | `passo0`..`passo3` (a caixa se desenha, ou o post-it cola, ou o cartão sobe), `seta0`..`seta2`, `circulo`, `legenda` |
| `conta` | `titulo`, `linhas` (1 a 4; `*trecho*` no destaque), `resultado`, `legenda` | `linha0`..`linha3`, `resultado`, `circulo`, `legenda` |
| `colunas` | `titulo`, `colunas` (2 ou 3 nomes), `cartoes` (até 6: `texto`, `coluna` de 0 a 2, `vai` para onde anda), `legenda` | `cartao0`..`cartao5` (entra), `anda0`..`anda5` (o cartão anda de coluna), `legenda` |
| `tela` | `titulo`, `tela` (`secao`, `botao`, `menu`, `itens`, `novo`: o item que aparece depois do clique), `legenda` | `janela`, `cursor` (começa a andar), `clique`, `novo`, `legenda` |
| `final` | `pergunta`, `fontes` (lista de textos) | `chamada` ("comenta aqui"), `card` (sem ela, o card final entra 0,4 s depois da voz) |

- Ícones: `moeda`, `calendario`, `documento`, `relogio`, `grafico`, `pessoa`, `check`, `alerta`, `etiqueta`, `lampada`, `carteira`, `porcento`, `casa`, `lista`.
- Sem batida, a peça entra numa fração fixa da cena (só a ordem visual). **A primeira batida de cada cena vai na primeira ou na segunda palavra dela** (o primeiro passo, a primeira linha, a janela), e as outras a cada cerca de 1 s: tela parada mais de 1 s sem nada entrando quebra o ritmo.
- **Peça na palavra:** o passo entra no verbo que o diz ("separe"), o cartão anda quando a voz fala da tarefa ("feito", "pronto"), o clique cai no verbo ("clique", "crie").
- **Janela de app:** sempre o painel genérico do kit; o endereço é o nome da marca do universo (ou um genérico). Nunca o nome, a cor ou o desenho de um app real.
- **Número e regra oficial com fonte:** na legenda da cena e em `fontes` da cena `final`.
- Mostre o roteiro para aprovação **antes de gerar qualquer voz**.

## 3. Pasta do vídeo e prévia sem voz

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/        # e grave $E/roteiro-falas.json
python3 _ferramentas/tempos_sem_voz.py $E                      # words.json, timing.json, falas.json e duck.json sintéticos, efeitos em public/sfx/
npx tsc --noEmit
bash _ferramentas/previa.sh $E 1 2 3 4 5 6 7 8 9 10 11 12      # meia resolução + folha em $E/revisao/folha.png
```

Olhe a folha: algo novo a cada cerca de 1 s, título dentro da área segura, peça entrando na palavra, card final legível. Corrija e rode de novo. Só depois disso a voz. Para olhar um instante exato sem renderizar o vídeo: `node _ferramentas/stills.mjs $E 3.2 7.5` (grava em `$E/stills/`).

## 4. Voz (uma narração, uma voz)

- **Avise o custo antes**: quantos caracteres vão para a voz (a soma dos `texto`) e o caminho da voz (seção 10 do brandbook). **Uma versão por vez**: gere, ouça, e só gere outra se a pessoa pedir.
- A narração inteira sai de uma vez, num arquivo só: `$E/public/narracao.mp3` (ou `.wav`).
- **Trecho errado** (sigla lida errado, número trocado): não gere tudo de novo. Gere só a frase certa e emende entre as duas pausas:

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
- `duck.py`: 1 onde a voz fala, 0 nas pausas; a cama leve (`sfx/cama.wav`, em laço) toca a 0,5 e cai 60% com a voz.
- Arquivo temporário só dentro da pasta do vídeo, nunca em pasta temporária do sistema.

## 6. Conferência e render

```bash
npx tsc --noEmit
node _ferramentas/stills.mjs $E <início da palavra - 0,15> <início + 0,25>   # para 3 palavras marcadas: a peça ausente antes e na tela depois
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
bash _ferramentas/frames.sh $E 1.2 3.4 5.6 ...      # um frame por tempo + $E/frames/_folha.jpg
```

- **Stills de conferência antes do render:** para 3 palavras marcadas (uma caixa que se desenha, um cartão que anda, um clique), um still 0,15 s antes do início dela no `words.json` (peça ausente) e um 0,25 s depois (peça na tela). Nada fora da área segura, card final com a assinatura, as fontes e o aviso.
- **"Narração gerada por IA"** aparece no card final sempre que a voz é gerada (clonada ou pronta), **ligado por padrão**. Só sai com voz de áudio próprio e `fecho.aviso_ia: false` nas respostas.
- Volume: `ffmpeg -ss 1 -t 3 -i $E/out/ep.mp4 -af volumedetect -f null -` (voz) contra o mesmo num trecho só de cama (depois da voz): a cama fica abaixo da voz e audível.
- Render final 1080 x 1920, 30 fps.

## Sons

Efeitos e cama por `_ferramentas/synth_sfx.py`, só com numpy (origem em `_ferramentas/sfx/ORIGEM.md`). O episódio toca os efeitos sozinho, nos mesmos instantes das peças (`efeitos()` em `componentes/cenas.tsx`), com o som do tema: risco de caneta no quadro e nos post-its, risco de giz na lousa, pop do post-it, deslize do cartão, clique do cursor, tique dos itens pequenos. Cama leve, sem clima de suspense; o card final entra limpo, só com a cama descendo.

## Ferramentas

Python 3 com numpy, ffmpeg e ffprobe; para transcrever, mlx-whisper (Mac) ou faster-whisper (Linux). Os `.sh` são bash comum (rodam no bash 3.2 do Mac). O `stills.mjs` usa o Chrome do sistema só no Linux. Nunca rode `npm install` dentro de um `node_modules` feito por link (`.motor-por-link`).
