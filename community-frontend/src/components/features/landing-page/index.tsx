import { type Variants, animate } from "framer-motion";
import { useEffect } from "react";
import ChatBotButton from "./chatbot-icon";
import AboutRich from "./priorities";
import HeroSection from "./hero";

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

      <ChatBotButton />
      {/* Hero Section */}
      <HeroSection />

      <AboutRich />

    </div>
  );
};

export default LandingPage;