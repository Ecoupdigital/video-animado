# Entrevista curta do teste: escola de idiomas com professora, aluno e narrador

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta de uma família com personagem e de prova: juntando os trechos de `respostas.json` abaixo, na ordem (objetos se juntam campo a campo; listas, item a item), sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo. A escola, a marca, o lugar e as pessoas são inventados.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "conto", "versao_modelo": "1.0", "respondido_em": "2026-11-17" }
```

Aviso dado: "São 12 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'. Logo depois da marca eu pergunto o tema, porque o jeito dos personagens depende dele."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra essa série?" Sugestões: "Aula de Quinta", "Inglês sem Vergonha", "Turma da Noite".
- **Resposta:** "Aula de Quinta" (a recomendada).

```json
{ "universo": { "nome": "Aula de Quinta", "pasta": "escola-idiomas" } }
```

## 2. Assunto e público

- **Perguntado:** "Sobre o que são as histórias, e quem assiste?" Opções: "Situações de quem volta a estudar inglês, com uma dica (Recomendado)", "Bastidor da escola", "Eu descrevo".
- **Resposta:** a recomendada, para adultos com vergonha de errar.

```json
{ "universo": {
  "assunto": "situações engraçadas de quem volta a estudar inglês depois dos 30: o falso cognato, a vergonha de falar em voz alta, a lição de casa esquecida, com uma dica de idioma em cada vídeo",
  "publico": "adultos de 25 a 50 anos que querem destravar o inglês e têm vergonha de errar" } }
```

## 3. Tom

- **Perguntado:** "Qual o tom?" Opções: "Leve e acolhedor, ri do erro junto (Recomendado)", "Humor rápido, de esquete", "Calmo, de história contada", "Outro".
- **Resposta:** a recomendada, nunca rindo do aluno.

```json
{ "universo": { "tom": "leve e acolhedor, ri do erro junto com o aluno, nunca do aluno" } }
```

## 4. Marca

- **Perguntado:** "As histórias são de uma marca? Nome, cor, símbolo e a palavra do 'Comenta'." Símbolos mostrados: estrela, círculo, coração, folha, balão, letra.
- **Resposta:** a escola, com o verde-petróleo dela e o balão de fala.

```json
{ "marca": { "nome": "Ponte Idiomas", "cor": "#0E7C86", "simbolo": "balao", "palavra_fecho": "PONTE" } }
```

## 8. Tema e cenário (`tema`), feita logo depois da 4

- **Mostrado:** os 4 stills `tema-formas`, `tema-papel`, `tema-silhuetas` e `tema-giz-de-cera` lado a lado; depois, `cenarios-formas`.
- **Perguntado:** "Qual destes jeitos combina? Bonecos de formas pede humor de situação; papel recortado pede história com começo, meio e fim; silhuetas pedem história emocional, homenagem ou depoimento; giz de cera pede família, infância ou saúde explicada para criança. O tema muda só o visual: dá para trocar depois sem refazer nada. E onde as histórias acontecem: na sala de aula, na rua, ou nos dois? Qual nome vai na placa?" Opções: "Bonecos de formas (Recomendado: situação do dia a dia)", "Papel recortado (história contada)", "Silhuetas (história emocional)", "Giz de cera (família e infância)".
- **Resposta:** as formas, porque a série é de situação; a sala primeiro e a rua, com a placa "Escola Ponte".

```json
{ "tema": "formas", "cenarios": { "lista": ["sala", "rua"], "lugar": "Escola Ponte" } }
```

## 5. Personagem principal

- **Perguntado:** "Quem é a protagonista? Nome, idade e quem ela é."
- **Resposta:** a professora.

```json
{ "personagens": [ { "id": "teca", "nome": "Teca", "papel": "protagonista", "idade": 41, "quem_e": "professora de inglês paciente e brincalhona, que corrige rindo junto" } ] }
```

## 6. Aparência da protagonista

- **Mostrado:** o still `opcoes-aparencia-formas` (o tema escolhido), e o `opcoes-aparencia-papel` para guardar o traço do papel recortado, que o giz de cera também usa (as silhuetas usam o cabelo dele e, no formato e na altura, o que vem do preset).
- **Perguntado:** "Como a Teca é? Um preset, ou a forma, a cor e o acessório." Opções: "Pílula azul de óculos (Recomendado)", "Outro preset", "Eu descrevo".
- **Resposta:** a recomendada; no papel recortado, coque castanho, camisa e saia.

```json
{ "personagens": [ { "aparencia": {
  "preset": "coque-oculos", "cor": "#3A86FF", "acessorio": "oculos", "corDetalhe": "#1D1D1F",
  "pele": "p3", "cabelo": "coque", "corCabelo": "#4A2C17", "roupa": "camisa-saia", "corBaixo": "#2B3A55", "sapato": "#2B2B2B",
  "corpo": "pilula", "olhos": "redondos", "sobrancelha": "fina" } } ] }
```

## 7. Elenco de apoio

- **Perguntado:** "Quem conversa com a Teca? Nome, idade, quem é e o jeito, com cor e acessório diferentes dos dela." Opções: "Um aluno de boné rosa (Recomendado)", "Só a protagonista", "Eu descrevo".
- **Resposta:** o aluno do falso cognato.

```json
{ "personagens": [ {}, { "id": "otavio", "nome": "Otávio", "papel": "apoio", "idade": 34,
  "quem_e": "aluno esforçado e distraído, confia demais no falso cognato",
  "aparencia": {
    "preset": "bone-camiseta", "cor": "#EF476F", "acessorio": "bone", "corDetalhe": "#FFD23F",
    "pele": "p7", "cabelo": "curto", "corCabelo": "#1E1A17", "roupa": "camisa-calca", "corBaixo": "#3B4A6B", "sapato": "#2B2B2B",
    "corpo": "retangulo", "olhos": "redondos", "sobrancelha": "grossa" } } ] }
```

## 9. Cores

- **Dito antes:** "Nas formas a cor troca tudo: fundo, chão, enfeites, balões e o destaque. As cores da Teca e do Otávio são da aparência deles."
- **Perguntado:** "Que cores?" Opções: "Destaque na cor da Ponte Idiomas (Recomendado)", "Cores do tema como estão", "Uma das paletas prontas (sol, menta, noite)".
- **Resposta:** a recomendada.

```json
{ "cores": { "origem": "marca", "pronta": null, "paleta": null } }
```

## 10. Voz e narrador

- **Perguntado:** "Que voz cada um tem? E a história tem narrador, uma voz sem rosto que conta o que a cena não mostra?" Opções: "Vozes prontas, com narrador (Recomendado aqui: a série abre situando o lugar)", "Vozes prontas, sem narrador", "Vozes clonadas", "Áudio próprio".
- **Resposta:** vozes prontas, com narrador.

```json
{ "personagens": [ { "voz": { "caminho": "pronta", "voice_id": null } }, { "voz": { "caminho": "pronta", "voice_id": null } } ],
  "narrador": { "ligado": true, "voz": { "caminho": "pronta", "voice_id": null } }, "voz": { "caminho": "pronta" } }
```

## 11. O que nunca pode acontecer

- **Perguntado:** "O que nunca pode aparecer?"
- **Resposta:**

```json
{ "nunca": ["rir do sotaque de alguém", "ensinar errado só pela piada", "prometer fluência em pouco tempo"] }
```

## 12. Fecho

- **Perguntado:** "Que pergunta fecha o vídeo, e a palavra do 'Comenta'? O aviso de personagem fictícia fica ligado." Opções: "Com a chamada e o aviso (Recomendado)", "Eu escrevo a chamada".
- **Resposta:**

```json
{ "fecho": { "chamada": "Já passou vergonha falando inglês?", "palavra": "PONTE", "aviso_ficticio": true } }
```
