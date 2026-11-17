#!/usr/bin/env bash
# Instala a skill video-animado no Claude Code, no Mac ou no Linux.
#
# Uso (na pasta onde este arquivo está):
#   bash instalar.sh             instala ou atualiza a skill, o estúdio e o transcritor
#   bash instalar.sh --conferir  só confere o que está instalado e o que falta
#   bash instalar.sh --teste     instala e faz um teste rápido: cria um universo de teste
#                                e gera a imagem de uma cena com o Remotion (baixa uns 600 MB na 1ª vez)
#
# O script nunca usa sudo nem brew sozinho. Quando falta algo do sistema (Node, ffmpeg,
# Python), ele para, diz o comando que resolve no seu sistema e sai com código 2: rode o
# comando (ou peça para a IA rodar) e chame o script de novo.
#
# Onde as coisas ficam:
#   ~/.claude/skills/video-animado   a skill (a versão anterior vira .anterior-AAAAMMDD-HHMM)
#   ~/meu-estudio                    o seu estúdio: universos, vídeos e modelos seus
#   ~/.video-animado/venv            o Python do transcritor (mlx-whisper no Mac com chip Apple,
#                                    faster-whisper nos outros); o transcrever.py acha sozinho
#
# Compatível com o bash 3.2 do Mac.

set -u

AQUI="$(cd "$(dirname "$0")" && pwd)"
ORIGEM="$AQUI/video-animado"
SKILL="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/video-animado"
ESTUDIO="${VIDEO_ANIMADO_ESTUDIO:-$HOME/meu-estudio}"
BASE="$HOME/.video-animado"
VENV="$BASE/venv"
MODO="instalar"
case "${1:-}" in
  --conferir) MODO="conferir" ;;
  --teste) MODO="teste" ;;
  "") ;;
  *) echo "Uso: bash instalar.sh [--conferir | --teste]"; exit 1 ;;
esac

SO="$(uname -s)"
CHIP="$(uname -m)"
faltas=0

ok() { printf '  [ok] %s\n' "$1"; }
falta() { printf '  [FALTA] %s\n         Para resolver: %s\n' "$1" "$2"; faltas=$((faltas + 1)); }
etapa() { printf '\n== %s\n' "$1"; }

comando_node() {
  if [ "$SO" = "Darwin" ]; then
    echo "brew install node   (sem Homebrew: baixe o instalador LTS em https://nodejs.org)"
  else
    echo "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs   (ou o instalador de https://nodejs.org)"
  fi
}
comando_ffmpeg() {
  if [ "$SO" = "Darwin" ]; then echo "brew install ffmpeg"; else echo "sudo apt-get install -y ffmpeg"; fi
}
comando_python() {
  if [ "$SO" = "Darwin" ]; then echo "brew install python"; else echo "sudo apt-get install -y python3 python3-venv"; fi
}

# ---------------------------------------------------------------- 1. sistema
etapa "1. Programas do sistema"
if command -v node >/dev/null 2>&1; then
  v="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "$v" -ge 20 ] 2>/dev/null; then ok "Node $(node -v)"; else falta "Node 20 ou mais novo (achado: $(node -v))" "$(comando_node)"; fi
else
  falta "Node 20 ou mais novo" "$(comando_node)"
fi
command -v npm >/dev/null 2>&1 && ok "npm $(npm -v)" || falta "npm (vem junto com o Node)" "$(comando_node)"
if command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1; then
  ok "ffmpeg e ffprobe"
else
  falta "ffmpeg e ffprobe (juntam e medem os áudios)" "$(comando_ffmpeg)"
fi
if command -v python3 >/dev/null 2>&1 && python3 -c 'import sys, venv; sys.exit(0 if sys.version_info >= (3, 9) else 1)' 2>/dev/null; then
  ok "Python $(python3 -c 'import platform; print(platform.python_version())') com venv"
else
  falta "Python 3.9 ou mais novo, com venv" "$(comando_python)"
fi
if [ "$faltas" -gt 0 ]; then
  printf '\nFaltam %s programa(s) do sistema. Instale com os comandos acima e rode de novo: bash instalar.sh\n' "$faltas"
  exit 2
fi

# ---------------------------------------------------------------- 2. skill e estúdio
etapa "2. Skill e estúdio"
if [ "$MODO" = "conferir" ]; then
  [ -f "$SKILL/SKILL.md" ] && ok "skill em $SKILL" || falta "a skill" "bash instalar.sh"
  [ -d "$ESTUDIO" ] && ok "estúdio em $ESTUDIO" || falta "o estúdio" "bash instalar.sh"
else
  [ -f "$ORIGEM/SKILL.md" ] || { echo "Não achei a skill em $ORIGEM. Rode este script de dentro da pasta que veio no pacote."; exit 1; }
  mkdir -p "$(dirname "$SKILL")"
  if [ -e "$SKILL" ]; then
    antiga="$SKILL.anterior-$(date +%Y%m%d-%H%M)"
    mv "$SKILL" "$antiga"
    ok "versão anterior guardada em $antiga"
  fi
  cp -R "$ORIGEM" "$SKILL"
  rm -rf "$SKILL/modelos/catalogo.html"
  ok "skill instalada em $SKILL"
  mkdir -p "$ESTUDIO/animacao" "$ESTUDIO/modelos"
  ok "estúdio em $ESTUDIO"
fi

# ---------------------------------------------------------------- 3. transcritor
etapa "3. Transcritor (tempo de cada palavra da narração)"
if [ "$SO" = "Darwin" ] && [ "$CHIP" = "arm64" ]; then
  PACOTE="mlx-whisper"; MODULO="mlx_whisper"
else
  PACOTE="faster-whisper"; MODULO="faster_whisper"
fi
if [ -x "$VENV/bin/python" ] && "$VENV/bin/python" -c "import $MODULO" 2>/dev/null; then
  ok "$PACOTE em $VENV"
elif [ "$MODO" = "conferir" ]; then
  falta "$PACOTE" "bash instalar.sh"
else
  mkdir -p "$BASE"
  [ -x "$VENV/bin/python" ] || python3 -m venv "$VENV" || { echo "Não consegui criar o ambiente Python em $VENV."; exit 1; }
  echo "  instalando $PACOTE (pode levar uns minutos)..."
  "$VENV/bin/python" -m pip install --quiet --upgrade pip >/dev/null 2>&1
  if "$VENV/bin/python" -m pip install --quiet "$PACOTE" && "$VENV/bin/python" -c "import $MODULO"; then
    ok "$PACOTE em $VENV (o modelo de voz, cerca de 1,5 a 3 GB, baixa na primeira transcrição)"
  else
    falta "$PACOTE" "rode de novo: bash instalar.sh (se repetir, mostre este erro para a IA)"
  fi
fi

# ---------------------------------------------------------------- 4. voz
etapa "4. Voz da narração (opcional)"
if [ -n "${ELEVENLABS_API_KEY:-}" ]; then
  ok "chave do ElevenLabs encontrada no ambiente"
else
  echo "  [opcional] sem chave do ElevenLabs no ambiente. Dá para usar o conector do ElevenLabs no Claude,"
  echo "             um áudio gravado por você ou os modelos com só texto e música."
fi

# ---------------------------------------------------------------- 5. teste rápido
if [ "$MODO" = "teste" ]; then
  etapa "5. Teste rápido (universo de teste e a imagem de uma cena)"
  U="$ESTUDIO/animacao/teste-instalacao"
  rm -rf "$U"
  node "$SKILL/scripts/novo_universo.mjs" chapado "$ESTUDIO" teste-instalacao >/dev/null || { echo "  falhou ao criar o universo de teste"; exit 1; }
  cp "$SKILL/modelos/chapado/teste/respostas.json" "$U/respostas.json"
  node "$SKILL/scripts/novo_universo.mjs" --aplicar "$U" >/dev/null || { echo "  falhou ao aplicar as respostas de teste"; exit 1; }
  bash "$SKILL/scripts/preparar_motor.sh" "$U" || { echo "  falhou ao instalar o Remotion (npm install)"; exit 1; }
  # Uma cena de exemplo (teste-cena); sem ela, o elenco; sem os dois, a primeira composição.
  ID="$(cd "$U" && node -e "
    const s = require('fs').readFileSync('_preview/src/Root.tsx', 'utf8');
    const ids = [...s.matchAll(/id=[\"'\`]([A-Za-z0-9-]+)[\"'\`]/g)].map((m) => m[1]);
    console.log(['teste-cena', 'elenco'].find((i) => ids.includes(i)) || ids[0] || '');
  ")"
  [ -n "$ID" ] || { echo "  não achei uma composição no _preview do teste"; exit 1; }
  if (cd "$U" && npx remotion still _preview/src/index.ts "$ID" "$U/teste.png" --log=error); then
    ok "cena de teste gerada: $U/teste.png"
    echo "  Pode apagar a pasta $U depois de olhar a imagem."
  else
    falta "render do Remotion" "mostre o erro acima para a IA"
  fi
fi

# ---------------------------------------------------------------- fim
echo
if [ "$faltas" -gt 0 ]; then
  echo "Terminou com $faltas pendência(s). Veja os itens [FALTA] acima."
  exit 2
fi
if [ "$MODO" = "conferir" ]; then
  echo "Tudo certo. No Claude Code, peça um vídeo animado ou digite /video-animado."
else
  echo "Pronto. Abra o Claude Code de novo (para ele ver a skill) e peça um vídeo animado ou digite /video-animado."
fi
