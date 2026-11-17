# Entrevista curta do teste: escritório de contabilidade explicando pró-labore

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta de uma família e de prova: juntando os trechos de `respostas.json` abaixo, na ordem (objetos se juntam campo a campo), sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo. O escritório, a marca e os números são inventados.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "explicacao", "versao_modelo": "1.0", "respondido_em": "2026-11-17" }
```

Aviso dado: "São 9 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'. Este modelo não tem personagem, então não pergunto aparência nem elenco; em compensação, você escolhe o tema e as cores dele."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra essa série?" Sugestões: "Contas em Dia", "Aula de 1 Minuto", "Pró-labore sem Mistério". E o rótulo do topo: o nome em caixa alta, ou outro.
- **Resposta:** "Contas em Dia" (a recomendada), com o assunto da temporada no rótulo.

```json
{ "universo": { "nome": "Contas em Dia", "pasta": "contas-em-dia" }, "explicacao": { "rotulo": "CONTAS EM DIA · PRÓ-LABORE" } }
```

## 2. Assunto e público

- **Perguntado:** "O que a série explica, e quem assiste? Se já tiver o título do primeiro vídeo, me diz." Opções: "Contabilidade de empresa pequena com a conta na tela (Recomendado)", "Imposto de pessoa física", "Eu descrevo".
- **Resposta:** a recomendada, e o primeiro vídeo: como definir o pró-labore, começando por separar as contas.

```json
{ "universo": {
  "assunto": "contabilidade de empresa pequena explicada passo a passo: pró-labore, distribuição de lucro, imposto do mês e o que entra em cada conta, sempre com a conta feita na tela",
  "publico": "donos de empresa pequena e prestadores de serviço de 25 a 50 anos que misturam a conta da empresa com a de casa" },
  "amostra": { "titulo": "Como definir o seu *pró-labore*", "item": "Separar as contas" } }
```

## 3. Tom

- **Perguntado:** "Qual o tom da série?" Opções: "Didático e calmo, de quem faz a conta junto (Recomendado)", "Rápido e direto", "Leve, com humor", "Outro".
- **Resposta:** a recomendada, sem dar bronca em quem erra.

```json
{ "universo": { "tom": "didático e calmo, de quem senta do lado e faz a conta junto, sem jargão e sem dar bronca" } }
```

## 4. Marca

- **Perguntado:** "Os vídeos são de uma marca? Se sim, o nome e a cor." Opções: "Com a minha marca (Recomendado)", "Sem marca".
- **Resposta:** o escritório, com a cor verde dele.

```json
{ "marca": { "nome": "Tabuada Contábil", "cor": "#1F6F5C" } }
```

## 8. Tema (`tema`)

- **Mostrado:** os 4 stills `tema-quadro`, `tema-lousa`, `tema-post-its` e `tema-tela-app` lado a lado.
- **Perguntado:** "Qual destes 4 jeitos combina com a série? O tema muda só o visual: dá para trocar depois sem refazer roteiro." Opções: "Quadro de explicação (Recomendado: processo e método)", "Lousa de giz (conta e fórmula)", "Quadro de post-its (rotina)", "Tela de app (tutorial de sistema)".
- **Resposta:** o quadro, porque a série explica processo passo a passo.

```json
{ "tema": "quadro" }
```

## 9. Cores do tema (`cores-do-tema`)

- **Perguntado:** "No quadro, a cor troca tudo: papel, grade, traço, destaque e post-its. Quer o destaque na cor da marca, as cores do quadro como estão ou uma das 3 paletas prontas (papel claro, papel kraft, quadro branco)?" Opções: "Destaque na cor da marca (Recomendado)", "Cores do tema como estão", "Uma das paletas prontas".
- **Resposta:** a recomendada: o risco, o círculo e a palavra-chave no verde do escritório.

```json
{ "cores": { "origem": "marca", "paleta": null } }
```

## 10. Voz

- **Perguntado:** "Como fica a voz? É uma narração inteira, uma voz só." Opções: "Voz pronta do ElevenLabs, calma e clara (Recomendado)", "Voz clonada de alguém do escritório", "Áudio que vocês já gravaram".
- **Resposta:** a recomendada; a voz escolhida fica para a Parte B, com o custo avisado antes.

```json
{ "voz": { "caminho": "pronta", "voice_id": null } }
```

## 11. O que nunca pode acontecer

- **Dito antes:** as regras fixas do modelo (número e regra oficial com a fonte na tela e no card final, janela de app sempre genérica, uma cor de destaque por tela).
- **Perguntado:** "E o que nunca pode aparecer ou ser dito nos vídeos de vocês?" Opções: a lista recomendada adaptada à contabilidade; "Eu escrevo a lista".
- **Resposta:** a recomendada, com a regra de não chamar ninguém de errado.

```json
{ "nunca": ["prometer que a pessoa vai pagar menos imposto", "dar alíquota ou valor sem dizer a regra e a fonte na tela", "chamar de errado quem ainda mistura as contas"] }
```

## 12. Card final (`card-final`)

- **Perguntado:** "No fim de todo vídeo vem o card com a assinatura: qual o @, a frase embaixo e a pergunta de referência? O aviso 'Narração gerada por IA' fica ligado, porque a voz é gerada." Opções: "Assinatura com o @ e a frase recomendada (Recomendado)", "Eu escrevo a assinatura e a frase".
- **Resposta:** a recomendada, com a pergunta do pró-labore.

```json
{ "fecho": { "chamada": "Ficou alguma dúvida sobre o seu pró-labore?", "assinatura": "@tabuadacontabil", "frase_assinatura": "me segue pra aprender o próximo passo", "aviso_ia": true } }
```

Depois: `novo_universo.mjs --aplicar`, as 3 marcas `ESCREVER` do brandbook redigidas, `--conferir` 0, e mostrados os stills `tema-quadro`, `folha-quadro` e `elenco`.

## Como juntar

Cada trecho entra no `respostas.json` na ordem das perguntas: objetos se juntam campo a campo. Resultado: o `teste/respostas.json` deste modelo, com o `respondido_em` do dia. Depois, `novo_universo.mjs --aplicar`.
