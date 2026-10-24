import 'fake-indexeddb/auto';
import { expect, it } from 'vitest';
import { clearAllRecordings, clearOldPracticeRecordings, listRecordings, putRecording } from './recordingStore';
import type { StoredRecording } from './recorder';
import { selectMimeType } from './recorder';

const rec = (id: string, kind: 'practice' | 'benchmark', createdAt: string): StoredRecording => ({
  id, dayId: 'w01d01', stage: 'shadow', kind, createdAt, durationMs: 1000,
  mimeType: 'audio/webm', blob: new Blob(['x']),
});

it('selects the first supported mime type', () => {
  expect(selectMimeType(['audio/mp4', 'audio/webm;codecs=opus'])).toBe('audio/webm;codecs=opus');
  expect(selectMimeType(['audio/mp4'])).toBe('audio/mp4');
  expect(selectMimeType([])).toBe('');
});

it('stores recordings and prunes old practice clips but keeps benchmarks', async () => {
  await putRecording(rec('old-practice', 'practice', '2026-09-01T00:00:00.000Z'));
  await putRecording(rec('old-benchmark', 'benchmark', '2026-09-01T00:00:00.000Z'));
  await putRecording(rec('new-practice', 'practice', '2026-10-20T00:00:00.000Z'));

  expect(await clearOldPracticeRecordings(new Date('2026-10-24T00:00:00.000Z'), 30)).toBe(1);
  const kept = await listRecordings('w01d01');
  expect(kept.map((r) => r.id).sort()).toEqual(['new-practice', 'old-benchmark']);

  await clearAllRecordings();
  expect(await listRecordings()).toHaveLength(0);
});
