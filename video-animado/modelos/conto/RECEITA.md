# Receita de vídeo: vozes por fala (Conto)

Parte B deste universo (modelo `conto`, família com temas). Cada personagem que fala tem a própria voz; se o narrador estiver ligado, ele tem uma voz a mais, sem rosto. Cada fala vira um trecho de áudio; a boca de quem fala abre pelo volume da voz em cada frame, e nas falas do narrador ninguém abre a boca. Tudo sai no tema do universo (`componentes/universo.ts`, `TEMA`). Siga na ordem e rode tudo da **raiz do universo**.

## 1. Roteiro (aprovado antes de qualquer voz)

- Leia o `BRANDBOOK-ANIMACAO.md` (seções 2, 3, 7 e 12) e as fichas em `personagens/`.
- Falas curtas, uma ideia por frase, como gente fala. Cada fala puxa a próxima. Diálogo de dois por cena: o episódio base põe em cena os dois primeiros que falam.
- Abertura com o título nos 2 primeiros segundos; a situação; a virada ou a dica; fecho (`Fecho`, cerca de 4 s).
- Narrador (só se ligado nas respostas): conta o que a cena não mostra, em frase curta, de preferência no começo ou na virada. `quem: "narrador"`.
- Nas formas a fala vai num balão acima de quem fala (até 3 linhas): fala longa vira mais de um balão seguido; prefira frases de até ~12 palavras. No papel, nas silhuetas e no giz de cera a fala vai na legenda embaixo.
- Nas silhuetas não há boca: quem fala aparece pelo gesto do braço e pela cabeça fora do eixo, os dois puxados pelo volume (com volume zero, repouso). Escreva falas com respiro entre elas, para o gesto de um parar antes do outro começar, e evite dois personagens falando por cima.
- Quando sugerir narrador (`narrador: { "ligado": true }`, pergunta 10): nas silhuetas, em história emocional, homenagem, data comemorativa e depoimento, com voz próxima e lenta, que conta enquanto as silhuetas reagem; no giz de cera, com voz de criança pronta (a criança que desenhou conta) ou narração de adulto calma. Nos dois, o narrador pode levar o vídeo quase inteiro, com uma ou duas falas dos personagens.
- Passe o roteiro pela lista do que nunca acontece (seção 12) e pelas pronúncias (seção 11 e `pronuncias.md`).
- Grave em `videos/AAAA-MM-DD-slug/roteiro-falas.json`, uma fala por item, na ordem:

```json
[
  { "quem": "narrador", "texto": "Quinta-feira, sete da noite, na escola." },
  { "quem": "teca", "texto": "Otávio, como se diz empurre em inglês?" },
  { "quem": "otavio", "texto": "Pull, professora. Tá escrito na porta." }
]
```

`quem` é o id do personagem (`personagens/<id>`) ou `narrador`. Fala de quem não é personagem nem o narrador ligado: o `tempos_sem_voz.py` e o `montar_audio.py` saem 1 dizendo qual.

## 2. Pasta do vídeo

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/
```

O episódio base (`$E/src/`) já acha cada personagem pelo `quem`, põe os dois que falam olhando um para o outro (o da direita espelhado), abre a boca só de quem fala, fecha todas na fala do narrador, abre com o título por cima da cena, mostra a fala na legenda (papel, silhuetas, giz de cera) ou no balão (formas) e a do narrador na legenda, fecha com o `Fecho` e toca a narração só se ela existir. A duração sai do `falas.json`. Edite o `Episodio.tsx` para o roteiro (cenário em `CENARIO`, linha de situação das formas em `SITUACAO`, expressões, título); nunca redesenhe personagem nem cenário: importe de `personagens/` e use a `Cena` de `componentes/Montagem.tsx`.

## 3. Prévia sem voz (antes de gastar crédito)

```bash
python3 _ferramentas/tempos_sem_voz.py $E          # falas.json, palavras.json e volume.json sintéticos (~2,6 palavras por segundo)
npx tsc --noEmit
bash _ferramentas/previa.sh $E 0.6 1.4 2.4 3.6 4.6 5.4   # meia resolução + folha de frames em $E/revisao/folha.png
```

Olhe a folha: boca aberta só em quem fala (nas silhuetas, braço em gesto só em quem fala), todas fechadas e ninguém gesticulando na fala do narrador, o quique das formas na fala, balão apontando para quem fala, texto dentro da área segura, nada por cima do rosto. Corrija e rode de novo. Só depois disso a voz.

## 4. Vozes (custo avisado antes)

- Avise quantos caracteres vão para a voz antes de gerar (soma dos `texto` do roteiro), separado por voz.
- Uma voz por personagem e uma para o narrador, se ligado (seção 10 do brandbook). Uma tomada por fala; gerar de novo só a frase que saiu estranha.
- Salve cada fala em `$E/audio/<n>-<id>.mp3` na ordem do roteiro (`1-narrador.mp3`, `2-teca.mp3`, `3-otavio.mp3`...).

## 5. Áudio, legenda e boca

```bash
python3 _ferramentas/montar_audio.py $E 1-narrador.mp3:0.3 2-teca.mp3:0.3 3-otavio.mp3:0.3    # pausa depois de cada fala, em segundos
python3 _ferramentas/transcrever.py $E/public/narracao.mp3 $E/src/palavras.json
python3 _ferramentas/volume.py $E/public/narracao.mp3 $E/src/volume.json
```

- `montar_audio.py` corta o silêncio das pontas, junta, normaliza (-15 LUFS) e grava `public/narracao.mp3`, `src/falas.json` (quem fala de quando a quando; o nome sai do arquivo) e os efeitos em `public/sfx/`. Arquivo temporário só dentro de `$E/audio/_cortado/`.
- `transcrever.py` dá o tempo de cada palavra (mlx-whisper no Mac, faster-whisper no Linux), com os nomes, o lugar e os termos do universo no prompt. Corrija a legenda no `prepararPalavras(brutas, troca, remover)` do episódio pelo índice impresso; a palavra do fecho depois de "Comenta" já sai em maiúsculas.
- `volume.py` grava o volume por frame (0 a 1). No episódio, `criarBocas(volume, falas)` abre só a boca de quem fala naquele trecho; no silêncio e nas falas do narrador, todas ficam fechadas.

## 6. Render e conferência

```bash
npx tsc --noEmit
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
bash _ferramentas/frames.sh $E 1.2 3.4 5.6 ...     # um frame por tempo + $E/frames/_folha.jpg
```

Tire os tempos do `falas.json`: o meio de cada fala e os silêncios entre elas. Na folha de frames: em cada fala, boca aberta só em quem fala (nas silhuetas, o braço em gesto e a cabeça fora do eixo só em quem fala); no silêncio, todas fechadas e os dois em repouso; legenda ou balão batendo com a voz; nada fora da área segura. Render final 1080 x 1920, 30 fps.

## Efeitos sonoros

`pop.wav`, `ding.wav`, `deslize.wav`, `papel.wav` e `boing.wav` saem de `_ferramentas/gerar_sfx.py` (síntese só com numpy, origem em `_ferramentas/sfx/ORIGEM.md`). No episódio: `<SFX arquivo="boing.wav" em={2.1} volume={0.4} />`. Efeito só nos momentos-chave (`papel` na virada de cena do papel recortado, `boing` no pulinho das formas).

## Ferramentas

Python 3 com numpy, ffmpeg e ffprobe; para transcrever, mlx-whisper (Mac) ou faster-whisper (Linux). Os `.sh` são bash comum (rodam no bash 3.2 do Mac). Nunca rode `npm install` dentro de um `node_modules` feito por link (`.motor-por-link`).
