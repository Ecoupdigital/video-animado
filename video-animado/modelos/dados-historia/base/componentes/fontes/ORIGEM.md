# Origem das fontes

As fontes do modelo Dados e história moram nesta pasta e entram no vídeo pelo bundler do Remotion (`componentes/fontes.ts` importa cada arquivo). Nada é baixado na hora do render: o vídeo sai igual com e sem internet, no Mac e no Linux. As quatro famílias são de código aberto, sob a SIL Open Font License 1.1 (texto completo e os avisos de copyright em `OFL.txt`, nesta pasta). A licença deixa usar, copiar e distribuir junto com o kit, inclusive em vídeo comercial; só não deixa vender a fonte sozinha. A Lora tem nome de fonte reservado ("Lora"): o arquivo vai sem nenhuma mudança, e o kit a chama pelo nome de família `DadSerif` só dentro do vídeo.

Caveat, Inter e JetBrains Mono: só o subconjunto latin (U+0000 a U+00FF, mais aspas curvas e símbolos comuns), que cobre todo o português com acento, e só os pesos que o kit usa. Lora: o arquivo inteiro do peso 700 (latin completo, latin estendido e cirílico, 778 glifos), que também cobre o português, `ª` e `º`.

| Arquivo | Família e peso | Usada em | De onde veio |
|---|---|---|---|
| `caveat-latin-400-700.woff2` | Caveat, variável de 400 a 700 (o kit usa 700) | a palavra escrita à mão dentro do círculo de destaque | copiada do kit da Explicação, no mesmo estúdio (`modelos/explicacao/base/componentes/fontes/`, o mesmo arquivo, sem mudança; a origem dele está no `ORIGEM.md` de lá) |
| `inter-latin-400-normal.woff2` | Inter 400 | texto de apoio, legenda, card final | idem, do kit da Explicação |
| `inter-latin-600-normal.woff2` | Inter 600 | frase do marco, texto dos cartões | idem |
| `inter-latin-800-normal.woff2` | Inter 800 | título do isométrico e do mapa, chip, botão | idem |
| `inter-latin-900-normal.woff2` | Inter 900 | número grande do isométrico, ano do marco | idem |
| `jetbrains-mono-latin-500-normal.woff2` | JetBrains Mono 500 | rótulo do topo, mês da coluna, letra miúda | idem |
| `lora-latin-700-normal.ttf` | Lora 700 (Bold), versão do arquivo `Lora-Bold.ttf` | título e número grande da linha do tempo e do jornal, ano, manchete do recorte | copiada em 17/11/2026 de uma cópia local que já estava na máquina (a pasta de fontes de exemplo da skill de estilo de interface de um plugin do Claude Code, `ui-styling/canvas-fonts/`, junto com o `Lora-OFL.txt` de lá), sem download e sem mudança: 133.828 bytes, sha256 `7d74015e950c2fb66519c7295b8155621d22200ae2ca2a4c6b43ce3c490cac87` |

Para trocar ou acrescentar um peso: ponha o arquivo `.woff2` (ou `.ttf`) aqui, registre em `componentes/fontes.ts` e acrescente a linha nesta tabela e o aviso de copyright em `OFL.txt` (se for família nova, também sob OFL ou licença parecida).
