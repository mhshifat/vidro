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
  ArchitectureSection,
  CtaSection,
  Footer,
} from "@/components/modules/landing";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <AnimatedGridBackground />
      <Navbar />
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
      <Footer />
    </div>
  );
}
