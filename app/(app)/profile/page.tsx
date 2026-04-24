import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Aggregate stats across all leagues
  const { data: stats } = await supabase
    .from("league_members")
    .select("played, won, drawn, lost, questions_correct, questions_total")
    .eq("user_id", user.id);

  const totals = (stats ?? []).reduce(
    (acc, s) => ({
      played: acc.played + s.played,
      won: acc.won + s.won,
      drawn: acc.drawn + s.drawn,
      lost: acc.lost + s.lost,
      correct: acc.correct + s.questions_correct,
      total: acc.total + s.questions_total,
    }),
    { played: 0, won: 0, drawn: 0, lost: 0, correct: 0, total: 0 }
  );

  const correctPct =
    totals.total > 0 ? Math.round((totals.correct / totals.total) * 100) : 0;

  return (
    <div>
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-16 h-16 border-2 border-[#262626]"
          />
        ) : (
          <div className="w-16 h-16 bg-[#262626] flex items-center justify-center text-2xl font-[var(--font-space-grotesk)] font-bold text-primary">
            {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div>
          <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold">
            {profile?.display_name ?? "Player"}
          </h1>
          <p className="text-white/50 text-sm">{profile?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#1A1A1A] border border-[#262626] p-6 mb-6">
        <h2 className="font-[var(--font-space-grotesk)] text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
          CAREER STATS
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "PLAYED", value: totals.played },
            { label: "WON", value: totals.won },
            { label: "DRAWN", value: totals.drawn },
            { label: "LOST", value: totals.lost },
            { label: "CORRECT %", value: `${correctPct}%` },
            {
              label: "W/D/L",
              value: `${totals.won}/${totals.drawn}/${totals.lost}`,
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-[var(--font-space-grotesk)] text-2xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="text-[10px] font-[var(--font-space-grotesk)] font-bold text-white/50 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
