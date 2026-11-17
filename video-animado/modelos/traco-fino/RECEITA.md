# Receita de vídeo: narradora única

Parte B deste universo (modelo `traco-fino`). Uma narradora conta, em primeira pessoa, como era antes e como é agora. Só ela tem voz e só a boca dela abre, pelo volume da voz em cada frame; o antes aparece apagado em sépia (`<Lembranca>`, com a aparência do antes); a legenda vem por frase inteira, repartida pelo número de palavras de cada fala; a trilha toca baixa por baixo da voz e o vídeo fecha com o `Fecho`. Siga na ordem e rode tudo da **raiz do universo**.

## 1. Roteiro

- Leia o `BRANDBOOK-ANIMACAO.md` (seções 2, 3, 10 e 12) e as fichas em `personagens/`.
- Uma situação do agora puxa uma lembrança do antes; a volta ao agora mostra o mesmo problema resolvido. Gancho nos 3 primeiros segundos, já no agora.
- Frases completas, uma ideia por frase, como gente fala; nada de frase picada que obriga a adivinhar o sentido.
- Os outros personagens aparecem e reagem, mas não falam: a narradora conta o que eles disseram e fizeram.
- Cartão de fonte (`CartaoFonte`) só quando o assunto pedir. Nada de dado inventado.
- Passe o roteiro pela lista do que nunca acontece (seção 12) e pelas pronúncias (seção 11 e `pronuncias.md`).
- Grave em `videos/AAAA-MM-DD-slug/roteiro-falas.json`, uma fala por item, na ordem, com o tempo de cada uma:

```json
[
  { "quem": "rita", "tempo": "agora", "texto": "Hoje eu sou personal. Mas já desisti de treinar três vezes." },
  { "quem": "rita", "tempo": "antes", "texto": "Eu começava na segunda, sem plano nenhum." }
]
```

`quem` é sempre o id da narradora (`personagens/<id>`); `tempo` é `agora` ou `antes` (sem ele, agora).

## 2. Pasta do vídeo

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/
```

O episódio base (`$E/src/`) já põe a narradora no agora (no primeiro cenário escolhido, com a criança do elenco se houver), dissolve para a lembrança nas falas do antes, troca o selo do tempo (rótulos das respostas; o detalhe do episódio vai em `DETALHE_AGORA` e `DETALHE_ANTES`), abre só a boca da narradora, mostra a legenda por frase, toca narração, trilha e efeitos só se os arquivos existirem e fecha com o `Fecho`. A duração sai do `falas.json`. Edite o `Episodio.tsx` para as cenas do roteiro (cenário, luz, expressões, câmera, celular, caderno); nunca redesenhe personagem nem cenário.

## 3. Prévia sem voz (antes de gastar crédito)

```bash
python3 _ferramentas/tempos_sem_voz.py $E          # falas.json (com o tempo), palavras.json, volume.json e textos.json sintéticos
npx tsc --noEmit
bash _ferramentas/previa.sh $E 1 3 5 7 9 11        # meia resolução + folha de frames em $E/revisao/folha.png
```

Olhe a folha: antes e agora nos lugares certos, selo trocando, legenda acima da cabeça, nada fora da área segura, fecho sem encostar no rosto. Corrija e rode de novo. Só depois disso a voz.

## 4. Voz (uma só)

- Avise quantos caracteres vão para a voz antes de gerar (soma dos `texto` do roteiro).
- A voz da narradora está na seção 10 do brandbook. Uma tomada por fala; gerar de novo só a frase que saiu estranha.
- Salve cada fala em `$E/audio/<n>-<id-da-narradora>.mp3`, na ordem do roteiro (`1-rita.mp3`, `2-rita.mp3`...).

## 5. Montagem, legenda, boca e trilha

```bash
python3 _ferramentas/montar_audio.py $E 1-rita.mp3:0.3 2-rita.mp3:0.3 ...    # pausa depois de cada fala, em segundos
python3 _ferramentas/transcrever.py $E/public/narracao.mp3 $E/src/palavras.json
python3 _ferramentas/volume.py $E/public/narracao.mp3 $E/src/volume.json
```

- `montar_audio.py` corta o silêncio das pontas, junta, normaliza (-15 LUFS) e grava `public/narracao.mp3`, `src/falas.json` (quem fala de quando a quando, com o `tempo` do roteiro), `src/textos.json` (o texto de cada fala), os efeitos em `public/sfx/` e a trilha em `public/trilha.wav` (pelo `trilha.py`, da duração da narração mais o fecho; uma trilha que já está lá não é trocada).
- `transcrever.py` dá o tempo de cada palavra (mlx-whisper no Mac, faster-whisper no Linux), com os nomes e termos do universo no prompt. A legenda reparte as palavras pelas falas pelo **número de palavras de cada texto** (`legendaDasFalas`), e não pelo tempo: confira que a contagem bate (o Whisper às vezes separa "recém" e "-nascido"; o `prepararPalavras` junta). Corrija palavra pelo índice impresso em `prepararPalavras(brutas, troca, remover)`.
- `volume.py` grava o volume por frame (0 a 1). `criarBocas(volume, falas)` abre só a boca da narradora, só dentro das falas; no silêncio, fechada.
- **Trilha:** a peça `Trilha` toca `public/trilha.wav` em volume fixo 0,09, com entrada de 1 s e saída de 1,5 s, cerca de 15 a 20 dB abaixo da voz. Não suba o volume.

## 6. Render e conferência

```bash
npx tsc --noEmit
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
bash _ferramentas/frames.sh $E 1.2 3.4 5.6 ...     # um frame por tempo + $E/frames/_folha.jpg
```

Na folha de frames: no meio de uma palavra, a boca da narradora aberta; na pausa entre as falas e no fecho, fechada; o antes em sépia com a aparência do antes; legenda batendo com a voz; nada fora da área segura. Para conferir a trilha: `ffmpeg -ss 1 -t 3 -i $E/out/ep.mp4 -af volumedetect -f null -` (voz) contra a mesma medida num trecho sem voz (só trilha): a trilha fica pelo menos 15 dB abaixo. Render final 1080 x 1920, 30 fps.

## Sons

Efeitos (`pop.wav`, `ding.wav`, `deslize.wav`, `suspense.wav`) por `_ferramentas/gerar_sfx.py` e trilha por `_ferramentas/trilha.py`, os dois por síntese só com numpy (origem em `_ferramentas/sfx/ORIGEM.md`). No episódio: `<SFX arquivo="deslize.wav" em={2.1} volume={0.3} />`. O episódio base só toca o `deslize` na entrada de cada lembrança; efeito só nos momentos-chave, nunca por cima do fecho.

## Ferramentas

Python 3 com numpy, ffmpeg e ffprobe; para transcrever, mlx-whisper (Mac) ou faster-whisper (Linux). Os `.sh` são bash comum (rodam no bash 3.2 do Mac). Nunca rode `npm install` dentro de um `node_modules` feito por link (`.motor-por-link`).
