# Modelo local: salvar um estilo para usar de novo

Um estilo criado do zero (Parte A, "Criar um estilo novo") ou um universo ajustado a partir de um modelo pode virar **modelo local** da pessoa. Ele fica em `<estúdio>/modelos/<id>/`, no mesmo formato dos kits da skill (`references/formato-kit.md`), aparece no catálogo com o selo "seu modelo" e tem preferência na pergunta única. Ele não vai para o catálogo público da skill: isso só com aprovação do dono da skill.

## Quando oferecer

No fim da Parte A, depois da aprovação de olho das expressões e da imagem de teste, uma pergunta só:

- "Salvar este estilo como modelo seu, para começar o próximo universo por ele? (Recomendado)"
- "Agora não"

Ofereça também quando a pessoa disser que quer outro universo "igual a este" ou "no mesmo estilo". Sugira um id curto em minúsculas com hífen (ex.: `consultorio-sorriso`) e deixe trocar.

## Salvar

```bash
node scripts/salvar_modelo.mjs <universo> <estúdio> <id>
```

Antes, deixe as imagens do universo prontas (`node _preview/gerar-html.mjs --stills` na raiz do universo, nos universos que têm `_preview`): a vitrine do modelo sai de `imagens/` e de `videos/`. O script sai com código 1 se o id já existir no estúdio ou nos modelos da skill; escolha outro.

## O que o modelo leva

- **`base/`:** o universo inteiro (personagens, cenários, componentes, ferramentas, preview, brandbook), sem `videos/`, `imagens/`, `node_modules` nem áudio. Os efeitos sonoros se refazem sozinhos pelo `_ferramentas/gerar_sfx.py` quando faltam.
- **Brandbook:** quando o universo veio de um modelo do catálogo, o brandbook do modelo local volta a ter as lacunas (`{{chave}}` e `ESCREVER`), e o texto escrito nelas vai para `base/lacunas-de-origem.md`, para aproveitar no universo seguinte. Universo da entrevista completa leva o brandbook como está.
- **`modelo.json`:** `origem: "local"`, tipo e receita do modelo de origem, `perguntas` e `stills_prova` dele, `termos_proibidos` vazio (permitido em modelo local) e `baseado_em` com o universo e o modelo de origem. Universo sem `.modelo.json` (Parte A) ganha tipo pelo que tem em `personagens/` e a receita `vozes-por-fala`, com aviso.
- **`RECEITA.md`:** a do universo; sem ela, uma receita curta que manda seguir a Parte B de sempre da SKILL.md.
- **`FICHA-DO-MODELO.md` e `PERGUNTAS.md`:** montados do universo e do modelo de origem.
- **`teste/respostas.json`:** as respostas do universo, com o id novo. Ao criar um universo a partir do modelo local, o `novo_universo.mjs` copia esse arquivo como `respostas.json`: a entrevista curta pergunta o que muda e mantém o resto.
- **`teste/roteiro-falas.json`:** o do último vídeo do universo, quando houver.
- **`vitrine/`:** `vitrine.json`; `elenco.jpg` das expressões da protagonista; `folha.jpg` da folha de frames do último vídeo ou, sem vídeo, dos stills de teste lado a lado; `trecho.mp4` com 5 s do último vídeo ou prévia, sem áudio. O que faltar vira aviso com o comando que gera (`npx remotion still ...` ou `gerar_vitrine.mjs <id> --estudio <estúdio>`, que precisa do roteiro).

## Usar o modelo local

Igual a um modelo da skill: `catalogo.mjs`, escolha, `novo_universo.mjs <id> <estúdio> <pasta>`, entrevista curta, `--aplicar`, lacunas, folhas, aprovação de olho.

**Trocar personagem.** Num modelo que veio de um kit com personagens configuráveis (tem `componentes/opcoes.json`), a aparência de cada personagem vai no `respostas.json` e o `--aplicar` refaz os personagens, como no modelo de origem. Num modelo que nasceu da Parte A, os personagens foram desenhados à mão: a entrevista curta troca só a configuração (nome, assunto, marca, cores, voz, proibições, fecho), aplicada pelo Claude no brandbook (as duas versões) e nas fichas, e trocar um personagem é o Claude editando o `Personagem.tsx` pela `FICHA.md`, no mesmo traço, com a folha de expressões nova para aprovação de olho. O `--aplicar` recusa esse universo e diz isso.
