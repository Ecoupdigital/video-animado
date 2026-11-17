import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { clamp, FPS, S, SEGURA, H, W, useT } from './anima';
import { useTema } from './tema';
import { DOSSIE } from './universo';

// Fundo vivo e câmera do dossiê: holofote varrendo, pontilhado, partículas de texto, scanlines (no escuro),
// documentos em parallax, grão, vinheta, HUD com o rótulo do topo, faixa de manchetes rolando, câmera viva
// com zoom, blur e glitch no corte, punch e tremida nos golpes, clarão no boom. Tudo pelo tema.

const PARTICULAS = ['0x7B6C', 'ARQ 07', 'DOC', '0xF6C8', 'REG', 'PROC', '0x06E0', 'ATA', 'REF', '§ 2º', 'ID 41', 'LOG'];

export const Fundo: React.FC = () => {
  const T = useTema();
  const t = useT();
  const ang = Math.sin(t * 0.55) * 28;
  const bx = 540 + Math.sin(t * 0.37) * 260;
  const by = 700 + Math.cos(t * 0.29) * 260;
  if (!T.escuro) {
    // tema claro: papel de jornal com luz quente passando, colunas, retícula e partículas em tinta
    return (
      <AbsoluteFill style={{ background: T.c.fundo, overflow: 'hidden' }}>
        <AbsoluteFill style={{ background: `radial-gradient(900px 900px at ${bx}px ${by}px, ${T.a('superficie', 0.95)}, transparent 70%), radial-gradient(800px 800px at ${1080 - bx}px ${1920 - by}px, ${T.a('apagado', 0.55)}, transparent 70%)` }} />
        <div style={{ position: 'absolute', left: 540 - 700, top: -200, width: 1400, height: 2400, transformOrigin: '50% 0%', transform: `rotate(${ang}deg)`, background: `conic-gradient(from 165deg at 50% 0%, transparent 0deg, ${T.a('ouro', 0.06)} 12deg, ${T.a('ouro', 0.1)} 15deg, ${T.a('ouro', 0.06)} 18deg, transparent 30deg)`, filter: 'blur(18px)' }} />
        <AbsoluteFill style={{ backgroundImage: `radial-gradient(${T.a('tinta', 0.09)} 1.6px, transparent 1.6px)`, backgroundSize: '22px 22px', backgroundPosition: `0 ${(t * 14) % 22}px`, maskImage: 'linear-gradient(180deg, transparent, black 30%, black 70%, transparent)' }} />
        {[1, 2, 3].map((k) => (
          <div key={k} style={{ position: 'absolute', top: 0, bottom: 0, left: k * 270, width: 1, background: T.a('tinta', 0.07) }} />
        ))}
        {PARTICULAS.map((h, i) => {
          const x = ((i * 263) % 1000) + 40;
          const y = 1920 - ((t * (18 + (i % 4) * 7) + i * 170) % 2100);
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, fontFamily: T.f.mono, fontSize: 22 + (i % 3) * 4, color: T.a('tinta', 0.1) }}>
              {h}
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: T.c.fundo, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 900px at ${bx}px ${by}px, ${T.a('destaque', 0.16)}, transparent 70%), radial-gradient(700px 700px at ${1080 - bx}px ${1920 - by}px, ${T.a('destaque2', 0.1)}, transparent 70%)` }} />
      <div style={{ position: 'absolute', left: 540 - 700, top: -200, width: 1400, height: 2400, transformOrigin: '50% 0%', transform: `rotate(${ang}deg)`, background: `conic-gradient(from 165deg at 50% 0%, transparent 0deg, ${T.a('claro', 0.1)} 12deg, ${T.a('claro', 0.16)} 15deg, ${T.a('claro', 0.1)} 18deg, transparent 30deg)`, filter: 'blur(18px)' }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${T.a('claro', 0.1)} 1.5px, transparent 1.5px)`, backgroundSize: '44px 44px', backgroundPosition: `0 ${(t * 14) % 44}px` }} />
      {PARTICULAS.map((h, i) => {
        const x = ((i * 263) % 1000) + 40;
        const y = 1920 - ((t * (18 + (i % 4) * 7) + i * 170) % 2100);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, fontFamily: T.f.mono, fontSize: 22 + (i % 3) * 4, color: T.a('claro', 0.13) }}>
            {h}
          </div>
        );
      })}
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)' }} />
    </AbsoluteFill>
  );
};

export const Grao: React.FC = () => {
  const T = useTema();
  const t = useT();
  const seed = Math.floor((t * FPS) / 2) % 50;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: T.escuro ? 0.07 : 0.06, mixBlendMode: T.escuro ? 'overlay' : 'multiply' }}>
      <svg width="1080" height="1920">
        <filter id={`grao-${T.nome}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grao-${T.nome})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vinheta: React.FC = () => {
  const T = useTema();
  return <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse 75% 60% at 50% 48%, transparent 55%, ${T.escuro ? 'rgba(0,0,0,0.75)' : T.a('suave', 0.32)} 100%)` }} />;
};

/** documentos borrados passando no primeiro plano (parallax) */
export const Documentos: React.FC = () => {
  const T = useTema();
  const t = useT();
  const D = [
    { y: 300, sp: 70, w: 260, r: -8, o: 0.1, ph: 0 },
    { y: 1150, sp: 95, w: 320, r: 6, o: 0.09, ph: 700 },
    { y: 700, sp: 55, w: 200, r: 12, o: 0.08, ph: 1300 },
    { y: 1600, sp: 120, w: 380, r: -4, o: 0.07, ph: 300 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {D.map((d, i) => {
        const x = ((t * d.sp + d.ph) % 1700) - 400;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i % 2 ? 1080 - x - d.w : x,
              top: d.y + Math.sin(t + i) * 30,
              width: d.w,
              height: d.w * 1.3,
              transform: `rotate(${d.r + Math.sin(t * 0.7 + i) * 4}deg)`,
              background: T.escuro ? 'rgba(232,232,240,0.9)' : T.c.papel,
              opacity: T.escuro ? d.o : d.o * 2.2,
              filter: 'blur(5px)',
              borderRadius: 3,
              padding: 22,
              boxShadow: T.escuro ? undefined : `0 10px 30px ${T.a('tinta', 0.3)}`,
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((k) => (
              <div key={k} style={{ height: 10, marginBottom: 14, width: `${60 + ((k * 37 + i * 11) % 40)}%`, background: k % 3 === 1 ? T.c.tinta : T.a('tinta', 0.35) }} />
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** barra de progresso no topo, rótulo do dossiê e o selo piscando (dentro da área segura) */
export const Hud: React.FC<{ total: number; rotulo?: string; selo?: string }> = ({ total, rotulo = DOSSIE.rotulo, selo = DOSSIE.selo }) => {
  const T = useTema();
  const t = useT();
  const pisca = Math.floor((t * FPS) / 18) % 2 === 0;
  const tam = Math.min(26, 560 / (0.62 * Math.max(1, rotulo.length)));
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, height: 8, width: `${Math.min(1, t / Math.max(0.1, total)) * 100}%`, background: T.c.destaque, boxShadow: T.escuro ? `0 0 20px ${T.a('destaque', 0.8)}` : undefined }} />
      <div style={{ position: 'absolute', left: SEGURA.lado, right: SEGURA.lado, top: 232, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <span style={{ fontFamily: T.f.mono, fontWeight: 500, fontSize: tam, color: T.c.suave, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rotulo}</span>
        <span style={{ fontFamily: T.f.mono, fontWeight: 500, fontSize: 24, color: T.c.alertaSuave, whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ opacity: pisca ? 1 : 0.25 }}>●</span> {selo}
        </span>
      </div>
    </>
  );
};

/** faixa de manchetes rolando no rodapé (y 1462 a 1540, dentro da área segura); some depois da voz */
export const Faixa: React.FC<{ manchetes?: string[]; fimVoz: number; rotulo?: string }> = ({ manchetes = DOSSIE.manchetes, fimVoz, rotulo = 'URGENTE' }) => {
  const T = useTema();
  const t = useT();
  if (!manchetes.length) return null;
  const o = interpolate(t, [fimVoz + 0.3, fimVoz + 0.7], [1, 0], clamp);
  const texto = manchetes.map((m) => `${m}  ·  `).join('');
  const x = -((t * 150) % Math.max(800, texto.length * 15.6));
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 1468,
        height: 56,
        opacity: o,
        background: T.escuro ? `linear-gradient(90deg, ${T.a('alerta', 0.18)}, ${T.a('destaque', 0.14)})` : T.c.superficie,
        borderTop: `${T.escuro ? 1 : 2}px solid ${T.a('alerta', 0.45)}`,
        borderBottom: `${T.escuro ? 1 : 2}px solid ${T.a('destaque', 0.35)}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 2, background: T.c.alerta, padding: '0 18px 0 70px', display: 'flex', alignItems: 'center', fontFamily: T.f.texto, fontWeight: 900, fontSize: 24, color: '#FFFFFF', letterSpacing: '0.08em' }}>{rotulo}</div>
      <div style={{ whiteSpace: 'nowrap', transform: `translateX(${x}px)`, fontFamily: T.f.mono, fontWeight: 600, fontSize: 26, color: T.c.texto, paddingLeft: 260 }}>{texto.repeat(4)}</div>
    </div>
  );
};

// ---------------------------------------------------------------- câmera

/** tremida da câmera nos golpes (I = 1) e batidas (I = 0,4), em segundos */
export const useTremida = (golpes: number[], batidas: number[], forca = 22) => {
  const t = useT();
  const f = t * FPS;
  let x = 0;
  let y = 0;
  const somar = (seg: number, I: number) => {
    const h = S(seg);
    const d = f - h;
    if (d < 0 || d > 14) return;
    const a = I * forca * Math.exp(-d / 3.2);
    x += a * Math.sin(d * 2.3 + h);
    y += a * Math.cos(d * 1.9 + h * 0.7);
  };
  golpes.forEach((s) => somar(s, 1));
  batidas.forEach((s) => somar(s, 0.4));
  return { x, y };
};

/** clarão rápido no boom */
export const Clarao: React.FC<{ golpes: number[]; forca?: number }> = ({ golpes, forca = 0.35 }) => {
  const T = useTema();
  const f = useT() * FPS;
  let o = 0;
  golpes.forEach((s) => {
    const d = f - S(s);
    if (d >= 0 && d < 8) o = Math.max(o, forca * (1 - d / 8));
  });
  return <AbsoluteFill style={{ background: T.escuro ? '#fff' : T.c.ouro, opacity: T.escuro ? o : o * 0.5, pointerEvents: 'none', mixBlendMode: T.escuro ? 'overlay' : 'multiply' }} />;
};

/** câmera viva de cada cena: entra com zoom e blur, deriva, dá punch nos golpes e sai com zoom e blur; glitch no corte */
export const CameraViva: React.FC<{ lf: number; dur: number; idx: number; gf: number; punch: [number, number][]; children: React.ReactNode }> = ({ lf, dur, idx, gf, punch, children }) => {
  const T = useTema();
  const IN = 7;
  const OUT = 6;
  const pin = interpolate(lf, [0, IN], [0, 1], clamp);
  const pout = interpolate(lf, [dur - OUT, dur], [0, 1], clamp);
  const eIn = 1 - Math.pow(1 - pin, 3);
  const eOut = pout * pout;
  let soco = 0;
  punch.forEach(([seg, k]) => {
    const d = gf - S(seg);
    if (d >= 0 && d < 24) soco += k * Math.exp(-d / 4) * Math.min(1, d / 2 + 0.3);
  });
  // a deriva vai de 0,955 a 1,0: no fim da cena o desenho fica no tamanho da grade, dentro da área segura
  const zoom = (0.86 + 0.14 * eIn) * (1 + 0.22 * eOut) * (0.955 + 0.045 * (lf / Math.max(1, dur))) * (1 + soco);
  const dx = Math.sin(lf / 38 + idx * 1.7) * 12;
  const dy = Math.cos(lf / 47 + idx) * 9;
  const rot = Math.sin(lf / 60 + idx * 2.3) * 0.7 + (1 - eIn) * (idx % 2 ? 3 : -3) + eOut * (idx % 2 ? -2 : 2);
  const blur = (1 - eIn) * 16 + eOut * 14;
  const glitch = lf < 4 || dur - lf < 3;
  const sh = glitch ? 10 : 0;
  const filtro = `${blur > 0.3 ? `blur(${blur}px)` : ''} ${sh ? `drop-shadow(${sh}px 0 0 ${T.a('alerta', 0.75)}) drop-shadow(${-sh}px 0 0 ${T.a('destaque2', 0.75)})` : ''}`.trim();
  return (
    <AbsoluteFill style={{ opacity: Math.min(eIn * 1.2, 1 - eOut), transform: `translate(${dx}px, ${dy}px) scale(${zoom}) rotate(${rot}deg)`, filter: filtro || undefined }}>
      {children}
    </AbsoluteFill>
  );
};

/** área segura marcada (só nos stills de conferência): faixas fora dela sombreadas e borda tracejada */
export const AreaSegura: React.FC = () => {
  const faixa = 'repeating-linear-gradient(45deg, rgba(255,40,80,0.28) 0 12px, rgba(255,40,80,0.12) 12px 24px)';
  const yb = H - SEGURA.baixo;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SEGURA.topo, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: yb, bottom: 0, background: faixa }} />
      <div style={{ position: 'absolute', left: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', right: 0, width: SEGURA.lado, top: SEGURA.topo, bottom: SEGURA.baixo, background: faixa }} />
      <div style={{ position: 'absolute', left: SEGURA.lado, top: SEGURA.topo, width: W - 2 * SEGURA.lado, height: yb - SEGURA.topo, border: '3px dashed rgba(255,40,80,0.9)', boxSizing: 'border-box' }} />
    </AbsoluteFill>
  );
};
