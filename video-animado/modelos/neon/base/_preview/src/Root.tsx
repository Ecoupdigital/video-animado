import React from 'react';
import { AbsoluteFill, Composition, Still, useCurrentFrame } from 'remotion';
import { FPS, H, HORIZONTE, SEGURA, TempoFixo, W } from '../../componentes/anima';
import { Cenario, Topo, Varredura } from '../../componentes/cenario';
import { EXEMPLO, LETREIRO_AMOSTRA } from '../../componentes/exemplo';
import { Letreiro, ZONA_LETREIRO } from '../../componentes/letreiro';
import { NeonVista } from '../../componentes/Montagem';
import { Botao, CardFinal, Contagem, Oferta, Selo, ZONA, type DadosContagem } from '../../componentes/pecas';
import { comTempoSintetico, TIPOS_CENA, type TipoCena } from '../../componentes/roteiro';
import { useNeon } from '../../componentes/tema';
import { FECHO, MARCA, OFERTA, RECEITA } from '../../componentes/universo';
import { Paletas } from './Paletas';

// Stills do universo (npx remotion still _preview/src/index.ts <id> imagens/<id>.png):
//   cenario       o cenário sem texto: céu, sol listrado, grade e varredura
//   pecas         cada peça em 3 momentos: letreiro (acendendo, no tremido, aceso), preço (do antigo, contando, no
//                 valor com o risco), relógio, 3 2 1, selo (batendo, assentando, assentado) e botão (subindo, aceso,
//                 respirando)
//   elenco        as peças juntas, em repouso: a vitrine chama de "Peças"
//   paletas       as 3 paletas prontas lado a lado (o neon troca todas as cores)
//   capa          a cena da tela de referência (letreiro e botão) com a oferta do universo, sem marcação
//   cena-<tipo>   uma cena do exemplo com a área segura marcada (still de conferência): abertura, oferta, contagem,
//                 chamada, final
//   vista-<tipo>  o mesmo quadro sem a marcação (brandbook)
// E a composição "piscada" (3 s): o letreiro acende e pisca, para medir a piscada com o conferir_piscada.py.

const EX = comTempoSintetico(EXEMPLO);
/** instante mostrado no still de cada cena: perto do fim, com todas as peças no lugar */
const momento = (tipo: TipoCena) => EX.cenas.find((x) => x.tipo === tipo)!.fim - 0.25;

/** área segura do Reels marcada (stills de conferência) */
export const AreaSegura: React.FC = () => {
  const faixa = 'repeating-linear-gradient(45deg, rgba(255,40,80,0.28) 0 12px, rgba(255,40,80,0.12) 12px 24px)';
  const yb = H - SEGURA.baixo;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SEGURA.topo, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: yb, bottom: 0, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', right: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', left: SEGURA.lado, top: SEGURA.topo, width: W - 2 * SEGURA.lado, height: yb - SEGURA.topo, border: '3px dashed rgba(255,40,80,0.95)', boxSizing: 'border-box' }} />
    </AbsoluteFill>
  );
};

export const QuadroCena: React.FC<{ tipo: TipoCena; marcar?: boolean }> = ({ tipo, marcar }) => (
  <TempoFixo.Provider value={momento(tipo)}>
    <AbsoluteFill>
      <NeonVista timing={EX} duck={[]} comSom={false} chave={`q-${tipo}`} />
      {marcar ? <AreaSegura /> : null}
    </AbsoluteFill>
  </TempoFixo.Provider>
);

const CenarioSo: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Cenario t={0.3} chave="cen" />
    <Varredura />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- folhas de peças

const CONTAGEM_RELOGIO: DadosContagem = { forma: 'relogio', inicio: 7200, comHora: true, de: 3, rotulo: 'termina em', prazo: null, fim: 'agora' };
const CONTAGEM_NUMEROS: DadosContagem = { forma: 'numeros', inicio: 0, comHora: false, de: 3, rotulo: 'começa em', prazo: null, fim: 'agora' };
const OFERTA_DADOS = { oQue: OFERTA.oQue, preco: OFERTA.preco, antigo: OFERTA.precoAntigo, selo: null, prazo: null };

type Peca = { nome: string; y0: number; y1: number; momentos: [number, string][]; desenhar: (t: number) => React.ReactNode };

/** As peças e os 3 momentos de cada uma (t em segundos, a peça começa em 0). */
const PECAS: Peca[] = [
  { nome: 'letreiro', y0: ZONA_LETREIRO.topo - 40, y1: ZONA_LETREIRO.baixo, momentos: [[0.02, 'acendendo (30%)'], [0.15, 'tremido (45%)'], [1.0, 'aceso']], desenhar: (t) => <Letreiro linhas={LETREIRO_AMOSTRA} t={t} at={0} /> },
  {
    nome: 'preço',
    y0: ZONA.topo - 20,
    y1: ZONA.baixo + 10,
    momentos: [[0.04, 'começa no antigo'], [0.35, 'contando'], [1.6, 'no valor, antigo riscado']],
    desenhar: (t) => (OFERTA.preco ? <Oferta d={OFERTA_DADOS} t={t} at={0} atPreco={0} atSelo={99} atPrazo={99} /> : null),
  },
  { nome: 'relógio', y0: ZONA.topo - 20, y1: ZONA.baixo + 10, momentos: [[0.4, 'começa no prazo'], [1.5, '1 s depois'], [3.5, '3 s depois']], desenhar: (t) => <Contagem d={CONTAGEM_RELOGIO} t={t} at={0} /> },
  { nome: '3, 2, 1', y0: ZONA.topo - 20, y1: ZONA.baixo + 10, momentos: [[0.5, '3'], [2.5, '1'], [3.5, 'o fim']], desenhar: (t) => <Contagem d={CONTAGEM_NUMEROS} t={t} at={0} /> },
  {
    nome: 'selo',
    y0: ZONA.topo - 20,
    y1: ZONA.baixo + 10,
    momentos: [[0.03, 'batendo'], [0.13, 'assentando'], [1.0, 'assentado']],
    desenhar: (t) => (OFERTA.selo ? <Selo texto={OFERTA.selo} t={t} at={0} cx={W / 2} cy={(ZONA.topo + ZONA.baixo) / 2} base={48} /> : null),
  },
  { nome: 'botão', y0: ZONA.topo - 20, y1: ZONA.baixo + 10, momentos: [[0.08, 'subindo'], [0.6, 'aceso'], [1.5, 'brilho respirando']], desenhar: (t) => <Botao texto={OFERTA.botao} t={t} at={0} /> },
];

/** um recorte (y0 a y1) do quadro inteiro, com o cenário por trás, na largura dada */
const Recorte: React.FC<{ y0: number; y1: number; largura: number; t: number; children: React.ReactNode; chave: string }> = ({ y0, y1, largura, t, children, chave }) => {
  const k = largura / W;
  return (
    <div style={{ width: largura, height: (y1 - y0) * k, position: 'relative', overflow: 'hidden', borderRadius: 10, border: '2px solid rgba(255,255,255,0.18)' }}>
      <div style={{ position: 'absolute', left: 0, top: -y0 * k, width: W, height: H, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        <Cenario t={t} chave={chave} />
        {children}
        <Varredura />
      </div>
    </div>
  );
};

const Rotulo: React.FC<{ texto: string; grande?: boolean }> = ({ texto, grande }) => {
  const N = useNeon();
  return <div style={{ fontFamily: grande ? N.f.texto : N.f.mono, fontWeight: grande ? 900 : 500, fontSize: grande ? 34 : 22, letterSpacing: grande ? '0.02em' : '0.06em', color: grande ? N.c.contorno : N.c.topo, lineHeight: 1.2 }}>{texto}</div>;
};

const FolhaPecas: React.FC = () => {
  const larg = 560;
  return (
    <AbsoluteFill style={{ background: '#07020F', padding: '36px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Rotulo texto="PEÇAS DO NEON EM 3 MOMENTOS · SÓ O LETREIRO PISCA" grande />
      {PECAS.map((p) => (
        <div key={p.nome} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Rotulo texto={p.nome.toLocaleUpperCase('pt-BR')} />
          <div style={{ display: 'flex', gap: 20 }}>
            {p.momentos.map(([t, legenda], i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Recorte y0={p.y0} y1={p.y1} largura={larg} t={t} chave={`pc-${p.nome}-${i}`}>
                  {p.desenhar(t)}
                </Recorte>
                <Rotulo texto={`${t.toFixed(2).replace('.', ',')} s · ${legenda}`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** As peças juntas, em repouso, para a vitrine ("Peças"): 2 colunas, do letreiro ao card final. */
const Elenco: React.FC = () => {
  const larg = 480;
  const pecas: [string, number, number, React.ReactNode][] = [
    ['letreiro', ZONA_LETREIRO.topo - 40, ZONA_LETREIRO.baixo, <Letreiro key="l" linhas={LETREIRO_AMOSTRA} t={2} at={0} />],
    ['oferta: o que, preço e selo', ZONA.topo - 20, ZONA.baixo + 10, <Oferta key="o" d={{ oQue: OFERTA.oQue, preco: OFERTA.preco, antigo: OFERTA.precoAntigo, selo: OFERTA.selo, prazo: OFERTA.prazo }} t={4} at={0} atPreco={0} atSelo={1.2} atPrazo={1.4} />],
    ['contagem: relógio', ZONA.topo - 20, ZONA.baixo + 10, <Contagem key="r" d={{ ...CONTAGEM_RELOGIO, prazo: OFERTA.prazo }} t={2.5} at={0} />],
    ['contagem: 3, 2, 1', ZONA.topo - 20, ZONA.baixo + 10, <Contagem key="n" d={CONTAGEM_NUMEROS} t={0.6} at={0} />],
    ['botão em pílula', ZONA.topo - 20, ZONA.baixo + 10, <Botao key="b" texto={OFERTA.botao} t={2} at={0} />],
    ['topo: PLAY e contador de fita', SEGURA.topo - 30, SEGURA.topo + 110, <Topo key="t" t={12} />],
    [
      'card final',
      600,
      1540,
      <CardFinal key="c" t={2} at={0} chamada={FECHO.chamada ?? 'Corre que *acaba* hoje'} fontes={[]} assinatura={FECHO.assinatura} frase={FECHO.fraseAssinatura} marca={MARCA} avisoIA={FECHO.avisoIA && RECEITA === 'narracao-inteira'} />,
    ],
    ['sol listrado e grade andando', HORIZONTE - 400, HORIZONTE + 540, null],
  ];
  return (
    <AbsoluteFill style={{ background: '#07020F', padding: '40px 40px', boxSizing: 'border-box' }}>
      <Rotulo texto="PEÇAS DO NEON RETRÔ" grande />
      <div style={{ display: 'grid', gridTemplateColumns: `${larg}px ${larg}px`, gap: '16px 40px', marginTop: 16, alignItems: 'start' }}>
        {pecas.map(([nome, y0, y1, el], i) => (
          <div key={nome} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Recorte y0={y0} y1={y1} largura={larg} t={1 + i * 0.37} chave={`el-${i}`}>
              {el}
            </Recorte>
            <Rotulo texto={nome} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- composição da piscada

/** 3 s: o letreiro acende em 0,2 s (com o tremido) e dá a piscada de leve em 1,6 s. Para a medida da piscada. */
const Piscada: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Cenario t={t} chave="pis" />
      <Letreiro linhas={LETREIRO_AMOSTRA} t={t} at={0.2} />
      <Topo t={t} />
      <Varredura />
    </AbsoluteFill>
  );
};

export const Raiz: React.FC = () => (
  <>
    <Still id="cenario" component={CenarioSo} width={W} height={H} />
    <Still id="pecas" component={FolhaPecas} width={1800} height={1920} />
    <Still id="elenco" component={Elenco} width={W} height={1310} />
    <Still id="paletas" component={Paletas} width={2160} height={1920} />
    <Still id="capa" component={() => <QuadroCena tipo="chamada" />} width={W} height={H} />
    {TIPOS_CENA.map((tipo) => (
      <React.Fragment key={tipo}>
        <Still id={`cena-${tipo}`} component={() => <QuadroCena tipo={tipo} marcar />} width={W} height={H} />
        <Still id={`vista-${tipo}`} component={() => <QuadroCena tipo={tipo} />} width={W} height={H} />
      </React.Fragment>
    ))}
    <Composition id="piscada" component={Piscada} width={W} height={H} fps={FPS} durationInFrames={3 * FPS} />
  </>
);
