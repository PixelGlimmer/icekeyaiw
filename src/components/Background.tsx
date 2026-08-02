import { useMemo } from 'react';

const SHARDS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 6 + Math.random() * 14,
  duration: 18 + Math.random() * 20,
  delay: Math.random() * 20,
  drift: (Math.random() - 0.5) * 40,
}));

const SPARKLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 1.2 + Math.random() * 2.4,
  duration: 16 + Math.random() * 18,
  delay: Math.random() * 20,
  opacity: 0.25 + Math.random() * 0.5,
}));

export default function Background() {
  const shards = useMemo(() => SHARDS, []);
  const sparkles = useMemo(() => SPARKLES, []);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ice-deep">
      {/* Deep icy base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,#102844_0%,#0A0F1E_50%,#05080F_100%)]" />

      {/* Vertical aurora curtains — northern-lights ribbons */}
      <div
        className="absolute left-[-10%] top-[-30%] h-[140vh] w-[35vw] blur-[90px]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,229,255,0) 0%, rgba(0,229,255,0.22) 40%, rgba(45,212,191,0.12) 70%, rgba(0,229,255,0) 100%)',
          animation: 'aurora-curtain 16s ease-in-out infinite',
        }}
      />
      <div
        className="absolute left-[20%] top-[-30%] h-[140vh] w-[30vw] blur-[100px]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,229,255,0) 0%, rgba(45,212,191,0.2) 45%, rgba(125,211,252,0.1) 75%, rgba(0,229,255,0) 100%)',
          animation: 'aurora-curtain 22s ease-in-out infinite 2s',
        }}
      />
      <div
        className="absolute right-[-10%] top-[-30%] h-[140vh] w-[35vw] blur-[100px]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,229,255,0) 0%, rgba(0,180,216,0.18) 50%, rgba(45,212,191,0.1) 80%, rgba(0,229,255,0) 100%)',
          animation: 'aurora-curtain 19s ease-in-out infinite 4s',
        }}
      />

      {/* Soft drifting glow blobs */}
      <div
        className="absolute left-[10%] top-[20%] h-[55vh] w-[55vh] rounded-full blur-[130px]"
        style={{
          background: 'radial-gradient(circle, rgba(0,229,255,0.28) 0%, rgba(0,229,255,0) 70%)',
          animation: 'aurora-drift 30s ease-in-out infinite, aurora-pulse 11s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[10%] h-[60vh] w-[60vh] rounded-full blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(45,212,191,0.2) 0%, rgba(45,212,191,0) 70%)',
          animation: 'aurora-drift-2 38s ease-in-out infinite, aurora-pulse 13s ease-in-out infinite',
        }}
      />

      {/* Perspective grid floor — cyber/ice horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55vh] opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(125,211,252,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.7) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          transform: 'perspective(420px) rotateX(62deg)',
          transformOrigin: 'bottom',
          maskImage: 'linear-gradient(180deg, transparent 0%, black 40%, black 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 40%, black 100%)',
          animation: 'grid-pan 12s linear infinite',
        }}
      />

      {/* Falling ice shards */}
      <div className="absolute inset-0">
        {shards.map((s) => (
          <span
            key={s.id}
            className="absolute"
            style={{
              left: `${s.left}%`,
              top: '-15vh',
              width: 0,
              height: 0,
              borderLeft: `${s.size / 2}px solid transparent`,
              borderRight: `${s.size / 2}px solid transparent`,
              borderBottom: `${s.size * 1.6}px solid rgba(125,211,252,0.18)`,
              filter: 'blur(0.5px) drop-shadow(0 0 4px rgba(0,229,255,0.3))',
              animation: `ice-shard-fall ${s.duration}s linear ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Rising sparkle particles */}
      <div className="absolute inset-0">
        {sparkles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-ice-blue"
            style={{
              left: `${p.left}%`,
              bottom: '-5vh',
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              boxShadow: '0 0 6px rgba(0,229,255,0.8)',
              animation: `particles-rise ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Top horizon glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ice-blue/30 to-transparent" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,8,15,0.65)_100%)]" />
    </div>
  );
}
