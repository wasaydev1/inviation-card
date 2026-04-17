import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface TypingState {
  text: string;
  input: string;
  startedAt: number | null;
  finishedAt: number | null;
  errors: number;
  totalKeystrokes: number;
}

export interface TypingMetrics {
  wpm: number;
  accuracy: number;
  progress: number; // 0..1
  elapsedSec: number;
  isFinished: boolean;
  isStarted: boolean;
}

export function useTypingEngine(text: string) {
  const [state, setState] = useState<TypingState>({
    text,
    input: "",
    startedAt: null,
    finishedAt: null,
    errors: 0,
    totalKeystrokes: 0,
  });
  const [, force] = useState(0);
  const tickRef = useRef<number | null>(null);

  // Reset when text changes
  useEffect(() => {
    setState({
      text,
      input: "",
      startedAt: null,
      finishedAt: null,
      errors: 0,
      totalKeystrokes: 0,
    });
  }, [text]);

  // Live ticker for WPM while typing
  useEffect(() => {
    if (state.startedAt && !state.finishedAt) {
      tickRef.current = window.setInterval(() => force((n) => n + 1), 200);
      return () => {
        if (tickRef.current) window.clearInterval(tickRef.current);
      };
    }
  }, [state.startedAt, state.finishedAt]);

  const handleChange = useCallback((value: string) => {
    setState((s) => {
      if (s.finishedAt) return s;
      const startedAt = s.startedAt ?? (value.length > 0 ? Date.now() : null);
      // count new errors only on growth
      let errors = s.errors;
      let totalKeystrokes = s.totalKeystrokes;
      if (value.length > s.input.length) {
        const added = value.length - s.input.length;
        totalKeystrokes += added;
        for (let i = s.input.length; i < value.length; i++) {
          if (value[i] !== s.text[i]) errors += 1;
        }
      }
      const trimmed = value.slice(0, s.text.length);
      const finishedAt = trimmed.length === s.text.length ? Date.now() : null;
      return { ...s, input: trimmed, startedAt, finishedAt, errors, totalKeystrokes };
    });
  }, []);

  const reset = useCallback((newText?: string) => {
    setState({
      text: newText ?? text,
      input: "",
      startedAt: null,
      finishedAt: null,
      errors: 0,
      totalKeystrokes: 0,
    });
  }, [text]);

  const metrics: TypingMetrics = useMemo(() => {
    const now = state.finishedAt ?? Date.now();
    const elapsedSec = state.startedAt ? Math.max((now - state.startedAt) / 1000, 0.001) : 0;
    const correctChars = countCorrect(state.input, state.text);
    const wpm = elapsedSec > 0 ? Math.round((correctChars / 5) / (elapsedSec / 60)) : 0;
    const accuracy =
      state.totalKeystrokes > 0
        ? Math.max(0, Math.min(100, ((state.totalKeystrokes - state.errors) / state.totalKeystrokes) * 100))
        : 100;
    return {
      wpm,
      accuracy: Math.round(accuracy * 10) / 10,
      progress: state.text.length ? state.input.length / state.text.length : 0,
      elapsedSec,
      isFinished: !!state.finishedAt,
      isStarted: !!state.startedAt,
    };
  }, [state]);

  return { state, metrics, handleChange, reset };
}

function countCorrect(input: string, text: string): number {
  let n = 0;
  for (let i = 0; i < input.length; i++) if (input[i] === text[i]) n += 1;
  return n;
}
