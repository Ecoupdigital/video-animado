import React, { useId } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { resolverAparencia, type AparenciaEntrada } from './aparencia';
import type { Expressao, Olhar } from './rosto';
import { TEMAS, useTema } from './tema';
import { MODULOS } from './temas';

// Personagem do Conto: um componente só desenha qualquer personagem do universo no traço do tema em uso
// (o do <ComTema> mais próximo, senão o escolhido nas respostas). O traço de cada tema mora no módulo dele
// (componentes/temas/<id>/traco.tsx) e recebe sempre as mesmas props. Quadro de 400 x 900 na escala 1, pés em y 890.

export type PersonagemProps = {
  expressao?: Expressao;
  /** 0 a 1: volume da fala no frame (a boca abre junto; com 0 fica fechada). */
  falando?: number;
  olhando?: Olhar;
  /** 1 = 400 x 900 px. */
  escala?: number;
  espelhar?: boolean;
  /** Desliga respiração, piscada, balanço e pulinho (folhas de referência). */
  parada?: boolean;
};

export type PersonagemComAparencia = PersonagemProps & {
  aparencia: AparenciaEntrada;
  /** lugar no elenco: muda o ritmo da piscada e escolhe o preset padrão */
  semente?: number;
};

export const Personagem: React.FC<PersonagemComAparencia> = ({ aparencia, semente = 1, expressao = 'neutra', falando = 0, olhando = 'frente', escala = 1, espelhar = false, parada = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = useTema();
  const uid = `p${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const M = MODULOS[T.id] ?? MODULOS[TEMAS[0]];
  const ap = resolverAparencia(aparencia, semente);
  // espelhado, o olhar continua para o lado pedido na tela
  const olhar: Olhar = espelhar && olhando === 'esquerda' ? 'direita' : espelhar && olhando === 'direita' ? 'esquerda' : olhando;
  return (
    <svg width={400 * escala} height={900 * escala} viewBox="0 0 400 900" style={{ overflow: 'visible' }}>
      <g transform={espelhar ? 'translate(400 0) scale(-1 1)' : undefined}>
        <M.Traco ap={ap} expressao={expressao} falando={falando} olhando={olhar} parada={parada} frame={frame} fps={fps} semente={semente} uid={uid} />
      </g>
    </svg>
  );
};
