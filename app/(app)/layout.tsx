import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Header */}
      <header className="bg-[#0D0D0D] border-b border-[#262626] sticky top-0 z-50">
        <div className="flex justify-between items-center px-5 py-3 max-w-[480px] mx-auto w-full">
          <div className="text-lg font-black italic text-primary tracking-widest font-[var(--font-space-grotesk)]">
            KICKIN&apos; OFF
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[480px] mx-auto w-full px-5 py-6">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="bg-[#0D0D0D] border-t border-[#262626] sticky bottom-0 z-50">
        <div className="flex justify-around items-center max-w-[480px] mx-auto py-3">
          <Link
            href="/home"
            className="flex flex-col items-center gap-1 text-primary"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-[10px] font-[var(--font-space-grotesk)] font-bold uppercase tracking-wider">
              Home
            </span>
          </Link>
          <Link
            href="/home"
            className="flex flex-col items-center gap-1 text-white/50 hover:text-primary transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="text-[10px] font-[var(--font-space-grotesk)] font-bold uppercase tracking-wider">
              Leagues
            </span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 text-white/50 hover:text-primary transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-[10px] font-[var(--font-space-grotesk)] font-bold uppercase tracking-wider">
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
