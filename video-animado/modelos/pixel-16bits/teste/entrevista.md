# Entrevista curta do teste: Plantão Pet

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta e de prova: juntando os trechos de `respostas.json` abaixo, na ordem, sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo. A clínica, a veterinária e o perfil são inventados.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "pixel-16bits", "versao_modelo": "1.0", "respondido_em": "2026-11-16" }
```

Aviso dado: "São 11 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'. Este modelo tem um boneco só, então não pergunto elenco de apoio."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra essa série de notícias?" Sugestões: "Plantão Pet", "Pet em 30 Segundos", "Bicho Bem Informado".
- **Resposta:** "Plantão Pet" (a recomendada).

```json
{ "universo": { "nome": "Plantão Pet", "pasta": "plantao-pet" } }
```

## 2. Assunto e público

- **Perguntado:** "Que notícia a série conta, e quem assiste?" Opções: "Notícias de saúde de cão e gato com o que fazer hoje (Recomendado)", "Curiosidades de bicho", "Eu descrevo".
- **Resposta:** a recomendada, com os exemplos de vacina, alimentação, calor e remédio.

```json
{ "universo": {
  "assunto": "notícias de saúde de cão e gato explicadas em menos de 30 segundos: vacina, alimentação, calor, remédio, com o que o tutor faz hoje",
  "publico": "tutores de cão e gato de 25 a 50 anos que querem cuidar melhor sem cair em boato" } }
```

## 3. Tom

- **Perguntado:** "Qual o tom da série?" Opções: "Claro e animado, sem enrolação (Recomendado)", "Sério e técnico", "Engraçado", "Outro".
- **Resposta:** a recomendada, com o jeito de quem explica no balcão da clínica.

```json
{ "universo": { "tom": "claro e animado, de quem explica no balcão da clínica, sem assustar" } }
```

## 4. Marca

- **Perguntado:** "Os vídeos são de uma marca? Se sim: nome, cor e símbolo." Mostrada a linha "Estampa" da folha de opções (os símbolos em pixel). Opções: "Com a minha marca (Recomendado)", "Sem marca".
- **Resposta:** a clínica, laranja, com a pata.

```json
{ "marca": { "nome": "Clínica Veterinária Bicho Bom", "cor": "#D9731E", "simbolo": "pata" } }
```

## 5. Personagem principal

- **Perguntado:** "Quem apresenta? Nome, idade e quem é numa frase." Opções: "A veterinária de plantão da clínica (Recomendado)", "Um tutor experiente", "Eu descrevo".
- **Resposta:** a recomendada, a Dra. Lu, de 34 anos.

```json
{ "personagens": [ { "id": "dra-lu", "nome": "Dra. Lu", "papel": "protagonista", "idade": 34,
  "quem_e": "veterinária de plantão da clínica, que traduz a notícia em cuidado do dia a dia" } ] }
```

## 6. Aparência pixel (`aparencia-pixel`)

- **Mostrado:** a folha de opções (`python3 gerador/opcoes.py imagens/opcoes-aparencia.png`).
- **Perguntado:** "Como é a Dra. Lu? Tom de pele, cabelo e cor, barba, óculos, roupa e a estampa do peito." Opções: "Boneco montado pela descrição (Recomendado)", "Eu escolho os códigos na folha".
- **Resposta:** pele escura, cabelo cacheado comprido preto, óculos pretos, sem barba, com cílios, roupa verde e a pata da marca no peito em amarelo, para aparecer melhor no verde.

```json
{ "personagens[0].aparencia": { "pele": "p7", "cabelo": "cacheado", "corCabelo": "preto", "barba": "nenhuma", "oculos": "preto",
  "roupa": "verde", "estampa": "simbolo", "corEstampa": "#F2B544", "cilios": true } }
```

## 7. Elenco de apoio

Pulada: o pixel tem um boneco só.

## 8. Topo (`topo-rotulo-assinatura`)

- **Perguntado:** "Que rótulo vai no topo de todo vídeo, e que assinatura do lado direito?" Opções: "Rótulo e assinatura sugeridos (Recomendado)", "Eu escrevo".
- **Resposta:** a recomendada: `// plantão pet` e o @ em caixa alta.

```json
{ "topo": { "rotulo": "// plantão pet", "assinatura": "BICHOBOM.VET" } }
```

## 9. Cores

- **Perguntado:** "As cores do vídeo: as do modelo (claro e violeta), as da marca, ou outras?" Opções: "Destaque na cor da marca (Recomendado)", "As do modelo", "Escolher outras".
- **Resposta:** a recomendada.

```json
{ "cores": { "origem": "marca", "paleta": null } }
```

## 10. Voz

- **Perguntado:** "A voz da Dra. Lu: clonada, pronta ou áudio gravado por você? É uma narração inteira, uma voz só." Opções: "Voz pronta do ElevenLabs, animada e clara (Recomendado)", "Voz clonada", "Eu gravo o áudio".
- **Resposta:** a recomendada; a voz em si se escolhe no primeiro vídeo.

```json
{ "voz": { "caminho": "pronta", "voice_id": null } }
```

## 11. O que nunca pode acontecer

- **Perguntado:** "O que nunca pode aparecer nos vídeos?" Lembrado: logo de empresa de terceiros e notícia sem fonte já são regra do modelo.
- **Resposta:** três regras de clínica.

```json
{ "nunca": ["receitar remédio ou dose pelo vídeo", "dizer que um sintoma não é nada sem consulta", "mostrar animal machucado"] }
```

## 12. Card final (`card-final-perfil`)

- **Perguntado:** "No fim de todo vídeo vem o card do perfil: qual o @ e a frase embaixo?" Opções: "Perfil com a frase recomendada (Recomendado)", "Eu escrevo a frase".
- **Resposta:** o @ da clínica e uma frase dela.

```json
{ "fecho": { "perfil": "@bichobom.vet", "frase": "notícia de pet sem susto, toda semana" } }
```

Depois: `novo_universo.mjs --aplicar` (72 sprites em `public/px/`), as 3 marcas `ESCREVER` do brandbook redigidas, `--conferir` 0, e mostrados os stills `elenco`, `card-lista` e `card-final`.

## Como juntar

Cada trecho entra no `respostas.json` na ordem das perguntas: objetos se juntam campo a campo; `personagens[0].aparencia` vai para a protagonista. Resultado: o `teste/respostas.json` deste modelo, com o `respondido_em` do dia. Depois, `novo_universo.mjs --aplicar`.
