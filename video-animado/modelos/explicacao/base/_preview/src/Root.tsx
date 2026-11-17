import React from 'react';
import { AbsoluteFill, Still } from 'remotion';
import { TempoFixo } from '../../componentes/anima';
import { EXEMPLO } from '../../componentes/exemplo';
import { AreaSegura, Fundo } from '../../componentes/fundo';
import { Explicacao } from '../../componentes/Montagem';
import {
  Caixa,
  CardFinal,
  Cartao,
  Circulo,
  Cursor,
  Icone,
  Janela,
  layoutJanela,
  NOMES_ICONES,
  Onda,
  Risco,
  Seta,
  TextoMao,
  Titulo,
} from '../../componentes/pecas';
import { comTempoSintetico, TIPOS_CENA, type TipoCena } from '../../componentes/roteiro';
import { ComTema, TEMAS, temaPronto, useTema, type IdTema } from '../../componentes/tema';
import { FECHO, MARCA } from '../../componentes/universo';
import { Paletas } from './Paletas';

// Stills do universo (npx remotion still _preview/src/index.ts <id> imagens/<id>.png):
//   paletas             os 4 temas lado a lado: cada papel de cor (com as trocas das respostas no tema escolhido) e as 3 fontes
//   cena-<tipo>-<tema>  uma cena da explicação de exemplo num tema, com a área segura marcada (still de conferência):
//                       tipos abertura, passos, conta, colunas, tela, final; temas quadro, lousa, post-its, tela-app
//   vista-<tipo>-<tema> o mesmo quadro sem a marcação (brandbook)
//   tema-<id>           a capa de cada tema, sem marcação (a cena que mais mostra o tema): a pergunta 8 mostra estas 4
//   folha-<tema>        as 6 cenas de exemplo num tema, lado a lado, sem marcação
//   elenco              as peças no tema escolhido (o modelo não tem elenco: a vitrine chama de "Peças")

const EX = comTempoSintetico(EXEMPLO);
/** instante mostrado no still de cada cena: perto do fim, com todas as peças na tela */
const momento = (tipo: TipoCena) => EX.cenas.find((x) => x.tipo === tipo)!.fim - 0.25;

const QuadroCena: React.FC<{ tipo: TipoCena; tema: IdTema; marcar?: boolean }> = ({ tipo, tema, marcar }) => (
  <ComTema id={tema}>
    <TempoFixo.Provider value={momento(tipo)}>
      <AbsoluteFill>
        <Explicacao timing={EX} duck={[]} comSom={false} />
        {marcar ? <AreaSegura /> : null}
      </AbsoluteFill>
    </TempoFixo.Provider>
  </ComTema>
);

const Folha: React.FC<{ tema: IdTema }> = ({ tema }) => {
  const T = useTema();
  return (
    <AbsoluteFill style={{ background: T.escuro ? T.c.moldura2 : T.c.linha, padding: 20, boxSizing: 'border-box', flexDirection: 'row', gap: 20 }}>
      {TIPOS_CENA.map((tipo) => (
        <div key={tipo} style={{ width: 270, height: 480 + 34 }}>
          <div style={{ width: 270, height: 480, overflow: 'hidden', position: 'relative', borderRadius: 8 }}>
            <div style={{ width: 1080, height: 1920, transform: 'scale(0.25)', transformOrigin: '0 0', position: 'absolute' }}>
              <QuadroCena tipo={tipo} tema={tema} />
            </div>
          </div>
          <div style={{ fontFamily: T.f.mono, fontSize: 20, color: T.c.texto, marginTop: 6 }}>{tipo}</div>
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
    <div style={{ position: 'absolute', left: x, top: y, fontFamily: T.f.mono, fontSize: 20, color: T.id === 'tela-app' ? T.c.texto : T.c.suave, letterSpacing: '0.06em', filter: T.filtro }}>{children}</div>
  );
  const L = layoutJanela(0, 0, 900, 780);
  const corIcone = T.id === 'tela-app' ? T.c.titulo : T.c.traco;
  return (
    <TempoFixo.Provider value={t}>
      <AbsoluteFill>
        <Fundo />
        <Rotulo x={70} y={56}>{`peças · ${T.nome.toLowerCase()}`}</Rotulo>
        <Titulo t={t} palavras={[{ w: 'Título', at: 0 }, { w: 'à', at: 0 }, { w: 'mão', at: 0, d: true }]} topo={96} tamanho={T.tituloMao ? 110 : 80} alturaMax={140} />
        <Risco t={t} at={0} x1={90} x2={520} y={T.tituloMao ? 232 : 200} />
        <Rotulo x={760} y={150}>Titulo · Risco</Rotulo>
        <Caixa t={t} at={0} x={70} y={290} w={600} h={150} texto="Caixa com ícone" icone="documento" indice={0} />
        <Seta t={t} at={0} de={[370, 456]} para={[370, 560]} />
        <Caixa t={t} at={0} x={70} y={576} w={600} h={150} texto="= *Resultado*" icone="moeda" indice={3} destaque />
        <Circulo t={t} at={0} cx={T.id === 'tela-app' ? 370 : 430} cy={651} rx={T.id === 'tela-app' ? 318 : 230} ry={T.id === 'tela-app' ? 93 : 82} />
        <Rotulo x={700} y={420}>Caixa · Seta · Circulo</Rotulo>
        <TextoMao t={t} at={0} texto="R$ 1.250 × *3*" x={700} y={600} largura={330} altura={110} tamanho={80} cor={T.id === 'tela-app' ? T.c.titulo : T.c.traco} />
        <Rotulo x={700} y={712}>TextoMao</Rotulo>
        {/* ícones */}
        {NOMES_ICONES.map((n, i) => (
          <Icone key={n} nome={n} x={110 + (i % 7) * 143} y={830 + Math.floor(i / 7) * 120} tamanho={84} cor={i % 7 === 3 ? T.c.destaque : corIcone} />
        ))}
        <Rotulo x={70} y={1000}>Icone (14, desenhados em código)</Rotulo>
        {/* cartões */}
        <Cartao t={t} at={0} x={70} y={1070} w={270} h={140} texto="Cartão parado" indice={1} />
        <Cartao t={t} at={0} x={380} y={1050} w={270} h={140} texto="Cartão andando" indice={4} erguido={0.8} />
        <Rotulo x={70} y={1228}>Cartao (parado e andando)</Rotulo>
        {/* janela, cursor e onda */}
        <div style={{ position: 'absolute', left: 690, top: 1050, width: 900 * 0.36, height: 780 * 0.36, overflow: 'visible' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: 'scale(0.36)', transformOrigin: '0 0' }}>
            <Janela t={t} at={0} L={L} endereco="seu painel · início" secao="Seção" botao="Criar" aperto={1} />
            <Onda t={0.25} at={0} x={L.botao.x + L.botao.w / 2} y={L.botao.y + L.botao.h / 2} />
            <Cursor x={L.botao.x + L.botao.w * 0.55} y={L.botao.y + L.botao.h * 0.6} aperto={1} />
          </div>
        </div>
        <Rotulo x={690} y={1340}>Janela · Cursor · Onda</Rotulo>
        {/* card final */}
        <div style={{ position: 'absolute', left: 70, top: 1380, width: 940, height: 500, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: (940 - 1080 * 0.6) / 2, top: -540 * 0.6 + 10, width: 1080, height: 1920, transform: 'scale(0.6)', transformOrigin: '0 0' }}>
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
