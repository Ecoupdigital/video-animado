# Receita de vídeo: duas vozes ou só texto e música (Conversa no celular)

Parte B deste universo (modelo `conversa`). Uma conversa de mensagem entre 2 pessoas, no celular do dono (à direita) com o contato no cabeçalho (à esquerda). O modelo tem **duas receitas** (`modelo.json`, campo `receitas`); a padrão do universo está no `respostas.json` (`receita`, pergunta 10) e cada vídeo pode escolher a outra no próprio roteiro:

| Receita | Quando usar | Voz | Como as bolhas entram |
|---|---|---|---|
| **Duas vozes** (`vozes-por-fala`) | a conversa ganha com a voz de cada um: ligação que vira mensagem, áudio que conta a história, humor que depende do jeito de falar | uma voz por lado; cada mensagem com voz é um arquivo | cada bolha entra no começo da fala dela, do lado de quem fala; as marcadas `"sem_voz": true` entram entre as falas, sem empurrar as outras |
| **Só texto e música** (`texto-e-musica`) | a graça está em ler a conversa: atendimento, pedido, golpe evitado, mal-entendido; vídeo para assistir sem som | nenhuma (nenhum crédito) | cada bolha fica o tempo de ler; antes das mensagens do contato aparece o digitando, antes das do dono o texto é digitado no campo; cama leve de música do kit ou a música da própria pessoa |

Rode tudo da **raiz do universo**.

## 1. Roteiro (aprovado antes de qualquer voz)

- Leia o `BRANDBOOK-ANIMACAO.md` (seções 2, 3, 4 e 12) e as fichas em `personagens/`.
- Mensagens curtas, como gente escreve: uma ideia por bolha, de 3 a 15 palavras. Mensagem longa encolhe a letra (até 300 letras cabem, mas cansam). Cada mensagem puxa a próxima.
- Em cenas: a `abertura` com o título (a palavra destacada entre asteriscos) e as primeiras mensagens; uma ou mais `conversa` (a legenda da cena diz onde e quando: "Sexta, 20h"); `rolagem` quando a conversa passa da tela; e o `fecho` (o card final, cerca de 4 s).
- Recursos: `"tipo": "audio"` com `"duracao": "0:07"`; `"tipo": "imagem"` com `"imagem"` (bolo, foto, mapa, recibo, produto, calendario) e uma legenda opcional em `"texto"`; `"reacao"` (coracao, risada, espanto, estrela, ok) presa na bolha; `"horario"` (sem ele, a hora da tela do chat mais 1 minuto a cada 3 mensagens); `"lido": false` deixa a mensagem do dono só enviada.
- Passe o roteiro pela lista do que nunca acontece (seção 12) e pelas pronúncias (seção 11 e `pronuncias.md`). Nunca conversa real nem nome de cliente real sem autorização.
- Grave em `videos/AAAA-MM-DD-slug/roteiro-falas.json`:

```json
{
  "receita": "texto-e-musica",
  "cenas": [
    { "tipo": "abertura", "titulo": "A encomenda de *última hora*", "legenda": "Sexta, 20h",
      "mensagens": [
        { "quem": "rita", "texto": "Oi! Ainda dá pra encomendar um bolo para amanhã?" },
        { "quem": "forno", "texto": "Dá sim! Para quantas pessoas?" }
      ] },
    { "tipo": "conversa", "legenda": "O pedido",
      "mensagens": [
        { "quem": "forno", "tipo": "imagem", "imagem": "bolo", "texto": "Esse serve vinte fatias." },
        { "quem": "rita", "tipo": "audio", "duracao": "0:07" },
        { "quem": "rita", "texto": "Amei!", "reacao": "coracao", "sem_voz": true }
      ] },
    { "tipo": "fecho" }
  ]
}
```

`quem` é o id de um dos 2 lados (`personagens/<id>`). Quem não é um dos lados, tipo, imagem ou reação que não existe: o `tempos_sem_voz.py` e o `montar_audio.py` saem 1 dizendo o que, onde e os aceitos.

## 2. Pasta do vídeo

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/
```

O episódio base (`$E/src/`) já lê o roteiro e o `falas.json`, põe cada bolha no tempo da receita, abre com o título e o chat vazio (se a primeira fala começa antes de 1,2 s, tudo é deslocado para começar em 1,2 s, a voz junto), mostra o digitando e o texto digitado no campo, troca título e legenda por cena, rola a conversa, fecha com o card final e toca a narração, os sons e a música só se os arquivos existirem. Nunca redesenhe o celular nem as bolhas: use os componentes.

## 3. Prévia sem voz (as duas receitas)

```bash
python3 _ferramentas/tempos_sem_voz.py $E        # src/roteiro.json, src/falas.json e public/sfx/
npx tsc --noEmit
bash _ferramentas/previa.sh $E 0.6 1.6 3.4 5.2 7.0 9.0   # meia resolução + folha de frames em $E/revisao/folha.png
```

- **Só texto e música:** esta prévia já é o vídeo (falta só o render final, passo 6). Tempos: a primeira bolha em 1,2 s; 0,8 s de digitando antes de cada mensagem do contato e 0,6 s de texto no campo antes de cada uma do dono; cada bolha fica ~4,5 palavras por segundo mais meio segundo (no mínimo 1,1 s; áudio 1,5 s; imagem 1,2 s a mais). A cama do kit toca baixinho do começo ao fim; para usar a música da pessoa, ponha `public/musica.mp3` (ou `musica.wav`) na pasta do vídeo, que ela toca no lugar.
- **Duas vozes:** a prévia simula as falas (~2,6 palavras por segundo, 0,3 s de pausa) só nas mensagens com voz, para ver o ritmo antes de gastar crédito.

Olhe a folha: bolha do lado certo, digitando antes das do contato, a conversa subindo quando passa da tela, nada fora da área segura, o card final no fim. Corrija e rode de novo. Só depois disso a voz.

## 4. Vozes (só na receita de duas vozes; custo avisado antes)

- Avise quantos caracteres vão para cada voz antes de gerar (soma dos `texto` das mensagens com voz de cada lado).
- Uma voz por lado (seção 10 do brandbook). Uma tomada por mensagem; gerar de novo só a que saiu estranha.
- Salve cada mensagem com voz em `$E/audio/<n>-<id>.mp3`, na ordem das mensagens com voz do roteiro (`1-rita.mp3`, `2-forno.mp3`, `3-rita.mp3`...). As marcadas `"sem_voz": true` não têm arquivo.

## 5. Áudio e tempos (duas vozes)

```bash
python3 _ferramentas/montar_audio.py $E 1-rita.mp3:0.3 2-forno.mp3:0.3 3-rita.mp3:0.3    # pausa depois de cada fala, em segundos
```

Corta o silêncio das pontas, junta, normaliza (-15 LUFS) e grava `public/narracao.mp3`, `src/falas.json` (quem fala de quando a quando), `src/roteiro.json` e os sons em `public/sfx/`. Confere que o arquivo `n` é de quem manda a `n`-ésima mensagem com voz e que a quantidade bate. Arquivo temporário só dentro de `$E/audio/_cortado/`.

## 6. Render e conferência

```bash
npx tsc --noEmit
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
bash _ferramentas/frames.sh $E 1.1 1.45 5.5 5.85 ...     # um frame por tempo + $E/frames/_folha.jpg
```

Tire os tempos do `falas.json`: o começo de cada fala (mais o deslocamento da abertura, 1,2 s quando a primeira fala começa em 0) menos 0,1 s e mais 0,25 s. Na folha: em cada par, a bolha ainda não está no primeiro e está inteira no segundo, do lado de quem fala; o título e a legenda nunca por cima da bolha nova; nada fora da área segura. Render final 1080 x 1920, 30 fps.

## Sons

`chegou.wav` (bolha do contato), `enviada.wav` (bolha do dono), `tecla.wav` (o dono digitando) e `cama.wav` (8 s em laço, a música da receita só texto) saem de `_ferramentas/gerar_sfx.py`, por síntese só com numpy, sem imitar som de app real (origem em `_ferramentas/sfx/ORIGEM.md`). O episódio toca os três primeiros sozinho; na receita de duas vozes, mais baixo, por baixo da voz.

## Ferramentas

Python 3 com numpy, ffmpeg e ffprobe. Os `.sh` são bash comum (rodam no bash 3.2 do Mac). Nunca rode `npm install` dentro de um `node_modules` feito por link (`.motor-por-link`).
