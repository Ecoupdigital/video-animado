# Origem dos efeitos sonoros

Os cinco efeitos desta pasta são **gerados por código** pelo `_ferramentas/gerar_sfx.py`, por síntese matemática só com numpy. Nenhum som foi gravado, baixado ou tirado de biblioteca: não há licença de terceiros. Podem ser usados em qualquer vídeo, inclusive comercial.

| Arquivo | Duração | Como é feito | Uso |
|---|---|---|---|
| `pop.wav` | 0,14 s | seno com o tom caindo rápido e decaimento curto | título e balão de fala entrando |
| `ding.wav` | 1,3 s | sino: seno de 1318,5 Hz com 3 parciais e decaimento exponencial | o fecho |
| `deslize.wav` | 0,5 s | ruído filtrado (500 a 4500 Hz) com envelope de arco e uma varredura de tom | personagem entrando |
| `papel.wav` | 0,42 s | três rajadas de ruído filtrado (1800 a 9000 Hz), curtas e secas, como uma folha virando | virada de cena no papel recortado |
| `boing.wav` | 0,55 s | seno que sobe e desce com vibrato de 14 Hz e decaimento, mais um harmônico | pulinho dos bonecos de formas |

Formato: WAV mono, 44,1 kHz, 16 bits, pico em 80%. As sementes do ruído são fixas: rodar de novo dá os mesmos arquivos.

Para refazer: `python3 _ferramentas/gerar_sfx.py`. O `montar_audio.py` e o `tempos_sem_voz.py` geram sozinhos se a pasta estiver vazia.
