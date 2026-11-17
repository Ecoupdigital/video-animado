import type { Roteiro } from './roteiro';
import { AMOSTRA, PESSOAS } from './universo';

// Conversa neutra dos stills de conferência (_preview): serve para qualquer assunto, com os 2 lados do universo.
// A resposta "amostra" (pergunta 2, opcional) troca o título da capa e a primeira mensagem do contato.

const contato = Object.entries(PESSOAS).find(([, p]) => p.lado === 'esquerda')?.[0] ?? Object.keys(PESSOAS)[0];
const dono = Object.entries(PESSOAS).find(([, p]) => p.lado === 'direita')?.[0] ?? Object.keys(PESSOAS)[1];

export const EXEMPLO: Roteiro = {
  receita: 'texto-e-musica',
  cenas: [
    {
      tipo: 'abertura',
      titulo: AMOSTRA.titulo ?? 'O pedido que chegou *na hora*',
      legenda: 'Fim de tarde, véspera de feriado',
      mensagens: [
        { quem: contato, texto: AMOSTRA.mensagem ?? 'Oi! Ainda dá tempo de fazer um pedido para amanhã?' },
        { quem: dono, texto: 'Dá sim! Me conta o que você precisa.' },
      ],
    },
    {
      tipo: 'conversa',
      legenda: 'O pedido',
      mensagens: [
        { quem: contato, texto: 'O de sempre, só que o dobro.' },
        { quem: dono, texto: 'Anotado! Para que horas?' },
        { quem: contato, texto: 'De manhã, se der.', reacao: 'coracao' },
        { quem: dono, tipo: 'imagem', imagem: 'calendario', texto: 'Amanhã às 10h fica bom?' },
        { quem: contato, tipo: 'audio', duracao: '0:07' },
        { quem: dono, texto: 'Confirmado. Até amanhã!' },
      ],
    },
    {
      tipo: 'rolagem',
      legenda: 'Tudo combinado',
      mensagens: [
        { quem: contato, texto: 'Vocês salvaram o meu dia, de verdade.' },
        { quem: dono, tipo: 'imagem', imagem: 'recibo', texto: 'Seu pedido, anotado.' },
        { quem: contato, texto: 'Perfeito, obrigada!', reacao: 'risada' },
        { quem: dono, texto: 'Nós que agradecemos.' },
      ],
    },
    { tipo: 'fecho' },
  ],
};
