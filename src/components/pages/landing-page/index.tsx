import { type Variants } from "framer-motion";import HomeSection from "./HomeSection";
import AboutSection from "./programmes";
import FeedbackForm from "./feedback-form";
import ChatBotButton from "./chatbot-icon";
import ServiceUpdateCard from "./announcements-card";

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.7, type: "spring" as const },
  }),
};


const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <ChatBotButton />     
      {/* Hero Section */}
      <HomeSection />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-lg:place-items-center md:gap-10 py-8 md:py-12 w-full max-w-8xl mx-auto px-2 sm:px-4">
        {/* About the Project */}
        <AboutSection />
        <FeedbackForm />
      </div>

      <ServiceUpdateCard />

    </div>
  );
};

export default LandingPage;