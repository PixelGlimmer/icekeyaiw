import { useEffect, useRef, useState } from 'react';
import { Camera, KeyRound, ScanLine, X } from 'lucide-react';
import { parseOtpauthUri } from '@/lib/totp';
import { useQrScanner } from '@/lib/useQrScanner';

export interface NewAccount {
  name: string;
  issuer?: string;
  secret: string;
}

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (account: NewAccount) => void;
}

type Tab = 'manual' | 'scan';

export default function AddAccountModal({ open, onClose, onAdd }: AddAccountModalProps) {
  const [tab, setTab] = useState<Tab>('manual');
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const { videoRef, canvasRef, error: camError, ready, scanFrame, stop } = useQrScanner(tab === 'scan');

  useEffect(() => {
    if (open) {
      setTab('manual');
      setName('');
      setIssuer('');
      setSecret('');
      setError(null);
      setFound(false);
      setTimeout(() => nameRef.current?.focus(), 120);
    } else {
      stop();
    }
  }, [open, stop]);

  useEffect(() => {
    if (tab !== 'scan') return;
    let cancelled = false;
    scanFrame((data) => {
      if (cancelled) return;
      const parsed = parseOtpauthUri(data);
      if (parsed) {
        setFound(true);
        stop();
        onAdd(parsed);
      } else {
        setError('QR code is not a valid 2FA (otpauth) URI.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tab, scanFrame, stop, onAdd]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim() || issuer.trim() || 'Account';
    const cleanSecret = secret.trim().replace(/\s/g, '');
    if (!cleanSecret) {
      setError('Please enter a secret key.');
      return;
    }
    try {
      // Validate base32 by decoding
      const cleaned = cleanSecret.toUpperCase().replace(/=/g, '');
      if (!/^[A-Z2-7]+$/.test(cleaned)) throw new Error('invalid');
    } catch {
      setError('Secret key must be valid Base32 (A-Z, 2-7).');
      return;
    }
    onAdd({ name: trimmedName, issuer: issuer.trim() || undefined, secret: cleanSecret });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-ice-deep/70 backdrop-blur-md animate-overlay-in"
        onClick={onClose}
      />
      <div className="glass-strong relative w-full max-w-md rounded-t-3xl p-5 animate-modal-in glow-soft sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-ice-blue/15 text-ice-blue glow-blue">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-semibold tracking-wide text-white">Add Account</h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ice-muted transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-ice-deep/50 p-1">
          <button
            onClick={() => setTab('manual')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition ${
              tab === 'manual'
                ? 'bg-ice-blue/15 text-ice-blue glow-sm'
                : 'text-ice-muted hover:text-ice-frost'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            Manual
          </button>
          <button
            onClick={() => {
              setTab('scan');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition ${
              tab === 'scan'
                ? 'bg-ice-blue/15 text-ice-blue glow-sm'
                : 'text-ice-muted hover:text-ice-frost'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            Scan QR
          </button>
        </div>

        {tab === 'manual' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ice-frost/80">Service name</label>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google, GitHub"
                className="w-full rounded-xl border border-white/10 bg-ice-deep/50 px-3.5 py-2.5 text-sm text-white placeholder:text-ice-muted/60 outline-none transition focus:border-ice-blue/50 focus:glow-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ice-frost/80">
                Issuer <span className="text-ice-muted/60">(optional)</span>
              </label>
              <input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. Amazon"
                className="w-full rounded-xl border border-white/10 bg-ice-deep/50 px-3.5 py-2.5 text-sm text-white placeholder:text-ice-muted/60 outline-none transition focus:border-ice-blue/50 focus:glow-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ice-frost/80">Secret key</label>
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="JBSWY3DPEHPK3PXP"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                className="font-mono w-full rounded-xl border border-white/10 bg-ice-deep/50 px-3.5 py-2.5 text-sm uppercase tracking-wider text-white placeholder:text-ice-muted/60 outline-none transition focus:border-ice-blue/50 focus:glow-sm"
              />
              <p className="mt-1.5 text-[11px] text-ice-muted/70">
                Base32 secret from your 2FA setup. Spaces are ignored.
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 animate-fade-in">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-ice-blue to-ice-teal py-2.5 text-sm font-semibold text-ice-deep transition hover:opacity-90 active:scale-[0.98] glow-blue"
            >
              Add to Vault
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-ice-blue/20 bg-ice-deep/60">
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover opacity-90"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanner overlay frame */}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="relative h-48 w-48">
                  <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-ice-blue rounded-tl-lg" />
                  <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-ice-blue rounded-tr-lg" />
                  <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-ice-blue rounded-bl-lg" />
                  <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-ice-blue rounded-br-lg" />
                  <ScanLine
                    className="absolute left-2 right-2 top-1/2 h-0.5 w-auto text-ice-blue"
                    style={{ animation: 'scan-sweep 2.4s ease-in-out infinite', filter: 'drop-shadow(0 0 6px rgba(0,229,255,0.8))' }}
                  />
                </div>
              </div>

              {!ready && !camError && (
                <div className="absolute inset-0 grid place-items-center bg-ice-deep/70">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-7 w-7 animate-spin-slow rounded-full border-2 border-ice-blue/30 border-t-ice-blue" />
                    <p className="text-xs text-ice-muted">Starting camera…</p>
                  </div>
                </div>
              )}
            </div>

            {camError && (
              <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 animate-fade-in">
                {camError}
              </p>
            )}
            {found && (
              <p className="rounded-lg border border-ice-teal/30 bg-ice-teal/10 px-3 py-2 text-xs text-ice-teal animate-fade-in">
                QR detected — adding account…
              </p>
            )}
            <p className="text-center text-[11px] text-ice-muted/70">
              Point your camera at a 2FA QR code from any service.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
