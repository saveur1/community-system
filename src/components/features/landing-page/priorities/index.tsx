import { motion } from "framer-motion";
import OurPriorities from "./our-priorities";
import TweetsCards from "./twitting-card";
import { useTranslation } from "react-i18next";

const AboutRich = () => {
    const { t } = useTranslation();
    return (
        <div className="py-8 md:py-8 md:mt-5 w-full max-w-8xl mx-auto" id="about">
            <div className="bg-primary/10 p-4 text-center mb-10">
                <motion.h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-title mb-2">{t('priorities.title')}</motion.h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-lg:place-items-center md:gap-10 px-2 sm:px-4">
                {/* About the Project */}
                <OurPriorities />
                <TweetsCards />
            </div>
        </div>
    );
};

export default AboutRich;