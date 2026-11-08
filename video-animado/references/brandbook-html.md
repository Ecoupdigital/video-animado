# Estrutura do BRANDBOOK-ANIMACAO

O `.html` é para ver e compartilhar. O `.md` é o que o Claude lê antes de cada vídeo. Mesmas informações nos dois; se uma regra mudar, muda nos dois.

## Seções (nesta ordem)

1. **Capa:** nome do universo, uma frase do que é, data de criação, versão.
2. **Resumo em 5 linhas:** assunto e público, tom, personagens (nomes), cenários, estilo visual.
3. **Narrativa do universo:** o que acontece nos vídeos, conflito que se repete, como o vídeo começa e termina, o que nunca acontece.
4. **Personagens:** uma ficha por personagem (ver abaixo). Se não houver personagem, escrever "Este universo não usa personagem" e explicar quem conduz o vídeo (só texto, só formas, narrador sem rosto).
5. **Cenários:** nome, onde fica, cômodos ou áreas, hora do dia, objetos fixos, cores dominantes. Uma imagem de cada.
6. **Cores:** tabela com papel, nome, hex, onde usa. Proporção de uso. Cor de acerto e de erro.
7. **Fontes:** quais, para quê, tamanhos de referência para legenda e título.
8. **Movimento:** respiração, piscar, entrada e saída, aparição de texto, ritmo, efeitos sonoros e trilha.
9. **Expressões:** imagem com todas as expressões de cada personagem e quando usar cada uma.
10. **Voz:** qual caminho (clonada, pronta, áudio próprio) e identificação da voz de cada personagem.
11. **Pronúncias** (se houver): termo, como a voz deve falar, como escrever na legenda.
12. **Proibições:** lista curta do que nunca fazer.
13. **Como usar em um vídeo novo:** 5 linhas dizendo ao Claude para ler este arquivo, escolher personagens e cenários, respeitar as proibições e importar os componentes em vez de redesenhar.

## Ficha de personagem

- Nome, o que é (pessoa, bicho, objeto…), uma frase de personalidade
- Gênero, idade aparente
- Rosto (formato, pele, olhos, sobrancelhas, nariz, boca), cabelo, barba/óculos
- Proporção do corpo e enquadramento padrão
- Roupa (cores em hex)
- Acompanhantes (cada um com mini-ficha)
- Jeito de falar (ritmo, bordões, o que nunca diz)
- Jeito de se mover
- Voz
- Relações com os outros personagens
- Lista de expressões e como cada uma é montada (olhos, sobrancelhas, boca, braço)
- Caminho do componente em código: `personagens/<nome>/Personagem.tsx`

## Design do HTML

Página única, rolagem vertical, uma seção por bloco acima. Cores do próprio brandbook (as do universo) para os destaques da página, fundo claro e limpo, tipografia das fontes definidas. Cada personagem e cenário aparece como imagem (renderizada com o Remotion em frame parado) para a página abrir sem precisar de nada instalado. Uma tabela de cores com amostras clicáveis. Sem dependências externas além de Google Fonts. Funciona aberta direto no navegador.
