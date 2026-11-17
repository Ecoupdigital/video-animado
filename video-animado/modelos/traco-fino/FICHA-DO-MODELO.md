# Traço fino, antes e agora

**Para que serve:** série de vídeos curtos verticais em que uma narradora conta, em primeira pessoa, como era antes e como é agora. Uma situação do agora puxa uma lembrança do antes, apagada em sépia; a volta para o agora mostra o mesmo problema resolvido. Funciona para qualquer assunto com uma virada clara entre o jeito antigo e o jeito novo (rotina, treino, finanças, estudo, organização da casa, um serviço ou produto que resolve).

**Público típico:** perfis que querem contar uma história verdadeira e sincera, com humor seco, para gente que se reconhece no antes. A virada puxa salvamento; o fecho "Comenta <PALAVRA>" puxa a conversa para o direct.

**Visual:** ilustração editorial de traço fino em tinta, gente de proporção realista e corpo inteiro, olhos de ponto e rosto em linha. Paleta "Linho e petróleo" (linho nos fundos, petróleo e oliva no apoio, um destaque quente), trocável por papel. Fontes Fraunces, DM Sans e Caveat. Vertical 1080 x 1920, ritmo calmo.

**Estrutura de episódio (30 a 60 s):**
1. Gancho nos 3 primeiros segundos, já no agora, com uma fala da narradora.
2. O antes: dissolve para a lembrança em sépia, com a aparência do antes, o caderno ou o caos. Selo do antes.
3. O agora: volta à cor; o mesmo problema resolvido (o celular da marca, quando há marca). Selo do agora.
4. O elenco reage com uma ação que tem sentido na história; só a narradora fala.
5. Fecho de cerca de 4 s: chamada, "Comenta <PALAVRA>" e o aviso de personagem fictícia.

**O que vem pronto:**
- **Elenco:** adultos e crianças no mesmo traço, configuráveis pelo `respostas.json` (pele, cabelo com camada de costas, roupa, óculos, barba, barriga como formato do corpo, ombros, altura), cada um com a aparência do antes que troca só o que muda (`epoca="antes"`). Adulto com 9 expressões; criança com 6 expressões e 3 poses.
- **Antes e agora:** `Lembranca` (sépia com vinheta), `SeloTempo` com os rótulos das respostas, `Caderno` que escreve, risca e destaca.
- **Marca:** celular da marca com 4 moldes de tela (lista, semana, conversa, aviso) e o fecho; sem marca, celular sem logo e fecho de seguir o perfil.
- **Cenários:** apartamento (sala e quarto), escritório, porta da escola com o nome das respostas, sala de espera com a placa das respostas; luzes manhã, tarde e madrugada, câmera e zoom.
- **Receita:** narradora única (uma voz só), legenda por frase repartida pelo número de palavras de cada fala, prévia sem voz antes de gastar crédito, trilha e efeitos gerados por código (`RECEITA.md`).

**Limites:** uma voz só (a narradora); criança e apoio não falam. Sem ferramenta externa de imagem ou vídeo por IA. Personagem novo nasce do corpo adulto ou do corpo de criança, nunca desenhado à parte dentro de um vídeo. Cenário fora da lista entra desenhado em código no mesmo traço (contorno em tinta, camadas, paleta por papel). Não serve para diálogo entre personagens (para isso, o modelo chapado).
