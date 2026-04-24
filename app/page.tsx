import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-[#0D0D0D] text-[#e5e2e1] overflow-x-hidden">
      {/* Header */}
      <header className="bg-[#0D0D0D] sticky top-0 border-b border-[#262626] shadow-[0_0_15px_rgba(0,230,118,0.3)] z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-black italic text-primary tracking-widest font-[var(--font-space-grotesk)]">
            KICKIN&apos; OFF
          </div>
          <Link
            href="/login"
            className="bg-primary text-black px-6 py-2 button-clip font-[var(--font-space-grotesk)] font-bold active:scale-95 duration-100"
          >
            PLAY NOW
          </Link>
        </div>
      </header>

      {/* Timer Bar (decorative) */}
      <div className="w-full h-1 bg-[#262626] relative">
        <div className="absolute left-0 top-0 h-full bg-primary w-[70%]" />
      </div>

      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden px-5">
        <div className="relative z-10 max-w-4xl text-center">
          <div className="inline-block bg-primary/10 border border-primary text-primary px-4 py-1 font-[var(--font-space-grotesk)] font-bold text-xs mb-6 tracking-widest">
            WORLD CUP 2026 MODE LIVE
          </div>
          <h1 className="font-[var(--font-space-grotesk)] text-5xl md:text-8xl font-bold mb-6 leading-none tracking-tight">
            THINK YOU KNOW{" "}
            <span className="text-primary italic">FOOTBALL?</span>
          </h1>
          <p className="font-[var(--font-spline-sans)] text-lg text-[#d4c0d7] max-w-2xl mx-auto mb-10">
            Head-to-head trivia with your mates on video call. Create a league,
            play fixtures, and prove you&apos;re the real football brain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-primary text-black font-[var(--font-space-grotesk)] font-semibold text-xl px-10 py-5 button-clip flex items-center justify-center gap-2 hover:shadow-[0_0_20px_#00e676] transition-all"
            >
              GET STARTED
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-accent text-accent font-[var(--font-space-grotesk)] font-semibold text-xl px-10 py-5 button-clip hover:bg-accent/10 transition-all text-center"
            >
              HOW IT WORKS
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="font-[var(--font-space-grotesk)] text-3xl font-bold uppercase italic border-l-4 border-primary pl-4">
            HOW_IT_WORKS
          </h2>
          <p className="text-[#d4c0d7] mt-2 font-[var(--font-space-grotesk)] text-xs uppercase tracking-widest">
            Three steps to glory
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "CREATE A LEAGUE",
              desc: "Pick a name, invite your mates with a link, and choose your question mode — General, World Cup, or Premier League.",
            },
            {
              step: "02",
              title: "PLAY FIXTURES",
              desc: "Jump on a video call with your opponent. 10 questions, 10 seconds each. Watch them sweat as the clock ticks down.",
            },
            {
              step: "03",
              title: "WIN THE LEAGUE",
              desc: "3 points for a win, 1 for a draw. Climb the table, share your results, and brag in the group chat.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-[#1A1A1A] border border-[#262626] p-8 hover:border-primary transition-all"
            >
              <span className="font-[var(--font-space-grotesk)] text-4xl font-bold italic text-primary/30">
                {item.step}
              </span>
              <h3 className="font-[var(--font-space-grotesk)] text-xl font-bold mt-4 mb-3">
                {item.title}
              </h3>
              <p className="text-[#d4c0d7] text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#131313] py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Video Call Feature */}
          <div className="lg:col-span-5 bg-[#1A1A1A] border border-[#262626] p-8">
            <h2 className="font-[var(--font-space-grotesk)] text-3xl font-bold mb-8 uppercase tracking-tighter">
              LIVE_VIDEO
            </h2>
            <p className="text-[#d4c0d7] mb-6">
              Play head-to-head on video call. See your opponent&apos;s face
              when they get a question wrong. The reactions are half the fun.
            </p>
            <ul className="space-y-3">
              {[
                "1-on-1 VIDEO CALLS",
                "10-SECOND TIMER",
                "AI-GENERATED QUESTIONS",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-xs font-[var(--font-space-grotesk)] font-bold text-white/80"
                >
                  <span className="text-primary text-sm">&#10003;</span>{" "}
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* League + Share Features */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1A1A1A] border border-[#262626] p-8">
              <h3 className="font-[var(--font-space-grotesk)] text-2xl font-bold uppercase mb-4">
                LEAGUE_TABLE
              </h3>
              <p className="text-[#d4c0d7]">
                Full round-robin format. Points, question difference, the lot.
                Just like the real thing.
              </p>
            </div>
            <div className="bg-[#1A1A1A] border border-[#262626] p-8">
              <h3 className="font-[var(--font-space-grotesk)] text-2xl font-bold uppercase mb-4">
                SHARE_RESULTS
              </h3>
              <p className="text-[#d4c0d7]">
                Won a fixture? Share it straight to WhatsApp. Lost? We&apos;ll
                keep that between us.
              </p>
            </div>
            <div className="md:col-span-2 bg-gradient-to-r from-[#1A1A1A] to-[#262626] p-8 border border-[#262626]">
              <h3 className="font-[var(--font-space-grotesk)] text-2xl font-bold uppercase mb-2">
                WORLD CUP 2026 MODE
              </h3>
              <p className="text-[#d4c0d7]">
                The World Cup starts June 11. Get your league ready. AI
                questions themed around groups, squads, host cities, and 100
                years of tournament history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 z-0" />
        <div className="max-w-4xl mx-auto text-center relative z-10 border-4 border-primary p-12 bg-[#0D0D0D] clipped-corner">
          <h2 className="font-[var(--font-space-grotesk)] text-4xl md:text-5xl font-bold mb-6 uppercase italic">
            ARE YOU READY TO PLAY?
          </h2>
          <p className="font-[var(--font-spline-sans)] text-lg text-[#d4c0d7] mb-10 max-w-xl mx-auto">
            Create a league, invite your mates, and find out who really knows
            their football. No app download needed — it&apos;s all in the
            browser.
          </p>
          <Link
            href="/login"
            className="bg-primary text-black font-[var(--font-space-grotesk)] font-semibold text-xl px-12 py-6 button-clip hover:shadow-[0_0_30px_#00e676] transition-all inline-block"
          >
            GET STARTED
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0D0D] border-t border-[#262626]">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 gap-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-lg font-black text-primary font-[var(--font-space-grotesk)] tracking-widest mb-2">
              KICKIN&apos; OFF
            </div>
            <p className="font-[var(--font-space-grotesk)] text-xs uppercase tracking-widest text-white/50">
              &copy; 2026 KICKIN&apos; OFF. HEAD-TO-HEAD FOOTBALL TRIVIA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
