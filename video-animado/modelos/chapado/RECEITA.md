# Receita de vídeo: vozes por fala

Parte B deste universo (modelo `chapado`). Cada personagem que fala tem a própria voz; cada fala vira um trecho de áudio; a boca de quem fala abre pelo volume da voz em cada frame. Siga na ordem e rode tudo da **raiz do universo**.

## 1. Roteiro

- Leia o `BRANDBOOK-ANIMACAO.md` (seções 2, 3, 12) e as fichas em `personagens/`.
- Falas curtas, uma ideia por frase, como gente fala. Cada fala puxa a próxima.
- Gancho nos 2 primeiros segundos; a dica no meio; piada curta do elenco; fecho (`Fecho`, cerca de 4 s).
- Cartão de fonte (`CartaoFonte`) só quando o assunto pedir (dado, regra, recomendação de especialista). Nada de dado inventado.
- Passe o roteiro pela lista do que nunca acontece (seção 12) e pelas pronúncias (seção 11 e `pronuncias.md`).
- Grave o roteiro em `videos/AAAA-MM-DD-slug/roteiro-falas.json`, uma fala por item, na ordem:

```json
[
  { "quem": "bia", "texto": "Seu Ademar, abre aí. Prometo que não dói." },
  { "quem": "seu-ademar", "texto": "Doutora, eu escovei hoje. Quase." }
]
```

`quem` é o id do personagem (`personagens/<id>`).

## 2. Pasta do vídeo

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/
```

O episódio base (`$E/src/`) já acha cada personagem pelo `quem`, põe as duas primeiras pessoas que falam na cena, abre a boca só de quem fala, mostra a legenda palavra por palavra, fecha com o `Fecho` e toca a narração só se ela existir. A duração sai do `falas.json`. Edite o `Episodio.tsx` para as cenas do roteiro (cenário, expressões, câmera, celular, títulos); nunca redesenhe personagem nem cenário.

## 3. Prévia sem voz (antes de gastar crédito)

```bash
python3 _ferramentas/tempos_sem_voz.py $E          # falas.json, palavras.json e volume.json sintéticos (~2,6 palavras por segundo)
npx tsc --noEmit
bash _ferramentas/previa.sh $E 1 3 5 7 9 11        # meia resolução + folha de frames em $E/revisao/folha.png
```

Olhe a folha: texto fora da área segura ou por cima do rosto, personagem cortado, cena vazia. Corrija e rode de novo. Só depois disso a voz.

## 4. Vozes

- Avise quantos caracteres vão para a voz antes de gerar (soma dos `texto` do roteiro).
- Uma voz por personagem (seção 10 do brandbook). Uma tomada por fala; gerar de novo só a frase que saiu estranha.
- Salve cada fala em `$E/audio/<n>-<id>.mp3` na ordem do roteiro (`1-bia.mp3`, `2-seu-ademar.mp3`...).

## 5. Áudio, legenda e boca

```bash
python3 _ferramentas/montar_audio.py $E 1-bia.mp3:0.3 2-seu-ademar.mp3:0.3 ...    # pausa depois de cada fala, em segundos
python3 _ferramentas/transcrever.py $E/public/narracao.mp3 $E/src/palavras.json
python3 _ferramentas/volume.py $E/public/narracao.mp3 $E/src/volume.json
```

- `montar_audio.py` corta o silêncio das pontas, junta, normaliza (-15 LUFS) e grava `public/narracao.mp3`, `src/falas.json` (quem fala de quando a quando, o nome sai do arquivo) e os efeitos em `public/sfx/` (gera os efeitos se a pasta do kit estiver vazia).
- `transcrever.py` dá o tempo de cada palavra (mlx-whisper no Mac, faster-whisper no Linux), com os nomes e termos do universo no prompt. Corrija a legenda no `prepararPalavras(brutas, troca, remover)` do episódio pelo índice impresso; a palavra do fecho depois de "Comenta" já sai em maiúsculas.
- `volume.py` grava o volume por frame (0 a 1). No episódio, `criarBocas(volume, falas)` abre só a boca de quem fala naquele trecho; no silêncio todas ficam fechadas.

## 6. Render e conferência

```bash
npx tsc --noEmit
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
bash _ferramentas/frames.sh $E 1.2 3.4 5.6 ...     # um frame por tempo + $E/frames/_folha.jpg
```

Na folha de frames: em cada fala, boca aberta só em quem fala; no silêncio, todas fechadas; legenda batendo com a voz; nada fora da área segura. Render final 1080 x 1920, 30 fps.

## Efeitos sonoros

`pop.wav`, `ding.wav`, `deslize.wav` e `suspense.wav` saem de `_ferramentas/gerar_sfx.py` (síntese só com numpy, origem em `_ferramentas/sfx/ORIGEM.md`). No episódio: `<SFX arquivo="pop.wav" em={2.1} volume={0.4} />`. Efeito só nos momentos-chave.

## Ferramentas

Python 3 com numpy, ffmpeg e ffprobe; para transcrever, mlx-whisper (Mac) ou faster-whisper (Linux). Os `.sh` são bash comum (rodam no bash 3.2 do Mac). Nunca rode `npm install` dentro de um `node_modules` feito por link (`.motor-por-link`).
