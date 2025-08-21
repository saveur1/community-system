import { Link, useRouter } from "@tanstack/react-router"
import OptimizedImage from "../../ui/image"
import { SelectDropdown } from "../../ui/select"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FiMenu } from "react-icons/fi"
import { AiOutlineHome, AiOutlineInfoCircle, AiOutlineSound, AiOutlineMessage, AiOutlineLogin } from "react-icons/ai"
import { animate } from "framer-motion"
import MobileHeader from "./mobile-header"
import ImigongoStarter from "../imigongo-starter"

const MainHeader = () => {
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();

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
        } else {
            // Already on home: set the hash to trigger the landing page hash listener
            window.location.hash = id;
        }
        handleNavClick();
    };

    // Pass onClose to navLinks for mobile
    const navLinks = (
        <>
            <button
                className="text-primary cursor-pointer hover:text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                onClick={e => handleSmoothScroll(e, "home")}
            >
                <AiOutlineHome size={18} />
                {t('navbar.home')}
            </button>
            <button
                className="text-gray-500 hover:text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
                onClick={e => handleSmoothScroll(e, "about")}
            >
                <AiOutlineInfoCircle size={18} />
                {t('navbar.about')}
            </button>
            <button
                className="text-gray-500 cursor-pointer hover:text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                onClick={e => handleSmoothScroll(e, "anncouncements")}
            >
                <AiOutlineSound size={18} />
                {t('navbar.announcements')}
            </button>
            <button
                className="text-gray-500 cursor-pointer hover:text-primary px-2 py-1 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                onClick={e => handleSmoothScroll(e, "feedback")}
            >
                <AiOutlineMessage size={18} />
                {t('navbar.feedback')}
            </button>
            <SelectDropdown
                options={[
                    { label: "Kinyarwanda", value: "rw" },
                    { label: "English", value: "en" },
                    { label: "Swahili", value: "sw" },
                    { label: "Francais", value: "fr" }
                ]}
                dropdownClassName="min-w-36"
                triggerClassName="py-1.5"
                value={language}
                onChange={handleLanguageChange}
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

    return (
        <>
            <ImigongoStarter />
            <header className="w-full bg-white border-b border-gray-200 z-50 sticky top-0">
                <div className="max-w-8xl mx-auto">
                    <div className="flex items-center justify-between h-16 px-4">
                        {/* Logo/TC on the left */}
                        <Link to="/">
                            <OptimizedImage
                                src="/images/web_logo.png"
                                alt="Logo"
                                width={200}
                                height={56}
                                className="h-16 w-[200px] max-sm:w-[130px] object-contain"
                            />
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden lg:flex items-center space-x-4 sm:space-x-6">
                            {navLinks}
                        </nav>

                        {/* Mobile hamburger */}
                        <button
                            className="lg:hidden rounded focus:outline-none"
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