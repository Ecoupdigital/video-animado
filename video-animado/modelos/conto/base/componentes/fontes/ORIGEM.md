# Origem das fontes

As fontes do modelo Conto moram nesta pasta e entram no vídeo pelo bundler do Remotion (`componentes/fontes.ts` importa cada arquivo). Nada é baixado na hora do render: o vídeo sai igual com e sem internet, no Mac e no Linux. As três famílias são de código aberto, sob a SIL Open Font License 1.1 (texto completo e os avisos de copyright em `OFL.txt`, nesta pasta). A licença deixa usar, copiar e distribuir junto com o kit, inclusive em vídeo comercial; só não deixa vender a fonte sozinha. A Lora tem nome de fonte reservado ("Lora"): o arquivo vai sem nenhuma mudança, e o kit a chama pelo nome de família `ContoSerif` só dentro do vídeo. A Inter é chamada de `ContoTexto` e a Caveat, de `ContoMao`.

Inter e Caveat: só o subconjunto latin (U+0000 a U+00FF, mais aspas curvas e símbolos comuns), que cobre todo o português com acento, e só os pesos que o kit usa. Lora: o arquivo inteiro do peso 700 (latin completo, latin estendido e cirílico), que também cobre o português, `ª` e `º`. Não há Lora itálica no kit: o subtítulo da faixa de título do papel recortado e a citação das silhuetas saem inclinados pelo navegador (`font-style: italic` sobre a Lora 700).

| Arquivo | Família e peso | Usada em | De onde veio |
|---|---|---|---|
| `lora-latin-700-normal.ttf` | Lora 700 (Bold) | título e subtítulo da faixa rasgada do papel recortado, chamada do fecho no papel; citação inclinada do título e chamada do fecho nas silhuetas | copiada do kit Dados e história, no mesmo estúdio (`modelos/dados-historia/base/componentes/fontes/`, o mesmo arquivo, sem mudança: 133.828 bytes, sha256 `7d74015e950c2fb66519c7295b8155621d22200ae2ca2a4c6b43ce3c490cac87`; a origem dele está no `ORIGEM.md` de lá) |
| `caveat-latin-400-700.woff2` | Caveat, variável de 400 a 700 (o kit usa 600 e 700) | letra de mão do giz de cera: título, legenda, placa e chamada do fecho | copiada do kit Explicação, no mesmo estúdio (`modelos/explicacao/base/componentes/fontes/`, o mesmo arquivo, sem mudança: 74.932 bytes, sha256 `891951df5e8b5b0f0bc760d31375405e795c666b5add70437de12d4a6482b33f`; a origem dele está no `ORIGEM.md` de lá) |
| `inter-latin-400-normal.woff2` | Inter 400 | aviso de personagem fictícia, letra miúda das folhas | idem, do kit Dados e história (que a copiou do kit da Explicação) |
| `inter-latin-600-normal.woff2` | Inter 600 | placa do lugar, rótulos das folhas; legenda clara e subtítulo das silhuetas | idem |
| `inter-latin-800-normal.woff2` | Inter 800 | legenda, balões de fala, selo do episódio, título das formas, chamada e "Comenta" do fecho; placa das silhuetas | idem |

`arquivos-de-fonte.d.ts` diz ao TypeScript que o bundler importa `.woff2` e `.ttf` como endereço (texto).

Para trocar ou acrescentar um peso: ponha o arquivo `.woff2` (ou `.ttf`) aqui, registre em `componentes/fontes.ts` e acrescente a linha nesta tabela e o aviso de copyright em `OFL.txt` (se for família nova, também sob OFL ou licença parecida).
