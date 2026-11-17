import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COR } from './cores';
import { FONTE_TEXTO, FONTE_TITULO } from './fontes';
import { FECHO, MARCA, PESSOAS } from './universo';

// GRADE DA TELA (1080 x 1920): nada importante em y < 250 nem em y > 1580 nem a menos de 60 px das laterais.
//   270-460  título da dica / selo
//   480-540  cartão da fonte
//   560-750  legenda (acima da cabeça dos personagens)
//   790-1620 personagens (escala até 1.0, pés no chão em y 1620)
// Textos na tela: legenda palavra por palavra, cartão da fonte, título de dica, selo e fecho.
// Nenhum texto de marca fixo: a marca e o fecho vêm de componentes/universo.ts ou de prop.
// Destaque (COR.destaque) só em texto grande; em texto pequeno, COR.destaqueProfundo.

export type Palavra = { texto: string; inicio: number; fim: number }; // em frames

/**
 * Tamanho de fonte para o texto caber numa linha de `largura` px.
 * `k` é a largura média de um caractere em fração do tamanho (Baloo 800 em caixa alta ~0.62, normal ~0.52).
 */
export const tamanhoQueCabe = (texto: string, largura: number, max: number, min = max * 0.45, k = 0.55): number =>
  Math.max(min, Math.min(max, largura / Math.max(1, texto.length * k)));

/** Quebra o texto em até `maxLinhas` linhas de até `porLinha` caracteres, sem cortar palavra. */
export const quebrarLinhas = (texto: string, porLinha: number, maxLinhas = 2): string[] => {
  const linhas: string[] = [];
  let atual = '';
  for (const p of texto.split(/\s+/).filter(Boolean)) {
    if (!atual) atual = p;
    else if ((atual + ' ' + p).length <= porLinha || linhas.length === maxLinhas - 1) atual += ' ' + p;
    else {
      linhas.push(atual);
      atual = p;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
};

/** Agrupa as palavras em blocos de até `max` palavras, quebrando nas pausas. */
export const agruparPalavras = (palavras: Palavra[], max = 4, pausa = 9): Palavra[][] => {
  const blocos: Palavra[][] = [];
  let atual: Palavra[] = [];
  palavras.forEach((p, i) => {
    const anterior = palavras[i - 1];
    const quebra = atual.length >= max || (anterior && p.inicio - anterior.fim > pausa) || (anterior && /[.?!]$/.test(anterior.texto));
    if (quebra && atual.length) {
      blocos.push(atual);
      atual = [];
    }
    atual.push(p);
  });
  if (atual.length) blocos.push(atual);
  return blocos;
};

const estiloLegenda: React.CSSProperties = {
  background: COR.branco,
  borderRadius: 28,
  padding: '14px 30px 18px',
  fontFamily: FONTE_TITULO,
  fontWeight: 800,
  fontSize: 76,
  lineHeight: 1.08,
  textAlign: 'center',
  color: COR.texto,
  boxShadow: '0 6px 0 rgba(60,35,20,0.10)',
  maxWidth: 940,
};

/** Legenda palavra por palavra: cartão branco, texto escuro, palavra falada na cor de destaque. */
export const Legenda: React.FC<{ palavras: Palavra[]; y?: number; max?: number }> = ({ palavras, y = 560, max = 4 }) => {
  const frame = useCurrentFrame();
  const blocos = agruparPalavras(palavras, max);
  // o bloco mais recente que já começou (o novo assume assim que a primeira palavra dele chega)
  const bloco = [...blocos].reverse().find((b) => frame >= b[0].inicio - 2 && frame <= b[b.length - 1].fim + 6);
  if (!bloco) return null;
  const entrada = interpolate(frame - (bloco[0].inicio - 2), [0, 5], [0.85, 1], { extrapolateRight: 'clamp' });
  // só uma palavra destacada por vez: a última que começou (e ainda não acabou há muito)
  let ativa = -1;
  bloco.forEach((p, i) => {
    if (frame >= p.inicio && frame <= p.fim + 4) ativa = i;
  });
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center' }}>
      <div style={{ ...estiloLegenda, transform: `scale(${entrada})` }}>
        {bloco.map((p, i) => (
          <span key={i} style={{ color: i === ativa ? COR.destaque : COR.texto }}>
            {p.texto}
            {i < bloco.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Versão parada da legenda (para imagens de referência). `destaque` = índice da palavra acesa. */
export const LegendaParada: React.FC<{ texto: string; destaque: number; y?: number }> = ({ texto, destaque, y = 560 }) => (
  <div style={{ position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center' }}>
    <div style={estiloLegenda}>
      {texto.split(' ').map((p, i, todas) => (
        <span key={i} style={{ color: i === destaque ? COR.destaque : COR.texto }}>
          {p}
          {i < todas.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  </div>
);

/**
 * Cartão de fonte, com texto livre. Usar quando o assunto pedir fonte (dado, regra, recomendação de
 * especialista); `rotulo={null}` tira o "Fonte:" da frente.
 */
export const CartaoFonte: React.FC<{ texto: string; rotulo?: string | null; inicio?: number; y?: number }> = ({ texto, rotulo = 'Fonte:', inicio = 0, y = 480 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inicio, fps, config: { damping: 200 } });
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: y, opacity: s, transform: `translateY(${(1 - s) * 30}px)`, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          background: COR.branco,
          borderLeft: `12px solid ${COR.apoio2}`,
          borderRadius: 18,
          padding: '14px 26px',
          fontFamily: FONTE_TEXTO,
          fontWeight: 500,
          fontSize: texto.length > 60 ? 28 : 32,
          lineHeight: 1.25,
          color: COR.texto,
          maxWidth: 960,
        }}
      >
        {rotulo && <b style={{ fontWeight: 700 }}>{rotulo} </b>}
        {texto}
      </div>
    </div>
  );
};

/** Título grande de dica ("3 coisas que...", "Mito ou verdade?"). Texto longo encolhe. */
export const TituloDica: React.FC<{ texto: string; inicio?: number; y?: number; cor?: string; cartao?: boolean }> = ({ texto, inicio = 0, y = 270, cor = COR.texto, cartao = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inicio, fps, config: { damping: 14, stiffness: 180 } });
  const tamanho = texto.length > 44 ? 66 : texto.length > 28 ? 78 : 92;
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: y, textAlign: 'center', fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: tamanho, lineHeight: 1.02, color: cor, transform: `scale(${s})` }}>
      {cartao ? (
        <span style={{ display: 'inline-block', background: COR.branco, borderRadius: 28, padding: '8px 34px 16px', boxShadow: '0 6px 0 rgba(60,35,20,0.10)' }}>{texto}</span>
      ) : (
        texto
      )}
    </div>
  );
};

/** Selo de mito (cor de erro) ou verdade (cor de acerto). O texto padrão é MITO ou VERDADE e pode ser trocado. */
export const Selo: React.FC<{ tipo: 'mito' | 'verdade'; texto?: string; inicio?: number; y?: number }> = ({ tipo, texto, inicio = 0, y = 420 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inicio, fps, config: { damping: 10, stiffness: 200 } });
  const t = (texto ?? (tipo === 'mito' ? 'MITO' : 'VERDADE')).toUpperCase();
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: y, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          background: tipo === 'mito' ? COR.erro : COR.acerto,
          color: COR.branco,
          fontFamily: FONTE_TITULO,
          fontWeight: 800,
          fontSize: tamanhoQueCabe(t, 840, 110, 56, 0.62),
          padding: '6px 54px 14px',
          borderRadius: 30,
          whiteSpace: 'nowrap',
          transform: `scale(${s}) rotate(${tipo === 'mito' ? -4 : 3}deg)`,
        }}
      >
        {t}
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
          <text x={100} y={100} dy="0.36em" textAnchor="middle" fontFamily={FONTE_TITULO} fontWeight={800} fontSize={124} fill={corFundo}>
            {inicialDe(nome)}
          </text>
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- fecho

/** Nome da protagonista do elenco (ou da primeira pessoa), para o aviso de personagem fictícia. */
export const nomeProtagonista = (): string | null => {
  const lista = Object.values(PESSOAS);
  return (lista.find((p) => p.papel === 'protagonista') ?? lista[0])?.nome ?? null;
};

/**
 * Fecho de todo vídeo (cerca de 4 s), por cima da cena final (a cena posiciona a protagonista abaixo de y 790).
 * Com marca: chamada + "Comenta <PALAVRA>" com o símbolo. Sem marca: chamada + "Segue o perfil".
 * O aviso "<protagonista> é uma personagem fictícia" fica ligado, a não ser que o fecho.aviso_ficticio
 * das respostas seja false ou a prop `aviso` seja false.
 */
export const Fecho: React.FC<{ inicio?: number; chamada?: string; palavra?: string | null; aviso?: boolean; personagem?: string | null; y?: number }> = ({
  inicio = 0,
  chamada,
  palavra,
  aviso = FECHO.avisoFicticio,
  personagem = nomeProtagonista(),
  y = 300,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - inicio, fps, config: { damping: 16, stiffness: 160 } });
  const pulso = 1 + Math.max(0, Math.sin((frame - inicio) / 6)) * 0.04;
  const comMarca = MARCA !== null;
  const palavraFinal = (palavra ?? FECHO.palavra ?? MARCA?.palavraFecho ?? (MARCA ? MARCA.nome.split(/\s+/)[0] : '')).toUpperCase();
  const textoChamada = chamada ?? FECHO.chamada ?? (comMarca ? `Quer saber mais sobre ${MARCA!.nome}?` : 'Gostou do episódio?');
  const corPilula = MARCA?.cor ?? COR.destaque;
  const tamanhoChamada = textoChamada.length > 52 ? 54 : textoChamada.length > 34 ? 62 : 70;
  const textoPilula = comMarca ? palavraFinal : 'Segue o perfil';
  const tamanhoPilula = tamanhoQueCabe(textoPilula, comMarca ? 470 : 560, 64, 34, comMarca ? 0.64 : 0.52);
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: y, transform: `translateY(${(1 - s) * 80}px)`, opacity: s, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
      <div style={{ background: COR.branco, borderRadius: 36, padding: '34px 40px 38px', textAlign: 'center', boxShadow: '0 8px 0 rgba(60,35,20,0.10)', maxWidth: 940 }}>
        <div style={{ fontFamily: FONTE_TITULO, fontWeight: 800, fontSize: tamanhoChamada, lineHeight: 1.05, color: COR.texto }}>{textoChamada}</div>
        <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {comMarca && <span style={{ fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: 56, color: COR.texto }}>Comenta</span>}
          <span
            style={{
              background: corPilula,
              color: COR.branco,
              fontFamily: FONTE_TITULO,
              fontWeight: 800,
              fontSize: tamanhoPilula,
              padding: '2px 30px 8px',
              borderRadius: 999,
              transform: `scale(${pulso})`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              whiteSpace: 'nowrap',
            }}
          >
            {comMarca ? (
              <SimboloMarca simbolo={MARCA!.simbolo} tamanho={50} cor={COR.branco} corFundo={corPilula} />
            ) : (
              <svg width={44} height={44} viewBox="0 0 44 44">
                <circle cx={22} cy={22} r={20} fill={COR.branco} />
                <path d="M 22 12 L 22 32 M 12 22 L 32 22" stroke={corPilula} strokeWidth={6} strokeLinecap="round" />
              </svg>
            )}
            {textoPilula}
          </span>
        </div>
      </div>
      {aviso && personagem && (
        <div style={{ fontFamily: FONTE_TEXTO, fontSize: 26, color: COR.textoSuave, background: 'rgba(255,255,255,0.85)', padding: '6px 18px', borderRadius: 12 }}>
          {personagem} é uma personagem fictícia
        </div>
      )}
    </div>
  );
};
