import { motion } from "framer-motion";
import OurPriorities from "./our-priorities";
import { useTranslation } from "react-i18next";
import FeedbackForm from "../feedback-form";

const AboutRich = () => {
    const { t } = useTranslation();
    return (
        <div className="py-8 md:py-8 md:mt-5 w-full max-w-8xl mx-auto" id="about">
            <div className="bg-gray-100 border border-gray-300 rounded-2xl mx-4 p-4 text-center mb-10">
                <motion.h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-title mb-2">{t('priorities.title')}</motion.h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-lg:place-items-center md:gap-6 px-2 sm:px-4">
                {/* About the Project */}
                <OurPriorities />
                <FeedbackForm />
            </div>
        </div>
    );
};

export default AboutRich;