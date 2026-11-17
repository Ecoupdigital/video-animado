import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Avatar } from './Avatar';
import { Bolha, Digitando, type Msg } from './Bolha';
import { Cabecalho, Campo } from './Celular';
import { AVATARES, DesenhoImagem, DesenhoReacao, IconeLido, IMAGENS, REACOES } from './desenhos';
import { CAMPO, CABECALHO, TELA } from './medidas';
import { contatoDaConversa } from './roteiro';
import { legivel, useTema } from './tema';
import { PESSOAS, TELA as TELA_UNIVERSO } from './universo';

// Folhas de conferência dos recursos da conversa (_preview):
//   FolhaRecursos  cada recurso desenhado: bolha de cada lado, horário e lido, digitando, áudio, imagens, reações,
//                  mensagem de 300 letras, palavra de 60 letras sem espaço, cabeçalho e campo (vazio e digitando)
//   FolhaAvatares  a inicial em cores diferentes e cada desenho de avatar, com o código do respostas.json
//   FolhaElenco    quem conversa: o cabeçalho do contato e uma bolha de cada lado

const hora = (n: number) => (TELA_UNIVERSO.horario ? `${TELA_UNIVERSO.hora.slice(0, 3)}${String(Math.min(59, Number(TELA_UNIVERSO.hora.slice(3)) + n)).padStart(2, '0')}` : null);
const msg = (lado: Msg['lado'], resto: Partial<Msg>): Msg => ({ lado, tipo: 'texto', texto: null, imagem: null, duracao: null, reacao: null, horario: hora(0), lido: lado === 'direita' && TELA_UNIVERSO.lido ? 'lida' : null, ...resto });

const Rotulo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const T = useTema();
  return <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 24, color: legivel(T.c.chat, T.c.horario), margin: '6px 0 10px' }}>{children}</div>;
};

/** Um painel do tamanho da tela do celular, no fundo do chat. */
const Painel: React.FC<{ children: React.ReactNode; largura?: number }> = ({ children, largura = TELA.w }) => {
  const T = useTema();
  return <div style={{ width: largura, background: T.c.chat, borderRadius: 28, padding: '18px 22px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>;
};

const Titulo: React.FC<{ texto: string }> = ({ texto }) => {
  const T = useTema();
  return <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 44, color: legivel(T.c.fundo, T.c.titulo), marginBottom: 18 }}>{texto}</div>;
};

const LONGA =
  'Oi, tudo bem? Queria fazer um pedido grande para sábado de manhã: são vinte unidades do sortido, mais duas caixas do especial, uma embalagem para presente e, se der, um cartão escrito parabéns com o nome da minha mãe. Consigo buscar às dez ou vocês entregam até o meio-dia no meu endereço? Obrigada desde já!';
const SEM_ESPACO = 'Superextraordinariamenteinacreditavelmenteconfirmadíssimoagora';

export const FolhaRecursos: React.FC = () => {
  const T = useTema();
  const contato = contatoDaConversa();
  return (
    <AbsoluteFill style={{ background: T.c.fundo, padding: 40, boxSizing: 'border-box' }}>
      <Titulo texto="Recursos da conversa" />
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <Painel>
          <Rotulo>texto · contato (esquerda) e dono (direita), com horário e lido</Rotulo>
          <Bolha m={msg('esquerda', { texto: 'Oi! Ainda dá tempo de encomendar para amanhã?' })} />
          <Bolha m={msg('direita', { texto: 'Dá sim! Para quantas pessoas?' })} />
          <Rotulo>digitando (os três pontos pulsam)</Rotulo>
          <Digitando frame={6} />
          <Rotulo>áudio · tipo "audio"</Rotulo>
          <Bolha m={msg('esquerda', { tipo: 'audio', duracao: '0:07' })} />
          <Bolha m={msg('direita', { tipo: 'audio', duracao: '0:12' })} />
          <Rotulo>imagem · tipo "imagem", com legenda</Rotulo>
          <Bolha m={msg('direita', { tipo: 'imagem', imagem: 'bolo', texto: 'Esse serve vinte fatias' })} />
          <Rotulo>reação presa na bolha</Rotulo>
          <Bolha m={msg('esquerda', { texto: 'Amei, pode ser esse!', reacao: 'coracao' })} />
          <Bolha m={msg('direita', { texto: 'Fechado!', reacao: 'risada' })} />
        </Painel>
        <Painel>
          <Rotulo>sinal de lido do kit · enviada e lida</Rotulo>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <Bolha m={msg('direita', { texto: 'Enviada', lido: 'enviada' })} />
            <Bolha m={msg('direita', { texto: 'Lida', lido: 'lida' })} />
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <IconeLido lida={false} cor={T.c.horario} vazado={T.c.chat} tamanho={44} />
              <IconeLido lida cor={T.c.horario} vazado={T.c.chat} tamanho={44} />
            </div>
          </div>
          <Rotulo>imagens desenhadas · código em "imagem"</Rotulo>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {IMAGENS.map((id) => (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <DesenhoImagem id={id} largura={236} altura={177} />
                </div>
                <span style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: 24, color: legivel(T.c.chat, T.c.textoEsquerda) }}>{id}</span>
              </div>
            ))}
          </div>
          <Rotulo>reações · código em "reacao"</Rotulo>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {REACOES.map((id) => (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 84, height: 84, borderRadius: '50%', background: T.c.campo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DesenhoReacao id={id} tamanho={60} />
                </div>
                <span style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: 24, color: legivel(T.c.chat, T.c.textoEsquerda) }}>{id}</span>
              </div>
            ))}
          </div>
          <Rotulo>mensagem de 300 letras (encolhe e quebra)</Rotulo>
          <Bolha m={msg('esquerda', { texto: LONGA })} />
          <Rotulo>palavra de 60 letras sem espaço (quebra no meio)</Rotulo>
          <Bolha m={msg('direita', { texto: SEM_ESPACO })} />
        </Painel>
      </div>
      <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
        <div style={{ width: TELA.w, position: 'relative', height: CABECALHO.h, borderRadius: 28, overflow: 'hidden' }}>
          <Cabecalho contato={contato} />
        </div>
        <div style={{ width: TELA.w, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[null, { texto: 'Pode ser às 10h', cursor: true }].map((c, i) => (
            <div key={i} style={{ position: 'relative', height: CAMPO.h, borderRadius: 28, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: -(CAMPO.y - TELA.y), width: TELA.w, height: CAMPO.y - TELA.y + CAMPO.h }}>
                <Campo campo={c} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const FolhaAvatares: React.FC = () => {
  const T = useTema();
  const contato = contatoDaConversa();
  const cores = ['#F4A6C0', '#B9B4D6', '#9FD8C6', '#FFD08A', '#2F2A63', '#B4532A'];
  const nomes = [...new Set([contato.nome, ...Object.values(PESSOAS).map((p) => p.nome), 'Ana', 'Marcos', 'Zé', 'Lu'])];
  const cel = (chave: string, rotulo: string, no: React.ReactNode) => (
    <div key={chave} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 220 }}>
      {no}
      <span style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: 24, textAlign: 'center', color: legivel(T.c.fundo, T.c.titulo) }}>{rotulo}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: T.c.fundo, padding: 40, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Titulo texto="Avatares · inicial ou desenho, na cor escolhida" />
      <Rotulo>inicial · "avatar": {'{ "tipo": "inicial", "cor": "#RRGGBB" }'}</Rotulo>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {cores.map((cor, i) => cel(`i${i}`, `${nomes[i % nomes.length]} · ${cor}`, <Avatar nome={nomes[i % nomes.length]} avatar={{ tipo: 'inicial', desenho: null, cor }} tamanho={150} />))}
      </div>
      <Rotulo>desenho · "avatar": {'{ "tipo": "desenho", "desenho": "<código>" }'}</Rotulo>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {AVATARES.map((id, i) => cel(`d${id}`, id, <Avatar nome={id} avatar={{ tipo: 'desenho', desenho: id, cor: cores[i % cores.length] }} tamanho={150} />))}
      </div>
      <Rotulo>no cabeçalho, o contato deste universo</Rotulo>
      <div style={{ width: TELA.w, position: 'relative', height: CABECALHO.h, borderRadius: 28, overflow: 'hidden' }}>
        <Cabecalho contato={contato} />
      </div>
    </AbsoluteFill>
  );
};

export const FolhaElenco: React.FC<{ titulo: string }> = ({ titulo }) => {
  const T = useTema();
  const contato = contatoDaConversa();
  const dono = Object.values(PESSOAS).find((p) => p.lado === 'direita') ?? Object.values(PESSOAS)[0];
  const rotulo = (titulo2: string, nome: string, sub: string, alinhamento: 'left' | 'right') => (
    <div style={{ width: 330, textAlign: alinhamento, display: 'flex', flexDirection: 'column', gap: 8, alignItems: alinhamento === 'left' ? 'flex-start' : 'flex-end' }}>
      <Avatar nome={alinhamento === 'right' ? contato.nome : dono.nome} avatar={alinhamento === 'right' ? contato.avatar : dono.avatar} tamanho={110} />
      <span style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 24, letterSpacing: '0.04em', textTransform: 'uppercase', color: legivel(T.c.fundo, T.c.destaque, 3) }}>{titulo2}</span>
      <span style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 46, lineHeight: 1.1, color: legivel(T.c.fundo, T.c.titulo), overflowWrap: 'anywhere' }}>{nome}</span>
      <span style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: 26, color: legivel(T.c.fundo, T.c.titulo) }}>{sub}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(155deg, ${T.c.fundo} 0%, ${T.c.fundo2} 100%)`, padding: 40, boxSizing: 'border-box' }}>
      <Titulo texto={titulo} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        {rotulo('contato · esquerda', contato.nome, contato.status ? `status "${contato.status}"` : 'sem status', 'right')}
        <div style={{ width: TELA.w, height: 640, borderRadius: 40, overflow: 'hidden', position: 'relative', background: T.c.chat, border: `14px solid ${T.c.celular}`, boxSizing: 'content-box' }}>
          <div style={{ position: 'absolute', left: 0, top: CABECALHO.h, width: TELA.w, height: 640 - CABECALHO.h, padding: 22, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14, background: T.c.chat }}>
            <Bolha m={msg('esquerda', { texto: 'Oi! Vocês fazem encomenda para amanhã?' })} />
            <Bolha m={msg('direita', { texto: 'Fazemos sim! Me conta o que você precisa.', horario: hora(1) })} />
            <Digitando frame={6} />
          </div>
          <Cabecalho contato={contato} />
        </div>
        {rotulo('dono do celular · direita', dono.nome, `bolhas à direita, com o lido; avatar ${dono.avatar.tipo === 'desenho' ? `"${dono.avatar.desenho}"` : 'inicial'} (guardado)`, 'left')}
      </div>
    </AbsoluteFill>
  );
};
