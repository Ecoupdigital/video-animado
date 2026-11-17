import React from 'react';
import { Still } from 'remotion';
import { Folha, FolhaSecoes } from '../../componentes/Folha';
import { EXPRESSOES, Expressao } from '../../componentes/rosto';
import { Adulto } from '../../componentes/adulto';
import { Crianca, EXPRESSOES_CRIANCA, POSES_CRIANCA } from '../../componentes/crianca';
import { AparenciaEntrada, CABELOS_ADULTO, CABELOS_CRIANCA, resolverCrianca } from '../../componentes/presets';
import { TONS } from '../../componentes/cores';
import { PERSONAGENS } from '../../personagens';
import { MARCA, PESSOAS } from '../../componentes/universo';
import { AbsoluteFill } from 'remotion';
import { AdultoPersonagemProps } from '../../componentes/adulto';
import { CriancaPersonagemProps } from '../../componentes/crianca';
import { Lembranca, NaLuz } from '../../componentes/Cenario';
import { NoChao } from '../../componentes/Montagem';
import { Caderno, CartaoFonte, Fecho, LegendaParada, SeloTempo, SIMBOLOS, SimboloMarca } from '../../componentes/Texto';
import { CelularMarca, TelaCelular } from '../../componentes/CelularMarca';
import { COR } from '../../componentes/cores';
import { FONTE_TEXTO } from '../../componentes/fontes';
import { Apartamento } from '../../cenarios/Apartamento';
import { Escritorio } from '../../cenarios/Escritorio';
import { Escola } from '../../cenarios/Escola';
import { SalaDeEspera } from '../../cenarios/SalaDeEspera';
import { Luz, LUZES } from '../../componentes/Cenario';

// Folhas do universo. Todas com `parada` (respiração e piscada desligadas), para nada sumir nem piscar no frame 0.
//   expressoes-<id>    as expressões de cada personagem do elenco (gerado das respostas), mais o antes se houver
//   opcoes-aparencia   cada opção de aparência com o código que vai no respostas.json
//   elenco             os presets do modelo, para comparar o traço com o exemplo da vitrine
//   simbolos-marca     os símbolos de marca prontos, na cor da marca (código para o respostas.json)
//   teste-agora        a narradora no agora, com o celular da marca, o selo do agora e a legenda
//   teste-antes        a narradora no antes (aparência do antes, em sépia), com o selo do antes e a legenda
//   teste-caderno      o caderno do antes escrevendo, riscando e destacando, com o cartão de fonte
//   teste-celular      o celular da marca nos 4 moldes de tela (lista, semana, conversa, aviso)
//   teste-fecho        o fecho do vídeo com a narradora e o apoio (com ou sem marca, conforme as respostas)
//   cenarios           todos os cenários do modelo nas três luzes (manhã, tarde, madrugada)
//   cenario-<id>       um cenário de manhã em tela cheia (sala, quarto, escritorio, escola, sala-espera)

/** Adulto neutro que serve de base para mostrar uma opção por vez. */
const NEUTRO: AparenciaEntrada = { pele: 'p3', cabelo: 'curto', corCabelo: '#3A2A20', camisa: 'fechada', topo: '#5C7682', baixo: '#3E4248', tenis: '#FBF8F2' };
const NEUTRA_CRIANCA: AparenciaEntrada = { pele: 'p3', cabelo: 'franja', corCabelo: '#4A3428', topo: '#FBF8F2', baixo: '#8A8F6A', tenis: '#FBF8F2' };

/** Recorte do peito para cima, para a folha de opções caber numa tela. */
const Busto: React.FC<{ aparencia: AparenciaEntrada; expressao?: Expressao }> = ({ aparencia, expressao = 'feliz' }) => (
  <div style={{ width: 240, height: 250, overflow: 'hidden', position: 'relative' }}>
    <div style={{ position: 'absolute', left: -70, top: 14 }}>
      <Adulto aparencia={{ ...aparencia, altura: 1 }} expressao={expressao} escala={0.95} parada />
    </div>
  </div>
);

const corDoCabelo = (c: string) => (c === 'crespo' ? '#2A1E18' : c === 'coque' ? '#6B4A33' : '#3A2A20');

/** Escala da criança para caber na altura dada (em px). */
const escalaCrianca = (aparencia: AparenciaEntrada, antes: AparenciaEntrada | null, alturaMax: number, teto = 0.95) => {
  const alt = Math.max(resolverCrianca(aparencia).altura, antes ? resolverCrianca(aparencia, antes, 'antes').altura : 0);
  return Math.min(teto, alturaMax / (900 * alt));
};

// Elenco do universo para as cenas de teste; no kit ainda sem respostas, os presets do modelo.
const ADULTOS = PERSONAGENS.filter((p) => p.tipo === 'adulto');
const ENTRADA_NARRADORA = ADULTOS.find((p) => PESSOAS[p.id]?.papel === 'protagonista') ?? ADULTOS[0];
export const Narradora: React.FC<AdultoPersonagemProps> = (props) => {
  if (ENTRADA_NARRADORA && ENTRADA_NARRADORA.tipo === 'adulto') {
    const C = ENTRADA_NARRADORA.C;
    return <C {...props} />;
  }
  return <Adulto aparencia={{ preset: 'chanel-camisa-oliva' }} semente={1} {...props} />;
};
const ENTRADA_APOIO = ADULTOS.find((p) => p !== ENTRADA_NARRADORA);
const Apoio: React.FC<AdultoPersonagemProps> = (props) => {
  if (ENTRADA_APOIO && ENTRADA_APOIO.tipo === 'adulto') {
    const C = ENTRADA_APOIO.C;
    return <C {...props} />;
  }
  return <Adulto aparencia={{ preset: 'curto-barba-camiseta' }} semente={5} {...props} />;
};
const ENTRADA_CRIANCA = PERSONAGENS.find((p) => p.tipo === 'crianca');
const CriancaDoElenco: React.FC<CriancaPersonagemProps> = (props) => {
  if (ENTRADA_CRIANCA && ENTRADA_CRIANCA.tipo === 'crianca') {
    const C = ENTRADA_CRIANCA.C;
    return <C {...props} />;
  }
  return <Crianca aparencia={{ preset: 'crianca-arrepiado-listrada' }} {...props} />;
};

/** Telas de exemplo dos 4 moldes, com texto neutro (o vídeo passa o texto dele). */
const TELAS: { rotulo: string; tela: TelaCelular }[] = [
  {
    rotulo: "molde: 'lista'",
    tela: {
      molde: 'lista',
      titulo: 'Lista de hoje',
      itens: [
        { texto: 'Separar o que precisa', feito: true },
        { texto: 'Confirmar o horário', feito: true },
        { texto: 'Anotar as dúvidas', etiqueta: 'agora' },
        { texto: 'Chegar 10 minutos antes' },
      ],
      botao: 'Compartilhar lista',
    },
  },
  {
    rotulo: "molde: 'semana'",
    tela: { molde: 'semana', titulo: 'Seu progresso', etapa: 3, total: 8, rotulo: 'Semana', cartoes: ['O desafio desta semana', 'O próximo passo'] },
  },
  {
    rotulo: "molde: 'conversa'",
    tela: {
      molde: 'conversa',
      contato: MARCA?.nome ?? 'Atendimento',
      baloes: [
        { de: 'outro', texto: 'Oi! Posso confirmar o seu horário de amanhã?' },
        { de: 'eu', texto: 'Pode sim! Que horas mesmo?' },
        { de: 'outro', texto: 'Às 14h. Te mando um lembrete uma hora antes.' },
      ],
      digitando: true,
    },
  },
  {
    rotulo: "molde: 'aviso'",
    tela: { molde: 'aviso', titulo: 'Lembrete: amanhã às 14h', texto: 'Toque para confirmar ou remarcar o horário.', botao: 'Confirmar', hora: '9:41' },
  },
];

/** Cenários do modelo (todos, para as folhas; o universo usa os das respostas, em CENARIOS do universo.ts). */
export const CENARIOS: { id: string; rotulo: string; el: (l: Luz) => React.ReactNode }[] = [
  { id: 'sala', rotulo: 'Sala', el: (l) => <Apartamento comodo="sala" luz={l} /> },
  { id: 'quarto', rotulo: 'Quarto', el: (l) => <Apartamento comodo="quarto" luz={l} /> },
  { id: 'escritorio', rotulo: 'Escritório', el: (l) => <Escritorio luz={l} /> },
  { id: 'escola', rotulo: 'Escola', el: (l) => <Escola luz={l} /> },
  { id: 'sala-espera', rotulo: 'Sala de espera', el: (l) => <SalaDeEspera luz={l} /> },
];
const NOME_LUZ: Record<Luz, string> = { manha: 'manhã', tarde: 'tarde', madrugada: 'madrugada' };
const Mini: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ width: 300, height: 533, position: 'relative', borderRadius: 14, overflow: 'hidden' }}>{children}</div>
);

const RotuloStill: React.FC<{ texto: string; x: number; y: number; largura: number }> = ({ texto, x, y, largura }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: largura, textAlign: 'center', fontFamily: FONTE_TEXTO, fontWeight: 700, fontSize: 30, color: COR.tintaSuave }}>{texto}</div>
);

export const Raiz: React.FC = () => (
  <>
    {PERSONAGENS.map((p) => {
      const eu = PESSOAS[p.id];
      if (p.tipo === 'adulto') {
        const C = p.C;
        const itens: { rotulo: string; desenho: React.ReactNode }[] = EXPRESSOES.map((e) => ({ rotulo: e, desenho: <C expressao={e} escala={0.92} parada /> }));
        if (eu?.antes) itens.push({ rotulo: 'antes', desenho: <C epoca="antes" expressao="exausta" escala={0.92} parada /> });
        return (
          <Still
            key={p.id}
            id={`expressoes-${p.id}`}
            width={2200}
            height={2000}
            component={() => <Folha titulo={`${p.nome} · expressões${eu?.antes ? ' e o antes' : ''}`} colunas={5} alturaCelula={900} itens={itens} />}
          />
        );
      }
      const C = p.C;
      const k = escalaCrianca(eu?.aparencia ?? {}, eu?.antes ?? null, 470);
      const itens: { rotulo: string; desenho: React.ReactNode }[] = [
        ...EXPRESSOES_CRIANCA.map((e) => ({ rotulo: e, desenho: <C expressao={e} escala={k} parada /> })),
        ...POSES_CRIANCA.filter((x) => x !== 'parado').map((x) => ({ rotulo: x, desenho: <C pose={x} expressao="feliz" escala={k} parada /> })),
      ];
      if (eu?.antes) itens.push({ rotulo: 'antes', desenho: <C epoca="antes" expressao="neutra" escala={k} parada /> });
      return (
        <Still
          key={p.id}
          id={`expressoes-${p.id}`}
          width={2200}
          height={itens.length > 10 ? 1900 : 1300}
          component={() => <Folha titulo={`${p.nome} · expressões e poses (não fala)`} colunas={5} alturaCelula={540} itens={itens} />}
        />
      );
    })}
    <Still
      id="opcoes-aparencia"
      width={2200}
      height={2880}
      component={() => (
        <FolhaSecoes
          titulo="Opções de aparência · código para o respostas.json"
          secoes={[
            {
              titulo: 'Cabelo do adulto',
              colunas: 7,
              alturaCelula: 330,
              itens: CABELOS_ADULTO.map((c) => ({ rotulo: `cabelo: ${c}`, desenho: <Busto aparencia={{ ...NEUTRO, cabelo: c, corCabelo: corDoCabelo(c) }} /> })),
            },
            {
              titulo: 'Tom de pele',
              colunas: 8,
              alturaCelula: 330,
              itens: TONS.map((t) => ({ rotulo: `pele: ${t}`, desenho: <Busto aparencia={{ ...NEUTRO, pele: t }} /> })),
            },
            {
              titulo: 'Detalhes e corpo',
              colunas: 6,
              alturaCelula: 580,
              itens: [
                { rotulo: 'oculos: true', desenho: <Adulto aparencia={{ ...NEUTRO, oculos: true }} escala={0.55} parada /> },
                { rotulo: 'barba: true', desenho: <Adulto aparencia={{ ...NEUTRO, barba: true }} escala={0.55} parada /> },
                { rotulo: 'cilios: true', desenho: <Adulto aparencia={{ ...NEUTRO, cilios: true, cabelo: 'rabo' }} escala={0.55} parada /> },
                { rotulo: 'barriga: 0.5', desenho: <Adulto aparencia={{ ...NEUTRO, barriga: 0.5 }} escala={0.55} parada /> },
                { rotulo: 'barriga: 1', desenho: <Adulto aparencia={{ ...NEUTRO, barriga: 1 }} escala={0.55} parada /> },
                { rotulo: 'ombros: 20', desenho: <Adulto aparencia={{ ...NEUTRO, ombros: 20 }} escala={0.55} parada /> },
              ],
            },
            {
              titulo: 'Roupa do adulto',
              colunas: 6,
              alturaCelula: 580,
              itens: [
                { rotulo: 'camisa: aberta', desenho: <Adulto aparencia={{ ...NEUTRO, camisa: 'aberta', topo: '#8A8F6A' }} escala={0.55} parada /> },
                { rotulo: 'camisa: fechada', desenho: <Adulto aparencia={NEUTRO} escala={0.55} parada /> },
                { rotulo: 'manga: sem', desenho: <Adulto aparencia={{ ...NEUTRO, manga: 'sem' }} escala={0.55} parada /> },
                { rotulo: 'manga: longa', desenho: <Adulto aparencia={{ ...NEUTRO, manga: 'longa' }} escala={0.55} parada /> },
                { rotulo: 'tipoBaixo: bermuda', desenho: <Adulto aparencia={{ ...NEUTRO, tipoBaixo: 'bermuda' }} escala={0.55} parada /> },
                { rotulo: 'tipoBaixo: saia', desenho: <Adulto aparencia={{ ...NEUTRO, tipoBaixo: 'saia', baixo: '#8A8F6A', cabelo: 'chanel' }} escala={0.55} parada /> },
              ],
            },
            {
              titulo: 'Criança (corpo: "crianca")',
              colunas: 7,
              alturaCelula: 400,
              itens: [
                ...CABELOS_CRIANCA.map((c) => ({ rotulo: `cabelo: ${c}`, desenho: <Crianca aparencia={{ ...NEUTRA_CRIANCA, cabelo: c, corCabelo: c === 'crespo' ? '#2A1E18' : '#4A3428' }} expressao="feliz" escala={0.62} parada /> })),
                { rotulo: 'listras', desenho: <Crianca aparencia={{ ...NEUTRA_CRIANCA, listras: '#2F4A55' }} expressao="feliz" escala={0.62} parada /> },
                { rotulo: 'tipoBaixo: saia', desenho: <Crianca aparencia={{ ...NEUTRA_CRIANCA, tipoBaixo: 'saia', baixo: '#5C7682', cabelo: 'marias' }} expressao="feliz" escala={0.62} parada /> },
                { rotulo: 'oculos, curativo', desenho: <Crianca aparencia={{ ...NEUTRA_CRIANCA, oculos: true, curativo: true }} expressao="feliz" escala={0.62} parada /> },
              ],
            },
          ]}
        />
      )}
    />
    <Still
      id="elenco"
      width={2000}
      height={1150}
      component={() => (
        <Folha
          titulo="Presets do modelo · elenco"
          colunas={4}
          alturaCelula={960}
          itens={[
            { rotulo: 'chanel-camisa-oliva', desenho: <Adulto aparencia={{ preset: 'chanel-camisa-oliva' }} semente={1} expressao="ironica" escala={0.92} parada /> },
            { rotulo: 'chanel-camisa-oliva, antes', desenho: <Adulto aparencia={{ preset: 'chanel-camisa-oliva' }} semente={1} epoca="antes" expressao="exausta" escala={0.92} parada /> },
            { rotulo: 'crianca-arrepiado-listrada', desenho: <Crianca aparencia={{ preset: 'crianca-arrepiado-listrada' }} expressao="travesso" escala={0.92} parada /> },
            { rotulo: 'curto-barba-camiseta', desenho: <Adulto aparencia={{ preset: 'curto-barba-camiseta' }} semente={5} expressao="feliz" escala={0.86} parada /> },
          ]}
        />
      )}
    />
    <Still
      id="simbolos-marca"
      width={2200}
      height={560}
      component={() => (
        <Folha
          titulo={`Símbolos de marca · na cor ${MARCA?.cor ?? 'de destaque'}`}
          colunas={7}
          alturaCelula={330}
          itens={SIMBOLOS.map((sb) => ({ rotulo: `simbolo: ${sb}`, desenho: <div style={{ paddingBottom: 24 }}><SimboloMarca simbolo={sb} tamanho={190} /></div> }))}
        />
      )}
    />
    <Still
      id="teste-agora"
      width={1080}
      height={1920}
      component={() => (
        <AbsoluteFill>
          <Apartamento comodo="sala" luz="manha" brinquedos={Boolean(ENTRADA_CRIANCA)} />
          <NoChao x={20}>
            <CriancaDoElenco pose="correndo" expressao="feliz" parada />
          </NoChao>
          <NoChao x={300}>
            <Narradora expressao="aliviada" segurando="celular" parada />
          </NoChao>
          <div style={{ position: 'absolute', left: 640, top: 640 }}>
            <CelularMarca tela={TELAS[0].tela} largura={330} inclinacao={4} />
          </div>
          <SeloTempo tempo="agora" detalhe="o detalhe do episódio" inicio={-60} />
          <LegendaParada texto="Agora a lista já sabe o que falta fazer hoje." destaque={4} />
        </AbsoluteFill>
      )}
    />
    <Still
      id="teste-antes"
      width={1080}
      height={1920}
      component={() => (
        <AbsoluteFill>
          <Lembranca>
            <Apartamento comodo="sala" luz="madrugada" />
            <NoChao x={300}>
              <NaLuz luz="madrugada">
                <Narradora epoca="antes" expressao="exausta" segurando="caderno" parada />
              </NaLuz>
            </NoChao>
          </Lembranca>
          <SeloTempo tempo="antes" detalhe="o detalhe do episódio" inicio={-60} />
          <LegendaParada texto="Da primeira vez, eu tinha uma planilha. E um caderno. E cinco apps." destaque={9} />
        </AbsoluteFill>
      )}
    />
    <Still
      id="teste-caderno"
      width={1080}
      height={1920}
      component={() => (
        <AbsoluteFill>
          <Lembranca>
            <Apartamento comodo="sala" luz="madrugada" />
          </Lembranca>
          <SeloTempo tempo="antes" detalhe="o detalhe do episódio" inicio={-60} />
          <Caderno
            titulo="Lista da semana"
            topo={420}
            inicio={-60}
            linhas={[
              { texto: 'Começar segunda (!!)', inicio: -60, destaque: true },
              { texto: 'Anotar tudo no papel', inicio: -60 },
              { texto: 'Quanto tempo mesmo??', inicio: -60 },
              { texto: 'Perguntar pra alguém', inicio: -60, riscado: true },
              { texto: 'cadê a outra folha?', inicio: -60 },
            ]}
          />
          <CartaoFonte texto="exemplo de cartão de fonte, quando o assunto pedir" inicio={-60} />
        </AbsoluteFill>
      )}
    />
    <Still
      id="teste-celular"
      width={1080}
      height={1920}
      component={() => (
        <AbsoluteFill style={{ background: COR.linho }}>
          {TELAS.map((t, i) => {
            const x = i % 2 === 0 ? 105 : 585;
            const y = i < 2 ? 130 : 1020;
            return (
              <React.Fragment key={t.rotulo}>
                <div style={{ position: 'absolute', left: x, top: y }}>
                  <CelularMarca tela={t.tela} largura={390} />
                </div>
                <RotuloStill texto={t.rotulo} x={x} y={y + 822} largura={390} />
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
      )}
    />
    <Still
      id="teste-fecho"
      width={1080}
      height={1920}
      component={() => (
        <AbsoluteFill>
          <Apartamento comodo="quarto" luz="tarde" />
          <NoChao x={90}>
            <NaLuz luz="tarde">
              <Narradora expressao="feliz" parada />
            </NaLuz>
          </NoChao>
          <NoChao x={520}>
            <NaLuz luz="tarde">
              <Apoio expressao="feliz" parada />
            </NaLuz>
          </NoChao>
          <Fecho inicio={-60} />
        </AbsoluteFill>
      )}
    />
    <Still
      id="cenarios"
      width={1400}
      height={3320}
      component={() => (
        <Folha
          titulo="Cenários · manhã, tarde e madrugada"
          colunas={3}
          alturaCelula={600}
          itens={CENARIOS.flatMap((c) => LUZES.map((l) => ({ rotulo: `${c.rotulo} · ${NOME_LUZ[l]}`, desenho: <Mini>{c.el(l)}</Mini> })))}
        />
      )}
    />
    {CENARIOS.map((c) => (
      <Still key={c.id} id={`cenario-${c.id}`} width={1080} height={1920} component={() => <AbsoluteFill>{c.el('manha')}</AbsoluteFill>} />
    ))}
  </>
);
