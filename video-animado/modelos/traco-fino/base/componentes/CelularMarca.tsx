import React from 'react';
import { COR, clarear, escurecer } from './cores';
import { FONTE_TEXTO } from './fontes';
import { SimboloMarca, inicialDe, tamanhoQueCabe } from './Texto';
import { MARCA } from './universo';

// Celular de frente com uma tela da marca do universo (nome, cor e símbolo vêm de componentes/universo.ts),
// no visual do traço fino: moldura escura com contorno em tinta e sombra chapada.
// Sem marca (MARCA = null), a tela sai sem logo. Visual de app limpo: fundo cinza bem claro, cartões
// brancos, DM Sans e um único acento (a cor da marca ou, sem marca, o destaque da paleta).
// Os textos da tela vêm todos por prop: nada de dado inventado fixo no componente.
//
// 4 moldes:
//   lista     itens com marca de feito         { molde: 'lista', titulo, itens: [{ texto, feito, etiqueta }], botao }
//   semana    progresso por etapa              { molde: 'semana', titulo, etapa, total, rotulo, cartoes }
//   conversa  balões de mensagem               { molde: 'conversa', contato, baloes: [{ de: 'eu' | 'outro', texto }] }
//   aviso     notificação com botão            { molde: 'aviso', titulo, texto, botao, hora }

export type ItemTela = { texto: string; feito?: boolean; etiqueta?: string };
export type Balao = { de: 'eu' | 'outro'; texto: string };

export type TelaCelular =
  | { molde: 'lista'; titulo: string; subtitulo?: string; itens: ItemTela[]; botao?: string }
  | { molde: 'semana'; titulo: string; etapa: number; total: number; rotulo?: string; cartoes?: string[] }
  | { molde: 'conversa'; contato: string; baloes: Balao[]; digitando?: boolean }
  | { molde: 'aviso'; titulo: string; texto: string; botao: string; hora?: string };

const CINZA = '#F7F7F7';
const LINHA = '#C1C1C1';
const SUAVE = '#6A6A6A';
const ESCURO = '#222222';

const Barra: React.FC<{ w: number; cor?: string; h?: number }> = ({ w, cor = '#DDDDDD', h = 12 }) => <div style={{ width: w, height: h, borderRadius: 99, background: cor }} />;

const Cartao: React.FC<{ children: React.ReactNode; borda?: string }> = ({ children, borda }) => (
  <div style={{ background: COR.branco, borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, border: `3px solid ${borda ?? 'transparent'}` }}>{children}</div>
);

/** Título de tela: encolhe para caber em uma linha de até 330 px; mais longo, quebra em duas. */
const TituloTela: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{ fontWeight: 700, fontSize: tamanhoQueCabe(texto, 330, 32, 24, 0.55), lineHeight: 1.1 }}>{texto}</div>
);

/** Logo da marca no topo do app: símbolo + nome; nome longo encolhe e, passando de uma linha, quebra em duas. */
const LogoApp: React.FC<{ acento: string }> = ({ acento }) => {
  if (!MARCA) return null;
  const umaLinha = tamanhoQueCabe(MARCA.nome, 280, 24, 10, 0.56) >= 17;
  return (
    <div style={{ padding: '6px 22px', display: 'flex', alignItems: 'center', gap: 10, minHeight: 42 }}>
      <SimboloMarca simbolo={MARCA.simbolo} tamanho={30} cor={acento} corFundo={CINZA} nome={MARCA.nome} />
      <span
        style={{
          fontWeight: 700,
          fontSize: umaLinha ? tamanhoQueCabe(MARCA.nome, 280, 24, 17, 0.56) : tamanhoQueCabe(MARCA.nome, 540, 18, 13, 0.56),
          lineHeight: 1.1,
          whiteSpace: umaLinha ? 'nowrap' : 'normal',
          maxWidth: 290,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {MARCA.nome}
      </span>
    </div>
  );
};

const Lista: React.FC<{ t: Extract<TelaCelular, { molde: 'lista' }>; acento: string; forte: string }> = ({ t, acento, forte }) => (
  <>
    <TituloTela texto={t.titulo} />
    {t.subtitulo && <div style={{ fontWeight: 500, fontSize: 18, color: SUAVE, marginTop: -8 }}>{t.subtitulo}</div>}
    {t.itens.map((item, i) => (
      <div key={i} style={{ background: COR.branco, borderRadius: 16, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 30,
            height: 30,
            flexShrink: 0,
            borderRadius: 8,
            background: item.feito ? acento : 'transparent',
            border: item.feito ? 'none' : `3px solid ${LINHA}`,
            color: COR.branco,
            fontWeight: 700,
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.feito ? '✓' : ''}
        </div>
        <span style={{ fontSize: item.texto.length > 28 ? 17 : 20, fontWeight: 500, flex: 1, lineHeight: 1.2, color: item.feito ? SUAVE : ESCURO, textDecoration: item.feito ? 'line-through' : 'none' }}>{item.texto}</span>
        {item.etiqueta && <span style={{ fontSize: 14, fontWeight: 700, color: forte, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{item.etiqueta.toUpperCase()}</span>}
      </div>
    ))}
    {t.botao && <div style={{ background: acento, color: COR.branco, borderRadius: 99, textAlign: 'center', padding: '14px 0', fontWeight: 700, fontSize: 21 }}>{t.botao}</div>}
  </>
);

const Semana: React.FC<{ t: Extract<TelaCelular, { molde: 'semana' }>; acento: string; forte: string }> = ({ t, acento, forte }) => {
  const total = Math.max(1, t.total);
  const etapa = Math.max(0, Math.min(total, t.etapa));
  const r = 38;
  const volta = 2 * Math.PI * r;
  const rotulo = t.rotulo ?? 'Etapa';
  return (
    <>
      <TituloTela texto={t.titulo} />
      <Cartao>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width={96} height={96} viewBox="0 0 96 96" style={{ flexShrink: 0 }}>
            <circle cx={48} cy={48} r={r} fill="none" stroke="#EBEBEB" strokeWidth={10} />
            <circle cx={48} cy={48} r={r} fill="none" stroke={acento} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${(volta * etapa) / total} ${volta}`} transform="rotate(-90 48 48)" />
            <text x={48} y={48} dy="0.36em" textAnchor="middle" fontFamily={FONTE_TEXTO} fontWeight={700} fontSize={28} fill={ESCURO}>
              {etapa}
            </text>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: tamanhoQueCabe(`${rotulo} ${etapa} de ${total}`, 170, 22, 15, 0.56), whiteSpace: 'nowrap' }}>
              {rotulo} {etapa} de {total}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: Math.min(total, 12) }, (_, i) => (
                <div key={i} style={{ width: Math.max(8, 150 / Math.min(total, 12) - 4), height: 10, borderRadius: 99, background: i < etapa ? acento : '#E3E3E3' }} />
              ))}
            </div>
          </div>
        </div>
      </Cartao>
      {(t.cartoes ?? []).map((c, i) => (
        <Cartao key={i} borda={i === 0 ? acento : undefined}>
          {i === 0 && <span style={{ fontSize: 13, fontWeight: 700, color: forte, letterSpacing: 0.5 }}>AGORA</span>}
          <div style={{ fontWeight: 500, fontSize: 19, lineHeight: 1.2 }}>{c}</div>
          <Barra w={260} />
          <Barra w={200} />
        </Cartao>
      ))}
    </>
  );
};

const Conversa: React.FC<{ t: Extract<TelaCelular, { molde: 'conversa' }>; acento: string }> = ({ t, acento }) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: '2px solid #E6E6E6' }}>
      <div style={{ width: 46, height: 46, borderRadius: 99, background: clarear(acento, 0.75), color: escurecer(acento, 0.3), fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {inicialDe(t.contato)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700, fontSize: tamanhoQueCabe(t.contato, 240, 21, 15, 0.56), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }}>{t.contato}</span>
        <span style={{ fontSize: 14, color: SUAVE }}>{t.digitando ? 'digitando...' : 'online'}</span>
      </div>
    </div>
    {t.baloes.map((b, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: b.de === 'eu' ? 'flex-end' : 'flex-start' }}>
        <div
          style={{
            maxWidth: 250,
            padding: '10px 14px',
            borderRadius: 18,
            borderBottomRightRadius: b.de === 'eu' ? 4 : 18,
            borderBottomLeftRadius: b.de === 'eu' ? 18 : 4,
            background: b.de === 'eu' ? acento : COR.branco,
            color: b.de === 'eu' ? COR.branco : ESCURO,
            fontSize: b.texto.length > 70 ? 16 : 18,
            lineHeight: 1.28,
            fontWeight: 500,
          }}
        >
          {b.texto}
        </div>
      </div>
    ))}
    {t.digitando && (
      <div style={{ display: 'flex', gap: 6, background: COR.branco, borderRadius: 18, padding: '14px 16px', alignSelf: 'flex-start', width: 'fit-content' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 99, background: LINHA }} />
        ))}
      </div>
    )}
  </>
);

const Aviso: React.FC<{ t: Extract<TelaCelular, { molde: 'aviso' }>; acento: string }> = ({ t, acento }) => (
  <>
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 76, lineHeight: 1, color: ESCURO, letterSpacing: -1 }}>{t.hora ?? '9:41'}</div>
    </div>
    <div style={{ marginTop: 34, background: COR.branco, borderRadius: 24, padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: clarear(acento, 0.82), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {MARCA ? (
            <SimboloMarca simbolo={MARCA.simbolo} tamanho={24} cor={acento} corFundo={clarear(acento, 0.82)} nome={MARCA.nome} />
          ) : (
            <svg width={22} height={22} viewBox="0 0 24 24">
              <path d="M 12 3 C 7.5 3 6 6.5 6 10 L 6 15 L 4 18 L 20 18 L 18 15 L 18 10 C 18 6.5 16.5 3 12 3 Z" fill={acento} />
              <circle cx={12} cy={20.5} r={2.2} fill={acento} />
            </svg>
          )}
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: SUAVE, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(MARCA?.nome ?? 'Lembrete').toUpperCase()}</span>
        <span style={{ fontSize: 14, color: SUAVE }}>agora</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: t.titulo.length > 30 ? 19 : 22, lineHeight: 1.2 }}>{t.titulo}</div>
      <div style={{ fontSize: t.texto.length > 90 ? 15 : 17, lineHeight: 1.3, color: '#3A3A3A' }}>{t.texto}</div>
      <div style={{ marginTop: 4, background: acento, color: COR.branco, borderRadius: 99, textAlign: 'center', padding: '12px 0', fontWeight: 700, fontSize: 19 }}>{t.botao}</div>
    </div>
  </>
);

/**
 * Celular de frente (380 x 780 na largura padrão). `largura` escala tudo; `inclinacao` em graus.
 * `cor` troca o acento (padrão: cor da marca; sem marca, o destaque da paleta).
 */
export const CelularMarca: React.FC<{ tela: TelaCelular; largura?: number; inclinacao?: number; cor?: string }> = ({ tela, largura = 380, inclinacao = 0, cor }) => {
  const k = largura / 380;
  const acento = cor ?? MARCA?.cor ?? COR.destaque;
  // texto pequeno na cor da marca sai mais escuro, para dar contraste no branco
  const forte = cor || MARCA?.cor ? escurecer(acento, 0.28) : COR.destaqueProfundo;
  const fundoTela = tela.molde === 'aviso' ? `linear-gradient(180deg, ${clarear(acento, 0.7)} 0%, ${clarear(acento, 0.88)} 100%)` : CINZA;
  return (
    <div style={{ width: largura, height: 780 * k, transform: `rotate(${inclinacao}deg)` }}>
      <div style={{ width: 380, height: 780, transform: `scale(${k})`, transformOrigin: 'top left', background: '#1F1F1F', borderRadius: 56, padding: 14, border: `3px solid ${COR.tinta}`, boxShadow: '0 18px 0 rgba(31,35,40,0.14)' }}>
        <div style={{ width: '100%', height: '100%', background: fundoTela, borderRadius: 44, overflow: 'hidden', fontFamily: FONTE_TEXTO, color: ESCURO }}>
          <div style={{ height: 46, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 110, height: 28, borderRadius: 99, background: '#1F1F1F' }} />
          </div>
          {(tela.molde === 'lista' || tela.molde === 'semana') && <LogoApp acento={acento} />}
          <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tela.molde === 'lista' && <Lista t={tela} acento={acento} forte={forte} />}
            {tela.molde === 'semana' && <Semana t={tela} acento={acento} forte={forte} />}
            {tela.molde === 'conversa' && <Conversa t={tela} acento={acento} />}
            {tela.molde === 'aviso' && <Aviso t={tela} acento={acento} />}
          </div>
        </div>
      </div>
    </div>
  );
};
