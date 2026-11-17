# Catálogo de modelos

Quando a pessoa vai criar um universo novo (passo 0 sem universo, ou "Criar um novo"), mostre o catálogo antes de qualquer pergunta. Ele junta sozinho os modelos da skill (`modelos/`) e os modelos locais da pessoa (`<estúdio>/modelos/`), e termina sempre no cartão "Criar um estilo novo".

## Gerar

```bash
node scripts/catalogo.mjs --estudio <estúdio>                      # grava <estúdio>/modelos/catalogo.html
node scripts/catalogo.mjs --estudio <estúdio> --png <arquivo.png>  # e captura a página pelo Chrome headless
```

O script imprime a lista numerada (número, id, nome) com a mesma numeração dos cartões da página. Os modelos da skill vêm primeiro, numa ordem fixa; depois os modelos locais, com o selo "seu modelo"; o último número é sempre "Criar um estilo novo". Modelo que não passa no `conferir_kit.mjs` aparece com um aviso no cartão e na lista (`[com aviso]`); o catálogo nunca para por causa dele. Gere de novo a cada abertura: é rápido e pega modelo local novo.

A página abre direto do disco, sem servidor e sem internet: imagens embutidas, fonte do sistema, e o trecho de vídeo por caminho `file://` com um quadro de capa (aparece mesmo quando o navegador não toca o vídeo).

## Mostrar

- **Mac (aluno):** abra o HTML para a pessoa ver (`open <estúdio>/modelos/catalogo.html`). O trecho toca em laço, sem som.
- **Linux (VPS, agentes, sessão sem tela):** gere com `--png`, leia a imagem e mostre para a pessoa (ou descreva cada cartão, se a conversa não aceitar imagem). O Chrome usado é `/usr/bin/google-chrome` no Linux; a variável `CHROME` troca o caminho.

Diga em uma frase o que cada modelo faz, sem jargão. Não descreva os scripts.

## A pergunta única

Uma pergunta só, com AskUserQuestion, depois de mostrar o catálogo:

- até **3 modelos**, o recomendado primeiro e marcado "(Recomendado)";
- mais a opção **"Criar um estilo novo"** (entrevista completa, 25 a 35 perguntas);
- no texto da pergunta: "Se quiser outro modelo do catálogo, responda o número dele".

Como escolher os 3:

1. **Modelo local tem preferência.** Se a pessoa já salvou um estilo (selo "seu modelo") e o assunto combina, ele entra primeiro.
2. Depois o modelo cujo "para que serve" mais combina com o assunto que a pessoa contou. Sem assunto ainda, o primeiro da lista.
3. Modelo com aviso de conferência só entra se a pessoa pedir pelo número; nesse caso, avise que ele pode não funcionar.

Com "decide por mim", fique com o recomendado e diga qual escolheu.

## Depois da escolha

- **Modelo:** siga o caminho do modelo na SKILL.md: `novo_universo.mjs <id> <estúdio> <pasta>`, entrevista curta (`references/entrevista-curta.md` e o `PERGUNTAS.md` do modelo), `--aplicar`, lacunas, folhas e aprovação de olho.
- **Número de outro modelo:** o mesmo caminho, com o id daquele número na lista do terminal.
- **Criar um estilo novo:** Parte A da SKILL.md (entrevista completa). No fim, ofereça salvar como modelo local (`references/modelo-local.md`).

## Cartão de família

Modelo de família (um modelo com vários temas, como a Explicação, a Dados e história e o Conto com personagem) ocupa **um cartão e um número só**. No Conto, o elenco do cartão mostra os personagens no traço do tema recomendado; o mesmo personagem sai no traço de qualquer tema. O cartão mostra o trecho, a folha e as peças no tema recomendado e, embaixo, a fileira de temas: a miniatura de cada um, o nome, o selo "recomendado" no tema recomendado e o que a cor troca nele. O tema **não se escolhe no catálogo**: a pessoa escolhe o modelo pelo número, e o tema vem na entrevista curta (pergunta de tema, ver `entrevista-curta.md`). Se a pessoa já disser o tema ao escolher ("o 5, na lousa", "o 6, no mapa", "o 7, no papel recortado"), guarde e não pergunte de novo. Ao descrever o cartão, diga em uma frase o que os temas têm em comum e em meia frase a cara de cada um.

## Vitrine de cada cartão

Os cartões usam `vitrine/vitrine.json` (nome de exibição, frase, exemplo), a linha "Para que serve" da `FICHA-DO-MODELO.md` e os arquivos `vitrine/folha.jpg`, `elenco.jpg` e `trecho.mp4`; o cartão de família usa também os `temas` do `modelo.json` (nome e `cor_troca`) e as miniaturas `vitrine/tema-<id>.jpg`. Modelo sem trecho mostra só as imagens; sem nenhuma, o cartão diz o comando que gera a vitrine (`node scripts/gerar_vitrine.mjs <id> [--estudio <estúdio>]`). A legenda da segunda imagem vem de `legendas.elenco` (o Neon retrô, o modelo 10, chama de "Peças"; o trecho dele passa no `conferir_piscada.py` do kit, como todo vídeo do neon).
