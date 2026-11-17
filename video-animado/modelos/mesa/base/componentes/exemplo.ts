import opcoes from './opcoes.json';
import type { CenaDados } from './roteiro';
import type { IdGrupo } from './tema';
import { AMOSTRA, FECHO, MESA } from './universo';

// Passo a passo neutro dos stills de conferência, um por grupo, sem nome real: uma pizza (cozinha), uma pele leve
// (beleza) e um cartão (artesanato). O último passo é a capa (a cena da tela de referência): o título e a frase dele
// vêm da amostra das respostas (componentes/universo.ts, AMOSTRA), senão da amostra do grupo (opcoes.json); a pergunta
// do final é a chamada do card final das respostas.

const amostra = (g: IdGrupo) => {
  const doGrupo = opcoes.grupos[g].amostra;
  const a = g === MESA.grupo ? AMOSTRA : null;
  return { titulo: a?.titulo ?? doGrupo.titulo, frase: a?.frase ?? doGrupo.frase, numero: a?.numero ?? 3, de: a?.de ?? 5 };
};

export const exemploDo = (g: IdGrupo): CenaDados[] => {
  const a = amostra(g);
  if (g === 'beleza')
    return [
      { tipo: 'abertura', titulo: 'Make de *5 minutos* para sair de casa', frase: 'Tudo na bancada antes de começar' },
      { tipo: 'passo', numero: 1, de: a.de, titulo: 'Pele limpa', frase: 'Algodão com *tônico*, sem esfregar', itens: [{ item: 'algodao' }, { item: 'espelho' }] },
      { tipo: 'passo', numero: 2, de: a.de, titulo: 'Olho e boca', frase: 'Um toque de *cor* e pronto', itens: [{ item: 'sombra' }, { item: 'batom' }, { item: 'sombra', lugar: 'mesa' }] },
      { tipo: 'passo', numero: a.numero, de: a.de, titulo: a.titulo, frase: a.frase, itens: [{ item: 'base', lugar: 'mesa' }, { item: 'base' }, { item: 'pincel' }, { item: 'batom', lugar: 'mesa' }, { item: 'espelho', entrada: 'aparece' }] },
      { tipo: 'final', pergunta: FECHO.chamada ?? 'Qual passo você *pula*?', fontes: [] },
    ];
  if (g === 'artesanato')
    return [
      { tipo: 'abertura', titulo: 'Cartão em *10 minutos*', frase: 'Só papel, fita e cola' },
      { tipo: 'passo', numero: 1, de: a.de, titulo: 'Dobre o papel', frase: 'Papel dobrado ao *meio*', itens: [{ item: 'papel' }, { item: 'tesoura' }, { item: 'papel', lugar: 'mesa' }] },
      { tipo: 'passo', numero: 2, de: a.de, titulo: 'A fita', frase: 'Fita *esticada* de ponta a ponta', itens: [{ item: 'fita' }, { item: 'linha' }] },
      { tipo: 'passo', numero: a.numero, de: a.de, titulo: a.titulo, frase: a.frase, itens: [{ item: 'cola' }, { item: 'botao' }, { item: 'cola', lugar: 'mesa' }, { item: 'botao', lugar: 'mesa', quantidade: 2 }, { item: 'tesoura' }] },
      { tipo: 'final', pergunta: FECHO.chamada ?? 'Pra quem você *faria*?', fontes: [] },
    ];
  return [
    { tipo: 'abertura', titulo: 'Pizza de *frigideira* em casa', frase: 'Do zero, em poucos passos' },
    { tipo: 'passo', numero: 1, de: a.de, titulo: 'Abra a massa', frase: 'Farinha na tábua, depois a *massa*', itens: [{ item: 'farinha' }, { item: 'massa' }, { item: 'tigela' }] },
    { tipo: 'passo', numero: 2, de: a.de, titulo: 'Molho só depois', frase: 'Espalhe o *molho* até a borda', itens: [{ item: 'molho' }, { item: 'colher' }, { item: 'ovo', quantidade: 2 }] },
    { tipo: 'passo', numero: a.numero, de: a.de, titulo: a.titulo, frase: a.frase, itens: [{ item: 'queijo' }, { item: 'tomate' }, { item: 'folha' }, { item: 'prato' }, { item: 'tomate', lugar: 'mesa', quantidade: 3 }] },
    { tipo: 'final', pergunta: FECHO.chamada ?? 'E você, já *tentou*?', fontes: [] },
  ];
};

/** o exemplo do grupo do universo */
export const EXEMPLO: CenaDados[] = exemploDo(MESA.grupo);
