# Entrevista curta do teste: consultório de dentista

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta e de prova: juntando os trechos de `respostas.json` abaixo, na ordem, sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "chapado", "versao_modelo": "1.0", "respondido_em": "2026-11-16" }
```

Aviso dado: "São 12 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra esse universo?" Sugestões: "Sorriso em Dia", "Abre a Boca", "Consultório da Bia".
- **Resposta:** "Sorriso em Dia" (a recomendada).

```json
{ "universo": { "nome": "Sorriso em Dia", "pasta": "sorriso-em-dia" } }
```

## 2. Assunto e público

- **Perguntado:** "Sobre o que são os vídeos, e quem assiste?"
- **Resposta:** rotina de consultório com humor e uma dica por vídeo; adultos que adiam o dentista.

```json
{ "universo": {
  "assunto": "rotina de consultório de dentista com humor: medo da cadeira, escova esquecida, fio dental que ninguém usa, e uma dica de cuidado com os dentes em cada vídeo",
  "publico": "adultos de 25 a 50 anos que adiam a ida ao dentista" } }
```

## 3. Tom

- **Perguntado:** "Qual o tom da série?" Opções: "Leve e acolhedor (Recomendado)", "Irônico e rápido", "Didático e calmo", "Outro".
- **Resposta:** a recomendada, com um detalhe da pessoa.

```json
{ "universo": { "tom": "leve e acolhedor, ri do medo sem humilhar ninguém" } }
```

## 4. Marca

- **Perguntado:** "Os vídeos são de uma marca?" Mostrado o still `simbolos-marca`.
- **Resposta:** "Com a minha marca": Clínica Exemplo, cor `#2F8F9D`, símbolo dente, palavra SORRISO.

```json
{ "marca": { "nome": "Clínica Exemplo", "cor": "#2F8F9D", "simbolo": "dente", "palavra_fecho": "SORRISO" } }
```

## 5. Personagem principal

- **Perguntado:** "Quem é a pessoa principal?" Sugestões: a dentista paciente, a recepcionista ansiosa.
- **Resposta:** a dentista, Bia, 34 anos.

```json
{ "personagens": [ { "id": "bia", "nome": "Bia", "papel": "protagonista", "idade": 34,
  "quem_e": "dentista paciente e bem-humorada, explica tudo com calma" } ] }
```

## 6. Aparência

- **Perguntado:** "Como ela é?" Mostrada a folha `opcoes-aparencia`.
- **Resposta:** "Montar do zero pelos códigos": pele `p3`, cabelo comprido castanho, jaleco sobre blusa da cor da marca, óculos.

```json
{ "personagens[0].aparencia": {
  "pele": "p3", "cabelo": "comprido", "corCabelo": "#5A3A22",
  "topo": "#2F8F9D", "manga": "curta", "tipoBaixo": "calca", "baixo": "#3B4A5A",
  "sapato": "#F2F2F2", "sola": "#BFC6CC", "jaleco": true, "oculos": true, "cilios": true,
  "raioCabeca": 114, "tamanhoOlho": 1.12, "altura": 1 } }
```

## 7. Elenco de apoio e acompanhantes

- **Perguntado:** a pergunta `elenco-e-acompanhantes` do `PERGUNTAS.md`. Opções: "Elenco recomendado com um cachorro (Recomendado)", "Só a protagonista, sem acompanhante", "Eu descrevo o elenco".
- **Resposta:** "Eu descrevo o elenco": um paciente mais velho com medo da cadeira, uma recepcionista jovem e animada, e um cachorro preto chamado Bolota. O Claude converteu para os códigos e mostrou para confirmar.

```json
{ "personagens+": [
  { "id": "seu-ademar", "nome": "Seu Ademar", "papel": "apoio", "idade": 58,
    "quem_e": "paciente com medo da cadeira, conta mil desculpas para não abrir a boca",
    "aparencia": {
      "pele": "p8", "cabelo": "careca", "corCabelo": "#2A2422", "corSobrancelha": "#3A302C",
      "topo": "#E7B75F", "gola": "#CF9E46", "manga": "curta", "tipoBaixo": "calca", "baixo": "#6B5A4A",
      "sapato": "#3A2E26", "sola": "#241C16", "barba": true, "rugas": true,
      "largura": 24, "raioCabeca": 112, "tamanhoOlho": 1.05, "altura": 1.04 } },
  { "id": "tati", "nome": "Tati", "papel": "apoio", "idade": 24,
    "quem_e": "recepcionista animada que agenda tudo e lembra todo mundo da consulta",
    "aparencia": {
      "pele": "p1", "cabelo": "curto-liso", "corCabelo": "#C9792E",
      "topo": "#B9A3D6", "gola": "#9F88C0", "manga": "longa", "tipoBaixo": "saia", "baixo": "#4F7A52",
      "sapato": "#7A3B2E", "sola": "#4E241B", "sardas": true, "cilios": true,
      "largura": 2, "raioCabeca": 108, "tamanhoOlho": 1.18, "altura": 0.96 } } ],
  "acompanhantes": [ { "id": "bolota", "tipo": "cachorro", "nome": "Bolota", "cor": "preto" } ] }
```

## 8. Cenários e nome do lugar

- **Perguntado:** "Onde as histórias acontecem?" Mostrada a folha `cenarios`.
- **Resposta:** a sala de casa, a sala de espera com a placa "Consultório 2" e a rua com a loja fictícia "Ótica Central".

```json
{ "cenarios": { "casa": ["sala"], "sala_espera": { "placa": "Consultório 2" }, "rua": { "loja": "Ótica Central" } } }
```

## 9. Cores

- **Perguntado:** "Que cores a série usa?"
- **Resposta:** "Paleta do modelo como está" (a cor da marca já aparece no celular, no fecho e na roupa da Bia).

```json
{ "cores": { "origem": "modelo", "paleta": null } }
```

## 10. Voz

- **Perguntado:** "Como fica a voz?" Os 3 caminhos: clonada, pronta do ElevenLabs, áudio próprio.
- **Resposta:** "decide por mim": voz pronta, uma por personagem que fala (escolhida na Parte B).

```json
{ "voz": { "caminho": "pronta" },
  "personagens[*].voz": { "caminho": "pronta", "voice_id": null } }
```

## 11. O que nunca pode acontecer

- **Perguntado:** "O que nunca pode aparecer ou ser dito?"
- **Resposta:** a lista recomendada, adaptada ao consultório.

```json
{ "nunca": ["prometer resultado de tratamento", "mostrar sangue ou instrumento afiado em destaque", "rir do paciente com medo"] }
```

## 12. Fecho

- **Perguntado:** "Como termina cada vídeo?"
- **Resposta:** "Quer marcar uma avaliação?", palavra SORRISO, aviso de personagem fictícia ligado.

```json
{ "fecho": { "chamada": "Quer marcar uma avaliação?", "palavra": "SORRISO", "aviso_ficticio": true } }
```

## Como juntar

Cada trecho entra no `respostas.json` na ordem das perguntas: objetos se juntam campo a campo; `personagens[0].aparencia` vai para a protagonista; `personagens+` acrescenta ao fim da lista; `personagens[*].voz` vai para cada personagem que fala. Resultado: o `teste/respostas.json` deste modelo, com o `respondido_em` do dia. Depois, `novo_universo.mjs --aplicar`.
