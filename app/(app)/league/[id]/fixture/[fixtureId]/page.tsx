import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FixtureRoom from "./fixture-room";

export default async function FixturePage({
  params,
}: {
  params: Promise<{ id: string; fixtureId: string }>;
}) {
  const { id: leagueId, fixtureId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: fixture } = await supabase
    .from("fixtures")
    .select(
      "*, home_user:users!fixtures_home_user_id_fkey(id, display_name), away_user:users!fixtures_away_user_id_fkey(id, display_name), leagues(invite_code, name)"
    )
    .eq("id", fixtureId)
    .single();

  if (!fixture) {
    return (
      <div className="text-center py-16">
        <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold">
          FIXTURE NOT FOUND
        </h1>
      </div>
    );
  }

  if (
    fixture.home_user_id !== user.id &&
    fixture.away_user_id !== user.id
  ) {
    return (
      <div className="text-center py-16">
        <h1 className="font-[var(--font-space-grotesk)] text-2xl font-bold">
          NOT YOUR FIXTURE
        </h1>
      </div>
    );
  }

  const isHome = fixture.home_user_id === user.id;
  const homeUser = fixture.home_user as any;
  const awayUser = fixture.away_user as any;
  const league = fixture.leagues as any;

  return (
    <FixtureRoom
      fixtureId={fixtureId}
      leagueId={leagueId}
      userId={user.id}
      isHome={isHome}
      homeName={homeUser?.display_name ?? "Home"}
      awayName={awayUser?.display_name ?? "Away"}
      leagueName={league?.name ?? "League"}
      inviteCode={league?.invite_code ?? ""}
      initialStartedAt={fixture.started_at}
      initialStatus={fixture.status}
    />
  );
}
