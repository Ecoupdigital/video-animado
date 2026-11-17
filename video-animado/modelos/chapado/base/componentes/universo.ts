// Arquivo padrão do kit, antes de aplicar as respostas.
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado do respostas.json.
// Os componentes do kit leem daqui o nome, a marca, o fecho, a paleta, o elenco, os cenários e os lugares.
import type { AparenciaEntrada, TomPele } from './presets';
import type { Paleta } from './cores';

export const UNIVERSO = { nome: 'Universo novo', pasta: null, assunto: '', publico: '', tom: '' } as const;

/** null = nenhuma marca: celular sem logo e fecho de seguir o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null; palavraFecho: string | null } | null = null;

/** Fecho do vídeo: chamada, palavra do "Comenta" e o aviso de personagem fictícia (ligado se não vier false). */
export const FECHO: { chamada: string | null; palavra: string | null; avisoFicticio: boolean } = { chamada: null, palavra: null, avisoFicticio: true };

/** Papéis da paleta trocados pelas respostas (o resto vem do preset do modelo). */
export const PALETA: Partial<Paleta> = {};

export type PessoaDoElenco = { nome: string; papel: 'protagonista' | 'apoio'; semente: number; barriga: number; aparencia: AparenciaEntrada };
export const PESSOAS: Record<string, PessoaDoElenco> = {};

export type AcompanhanteDoElenco =
  | { tipo: 'cachorro'; nome: string; cor: string }
  | { tipo: 'bebe'; nome: string; pele: TomPele };
export const ACOMPANHANTES: Record<string, AcompanhanteDoElenco> = {};

/** Cenários escolhidos na entrevista (cômodos da casa, sala de espera, rua). */
export const CENARIOS: { casa: string[]; salaEspera: boolean; rua: boolean } = { casa: ['sala', 'cozinha'], salaEspera: false, rua: false };

export const LUGARES: { placaSalaEspera: string | null; lojaRua: string | null } = { placaSalaEspera: null, lojaRua: null };
