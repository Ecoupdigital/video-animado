#!/usr/bin/env python3
"""Conferências automáticas de um mp4 do /video-animado.

Uso: python3 checar_video.py video.mp4 [--formato 9:16]

Confere: duração, volume (LUFS e pico), silêncio no começo e no fim,
e se o tamanho do vídeo bate com o formato. Só usa ffmpeg/ffprobe.
Sai com código 1 se algo estiver fora do aceitável.
"""
import json, re, subprocess, sys

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def main():
    if len(sys.argv) < 2:
        print("Uso: checar_video.py video.mp4 [--formato 9:16]"); sys.exit(2)
    arq = sys.argv[1]
    formato = "9:16"
    if "--formato" in sys.argv:
        formato = sys.argv[sys.argv.index("--formato") + 1]
    problemas, avisos = [], []

    p = run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,duration",
             "-of", "json", arq])
    info = json.loads(p.stdout or "{}").get("streams", [])
    video = next((s for s in info if s.get("codec_type") == "video"), None)
    audio = next((s for s in info if s.get("codec_type") == "audio"), None)
    if not video: problemas.append("Sem faixa de vídeo.")
    if not audio: problemas.append("Sem faixa de áudio (narração não entrou).")
    if video:
        w, h = int(video["width"]), int(video["height"])
        alvo = {"9:16": (1080, 1920), "1:1": (1080, 1080), "16:9": (1920, 1080)}.get(formato)
        if alvo and (w, h) != alvo:
            problemas.append(f"Tamanho {w}x{h}, esperado {alvo[0]}x{alvo[1]} para {formato}.")
        dur = float(video.get("duration") or 0)
        print(f"Duração: {dur:.1f}s · Tamanho: {w}x{h}")
        if dur > 90: avisos.append("Mais de 90 s: confira se o tema pede isso.")

    if audio:
        p = run(["ffmpeg", "-hide_banner", "-i", arq, "-af", "loudnorm=print_format=json",
                 "-vn", "-f", "null", "-"])
        m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p.stderr, re.S)
        if m:
            d = json.loads(m.group(0))
            lufs, pico = float(d["input_i"]), float(d["input_tp"])
            print(f"Volume: {lufs:.1f} LUFS · pico {pico:.1f} dB (alvo: -16 a -14 LUFS, pico até -1)")
            if lufs < -20: problemas.append(f"Volume baixo ({lufs:.1f} LUFS).")
            elif lufs < -17 or lufs > -12: avisos.append(f"Volume fora do alvo ({lufs:.1f} LUFS).")
            if pico > -1: problemas.append(f"Pico {pico:.1f} dB pode estourar. Baixe o volume.")
        p = run(["ffmpeg", "-hide_banner", "-i", arq, "-af", "silencedetect=n=-45dB:d=0.7",
                 "-vn", "-f", "null", "-"])
        ini = re.findall(r"silence_start: ([\d.]+)", p.stderr)
        if ini and float(ini[0]) < 0.05:
            fim = re.findall(r"silence_end: ([\d.]+)", p.stderr)
            if fim and float(fim[0]) > 1.0:
                avisos.append(f"Silêncio de {float(fim[0]):.1f}s no começo: o gancho demora a entrar.")

    for a in avisos: print("AVISO:", a)
    for q in problemas: print("PROBLEMA:", q)
    if not avisos and not problemas: print("Tudo dentro do esperado.")
    sys.exit(1 if problemas else 0)

main()
