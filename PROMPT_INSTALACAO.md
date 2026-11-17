# Prompt de instalação

Abra o Claude Code (ou o app do Claude, aba Code) na pasta onde você descompactou a skill, copie o texto abaixo e mande. A IA confere o seu computador, instala o que faltar com o seu ok e faz um teste.

```text
Quero usar a skill de vídeo animado que está nesta pasta.

1. Leia o arquivo video-animado/SKILL.md antes de qualquer coisa.
2. Rode: bash instalar.sh --conferir
   Ele confere o que já está instalado: Node.js, ffmpeg, Python, a skill
   e o transcritor (mlx-whisper no Mac com chip Apple, faster-whisper nos outros).
3. Antes de instalar qualquer coisa, me diga em uma lista curta o que vai instalar
   e por quê, e espere o meu ok. O que for do sistema (marcado com [FALTA]) você
   instala com o comando que o script mostrou, e só depois do meu ok.
4. Rode: bash instalar.sh
   Ele instala a skill na minha pasta de skills, cria o meu estúdio e o transcritor.
5. Rode: bash instalar.sh --teste
   Ele cria um universo de teste e desenha uma cena com o Remotion, para provar que
   está tudo funcionando. Me mostre a imagem e onde ela ficou.
6. Me pergunte se eu quero começar o meu primeiro vídeo.

Fale comigo em português, uma pergunta por vez, com opções e uma recomendada.
Se algo der erro, leia a mensagem, me explique em palavras simples o que aconteceu
e o que fazer, e tente de novo. Não pule etapas.
```

## O que o instalador faz

| Etapa | O que acontece |
|---|---|
| Programas do sistema | Confere Node 20 ou mais novo, ffmpeg e Python 3.9 ou mais novo. O que faltar, ele mostra o comando do seu sistema e para, sem instalar nada sozinho. |
| Skill | Copia a skill para `~/.claude/skills/video-animado`. Se já existir, guarda a versão anterior ao lado. |
| Estúdio | Cria `~/meu-estudio`, onde ficam os seus universos, vídeos e modelos. |
| Transcritor | Cria um Python só da skill em `~/.video-animado/venv`, com o mlx-whisper (Mac com chip Apple) ou o faster-whisper (outros). O modelo de voz, de 1,5 a 3 GB, baixa na primeira transcrição. |
| Teste (`--teste`) | Cria o universo `teste-instalacao` com o modelo Chapado, instala o Remotion (cerca de 550 MB na primeira vez) e desenha uma cena. |

## O que você precisa ter antes

- Claude com assinatura paga (Pro ou Max), para usar o Claude Code.
- Um computador Mac ou Linux. No Windows, use o WSL (Ubuntu); ainda não há teste registrado.
- Uns 5 GB livres (Remotion, transcritor e o modelo de voz).
- Para a narração: o conector ou uma chave do ElevenLabs, ou um áudio gravado por você.
