"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyCatCare from "@/components/WhyCatCare";
import FAQ from "@/components/FAQ";
import SupportContact from "@/components/SupportContact";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhyCatCare />
        <FAQ />
        <SupportContact />
      </main>
      <Footer />
      <AuthModal />
    </>
  );
}
