# Origem dos efeitos sonoros

Os quatro efeitos desta pasta são **gerados por código** pelo `_ferramentas/gerar_sfx.py`, por síntese matemática só com numpy. Nenhum som foi gravado, baixado ou tirado de biblioteca: não há licença de terceiros. Podem ser usados em qualquer vídeo, inclusive comercial.

| Arquivo | Duração | Como é feito | Uso |
|---|---|---|---|
| `pop.wav` | 0,14 s | seno com o tom caindo rápido e decaimento curto | texto importante entrando, objeto aparecendo |
| `ding.wav` | 1,3 s | sino: seno de 1318,5 Hz com 3 parciais e decaimento exponencial | a dica, a descoberta |
| `deslize.wav` | 0,5 s | ruído filtrado (500 a 4500 Hz) com envelope de arco e uma varredura de tom | personagem ou tela entrando |
| `suspense.wav` | 1,8 s | dois tons graves desafinados (110 e 116,5 Hz) com tremolo, subindo um pouco | antes da revelação |

Formato: WAV mono, 44,1 kHz, 16 bits, pico em 80%. A semente do ruído é fixa: rodar de novo dá os mesmos arquivos.

Para refazer: `python3 _ferramentas/gerar_sfx.py`. O `montar_audio.py` e o `tempos_sem_voz.py` geram sozinhos se a pasta estiver vazia.
