const COUNTDOWN_SECONDS = 3;
const QUESTION_SECONDS = 10;
const REVEAL_SECONDS = 3;
const GRACE_SECONDS = 1;

const CYCLE_SECONDS = QUESTION_SECONDS + REVEAL_SECONDS; // 13s per question

export interface QuestionWindow {
  start: Date;
  end: Date;
}

export function getQuestionWindow(
  startedAt: Date,
  questionNumber: number
): QuestionWindow {
  const offsetMs =
    (COUNTDOWN_SECONDS + (questionNumber - 1) * CYCLE_SECONDS) * 1000;
  const start = new Date(startedAt.getTime() + offsetMs);
  const end = new Date(start.getTime() + QUESTION_SECONDS * 1000);
  return { start, end };
}

export function isAnswerInTime(
  startedAt: Date,
  questionNumber: number,
  answeredAt: Date
): boolean {
  const window = getQuestionWindow(startedAt, questionNumber);
  const deadlineWithGrace = new Date(
    window.end.getTime() + GRACE_SECONDS * 1000
  );
  return answeredAt >= window.start && answeredAt <= deadlineWithGrace;
}
