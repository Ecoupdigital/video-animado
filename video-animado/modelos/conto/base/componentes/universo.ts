// Universo padrão do kit, antes do --aplicar (o kit compila e o _preview mostra dois personagens neutros).
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado das respostas: não edite à mão no universo.
import type { AparenciaEntrada } from './aparencia';
import type { IdTema, Paleta } from './tema';

export const UNIVERSO = { nome: 'Conto', pasta: null, assunto: 'a definir', publico: 'a definir', tom: 'a definir' } as const;

/** null = nenhuma marca: fecho de seguir o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null; palavraFecho: string | null } | null = null;

/** Fecho do vídeo: chamada, palavra do "Comenta" e o aviso de personagem fictícia (ligado se não vier false). */
export const FECHO: { chamada: string | null; palavra: string | null; avisoFicticio: boolean } = { chamada: null, palavra: null, avisoFicticio: true };

/** Tema escolhido (pergunta 8) e as cores trocadas (pergunta 9), já resolvidas: só os papéis que o tema troca. */
export const TEMA: { id: IdTema; origem: 'tema' | 'marca' | 'pronta'; pronta: string | null; cores: Partial<Paleta> } = { id: 'formas', origem: 'tema', pronta: null, cores: {} };

/** Cenários escolhidos (pergunta 8) e o nome do lugar, que vai na placa. */
export const CENARIOS: { lista: string[]; lugar: string | null } = { lista: ['rua', 'sala'], lugar: null };

/** Narrador (pergunta 10): falas com quem "narrador" não abrem a boca de ninguém. */
export const NARRADOR: { ligado: boolean; nome: string } = { ligado: false, nome: 'Narrador' };

export type PessoaDoElenco = { nome: string; papel: 'protagonista' | 'apoio'; semente: number; aparencia: AparenciaEntrada };
export const PESSOAS: Record<string, PessoaDoElenco> = {
  ana: { nome: 'Ana', papel: 'protagonista', semente: 1, aparencia: { preset: 'coque-oculos' } },
  davi: { nome: 'Davi', papel: 'apoio', semente: 2, aparencia: { preset: 'bone-camiseta' } },
};
