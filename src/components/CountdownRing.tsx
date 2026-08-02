interface CountdownRingProps {
  seconds: number;
  period: number;
  size?: number;
}

export default function CountdownRing({ seconds, period, size = 44 }: CountdownRingProps) {
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / period;
  const dash = circumference * progress;
  const urgent = seconds <= 5;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(125,211,252,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={urgent ? '#fb7185' : '#00E5FF'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{
            transition: 'stroke-dasharray 0.95s linear, stroke 0.4s ease',
            filter: urgent
              ? 'drop-shadow(0 0 4px rgba(251,113,133,0.8))'
              : 'drop-shadow(0 0 4px rgba(0,229,255,0.7))',
          }}
        />
      </svg>
      <span
        className={`absolute font-mono text-xs font-semibold tabular-nums ${
          urgent ? 'text-rose-300' : 'text-ice-blue'
        }`}
        style={{ textShadow: urgent ? '0 0 8px rgba(251,113,133,0.6)' : '0 0 8px rgba(0,229,255,0.6)' }}
      >
        {seconds}
      </span>
    </div>
  );
}
