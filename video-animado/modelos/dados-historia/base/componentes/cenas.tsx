import React from 'react';
import { eo, ramp, spr, useT } from './anima';
import { comprimento, curvaSvg, MapaDesenho, PARTES, ponto, projecao, ROTA } from './mapa';
import {
  alturaContador,
  larguraContador,
  Bloco,
  CardFinal,
  Chip,
  Circulo,
  Coluna,
  Contador,
  Desenho,
  desenhar,
  Fita,
  Legenda,
  LETRA,
  Marco,
  medirTitulo,
  Moeda,
  Pino,
  Piso,
  Recorte,
  Reticula,
  Saida,
  Texto,
  Titulo,
  Traco,
} from './pecas';
import { batida, valorEscrito, type CenaTempo } from './roteiro';
import { misturar, useTema, type Tema } from './tema';
import { FECHO, MARCA } from './universo';

// Cenas da família Dados e história, montadas pelos dados do roteiro (CenaTempo: dados da cena + tempos do
// timing.json). Os mesmos tipos de cena valem nos 4 temas: o tema troca a cara das peças, não o roteiro. O
// instante de cada peça é a batida marcada no roteiro (palavra falada) ou, sem batida, uma fração da cena (só
// a ordem visual). Grade: rótulo em y 232, título de y 300, peça principal até 1390, legenda em 1408 (até 1530).

export type PropsCena = { c: CenaTempo; voiceEnd: number };
type Som = { at: number; arquivo: string; vol: number; off?: number };
export type Efeitos = { sons: Som[] };

const BASE = 1390;
/** o contador chega ao valor em 0,7 s a partir da batida "valor" (a primeira palavra do número falado) */
const CONTA = 0.7;


// ---------------------------------------------------------------- 1. abertura

export const Abertura: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'abertura') return null;
  const topo = 300;
  const tamTitulo = T.serifado ? 116 : 104;
  const m = medirTitulo(T, c.palavras.map((p) => p.w), tamTitulo, 900, 330);
  const tV = c.valor ? batida(c, 'valor', 0.35) : 9999;
  const tSub = c.subtitulo ? batida(c, 'subtitulo', 0.6) : 9999;
  const tC = c.valor ? c.b.circulo ?? tV + 0.95 : 9999;
  const tLeg = c.legenda || c.fonte ? batida(c, 'legenda', 0.85) : 9999;
  const yNum = topo + m.alto + 90;
  const tamNum = 230;
  // com o círculo em volta, o número cabe em 780 px (o círculo fica dentro da área segura)
  const largNum = T.id === 'mapa' ? 860 : 780;
  const altoNum = c.valor ? alturaContador(c.valor, largNum, tamNum, T) : 0;
  const larg = c.valor ? larguraContador(c.valor, largNum, tamNum, T) : 0;
  const ySub = yNum + altoNum + (c.valor ? 90 : 0);
  const bob = Math.sin(t * 2.2) * 10;
  return (
    <>
      {T.id === 'isometrico' ? (
        <Desenho>
          <Piso cx={540} cy={1290} mw={420} mh={150} />
          <Bloco cx={300} cy={1290} a={54} h={84 * eo(ramp(t, c.ini + 0.2, 0.5))} cor={T.c.enfeite} />
          <Bloco cx={540} cy={1340} a={64} h={130 * eo(ramp(t, c.ini + 0.35, 0.5))} cor={T.c.barra} />
          <Bloco cx={780} cy={1290} a={46} h={64 * eo(ramp(t, c.ini + 0.5, 0.5))} cor={T.c.destaque2} />
          {t >= tV ? <Moeda cx={672} cy={1196 + bob} r={40} /> : null}
        </Desenho>
      ) : null}
      {T.id === 'linha-do-tempo' ? (
        <Desenho>
          <path d="M 150 1300 H 930" stroke={T.c.linha} strokeWidth={8} strokeLinecap="round" />
          <Traco d="M 150 1300 H 930" p={desenhar(t, c.ini + 0.3, Math.max(0.8, (tV > 999 ? c.fim : tV) - c.ini))} cor={T.c.destaque} largura={8} />
          {[150, 410, 670, 930].map((x, i) => (t >= c.ini + 0.3 + i * 0.25 ? <circle key={i} cx={x} cy={1300} r={i === 3 ? 22 : 16} fill={i === 3 ? T.c.destaque : T.c.superficie} stroke={T.c.destaque} strokeWidth={7} /> : null))}
        </Desenho>
      ) : null}
      {T.id === 'mapa' && c.valor && t >= tV ? (
        <div style={{ position: 'absolute', left: 90, top: yNum - 40, width: 900, height: altoNum + 80, borderRadius: 40, background: T.c.superficie, border: `3px solid ${T.c.linha}`, boxShadow: '0 14px 30px rgba(0,0,0,0.12)', opacity: eo(ramp(t, tV, 0.2)) }} />
      ) : null}
      <Titulo t={t} palavras={c.palavras} topo={topo} tamanho={tamTitulo} alturaMax={330} />
      {c.valor ? <Contador t={t} at={tV} valor={c.valor} x={540 - largNum / 2} y={yNum} largura={largNum} tamanho={tamNum} d={CONTA} alinhar="center" /> : null}
      {c.valor && !(T.id === 'mapa') ? <Circulo t={t} at={tC} cx={540} cy={yNum + altoNum * 0.52} rx={Math.min(462, larg / 2 + 60)} ry={altoNum / 2 + 34} sem={7} /> : null}
      {c.subtitulo ? <Texto t={t} at={tSub} texto={c.subtitulo} x={110} y={ySub} largura={860} altura={150} tamanho={52} alinhar="center" fonte={T.id === 'jornal' ? T.f.mono : T.f.texto} peso={T.id === 'jornal' ? 500 : 600} cor={T.id === 'jornal' ? T.c.texto : T.c.texto} letra={T.id === 'jornal' ? LETRA.mono : LETRA.texto} /> : null}
      <Legenda t={t} at={tLeg} texto={c.legenda} fonte={c.fonte} />
    </>
  );
};

// ---------------------------------------------------------------- 2. número com colunas

export const Colunas: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'colunas') return null;
  const cols = c.colunas.slice(0, 5);
  const n = Math.max(1, cols.length);
  const tCol = cols.map((_, i) => batida(c, `coluna${i}`, 0.15 + i * 0.13));
  const tV = c.valor ? c.b.valor ?? tCol[n - 1] : 9999;
  const tLeg = c.legenda || c.fonte ? batida(c, 'legenda', 0.85) : 9999;
  const vmax = Math.max(1e-9, ...cols.map((k) => Math.abs(k.valor)));
  const mT = medirTitulo(T, c.palavras.map((p) => p.w), T.serifado ? 84 : 76, 900, 170);
  const yNum = 300 + mT.alto + 20;
  const tamNum = 170;
  const altoNum = c.valor ? alturaContador(c.valor, 900, tamNum, T) : 0;
  const alinhar = T.id === 'isometrico' ? 'left' : 'center';
  const iso = T.id === 'isometrico';
  const bob = Math.sin(t * 2.4) * 8;
  const idRet = `ret-colunas-${T.id}`;
  // isométrico: colunas no piso em losango, de trás para a frente
  if (iso) {
    const [x0, y0, x1, y1] = [300, 1062, 780, 1168];
    const pos = cols.map((_, i) => (n === 1 ? [540, 1110] : [x0 + ((x1 - x0) * i) / (n - 1), y0 + ((y1 - y0) * i) / (n - 1)]));
    const a = n === 1 ? 80 : Math.min(80, ((x1 - x0) / (n - 1)) * 0.36);
    const hmax = 360;
    const hs = cols.map((k) => Math.max(26, (hmax * Math.abs(k.valor)) / vmax));
    const ult = n - 1;
    const topoUlt = pos[ult][1] - hs[ult] * eo(ramp(t, tCol[ult], 0.6)) - a / 2;
    return (
      <>
        <Titulo t={t} palavras={c.palavras} tamanho={76} alturaMax={170} />
        {c.valor ? <Contador t={t} at={tV} valor={c.valor} x={90} y={yNum} largura={900} tamanho={tamNum} d={CONTA} alinhar={alinhar} /> : null}
        <Desenho>
          <Piso cx={540} cy={1110} mw={450} mh={225} />
          <Bloco cx={168} cy={1112} a={40} h={46} cor={T.c.enfeite} />
          <Bloco cx={905} cy={1100} a={34} h={60} cor={T.c.destaque2} />
          {cols.map((k, i) => (
            <Coluna key={i} t={t} at={tCol[i]} x={pos[i][0]} y={pos[i][1]} largura={a * 2} altura={hs[i]} destaque={i === ult && n > 1} rotulo={k.rotulo} />
          ))}
          {t >= tCol[ult] + 0.4 ? <Moeda cx={pos[ult][0]} cy={Math.max(yNum + altoNum + 50, topoUlt - 80) + bob} r={44} /> : null}
        </Desenho>
        <Legenda t={t} at={tLeg} texto={c.legenda} fonte={c.fonte} />
      </>
    );
  }
  // chapado (linha do tempo e mapa) ou impresso (jornal): barras numa base
  const jornal = T.id === 'jornal';
  const mapa = T.id === 'mapa';
  const caixa = { x: 100, y: Math.max(660, yNum + altoNum + 40), w: 880, h: 0 };
  caixa.h = BASE - caixa.y;
  const base = caixa.y + caixa.h - 96;
  const topoBarras = caixa.y + (jornal || mapa ? 60 : 20);
  const hmax = base - topoBarras;
  const xA = caixa.x + 80;
  const xB = caixa.x + caixa.w - 80;
  const passo = (xB - xA) / n;
  const w = Math.min(150, passo * 0.62);
  const xs = cols.map((_, i) => xA + passo * (i + 0.5));
  const hs = cols.map((k) => Math.max(10, (hmax * Math.abs(k.valor)) / vmax));
  const ult = n - 1;
  const tCaixa = c.ini + 0.05;
  const tCirc = c.b.circulo ?? tCol[ult] + 0.8;
  return (
    <>
      <Titulo t={t} palavras={c.palavras} tamanho={T.serifado ? 84 : 76} alturaMax={170} />
      {c.valor ? <Contador t={t} at={tV} valor={c.valor} x={90} y={yNum} largura={900} tamanho={tamNum} d={CONTA} alinhar={alinhar} /> : null}
      {jornal ? <Recorte t={t} at={tCaixa} x={caixa.x} y={caixa.y} w={caixa.w} h={caixa.h} rot={-1.2} manchete="" foto={false} indice={9} comFita linhas={false} /> : null}
      {mapa ? <div style={{ position: 'absolute', left: caixa.x, top: caixa.y, width: caixa.w, height: caixa.h, borderRadius: 40, background: T.c.superficie, border: `3px solid ${T.c.linha}`, boxShadow: '0 14px 30px rgba(0,0,0,0.12)' }} /> : null}
      <Desenho style={jornal ? { transform: 'rotate(-1.2deg)', transformOrigin: `${caixa.x + caixa.w / 2}px ${caixa.y + caixa.h / 2}px` } : undefined}>
        {jornal ? <Reticula id={idRet} passo={12} /> : null}
        {!jornal
          ? [0.33, 0.66, 1].map((f, i) => <line key={i} x1={xA - 40} x2={xB + 40} y1={base - hmax * f} y2={base - hmax * f} stroke={T.c.linha} strokeWidth={3} strokeDasharray="10 14" />)
          : null}
        <line x1={xA - 50} x2={xB + 50} y1={base} y2={base} stroke={jornal ? T.c.tinta : T.c.linha} strokeWidth={jornal ? 5 : 6} strokeLinecap="round" />
        {cols.map((k, i) => (
          <Coluna key={i} t={t} at={tCol[i]} x={xs[i]} y={base} largura={w} altura={hs[i]} destaque={i === ult && n > 1} rotulo={k.rotulo} idPadrao={idRet} />
        ))}
      </Desenho>
      {jornal && n > 1 ? <Circulo t={t} at={tCirc} cx={xs[ult]} cy={base - hs[ult] + 10} rx={w / 2 + 50} ry={Math.min(90, hs[ult] / 2 + 30)} sem={5} /> : null}
      <Legenda t={t} at={tLeg} texto={c.legenda} fonte={c.fonte} />
    </>
  );
};

// ---------------------------------------------------------------- 3. marcos (linha do tempo)

export const Marcos: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'marcos') return null;
  const marcos = c.marcos.slice(0, 5);
  const n = Math.max(1, marcos.length);
  const tM = marcos.map((_, i) => batida(c, `marco${i}`, 0.1 + i * 0.17));
  const tLeg = c.legenda || c.fonte ? batida(c, 'legenda', 0.88) : 9999;
  const mT = medirTitulo(T, c.palavras.map((p) => p.w), T.serifado ? 92 : 80, 900, 210);
  const y0 = 300 + mT.alto + 46;
  const fim = c.legenda || c.fonte ? BASE : 1500;
  const passo = (fim - y0) / n;
  const ch = Math.min(200, passo - 26);
  const trilho = 170;
  const xc = 250;
  const wc = 750;
  const yc = marcos.map((_, i) => y0 + passo * i + ch / 2);
  // a linha desce até o último marco aceso
  let yLinha = yc[0] - 30;
  if (t >= tM[0]) {
    yLinha = yc[0];
    for (let i = 1; i < n; i++) yLinha += (yc[i] - yc[i - 1]) * eo(ramp(t, tM[i] - 0.3, 0.3));
  }
  const inicioLinha = yc[0] - 50;
  const aceso = t >= tM[0] - 0.3;
  const largura = T.id === 'jornal' ? 6 : 10;
  const caminho = (y1: number, y2: number) => (T.id === 'jornal' ? `M ${trilho} ${y1} C ${trilho + 14} ${y1 + (y2 - y1) * 0.3}, ${trilho - 14} ${y1 + (y2 - y1) * 0.7}, ${trilho} ${y2}` : `M ${trilho} ${y1} L ${trilho} ${y2}`);
  return (
    <>
      <Titulo t={t} palavras={c.palavras} tamanho={T.serifado ? 92 : 80} alturaMax={210} />
      <Desenho>
        {T.id === 'mapa' ? (
          <>
            <path d={`M ${trilho} ${inicioLinha} V ${yc[n - 1] + 40}`} stroke={T.c.superficie} strokeWidth={40} strokeLinecap="round" />
            <path d={`M ${trilho} ${inicioLinha} V ${yc[n - 1] + 40}`} stroke={T.c.linha} strokeWidth={8} strokeDasharray="8 20" strokeLinecap="round" />
          </>
        ) : T.id !== 'jornal' ? (
          <path d={`M ${trilho} ${inicioLinha} V ${yc[n - 1]}`} stroke={T.c.linha} strokeWidth={largura} strokeLinecap="round" />
        ) : null}
        {aceso ? (
          <path
            d={caminho(inicioLinha, Math.max(inicioLinha + 1, yLinha))}
            stroke={T.c.destaque}
            strokeWidth={largura}
            fill="none"
            strokeLinecap="round"
            style={T.id === 'isometrico' ? { filter: `drop-shadow(0 0 10px ${T.a('destaque', 0.8)})` } : undefined}
          />
        ) : null}
      </Desenho>
      {marcos.map((m, i) => (
        <Marco key={i} t={t} at={tM[i]} trilho={trilho} x={xc} y={yc[i] - ch / 2} w={wc} h={ch} ano={m.ano} texto={m.texto} ultimo={i === n - 1 && n > 1} indice={i} />
      ))}
      <Legenda t={t} at={tLeg} texto={c.legenda} fonte={c.fonte} />
    </>
  );
};

// ---------------------------------------------------------------- 4. rota

/** ponto ao lado da rota, perpendicular à direção dela em u (para o chip não ficar em cima do traço) */
const aoLado = (pr: ReturnType<typeof projecao>, k: number, u: number, dist: number) => {
  const a = pr.p(...ponto(ROTA[k], Math.max(0, u - 0.02)));
  const b = pr.p(...ponto(ROTA[k], Math.min(1, u + 0.02)));
  const m = pr.p(...ponto(ROTA[k], u));
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.max(1e-6, Math.hypot(dx, dy));
  return [m[0] + (dy / L) * dist, m[1] - (dx / L) * dist];
};

export const Rota: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'rota') return null;
  const pr = projecao(T);
  const n = Math.min(3, Math.max(1, c.trechos.length));
  const partes = PARTES[n];
  const tT = partes.map((_, i) => batida(c, `trecho${i}`, 0.12 + i * 0.24));
  const dur = tT.map((at, i) => (i < n - 1 ? Math.max(0.45, Math.min(1.2, tT[i + 1] - at - 0.05)) : 0.6));
  const tPino = c.b.pino ?? tT[n - 1] + dur[n - 1];
  const tLeg = c.legenda || c.fonte ? batida(c, 'legenda', 0.88) : 9999;
  const largura = T.id === 'mapa' ? 16 : 12;
  const comCartao = T.id === 'mapa';
  const mT = medirTitulo(T, c.palavras.map((p) => p.w), comCartao ? 76 : T.serifado ? 88 : 80, comCartao ? 860 : 900, 170);
  const ini = pr.p(...ROTA[0][0]);
  const fimRota = pr.p(...ROTA[2][3]);
  const tracos = partes.flatMap((curvas, i) => {
    const L = curvas.map((k) => comprimento(ROTA[k]));
    const total = L.reduce((s, x) => s + x, 0);
    const q = desenhar(t, tT[i], dur[i]) * total;
    let antes = 0;
    return curvas.map((k, j) => {
      const p = Math.max(0, Math.min(1, (q - antes) / L[j]));
      antes += L[j];
      return { k, p };
    });
  });
  const chips = partes.map((curvas, i) => {
    const texto = c.trechos[i]?.chip;
    if (!texto) return null;
    const k = curvas[curvas.length - 1];
    const [x, y] = aoLado(pr, k, 0.5, T.id === 'isometrico' ? 70 : 92);
    const at = i < n - 1 ? tT[i] + dur[i] : tPino + 0.2;
    return { texto, x, y, at };
  });
  const sombra = T.id === 'isometrico' ? { filter: `drop-shadow(0 0 12px ${T.a('destaque', 0.85)})` } : undefined;
  return (
    <>
      {T.id === 'linha-do-tempo' ? (
        <>
          <MapaDesenho T={T} idClip="clip-rota-linha" />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 640, background: `linear-gradient(180deg, ${T.c.fundo} 62%, ${T.a('fundo', 0)} 100%)` }} />
        </>
      ) : null}
      {T.id === 'jornal' ? (
        <>
          <div style={{ position: 'absolute', left: 96, top: 520, width: 888, height: 910, background: T.c.superficie, boxShadow: '6px 18px 26px rgba(0,0,0,0.35)' }} />
          <MapaDesenho T={T} idClip="clip-rota-jornal" />
          <Fita t={t} at={c.ini} x={230} y={524} rot={-9} />
          <Fita t={t} at={c.ini} x={850} y={524} rot={10} />
        </>
      ) : null}
      {T.id === 'isometrico' ? (
        <>
          <Desenho>
            <path d="M 40 1000 L 540 1250 L 540 1282 L 40 1032 Z" fill={misturar(T.c.piso, '#000000', 0.35)} />
            <path d="M 540 1250 L 1040 1000 L 1040 1032 L 540 1282 Z" fill={misturar(T.c.piso, '#000000', 0.5)} />
          </Desenho>
          <MapaDesenho T={T} idClip="clip-rota-iso" />
          <Desenho>
            <path d="M 40 1000 L 540 750 L 1040 1000 L 540 1250 Z" fill="none" stroke={T.c.linha} strokeWidth={4} />
          </Desenho>
        </>
      ) : null}
      {comCartao ? <div style={{ position: 'absolute', left: 70, top: 292, width: 940, height: mT.alto + 64, borderRadius: 40, background: T.c.superficie, border: `3px solid ${T.c.linha}`, boxShadow: '0 14px 30px rgba(0,0,0,0.12)' }} /> : null}
      <Titulo t={t} palavras={c.palavras} topo={comCartao ? 324 : 300} esquerda={comCartao ? 110 : 90} largura={comCartao ? 860 : 900} tamanho={comCartao ? 76 : T.serifado ? 88 : 80} alturaMax={170} cor={comCartao ? T.c.tinta : undefined} />
      <Desenho style={sombra}>
        {tracos.map(({ k, p }) => (p > 0 ? <Traco key={k} d={curvaSvg(pr, ROTA[k])} p={p} cor={T.c.destaque} largura={largura} /> : null))}
      </Desenho>
      <Saida t={t} at={Math.max(c.ini, tT[0] - 0.25)} x={ini[0]} y={ini[1]} />
      <Pino t={t} at={tPino} x={fimRota[0]} y={fimRota[1]} tamanho={T.id === 'isometrico' ? 84 : 100} />
      {c.chegada ? (
        <Texto
          t={t}
          at={tPino + 0.25}
          texto={c.chegada}
          x={Math.max(80, fimRota[0] - 470)}
          y={fimRota[1] - 150}
          largura={400}
          altura={90}
          tamanho={36}
          peso={800}
          alinhar="right"
          cor={T.id === 'isometrico' ? T.c.titulo : T.c.tinta}
          letra={LETRA.textoForte}
          meio
          caixa={T.id !== 'isometrico'}
        />
      ) : null}
      {chips.map((k, i) => (k ? <Chip key={i} t={t} at={k.at} x={k.x} y={k.y} texto={k.texto} /> : null))}
      <Legenda t={t} at={tLeg} texto={c.legenda} fonte={c.fonte} />
    </>
  );
};

// ---------------------------------------------------------------- 5. recortes

const LAYOUT_RECORTES: Record<number, [number, number, number, number, number][]> = {
  1: [[130, 0, 820, 820, -2]],
  2: [
    [90, 0, 640, 440, -3],
    [380, 400, 600, 440, 4],
  ],
  3: [
    [90, 0, 600, 400, -4],
    [430, 300, 560, 360, 5],
    [110, 560, 560, 300, -2],
  ],
};

export const Recortes: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'recortes') return null;
  const recortes = c.recortes.slice(0, 3);
  const n = Math.max(1, recortes.length);
  const tR = recortes.map((_, i) => batida(c, `recorte${i}`, 0.12 + i * 0.2));
  const tLeg = c.legenda || c.fonte ? batida(c, 'legenda', 0.9) : 9999;
  const tamTitulo = T.serifado ? 128 : 104;
  const mT = medirTitulo(T, c.palavras.map((p) => p.w), tamTitulo, 900, 190);
  const ySub = 300 + mT.alto + 6;
  const tamSub = c.sub ? Math.max(20, Math.min(30, 900 / (LETRA.mono * 1.15 * Math.max(1, c.sub.length)))) : 0;
  const y0 = Math.max(540, ySub + (c.sub ? tamSub * 1.4 + 40 : 30));
  const fim = c.legenda || c.fonte ? 1380 : 1490;
  const lay = LAYOUT_RECORTES[n];
  const altoLayout = Math.max(...lay.map(([, y, , h]) => y + h));
  const k = Math.min(1, (fim - y0) / altoLayout);
  const caixas = lay.map(([x, y, w, h, rot]) => ({ x, y: y0 + y * k, w, h: h * k, rot }));
  const circ = c.circulo;
  const alvo = circ ? caixas[Math.max(0, Math.min(n - 1, circ.recorte ?? n - 1))] : null;
  const tC = circ ? c.b.circulo ?? tR[n - 1] + 0.8 : 9999;
  return (
    <>
      <Titulo t={t} palavras={c.palavras} tamanho={tamTitulo} alturaMax={190} alinhar="center" cor={T.id === 'jornal' ? T.c.titulo : undefined} />
      {c.sub ? (
        <div style={{ position: 'absolute', left: 90, width: 900, top: ySub, textAlign: 'center', fontFamily: T.f.mono, fontWeight: 500, fontSize: tamSub, letterSpacing: '0.14em', color: T.c.texto, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: eo(ramp(t, c.palavras[c.palavras.length - 1]?.at ?? c.ini, 0.4)) }}>
          {c.sub}
        </div>
      ) : null}
      {recortes.map((r, i) => (
        <Recorte key={i} t={t} at={tR[i]} x={caixas[i].x} y={caixas[i].y} w={caixas[i].w} h={caixas[i].h} rot={caixas[i].rot} manchete={r.manchete} foto={r.foto !== false} indice={i} />
      ))}
      {circ && alvo ? (
        <Circulo t={t} at={tC} cx={Math.min(900, alvo.x + alvo.w * 0.84)} cy={Math.min(1380 - 100, alvo.y + alvo.h * 0.86)} rx={Math.min(130, alvo.w * 0.2)} ry={Math.min(100, alvo.h * 0.26)} palavra={circ.palavra} sem={3} />
      ) : null}
      <Legenda t={t} at={tLeg} texto={c.legenda} fonte={c.fonte} />
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
  return (
    <>
      <div style={{ opacity: sai }}>
        <Titulo t={t} palavras={c.palavras} topo={520} tamanho={T.serifado ? 120 : 104} alturaMax={440} alinhar="center" />
        {t >= tCham ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', opacity: Math.min(1, sCham * 1.5), transform: `scale(${0.8 + 0.2 * sCham})` }}>
            <div
              style={{
                padding: '18px 40px',
                borderRadius: 60,
                background: T.c.etiqueta,
                color: T.c.sobre,
                fontFamily: T.f.texto,
                fontWeight: 800,
                fontSize: 42,
                boxShadow: '0 10px 22px rgba(0,0,0,0.22)',
                transform: T.id === 'jornal' ? 'rotate(-2deg)' : undefined,
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

export const CENAS: Record<CenaTempo['tipo'], React.FC<PropsCena>> = { abertura: Abertura, colunas: Colunas, marcos: Marcos, rota: Rota, recortes: Recortes, final: Final };

/** Sons de cada cena, nos mesmos instantes das peças: tique do contador (um a cada 0,1 s enquanto conta),
 *  subida da coluna, pop do marco e do pino, risco da rota, papel caindo e risco de caneta do círculo. */
export const efeitos = (c: CenaTempo, _T: Tema): Efeitos => {
  const s: Som[] = [];
  const som = (at: number, arquivo: string, vol: number, off = 0) => s.push({ at, arquivo, vol, off });
  const contagem = (at: number) => {
    for (let k = 0; k < 7; k++) som(at + k * 0.1, 'tique.wav', 0.3 - k * 0.03);
  };
  switch (c.tipo) {
    case 'abertura': {
      if (c.valor) {
        const tV = batida(c, 'valor', 0.35);
        contagem(tV);
        som(c.b.circulo ?? tV + 0.95, 'caneta.wav', 0.4);
      }
      break;
    }
    case 'colunas': {
      const cols = c.colunas.slice(0, 5);
      const tCol = cols.map((_, i) => batida(c, `coluna${i}`, 0.15 + i * 0.13));
      tCol.forEach((at) => som(at, 'sobe.wav', 0.38));
      if (c.valor) contagem(c.b.valor ?? tCol[cols.length - 1]);
      break;
    }
    case 'marcos':
      c.marcos.slice(0, 5).forEach((_, i) => som(batida(c, `marco${i}`, 0.1 + i * 0.17), 'pop.wav', 0.42));
      break;
    case 'rota': {
      const n = Math.min(3, Math.max(1, c.trechos.length));
      const tT = Array.from({ length: n }).map((_, i) => batida(c, `trecho${i}`, 0.12 + i * 0.24));
      tT.forEach((at) => som(at, 'rota.wav', 0.4));
      const durUlt = 0.6;
      som(c.b.pino ?? tT[n - 1] + durUlt, 'pop.wav', 0.45);
      break;
    }
    case 'recortes': {
      const rs = c.recortes.slice(0, 3);
      const tR = rs.map((_, i) => batida(c, `recorte${i}`, 0.12 + i * 0.2));
      tR.forEach((at) => som(at, 'papel.wav', 0.5));
      if (c.circulo) som(c.b.circulo ?? tR[rs.length - 1] + 0.8, 'caneta.wav', 0.42);
      break;
    }
    case 'final':
      som(batida(c, 'chamada', 0.5), 'tique.wav', 0.3);
      break;
  }
  return { sons: s.filter((x) => x.at >= 0 && x.at >= c.ini - 0.05) };
};
