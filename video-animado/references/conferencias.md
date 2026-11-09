# Conferências antes de entregar (Parte B, passos 6 e 7)

Três camadas, nesta ordem. Só entregue quando as três passarem.

## 1. Conferência do mp4 (automática)

```
python3 <skill>/scripts/checar_video.py ~/Downloads/<arquivo>.mp4 --formato 9:16
```

Confere duração, tamanho do vídeo para o formato, volume (alvo -16 a -14 LUFS, pico até -1 dB) e silêncio no começo. Se der PROBLEMA, corrija e renderize de novo. AVISO você decide se vale mexer.

## 2. Conferência dos frames (você, olhando)

Tire um frame de cada cena e um contact sheet. Confira:
- **Área segura (9:16, 1080x1920):** nada importante nos 250 px de cima, nos 340 px de baixo e nos 60 px das laterais. É onde o Instagram e o TikTok colocam botões e legenda.
- **Texto:** não estoura a largura, não sobrepõe o personagem, legenda legível (mínimo 48 px em 1080 de largura). Use `measureText`/`fitText` do `@remotion/layout-utils` para ajustar o tamanho, em vez de adivinhar.
- **Boca:** em 3 pontos do vídeo, pegue o frame de uma palavra falada e o de um silêncio. Falada = boca aberta, silêncio = fechada. Se estiver trocado, a boca está adiantada ou atrasada: ajuste o deslocamento em frames da curva de volume (comece com 0 e teste -2 e +2).
- **Personagem:** igual à ficha em todas as cenas (cor da roupa, proporção, acessórios).

## 3. Revisor independente (subagente que não viu a montagem)

Chame um subagente novo (Agent) com este briefing, sem contar o que você acha do resultado:

> Você é um revisor de vídeo animado. Leia `<caminho>/BRANDBOOK-ANIMACAO.md` e as fichas em `personagens/`. Depois olhe os frames em `<pasta>/frames/` (um por cena) e o contact sheet. Para cada cena diga: (1) o personagem está igual à ficha? o que difere; (2) o cenário e as cores seguem o brandbook? (3) alguma regra de "Proibições" foi quebrada; (4) texto cortado, sobreposto ou fora da área segura; (5) expressão certa para o que o roteiro diz naquela cena (roteiro em `roteiro.md`). Responda em lista curta por cena, com severidade (grave, médio, leve). Não elogie. Se não encontrar problema numa cena, escreva "sem problema".

Corrija os graves e médios, renderize de novo e rode as conferências 1 e 2 outra vez. Mostre à pessoa o que o revisor achou e o que você mudou.
