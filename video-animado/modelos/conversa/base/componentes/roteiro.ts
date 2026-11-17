import { pulinho, progresso, QUADROS_BOLHA, clamp01 } from './anima';
import type { Msg, TipoMensagem } from './Bolha';
import type { CampoDigitado, ItemConversa } from './Celular';
import { TECLAS } from './Celular';
import { FPS } from './medidas';
import { PESSOAS, RECEITA, TELA, type Lado } from './universo';

// Roteiro e linha do tempo da Conversa no celular. O roteiro (roteiro-falas.json do vídeo, gravado normalizado em
// src/roteiro.json pelo tempos_sem_voz.py ou pelo montar_audio.py) é uma lista de cenas, cada uma com título (a
// palavra destacada entre asteriscos), legenda e mensagens. A linha do tempo diz quando cada bolha entra:
//   vozes-por-fala  cada mensagem com voz é uma fala do falas.json, na ordem, e a bolha entra no começo da fala
//                   dela; as marcadas "sem_voz" entram entre as falas, sem empurrar as outras
//   texto-e-musica  cada mensagem é uma "fala" do falas.json, no tempo de leitura (o tempos_sem_voz.py grava)
// Nas duas, se a primeira fala começa antes de ABERTURA, tudo é deslocado: o vídeo abre com o título e o chat vazio
// e só então a primeira bolha entra (a narração começa deslocada junto). O digitando aparece antes das mensagens do
// contato e o texto é digitado no campo antes das do dono, quando há tempo; o card final entra RESPIRO segundos
// depois da última mensagem.

export type TipoCena = 'abertura' | 'conversa' | 'rolagem' | 'fecho';
export const TIPOS_CENA: TipoCena[] = ['abertura', 'conversa', 'rolagem', 'fecho'];
export type Receita = 'vozes-por-fala' | 'texto-e-musica';

export type MensagemRoteiro = {
  quem: string;
  texto?: string | null;
  tipo?: TipoMensagem;
  imagem?: string | null;
  duracao?: string | null;
  reacao?: string | null;
  horario?: string | null;
  lido?: boolean | null;
  sem_voz?: boolean;
};
export type CenaRoteiro = { tipo: TipoCena; titulo?: string | null; legenda?: string | null; mensagens?: MensagemRoteiro[] };
export type Roteiro = { receita?: Receita | null; cenas: CenaRoteiro[] };
export type Fala = { quem: string; ini: number; fim: number };

/** segundos de título e chat vazio antes da primeira bolha */
export const ABERTURA = 1.2;
/** segundos entre a última mensagem e o card final */
export const RESPIRO = 0.6;
/** duração do card final */
export const SEG_FECHO = 4;

export type Evento = {
  i: number;
  cena: number;
  quem: string;
  lado: Lado;
  m: MensagemRoteiro;
  entra: number;
  /** a voz da mensagem (vozes-por-fala) ou a janela de leitura (texto-e-musica), já deslocadas */
  fala: [number, number] | null;
  /** digitando do contato (na conversa) ou do dono (no campo) */
  digita: [number, number] | null;
  reacaoEm: number | null;
  lidaEm: number | null;
};
export type CenaNoTempo = { i: number; tipo: TipoCena; titulo: string | null; legenda: string | null; ini: number };
export type LinhaDoTempo = { receita: Receita; deslocamento: number; eventos: Evento[]; cenas: CenaNoTempo[]; fimMensagens: number; inicioFecho: number; duracao: number };

const semAcento = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
/** id da pessoa pelo "quem": o id, ou o nome sem acento. */
export const idDe = (quem: string): string | null => (PESSOAS[quem] ? quem : Object.entries(PESSOAS).find(([, p]) => semAcento(p.nome) === semAcento(quem))?.[0] ?? null);
export const ladoDe = (quem: string): Lado => PESSOAS[idDe(quem) ?? '']?.lado ?? 'esquerda';
export const contatoDaConversa = () => Object.values(PESSOAS).find((p) => p.lado === 'esquerda') ?? Object.values(PESSOAS)[0];

/** "18:30" + n minutos */
export const somarMinutos = (hora: string, n: number) => {
  const [h, m] = hora.split(':').map(Number);
  const t = (h * 60 + m + n) % (24 * 60);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

/** Tempo de leitura de uma mensagem (o mesmo do tempos_sem_voz.py): ~4,5 palavras por segundo e meio segundo de
 *  folga, no mínimo 1,1 s. */
export const tempoDeLeitura = (m: MensagemRoteiro) => {
  if (m.tipo === 'audio') return 1.5;
  const palavras = String(m.texto ?? '').split(/\s+/).filter(Boolean).length;
  const base = m.tipo === 'imagem' ? 1.2 : 0.5;
  return Math.max(1.1, base + palavras / 4.5);
};

/** Falas sintéticas de leitura (as mesmas do tempos_sem_voz.py na receita só texto), para os stills do _preview. */
export const falasDeLeitura = (roteiro: Roteiro): Fala[] => {
  const falas: Fala[] = [];
  let t = ABERTURA;
  let primeira = true;
  for (const c of roteiro.cenas) {
    for (const m of c.mensagens ?? []) {
      if (!primeira) t += ladoDe(m.quem) === 'esquerda' ? 0.8 : 0.6;
      primeira = false;
      const d = tempoDeLeitura(m);
      falas.push({ quem: m.quem, ini: +t.toFixed(3), fim: +(t + d).toFixed(3) });
      t += d;
    }
  }
  return falas;
};

export const linhaDoTempo = (roteiro: Roteiro, falas: Fala[], receitaPadrao: Receita = RECEITA): LinhaDoTempo => {
  const receita: Receita = roteiro.receita === 'texto-e-musica' || roteiro.receita === 'vozes-por-fala' ? roteiro.receita : receitaPadrao;
  const leitura = receita === 'texto-e-musica';
  const deslocamento = falas.length ? Math.max(0, ABERTURA - falas[0].ini) : 0;
  const lista: { cena: number; m: MensagemRoteiro }[] = [];
  roteiro.cenas.forEach((c, ci) => (c.mensagens ?? []).forEach((m) => lista.push({ cena: ci, m })));
  // 1. as mensagens presas numa fala: todas na leitura; só as com voz nas duas vozes
  const presa: ([number, number] | null)[] = lista.map(() => null);
  let j = 0;
  lista.forEach(({ m }, i) => {
    if (!leitura && m.sem_voz) return;
    const f = falas[j++];
    if (f) presa[i] = [f.ini + deslocamento, f.fim + deslocamento];
  });
  // 2. as soltas (sem voz, ou sem fala gravada) entram entre as presas, sem empurrar nenhuma
  const entra: number[] = lista.map((_, i) => presa[i]?.[0] ?? NaN);
  for (let i = 0; i < lista.length; ) {
    if (!Number.isNaN(entra[i])) {
      i++;
      continue;
    }
    let fimRun = i;
    while (fimRun < lista.length && Number.isNaN(entra[fimRun])) fimRun++;
    const n = fimRun - i;
    const antes = i > 0 ? i - 1 : -1;
    const depois = fimRun < lista.length ? fimRun : -1;
    const aIni = antes >= 0 ? entra[antes] : 0.2;
    const aFim = antes >= 0 ? presa[antes]?.[1] ?? entra[antes] + tempoDeLeitura(lista[antes].m) : ABERTURA;
    const lo = antes >= 0 ? aIni + 0.4 : ABERTURA;
    const hi = depois >= 0 ? entra[depois] - 0.15 : Math.max(aFim + 0.3, lo) + n * 1.5;
    let ini = Math.max(lo, antes >= 0 ? aFim + 0.25 : lo);
    if (ini > hi - 0.05 * n) ini = lo;
    const passo = (Math.max(hi, ini) - ini) / n;
    for (let k = 0; k < n; k++) entra[i + k] = +(ini + passo * k).toFixed(3);
    i = fimRun;
  }
  // 3. digitando, reação, lido
  const eventos: Evento[] = lista.map(({ cena, m }, i) => {
    const lado = ladoDe(m.quem);
    const anterior = i > 0 ? entra[i - 1] : 0.15;
    const janela = lado === 'esquerda' ? 1.1 : 1.2;
    const ini = Math.max(anterior + 0.35, entra[i] - janela);
    const podeDigitar = lado === 'esquerda' || (m.tipo ?? 'texto') === 'texto';
    return {
      i,
      cena,
      quem: m.quem,
      lado,
      m,
      entra: entra[i],
      fala: presa[i],
      digita: podeDigitar && entra[i] - ini >= 0.5 ? [ini, entra[i]] : null,
      reacaoEm: m.reacao ? entra[i] + 0.7 : null,
      lidaEm: lado === 'direita' ? entra[i] + 0.9 : null,
    };
  });
  // 4. cenas: cada uma começa um pouco antes da primeira bolha dela
  const cenas: CenaNoTempo[] = roteiro.cenas.map((c, ci) => {
    const minhas = eventos.filter((e) => e.cena === ci);
    const ini = ci === 0 ? 0 : minhas.length ? Math.max(0, Math.min(...minhas.map((e) => e.digita?.[0] ?? e.entra)) - 0.3) : Infinity;
    return { i: ci, tipo: c.tipo, titulo: c.titulo ?? null, legenda: c.legenda ?? null, ini };
  });
  const ultimaFala = Math.max(0, ...eventos.map((e) => e.fala?.[1] ?? e.entra + tempoDeLeitura(e.m)));
  const fimMensagens = eventos.length ? ultimaFala : ABERTURA;
  const inicioFecho = fimMensagens + RESPIRO;
  return { receita, deslocamento, eventos, cenas, fimMensagens, inicioFecho, duracao: Math.round((inicioFecho + SEG_FECHO) * FPS) };
};

/** A mensagem do roteiro como a bolha desenha (horário automático a partir da hora da tela, lido do dono). */
export const paraMsg = (e: Evento, t: number): Msg => {
  const tipo: TipoMensagem = e.m.tipo ?? 'texto';
  const horario = TELA.horario ? e.m.horario ?? somarMinutos(TELA.hora, Math.floor(e.i / 3)) : null;
  const lido = e.lado === 'direita' && TELA.lido ? (e.m.lido === false ? 'enviada' : e.lidaEm !== null && t >= e.lidaEm ? 'lida' : 'enviada') : null;
  return { lado: e.lado, tipo, texto: e.m.texto ?? null, imagem: e.m.imagem ?? null, duracao: e.m.duracao ?? null, reacao: e.m.reacao ?? null, horario, lido };
};

export type Estado = {
  itens: ItemConversa[];
  campo: CampoDigitado;
  tecla: number | null;
  /** título e legenda da cena da vez, com a entrada (k) de quando trocaram */
  titulo: { texto: string; k: number } | null;
  legenda: { texto: string; k: number } | null;
  tipo: TipoCena;
  /** card final: null antes dele */
  fecho: { k: number; pulso: number } | null;
};

/** Tudo o que a tela mostra no frame dado. */
export const estadoNoTempo = (lt: LinhaDoTempo, frame: number, tituloPadrao: string): Estado => {
  const t = frame / FPS;
  const itens: ItemConversa[] = [];
  let campo: CampoDigitado = null;
  let tecla: number | null = null;
  for (const e of lt.eventos) {
    const f0 = Math.round(e.entra * FPS);
    if (frame >= f0) {
      const k = progresso(frame, f0, QUADROS_BOLHA);
      const aposDigitando = e.lado === 'esquerda' && e.digita !== null;
      itens.push({ tipo: 'mensagem', chave: `m${e.i}`, m: paraMsg(e, t), k, kReacao: e.reacaoEm !== null ? pulinho(frame, Math.round(e.reacaoEm * FPS)) : 0, aposDigitando });
      continue;
    }
    if (e.digita && t >= e.digita[0] && t < e.digita[1]) {
      if (e.lado === 'esquerda') itens.push({ tipo: 'digitando', chave: `d${e.i}`, k: progresso(frame, Math.round(e.digita[0] * FPS), 4) });
      else {
        const texto = String(e.m.texto ?? '');
        const p = clamp01((t - e.digita[0]) / Math.max(0.2, e.digita[1] - e.digita[0] - 0.15));
        const n = Math.round(texto.length * p);
        campo = { texto: texto.slice(0, n), cursor: Math.floor(frame / 8) % 2 === 0 || p < 1 };
        tecla = n > 0 && n < texto.length ? (texto.charCodeAt(n - 1) * 7 + n * 3) % TECLAS : null;
        if (texto[n - 1] === ' ') tecla = -1;
      }
    }
    break;
  }
  const noFecho = t >= lt.inicioFecho;
  // título: o da última cena que começou e tem título; legenda: a da cena da vez
  const comecadas = lt.cenas.filter((c) => c.ini <= t);
  const daVez = comecadas[comecadas.length - 1] ?? lt.cenas[0];
  const comTitulo = [...comecadas].reverse().find((c) => c.titulo);
  const titulo = comTitulo?.titulo ?? tituloPadrao;
  const kTitulo = comTitulo && comTitulo.i > 0 ? progresso(frame, Math.round(comTitulo.ini * FPS), 8) : progresso(frame, 0, 8);
  const legendaTexto = daVez?.legenda ?? null;
  const legenda = legendaTexto && !noFecho ? { texto: legendaTexto, k: progresso(frame, Math.round((daVez?.ini ?? 0) * FPS) + 3, 8) } : null;
  const kFecho = noFecho ? progresso(frame, Math.round(lt.inicioFecho * FPS), 10) : 0;
  const pulso = 1 + Math.max(0, Math.sin((frame - lt.inicioFecho * FPS) / 6)) * 0.04;
  return {
    itens,
    campo: noFecho ? null : campo,
    tecla: noFecho ? null : tecla,
    titulo: { texto: titulo, k: kTitulo },
    legenda,
    tipo: noFecho ? 'fecho' : daVez?.tipo ?? 'conversa',
    fecho: noFecho ? { k: kFecho, pulso } : null,
  };
};
