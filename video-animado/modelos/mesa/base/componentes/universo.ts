// Universo padrão do kit, antes do --aplicar (o kit compila e o _preview mostra a mesa neutra).
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado das respostas: não edite à mão no universo.
import type { IdGrupo, IdPronta, IdSuperficie, Paleta } from './tema';

export const UNIVERSO = { nome: 'Mesa vista de cima', pasta: null, assunto: 'a definir', publico: 'a definir', tom: 'a definir' } as const;

/** null = nenhuma marca: o card final mostra só a assinatura. */
export const MARCA: { nome: string; cor: string | null } | null = null;

/** Superfície da mesa e grupo principal (pergunta 8): o grupo escolhe a peça central e a amostra dos stills. */
export const MESA: { superficie: IdSuperficie; grupo: IdGrupo } = { superficie: 'madeira', grupo: 'cozinha' };

/** Cores (pergunta 9), já resolvidas: a paleta base (ambar, menta, vinho) e os papéis trocados. O material da mesa nunca muda. */
export const CORES: { origem: 'modelo' | 'marca' | 'pronta'; pronta: IdPronta | null; base: IdPronta; cores: Partial<Paleta> } = { origem: 'modelo', pronta: null, base: 'ambar', cores: {} };

/** Card final: chamada, assinatura e o aviso de narração por IA (ligado, a não ser com áudio próprio). */
export const FECHO: { chamada: string | null; assinatura: string; fraseAssinatura: string | null; avisoIA: boolean } = {
  chamada: null,
  assinatura: '@seu.perfil',
  fraseAssinatura: 'me segue pra ver o próximo passo',
  avisoIA: true,
};

/** Textos dos stills de conferência (null = os do grupo, em opcoes.json): título do passo, frase da faixa e "PASSO n DE N". */
export const AMOSTRA: { titulo: string | null; frase: string | null; numero: number | null; de: number | null } | null = null;
