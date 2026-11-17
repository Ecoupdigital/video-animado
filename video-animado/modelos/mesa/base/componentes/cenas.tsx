import React from 'react';
import { ramp } from './anima';
import { ocupaCentro } from './centro';
import { ItemSvg } from './itens';
import { AREA, CardFinal, cruza, entrada, Etiqueta, Faixa, medirEtiqueta, medirFaixa, QUEDA, sombraItem, type Caixa, type Entrada } from './pecas';
import { batida, lugarDe, numeroDoPasso, tempoDoItem, type CenaTempo, type Timing } from './roteiro';
import { useMesa, type IdGrupo, type IdItem, type IdSuperficie } from './tema';
import { FECHO, MARCA, UNIVERSO } from './universo';

// Cenas do modelo Mesa vista de cima, montadas pelos dados do roteiro (CenaTempo: dados da cena + tempos do
// timing.json), por cima da mesa e da peça central (que a Montagem desenha uma vez para o vídeo inteiro):
//   abertura  a etiqueta grande com o rótulo e o título; a faixa com a frase, se houver
//   passo     a etiqueta "PASSO n DE N" com o título do passo, os itens da mesa caindo ou aparecendo na batida
//             (item0, item1, ...) e a faixa com a frase e a palavra destacada
//   final     a pergunta na faixa e o card final por cima (chamada, assinatura, frase, fontes, aviso de IA)
// Os itens da mesa ficam nos lugares em volta da peça central, sem encostar na etiqueta, na faixa nem em outro item.

export type PropsCena = { c: CenaTempo; timing: Timing; indice: number; primeira: boolean };
type Som = { at: number; arquivo: string; vol: number; off?: number };

/** tamanho do item na mesa (px) */
export const TAM_ITEM = 190;
/** lugares em volta da peça central, na ordem em que vão sendo usados (centro do item e o giro) */
const LUGARES: [number, number, number][] = [
  [900, 622, 6],
  [178, 1235, -8],
  [178, 645, -4],
  [902, 1235, 8],
  [900, 380, -10],
  [165, 945, 4],
  [915, 945, -6],
  [390, 1345, 6],
  [690, 1345, -6],
];

/** os lugares livres para "n" itens: fora da peça central, da etiqueta e da faixa, e dentro da área segura */
export const lugaresLivres = (grupo: IdGrupo, bloqueios: Caixa[]) =>
  LUGARES.filter(([x, y]) => {
    const meio = TAM_ITEM / 2;
    const caixa = { x: x - meio, y: y - meio, w: TAM_ITEM, h: TAM_ITEM };
    if (caixa.x < AREA.x || caixa.y < AREA.y || caixa.x + caixa.w > AREA.x + AREA.w || caixa.y + caixa.h > AREA.y + AREA.h) return false;
    if (ocupaCentro(grupo, { x, y, r: meio * 0.92 })) return false;
    return bloqueios.every((b) => !cruza(caixa, b, 8));
  });

/** Os itens da mesa de um passo: cada um no seu lugar (a quantidade vira um grupinho no mesmo lugar). */
export type ItemNaMesa = { item: IdItem; x: number; y: number; giro: number; escala: number; at: number; entrada: Entrada };

export const itensDaMesa = (c: CenaTempo, grupo: IdGrupo, bloqueios: Caixa[]): ItemNaMesa[] => {
  if (c.tipo !== 'passo') return [];
  const naMesa = c.itens.map((ic, i) => ({ ic, i })).filter(({ ic }) => lugarDe(ic) === 'mesa');
  const lugares = lugaresLivres(grupo, bloqueios);
  const saida: ItemNaMesa[] = [];
  naMesa.slice(0, lugares.length).forEach(({ ic, i }, k) => {
    const [x, y, giro] = lugares[k];
    const at = tempoDoItem(c, i);
    const ent = ic.entrada ?? 'cai';
    const n = Math.max(1, Math.min(6, ic.quantidade ?? 1));
    if (n === 1) return saida.push({ item: ic.item, x, y, giro, escala: 1, at, entrada: ent });
    const escala = n === 2 ? 0.64 : n === 3 ? 0.58 : 0.48;
    const raio = TAM_ITEM * (n === 2 ? 0.22 : 0.27);
    for (let j = 0; j < n; j++) {
      const a = -Math.PI / 2 + (j * 2 * Math.PI) / n + (n === 2 ? Math.PI / 4 : 0);
      saida.push({ item: ic.item, x: x + Math.cos(a) * raio, y: y + Math.sin(a) * raio, giro: giro + j * 23, escala, at: at + j * 0.1, entrada: ent });
    }
  });
  return saida;
};

/** um item na mesa, entrando em "at" (cai ou aparece), com a sombra na cor da superfície */
export const ItemNaMesaVista: React.FC<{ i: ItemNaMesa; t: number }> = ({ i, t }) => {
  const M = useMesa();
  const e = entrada(t, i.at, i.entrada);
  if (!e) return null;
  const tam = TAM_ITEM * i.escala;
  return (
    <div
      style={{
        position: 'absolute',
        left: i.x - tam / 2,
        top: i.y - tam / 2,
        width: tam,
        height: tam,
        opacity: e.opacidade,
        transform: `translateY(${e.dy}px) rotate(${i.giro}deg) scale(${e.escala})`,
        filter: sombraItem(M.sombra, e.altura),
      }}
    >
      <ItemSvg id={i.item} tamanho={tam} />
    </div>
  );
};

const rotuloAbertura = (c: CenaTempo, timing: Timing) => (c.tipo === 'abertura' && c.rotulo) || timing.rotulo || (MARCA?.nome ?? UNIVERSO.nome).toUpperCase();

/** o que a cena ocupa por cima da mesa (para os itens não encostarem) */
export const bloqueiosDa = (c: CenaTempo, timing: Timing, indice: number): Caixa[] => {
  const b: Caixa[] = [];
  if (c.tipo === 'abertura') {
    b.push(medirEtiqueta(c.titulo, rotuloAbertura(c, timing), true).girada);
    if (c.frase) b.push(medirFaixa(c.frase).caixa);
  }
  if (c.tipo === 'passo') {
    const [n, de] = numeroDoPasso(timing.cenas, indice);
    b.push(medirEtiqueta(c.titulo, `PASSO ${n} DE ${de}`).girada);
    b.push(medirFaixa(c.frase).caixa);
  }
  return b;
};

// ---------------------------------------------------------------- cenas

export const Abertura: React.FC<PropsCena & { t: number }> = ({ c, timing, primeira, t }) => {
  if (c.tipo !== 'abertura') return null;
  return (
    <>
      <Etiqueta t={t} at={primeira ? undefined : c.ini} rotulo={rotuloAbertura(c, timing)} titulo={c.titulo} grande />
      {c.frase ? <Faixa t={t} at={primeira ? undefined : batida(c, 'faixa', 0.04)} frase={c.frase} /> : null}
    </>
  );
};

export const Passo: React.FC<PropsCena & { t: number }> = ({ c, timing, indice, primeira, t }) => {
  const M = useMesa();
  if (c.tipo !== 'passo') return null;
  const [n, de] = numeroDoPasso(timing.cenas, indice);
  const itens = itensDaMesa(c, M.grupo, bloqueiosDa(c, timing, indice));
  return (
    <>
      {itens.map((i, k) => (
        <ItemNaMesaVista key={k} i={i} t={t} />
      ))}
      <Etiqueta t={t} at={primeira ? undefined : c.ini} rotulo={`PASSO ${n} DE ${de}`} titulo={c.titulo} />
      <Faixa t={t} at={primeira ? undefined : batida(c, 'faixa', 0.04)} frase={c.frase} />
    </>
  );
};

export const Final: React.FC<PropsCena & { t: number }> = ({ c, timing, t }) => {
  if (c.tipo !== 'final') return null;
  const tCard = c.b.card ?? timing.voiceEnd + 0.4;
  const pergunta = c.pergunta ?? FECHO.chamada;
  return (
    <>
      {pergunta ? <Faixa t={t} at={batida(c, 'faixa', 0.04)} frase={pergunta} saida={tCard} /> : null}
      <CardFinal t={t} at={tCard} chamada={pergunta} fontes={c.fontes ?? []} assinatura={FECHO.assinatura} frase={FECHO.fraseAssinatura} marca={MARCA} avisoIA={FECHO.avisoIA} />
    </>
  );
};

export const CENAS: Record<CenaTempo['tipo'], React.FC<PropsCena & { t: number }>> = { abertura: Abertura, passo: Passo, final: Final };

// ---------------------------------------------------------------- sons

const pouso = (s: IdSuperficie) => `pouso-${s}.wav`;

/** Sons de cada cena, nos mesmos instantes das peças: papel da etiqueta, deslize da faixa, pouso do item (um som
 *  por superfície) ou pop, e o pouso de cada pedaço sobre a peça central. */
export const efeitos = (c: CenaTempo, timing: Timing, indice: number, superficie: IdSuperficie, grupo: IdGrupo): Som[] => {
  const s: Som[] = [];
  const som = (at: number, arquivo: string, vol: number, off = 0) => s.push({ at, arquivo, vol, off });
  if (indice > 0 && c.tipo !== 'final') som(c.ini, 'papel.wav', 0.42);
  const temFaixa = c.tipo === 'passo' || (c.tipo === 'abertura' && c.frase) || (c.tipo === 'final' && (c.pergunta ?? FECHO.chamada));
  if (indice > 0 && temFaixa) som(batida(c, 'faixa', 0.04), 'deslize.wav', 0.2);
  if (c.tipo === 'passo') {
    for (const i of itensDaMesa(c, grupo, bloqueiosDa(c, timing, indice))) som(i.entrada === 'cai' ? i.at + QUEDA : i.at, i.entrada === 'cai' ? pouso(superficie) : 'pop.wav', i.escala < 1 ? 0.32 : 0.5);
    c.itens.forEach((ic, k) => {
      if (lugarDe(ic) !== 'centro') return;
      const at = tempoDoItem(c, k);
      som(ic.entrada === 'aparece' ? at : at + QUEDA * 0.8, ic.entrada === 'aparece' ? 'pop.wav' : 'pedaco.wav', 0.3);
    });
  }
  if (c.tipo === 'final') som(c.b.card ?? timing.voiceEnd + 0.4, 'pop.wav', 0.34);
  return s.filter((x) => x.at >= 0 && x.at >= c.ini - 0.05);
};

/** some com o fim da cena (para a cena anterior sair por baixo da nova) */
export const saindo = (t: number, fim: number) => 1 - ramp(t, fim, 0.22);
