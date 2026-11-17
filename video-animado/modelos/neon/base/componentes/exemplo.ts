import opcoes from './opcoes.json';
import type { CenaDados } from './roteiro';
import { AMOSTRA, FECHO, OFERTA } from './universo';

// Vídeo neutro dos stills de conferência, sem nome real: a abertura com o letreiro da amostra (o das respostas,
// componentes/universo.ts, AMOSTRA, senão o da tela de referência, em opcoes.json), a oferta das respostas com o
// preço que conta e o selo, a contagem, a chamada com o botão (a capa: a cena da tela de referência) e o card final.
// O tipo de vídeo da oferta (oferta, lançamento, evento, contagem) muda a ordem e a forma da contagem.

export const LETREIRO_AMOSTRA: string[] = AMOSTRA?.letreiro ?? opcoes.amostra.letreiro;

export const exemploDo = (tipo: typeof OFERTA.tipo): CenaDados[] => {
  const abertura: CenaDados = { tipo: 'abertura', letreiros: [LETREIRO_AMOSTRA] };
  const oferta: CenaDados = { tipo: 'oferta' };
  const contagem: CenaDados = tipo === 'contagem' || tipo === 'evento' ? { tipo: 'contagem', forma: 'numeros', de: 3, rotulo: 'começa em', texto_final: 'agora' } : { tipo: 'contagem', forma: 'relogio', relogio: '02:00:00', rotulo: 'termina em' };
  const chamada: CenaDados = { tipo: 'chamada' };
  const final: CenaDados = { tipo: 'final', chamada: FECHO.chamada ?? 'Corre que *acaba* hoje', fontes: [] };
  if (tipo === 'contagem') return [abertura, contagem, oferta, chamada, final];
  return [abertura, oferta, contagem, chamada, final];
};

/** o exemplo do tipo de vídeo do universo */
export const EXEMPLO: CenaDados[] = exemploDo(OFERTA.tipo);
