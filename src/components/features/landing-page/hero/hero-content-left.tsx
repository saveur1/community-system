import { motion, type Variants } from "framer-motion";
import { FC } from "react";

interface HeroLeftProps {
    itemVariants: Variants
    handleScroll: (id: string) => void
}
const HeroContentLeft:FC<HeroLeftProps> = ({ handleScroll, itemVariants }) => {
    return (
        <div className="space-y-8 pr-5">
              <motion.div variants={ itemVariants } className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-none">
                  <span className="text-gray-800">Community</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">
                    Listening
                  </span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Amplifying community voices through faith-based collaboration.
                  Join our interfaith network promoting health, unity, and sustainable
                  development across Rwanda.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => handleScroll('feedback')}
                  className="px-8 py-4 bg-gradient-to-r cursor-pointer from-primary to-primary-dark text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Share Your Voice
                </motion.button>

                <motion.button
                  onClick={() => handleScroll('about')}
                  className="px-8 py-4 border-2 border-gray-300 cursor-pointer text-gray-700 font-semibold rounded-full hover:border-primary hover:text-primary transition-colors"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn About RICH
                </motion.button>
              </motion.div>
            </div>
    )
}

export default HeroContentLeft;