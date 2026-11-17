# Entrevista curta do teste: rede de academias mostrando o trimestre e a história da marca

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta de uma família e de prova: juntando os trechos de `respostas.json` abaixo, na ordem (objetos se juntam campo a campo), sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo. A rede, a marca, as unidades, os números e os anos são inventados.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "dados-historia", "versao_modelo": "1.0", "respondido_em": "2026-11-17" }
```

Aviso dado: "São 9 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'. Este modelo não tem personagem, então não pergunto aparência nem elenco; em compensação, você escolhe o tema e as cores dele."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra essa série?" Sugestões: "Fôlego em Números", "A Nossa História", "Relatório de 1 Minuto". E o rótulo do topo: o nome em caixa alta, ou outro.
- **Resposta:** "Fôlego em Números" (a recomendada), com o trimestre no rótulo.

```json
{ "universo": { "nome": "Fôlego em Números", "pasta": "rede-academias" }, "dados": { "rotulo": "FÔLEGO · 3º TRIMESTRE" } }
```

## 2. Assunto e público

- **Perguntado:** "O que a série mostra, e quem assiste? Se já tiver o primeiro vídeo, me diz o título e o número." Opções: "Os números e a história da rede (Recomendado)", "Só o resultado do mês", "Eu descrevo".
- **Resposta:** a recomendada, e o primeiro vídeo: o melhor trimestre da rede, mais 42% de alunos novos, com a história desde a primeira sala.

```json
{ "universo": {
  "assunto": "os números e a história de uma rede de academias de bairro: o resultado de cada trimestre, quantos alunos entraram, como cada unidade abriu e o que mudou desde a primeira sala",
  "publico": "alunos, ex-alunos e vizinhos das unidades, de 18 a 55 anos, que gostam de ver o bastidor e o crescimento da academia que frequentam" },
  "amostra": { "titulo": "O melhor *trimestre* da rede", "marco": "Primeira sala, 40 alunos", "chip": "8 min", "manchete": "Academia de bairro abre às 5h", "valor": { "numero": 42, "prefixo": "+", "sufixo": "%" } } }
```

## 3. Tom

- **Perguntado:** "Qual o tom da série?" Opções: "Animado e direto, comemorando o número junto (Recomendado)", "Calmo, de documentário", "Leve, com humor", "Outro".
- **Resposta:** a recomendada, sem prometer resultado de treino.

```json
{ "universo": { "tom": "animado e direto, de quem comemora o número junto com o aluno, sem exagero e sem prometer resultado de treino" } }
```

## 4. Marca

- **Perguntado:** "Os vídeos são de uma marca? Se sim, o nome e a cor." Opções: "Com a minha marca (Recomendado)", "Sem marca".
- **Resposta:** a rede, com o roxo dela.

```json
{ "marca": { "nome": "Fôlego Academias", "cor": "#7C3AED" } }
```

## 8. Tema (`tema`)

- **Mostrado:** os 4 stills `tema-isometrico`, `tema-linha-do-tempo`, `tema-mapa` e `tema-jornal` lado a lado.
- **Perguntado:** "Qual destes 4 jeitos combina com a série? O tema muda só o visual: dá para trocar depois sem refazer roteiro." Opções: "Mundo isométrico (Recomendado: número e resultado)", "Linha do tempo (história da marca)", "Mapa com rota (expansão, entrega)", "Recortes de jornal (curiosidade antiga)".
- **Resposta:** o isométrico, porque a série começa pelo resultado do trimestre.

```json
{ "tema": "isometrico" }
```

## 9. Cores do tema (`cores-do-tema`)

- **Perguntado:** "No isométrico, a cor troca tudo: degradê, piso, colunas, cartões, texto e destaque. Quer o destaque na cor da marca, as cores do isométrico como estão ou uma das 3 paletas prontas (noite, grafite, aurora)?" Opções: "Destaque na cor da marca (Recomendado)", "Cores do tema como estão", "Uma das paletas prontas".
- **Resposta:** a recomendada: o número grande, a coluna do resultado e a linha no roxo da rede (clareado para ler no fundo escuro).

```json
{ "cores": { "origem": "marca", "paleta": null } }
```

## 10. Voz

- **Perguntado:** "Como fica a voz? É uma narração inteira, uma voz só." Opções: "Voz pronta do ElevenLabs, clara e com energia (Recomendado)", "Voz clonada de alguém da rede", "Áudio que vocês já gravaram".
- **Resposta:** a recomendada; a voz escolhida fica para a Parte B, com o custo avisado antes.

```json
{ "voz": { "caminho": "pronta", "voice_id": null } }
```

## 11. O que nunca pode acontecer

- **Dito antes:** as regras fixas do modelo (todo número, ano e percentual de fora com a fonte na tela e no card final, o número que conta chega ao valor dito, mapa sempre genérico, uma cor de destaque por tela).
- **Perguntado:** "E o que nunca pode aparecer ou ser dito nos vídeos de vocês?" Opções: a lista recomendada adaptada à academia; "Eu escrevo a lista".
- **Resposta:** a recomendada, com a regra de não citar concorrente pelo nome.

```json
{ "nunca": ["prometer emagrecimento ou resultado de treino", "mostrar número de aluno ou de faturamento sem dizer de onde veio", "comparar com academia concorrente pelo nome"] }
```

## 12. Card final (`card-final`)

- **Perguntado:** "No fim de todo vídeo vem o card com a assinatura: qual o @, a frase embaixo e a pergunta de referência? O aviso 'Narração gerada por IA' fica ligado, porque a voz é gerada." Opções: "Assinatura com o @ e a frase recomendada (Recomendado)", "Eu escrevo a assinatura e a frase".
- **Resposta:** o @ da rede, com a frase do trimestre e a pergunta das unidades.

```json
{ "fecho": { "chamada": "Qual unidade é a sua?", "assinatura": "@folegoacademias", "frase_assinatura": "me segue pra ver o próximo trimestre", "aviso_ia": true } }
```

Depois: `novo_universo.mjs --aplicar`, as 3 marcas `ESCREVER` do brandbook redigidas, `--conferir` 0, e mostrados os stills `tema-isometrico`, `folha-isometrico` e `elenco`.

## Como juntar

Cada trecho entra no `respostas.json` na ordem das perguntas: objetos se juntam campo a campo. Resultado: o `teste/respostas.json` deste modelo, com o `respondido_em` do dia. Depois, `novo_universo.mjs --aplicar`.
