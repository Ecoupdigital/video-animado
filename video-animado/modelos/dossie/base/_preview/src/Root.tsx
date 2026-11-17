import React from 'react';
import { AbsoluteFill, Still } from 'remotion';
import { ComTema, TEMAS, useTema, type NomeTema, type PapelCor } from '../../componentes/tema';
import { DOSSIE, FECHO, MARCA, UNIVERSO } from '../../componentes/universo';
import { TempoFixo } from '../../componentes/anima';
import { EXEMPLO } from '../../componentes/exemplo';
import { comTempoSintetico, TIPOS_CENA, type TipoCena } from '../../componentes/roteiro';
import { Dossie } from '../../componentes/Montagem';
import { AreaSegura, Faixa, Fundo, Grao, Vinheta } from '../../componentes/fundo';
import { Card, CardFinal, Carimbo, CartaoFonte, Contador, Dado, Grafico, LinhaDoTempo, Mono, No, Polaroid, Selo, Titulo, Traco, yOmbros } from '../../componentes/pecas';

// Stills do universo (npx remotion still _preview/src/index.ts <id> imagens/<id>.png):
//   temas               os 3 temas lado a lado: cores por papel e as 3 fontes, com o nome do universo
//   cena-<tipo>-<tema>  uma cena do caso de exemplo num tema, com a área segura marcada (still de conferência):
//                       tipos gancho, ficha, ligacao, rota, tombo, linha, fonte, final; temas investigativo, jornal, marca
//   vista-<tipo>-<tema> o mesmo quadro sem a marcação (brandbook)
//   folha-<tema>        as 8 cenas do caso de exemplo num tema, lado a lado, sem marcação
//   elenco              as peças do dossiê no tema escolhido (o modelo não tem elenco: a vitrine chama de "Peças")

const PAPEIS: PapelCor[] = ['fundo', 'superficie', 'destaque', 'destaque2', 'claro', 'ouro', 'titulo', 'texto', 'suave', 'alerta', 'papel', 'fita'];

const Amostra: React.FC = () => {
  const T = useTema();
  return (
    <div style={{ width: 600, height: 1920, background: T.c.fundo, padding: '230px 50px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ fontFamily: T.f.mono, fontSize: 26, color: T.c.suave }}>{DOSSIE.rotulo}</div>
      <div style={{ fontFamily: T.f.titulo, fontWeight: T.pesoTitulo, fontSize: 70, lineHeight: 1.02, letterSpacing: `${T.tracking}em`, textTransform: T.caixaAlta ? 'uppercase' : 'none', color: T.c.titulo }}>
        {UNIVERSO.nome} <span style={{ color: T.c.destaque }}>em pauta</span>
      </div>
      <div style={{ fontFamily: T.f.texto, fontSize: 34, color: T.c.texto, lineHeight: 1.35 }}>Texto do card, com acentuação: ação, órgão, você, à beça.</div>
      <div style={{ fontFamily: T.f.mono, fontSize: 30, color: T.c.claro }}>MONO · 0123456789 · R$</div>
      <div style={{ fontFamily: T.f.titulo, fontWeight: 900, fontSize: 60, color: T.c.alerta, border: `5px solid ${T.c.alerta}`, alignSelf: 'flex-start', padding: '6px 18px', transform: 'rotate(-6deg)', textTransform: 'uppercase' }}>alerta</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 20 }}>
        {PAPEIS.map((p) => (
          <div key={p}>
            <div style={{ height: 110, borderRadius: 10, background: T.c[p], border: `2px solid ${T.a('texto', 0.25)}` }} />
            <div style={{ fontFamily: T.f.mono, fontSize: 20, color: T.c.suave, marginTop: 6 }}>{p}</div>
            <div style={{ fontFamily: T.f.mono, fontSize: 18, color: T.c.discreto }}>{T.c[p]}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: T.f.texto, fontWeight: 700, fontSize: 40, color: T.c.titulo, marginTop: 30 }}>{T.rotulo}</div>
      <div style={{ fontFamily: T.f.mono, fontSize: 22, color: T.c.suave }}>tema "{T.nome}"{T.nome === 'marca' ? (MARCA?.cor ? ` · destaque de ${MARCA.cor}` : ' · sem marca: cores do investigativo') : ''}</div>
    </div>
  );
};

const Temas: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: 'row', background: '#000' }}>
    {TEMAS.map((t) => (
      <ComTema key={t} nome={t}>
        <Amostra />
      </ComTema>
    ))}
  </AbsoluteFill>
);

// ---------------------------------------------------------------- cenas do caso de exemplo

const EX = comTempoSintetico(EXEMPLO);
/** instante mostrado no still de cada cena: perto do fim, com todas as peças na tela */
const momento = (tipo: TipoCena) => {
  const c = EX.cenas.find((x) => x.tipo === tipo)!;
  return c.fim - 0.25;
};

const QuadroCena: React.FC<{ tipo: TipoCena; tema: NomeTema; marcar?: boolean }> = ({ tipo, tema, marcar }) => (
  <ComTema nome={tema}>
    <TempoFixo.Provider value={momento(tipo)}>
      <AbsoluteFill>
        <Dossie timing={EX} duck={[]} comSom={false} />
        {marcar ? <AreaSegura /> : null}
      </AbsoluteFill>
    </TempoFixo.Provider>
  </ComTema>
);

const Folha: React.FC<{ tema: NomeTema }> = ({ tema }) => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.c.fundo2, padding: 24, boxSizing: 'border-box', flexDirection: 'row', flexWrap: 'wrap', gap: 20, alignContent: 'flex-start' }}>
      {TIPOS_CENA.map((tipo) => (
        <div key={tipo} style={{ width: 270, height: 480 + 34 }}>
          <div style={{ width: 270, height: 480, overflow: 'hidden', position: 'relative', borderRadius: 8 }}>
            <div style={{ width: 1080, height: 1920, transform: 'scale(0.25)', transformOrigin: '0 0', position: 'absolute' }}>
              <QuadroCena tipo={tipo} tema={tema} />
            </div>
          </div>
          <div style={{ fontFamily: T.f.mono, fontSize: 20, color: T.c.suave, marginTop: 6 }}>{tipo}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- peças

const Pecas: React.FC = () => {
  const T = useTema();
  const t = 20;
  const Rotulo: React.FC<{ x: number; y: number; children: string }> = ({ x, y, children }) => (
    <div style={{ position: 'absolute', left: x, top: y, fontFamily: T.f.mono, fontSize: 20, color: T.c.discreto, letterSpacing: '0.06em' }}>{children}</div>
  );
  const caixa = (top: number, h: number): React.CSSProperties => ({ position: 'absolute', left: 40, right: 40, top, height: h, borderTop: `1px solid ${T.escuro ? 'rgba(255,255,255,0.08)' : T.a('tinta', 0.1)}` });
  const ficha = EXEMPLO.find((c) => c.tipo === 'ficha');
  const pes = ficha && ficha.tipo === 'ficha' ? ficha.pessoa : { nome: 'Pessoa A', papel: 'citada' };
  return (
    <TempoFixo.Provider value={t}>
      <AbsoluteFill>
        <Fundo />
        <div style={{ position: 'absolute', left: 70, right: 70, top: 56 }}>
          <Mono tamanho={24}>{`peças do dossiê · ${T.rotulo.toLowerCase()}`}</Mono>
        </div>
        {/* texto cinético */}
        <Titulo t={t} palavras={[{ w: 'texto', at: 0 }, { w: 'na', at: 0 }, { w: 'palavra', at: 0, d: true }, { w: 'falada', at: 0 }]} topo={100} tamanho={84} alturaMax={100} />
        <Rotulo x={70} y={196}>Titulo</Rotulo>
        {/* polaroid com carimbo nos ombros */}
        <div style={caixa(240, 520)} />
        <Polaroid t={t} at={0} x={250} y={500} w={320} nome={pes.nome} papel={pes.papel} rot={-3} id="pc" />
        <Carimbo t={t} at={0} x={250} y={yOmbros(500, 320)} tamanho={40} rot={-5} largura={380}>
          suspeita
        </Carimbo>
        <Rotulo x={70} y={724}>Polaroid · Carimbo</Rotulo>
        <Card t={t} at={0} x={770} y={270} w={420}>
          <Dado rotulo="CARGO" valor="Diretor de compras" tamanho={34} cabe={18} />
        </Card>
        <Rotulo x={560} y={420}>Card</Rotulo>
        <div style={{ position: 'absolute', left: 560, width: 420, top: 450 }}>
          <Contador t={t} at={0} valor={{ numero: -62, sufixo: '%' }} tamanho={130} />
        </div>
        <Rotulo x={560} y={590}>Contador</Rotulo>
        <div style={{ position: 'absolute', left: 560, width: 420, top: 615, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Selo cor={T.c.claro} tamanho={22}>a empresa nega</Selo>
          <Selo solido cor={T.c.destaque} tamanho={22}>citada 01</Selo>
        </div>
        <Rotulo x={560} y={744}>Selo</Rotulo>
        {/* rota e gráfico */}
        <div style={caixa(770, 330)} />
        <svg style={{ position: 'absolute', inset: 0 }} width={1080} height={1920}>
          <Traco d="M140 880 C 260 880, 330 990, 420 990" p={1} cor={T.c.destaque} w={5} />
        </svg>
        <No t={t} at={0} x={140} y={880} nome="Origem" sub="nó" />
        <No t={t} at={0} x={420} y={990} nome="Destino" sub="em alerta" cor={T.c.alerta} />
        <Rotulo x={70} y={1066}>No · Traco</Rotulo>
        <div style={{ position: 'absolute', left: 540, top: 790, width: 470, height: 270, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: -50, top: -250, width: 1080, height: 1920, transform: 'scale(0.5)', transformOrigin: '0 0' }}>
            <Grafico t={t} at={0} topo={540} d={0.5} />
          </div>
        </div>
        <Rotulo x={560} y={1066}>Grafico</Rotulo>
        {/* linha do tempo e fonte */}
        <div style={caixa(1110, 350)} />
        <LinhaDoTempo t={t} topo={1140} marcos={[{ data: '10/03', texto: 'proposta', at: 0 }, { data: '02/05', texto: 'aditivo', at: 0 }, { data: '20/06', texto: 'denúncia', alerta: true, at: 0 }]} />
        <CartaoFonte t={t} at={0} x={540} y={1260} w={860} veiculo="Jornal do Bairro" data="21/06" texto="de onde veio o fato" />
        <Rotulo x={70} y={1420}>LinhaDoTempo · CartaoFonte · Faixa</Rotulo>
        <Faixa fimVoz={999} manchetes={DOSSIE.manchetes.length ? DOSSIE.manchetes : ['MANCHETE DA FAIXA']} />
        {/* card final */}
        <div style={{ position: 'absolute', left: 40, right: 40, top: 1550, height: 330, overflow: 'hidden', borderTop: `1px solid ${T.escuro ? 'rgba(255,255,255,0.08)' : T.a('tinta', 0.1)}` }}>
          <div style={{ position: 'absolute', left: (1000 - 1080 * 0.55) / 2, top: -330, width: 1080, height: 1920, transform: 'scale(0.55)', transformOrigin: '0 0' }}>
            <CardFinal t={t} at={0} fontes={['fonte do vídeo']} citaPessoas assinatura={FECHO.assinatura} frase={FECHO.fraseAssinatura} marca={MARCA} avisoIA={FECHO.avisoIA} />
          </div>
        </div>
        <Rotulo x={70} y={1886}>CardFinal</Rotulo>
        <Vinheta />
        <Grao />
      </AbsoluteFill>
    </TempoFixo.Provider>
  );
};

export const Raiz: React.FC = () => (
  <>
    <Still id="temas" component={Temas} width={1800} height={1920} />
    <Still id="elenco" component={Pecas} width={1080} height={1920} />
    {TEMAS.map((tema) => (
      <React.Fragment key={tema}>
        {TIPOS_CENA.map((tipo) => (
          <React.Fragment key={tipo}>
            <Still id={`cena-${tipo}-${tema}`} component={() => <QuadroCena tipo={tipo} tema={tema} marcar />} width={1080} height={1920} />
            <Still id={`vista-${tipo}-${tema}`} component={() => <QuadroCena tipo={tipo} tema={tema} />} width={1080} height={1920} />
          </React.Fragment>
        ))}
        <Still id={`folha-${tema}`} component={() => (
          <ComTema nome={tema}>
            <Folha tema={tema} />
          </ComTema>
        )} width={1200} height={1100} />
      </React.Fragment>
    ))}
  </>
);
