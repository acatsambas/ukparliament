import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UK Parliament Bill Analyser",
  description:
    "AI-powered analysis of UK Parliament bills across economic, social, and environmental dimensions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="nav">
          <Link href="/" className="nav-brand">
            Bill Analyser
          </Link>
          <div className="nav-links">
            <Link href="/about">About</Link>
            <Link href="/projects">Other Projects</Link>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="footer">
          <p>
            Data from the{" "}
            <a
              href="https://bills-api.parliament.uk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              UK Parliament Bills API
            </a>
            . Analysis powered by Google Gemini. Open Parliament Licence.
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
