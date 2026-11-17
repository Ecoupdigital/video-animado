// Universo padrão do kit, antes do --aplicar (o kit compila e o _preview mostra o caso neutro).
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado das respostas: não edite à mão no universo.
import type { NomeTema, Paleta, PapelFonte } from './tema';

export const UNIVERSO = { nome: 'Dossiê', pasta: null, assunto: 'a definir', publico: 'a definir', tom: 'a definir' } as const;

/** null = nenhuma marca: o tema "marca" cai nas cores do investigativo e o card final mostra só a assinatura. */
export const MARCA: { nome: string; cor: string | null } | null = null;

/** Rótulo do topo, selo do canto e manchetes da faixa rolando. */
export const DOSSIE: { rotulo: string; selo: string; manchetes: string[] } = {
  rotulo: '// DOSSIÊ',
  selo: 'CASO ABERTO',
  manchetes: ['CASO EM APURAÇÃO', 'OS ENVOLVIDOS NEGAM AS SUSPEITAS', 'DOCUMENTOS PEDIDOS PELA REPORTAGEM'],
};

/** Tema escolhido e os papéis de cor e fonte trocados nas respostas (valem só para o tema escolhido). */
export const TEMA: { nome: NomeTema; cores: Partial<Paleta>; fontes: Partial<Record<PapelFonte, string>> } = { nome: 'investigativo', cores: {}, fontes: {} };

/** Card final: chamada, assinatura e o aviso de narração por IA (ligado, a não ser com áudio próprio). */
export const FECHO: { chamada: string | null; assinatura: string; fraseAssinatura: string | null; avisoIA: boolean } = {
  chamada: null,
  assinatura: '@seu.perfil',
  fraseAssinatura: 'me segue pra ver o próximo caso',
  avisoIA: true,
};

/** Caso dos stills de conferência (null = o caso neutro do kit, em componentes/exemplo.ts). */
export const CASO: { titulo: string; nome: string; papel: string } | null = null;
