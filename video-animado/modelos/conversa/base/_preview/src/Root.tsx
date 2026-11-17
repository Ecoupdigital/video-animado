import React from 'react';
import { AbsoluteFill, Still } from 'remotion';
import { AreaSegura, Cena } from '../../componentes/Cenas';
import { EXEMPLO } from '../../componentes/exemplo';
import { FolhaAvatares, FolhaElenco, FolhaRecursos } from '../../componentes/Recursos';
import { estadoNoTempo, falasDeLeitura, linhaDoTempo, TIPOS_CENA, type TipoCena } from '../../componentes/roteiro';
import { FPS } from '../../componentes/medidas';
import { UNIVERSO } from '../../componentes/universo';
import { Paletas } from './Paletas';

// Stills do universo (npx remotion still _preview/src/index.ts <id> imagens/<id>.png). Todos saem de um instante
// fixo da conversa neutra do kit (componentes/exemplo.ts, no tempo de leitura), então o mesmo still sai igual:
//   recursos       cada recurso da conversa (bolhas, horário e lido, digitando, áudio, imagens, reações, mensagem
//                  longa, palavra sem espaço, cabeçalho e campo)
//   avatares       a inicial em cores diferentes e cada desenho de avatar
//   elenco         quem conversa: o cabeçalho do contato e uma bolha de cada lado
//   paletas        as 3 paletas prontas lado a lado, com a capa em cada uma e os papéis de cor
//   capa           a cena da tela de referência: título, 5 bolhas e o digitando
//   cena-<tipo>    uma cena de cada tipo (abertura, conversa, rolagem, fecho) com a área segura marcada
//   vista-<tipo>   a mesma cena sem a marcação (brandbook)

const LT = linhaDoTempo(EXEMPLO, falasDeLeitura(EXEMPLO), 'texto-e-musica');
const TITULO = UNIVERSO.nome;
const ev = LT.eventos;
const daCena = (c: number) => ev.filter((e) => e.cena === c);
const meioDigita = (e: (typeof ev)[number]) => (e.digita ? (e.digita[0] + e.digita[1]) / 2 : e.entra - 0.2);

/** O instante (em segundos) de cada still. */
export const INSTANTE: Record<'capa' | TipoCena, number> = {
  capa: meioDigita(daCena(1)[2] ?? ev[ev.length - 1]),
  abertura: (ev[0]?.entra ?? 1.2) + 0.6,
  conversa: meioDigita(daCena(1)[daCena(1).length - 1] ?? ev[ev.length - 1]),
  rolagem: (ev[ev.length - 1]?.entra ?? 2) + 1.0,
  fecho: LT.inicioFecho + 1.4,
};

const Quadro: React.FC<{ quando: number; marcar?: boolean }> = ({ quando, marcar = false }) => {
  const frame = Math.round(quando * FPS);
  return (
    <AbsoluteFill>
      <Cena estado={estadoNoTempo(LT, frame, TITULO)} frame={frame} />
      {marcar ? <AreaSegura /> : null}
    </AbsoluteFill>
  );
};

const Capa: React.FC = () => <Quadro quando={INSTANTE.capa} />;

export const Raiz: React.FC = () => (
  <>
    <Still id="recursos" component={FolhaRecursos} width={1700} height={2220} />
    <Still id="avatares" component={FolhaAvatares} width={1600} height={1060} />
    <Still id="elenco" component={() => <FolhaElenco titulo={`${UNIVERSO.nome} · quem conversa`} />} width={1600} height={860} />
    <Still id="paletas" component={() => <Paletas Capa={Capa} />} width={1620} height={1700} />
    <Still id="capa" component={Capa} width={1080} height={1920} />
    {TIPOS_CENA.map((tipo) => (
      <React.Fragment key={tipo}>
        <Still id={`cena-${tipo}`} component={() => <Quadro quando={INSTANTE[tipo]} marcar />} width={1080} height={1920} />
        <Still id={`vista-${tipo}`} component={() => <Quadro quando={INSTANTE[tipo]} />} width={1080} height={1920} />
      </React.Fragment>
    ))}
  </>
);
