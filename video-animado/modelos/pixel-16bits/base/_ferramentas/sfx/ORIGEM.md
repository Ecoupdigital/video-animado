# Origem dos sons

Todos os sons desta pasta foram **gerados por código**, pelo `_ferramentas/gerar_sfx.py` deste kit, só com numpy e a biblioteca padrão do Python (`wave`). Nenhum foi baixado nem gravado: não há licença de terceiros. Rodar o script de novo refaz os mesmos bytes (o ruído usa um sorteio de semente fixa).

| Arquivo | O que é | Como é feito |
|---|---|---|
| `pop.wav` | entrada de etiqueta, bloco e balão | onda quadrada que sobe de 520 para 1040 Hz em 0,12 s, queda rápida |
| `tick.wav` | item da lista marcado | dois pulsos de onda quadrada estreita (1800 e 2400 Hz) |
| `whoosh.wav` | troca de seção | ruído com média móvel que abre e fecha, envelope em seno |
| `sino.wav` | o "Seguindo" do card final | duas notas de onda triangular (mi e si) em arpejo |
| `digitando.wav` | o "digitando..." da conversa | 6 cliques curtos de ruído e onda quadrada, com espaços sorteados |
| `stamp.wav` | selo carimbado | seno grave que cai de 180 para 60 Hz, com ruído curto |
| `clique.wav` | botão "Seguir" | clique de onda quadrada com ruído, 60 ms |
| `cama.wav` | cama de fundo em laço | 8 s a 120 bpm, 22,05 kHz: baixo em onda quadrada e arpejo triangular em lá menor, fá, dó e sol; o template toca baixo (volume 0,09) e some no último meio segundo |
