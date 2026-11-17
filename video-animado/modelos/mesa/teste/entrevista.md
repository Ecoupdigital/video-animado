# Entrevista curta do teste: maquiagem para o dia a dia

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta de um kit avulso sem personagem e de prova: juntando os trechos de `respostas.json` abaixo, na ordem (objetos se juntam campo a campo; listas, item a item), sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo. A série, a marca e os produtos são inventados.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "mesa", "versao_modelo": "1.0", "respondido_em": "2026-11-17" }
```

Aviso dado: "São 9 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'. Aqui não tem personagem nem mãos: a mesa é vista de cima, e cada produto cai nela na palavra que a voz fala."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra essa série?" Sugestões: "Make do Dia", "Bancada Rápida", "Rosto em 5".
- **Resposta:** "Make do Dia" (a recomendada).

```json
{ "universo": { "nome": "Make do Dia", "pasta": "make-do-dia" } }
```

## 2. Assunto e público

- **Perguntado:** "Que passo a passo a série ensina, e quem assiste?" Opções: "Maquiagem de todo dia, rápida e sem exagero (Recomendado)", "Cuidado com a pele", "Eu descrevo".
- **Resposta:** a recomendada, para quem se maquia em poucos minutos antes de sair.

```json
{ "universo": {
  "assunto": "maquiagem para o dia a dia, passo a passo e sem exagero: pele leve, olho rápido e boca que dura, sempre com o produto mostrado na mesa antes de usar",
  "publico": "mulheres de 22 a 45 anos que se maquiam em menos de 10 minutos antes de sair de casa e querem aprender sem gastar muito" } }
```

## 3. Tom

- **Perguntado:** "Qual o tom?" Opções: "Prático e animado, de quem mostra na bancada o que usa (Recomendado)", "Calmo e detalhista", "Bem-humorado", "Outro".
- **Resposta:** a recomendada, sem julgar quem não sabe.

```json
{ "universo": { "tom": "prático e animado, de amiga que mostra na bancada o que usa, sem julgar quem não sabe" } }
```

## 4. Marca

- **Perguntado:** "A série é de uma marca? Nome e cor." Aviso: "a marca aparece no card final e na abertura; nenhum item da mesa leva o nome nem o logo dela."
- **Resposta:** a marca inventada da pessoa, com o rosa queimado dela.

```json
{ "marca": { "nome": "Rosto Leve", "cor": "#B83B5E" } }
```

## 5, 6 e 7. Puladas

Sem personagem nem mãos: a voz conduz e os produtos caem na mesa. Nada gravado.

## 8. Superfície e itens (`superficie-e-itens`)

- **Mostrado:** os stills `superficies` e `itens-beleza`.
- **Perguntado:** "Em que mesa a gente filma, e qual o grupo principal? O grupo escolhe a peça do meio; o roteiro de cada vídeo pode usar qualquer item dos 3 grupos." Opções: "Mármore com beleza, a bandeja no meio (Recomendado)", "Madeira com cozinha", "Pano com artesanato", "Eu escolho".
- **Resposta:** a recomendada (maquiagem pede o mármore claro). Para os stills, o título de um passo e a frase de faixa de um vídeo dela.

```json
{ "mesa": { "superficie": "marmore", "grupo": "beleza" },
  "amostra": { "titulo": "Pele leve em 5 minutos", "frase": "Base só no *centro* do rosto" } }
```

## 9. Cores da mesa (`cores-da-mesa`)

- **Mostrado:** o still `paletas`.
- **Dito antes:** "o mármore, a bandeja e os produtos ficam como estão; a cor troca a palavra destacada, a faixa, a etiqueta e o card final."
- **Perguntado:** "De onde vêm as cores?" Opções: "Rosa da marca na palavra, no passo e na assinatura (Recomendado)", "Cores do modelo como estão", "Uma das paletas prontas".
- **Resposta:** a recomendada.

```json
{ "cores": { "origem": "marca", "pronta": null, "paleta": null } }
```

## 10. Voz

- **Perguntado:** "Uma narração inteira, uma voz só. Qual caminho?" Opções: "Voz pronta, calma e próxima (Recomendado)", "Voz clonada", "Áudio próprio".
- **Resposta:** voz pronta, a escolher na hora de gerar.

```json
{ "voz": { "caminho": "pronta", "voice_id": null } }
```

## 11. O que nunca pode acontecer

- **Dito antes:** as regras fixas do modelo (nunca produto, embalagem ou logo de marca real; quantidade e tempo ditos iguais aos da tela; uma palavra destacada por faixa; nada de mãos nem rosto).
- **Perguntado:** "E da sua parte, o que nunca pode acontecer?"
- **Resposta:**

```json
{ "nunca": ["prometer pele perfeita ou resultado de procedimento", "mostrar produto, embalagem ou logo de marca real", "dizer que alguém está feia sem maquiagem"] }
```

## 12. Card final (`card-final`)

- **Perguntado:** "Como fecha o vídeo? A assinatura, a frase embaixo e a pergunta do card." Opções: "@ da marca com a frase recomendada (Recomendado)", "Eu escrevo".
- **Resposta:** a recomendada, com a pergunta dela. Aviso de narração por IA ligado (voz pronta).

```json
{ "fecho": { "chamada": "Qual passo você sempre pula?", "assinatura": "@rostoleve", "frase_assinatura": "me segue pra ver o próximo passo", "aviso_ia": true } }
```

Depois: `novo_universo.mjs --aplicar`, as 3 marcas `ESCREVER` do brandbook redigidas, `--conferir`, e os stills `capa`, `itens-beleza` e `elenco` mostrados para aprovação.
