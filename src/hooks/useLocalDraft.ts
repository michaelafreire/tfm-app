import { useCallback, useEffect, useRef, useState } from 'react';

export type LocalSession = {
  participantCode: string;
  groupNumber: number;
  phase: 'pre' | 'calibrationa' | 'experiencea' | 'break' | 'calibrationb' | 'experienceb' | 'post';
};

const LOCAL_SESSION_KEY = 'tfm-current-session';

export function readLocalDraft<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const rawDraft = window.localStorage.getItem(key);
    return rawDraft ? ({ ...fallback, ...JSON.parse(rawDraft) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readLocalSession(): LocalSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawSession = window.localStorage.getItem(LOCAL_SESSION_KEY);
    return rawSession ? (JSON.parse(rawSession) as LocalSession) : null;
  } catch {
    return null;
  }
}

export function writeLocalSession(session: LocalSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
}

export function clearLocalDraft(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function useLocalDraft<T>(key: string, draft: T, shouldSave: boolean) {
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!shouldSave) return;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(draft));
      setHasLocalChanges(true);
    } catch {
      // Local recovery is best-effort only; checkpoint saves still handle the canonical submission.
    }
  }, [draft, key, shouldSave]);

  useEffect(() => {
    if (!hasLocalChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasLocalChanges]);

  const clearDraft = useCallback(() => {
    clearLocalDraft(key);
    setHasLocalChanges(false);
    hasMountedRef.current = false;
  }, [key]);

  return { clearDraft, hasLocalChanges };
}
