# Formato de kit (modelo do catálogo)

Um **kit** é um modelo inteiro pronto para virar universo: desenho, configuração do Remotion, brandbook com lacunas e a receita de vídeo. Os kits da skill moram em `modelos/<id>/`; os modelos locais da pessoa, no mesmo formato, em `<estúdio>/modelos/<id>/` com `origem: "local"`.

## O que tem num kit

```
modelos/<id>/
  modelo.json                manifesto (esquema abaixo)
  FICHA-DO-MODELO.md         para que serve, público típico, estrutura de episódio, limites
  PERGUNTAS.md               o que a entrevista curta pula, troca ou acrescenta neste modelo (texto das perguntas trocadas e acrescentadas)
  RECEITA.md                 Parte B do modelo (copiada para a raiz do universo)
  aplicador.mjs              a parte do novo_universo.mjs --aplicar que é deste modelo (ver "Aplicador do kit")
  vitrine/
    vitrine.json             nome de exibição, frase, exemplo, arquivos da vitrine
    exemplo.json             respostas que reproduzem o exemplo (único lugar onde o exemplo pode ter nome de marca e de pessoa)
    roteiro-falas.json       roteiro curto do exemplo para o trecho (falas no tom da série, sem afirmação de saúde)
    folha.jpg elenco.jpg trecho.mp4   gerados por gerar_vitrine.mjs (JPG abaixo de ~300 KB; trecho de 4 a 6 s, sem áudio, até 2 MB)
    tema-<id>.jpg            só no modelo de família: a miniatura de cada tema (ver "Família")
  base/                      o que vira o universo da pessoa
    BRANDBOOK-ANIMACAO.md    com lacunas {{chave}} e marcas <!-- ESCREVER: ... -->
    package.json tsconfig.json remotion.config.ts
    pronuncias.md            esqueleto da tabela de pronúncias (o transcrever.py lê a primeira coluna)
    componentes/ personagens/ cenarios/ _preview/
    _ferramentas/
      montar_audio.py transcrever.py volume.py    Parte B: áudio por fala, palavras, volume da boca
      tempos_sem_voz.py                           prévia sem voz: tempos sintéticos do roteiro-falas.json
      previa.sh frames.sh                         prévia em meia resolução e folha de frames do render
      gerar_sfx.py                                gera os efeitos por síntese (só numpy)
      sfx/                                        pop.wav ding.wav deslize.wav suspense.wav + ORIGEM.md
      episodio-base/src/                          episódio de partida (Root, Episodio, falas/palavras/volume vazios),
                                                  copiado para videos/AAAA-MM-DD-slug/src de cada vídeo
  teste/
    respostas.json           respostas fixas de outro nicho (prova de neutralidade)
    roteiro-falas.json       roteiro curto do teste (10 a 15 s, dois personagens) para a prévia sem voz
    entrevista.md            a entrevista curta do teste, pergunta a pergunta, com o trecho do respostas.json de cada resposta
```

**Episódio base.** `base/_ferramentas/episodio-base/src/` é o ponto de partida de todo vídeo: composição `ep` 1080 x 1920 a 30 fps, duração tirada do `falas.json`, personagem achado pelo `quem`, fecho no fim, narração e efeitos tocados só quando o arquivo existe em `public/`. A prévia sem voz é `tempos_sem_voz.py` + `previa.sh` sobre ele.

**Efeitos sonoros.** `base/_ferramentas/sfx/` traz os quatro efeitos com a origem em `ORIGEM.md`; `gerar_sfx.py` refaz os quatro, e `montar_audio.py` e `tempos_sem_voz.py` geram sozinhos se a pasta estiver vazia.

**Vitrine.** `gerar_vitrine.mjs <id>` monta um universo temporário com `vitrine/exemplo.json`, faz a prévia sem voz de `vitrine/roteiro-falas.json` e grava a folha de frames, o still `elenco` e o trecho. O `trecho.mp4` da vitrine é o único `.mp4` que entra no git (exceção no `.gitignore`). `vitrine.json` aceita `"trecho": { "inicio": 0, "duracao": 5 }` para escolher o pedaço; sem isso, o trecho vai do começo ao fim da fala que termina entre 4 e 6 s. `"legendas": { "elenco": "Peças" }` troca a legenda da segunda imagem no catálogo (o modelo sem personagem mostra a folha de peças no still `elenco`).

`conferir_kit.mjs <id>` confere tudo isso. Os arquivos da vitrine que ainda não foram gerados aparecem como aviso, não como erro.

## `modelo.json`

```json
{
  "id": "chapado",
  "nome": "Chapado, casa quente",
  "versao": "1.0",
  "origem": "skill",
  "tipo": "personagens",
  "receita": "vozes-por-fala",
  "resumo": "Personagens 2D chapados, sem contorno, cabeça grande, humor de situação com dica.",
  "perguntas": { "pular": [], "trocar": { "7": "elenco-e-acompanhantes" }, "acrescentar": [] },
  "termos_proibidos": ["..."],
  "stills_prova": ["expressoes-*", "opcoes-aparencia", "elenco"],
  "criado_em": "2026-11-15"
}
```

| Campo | Obrigatório | Valores |
|---|---|---|
| `id` | sim | igual ao nome da pasta do kit |
| `nome` | sim | nome de exibição |
| `versao` | sim | `1.0`, `1.1`... |
| `origem` | sim | `skill` ou `local` |
| `tipo` | sim | `personagens`, `sem-personagem`, `pixel` |
| `receita` | sim | `vozes-por-fala`, `narradora-unica`, `narracao-inteira`, `sprites-por-som`, `texto-e-musica` (só texto e música, sem voz); com `receitas`, é a padrão |
| `receitas` | não | lista das receitas que o kit declara, quando a pessoa escolhe uma na entrevista (ex.: `["vozes-por-fala", "texto-e-musica"]` na Conversa no celular); cada uma da lista de `receita`, sem repetir, com a `receita` padrão dentro. O `conferir_kit.mjs` confere |
| `resumo` | sim | uma frase |
| `perguntas.pular` | sim | números de 1 a 12 da entrevista base (ex.: `[5, 6, 7]`) |
| `perguntas.trocar` | sim | `{ "6": "aparencia-pixel" }`: número da pergunta base e o id da versão do modelo |
| `perguntas.acrescentar` | sim | ids de pergunta extra, feitas antes do fecho |

**Tamanho da entrevista curta:** 12 menos as puladas mais as acrescentadas (trocar não muda a conta) tem de ficar entre 8 e 12; o `conferir_kit.mjs` imprime o total e reprova fora disso. Cada id de `trocar` e `acrescentar` precisa estar descrito no `PERGUNTAS.md`. As 12 perguntas base e as regras ficam em `references/entrevista-curta.md`.
| `termos_proibidos` | sim | lista; vazia só em modelo local. **Fica numa linha só** (o `conferir_neutro.mjs` pula essa linha) |
| `stills_prova` | sim | ids dos stills do `_preview` que provam o modelo (`*` vale como curinga) |
| `criado_em` | sim | `AAAA-MM-DD` |

## Família (um modelo com vários temas)

Modelos que usam o mesmo motor e as mesmas cenas, mudando só o visual, viram **um modelo de família**: um kit só, com vários **temas**. O tema troca o visual, não o roteiro (os tipos de cena valem em todos os temas), e se escolhe na entrevista curta, não no catálogo. No catálogo, a família ocupa um número só, num cartão com a miniatura de cada tema. Os modelos de família são a `explicacao` (quadro, lousa, post-its, tela de app), a `dados-historia` (isométrico, linha do tempo, mapa, jornal), as duas sem personagem, e o `conto` (papel recortado, bonecos de formas, silhuetas, giz de cera), com personagem: nele o personagem se desenha no traço de cada tema.

No `modelo.json`, dois campos a mais:

```json
{
  "temas": [
    { "id": "lousa", "nome": "Lousa de giz", "resumo": "Lousa com giz, moldura de madeira e bandeja...",
      "cor_troca": "troca só a cor da lousa e o giz de destaque; a moldura de madeira e o giz branco ficam",
      "cores_trocaveis": ["fundo", "destaque"] }
  ],
  "tema_recomendado": "quadro"
}
```

| Campo | Valores |
|---|---|
| `temas[].id` | minúsculas, números e hífen; é a resposta `tema` e o sufixo dos stills `tema-<id>` e da miniatura `vitrine/tema-<id>.jpg` |
| `temas[].nome`, `temas[].resumo` | nome de exibição e uma frase (vão para o catálogo, a pergunta de tema e o brandbook) |
| `temas[].cor_troca` | em palavras, o que a resposta de cores troca neste tema (o catálogo mostra embaixo da miniatura; a pergunta de cores diz antes de perguntar) |
| `temas[].cores_trocaveis` | papéis de cor que a resposta pode trocar neste tema (`cores.paleta`, paleta pronta e destaque da marca só mexem nestes) |
| `tema_recomendado` | id de um dos temas (o recomendado quando o assunto não dá pista; o da vitrine) |

**Regras conferidas.** `conferir_kit.mjs`: pelo menos 2 temas, ids únicos, os 4 textos de cada tema, `tema_recomendado` na lista, uma pergunta de id `tema` em `perguntas.trocar` ou `perguntas.acrescentar`, a pergunta 9 (cores) fora de `pular`; com `base/componentes/opcoes.json` trazendo `paletas`, cada tema tem a sua, com os mesmos papéis na mesma ordem, e os `cores_trocaveis` são papéis dela; a miniatura `vitrine/tema-<id>.jpg` que falta é aviso. Kit sem `temas` não muda nada. `novo_universo.mjs --aplicar` (parte comum, para toda família): a resposta `tema` é obrigatória e precisa ser um dos ids (fora da lista, sai 1 com os aceitos e o número da pergunta de id `tema`), e `cores.paleta` só aceita os papéis que o tema escolhido troca (fora deles, sai 1 com a pergunta 9). O aplicador do kit grava o tema e as cores já resolvidas no `componentes/universo.ts`; o `ctx` traz `manifesto` (o `modelo.json`) para ele ler os temas.

**Vitrine de família.** `gerar_vitrine.mjs` faz a folha, as peças e o trecho só no tema recomendado (o `exemplo.json` sai com `tema` trocado por ele) e grava uma miniatura por tema (`vitrine/tema-<id>.jpg`, do still `tema-<id>`). O `catalogo.mjs` mostra o cartão de família: trecho, folha e peças do tema recomendado, e a fileira de temas com nome e o que a cor troca.

## `respostas.json` (gravado na raiz do universo)

```json
{
  "modelo": "chapado", "versao_modelo": "1.0", "respondido_em": "2026-11-16",
  "universo": { "nome": "Sorriso em Dia", "pasta": "sorriso-em-dia", "assunto": "...", "publico": "...", "tom": "..." },
  "marca": { "nome": "Clínica Exemplo", "cor": "#2F8F9D", "simbolo": "dente", "palavra_fecho": "SORRISO" },
  "personagens": [
    { "id": "bia", "nome": "Bia", "papel": "protagonista", "idade": 34, "quem_e": "...",
      "aparencia": { "preset": "coque-sardas", "pele": "p3", "cabelo": "comprido", "oculos": true },
      "voz": { "caminho": "pronta", "voice_id": null } }
  ],
  "acompanhantes": [ { "id": "bolota", "tipo": "cachorro", "nome": "Bolota", "cor": "preto" } ],
  "cenarios": { "casa": ["sala"], "sala_espera": { "placa": "Consultório 2" }, "rua": { "loja": "Ótica Central" } },
  "cores": { "origem": "modelo", "paleta": null },
  "voz": { "caminho": "pronta" },
  "nunca": ["prometer resultado de tratamento"],
  "fecho": { "chamada": "Quer marcar uma avaliação?", "palavra": "SORRISO", "aviso_ficticio": true }
}
```

Obrigatórios: `modelo`, `universo.nome`, `universo.assunto`, `universo.publico`, `universo.tom` e ao menos um personagem com `papel: "protagonista"`, cada um com `id`, `nome`, `papel` e `aparencia` (menos no modelo que pula a pergunta 5, que não tem personagem). `marca: null` quer dizer nenhuma marca.

**Aparência (modelo chapado):** `preset` dá o ponto de partida e os outros campos trocam só o que foi respondido. Códigos aceitos em `base/componentes/opcoes.json`:

| Campo | Valores |
|---|---|
| `preset` | `coque-sardas`, `crespo-barba`, `grisalha-perolas`, `cachos-mochila` |
| `pele` | `p1` (mais clara) a `p8` (mais escura) |
| `cabelo` | `coque`, `curto-liso`, `crespo-curto`, `cachos`, `armado`, `comprido`, `careca` |
| `corCabelo`, `corSobrancelha`, `topo`, `gola`, `baixo`, `baixoLuz`, `sapato`, `sola`, `faixaSapato`, `corOculos`, `prendedor` | hex `#RRGGBB` |
| `manga` | `curta`, `longa` |
| `tipoBaixo` | `calca`, `saia`, `jardineira` |
| `oculos`, `barba`, `sardas`, `rugas`, `cilios`, `jaleco` | `true` ou `false` |
| `acessorio` | `nenhum`, `perolas`, `mochila` |
| `altura` (0.6 a 1.3), `largura` (0 a 40), `raioCabeca` (96 a 126), `tamanhoOlho` (0.8 a 1.4) | número |

Acompanhantes: `cachorro` com `cor` (`caramelo`, `preto`, `branco`, `cinza`, `chocolate` ou hex) e `bebe` com `pele`.

**Modelo traço fino.** Cada personagem tem `corpo` (`adulto` ou `crianca`; sem ele, o do preset ou adulto) e pode ter `aparencia_antes`, só com o que muda no antes (desenhado com `epoca="antes"`). A protagonista é a narradora: adulta e a única com `voz`. A pergunta 2 grava também `antes_e_agora` (`virada`, `rotulo_antes`, `rotulo_agora`; sem rótulo, os selos dizem ANTES e AGORA). Cenários: `{ "apartamento": ["sala", "quarto"], "escritorio": true, "escola": { "nome": "..." }, "sala_espera": { "placa": "..." } }`. Códigos em `base/componentes/opcoes.json` do kit:

| Campo | Adulto | Criança |
|---|---|---|
| `preset` | `chanel-camisa-oliva` (com o antes de cabelo comprido), `curto-barba-camiseta` | `crianca-arrepiado-listrada` |
| `pele` | `p1` (mais clara) a `p8` (mais escura) | igual |
| `cabelo` | `chanel`, `comprido`, `rabo`, `coque`, `curto`, `crespo`, `careca` | `arrepiado`, `franja`, `marias`, `crespo` |
| roupa | `camisa` (`aberta`, `fechada`), `topo`, `porBaixo`, `manga` (`sem`, `curta`, `longa`), `tipoBaixo` (`calca`, `bermuda`, `saia`), `baixo`, `tenis`, `sola` | `topo`, `listras` (hex ou null), `tipoBaixo` (`bermuda`, `saia`), `baixo`, `tenis`, `faixaTenis`, `laco` |
| detalhes | `oculos`, `corOculos`, `barba`, `cilios`, `corCabelo`, `corSobrancelha`, `corBrilho` | `oculos`, `corOculos`, `curativo`, `corCabelo`, `corSobrancelha` |
| corpo | `barriga` (0 a 1, formato do corpo), `ombros` (0 a 24), `altura` (0,85 a 1,15) | `altura` (0,45 a 0,7 do adulto) |

**Modelo sem personagem (dossiê).** Modelo que pula a pergunta 5 (`"pular": [5, 6, 7]`) não tem personagem: no `--aplicar`, `personagens` pode faltar (o aplicador do dossiê recusa a lista se vier). Campos do dossiê:

```json
{
  "dossie": { "rotulo": "// DOSSIÊ · CONDOMÍNIO", "selo": "EM APURAÇÃO", "manchetes": ["REFORMA DO SALÃO CUSTOU O TRIPLO", "..."] },
  "cores": { "tema": "jornal", "paleta": { "destaque": "#7A2E1F" }, "fontes": { "titulo": "PlayfairDisplay" } },
  "voz": { "caminho": "pronta", "voice_id": null },
  "fecho": { "chamada": "E aí, você aprovaria essa obra?", "assinatura": "@perfil", "frase_assinatura": "me segue pra ver o próximo caso", "aviso_ia": true },
  "caso": { "titulo": "A reforma que custou o triplo", "nome": "Construtora Alfa", "papel": "empresa da obra" }
}
```

| Campo | Pergunta | Valores |
|---|---|---|
| `dossie.rotulo`, `dossie.selo` | 8 | texto do topo e do selo que pisca (padrão: `// DOSSIÊ · <NOME>` e `CASO ABERTO`) |
| `dossie.manchetes` | 8 | 1 a 8 manchetes da faixa rolando |
| `cores.tema` | 9 | `investigativo` (escuro), `jornal` (claro), `marca` (destaque da cor da marca; sem marca, as cores do investigativo) |
| `cores.paleta` | 9 | papéis de `base/componentes/opcoes.json` (`paletas`): `fundo`, `fundo2`, `superficie`, `apagado`, `destaque`, `destaque2`, `claro`, `ouro`, `titulo`, `texto`, `suave`, `discreto`, `alerta`, `alertaSuave`, `papel`, `tinta`, `fita` |
| `cores.fontes` | 9 | `titulo`, `texto`, `mono`, cada um com uma fonte da lista `fontes` do `opcoes.json` |
| `fecho.assinatura` (obrigatória), `fecho.frase_assinatura`, `fecho.chamada` | 12 | card final |
| `fecho.aviso_ia` | 12 | `true` por padrão; `false` só com `voz.caminho: "audio-proprio"` |
| `caso` | 2 | opcional: título, nome e papel do caso dos stills de conferência (sem ele, o caso neutro do kit) |

**Modelo de família Explicação (`explicacao`).** Sem personagem (pula 5, 6 e 7), 4 temas e 9 perguntas: a 8 vira `tema`, a 9 `cores-do-tema` e a 12 `card-final`. Campos:

```json
{
  "explicacao": { "rotulo": "CONTAS EM DIA · PRÓ-LABORE" },
  "tema": "quadro",
  "cores": { "origem": "marca", "pronta": null, "paleta": null },
  "voz": { "caminho": "pronta", "voice_id": null },
  "fecho": { "chamada": "Ficou alguma dúvida?", "assinatura": "@perfil", "frase_assinatura": "me segue pra aprender o próximo passo", "aviso_ia": true },
  "amostra": { "titulo": "Como definir o seu *pró-labore*", "item": "Separar as contas" }
}
```

| Campo | Pergunta | Valores |
|---|---|---|
| `explicacao.rotulo` | 1 | rótulo do topo de todo vídeo (padrão: o nome do universo em caixa alta) |
| `amostra` | 2 | opcional: título e primeiro item da explicação dos stills de conferência (sem ele, a explicação neutra do kit) |
| `tema` | 8 | `quadro`, `lousa`, `post-its`, `tela-app` |
| `cores.origem` | 9 | `tema` (as cores do tema, padrão), `marca` (o destaque vira a cor da marca, clareada ou escurecida o mínimo para ler no fundo do tema; pede `marca.cor`), `pronta` (uma das 3 paletas prontas do tema) |
| `cores.pronta` | 9 | com `origem: "pronta"`: quadro `papel-claro`, `papel-kraft`, `quadro-branco`; lousa `verde`, `preta`, `azul`; post-its `parede-clara`, `cortica`, `noite`; tela de app `violeta`, `oceano`, `grafite` |
| `cores.paleta` | 9 | troca fina por papel (lista em `opcoes.json`, `papeis`), só entre os `cores_trocaveis` do tema (na lousa: `fundo` e `destaque`) |
| `fecho.assinatura` (obrigatória), `fecho.frase_assinatura`, `fecho.chamada`, `fecho.aviso_ia` | 12 | card final; `aviso_ia: false` só com `voz.caminho: "audio-proprio"` |

O `--aplicar` grava `componentes/universo.ts` com o tema, as cores resolvidas (só os papéis que o tema troca), o rótulo, o endereço da janela de app (o nome da marca, ou um endereço genérico) e o card final. As fontes moram no kit (`base/componentes/fontes/`, com `OFL.txt` e `ORIGEM.md`): nada é baixado na hora do render.

**Modelo de família Dados e história (`dados-historia`).** Sem personagem (pula 5, 6 e 7), 4 temas e 9 perguntas, no mesmo esquema da Explicação: a 8 vira `tema`, a 9 `cores-do-tema` e a 12 `card-final`. Campos:

```json
{
  "dados": { "rotulo": "FÔLEGO · 3º TRIMESTRE" },
  "tema": "isometrico",
  "cores": { "origem": "marca", "pronta": null, "paleta": null },
  "voz": { "caminho": "pronta", "voice_id": null },
  "fecho": { "chamada": "Qual unidade é a sua?", "assinatura": "@perfil", "frase_assinatura": "me segue pra ver o próximo capítulo", "aviso_ia": true },
  "amostra": { "titulo": "O melhor *trimestre* da rede", "valor": { "numero": 42, "prefixo": "+", "sufixo": "%" }, "marco": "Primeira sala", "chip": "8 min", "manchete": "Academia de bairro abre às 5h" }
}
```

| Campo | Pergunta | Valores |
|---|---|---|
| `dados.rotulo` | 1 | rótulo do topo de todo vídeo (padrão: o nome do universo em caixa alta) |
| `amostra` | 2 | opcional: título, número grande (`numero`, `prefixo`, `sufixo`, `casas`), primeiro marco, primeiro chip e primeira manchete dos stills de conferência (sem ele, os dados neutros do kit) |
| `tema` | 8 | `isometrico`, `linha-do-tempo`, `mapa`, `jornal` |
| `cores.origem` | 9 | `tema` (padrão), `marca` (o destaque vira a cor da marca, clareada ou escurecida o mínimo para contraste 4 contra os papéis de `estilos.<tema>.contraste` do `opcoes.json`; pede `marca.cor`), `pronta` |
| `cores.pronta` | 9 | isométrico `noite`, `grafite`, `aurora`; linha do tempo `papel`, `areia`, `noite`; mapa `dia`, `noite`, `papel-antigo`; jornal `vermelha`, `azul`, `verde` |
| `cores.paleta` | 9 | troca fina por papel, só entre os `cores_trocaveis` do tema (no jornal: `destaque`, `faixa` e `etiqueta`; a cortiça, o papel e a retícula ficam) |
| `fecho.assinatura` (obrigatória), `fecho.frase_assinatura`, `fecho.chamada`, `fecho.aviso_ia` | 12 | card final; `aviso_ia: false` só com `voz.caminho: "audio-proprio"`; sem marca, o card mostra só a assinatura no destaque do tema |

O `--aplicar` grava `componentes/universo.ts` com o tema, as cores resolvidas (só os papéis que o tema troca), o rótulo, o card final e a amostra. As fontes moram no kit (`base/componentes/fontes/`: Lora, Inter, JetBrains Mono e Caveat, com `OFL.txt` e `ORIGEM.md`): nada é baixado na hora do render. O mapa é um desenho genérico só (`componentes/mapa.tsx`), igual em todo universo.

**Modelo de família Conto (`conto`).** Com personagem (`tipo: personagens`, receita `vozes-por-fala`), 4 temas e as 12 perguntas: só a 8 é trocada por `tema` (o tema, o cenário e o nome do lugar), e ela é feita logo depois da 4, porque a aparência (6 e 7) é perguntada já no traço do tema. Campos a mais:

```json
{
  "tema": "formas",
  "cenarios": { "lista": ["sala", "rua"], "lugar": "Escola Ponte" },
  "personagens": [
    { "id": "teca", "nome": "Teca", "papel": "protagonista", "idade": 41, "quem_e": "...",
      "aparencia": { "preset": "coque-oculos", "cor": "#3A86FF", "acessorio": "oculos", "corDetalhe": "#1D1D1F",
                     "pele": "p3", "cabelo": "coque", "corCabelo": "#4A2C17", "roupa": "camisa-saia", "corBaixo": "#2B3A55", "sapato": "#2B2B2B",
                     "corpo": "pilula", "olhos": "redondos", "sobrancelha": "fina" },
      "voz": { "caminho": "pronta", "voice_id": null } }
  ],
  "cores": { "origem": "marca", "pronta": null, "paleta": null },
  "narrador": { "ligado": true, "voz": { "caminho": "pronta", "voice_id": null } },
  "fecho": { "chamada": "Já passou vergonha falando inglês?", "palavra": "PONTE", "aviso_ficticio": true }
}
```

| Campo | Pergunta | Valores |
|---|---|---|
| `tema` | 8 | `papel`, `formas`, `silhuetas`, `giz-de-cera` |
| `cenarios.lista`, `cenarios.lugar` | 8 | `sala` (lado de dentro), `rua` (lado de fora), na ordem do mais usado; o nome do lugar vai na placa (sem ele, sem placa) |
| `personagens[].aparencia` | 6 e 7 | um objeto só para todos os temas. Comuns: `preset` (`coque-oculos`, `bone-camiseta`, `cachos-laco`, `careca-gravata`), `cor` (principal), `acessorio` (`nenhum`, `oculos`, `bone`, `laco`, `gravata`), `corDetalhe`. Papel recortado: `pele` (`p1` a `p8`), `cabelo` (`curto`, `comprido`, `coque`, `cachos`, `rabo`, `careca`), `corCabelo`, `roupa` (`camisa-calca`, `camisa-saia`, `vestido`, `macacao`), `corBaixo`, `sapato`. Formas: `corpo` (`pilula`, `retangulo`, `circulo`, `triangulo`), `olhos` (`redondos`, `grandes`, `pontos`, `sonolentos`), `sobrancelha` (`fina`, `grossa`, `nenhuma`). Silhuetas: `formato` (`reto`, `vestido`, `largo`, `redondo`) e `altura` (`baixa`, `media`, `alta`), mais o `cabelo` do papel e o acessório no contorno. Giz de cera: nenhum campo próprio; lê `pele`, `cabelo`, `corCabelo`, `roupa` e `corBaixo` do papel (`campos_divididos` no `opcoes.json`). Os campos do tema que não está em uso ficam guardados (e são conferidos); o que falta sai do preset da resposta, senão do preset padrão do lugar no elenco |
| `cores.origem`, `cores.pronta`, `cores.paleta` | 9 | como nas outras famílias: `tema`, `marca` (destaque com contraste 4 contra a tarja no papel, o chão nas formas e nas silhuetas, a folha no giz de cera) ou `pronta` (papel `laranja`, `azul`, `vermelha`; formas `sol`, `menta`, `noite`; silhuetas `por-do-sol`, `noite`, `amanhecer`; giz de cera `classica`, `pastel`, `forte`); no papel só `destaque`, `faixa` e `etiqueta` trocam; nas silhuetas, o céu, o que ele tinge e o destaque; no giz de cera, as cores dos gizes |
| `narrador` | 10 | `false` (padrão), `true` ou `{ "ligado": true, "nome": "...", "voz": {...} }`; as falas com `quem: "narrador"` não abrem a boca de ninguém |
| `fecho.chamada`, `fecho.palavra`, `fecho.aviso_ficticio` | 12 | como no chapado; `marca: null` dá o fecho de "Segue o perfil" |

O `--aplicar` grava `componentes/universo.ts` (tema e cores resolvidas, cenários e lugar, narrador, fecho e o elenco com a aparência como veio), `personagens/<id>/Personagem.tsx` e `FICHA.md` e `personagens/index.ts`. O traço de cada tema mora num módulo (`componentes/temas/<id>/traco.tsx` e `fundo.tsx`, registrados em `componentes/temas/index.ts`) atrás de um `Personagem` só, com as mesmas props; os ids de expressão, de cenário e de tipo de cena são os mesmos em todos os temas. Tema novo: entrada no `modelo.json` e no `opcoes.json` (paleta com os mesmos papéis, prontas, estilo, campos de aparência e presets), o módulo do tema e as miniaturas. As fontes moram no kit (`base/componentes/fontes/`: Lora e Inter, com `OFL.txt` e `ORIGEM.md`).

**Modelo avulso Conversa no celular (`conversa`).** Mensageiro genérico (sem a cara de nenhum app real), sem personagem desenhado: `tipo: personagens` com exatamente 2 personagens, que são os 2 lados da conversa; 10 perguntas (`"pular": [6, 7]`, a 5 vira `quem-conversa`, a 8 `tela-do-chat`, a 9 `cores-da-conversa`, a 10 `receita-e-vozes`, a 12 `card-final`). É o primeiro kit com duas receitas: `"receita": "vozes-por-fala"` (a padrão) e `"receitas": ["vozes-por-fala", "texto-e-musica"]`. Campos:

```json
{
  "personagens": [
    { "id": "forno", "nome": "Forno da Vila", "papel": "protagonista", "lado": "direita", "quem_e": "...",
      "avatar": { "tipo": "desenho", "desenho": "bolo", "cor": "#FFD08A" }, "voz": { "caminho": "pronta", "voice_id": null } },
    { "id": "rita", "nome": "Rita", "papel": "apoio", "lado": "esquerda", "quem_e": "...", "status": "online",
      "avatar": { "tipo": "inicial", "cor": "#F4A6C0" }, "voz": { "caminho": "pronta", "voice_id": null } }
  ],
  "tela": { "fundo": "pontos", "horario": true, "lido": true, "hora": "20:14" },
  "cores": { "origem": "marca", "pronta": null, "paleta": null },
  "receita": "vozes-por-fala",
  "fecho": { "chamada": "Já encomendou bolo na véspera?", "palavra": "BOLO", "aviso_ficticio": true },
  "amostra": { "titulo": "A encomenda de *última hora*", "mensagem": "Oi! Ainda dá tempo?" }
}
```

| Campo | Pergunta | Valores |
|---|---|---|
| `personagens` | 5 | exatamente 2, um de cada `lado`: `direita` (o dono do celular, papel `protagonista`) e `esquerda` (o contato do cabeçalho, papel `apoio`); `status` (texto ou `null`; padrão `online` no contato); `avatar.tipo` `inicial` ou `desenho` (`pessoa`, `flor`, `bolo`, `gato`, `casa`, `sol`), `avatar.cor` em hex |
| `tela.fundo`, `tela.horario`, `tela.lido`, `tela.hora` | 8 | `pontos`, `liso`, `grade`, `diagonal`; `true` ou `false`; `true` ou `false` (o sinal do kit: círculo vazio = enviada, cheio com o certo = lida); `HH:MM` da primeira mensagem |
| `cores.origem` | 9 | `modelo` (a paleta `claro`, padrão), `marca` (a bolha do dono e o texto dela na cor da marca, legível, e o destaque com contraste 4 contra o fundo; pede `marca.cor`), `pronta` |
| `cores.pronta` | 9 | com `origem: "pronta"`: `claro`, `escuro`, `vivo` |
| `cores.paleta` | 9 | troca fina por papel (`fundo`, `fundo2`, `celular`, `chat`, `padrao`, `cabecalho`, `cabecalhoTexto`, `bolhaEsquerda`, `textoEsquerda`, `bolhaDireita`, `textoDireita`, `titulo`, `destaque`, `horario`, `lido`, `campo`, `cardFinal`) |
| `receita` | 10 | `vozes-por-fala` ou `texto-e-musica` (a padrão dos vídeos; o `roteiro-falas.json` de cada vídeo pode trocar) |
| `fecho.chamada`, `fecho.palavra`, `fecho.aviso_ficticio` | 12 | card final; só estes 3 campos (outro volta à 12); o aviso diz "Conversa encenada: <contato> e as mensagens são fictícios" |
| `amostra.titulo`, `amostra.mensagem` | 2 | opcional: o título da capa e a primeira mensagem do contato nos stills de conferência |

O `--aplicar` grava `componentes/universo.ts` (as cores resolvidas sobre a paleta base, a tela, a receita, a amostra e os 2 lados) e `personagens/<id>/FICHA.md` de cada lado (sem `Personagem.tsx`: não há personagem desenhado). O roteiro de cada vídeo (`roteiro-falas.json`) é em cenas (`abertura`, `conversa`, `rolagem`, `fecho`), cada uma com `titulo` (a palavra destacada entre asteriscos), `legenda` e `mensagens` (`quem`, `texto`, `tipo` `texto`/`audio`/`imagem`, `imagem`, `duracao`, `reacao`, `horario`, `lido`, `sem_voz`); o `tempos_sem_voz.py` e o `montar_audio.py` conferem e gravam `src/roteiro.json`. As fontes moram no kit (Inter, com `OFL.txt` e `ORIGEM.md`) e os símbolos são desenhados em código.

**Modelo avulso Mesa vista de cima (`mesa`).** Passo a passo visto de cima, sem personagem nem mãos: `tipo: sem-personagem`, receita `narracao-inteira`, sem `temas`; 9 perguntas (`"pular": [5, 6, 7]`, a 8 vira `superficie-e-itens`, a 9 `cores-da-mesa`, a 12 `card-final`). A cor troca destaque, faixa, etiqueta e card final, nunca o material da mesa. Campos:

```json
{
  "mesa": { "superficie": "marmore", "grupo": "beleza" },
  "cores": { "origem": "marca", "pronta": null, "paleta": null },
  "fecho": { "chamada": "Qual passo você sempre pula?", "assinatura": "@perfil", "frase_assinatura": "me segue pra ver o próximo passo", "aviso_ia": true },
  "amostra": { "titulo": "Pele leve em 5 minutos", "frase": "Base só no *centro* do rosto" }
}
```

| Campo | Pergunta | Valores |
|---|---|---|
| `mesa.superficie` | 8 | `madeira` (padrão: tábuas com junta e veio), `marmore` (veios finos), `pano` (pano liso com trama leve) |
| `mesa.grupo` | 8 | grupo principal, que escolhe a peça central e a amostra dos stills: `cozinha` (padrão: tábua redonda com a pizza em camadas), `beleza` (bandeja redonda de penteadeira), `artesanato` (base de corte quadriculada). O roteiro de cada vídeo usa itens dos 3 grupos |
| `amostra.titulo`, `amostra.frase`, `amostra.numero`, `amostra.de` | 8 | opcional: o título do passo, a frase da faixa (a palavra destacada entre asteriscos) e o "PASSO n DE N" dos stills de conferência; sem ela, a amostra do grupo |
| `cores.origem` | 9 | `modelo` (a paleta `ambar`, padrão, com as cores da tela de referência), `marca` (a cor da marca na palavra destacada, legível na faixa, no "PASSO n DE N", legível na etiqueta, e na assinatura do card, todas com contraste 4; pede `marca.cor`) ou `pronta` |
| `cores.pronta` | 9 | com `origem: "pronta"`: `ambar`, `menta`, `vinho` (valem nas 3 superfícies) |
| `cores.paleta` | 9 | troca fina por papel: `destaque`, `faixa`, `faixaTexto`, `etiqueta`, `etiquetaTexto`, `etiquetaPasso`, `cardFinal`, `cardTexto`, `cardDestaque`. Papel do material (tábua, junta, veio, mármore, pano, trama, sombra) é recusado: o material não muda de cor |
| `fecho.assinatura` (obrigatória), `fecho.frase_assinatura`, `fecho.chamada`, `fecho.aviso_ia` | 12 | card final; `aviso_ia: false` só com `voz.caminho: "audio-proprio"`; sem marca, o card mostra só a assinatura |

O `--aplicar` grava `componentes/universo.ts` (a superfície e o grupo, as cores resolvidas sobre a paleta base, o card final e a amostra). A biblioteca tem 22 itens em 3 grupos (cozinha: `massa`, `molho`, `queijo`, `tomate`, `folha`, `ovo`, `farinha`, `tigela`, `colher`, `prato`; beleza: `base`, `pincel`, `batom`, `sombra`, `espelho`, `algodao`; artesanato: `papel`, `tesoura`, `cola`, `linha`, `botao`, `fita`), listados em `base/componentes/opcoes.json` (`grupos`) e desenhados em `base/componentes/itens/`; o `timing.py` recusa item fora da lista. O roteiro de cada vídeo (`roteiro-falas.json`) é em cenas (`abertura`, `passo`, `final`), cada passo com `titulo`, `frase` (a palavra destacada entre asteriscos) e `itens` (`item`, `lugar` `mesa` ou `centro`, `entrada` `cai` ou `aparece`, `quantidade`), um item por batida (`item0`, `item1`, ...). As fontes moram no kit (Inter e JetBrains Mono, com `OFL.txt` e `ORIGEM.md`).

**Modelo avulso Neon retrô (`neon`).** Oferta, lançamento, evento e contagem regressiva, sem personagem: `tipo: sem-personagem`, receita padrão `narracao-inteira` e `"receitas": ["narracao-inteira", "texto-e-musica"]` (só letreiros na batida da música), sem `temas`; 9 perguntas (`"pular": [5, 6, 7]`, a 8 vira `oferta`, a 9 `cores-do-neon`, a 10 `voz-ou-musica`, a 12 `card-final`). O neon troca todas as cores (céu, sol, grade, letreiro, destaque, botão, selo, topo, card final). Campos:

```json
{
  "oferta": { "tipo": "oferta", "o_que": "Jaqueta jeans", "preco": "R$ 89,90", "preco_antigo": "R$ 179,90", "prazo": "só até domingo", "selo": "só hoje", "botao": "chama no direct" },
  "amostra": { "letreiro": ["QUEIMA DE", "ESTOQUE"] },
  "cores": { "origem": "marca", "pronta": null, "paleta": null },
  "receita": "narracao-inteira",
  "fecho": { "chamada": "Corre que a arara está *acabando*", "assinatura": "@perfil", "frase_assinatura": "me segue pra não perder a próxima", "aviso_ia": true }
}
```

| Campo | Pergunta | Valores |
|---|---|---|
| `oferta.o_que` (obrigatório), `oferta.tipo` | 8 | o que está em oferta ou o que se lança; `tipo`: `oferta` (padrão), `lancamento`, `evento`, `contagem` (guia a recomendação e o exemplo dos stills) |
| `oferta.preco`, `oferta.preco_antigo` | 8 | formato brasileiro (`"R$ 1.299,90"`, `"1299,90"`, `"R$ 89"`), até R$ 999.999,99; o preço é obrigatório no tipo `oferta`; o antigo, maior que o preço, sai riscado e o preço conta dele até o valor |
| `oferta.prazo`, `oferta.selo`, `oferta.botao` | 8 | o prazo em texto (ou `null`); o selo curto, até 22 letras (padrão `"só hoje"`; `null` sem selo); o texto do botão em pílula (padrão `"garanta o seu"`) |
| `amostra.letreiro` | 8 | opcional: 1 ou 2 linhas do letreiro dos stills de conferência; sem ela, o da tela de referência |
| `cores.origem` | 9 | `modelo` (a paleta `synth`, padrão, com as cores da tela de referência), `marca` (a cor da marca no letreiro cheio, no destaque e no botão, clareada até contraste 4,5 contra o céu; pede `marca.cor`) ou `pronta` |
| `cores.pronta` | 9 | com `origem: "pronta"`: `synth`, `por-do-sol`, `verde-azul` (cada uma troca todas as cores) |
| `cores.paleta` | 9 | troca fina por papel: `ceu`, `ceu2`, `chao`, `sol1`, `sol2`, `solFaixa`, `grade`, `contorno`, `cheio`, `destaque`, `botao`, `selo`, `topo`, `cardFinal`, `cardTexto` |
| `receita` | 10 | `narracao-inteira` (padrão: uma voz, o letreiro troca na palavra) ou `texto-e-musica` (sem voz: cenas em compassos inteiros e cada peça numa batida da cama do kit, 120 batidas por minuto, ou da música da pessoa, com `bpm` e `primeira_batida` no roteiro) |
| `fecho.assinatura` (obrigatória), `fecho.frase_assinatura`, `fecho.chamada`, `fecho.aviso_ia` | 12 | card final; `aviso_ia: false` só com `voz.caminho: "audio-proprio"` ou na receita só letreiros; sem marca, o card mostra só a assinatura |

O `--aplicar` grava `componentes/universo.ts` (a oferta com o preço já lido, as cores resolvidas sobre a paleta base, a receita, o card final e o letreiro da amostra). O roteiro de cada vídeo (`roteiro-falas.json`) é em cenas (`abertura`, `oferta`, `contagem`, `chamada`, `final`); o letreiro troca na batida `letreiro<i>` de cada cena (`letreiros`, lista de letreiros de 1 ou 2 linhas). Na narração, cada batida é uma palavra do texto da cena; na receita só letreiros, cada cena tem `compassos` e cada batida é o número do tempo dentro da cena. A piscada fica em no máximo 3 quedas de brilho por segundo, abaixo de 10% da tela, e o `_ferramentas/conferir_piscada.py` mede no vídeo. As fontes moram no kit (Inter 800 e 900 e JetBrains Mono 500, com `OFL.txt` e `ORIGEM.md`).

**Modelo pixel (`pixel-16bits`).** Um boneco só (a pergunta 7 é pulada: `personagens` com mais de um vira erro da pergunta 7). A aparência do boneco é pixel, com os códigos de `base/componentes/opcoes.json` do kit, lidos também pelo gerador (`base/gerador/personagem.py`):

| Campo | Valores |
|---|---|
| `pele` | `p1` (mais clara) a `p8` (mais escura) |
| `cabelo` | `curto`, `raspado`, `careca`, `coque`, `crespo`, `comprido`, `cacheado` |
| `corCabelo` | `castanho`, `escuro`, `preto`, `loiro`, `ruivo`, `grisalho`, `branco` ou hex |
| `barba` | `nenhuma`, `cheia`, `curta` |
| `oculos` | `null` ou `preto`, `tartaruga`, `dourado`, `vermelho`, `azul`, `branco` ou hex |
| `roupa` | `grafite`, `preto`, `branco`, `cinza`, `azul`, `verde`, `vinho`, `coral`, `mostarda`, `roxo` ou hex |
| `estampa` | `terminal` (">_"), `simbolo`, `inicial`, `nenhuma` (padrão: `simbolo` ou `inicial` com marca, `terminal` sem marca; sem marca só `terminal` ou `nenhuma`, a não ser que o símbolo ou a inicial venham na aparência) |
| `simbolo`, `inicial`, `corEstampa`, `cilios` | símbolo de `simbolos_marca` (padrão: o da marca), letra ou número (padrão: a inicial da marca), hex (padrão: a cor da marca), `true` ou `false` |

Campos do pixel nas respostas: `topo: { "rotulo": "// plantão pet", "assinatura": "BICHOBOM.VET" }` (pergunta 8; sem eles, `// <nome do universo>` e o nome da marca ou do universo em caixa alta), `fecho: { "perfil": "@perfil" (obrigatório), "frase": "...", "rotulo": "// ..." }` (pergunta 12) e `cores.origem: "marca"` (o destaque do vídeo vira a cor da marca). O `--aplicar` grava `componentes/universo.ts`, `aparencia.json` (a aparência resolvida) e, no passo `depois`, os 72 sprites em `public/px/` e a folha de opções em `public/opcoes.png`.

## Aplicador do kit

O `novo_universo.mjs --aplicar` confere e grava a parte comum (universo, marca, fecho, cores, proibições e o brandbook reaplicável) e passa o resto ao `aplicador.mjs` da raiz do kit de origem, que confere o que é do modelo e gera os arquivos dele. O kit vem do `.modelo.json` do universo, procurado em `<estúdio>/modelos/` e nos modelos da skill; modelo local sem aplicador usa o do modelo em que foi baseado (`baseado_em.modelo`). Contrato:

| Função | Faz |
|---|---|
| `validarPersonagem(p, onde, ctx, erros)` | confere os campos do personagem que são do modelo (aparência, corpo...) |
| `validar(r, ctx, erros)` | confere o resto que é do modelo (cenários, acompanhantes, antes e agora...) |
| `perguntaDoErro(erro, r)` | número da pergunta do erro, ou `undefined` para a regra comum |
| `gerar(r, ctx)` | `{ arquivos: [[caminho, conteúdo], ...], valores: { lacuna: texto } }` |
| `depois({ dir, r, ctx })` | opcional: roda depois que os arquivos de `gerar` foram gravados, na pasta do universo, e devolve a lista do que gerou (o pixel gera aqui os sprites do boneco por `python3 gerador/sprites.py`). Erro lançado sai 1 com a mensagem |

`ctx` traz `opcoes` (o `componentes/opcoes.json` do universo), `ids` (ids já usados), `util` (conferências e formatação) e `comum` (as lacunas comuns do brandbook: cores, marca, cenários, fecho, proibições). O `conferir_neutro.mjs` num universo também usa os `termos_proibidos` do kit de origem.

## Reaplicar respostas

O universo guarda o brandbook do kit, ainda com as lacunas, em `.brandbook-modelo.md`, e os valores da última aplicação em `.brandbook-valores.json`. A cada `--aplicar`, o brandbook atual é lido contra esse modelo: o texto fixo e os valores antigos servem de âncora, e o que está no lugar de cada `<!-- ESCREVER: ... -->` é o texto escrito à mão, que volta igual no brandbook novo. Texto escrito que ainda cita um valor que mudou gera aviso. Os dois arquivos ocultos não se editam à mão.

## Scripts

| Comando | Faz | Falha (código 1) quando |
|---|---|---|
| `node scripts/conferir_kit.mjs <id ou caminho>` | confere arquivos e `modelo.json` | arquivo ou campo faltando, `tipo` ou `receita` fora da lista |
| `node scripts/conferir_kit.mjs --todos [pasta]` | confere todos os kits e compara as versões das dependências | algum kit com problema ou versões diferentes entre kits |
| `node scripts/novo_universo.mjs <modelo> <estudio> <pasta> [--forcar]` | copia `base/` e `RECEITA.md` para `<estudio>/animacao/<pasta>/` e guarda o brandbook com lacunas em `.brandbook-modelo.md`; de modelo local, copia também `teste/respostas.json` como `respostas.json` | pasta já existe (sem `--forcar`), modelo não achado |
| `node scripts/novo_universo.mjs --aplicar <universo>` | gera `componentes/universo.ts`, `personagens/<id>/Personagem.tsx` e `FICHA.md`, `personagens/index.ts`; refaz o brandbook de `.brandbook-modelo.md` com `{{chave}}` preenchidas e o texto já escrito nas lacunas `ESCREVER` mantido; lista os `ESCREVER:` que faltam. Reaplicar com o mesmo `respostas.json` dá o mesmo resultado | resposta obrigatória faltando ou código fora da lista (diz qual e o número da pergunta); brandbook editado fora das lacunas (não troca o arquivo, grava `BRANDBOOK-ANIMACAO.novo.md`) |
| `node scripts/novo_universo.mjs --conferir <universo>` | confere o brandbook | sobrou `{{` ou `ESCREVER:` |
| `node scripts/conferir_neutro.mjs <pasta> [--termos a,b]` | procura termo proibido por palavra inteira, sem diferença de caixa, fora de `vitrine/` e `videos/` | termo achado (imprime `arquivo:linha:termo`) |
| `bash scripts/preparar_motor.sh <universo>` | deixa `node_modules` pronto (já existe; `VIDEO_ANIMADO_MOTOR`; motor conhecido; `npm install`) | sem Node |
| `node scripts/gerar_vitrine.mjs <id ou caminho> [--estudio P]` | grava `vitrine/folha.jpg`, `elenco.jpg` e `trecho.mp4` a partir de um universo temporário (em `P/animacao/`, apagado no fim, inclusive na falha); com `--estudio` acha também o modelo local | algum passo falhou ou o trecho passou de 2 MB |
| `node scripts/catalogo.mjs [--estudio P] [--saida F] [--png F]` | gera `P/modelos/catalogo.html` (modelos da skill + `P/modelos/*` + "Criar um estilo novo"), imprime a lista numerada e, com `--png`, captura pelo Chrome headless | Chrome não achado ou captura falhou (só com `--png`); modelo ruim nunca: vira aviso no cartão |
| `node scripts/salvar_modelo.mjs <universo> <estudio> <id>` | salva o universo como modelo local em `<estudio>/modelos/<id>/` (base sem `videos/`, `imagens/`, `node_modules` nem áudio; `origem: "local"`; vitrine a partir de `imagens/` e `videos/`). Detalhes em `references/modelo-local.md` | id já existe no estúdio ou nos modelos da skill |
| `node scripts/conferir_parte_b.mjs <SKILL.md antiga> <SKILL.md nova>` | confere que cada linha da Parte B, das Armadilhas e das duas passagens do passo 0 que levam à Parte B continua igual e na mesma ordem (linha nova acrescentada é permitida) | linha antiga sumiu, mudou ou trocou de ordem (lista cada uma) |
| `node scripts/conferir_portabilidade.mjs <pasta>` | procura caminho de máquina, zsh, bash 4 e `sips` sem alternativa | achou algum (documentação em `.md` e `.html` só gera aviso) |

## Motor (`node_modules`)

`preparar_motor.sh` nunca roda `npm install` dentro de um `node_modules` feito por `cp -al`: os arquivos são os mesmos do motor de origem. Depois do `cp -al` ele apaga a pasta `.cache` da cópia (só desfaz o link), para o Remotion criar o cache dele em arquivos novos. O `node_modules` feito por cópia leva o arquivo `.motor-por-link` dizendo de onde veio.

`VIDEO_ANIMADO_MOTOR` pode apontar para a pasta do motor ou para o próprio `node_modules` dele.
