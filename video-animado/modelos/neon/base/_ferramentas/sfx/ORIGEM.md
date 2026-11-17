# Origem dos sons gerados por código

Todos os sons desta pasta são **gerados por código** pelo `_ferramentas/synth_sfx.py`, por síntese matemática só com numpy (e o módulo `wave` do Python). Nenhum som foi gravado, baixado ou tirado de biblioteca: não há licença de terceiros. Podem ser usados em qualquer vídeo, inclusive comercial. Rodar de novo dá os mesmos arquivos (semente fixa por efeito). Para refazer: `python3 _ferramentas/synth_sfx.py`.

| Arquivo | Duração | Como é feito | Uso no neon |
|---|---|---|---|
| `zumbido.wav` | 0,42 s | zumbido de 240 Hz com 8 harmônicos e um chiado de 2500 a 9000 Hz, sem nada abaixo de 200 Hz, no envelope do tremido do letreiro (fraco, aceso, uma queda, aceso de vez), com um estalo no começo | cada letreiro que acende |
| `tique.wav` | 0,05 s | toque de 1900 Hz com estalo de ruído de 3000 a 9000 Hz | o preço contando (6 tiques que vão espaçando), o relógio a cada segundo, cada número do 3, 2, 1 |
| `deslize.wav` | 0,35 s | ruído de 500 a 4000 Hz num envelope de arco | o que é a oferta, o selo, o botão e o card final entrando |
| `cama.wav` | 8 s (laço) | cama synth: bumbo em todo tempo (seno caindo de 110 para 45 Hz), palma no 2 e no 4, chimbal no contratempo, baixo em colcheias e pad desafinado, um acorde por compasso (lá menor, fá, dó, sol); o que passa do fim volta para o começo, e o laço emenda sem estalo | cama por baixo da voz (abaixa quando ela fala, `duck.json`), ou cheia na receita só letreiros |

**Andamento da cama (fixo):** **120 batidas por minuto**, 4 tempos por compasso, a **primeira batida em 0 s**: um tempo a cada 0,5 s, um compasso a cada 2 s, os 8 s do laço são 4 compassos (16 tempos). O mesmo andamento está em `componentes/opcoes.json` (`musica`). Na receita só letreiros, o `tempos_sem_voz.py` usa esse andamento para pôr cada cena num número inteiro de compassos e cada peça numa batida. Com a música da pessoa (`public/musica.mp3` ou `.wav`) no lugar da cama, o roteiro diz o andamento dela (`bpm` e `primeira_batida`).

Formato: WAV mono, 16 bits, 44,1 kHz (a cama em 22,05 kHz). Pico em 85% (a cama em 60%).
