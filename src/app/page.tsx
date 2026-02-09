import {
  AnimatedGridBackground,
  SectionDivider,
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  StatsSection,
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
      <HowItWorksSection />
      <StatsSection />
      <SectionDivider />
      <CtaSection />
      <Footer />
    </div>
  );
}
