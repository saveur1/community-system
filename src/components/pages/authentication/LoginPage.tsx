import { motion, type Variants } from "framer-motion";
import LoginLeftCard from "./login/login-left-card";
import LoginForm from "./login/login-form";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.7, type: "spring" as const },
  }),
};

function LoginPage() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-dark-blue/10 flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-white rounded-xl border border-gray-300 shadow-lg w-full max-w-4xl flex flex-col lg:grid lg:grid-cols-5 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        custom={1}
      >
        <LoginLeftCard />
        <LoginForm />
      </motion.div>
    </div>
  );
}

export default LoginPage;