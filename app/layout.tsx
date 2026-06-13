import "../globals.css";
import type { ReactNode } from "react";
import { Providers } from "@/store/providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-transparent text-slate-900 antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_rgba(59,130,246,0)_55%),_radial-gradient(circle_at_bottom,_rgba(14,165,233,0.12),_rgba(14,165,233,0)_55%)]" />
            <div className="pointer-events-none fixed inset-y-0 left-0 -z-10 w-72 bg-gradient-to-b from-white/40 via-transparent to-white/40 blur-3xl" />
            <div className="pointer-events-none fixed inset-y-0 right-0 -z-10 w-72 bg-gradient-to-b from-white/40 via-transparent to-white/40 blur-3xl" />
            <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
