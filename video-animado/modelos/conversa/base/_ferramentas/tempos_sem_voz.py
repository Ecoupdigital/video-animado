# Prévia sem voz e receita só texto e música: tempos sintéticos a partir do roteiro, sem gastar crédito de voz.
# Lê <pasta-do-video>/roteiro-falas.json (formato em roteiro_conversa.py), confere contra o universo e grava
#   src/roteiro.json  o roteiro normalizado (o episódio lê dele)
#   src/falas.json    na receita "texto-e-musica": uma "fala" por mensagem, no tempo de leitura (a primeira bolha
#                     entra em 1,2 s, depois do título e do chat vazio; antes de cada mensagem do contato, 0,8 s de
#                     digitando; antes de cada uma do dono, 0,6 s digitando no campo; cada bolha fica o tempo de ler,
#                     ~4,5 palavras por segundo mais meio segundo, no mínimo 1,1 s)
#                     na receita "vozes-por-fala" (prévia antes de gerar as vozes): uma fala por mensagem com voz, a
#                     ~2,6 palavras por segundo e 0,3 s de pausa, começando em 0, como o montar_audio.py grava; as
#                     marcadas "sem_voz" entram entre as falas, sem empurrar as outras
#   public/sfx/       os sons e a cama (gerar_sfx.py)
# Uso (na raiz do universo): python3 _ferramentas/tempos_sem_voz.py <pasta-do-video> [palavras-por-segundo-da-voz]
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_sfx import garantir_sfx  # noqa: E402
from roteiro_conversa import gravar, ler  # noqa: E402

ABERTURA = 1.2
PAUSA = 0.3

if len(sys.argv) < 2:
    sys.exit('Uso: python3 tempos_sem_voz.py <pasta-do-video> [palavras-por-segundo-da-voz]')
ep = sys.argv[1]
ritmo = float(sys.argv[2]) if len(sys.argv) > 2 else 2.6
roteiro, receita, msgs, u = ler(ep)
lado = {p['id']: p['lado'] for p in u['pessoas']}


def palavras(m):
    return len(str(m.get('texto') or '').split())


def leitura(m):
    """Tempo de leitura (o mesmo do roteiro.ts): ~4,5 palavras por segundo e meio segundo de folga, no mínimo 1,1 s."""
    if m['tipo'] == 'audio':
        return 1.5
    base = 1.2 if m['tipo'] == 'imagem' else 0.5
    return max(1.1, base + palavras(m) / 4.5)


falas = []
if receita == 'texto-e-musica':
    t = ABERTURA
    for i, m in enumerate(msgs):
        if i:
            t += 0.8 if lado.get(m['quem']) == 'esquerda' else 0.6
        d = leitura(m)
        falas.append({'quem': m['quem'], 'ini': round(t, 3), 'fim': round(t + d, 3)})
        t += d
else:
    t = 0.0
    for m in msgs:
        if m.get('sem_voz'):
            continue
        d = max(0.9, palavras(m) / ritmo)
        falas.append({'quem': m['quem'], 'ini': round(t, 3), 'fim': round(t + d, 3)})
        t += d + PAUSA

gravar(ep, roteiro)
json.dump(falas, open(os.path.join(ep, 'src', 'falas.json'), 'w'), ensure_ascii=False, indent=1)
garantir_sfx(os.path.join(ep, 'public', 'sfx'))
if receita == 'vozes-por-fala' and os.path.isfile(os.path.join(ep, 'public', 'narracao.mp3')):
    print('aviso: public/narracao.mp3 existe e vai tocar na prévia fora de sincronia; apague para a prévia sem voz')
sem = sum(1 for m in msgs if m.get('sem_voz'))
print(f'{receita}: {len(msgs)} mensagens em {len(roteiro["cenas"])} cenas, {len(falas)} falas{f" ({sem} sem voz)" if receita == "vozes-por-fala" and sem else ""}, até {falas[-1]["fim"] if falas else 0} s (nenhum crédito gasto)')
print(json.dumps(falas, ensure_ascii=False))
