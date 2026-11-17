# Origem das fontes

As fontes do modelo Neon retrô moram nesta pasta e entram no vídeo pelo bundler do Remotion (`componentes/fontes.ts` importa cada arquivo). Nada é baixado na hora do render: o vídeo sai igual com e sem internet, no Mac e no Linux. As duas famílias são de código aberto, sob a SIL Open Font License 1.1 (texto completo e os avisos de copyright em `OFL.txt`, nesta pasta). A licença deixa usar, copiar e distribuir junto com o kit, inclusive em vídeo comercial; só não deixa vender a fonte sozinha. Dentro do vídeo o kit chama as fontes pelos nomes de família `NeonTexto` e `NeonMono`, para nunca pegar uma fonte de mesmo nome instalada na máquina.

Só o subconjunto latin (U+0000 a U+00FF, mais aspas curvas e símbolos comuns), que cobre todo o português com acento, e só os pesos que o kit usa. O subconjunto não tem emoji nem o triângulo de "play": o triângulo do topo, o risco do preço antigo e os enfeites saem desenhados em código (`componentes/cenario.tsx`, `componentes/pecas.tsx`), nunca de um glifo de fonte do sistema. Não há Inter itálica no kit: a inclinação do letreiro é a Inter 900 inclinada em código.

| Arquivo | Família e peso | Usada em | De onde veio |
|---|---|---|---|
| `inter-latin-800-normal.woff2` | Inter 800 | o que é a oferta, preço antigo, chamada e assinatura do card final | copiada do kit Explicação, no mesmo estúdio (`modelos/explicacao/base/componentes/fontes/`, o mesmo arquivo, sem mudança: 24.400 bytes, sha256 `a7d0a50f15d389cad679238466bdb5fc9787aa0715719064ce25abaff042820d`; a origem dele está no `ORIGEM.md` de lá) |
| `inter-latin-900-normal.woff2` | Inter 900 | letreiro neon (inclinado em código), preço que conta, contagem 3, 2, 1, selo, botão em pílula, nome da marca no card | idem (23.900 bytes, sha256 `d5c0ed7b8b5dde97d48b97947d740bbd8ad3ba9f2c5cc6b8280f16acba2d828e`) |
| `jetbrains-mono-latin-500-normal.woff2` | JetBrains Mono 500 | "PLAY" e contador de fita no topo, relógio da contagem, prazo, aviso do card final | idem (21.832 bytes, sha256 `cb182feeed4d798ff6961d3c79f7026279448fca0676438aaecb21f3fc39553a`) |

`arquivos-de-fonte.d.ts` diz ao TypeScript que o bundler importa `.woff2` como endereço (texto).

`componentes/larguras.json` guarda a largura de cada letra (U+0020 a U+00FF, mais aspas curvas, reticências e ponto do meio) da Inter 800 e da Inter 900, em fração do tamanho da fonte, medida uma vez no Chrome (largura do texto no canvas, com estes mesmos arquivos). A JetBrains Mono tem largura fixa, 0,6 do tamanho. É com essa tabela que o letreiro, o preço, o botão e o card final medem o texto para quebrar ou encolher dentro da área segura, sem precisar abrir o navegador. Se trocar uma fonte, meça de novo.

Para trocar ou acrescentar um peso: ponha o arquivo `.woff2` aqui, registre em `componentes/fontes.ts` e acrescente a linha nesta tabela e o aviso de copyright em `OFL.txt` (se for família nova, também sob OFL ou licença parecida).
