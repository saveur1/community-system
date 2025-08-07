import { type Variants } from "framer-motion";import HomeSection from "./HomeSection";
import AboutSection from "./programmes";
import FeedbackForm from "./feedback-form";
import ChatBotButton from "./chatbot-icon";
import ServiceUpdateCard from "./notification-card";

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

      <div className="flex justify-between py-16 items-center w-full max-w-8xl mx-auto">
        {/* About the Project */}
        <AboutSection />

        <FeedbackForm />
      </div>

      <ServiceUpdateCard />

    </div>
  );
};

export default LandingPage;