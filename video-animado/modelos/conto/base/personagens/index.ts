// Elenco padrão do kit, antes do --aplicar: os dois personagens neutros de componentes/universo.ts.
// O novo_universo.mjs --aplicar troca este arquivo pelo gerado das respostas (um Personagem.tsx por personagem).
import React from 'react';
import { Personagem, type PersonagemProps } from '../componentes/Personagem';
import { PESSOAS } from '../componentes/universo';

export type EntradaElenco = { id: string; nome: string; papel: 'protagonista' | 'apoio'; C: React.FC<PersonagemProps> };

export const PERSONAGENS: EntradaElenco[] = Object.entries(PESSOAS).map(([id, p]) => ({
  id,
  nome: p.nome,
  papel: p.papel,
  C: (props: PersonagemProps) => React.createElement(Personagem, { aparencia: p.aparencia, semente: p.semente, ...props }),
}));
