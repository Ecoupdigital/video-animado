# Origem das fontes

As fontes do modelo Explicação moram nesta pasta e entram no vídeo pelo bundler do Remotion (`componentes/fontes.ts` importa cada arquivo). Nada é baixado na hora do render: o vídeo sai igual com e sem internet, no Mac e no Linux. As três famílias são de código aberto, sob a SIL Open Font License 1.1 (texto completo e os avisos de copyright em `OFL.txt`, nesta pasta). A licença deixa usar, copiar e distribuir junto com o kit, inclusive em vídeo comercial; só não deixa vender a fonte sozinha.

Só o subconjunto latin (U+0000 a U+00FF, mais aspas curvas e símbolos comuns), que cobre todo o português com acento, e só os pesos que o kit usa.

| Arquivo | Família e peso | Usada em | De onde veio |
|---|---|---|---|
| `caveat-latin-400-700.woff2` | Caveat, variável de 400 a 700 (o kit usa 600 e 700) | letra de mão: títulos do quadro e da lousa, texto das caixas, dos post-its e do giz | baixada uma vez, em 17/11/2026, do endereço que o módulo `Caveat` do pacote de fontes do Google do Remotion 4.0.539 (no motor) indica para o subconjunto latin, versão v23 da fonte no Google Fonts (74.932 bytes) |
| `inter-latin-400-normal.woff2` | Inter 400 | texto de apoio, legenda, card final | copiada da pasta de fontes do reel dossiê de referência, em `referencia/modelos/` do estúdio (o mesmo arquivo, sem mudança) |
| `inter-latin-600-normal.woff2` | Inter 600 | itens da janela de app, rótulos de coluna | idem |
| `inter-latin-800-normal.woff2` | Inter 800 | título da tela de app, botão, selo de passo | idem |
| `inter-latin-900-normal.woff2` | Inter 900 | título do quadro de post-its | idem |
| `jetbrains-mono-latin-500-normal.woff2` | JetBrains Mono 500 | rótulo do topo, endereço da janela, letra miúda | idem |

Para trocar ou acrescentar um peso: ponha o arquivo `.woff2` aqui, registre em `componentes/fontes.ts` e acrescente a linha nesta tabela e o aviso de copyright em `OFL.txt` (se for família nova, também sob OFL ou licença parecida).
