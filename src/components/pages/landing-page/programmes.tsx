import { motion } from "framer-motion";
import { FaHandsHelping, FaUserGraduate, FaSync, FaChartBar, FaCommentDots } from "react-icons/fa";
import { HiOutlineSupport } from "react-icons/hi";
import { sectionVariants } from ".";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const AboutSection = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const programmes = [
  {
    icon: <FaHandsHelping className="text-success w-6 h-6" />,
    label: t('about.about_hiv'),
    feedbackLink: "/feedback/hiv-aids",
  },
  {
    icon: <FaUserGraduate className="text-success w-6 h-6" />,
    label: t('about.about_immunization'),
    feedbackLink: "/feedback/immunization",
  },
  {
    icon: <HiOutlineSupport className="text-success w-6 h-6" />,
    label: t('about.about_mental'),
    feedbackLink: "/feedback/mental-health",
  },
  {
    icon: <FaSync className="text-success w-6 h-6" />,
    label: t('about.about_malaria'),
    feedbackLink: "/feedback/malaria",
  },
  {
    icon: <FaChartBar className="text-success w-6 h-6" />,
    label: t('about.about_nutrition'),
    feedbackLink: "/feedback/nutrition",
  },
];

  return (
    <div className="w-full flex justify-start col-span-1 md:col-span-2 mb-8 md:mb-0">
      <motion.section
        id="about"
        className="w-full px-2 sm:px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        aria-label="About the Project"
      >
        <motion.h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-title mb-6">{t('about.about_title')}</motion.h2>
        <motion.p className="text-base sm:text-lg text-justify text-gray-700 mb-8">
          { t('about.about_description') }
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {programmes.map((prog, idx) => (
            <div
              key={prog.label}
              className="flex items-center justify-between gap-4 p-3 sm:p-4 bg-white/80 rounded-lg shadow-lg border border-gray-200 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <span className="bg-primary/10 rounded-full p-2 sm:p-3 flex items-center justify-center">
                  {prog.icon}
                </span>
                <span className="font-semibold text-base sm:text-lg text-dark-blue">{prog.label}</span>
              </div>
              <button
                aria-label={`Give feedback for ${prog.label}`}
                className="ml-2 text-primary hover:text-white hover:bg-primary rounded-full p-2 transition-colors border border-primary group-hover:bg-primary group-hover:text-white"
                onClick={() => router.navigate({ to: prog.feedbackLink })}
              >
                <FaCommentDots className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default AboutSection;