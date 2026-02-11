import Link from "next/link";

export default function ChangelogPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-black tracking-tight mb-4">Changelog</h1>
        <p className="text-muted-foreground mb-6">
          See the latest updates, features, and fixes for Vidro.
        </p>
        <section className="space-y-8 text-left">
          {/* Example changelog entries, replace with dynamic content if needed */}
          <div>
            <h2 className="text-xl font-bold mb-2">v1.0.0 — Initial Release</h2>
            <ul className="list-disc pl-6 text-sm">
              <li>AI-powered screen recording and bug reporting</li>
              <li>Annotation tools for screenshots</li>
              <li>Multi-tenant support and advanced filters</li>
              <li>Custom error handling with correlation IDs</li>
              <li>Responsive minimalist maximalism design</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">v1.1.0 — Improvements</h2>
            <ul className="list-disc pl-6 text-sm">
              <li>Added changelog page</li>
              <li>Improved dashboard pagination and skeleton loaders</li>
              <li>Enhanced logging and error UI</li>
              <li>Bug fixes and performance optimizations</li>
            </ul>
          </div>
        </section>
        <Link href="/" className="inline-block mt-8 px-6 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition">
          Back to Homepage
        </Link>
      </div>
    </main>
  );
}
