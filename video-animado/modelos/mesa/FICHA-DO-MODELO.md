# Mesa vista de cima

**Para que serve:** reel narrado de passo a passo visto de cima, sem personagem nem mãos. Uma narração inteira ensina a receita, a maquiagem ou o artesanato; cada ingrediente, produto ou material cai ou aparece na mesa na palavra falada, a etiqueta de papel troca de passo e a faixa de legenda destaca a palavra que importa. Funciona para receita, montagem, maquiagem, cuidado, artesanato, papelaria e qualquer "como fazer" com as mãos.

**Público típico:** perfis de culinária, beleza e artesanato, lojas e ateliês que querem mostrar o passo a passo com o produto na mesa, sem gravar mãos nem rosto.

**Modelo avulso** (sem temas). Três superfícies e três grupos, escolhidos na entrevista (pergunta 8):

| Superfície | Cara |
|---|---|
| **Madeira** (`madeira`, padrão) | tábuas verticais com junta escura e veio, como a tela de referência |
| **Mármore** (`marmore`) | mármore claro com manchas suaves e veios finos |
| **Pano liso** (`pano`) | toalha lisa azul-acinzentada com trama leve |

| Grupo principal | Peça central | Itens |
|---|---|---|
| **Cozinha** (`cozinha`) | tábua redonda com cabo; a pizza se monta em camadas | massa, molho, queijo, tomate, folha, ovo, farinha, tigela, colher, prato |
| **Beleza** (`beleza`) | bandeja de penteadeira, onde fica o teste de cada produto | base, pincel, batom, sombra, espelho, algodão |
| **Artesanato** (`artesanato`) | base de corte quadriculada, onde o cartão se monta | papel, tesoura, cola, linha, botão, fita |

O grupo principal escolhe só a peça central e a amostra: o roteiro de cada vídeo usa qualquer um dos 22 itens. **A cor troca destaque, faixa, etiqueta e card final, nunca o material** (3 paletas prontas que valem nas 3 superfícies, ou a cor da marca).

**Estrutura de episódio (30 a 60 s, uma narração):**
1. Abertura: a mesa e a peça central vazias, o título numa etiqueta grande.
2. Os passos: "PASSO n DE N" e o título na etiqueta; cada item cai na palavra; a faixa traz a frase com a palavra destacada.
3. O resultado: a peça central pronta, com tudo o que caiu nela.
4. Card final: chamada, "comenta aqui", assinatura, fontes e "Narração gerada por IA".

**O que vem pronto:**
- **Mesa:** 3 superfícies e 3 peças centrais desenhadas em código, com a sombra na cor da superfície.
- **Biblioteca:** 22 itens vistos de cima, cada um com duas entradas (cai, com a sombra encostando e um quique curto, ou aparece, num pop); os que viram cobertura entram sobre a peça central, pedaço a pedaço ou como camada, e ficam até o fim.
- **Cenas montadas por dados:** abertura, passo e final. O roteiro diz o texto de cada cena, os itens e a palavra de cada um; nenhum tempo é digitado à mão, e o `timing.py` recusa item fora da biblioteca.
- **Etiqueta, faixa e card final** que quebram e encolhem dentro da área segura.
- **Ferramentas:** transcrição com o tempo de cada palavra, `timing.json` por batida, ducking da cama, emenda de trecho errado sem gerar a narração de novo, prévia sem voz, stills de conferência, efeitos (um pouso por superfície) e cama gerados por código (só numpy).
- **Fontes no kit:** Inter e JetBrains Mono em arquivo (licença OFL), sem baixar nada na hora do render.
- **Receita:** roteiro em cenas aprovado antes da voz, um item por batida, quantidade e tempo ditos iguais aos da tela, uma voz com custo avisado antes (`RECEITA.md`).

**Limites:** uma voz só. Não mostra mãos, rosto nem personagem (para isso, o chapado, o traço fino ou o conto), nem foto de produto. Nenhum item tem rótulo, embalagem ou logo de marca real. Até 4 itens na mesa por passo (com textos curtos, até 6); item que não existe entra no kit antes. Nenhuma imagem de fora, nenhuma ferramenta externa de imagem ou vídeo por IA: tudo desenhado em código.
