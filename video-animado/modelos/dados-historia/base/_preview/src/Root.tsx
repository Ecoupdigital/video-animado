import React from 'react';
import { AbsoluteFill, Still } from 'remotion';
import { TempoFixo } from '../../componentes/anima';
import { EXEMPLO } from '../../componentes/exemplo';
import { AreaSegura, Fundo } from '../../componentes/fundo';
import { DadosHistoria } from '../../componentes/Montagem';
import { Bloco, CardFinal, Chip, Circulo, Coluna, Contador, Desenho, Marco, Moeda, Pino, Piso, Recorte, Reticula, Saida, Titulo, Traco } from '../../componentes/pecas';
import { comTempoSintetico, TIPOS_CENA, type TipoCena } from '../../componentes/roteiro';
import { ComTema, TEMAS, temaPronto, useTema, type IdTema } from '../../componentes/tema';
import { FECHO, MARCA } from '../../componentes/universo';
import { Paletas } from './Paletas';

// Stills do universo (npx remotion still _preview/src/index.ts <id> imagens/<id>.png):
//   paletas             os 4 temas lado a lado: cada papel de cor (com as trocas das respostas no tema escolhido) e as 4 fontes
//   cena-<tipo>-<tema>  uma cena dos dados de exemplo num tema, com a área segura marcada (still de conferência):
//                       tipos abertura, colunas, marcos, rota, recortes, final; temas isometrico, linha-do-tempo, mapa, jornal
//   vista-<tipo>-<tema> o mesmo quadro sem a marcação (brandbook)
//   tema-<id>           a capa de cada tema, sem marcação (a cena da tela de referência do tema): a pergunta 8 mostra estas 4
//   folha-<tema>        as 6 cenas de exemplo num tema, lado a lado, sem marcação
//   elenco              as peças no tema escolhido (o modelo não tem elenco: a vitrine chama de "Peças")

const EX = comTempoSintetico(EXEMPLO);
/** instante mostrado no still de cada cena: perto do fim, com todas as peças na tela */
const momento = (tipo: TipoCena) => EX.cenas.find((x) => x.tipo === tipo)!.fim - 0.25;

const QuadroCena: React.FC<{ tipo: TipoCena; tema: IdTema; marcar?: boolean }> = ({ tipo, tema, marcar }) => (
  <ComTema id={tema}>
    <TempoFixo.Provider value={momento(tipo)}>
      <AbsoluteFill>
        <DadosHistoria timing={EX} duck={[]} comSom={false} />
        {marcar ? <AreaSegura /> : null}
      </AbsoluteFill>
    </TempoFixo.Provider>
  </ComTema>
);

const Folha: React.FC<{ tema: IdTema }> = ({ tema }) => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.escuro ? T.c.fundo : T.c.linha, padding: 20, boxSizing: 'border-box', flexDirection: 'row', gap: 20 }}>
      {TIPOS_CENA.map((tipo) => (
        <div key={tipo} style={{ width: 270, height: 480 + 34 }}>
          <div style={{ width: 270, height: 480, overflow: 'hidden', position: 'relative', borderRadius: 8 }}>
            <div style={{ width: 1080, height: 1920, transform: 'scale(0.25)', transformOrigin: '0 0', position: 'absolute' }}>
              <QuadroCena tipo={tipo} tema={tema} />
            </div>
          </div>
          <div style={{ fontFamily: T.f.mono, fontSize: 20, color: T.escuro ? T.c.texto : T.c.tinta, marginTop: 6 }}>{tipo}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- peças

const Pecas: React.FC = () => {
  const T = useTema();
  const t = 30;
  const Rotulo: React.FC<{ x: number; y: number; children: string }> = ({ x, y, children }) => (
    <div style={{ position: 'absolute', left: x, top: y, fontFamily: T.f.mono, fontSize: 20, color: T.id === 'jornal' ? T.c.titulo : T.c.suave, letterSpacing: '0.06em' }}>{children}</div>
  );
  const iso = T.id === 'isometrico';
  return (
    <TempoFixo.Provider value={t}>
      <AbsoluteFill>
        <Fundo veu={T.id === 'mapa' ? 1 : 0} />
        <Rotulo x={70} y={56}>{`peças · ${T.nome.toLowerCase()}`}</Rotulo>
        <Titulo t={t} palavras={[{ w: 'Título', at: 0 }, { w: 'do', at: 0 }, { w: 'tema', at: 0, d: true }]} topo={96} tamanho={T.serifado ? 92 : 80} alturaMax={120} />
        <Rotulo x={760} y={150}>Titulo</Rotulo>
        <Contador t={t} at={0} valor={{ numero: 1250000, prefixo: 'R$ ' }} x={110} y={240} largura={520} tamanho={110} alinhar="center" />
        <Circulo t={t} at={0} cx={370} cy={300} rx={300} ry={80} />
        <Rotulo x={760} y={290}>Contador · Circulo</Rotulo>
        {/* colunas */}
        <Desenho>
          {iso ? (
            <>
              <Piso cx={300} cy={700} mw={250} mh={125} />
              <Coluna t={t} at={0} x={200} y={680} largura={70} altura={120} rotulo="JAN" />
              <Coluna t={t} at={0} x={300} y={710} largura={70} altura={190} rotulo="FEV" />
              <Coluna t={t} at={0} x={400} y={740} largura={70} altura={270} destaque rotulo="MAR" />
              <Bloco cx={120} cy={700} a={26} h={30} cor={T.c.enfeite} />
              <Moeda cx={480} cy={470} r={34} />
            </>
          ) : (
            <>
              <Reticula id="ret-pecas" passo={12} />
              <line x1={90} x2={520} y1={760} y2={760} stroke={T.id === 'jornal' ? T.c.tinta : T.c.linha} strokeWidth={6} />
              <Coluna t={t} at={0} x={160} y={760} largura={90} altura={140} rotulo="JAN" idPadrao="ret-pecas" />
              <Coluna t={t} at={0} x={300} y={760} largura={90} altura={230} rotulo="FEV" idPadrao="ret-pecas" />
              <Coluna t={t} at={0} x={440} y={760} largura={90} altura={320} destaque rotulo="MAR" idPadrao="ret-pecas" />
            </>
          )}
        </Desenho>
        <Rotulo x={70} y={830}>Coluna (sobe na palavra)</Rotulo>
        {/* marcos */}
        <Desenho>
          <path d="M 640 430 V 790" stroke={T.c.destaque} strokeWidth={8} strokeLinecap="round" />
        </Desenho>
        <Marco t={t} at={0} trilho={640} x={700} y={400} w={330} h={150} ano="2019" texto="Primeiro marco" indice={0} />
        <Marco t={t} at={0} trilho={640} x={700} y={640} w={330} h={150} ano="2026" texto="O último, cheio" ultimo indice={1} />
        <Rotulo x={640} y={830}>Marco</Rotulo>
        {/* rota */}
        <Desenho>
          <path d="M 120 1180 C 160 1000 380 1080 420 940 C 450 840 520 860 560 900" fill="none" stroke={T.id === 'isometrico' ? T.a('linha', 0.6) : T.c.linha} strokeWidth={30} strokeLinecap="round" />
          <Traco d="M 120 1180 C 160 1000 380 1080 420 940 C 450 840 520 860 560 900" p={1} cor={T.c.destaque} largura={14} />
        </Desenho>
        <Saida t={t} at={0} x={120} y={1180} />
        <Pino t={t} at={0} x={560} y={900} tamanho={90} />
        <Chip t={t} at={0} x={300} y={1150} texto="12 min" max={260} />
        <Rotulo x={70} y={1230}>Rota · Saida · Pino · Chip</Rotulo>
        {/* recorte */}
        <Recorte t={t} at={0} x={640} y={900} w={380} h={330} rot={4} manchete="Manchete do recorte" indice={0} />
        <Rotulo x={640} y={1270}>Recorte · Fita</Rotulo>
        {/* card final */}
        <div style={{ position: 'absolute', left: 70, top: 1330, width: 940, height: 540, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: (940 - 1080 * 0.6) / 2, top: -540 * 0.6 + 20, width: 1080, height: 1920, transform: 'scale(0.6)', transformOrigin: '0 0' }}>
            <CardFinal t={t} at={0} fontes={['fonte do dado (data)']} assinatura={FECHO.assinatura} frase={FECHO.fraseAssinatura} marca={MARCA} avisoIA={FECHO.avisoIA} />
          </div>
        </div>
        <Rotulo x={70} y={1880}>CardFinal</Rotulo>
      </AbsoluteFill>
    </TempoFixo.Provider>
  );
};

export const Raiz: React.FC = () => (
  <>
    <Still id="paletas" component={Paletas} width={2160} height={1920} />
    <Still id="elenco" component={Pecas} width={1080} height={1920} />
    {TEMAS.map((tema) => (
      <React.Fragment key={tema}>
        <Still id={`tema-${tema}`} component={() => <QuadroCena tipo={temaPronto(tema).capa as TipoCena} tema={tema} />} width={1080} height={1920} />
        {TIPOS_CENA.map((tipo) => (
          <React.Fragment key={tipo}>
            <Still id={`cena-${tipo}-${tema}`} component={() => <QuadroCena tipo={tipo} tema={tema} marcar />} width={1080} height={1920} />
            <Still id={`vista-${tipo}-${tema}`} component={() => <QuadroCena tipo={tipo} tema={tema} />} width={1080} height={1920} />
          </React.Fragment>
        ))}
        <Still
          id={`folha-${tema}`}
          component={() => (
            <ComTema id={tema}>
              <Folha tema={tema} />
            </ComTema>
          )}
          width={1780}
          height={574}
        />
      </React.Fragment>
    ))}
  </>
);
