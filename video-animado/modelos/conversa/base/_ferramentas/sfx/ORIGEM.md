# Origem dos sons

Os quatro sons desta pasta são **gerados por código** pelo `_ferramentas/gerar_sfx.py`, por síntese matemática só com numpy. Nenhum som foi gravado, baixado ou tirado de biblioteca, e nenhum imita o som de notificação de um app de mensagem real: não há licença de terceiros. Podem ser usados em qualquer vídeo, inclusive comercial.

| Arquivo | Duração | Como é feito | Uso |
|---|---|---|---|
| `chegou.wav` | 0,32 s | nota de madeira (seno que sobe de 620 para 780 Hz, com o quarto harmônico curto) e um sopro de ruído | bolha do contato entrando |
| `enviada.wav` | 0,24 s | ruído filtrado (900 a 7000 Hz) num arco curto, uma varredura de tom que sobe e um toque de 1500 Hz no fim | bolha do dono entrando |
| `tecla.wav` | 0,05 s | clique de ruído filtrado com um tique de 2100 Hz, decaimento muito rápido | o dono digitando no campo |
| `cama.wav` | 8 s, em laço | acordes de fá, ré menor, si bemol e dó (2 s cada), notas dedilhadas em colcheia e um chocalho baixo nos contratempos; o último segundo entra cruzado no começo para o laço não estalar | a música da receita só texto e música |

Formato: WAV mono, 16 bits; os efeitos a 44,1 kHz com pico em 85%, a cama a 22,05 kHz com pico em 60%. As sementes do ruído são fixas: rodar de novo dá os mesmos arquivos.

A cama é trocável pela música da própria pessoa: ponha `public/musica.mp3` (ou `musica.wav`) na pasta do vídeo, e o episódio toca ela no lugar da cama (com a mesma entrada e saída suaves).

Para refazer: `python3 _ferramentas/gerar_sfx.py`. O `montar_audio.py` e o `tempos_sem_voz.py` copiam os sons para `public/sfx/` do vídeo e geram se a pasta do kit estiver vazia.
