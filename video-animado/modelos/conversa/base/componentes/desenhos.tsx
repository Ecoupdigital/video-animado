import React from 'react';
import { FAMILIA } from './fontes';

// Desenhos da Conversa no celular, todos em SVG feito em código (nenhum emoji, nenhum glifo de fonte do sistema,
// nenhuma imagem de fora, nenhum ícone copiado de app real):
//   DesenhoAvatar   o desenho dentro do círculo do avatar (pessoa, flor, bolo, gato, casa, sol)
//   DesenhoImagem   a imagem simples da bolha de imagem (bolo, foto, mapa, recibo, produto, calendário), com as
//                   cores dela mesma, como uma foto (não muda com a paleta)
//   DesenhoReacao   a reação presa na bolha (coração, risada, espanto, estrela, certo)
//   IconeLido       o sinal de lido do kit: círculo vazio = enviada; círculo cheio com o certo vazado = lida
//   IconeEnviar, IconeVoltar, IconePlay   botão de enviar, seta de voltar, play do áudio
//   SimboloMarca    o símbolo da marca no card final (estrela, círculo, coração, folha, balão ou a letra inicial)
// Os ids aceitos moram no opcoes.json (avatares, imagens, reacoes, simbolos_marca); id fora da lista desenha o
// primeiro da lista.

// ---------------------------------------------------------------- avatar

export const AVATARES = ['pessoa', 'flor', 'bolo', 'gato', 'casa', 'sol'] as const;

/** Desenho do avatar, numa cor só (`cor`), com os vazados na cor do círculo (`fundo`). viewBox 100 x 100. */
export const DesenhoAvatar: React.FC<{ id: string; tamanho: number; cor: string; fundo: string }> = ({ id, tamanho, cor, fundo }) => {
  const d = (AVATARES as readonly string[]).includes(id) ? id : 'pessoa';
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{ display: 'block' }}>
      {d === 'pessoa' && (
        <>
          <circle cx={50} cy={38} r={17} fill={cor} />
          <path d="M 16 88 C 16 64 33 57 50 57 C 67 57 84 64 84 88 Z" fill={cor} />
        </>
      )}
      {d === 'flor' && (
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
            return <circle key={i} cx={50 + Math.cos(a) * 19} cy={50 + Math.sin(a) * 19} r={15} fill={cor} />;
          })}
          <circle cx={50} cy={50} r={10} fill={fundo} />
          <circle cx={50} cy={50} r={5} fill={cor} />
        </>
      )}
      {d === 'bolo' && (
        <>
          <path d="M 28 56 L 72 56 L 65 86 L 35 86 Z" fill={cor} />
          <path d="M 38 58 L 41 84 M 50 58 L 50 84 M 62 58 L 59 84" stroke={fundo} strokeWidth={3.5} strokeLinecap="round" />
          <path d="M 22 57 C 22 38 36 30 50 30 C 64 30 78 38 78 57 Z" fill={cor} />
          <path d="M 26 52 Q 32 46 38 52 Q 44 46 50 52 Q 56 46 62 52 Q 68 46 74 52" stroke={fundo} strokeWidth={3} fill="none" strokeLinecap="round" />
          <circle cx={50} cy={22} r={8} fill={cor} />
          <path d="M 50 14 Q 54 7 60 6" stroke={cor} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      )}
      {d === 'gato' && (
        <>
          <path d="M 25 48 L 27 16 L 47 32 Z" fill={cor} strokeLinejoin="round" stroke={cor} strokeWidth={4} />
          <path d="M 75 48 L 73 16 L 53 32 Z" fill={cor} strokeLinejoin="round" stroke={cor} strokeWidth={4} />
          <ellipse cx={50} cy={57} rx={30} ry={27} fill={cor} />
          <ellipse cx={39} cy={53} rx={4.5} ry={6.5} fill={fundo} />
          <ellipse cx={61} cy={53} rx={4.5} ry={6.5} fill={fundo} />
          <path d="M 45 64 L 55 64 L 50 70 Z" fill={fundo} />
          <path d="M 30 66 L 14 63 M 30 71 L 15 74 M 70 66 L 86 63 M 70 71 L 85 74" stroke={cor} strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      {d === 'casa' && (
        <>
          <path d="M 14 52 L 50 20 L 86 52 Z" fill={cor} strokeLinejoin="round" stroke={cor} strokeWidth={5} />
          <rect x={25} y={48} width={50} height={36} rx={3} fill={cor} />
          <rect x={44} y={60} width={13} height={24} rx={2} fill={fundo} />
          <rect x={31} y={56} width={9} height={9} rx={1.5} fill={fundo} />
        </>
      )}
      {d === 'sol' && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={47} y={8} width={6} height={16} rx={3} fill={cor} transform={`rotate(${i * 45} 50 50)`} />
          ))}
          <circle cx={50} cy={50} r={19} fill={cor} />
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- imagem da bolha

export const IMAGENS = ['bolo', 'foto', 'mapa', 'recibo', 'produto', 'calendario'] as const;

/** Imagem simples desenhada, 4 x 3 (viewBox 400 x 300), com as próprias cores, como uma foto. */
export const DesenhoImagem: React.FC<{ id: string; largura: number; altura: number }> = ({ id, largura, altura }) => {
  const d = (IMAGENS as readonly string[]).includes(id) ? id : 'foto';
  return (
    <svg width={largura} height={altura} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      {d === 'bolo' && (
        <>
          <rect width={400} height={300} fill="#FCE9EF" />
          <circle cx={330} cy={60} r={70} fill="#F9D9E3" />
          <ellipse cx={200} cy={262} rx={150} ry={22} fill="#E6DCE6" />
          <rect x={100} y={176} width={200} height={84} rx={14} fill="#F7B9CB" />
          <path d="M 100 196 Q 110 214 120 196 Q 132 222 144 196 Q 156 212 168 196 Q 180 226 192 196 Q 204 212 216 196 Q 228 220 240 196 Q 252 210 264 196 Q 276 222 288 196 Q 296 208 300 196 L 300 184 L 100 184 Z" fill="#FFFFFF" />
          <rect x={136} y={112} width={128} height={70} rx={12} fill="#FFF6EC" />
          <path d="M 136 128 Q 146 144 156 128 Q 168 150 180 128 Q 192 142 204 128 Q 216 150 228 128 Q 240 142 252 128 Q 258 138 264 128 L 264 118 L 136 118 Z" fill="#E8577A" />
          <rect x={194} y={70} width={12} height={44} rx={4} fill="#7FB8F0" />
          <path d="M 200 40 C 212 54 210 66 200 68 C 190 66 188 54 200 40 Z" fill="#FFB703" />
          <path d="M 200 52 C 205 58 204 64 200 65 C 196 64 195 58 200 52 Z" fill="#FFE38A" />
          {[[124, 230, '#7FB8F0'], [168, 238, '#FFB703'], [214, 228, '#8BD3A6'], [256, 240, '#7FB8F0'], [150, 214, '#8BD3A6'], [236, 216, '#FFB703']].map(([x, y, c], i) => (
            <rect key={i} x={x as number} y={y as number} width={14} height={6} rx={3} fill={c as string} transform={`rotate(${i * 37} ${x} ${y})`} />
          ))}
        </>
      )}
      {d === 'foto' && (
        <>
          <defs>
            <linearGradient id="conversa-foto-ceu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8EC8F2" />
              <stop offset="1" stopColor="#E6F4FD" />
            </linearGradient>
          </defs>
          <rect width={400} height={300} fill="url(#conversa-foto-ceu)" />
          <circle cx={300} cy={84} r={36} fill="#FFD166" />
          <path d="M 0 210 L 90 110 L 160 180 L 240 90 L 400 220 L 400 300 L 0 300 Z" fill="#6E9F6A" />
          <path d="M 0 236 L 120 170 L 220 230 L 320 160 L 400 210 L 400 300 L 0 300 Z" fill="#4B7A50" />
          <path d="M 240 90 L 262 112 L 250 110 L 240 122 L 228 108 L 220 112 Z" fill="#FFFFFF" />
          <rect x={0} y={258} width={400} height={42} fill="#6BB0DA" />
          <path d="M 40 272 L 120 272 M 200 282 L 300 282" stroke="#BFE2F5" strokeWidth={5} strokeLinecap="round" />
        </>
      )}
      {d === 'mapa' && (
        <>
          <rect width={400} height={300} fill="#EEF0E4" />
          <rect x={20} y={20} width={110} height={90} rx={8} fill="#DDE4CE" />
          <rect x={160} y={20} width={90} height={90} rx={8} fill="#BFDDB0" />
          <rect x={280} y={20} width={100} height={130} rx={8} fill="#DDE4CE" />
          <rect x={20} y={140} width={110} height={140} rx={8} fill="#DDE4CE" />
          <rect x={160} y={140} width={90} height={60} rx={8} fill="#DDE4CE" />
          <rect x={160} y={220} width={220} height={60} rx={8} fill="#DDE4CE" />
          <path d="M 0 125 L 400 125 M 145 0 L 145 300 M 265 0 L 265 300 M 145 210 L 400 210" stroke="#FFFFFF" strokeWidth={16} />
          <path d="M 60 250 L 60 125 L 205 125 L 205 210 L 330 210 L 330 170" stroke="#E4572E" strokeWidth={7} fill="none" strokeDasharray="14 10" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={60} cy={250} r={11} fill="#3A86FF" stroke="#FFFFFF" strokeWidth={5} />
          <path d="M 330 168 C 312 146 310 132 310 122 C 310 110 319 100 330 100 C 341 100 350 110 350 122 C 350 132 348 146 330 168 Z" fill="#E4572E" />
          <circle cx={330} cy={122} r={8} fill="#FFFFFF" />
        </>
      )}
      {d === 'recibo' && (
        <>
          <rect width={400} height={300} fill="#ECEAF3" />
          <path d="M 120 18 L 280 18 L 280 270 L 270 282 L 260 270 L 250 282 L 240 270 L 230 282 L 220 270 L 210 282 L 200 270 L 190 282 L 180 270 L 170 282 L 160 270 L 150 282 L 140 270 L 130 282 L 120 270 Z" fill="#FFFFFF" />
          <rect x={150} y={38} width={100} height={16} rx={8} fill="#2F2A63" />
          <rect x={170} y={62} width={60} height={9} rx={4.5} fill="#C9C5D8" />
          {[96, 124, 152, 180].map((y, i) => (
            <React.Fragment key={y}>
              <rect x={140} y={y} width={[70, 54, 80, 46][i]} height={11} rx={5.5} fill="#B8B3CC" />
              <rect x={226} y={y} width={34} height={11} rx={5.5} fill="#B8B3CC" />
            </React.Fragment>
          ))}
          <path d="M 140 208 L 260 208" stroke="#C9C5D8" strokeWidth={3} strokeDasharray="6 6" />
          <rect x={140} y={224} width={52} height={16} rx={8} fill="#2F2A63" />
          <rect x={214} y={224} width={46} height={16} rx={8} fill="#E4572E" />
        </>
      )}
      {d === 'produto' && (
        <>
          <rect width={400} height={300} fill="#FFF2DE" />
          <circle cx={80} cy={70} r={60} fill="#FFE6C2" />
          <ellipse cx={200} cy={268} rx={120} ry={16} fill="#F1DDC0" />
          <rect x={110} y={140} width={180} height={124} rx={10} fill="#7B61FF" />
          <rect x={98} y={112} width={204} height={40} rx={10} fill="#6247E6" />
          <rect x={188} y={112} width={24} height={152} fill="#FFD166" />
          <rect x={98} y={124} width={204} height={16} fill="#FFD166" />
          <path d="M 200 112 C 170 70 132 82 150 104 C 160 116 184 114 200 112 Z" fill="#FFB703" />
          <path d="M 200 112 C 230 70 268 82 250 104 C 240 116 216 114 200 112 Z" fill="#FFB703" />
          <circle cx={200} cy={110} r={12} fill="#F59E0B" />
        </>
      )}
      {d === 'calendario' && (
        <>
          <rect width={400} height={300} fill="#F0EEF7" />
          <rect x={90} y={40} width={220} height={232} rx={18} fill="#FFFFFF" />
          <path d="M 90 58 Q 90 40 108 40 L 292 40 Q 310 40 310 58 L 310 96 L 90 96 Z" fill="#E4572E" />
          <rect x={136} y={24} width={14} height={36} rx={7} fill="#4A4560" />
          <rect x={250} y={24} width={14} height={36} rx={7} fill="#4A4560" />
          {Array.from({ length: 20 }, (_, i) => {
            const col = i % 5;
            const lin = Math.floor(i / 5);
            return <rect key={i} x={112 + col * 38} y={114 + lin * 38} width={24} height={24} rx={6} fill={i === 12 ? '#E4572E' : '#E2DFEC'} />;
          })}
          <circle cx={112 + 2 * 38 + 12} cy={114 + 2 * 38 + 12} r={22} fill="none" stroke="#E4572E" strokeWidth={5} />
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- reação

export const REACOES = ['coracao', 'risada', 'espanto', 'estrela', 'ok'] as const;

/** Reação desenhada (viewBox 100 x 100), com as próprias cores. */
export const DesenhoReacao: React.FC<{ id: string; tamanho: number }> = ({ id, tamanho }) => {
  const d = (REACOES as readonly string[]).includes(id) ? id : 'coracao';
  const rosto = '#FFC93C';
  const traco = '#6B3E00';
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{ display: 'block' }}>
      {d === 'coracao' && <path fill="#E5484D" d="M 50 88 C 22 68 8 52 10 34 C 12 18 34 10 50 28 C 66 10 88 18 90 34 C 92 52 78 68 50 88 Z" />}
      {d === 'risada' && (
        <>
          <circle cx={50} cy={50} r={42} fill={rosto} />
          <path d="M 28 42 Q 35 32 42 42 M 58 42 Q 65 32 72 42" stroke={traco} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 26 54 L 74 54 Q 72 80 50 80 Q 28 80 26 54 Z" fill={traco} />
          <path d="M 38 72 Q 50 64 62 72 Q 58 79 50 79 Q 42 79 38 72 Z" fill="#F27C7C" />
        </>
      )}
      {d === 'espanto' && (
        <>
          <circle cx={50} cy={50} r={42} fill={rosto} />
          <path d="M 26 30 Q 34 22 42 28 M 58 28 Q 66 22 74 30" stroke={traco} strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={36} cy={42} r={7} fill={traco} />
          <circle cx={64} cy={42} r={7} fill={traco} />
          <ellipse cx={50} cy={68} rx={10} ry={13} fill={traco} />
        </>
      )}
      {d === 'estrela' && <polygon fill="#FFB800" stroke="#FFB800" strokeWidth={6} strokeLinejoin="round" points={estrela(50, 54, 44, 19)} />}
      {d === 'ok' && (
        <>
          <circle cx={50} cy={50} r={42} fill="#2BA84A" />
          <path d="M 30 52 L 44 66 L 72 36" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------- ícones da tela

/** Sinal de lido do kit: enviada = círculo vazio; lida = círculo cheio com o certo vazado na cor da bolha. */
export const IconeLido: React.FC<{ lida: boolean; cor: string; vazado: string; tamanho?: number }> = ({ lida, cor, vazado, tamanho = 26 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" style={{ display: 'block' }}>
    {lida ? (
      <>
        <circle cx={16} cy={16} r={14} fill={cor} />
        <path d="M 9 16.5 L 14 21.5 L 23.5 11" stroke={vazado} strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <circle cx={16} cy={16} r={12.2} fill="none" stroke={cor} strokeWidth={3.4} />
    )}
  </svg>
);

/** Botão de enviar: uma seta para a direita (genérica, sem avião de papel nem microfone). */
export const IconeEnviar: React.FC<{ cor: string; tamanho: number }> = ({ cor, tamanho }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{ display: 'block' }}>
    <path d="M 26 50 L 72 50 M 52 30 L 72 50 L 52 70" stroke={cor} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconeVoltar: React.FC<{ cor: string; tamanho: number }> = ({ cor, tamanho }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{ display: 'block' }}>
    <path d="M 62 18 L 30 50 L 62 82" stroke={cor} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconePlay: React.FC<{ cor: string; tamanho: number }> = ({ cor, tamanho }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{ display: 'block' }}>
    <path d="M 36 24 L 78 50 L 36 76 Z" fill={cor} stroke={cor} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------- símbolo da marca

export const SIMBOLOS = ['estrela', 'circulo', 'coracao', 'folha', 'balao', 'letra'] as const;

function estrela(cx: number, cy: number, fora: number, dentro: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? dentro : fora;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
}

/** Primeira letra do nome (sem contar espaço), em maiúscula. */
export const inicialDe = (nome: string) => (nome.trim().match(/[\p{L}\p{N}]/u)?.[0] ?? '?').toUpperCase();

/** Símbolo da marca, desenhado em código (viewBox 200 x 200). Sem `simbolo` (ou fora da lista), a letra inicial. */
export const SimboloMarca: React.FC<{ simbolo?: string | null; tamanho?: number; cor: string; corFundo: string; nome: string }> = ({ simbolo, tamanho = 80, cor, corFundo, nome }) => {
  const s = (SIMBOLOS as readonly string[]).includes(simbolo ?? '') ? (simbolo as string) : 'letra';
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 200 200" style={{ flexShrink: 0, display: 'block' }}>
      {s === 'circulo' && (
        <>
          <circle cx={100} cy={100} r={74} fill="none" stroke={cor} strokeWidth={30} />
          <circle cx={100} cy={100} r={26} fill={cor} />
        </>
      )}
      {s === 'estrela' && <polygon fill={cor} points={estrela(100, 106, 96, 42)} strokeLinejoin="round" stroke={cor} strokeWidth={10} />}
      {s === 'folha' && (
        <g transform="rotate(35 100 100)">
          <path fill={cor} d="M 100 8 C 168 44 176 132 100 170 C 24 132 32 44 100 8 Z" />
          <path d="M 100 44 L 100 150" stroke={corFundo} strokeWidth={9} strokeLinecap="round" />
          <rect x={93} y={160} width={14} height={36} rx={7} fill={cor} />
        </g>
      )}
      {s === 'coracao' && <path fill={cor} d="M 100 182 C 40 140 6 104 10 66 C 14 30 62 14 100 52 C 138 14 186 30 190 66 C 194 104 160 140 100 182 Z" />}
      {s === 'balao' && (
        <g>
          <path fill={cor} d="M 40 24 L 160 24 Q 190 24 190 54 L 190 120 Q 190 150 160 150 L 92 150 L 46 188 L 54 150 L 40 150 Q 10 150 10 120 L 10 54 Q 10 24 40 24 Z" />
          <circle cx={62} cy={87} r={13} fill={corFundo} />
          <circle cx={100} cy={87} r={13} fill={corFundo} />
          <circle cx={138} cy={87} r={13} fill={corFundo} />
        </g>
      )}
      {s === 'letra' && (
        <>
          <circle cx={100} cy={100} r={96} fill={cor} />
          <text x={100} y={100} dy="0.36em" textAnchor="middle" fontFamily={FAMILIA.texto} fontWeight={800} fontSize={116} fill={corFundo}>
            {inicialDe(nome)}
          </text>
        </>
      )}
    </svg>
  );
};
