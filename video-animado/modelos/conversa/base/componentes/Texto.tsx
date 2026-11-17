import React from 'react';
import { larguraTexto, linhasDoTexto } from './Bolha';
import { LARGURA_UTIL, LEGENDA, SEGURA, TITULO, W } from './medidas';
import { clarear, comAlfa, contraste, legivel, legivelEm, useTema } from './tema';

// Textos de fora do celular: o título da cena (com a palavra entre asteriscos destacada) e a legenda da cena. Os dois
// ficam acima do celular, dentro da área segura, e nunca cobrem a bolha mais nova. Todo texto encolhe até um mínimo
// e, se ainda não couber, quebra (palavra comprida quebra no meio) e corta com reticências.

/** Estilo de bloco com no máximo `n` linhas (o que passar vira reticências) e quebra no meio da palavra comprida. */
export const linhasMax = (n: number): React.CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: n,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  overflowWrap: 'anywhere',
});

/** Largura da Inter 800 em relação à 400 (as letras do título são mais largas). */
const PESO_800 = 1.12;

/** Maior fonte (de `max` até `min`) em que o texto cabe em `linhas` linhas de `largura` px e na altura dada. */
export const tamanhoQueCabe = (texto: string, largura: number, max: number, min: number, linhas: number, altura: number, entrelinha = 1.12, peso = PESO_800): number => {
  for (let f = max; f > min; f -= 2) {
    const n = linhasDoTexto(texto, largura, f * peso);
    if (n <= linhas && n * f * entrelinha <= altura) return f;
  }
  return min;
};

/** "A encomenda de *última hora*" -> partes com a palavra destacada marcada. */
export const partesDoTitulo = (t: string): { texto: string; destaque: boolean }[] =>
  t
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((p) => (p.startsWith('*') && p.endsWith('*') && p.length > 2 ? { texto: p.slice(1, -1), destaque: true } : { texto: p, destaque: false }));
export const semAsteriscos = (t: string) => t.replace(/\*/g, '');

/** Título da cena: Inter 800, até 3 linhas, a palavra destacada na cor de destaque. k: entrada (0 a 1). */
export const Titulo: React.FC<{ texto: string; k?: number }> = ({ texto, k = 1 }) => {
  const T = useTema();
  const fundos = [T.c.fundo, T.c.fundo2];
  const altura = TITULO.base - TITULO.topo;
  const fs = tamanhoQueCabe(semAsteriscos(texto), LARGURA_UTIL - 20, 78, 40, 3, altura);
  const cor = legivelEm(fundos, T.c.titulo);
  const destaque = legivelEm(fundos, T.c.destaque, 3);
  return (
    <div
      style={{
        position: 'absolute',
        left: SEGURA.lado,
        width: LARGURA_UTIL,
        top: TITULO.topo,
        height: altura,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: Math.min(1, k * 1.5),
        transform: `translateY(${(1 - k) * -22}px)`,
      }}
    >
      <div style={{ fontFamily: T.f.texto, fontWeight: 800, fontSize: fs, lineHeight: 1.12, letterSpacing: '-0.01em', textAlign: 'center', color: cor, maxHeight: altura, ...linhasMax(3) }}>
        {partesDoTitulo(texto).map((p, i) => (
          <span key={i} style={p.destaque ? { color: destaque, whiteSpace: p.texto.length <= 18 ? 'nowrap' : undefined } : undefined}>
            {p.texto}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Legenda da cena: uma pílula escura (a cor do cabeçalho) com o texto claro, até 2 linhas. k: entrada (0 a 1). */
export const Legenda: React.FC<{ texto: string; k?: number }> = ({ texto, k = 1 }) => {
  const T = useTema();
  const largura = LARGURA_UTIL - 60;
  const umaLinha = larguraTexto(texto, 34) * 1.06 <= largura - 56;
  const fs = umaLinha ? 34 : 30;
  // a pílula na cor do cabeçalho; se ela some no fundo (paleta escura), um tom mais claro
  const fundo = Math.min(contraste(T.c.cabecalho, T.c.fundo), contraste(T.c.cabecalho, T.c.fundo2)) >= 1.8 ? T.c.cabecalho : clarear(T.c.cabecalho, 0.22);
  return (
    <div style={{ position: 'absolute', left: (W - largura) / 2, width: largura, top: LEGENDA.topo, height: LEGENDA.base - LEGENDA.topo, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 14}px)` }}>
      <div
        style={{
          fontFamily: T.f.texto,
          fontWeight: 600,
          fontSize: fs,
          lineHeight: 1.2,
          color: legivel(fundo, T.c.cabecalhoTexto),
          background: fundo,
          boxShadow: `0 6px 16px ${comAlfa(T.c.celular, 0.18)}`,
          borderRadius: 28,
          padding: umaLinha ? '10px 28px 12px' : '8px 28px 10px',
          maxWidth: largura,
          boxSizing: 'border-box',
          textAlign: 'center',
          ...linhasMax(2),
        }}
      >
        {texto}
      </div>
    </div>
  );
};

/** Quantas linhas a legenda ocupa (para conferir que cabe). */
export const linhasDaLegenda = (texto: string) => linhasDoTexto(texto, LARGURA_UTIL - 60 - 56, 30 * 1.06 * 1.05);
