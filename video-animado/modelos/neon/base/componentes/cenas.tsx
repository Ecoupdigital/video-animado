import React from 'react';
import { ramp } from './anima';
import { medirLetreiro } from './letreiro';
import { Botao, CardFinal, Contagem, medirBotao, Oferta, ZONA } from './pecas';
import { chamadaDo, contaPor, dadosContagem, dadosOferta, eventosLetreiro, passoContagem, tempoDoCard, type CenaTempo, type Timing } from './roteiro';
import { useNeon } from './tema';
import { FECHO, MARCA, OFERTA } from './universo';

// Cenas do modelo Neon retrô, montadas pelos dados do roteiro (CenaTempo: dados da cena + tempos do timing.json),
// na zona das peças, sobre a grade (o cenário, o letreiro e o topo a Montagem desenha uma vez para o vídeo inteiro):
//   abertura  só o letreiro, grande, sobre o cenário (a zona de baixo fica com a grade)
//   oferta    o que (batida "o_que"), o preço antigo e o preço que conta ("preco"), o selo ("selo") e o prazo ("prazo")
//   contagem  o relógio descendo ou 3, 2, 1 ("contagem"), com o rótulo e o prazo
//   chamada   o botão em pílula com o texto da oferta ("botao") e o prazo, se a cena trouxer
//   final     o card final ("card"): chamada, assinatura, frase, fontes e o aviso de narração por IA (só na narração)

export type PropsCena = { c: CenaTempo; timing: Timing; indice: number; primeira: boolean; t: number };
type Som = { at: number; arquivo: string; vol: number };

/** sem batida marcada, o primeiro instante útil da cena (na primeira cena, já no quadro 0) */
const cedo = (c: CenaTempo, primeira: boolean, papel: string, depois: number) => c.b[papel] ?? (primeira ? c.ini : c.ini + depois);

/** os instantes das peças da oferta */
export const temposOferta = (c: CenaTempo, timing: Timing, primeira: boolean) => {
  const oQue = cedo(c, primeira, 'o_que', 0.1);
  const preco = c.b.preco ?? Math.max(oQue + 0.3, c.ini + 0.35);
  const conta = contaPor(timing);
  const selo = c.b.selo ?? preco + conta + 0.1;
  const prazo = c.b.prazo ?? selo + 0.3;
  return { oQue, preco, conta, selo, prazo };
};

export const Abertura: React.FC<PropsCena> = () => null;

export const CenaOferta: React.FC<PropsCena> = ({ c, timing, primeira, t }) => {
  if (c.tipo !== 'oferta') return null;
  const tp = temposOferta(c, timing, primeira);
  return <Oferta d={dadosOferta(c)} t={t} at={tp.oQue} atPreco={tp.preco} atSelo={tp.selo} atPrazo={tp.prazo} contaPor={tp.conta} />;
};

export const CenaContagem: React.FC<PropsCena> = ({ c, timing, primeira, t }) => {
  if (c.tipo !== 'contagem') return null;
  return <Contagem d={dadosContagem(c)} t={t} at={cedo(c, primeira, 'contagem', 0.2)} passo={passoContagem(timing)} />;
};

export const Chamada: React.FC<PropsCena> = ({ c, primeira, t }) => {
  const N = useNeon();
  if (c.tipo !== 'chamada') return null;
  const texto = c.botao ?? OFERTA.botao;
  const at = cedo(c, primeira, 'botao', 0.2);
  const m = medirBotao(texto);
  const prazo = c.prazo ?? null;
  return (
    <>
      {prazo && t >= at ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: Math.max(ZONA.topo, m.y - 70), textAlign: 'center', fontFamily: N.f.mono, fontWeight: 500, fontSize: 34, color: N.c.topo, opacity: ramp(t, at, 0.3), textShadow: `0 0 18px ${N.a('ceu', 0.95)}` }}>{prazo}</div>
      ) : null}
      <Botao texto={texto} t={t} at={at} />
    </>
  );
};

export const Final: React.FC<PropsCena> = ({ c, timing, t }) => {
  if (c.tipo !== 'final') return null;
  const at = tempoDoCard(c, timing);
  // o card fica abaixo do letreiro aceso
  const letreiro = eventosLetreiro(timing).filter((e) => e.at <= at).pop();
  const topoMin = letreiro ? medirLetreiro(letreiro.linhas).baixo + 30 : undefined;
  return (
    <CardFinal
      t={t}
      at={at}
      topoMin={topoMin}
      chamada={chamadaDo(c)}
      fontes={c.fontes ?? []}
      assinatura={FECHO.assinatura}
      frase={FECHO.fraseAssinatura}
      marca={MARCA}
      avisoIA={FECHO.avisoIA && (timing.receita ?? 'narracao-inteira') === 'narracao-inteira'}
    />
  );
};

export const CENAS: Record<CenaTempo['tipo'], React.FC<PropsCena>> = { abertura: Abertura, oferta: CenaOferta, contagem: CenaContagem, chamada: Chamada, final: Final };

// ---------------------------------------------------------------- sons

/** Sons de cada cena, nos mesmos instantes das peças: o zumbido do neon em cada letreiro que acende (a Montagem toca),
 *  o tique do preço contando e da contagem, e o deslize das peças que entram (o que, selo, botão, card). */
export const efeitos = (c: CenaTempo, timing: Timing, indice: number): Som[] => {
  const s: Som[] = [];
  const som = (at: number, arquivo: string, vol: number) => s.push({ at, arquivo, vol });
  const primeira = indice === 0;
  if (c.tipo === 'oferta') {
    const tp = temposOferta(c, timing, primeira);
    if (!primeira) som(tp.oQue, 'deslize.wav', 0.3);
    // o tique do contador: 6 toques que vão espaçando enquanto o preço desacelera
    for (let k = 0; k < 6; k++) som(tp.preco + tp.conta * (1 - Math.pow(1 - k / 6, 1.8)), 'tique.wav', 0.32);
    if (dadosOferta(c).selo) som(tp.selo, 'deslize.wav', 0.42);
  }
  if (c.tipo === 'contagem') {
    const d = dadosContagem(c);
    const at = cedo(c, primeira, 'contagem', 0.2);
    const passo = d.forma === 'relogio' ? 1 : passoContagem(timing);
    const n = d.forma === 'relogio' ? Math.floor(c.fim - at) : d.de + 1;
    for (let k = 0; k < n && at + k * passo < c.fim; k++) som(at + k * passo, 'tique.wav', d.forma === 'relogio' ? 0.3 : 0.5);
  }
  if (c.tipo === 'chamada') som(cedo(c, primeira, 'botao', 0.2), 'deslize.wav', 0.42);
  if (c.tipo === 'final') som(tempoDoCard(c, timing), 'deslize.wav', 0.36);
  return s.filter((x) => x.at >= 0 && x.at >= c.ini - 0.05);
};

/** zumbido do neon: um por letreiro que acende */
export const zumbidos = (timing: Timing): Som[] => eventosLetreiro(timing).map((e) => ({ at: e.at, arquivo: 'zumbido.wav', vol: 0.45 }));

/** some com o fim da cena (para a cena anterior sair por baixo da nova) */
export const saindo = (t: number, fim: number) => 1 - ramp(t, fim, 0.22);
