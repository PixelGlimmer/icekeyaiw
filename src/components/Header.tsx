import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  locked: boolean;
  onLock: () => void;
}

export default function Header({ locked, onLock }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
      <div className="glass-strong mx-auto flex max-w-3xl items-center justify-between rounded-2xl px-4 py-3 glow-soft sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-ice-blue/20 to-ice-teal/10 glow-blue">
            <ShieldCheck className="h-5 w-5 text-ice-blue" strokeWidth={2.2} />
            <div className="absolute inset-0 rounded-xl ring-1 ring-ice-blue/30" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-semibold tracking-[0.28em] ice-gradient-text sm:text-xl">
              ICEKEY
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-ice-muted sm:text-[11px]">
              Encrypted 2FA Vault
            </p>
          </div>
        </div>

        <button
          onClick={onLock}
          disabled={locked}
          className="group flex items-center gap-2 rounded-xl border border-ice-blue/20 bg-ice-blue/5 px-3 py-2 text-xs font-medium text-ice-frost/90 transition hover:border-ice-blue/40 hover:bg-ice-blue/10 hover:text-ice-blue disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Lock vault"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-ice-teal shadow-[0_0_8px_2px_rgba(45,212,191,0.6)] transition group-hover:bg-ice-blue" />
          {locked ? 'Locked' : 'Lock'}
        </button>
      </div>
    </header>
  );
}
