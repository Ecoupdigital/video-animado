import type { CenaDados } from './roteiro';
import { CASO } from './universo';

// Caso neutro dos stills de conferência e da folha de cada tema: uma cena de cada tipo, com pessoas e
// empresas genéricas (nenhum nome real). Com "caso" nas respostas, o título do gancho e a pessoa citada
// vêm de lá (componentes/universo.ts, CASO).

const pessoa = CASO ? { nome: CASO.nome, papel: CASO.papel } : { nome: 'Empresa Exemplo', papel: 'fornecedora da obra' };
const titulo = CASO ? CASO.titulo : 'um contrato que *dobrou* de preço';

export const EXEMPLO: CenaDados[] = [
  {
    tipo: 'gancho',
    titulo,
    rotulo: 'CUSTO FINAL DO CONTRATO',
    valor: { numero: 480, prefixo: 'R$ ', sufixo: ' mil', legenda: 'o dobro do orçamento aprovado' },
    linha: '> abrindo arquivo: contrato_obra.pdf',
    pessoa,
    carimbo: 'suspeita de sobrepreço',
  },
  {
    tipo: 'ficha',
    titulo: 'quem é a *empresa*',
    pessoa: { ...pessoa, etiqueta: 'CITADA 01' },
    campos: [
      { rotulo: 'ABERTA EM', valor: '2019' },
      { rotulo: 'CONTRATOS', valor: '3 no ano' },
    ],
    marcos: [
      { data: '10/03', texto: 'proposta' },
      { data: '02/05', texto: 'aditivo' },
      { data: '20/06', texto: 'denúncia', alerta: true },
    ],
    carimbo: 'contrato sem concorrência',
  },
  {
    tipo: 'ligacao',
    titulo: 'a *ligação*',
    de: { nome: 'Pessoa A', papel: 'quem assinou' },
    para: pessoa,
    cards: [
      { rotulo: 'SÓCIA DE', valor: 'Empresa B', sub: 'mesmo endereço' },
      { rotulo: 'RECEBEU', valor: 'R$ 480 mil', sub: 'em 4 parcelas' },
    ],
    selo: 'a empresa nega irregularidade',
    carimbo: 'suspeita de conflito',
  },
  {
    tipo: 'rota',
    titulo: 'pra onde foi o *dinheiro*?',
    nos: [
      { nome: 'Caixa', sub: 'conta da obra' },
      { nome: 'Empresa B', sub: 'intermediária' },
      { nome: 'Empresa C', sub: 'destino suspeito' },
    ],
    bloqueio: 'pagamento suspenso',
    card: { titulo: 'Promotoria local', sub: 'APURAÇÃO EM ANDAMENTO' },
  },
  { tipo: 'tombo', titulo: '*resultado:*', rotulo: '// FUNDO DE RESERVA', valor: { numero: -62, sufixo: '%', legenda: 'saldo do fundo desde o contrato' } },
  {
    tipo: 'linha',
    titulo: 'a *linha do tempo*',
    marcos: [
      { data: '12/04', texto: 'assembleia aprova o orçamento' },
      { data: '02/05', texto: 'aditivo dobra o valor' },
      { data: '20/06', texto: 'moradores fazem a denúncia', alerta: true },
      { data: '28/06', texto: 'assembleia extra marcada' },
    ],
  },
  {
    tipo: 'fonte',
    titulo: 'de onde vem *isso*',
    fontes: [
      { veiculo: 'Ata da assembleia', data: '12/04', texto: 'orçamento aprovado' },
      { veiculo: 'Jornal do Bairro', data: '21/06', texto: 'reportagem sobre o aditivo' },
    ],
  },
  { tipo: 'final', pergunta: 'e aí, você *aprovaria*?', fontes: ['ata da assembleia (12/04)', 'Jornal do Bairro (21/06)'], cita_pessoas: true },
];
