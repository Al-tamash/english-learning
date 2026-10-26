import { z } from 'zod';
import { getAllDays } from '../content';
import type { AppData } from './appStore';

export const BACKUP_FORMAT = 'bol-backup';
export const BACKUP_VERSION = 1;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: AppData;
}

const stageSchema = z.enum(['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap']);

const dayProgressSchema = z.object({
  dayId: z.string().min(1),
  status: z.enum(['not_started', 'in_progress', 'done']),
  stagesCompleted: z.array(stageSchema),
  speakingSeconds: z.number().finite().nonnegative(),
  selfRating: z.number().min(0).max(5).nullable(),
  missionDone: z.boolean(),
  completedAt: z.string().nullable(),
  updatedAt: z.string(),
});

const srsCardSchema = z.object({
  itemId: z.string().min(1),
  ease: z.number().finite(),
  intervalDays: z.number().finite().nonnegative(),
  dueAt: z.string(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  lastRating: z.enum(['again', 'hard', 'good', 'easy']).nullable(),
  updatedAt: z.string(),
});

const settingsSchema = z.object({
  ttsVoiceUri: z.string().nullable(),
  ttsRate: z.number().finite(),
  speechCheckEnabled: z.boolean(),
  speechConsent: z.enum(['unset', 'granted', 'denied']),
});

const streakSchema = z.object({
  current: z.number().int().nonnegative(),
  best: z.number().int().nonnegative(),
  lastCompletedDate: z.string().nullable(),
});

const sessionSchema = z.object({
  dayId: z.string().min(1),
  mode: z.enum(['full', 'short']),
  stage: stageSchema,
  stagesCompleted: z.array(stageSchema),
  done: z.boolean(),
  startedAt: z.string(),
  speakingSeconds: z.number().finite().nonnegative(),
});

const appDataSchema = z.object({
  localProfileId: z.string().min(1),
  days: z.record(dayProgressSchema),
  srs: z.record(srsCardSchema),
  settings: settingsSchema,
  streak: streakSchema,
  activeSession: sessionSchema.nullable(),
});

const backupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.string(),
  data: appDataSchema,
});

export function pickAppData(state: AppData): AppData {
  return {
    localProfileId: state.localProfileId,
    days: state.days,
    srs: state.srs,
    settings: state.settings,
    streak: state.streak,
    activeSession: state.activeSession,
  };
}

export function createBackup(data: AppData, now = new Date()): BackupFile {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data: pickAppData(data),
  };
}

export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2);
}

export function backupFilename(now = new Date()): string {
  return `bol-backup-${now.toISOString().slice(0, 10)}.json`;
}

export function parseBackup(text: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Backup file valid JSON nahi hai.');
  }

  const result = backupSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('Ye valid Bol backup file nahi hai.');
  }

  const knownDays = new Set(getAllDays().map((day) => day.id));
  for (const [dayId, progress] of Object.entries(result.data.data.days)) {
    if (!knownDays.has(dayId) || progress.dayId !== dayId) {
      throw new Error('Backup me unknown day mila.');
    }
  }
  if (
    result.data.data.activeSession &&
    !knownDays.has(result.data.data.activeSession.dayId)
  ) {
    throw new Error('Backup me unknown active session mila.');
  }

  return result.data.data;
}

export function downloadBackup(data: AppData, now = new Date()): void {
  const blob = new Blob([serializeBackup(createBackup(data, now))], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFilename(now);
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
