#!/usr/bin/env bash
# Instala o Rhubarb Lip Sync 1.13.0 (bocas pelos fonemas da voz) em ~/.video-animado/, sem root.
# Baixa o zip do release oficial no GitHub (Linux ou macOS, pelo uname), extrai, apaga o zip e confere a versão.
# Se já estiver instalado, não baixa de novo. Sem rede, sem curl ou sem unzip, sai 1 dizendo o que falta:
# o _ferramentas/dados.py segue sem ele, pela força da voz.
# Uso (de qualquer pasta): bash _ferramentas/instalar_rhubarb.sh
# Pasta: ~/.video-animado (ou a da variável VIDEO_ANIMADO_FERRAMENTAS). Bash 3.2 ou mais novo.

VERSAO="1.13.0"
DEST="${VIDEO_ANIMADO_FERRAMENTAS:-$HOME/.video-animado}"

case "$(uname -s)" in
  Linux) SO="Linux" ;;
  Darwin) SO="macOS" ;;
  *)
    echo "sistema $(uname -s) sem Rhubarb pronto: o dados.py segue pela força da voz"
    exit 1
    ;;
esac

achar() {
  find "$DEST" -type f -name rhubarb 2>/dev/null | head -n 1
}

existente="$(achar)"
if [ -n "$existente" ] && [ -x "$existente" ]; then
  echo "já instalado: $existente ($("$existente" --version 2>/dev/null | grep -m 1 .))"
  exit 0
fi

for cmd in curl unzip; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "falta o $cmd para instalar o Rhubarb (instale e rode de novo); sem ele, o dados.py segue pela força da voz"
    exit 1
  fi
done

URL="https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v${VERSAO}/Rhubarb-Lip-Sync-${VERSAO}-${SO}.zip"
mkdir -p "$DEST" || exit 1
ZIP="$DEST/rhubarb-${VERSAO}-${SO}.zip"
echo "baixando o Rhubarb ${VERSAO} (${SO}) do release oficial: $URL"
if ! curl -fSL --retry 2 -o "$ZIP" "$URL"; then
  rm -f "$ZIP"
  echo "não deu para baixar (sem rede ou o GitHub não respondeu); o dados.py segue pela força da voz"
  exit 1
fi
if ! unzip -q -o "$ZIP" -d "$DEST"; then
  rm -f "$ZIP"
  echo "o zip baixado não abriu; rode de novo"
  exit 1
fi
rm -f "$ZIP"

bin="$(achar)"
if [ -z "$bin" ]; then
  echo "o zip não trouxe o executável rhubarb"
  exit 1
fi
chmod +x "$bin"
# no Mac, tira a quarentena do download para o sistema deixar rodar
if [ "$SO" = "macOS" ] && command -v xattr >/dev/null 2>&1; then
  xattr -dr com.apple.quarantine "$(dirname "$bin")" 2>/dev/null
fi
if ! versao="$("$bin" --version 2>/dev/null | grep -m 1 .)"; then
  echo "o rhubarb foi instalado em $bin mas não rodou (no Mac com chip Apple pode faltar o Rosetta); o dados.py segue pela força da voz"
  exit 1
fi
echo "ok: $bin ($versao)"
