import { del, get, keys, set } from 'idb-keyval';
import type { StoredRecording } from './recorder';

const PREFIX = 'recording:';

function recordingKey(id: string): string {
  return `${PREFIX}${id}`;
}

export async function putRecording(rec: StoredRecording): Promise<void> {
  await set(recordingKey(rec.id), rec);
}

export async function listRecordings(dayId?: string): Promise<StoredRecording[]> {
  const allKeys = await keys();
  const recordings = await Promise.all(
    allKeys
      .filter((key): key is string => typeof key === 'string' && key.startsWith(PREFIX))
      .map((key) => get<StoredRecording>(key)),
  );

  return recordings
    .filter((recording): recording is StoredRecording => Boolean(recording))
    .filter((recording) => !dayId || recording.dayId === dayId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteRecording(id: string): Promise<void> {
  await del(recordingKey(id));
}

export async function clearOldPracticeRecordings(now: Date, days = 30): Promise<number> {
  const cutoff = now.getTime() - days * 86_400_000;
  const old = (await listRecordings()).filter(
    (recording) =>
      recording.kind === 'practice' && new Date(recording.createdAt).getTime() < cutoff,
  );

  await Promise.all(old.map((recording) => deleteRecording(recording.id)));
  return old.length;
}

export async function clearAllRecordings(): Promise<void> {
  const allKeys = await keys();
  await Promise.all(
    allKeys
      .filter((key): key is string => typeof key === 'string' && key.startsWith(PREFIX))
      .map((key) => del(key)),
  );
}
