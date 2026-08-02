import { Snowflake } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export default function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="grid h-24 w-24 place-items-center rounded-3xl glass glow-blue">
          <Snowflake className="h-11 w-11 text-ice-blue/80" style={{ animation: 'spin-slow 24s linear infinite' }} />
        </div>
        <div className="absolute -inset-2 -z-10 rounded-3xl bg-ice-blue/10 blur-2xl" />
      </div>
      <h2 className="text-lg font-semibold text-white/90">Your vault is empty</h2>
      <p className="mt-2 max-w-xs text-sm text-ice-muted">
        Add your first 2FA account to generate one-time codes, secured with end-to-end encryption.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 rounded-xl bg-gradient-to-r from-ice-blue to-ice-teal px-6 py-2.5 text-sm font-semibold text-ice-deep transition hover:opacity-90 active:scale-[0.98] glow-blue"
      >
        Add First Account
      </button>
    </div>
  );
}
