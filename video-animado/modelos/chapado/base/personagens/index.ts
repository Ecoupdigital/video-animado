// Arquivo padrão do kit: o elenco nasce vazio.
// O novo_universo.mjs --aplicar gera este arquivo com um Personagem.tsx por personagem respondido.
import React from 'react';
import type { PessoaPersonagemProps } from '../componentes/Pessoa';
import type { CachorroProps, BebeProps } from '../componentes/Acompanhantes';

export type EntradaElenco =
  | { tipo: 'pessoa'; id: string; nome: string; C: React.FC<PessoaPersonagemProps> }
  | { tipo: 'cachorro'; id: string; nome: string; C: React.FC<Omit<CachorroProps, 'cor'>> }
  | { tipo: 'bebe'; id: string; nome: string; C: React.FC<Omit<BebeProps, 'pele'>> };

export const PERSONAGENS: EntradaElenco[] = [];
