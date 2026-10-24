import type { Stage } from '../content/types';

export type RecordingKind = 'practice' | 'benchmark';

export interface RecordingMeta {
  id: string;
  dayId: string;
  stage: Stage;
  kind: RecordingKind;
  createdAt: string;
  durationMs: number;
  mimeType: string;
}

export interface StoredRecording extends RecordingMeta {
  blob: Blob;
}

export interface RecordingHandle {
  stop(): Promise<StoredRecording>;
  cancel(): void;
}

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
] as const;

export function selectMimeType(supported: string[]): string {
  return PREFERRED_MIME_TYPES.find((type) => supported.includes(type)) ?? '';
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function startRecording(input: {
  dayId: string;
  stage: Stage;
  kind: RecordingKind;
}): Promise<RecordingHandle> {
  const mediaDevices = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
  if (!mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    throw new Error('Recording is not supported');
  }

  const stream = await mediaDevices.getUserMedia({ audio: true });
  const supported = PREFERRED_MIME_TYPES.filter((type) =>
    typeof MediaRecorder.isTypeSupported === 'function'
      ? MediaRecorder.isTypeSupported(type)
      : false,
  );
  const mimeType = selectMimeType([...supported]);
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  const startedAt = Date.now();
  let cancelled = false;

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  recorder.start();

  const stopTracks = () => {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  };

  return {
    stop: () =>
      new Promise<StoredRecording>((resolve) => {
        if (cancelled) {
          resolve({
            id: makeId(),
            dayId: input.dayId,
            stage: input.stage,
            kind: input.kind,
            createdAt: new Date().toISOString(),
            durationMs: 0,
            mimeType: recorder.mimeType || mimeType || 'audio/webm',
            blob: new Blob([], { type: recorder.mimeType || mimeType || 'audio/webm' }),
          });
          return;
        }

        let settled = false;
        const finish = () => {
          if (settled) {
            return;
          }
          settled = true;
          stopTracks();
          const type = recorder.mimeType || mimeType || 'audio/webm';
          resolve({
            id: makeId(),
            dayId: input.dayId,
            stage: input.stage,
            kind: input.kind,
            createdAt: new Date().toISOString(),
            durationMs: Date.now() - startedAt,
            mimeType: type,
            blob: new Blob(chunks, { type }),
          });
        };

        recorder.onstop = finish;
        if (recorder.state === 'inactive') {
          finish();
        } else {
          recorder.stop();
        }
      }),

    cancel: () => {
      cancelled = true;
      recorder.onstop = null;
      recorder.ondataavailable = null;
      stopTracks();
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    },
  };
}
