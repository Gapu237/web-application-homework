import { useCallback, useEffect, useRef, useState } from "react";

interface UseGhostingTimerOptions {
  timeoutMs?: number;
  onGhosted: () => void;
}

export function useGhostingTimer({
  timeoutMs = 5000,
  onGhosted,
}: UseGhostingTimerOptions) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [remainingMs, setRemainingMs] = useState(timeoutMs);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const onGhostedRef = useRef(onGhosted);

  useEffect(() => {
    onGhostedRef.current = onGhosted;
  }, [onGhosted]);

  const cancelWaiting = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    controllerRef.current?.abort();
    controllerRef.current = null;

    setIsWaiting(false);
    setRemainingMs(timeoutMs);
  }, [timeoutMs]);

  const sendMessage = useCallback(() => {
    cancelWaiting();

    const controller = new AbortController();
    controllerRef.current = controller;

    const startTime = Date.now();
    const deadline = startTime + timeoutMs;

    setRemainingMs(timeoutMs);
    setIsWaiting(true);

    timerRef.current = setInterval(() => {
      if (controller.signal.aborted) return;

      const remaining = Math.max(0, deadline - Date.now());
      setRemainingMs(remaining);

      if (remaining <= 0) {
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        controller.abort();
        controllerRef.current = null;

        setIsWaiting(false);
        onGhostedRef.current();
      }
    }, 100);

    return controller;
  }, [cancelWaiting, timeoutMs]);

  const receiveReply = useCallback(() => {
    cancelWaiting();
  }, [cancelWaiting]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }

      controllerRef.current?.abort();
    };
  }, []);

  return {
    isWaiting,
    remainingMs,
    sendMessage,
    receiveReply,
    cancelWaiting,
  };
}