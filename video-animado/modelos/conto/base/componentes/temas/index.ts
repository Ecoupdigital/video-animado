import { FundoPapel } from './papel/fundo';
import { TOPO_PAPEL, TracoPapel } from './papel/traco';
import { FundoFormas } from './formas/fundo';
import { TOPO_FORMAS, TracoFormas } from './formas/traco';
import { FundoSilhuetas } from './silhuetas/fundo';
import { TOPO_SILHUETAS, TracoSilhuetas } from './silhuetas/traco';
import { FundoGiz } from './giz-de-cera/fundo';
import { TOPO_GIZ, TracoGiz } from './giz-de-cera/traco';
import type { ModuloTema } from './tipos';

// Registro dos módulos de tema: cada tema da lista do opcoes.json tem aqui o traço do personagem e os fundos.
// Tema novo (silhuetas, giz de cera...): a pasta temas/<id>/ com traco.tsx e fundo.tsx e uma linha neste registro.
// Tema da lista sem módulo cai no primeiro tema da lista.

export const MODULOS: Record<string, ModuloTema> = {
  papel: { Traco: TracoPapel, Fundo: FundoPapel, topo: TOPO_PAPEL },
  formas: { Traco: TracoFormas, Fundo: FundoFormas, topo: TOPO_FORMAS },
  silhuetas: { Traco: TracoSilhuetas, Fundo: FundoSilhuetas, topo: TOPO_SILHUETAS },
  'giz-de-cera': { Traco: TracoGiz, Fundo: FundoGiz, topo: TOPO_GIZ },
};
