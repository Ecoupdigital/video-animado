import type { CenaDados, Valor } from './roteiro';
import { AMOSTRA } from './universo';

// Dados e história neutros dos stills de conferência e da folha de cada tema: uma cena de cada tipo, com um
// negócio de bairro genérico e nenhum nome real (marca, pessoa, cidade). Com "amostra" nas respostas, o título
// da abertura, o número grande, o primeiro marco, o primeiro chip e a primeira manchete vêm de lá
// (componentes/universo.ts, AMOSTRA).

const titulo = AMOSTRA?.titulo ?? 'O melhor *trimestre* da loja';
const valor: Valor = AMOSTRA?.valor ?? { numero: 38, prefixo: '+', sufixo: '%' };
const marco = AMOSTRA?.marco ?? 'Começou numa garagem';
const chip = AMOSTRA?.chip ?? '12 min';
const manchete = AMOSTRA?.manchete ?? 'Loja vende 3 mil peças num dia';

export const EXEMPLO: CenaDados[] = [
  { tipo: 'abertura', titulo, valor, subtitulo: 'o resultado, mês a mês' },
  {
    tipo: 'colunas',
    titulo: 'Faturamento do *trimestre*',
    valor,
    colunas: [
      { rotulo: 'JAN', valor: 120 },
      { rotulo: 'FEV', valor: 200 },
      { rotulo: 'MAR', valor: 300 },
    ],
    legenda: 'Março puxou o trimestre inteiro.',
  },
  {
    tipo: 'marcos',
    titulo: 'Como a marca *chegou* aqui',
    marcos: [
      { ano: '2019', texto: marco },
      { ano: '2021', texto: 'Primeira loja de rua' },
      { ano: '2023', texto: '100 mil clientes' },
      { ano: '2026', texto: 'Hoje: 4 lojas' },
    ],
    legenda: 'Sete anos, uma receita só.',
  },
  {
    tipo: 'rota',
    titulo: '6 km em *18 min*',
    trechos: [{ chip }, { chip: '+4 min' }, {}],
    chegada: 'Loja nova',
    legenda: 'Saída às 18h, chegou no horário.',
  },
  {
    tipo: 'recortes',
    titulo: '1987',
    sub: 'O ANO EM QUE TUDO MUDOU',
    recortes: [{ manchete }, { manchete: 'Fila dobra o quarteirão' }, { manchete: 'Dona do balcão vira notícia', foto: false }],
    circulo: { palavra: 'eu!', recorte: 1 },
  },
  { tipo: 'final', pergunta: 'E a sua *história*, começou como?', fontes: [] },
];
