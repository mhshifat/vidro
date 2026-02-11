import {
  AnimatedGridBackground,
  SectionDivider,
  Navbar,
  HeroSection,
  FeaturesSection,
  AISection,
  VideoToolsSection,
  HowItWorksSection,
  StatsSection,
  CtaSection,
  Footer,
} from "@/components/modules/landing";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Vidro",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web, Chrome",
  description:
    "AI-powered screen recording and bug reporting tool. Record bugs in seconds with 18 AI models, screenshot annotations, and instant shareable links.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://vidro.dev",
  featureList:
    "Screen Recording, Screenshot Annotations, AI Bug Analysis, Console & Network Log Capture, Video Chapters, Duplicate Detection, Natural Language Search",
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to main content
      </a>
      <AnimatedGridBackground />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <SectionDivider />
        <FeaturesSection />
        <SectionDivider />
        <AISection />
        <SectionDivider />
        <VideoToolsSection />
        <SectionDivider />
        <HowItWorksSection />
        <StatsSection />
        <SectionDivider />
        <SectionDivider />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
