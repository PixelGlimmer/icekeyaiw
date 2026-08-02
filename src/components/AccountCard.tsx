import { useEffect, useState } from 'react';
import { Check, Copy, QrCode, Trash2 } from 'lucide-react';
import { generateTOTP, secondsRemaining, TOTP_DIGITS, TOTP_PERIOD } from '@/lib/totp';
import CountdownRing from './CountdownRing';

export interface Account {
  id: string;
  name: string;
  issuer?: string;
  secret: string;
  createdAt: number;
}

interface AccountCardProps {
  account: Account;
  index: number;
  now: number;
  onRemove: (id: string) => void;
  onExport: (account: Account) => void;
}

const PALETTE = [
  { from: '#00E5FF', to: '#2DD4BF' },
  { from: '#7DD3FC', to: '#00E5FF' },
  { from: '#2DD4BF', to: '#0EA5E9' },
  { from: '#38BDF8', to: '#22D3EE' },
];

function initials(name: string): string {
  const parts = name.trim().split(/[\s_-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AccountCard({ account, index, now, onRemove, onExport }: AccountCardProps) {
  const [code, setCode] = useState('------');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const remaining = secondsRemaining(TOTP_PERIOD, now);
  const counter = Math.floor(now / 1000 / TOTP_PERIOD);
  const palette = PALETTE[index % PALETTE.length];
  const display = account.issuer ? account.issuer : account.name;

  useEffect(() => {
    let active = true;
    generateTOTP(account.secret, TOTP_PERIOD, TOTP_DIGITS, counter * TOTP_PERIOD * 1000)
      .then((c) => {
        if (active) {
          setCode(c);
          setError(null);
        }
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Invalid secret'));
    return () => {
      active = false;
    };
  }, [account.secret, counter]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    if (error) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
  };

  const handleRemove = () => {
    if (confirming) {
      onRemove(account.id);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <div className="glass animate-card-in group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:border-ice-blue/30 hover:glow-soft sm:p-5">
      {/* hover sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(110deg, transparent 30%, ${palette.from}22 50%, transparent 70%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2.4s linear infinite',
        }}
      />
      <div className="relative flex items-center gap-4">
        {/* Logo */}
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold text-ice-deep shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
            boxShadow: `0 6px 20px -6px ${palette.from}80`,
          }}
        >
          {initials(display)}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white/90">{account.name}</p>
          {account.issuer && account.issuer !== account.name && (
            <p className="truncate text-xs text-ice-muted">{account.issuer}</p>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={`font-mono-code text-2xl font-semibold tracking-[0.14em] sm:text-3xl ${
                error ? 'text-rose-400/80' : copied ? 'text-ice-teal' : 'text-ice-blue'
              }`}
              style={!error && !copied ? { textShadow: '0 0 16px rgba(0,229,255,0.35)' } : undefined}
            >
              {error ? 'ERROR' : code}
            </span>
          </div>
          {error && <p className="mt-1 text-[11px] text-rose-400/70">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2.5">
          <CountdownRing seconds={remaining} period={TOTP_PERIOD} />
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleCopy}
              disabled={!!error}
              className="grid h-9 w-9 place-items-center rounded-lg border border-ice-blue/20 bg-ice-blue/5 text-ice-frost transition hover:border-ice-blue/50 hover:bg-ice-blue/15 hover:text-ice-blue disabled:opacity-30"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-ice-teal animate-pop-in" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => onExport(account)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-ice-muted transition hover:border-ice-blue/40 hover:text-ice-blue"
              aria-label="Export QR code"
            >
              <QrCode className="h-4 w-4" />
            </button>
            <button
              onClick={handleRemove}
              className={`grid h-9 w-9 place-items-center rounded-lg border transition ${
                confirming
                  ? 'border-rose-400/50 bg-rose-500/20 text-rose-300'
                  : 'border-white/10 bg-white/5 text-ice-muted hover:border-rose-400/40 hover:text-rose-300'
              }`}
              aria-label={confirming ? 'Confirm remove' : 'Remove account'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Copied toast strip */}
      {copied && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ice-blue to-ice-teal animate-fade-in" />
      )}
    </div>
  );
}
