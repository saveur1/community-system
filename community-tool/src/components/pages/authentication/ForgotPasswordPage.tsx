import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "@tanstack/react-router";
import { AiOutlineMail, AiOutlineArrowLeft } from "react-icons/ai";
import { FiLock, FiLinkedin, FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.7, type: "spring" as const },
  }),
};

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();

  const validate = () => {
    return !email.trim() || !/\S+@\S+\.\S+/.test(email);
  };

  const error = validate();

  const showErrorToast = (message: string) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (error) {
      showErrorToast("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("Reset link sent to your email!", {
        position: "top-center",
        autoClose: 3000,
      });
    }, 1500);
  };

  if (isSubmitted) {
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

          {/* Right Side - Reset Form */}
          <div className="col-span-3 lg:col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none">
            <div className="w-full max-w-md mx-auto p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLock className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-title mb-4">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                If you don't see the email, check your spam folder. The link will expire in 1 hour.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Resend Email
                </button>
                <Link
                  to="/auth/login"
                  className="block text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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

        {/* Right Side - Forgot Password Form */}
        <div className="col-span-3 lg:col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none">
          <div className="w-full max-w-md mx-auto p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-title mb-2">Forgot Password?</h1>
              <p className="text-gray-600">Enter your email to reset your password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                {touched && error && (
                  <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/auth/login"
                className="text-primary hover:text-primary-dark font-medium transition-colors flex items-center justify-center gap-2"
              >
                <AiOutlineArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;