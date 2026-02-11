import Link from "next/link";

const LAST_UPDATED = "February 11, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Vidro home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 transition-transform group-hover:scale-105">
              <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4" aria-hidden="true">
                <circle cx="16" cy="16" r="7" fill="white" opacity="0.9" />
                <circle cx="16" cy="16" r="3.5" fill="#ef4444" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">Vidro</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold">1. Introduction</h2>
            <p>
              Welcome to Vidro (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your
              privacy and handling your data transparently. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our website, Chrome extension, and related services
              (collectively, the &quot;Service&quot;).
            </p>
            <p>
              By accessing or using the Service, you agree to this Privacy Policy. If you do not agree with the terms
              of this policy, please do not use the Service.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold">2. Information We Collect</h2>

            <h3 className="text-lg font-semibold mt-4">2.1 Information You Provide</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
              <li><strong>Bug Reports:</strong> Screen recordings, screenshots, annotations, titles, descriptions, and any other content you submit through the Service.</li>
              <li><strong>Communications:</strong> Any messages you send to us for support or feedback.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Browser Console Logs:</strong> JavaScript console output captured during screen recordings to help diagnose bugs.</li>
              <li><strong>Network Requests:</strong> HTTP request/response metadata (URLs, status codes, timing) captured during recordings.</li>
              <li><strong>Device &amp; Browser Info:</strong> Browser type, operating system, screen resolution, and extension version.</li>
              <li><strong>Usage Data:</strong> Storage usage, number of reports created, and feature interactions.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">2.3 Cookies &amp; Tokens</h3>
            <p>
              We use a secure, HTTP-only authentication token (JWT) stored as a cookie to maintain your session.
              We do not use third-party tracking cookies or advertising pixels.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide, operate, and maintain the Service.</li>
              <li>Process and store your bug reports, recordings, and screenshots.</li>
              <li>Generate AI-powered analysis, summaries, action items, and suggestions for your bug reports.</li>
              <li>Detect duplicate reports and provide smart search functionality.</li>
              <li>Monitor usage limits and storage quotas.</li>
              <li>Send transactional emails (e.g., account verification, password resets).</li>
              <li>Improve and develop new features for the Service.</li>
              <li>Respond to your inquiries and provide customer support.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold">4. AI Processing</h2>
            <p>
              Vidro uses third-party AI models (via services such as Groq) to analyze bug reports. When you use AI
              features, relevant report data (video transcripts, console logs, network data, screenshots) may be sent
              to these AI providers for processing. This data is used solely to generate analysis results and is not
              used by AI providers to train their models.
            </p>
            <p>We support 18 AI models. You can choose which model processes your data.</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold">5. Data Storage &amp; Security</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Media Storage:</strong> Recordings and screenshots are stored on Cloudinary&apos;s infrastructure with secure access controls.</li>
              <li><strong>Database:</strong> Account and report metadata is stored in a PostgreSQL database managed via Prisma ORM.</li>
              <li><strong>Encryption:</strong> All data is transmitted over HTTPS/TLS. Passwords are hashed using bcrypt before storage.</li>
              <li><strong>Access Controls:</strong> Your data is only accessible to you through authenticated API endpoints.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide the Service. You may
              delete individual bug reports at any time from your dashboard. When you delete a report, the associated
              recording, screenshots, and metadata are permanently removed from our systems and third-party storage
              providers.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold">7. Data Sharing &amp; Disclosure</h2>
            <p>We do <strong>not</strong> sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., Cloudinary for media storage, Groq for AI processing, database hosting providers).</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
              <li><strong>Safety:</strong> To protect the rights, property, or safety of Vidro, our users, or the public.</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
              <li><strong>Data Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong>Objection:</strong> Object to or restrict certain types of processing.</li>
            </ul>
            <p>To exercise any of these rights, please contact us at the email address below.</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold">9. Chrome Extension</h2>
            <p>
              The Vidro Chrome Extension requests the following permissions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>activeTab &amp; tabs:</strong> To capture the current tab for screen recording and screenshots.</li>
              <li><strong>desktopCapture:</strong> To record your screen.</li>
              <li><strong>offscreen:</strong> To process recordings in the background.</li>
              <li><strong>storage:</strong> To persist extension preferences locally.</li>
            </ul>
            <p>
              All captured data is transmitted directly to our servers over HTTPS. The extension does not collect
              browsing history or activity outside of active recording/screenshot sessions.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold">10. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for users under the age of 13. We do not knowingly collect personal
              information from children under 13. If we learn that we have collected data from a child under 13,
              we will take steps to delete it promptly.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by
              posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use
              of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-bold">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:privacy@vidro.dev" className="text-red-500 hover:text-red-400 underline underline-offset-2">
                privacy@vidro.dev
              </a>
            </p>
          </section>
        </div>

        {/* Back */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
