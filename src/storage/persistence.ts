export type PersistenceStatus =
  | 'checking'
  | 'persisted'
  | 'best-effort'
  | 'unsupported'
  | 'error';

export async function getPersistenceStatus(): Promise<PersistenceStatus> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persisted) {
    return 'unsupported';
  }
  try {
    return (await navigator.storage.persisted()) ? 'persisted' : 'best-effort';
  } catch {
    return 'error';
  }
}

export async function requestPersistence(): Promise<PersistenceStatus> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return 'unsupported';
  }
  try {
    return (await navigator.storage.persist()) ? 'persisted' : 'best-effort';
  } catch {
    return 'error';
  }
}
