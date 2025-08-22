import { type Variants, animate } from "framer-motion";
import { useEffect } from "react";
import HomeSection from "./HomeSection";
import AboutSection from "./programmes";
import FeedbackForm from "./feedback-form";
import ChatBotButton from "./chatbot-icon";
import TweetsCards from "./twitting-card";
import MainHeader from "@/components/layouts/main-header";
import Footer from "@/components/layouts/main-footer/main-footer";
import WavoSlideshow from "./hero-testing";

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.7, type: "spring" as const },
  }),
};

const LandingPage = () => {
  // Scroll to section if hash is present after mount or when hash changes
  useEffect(() => {
    const tryScroll = () => {
      const id = window.location.hash?.replace('#', '');
      if (!id) return;
      // Defer a tick to ensure sections are rendered
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 70; // header offset
          animate(window.scrollY, y, {
            duration: 0.7,
            onUpdate: (v) => window.scrollTo(0, v),
          });
        }
      });
    };

    // Run on mount
    tryScroll();

    // Listen to hash changes
    window.addEventListener('hashchange', tryScroll);
    return () => window.removeEventListener('hashchange', tryScroll);
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">

      <MainHeader />

      <ChatBotButton />
      {/* Hero Section */}
      {/* <HomeSection /> */}
      <WavoSlideshow />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-lg:place-items-center md:gap-10 py-8 md:py-12 w-full max-w-8xl mx-auto px-2 sm:px-4">
        {/* About the Project */}
        <AboutSection />
        <TweetsCards />
        
      </div>

      <FeedbackForm />

      <Footer />

    </div>
  );
};

export default LandingPage;