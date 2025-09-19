import { motion } from "framer-motion";
import LeftSignupCard from "./signup/signup-left-card";
import SignupForm from "./signup/signup-form";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

function SignupPage() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-dark-blue/10 flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-white rounded-xl border border-gray-300 shadow-lg w-full max-w-6xl flex flex-col lg:grid lg:grid-cols-5 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <LeftSignupCard />
        <SignupForm />
      </motion.div>
    </div>
  );
}

export default SignupPage;