# Origem das fontes

As fontes do modelo Mesa vista de cima moram nesta pasta e entram no vídeo pelo bundler do Remotion (`componentes/fontes.ts` importa cada arquivo). Nada é baixado na hora do render: o vídeo sai igual com e sem internet, no Mac e no Linux. As duas famílias são de código aberto, sob a SIL Open Font License 1.1 (texto completo e os avisos de copyright em `OFL.txt`, nesta pasta). A licença deixa usar, copiar e distribuir junto com o kit, inclusive em vídeo comercial; só não deixa vender a fonte sozinha. Dentro do vídeo o kit chama as fontes pelos nomes de família `MesaTexto` e `MesaMono`, para nunca pegar uma fonte de mesmo nome instalada na máquina.

Só o subconjunto latin (U+0000 a U+00FF, mais aspas curvas e símbolos comuns), que cobre todo o português com acento, e só os pesos que o kit usa. O subconjunto não tem emoji: os itens da mesa, o furo da etiqueta e os enfeites saem desenhados em código (`componentes/itens/`, `componentes/centro.tsx`, `componentes/pecas.tsx`), nunca de um glifo de fonte do sistema.

| Arquivo | Família e peso | Usada em | De onde veio |
|---|---|---|---|
| `inter-latin-600-normal.woff2` | Inter 600 | frase da faixa de legenda, frase do card final, nomes nas folhas de conferência | copiada do kit Explicação, no mesmo estúdio (`modelos/explicacao/base/componentes/fontes/`, o mesmo arquivo, sem mudança: 24.452 bytes, sha256 `f9a06e79cd3a2a20951c0f0e28f66dd0e6d3fda73911d640a2125c8fcb78f21a`; a origem dele está no `ORIGEM.md` de lá) |
| `inter-latin-800-normal.woff2` | Inter 800 | título do passo na etiqueta, título da abertura, chamada e assinatura do card final, nome da marca | idem (24.400 bytes, sha256 `a7d0a50f15d389cad679238466bdb5fc9787aa0715719064ce25abaff042820d`) |
| `jetbrains-mono-latin-500-normal.woff2` | JetBrains Mono 500 | "PASSO n DE N" na etiqueta, rótulo da abertura, fontes e aviso do card final, códigos nas folhas | idem (21.832 bytes, sha256 `cb182feeed4d798ff6961d3c79f7026279448fca0676438aaecb21f3fc39553a`) |

`arquivos-de-fonte.d.ts` diz ao TypeScript que o bundler importa `.woff2` como endereço (texto).

Para trocar ou acrescentar um peso: ponha o arquivo `.woff2` aqui, registre em `componentes/fontes.ts` e acrescente a linha nesta tabela e o aviso de copyright em `OFL.txt` (se for família nova, também sob OFL ou licença parecida).
