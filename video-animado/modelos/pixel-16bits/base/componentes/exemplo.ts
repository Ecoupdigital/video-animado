import type { Roteiro } from './roteiro';
import { BONECO, MARCA, UNIVERSO } from './universo';

// Roteiro de exemplo dos stills de conferência (um card de cada molde), com o nome do universo e do boneco.
// Texto neutro: serve para ver o desenho, não é notícia de verdade.

export const EXEMPLO: Roteiro = {
  secoes: [
    {
      texto: 'Saiu uma regra nova e ela muda três coisas na sua semana.',
      titulo: [UNIVERSO.nome, 'explica a regra nova'],
      destaque: ['regra', 'nova'],
      gesto: 'duas',
      card: {
        molde: 'lista',
        rotulo: '// o que muda',
        titulo: 'Três mudanças',
        itens: [
          { texto: 'Novo prazo para pedir', nota: '30 dias', em: 'regra' },
          { texto: 'Quem precisa fazer', nota: 'todos', em: 'muda' },
          { texto: 'Onde conferir', nota: 'site oficial', em: 'semana' },
        ],
      },
    },
    {
      texto: 'A pergunta que mais chegou foi se isso vale pra todo mundo, e vale sim.',
      titulo: ['Vale pra', 'todo mundo?'],
      destaque: ['todo', 'mundo?'],
      gesto: 'uma',
      card: {
        molde: 'conversa',
        rotulo: '// pergunta da semana',
        mensagens: [
          { quem: 'Seguidora', texto: 'Isso vale pra mim também?', em: 'pergunta' },
          { quem: BONECO.nome, texto: 'Vale sim, a partir de hoje.', em: 'vale', lado: 'dir' },
        ],
      },
    },
    {
      texto: 'Mas atenção: por enquanto é só um teste, em duas cidades.',
      titulo: ['Mas por enquanto', 'é só um teste'],
      destaque: ['teste'],
      gesto: 'ombros',
      card: {
        molde: 'selo',
        rotulo: '// disponibilidade',
        titulo: 'Regra nova',
        selo: 'EM TESTE',
        em: 'teste,',
        icone: MARCA?.simbolo ?? 'estrela',
        etiquetas: [
          { texto: 'Cidade A', em: 'duas' },
          { texto: 'Cidade B', em: 'cidades.' },
        ],
      },
    },
    {
      texto: 'Antes era uma vez por ano, agora são duas, e o custo continua zero.',
      titulo: ['De uma pra duas', 'vezes por ano'],
      destaque: ['duas'],
      gesto: 'duas',
      card: {
        molde: 'blocos',
        rotulo: '// em números',
        blocos: [
          { rotulo: 'antes', valor: '1x por ano', em: 'antes' },
          { rotulo: 'agora', valor: '2x por ano', em: 'agora' },
          { rotulo: 'custo', valor: 'R$ 0', em: 'custo' },
          { rotulo: 'prazo', valor: '30 dias', em: 'zero.' },
        ],
      },
    },
  ],
  final: { duracao: 3 },
};
