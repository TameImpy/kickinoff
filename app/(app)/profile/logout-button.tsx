"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full border border-[#262626] text-white/50 font-[var(--font-space-grotesk)] font-bold py-4 hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
    >
      SIGN OUT
    </button>
  );
}
