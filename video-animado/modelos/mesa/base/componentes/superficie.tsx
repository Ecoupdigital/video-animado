import React from 'react';
import { H, W } from './anima';
import { semente, sorteio } from './pecas';
import { useMesa, type IdSuperficie } from './tema';

// As 3 superfícies da mesa, desenhadas em código, sempre iguais (a textura sai de semente fixa, nunca de sorteio
// solto). As cores são do material (opcoes.json, "superficies") e nunca mudam com a resposta de cores.
//   madeira  tábuas verticais com junta escura e veio, como a tela de referência (5 tábuas de 216 px)
//   marmore  mármore claro com manchas suaves e veios finos que se ramificam
//   pano     pano liso com trama leve (fios cruzados) e duas dobras quase invisíveis

const f1 = (n: number) => n.toFixed(1);

const Madeira: React.FC<{ w: number; h: number; m: Record<string, string> }> = ({ w, h, m }) => {
  const larg = 216;
  const n = Math.ceil(w / larg);
  const cores = [m.tabua1, m.tabua2, m.tabua3, m.tabua4];
  const r = sorteio(semente('madeira'));
  const veios: string[] = [];
  const nos: { x: number; y: number; rx: number; ry: number }[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = i * larg;
    // veios longos que descem pela tábua, com a curva do desenho da referência (q 30 60 0 140 q -26 60 6 120), em escala
    const k = 3 + Math.floor(r() * 2);
    for (let j = 0; j < k; j++) {
      const x = x0 + 24 + r() * (larg - 60);
      let y = -60 + r() * h;
      const a = 40 + r() * 30;
      let d = `M${f1(x)} ${f1(y)}`;
      for (let s = 0; s < 3; s++) {
        d += ` q${f1(a)} ${f1(120)} 0 ${f1(280)} q${f1(-a * 0.85)} ${f1(120)} ${f1(12)} ${f1(240)}`;
        y += 520;
      }
      veios.push(d);
    }
    if (r() < 0.6) nos.push({ x: x0 + 50 + r() * (larg - 100), y: 200 + r() * (h - 400), rx: 12 + r() * 8, ry: 26 + r() * 14 });
  }
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={i * larg} y={0} width={larg} height={h} fill={cores[i % cores.length]} />
      ))}
      {veios.map((d, i) => (
        <path key={i} d={d} stroke={m.veio} strokeWidth={i % 3 === 0 ? 4 : 2.5} fill="none" opacity={0.55} />
      ))}
      {nos.map((o, i) => (
        <g key={i} opacity={0.55}>
          <ellipse cx={o.x} cy={o.y} rx={o.rx} ry={o.ry} fill="none" stroke={m.veio} strokeWidth={3} />
          <ellipse cx={o.x} cy={o.y} rx={o.rx * 0.45} ry={o.ry * 0.45} fill={m.veio} />
        </g>
      ))}
      {Array.from({ length: n + 1 }).map((_, i) => (
        <path key={i} d={`M${i * larg} 0V${h}`} stroke={m.junta} strokeWidth={4} />
      ))}
    </>
  );
};

const Marmore: React.FC<{ w: number; h: number; m: Record<string, string> }> = ({ w, h, m }) => {
  const r = sorteio(semente('marmore'));
  const manchas = Array.from({ length: 7 }).map(() => ({ x: r() * w, y: r() * h, rx: 260 + r() * 260, ry: 160 + r() * 200, a: r() * 180 }));
  // veios: curvas longas e suaves que atravessam a pedra em diagonal; um ou outro galho curto
  const veios: { d: string; larg: number; cor: string; op: number }[] = [];
  const linha = (x: number, y: number, ang: number, passos: number, largura: number, cor: string, op: number, galhos: number) => {
    let d = `M${f1(x)} ${f1(y)}`;
    let a = ang;
    for (let s = 0; s < passos; s++) {
      a += (r() - 0.5) * 0.32;
      const comp = 150 + r() * 120;
      const nx = x + Math.cos(a) * comp;
      const ny = y + Math.sin(a) * comp;
      const cx = (x + nx) / 2 + (r() - 0.5) * 36;
      const cy = (y + ny) / 2 + (r() - 0.5) * 36;
      d += ` Q${f1(cx)} ${f1(cy)} ${f1(nx)} ${f1(ny)}`;
      if (r() < galhos) linha(nx, ny, a + (r() < 0.5 ? 0.6 : -0.6), 2, largura * 0.6, cor, op * 0.8, 0);
      x = nx;
      y = ny;
    }
    veios.push({ d, larg: largura, cor, op });
  };
  for (let i = 0; i < 4; i++) linha(-120 + r() * 200, -100 + i * 560 + r() * 160, 0.5 + r() * 0.3, 9, 16, m.veio2, 0.28, 0);
  for (let i = 0; i < 5; i++) linha(-80 + r() * 300, -120 + i * 440 + r() * 160, 0.45 + r() * 0.35, 9, 2.4, m.veio, 0.42, 0.12);
  return (
    <>
      <rect x={0} y={0} width={w} height={h} fill={m.marmore} />
      {manchas.map((k, i) => (
        <ellipse key={i} cx={k.x} cy={k.y} rx={k.rx} ry={k.ry} fill={m.marmore2} opacity={0.45} transform={`rotate(${f1(k.a)} ${f1(k.x)} ${f1(k.y)})`} />
      ))}
      {veios.map((v, i) => (
        <path key={i} d={v.d} stroke={v.cor} strokeWidth={v.larg} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={v.op} />
      ))}
    </>
  );
};

const Pano: React.FC<{ w: number; h: number; m: Record<string, string> }> = ({ w, h, m }) => {
  const passo = 7;
  const fiosV: string[] = [];
  const fiosH: string[] = [];
  for (let x = 0; x <= w; x += passo) fiosV.push(`M${x} 0V${h}`);
  for (let y = 0; y <= h; y += passo) fiosH.push(`M0 ${y}H${w}`);
  const r = sorteio(semente('pano'));
  // fios mais grossos de vez em quando, como num linho
  const grossos = Array.from({ length: 26 }).map(() => ({ v: r() < 0.5, p: Math.round((r() * (r() < 0.5 ? w : h)) / passo) * passo + 3 }));
  return (
    <>
      <rect x={0} y={0} width={w} height={h} fill={m.pano} />
      <path d={fiosV.join('')} stroke={m.trama} strokeWidth={1.6} opacity={0.5} />
      <path d={fiosH.join('')} stroke={m.trama2} strokeWidth={1.6} opacity={0.55} />
      {grossos.map((g, i) => (
        <path key={i} d={g.v ? `M${g.p} 0V${h}` : `M0 ${g.p}H${w}`} stroke={i % 2 ? m.trama : m.trama2} strokeWidth={3} opacity={0.35} />
      ))}
      {/* duas dobras suaves do pano */}
      <path d={`M${-100} ${h * 0.28} L${w + 100} ${h * 0.18}`} stroke={m.trama2} strokeWidth={90} opacity={0.18} />
      <path d={`M${-100} ${h * 0.28 + 60} L${w + 100} ${h * 0.18 + 60}`} stroke={m.trama} strokeWidth={50} opacity={0.14} />
      <path d={`M${-100} ${h * 0.74} L${w + 100} ${h * 0.8}`} stroke={m.trama2} strokeWidth={70} opacity={0.15} />
    </>
  );
};

const DESENHO: Record<IdSuperficie, React.FC<{ w: number; h: number; m: Record<string, string> }>> = { madeira: Madeira, marmore: Marmore, pano: Pano };

/** A superfície da mesa em uso (a do <ComMesa> mais próximo, senão a das respostas), na tela inteira (ou w x h). */
export const Superficie: React.FC<{ w?: number; h?: number }> = ({ w = W, h = H }) => {
  const M = useMesa();
  const D = DESENHO[M.superficie];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: 0, top: 0 }}>
      <D w={w} h={h} m={M.m} />
    </svg>
  );
};
