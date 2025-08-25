import { type Variants, animate } from "framer-motion";
import { useEffect } from "react";
import OurPriorities from "./our-priorities";
import FeedbackForm from "./feedback-form";
import ChatBotButton from "./chatbot-icon";
import TweetsCards from "./twitting-card";
import MainHeader from "@/components/layouts/main-header";
import Footer from "@/components/layouts/main-footer/main-footer";
import WavoSlideshow from "./hero-section";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.7, type: "spring" as const },
  }),
};

const LandingPage = () => {
  const { t } = useTranslation();
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

      <div className="py-8 md:py-12 md:mt-10 w-full max-w-8xl mx-auto">
        <div className="bg-primary/10 p-4 text-center mb-10">
          <motion.h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-title mb-2">{t('priorities.title')}</motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-lg:place-items-center md:gap-10 px-2 sm:px-4">
          {/* About the Project */}
          <OurPriorities />
          <TweetsCards />
        </div>
      </div>

      <FeedbackForm />

      <Footer />

    </div>
  );
};

export default LandingPage;