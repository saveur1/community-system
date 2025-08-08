import { motion, AnimatePresence } from "framer-motion"
import OptimizedImage from "../../ui/image"
import { FiX } from "react-icons/fi"

interface MobileHeaderProps {
    open: boolean
    onClose: () => void
    navLinks: React.ReactNode
}

const MobileHeader = ({ open, onClose, navLinks }: MobileHeaderProps) => (
    <AnimatePresence>
        {open && (
            <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg md:hidden rounded-b-xl"
                style={{ maxHeight: "70vh" }}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-300">
                    <OptimizedImage
                        src="/images/web_logo.png"
                        alt="Logo"
                        width={130}
                        height={40}
                        className="max-h-10 w-[130px]"
                    />
                    <button
                        className="p-2 rounded focus:outline-none"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <FiX size={28} className="text-title"/>
                    </button>
                </div>
                <nav className="flex flex-col gap-4 px-6 py-6">
                    {navLinks}
                </nav>
            </motion.div>
        )}
    </AnimatePresence>
)

export default MobileHeader