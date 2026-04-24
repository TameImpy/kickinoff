"use client";

import { useState, useEffect, useCallback } from "react";

const COUNTDOWN_SECONDS = 3;
const QUESTION_SECONDS = 10;
const REVEAL_SECONDS = 3;
const CYCLE_SECONDS = QUESTION_SECONDS + REVEAL_SECONDS;

export type FixturePhase =
  | "countdown"
  | "question"
  | "reveal"
  | "finished";

interface TimerState {
  phase: FixturePhase;
  questionNumber: number;
  secondsLeft: number;
}

export function useTimer(startedAt: string | null) {
  const [state, setState] = useState<TimerState>({
    phase: "countdown",
    questionNumber: 1,
    secondsLeft: COUNTDOWN_SECONDS,
  });

  const calculate = useCallback(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const elapsed = (now - start) / 1000;

    // Countdown phase (first 3 seconds)
    if (elapsed < COUNTDOWN_SECONDS) {
      setState({
        phase: "countdown",
        questionNumber: 1,
        secondsLeft: Math.ceil(COUNTDOWN_SECONDS - elapsed),
      });
      return;
    }

    const afterCountdown = elapsed - COUNTDOWN_SECONDS;

    // Total time for all 10 questions
    const totalGameTime = 10 * CYCLE_SECONDS;
    if (afterCountdown >= totalGameTime) {
      setState({
        phase: "finished",
        questionNumber: 10,
        secondsLeft: 0,
      });
      return;
    }

    const currentCycle = Math.floor(afterCountdown / CYCLE_SECONDS);
    const withinCycle = afterCountdown - currentCycle * CYCLE_SECONDS;
    const questionNumber = Math.min(currentCycle + 1, 10);

    if (withinCycle < QUESTION_SECONDS) {
      setState({
        phase: "question",
        questionNumber,
        secondsLeft: Math.ceil(QUESTION_SECONDS - withinCycle),
      });
    } else {
      setState({
        phase: "reveal",
        questionNumber,
        secondsLeft: Math.ceil(CYCLE_SECONDS - withinCycle),
      });
    }
  }, [startedAt]);

  useEffect(() => {
    if (!startedAt) return;

    calculate();
    const interval = setInterval(calculate, 100);
    return () => clearInterval(interval);
  }, [startedAt, calculate]);

  return state;
}
