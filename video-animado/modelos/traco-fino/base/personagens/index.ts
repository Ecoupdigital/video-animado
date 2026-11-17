// Arquivo padrão do kit: o elenco nasce vazio.
// O novo_universo.mjs --aplicar gera este arquivo com um Personagem.tsx por personagem respondido.
import React from 'react';
import type { AdultoPersonagemProps } from '../componentes/adulto';
import type { CriancaPersonagemProps } from '../componentes/crianca';

export type EntradaElenco =
  | { tipo: 'adulto'; id: string; nome: string; C: React.FC<AdultoPersonagemProps> }
  | { tipo: 'crianca'; id: string; nome: string; C: React.FC<CriancaPersonagemProps> };

export const PERSONAGENS: EntradaElenco[] = [];
