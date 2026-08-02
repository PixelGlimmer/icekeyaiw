import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export interface ScanResult {
  data: string;
}

export function useQrScanner(active: boolean) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setReady(false);
  }, []);

  const scanFrame = useCallback(
    (onResult: (data: string) => void) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(() => scanFrame(onResult));
        return;
      }
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w && h) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const decoded = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });
          if (decoded && decoded.data) {
            onResult(decoded.data);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(() => scanFrame(onResult));
    },
    []
  );

  useEffect(() => {
    if (!active) {
      stop();
      return;
    }
    let cancelled = false;
    setError(null);

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setReady(true);
        }
      } catch (e) {
        setError(
          e instanceof DOMException && e.name === 'NotAllowedError'
            ? 'Camera access denied. Check browser permissions.'
            : 'Could not start camera. Try entering the key manually.'
        );
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [active, stop]);

  return { videoRef, canvasRef, error, ready, scanFrame, stop };
}
