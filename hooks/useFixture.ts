"use client";

import { useState, useCallback } from "react";

export type FixtureState =
  | "waiting"
  | "ready"
  | "playing"
  | "result";

interface QuestionData {
  question_number: number;
  question_text: string;
  options: string[];
  activeUserId: string;
  isYourTurn: boolean;
}

interface AnswerResult {
  correct: boolean;
  correct_answer: number;
}

interface FixtureScore {
  home: number;
  away: number;
}

export function useFixture(fixtureId: string, userId: string) {
  const [state, setState] = useState<FixtureState>("waiting");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [lastAnswer, setLastAnswer] = useState<AnswerResult | null>(null);
  const [score, setScore] = useState<FixtureScore>({ home: 0, away: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  const generateQuestions = useCallback(async () => {
    const res = await fetch(`/api/fixtures/${fixtureId}/generate-questions`, {
      method: "POST",
    });
    if (res.ok) {
      setQuestionsReady(true);
    }
  }, [fixtureId]);

  const startFixture = useCallback(async () => {
    const res = await fetch(`/api/fixtures/${fixtureId}/start`, {
      method: "POST",
    });
    const data = await res.json();
    setStartedAt(data.started_at);
    setState("playing");
    return data.started_at;
  }, [fixtureId]);

  const fetchQuestion = useCallback(
    async (questionNumber: number) => {
      const res = await fetch(
        `/api/fixtures/${fixtureId}/question/${questionNumber}`
      );
      if (res.ok) {
        const data = await res.json();
        setCurrentQuestion(data);
        setSelectedAnswer(null);
        setLastAnswer(null);
      }
    },
    [fixtureId]
  );

  const submitAnswer = useCallback(
    async (questionNumber: number, answer: number) => {
      setSelectedAnswer(answer);

      try {
        const res = await fetch(`/api/fixtures/${fixtureId}/submit-answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question_number: questionNumber, answer }),
        });

        const data = await res.json();

        if (res.ok) {
          setLastAnswer(data);

          // Update score
          if (data.correct) {
            setScore((prev) => {
              const isHomeTurn = questionNumber % 2 !== 0;
              return isHomeTurn
                ? { ...prev, home: prev.home + 1 }
                : { ...prev, away: prev.away + 1 };
            });
          }
        } else {
          console.error("Submit answer failed:", data);
        }
      } catch (err) {
        console.error("Submit answer error:", err);
      }
    },
    [fixtureId]
  );

  const completeFixture = useCallback(async () => {
    const res = await fetch(`/api/fixtures/${fixtureId}/complete`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setFinalResult(data);
      setState("result");
    }
  }, [fixtureId]);

  return {
    state,
    setState,
    startedAt,
    setStartedAt,
    currentQuestion,
    lastAnswer,
    score,
    selectedAnswer,
    questionsReady,
    finalResult,
    generateQuestions,
    startFixture,
    fetchQuestion,
    submitAnswer,
    completeFixture,
  };
}
