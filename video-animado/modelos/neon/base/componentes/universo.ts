// Universo padrão do kit, antes do --aplicar (o kit compila e o _preview mostra o neon com a oferta da tela de referência).
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado das respostas: não edite à mão no universo.
import type { IdPronta, Paleta } from './tema';

export const UNIVERSO = { nome: 'Neon retrô', pasta: null, assunto: 'a definir', publico: 'a definir', tom: 'a definir' } as const;

/** null = nenhuma marca: o card final mostra só a assinatura. */
export const MARCA: { nome: string; cor: string | null } | null = null;

/** Preço já lido da resposta: o texto como sai na tela (formato brasileiro) e o valor em centavos (para contar). */
export type Preco = { texto: string; centavos: number; comCentavos: boolean };

/** A oferta (pergunta 8): o que, preço, preço antigo, prazo, selo e texto do botão; o tipo de vídeo guia o exemplo. */
export const OFERTA: { tipo: 'oferta' | 'lancamento' | 'evento' | 'contagem'; oQue: string; preco: Preco | null; precoAntigo: Preco | null; prazo: string | null; selo: string | null; botao: string } = {
  tipo: 'oferta',
  oQue: 'Combo da meia-noite',
  preco: { texto: 'R$ 39,90', centavos: 3990, comCentavos: true },
  precoAntigo: { texto: 'R$ 79,80', centavos: 7980, comCentavos: true },
  prazo: 'só até a meia-noite',
  selo: 'só hoje',
  botao: '2 por 1 · só hoje',
};

/** Cores (pergunta 9), já resolvidas: a paleta base (synth, por-do-sol, verde-azul) e os papéis trocados. */
export const CORES: { origem: 'modelo' | 'marca' | 'pronta'; pronta: IdPronta | null; base: IdPronta; cores: Partial<Paleta> } = { origem: 'modelo', pronta: null, base: 'synth', cores: {} };

/** Receita padrão dos vídeos (pergunta 10): narração inteira ou só letreiros na batida da música. */
export const RECEITA: 'narracao-inteira' | 'texto-e-musica' = 'narracao-inteira';

/** Card final: chamada, assinatura e o aviso de narração por IA (só na receita de narração, e ligado a não ser com áudio próprio). */
export const FECHO: { chamada: string | null; assinatura: string; fraseAssinatura: string | null; avisoIA: boolean } = {
  chamada: null,
  assinatura: '@seu.perfil',
  fraseAssinatura: 'me segue pra não perder a próxima',
  avisoIA: true,
};

/** Letreiro dos stills de conferência (null = o do opcoes.json, o da tela de referência): 1 ou 2 linhas. */
export const AMOSTRA: { letreiro: string[] } | null = null;
