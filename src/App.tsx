import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Background from '@/components/Background';
import Header from '@/components/Header';
import AccountCard, { type Account } from '@/components/AccountCard';
import AddAccountModal, { type NewAccount } from '@/components/AddAccountModal';
import ExportModal from '@/components/ExportModal';
import LockScreen from '@/components/LockScreen';
import EmptyState from '@/components/EmptyState';
import {
  decryptVault,
  encryptVault,
  hasStoredVault,
  isVaultInitialized,
  type StoredAccount,
} from '@/lib/storage';

type ViewState = 'loading' | 'locked' | 'unlocked';

function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [lockMode, setLockMode] = useState<'create' | 'unlock'>('create');
  const [lockError, setLockError] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [now, setNow] = useState(Date.now());
  const [modalOpen, setModalOpen] = useState(false);
  const [exportAccount, setExportAccount] = useState<Account | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  // Determine initial view on mount
  useEffect(() => {
    const initialized = isVaultInitialized();
    const hasData = hasStoredVault();
    if (initialized && hasData) {
      setLockMode('unlock');
      setView('locked');
    } else {
      setLockMode('create');
      setView('locked');
    }
  }, []);

  // Tick every second for countdown + code rotation
  useEffect(() => {
    if (view !== 'unlocked') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [view]);

  const persist = useCallback(
    async (next: StoredAccount[], pass: string) => {
      try {
        await encryptVault(next, pass);
      } catch (e) {
        console.error('Encrypt failed', e);
      }
    },
    []
  );

  const handleUnlock = useCallback(
    async (pass: string) => {
      setLockError(null);
      if (lockMode === 'unlock') {
        try {
          const stored = await decryptVault(pass);
          setAccounts(stored);
          setPassphrase(pass);
          setView('unlocked');
        } catch {
          setLockError('Incorrect passphrase. Try again.');
        }
      } else {
        setPassphrase(pass);
        setAccounts([]);
        await persist([], pass);
        setView('unlocked');
      }
    },
    [lockMode, persist]
  );

  const handleAdd = useCallback(
    async (newAcc: NewAccount) => {
      const account: Account = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: newAcc.name,
        issuer: newAcc.issuer,
        secret: newAcc.secret,
        createdAt: Date.now(),
      };
      const next = [...accounts, account];
      setAccounts(next);
      setModalOpen(false);
      await persist(next, passphrase);
    },
    [accounts, passphrase, persist]
  );

  const handleRemove = useCallback(
    async (id: string) => {
      const next = accounts.filter((a) => a.id !== id);
      setAccounts(next);
      await persist(next, passphrase);
    },
    [accounts, passphrase, persist]
  );

  const handleLock = useCallback(() => {
    setPassphrase('');
    setAccounts([]);
    setLockMode('unlock');
    setLockError(null);
    setView('locked');
  }, []);

  const handleExport = useCallback((account: Account) => {
    setExportAccount(account);
    setExportOpen(true);
  }, []);

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => a.createdAt - b.createdAt),
    [accounts]
  );

  if (view === 'locked') {
    return (
      <>
        <Background />
        <LockScreen mode={lockMode} error={lockError} onSubmit={handleUnlock} />
      </>
    );
  }

  return (
    <>
      <Background />
      <div className="relative flex min-h-screen flex-col">
        <Header locked={false} onLock={handleLock} />

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6 sm:px-6">
          {sortedAccounts.length === 0 ? (
            <EmptyState onAdd={() => setModalOpen(true)} />
          ) : (
            <div className="space-y-3.5">
              <div className="mb-1 flex items-center justify-between px-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-ice-muted">
                  {sortedAccounts.length} {sortedAccounts.length === 1 ? 'Account' : 'Accounts'}
                </p>
                <p className="text-xs text-ice-muted">
                  Codes refresh every 30s
                </p>
              </div>
              {sortedAccounts.map((acc, i) => (
                <AccountCard
                  key={acc.id}
                  account={acc}
                  index={i}
                  now={now}
                  onRemove={handleRemove}
                  onExport={handleExport}
                />
              ))}
            </div>
          )}
        </main>

        {/* Floating add button */}
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-ice-blue to-ice-teal px-6 py-3.5 text-sm font-semibold text-ice-deep shadow-lg transition hover:scale-105 active:scale-95 glow-blue"
          aria-label="Add account"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          Add Account
        </button>

        <AddAccountModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAdd}
        />

        <ExportModal
          open={exportOpen}
          account={exportAccount}
          onClose={() => setExportOpen(false)}
        />
      </div>
    </>
  );
}

export default App;
