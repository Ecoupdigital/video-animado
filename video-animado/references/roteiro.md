# Roteiro, ganchos e entregas extras (Parte B, passos 2, 7 e 8)

## Ganchos (antes do roteiro)

Escreva **3 opções de gancho** (a frase dos primeiros 3 segundos), cada uma de um tipo diferente, por exemplo: pergunta que incomoda, afirmação contra a corrente, número ou fato concreto, cena do conflito do personagem. Mostre as 3 com AskUserQuestion, a recomendada primeiro, e só depois escreva o roteiro com o gancho escolhido. Respeite a forma de abrir e fechar que está na narrativa do brandbook.

## Lista de afirmações para conferir

Depois do roteiro, liste em separado **toda afirmação de fato** que ele faz (números, datas, nomes de ferramentas, o que um produto faz). Marque as que a pessoa precisa confirmar. Nunca invente estatística: se não há fonte, tire a afirmação ou deixe em termos que a pessoa sustente.

## Frases proibidas no roteiro

Nada de: "no mundo de hoje", "é importante ressaltar", "vamos mergulhar", "revolucionário", "game changer", "desbloqueie", "descubra o segredo", "você não vai acreditar", abertura com "Você sabia que". Evite listas de três adjetivos e frase de efeito que não diz nada. Sem travessão no texto da narração e da legenda: use vírgula ou ponto. Se o brandbook tiver outras proibições, elas valem também.

## Entregas extras (passo 7)

Junto do mp4, entregue na mesma pasta de `~/Downloads/`:
- **Capa:** um frame parado da cena mais forte (`npx remotion still`), em `AAAA-MM-DD_<slug>_capa.png`.
- **Legenda do post:** 3 a 5 linhas, na voz do universo, com a chamada do final do vídeo. Salve em `AAAA-MM-DD_<slug>_legenda.md`. Sem travessão.
- **Outros formatos:** pergunte se quer também 1:1 (1080x1080) ou 16:9 (1920x1080). Se sim, o projeto precisa de uma composição por formato reaproveitando as mesmas cenas, com o layout ajustado.

## Ajuste por tempo (passo 8)

A pessoa pode pedir pelo tempo: "muda o título em 0:12", "a cena dos 20 segundos está lenta". Converta o tempo em frame (segundos x 30), ache a cena no projeto e mexa só nela. Depois renderize só aquele trecho (`--frames=ini-fim`) para mostrar antes de renderizar o vídeo todo. Se a mudança afeta a duração da narração, avise antes e peça aprovação, porque isso gasta crédito de voz.
