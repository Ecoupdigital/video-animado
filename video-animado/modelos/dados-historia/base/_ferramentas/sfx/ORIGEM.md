# Origem dos sons gerados por código

Todos os sons desta pasta são **gerados por código** pelo `_ferramentas/synth_sfx.py`, por síntese matemática só com numpy (e o módulo `wave` do Python). Nenhum som foi gravado, baixado ou tirado de biblioteca: não há licença de terceiros. Podem ser usados em qualquer vídeo, inclusive comercial. Rodar de novo dá os mesmos arquivos (semente fixa por efeito). Para refazer: `python3 _ferramentas/synth_sfx.py`.

| Arquivo | Duração | Como é feito | Uso nos dados e na história |
|---|---|---|---|
| `tique.wav` | 0,06 s | seno de 1800 Hz com decaimento rápido e um pouco de ruído agudo, curto para não embolar | tique do contador, um a cada 0,1 s enquanto o número conta (7 tiques, cada um mais baixo); "comenta aqui" |
| `sobe.wav` | 0,55 s | tom que sobe de 220 para 660 Hz, com o harmônico de cima e um sopro de 600 a 4000 Hz que abre junto | a coluna subindo |
| `pop.wav` | 0,18 s | seno caindo de 460 para 140 Hz com estalo curto de 900 a 5000 Hz | o marco entrando no trilho, o pino caindo no fim da rota |
| `rota.wav` | 0,7 s | ruído de 900 a 5200 Hz numa passada longa e contínua, com leve ondulação | o trecho de rota se desenhando pela rua |
| `papel.wav` | 0,6 s | farfalhar de 1500 a 7000 Hz com tremulação (o papel no ar) e, aos 0,34 s, um toque surdo de 120 Hz (o papel assentando) | o recorte caindo e assentando |
| `caneta.wav` | 0,45 s | ruído de 1800 a 7500 Hz em 3 passadas de vaivém, com pequenas falhas de contato | o círculo à mão se desenhando |
| `deslize.wav` | 0,35 s | ruído de 400 a 3200 Hz num envelope de arco | troca de cena |
| `cama.wav` | 8 s (laço) | acordes suaves de dó, lá menor, fá e sol (senoides com leve trêmulo), baixo redondo e notas curtas de piano a cada meio segundo; o último segundo entra cruzado no começo para emendar sem estalo | cama leve (sem clima de suspense), em laço, abaixando quando a voz fala (`duck.json`) |

Formato: WAV mono, 16 bits, 44,1 kHz (a cama em 22,05 kHz). Pico em 89% (a cama em 60%).
