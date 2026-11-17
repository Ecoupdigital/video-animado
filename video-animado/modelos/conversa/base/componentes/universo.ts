// Universo padrão do kit, antes do --aplicar (o kit compila e o _preview mostra uma conversa neutra).
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado das respostas: não edite à mão no universo.
import type { Paleta } from './tema';

export const UNIVERSO = { nome: 'Conversa', pasta: null, assunto: 'a definir', publico: 'a definir', tom: 'a definir' } as const;

/** null = nenhuma marca: card final de seguir o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null; palavraFecho: string | null } | null = null;

/** Card final: chamada, palavra do "Comenta" e o aviso de conversa encenada (ligado se não vier false). */
export const FECHO: { chamada: string | null; palavra: string | null; avisoFicticio: boolean } = { chamada: null, palavra: null, avisoFicticio: true };

/** Cores (pergunta 9), já resolvidas: a paleta base (claro, escuro, vivo) e os papéis trocados. */
export const TEMA: { origem: 'modelo' | 'marca' | 'pronta'; pronta: string | null; base: string; cores: Partial<Paleta> } = { origem: 'modelo', pronta: null, base: 'claro', cores: {} };

/** Tela do chat (pergunta 8): desenho do fundo da conversa, horário e sinal de lido ligados ou não, hora inicial. */
export const TELA: { fundo: string; horario: boolean; lido: boolean; hora: string } = { fundo: 'pontos', horario: true, lido: true, hora: '18:30' };

/** Receita padrão dos vídeos (pergunta 10): duas vozes, uma por lado, ou só texto e música. */
export const RECEITA: 'vozes-por-fala' | 'texto-e-musica' = 'vozes-por-fala';

/** Textos dos stills de conferência (pergunta 2, opcional): o título da capa e a primeira mensagem do contato. */
export const AMOSTRA: { titulo: string | null; mensagem: string | null } = { titulo: null, mensagem: null };

export type Lado = 'esquerda' | 'direita';
export type Avatar = { tipo: 'inicial' | 'desenho'; desenho: string | null; cor: string };
export type PessoaDaConversa = { nome: string; papel: 'protagonista' | 'apoio'; lado: Lado; status: string | null; avatar: Avatar };
/** Os 2 lados da conversa (pergunta 5): à direita o dono do celular, à esquerda o contato do cabeçalho. */
export const PESSOAS: Record<string, PessoaDaConversa> = {
  voce: { nome: 'Você', papel: 'protagonista', lado: 'direita', status: null, avatar: { tipo: 'inicial', desenho: null, cor: '#B9B4D6' } },
  ana: { nome: 'Ana', papel: 'apoio', lado: 'esquerda', status: 'online', avatar: { tipo: 'inicial', desenho: null, cor: '#F4A6C0' } },
};
