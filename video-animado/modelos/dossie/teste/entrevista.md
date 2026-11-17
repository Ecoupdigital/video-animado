# Entrevista curta do teste: caso do condomínio

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta e de prova: juntando os trechos de `respostas.json` abaixo, na ordem (objetos se juntam campo a campo, listas se emendam), sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo. O caso é inventado: síndico, administradora, construtora e assembleia fictícios.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "dossie", "versao_modelo": "1.0", "respondido_em": "2026-11-16" }
```

Aviso dado: "São 9 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'. Este modelo não tem personagem, então não pergunto aparência nem elenco."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra essa série de casos?" Sugestões: "Caso do Condomínio", "Dossiê do Prédio", "A Taxa Explicada".
- **Resposta:** "Caso do Condomínio" (a recomendada).

```json
{ "universo": { "nome": "Caso do Condomínio", "pasta": "caso-do-condominio" } }
```

## 2. Assunto e público

- **Perguntado:** "Que tipo de caso a série conta, e quem assiste? Se já tiver o primeiro caso, me diz o título e quem é citado." Opções: "Casos de condomínio com documento na tela (Recomendado)", "Notícias do bairro", "Eu descrevo".
- **Resposta:** a recomendada, e o primeiro caso: a reforma do salão que custou o triplo, com a construtora da obra citada.

```json
{ "universo": {
  "assunto": "casos de condomínio contados como investigação: obras que estouram o orçamento, contratos sem concorrência e assembleias que ninguém viu, sempre com o documento na tela",
  "publico": "moradores e síndicos de condomínio de 30 a 60 anos que querem entender para onde vai a taxa" },
  "caso": { "titulo": "A reforma que custou o triplo", "nome": "Construtora Alfa", "papel": "empresa da obra" } }
```

## 3. Tom

- **Perguntado:** "Qual o tom da série?" Opções: "Sério e direto, com suspense, sem acusar ninguém (Recomendado)", "Irônico e rápido", "Didático e calmo", "Outro".
- **Resposta:** a recomendada, com o detalhe de mostrar o documento e deixar a pergunta.

```json
{ "universo": { "tom": "sério e direto, com suspense, sem acusar ninguém: mostra o documento e deixa a pergunta" } }
```

## 4. Marca

- **Perguntado:** "Os vídeos são de uma marca? Se sim: nome e cor." Opções: "Com a minha marca (Recomendado)", "Sem marca (o card final mostra só a assinatura)".
- **Resposta:** com a marca Síndico em Pauta, verde `#2E7D6B`.

```json
{ "marca": { "nome": "Síndico em Pauta", "cor": "#2E7D6B" } }
```

## 5, 6 e 7

Puladas (o modelo não tem personagem).

## 8. Rótulo e manchetes (`rotulo-e-manchetes`)

- **Perguntado:** "Que rótulo vai no topo de todo vídeo, que selo pisca no canto e quais manchetes rolam no rodapé?" Opções: "Rótulo e manchetes sugeridos (Recomendado)", "Só o rótulo, manchetes em cada vídeo", "Eu escrevo".
- **Resposta:** a recomendada, com o selo EM APURAÇÃO no lugar de CASO ABERTO.

```json
{ "dossie": {
  "rotulo": "// DOSSIÊ · CONDOMÍNIO",
  "selo": "EM APURAÇÃO",
  "manchetes": ["REFORMA DO SALÃO CUSTOU O TRIPLO", "ADMINISTRADORA NEGA IRREGULARIDADE", "ASSEMBLEIA EXTRA MARCADA PARA DIA 28", "MORADORES PEDEM AS NOTAS DA OBRA"] } }
```

## 9. Tema visual (`tema-visual`)

- **Perguntado:** mostrado o still `temas`. "Qual dos 3 temas?" Opções: "Neutro de marca, no verde da marca (Recomendado)", "Jornal claro", "Investigativo escuro", "Tema com cores ou fontes trocadas".
- **Resposta:** "Jornal claro, com o destaque num vermelho-tijolo, que lembra carimbo de cartório" (troca de um papel).

```json
{ "cores": { "origem": "modelo", "tema": "jornal", "paleta": { "destaque": "#7A2E1F" }, "fontes": null } }
```

## 10. Voz

- **Perguntado:** "Como fica a voz da narração (uma voz só, o texto inteiro)?" Opções: "Voz pronta do ElevenLabs, firme e calma (Recomendado)", "Voz clonada", "Áudio que eu gravo".
- **Resposta:** a recomendada (a voz exata é escolhida na Parte B, com o custo avisado antes).

```json
{ "voz": { "caminho": "pronta", "voice_id": null } }
```

## 11. O que nunca pode acontecer

- **Perguntado:** "Além das regras fixas do modelo (linguagem de suspeita, foto só a que você fornece, carimbo nunca sobre o rosto, fonte na tela), o que nunca pode aparecer nesses vídeos?" Opções: "A lista recomendada para condomínio (Recomendado)", "Eu escrevo a lista".
- **Resposta:** a recomendada.

```json
{ "nunca": ["afirmar que alguém roubou ou desviou dinheiro", "mostrar nome, rosto ou apartamento de morador", "usar documento que não pode ser mostrado"] }
```

## 12. Card final (`card-final`)

- **Perguntado:** "Como fecha cada vídeo: a pergunta de referência, a assinatura e a frase embaixo dela? O aviso de narração por IA fica ligado." Opções: "Assinatura com o @ e a frase recomendada (Recomendado)", "Eu escrevo a assinatura e a frase".
- **Resposta:** a recomendada, com o @ da marca.

```json
{ "fecho": { "chamada": "E aí, você aprovaria essa obra?", "assinatura": "@sindicoempauta", "frase_assinatura": "me segue pra ver o próximo caso", "aviso_ia": true } }
```

Depois: `novo_universo.mjs --aplicar`, as 3 marcas `ESCREVER` do brandbook redigidas, `--conferir`, e os stills `temas`, `folha-jornal` e `elenco` mostrados para aprovação.
