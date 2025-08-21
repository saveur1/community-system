// LoginLeftCard.tsx
import React from "react";
import { FiLinkedin, FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const LoginLeftCard: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="hidden lg:flex h-full col-span-2 rounded-l-xl relative bg-primary flex-col items-center p-8">
      <img
        src="/images/clouds-2x-right.png"
        alt={t('login.cloud_alt')}
        className="w-auto h-full absolute right-0 top-0"
      />

      <div className="text-white relative z-10 flex flex-col justify-between h-full w-full">
        {/* Social Media Icons */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">{t('login.connect_with_us')}</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white/80 transition-colors">
              <FiTwitter className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-white/80 transition-colors">
              <FiInstagram className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-white/80 transition-colors">
              <FiFacebook className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-white/80 transition-colors">
              <FiLinkedin className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="rounded-lg">
          <blockquote className="italic mb-2 pr-8">
            {t('login.quote_text')}
          </blockquote>
          <p className="text-sm text-white/80">- {t('login.quote_attrib')}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginLeftCard;