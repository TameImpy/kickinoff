import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const { data: memberships } = await supabase
    .from("league_members")
    .select("league_id, leagues(id, name, status, current_round, invite_code)")
    .eq("user_id", user.id);

  const leagues = memberships?.map((m) => m.leagues).filter(Boolean) ?? [];

  return (
    <div>
      <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold mb-6">
        Hey {profile?.display_name ?? "there"}
      </h1>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href="/league/create"
          className="flex-1 bg-primary text-black font-[var(--font-space-grotesk)] font-bold py-3 px-4 button-clip text-center text-sm hover:shadow-[0_0_15px_#00e676] transition-all"
        >
          CREATE LEAGUE
        </Link>
        <JoinCodeInput />
      </div>

      {/* Leagues */}
      {leagues.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#262626] p-8 text-center">
          <p className="text-[#d4c0d7] mb-2">No leagues yet</p>
          <p className="text-white/50 text-sm">
            Create a league or enter a code to join one
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leagues.map((league: any) => (
            <Link
              key={league.id}
              href={`/league/${league.id}`}
              className="block bg-[#1A1A1A] border border-[#262626] p-4 hover:border-primary transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-[var(--font-space-grotesk)] font-bold text-lg">
                    {league.name}
                  </h3>
                  <span className="text-xs font-[var(--font-space-grotesk)] font-bold text-primary/60 uppercase tracking-widest">
                    {league.status}
                  </span>
                </div>
                {league.status === "active" && (
                  <span className="text-xs font-[var(--font-space-grotesk)] font-bold text-white/50">
                    Round {league.current_round}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function JoinCodeInput() {
  return (
    <form action="/api/join-league" method="POST" className="flex-1 flex gap-2">
      <input
        name="code"
        type="text"
        placeholder="CODE"
        maxLength={6}
        className="flex-1 bg-[#1A1A1A] border-b-2 border-accent text-white font-[var(--font-space-grotesk)] font-bold px-3 py-3 text-sm uppercase tracking-widest placeholder:text-white/30 focus:outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="border border-accent text-accent font-[var(--font-space-grotesk)] font-bold py-3 px-4 button-clip text-sm hover:bg-accent/10 transition-all"
      >
        JOIN
      </button>
    </form>
  );
}
