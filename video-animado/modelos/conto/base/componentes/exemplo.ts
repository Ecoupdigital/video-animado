import { CENARIOS, NARRADOR, PESSOAS, UNIVERSO } from './universo';

// Textos neutros dos stills de conferência (cena-<tipo>-<tema>, vista-<tipo>-<tema>, tema-<id>), montados com o
// nome do universo, os nomes do elenco e o nome do lugar das respostas: nada de marca nem de pessoa fixos aqui.
// Nome comprido nas respostas aparece aqui também, para a conferência pegar o texto que não cabe.

const lista = Object.values(PESSOAS);
const prot = (lista.find((p) => p.papel === 'protagonista') ?? lista[0])?.nome ?? 'você';
const apoio = lista.find((p) => p.papel === 'apoio')?.nome ?? prot;
const lugar = CENARIOS.lugar;

export const EXEMPLO = {
  titulo: UNIVERSO.nome,
  subtitulo: lugar ? `um dia comum em ${lugar}` : 'um dia comum que virou história',
  selo: `ep. 1 · ${UNIVERSO.nome}`,
  falas: {
    protagonista: `${apoio}, você viu o que aconteceu hoje?`,
    apoio: `Vi! Ninguém acreditou, ${prot}.`,
    narrador: `E foi assim que tudo começou${lugar ? `, em ${lugar}` : ''}.`,
  },
  /** linha de situação embaixo, nas formas (a legenda do diálogo quando a fala vai no balão) */
  situacao: `O primeiro dia${lugar ? ` em ${lugar}` : ''}`,
  /** índice da palavra acesa na legenda dos stills */
  ativa: 2,
  narrador: NARRADOR.ligado,
} as const;

/** As palavras de um texto em blocos de até 6, como a legenda mostra (o still usa o primeiro). */
export const blocoDe = (texto: string, max = 6) => texto.split(/\s+/).filter(Boolean).slice(0, max);
