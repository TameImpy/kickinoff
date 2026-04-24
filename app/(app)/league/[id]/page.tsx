import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StartLeagueButton from "./start-league-button";
import Link from "next/link";

export default async function LeagueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: league } = await supabase
    .from("leagues")
    .select("*")
    .eq("id", id)
    .single();

  if (!league) {
    return (
      <div className="text-center py-16">
        <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold">
          LEAGUE NOT FOUND
        </h1>
      </div>
    );
  }

  const { data: members } = await supabase
    .from("league_members")
    .select("*, users(display_name, avatar_url)")
    .eq("league_id", id)
    .order("points", { ascending: false });

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(
      "*, home_user:users!fixtures_home_user_id_fkey(display_name), away_user:users!fixtures_away_user_id_fkey(display_name)"
    )
    .eq("league_id", id)
    .order("round", { ascending: true });

  const isCreator = league.created_by === user.id;
  const memberCount = members?.length ?? 0;
  const canStart = isCreator && league.status === "open" && memberCount >= 3;

  return (
    <div>
      {/* League Header */}
      <div className="mb-6">
        <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold">
          {league.name}
        </h1>
        <div className="flex gap-3 mt-1">
          <span className="text-xs font-[var(--font-space-grotesk)] font-bold text-primary uppercase tracking-widest">
            {league.status}
          </span>
          <span className="text-xs font-[var(--font-space-grotesk)] font-bold text-white/50 uppercase tracking-widest">
            {league.question_mode.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Start League (only for creator, only when open) */}
      {canStart && <StartLeagueButton leagueId={id} />}

      {/* Invite Code (when open) */}
      {league.status === "open" && (
        <div className="bg-[#1A1A1A] border border-[#262626] p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-[var(--font-space-grotesk)] font-bold text-white/50 uppercase tracking-widest">
              Invite Code
            </p>
            <p className="font-[var(--font-space-grotesk)] font-bold text-primary text-lg tracking-[0.2em]">
              {league.invite_code}
            </p>
          </div>
          <p className="text-sm text-white/50">
            {memberCount}/{league.max_players}
          </p>
        </div>
      )}

      {/* League Table (when active/completed) */}
      {league.status !== "open" && members && members.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#262626] mb-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626] text-[10px] font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest text-white/50">
                <th className="py-3 px-3 text-left">#</th>
                <th className="py-3 px-3 text-left">Player</th>
                <th className="py-3 px-2 text-center">P</th>
                <th className="py-3 px-2 text-center">W</th>
                <th className="py-3 px-2 text-center">D</th>
                <th className="py-3 px-2 text-center">L</th>
                <th className="py-3 px-2 text-center">QD</th>
                <th className="py-3 px-2 text-center font-bold text-primary">
                  Pts
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: any, i: number) => {
                const isCurrentUser = m.user_id === user.id;
                const qd =
                  m.questions_correct -
                  (m.questions_total - m.questions_correct);
                return (
                  <tr
                    key={m.id}
                    className={`border-b border-[#262626] ${isCurrentUser ? "bg-primary/5" : ""}`}
                  >
                    <td className="py-3 px-3 font-[var(--font-space-grotesk)] font-bold italic text-white/40">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td
                      className={`py-3 px-3 font-[var(--font-space-grotesk)] font-bold ${isCurrentUser ? "text-primary" : ""}`}
                    >
                      {m.users?.display_name ?? "Player"}
                    </td>
                    <td className="py-3 px-2 text-center text-white/80">
                      {m.played}
                    </td>
                    <td className="py-3 px-2 text-center text-white/80">
                      {m.won}
                    </td>
                    <td className="py-3 px-2 text-center text-white/80">
                      {m.drawn}
                    </td>
                    <td className="py-3 px-2 text-center text-white/80">
                      {m.lost}
                    </td>
                    <td className="py-3 px-2 text-center text-white/80">
                      {qd > 0 ? `+${qd}` : qd}
                    </td>
                    <td className="py-3 px-2 text-center font-[var(--font-space-grotesk)] font-bold text-primary">
                      {m.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Members (when open) */}
      {league.status === "open" && members && (
        <div className="mb-6">
          <h2 className="font-[var(--font-space-grotesk)] text-sm font-bold uppercase tracking-widest text-white/50 mb-3">
            Members ({memberCount})
          </h2>
          <div className="space-y-2">
            {members.map((m: any) => (
              <div
                key={m.id}
                className="bg-[#1A1A1A] border border-[#262626] p-3 flex items-center gap-3"
              >
                {m.users?.avatar_url ? (
                  <img
                    src={m.users.avatar_url}
                    alt=""
                    className="w-8 h-8 border border-[#262626]"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#262626] flex items-center justify-center text-xs font-bold text-primary">
                    {m.users?.display_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <span className="font-[var(--font-space-grotesk)] font-bold text-sm">
                  {m.users?.display_name ?? "Player"}
                </span>
                {m.user_id === league.created_by && (
                  <span className="text-[10px] font-[var(--font-space-grotesk)] font-bold text-accent uppercase tracking-widest ml-auto">
                    Creator
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixtures */}
      {fixtures && fixtures.length > 0 && (
        <div>
          <h2 className="font-[var(--font-space-grotesk)] text-sm font-bold uppercase tracking-widest text-white/50 mb-3">
            Fixtures
          </h2>
          {Array.from(new Set(fixtures.map((f: any) => f.round)))
            .sort((a, b) => (a as number) - (b as number))
            .map((round) => (
              <div key={round as number} className="mb-4">
                <p className="text-xs font-[var(--font-space-grotesk)] font-bold text-white/30 uppercase tracking-widest mb-2">
                  Round {round as number}
                </p>
                <div className="space-y-2">
                  {fixtures
                    .filter((f: any) => f.round === round)
                    .map((f: any) => {
                      const isUserFixture =
                        f.home_user_id === user.id ||
                        f.away_user_id === user.id;
                      return (
                        <div
                          key={f.id}
                          className={`bg-[#1A1A1A] border border-[#262626] p-3 ${isUserFixture ? "border-l-2 border-l-primary" : ""}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <span className="font-[var(--font-space-grotesk)] font-bold text-sm">
                                {f.home_user?.display_name ?? "TBD"}
                              </span>
                              {f.status === "completed" && (
                                <span className="mx-2 font-[var(--font-space-grotesk)] font-bold text-primary">
                                  {f.home_score} - {f.away_score}
                                </span>
                              )}
                              {f.status !== "completed" && (
                                <span className="mx-2 text-white/30">vs</span>
                              )}
                              <span className="font-[var(--font-space-grotesk)] font-bold text-sm">
                                {f.away_user?.display_name ?? "TBD"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {f.status === "pending" && isUserFixture && (
                                <Link
                                  href={`/league/${id}/fixture/${f.id}`}
                                  className="bg-primary text-black text-xs font-[var(--font-space-grotesk)] font-bold px-3 py-1 button-clip"
                                >
                                  PLAY
                                </Link>
                              )}
                              <span
                                className={`text-[10px] font-[var(--font-space-grotesk)] font-bold uppercase tracking-widest ${
                                  f.status === "completed"
                                    ? "text-primary"
                                    : f.status === "expired"
                                      ? "text-[#ffb4ab]"
                                      : "text-white/30"
                                }`}
                              >
                                {f.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
