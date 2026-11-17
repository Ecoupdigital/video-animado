// Universo padrão do kit, antes do --aplicar (o kit compila e o _preview mostra os dados neutros).
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado das respostas: não edite à mão no universo.
import type { Valor } from './roteiro';
import type { IdTema, Paleta } from './tema';

export const UNIVERSO = { nome: 'Dados e história', pasta: null, assunto: 'a definir', publico: 'a definir', tom: 'a definir' } as const;

/** null = nenhuma marca: o card final mostra só a assinatura e o destaque do tema. */
export const MARCA: { nome: string; cor: string | null } | null = null;

/** Tema escolhido (pergunta 8) e as cores trocadas (pergunta 9), já resolvidas: só os papéis que o tema troca. */
export const TEMA: { id: IdTema; origem: 'tema' | 'marca' | 'pronta'; pronta: string | null; cores: Partial<Paleta> } = { id: 'isometrico', origem: 'tema', pronta: null, cores: {} };

/** Rótulo do topo de todo vídeo (o roteiro de cada vídeo pode trocar). */
export const DADOS: { rotulo: string } = { rotulo: 'DADOS E HISTÓRIA' };

/** Card final: chamada, assinatura e o aviso de narração por IA (ligado, a não ser com áudio próprio). */
export const FECHO: { chamada: string | null; assinatura: string; fraseAssinatura: string | null; avisoIA: boolean } = {
  chamada: null,
  assinatura: '@seu.perfil',
  fraseAssinatura: 'me segue pra ver o próximo capítulo',
  avisoIA: true,
};

/** Amostra dos stills de conferência (null = os dados neutros do kit, em componentes/exemplo.ts). */
export const AMOSTRA: { titulo: string | null; marco: string | null; chip: string | null; manchete: string | null; valor: Valor | null } | null = null;
