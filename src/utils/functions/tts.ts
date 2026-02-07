/**
 * Vietnamese TTS: ưu tiên proxy /api/tts (Vite server, không CORS), không được thì fallback Web Speech.
 */

const MAX_CHUNK_LEN = 200;
const SPLIT_PUNCT = '.!?;,。，';

export type VietnameseTTSOptions = {
  lang?: string;
  slow?: boolean;
  /** Tốc độ phát (1 = bình thường, 1.2 = nhanh hơn). */
  playbackRate?: number;
  onEnd?: () => void;
  /** Gọi khi không phát được — dùng để fallback Web Speech. */
  onUnavailable?: () => void;
};

/** Tách văn bản dài thành các đoạn ≤ MAX_CHUNK_LEN. */
function splitChunks(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  if (t.length <= MAX_CHUNK_LEN) return [t];
  const chunks: string[] = [];
  let start = 0;
  while (start < t.length) {
    let end = Math.min(start + MAX_CHUNK_LEN, t.length);
    if (end < t.length) {
      const last = t.slice(start, end).split('').findLastIndex((c) => SPLIT_PUNCT.includes(c));
      if (last >= 0) end = start + last + 1;
    }
    chunks.push(t.slice(start, end).trim());
    start = end;
  }
  return chunks.filter(Boolean);
}

/**
 * Phát tiếng Việt: gọi /api/tts (proxy Vite) trước; lỗi thì onUnavailable (Web Speech).
 * @returns Hàm hủy (cancel) để dừng phát.
 */
export function playVietnameseTTS(
  text: string,
  options: VietnameseTTSOptions = {}
): () => void {
  const raw = text?.trim();
  const noop = () => {};
  if (!raw || typeof window === 'undefined') return noop;

  const { lang = 'vi', playbackRate = 1.2, onEnd, onUnavailable } = options;
  const cancelRef = { cancelled: false };
  let currentAudio: HTMLAudioElement | null = null;
  let unavailableFired = false;
  const fireUnavailable = () => {
    if (unavailableFired) return;
    unavailableFired = true;
    onUnavailable?.();
  };

  const doCancel = () => {
    cancelRef.cancelled = true;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  };

  const playBlobOrUrl = (blobOrUrl: Blob | string, isFirst: boolean): Promise<void> =>
    new Promise((resolve) => {
      if (cancelRef.cancelled) {
        resolve();
        return;
      }
      const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
      const audio = new Audio(url);
      audio.playbackRate = playbackRate;
      audio.volume = 1;
      currentAudio = audio;
      const onDone = () => {
        currentAudio = null;
        if (typeof blobOrUrl !== 'string') URL.revokeObjectURL(url);
        audio.removeEventListener('ended', onDone);
        audio.removeEventListener('error', onErr);
        resolve();
      };
      const onErr = () => {
        currentAudio = null;
        if (typeof blobOrUrl !== 'string') URL.revokeObjectURL(url);
        audio.removeEventListener('ended', onDone);
        audio.removeEventListener('error', onErr);
        if (isFirst) fireUnavailable();
        resolve();
      };
      audio.addEventListener('ended', onDone);
      audio.addEventListener('error', onErr);
      audio.play().catch(() => {
        if (isFirst) fireUnavailable();
        resolve();
      });
    });

  (async () => {
    const chunks = splitChunks(raw);
    const base = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const apiBase = base + '/api/tts';

    for (let i = 0; i < chunks.length; i++) {
      if (cancelRef.cancelled) break;
      const chunk = chunks[i];
      try {
        const r = await fetch(`${apiBase}?text=${encodeURIComponent(chunk)}&lang=${encodeURIComponent(lang)}`);
        if (r.ok) {
          const blob = await r.blob();
          await playBlobOrUrl(blob, i === 0);
        } else {
          if (i === 0) fireUnavailable();
        }
      } catch {
        if (i === 0) fireUnavailable();
      }
    }
    if (!cancelRef.cancelled && !unavailableFired && onEnd) onEnd();
  })();

  return doCancel;
}
