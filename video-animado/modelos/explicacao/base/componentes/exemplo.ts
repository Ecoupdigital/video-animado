import type { CenaDados } from './roteiro';
import { AMOSTRA } from './universo';

// Explicação neutra dos stills de conferência e da folha de cada tema: uma cena de cada tipo, com um assunto
// de dia a dia (montar uma reserva) e nenhum nome real. Com "amostra" nas respostas, o título da abertura e o
// primeiro item (primeiro passo e primeiro cartão) vêm de lá (componentes/universo.ts, AMOSTRA).

const titulo = AMOSTRA?.titulo ?? 'Como montar a sua *reserva*';
const item = AMOSTRA?.item ?? 'Anotar o gasto do mês';

export const EXEMPLO: CenaDados[] = [
  { tipo: 'abertura', titulo, subtitulo: 'em 3 passos, sem planilha difícil', icone: 'carteira' },
  {
    tipo: 'passos',
    titulo: 'O *caminho*',
    passos: [
      { texto: item, icone: 'lista' },
      { texto: 'Vezes 6 meses', icone: 'calendario' },
      { texto: '= Sua reserva', icone: 'moeda' },
    ],
    legenda: 'Comece pelo gasto, não pelo salário.',
  },
  { tipo: 'conta', titulo: 'Fazendo a *conta*', linhas: ['Gasto: R$ 2.000', '× 6 meses', '= *?*'], resultado: 'R$ 12.000', legenda: 'Um pouco por mês já conta.' },
  {
    tipo: 'colunas',
    titulo: 'A *semana*',
    colunas: ['A FAZER', 'FAZENDO', 'FEITO'],
    cartoes: [
      { texto: item, coluna: 2 },
      { texto: 'Abrir conta separada', coluna: 1, vai: 2 },
      { texto: 'Guardar 10%', coluna: 0, vai: 1 },
      { texto: 'Rever assinaturas', coluna: 0 },
    ],
    legenda: 'Cada tarefa anda quando fica pronta.',
  },
  {
    tipo: 'tela',
    titulo: 'Clique em *Criar*',
    tela: { secao: 'Metas', botao: 'Criar', menu: ['Início', 'Metas', 'Contas', 'Ajustes'], itens: ['Viagem', 'Carro', 'Curso'], novo: 'Reserva' },
    legenda: 'e dê um nome para a meta.',
  },
  { tipo: 'final', pergunta: 'E você, já *começou*?', fontes: [] },
];
