import React from 'react';
import { Avatar } from './Avatar';
import { Bolha, DIGITANDO, Digitando, medirBolha, larguraTexto, type Msg } from './Bolha';
import { IconeEnviar, IconeVoltar } from './desenhos';
import { BOLHA, CABECALHO, CAMPO, CELULAR, CHAT, H, TECLADO, TELA } from './medidas';
import { comAlfa, legivel, misturar, useTema } from './tema';
import { TELA as TELA_UNIVERSO, type PessoaDaConversa } from './universo';

// O celular no centro da tela: moldura, cabeçalho do contato (seta de voltar, avatar, nome e status), a conversa
// sobre o fundo do chat (pontos, liso, grade ou diagonal), o campo de mensagem com o botão de enviar e o teclado
// sem letras (na faixa de baixo, que o Reels cobre). Genérico de propósito: nenhum logo, nome, ícone ou cor de app
// de mensagem real.
//
// Rolagem: enquanto a conversa cabe, as bolhas ficam presas no alto; quando a bolha nova não cabe, a conversa
// passa a ficar presa embaixo (a bolha mais nova sempre inteira, logo acima do campo) e sobe junto com a entrada
// dela. Cabeçalho e campo ficam parados.

export type ItemConversa =
  | { tipo: 'mensagem'; chave: string; m: Msg; k: number; kReacao: number; aposDigitando?: boolean }
  | { tipo: 'digitando'; chave: string; k: number };

export type CampoDigitado = { texto: string; cursor: boolean } | null;

const alturaDe = (it: ItemConversa) => (it.tipo === 'digitando' ? DIGITANDO.altura : medirBolha(it.m));

/** Como a conversa fica presa e quanto ela ainda tem de subir (a entrada da última bolha). */
export const rolagem = (itens: ItemConversa[]) => {
  const area = CHAT.h - CHAT.padTopo - CHAT.padBaixo;
  const alturas = itens.map(alturaDe);
  const total = alturas.reduce((s, h) => s + h, 0) + BOLHA.gap * Math.max(0, itens.length - 1);
  const embaixo = total > area;
  let sobe = 0;
  const ult = itens[itens.length - 1];
  if (embaixo && ult && ult.k < 1) {
    const novo = ult.tipo === 'mensagem' && ult.aposDigitando ? Math.max(0, alturas[alturas.length - 1] - DIGITANDO.altura) : alturas[alturas.length - 1] + BOLHA.gap;
    sobe = (1 - ult.k) * Math.min(novo, total - area);
  }
  return { embaixo, sobe, total, area };
};

// ---------------------------------------------------------------- fundo do chat

const FundoChat: React.FC<{ fundo: string }> = ({ fundo }) => {
  const T = useTema();
  const id = `conversa-padrao-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const cor = T.c.padrao;
  let padrao: React.ReactNode = null;
  if (fundo === 'pontos') padrao = <pattern id={id} width={44} height={44} patternUnits="userSpaceOnUse"><circle cx={10} cy={10} r={3.2} fill={cor} /></pattern>;
  if (fundo === 'grade') padrao = <pattern id={id} width={56} height={56} patternUnits="userSpaceOnUse"><path d="M 56 0 L 0 0 L 0 56" stroke={cor} strokeWidth={2} fill="none" /></pattern>;
  if (fundo === 'diagonal') padrao = <pattern id={id} width={40} height={40} patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width={6} height={40} fill={cor} /></pattern>;
  return (
    <svg width={TELA.w} height={CHAT.h} style={{ position: 'absolute', left: 0, top: 0, display: 'block' }}>
      <rect width={TELA.w} height={CHAT.h} fill={T.c.chat} />
      {padrao ? (
        <>
          <defs>{padrao}</defs>
          <rect width={TELA.w} height={CHAT.h} fill={`url(#${id})`} />
        </>
      ) : null}
    </svg>
  );
};

// ---------------------------------------------------------------- cabeçalho

/** Tamanho do nome no cabeçalho: 38 px; nome comprido encolhe até 30 px e corta com reticências. */
const fonteNome = (nome: string, largura: number) => {
  for (let f = 38; f > 30; f -= 2) if (larguraTexto(nome, f) * 1.12 <= largura) return f;
  return 30;
};

export const Cabecalho: React.FC<{ contato: PessoaDaConversa }> = ({ contato }) => {
  const T = useTema();
  const tinta = legivel(T.c.cabecalho, T.c.cabecalhoTexto);
  const apagada = legivel(T.c.cabecalho, misturar(tinta, T.c.cabecalho, 0.28), 3);
  const larguraNome = TELA.w - 186 - 34;
  const fs = fonteNome(contato.nome, larguraNome);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: TELA.w, height: CABECALHO.h, background: T.c.cabecalho, display: 'flex', alignItems: 'center', boxSizing: 'border-box', paddingLeft: 14 }}>
      <IconeVoltar cor={tinta} tamanho={52} />
      <div style={{ marginLeft: 6 }}>
        <Avatar nome={contato.nome} avatar={contato.avatar} tamanho={CABECALHO.avatar} />
      </div>
      <div style={{ marginLeft: 20, width: larguraNome, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: fs, lineHeight: 1.15, color: tinta, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contato.nome}</div>
        {contato.status ? (
          <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: 26, lineHeight: 1.15, color: apagada, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contato.status}</div>
        ) : null}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- campo e teclado

export const Campo: React.FC<{ campo: CampoDigitado }> = ({ campo }) => {
  const T = useTema();
  const faixa = misturar(T.c.chat, T.c.celular, T.escuro ? 0.2 : 0.04);
  const larguraPilula = TELA.w - 2 * 18 - CAMPO.botao - 14;
  const miolo = larguraPilula - 2 * 32;
  const vazio = !campo || !campo.texto;
  const tinta = legivel(T.c.campo, T.c.textoEsquerda);
  const apagada = legivel(T.c.campo, T.c.horario, 3);
  const longo = !vazio && larguraTexto(campo!.texto, 34) + 10 > miolo;
  return (
    <div style={{ position: 'absolute', left: 0, top: CAMPO.y - TELA.y, width: TELA.w, height: CAMPO.h, background: faixa, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', boxSizing: 'border-box' }}>
      <div style={{ width: larguraPilula, height: CAMPO.pilula, borderRadius: CAMPO.pilula / 2, background: T.c.campo, display: 'flex', alignItems: 'center', justifyContent: longo ? 'flex-end' : 'flex-start', padding: '0 32px', boxSizing: 'border-box', overflow: 'hidden' }}>
        <span style={{ fontFamily: T.f.texto, fontWeight: 400, fontSize: 34, lineHeight: 1, whiteSpace: 'nowrap', color: vazio ? apagada : tinta, display: 'flex', alignItems: 'center' }}>
          {vazio ? 'Mensagem' : campo!.texto}
          {!vazio && campo!.cursor ? <span style={{ display: 'inline-block', width: 3, height: 38, marginLeft: 3, background: T.c.cabecalho }} /> : null}
        </span>
      </div>
      <div style={{ width: CAMPO.botao, height: CAMPO.botao, borderRadius: '50%', background: T.c.cabecalho, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconeEnviar cor={legivel(T.c.cabecalho, T.c.cabecalhoTexto, 3)} tamanho={56} />
      </div>
    </div>
  );
};

/** Teclado sem letras (a faixa de baixo do vídeo, que o Reels cobre). tecla: a tecla acesa (o dono digitando). */
export const Teclado: React.FC<{ tecla?: number | null }> = ({ tecla = null }) => {
  const T = useTema();
  const painel = misturar(T.c.campo, T.c.celular, T.escuro ? 0.45 : 0.1);
  const corTecla = T.escuro ? misturar(T.c.campo, '#FFFFFF', 0.06) : misturar(T.c.campo, painel, 0.25);
  const acesa = misturar(corTecla, T.c.cabecalho, 0.35);
  const linhas = [10, 9, 7];
  const lt = 66;
  const gap = (TELA.w - 20 - 10 * lt) / 9;
  let n = 0;
  const teclas: React.ReactNode[] = [];
  linhas.forEach((qtd, li) => {
    const largura = qtd * lt + (qtd - 1) * gap;
    const x0 = (TELA.w - largura) / 2;
    for (let i = 0; i < qtd; i++) {
      const idx = n++;
      teclas.push(<rect key={idx} x={x0 + i * (lt + gap)} y={16 + li * 84} width={lt} height={68} rx={12} fill={idx === tecla ? acesa : corTecla} />);
    }
    if (li === 2) {
      teclas.push(<rect key="m1" x={10} y={16 + li * 84} width={x0 - 10 - gap} height={68} rx={12} fill={misturar(painel, T.c.celular, 0.12)} />);
      teclas.push(<rect key="m2" x={x0 + largura + gap} y={16 + li * 84} width={TELA.w - 10 - (x0 + largura + gap)} height={68} rx={12} fill={misturar(painel, T.c.celular, 0.12)} />);
    }
  });
  const y4 = 16 + 3 * 84;
  teclas.push(<rect key="b1" x={10} y={y4} width={150} height={68} rx={12} fill={misturar(painel, T.c.celular, 0.12)} />);
  teclas.push(<rect key="esp" x={174} y={y4} width={TELA.w - 174 - 174} height={68} rx={12} fill={tecla === -1 ? acesa : corTecla} />);
  teclas.push(<rect key="b2" x={TELA.w - 160} y={y4} width={150} height={68} rx={12} fill={misturar(painel, T.c.celular, 0.12)} />);
  return (
    <svg width={TELA.w} height={TECLADO.h} style={{ position: 'absolute', left: 0, top: TECLADO.y - TELA.y, display: 'block' }}>
      <rect width={TELA.w} height={TECLADO.h} fill={painel} />
      {teclas}
    </svg>
  );
};
/** Quantas teclas com letra o teclado tem (para acender uma por letra digitada). */
export const TECLAS = 26;

// ---------------------------------------------------------------- celular

export const Celular: React.FC<{
  contato: PessoaDaConversa;
  itens: ItemConversa[];
  frame: number;
  campo?: CampoDigitado;
  tecla?: number | null;
  fundoChat?: string;
}> = ({ contato, itens, frame, campo = null, tecla = null, fundoChat = TELA_UNIVERSO.fundo }) => {
  const T = useTema();
  const { embaixo, sobe } = rolagem(itens);
  const brilho = comAlfa('#FFFFFF', T.escuro ? 0.1 : 0.16);
  return (
    <div style={{ position: 'absolute', left: CELULAR.x, top: CELULAR.y, width: CELULAR.w, height: H - CELULAR.y + 120 }}>
      <div style={{ position: 'absolute', inset: 0, background: T.c.celular, borderRadius: CELULAR.raio, boxShadow: `0 30px 60px ${comAlfa(T.c.celular, 0.28)}, inset 0 0 0 3px ${brilho}` }} />
      <div style={{ position: 'absolute', left: CELULAR.borda, top: CELULAR.borda, width: TELA.w, bottom: 0, borderRadius: TELA.raio, overflow: 'hidden', background: T.c.chat }}>
        <div style={{ position: 'absolute', left: 0, top: CHAT.y - TELA.y, width: TELA.w, height: CHAT.h, overflow: 'hidden' }}>
          <FundoChat fundo={fundoChat} />
          <div
            style={{
              position: 'absolute',
              left: CHAT.pad,
              right: CHAT.pad,
              ...(embaixo ? { bottom: CHAT.padBaixo } : { top: CHAT.padTopo }),
              display: 'flex',
              flexDirection: 'column',
              gap: BOLHA.gap,
              transform: `translateY(${sobe}px)`,
            }}
          >
            {itens.map((it) => (it.tipo === 'digitando' ? <Digitando key={it.chave} frame={frame} k={it.k} /> : <Bolha key={it.chave} m={it.m} k={it.k} kReacao={it.kReacao} />))}
          </div>
        </div>
        <Cabecalho contato={contato} />
        <Campo campo={campo} />
        <Teclado tecla={tecla} />
      </div>
    </div>
  );
};
