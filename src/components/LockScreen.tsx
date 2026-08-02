import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

interface LockScreenProps {
  mode: 'create' | 'unlock';
  error?: string | null;
  onSubmit: (passphrase: string) => void;
}

export default function LockScreen({ mode, error, onSubmit }: LockScreenProps) {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (pass.length < 4) {
      setLocalError('Use at least 4 characters.');
      return;
    }
    if (mode === 'create' && pass !== confirm) {
      setLocalError('Passphrases do not match.');
      return;
    }
    onSubmit(pass);
  };

  const shownError = localError || error;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong w-full max-w-sm rounded-3xl p-7 animate-modal-in glow-soft sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-ice-blue/25 to-ice-teal/10 glow-blue">
            <ShieldCheck className="h-8 w-8 text-ice-blue" strokeWidth={2} />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-ice-blue/30 animate-spin-slow" style={{ animationDuration: '20s' }} />
          </div>
          <h1 className="text-xl font-semibold tracking-[0.3em] ice-gradient-text">ICEKEY</h1>
          <p className="mt-1.5 text-xs text-ice-muted">
            {mode === 'create'
              ? 'Create a passphrase to encrypt your vault'
              : 'Enter your passphrase to unlock the vault'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ice-muted" />
              <input
                ref={inputRef}
                type={show ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Passphrase"
                className="w-full rounded-xl border border-white/10 bg-ice-deep/50 py-2.5 pl-9 pr-10 text-sm text-white placeholder:text-ice-muted/60 outline-none transition focus:border-ice-blue/50 focus:glow-sm"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ice-muted transition hover:text-ice-frost"
                aria-label={show ? 'Hide passphrase' : 'Show passphrase'}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'create' && (
            <div className="relative animate-fade-in">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ice-muted" />
              <input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm passphrase"
                className="w-full rounded-xl border border-white/10 bg-ice-deep/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-ice-muted/60 outline-none transition focus:border-ice-blue/50 focus:glow-sm"
              />
            </div>
          )}

          {shownError && (
            <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 animate-fade-in">
              {shownError}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-ice-blue to-ice-teal py-2.5 text-sm font-semibold text-ice-deep transition hover:opacity-90 active:scale-[0.98] glow-blue"
          >
            {mode === 'create' ? 'Create Vault' : 'Unlock'}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-ice-muted/70">
          Your passphrase encrypts secrets locally with AES-256. It is never stored — keep it safe.
        </p>
      </div>
    </div>
  );
}
