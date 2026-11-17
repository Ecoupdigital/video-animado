import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COR } from './cores';
import { FONTE_MAO, FONTE_TEXTO, FONTE_TITULO } from './fontes';
import { FECHO, MARCA, PESSOAS, TEMPO } from './universo';

// Textos do universo e a grade da tela (1080 x 1920):
//   y 130 a 230   selo do tempo (rótulo do antes ou do agora, das respostas, e o detalhe do episódio)
//   y 300 a 620   legenda (frase inteira, palavra falada no destaque profundo)
//   y 700 a 1640  personagens (pés em 1640); o caderno e o celular grande ocupam o meio quando aparecem
//   y 1500 a 1600 cartão da fonte (à esquerda, longe dos botões do Instagram)
//   y 1650 a 1920 área dos botões e da legenda do Instagram: nada importante aqui
// Margem lateral de 70 px; nada essencial à direita de x = 960 abaixo de y = 1100.
// Nenhum texto de marca fixo: marca, fecho e rótulos vêm de componentes/universo.ts ou de prop.
// Selo, legenda, caderno e fecho ficam sempre fora da <Lembranca> (não ficam em sépia).

/**
 * Tamanho de fonte para o texto caber numa linha de `largura` px.
 * `k` é a largura média de um caractere em fração do tamanho (DM Sans normal ~0.55, caixa alta ~0.66).
 */
export const tamanhoQueCabe = (texto: string, largura: number, max: number, min = max * 0.45, k = 0.55): number =>
  Math.max(min, Math.min(max, largura / Math.max(1, texto.length * k)));

// ---------------------------------------------------------------- selo do tempo

/**
 * Selo do tempo da cena: "<rótulo> · <detalhe>". O rótulo vem das respostas (antes_e_agora; sem ele,
 * ANTES e AGORA) e o detalhe é do episódio, por prop. Rótulo e detalhe longos encolhem e, no limite, quebram.
 */
export const SeloTempo: React.FC<{ tempo: 'antes' | 'agora'; detalhe?: string; rotulo?: string; inicio?: number }> = ({ tempo, detalhe = '', rotulo, inicio = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inicio, fps, config: { damping: 18, stiffness: 140 } });
  const antes = tempo === 'antes';
  const r = (rotulo ?? (antes ? TEMPO.rotuloAntes : TEMPO.rotuloAgora)).toUpperCase();
  // rótulo em caixa alta com espaçamento (~0.78 da fonte por letra) e detalhe normal (~0.52)
  const largura = r.length * 0.78 + detalhe.length * 0.52 + (detalhe ? 2 : 0);
  const tamanho = Math.max(24, Math.min(34, 800 / Math.max(1, largura)));
  return (
    <div style={{ position: 'absolute', top: 140, left: 70, right: 70, display: 'flex', justifyContent: 'center', opacity: s, transform: `translateY(${(1 - s) * -20}px)` }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          columnGap: 16,
          rowGap: 2,
          padding: '14px 30px',
          borderRadius: 40,
          background: antes ? '#EADFCB' : COR.papel,
          border: `3px solid ${COR.tinta}`,
          fontFamily: FONTE_TEXTO,
          fontSize: tamanho,
          lineHeight: 1.2,
          color: COR.tinta,
          textAlign: 'center',
          maxWidth: 940,
        }}
      >
        <span style={{ fontWeight: 700, letterSpacing: 3 }}>{r}</span>
        {detalhe && <span style={{ width: 8, height: 8, borderRadius: 99, background: antes ? COR.tintaSuave : COR.destaque, flexShrink: 0 }} />}
        {detalhe && <span style={{ fontWeight: 500 }}>{detalhe}</span>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- legenda e cartão de fonte

export type Palavra = { texto: string; inicio: number; fim?: number }; // em frames

const estiloLegenda: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(251, 248, 242, 0.94)',
  border: `3px solid ${COR.tinta}`,
  borderRadius: 26,
  padding: '22px 34px',
  fontFamily: FONTE_TITULO,
  fontWeight: 600,
  fontSize: 66,
  lineHeight: 1.18,
  color: COR.tinta,
  textAlign: 'center',
};

/**
 * Legenda: a frase inteira aparece de uma vez, num cartão linho claro; a palavra que está sendo dita fica
 * no destaque profundo. As palavras vêm com o frame em que começam. `destaque` força uma palavra (folhas paradas).
 */
export const Legenda: React.FC<{ palavras: Palavra[]; destaque?: number; topo?: number }> = ({ palavras, destaque, topo = 330 }) => {
  const frame = useCurrentFrame();
  if (palavras.length === 0) return null;
  let atual = destaque ?? -1;
  if (destaque === undefined) palavras.forEach((p, i) => (frame >= p.inicio ? (atual = i) : null));
  const entrada = interpolate(frame, [palavras[0].inicio - 6, palavras[0].inicio], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const longa = palavras.reduce((n, p) => n + p.texto.length + 1, 0) > 70;
  return (
    <div style={{ position: 'absolute', top: topo, left: 70, right: 70, display: 'flex', justifyContent: 'center', opacity: destaque !== undefined ? 1 : entrada }}>
      <div style={{ ...estiloLegenda, fontSize: longa ? 56 : 66 }}>
        {palavras.map((p, i) => (
          <span key={i} style={{ color: i === atual ? COR.destaqueProfundo : COR.tinta }}>
            {p.texto}
            {i < palavras.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Versão parada da legenda (folhas e imagens de referência). `destaque` = índice da palavra acesa. */
export const LegendaParada: React.FC<{ texto: string; destaque: number; topo?: number }> = ({ texto, destaque, topo }) => (
  <Legenda palavras={texto.split(' ').map((t) => ({ texto: t, inicio: 0 }))} destaque={destaque} topo={topo} />
);

/** Cartão de fonte, embaixo à esquerda, com texto livre. `rotulo={null}` tira o "Fonte:" da frente. */
export const CartaoFonte: React.FC<{ texto: string; rotulo?: string | null; inicio?: number }> = ({ texto, rotulo = 'Fonte:', inicio = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [inicio, inicio + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 70, top: 1510, maxWidth: 820, opacity: o }}>
      <div style={{ background: COR.papel, border: `2px solid ${COR.tinta}`, borderRadius: 14, padding: '10px 18px', fontFamily: FONTE_TEXTO, fontSize: texto.length > 70 ? 24 : 28, lineHeight: 1.25, color: COR.tinta }}>
        {rotulo && <b>{rotulo} </b>}
        {texto}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- caderno

export type LinhaCaderno = { texto: string; inicio: number; riscado?: boolean; destaque?: boolean; /** frame em que o risco aparece (padrão: logo depois de escrever) */ riscarEm?: number };

/**
 * Caderno quadriculado: o jeito antigo de resolver (lista, conta, anotação). Entra subindo; cada linha se
 * escreve sozinha a partir do seu frame (da esquerda para a direita, como caneta), pode ser riscada ou
 * destacada. Linha longa quebra dentro do caderno.
 */
export const Caderno: React.FC<{ titulo: string; linhas: LinhaCaderno[]; inicio?: number; topo?: number; rabisco?: boolean }> = ({ titulo, linhas, inicio = 0, topo = 640, rabisco = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inicio, fps, config: { damping: 18, stiffness: 120 } });
  return (
    <div style={{ position: 'absolute', left: 100, right: 100, top: topo, transform: `translateY(${(1 - s) * 900}px) rotate(-2deg)` }}>
      <div
        style={{
          position: 'relative',
          background: COR.caderno,
          backgroundImage: `linear-gradient(${COR.quadricula} 2px, transparent 2px), linear-gradient(90deg, ${COR.quadricula} 2px, transparent 2px)`,
          backgroundSize: '40px 40px',
          border: `3px solid ${COR.tinta}`,
          borderRadius: 10,
          padding: '40px 50px 50px 90px',
          minHeight: 640,
          boxShadow: '0 16px 0 rgba(31,35,40,0.12)',
        }}
      >
        {/* espiral */}
        <div style={{ position: 'absolute', left: 26, top: 30, bottom: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ width: 30, height: 14, borderRadius: 99, border: `3px solid ${COR.tinta}`, background: COR.linho }} />
          ))}
        </div>
        <div style={{ fontFamily: FONTE_MAO, fontWeight: 700, fontSize: titulo.length > 22 ? 60 : 72, color: COR.tinta, lineHeight: 1, marginBottom: 16, textDecoration: 'underline', textDecorationThickness: 3 }}>{titulo}</div>
        {linhas.map((l, i) => {
          const p = interpolate(frame, [l.inicio, l.inicio + 14], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const r = l.riscado ? interpolate(frame, [l.riscarEm ?? l.inicio + 16, (l.riscarEm ?? l.inicio + 16) + 8], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                display: 'table',
                fontFamily: FONTE_MAO,
                fontWeight: 500,
                fontSize: l.texto.length > 30 ? 48 : 58,
                lineHeight: 1.3,
                color: l.destaque ? COR.destaqueProfundo : COR.tinta,
                clipPath: `inset(-10px ${100 - p}% -10px -10px)`,
              }}
            >
              {l.texto}
              {l.riscado && <div style={{ position: 'absolute', left: -6, top: '55%', height: 5, width: `${r}%`, background: COR.destaqueProfundo, borderRadius: 4, transform: 'rotate(-1.5deg)' }} />}
            </div>
          );
        })}
        {rabisco && (
          <svg width={140} height={90} viewBox="0 0 140 90" style={{ position: 'absolute', right: 40, bottom: 30 }}>
            <path d="M 10 60 q 20 -40 40 0 t 40 0 t 40 -20" stroke={COR.tintaSuave} strokeWidth={4} fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- símbolo da marca

export type SimboloNome = 'lua' | 'circulo' | 'estrela' | 'folha' | 'coracao' | 'dente' | 'letra';
export const SIMBOLOS: SimboloNome[] = ['lua', 'circulo', 'estrela', 'folha', 'coracao', 'dente', 'letra'];

/** Crescente: círculo (cx, cy, R) menos o círculo (dx, dy, r). Pontos de encontro calculados. */
const crescente = (cx: number, cy: number, R: number, dx: number, dy: number, r: number) => {
  const d = Math.hypot(dx - cx, dy - cy);
  const a = (R * R - r * r + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, R * R - a * a));
  const ux = (dx - cx) / d;
  const uy = (dy - cy) / d;
  const px = cx + a * ux;
  const py = cy + a * uy;
  const p1 = [px + h * uy, py - h * ux];
  const p2 = [px - h * uy, py + h * ux];
  return `M ${p1[0]} ${p1[1]} A ${R} ${R} 0 1 0 ${p2[0]} ${p2[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]} Z`;
};

const estrela = (cx: number, cy: number, fora: number, dentro: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? dentro : fora;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');

/** Primeira letra do nome da marca (sem contar espaço), em maiúscula. */
export const inicialDe = (nome: string) => (nome.trim().match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase();

/**
 * Símbolo da marca, desenhado em código. `cor` pinta o símbolo; `corFundo` é a cor do recorte
 * (letra dentro do círculo, veio da folha). Sem `simbolo`, usa a letra inicial.
 */
export const SimboloMarca: React.FC<{ simbolo?: string | null; tamanho?: number; cor?: string; corFundo?: string; nome?: string }> = ({
  simbolo,
  tamanho = 80,
  cor = MARCA?.cor ?? COR.destaque,
  corFundo = COR.branco,
  nome = MARCA?.nome ?? '',
}) => {
  const s = (SIMBOLOS as string[]).includes(simbolo ?? '') ? (simbolo as SimboloNome) : 'letra';
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
      {s === 'lua' && <path fill={cor} d={crescente(100, 100, 90, 140, 66, 70)} />}
      {s === 'circulo' && (
        <>
          <circle cx={100} cy={100} r={74} fill="none" stroke={cor} strokeWidth={30} />
          <circle cx={100} cy={100} r={26} fill={cor} />
        </>
      )}
      {s === 'estrela' && <polygon fill={cor} points={estrela(100, 106, 96, 42)} strokeLinejoin="round" stroke={cor} strokeWidth={10} />}
      {s === 'folha' && (
        <g transform="rotate(35 100 100)">
          <path fill={cor} d="M 100 8 C 168 44 176 132 100 170 C 24 132 32 44 100 8 Z" />
          <path d="M 100 44 L 100 150" stroke={corFundo} strokeWidth={9} strokeLinecap="round" />
          <rect x={93} y={160} width={14} height={36} rx={7} fill={cor} />
        </g>
      )}
      {s === 'coracao' && <path fill={cor} d="M 100 182 C 40 140 6 104 10 66 C 14 30 62 14 100 52 C 138 14 186 30 190 66 C 194 104 160 140 100 182 Z" />}
      {s === 'dente' && (
        <path
          transform="translate(100 0) scale(1.22 1) translate(-100 0)"
          fill={cor}
          d="M 46 52 C 44 22 76 14 100 30 C 124 14 156 22 154 52 C 152 88 140 104 138 136 C 136 172 126 190 114 190 C 102 190 106 152 100 142 C 94 152 98 190 86 190 C 74 190 64 172 62 136 C 60 104 48 88 46 52 Z"
        />
      )}
      {s === 'letra' && (
        <>
          <circle cx={100} cy={100} r={96} fill={cor} />
          <text x={100} y={100} dy="0.36em" textAnchor="middle" fontFamily={FONTE_TEXTO} fontWeight={700} fontSize={120} fill={corFundo}>
            {inicialDe(nome)}
          </text>
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- fecho

/** Nome da narradora (a protagonista do elenco, ou a primeira pessoa), para o aviso de personagem fictícia. */
export const nomeProtagonista = (): string | null => {
  const lista = Object.values(PESSOAS);
  return (lista.find((p) => p.papel === 'protagonista') ?? lista[0])?.nome ?? null;
};

/**
 * Fecho de todo vídeo (cerca de 4 s), por cima da cena final. Com marca: chamada + "Comenta" + a pílula
 * com o símbolo e a PALAVRA. Sem marca: chamada + "Segue o perfil". O aviso "<narradora> é uma personagem
 * fictícia" fica ligado, a não ser que o fecho.aviso_ficticio das respostas seja false ou a prop `aviso` seja false.
 */
export const Fecho: React.FC<{ inicio?: number; chamada?: string; palavra?: string | null; aviso?: boolean; personagem?: string | null; topo?: number }> = ({
  inicio = 0,
  chamada,
  palavra,
  aviso = FECHO.avisoFicticio,
  personagem = nomeProtagonista(),
  topo = 240,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inicio, fps, config: { damping: 16, stiffness: 150 } });
  const pulso = 1 + Math.max(0, Math.sin((frame - inicio) / 6)) * 0.03;
  const comMarca = MARCA !== null;
  const palavraFinal = (palavra ?? FECHO.palavra ?? MARCA?.palavraFecho ?? (MARCA ? MARCA.nome.split(/\s+/)[0] : '')).toUpperCase();
  const textoChamada = chamada ?? FECHO.chamada ?? (comMarca ? `Quer saber mais sobre ${MARCA!.nome}?` : 'Gostou do episódio?');
  const corPilula = MARCA?.cor ?? COR.destaque;
  const tamanhoChamada = textoChamada.length > 52 ? 50 : textoChamada.length > 34 ? 58 : 64;
  const textoPilula = comMarca ? palavraFinal : 'Segue o perfil';
  const tamanhoPilula = tamanhoQueCabe(textoPilula, comMarca ? 560 : 600, 64, 32, comMarca ? 0.68 : 0.56);
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: topo, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: s, transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ background: COR.papel, border: `3px solid ${COR.tinta}`, borderRadius: 30, padding: '30px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, maxWidth: 940 }}>
        <div style={{ fontFamily: FONTE_TITULO, fontWeight: 600, fontSize: tamanhoChamada, color: COR.tinta, textAlign: 'center', lineHeight: 1.1 }}>{textoChamada}</div>
        {comMarca && <div style={{ fontFamily: FONTE_TEXTO, fontSize: 40, color: COR.tinta }}>Comenta</div>}
        <div
          style={{
            transform: `scale(${pulso})`,
            background: corPilula,
            color: COR.branco,
            borderRadius: 99,
            padding: '18px 44px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontFamily: FONTE_TEXTO,
            fontWeight: 700,
            fontSize: tamanhoPilula,
            letterSpacing: comMarca ? 2 : 0,
            whiteSpace: 'nowrap',
            border: `3px solid ${COR.tinta}`,
          }}
        >
          {comMarca ? (
            <SimboloMarca simbolo={MARCA!.simbolo} tamanho={Math.round(tamanhoPilula * 0.9)} cor={COR.branco} corFundo={corPilula} />
          ) : (
            <svg width={44} height={44} viewBox="0 0 44 44">
              <circle cx={22} cy={22} r={20} fill={COR.branco} />
              <path d="M 22 12 L 22 32 M 12 22 L 32 22" stroke={corPilula} strokeWidth={6} strokeLinecap="round" />
            </svg>
          )}
          {textoPilula}
        </div>
      </div>
      {aviso && personagem && (
        <div style={{ fontFamily: FONTE_TEXTO, fontSize: 26, color: COR.tinta, background: COR.papel, border: `2px solid ${COR.tinta}`, padding: '6px 18px', borderRadius: 12 }}>
          {personagem} é uma personagem fictícia
        </div>
      )}
    </div>
  );
};
