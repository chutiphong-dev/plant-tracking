import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apple Vision Pro Plant Care 🌿 | Spatial Plant Tracker',
  description: 'Manage your garden in spatial passthrough. A premium Apple Vision Pro plant care gateway powered by Next.js, Supabase, and Drizzle.',
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
      <body className="min-h-screen flex flex-col antialiased selection:bg-emerald-500/30 text-gray-100 bg-[#03060a] relative overflow-x-hidden">
        {/* Floating Apple Vision Pro Ambient Light Orbs - Bound in overflow-hidden container */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div 
            className="vision-orb w-[600px] h-[600px] bg-emerald-500/15 top-[-150px] left-[-150px]" 
            style={{ animationDelay: '0s' }}
          />
          <div 
            className="vision-orb w-[700px] h-[700px] bg-teal-500/10 bottom-[-100px] right-[-200px]" 
            style={{ animationDelay: '-5s', animationDuration: '25s' }}
          />
          <div 
            className="vision-orb w-[450px] h-[450px] bg-cyan-500/8 top-[35%] left-[35%]" 
            style={{ animationDelay: '-10s', animationDuration: '18s' }}
          />
        </div>

        {/* Global Immersive Spatial Header */}
        <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 py-4 bg-transparent">
          <div className="max-w-7xl mx-auto h-16 rounded-2xl flex items-center justify-between px-6 vision-glass">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse" role="img" aria-label="spatial plant logo">🌿</span>
              <div>
                <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                  PLANT TRACKER
                </h1>
                <p className="text-[9px] text-emerald-400 font-semibold uppercase tracking-widest leading-none">
                  Apple Vision OS 1.2
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-4" aria-label="Session Navigation">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 backdrop-blur-md">
                Spatial Integration Active
              </span>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {children}
        </main>

        {/* Spatial Floating Footer */}
        <footer className="w-full py-8 mt-16 text-center text-xs text-muted-foreground bg-transparent">
          <div className="max-w-7xl mx-auto px-6 h-auto py-4 sm:py-0 sm:h-12 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 vision-glass">
            <p className="text-gray-400">© 2026 Apple Vision Pro Plant Tracker. Designed for spatial environments.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-emerald-400 transition-colors cursor-pointer text-gray-400">Spatial API</span>
              <span className="text-white/10">•</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer text-gray-400">Hologram Settings</span>
              <span className="text-white/10">•</span>
              <span className="hover:text-emerald-400 transition-colors cursor-pointer text-gray-400">Hardware Diagnostics</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
