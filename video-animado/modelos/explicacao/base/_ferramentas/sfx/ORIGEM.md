# Origem dos sons gerados por código

Todos os sons desta pasta são **gerados por código** pelo `_ferramentas/synth_sfx.py`, por síntese matemática só com numpy (e o módulo `wave` do Python). Nenhum som foi gravado, baixado ou tirado de biblioteca: não há licença de terceiros. Podem ser usados em qualquer vídeo, inclusive comercial. Rodar de novo dá os mesmos arquivos (semente fixa por efeito). Para refazer: `python3 _ferramentas/synth_sfx.py`.

| Arquivo | Duração | Como é feito | Uso na explicação |
|---|---|---|---|
| `caneta.wav` | 0,45 s | ruído de 1800 a 7500 Hz em 3 passadas de vaivém, com pequenas falhas de contato | caixa, seta, risco e círculo se desenhando no quadro e nos post-its |
| `giz.wav` | 0,5 s | ruído de 2600 a 11000 Hz em 4 passadas, falhas mais fortes e um rangido agudo fraco que oscila | caixa, seta, risco, linha da conta e círculo na lousa |
| `pop.wav` | 0,18 s | seno caindo de 460 para 140 Hz com estalo curto de 900 a 5000 Hz | post-it colando, cartão chegando na coluna |
| `clique.wav` | 0,12 s | dois cliques curtos (descer e soltar), ruído de 2000 a 9000 Hz e seno de 3200 Hz | clique do cursor no botão |
| `deslize.wav` | 0,35 s | ruído de 400 a 3200 Hz num envelope de arco | cartão andando de coluna, janela subindo, troca de cena |
| `tique.wav` | 0,1 s | seno de 1450 Hz com decaimento rápido e um pouco de ruído agudo | item pequeno entrando (cartão, resultado, "comenta aqui"), traço na tela de app |
| `cama.wav` | 8 s (laço) | acordes suaves de dó, lá menor, fá e sol (senoides com leve trêmulo), baixo redondo e notas curtas de piano a cada meio segundo; o último segundo entra cruzado no começo para emendar sem estalo | cama leve (sem clima de suspense), em laço, abaixando quando a voz fala (`duck.json`) |

Formato: WAV mono, 16 bits, 44,1 kHz (a cama em 22,05 kHz). Pico em 89% (a cama em 60%).
