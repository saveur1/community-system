import { Link, useRouter } from "@tanstack/react-router"
import OptimizedImage from "../../ui/image"
import { SelectDropdown } from "../../ui/select"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FiMenu } from "react-icons/fi"
import { AiOutlineHome, AiOutlineInfoCircle, AiOutlineMessage, AiOutlineLogin } from "react-icons/ai"
import MobileHeader from "./mobile-header"
import ImigongoStarter from "../imigongo-starter"
import { useLatestRapidEnquiry } from "@/hooks/useSurveys"
import { MdOutlineFiberNew } from "react-icons/md"
import { TiFlashOutline } from "react-icons/ti"

const MainHeader = () => {
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<string>('home');
    const { data: latestRapidEnquiry } = useLatestRapidEnquiry();
    const repidEnquiry = latestRapidEnquiry?.result ?? null;

    // Keep active link in sync with current hash
    useEffect(() => {
        const updateFromHash = () => {
            const hash = (window.location.hash || '#home').replace('#', '') || 'home';
            setActiveSection(hash);
        };
        updateFromHash();
        window.addEventListener('hashchange', updateFromHash);
        return () => window.removeEventListener('hashchange', updateFromHash);
    }, []);

    // Helper to close menu on mobile
    const handleNavClick = () => setMobileOpen(false);

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
        handleNavClick(); // Close menu after selecting language
    };

    // Smooth scroll to section by id
    const handleSmoothScroll = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
        e.preventDefault();
        // If we're not on home, navigate to home with a hash so the landing page can scroll after mount
        if (router.state.location.pathname !== '/') {
            router.navigate({ to: '/', hash: id });
            setActiveSection(id);
        } else {
            // Already on home: set the hash to trigger the landing page hash listener
            window.location.hash = id;
            setActiveSection(id);
        }
        handleNavClick();
    };

    // Pass onClose to navLinks for mobile
    const navLinks = (
        <>
            <button
                className={`${activeSection === 'home' ? 'text-primary' : 'text-gray-500'} cursor-pointer hover:text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center gap-2 transition-colors`}
                onClick={e => handleSmoothScroll(e, "home")}
            >
                <AiOutlineHome size={18} />
                {t('navbar.home')}
            </button>
            <button
                className={`${activeSection === 'about' ? 'text-primary' : 'text-gray-500'} hover:text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer`}
                onClick={e => handleSmoothScroll(e, "about")}
            >
                <AiOutlineInfoCircle size={18} />
                {t('navbar.about')}
            </button>
            <button
                className={`${activeSection === 'feedback' ? 'text-primary' : 'text-gray-500'} cursor-pointer hover:text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center gap-2 transition-colors`}
                onClick={e => handleSmoothScroll(e, "feedback")}
            >
                <AiOutlineMessage size={18} />
                {t('navbar.feedback')}
            </button>
            <Link
                to="/our-impacts"
                className={`${activeSection === 'impacts' ? 'text-primary' : 'text-gray-500'} cursor-pointer hover:text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center gap-2 transition-colors`}
            >
                <TiFlashOutline size={18} />
                {t('navbar.impacts')}
            </Link>
            <SelectDropdown
                options={[
                    { label: "Kinyarwanda", value: "rw" },
                    { label: "English", value: "en" },
                ]}
                dropdownClassName="min-w-36"
                triggerClassName="py-1.5"
                value={language}
                onChange={handleLanguageChange}
                disableDarkMode={true}
            />
            <Link
                to="/auth/login"
                className="bg-primary text-white px-3 pt-1 pb-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition-colors"
                onClick={handleNavClick}
            >
                <AiOutlineLogin size={18} />
                {t('navbar.login')}
            </Link>
        </>
    );

    const hasAnsweredRapid = (() => {
        if (!repidEnquiry?.id) return false;
        try {
            return localStorage.getItem(`rapid_enquiry_answered_${repidEnquiry.id}`) === 'true';
        } catch (_) {
            return false;
        }
    })();

    return (
        <>
            <ImigongoStarter />
            {repidEnquiry && !hasAnsweredRapid && <div className="text-white bg-primary py-1 text-center flex items-center justify-center gap-2">
                <MdOutlineFiberNew size={40}  className="text-white font-bold"/>
                <span>{repidEnquiry.title} <a href={`${window.location.origin}/answers/${repidEnquiry.id}`} className="underline">Click here</a></span>
            </div>}
            <header className="w-full bg-white border-b border-gray-200 z-40 sticky top-0">
                <div className="px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo/TC on the left */}
                        <Link to="/">
                            <OptimizedImage
                                src="/images/web_logo.png"
                                alt="Logo"
                                width={170}
                                height={56}
                                className="h-16 w-[170px] max-sm:w-[130px] object-contain"
                            />
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden lg:flex items-center space-x-4 sm:space-x-6">
                            {navLinks}
                        </nav>

                        {/* Mobile hamburger */}
                        <button
                            className="lg:hidden rounded focus:outline-none dark:text-black"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open menu"
                        >
                            <FiMenu size={28} />
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <MobileHeader open={mobileOpen} onClose={() => setMobileOpen(false)} navLinks={navLinks} />
            </header>
        </>
    )
}

export default MainHeader