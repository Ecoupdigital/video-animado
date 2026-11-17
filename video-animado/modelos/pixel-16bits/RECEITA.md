# Receita de vídeo: sprites por som

Parte B deste universo (modelo `pixel-16bits`). Uma narração inteira, uma voz só, conta a notícia; o boneco pixel fala com a boca pelo som da voz, o título entra por linha, o card de cada seção mostra o que a voz diz e a legenda corre em blocos de até 3 palavras. Nenhum tempo é digitado à mão: tudo sai da transcrição e do roteiro. Siga na ordem e rode tudo da **raiz do universo**.

## 1. Apuração

- Cheque a notícia em pelo menos uma fonte que dá para citar (comunicado oficial, reportagem, documento). Anote veículo, data e link.
- Boato não vira lançamento: o que ainda não é oficial entra como "ainda não é oficial" (selo `EM TESTE`, `BOATO`, gesto de ombros).
- Passe tudo pela lista do que nunca acontece (seção 12 do `BRANDBOOK-ANIMACAO.md`) e pelas pronúncias (seção 11 e `pronuncias.md`).
- Nenhum logo de empresa de terceiros na tela: o card usa o símbolo da marca do universo, letras e formas.

## 2. Roteiro curto em seções (aprovado antes da voz)

15 a 35 s, 4 a 7 seções. Cada seção tem o texto que a voz fala, o título em 2 linhas (até cerca de 20 letras por linha; mais que isso encolhe), as palavras de destaque, o gesto do boneco e um card com a palavra em que cada elemento entra (`em`, uma palavra do texto da própria seção). Grave em `videos/AAAA-MM-DD-slug/roteiro-falas.json`:

```json
{
  "secoes": [
    { "texto": "Calor forte chegou e o seu cachorro sente muito mais do que você.",
      "titulo": ["Calor forte?", "Seu cão sente mais"], "destaque": ["cão", "mais"], "legenda": ["calor"], "gesto": "duas",
      "card": { "molde": "blocos", "rotulo": "// temperatura do corpo",
                "blocos": [ { "rotulo": "você", "valor": "36,5 °C", "em": "você." }, { "rotulo": "cão e gato", "valor": "38,5 °C", "em": "cachorro" } ] } },
    { "texto": "Mas atenção: língua roxa é emergência, corre pra clínica.",
      "titulo": ["Língua roxa", "é emergência"], "destaque": ["emergência"], "gesto": "ombros",
      "card": { "molde": "selo", "rotulo": "// sinal de alerta", "titulo": "Golpe de calor", "selo": "EMERGÊNCIA", "em": "emergência,",
                "icone": "cruz", "etiquetas": [ { "texto": "língua roxa", "em": "língua" } ] } }
  ],
  "final": { "duracao": 3 }
}
```

| Molde | Campos | Quando usar |
|---|---|---|
| `lista` | `titulo` (opcional), `itens` (até 5: `texto`, `nota`, `em`) | passos, cuidados, o que muda; cada item se marca quando é falado |
| `conversa` | `mensagens` (até 3: `quem`, `texto`, `em`, `lado` `esq` ou `dir`) | a pergunta do público e a resposta; o lado direito mostra "digitando" antes |
| `selo` | `titulo`, `selo`, `em`, `icone` (símbolo de `opcoes.json`, padrão o da marca), `etiquetas` (até 4) | o "mas": limite, alerta, beta, ainda não é oficial |
| `blocos` | `blocos` (até 4: `rotulo`, `valor`, `em`) | números, antes e agora, comparação |

Gestos: `duas` na notícia grande, `uma` para apresentar ou apontar, `nada` na explicação, `ombros` no "mas". `destaque` pinta as palavras do título; `legenda` (opcional) pinta palavras da legenda. O card final (`final.duracao`, padrão 3 s, de 1 a 6) mostra o perfil das respostas depois da voz; `final.titulo` troca o título que fica na tela (padrão: o da última seção).

Mostre o roteiro à pessoa e espere o ok antes de gastar voz.

## 3. Prévia sem voz (antes de gastar crédito)

```bash
E=videos/AAAA-MM-DD-slug
mkdir -p $E && cp -R _ferramentas/episodio-base/src $E/
python3 _ferramentas/tempos_sem_voz.py $E          # palavras e bocas sintéticas, falas.json, sprites e sons em public/
npx tsc --noEmit
bash _ferramentas/previa.sh $E 1 4 7 10 13 16       # revisao/previa.mp4 e revisao/folha.png
```

Olhe a folha: título e card certos em cada seção, elementos entrando nas palavras marcadas, legenda acima da cabeça. Palavra de `em` que não está no texto da seção: o `tempos_sem_voz.py` sai 1 e diz qual.

## 4. Voz (uma só, 1 versão por vez, custo avisado)

- Caminho e voz da seção 10 do brandbook. Texto da voz = os textos das seções, na ordem, com as pronúncias aplicadas.
- **Avise o custo antes** (caracteres do texto) e gere **1 versão por vez**. Não gostou de um trecho: gere só aquele trecho e emende, sem refazer tudo.
- Velocidade: só pelo `atempo` do ffmpeg (`ffmpeg -i voz.mp3 -filter:a "atempo=1.1" public/narracao.mp3`), nunca editando o texto para "correr". Os tempos saem da voz final: rode o passo 6 depois de mudar a velocidade.
- Salve em `$E/public/narracao.mp3` (ou `.wav`).

## 5. Rhubarb (uma vez por máquina)

```bash
bash _ferramentas/instalar_rhubarb.sh
```

Baixa o Rhubarb Lip Sync 1.13.0 do release oficial para `~/.video-animado/` (sem root; não baixa de novo se já existe). Sem rede, sem `unzip` ou no Mac sem Rosetta, sai 1 dizendo o que falta: o passo 6 segue pela força da voz.

## 6. Dados da voz

```bash
python3 _ferramentas/dados.py $E                 # bocas pelo Rhubarb, se instalado
python3 _ferramentas/dados.py $E --sem-rhubarb   # bocas pela força da voz (ou VIDEO_ANIMADO_SEM_RHUBARB=1)
```

Transcreve a voz, troca as palavras ouvidas pelas do roteiro mantendo os tempos e grava `src/dados.ts` (`PALAVRAS`, `BOCAS`, `FIM` e `CAMINHO`), `src/roteiro.json` e `src/falas.json`. A saída diz qual caminho usou (`bocas: rhubarb` ou `bocas: volume`), e o `dados.ts` também. Pelo Rhubarb a boca usa as 9 formas; pela força da voz, X, B, C e D.

## 7. Montar pelos dados e conferir

O episódio base já monta tudo pelo `roteiro.json` e pelo `dados.ts`: não escreva tempo à mão. Card fora dos moldes: escreva o componente com as peças de `componentes/PixelNoticia.tsx` e use o tempo da palavra (`s.em("palavra", padrão)`).

```bash
npx tsc --noEmit
npx remotion still $E/src/index.ts ep $E/revisao/still-2s.png --frame=60 --public-dir=$E/public
```

Stills de conferência antes do render: um por seção e um no card final (frame = segundo x 30). Confira o título, o card, a legenda acima da cabeça, a boca aberta na fala e fechada no silêncio, nada fora da área segura.

## 8. Render e normalização

```bash
npx remotion render $E/src/index.ts ep $E/out/ep.mp4 --public-dir=$E/public
ffmpeg -i $E/out/ep.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 $E/out/ep-final.mp4
bash _ferramentas/frames.sh $E 1 5 9 13
```

A duração é o fim da voz mais o card final. Olhe a folha de frames antes de entregar.

## Armadilhas

- Sprite borrado: o `<Img>` do boneco precisa de `imageRendering: 'pixelated'` (já está no `Boneco`); nunca redimensione os PNG de `public/px/`.
- Mudou a aparência nas respostas: rode `novo_universo.mjs --aplicar` de novo (refaz os 72 sprites) e copie `public/px/` para os vídeos que ainda vão ser renderizados (o `dados.py` e o `tempos_sem_voz.py` copiam sozinhos).
- Palavra de `em` com pontuação ("você.") casa sem a pontuação; palavra repetida na seção pega a primeira.
- Rhubarb no Mac com chip Apple pode precisar do Rosetta; sem ele, use `--sem-rhubarb`.
- `public/narracao.*` presente na prévia sem voz toca fora de sincronia: apague antes da prévia.
