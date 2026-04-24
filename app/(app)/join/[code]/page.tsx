import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JoinButton from "./join-button";

export default async function JoinLeaguePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/join/${code}`);

  const { data: league } = await supabase
    .from("leagues")
    .select("*, league_members(user_id, users(display_name))")
    .eq("invite_code", code.toUpperCase())
    .single();

  if (!league) {
    return (
      <div className="text-center py-16">
        <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold mb-2">
          LEAGUE NOT FOUND
        </h1>
        <p className="text-[#d4c0d7]">
          Check the code and try again
        </p>
      </div>
    );
  }

  const members = league.league_members ?? [];
  const isMember = members.some((m: any) => m.user_id === user.id);
  const isFull = members.length >= league.max_players;

  if (isMember) redirect(`/league/${league.id}`);

  return (
    <div className="text-center">
      <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold mb-2">
        JOIN LEAGUE
      </h1>

      <div className="bg-[#1A1A1A] border border-[#262626] p-8 my-6">
        <h2 className="font-[var(--font-space-grotesk)] text-xl font-bold text-primary mb-1">
          {league.name}
        </h2>
        <p className="text-white/50 text-sm mb-4">
          {members.length}/{league.max_players} players
        </p>

        <div className="space-y-2 mb-6">
          {members.map((m: any) => (
            <div
              key={m.user_id}
              className="text-sm font-[var(--font-space-grotesk)] text-white/80"
            >
              {m.users?.display_name ?? "Player"}
            </div>
          ))}
        </div>

        {isFull ? (
          <p className="text-[#ffb4ab] font-[var(--font-space-grotesk)] font-bold">
            LEAGUE IS FULL
          </p>
        ) : league.status !== "open" ? (
          <p className="text-[#ffb4ab] font-[var(--font-space-grotesk)] font-bold">
            LEAGUE ALREADY STARTED
          </p>
        ) : (
          <JoinButton leagueId={league.id} />
        )}
      </div>
    </div>
  );
}
