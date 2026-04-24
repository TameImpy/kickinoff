"use client";

import { useEffect, useRef } from "react";
import { useFixture } from "@/hooks/useFixture";
import { useTimer } from "@/hooks/useTimer";
import { useVideoRoom } from "@/hooks/useVideoRoom";
import dynamic from "next/dynamic";
import Link from "next/link";

const VideoPanel = dynamic(
  () => import("@/components/fixture/video-panel"),
  { ssr: false }
);

interface FixtureRoomProps {
  fixtureId: string;
  leagueId: string;
  userId: string;
  isHome: boolean;
  homeName: string;
  awayName: string;
  leagueName: string;
  inviteCode: string;
  initialStartedAt: string | null;
  initialStatus: string;
}

export default function FixtureRoom({
  fixtureId,
  leagueId,
  userId,
  isHome,
  homeName,
  awayName,
  leagueName,
  inviteCode,
  initialStartedAt,
  initialStatus,
}: FixtureRoomProps) {
  const fixture = useFixture(fixtureId, userId);
  const timer = useTimer(fixture.startedAt);
  const video = useVideoRoom(fixtureId);
  const lastQuestionRef = useRef(0);

  // Connect video + generate questions on mount
  useEffect(() => {
    fixture.generateQuestions();
    video.connect();
  }, []);

  // Restore started_at if already started
  useEffect(() => {
    if (initialStartedAt) {
      fixture.setStartedAt(initialStartedAt);
      fixture.setState("playing");
    }
  }, [initialStartedAt]);

  // Fetch question when question number changes
  useEffect(() => {
    if (
      timer.phase === "question" &&
      timer.questionNumber !== lastQuestionRef.current
    ) {
      lastQuestionRef.current = timer.questionNumber;
      fixture.fetchQuestion(timer.questionNumber);
    }
  }, [timer.phase, timer.questionNumber]);

  // Complete fixture when finished
  useEffect(() => {
    if (timer.phase === "finished" && fixture.state === "playing") {
      fixture.completeFixture();
    }
  }, [timer.phase, fixture.state]);

  // RESULT screen
  if (fixture.state === "result" && fixture.finalResult) {
    const { homeScore, awayScore, result } = fixture.finalResult;
    const userWon = isHome
      ? result.homeResult === "win"
      : result.awayResult === "win";
    const isDraw = result.homeResult === "draw";
    const userLost = isHome
      ? result.homeResult === "loss"
      : result.awayResult === "loss";

    const shareText = userWon
      ? `Just beat ${isHome ? awayName : homeName} ${homeScore}-${awayScore} on Kickin' Off! Get involved: kickinoff.co.uk/join/${inviteCode}`
      : isDraw
        ? `${homeScore}-${awayScore} draw with ${isHome ? awayName : homeName} on Kickin' Off. Couldn't separate us. kickinoff.co.uk/join/${inviteCode}`
        : "";

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <p className="text-xs font-[var(--font-space-grotesk)] font-bold text-white/50 uppercase tracking-widest mb-4">
          FULL TIME
        </p>
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <p className="font-[var(--font-space-grotesk)] font-bold text-lg mb-1">
              {homeName}
            </p>
            <p className="font-[var(--font-space-grotesk)] text-5xl font-black text-primary">
              {homeScore}
            </p>
          </div>
          <span className="text-white/30 text-2xl">-</span>
          <div className="text-center">
            <p className="font-[var(--font-space-grotesk)] font-bold text-lg mb-1">
              {awayName}
            </p>
            <p className="font-[var(--font-space-grotesk)] text-5xl font-black text-primary">
              {awayScore}
            </p>
          </div>
        </div>
        <p className="font-[var(--font-space-grotesk)] text-lg font-bold mb-8 text-[#d4c0d7]">
          {userWon && `${isHome ? homeName : awayName} wins! 3 points in ${leagueName}`}
          {isDraw && `It's a draw! 1 point each`}
          {userLost && `${isHome ? awayName : homeName} wins! 3 points in ${leagueName}`}
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {!userLost && shareText && (
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ text: shareText });
                } else {
                  navigator.clipboard.writeText(shareText);
                }
              }}
              className="w-full bg-primary text-black font-[var(--font-space-grotesk)] font-bold py-4 button-clip hover:shadow-[0_0_15px_#00e676] transition-all"
            >
              SHARE RESULT
            </button>
          )}
          <Link
            href={`/league/${leagueId}`}
            className="w-full border border-[#262626] text-white/50 font-[var(--font-space-grotesk)] font-bold py-4 text-center hover:bg-white/5 transition-all"
          >
            BACK TO LEAGUE
          </Link>
        </div>
      </div>
    );
  }

  // WAITING / READY screen
  if (fixture.state === "waiting") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        {/* Video feeds (top half) */}
        <div className="w-full mb-8">
          {video.token && video.livekitUrl ? (
            <VideoPanel
              token={video.token}
              livekitUrl={video.livekitUrl}
              homeName={homeName}
              awayName={awayName}
            />
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 bg-[#1A1A1A] border border-[#262626] aspect-video flex items-center justify-center">
                <p className="text-xs font-[var(--font-space-grotesk)] text-white/30">
                  Connecting video...
                </p>
              </div>
              <div className="flex-1 bg-[#1A1A1A] border border-[#262626] aspect-video flex items-center justify-center">
                <p className="text-xs font-[var(--font-space-grotesk)] text-white/30">
                  Waiting...
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-[#d4c0d7] mb-6">
          {fixture.questionsReady ? "Questions ready!" : "Generating questions..."}
        </p>

        <button
          onClick={fixture.startFixture}
          disabled={!fixture.questionsReady}
          className="bg-primary text-black font-[var(--font-space-grotesk)] font-bold text-xl py-5 px-10 button-clip hover:shadow-[0_0_20px_#00e676] transition-all disabled:opacity-50"
        >
          START MATCH
        </button>
      </div>
    );
  }

  // PLAYING screen (countdown / question / reveal)
  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Timer bar */}
      <div className="w-full h-1 bg-[#262626] mb-4">
        <div
          className={`h-full transition-all duration-100 ${
            timer.phase === "question" && timer.secondsLeft <= 3
              ? "bg-accent"
              : "bg-primary"
          }`}
          style={{
            width:
              timer.phase === "question"
                ? `${(timer.secondsLeft / 10) * 100}%`
                : "100%",
          }}
        />
      </div>

      {/* Score */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="font-[var(--font-space-grotesk)] font-bold text-sm">
            {homeName}
          </span>
          <span className="font-[var(--font-space-grotesk)] font-black text-2xl text-primary">
            {fixture.score.home}
          </span>
        </div>
        <span className="text-xs font-[var(--font-space-grotesk)] font-bold text-white/30 uppercase tracking-widest">
          Q{timer.questionNumber}/10
        </span>
        <div className="flex items-center gap-2">
          <span className="font-[var(--font-space-grotesk)] font-black text-2xl text-primary">
            {fixture.score.away}
          </span>
          <span className="font-[var(--font-space-grotesk)] font-bold text-sm">
            {awayName}
          </span>
        </div>
      </div>

      {/* Video feeds (top half) */}
      <div className="mb-4">
        {video.token && video.livekitUrl ? (
          <VideoPanel
            token={video.token}
            livekitUrl={video.livekitUrl}
            homeName={homeName}
            awayName={awayName}
          />
        ) : (
          <div className="flex gap-2">
            <div className="flex-1 bg-[#1A1A1A] border border-[#262626] aspect-[4/3] flex items-center justify-center">
              <span className="font-[var(--font-space-grotesk)] font-bold text-3xl text-primary/30">
                {homeName[0]}
              </span>
            </div>
            <div className="flex-1 bg-[#1A1A1A] border border-[#262626] aspect-[4/3] flex items-center justify-center">
              <span className="font-[var(--font-space-grotesk)] font-bold text-3xl text-accent/30">
                {awayName[0]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quiz area (bottom half) */}
      <div className="flex-1 flex flex-col">
        {/* Countdown */}
        {timer.phase === "countdown" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="font-[var(--font-space-grotesk)] text-8xl font-black text-primary">
                {timer.secondsLeft}
              </p>
              <p className="font-[var(--font-space-grotesk)] text-lg font-bold text-[#d4c0d7] mt-2">
                {timer.secondsLeft === 1 ? "KICKIN' OFF!" : "GET READY"}
              </p>
            </div>
          </div>
        )}

        {/* Question */}
        {timer.phase === "question" && fixture.currentQuestion && (
          <div className="flex-1 flex flex-col">
            {/* Turn indicator */}
            <div className="text-center mb-3">
              <span
                className={`text-xs font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest ${
                  fixture.currentQuestion.isYourTurn
                    ? "text-primary"
                    : "text-white/30"
                }`}
              >
                {fixture.currentQuestion.isYourTurn
                  ? "YOUR TURN"
                  : `${fixture.currentQuestion.activeUserId === userId ? "" : isHome ? awayName : homeName}'S TURN`}
              </span>
            </div>

            {/* Timer */}
            <div className="text-center mb-3">
              <span
                className={`font-[var(--font-space-grotesk)] text-3xl font-black ${
                  timer.secondsLeft <= 3 ? "text-accent" : "text-primary"
                }`}
              >
                {timer.secondsLeft}
              </span>
            </div>

            {/* Question text */}
            <p className="font-[var(--font-spline-sans)] text-lg text-center mb-6">
              {fixture.currentQuestion.question_text}
            </p>

            {/* Answer options */}
            <div className="grid grid-cols-1 gap-2">
              {fixture.currentQuestion.options.map((option, i) => {
                const isSelected = fixture.selectedAnswer === i;
                const canAnswer =
                  fixture.currentQuestion!.isYourTurn &&
                  fixture.selectedAnswer === null;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (canAnswer) {
                        fixture.submitAnswer(
                          fixture.currentQuestion!.question_number,
                          i
                        );
                      }
                    }}
                    disabled={!canAnswer}
                    className={`w-full text-left p-4 font-[var(--font-spline-sans)] transition-all ${
                      isSelected
                        ? "bg-primary/20 border-2 border-primary"
                        : canAnswer
                          ? "bg-[#1A1A1A] border border-[#262626] hover:border-primary active:scale-[0.98]"
                          : "bg-[#1A1A1A] border border-[#262626] opacity-60"
                    }`}
                  >
                    <span className="font-[var(--font-space-grotesk)] font-bold text-primary mr-3">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reveal */}
        {timer.phase === "reveal" && fixture.currentQuestion && (
          <div className="flex-1 flex flex-col">
            <p className="font-[var(--font-spline-sans)] text-lg text-center mb-6">
              {fixture.currentQuestion.question_text}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {fixture.currentQuestion.options.map((option, i) => {
                const isCorrect = fixture.lastAnswer?.correct_answer === i;
                const wasSelected = fixture.selectedAnswer === i;
                const wasWrong = wasSelected && !isCorrect;

                return (
                  <div
                    key={i}
                    className={`w-full text-left p-4 font-[var(--font-spline-sans)] ${
                      isCorrect
                        ? "bg-primary/20 border-2 border-primary"
                        : wasWrong
                          ? "bg-[#93000a]/20 border-2 border-[#ffb4ab]"
                          : "bg-[#1A1A1A] border border-[#262626] opacity-40"
                    }`}
                  >
                    <span className="font-[var(--font-space-grotesk)] font-bold mr-3">
                      {isCorrect ? "✓" : wasWrong ? "✗" : String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </div>
                );
              })}
            </div>

            {fixture.lastAnswer && (
              <p className="text-center mt-4 font-[var(--font-space-grotesk)] font-bold">
                {fixture.lastAnswer.correct ? (
                  <span className="text-primary">CORRECT!</span>
                ) : fixture.currentQuestion.isYourTurn ? (
                  <span className="text-[#ffb4ab]">WRONG!</span>
                ) : null}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
