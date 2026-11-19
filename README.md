# video-animado

Skill do Claude Code que faz vídeos narrados com animação 2D desenhada em código (Remotion), sem ferramenta externa de imagem ou vídeo por IA.

Serve para qualquer pessoa. Na primeira vez ela abre um **catálogo de modelos prontos**: você escolhe um estilo, responde uma entrevista curta (8 a 12 perguntas, uma por vez, com opções recomendadas) e o universo sai pronto, com personagens, cenários, cores e marca. Quem quiser um estilo do zero escolhe "Criar um estilo novo" e faz a entrevista completa. Depois a skill usa esse universo para escrever o roteiro, gerar a narração e montar cada vídeo.

Abra `video-animado/como-funciona.html` no navegador para ver o passo a passo, os modelos e as perguntas.

## Os modelos do catálogo

| Nº | Modelo | Para quê | Temas |
|---|---|---|---|
| 1 | Chapado, casa quente | humor do dia a dia com elenco fixo de bonecos | |
| 2 | Traço fino, antes e agora | uma narradora conta o antes e o agora | |
| 3 | Dossiê investigativo | caso ou notícia contada como investigação | |
| 4 | Pixel 16 bits | notícia curta com um boneco em pixel art que fala | |
| 5 | Explicação | processo, conta ou rotina explicada | quadro, lousa de giz, post-its, tela de app |
| 6 | Dados e história | número que conta ou história no tempo | isométrico, linha do tempo, mapa com rota, recortes de jornal |
| 7 | Conto com personagem | contos curtos com personagens que conversam | papel recortado, bonecos de formas, silhuetas, giz de cera |
| 8 | Conversa no celular | conversa de mensagem entre duas pessoas | duas vozes ou só texto com música |
| 9 | Mesa vista de cima | passo a passo com os itens caindo na mesa | madeira, mármore, pano |
| 10 | Neon retrô | oferta, lançamento, evento, contagem regressiva | narração ou só letreiros na batida da música |
| 11 | Criar um estilo novo | entrevista completa (25 a 35 perguntas) | |

Em todos os modelos dá para trocar as cores na entrevista: as do tema, as da sua marca ou uma de 3 paletas prontas. Cada modelo tem uma vitrine em `video-animado/modelos/<modelo>/vitrine/` com um trecho de vídeo e as imagens de exemplo.

## Instalar

```bash
git clone https://github.com/Ecoupdigital/video-animado.git
cp -R video-animado/video-animado ~/.claude/skills/video-animado
```

Depois, no Claude Code, peça um vídeo animado ou digite `/video-animado`.

## O que precisa ter

- Claude Code (ou o app do Claude, aba Code)
- Node 20 ou mais novo e ffmpeg. O Remotion é instalado sozinho no primeiro universo (`npm install`).
- Uma ferramenta para transcrever áudio com o tempo de cada palavra (mlx-whisper no Mac, faster-whisper no Linux)
- Python 3 com numpy e scipy, só para a trilha sonora feita em código (`scripts/trilha.py`)
- Conector ou chave do ElevenLabs, se for usar voz clonada ou voz pronta. Dá para usar áudio gravado por você, e os modelos Conversa no celular e Neon retrô têm a opção só texto com música, sem voz.

As fontes dos modelos novos vêm dentro da skill, então o render não depende de internet (o Dossiê ainda baixa as fontes na hora).

## Estado

Criada em 08/11/2026. Catálogo de 10 modelos em 17/11/2026. Cada modelo foi testado com um universo de outro assunto, imagens conferidas, um vídeo de 15 s com áudio emprestado e as conferências automáticas (`scripts/conferir_kit.mjs`, `conferir_neutro.mjs`, `conferir_portabilidade.mjs`). Em 18/11/2026 entrou a Regra de dinamismo (cortes a cada 3 s no máximo, sem exagero), o medidor `scripts/checar_dinamismo.py`, a trilha em código `scripts/trilha.py` e o clipe piloto antes de aprovar o estilo. Ainda falta um vídeo com voz nova por modelo. Se algo quebrar, abra uma issue.
