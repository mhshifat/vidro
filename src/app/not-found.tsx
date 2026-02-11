import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-5xl font-black tracking-tight mb-4 text-destructive">404</h1>
        <p className="text-lg font-semibold mb-2">Page Not Found</p>
        <p className="text-muted-foreground mb-6">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="inline-block px-6 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition">
          Go to Homepage
        </Link>
      </div>
    </main>
  );
}
