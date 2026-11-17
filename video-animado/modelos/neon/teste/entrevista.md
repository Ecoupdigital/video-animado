# Entrevista curta do teste: liquidação de uma loja de roupa

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta de um kit avulso sem personagem e com duas receitas, e de prova: juntando os trechos de `respostas.json` abaixo, na ordem (objetos se juntam campo a campo; listas, item a item), sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo. A loja, a marca e a oferta são inventadas.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "neon", "versao_modelo": "1.0", "respondido_em": "2026-11-17" }
```

Aviso dado: "São 9 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'. Aqui não tem personagem: o letreiro neon e as peças da oferta conduzem o vídeo."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra essa série de ofertas?" Sugestões: "Arara Liquida", "Fim de Estação", "Queima da Vila".
- **Resposta:** "Arara Liquida" (a recomendada).

```json
{ "universo": { "nome": "Arara Liquida", "pasta": "arara-liquida" } }
```

## 2. Assunto e público

- **Perguntado:** "O que a série anuncia, e quem assiste?" Opções: "Liquidação da loja, uma peça por vídeo (Recomendado)", "Lançamento de coleção", "Eu descrevo".
- **Resposta:** a recomendada, para quem compra no bairro.

```json
{ "universo": {
  "assunto": "liquidação de fim de estação de uma loja de roupa de bairro: a peça da vez, o preço que cai e o prazo curto, um vídeo por oferta",
  "publico": "quem compra roupa no bairro e segue a loja para pegar a liquidação, de 18 a 45 anos" } }
```

## 3. Tom

- **Perguntado:** "Qual o tom?" Opções: "Animado e direto, de quem avisa da oferta sem empurrar (Recomendado)", "Calmo e elegante", "Bem-humorado", "Outro".
- **Resposta:** a recomendada, como vendedora amiga.

```json
{ "universo": { "tom": "animado e direto, de vendedora amiga que avisa da oferta sem empurrar" } }
```

## 4. Marca

- **Perguntado:** "A série é de uma marca? Nome e cor." Aviso: "a marca aparece no card final; a cor pode ir para o letreiro, o preço e o botão."
- **Resposta:** a loja da pessoa, com o verde dela.

```json
{ "marca": { "nome": "Varal da Vila", "cor": "#16A34A" } }
```

## 5, 6 e 7. Puladas

Sem personagem: o letreiro e as peças conduzem. Nada gravado.

## 8. Oferta (`oferta`)

- **Mostrado:** o still `pecas`.
- **Perguntado:** "Que tipo de vídeo vai ser o mais comum?" Opções: "Oferta do dia, com o preço caindo (Recomendado)", "Lançamento", "Evento", "Contagem".
- **Resposta:** a recomendada (é liquidação).
- **Perguntado:** "Me diz a oferta de referência: o que é, o preço, o preço de antes, até quando, o selo e o que o botão chama." Aviso: "o preço de antes só se ele existiu de verdade."
- **Resposta:** a jaqueta jeans da semana. Para os stills, o letreiro da campanha.

```json
{ "oferta": { "tipo": "oferta", "o_que": "Jaqueta jeans", "preco": "R$ 89,90", "preco_antigo": "R$ 179,90", "prazo": "só até domingo", "selo": "só hoje", "botao": "chama no direct" },
  "amostra": { "letreiro": ["QUEIMA DE", "ESTOQUE"] } }
```

## 9. Cores do neon (`cores-do-neon`)

- **Mostrado:** o still `paletas`.
- **Dito antes:** "o neon troca todas as cores: céu, sol, grade e letreiro; a cor da marca, se você quiser, vai para o letreiro cheio, o preço e o botão."
- **Perguntado:** "De onde vêm as cores?" Opções: "Verde da marca no letreiro, no preço e no botão (Recomendado)", "Cores do modelo como estão", "Uma das paletas prontas".
- **Resposta:** a recomendada.

```json
{ "cores": { "origem": "marca", "pronta": null, "paleta": null } }
```

## 10. Voz ou só música (`voz-ou-musica`)

- **Perguntado:** "Os vídeos vão ter narração ou só letreiros na batida da música?" Aviso: "narração custa crédito de voz; só letreiros não custa nada." Opções: "Narração inteira, voz pronta (Recomendado)", "Só letreiros na batida".
- **Resposta:** narração (a loja quer explicar cada peça), com voz pronta a escolher na hora de gerar.

```json
{ "receita": "narracao-inteira", "voz": { "caminho": "pronta", "voice_id": null } }
```

## 11. O que nunca pode acontecer

- **Dito antes:** as regras fixas do modelo (preço e prazo ditos iguais aos da tela; nunca marca, logo ou produto real de terceiros; a piscada dentro da regra; nada de pressão falsa).
- **Perguntado:** "E da sua parte, o que nunca pode acontecer?"
- **Resposta:**

```json
{ "nunca": ["prometer estoque que a loja não tem", "inventar desconto em cima de preço que nunca existiu", "falar mal do corpo de alguém"] }
```

## 12. Card final (`card-final`)

- **Perguntado:** "Como fecha o vídeo? A chamada, a assinatura e a frase embaixo." Opções: "@ da loja com a frase recomendada (Recomendado)", "Eu escrevo".
- **Resposta:** a recomendada, com a chamada dela. Aviso de narração por IA ligado (voz pronta).

```json
{ "fecho": { "chamada": "Corre que a arara está *acabando*", "assinatura": "@varaldavila", "frase_assinatura": "me segue pra não perder a próxima", "aviso_ia": true } }
```

Depois: `novo_universo.mjs --aplicar`, as 3 marcas `ESCREVER` do brandbook redigidas, `--conferir`, e os stills `capa`, `pecas` e `paletas` mostrados para aprovação.
