import { Link } from "@tanstack/react-router"
import OptimizedImage from "../ui/image"
import { SelectDropdown } from "../ui/select"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const MainHeader = () => {
    
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);

    const handleLanguageChange = (lang: string)=> {
        console.log(lang);
        setLanguage(lang);

        i18n.changeLanguage(lang)
        localStorage.setItem('lang', lang)
    }
    return (
        <header className="w-full bg-white border-b border-gray-200 z-50 sticky top-0">
            <div className="max-w-8xl mx-auto">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/TC on the left */}
                    <div>
                        <OptimizedImage
                            src="/images/web_logo.png"
                            alt="Logo"
                            width={200}
                            height={56}
                            className="h-16 w-52"
                        />
                    </div>
                    
                    {/* Navigation links on the right */}
                    <nav className="flex items-center space-x-4 sm:space-x-6">
                        <Link 
                            to="/" 
                            className="text-primary hover:text-primary px-2 py-1 rounded-md text-sm font-medium transition-colors"
                            activeProps={{ className: "text-blue-600 font-semibold" }}
                        >
                            { t('navbar.home') }
                        </Link>
                        <Link 
                            to="/login" 
                            className="text-gray-500 hover:text-primary px-2 py-1 rounded-md text-sm font-medium transition-colors"
                            activeProps={{ className: "text-blue-600 font-semibold" }}
                        >
                            { t('navbar.announcements') }
                        </Link>
                        <Link 
                            to="/login" 
                            className="text-gray-500 hover:text-primary px-2 py-1 rounded-md text-sm font-medium transition-colors"
                            activeProps={{ className: "text-blue-600 font-semibold" }}
                        >
                           { t('navbar.feedback') }
                        </Link>
                        <SelectDropdown 
                            options={[{label: "Kinyarwanda", value: "rw"},
                                {label: "English", value: "en"},
                                {label: "Swahili", value: "sw"},
                                {label: "Francais", value: "fr"}
                            ]}
                            dropdownClassName="min-w-36"
                            triggerClassName="py-1.5"
                            value={ language }
                            onChange={ handleLanguageChange }
                        />
                        <Link 
                            to="/" 
                            className="bg-primary text-white px-3 pt-1 pb-1.5 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
                        >
                            { t('navbar.login') }
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default MainHeader