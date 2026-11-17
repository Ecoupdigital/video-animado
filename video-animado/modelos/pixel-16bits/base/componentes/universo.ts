// Universo padrão do kit, antes do --aplicar (o kit compila e o _preview mostra um boneco neutro).
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado das respostas: não edite à mão no universo.
import type { Paleta } from './cores';

export const UNIVERSO = { nome: 'Notícia em pixel', pasta: null, assunto: 'a definir', publico: 'a definir', tom: 'a definir' } as const;

/** null = nenhuma marca: estampa ">_" ou nenhuma e card final só com o perfil. */
export const MARCA: { nome: string; cor: string | null; simbolo: string | null } | null = null;

/** Topo de todo vídeo: rótulo à esquerda e assinatura à direita (o pedaço depois do último ponto sai no destaque). */
export const TOPO: { rotulo: string; assinatura: string } = { rotulo: '// notícia', assinatura: 'SEU.PERFIL' };

/** Card final de perfil: o @, a frase e o rótulo em cima do card. */
export const PERFIL: { arroba: string; frase: string | null; rotulo: string } = { arroba: '@seu.perfil', frase: 'me segue pra mais notícia', rotulo: '// perfil' };

/** O boneco do universo (os 72 sprites dele ficam em public/px/, gerados pelo --aplicar). */
export const BONECO: { nome: string } = { nome: 'Apresentador' };

/** Papéis de cor trocados nas respostas (o resto vem do preset claro-violeta). */
export const CORES: Partial<Paleta> = {};
