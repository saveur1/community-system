import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Link } from "@tanstack/react-router";
import { FiUser, FiPhone, FiKey, FiChevronLeft, FiMapPin, FiMail, FiLinkedin, FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.7, type: "spring" as const },
  }),
};

const swipeVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    transition: { duration: 0.3 }
  })
};

function LoginPage() {
  const [form, setForm] = useState({
    phone: "",
    email: "",
    password: ""
  });
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(1);
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    if (loginMode === 'phone') {
      return form.phone.trim().length >= 10 && form.password.trim().length >= 6;
    } else {
      return form.email.trim().includes('@') && form.password.trim().length >= 6;
    }
  };

  const handleSwitchToEmail = () => {
    setDirection(1);
    setLoginMode('email');
  };

  const handleSwitchToPhone = () => {
    setDirection(-1);
    setLoginMode('phone');
  };

  const handleGoogleLogin = () => {
    toast.info("Google login integration coming soon!", { position: "top-center" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const errorMsg = loginMode === 'phone'
        ? "Please enter a valid phone number and password (min 6 characters)"
        : "Please enter a valid email and password (min 6 characters)";
      toast.error(errorMsg, { position: "top-center" });
      return;
    }

    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      const loginMethod = loginMode === 'phone' ? form.phone : form.email;
      toast.success(`Login successful with ${loginMethod}`, { position: "top-center" });
      // Redirect would happen here
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-dark-blue/10 flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-white rounded-xl border border-gray-300 shadow-lg w-full max-w-4xl flex flex-col lg:grid lg:grid-cols-5 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        custom={1}
      >
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex h-full col-span-2 rounded-l-xl relative bg-primary flex-col items-center p-8">
          <img
            src="/images/clouds-2x-right.png"
            alt="cloud shadow"
            className="w-auto h-full absolute right-0 top-0"
          />

          <div className="text-white relative z-10 flex flex-col justify-between h-full w-full">
            {/* Social Media Icons */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white/80 transition-colors">
                  <FiTwitter className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-white/80 transition-colors">
                  <FiInstagram className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-white/80 transition-colors">
                  <FiFacebook className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-white/80 transition-colors">
                  <FiLinkedin className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Inspirational Quote */}
            <div className="rounded-lg">
              <blockquote className="italic mb-2 pr-8">
                "Your voice shapes our community. Share your experiences and help improve government programs for everyone."
              </blockquote>
              <p className="text-sm text-white/80">
                - Community Listening Initiative
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="col-span-3 lg:col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none">
          <div className="w-full max-w-md mx-auto p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-title mb-2">
                Welcome back!
              </h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative overflow-hidden h-44">
                <AnimatePresence mode="wait" custom={direction}>
                  {loginMode === 'phone' ? (
                    <motion.div
                      key="phone"
                      custom={direction}
                      variants={swipeVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute top-0 left-0 w-full"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="tel"
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                              Password <span className="text-red-500">*</span>
                            </label>
                            <Link
                              to="/auth/forgot-password"
                              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                            >
                              Forgot Password?
                            </Link>
                          </div>
                          <div className="relative">
                            <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="password"
                              name="password"
                              value={form.password}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                              placeholder="Enter your password"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="email"
                      custom={direction}
                      variants={swipeVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute top-0 left-0 w-full"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                              Password <span className="text-red-500">*</span>
                            </label>
                            <Link
                              to="/auth/forgot-password"
                              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                            >
                              Forgot Password?
                            </Link>
                          </div>
                          <div className="relative">
                            <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="password"
                              name="password"
                              value={form.password}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                              placeholder="Enter your password"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-6 space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>

                {/* Alternative Login Options */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={loginMode === 'phone' ? handleSwitchToEmail : handleSwitchToPhone}
                    className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors"
                  >
                    <FiMail className="w-5 h-5 mr-2" />
                    {loginMode === 'phone' ? 'Email' : 'Phone'}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors"
                  >
                    <FaGoogle className="w-5 h-5 mr-2" />
                    Google
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/auth/signup"
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;