import React from 'react';
import { DesenhoAvatar, inicialDe } from './desenhos';
import { escurecer, legivel, useTema } from './tema';
import type { Avatar as DadosAvatar } from './universo';

// Avatar do contato (e do dono, nas folhas): um círculo na cor escolhida com a inicial do nome (Inter 800) ou um
// desenho da lista do kit (opcoes.json, "avatares"). A letra e o desenho saem num tom escuro da própria cor quando
// ele lê (contraste 3), senão em quase preto ou branco.

export const Avatar: React.FC<{ nome: string; avatar: DadosAvatar; tamanho: number; contorno?: string | null }> = ({ nome, avatar, tamanho, contorno = null }) => {
  const T = useTema();
  const tinta = legivel(avatar.cor, escurecer(avatar.cor, 0.62), 3);
  return (
    <div
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: '50%',
        background: avatar.cor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: contorno ? `0 0 0 ${Math.max(3, Math.round(tamanho * 0.05))}px ${contorno}` : undefined,
        overflow: 'hidden',
      }}
    >
      {avatar.tipo === 'desenho' && avatar.desenho ? (
        <DesenhoAvatar id={avatar.desenho} tamanho={Math.round(tamanho * 0.78)} cor={tinta} fundo={avatar.cor} />
      ) : (
        <span style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: Math.round(tamanho * 0.46), lineHeight: 1, color: tinta }}>{inicialDe(nome)}</span>
      )}
    </div>
  );
};
