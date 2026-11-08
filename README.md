# video-animado

Skill do Claude Code que faz vídeos narrados com animação 2D desenhada em código (Remotion), sem ferramenta externa de imagem ou vídeo por IA.

Serve para qualquer pessoa. Na primeira vez, ela conduz uma entrevista detalhada (uma pergunta por vez, com opções recomendadas) e cria um brandbook de animação: um "universo" com personagens (nenhum, um ou vários), cenários e narrativa. Depois usa esse brandbook como referência para escrever o roteiro, gerar a narração e montar cada vídeo.

Veja a página `video-animado/como-funciona.html` (abra no navegador) para o passo a passo e todas as perguntas.

## Instalar

```bash
git clone https://github.com/Ecoupdigital/video-animado.git
cp -R video-animado/video-animado ~/.claude/skills/video-animado
```

Depois, no Claude Code, peça um vídeo animado ou digite `/video-animado`.

## O que precisa ter

- Claude Code (ou o app do Claude, aba Code)
- Remotion, ffmpeg e Node instalados
- Uma ferramenta para transcrever áudio com o tempo de cada palavra (ex.: mlx-whisper no Mac)
- Conector do ElevenLabs, se for usar voz clonada ou voz pronta (opcional: dá para usar áudio gravado por você)

## Estado

Criada em 08/11/2026. Ainda não testada de ponta a ponta. Se algo quebrar, abra uma issue.
