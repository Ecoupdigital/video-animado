import React from 'react';
import { larguraTexto } from './Bolha';
import { SimboloMarca } from './desenhos';
import { CELULAR, H, LARGURA_UTIL, W } from './medidas';
import { comAlfa, legivel, useTema } from './tema';
import { linhasMax, tamanhoQueCabe } from './Texto';
import { FECHO, MARCA, PESSOAS } from './universo';

// Card final de todo vídeo (cerca de 4 s), por cima do celular, que escurece atrás: a chamada, "Comenta <PALAVRA>"
// com o símbolo da marca numa pílula na cor da marca, o nome da marca e o aviso de conversa encenada (ligado, a não
// ser que o fecho.aviso_ficticio das respostas seja false). Sem marca: a chamada e "Segue o perfil". O cartão fica
// inteiro dentro da área segura; nome comprido encolhe e corta com reticências.

export const nomeContato = (): string => Object.values(PESSOAS).find((p) => p.lado === 'esquerda')?.nome ?? 'o contato';

const TOPO_CARTAO = 640;
const LARGURA_CARTAO = LARGURA_UTIL - 40;

export const Fecho: React.FC<{ k?: number; pulso?: number; chamada?: string | null; palavra?: string | null; aviso?: boolean }> = ({ k = 1, pulso = 1, chamada, palavra, aviso = FECHO.avisoFicticio }) => {
  const T = useTema();
  const comMarca = MARCA !== null;
  const textoChamada = chamada ?? FECHO.chamada ?? (comMarca ? `Quer conversar com ${MARCA!.nome}?` : 'Já passou por isso?');
  const palavraFinal = (palavra ?? FECHO.palavra ?? MARCA?.palavraFecho ?? (MARCA ? MARCA.nome.split(/\s+/)[0] : '')).toUpperCase();
  const corPilula = MARCA?.cor ?? T.c.destaque;
  const corTextoPilula = legivel(corPilula, '#FFFFFF');
  const fundo = T.c.cardFinal;
  const tinta = legivel(fundo, T.c.titulo);
  const apagada = legivel(fundo, T.c.horario);
  const miolo = LARGURA_CARTAO - 2 * 52;
  const fsChamada = tamanhoQueCabe(textoChamada, miolo, 66, 40, 3, 3 * 66 * 1.1);
  const textoPilula = comMarca ? palavraFinal : 'Segue o perfil';
  const larguraPilula = miolo - (comMarca ? 0 : 0);
  let fsPilula = 56;
  while (fsPilula > 30 && larguraTexto(textoPilula, fsPilula) * 1.2 + fsPilula * 0.9 + 70 > larguraPilula) fsPilula -= 2;
  const avisoTexto = `Conversa encenada: ${nomeContato()} e as mensagens são fictícios`;
  const veu = Math.min(1, k * 1.4);
  return (
    <>
      <div style={{ position: 'absolute', left: CELULAR.x, top: CELULAR.y, width: CELULAR.w, height: H - CELULAR.y, borderRadius: CELULAR.raio, background: comAlfa(T.c.celular, 0.55 * veu) }} />
      <div
        style={{
          position: 'absolute',
          left: (W - LARGURA_CARTAO) / 2,
          width: LARGURA_CARTAO,
          top: TOPO_CARTAO,
          background: fundo,
          borderRadius: 48,
          padding: '52px 52px 46px',
          boxSizing: 'border-box',
          boxShadow: `0 24px 60px ${comAlfa(T.c.celular, 0.35)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 26,
          opacity: Math.min(1, k * 1.4),
          transform: `translateY(${(1 - k) * 60}px) scale(${0.94 + 0.06 * k})`,
        }}
      >
        <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: fsChamada, lineHeight: 1.1, color: tinta, textAlign: 'center', ...linhasMax(3) }}>{textoChamada}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, maxWidth: miolo }}>
          {comMarca ? <span style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: 44, color: tinta }}>Comenta</span> : null}
          <span
            style={{
              background: corPilula,
              color: corTextoPilula,
              fontFamily: T.f.texto,
              fontWeight: 800,
              fontSize: fsPilula,
              padding: '10px 34px 12px',
              borderRadius: 999,
              transform: `scale(${pulso})`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              maxWidth: miolo,
              boxSizing: 'border-box',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {comMarca ? (
              <SimboloMarca simbolo={MARCA!.simbolo} tamanho={Math.round(fsPilula * 0.9)} cor={corTextoPilula} corFundo={corPilula} nome={MARCA!.nome} />
            ) : (
              <svg width={48} height={48} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
                <circle cx={22} cy={22} r={20} fill={corTextoPilula} />
                <path d="M 22 12 L 22 32 M 12 22 L 32 22" stroke={corPilula} strokeWidth={6} strokeLinecap="round" />
              </svg>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{textoPilula}</span>
          </span>
        </div>
        {comMarca ? (
          <div style={{ fontFamily: T.f.texto, fontWeight: 600, fontSize: 32, lineHeight: 1.2, color: tinta, textAlign: 'center', maxWidth: miolo, ...linhasMax(2) }}>{MARCA!.nome}</div>
        ) : null}
        {aviso ? (
          <div style={{ fontFamily: T.f.texto, fontWeight: 400, fontSize: 27, lineHeight: 1.25, color: apagada, textAlign: 'center', maxWidth: miolo, ...linhasMax(2) }}>{avisoTexto}</div>
        ) : null}
      </div>
    </>
  );
};
