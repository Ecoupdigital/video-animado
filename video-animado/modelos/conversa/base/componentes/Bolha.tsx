import React from 'react';
import { aleatorio, pontoDigitando, sementeDe } from './anima';
import { DesenhoImagem, DesenhoReacao, IconeLido, IconePlay } from './desenhos';
import { BOLHA, TELA as TELA_MEDIDAS } from './medidas';
import { comAlfa, legivel, misturar, useTema } from './tema';
import type { Lado } from './universo';

// Bolhas da conversa: texto, áudio e imagem, de cada lado, com horário, sinal de lido (só nas do dono, à direita) e
// reação presa no canto; e a bolha do digitando. A altura de cada bolha é estimada aqui (medirBolha) pela largura
// das letras da Inter, sem medir o navegador: serve para a conversa saber quando rolar. A bolha é desenhada com a
// altura real do texto (a estimativa só decide a rolagem), então nenhum texto sai da bolha.

export type TipoMensagem = 'texto' | 'audio' | 'imagem';
export type Msg = {
  lado: Lado;
  tipo: TipoMensagem;
  texto: string | null;
  imagem: string | null;
  duracao: string | null;
  reacao: string | null;
  /** null = sem horário (tela.horario desligado) */
  horario: string | null;
  /** só nas do dono: null = sem sinal (tela.lido desligado) */
  lido: 'enviada' | 'lida' | null;
};

/** Largura do miolo da bolha (sem as margens). */
export const MIOLO = BOLHA.max - 2 * BOLHA.padX;
export const AUDIO = { largura: 520, altura: 112 } as const;
export const IMAGEM = { largura: 470, altura: 330, pad: 10 } as const;
export const DIGITANDO = { largura: 150, altura: 84 } as const;
/** espaço embaixo da bolha com reação (o círculo passa da borda) */
export const FOLGA_REACAO = 30;

// ---------------------------------------------------------------- medir

// largura média de cada letra da Inter 400 em fração do tamanho da fonte (um pouco para cima, para nunca faltar)
const ESTREITAS = new Set(['i', 'l', 'j', "'", '|', '.', ',', ':', ';', '!']);
const largura1 = (ch: string): number => {
  const c = ch.normalize('NFD')[0] ?? ch;
  if (c === ' ') return 0.28;
  if (ESTREITAS.has(c)) return 0.27;
  if (c === 'I') return 0.3;
  if ('ftr'.includes(c)) return 0.38;
  if ('mw'.includes(c)) return 0.86;
  if ('MW'.includes(c)) return 0.98;
  if (/[0-9]/.test(c)) return 0.62;
  if (/[A-Z]/.test(c)) return 0.7;
  if (/[a-z]/.test(c)) return 0.57;
  return 0.62;
};
export const larguraTexto = (t: string, fonte: number) => [...t].reduce((s, ch) => s + largura1(ch), 0) * fonte * 1.03;

/** Quantas linhas o texto ocupa em `largura` px, quebrando nas palavras (palavra maior que a linha quebra no meio),
 *  com `fim` px reservados no fim da última linha (o horário). */
export const linhasDoTexto = (texto: string, largura: number, fonte: number, fim = 0): number => {
  const espaco = larguraTexto(' ', fonte);
  let linhas = 1;
  let atual = 0;
  for (const p of texto.split(/\s+/).filter(Boolean)) {
    let w = larguraTexto(p, fonte);
    if (atual > 0 && atual + espaco + w <= largura) {
      atual += espaco + w;
      continue;
    }
    if (atual > 0) {
      linhas++;
      atual = 0;
    }
    // palavra maior que a linha: quebra no meio
    while (w > largura) {
      linhas++;
      w -= largura;
    }
    atual = w;
  }
  if (fim && atual + fim > largura) linhas++;
  return linhas;
};

/** Largura do horário e do sinal de lido no canto da bolha. */
export const larguraHora = (m: Pick<Msg, 'horario' | 'lido'>) => (m.horario ? larguraTexto(m.horario, BOLHA.hora) + 12 : 0) + (m.lido ? 34 : 0) + (m.horario || m.lido ? 8 : 0);

/** Fonte da bolha de texto: 40 px; texto longo encolhe até 28 px para a bolha caber na conversa. */
export const fonteDaBolha = (texto: string, fim: number) => {
  for (let f = BOLHA.fonte; f > 28; f -= 2) if (linhasDoTexto(texto, MIOLO, f, fim) <= (f === BOLHA.fonte ? 7 : 9)) return f;
  return 28;
};

/** Altura estimada da bolha (com a folga da reação). */
export const medirBolha = (m: Msg): number => {
  const fim = larguraHora(m);
  const reacao = m.reacao ? FOLGA_REACAO : 0;
  if (m.tipo === 'audio') return AUDIO.altura + reacao;
  if (m.tipo === 'imagem') {
    const leg = m.texto ? linhasDoTexto(m.texto, IMAGEM.largura - 2 * 16, 34, fim) * 44 + 22 : 0;
    return IMAGEM.altura + 2 * IMAGEM.pad + leg + reacao;
  }
  const f = fonteDaBolha(m.texto ?? '', fim);
  return linhasDoTexto(m.texto ?? '', MIOLO, f, fim) * Math.round(f * 1.3) + 2 * BOLHA.padY + reacao;
};

// ---------------------------------------------------------------- partes

const coresDoLado = (lado: Lado) => {
  const T = useTema();
  const fundo = lado === 'direita' ? T.c.bolhaDireita : T.c.bolhaEsquerda;
  const texto = legivel(fundo, lado === 'direita' ? T.c.textoDireita : T.c.textoEsquerda);
  return { fundo, texto, hora: misturar(texto, fundo, 0.38), lido: legivel(fundo, T.c.lido, 3) };
};

/** Horário e sinal de lido no canto de baixo da bolha. */
const Hora: React.FC<{ m: Msg; cor: string; lido: string; fundo: string; sobre?: boolean }> = ({ m, cor, lido, fundo, sobre = false }) => {
  const T = useTema();
  if (!m.horario && !m.lido) return null;
  return (
    <span
      style={{
        position: 'absolute',
        right: sobre ? 18 : 16,
        bottom: sobre ? 18 : 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: T.f.texto,
        fontWeight: 400,
        fontSize: BOLHA.hora,
        lineHeight: 1,
        color: sobre ? '#FFFFFF' : cor,
        background: sobre ? 'rgba(0,0,0,0.42)' : undefined,
        padding: sobre ? '6px 10px' : undefined,
        borderRadius: sobre ? 14 : undefined,
      }}
    >
      {m.horario}
      {m.lido ? <IconeLido lida={m.lido === 'lida'} cor={sobre ? '#FFFFFF' : lido} vazado={sobre ? '#555555' : fundo} tamanho={26} /> : null}
    </span>
  );
};

/** Reação presa no canto de baixo, à esquerda (o horário fica à direita). */
const Reacao: React.FC<{ id: string; lado: Lado; k: number }> = ({ id, lado, k }) => {
  const T = useTema();
  if (k <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: -FOLGA_REACAO - 6,
        left: lado === 'esquerda' ? 22 : 18,
        width: 58,
        height: 58,
        borderRadius: '50%',
        background: T.c.campo,
        boxShadow: `0 0 0 4px ${T.c.chat}, 0 3px 8px rgba(0,0,0,0.12)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${k})`,
      }}
    >
      <DesenhoReacao id={id} tamanho={42} />
    </div>
  );
};

/** Formato da bolha: cantos redondos, menos o de cima do lado de quem manda (aponta para ele). */
const forma = (lado: Lado): React.CSSProperties => ({
  borderRadius: BOLHA.raio,
  [lado === 'esquerda' ? 'borderTopLeftRadius' : 'borderTopRightRadius']: 8,
});

// ---------------------------------------------------------------- bolha

/** Uma bolha. k: entrada (0 a 1); kReacao: o pulinho da reação (0 a 1). */
export const Bolha: React.FC<{ m: Msg; k?: number; kReacao?: number }> = ({ m, k = 1, kReacao = 1 }) => {
  const T = useTema();
  const c = coresDoLado(m.lado);
  const sombra = `0 2px 0 ${comAlfa(T.c.celular, T.escuro ? 0.35 : 0.08)}, 0 1px 3px ${comAlfa(T.c.celular, 0.08)}`;
  const fim = larguraHora(m);
  let miolo: React.ReactNode;
  let estilo: React.CSSProperties;
  if (m.tipo === 'audio') {
    const sem = sementeDe((m.duracao ?? '') + m.lado);
    const barras = Array.from({ length: 30 }, (_, i) => 0.28 + 0.72 * Math.abs(Math.sin(i * 0.55 + sem)) * (0.55 + 0.45 * aleatorio(sem + i)));
    const corPlay = m.lado === 'direita' ? c.texto : T.c.cabecalho;
    miolo = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: '100%' }}>
        <div style={{ width: 66, height: 66, borderRadius: '50%', background: legivel(c.fundo, corPlay, 3), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconePlay cor={c.fundo} tamanho={36} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
          <svg width={330} height={44} viewBox="0 0 330 44" style={{ display: 'block' }}>
            {barras.map((h, i) => (
              <rect key={i} x={i * 11} y={22 - h * 20} width={6} height={h * 40} rx={3} fill={i < 9 ? c.texto : comAlfa(c.texto, 0.38)} />
            ))}
          </svg>
          <span style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: 24, lineHeight: 1, color: c.hora }}>{m.duracao ?? '0:05'}</span>
        </div>
      </div>
    );
    estilo = { width: AUDIO.largura, height: AUDIO.altura, padding: '0 18px 0 22px', boxSizing: 'border-box' };
  } else if (m.tipo === 'imagem') {
    const leg = m.texto;
    miolo = (
      <div>
        <div style={{ width: IMAGEM.largura, height: IMAGEM.altura, borderRadius: 22, overflow: 'hidden', position: 'relative' }}>
          <DesenhoImagem id={m.imagem ?? 'foto'} largura={IMAGEM.largura} altura={IMAGEM.altura} />
          {!leg ? <Hora m={m} cor={c.hora} lido={c.lido} fundo={c.fundo} sobre /> : null}
        </div>
        {leg ? (
          <div style={{ fontFamily: T.f.texto, fontWeight: 400, fontSize: 34, lineHeight: '44px', color: c.texto, padding: '10px 16px 12px', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
            {leg}
            {fim ? <span style={{ display: 'inline-block', width: fim, height: 1 }} /> : null}
          </div>
        ) : null}
      </div>
    );
    estilo = { width: IMAGEM.largura + 2 * IMAGEM.pad, padding: IMAGEM.pad, boxSizing: 'border-box' };
  } else {
    const f = fonteDaBolha(m.texto ?? '', fim);
    miolo = (
      <div style={{ fontFamily: T.f.texto, fontWeight: 400, fontSize: f, lineHeight: `${Math.round(f * 1.3)}px`, color: c.texto, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
        {m.texto}
        {fim ? <span style={{ display: 'inline-block', width: fim, height: 1 }} /> : null}
      </div>
    );
    estilo = { maxWidth: BOLHA.max, padding: `${BOLHA.padY}px ${BOLHA.padX}px`, boxSizing: 'border-box' };
  }
  const aparece = Math.min(1, k * 1.6);
  return (
    <div style={{ display: 'flex', justifyContent: m.lado === 'direita' ? 'flex-end' : 'flex-start', paddingBottom: m.reacao ? FOLGA_REACAO : 0 }}>
      <div
        style={{
          position: 'relative',
          background: c.fundo,
          boxShadow: sombra,
          ...forma(m.lado),
          ...estilo,
          opacity: aparece,
          transform: `translateY(${(1 - k) * 26}px) scale(${0.9 + 0.1 * k})`,
          transformOrigin: m.lado === 'direita' ? '100% 100%' : '0% 100%',
        }}
      >
        {miolo}
        {m.tipo !== 'imagem' || m.texto ? <Hora m={m} cor={c.hora} lido={c.lido} fundo={c.fundo} /> : null}
        {m.reacao ? <Reacao id={m.reacao} lado={m.lado} k={kReacao * (k >= 1 ? 1 : 0)} /> : null}
      </div>
    </div>
  );
};

/** Bolha do digitando do contato: três pontos que pulsam, um depois do outro. */
export const Digitando: React.FC<{ frame: number; k?: number }> = ({ frame, k = 1 }) => {
  const T = useTema();
  const fundo = T.c.bolhaEsquerda;
  const ponto = legivel(fundo, T.c.horario, 3);
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div
        style={{
          width: DIGITANDO.largura,
          height: DIGITANDO.altura,
          background: fundo,
          ...forma('esquerda'),
          boxShadow: `0 2px 0 ${comAlfa(T.c.celular, T.escuro ? 0.35 : 0.08)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          opacity: Math.min(1, k * 1.6),
          transform: `translateY(${(1 - k) * 20}px) scale(${0.9 + 0.1 * k})`,
          transformOrigin: '0% 100%',
        }}
      >
        {[0, 1, 2].map((i) => {
          const p = pontoDigitando(frame, i);
          return <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: ponto, opacity: p.alfa, transform: `translateY(${p.dy}px)` }} />;
        })}
      </div>
    </div>
  );
};

/** Largura útil da conversa (para o _preview). */
export const LARGURA_CONVERSA = TELA_MEDIDAS.w;
