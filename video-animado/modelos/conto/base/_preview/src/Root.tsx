import React from 'react';
import { AbsoluteFill, Still } from 'remotion';
import { LISTAS, PRESETS, TONS, type AparenciaEntrada } from '../../componentes/aparencia';
import { Folha, type ItemFolha } from '../../componentes/Folha';
import opcoes from '../../componentes/opcoes.json';
import { Personagem } from '../../componentes/Personagem';
import { EXPRESSOES, OLHARES } from '../../componentes/rosto';
import { ComTema, legivel, TEMAS, useTema, type IdTema } from '../../componentes/tema';
import { TEMA, UNIVERSO } from '../../componentes/universo';
import { blocoDe, EXEMPLO } from '../../componentes/exemplo';
import { AreaSegura, Cena, TIPOS_CENA, type TipoCena } from '../../componentes/Montagem';
import { Paletas } from './Paletas';
import { PERSONAGENS } from '../../personagens';

// Stills do universo (npx remotion still _preview/src/index.ts <id> imagens/<id>.png). Os de personagem saem com
// `parada` (respiração e piscada desligadas), para nada piscar no frame 0. Um por tema da lista do opcoes.json:
//   expressoes-<id>-<tema>    as 8 expressões de um personagem do elenco, no traço do tema
//   opcoes-aparencia-<tema>   cada opção de aparência que o tema lê (as dele e as que divide) e as comuns, com o
//                             código do respostas.json
//   poses-<tema>              a protagonista olhando nas 5 direções, espelhada, parada e com a boca de 0 a 1
//   elenco                    o elenco do universo no tema dele
//   tema-<id>                 a cena da tela de referência do tema (a pergunta 8 mostra estas), sem marcação
//   cenarios-<tema>           os cenários do modelo no tema, lado a lado, com a placa do lugar
//   cena-<tipo>-<tema>        uma cena de cada tipo (abertura, dialogo, narrador, fecho) com a área segura marcada
//   vista-<tipo>-<tema>       a mesma cena sem a marcação (brandbook)
//   paletas                   os temas lado a lado: cada papel de cor (com as trocas das respostas) e as fontes

const NEUTRA: AparenciaEntrada = { cor: '#7A9CC6', corDetalhe: '#E4572E', acessorio: 'nenhum', pele: 'p4', cabelo: 'curto', corCabelo: '#3B2418', roupa: 'camisa-calca', corBaixo: '#4A5568', sapato: '#3A3A3A', corpo: 'pilula', olhos: 'redondos', sobrancelha: 'fina', formato: 'reto', altura: 'alta' };

const PROTAGONISTA = PERSONAGENS.find((p) => p.papel === 'protagonista') ?? PERSONAGENS[0];

/** Corpo inteiro numa célula, com a escala dada. */
const Corpo: React.FC<{ aparencia: AparenciaEntrada; escala: number; children?: never } & React.ComponentProps<typeof Personagem>> = (props) => <Personagem {...props} parada={props.parada ?? true} />;

const FolhaExpressoes: React.FC<{ id: string }> = ({ id }) => {
  const T = useTema();
  const p = PERSONAGENS.find((x) => x.id === id)!;
  const C = p.C;
  const itens: ItemFolha[] = EXPRESSOES.map((e) => ({ rotulo: e, desenho: <C expressao={e} escala={0.55} parada falando={e === 'falando' ? 0.7 : 0} /> }));
  return <Folha titulo={`${p.nome} · expressões · ${T.nome.toLowerCase()}`} secoes={[{ colunas: 4, alturaCelula: 560, itens }]} />;
};

/** Campos de aparência que o traço do tema lê: os dele e os que divide com outro tema (campos_divididos: as
 *  silhuetas leem o cabelo do papel, o giz de cera lê a pele, o cabelo, a roupa e as cores do papel). */
const camposDoTema = (tema: IdTema): Record<string, string> => {
  const secoes = opcoes.aparencia as Record<string, Record<string, string>>;
  const divididos = ((opcoes.campos_divididos as Record<string, string[]>)[tema] ?? []).map((k) => [k, Object.entries(secoes).find(([s, c]) => s !== 'comum' && k in c)?.[1][k] ?? 'cor']);
  return { ...(secoes[tema] ?? {}), ...Object.fromEntries(divididos) };
};

const FolhaOpcoes: React.FC = () => {
  const T = useTema();
  const campos = camposDoTema(T.id);
  const secoes: React.ComponentProps<typeof Folha>['secoes'] = [];
  const escala = 0.36;
  const celula = (k: string, v: string, extra: AparenciaEntrada = {}): ItemFolha => ({ rotulo: v, desenho: <Corpo aparencia={{ ...NEUTRA, ...extra, [k]: v }} escala={escala} expressao="feliz" /> });
  for (const [k, regra] of Object.entries(campos)) {
    if (regra === 'cor') continue;
    const valores = regra === 'tom' ? TONS : regra.startsWith('lista:') ? LISTAS[regra.slice(6)] : [];
    if (!valores.length) continue;
    secoes.push({ titulo: `${k} (campo do respostas.json)`, colunas: 8, alturaCelula: 380, tamanhoRotulo: 22, itens: valores.map((v) => celula(k, v)) });
  }
  secoes.push({ titulo: 'acessorio (todos os temas, na cor de corDetalhe)', colunas: 8, alturaCelula: 380, tamanhoRotulo: 22, itens: LISTAS.acessorios.map((v) => celula('acessorio', v, { corDetalhe: v === 'oculos' ? '#1D1D1F' : '#E4572E' })) });
  secoes.push({
    titulo: 'preset (todos os temas)',
    colunas: 8,
    alturaCelula: 380,
    tamanhoRotulo: 18,
    itens: Object.keys(PRESETS).map((nome) => ({ rotulo: nome, desenho: <Corpo aparencia={{ preset: nome }} escala={escala} expressao="feliz" /> })),
  });
  const coresCampos = Object.entries({ ...(opcoes.aparencia.comum as Record<string, string>), ...campos })
    .filter(([, r]) => r === 'cor')
    .map(([k]) => k);
  return (
    <AbsoluteFill>
      <Folha titulo={`Opções de aparência · ${T.nome.toLowerCase()}`} secoes={secoes} />
      <div style={{ position: 'absolute', left: 46, right: 46, bottom: 30, fontFamily: T.f.texto, fontWeight: 600, fontSize: 24, color: legivel(T.c.fundo, T.c.texto) }}>
        Cores em hex #RRGGBB: {coresCampos.join(', ')}. Campos do outro tema ficam guardados e saem do preset quando faltam.
      </div>
    </AbsoluteFill>
  );
};

const FolhaPoses: React.FC = () => {
  const T = useTema();
  const C = PROTAGONISTA.C;
  const e = 0.42;
  const itens: ItemFolha[] = [
    ...OLHARES.map((o) => ({ rotulo: `olhando: ${o}`, desenho: <C olhando={o} escala={e} parada /> })),
    { rotulo: 'espelhar', sub: 'olhando: direita', desenho: <C espelhar olhando="direita" escala={e} parada /> },
    { rotulo: 'parada', sub: 'sem respirar nem piscar', desenho: <C expressao="feliz" escala={e} parada /> },
    ...[0, 0.25, 0.5, 0.75, 1].map((v) => ({ rotulo: `falando: ${v}`, sub: 'expressão falando', desenho: <C expressao="falando" falando={v} escala={e} parada /> })),
  ];
  return <Folha titulo={`${PROTAGONISTA.nome} · poses · ${T.nome.toLowerCase()}`} secoes={[{ colunas: 6, alturaCelula: 480, tamanhoRotulo: 22, itens }]} />;
};

const Elenco: React.FC = () => {
  const T = useTema();
  const n = PERSONAGENS.length;
  const escala = n <= 2 ? 0.95 : n === 3 ? 0.8 : 0.62;
  const itens: ItemFolha[] = PERSONAGENS.map((p, i) => ({
    rotulo: p.nome,
    sub: p.papel,
    desenho: <p.C expressao={i === 0 ? 'feliz' : 'neutra'} olhando={n > 1 ? (i === 0 ? 'direita' : 'esquerda') : 'frente'} escala={escala} parada />,
  }));
  return <Folha titulo={`${UNIVERSO.nome} · elenco · ${T.nome.toLowerCase()}`} secoes={[{ colunas: Math.max(2, n), alturaCelula: 960, tamanhoRotulo: 40, itens }]} />;
};

/** Altura da folha de opções: uma faixa por campo de lista do tema, mais acessório e preset. */
const alturaOpcoes = (tema: IdTema) => {
  const campos = Object.values(camposDoTema(tema));
  const faixas = campos.filter((r) => r === 'tom' || r.startsWith('lista:')).length + 2;
  return 150 + faixas * 450 + 70;
};

// ---------------------------------------------------------------- cenas

const APOIO = PERSONAGENS.find((p) => p.papel === 'apoio' && p.id !== PROTAGONISTA.id) ?? PROTAGONISTA;

/** Uma cena de exemplo (textos de componentes/exemplo.ts) num tipo e num cenário, no tema em uso. */
const QuadroCena: React.FC<{ tipo: TipoCena; cenario?: string; marcar?: boolean }> = ({ tipo, cenario, marcar }) => {
  const T = useTema();
  const balao = T.estilo.fala === 'balao';
  const fraseNarrador = EXEMPLO.narrador ? EXEMPLO.falas.narrador : EXEMPLO.falas.protagonista;
  const cena = (() => {
    switch (tipo) {
      case 'abertura':
        return <Cena tipo="abertura" cenario={cenario} elenco={[{ id: PROTAGONISTA.id, C: PROTAGONISTA.C, expressao: 'feliz', falando: 0 }]} titulo={{ titulo: EXEMPLO.titulo, subtitulo: EXEMPLO.subtitulo, rotulo: EXEMPLO.selo }} legenda={{ palavras: blocoDe(fraseNarrador), ativa: EXEMPLO.ativa }} />;
      case 'dialogo':
        return (
          <Cena
            tipo="dialogo"
            cenario={cenario}
            elenco={[
              { id: PROTAGONISTA.id, C: PROTAGONISTA.C, expressao: 'neutra', falando: 0 },
              { id: APOIO.id, C: APOIO.C, expressao: 'falando', falando: 0.7 },
            ]}
            selo={EXEMPLO.selo}
            baloes={balao ? [{ de: 0, texto: EXEMPLO.falas.protagonista }, { de: 1, texto: EXEMPLO.falas.apoio }] : []}
            legenda={balao ? { palavras: blocoDe(EXEMPLO.situacao, 40), ativa: EXEMPLO.ativa } : { palavras: blocoDe(EXEMPLO.falas.apoio), ativa: EXEMPLO.ativa }}
          />
        );
      case 'narrador':
        return (
          <Cena
            tipo="narrador"
            cenario={cenario}
            elenco={[
              { id: PROTAGONISTA.id, C: PROTAGONISTA.C, expressao: 'neutra', falando: 0 },
              { id: APOIO.id, C: APOIO.C, expressao: 'neutra', falando: 0 },
            ]}
            selo={EXEMPLO.selo}
            legenda={{ palavras: blocoDe(EXEMPLO.falas.narrador), ativa: EXEMPLO.ativa }}
          />
        );
      default:
        return <Cena tipo="fecho" cenario={cenario} elenco={[{ id: PROTAGONISTA.id, C: PROTAGONISTA.C, expressao: 'feliz', falando: 0 }]} />;
    }
  })();
  return (
    <AbsoluteFill>
      {cena}
      {marcar ? <AreaSegura /> : null}
    </AbsoluteFill>
  );
};

const capaDe = (tema: IdTema) => (opcoes.estilos as Record<string, { capa: string; cenario_capa: string }>)[tema];

const Cenarios: React.FC = () => {
  const T = useTema();
  const ids = Object.keys(opcoes.cenarios);
  return (
    <AbsoluteFill style={{ flexDirection: 'row' }}>
      {ids.map((id) => (
        <div key={id} style={{ width: 1080, height: 1920, position: 'relative', overflow: 'hidden' }}>
          <Cena tipo="dialogo" cenario={id} elenco={[]} />
          <div style={{ position: 'absolute', left: 70, top: 240, background: T.c.tarja, color: legivel(T.c.tarja, T.c.sobre), fontFamily: T.f.texto, fontWeight: 800, fontSize: 40, padding: '10px 26px', borderRadius: 16 }}>
            {`${(opcoes.cenarios as Record<string, { nome: string; tipo: string }>)[id].nome} · ${id} · ${(opcoes.cenarios as Record<string, { nome: string; tipo: string }>)[id].tipo}`}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

const comTema = (tema: IdTema, C: React.FC) => () => (
  <ComTema id={tema}>
    <C />
  </ComTema>
);

export const Raiz: React.FC = () => (
  <>
    <Still id="elenco" component={comTema(TEMA.id, Elenco)} width={1600} height={1160} />
    <Still id="paletas" component={Paletas} width={540 * TEMAS.length} height={1920} />
    {TEMAS.map((tema) => (
      <React.Fragment key={tema}>
        {PERSONAGENS.map((p) => (
          <Still key={p.id} id={`expressoes-${p.id}-${tema}`} component={comTema(tema, () => <FolhaExpressoes id={p.id} />)} width={1600} height={1340} />
        ))}
        <Still id={`opcoes-aparencia-${tema}`} component={comTema(tema, FolhaOpcoes)} width={1600} height={alturaOpcoes(tema)} />
        <Still id={`poses-${tema}`} component={comTema(tema, FolhaPoses)} width={1600} height={1220} />
        <Still id={`tema-${tema}`} component={comTema(tema, () => <QuadroCena tipo={capaDe(tema).capa as TipoCena} cenario={capaDe(tema).cenario_capa} />)} width={1080} height={1920} />
        <Still id={`cenarios-${tema}`} component={comTema(tema, Cenarios)} width={1080 * Object.keys(opcoes.cenarios).length} height={1920} />
        {TIPOS_CENA.map((tipo) => (
          <React.Fragment key={tipo}>
            <Still id={`cena-${tipo}-${tema}`} component={comTema(tema, () => <QuadroCena tipo={tipo} marcar />)} width={1080} height={1920} />
            <Still id={`vista-${tipo}-${tema}`} component={comTema(tema, () => <QuadroCena tipo={tipo} />)} width={1080} height={1920} />
          </React.Fragment>
        ))}
      </React.Fragment>
    ))}
  </>
);
