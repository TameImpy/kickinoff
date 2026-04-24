import type { Metadata } from "next";
import { Space_Grotesk, Spline_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kickin' Off — Football Quiz Leagues",
  description:
    "Head-to-head football trivia with your mates. Create a league, play fixtures on video call, win the league.",
  manifest: "/manifest.json",
  themeColor: "#00e676",
  openGraph: {
    title: "Kickin' Off — Football Quiz Leagues",
    description:
      "Head-to-head football trivia with your mates. Create a league, play fixtures on video call, win the league.",
    url: "https://kickinoff.co.uk",
    siteName: "Kickin' Off",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${splineSans.variable} dark h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
