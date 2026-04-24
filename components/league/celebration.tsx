"use client";

import { useEffect, useState, useRef } from "react";

interface CelebrationProps {
  leagueId: string;
  leagueName: string;
}

interface RecapData {
  text: string;
  audio: string;
  winner: string;
}

export default function Celebration({ leagueId, leagueName }: CelebrationProps) {
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if already dismissed this session
    const key = `celebration-${leagueId}`;
    if (sessionStorage.getItem(key)) {
      setDismissed(true);
      setLoading(false);
      return;
    }

    fetch(`/api/leagues/${leagueId}/recap`)
      .then((res) => res.json())
      .then((data) => {
        if (data.text) {
          setRecap(data);
          // Auto-play audio
          if (data.audio) {
            const audio = new Audio(data.audio);
            audioRef.current = audio;
            audio.play().catch(() => {});
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [leagueId]);

  const handleDismiss = () => {
    sessionStorage.setItem(`celebration-${leagueId}`, "true");
    audioRef.current?.pause();
    setDismissed(true);
  };

  if (dismissed || loading) return null;
  if (!recap) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0D0D0D]/95 flex items-center justify-center p-5">
      {/* Confetti-style decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["#00e676", "#BD00FF", "#00dbe9", "#c3f400"][
                i % 4
              ],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        <p className="text-xs font-[var(--font-space-grotesk)] font-bold text-white/50 uppercase tracking-widest mb-2">
          LEAGUE COMPLETE
        </p>
        <h1 className="font-[var(--font-space-grotesk)] text-4xl font-black text-primary italic mb-2">
          {recap.winner}
        </h1>
        <p className="font-[var(--font-space-grotesk)] text-lg font-bold text-[#d4c0d7] mb-8">
          wins {leagueName}!
        </p>

        {/* Season Recap */}
        <div className="bg-[#1A1A1A] border border-[#262626] p-6 mb-8 text-left">
          <p className="text-xs font-[var(--font-space-grotesk)] font-bold text-accent uppercase tracking-widest mb-3">
            SEASON RECAP
          </p>
          <p className="font-[var(--font-spline-sans)] text-sm text-[#d4c0d7] leading-relaxed">
            {recap.text}
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full bg-primary text-black font-[var(--font-space-grotesk)] font-bold py-4 button-clip hover:shadow-[0_0_15px_#00e676] transition-all"
        >
          VIEW FINAL TABLE
        </button>
      </div>
    </div>
  );
}
