import Link from "next/link";

const LAST_UPDATED = "February 11, 2026";

export default function TermsPage() {
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
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Vidro (&quot;the Service&quot;), including our website, Chrome extension, and API,
              you agree to be bound by these Terms &amp; Conditions (&quot;Terms&quot;). If you do not agree to these
              Terms, you may not use the Service.
            </p>
            <p>
              We reserve the right to update these Terms at any time. Continued use of the Service after changes
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold">2. Description of Service</h2>
            <p>
              Vidro is an AI-powered screen recording and bug reporting platform that allows users to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Record screen sessions with audio via a Chrome extension.</li>
              <li>Capture screenshots with annotation capabilities.</li>
              <li>Automatically capture browser console logs and network requests.</li>
              <li>Generate AI-powered analysis, summaries, and action items for bug reports.</li>
              <li>Share bug reports via unique links.</li>
              <li>Compare and detect duplicate bug reports.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold">3. Account Registration</h2>
            <p>To use certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide accurate and complete registration information.</li>
              <li>Maintain the security of your password and account credentials.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or are inactive for
              an extended period.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold">4. Acceptable Use</h2>
            <p>You agree <strong>not</strong> to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Upload, record, or share content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable.</li>
              <li>Record or capture other people&apos;s screens, conversations, or data without their consent.</li>
              <li>Violate any applicable local, state, national, or international law or regulation.</li>
              <li>Infringe upon the intellectual property rights of any third party.</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or related systems.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Use the Service for any commercial purpose without our prior written consent.</li>
              <li>Upload malicious code, viruses, or any harmful software.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold">5. User Content</h2>

            <h3 className="text-lg font-semibold mt-4">5.1 Ownership</h3>
            <p>
              You retain all ownership rights to content you upload to the Service, including screen recordings,
              screenshots, annotations, and bug report descriptions (&quot;User Content&quot;). By uploading content,
              you grant Vidro a limited, non-exclusive license to store, process, and display your content solely
              for the purpose of providing the Service.
            </p>

            <h3 className="text-lg font-semibold mt-4">5.2 AI Processing</h3>
            <p>
              When you use AI analysis features, your User Content may be sent to third-party AI providers for
              processing. You consent to this processing when you initiate AI analysis. AI providers are contractually
              prohibited from using your data to train their models.
            </p>

            <h3 className="text-lg font-semibold mt-4">5.3 Responsibility</h3>
            <p>
              You are solely responsible for the content you upload. Ensure you have the right to share any content
              captured in your recordings, including content belonging to third parties.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold">6. Usage Limits</h2>
            <p>The free tier of the Service includes the following limits:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Storage:</strong> Up to 100 MB of media storage per account.</li>
              <li><strong>Reports:</strong> Up to 50 bug reports per account.</li>
              <li><strong>Recording Length:</strong> Individual recordings are limited in duration.</li>
              <li><strong>File Size:</strong> Individual uploads are limited to 100 MB.</li>
            </ul>
            <p>
              We reserve the right to modify these limits at any time. Exceeding usage limits may result in
              restricted access to certain features until usage is reduced.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold">7. Chrome Extension</h2>
            <p>
              The Vidro Chrome Extension is subject to the{" "}
              <a
                href="https://developer.chrome.com/docs/webstore/program-policies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-400 underline underline-offset-2"
              >
                Chrome Web Store Developer Program Policies
              </a>
              . By installing the extension, you also agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Grant the necessary browser permissions for screen recording and screenshot capture.</li>
              <li>Acknowledge that the extension captures console logs and network requests during active recordings.</li>
              <li>Understand that the extension only operates during active recording or screenshot sessions.</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold">8. Intellectual Property</h2>
            <p>
              The Service, including its original content (excluding User Content), features, functionality, design,
              and branding, is and will remain the exclusive property of Vidro and its licensors. The Service is
              protected by copyright, trademark, and other applicable laws.
            </p>
            <p>
              Vidro is open-source software. The source code is available under the terms of its applicable license,
              which governs your use, modification, and distribution of the codebase.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold">9. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of
              any kind, whether express or implied, including but not limited to implied warranties of merchantability,
              fitness for a particular purpose, and non-infringement.
            </p>
            <p>We do not warrant that:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The Service will be uninterrupted, timely, secure, or error-free.</li>
              <li>The results from AI analysis will be accurate or reliable.</li>
              <li>Any defects in the Service will be corrected.</li>
              <li>The Service will meet your specific requirements.</li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Vidro and its owners, employees, and affiliates
              shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including
              but not limited to loss of profits, data, or goodwill, arising out of or related to your use of the
              Service, whether based on warranty, contract, tort, or any other legal theory.
            </p>
            <p>
              Our total liability for any claims arising from or related to the Service shall not exceed the amount
              you paid us, if any, in the twelve (12) months prior to the claim.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Vidro and its owners, employees, and affiliates from any
              claims, damages, losses, liabilities, and expenses (including reasonable attorney&apos;s fees) arising
              out of or related to your use of the Service, violation of these Terms, or infringement of any
              third-party rights.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-bold">12. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability,
              for any reason, including breach of these Terms. Upon termination:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your right to use the Service will immediately cease.</li>
              <li>We may delete your account and associated data.</li>
              <li>Sections of these Terms that by their nature should survive termination will remain in effect.</li>
            </ul>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-bold">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to
              conflict of law principles. Any disputes arising under these Terms shall be resolved in the appropriate
              courts of the jurisdiction in which Vidro operates.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xl font-bold">14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited
              or eliminated to the minimum extent necessary so that the remaining provisions of these Terms remain in
              full force and effect.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-xl font-bold">15. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us at:</p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:legal@vidro.dev" className="text-red-500 hover:text-red-400 underline underline-offset-2">
                legal@vidro.dev
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
