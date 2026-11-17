# Entrevista curta do teste: personal trainer

A entrevista que gera o `teste/respostas.json` deste modelo, pergunta a pergunta, como a skill faz com a pessoa. Serve de exemplo da entrevista curta e de prova: juntando os trechos de `respostas.json` abaixo, na ordem (objetos se juntam campo a campo, listas se emendam), sai o mesmo `respostas.json` do teste (só o `respondido_em` muda com o dia), e o `--aplicar` dá o mesmo universo.

Começo do arquivo, antes da primeira pergunta:

```json
{ "modelo": "traco-fino", "versao_modelo": "1.0", "respondido_em": "2026-11-16" }
```

Aviso dado: "São 12 perguntas, uma por vez, e em qualquer uma dá para dizer 'decide por mim'."

## 1. Nome do universo

- **Perguntado:** "Que nome a gente dá pra esse universo?" Sugestões: "Fôlego Novo", "Desisti Três Vezes", "Treino Possível".
- **Resposta:** "Fôlego Novo" (a recomendada).

```json
{ "universo": { "nome": "Fôlego Novo", "pasta": "folego-novo" } }
```

## 2. Assunto, público e a virada (`assunto-e-virada`)

- **Perguntado:** "Sobre o que são os vídeos, e quem assiste? E o que a narradora fazia antes e o que mudou? Como a gente chama o antes e o agora nos selos?" Opções: "Virada sugerida com ANTES e AGORA (Recomendado)", "Virada sugerida com rótulos próprios", "Eu descrevo".
- **Resposta:** voltar a treinar depois dos 30, para quem começa e para; a virada sugerida, com rótulos próprios curtos (SEM PLANO e COM PLANO).

```json
{ "universo": {
  "assunto": "voltar a se exercitar depois dos 30, contado por uma personal trainer que já desistiu três vezes antes de virar profissional, com uma dica de treino possível em cada vídeo",
  "publico": "adultos de 28 a 45 anos que começam a treinar e param em poucas semanas" },
  "antes_e_agora": {
    "virada": "antes ela treinava sozinha, sem plano, e largava tudo em duas semanas; agora treina com plano curto, anota o que fez e ensina isso aos alunos",
    "rotulo_antes": "SEM PLANO",
    "rotulo_agora": "COM PLANO" } }
```

## 3. Tom

- **Perguntado:** "Qual o tom da série?" Opções: "Leve e acolhedor (Recomendado)", "Irônico e rápido", "Didático e calmo", "Outro".
- **Resposta:** "Outro": sincero e leve.

```json
{ "universo": { "tom": "sincero e leve, ri das desculpas sem humilhar ninguém" } }
```

## 4. Marca

- **Perguntado:** "Os vídeos são de uma marca?" Mostrado o still `simbolos-marca`.
- **Resposta:** "Com a minha marca": Estúdio Movimento, cor `#D9622B`, a letra inicial como símbolo (a recomendada, sem logo simples), palavra TREINO.

```json
{ "marca": { "nome": "Estúdio Movimento", "cor": "#D9622B", "simbolo": "letra", "palavra_fecho": "TREINO" } }
```

## 5. A narradora

- **Perguntado:** "Quem conta as histórias? Nome, idade e quem ela é numa frase." Sugestões: a personal que já desistiu, a aluna que voltou.
- **Resposta:** a personal, Rita, 36 anos.

```json
{ "personagens": [ { "id": "rita", "nome": "Rita", "papel": "protagonista", "idade": 36, "corpo": "adulto",
  "quem_e": "personal trainer que já desistiu de treinar três vezes e hoje conta o antes e o agora para os alunos" } ] }
```

## 6. Aparência (agora e antes)

- **Perguntado:** "Como ela é agora? E o que muda no antes?" Mostrada a folha `opcoes-aparencia`.
- **Resposta:** pele `p5`, rabo de cavalo escuro, regata laranja da marca, calça petróleo, tênis branco; no antes, cabelo solto comprido, moletom cinza de manga longa e calça jeans.

```json
{ "personagens": [ { "aparencia": {
    "pele": "p5", "cabelo": "rabo", "corCabelo": "#2A1E18", "cilios": true,
    "camisa": "fechada", "topo": "#D9622B", "manga": "sem",
    "tipoBaixo": "calca", "baixo": "#2F4A55", "tenis": "#F4F4F4", "sola": "#BFC6CC" },
  "aparencia_antes": { "cabelo": "comprido", "topo": "#9AA0A6", "manga": "longa", "baixo": "#4A6A8A" } } ] }
```

## 7. Elenco de apoio com criança (`apoio-e-crianca`)

- **Perguntado:** "Quem mais aparece? Tem uma criança na história?" Opções: "Um adulto e uma criança (Recomendado)", "Só a narradora", "Eu descrevo o elenco".
- **Resposta:** a recomendada: o aluno Marcos e a filha da Rita, Lia, descritos e convertidos para os códigos da folha.

```json
{ "personagens": [
  { "id": "marcos", "nome": "Marcos", "papel": "apoio", "idade": 52, "corpo": "adulto",
    "quem_e": "aluno que chega toda semana com uma desculpa nova e sempre volta",
    "aparencia": { "pele": "p7", "cabelo": "careca", "corCabelo": "#8C8C8C", "barba": true, "oculos": true,
      "camisa": "fechada", "topo": "#5C7682", "manga": "curta", "tipoBaixo": "bermuda", "baixo": "#3E4248", "tenis": "#E3D7C3",
      "barriga": 0.5, "ombros": 8, "altura": 1.03 } },
  { "id": "lia", "nome": "Lia", "papel": "apoio", "idade": 7, "corpo": "crianca",
    "quem_e": "filha da Rita, imita os alongamentos da mãe no meio da sala",
    "aparencia": { "pele": "p5", "cabelo": "marias", "corCabelo": "#2A1E18", "laco": "#D9622B",
      "topo": "#E7B75F", "tipoBaixo": "saia", "baixo": "#5C7682", "tenis": "#FBF8F2", "faixaTenis": "#D9622B", "altura": 0.62 } } ] }
```

## 8. Cenários e nome do lugar

- **Perguntado:** "Onde as histórias acontecem? E o nome da escola e da placa?" Mostrado o still `cenarios`.
- **Resposta:** a sala e o quarto do apartamento, a porta da Escola Girassol e a sala de espera do estúdio com a placa "Recepção"; sem escritório.

```json
{ "cenarios": { "apartamento": ["sala", "quarto"], "escritorio": false, "escola": { "nome": "Escola Girassol" }, "sala_espera": { "placa": "Recepção" } } }
```

## 9. Cores

- **Perguntado:** "Que cores a série usa?"
- **Resposta:** "Paleta do modelo como está" (a marca já aparece no celular e no fecho).

```json
{ "cores": { "origem": "modelo", "paleta": null } }
```

## 10. Voz (só da narradora)

- **Perguntado:** "Como fica a voz da Rita? Só ela fala neste modelo." Os 3 caminhos, com a voz pronta primeiro.
- **Resposta:** voz pronta (a recomendada); a voz exata se escolhe na Parte B.

```json
{ "voz": { "caminho": "pronta" }, "personagens": [ { "voz": { "caminho": "pronta", "voice_id": null } } ] }
```

## 11. O que nunca pode acontecer

- **Perguntado:** "O que nunca pode aparecer ou ser dito nesses vídeos?"
- **Resposta:** a lista recomendada, adaptada ao assunto.

```json
{ "nunca": ["prometer resultado de emagrecimento em prazo", "mostrar exercício perigoso como se fosse fácil", "rir do corpo de alguém"] }
```

## 12. Fecho

- **Perguntado:** "Como termina cada vídeo? A chamada, a palavra do 'Comenta' e o aviso de personagem fictícia." Sugestões: "Quer voltar a treinar sem desistir?", "Qual foi a sua última desculpa?".
- **Resposta:** a primeira, palavra TREINO, aviso ligado.

```json
{ "fecho": { "chamada": "Quer voltar a treinar sem desistir?", "palavra": "TREINO", "aviso_ficticio": true } }
```

**Nas perguntas 6 e 10**, o trecho de `personagens` completa a narradora (o primeiro da lista), e não cria personagem novo; na 7, os personagens são acrescentados depois dela.
