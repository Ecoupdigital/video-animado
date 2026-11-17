import React from 'react';
import { Still } from 'remotion';
import { Folha, FolhaSecoes } from '../../componentes/Folha';
import { EXPRESSOES, Expressao } from '../../componentes/rosto';
import { Pessoa } from '../../componentes/Pessoa';
import { Bebe, Cachorro, EXPRESSOES_BEBE, EXPRESSOES_CACHORRO } from '../../componentes/Acompanhantes';
import { AparenciaEntrada, CABELOS, NomePreset } from '../../componentes/presets';
import { COR, TONS } from '../../componentes/cores';
import { PERSONAGENS } from '../../personagens';
import { AbsoluteFill } from 'remotion';
import { PessoaPersonagemProps } from '../../componentes/Pessoa';
import { CelularMarca, TelaCelular } from '../../componentes/CelularMarca';
import { Fecho, SIMBOLOS, SimboloMarca } from '../../componentes/Texto';
import { FONTE_TITULO } from '../../componentes/fontes';
import { CHAO_Y, Hora, PersonagemNaNoite } from '../../componentes/Cenario';
import { NoChao } from '../../componentes/Montagem';
import { CENARIOS as CENARIOS_DO_UNIVERSO, MARCA, PESSOAS, UNIVERSO } from '../../componentes/universo';
import { CartaoFonte, LegendaParada, TituloDica } from '../../componentes/Texto';
import { Casa, Comodo } from '../../cenarios/Casa';
import { SalaDeEspera } from '../../cenarios/SalaDeEspera';
import { Rua } from '../../cenarios/Rua';

// Folhas de personagem do universo. Todas com `parada` (respiração e piscada desligadas),
// para nada sumir nem piscar no frame 0.
//   expressoes-<id>    as expressões de cada personagem do elenco (gerado das respostas)
//   opcoes-aparencia   cada opção de aparência com o código que vai no respostas.json
//   elenco             os presets do modelo, para comparar o traço com o exemplo da vitrine
//   simbolos-marca     os símbolos de marca prontos, na cor da marca (código para o respostas.json)
//   teste-celular      o celular da marca nos 4 moldes de tela (lista, semana, conversa, aviso)
//   teste-fecho        o fecho do vídeo com a protagonista (com ou sem marca, conforme as respostas)
//   cenarios           todos os cenários do modelo, de dia e de noite
//   cenario-<id>       um cenário de dia em tela cheia (e cenario-<id>-noite)
//   teste-cena         a protagonista num cenário com título, cartão de fonte e legenda
//   teste-noite        a protagonista à noite (escurece junto com o cenário) com o celular da marca

/** Pessoa neutra que serve de base para mostrar uma opção por vez. */
const NEUTRA: AparenciaEntrada = { pele: 'p4', cabelo: 'curto-liso', corCabelo: '#3B2418', topo: '#7A9CC6', baixo: '#4A5568', sapato: '#4A4A4A' };

/** Recorte do peito para cima, para a folha de opções caber numa tela. */
const Busto: React.FC<{ aparencia: AparenciaEntrada; expressao?: Expressao }> = ({ aparencia, expressao = 'feliz' }) => (
  <div style={{ width: 240, height: 300, overflow: 'hidden', position: 'relative' }}>
    <div style={{ position: 'absolute', left: 0, top: -14 }}>
      <Pessoa aparencia={{ ...aparencia, altura: 1 }} expressao={expressao} escala={0.6} parada />
    </div>
  </div>
);

const CORPO_PADRAO_CABELO = (c: string) => (c === 'armado' ? '#CFCBC6' : '#3B2418');

const ELENCO_EXEMPLO: { preset: NomePreset; expressao: Expressao; barriga?: number }[] = [
  { preset: 'coque-sardas', expressao: 'feliz', barriga: 0.55 },
  { preset: 'crespo-barba', expressao: 'feliz' },
  { preset: 'grisalha-perolas', expressao: 'falando' },
  { preset: 'cachos-mochila', expressao: 'feliz' },
];

/** A protagonista do universo (ou, no kit ainda sem respostas, o preset coque-sardas). */
const ENTRADA_PROTAGONISTA =
  PERSONAGENS.find((p) => p.tipo === 'pessoa' && PESSOAS[p.id]?.papel === 'protagonista') ?? PERSONAGENS.find((p) => p.tipo === 'pessoa');
export const Protagonista: React.FC<PessoaPersonagemProps> = (props) => {
  if (ENTRADA_PROTAGONISTA && ENTRADA_PROTAGONISTA.tipo === 'pessoa') {
    const C = ENTRADA_PROTAGONISTA.C;
    return <C {...props} />;
  }
  return <Pessoa aparencia={{ preset: 'coque-sardas' }} {...props} />;
};

/** Cenários do modelo (todos, para as folhas; o universo usa os das respostas). */
export const CENARIOS: { id: string; rotulo: string; el: (hora: Hora) => React.ReactNode }[] = [
  { id: 'sala', rotulo: 'Casa · sala', el: (h) => <Casa comodo="sala" hora={h} /> },
  { id: 'cozinha', rotulo: 'Casa · cozinha', el: (h) => <Casa comodo="cozinha" hora={h} /> },
  { id: 'quarto-0', rotulo: 'Quarto · etapa 0', el: (h) => <Casa comodo="quarto" etapaQuarto={0} hora={h} /> },
  { id: 'quarto-3', rotulo: 'Quarto · etapa 3', el: (h) => <Casa comodo="quarto" etapaQuarto={3} hora={h} /> },
  { id: 'banheiro', rotulo: 'Casa · banheiro', el: (h) => <Casa comodo="banheiro" objetosNaPia={['copo-escova', 'pasta', 'frasco', 'sabonete']} hora={h} /> },
  { id: 'sala-espera', rotulo: 'Sala de espera', el: (h) => <SalaDeEspera hora={h} /> },
  { id: 'rua', rotulo: 'Rua · loja', el: (h) => <Rua hora={h} /> },
];

const Mini: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ width: 300, height: 533, position: 'relative', borderRadius: 16, overflow: 'hidden' }}>{children}</div>
);

/** A primeira pessoa de apoio do elenco (para as cenas de teste com duas pessoas). */
const ENTRADA_APOIO = PERSONAGENS.find((p) => p.tipo === 'pessoa' && p !== ENTRADA_PROTAGONISTA);
const Apoio: React.FC<PessoaPersonagemProps> = (props) => {
  if (ENTRADA_APOIO && ENTRADA_APOIO.tipo === 'pessoa') {
    const C = ENTRADA_APOIO.C;
    return <C {...props} />;
  }
  return <Pessoa aparencia={{ preset: 'crespo-barba' }} semente={2} {...props} />;
};
const ENTRADA_CACHORRO = PERSONAGENS.find((p) => p.tipo === 'cachorro');

/** Cenário da cena de teste: a sala de espera se o universo usa, senão o primeiro cômodo escolhido. */
const CenaTeste: React.FC<{ hora?: Hora }> = ({ hora = 'dia' }) =>
  CENARIOS_DO_UNIVERSO.salaEspera ? <SalaDeEspera hora={hora} /> : <Casa comodo={(CENARIOS_DO_UNIVERSO.casa[0] as Comodo) ?? 'cozinha'} hora={hora} listas={10} />;

/** Telas de exemplo dos 4 moldes, com texto neutro (o vídeo passa o texto dele). */
const TELAS: { rotulo: string; tela: TelaCelular }[] = [
  {
    rotulo: "molde: 'lista'",
    tela: {
      molde: 'lista',
      titulo: 'Lista de hoje',
      itens: [
        { texto: 'Separar os documentos', feito: true },
        { texto: 'Confirmar o horário', feito: true },
        { texto: 'Anotar as dúvidas para perguntar', etiqueta: 'agora' },
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

const RotuloStill: React.FC<{ texto: string; x: number; y: number; largura: number }> = ({ texto, x, y, largura }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: largura, textAlign: 'center', fontFamily: FONTE_TITULO, fontWeight: 700, fontSize: 32, color: COR.textoSuave }}>{texto}</div>
);

export const Raiz: React.FC = () => (
  <>
    {PERSONAGENS.map((p) => {
      if (p.tipo === 'pessoa') {
        const C = p.C;
        return (
          <Still
            key={p.id}
            id={`expressoes-${p.id}`}
            width={2200}
            height={1700}
            component={() => (
              <Folha
                titulo={`${p.nome} · expressões`}
                colunas={5}
                alturaCelula={760}
                itens={EXPRESSOES.map((e) => ({ rotulo: e, desenho: <C expressao={e} escala={0.68} parada /> }))}
              />
            )}
          />
        );
      }
      if (p.tipo === 'cachorro') {
        const C = p.C;
        return (
          <Still
            key={p.id}
            id={`expressoes-${p.id}`}
            width={2200}
            height={600}
            component={() => (
              <Folha
                titulo={`${p.nome} · expressões`}
                colunas={5}
                alturaCelula={380}
                itens={EXPRESSOES_CACHORRO.map((e) => ({ rotulo: e, desenho: <C expressao={e} escala={1} parada /> }))}
              />
            )}
          />
        );
      }
      const C = p.C;
      return (
        <Still
          key={p.id}
          id={`expressoes-${p.id}`}
          width={1800}
          height={560}
          component={() => (
            <Folha
              titulo={`${p.nome} · expressões`}
              colunas={4}
              alturaCelula={340}
              itens={EXPRESSOES_BEBE.map((e) => ({ rotulo: e, desenho: <C expressao={e} escala={1.4} parada /> }))}
            />
          )}
        />
      );
    })}
    <Still
      id="opcoes-aparencia"
      width={2200}
      height={2320}
      component={() => (
        <FolhaSecoes
          titulo="Opções de aparência · código para o respostas.json"
          secoes={[
            {
              titulo: 'Cabelo',
              colunas: 7,
              alturaCelula: 380,
              itens: CABELOS.map((c) => ({ rotulo: `cabelo: ${c}`, desenho: <Busto aparencia={{ ...NEUTRA, cabelo: c, corCabelo: CORPO_PADRAO_CABELO(c) }} /> })),
            },
            {
              titulo: 'Tom de pele',
              colunas: 8,
              alturaCelula: 380,
              itens: TONS.map((t) => ({ rotulo: `pele: ${t}`, desenho: <Busto aparencia={{ ...NEUTRA, pele: t }} /> })),
            },
            {
              titulo: 'Detalhes do rosto',
              colunas: 6,
              alturaCelula: 380,
              itens: [
                { rotulo: 'oculos: true', desenho: <Busto aparencia={{ ...NEUTRA, oculos: true }} /> },
                { rotulo: 'barba: true', desenho: <Busto aparencia={{ ...NEUTRA, barba: true }} /> },
                { rotulo: 'sardas: true', desenho: <Busto aparencia={{ ...NEUTRA, sardas: true }} /> },
                { rotulo: 'rugas: true', desenho: <Busto aparencia={{ ...NEUTRA, rugas: true }} /> },
                { rotulo: 'cilios: true', desenho: <Busto aparencia={{ ...NEUTRA, cilios: true }} /> },
                { rotulo: 'acessorio: perolas', desenho: <Busto aparencia={{ ...NEUTRA, acessorio: 'perolas' }} /> },
              ],
            },
            {
              titulo: 'Roupa',
              colunas: 6,
              alturaCelula: 560,
              itens: [
                { rotulo: 'tipoBaixo: calca', desenho: <Pessoa aparencia={NEUTRA} expressao="neutra" escala={0.55} parada /> },
                { rotulo: 'tipoBaixo: saia', desenho: <Pessoa aparencia={{ ...NEUTRA, tipoBaixo: 'saia' }} expressao="neutra" escala={0.55} parada /> },
                { rotulo: 'tipoBaixo: jardineira', desenho: <Pessoa aparencia={{ ...NEUTRA, tipoBaixo: 'jardineira', baixo: '#8DB1D6' }} expressao="neutra" escala={0.55} parada /> },
                { rotulo: 'manga: longa', desenho: <Pessoa aparencia={{ ...NEUTRA, manga: 'longa' }} expressao="neutra" escala={0.55} parada /> },
                { rotulo: 'jaleco: true', desenho: <Pessoa aparencia={{ ...NEUTRA, jaleco: true }} expressao="neutra" escala={0.55} parada /> },
                { rotulo: 'acessorio: mochila', desenho: <Pessoa aparencia={{ ...NEUTRA, acessorio: 'mochila' }} expressao="neutra" escala={0.55} parada /> },
              ],
            },
          ]}
        />
      )}
    />
    <Still
      id="elenco"
      width={2200}
      height={950}
      component={() => (
        <Folha
          titulo="Presets do modelo · elenco"
          colunas={5}
          alturaCelula={760}
          itens={[
            ...ELENCO_EXEMPLO.map((e, i) => ({
              rotulo: e.preset,
              desenho: <Pessoa aparencia={{ preset: e.preset }} semente={i + 1} expressao={e.expressao} barriga={e.barriga} escala={0.68} parada />,
            })),
            {
              rotulo: 'cachorro e bebê',
              desenho: (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
                  <Bebe expressao="acordado" escala={1.1} parada />
                  <Cachorro cor="caramelo" expressao="curioso" escala={1} parada />
                </div>
              ),
            },
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
      id="teste-celular"
      width={1080}
      height={1920}
      component={() => (
        <AbsoluteFill style={{ background: COR.fundo2 }}>
          {TELAS.map((t, i) => {
            const x = i % 2 === 0 ? 105 : 585;
            const y = i < 2 ? 130 : 1020;
            return (
              <React.Fragment key={t.rotulo}>
                <div style={{ position: 'absolute', left: x, top: y }}>
                  <CelularMarca tela={t.tela} largura={390} />
                </div>
                <RotuloStill texto={t.rotulo} x={x} y={y + 816} largura={390} />
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
          <Casa comodo="sala" />
          <NoChao x={340} escala={1.1}>
            <Protagonista expressao="feliz" escala={1.1} parada />
          </NoChao>
          <Fecho inicio={-30} />
        </AbsoluteFill>
      )}
    />
    <Still
      id="cenarios"
      width={2390}
      height={1440}
      component={() => (
        <Folha
          titulo="Cenários · dia e noite"
          colunas={7}
          alturaCelula={600}
          itens={[
            ...CENARIOS.map((c) => ({ rotulo: c.rotulo, desenho: <Mini>{c.el('dia')}</Mini> })),
            ...CENARIOS.map((c) => ({ rotulo: 'à noite', desenho: <Mini>{c.el('noite')}</Mini> })),
          ]}
        />
      )}
    />
    {CENARIOS.map((c) => (
      <React.Fragment key={c.id}>
        <Still id={`cenario-${c.id}`} width={1080} height={1920} component={() => <AbsoluteFill>{c.el('dia')}</AbsoluteFill>} />
        <Still id={`cenario-${c.id}-noite`} width={1080} height={1920} component={() => <AbsoluteFill>{c.el('noite')}</AbsoluteFill>} />
      </React.Fragment>
    ))}
    <Still
      id="teste-cena"
      width={1080}
      height={1920}
      component={() => (
        <AbsoluteFill>
          <CenaTeste />
          <NoChao x={20}>
            <Protagonista expressao="apontando" falando={0.5} olhando="direita" parada />
          </NoChao>
          <NoChao x={390}>
            <Apoio expressao="surpresa" olhando="esquerda" parada />
          </NoChao>
          {ENTRADA_CACHORRO && ENTRADA_CACHORRO.tipo === 'cachorro' && (
            <div style={{ position: 'absolute', left: 800, top: CHAO_Y - 235 }}>
              <ENTRADA_CACHORRO.C expressao="curioso" escala={0.8} parada />
            </div>
          )}
          <TituloDica texto={UNIVERSO.nome} inicio={-30} cartao />
          <CartaoFonte texto="nome da fonte, quando o assunto pedir" inicio={-30} />
          <LegendaParada texto="a palavra falada acende" destaque={2} y={600} />
        </AbsoluteFill>
      )}
    />
    <Still
      id="teste-noite"
      width={1080}
      height={1920}
      component={() => (
        <AbsoluteFill>
          <Casa comodo="sala" hora="noite" />
          <div style={{ position: 'absolute', left: 80, top: 500 }}>
            <CelularMarca tela={TELAS[3].tela} largura={400} inclinacao={-4} />
          </div>
          <NoChao x={580} escala={1.05}>
            <PersonagemNaNoite hora="noite">
              <Protagonista expressao="cansada" segurando="celular" escala={1.05} parada />
            </PersonagemNaNoite>
          </NoChao>
        </AbsoluteFill>
      )}
    />
  </>
);
