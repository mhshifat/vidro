import Link from "next/link";
import { cookies } from "next/headers";
import { JWTManager } from "@/lib/jwt";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "AI", href: "#ai" },
  { label: "Video Tools", href: "#video-tools" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
] as const;

export async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const isAuthenticated = token ? (await JWTManager.verify(token)) !== null : false;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Vidro home" prefetch>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 shadow-lg shadow-red-500/20 transition-transform group-hover:scale-105">
            <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5" aria-hidden="true">
              <circle cx="16" cy="16" r="7" fill="white" opacity="0.9" />
              <circle cx="16" cy="16" r="3.5" fill="#ef4444" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">Vidro</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button size="sm" asChild className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20">
              <Link href="/dashboard" prefetch>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20">
                <Link href="/register">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
