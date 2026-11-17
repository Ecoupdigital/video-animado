# Trilha de fundo do universo, sintetizada em código só com numpy e wave (sem direito autoral de terceiros,
# sem arquivo de fora, sem aleatório: rodar de novo dá o mesmo arquivo). Origem em _ferramentas/sfx/ORIGEM.md.
# Piano elétrico suave: acordes com ataque macio e arpejo leve, 72 bpm, graves e médios, sem melodia que
# brigue com a voz; entrada de 1,5 s e saída de 3 s no próprio arquivo. No episódio ela toca em volume fixo
# baixo (0,09) pela peça Trilha de componentes/Montagem.tsx.
# Uso: python3 trilha.py <saida.wav> <segundos>
# Outros scripts usam gerar_trilha(saida, segundos).
import sys, wave
import numpy as np


def gerar_trilha(saida, segundos):
    sr = 44100; dur = float(segundos); n = int(sr * dur)
    out = np.zeros(n)

    def nota(freq, ini, comp, vol):
        i0 = int(ini * sr); m = min(int(comp * sr), n - i0)
        if m <= 0: return
        t = np.arange(m) / sr
        env = (1 - np.exp(-t / 0.02)) * np.exp(-t / (comp * 0.45))
        tom = np.sin(2*np.pi*freq*t) + 0.35*np.sin(2*np.pi*2*freq*t)*np.exp(-t/0.4) + 0.12*np.sin(2*np.pi*3*freq*t)*np.exp(-t/0.25)
        out[i0:i0+m] += vol * env * tom
    hz = lambda midi: 440 * 2 ** ((midi - 69) / 12)
    # Fmaj7, Am7, Dm7, Bbmaj7 (graves e médios, sem melodia que brigue com a voz)
    acordes = [[41, 57, 60, 64, 69], [45, 55, 60, 64, 67], [38, 57, 60, 62, 65], [46, 57, 58, 62, 65]]
    bpm = 72; tempo = 60 / bpm; compasso = 4 * tempo
    t = 0.0; k = 0
    while t < dur:
        ac = acordes[k % 4]
        nota(hz(ac[0]), t, compasso * 1.1, 0.22)
        for j, m in enumerate(ac[1:]):
            nota(hz(m), t + 0.02 * j, compasso * 0.95, 0.10)
        for b in range(4):  # arpejo leve, uma nota por tempo
            nota(hz(ac[1 + (b * 2) % 4] + 12), t + b * tempo + tempo * 0.5, tempo * 1.4, 0.05)
        t += compasso; k += 1
    # fade de entrada e saída
    f = int(sr * 1.5); out[:f] *= np.linspace(0, 1, f); out[-f*2:] *= np.linspace(1, 0, f*2)
    # filtro passa-baixa simples (deixa mais macio)
    for _ in range(2):
        out = np.convolve(out, np.ones(6) / 6, mode='same')
    out = out / np.max(np.abs(out)) * 0.8
    w = wave.open(saida, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
    return dur


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit('Uso: python3 trilha.py <saida.wav> <segundos>')
    print('ok', gerar_trilha(sys.argv[1], sys.argv[2]))
