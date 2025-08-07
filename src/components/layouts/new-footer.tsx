import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTimes } from 'react-icons/fa';
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi';
import { BsArrowUpRight } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-4 mt-4 px-6">
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        
        {/* Left Section - Navigation Links */}
        <div className="flex items-center space-x-8">
          <div className="text-gray-700 text-xs w-[300px]">
            &copy; { new Date().getFullYear() } {t('footer.copyright')}
          </div>
          
          <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer">
            <HiOutlineQuestionMarkCircle className="w-5 h-5" />
            <span className="text-sm font-medium w-[180px]">{t('footer.support')}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 cursor-pointer">
            <span className="text-sm font-medium">{t('footer.feedback')}</span>
            <BsArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Right Section - Actions and Social Media */}
        <div className="flex items-center gap-x-4">
          <div className="text-gray-700 text-xs w-[80px]">
            {t('footer.follow_us')}
          </div>
          <div className="flex gap-x-2 items-center">
            <button className="hover:bg-gray-100 rounded-full transition-colors">
            <FaTimes className="w-4 h-4 text-gray-600" />
          </button>
          
          <button className="hover:bg-gray-100 rounded-full transition-colors">
            <FaInstagram className="w-4 h-4 text-gray-600" />
          </button>
          
          <button className="hover:bg-gray-100 rounded-full transition-colors">
            <FaFacebookF className="w-4 h-4 text-gray-600" />
          </button>
          
          <button className="hover:bg-gray-100 rounded-full transition-colors">
            <FaLinkedinIn className="w-4 h-4 text-gray-600" />
          </button>
          </div>
          
          
          <div className="text-gray-700 text-sm">
            {t('footer.terms_of_use')}
          </div>
          
          <div className="text-gray-700 text-sm">
            {t('footer.programmes')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;