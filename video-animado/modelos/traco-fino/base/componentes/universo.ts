// Arquivo padrão do kit, antes de aplicar as respostas.
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado do respostas.json.
// Os componentes do kit leem daqui o nome, a marca, o fecho, os rótulos do antes e do agora, a paleta,
// o elenco, os cenários e os lugares.
import type { AparenciaEntrada } from './presets';
import type { Paleta } from './cores';

export const UNIVERSO = { nome: 'Universo novo', pasta: null, assunto: '', publico: '', tom: '' } as const;

/** null = nenhuma marca: celular sem logo e fecho de seguir o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null; palavraFecho: string | null } | null = null;

/** Fecho do vídeo: chamada, palavra do "Comenta" e o aviso de personagem fictícia (ligado se não vier false). */
export const FECHO: { chamada: string | null; palavra: string | null; avisoFicticio: boolean } = { chamada: null, palavra: null, avisoFicticio: true };

/** Antes e agora: a virada da série e os rótulos dos selos (sem rótulo nas respostas, ANTES e AGORA). */
export const TEMPO: { virada: string | null; rotuloAntes: string; rotuloAgora: string } = { virada: null, rotuloAntes: 'ANTES', rotuloAgora: 'AGORA' };

/** Papéis da paleta trocados pelas respostas (o resto vem do preset do modelo). */
export const PALETA: Partial<Paleta> = {};

export type PessoaDoElenco = {
  nome: string;
  papel: 'protagonista' | 'apoio';
  corpo: 'adulto' | 'crianca';
  semente: number;
  aparencia: AparenciaEntrada;
  /** O que muda no antes (só os campos trocados), ou null. */
  antes: AparenciaEntrada | null;
};
export const PESSOAS: Record<string, PessoaDoElenco> = {};

/** Cenários escolhidos na entrevista. */
export const CENARIOS: { apartamento: string[]; escritorio: boolean; escola: boolean; salaEspera: boolean } = { apartamento: ['sala'], escritorio: false, escola: false, salaEspera: false };

export const LUGARES: { nomeEscola: string | null; placaSalaEspera: string | null } = { nomeEscola: null, placaSalaEspera: null };
