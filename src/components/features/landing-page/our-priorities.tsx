import { motion } from "framer-motion";
import { FaChild, FaUsers, FaShieldAlt, FaBrain, FaCommentDots } from 'react-icons/fa';
import { sectionVariants } from ".";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const OurPriorities = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const priorities = [
    {
      icon: <FaChild className="text-success w-6 h-6" />,
      title: t('priorities.child_family_title'),
      description: t('priorities.child_family_desc'),
      feedbackLink: "/feedback/child-family",
    },
    {
      icon: <FaUsers className="text-success w-6 h-6" />,
      title: t('priorities.reproductive_health_title'),
      description: t('priorities.reproductive_health_desc'),
      feedbackLink: "/feedback/reproductive-health",
    },
    {
      icon: <FaShieldAlt className="text-success w-6 h-6" />,
      title: t('priorities.disease_prevention_title'),
      description: t('priorities.disease_prevention_desc'),
      feedbackLink: "/feedback/disease-prevention",
    },
    {
      icon: <FaBrain className="text-success w-6 h-6" />,
      title: t('priorities.mental_health_title'),
      description: t('priorities.mental_health_desc'),
      feedbackLink: "/feedback/mental-health",
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
        <motion.p className="text-base sm:text-lg text-justify text-gray-700 mb-8" dangerouslySetInnerHTML={{ __html: t('about.about_description') }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {priorities.map((priority) => (
            <div key={priority.title} className="bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-success bg-success/10 p-3 rounded-full">
                    {priority.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-title mb-1">{priority.title}</h3>
                    <p className="text-sm text-gray-600">{priority.description}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border rounded-b-lg border-gray-200">
                <button 
                  onClick={() => router.navigate({ to: priority.feedbackLink })}
                  className="text-primary font-medium text-sm hover:text-primary-dark flex items-center gap-2"
                >
                  <span>{t('button.learn_more')}</span>
                  <FaCommentDots className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default OurPriorities;