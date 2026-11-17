import React from 'react';
import { AbsoluteFill, Still } from 'remotion';
import { H, SEGURA, TempoFixo, W } from '../../componentes/anima';
import { MesaCentral, PecaCentral, RAIO } from '../../componentes/centro';
import { EXEMPLO } from '../../componentes/exemplo';
import { DESENHOS, ItemSvg } from '../../componentes/itens';
import { MesaVista } from '../../componentes/Montagem';
import { sombraItem } from '../../componentes/pecas';
import { comTempoSintetico, TIPOS_CENA, type TipoCena } from '../../componentes/roteiro';
import { Superficie } from '../../componentes/superficie';
import { ComMesa, GRUPOS, ITENS, itensDo, SUPERFICIES, useMesa, type IdGrupo, type InfoItem } from '../../componentes/tema';
import opcoes from '../../componentes/opcoes.json';
import { Paletas } from './Paletas';

// Stills do universo (npx remotion still _preview/src/index.ts <id> imagens/<id>.png):
//   superficies        as 3 superfícies lado a lado, cada uma com a peça central do grupo e um item com sombra
//   itens-<grupo>      os itens de um grupo (cozinha, beleza, artesanato), cada um com o nome e o código, e o que
//                      vira sobre a peça central (camada ou pedaços), na superfície do universo
//   elenco             a biblioteca inteira (22 itens) e as 3 peças centrais: a vitrine chama de "Itens"
//   paletas            as 3 paletas prontas lado a lado (a cor troca destaque, faixa, etiqueta e card final)
//   capa               a cena da tela de referência (o último passo do exemplo, com a peça central pronta) no grupo
//                      e na superfície do universo, sem marcação
//   cena-<tipo>        uma cena do exemplo com a área segura marcada (still de conferência): abertura, passo, final
//   vista-<tipo>       o mesmo quadro sem a marcação (brandbook)

const EX = comTempoSintetico(EXEMPLO);
const ultimoPasso = EX.cenas.map((c, i) => ({ c, i })).filter(({ c }) => c.tipo === 'passo').pop()!.i;
/** instante mostrado no still de cada cena: perto do fim, com todos os itens na mesa */
const momento = (tipo: TipoCena) => (tipo === 'passo' ? EX.cenas[ultimoPasso] : EX.cenas.find((x) => x.tipo === tipo)!).fim - 0.25;

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
      <div style={{ position: 'absolute', left: SEGURA.lado, top: SEGURA.topo, width: W - 2 * SEGURA.lado, height: yb - SEGURA.topo, border: '3px dashed rgba(255,40,80,0.9)', boxSizing: 'border-box' }} />
    </AbsoluteFill>
  );
};

export const QuadroCena: React.FC<{ tipo: TipoCena; marcar?: boolean }> = ({ tipo, marcar }) => (
  <TempoFixo.Provider value={momento(tipo)}>
    <AbsoluteFill>
      <MesaVista timing={EX} duck={[]} comSom={false} chave={`q-${tipo}`} />
      {marcar ? <AreaSegura /> : null}
    </AbsoluteFill>
  </TempoFixo.Provider>
);

// ---------------------------------------------------------------- folhas de conferência

const Rotulo: React.FC<{ nome: string; codigo: string; largura: number; pequeno?: boolean }> = ({ nome, codigo, largura, pequeno }) => {
  const M = useMesa();
  return (
    <div style={{ width: largura, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: M.c.etiqueta, borderRadius: 10, padding: pequeno ? '6px 4px' : '8px 6px', boxShadow: `0 4px 10px ${M.sombra(0.6)}` }}>
      <div style={{ fontFamily: M.f.texto, fontWeight: 800, fontSize: pequeno ? 26 : 32, lineHeight: 1.1, color: M.c.etiquetaTexto }}>{nome}</div>
      <div style={{ fontFamily: M.f.mono, fontWeight: 500, fontSize: pequeno ? 19 : 22, color: M.c.etiquetaPasso }}>{codigo}</div>
    </div>
  );
};

/** o que o item vira sobre a peça central, num pedaço redondo da peça (só para quem vira cobertura) */
const NoCentro: React.FC<{ item: InfoItem; tamanho: number }> = ({ item, tamanho }) => {
  const M = useMesa();
  const R = RAIO[M.grupo];
  // a peça central inteira dentro do círculo (a base de corte é mais larga que alta)
  const zoom = tamanho / (M.grupo === 'artesanato' ? 600 : R * 2.12);
  return (
    <div style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2, overflow: 'hidden', boxShadow: `0 6px 14px ${M.sombra(0.8)}`, border: `4px solid ${M.c.etiqueta}`, boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', width: W, height: H, transform: `translate(${tamanho / 2 - 540 * zoom}px, ${tamanho / 2 - 930 * zoom}px) scale(${zoom})`, transformOrigin: '0 0' }}>
        <MesaCentral t={30} cobertura={[{ item: item.id, at: 0, entrada: 'cai' }]} chave={`nc-${item.id}`} />
      </div>
    </div>
  );
};

const FolhaGrupo: React.FC<{ grupo: IdGrupo }> = ({ grupo }) => {
  const M = useMesa();
  const itens = itensDo(grupo);
  const cols = itens.length > 6 ? 3 : 2;
  const larg = (W - 2 * 70) / cols;
  const alt = itens.length > 6 ? 330 : 420;
  const tam = itens.length > 6 ? 190 : 230;
  const info = opcoes.grupos[grupo];
  return (
    <AbsoluteFill>
      <Superficie />
      <div style={{ position: 'absolute', left: 70, top: 60, right: 70, display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ background: M.c.etiqueta, borderRadius: 12, padding: '14px 26px', boxShadow: `0 6px 14px ${M.sombra(0.7)}`, transform: 'rotate(-2deg)' }}>
          <div style={{ fontFamily: M.f.mono, fontWeight: 500, fontSize: 24, letterSpacing: '0.1em', color: M.c.etiquetaPasso }}>{`ITENS · ${grupo.toUpperCase()} · ${itens.length}`}</div>
          <div style={{ fontFamily: M.f.texto, fontWeight: 800, fontSize: 44, color: M.c.etiquetaTexto }}>{info.nome}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 70, top: 220, width: W - 140, display: 'flex', flexWrap: 'wrap' }}>
        {itens.map((it) => (
          <div key={it.id} style={{ width: larg, height: alt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 12, position: 'relative' }}>
            <div style={{ filter: sombraItem(M.sombra, 0) }}>
              <ItemSvg id={it.id} tamanho={tam} />
            </div>
            <Rotulo nome={it.nome} codigo={it.id} largura={larg - 40} pequeno={itens.length > 6} />
            {it.noCentro ? (
              <div style={{ position: 'absolute', right: 6, top: 6 }}>
                <NoCentro item={it} tamanho={itens.length > 6 ? 118 : 150} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 70, right: 70, bottom: 40, fontFamily: M.f.texto, fontWeight: 600, fontSize: 26, lineHeight: 1.3, color: M.c.faixaTexto, background: M.a('faixa', 0.9), borderRadius: 20, padding: '18px 26px' }}>
        No círculo, o que o item vira sobre a peça central (camada ou pedaços). {`Peça central do grupo: ${info.centro}.`}
      </div>
    </AbsoluteFill>
  );
};

const Elenco: React.FC = () => {
  const M = useMesa();
  const larg = (W - 100) / 5;
  return (
    <AbsoluteFill>
      <Superficie />
      <div style={{ position: 'absolute', left: 50, top: 50, background: M.c.etiqueta, borderRadius: 12, padding: '12px 24px', boxShadow: `0 6px 14px ${M.sombra(0.7)}`, transform: 'rotate(-2deg)' }}>
        <div style={{ fontFamily: M.f.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.1em', color: M.c.etiquetaPasso }}>{`BIBLIOTECA · ${ITENS.length} ITENS · ${M.nomeSuperficie.toUpperCase()}`}</div>
        <div style={{ fontFamily: M.f.texto, fontWeight: 800, fontSize: 40, color: M.c.etiquetaTexto }}>Itens desenhados em código</div>
      </div>
      <div style={{ position: 'absolute', left: 50, top: 190, width: W - 100, display: 'flex', flexWrap: 'wrap' }}>
        {ITENS.map((it) => (
          <div key={it.id} style={{ width: larg, height: 262, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <div style={{ filter: sombraItem(M.sombra, 0) }}>
              <ItemSvg id={it.id} tamanho={156} />
            </div>
            <Rotulo nome={it.nome} codigo={it.id} largura={larg - 26} pequeno />
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1530, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        {GRUPOS.map((g) => (
          <div key={g} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 250, height: 290, position: 'relative' }}>
              <svg width={250} height={290} viewBox="-330 -330 660 766" style={{ overflow: 'visible', filter: sombraItem(M.sombra, 0) }}>
                <PecaCentral grupo={g} />
              </svg>
            </div>
            <Rotulo nome={`centro · ${opcoes.grupos[g].nome.toLowerCase()}`} codigo={g} largura={300} pequeno />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Superficies: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: 'row', background: '#000' }}>
    {SUPERFICIES.map((s, i) => (
      <ComMesa key={s} superficie={s} grupo={GRUPOS[i]}>
        <PainelSuperficie />
      </ComMesa>
    ))}
  </AbsoluteFill>
);

const PainelSuperficie: React.FC = () => {
  const M = useMesa();
  const um = itensDo(M.grupo)[0];
  return (
    <div style={{ width: 720, height: 1280, position: 'relative', overflow: 'hidden', borderRight: '4px solid #000' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: 'scale(0.6667)', transformOrigin: '0 0' }}>
        <Superficie />
        <MesaCentral t={30} cobertura={[]} chave={`sup-${M.superficie}`} />
        <div style={{ position: 'absolute', left: 910 - 85, top: 600 - 85, filter: sombraItem(M.sombra, 0) }}>
          <ItemSvg id={um.id} tamanho={170} />
        </div>
        <div style={{ position: 'absolute', left: 170 - 85, top: 1250 - 85, filter: sombraItem(M.sombra, 0) }}>
          <ItemSvg id={itensDo(M.grupo)[1].id} tamanho={170} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 30, top: 36, background: M.c.etiqueta, borderRadius: 10, padding: '10px 20px', boxShadow: `0 6px 14px ${M.sombra(0.7)}` }}>
        <div style={{ fontFamily: M.f.texto, fontWeight: 800, fontSize: 40, color: M.c.etiquetaTexto }}>{M.nomeSuperficie}</div>
        <div style={{ fontFamily: M.f.mono, fontWeight: 500, fontSize: 22, color: M.c.etiquetaPasso }}>{`superficie: ${M.superficie}`}</div>
      </div>
    </div>
  );
};

export const Raiz: React.FC = () => (
  <>
    <Still id="superficies" component={Superficies} width={2160} height={1280} />
    {GRUPOS.map((g) => (
      <Still key={g} id={`itens-${g}`} component={() => (
        <ComMesa grupo={g}>
          <FolhaGrupo grupo={g} />
        </ComMesa>
      )} width={W} height={H} />
    ))}
    <Still id="elenco" component={Elenco} width={W} height={H} />
    <Still id="paletas" component={Paletas} width={2160} height={1920} />
    <Still id="capa" component={() => <QuadroCena tipo="passo" />} width={W} height={H} />
    {TIPOS_CENA.map((tipo) => (
      <React.Fragment key={tipo}>
        <Still id={`cena-${tipo}`} component={() => <QuadroCena tipo={tipo} marcar />} width={W} height={H} />
        <Still id={`vista-${tipo}`} component={() => <QuadroCena tipo={tipo} />} width={W} height={H} />
      </React.Fragment>
    ))}
  </>
);

// o desenho de cada item existe (o TypeScript também confere pelo tipo)
export const TODOS_DESENHADOS = ITENS.every((i) => Boolean(DESENHOS[i.id]));
