import React from 'react';
import { AbsoluteFill, Img, staticFile, Still } from 'remotion';
import { AreaSegura, TempoFixo } from '../../componentes/anima';
import { P } from '../../componentes/cores';
import { EXEMPLO } from '../../componentes/exemplo';
import { MONO, SANS } from '../../componentes/fontes';
import { Boneco, PixelNoticia } from '../../componentes/PixelNoticia';
import { montar, tempoSintetico, type Gesto } from '../../componentes/roteiro';
import { BONECO, UNIVERSO } from '../../componentes/universo';

// Stills do universo (npx remotion still _preview/src/index.ts <id> imagens/<id>.png):
//   elenco             o boneco nos 4 gestos e de olho fechado (os sprites de public/px/, gerados pelo --aplicar)
//   opcoes-aparencia   a folha de opções do boneco (public/opcoes.png, gerada pelo --aplicar)
//   card-<molde>       o vídeo com um card de cada molde (lista, conversa, selo, blocos), área segura marcada
//   card-final         o card final de perfil, área segura marcada
//   vista-<molde>, vista-final   os mesmos quadros sem a marcação (brandbook)

const sint = tempoSintetico(EXEMPLO);
const M = montar(EXEMPLO, sint.palavras, sint.bocas, sint.fim);
const MOLDES = ['lista', 'conversa', 'selo', 'blocos'] as const;
const quadro = (molde: (typeof MOLDES)[number] | 'final') => {
  if (molde === 'final') return M.fim + 1.6;
  const s = M.secoes.find((x) => x.card.molde === molde)!;
  return s.b - 0.25;
};

const Quadro: React.FC<{ molde: (typeof MOLDES)[number] | 'final'; marcar: boolean }> = ({ molde, marcar }) => (
  <TempoFixo.Provider value={quadro(molde)}>
    <AbsoluteFill>
      <PixelNoticia m={M} comSom={false} narracao={null} />
      {marcar ? <AreaSegura /> : null}
    </AbsoluteFill>
  </TempoFixo.Provider>
);

const GESTOS: [Gesto, 'aberto' | 'fechado', string][] = [
  ['nada', 'aberto', 'nada'],
  ['uma', 'aberto', 'uma'],
  ['duas', 'aberto', 'duas'],
  ['ombros', 'aberto', 'ombros'],
  ['nada', 'fechado', 'olho fechado'],
];
const Elenco: React.FC = () => (
  <AbsoluteFill style={{ background: P.fundo, padding: '30px 40px', boxSizing: 'border-box' }}>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: P.tinta }}>
      {BONECO.nome} <span style={{ color: P.suave, fontWeight: 500, fontSize: 30 }}>· {UNIVERSO.nome} · os 4 gestos</span>
    </div>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      {GESTOS.map(([g, o, nome]) => (
        <div key={nome} style={{ width: 368, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 368, height: 480, background: P.superficie, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
            <Img src={staticFile(`px/${o === 'fechado' ? 'X' : 'C'}_${o}_${g}.png`)} style={{ position: 'absolute', left: -8, top: 0, width: 384, height: 480, imageRendering: 'pixelated' }} />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 26, color: P.destaque, marginTop: 10 }}>{nome}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

const Opcoes: React.FC = () => (
  <AbsoluteFill style={{ background: P.fundo }}>
    <Img src={staticFile('opcoes.png')} style={{ width: 2060, height: 2642 }} />
  </AbsoluteFill>
);

/** O boneco sozinho no lugar do vídeo, com a área marcada (para conferir o enquadramento do rosto). */
const SoBoneco: React.FC = () => (
  <TempoFixo.Provider value={0}>
    <AbsoluteFill style={{ background: P.fundo }}>
      <Boneco m={M} t={0} boca="X" olho="aberto" gesto="duas" />
      <AreaSegura />
    </AbsoluteFill>
  </TempoFixo.Provider>
);

export const Raiz: React.FC = () => (
  <>
    <Still id="elenco" component={Elenco} width={1960} height={680} />
    <Still id="opcoes-aparencia" component={Opcoes} width={2060} height={2642} />
    <Still id="boneco-area" component={SoBoneco} width={1080} height={1920} />
    {[...MOLDES, 'final' as const].map((m) => (
      <React.Fragment key={m}>
        <Still id={`card-${m}`} component={() => <Quadro molde={m} marcar />} width={1080} height={1920} />
        <Still id={`vista-${m}`} component={() => <Quadro molde={m} marcar={false} />} width={1080} height={1920} />
      </React.Fragment>
    ))}
  </>
);
