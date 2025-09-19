import { sectionVariants } from "..";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const LeftForm = () => {
    const { t } = useTranslation();

    return (
        <motion.div
            className="flex flex-col justify-between py-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            custom={-1}
          >
            {/* Our Contact Details */}
            <div>
              <h2 className="text-2xl font-light text-gray-700 mb-4">{t('contact.title')}</h2>
              <div className="space-y-2 text-gray-500">
                <p>Kimihurura Kigali-Gasabo</p>
                <p>KN14 Avenue, KG 621 ST#3 </p>
                <p>Phone: +250788307845</p>
                <p>
                  <a href="mailto: info@rwandainterfaith.org" className="text-primary hover:underline">
                    info@rwandainterfaith.org
                  </a>
                </p>
              </div>
            </div>

            {/* Can't Wait to Meet You */}
            <div>
              <h2 className="text-2xl font-light text-gray-700 mb-3">{t('contact.title2')}</h2>
              <div className="text-gray-500 leading-relaxed">
                <p>{t('contact.description')}</p>
              </div>
            </div>
          </motion.div>
    )
}

export default LeftForm;