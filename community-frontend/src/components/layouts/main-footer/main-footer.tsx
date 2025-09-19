import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTimes } from 'react-icons/fa';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi';
import { BsArrowUpRight } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import TopFooterBg from './top-footer-bg';
import ImigongoStarter from '../imigongo-starter';

const FooterMain = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-6 px-4 sm:px-6 bg-white border-t border-gray-100">
      <div className="max-w-8xl mx-auto">
        {/* Mobile Layout - Stacked and Centered */}
        <div className="flex flex-col items-center space-y-4 md:hidden">
          {/* Copyright */}
          <div className="text-gray-700 text-xs text-center">
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
          </div>
          
          {/* Support and Feedback Links - Centered */}
          <div className="flex flex-col items-center space-y-3 w-full">
            <div className="flex items-center space-x-2 text-primary hover:text-primary-dark cursor-pointer justify-center">
              <HiOutlineQuestionMarkCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{t('footer.support')}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 cursor-pointer justify-center">
              <span className="text-sm font-medium">{t('footer.feedback')}</span>
              <BsArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* Social Media - Centered */}
          <div className="flex flex-col items-center space-y-3 w-full">
            <div className="text-gray-700 text-xs">
              {t('footer.follow_us')}
            </div>
            <div className="flex gap-x-3 justify-center">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaTimes className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaInstagram className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaFacebookF className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaLinkedinIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Bottom Links - Centered */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <div className="text-gray-700 text-sm">
              {t('footer.terms_of_use')}
            </div>
            <div className="text-gray-700 text-sm">
              {t('footer.developed')}
            </div>
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left Section - Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="text-gray-700 text-xs min-w-[200px]">
              &copy; {new Date().getFullYear()} {t('footer.copyright')}
            </div>
            
            <div className="flex items-center space-x-2 text-primary hover:text-primary-dark cursor-pointer">
              <HiOutlineQuestionMarkCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{t('footer.support')}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 cursor-pointer">
              <span className="text-sm font-medium">{t('footer.feedback')}</span>
              <BsArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* Right Section - Actions and Social Media */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="text-gray-700 text-xs">
              {t('footer.follow_us')}
            </div>
            <div className="flex gap-x-2 items-center">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaTimes className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaInstagram className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaFacebookF className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaLinkedinIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="text-gray-700 text-sm">
              {t('footer.terms_of_use')}
            </div>
            
            <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{__html:t('footer.developed')}} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function Footer(){
  return (
    <>
      <TopFooterBg />
      <FooterMain />
      <ImigongoStarter />
    </>
  )
} ;