import {
  FiLinkedin,
  FiFacebook,
  FiInstagram,
  FiTwitter
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface LeftSignupCardProps {
  className?: string;
}

function LeftSignupCard({ className = "" }: LeftSignupCardProps) {
  const { t } = useTranslation();
  return (
    <div className={`hidden lg:flex col-span-2 bg-primary flex-col items-center p-8 relative ${className}`}>
      <img
        src="/images/clouds-2x-right.png"
        alt={t('signup.cloud_alt')}
        className="absolute right-0 top-0 h-full"
      />
      <div className="text-white relative z-10 flex flex-col justify-between h-full">
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">{t('signup.connect_with_us')}</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white/80" aria-label="Twitter">
              <FiTwitter size={24} />
            </a>
            <a href="#" className="hover:text-white/80" aria-label="Instagram">
              <FiInstagram size={24} />
            </a>
            <a href="#" className="hover:text-white/80" aria-label="Facebook">
              <FiFacebook size={24} />
            </a>
            <a href="#" className="hover:text-white/80" aria-label="LinkedIn">
              <FiLinkedin size={24} />
            </a>
          </div>
        </div>
        <div>
          <blockquote className="italic pr-8 mb-2">{t('signup.quote_text')}</blockquote>
          <p className="text-sm text-white/80">- {t('signup.quote_attrib')}</p>
        </div>
      </div>
    </div>
  );
}

export default LeftSignupCard;