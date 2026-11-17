import React from 'react';
import { bezier, eo, fadeOut, focus, pop, ramp, useT } from './anima';
import { useTema } from './tema';
import { Card, CardFinal, Carimbo, CartaoFonte, Contador, Dado, Digitando, Fio, Grafico, LinhaDoTempo, Mono, No, Polaroid, Selo, Titulo, Traco, yOmbros } from './pecas';
import { batida, type CenaTempo } from './roteiro';
import { FECHO, MARCA } from './universo';

// Cenas de exemplo do dossiê, montadas pelos dados do roteiro (CenaTempo: dados da cena + tempos do timing.json).
// Cada cena usa as peças de pecas.tsx; o instante de cada peça é a batida marcada no roteiro (palavra falada)
// ou, sem batida, uma fração da cena (só a ordem visual). Nada de tempo digitado à mão.
// Grade: título de y 300 a ~560, peça principal de 560 a 1300, cards até 1440, faixa em 1468.
// Carimbo de acusação nunca sobre o rosto da silhueta: fica abaixo de fimDoRosto() (ombros e ficha) ou ao lado.

export type PropsCena = { c: CenaTempo; voiceEnd: number };
type Som = { at: number; arquivo: string; vol: number; off?: number };
export type Efeitos = { golpes: number[]; batidas: number[]; sons: Som[] };

const C = 540;

// ---------------------------------------------------------------- 1. gancho

export const Gancho: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'gancho') return null;
  const tRot = batida(c, 'rotulo', 0.18);
  const tVal = batida(c, 'valor', 0.28);
  const tLeg = tVal + 0.8;
  const tPes = c.pessoa ? batida(c, 'pessoa', 0.55) : 9999;
  const tCar = c.carimbo ? batida(c, 'carimbo', 0.75) : 9999;
  const sobe = eo(ramp(t, tPes - 0.05, 0.5));
  return (
    <>
      <Titulo t={t} palavras={c.palavras} alturaMax={230} />
      <div style={{ position: 'absolute', left: 100, right: 100, top: 600 - sobe * 20, textAlign: 'center', transform: `scale(${1 - 0.4 * sobe})`, transformOrigin: '50% 0%' }}>
        {c.rotulo && t >= tRot ? (
          <div style={pop(t, tRot, 30)}>
            <Mono tamanho={34}>{c.rotulo}</Mono>
          </div>
        ) : null}
        {c.valor ? (
          <div style={{ marginTop: 10, minHeight: 230 }}>
            <Contador t={t} at={tVal} valor={c.valor} tamanho={230} />
          </div>
        ) : null}
        {c.valor?.legenda && t >= tLeg ? (
          <div style={{ marginTop: 14, ...pop(t, tLeg, 20) }}>
            <Mono tamanho={30}>{c.valor.legenda}</Mono>
          </div>
        ) : null}
      </div>
      {c.linha ? (
        <div style={{ position: 'absolute', left: 110, right: 110, top: 1180, opacity: fadeOut(t, tPes - 0.2, 0.3) }}>
          <Digitando t={t} at={batida(c, 'linha', 0.03)} texto={c.linha} />
          <div style={{ marginTop: 18 }}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ height: 18, marginBottom: 12, background: T.escuro ? T.c.fundo2 : T.c.superficie, border: `1px solid ${T.a('claro', 0.3)}`, width: `${eo(ramp(t, batida(c, 'linha', 0.03) + 1.2 + k * 0.35, 0.35)) * [620, 480, 700][k]}px` }} />
            ))}
          </div>
        </div>
      ) : null}
      {c.pessoa ? <Polaroid t={t} at={tPes} x={C} y={1075} w={370} nome={c.pessoa.nome} papel={c.pessoa.papel} foto={c.pessoa.foto} etiqueta={c.pessoa.etiqueta} rot={4} id="g" /> : null}
      {c.carimbo ? (
        <Carimbo t={t} at={tCar} x={C} y={yOmbros(1075, 370)} tamanho={50} rot={-5} largura={760}>
          {c.carimbo}
        </Carimbo>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- 2. ficha

export const Ficha: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'ficha') return null;
  const tPes = batida(c, 'pessoa', 0.05);
  const tCampos = batida(c, 'campos', 0.3);
  const marcos = (c.marcos ?? []).map((m, i) => ({ ...m, at: batida(c, `marco${i}`, 0.55 + i * 0.1) }));
  const tMarcos = marcos.length ? marcos[0].at : 9999;
  const tCar = c.carimbo ? batida(c, 'carimbo', 0.45) : 9999;
  const W_ = 440;
  const Y = 850;
  return (
    <>
      <Titulo t={t} palavras={c.palavras} alturaMax={200} />
      <Polaroid t={t} at={tPes} x={C} y={Y} w={W_} nome={c.pessoa.nome} papel={c.pessoa.papel} foto={c.pessoa.foto} etiqueta={c.pessoa.etiqueta} rot={-3} id="f" />
      {c.campos?.length ? (
        <div style={{ opacity: fadeOut(t, tMarcos - 0.1, 0.2) }}>
          <Card t={t} at={tCampos} x={C} y={1170} w={820}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 30 }}>
              {c.campos.slice(0, 3).map((k, i) => (
                <div key={i} style={{ textAlign: i === 0 ? 'left' : 'right', flex: 1, minWidth: 0 }}>
                  <Dado rotulo={k.rotulo} valor={k.valor} tamanho={40} cabe={14} cor={i === 0 ? T.c.titulo : T.c.claro} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
      <LinhaDoTempo t={t} topo={1190} marcos={marcos} />
      {c.carimbo ? (
        <Carimbo t={t} at={tCar} x={C} y={yOmbros(Y, W_)} tamanho={52} rot={5} largura={740}>
          {c.carimbo}
        </Carimbo>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- 3. ligação

export const Ligacao: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'ligacao') return null;
  const tA = batida(c, 'de', 0.02);
  const tB = batida(c, 'para', 0.08);
  const tFio = batida(c, 'fio', 0.15);
  const cards = (c.cards ?? []).slice(0, 2).map((k, i) => ({ ...k, at: batida(c, `card${i}`, 0.3 + i * 0.15) }));
  const tSelo = c.selo ? batida(c, 'selo', 0.75) : 9999;
  const tCar = c.carimbo ? batida(c, 'carimbo', 0.6) : 9999;
  const a = { x: 265, y: 700, w: 260 };
  const b = { x: 720, y: 880, w: 400 };
  return (
    <>
      <Titulo t={t} palavras={c.palavras} alturaMax={180} />
      <Fio t={t} at={tFio} de={[a.x + a.w * 0.48, a.y + a.w * 0.15]} para={[b.x - b.w * 0.48, b.y - b.w * 0.05]} />
      <Polaroid t={t} at={tA} x={a.x} y={a.y} w={a.w} nome={c.de.nome} papel={c.de.papel} foto={c.de.foto} rot={-6} apagada={0.9} id="la" />
      <Polaroid t={t} at={tB} x={b.x} y={b.y} w={b.w} nome={c.para.nome} papel={c.para.papel} foto={c.para.foto} etiqueta={c.para.etiqueta} rot={3} id="lb" />
      {cards[0] ? (
        <Card t={t} at={cards[0].at} x={320} y={1155} w={420} cor={T.c.destaque2}>
          <Dado rotulo={cards[0].rotulo} valor={cards[0].valor} sub={cards[0].sub} tamanho={40} cabe={16} />
        </Card>
      ) : null}
      {cards[1] ? (
        <Card t={t} at={cards[1].at} x={765} y={1225} w={410} cor={T.c.ouro}>
          <Dado rotulo={cards[1].rotulo} valor={cards[1].valor} sub={cards[1].sub} tamanho={50} cabe={11} cor={T.c.ouro} />
        </Card>
      ) : null}
      {c.carimbo ? (
        <Carimbo t={t} at={tCar} x={b.x - 10} y={yOmbros(b.y, b.w)} tamanho={44} rot={-5} largura={500}>
          {c.carimbo}
        </Carimbo>
      ) : null}
      {c.selo && t >= tSelo ? (
        <div style={{ position: 'absolute', left: 100, right: 100, top: 1385, display: 'flex', justifyContent: 'center', ...pop(t, tSelo, 30) }}>
          <Selo cor={T.c.claro} tamanho={28}>
            {c.selo}
          </Selo>
        </div>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- 4. rota

const POS_NOS: [number, number][] = [
  [250, 660],
  [640, 1110],
  [840, 720],
  [420, 960],
];

export const Rota: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'rota') return null;
  const nos = c.nos.slice(0, 4).map((n, i) => ({ ...n, at: batida(c, `no${i}`, 0.08 + i * 0.18), p: POS_NOS[i] }));
  const segs = nos.slice(1).map((n, i) => {
    const a = nos[i].p;
    const b = n.p;
    const c1 = [a[0] + (b[0] - a[0]) * 0.45, a[1]];
    const c2 = [b[0] - (b[0] - a[0]) * 0.1, b[1] - (b[1] - a[1]) * 0.35];
    const ultimo = i === nos.length - 2;
    return { a, b, c1, c2, ini: nos[i].at + 0.1, d: Math.max(0.5, n.at - nos[i].at), cor: ultimo && nos.length > 2 ? T.c.alerta : T.c.destaque, ultimo };
  });
  const tBloq = c.bloqueio ? batida(c, 'bloqueio', 0.72) : 9999;
  const tCard = c.card ? batida(c, 'card', 0.82) : 9999;
  const grade = T.escuro ? T.a('destaque', 0.07) : T.a('tinta', 0.08);
  const meio = segs.length ? bezier(segs[segs.length - 1].a, segs[segs.length - 1].c1, segs[segs.length - 1].c2, segs[segs.length - 1].b, 0.5) : [760, 900];
  return (
    <>
      <Titulo t={t} palavras={c.palavras} alturaMax={190} />
      <svg style={{ position: 'absolute', inset: 0 }} width={1080} height={1920}>
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={'h' + i} x1={80} x2={1000} y1={560 + i * 85} y2={560 + i * 85} stroke={grade} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={'v' + i} y1={560} y2={1240} x1={80 + i * 92} x2={80 + i * 92} stroke={grade} />
        ))}
        {segs.map((s, i) => (t >= s.ini ? <Traco key={i} d={`M${s.a[0]} ${s.a[1]} C ${s.c1[0]} ${s.c1[1]}, ${s.c2[0]} ${s.c2[1]}, ${s.b[0]} ${s.b[1]}`} p={eo(ramp(t, s.ini, s.d))} cor={s.cor} w={s.ultimo ? 6 : 5} /> : null))}
        {segs.map((s, i) =>
          ramp(t, s.ini, s.d) >= 1
            ? [0, 0.33, 0.66].map((o, k) => {
                const [px, py] = bezier(s.a, s.c1, s.c2, s.b, (t * 0.45 + o) % 1);
                return <rect key={`${i}-${k}`} x={px - 11} y={py - 11} width={22} height={22} rx={3} fill={s.cor} style={{ filter: `drop-shadow(0 0 10px ${s.cor})` }} />;
              })
            : null,
        )}
      </svg>
      {nos.map((n, i) => (
        <No key={i} t={t} at={n.at} x={n.p[0]} y={n.p[1]} nome={n.nome} sub={n.sub} cor={i === nos.length - 1 && nos.length > 2 ? T.c.alerta : i === 1 ? T.c.destaque2 : T.c.destaque} />
      ))}
      {c.bloqueio && t >= tBloq ? (
        <div style={{ position: 'absolute', left: Math.max(330, Math.min(700, meio[0])), top: meio[1], transform: 'translate(-50%,-50%) rotate(-12deg)' }}>
          <div style={focus(t, tBloq, 0.2)}>
            <div style={{ padding: '10px 18px', border: `4px solid ${T.c.alerta}`, borderRadius: 4, background: T.escuro ? T.a('fundo', 0.88) : T.a('papel', 0.92), fontFamily: T.f.texto, fontWeight: 900, fontSize: Math.min(30, 560 / (0.62 * c.bloqueio.length + 2)), color: T.c.alerta, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
              ✕ {c.bloqueio}
            </div>
          </div>
        </div>
      ) : null}
      {c.card ? (
        <Card t={t} at={tCard} x={C} y={1285} w={820} cor={T.c.alerta}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ width: 64, height: 80, border: `3px solid ${T.c.claro}`, borderRadius: 4, position: 'relative', flexShrink: 0 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ position: 'absolute', left: 10, right: 10, top: 14 + i * 14, height: 4, background: T.c.claro, opacity: 0.6 }} />
              ))}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: Math.min(38, 1200 / Math.max(1, c.card.titulo.length)), lineHeight: 1.1, color: T.c.titulo }}>{c.card.titulo}</div>
              {c.card.sub ? (
                <Mono tamanho={24} cor={T.c.alertaSuave}>
                  {c.card.sub}
                </Mono>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- 5. tombo

export const Tombo: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'tombo') return null;
  const tQueda = batida(c, 'queda', 0.05);
  const tVal = batida(c, 'valor', 0.45);
  return (
    <>
      <Titulo t={t} palavras={c.palavras} alturaMax={140} />
      <div style={{ position: 'absolute', left: 105, right: 105, top: 490, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: ramp(t, tQueda, 0.3) }}>
        <Mono tamanho={26}>{c.rotulo ?? '// VARIAÇÃO'}</Mono>
        <Mono tamanho={26} cor={T.c.alertaSuave}>
          ● ▼
        </Mono>
      </div>
      <Grafico t={t} at={tQueda} topo={555} d={Math.max(1.2, tVal - tQueda)} />
      <div style={{ position: 'absolute', left: 100, right: 100, top: 1160, textAlign: 'center' }}>
        <Contador t={t} at={tVal} valor={c.valor} tamanho={170} d={0.6} />
        {c.valor.legenda && t >= tVal + 0.3 ? (
          <div style={{ marginTop: 14, ...pop(t, tVal + 0.3, 20) }}>
            <Mono tamanho={28}>{c.valor.legenda}</Mono>
          </div>
        ) : null}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- 6. linha do tempo (vertical)

export const Linha: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'linha') return null;
  const marcos = c.marcos.slice(0, 5).map((m, i) => ({ ...m, at: batida(c, `marco${i}`, 0.12 + i * 0.16) }));
  const passo = Math.min(230, 780 / Math.max(1, marcos.length));
  const y0 = 640;
  const fimLinha = y0 + passo * (marcos.length - 1);
  const ultimoAceso = marcos.filter((m) => t >= m.at).length;
  const p = marcos.length > 1 ? eo(ramp(t, marcos[0].at, Math.max(0.5, marcos[marcos.length - 1].at - marcos[0].at))) : 1;
  return (
    <>
      <Titulo t={t} palavras={c.palavras} alturaMax={200} />
      <svg style={{ position: 'absolute', inset: 0 }} width={1080} height={1920}>
        <line x1={190} x2={190} y1={y0} y2={fimLinha} stroke={T.escuro ? T.a('claro', 0.15) : T.a('tinta', 0.12)} strokeWidth={4} />
        {t >= (marcos[0]?.at ?? 9999) ? <line x1={190} x2={190} y1={y0} y2={y0 + (fimLinha - y0) * p} stroke={T.c.destaque} strokeWidth={4} /> : null}
      </svg>
      {marcos.map((m, i) => {
        const cor = m.alerta ? T.c.alerta : i === ultimoAceso - 1 ? T.c.destaque : T.c.claro;
        return t >= m.at ? (
          <div key={i} style={{ position: 'absolute', left: 160, right: 100, top: y0 + i * passo - 30, display: 'flex', alignItems: 'flex-start', gap: 36, ...pop(t, m.at, 30) }}>
            <div style={{ width: 60, height: 60, borderRadius: 30, background: T.escuro ? T.c.fundo : T.c.fundo, border: `6px solid ${cor}`, boxShadow: `0 0 24px ${cor}`, flexShrink: 0, boxSizing: 'border-box' }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: T.f.mono, fontWeight: 600, fontSize: 40, color: m.alerta ? T.c.alerta : T.c.titulo, lineHeight: 1.05 }}>{m.data}</div>
              <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: Math.min(36, 1500 / Math.max(1, m.texto.length)), color: T.c.texto, lineHeight: 1.2 }}>{m.texto}</div>
            </div>
          </div>
        ) : null;
      })}
    </>
  );
};

// ---------------------------------------------------------------- 7. fonte

export const Fonte: React.FC<PropsCena> = ({ c }) => {
  const t = useT();
  if (c.tipo !== 'fonte') return null;
  const fontes = c.fontes.slice(0, 3).map((f, i) => ({ ...f, at: batida(c, `fonte${i}`, 0.2 + i * 0.2) }));
  return (
    <>
      <Titulo t={t} palavras={c.palavras} alturaMax={200} />
      <div style={{ position: 'absolute', left: 110, top: 600 }}>
        <Digitando t={t} at={c.ini + 0.1} texto="> conferindo as fontes" />
      </div>
      {fontes.map((f, i) => (
        <CartaoFonte key={i} t={t} at={f.at} x={C} y={690 + i * 230} w={850} veiculo={f.veiculo} data={f.data} texto={f.texto} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- 8. final

export const Final: React.FC<PropsCena> = ({ c, voiceEnd }) => {
  const t = useT();
  const T = useTema();
  if (c.tipo !== 'final') return null;
  const tCard = c.b.card ?? voiceEnd + 0.4;
  const tCham = batida(c, 'chamada', 0.5);
  const fim = tCard;
  // o selo (ex.: "a empresa nega") ocupa a tela até a pergunta ser falada
  const tSelo = c.selo ? batida(c, 'selo', 0.02) : 9999;
  const tPerg = c.palavras[0]?.at ?? c.ini;
  return (
    <>
      {c.selo && t >= tSelo ? (
        <div style={{ position: 'absolute', left: 100, right: 100, top: 760, display: 'flex', justifyContent: 'center', ...pop(t, tSelo, 40), opacity: Number(pop(t, tSelo, 40).opacity ?? 1) * fadeOut(t, tPerg - 0.1, 0.2) }}>
          <Selo cor={T.c.claro} tamanho={40} style={{ padding: '20px 34px' }}>
            {c.selo}
          </Selo>
        </div>
      ) : null}
      <div style={{ opacity: fadeOut(t, fim, 0.25) }}>
        <Titulo t={t} palavras={c.palavras} topo={560} tamanho={128} alturaMax={420} />
        {t >= tCham ? (
          <div style={{ position: 'absolute', left: 100, right: 100, top: 1080, display: 'flex', justifyContent: 'center', ...pop(t, tCham, 30) }}>
            <Selo cor={T.c.claro} tamanho={34} style={{ padding: '16px 30px' }}>
              <svg width={34} height={30} viewBox="0 0 34 30">
                <path d="M4 3 H30 a3 3 0 0 1 3 3 V18 a3 3 0 0 1 -3 3 H14 L7 27 V21 H4 a3 3 0 0 1 -3 -3 V6 a3 3 0 0 1 3 -3 Z" fill="none" stroke="currentColor" strokeWidth={2.6} />
              </svg>
              comenta aqui
            </Selo>
          </div>
        ) : null}
      </div>
      <CardFinal t={t} at={tCard} fontes={c.fontes} citaPessoas={c.cita_pessoas ?? true} assinatura={FECHO.assinatura} frase={FECHO.fraseAssinatura} marca={MARCA} avisoIA={FECHO.avisoIA} />
    </>
  );
};

// ---------------------------------------------------------------- registro e efeitos

export const CENAS: Record<CenaTempo['tipo'], React.FC<PropsCena>> = { gancho: Gancho, ficha: Ficha, ligacao: Ligacao, rota: Rota, tombo: Tombo, linha: Linha, fonte: Fonte, final: Final };

/** Golpes (boom: punch forte, tremida e clarão), batidas (hit: punch leve) e sons de cada cena, nos mesmos instantes das peças. */
export const efeitos = (c: CenaTempo, voiceEnd: number): Efeitos => {
  const g: number[] = [];
  const h: number[] = [];
  const s: Som[] = [];
  const som = (at: number, arquivo: string, vol: number, off = 0) => s.push({ at, arquivo, vol, off });
  switch (c.tipo) {
    case 'gancho':
      if (c.rotulo) som(batida(c, 'rotulo', 0.18), 'blip.wav', 0.25);
      if (c.valor) {
        g.push(batida(c, 'valor', 0.28));
        som(batida(c, 'valor', 0.28), 'boom.wav', 0.55);
      }
      if (c.linha) som(batida(c, 'linha', 0.03), 'typing_short.wav', 0.2);
      if (c.pessoa) {
        h.push(batida(c, 'pessoa', 0.55));
        som(batida(c, 'pessoa', 0.55), 'whoosh_soft.wav', 0.3, -4);
      }
      if (c.carimbo) {
        h.push(batida(c, 'carimbo', 0.75));
        som(batida(c, 'carimbo', 0.75), 'stamp.wav', 0.6);
      }
      break;
    case 'ficha':
      h.push(batida(c, 'pessoa', 0.05));
      som(batida(c, 'pessoa', 0.05), 'hit.wav', 0.32);
      if (c.campos?.length) som(batida(c, 'campos', 0.3), 'tick.wav', 0.25);
      (c.marcos ?? []).forEach((m, i) => som(batida(c, `marco${i}`, 0.55 + i * 0.1), m.alerta ? 'error.wav' : 'tick.wav', m.alerta ? 0.3 : 0.25));
      if (c.carimbo) {
        g.push(batida(c, 'carimbo', 0.45));
        som(batida(c, 'carimbo', 0.45), 'stamp.wav', 0.6);
        som(batida(c, 'carimbo', 0.45) - 2.5, 'riser.wav', 0.22);
      }
      break;
    case 'ligacao':
      som(batida(c, 'de', 0.02), 'whoosh_soft.wav', 0.25, -4);
      h.push(batida(c, 'para', 0.08));
      som(batida(c, 'para', 0.08), 'hit.wav', 0.32);
      som(batida(c, 'fio', 0.15), 'thump.wav', 0.35);
      (c.cards ?? []).slice(0, 2).forEach((_, i) => som(batida(c, `card${i}`, 0.3 + i * 0.15), 'tick.wav', 0.25));
      if (c.carimbo) {
        h.push(batida(c, 'carimbo', 0.6));
        som(batida(c, 'carimbo', 0.6), 'stamp.wav', 0.6);
      }
      if (c.selo) som(batida(c, 'selo', 0.75), 'blip.wav', 0.25);
      break;
    case 'rota':
      c.nos.slice(0, 4).forEach((_, i) => som(batida(c, `no${i}`, 0.08 + i * 0.18), 'tick.wav', 0.25));
      if (c.bloqueio) {
        h.push(batida(c, 'bloqueio', 0.72));
        som(batida(c, 'bloqueio', 0.72), 'glitch.wav', 0.4);
        som(batida(c, 'bloqueio', 0.72), 'error.wav', 0.25);
      }
      if (c.card) som(batida(c, 'card', 0.82), 'typing_short.wav', 0.22);
      break;
    case 'tombo':
      som(batida(c, 'valor', 0.45) - 2.5, 'riser.wav', 0.3);
      g.push(batida(c, 'valor', 0.45));
      som(batida(c, 'valor', 0.45), 'boom.wav', 0.55);
      som(batida(c, 'valor', 0.45), 'counter_roll.wav', 0.3);
      break;
    case 'linha':
      c.marcos.slice(0, 5).forEach((m, i) => {
        const at = batida(c, `marco${i}`, 0.12 + i * 0.16);
        if (m.alerta) h.push(at);
        som(at, m.alerta ? 'hit.wav' : 'tick.wav', m.alerta ? 0.32 : 0.25);
      });
      break;
    case 'fonte':
      som(c.ini + 0.1, 'typing_short.wav', 0.2);
      c.fontes.slice(0, 3).forEach((_, i) => som(batida(c, `fonte${i}`, 0.2 + i * 0.2), 'blip.wav', 0.25));
      break;
    case 'final': {
      if (c.selo) som(batida(c, 'selo', 0.02), 'tick.wav', 0.25);
      som(batida(c, 'chamada', 0.5), 'blip.wav', 0.25);
      // o card final entra limpo: sem efeito nem punch, só a cama descendo
      break;
    }
  }
  return { golpes: g.filter((x) => x >= c.ini - 0.05), batidas: h.filter((x) => x >= c.ini - 0.05), sons: s.filter((x) => x.at >= 0) };
};
