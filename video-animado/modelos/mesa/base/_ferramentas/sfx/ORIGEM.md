# Origem dos sons gerados por código

Todos os sons desta pasta são **gerados por código** pelo `_ferramentas/synth_sfx.py`, por síntese matemática só com numpy (e o módulo `wave` do Python). Nenhum som foi gravado, baixado ou tirado de biblioteca: não há licença de terceiros. Podem ser usados em qualquer vídeo, inclusive comercial. Rodar de novo dá os mesmos arquivos (semente fixa por efeito). Para refazer: `python3 _ferramentas/synth_sfx.py`.

| Arquivo | Duração | Como é feito | Uso na mesa |
|---|---|---|---|
| `pouso-madeira.wav` | 0,22 s | seno grave de 170 Hz caindo rápido, estalo de ruído de 250 a 2600 Hz e uma ressonância curta de 430 Hz | item encostando na mesa de madeira |
| `pouso-marmore.wav` | 0,16 s | seno de 260 Hz com queda rápida, estalo seco de 1800 a 9000 Hz e um anel curto de 1900 Hz | item encostando no mármore |
| `pouso-pano.wav` | 0,2 s | seno de 95 Hz e ruído abafado de 80 a 650 Hz, com ataque mais lento | item encostando no pano |
| `pedaco.wav` | 0,09 s | toque curto de 520 Hz com um pouco de ruído de 1200 a 6000 Hz | pedaço ou camada caindo sobre a peça central |
| `pop.wav` | 0,18 s | seno caindo de 460 para 140 Hz com estalo curto de 900 a 5000 Hz | item que aparece (pop) e o card final |
| `papel.wav` | 0,32 s | farfalhar de ruído de 1500 a 8000 Hz em envelope irregular, com um toque de 600 a 4000 Hz no fim | etiqueta de papel chegando a cada passo |
| `deslize.wav` | 0,35 s | ruído de 400 a 3200 Hz num envelope de arco | faixa de legenda subindo |
| `cama.wav` | 8 s (laço) | acordes suaves de dó, lá menor, fá e sol (senoides com leve trêmulo), baixo redondo e notas curtas de piano a cada meio segundo; o último segundo entra cruzado no começo para emendar sem estalo | cama leve, em laço, abaixando quando a voz fala (`duck.json`) |

Formato: WAV mono, 16 bits, 44,1 kHz (a cama em 22,05 kHz). Pico em 89% (a cama em 60%).
