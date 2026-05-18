import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Antigravity Plant Tracker 🌿 | Premium Plant Care SaaS',
  description: 'The definitive 2026 SaaS boilerplate for scheduling, logging, and maximizing your plants longevity. Crafted with Next.js, Supabase, and Drizzle.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-emerald-500/30">
        {/* Decorative Grid Patterns */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Global Premium Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-panel">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label="plant logo">🌿</span>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                  PLANT TRACKER
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                  Antigravity Engine
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-6" aria-label="Main Navigation">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Supabase Native
              </span>
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="w-full border-t border-border/40 glass-panel py-6 mt-12 text-center text-xs text-muted-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Plant Tracker Boilerplate. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-primary transition-colors cursor-pointer">Security</span>
              <span className="text-border/40">•</span>
              <span className="hover:text-primary transition-colors cursor-pointer">API Reference</span>
              <span className="text-border/40">•</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Support</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
