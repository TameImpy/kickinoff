"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateInviteCode } from "@/lib/league/invite-code";
import { useRouter } from "next/navigation";

export default function CreateLeaguePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareScreen, setShareScreen] = useState<{
    code: string;
    name: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const questionMode = formData.get("question_mode") as string;
    const maxPlayers = parseInt(formData.get("max_players") as string);
    const fixtureWindowDays = parseInt(
      formData.get("fixture_window_days") as string
    );

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const inviteCode = generateInviteCode();

    const { error: insertError } = await supabase.from("leagues").insert({
      name,
      invite_code: inviteCode,
      created_by: user.id,
      question_mode: questionMode,
      max_players: maxPlayers,
      fixture_window_days: fixtureWindowDays,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Auto-join creator
    const { data: league } = await supabase
      .from("leagues")
      .select("id")
      .eq("invite_code", inviteCode)
      .single();

    if (league) {
      await supabase.from("league_members").insert({
        league_id: league.id,
        user_id: user.id,
      });
    }

    setShareScreen({ code: inviteCode, name });
    setLoading(false);
  };

  if (shareScreen) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kickinoff.co.uk";
    const shareUrl = `${appUrl}/join/${shareScreen.code}`;
    const whatsappMessage = encodeURIComponent(
      `I've created a football quiz league on Kickin' Off!\n\nJoin "${shareScreen.name}" and prove you know more about football than me.\n\n${shareUrl}`
    );

    return (
      <div className="text-center">
        <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold mb-2">
          LEAGUE CREATED
        </h1>
        <p className="text-[#d4c0d7] mb-8">Share the code with your mates</p>

        <div className="bg-[#1A1A1A] border border-[#262626] p-8 mb-6">
          <p className="text-xs font-[var(--font-space-grotesk)] text-white/50 uppercase tracking-widest mb-2">
            Invite Code
          </p>
          <p className="text-4xl font-[var(--font-space-grotesk)] font-black text-primary tracking-[0.3em]">
            {shareScreen.code}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="w-full bg-primary text-black font-[var(--font-space-grotesk)] font-bold py-4 button-clip hover:shadow-[0_0_15px_#00e676] transition-all"
          >
            COPY LINK
          </button>
          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border-2 border-primary text-primary font-[var(--font-space-grotesk)] font-bold py-4 button-clip hover:bg-primary/10 transition-all block text-center"
          >
            SHARE TO WHATSAPP
          </a>
          <button
            onClick={() => router.push("/home")}
            className="w-full border border-[#262626] text-white/50 font-[var(--font-space-grotesk)] font-bold py-4 hover:bg-white/5 transition-all"
          >
            BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold mb-6">
        CREATE LEAGUE
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* League Name */}
        <div>
          <label className="block text-xs font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest text-white/50 mb-2">
            League Name
          </label>
          <input
            name="name"
            type="text"
            required
            minLength={3}
            maxLength={40}
            placeholder="e.g. Matt's World Cup League"
            className="w-full bg-[#1A1A1A] border-b-2 border-accent text-white font-[var(--font-spline-sans)] px-4 py-3 focus:outline-none focus:border-primary placeholder:text-white/30"
          />
        </div>

        {/* Question Mode */}
        <div>
          <label className="block text-xs font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest text-white/50 mb-2">
            Question Mode
          </label>
          <select
            name="question_mode"
            defaultValue="general"
            className="w-full bg-[#1A1A1A] border-b-2 border-accent text-white font-[var(--font-spline-sans)] px-4 py-3 focus:outline-none focus:border-primary"
          >
            <option value="general">General Football</option>
            <option value="world_cup_2026">World Cup 2026</option>
            <option value="premier_league">Premier League</option>
          </select>
        </div>

        {/* Max Players */}
        <div>
          <label className="block text-xs font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest text-white/50 mb-2">
            Max Players
          </label>
          <select
            name="max_players"
            defaultValue="6"
            className="w-full bg-[#1A1A1A] border-b-2 border-accent text-white font-[var(--font-spline-sans)] px-4 py-3 focus:outline-none focus:border-primary"
          >
            {[3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} players
              </option>
            ))}
          </select>
        </div>

        {/* Round Duration */}
        <div>
          <label className="block text-xs font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest text-white/50 mb-2">
            Round Duration
          </label>
          <select
            name="fixture_window_days"
            defaultValue="7"
            className="w-full bg-[#1A1A1A] border-b-2 border-accent text-white font-[var(--font-spline-sans)] px-4 py-3 focus:outline-none focus:border-primary"
          >
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="5">5 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
          </select>
        </div>

        {error && (
          <p className="text-[#ffb4ab] text-sm font-[var(--font-space-grotesk)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-black font-[var(--font-space-grotesk)] font-bold py-4 button-clip hover:shadow-[0_0_20px_#00e676] transition-all disabled:opacity-50"
        >
          {loading ? "CREATING..." : "CREATE LEAGUE"}
        </button>
      </form>
    </div>
  );
}
