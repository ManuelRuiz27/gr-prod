import { useCallback, useEffect, useRef, useState } from 'react';
import type { AllocationInput, SeatingGateway, SeatingSnapshot } from './presetSeatingTypes';
import { seatingRequestError } from './presetSeatingGateway';

export function usePresetSeating(gateway: SeatingGateway, eventId: string, role: 'admin' | 'graduate') {
  const [snapshot, setSnapshot] = useState<SeatingSnapshot | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const mounted = useRef(false);
  const writing = useRef(false);
  const reading = useRef<AbortController | null>(null);
  const mutation = useRef<AbortController | null>(null);
  const retry = useRef<{ body: string; key: string } | null>(null);
  const refresh = useCallback(async () => {
    reading.current?.abort();
    const controller = new AbortController();
    reading.current = controller;
    try {
      const result = await gateway.load(eventId, role, controller.signal);
      if (!mounted.current || controller.signal.aborted) return;
      setSnapshot(result);
      setError('');
    } catch (failure) {
      if (mounted.current && !controller.signal.aborted) setError(seatingRequestError(failure).message);
    } finally {
      if (reading.current === controller) reading.current = null;
    }
  }, [gateway, eventId, role]);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    if (gateway.mode === 'preview') return () => { mounted.current = false; reading.current?.abort(); };
    const poll = () => {
      if (document.visibilityState !== 'hidden' && !writing.current && !reading.current) void refresh();
    };
    const timer = window.setInterval(poll, 5000);
    window.addEventListener('focus', poll);
    document.addEventListener('visibilitychange', poll);
    return () => {
      mounted.current = false;
      reading.current?.abort();
      mutation.current?.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', poll);
      document.removeEventListener('visibilitychange', poll);
    };
  }, [gateway.mode, refresh]);

  const save = async (input: AllocationInput) => {
    if (writing.current || gateway.mode !== 'http' || role !== 'graduate' || error) return false;
    writing.current = true;
    setSaving(true);
    reading.current?.abort();
    const body = JSON.stringify(input);
    if (retry.current?.body !== body) retry.current = { body, key: crypto.randomUUID() };
    const controller = new AbortController();
    mutation.current = controller;
    try {
      const result = await gateway.save(eventId, input, retry.current.key, controller.signal);
      if (!mounted.current || controller.signal.aborted) return false;
      setSnapshot(result);
      retry.current = null;
      setError('');
      // The mutation response is authoritative; refresh other current eligibility facts too.
      void refresh();
      return true;
    } catch (failure) {
      if (!mounted.current || controller.signal.aborted) return false;
      const result = seatingRequestError(failure);
      await refresh();
      if (mounted.current) setError(result.message);
      return false;
    } finally {
      writing.current = false;
      if (mounted.current) setSaving(false);
    }
  };
  return { snapshot, error, saving, refresh, save };
}
