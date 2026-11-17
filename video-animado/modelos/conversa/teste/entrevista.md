# Entrevista curta do teste: loja de bolos atendendo uma encomenda

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta de um kit avulso com duas receitas e de prova: juntando os trechos de `respostas.json` abaixo, na ordem (objetos se juntam campo a campo; listas, item a item), sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo. A loja, a marca e as pessoas são inventadas.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "conversa", "versao_modelo": "1.0", "respondido_em": "2026-11-17" }
```

Aviso dado: "São 10 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'. Aqui não tem personagem desenhado: a conversa acontece num celular, e eu pergunto quem está de cada lado."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra essa série?" Sugestões: "Encomenda Doce", "Bolo na Véspera", "Pedido da Vila".
- **Resposta:** "Encomenda Doce" (a recomendada).

```json
{ "universo": { "nome": "Encomenda Doce", "pasta": "loja-bolos" } }
```

## 2. Assunto e público

- **Perguntado:** "Sobre o que são as conversas, e quem assiste?" Opções: "Pedidos de última hora, com uma dica de encomenda (Recomendado)", "Bastidor da cozinha", "Eu descrevo".
- **Resposta:** a recomendada, para quem encomenda bolo para festa em casa. Sem amostra própria para os stills (fica a do kit).

```json
{ "universo": {
  "assunto": "conversas de uma loja de bolos de bairro com quem encomenda pelo celular: o bolo de última hora, a dúvida do sabor, o endereço trocado, com uma dica de encomenda em cada vídeo",
  "publico": "quem encomenda bolo e doce para festa em casa, de 25 a 55 anos" } }
```

## 3. Tom

- **Perguntado:** "Qual o tom?" Opções: "Leve e acolhedor, resolve rindo junto (Recomendado)", "Humor rápido", "Didático e calmo", "Outro".
- **Resposta:** a recomendada, nunca fazendo o cliente se sentir bobo.

```json
{ "universo": { "tom": "leve e acolhedor, de atendente que resolve rindo junto, nunca de quem faz o cliente se sentir bobo" } }
```

## 4. Marca

- **Perguntado:** "As conversas são de uma marca? Nome, cor, símbolo e a palavra do 'Comenta'." Símbolos mostrados: estrela, círculo, coração, folha, balão, letra.
- **Resposta:** a loja, com o terracota dela e o coração.

```json
{ "marca": { "nome": "Forno da Vila", "cor": "#B4532A", "simbolo": "coracao", "palavra_fecho": "BOLO" } }
```

## 5. Quem conversa (`quem-conversa`)

- **Mostrado:** os stills `elenco` e `avatares`.
- **Perguntado:** "Quem é o dono do celular, à direita, e quem é o contato que aparece no alto, à esquerda? Do contato: nome, quem é, o status embaixo do nome e o avatar (a inicial numa cor ou um desenho)." Opções: "A loja atende uma cliente (Recomendado)", "Duas pessoas conversando", "Eu descrevo".
- **Resposta:** a loja à direita, com o desenho do bolo guardado como avatar; a Rita à esquerda, cliente que deixa tudo para a véspera, "online", com a inicial num rosa claro.

```json
{ "personagens": [
  { "id": "forno", "nome": "Forno da Vila", "papel": "protagonista", "lado": "direita",
    "quem_e": "a loja de bolos, que atende pelo celular com paciência e bom humor",
    "avatar": { "tipo": "desenho", "desenho": "bolo", "cor": "#FFD08A" } },
  { "id": "rita", "nome": "Rita", "papel": "apoio", "lado": "esquerda", "idade": 38,
    "quem_e": "cliente que deixa tudo para a última hora e encomenda o bolo do aniversário da mãe na véspera",
    "status": "online",
    "avatar": { "tipo": "inicial", "cor": "#F4A6C0" } }
] }
```

## 8. Tela do chat (`tela-do-chat`)

- **Mostrado:** o still `recursos`.
- **Perguntado:** "Qual o fundo da conversa (pontos, liso, grade ou diagonal)? Mostro o horário nas bolhas e o sinal de lido? A que horas começa a conversa?" Opções: "Pontos, horário e lido ligados (Recomendado)", "Liso, sem horário", "Eu escolho".
- **Resposta:** a recomendada, começando às 20:14 (sexta à noite, véspera da festa).

```json
{ "tela": { "fundo": "pontos", "horario": true, "lido": true, "hora": "20:14" } }
```

## 9. Cores (`cores-da-conversa`)

- **Mostrado:** o still `paletas` (claro, escuro e vivo).
- **Perguntado:** "A paleta é do kit, sem a cor de nenhum app. Fica com as cores do modelo, pinta as bolhas da loja na cor da marca, ou uma das 3 prontas?" Opções: "Bolhas da loja na cor da marca (Recomendado)", "Cores do modelo (claro)", "Escuro", "Vivo".
- **Resposta:** a cor da marca.

```json
{ "cores": { "origem": "marca", "pronta": null, "paleta": null } }
```

## 10. Receita e vozes (`receita-e-vozes`)

- **Perguntado:** "Duas vozes, uma da loja e uma da cliente, com cada bolha entrando na fala dela, ou só texto e música, sem voz? Dá para usar a outra num vídeo específico." Opções: "Duas vozes, voz pronta (Recomendado para esta série, que vai ter áudio de cliente)", "Só texto e música", "Eu explico".
- **Resposta:** duas vozes, voz pronta para os dois lados (os vídeos de pedido rápido vão usar só texto no roteiro).

```json
{ "receita": "vozes-por-fala",
  "personagens": [
    { "voz": { "caminho": "pronta", "voice_id": null } },
    { "voz": { "caminho": "pronta", "voice_id": null } }
  ],
  "voz": { "caminho": "pronta" } }
```

## 11. O que nunca pode acontecer

- **Dito antes:** "O kit já proíbe imitar app de mensagem real e usar conversa ou nome de cliente real sem autorização, e deixa o aviso de conversa encenada ligado."
- **Perguntado:** "E nesta série, o que nunca pode aparecer?"
- **Resposta:**

```json
{ "nunca": ["prometer entrega que a loja não consegue cumprir", "rir de quem encomenda em cima da hora", "mostrar conversa real de cliente"] }
```

## 12. Card final (`card-final`)

- **Mostrado:** o still `vista-fecho`.
- **Perguntado:** "Como termina cada vídeo? A chamada, a palavra do 'Comenta' e o aviso de conversa encenada (recomendo ligado)."
- **Resposta:**

```json
{ "fecho": { "chamada": "Já encomendou bolo na véspera?", "palavra": "BOLO", "aviso_ficticio": true } }
```
