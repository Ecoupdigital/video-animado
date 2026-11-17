# Origem dos sons gerados por código

Os efeitos desta pasta e a trilha de fundo são **gerados por código**, por síntese matemática só com numpy (e o módulo `wave` do Python). Nenhum som foi gravado, baixado ou tirado de biblioteca: não há licença de terceiros. Podem ser usados em qualquer vídeo, inclusive comercial. Rodar de novo dá os mesmos arquivos.

## Efeitos (`_ferramentas/gerar_sfx.py`)

| Arquivo | Duração | Como é feito | Uso |
|---|---|---|---|
| `pop.wav` | 0,14 s | seno com o tom caindo rápido e decaimento curto | texto ou objeto aparecendo |
| `ding.wav` | 1,3 s | sino: seno de 1318,5 Hz com 3 parciais e decaimento exponencial | a virada, a descoberta |
| `deslize.wav` | 0,5 s | ruído filtrado (500 a 4500 Hz) com envelope de arco e uma varredura de tom | entrada da lembrança do antes, tela entrando |
| `suspense.wav` | 1,8 s | dois tons graves desafinados (110 e 116,5 Hz) com tremolo, subindo um pouco | antes da revelação |

Formato: WAV mono, 44,1 kHz, 16 bits, pico em 80%. A semente do ruído é fixa. Para refazer: `python3 _ferramentas/gerar_sfx.py`.

## Trilha (`_ferramentas/trilha.py`)

`public/trilha.wav` de cada episódio sai de `python3 _ferramentas/trilha.py <saida.wav> <segundos>` (o `montar_audio.py` gera sozinho, da duração da narração mais o fecho, se o episódio ainda não tiver trilha). Piano elétrico suave: acordes Fmaj7, Am7, Dm7 e Bbmaj7 com ataque macio (20 ms) e decaimento longo, 2ª e 3ª harmônicas curtas, um arpejo leve de uma nota por tempo, 72 bpm, graves e médios, sem melodia que brigue com a voz. Entrada de 1,5 s e saída de 3 s no arquivo, passa-baixa por média móvel, normalizada a 80%. WAV mono, 44,1 kHz, 16 bits, sem nada aleatório. No episódio ela toca em volume fixo 0,09, com entrada de 1 s e saída de 1,5 s (peça `Trilha` de `componentes/Montagem.tsx`), bem abaixo da voz.
