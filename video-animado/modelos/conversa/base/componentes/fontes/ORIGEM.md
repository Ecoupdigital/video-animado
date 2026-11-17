# Origem das fontes

As fontes do modelo Conversa no celular moram nesta pasta e entram no vídeo pelo bundler do Remotion (`componentes/fontes.ts` importa cada arquivo). Nada é baixado na hora do render: o vídeo sai igual com e sem internet, no Mac e no Linux. A Inter é de código aberto, sob a SIL Open Font License 1.1 (texto completo e o aviso de copyright em `OFL.txt`, nesta pasta). A licença deixa usar, copiar e distribuir junto com o kit, inclusive em vídeo comercial; só não deixa vender a fonte sozinha. Dentro do vídeo o kit chama a Inter pelo nome de família `ConversaTexto`, para nunca pegar uma fonte de mesmo nome instalada na máquina.

Só o subconjunto latin (U+0000 a U+00FF, mais aspas curvas e símbolos comuns), que cobre todo o português com acento, e só os pesos que o kit usa. O subconjunto não tem emoji nem símbolos de mensageiro: reação, sinal de lido, digitando, play do áudio, botão de enviar e os desenhos de avatar e de imagem saem desenhados em código (`componentes/desenhos.tsx`), nunca de um glifo de fonte do sistema.

| Arquivo | Família e peso | Usada em | De onde veio |
|---|---|---|---|
| `inter-latin-400-normal.woff2` | Inter 400 | texto das bolhas, horário, campo de mensagem, aviso de conversa encenada | copiada do kit Conto, no mesmo estúdio (`modelos/conto/base/componentes/fontes/`, o mesmo arquivo, sem mudança: 23.664 bytes, sha256 `8909904ab6c872eb994093482a88a28eca2cd95912d7b6fecd72103b0dc07edc`; a origem dele está no `ORIGEM.md` de lá) |
| `inter-latin-600-normal.woff2` | Inter 600 | legenda da cena, status do contato, duração do áudio, rótulos das folhas | idem (24.452 bytes, sha256 `f9a06e79cd3a2a20951c0f0e28f66dd0e6d3fda73911d640a2125c8fcb78f21a`) |
| `inter-latin-800-normal.woff2` | Inter 800 | título da cena com a palavra destacada, nome do contato, inicial do avatar, chamada e "Comenta" do card final | idem (24.400 bytes, sha256 `a7d0a50f15d389cad679238466bdb5fc9787aa0715719064ce25abaff042820d`) |

`arquivos-de-fonte.d.ts` diz ao TypeScript que o bundler importa `.woff2` como endereço (texto).

Para trocar ou acrescentar um peso: ponha o arquivo `.woff2` aqui, registre em `componentes/fontes.ts` e acrescente a linha nesta tabela e o aviso de copyright em `OFL.txt` (se for família nova, também sob OFL ou licença parecida).
