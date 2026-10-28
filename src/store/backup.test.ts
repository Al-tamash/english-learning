import { describe, expect, it } from 'vitest';
import { createInitialState } from './appStore';
import { BACKUP_FORMAT, BACKUP_VERSION, createBackup, parseBackup, serializeBackup } from './backup';

const now = new Date('2026-10-26T09:00:00');

function sampleData() {
  const data = createInitialState();
  data.days.w01d01 = {
    dayId: 'w01d01',
    status: 'done',
    stagesCompleted: ['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap'],
    speakingSeconds: 900,
    selfRating: 4,
    missionDone: true,
    completedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  data.days.w02d01 = {
    dayId: 'w02d01',
    status: 'done',
    stagesCompleted: ['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap'],
    speakingSeconds: 1200,
    selfRating: 5,
    missionDone: false,
    completedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  return data;
}

describe('backup file', () => {
  it('round-trips progress through export and import', () => {
    const data = sampleData();
    const parsed = parseBackup(serializeBackup(createBackup(data, now)));

    expect(parsed.localProfileId).toBe(data.localProfileId);
    expect(parsed.days.w01d01.status).toBe('done');
    expect(parsed.days.w01d01.selfRating).toBe(4);
    expect(parsed.days.w02d01.status).toBe('done');
    expect(parsed.days.w02d01.selfRating).toBe(5);
    expect(parsed.streak).toEqual(data.streak);
  });

  it('rejects corrupt JSON', () => {
    expect(() => parseBackup('{bad json')).toThrow('valid JSON');
  });

  it('rejects a file that is not a Bol backup', () => {
    expect(() =>
      parseBackup(JSON.stringify({ format: 'something-else', version: 1, data: {} })),
    ).toThrow('valid Bol backup');
  });

  it('rejects a backup with an unknown day', () => {
    const backup = createBackup(sampleData(), now);
    backup.data.days.w99d99 = backup.data.days.w01d01;
    expect(() => parseBackup(serializeBackup(backup))).toThrow('unknown day');
  });

  it('uses the expected format and version', () => {
    const backup = createBackup(sampleData(), now);
    expect(backup.format).toBe(BACKUP_FORMAT);
    expect(backup.version).toBe(BACKUP_VERSION);
    expect(backup.exportedAt).toBe(now.toISOString());
  });
});
