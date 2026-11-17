# Origem dos sons gerados por código

Todos os sons desta pasta são **gerados por código** pelo `_ferramentas/synth_sfx.py`, por síntese matemática só com numpy (e o módulo `wave` do Python). Nenhum som foi gravado, baixado ou tirado de biblioteca: não há licença de terceiros. Podem ser usados em qualquer vídeo, inclusive comercial. Rodar de novo dá os mesmos arquivos (semente fixa por efeito). Para refazer: `python3 _ferramentas/synth_sfx.py`.

| Arquivo | Duração | Como é feito | Uso no dossiê |
|---|---|---|---|
| `boom.wav` | 2,2 s | seno com o tom caindo de ~127 para 32 Hz, ruído grave e um estalo filtrado, saturado | golpe: número grande, valor da queda (punch forte, tremida e clarão) |
| `hit.wav` | 0,9 s | seno caindo de 185 para 45 Hz e ruído de 800 a 6000 Hz com decaimento rápido | batida: ficha entrando, marco em alerta (punch leve) |
| `stamp.wav` | 0,55 s | baque de 72 Hz, ruído de 180 a 3200 Hz e um tapa agudo 28 ms depois | carimbo batendo |
| `whoosh.wav` | 0,7 s | ruído em três faixas que se sucedem (do grave ao agudo) num envelope de arco | corte entre cenas |
| `whoosh_soft.wav` | 0,6 s | ruído de 150 a 1800 Hz num envelope de arco | polaroid entrando |
| `tick.wav` | 0,12 s | ruído de 2500 a 7000 Hz e seno de 1800 Hz, decaimento muito curto | card, nó da rota, data |
| `glitch.wav` | 0,25 s | onda quadrada de 70 Hz com ruído, filtrada, com dois cortes de silêncio | bloqueio, corte com glitch |
| `riser.wav` | 2,5 s | seno subindo de 120 para 1020 Hz e ruído agudo, crescendo | 2,5 s antes de um golpe |
| `counter_roll.wav` | 1,0 s | cliques de tick que desaceleram, como um contador parando | número contando |
| `typing_short.wav` | 0,9 s | teclas: rajadas curtas de ruído de 1500 a 6000 Hz em intervalos aleatórios fixos | texto digitando, card de investigação |
| `thump.wav` | 0,5 s | seno de 85 para 55 Hz e ruído grave | fio ligando duas fichas |
| `blip.wav` | 0,18 s | seno de 1200 subindo a 1600 Hz com harmônico | rótulo, selo, chamada |
| `error.wav` | 0,45 s | dois tons de onda quase quadrada (220 e 175 Hz, 3 harmônicos ímpares) | marco em alerta, bloqueio |
| `cama.wav` | 8 s (laço) | pad grave de dentes-de-serra desafinados (36,7 Hz e harmônicos, passa-baixa 220 Hz), coração a 60 bpm e tique-taque a cada 0,5 s; o último segundo entra cruzado no começo para emendar sem estalo | cama de suspense, em laço, abaixando quando a voz fala (`duck.json`) |

Formato: WAV mono, 16 bits, 44,1 kHz (a cama em 22,05 kHz, só graves e tique). Pico em 89% (a cama em 70%).
