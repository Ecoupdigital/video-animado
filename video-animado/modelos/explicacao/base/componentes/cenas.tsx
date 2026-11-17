import React from 'react';
import { eo, ramp, spr, useT } from './anima';
import { useTema, type Tema } from './tema';
import {
  ajustar,
  Caixa,
  CardFinal,
  Cartao,
  Circulo,
  Cursor,
  Desenho,
  desenhar,
  fonteMao,
  FundoCaixa,
  Icone,
  Janela,
  layoutJanela,
  Legenda,
  medirTitulo,
  Onda,
  Risco,
  Seta,
  semente,
  TextoMao,
  textoDaCaixa,
  Titulo,
  Traco,
  caminhoCaixa,
  caminhoCirculo,
  caminhoRisco,
  tremor,
} from './pecas';
import { batida, semMarcas, type CenaTempo } from './roteiro';
import { EXPLICACAO, FECHO, MARCA } from './universo';

// Cenas da família Explicação, montadas pelos dados do roteiro (CenaTempo: dados da cena + tempos do timing.json).
// Os mesmos tipos de cena valem nos 4 temas: o tema troca a cara das peças, não o roteiro. O instante de cada peça
// é a batida marcada no roteiro (palavra falada) ou, sem batida, uma fração da cena (só a ordem visual).
// Grade: rótulo em y 232, título de y 300 a ~560, peça principal de 600 a 1380, legenda em 1420 (até 1530).

export type PropsCena = { c: CenaTempo; voiceEnd: number };
type Som = { at: number; arquivo: string; vol: number; off?: number };
export type Efeitos = { sons: Som[] };

const TOPO = 600;
const BASE = 1380;

// ---------------------------------------------------------------- 1. abertura

const MolduraIcone: React.FC<{ t: number; at: number; cx: number; cy: number; r: number }> = ({ t, at, cx, cy, r }) => {
  const T = useTema();
  if (t < at) return null;
  if (T.id === 'post-its') return <FundoCaixa t={t} at={at} x={cx - r} y={cy - r} w={r * 2} h={r * 2} indice={2} sem={semente('icone')} />;
  if (T.id === 'tela-app') {
    const s = spr(t, at, { damping: 15, stiffness: 200 });
    return <div style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: r, background: T.c.superficie, boxShadow: `0 24px 50px ${T.a('moldura2', 0.4)}`, transform: `scale(${0.7 + 0.3 * s})`, opacity: Math.min(1, s * 1.5) }} />;
  }
  return (
    <Desenho>
      <Traco d={caminhoCirculo(cx, cy, r, r, semente('icone'), tremor(T))} p={desenhar(t, at, 0.5)} largura={7} />
    </Desenho>
  );
};

export const Abertura: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'abertura') return null;
  const topo = 330;
  // nos post-its o título fica na parede, acima do quadro (que começa em y 560)
  const alturaTitulo = T.id === 'post-its' ? 196 : 430;
  const m = medirTitulo(T, c.palavras.map((p) => p.w), T.tituloMao ? 150 : 108, 900, alturaTitulo);
  const ultimaLinha = m.linhas[m.linhas.length - 1]?.largura ?? 600;
  const ultimaPalavra = c.palavras[c.palavras.length - 1]?.at ?? c.ini;
  const tRisco = c.b.risco ?? Math.max(ultimaPalavra + 0.3, c.ini + 0.4 * (c.fim - c.ini));
  const tIcone = c.icone ? batida(c, 'icone', 0.5) : 9999;
  const tSub = c.subtitulo ? batida(c, 'subtitulo', 0.65) : 9999;
  const yRisco = topo + m.alto + 6;
  const cy = Math.max(yRisco + 260, 1020);
  return (
    <>
      <Titulo t={t} palavras={c.palavras} topo={topo} tamanho={T.tituloMao ? 150 : 108} alturaMax={alturaTitulo} />
      <Risco t={t} at={tRisco} x1={90} x2={90 + Math.min(900, Math.max(260, ultimaLinha))} y={yRisco} />
      {c.icone ? (
        <>
          <MolduraIcone t={t} at={tIcone} cx={540} cy={cy} r={150} />
          <Icone nome={c.icone} x={540} y={cy + (T.id === 'post-its' ? 10 : 0)} tamanho={T.id === 'tela-app' ? 150 : 170} p={desenhar(t, tIcone + 0.15, 0.6)} cor={T.id === 'tela-app' ? T.c.destaque2 : T.c.traco} />
        </>
      ) : null}
      {c.subtitulo ? <TextoMao t={t} at={tSub} texto={c.subtitulo} x={90} y={Math.min(1250, cy + 200)} largura={900} altura={150} tamanho={T.id === 'tela-app' ? 48 : 64} cor={T.id === 'tela-app' ? T.c.texto : T.c.texto} alinhar="center" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- 2. passos

/** posição de cada caixa dos passos (2 a 4) entre TOPO e BASE */
const gradePassos = (T: Tema, n: number) => {
  const area = BASE - TOPO;
  const g = n <= 2 ? 150 : n === 3 ? 100 : 74;
  const h = Math.min(210, (area - (n - 1) * g) / n);
  const total = n * h + (n - 1) * g;
  const y0 = TOPO + (area - total) / 2;
  const zigue = T.id === 'post-its';
  const w = zigue ? 660 : 900;
  return Array.from({ length: n }).map((_, i) => ({ x: zigue ? (i % 2 ? 330 : 90) : 90, y: y0 + i * (h + g), w, h }));
};

export const Passos: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'passos') return null;
  const passos = c.passos.slice(0, 4);
  const n = passos.length;
  const caixas = gradePassos(T, n);
  const tP = passos.map((_, i) => batida(c, `passo${i}`, 0.08 + i * 0.24));
  const tS = passos.slice(1).map((_, i) => c.b[`seta${i}`] ?? Math.max(tP[i] + 0.3, tP[i + 1] - 0.35));
  const ult = caixas[n - 1];
  const tC = c.b.circulo ?? tP[n - 1] + 0.6;
  const tLeg = c.legenda ? batida(c, 'legenda', 0.85) : 9999;
  const tx = textoDaCaixa(T, ult.x, ult.y, ult.w, ult.h, passos[n - 1]?.texto ?? '', Boolean(passos[n - 1]?.icone));
  const circ =
    T.id === 'tela-app'
      ? { cx: ult.x + ult.w / 2, cy: ult.y + ult.h / 2, rx: ult.w / 2 + 18, ry: ult.h / 2 + 18 }
      : { cx: tx.x + tx.largura / 2, cy: tx.y + tx.alto / 2, rx: tx.largura / 2 + 46, ry: tx.alto / 2 + 30 };
  return (
    <>
      <Titulo t={t} palavras={c.palavras} />
      {passos.map((p, i) => (
        <Caixa key={i} t={t} at={tP[i]} x={caixas[i].x} y={caixas[i].y} w={caixas[i].w} h={caixas[i].h} texto={p.texto} icone={p.icone} indice={i} destaque={i === n - 1 && n > 1} />
      ))}
      {tS.map((at, i) => {
        const a = caixas[i];
        const b = caixas[i + 1];
        return <Seta key={i} t={t} at={at} de={[a.x + a.w / 2, a.y + a.h + 16]} para={[b.x + b.w / 2, b.y - 16]} sem={semente(`seta${i}`)} />;
      })}
      {n > 1 ? <Circulo t={t} at={tC} {...circ} sem={semente('circulo-passos')} /> : null}
      {c.legenda ? <Legenda t={t} at={tLeg} texto={c.legenda} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- 3. conta

export const Conta: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'conta') return null;
  const linhas = c.linhas.slice(0, 4);
  const n = linhas.length;
  const passo = Math.min(150, 520 / Math.max(1, n));
  const tL = linhas.map((_, i) => batida(c, `linha${i}`, 0.08 + i * 0.18));
  const tR = batida(c, 'resultado', 0.72);
  const tC = c.b.circulo ?? tR + 0.4;
  const tLeg = c.legenda ? batida(c, 'legenda', 0.88) : 9999;
  const yRes = TOPO + n * passo + 70;
  const fm = fonteMao(T);
  const tamRes = ajustar(semMarcas(c.resultado), T.id === 'tela-app' ? 110 : 150, 700, 190, fm.letra, 1.1, 40).s;
  const larguraRes = Math.min(760, semMarcas(c.resultado).length * fm.letra * tamRes + 60);
  const corLinha = T.id === 'tela-app' ? T.c.titulo : T.c.traco;
  const xSeta = 300;
  const yDeSeta = TOPO + (n - 1) * passo + passo * 0.85;
  return (
    <>
      <Titulo t={t} palavras={c.palavras} />
      {linhas.map((l, i) => (
        <TextoMao key={i} t={t} at={tL[i]} texto={l} x={130} y={TOPO + i * passo} largura={820} altura={passo} tamanho={T.id === 'tela-app' ? 74 : 96} cor={corLinha} meio />
      ))}
      <Seta t={t} at={Math.max(tL[n - 1] + 0.2, tR - 0.35)} de={[xSeta, yDeSeta]} para={[xSeta, yRes - 10]} sem={semente('seta-conta')} />
      {T.id === 'post-its' || T.id === 'tela-app' ? <FundoCaixa t={t} at={tR} x={540 - larguraRes / 2 - 20} y={yRes} w={larguraRes + 40} h={tamRes * 1.25 + 40} indice={0} sem={semente('resultado')} /> : null}
      <TextoMao t={t} at={tR + (T.id === 'post-its' || T.id === 'tela-app' ? 0.15 : 0)} texto={c.resultado} x={140} y={yRes + 20} largura={800} altura={tamRes * 1.25} tamanho={tamRes} cor={T.id === 'tela-app' ? T.c.destaque2 : T.c.destaque} alinhar="center" d={0.5} />
      <Circulo t={t} at={tC} cx={540} cy={yRes + 20 + (tamRes * 1.25) / 2} rx={larguraRes / 2 + (T.id === 'tela-app' ? 40 : 70)} ry={tamRes * 0.62 + (T.id === 'tela-app' ? 30 : 40)} sem={semente('circulo-conta')} />
      {c.legenda ? <Legenda t={t} at={tLeg} texto={c.legenda} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- 4. colunas

export const Colunas: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'colunas') return null;
  const cols = c.colunas.slice(0, 3);
  const nc = Math.max(2, cols.length);
  const x0 = 90;
  const largura = 900;
  const cw = largura / nc;
  const cartoes = c.cartoes.slice(0, 6).map((k, i) => ({ ...k, coluna: Math.min(nc - 1, Math.max(0, k.coluna)), vai: k.vai === undefined ? undefined : Math.min(nc - 1, Math.max(0, k.vai)), i }));
  const h = 150;
  const passoY = h + 26;
  const yCartao = TOPO + 92;
  const tAp = cartoes.map((k) => batida(c, `cartao${k.i}`, 0.04 + k.i * 0.06));
  const movem = cartoes.filter((k) => k.vai !== undefined && k.vai !== k.coluna);
  const tAnda = cartoes.map((k) => (k.vai === undefined || k.vai === k.coluna ? 9999 : batida(c, `anda${k.i}`, 0.55 + movem.indexOf(k) * 0.15)));
  // estados do quadro: o de partida e um depois de cada andada (quem anda vai para o fim da coluna de destino,
  // e quem fica na coluna de origem sobe para o lugar vago)
  const eventos = [...movem].sort((a, b) => tAnda[a.i] - tAnda[b.i] || a.i - b.i);
  const estados: { col: number; vaga: number }[][] = [];
  let colunaDe = cartoes.map((k) => k.coluna);
  let chegada = cartoes.map((k) => -1 - (cartoes.length - k.i));
  const vagas = (col: number[], ch: number[]) =>
    cartoes.map((k) => ({ col: col[k.i], vaga: cartoes.filter((o) => col[o.i] === col[k.i] && (ch[o.i] < ch[k.i] || (ch[o.i] === ch[k.i] && o.i < k.i))).length }));
  estados.push(vagas(colunaDe, chegada));
  eventos.forEach((k, n) => {
    colunaDe = colunaDe.map((v, i) => (i === k.i ? k.vai! : v));
    chegada = chegada.map((v, i) => (i === k.i ? n : v));
    estados.push(vagas(colunaDe, chegada));
  });  const tLeg = c.legenda ? batida(c, 'legenda', 0.9) : 9999;
  const esbocado = T.id === 'quadro' || T.id === 'lousa';
  const fm = fonteMao(T);
  const pos = (col: number, vaga: number) => ({ x: x0 + col * cw + 18, y: yCartao + vaga * passoY });
  const ordem = [...cartoes].sort((a, b) => (t >= tAnda[a.i] ? 1 : 0) - (t >= tAnda[b.i] ? 1 : 0) || a.i - b.i);
  return (
    <>
      <Titulo t={t} palavras={c.palavras} />
      {T.id === 'tela-app' ? <div style={{ position: 'absolute', left: 74, top: TOPO - 16, width: 932, height: BASE - TOPO + 32, borderRadius: 32, background: T.a('superficie', 0.14), border: `2px solid ${T.a('superficie', 0.3)}` }} /> : null}
      {cols.map((nome, k) => {
        const tamCab = ajustar(nome, esbocado ? 48 : 32, cw - 30, 60, esbocado ? fm.letra : 0.66, 1.1, 18).s;
        return (
          <div key={k} style={{ position: 'absolute', left: x0 + k * cw + 18, top: TOPO, width: cw - 30, fontFamily: esbocado ? fm.fontFamily : T.f.texto, fontWeight: esbocado ? 700 : 800, fontSize: tamCab, letterSpacing: esbocado ? 0 : '0.04em', color: T.id === 'tela-app' ? T.c.titulo : esbocado ? T.c.traco : T.c.texto, whiteSpace: 'nowrap', filter: T.filtro }}>
            {nome}
          </div>
        );
      })}
      {esbocado ? (
        <Desenho>
          {cols.map((_, k) => (
            <Traco key={k} d={caminhoRisco(x0 + k * cw + 14, TOPO + 68, x0 + (k + 1) * cw - 20, semente(`cab${k}`), tremor(T) * 0.4)} p={1} largura={5} opacidade={0.8} />
          ))}
          {Array.from({ length: nc - 1 }).map((_, k) => (
            <path key={k} d={`M ${x0 + (k + 1) * cw} ${TOPO - 10} C ${x0 + (k + 1) * cw + 5} ${TOPO + 300}, ${x0 + (k + 1) * cw - 5} ${TOPO + 500}, ${x0 + (k + 1) * cw + 2} ${BASE}`} fill="none" stroke={T.a('traco', 0.45)} strokeWidth={4} strokeLinecap="round" />
          ))}
        </Desenho>
      ) : (
        Array.from({ length: nc - 1 }).map((_, k) => <div key={k} style={{ position: 'absolute', left: x0 + (k + 1) * cw - 2, top: TOPO - 10, width: 4, height: BASE - TOPO + 10, background: T.id === 'tela-app' ? T.a('superficie', 0.3) : T.c.linha, borderRadius: 2 }} />)
      )}
      {ordem.map((k) => {
        // posição pelo encadeamento dos estados: cada andada leva o cartão do lugar de antes ao de depois
        let { x, y } = pos(estados[0][k.i].col, estados[0][k.i].vaga);
        let erguido = 0;
        eventos.forEach((ev, n) => {
          const alvo = pos(estados[n + 1][k.i].col, estados[n + 1][k.i].vaga);
          const ehEle = ev.i === k.i;
          const u = eo(ramp(t, tAnda[ev.i], ehEle ? 0.6 : 0.4));
          x += (alvo.x - x) * u;
          y += (alvo.y - y) * u;
          if (ehEle) {
            y -= Math.sin(Math.PI * u) * 70;
            erguido = Math.sin(Math.PI * u);
          }
        });
        const colAgora = estados[eventos.filter((ev) => t >= tAnda[ev.i] + 0.6).length][k.i].col;
        const feito = colAgora === nc - 1 && nc > 2;
        const anda = tAnda[k.i] < 9999;
        return (
          <React.Fragment key={k.i}>
            <Cartao t={t} at={tAp[k.i]} x={x} y={y} w={cw - 36} h={h} texto={k.texto} indice={k.i} erguido={erguido} feito={feito} />
            {feito && t >= tAp[k.i] ? <Icone nome="check" x={x + cw - 62} y={y + 26} tamanho={42} p={anda ? desenhar(t, tAnda[k.i] + 0.6, 0.35) : 1} cor={T.c.ok} /> : null}
          </React.Fragment>
        );
      })}
      {c.legenda ? <Legenda t={t} at={tLeg} texto={c.legenda} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- 5. tela

export const TelaCena: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  if (c.tipo !== 'tela') return null;
  const L = layoutJanela(90, TOPO, 900, BASE - TOPO);
  const tJan = batida(c, 'janela', 0.03);
  const tClique = batida(c, 'clique', 0.6);
  const tCursor = c.b.cursor ?? Math.max(tJan + 0.4, tClique - 0.8);
  const tNovo = c.tela.novo ? c.b.novo ?? tClique + 0.45 : 9999;
  const tLeg = c.legenda ? batida(c, 'legenda', 0.88) : 9999;
  const alvo = [L.botao.x + L.botao.w * 0.55, L.botao.y + L.botao.h * 0.6];
  const inicio = [L.x + L.w * 0.38, L.y + L.h * 0.86];
  const u = eo(ramp(t, tCursor, Math.max(0.3, tClique - 0.05 - tCursor)));
  const cx = inicio[0] + (alvo[0] - inicio[0]) * u;
  const cy = inicio[1] + (alvo[1] - inicio[1]) * u + Math.sin(Math.PI * u) * 40;
  const aperto = ramp(t, tClique - 0.04, 0.06) * (1 - ramp(t, tClique + 0.12, 0.12));
  return (
    <>
      <Titulo t={t} palavras={c.palavras} />
      <Janela t={t} at={tJan} L={L} endereco={EXPLICACAO.endereco} secao={c.tela.secao} botao={c.tela.botao} menu={c.tela.menu} itens={c.tela.itens} novo={c.tela.novo} tNovo={tNovo} aperto={aperto} />
      <Onda t={t} at={tClique} x={L.botao.x + L.botao.w / 2} y={L.botao.y + L.botao.h / 2} />
      {t >= tJan + 0.3 ? <Cursor x={cx} y={cy} aperto={aperto} opacidade={eo(ramp(t, tJan + 0.3, 0.3))} /> : null}
      {c.legenda ? <Legenda t={t} at={tLeg} texto={c.legenda} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- 6. final

export const Final: React.FC<PropsCena> = ({ c, voiceEnd }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'final') return null;
  const tCard = c.b.card ?? voiceEnd + 0.4;
  const tCham = batida(c, 'chamada', 0.5);
  const sai = 1 - ramp(t, tCard, 0.25);
  const sCham = t >= tCham ? spr(t, tCham, { damping: 14, stiffness: 220 }) : 0;
  const esbocado = T.id === 'quadro' || T.id === 'lousa';
  return (
    <>
      <div style={{ opacity: sai }}>
        <Titulo t={t} palavras={c.palavras} topo={520} tamanho={T.tituloMao ? 140 : 100} alturaMax={440} alinhar="center" />
        {t >= tCham ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', opacity: Math.min(1, sCham * 1.5), transform: `scale(${0.8 + 0.2 * sCham})` }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 36px',
                borderRadius: 60,
                border: `5px solid ${esbocado ? T.c.traco : T.id === 'tela-app' ? T.c.destaque : T.c.destaque}`,
                background: T.id === 'tela-app' ? T.a('superficie', 0.12) : T.id === 'post-its' ? T.c.nota1 : 'transparent',
                fontFamily: esbocado ? T.f.mao : T.f.texto,
                fontWeight: 700,
                fontSize: esbocado ? 60 : 40,
                color: T.id === 'tela-app' ? T.c.titulo : T.c.traco,
                filter: T.filtro,
              }}
            >
              comenta aqui
            </div>
          </div>
        ) : null}
      </div>
      <CardFinal t={t} at={tCard} fontes={c.fontes ?? []} assinatura={FECHO.assinatura} frase={FECHO.fraseAssinatura} marca={MARCA} avisoIA={FECHO.avisoIA} />
    </>
  );
};

// ---------------------------------------------------------------- registro e efeitos

export const CENAS: Record<CenaTempo['tipo'], React.FC<PropsCena>> = { abertura: Abertura, passos: Passos, conta: Conta, colunas: Colunas, tela: TelaCena, final: Final };

/** som do traço que se desenha no tema (caneta, giz ou marcador; na tela de app, um tique) */
const somTraco = (T: Tema) => (T.id === 'lousa' ? 'giz.wav' : T.id === 'tela-app' ? 'tique.wav' : 'caneta.wav');
/** som da caixa entrando: traço no quadro e na lousa, pop do post-it, deslize do cartão na tela de app */
const somCaixa = (T: Tema) => (T.id === 'post-its' ? 'pop.wav' : T.id === 'tela-app' ? 'deslize.wav' : somTraco(T));

/** Sons de cada cena, nos mesmos instantes das peças (o tema escolhe o som do traço e da caixa). */
export const efeitos = (c: CenaTempo, T: Tema): Efeitos => {
  const s: Som[] = [];
  const som = (at: number, arquivo: string, vol: number, off = 0) => s.push({ at, arquivo, vol, off });
  const traco = somTraco(T);
  switch (c.tipo) {
    case 'abertura': {
      const ultima = c.palavras[c.palavras.length - 1]?.at ?? c.ini;
      som(c.b.risco ?? Math.max(ultima + 0.3, c.ini + 0.4 * (c.fim - c.ini)), traco, 0.4);
      if (c.icone) som(batida(c, 'icone', 0.5), somCaixa(T), 0.35);
      break;
    }
    case 'passos': {
      const passos = c.passos.slice(0, 4);
      const tP = passos.map((_, i) => batida(c, `passo${i}`, 0.08 + i * 0.24));
      tP.forEach((at) => som(at, somCaixa(T), 0.4));
      passos.slice(1).forEach((_, i) => som(c.b[`seta${i}`] ?? Math.max(tP[i] + 0.3, tP[i + 1] - 0.35), traco, 0.28));
      if (passos.length > 1) som(c.b.circulo ?? tP[passos.length - 1] + 0.6, traco, 0.35);
      break;
    }
    case 'conta': {
      const linhas = c.linhas.slice(0, 4);
      linhas.forEach((_, i) => som(batida(c, `linha${i}`, 0.08 + i * 0.18), traco, 0.32));
      const tR = batida(c, 'resultado', 0.72);
      som(tR, T.id === 'post-its' ? 'pop.wav' : 'tique.wav', 0.38);
      som(c.b.circulo ?? tR + 0.4, traco, 0.38);
      break;
    }
    case 'colunas': {
      const cartoes = c.cartoes.slice(0, 6);
      const movem = cartoes.filter((k) => k.vai !== undefined && k.vai !== k.coluna);
      cartoes.forEach((k, i) => {
        if (i < 3) som(batida(c, `cartao${i}`, 0.04 + i * 0.06), T.id === 'post-its' ? 'pop.wav' : 'tique.wav', 0.22);
        if (k.vai !== undefined && k.vai !== k.coluna) {
          const at = batida(c, `anda${i}`, 0.55 + movem.indexOf(k) * 0.15);
          som(at, 'deslize.wav', 0.42);
          som(at + 0.58, T.id === 'post-its' ? 'pop.wav' : 'tique.wav', 0.3);
        }
      });
      break;
    }
    case 'tela': {
      som(batida(c, 'janela', 0.03), 'deslize.wav', 0.32);
      som(batida(c, 'clique', 0.6), 'clique.wav', 0.6);
      break;
    }
    case 'final':
      som(batida(c, 'chamada', 0.5), 'tique.wav', 0.3);
      // o card final entra limpo: sem efeito, só a cama descendo
      break;
  }
  return { sons: s.filter((x) => x.at >= 0 && x.at >= c.ini - 0.05) };
};
