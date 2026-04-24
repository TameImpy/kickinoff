"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinButton({ leagueId }: { leagueId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("league_members").insert({
      league_id: leagueId,
      user_id: user.id,
    });

    router.push(`/league/${leagueId}`);
  };

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      className="w-full bg-primary text-black font-[var(--font-space-grotesk)] font-bold py-4 button-clip hover:shadow-[0_0_15px_#00e676] transition-all disabled:opacity-50"
    >
      {loading ? "JOINING..." : "JOIN LEAGUE"}
    </button>
  );
}
