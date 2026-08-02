import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Check, Copy, Download, QrCode, X } from 'lucide-react';
import { buildOtpauthUri } from '@/lib/totp';
import type { Account } from './AccountCard';

interface ExportModalProps {
  open: boolean;
  account: Account | null;
  onClose: () => void;
}

export default function ExportModal({ open, account, onClose }: ExportModalProps) {
  const [copied, setCopied] = useState(false);

  const uri = account ? buildOtpauthUri(account.name, account.secret, account.issuer) : '';

  useEffect(() => {
    if (!open) return;
    setCopied(false);
  }, [open, account]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  if (!open || !account) return null;

  const handleCopyUri = async () => {
    try {
      await navigator.clipboard.writeText(uri);
      setCopied(true);
    } catch {
      /* ignore */
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('#export-qr-canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `icekey-${account.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const display = account.issuer || account.name;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ice-deep/70 backdrop-blur-md animate-overlay-in" onClick={onClose} />
      <div className="glass-strong relative w-full max-w-sm rounded-t-3xl p-5 animate-modal-in glow-soft sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-ice-blue/15 text-ice-blue glow-blue">
              <QrCode className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-semibold tracking-wide text-white">Export QR</h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ice-muted transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-center text-xs text-ice-muted">
          Scan with any authenticator app (Google, Authy, etc.) to import{' '}
          <span className="font-medium text-ice-frost">{display}</span>.
        </p>

        {/* QR canvas */}
        <div className="relative mx-auto mb-4 grid h-64 w-64 place-items-center rounded-2xl border border-ice-blue/20 bg-white p-3 glow-soft">
          <QRCodeCanvas
            id="export-qr-canvas"
            value={uri}
            size={236}
            level="M"
            marginSize={2}
            fgColor="#0A0F1E"
            bgColor="#FFFFFF"
          />
        </div>

        {/* Secret display */}
        <div className="mb-4 rounded-xl border border-white/10 bg-ice-deep/50 px-3.5 py-2.5">
          <p className="mb-0.5 text-[10px] uppercase tracking-wider text-ice-muted">Secret key</p>
          <p className="font-mono text-xs break-all text-ice-frost/80">{account.secret}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopyUri}
            className="flex items-center justify-center gap-2 rounded-xl border border-ice-blue/20 bg-ice-blue/5 py-2.5 text-xs font-medium text-ice-frost transition hover:border-ice-blue/40 hover:bg-ice-blue/10 hover:text-ice-blue"
          >
            {copied ? <Check className="h-4 w-4 text-ice-teal animate-pop-in" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy URI'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ice-blue to-ice-teal py-2.5 text-xs font-semibold text-ice-deep transition hover:opacity-90 active:scale-[0.98] glow-blue"
          >
            <Download className="h-4 w-4" />
            Save PNG
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-ice-muted/70">
          Anyone with this QR can generate your codes. Share it only with yourself, and only over trusted channels.
        </p>
      </div>
    </div>
  );
}
