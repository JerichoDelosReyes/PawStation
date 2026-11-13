"use client";

import Hero from "@/components/Hero";
import EcosystemBand from "@/components/EcosystemBand";
import HowPawStationHelps from "@/components/HowPawStationHelps";
import FAQ from "@/components/FAQ";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-[#161618] text-white overflow-x-hidden selection:bg-white selection:text-black">
      <main className="w-full">
        {/* Section 1: Hero with Interlocking Top Bar, White Canvas & Complex Filleted Edges */}
        <Hero />

        {/* Section 2: Our Materials (Fynsec Screenshot 2 Replication) */}
        <EcosystemBand />

        {/* Section 3: How Can PawStation Help? (3 Numbered Cards / 01, / 02, / 03) */}
        <HowPawStationHelps />

        {/* Section 4: Minimalist Technical FAQ */}
        <FAQ />

        {/* Section 6: Minimalist CTA */}
        <CtaSection />
      </main>

      {/* Minimalist Footer */}
      <Footer />
      <AuthModal />
    </div>
  );
}
