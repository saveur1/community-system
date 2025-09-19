import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Link } from "@tanstack/react-router";
import { AiOutlineMail, AiOutlineArrowLeft } from "react-icons/ai";
import { FiLock, FiLinkedin, FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { useAuth } from '@/hooks/useAuth';

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();

  const validate = () => {
    return !email.trim() || !/\S+@\S+\.\S+/.test(email);
  };

  const error = validate();

  const showErrorToast = (message: string | string[]) => {
    const translated = Array.isArray(message) ? t(message as any) : t(message as any);
    toast.error(translated, {
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
      showErrorToast("forgot_password.email_required");
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        forgotPassword(
          { email },
          {
            onSuccess: () => resolve(),
            onError: () => reject(),
          }
        );
      });
      setIsSubmitted(true);
      toast.success(t("forgot_password.reset_success"), {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (_) {
      // Error toast handled in hook
    }
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
                <h3 className="text-xl font-bold mb-4">{t("forgot_password.connect_with_us")}</h3>
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
                  {t("forgot_password.quote_text")}
                </blockquote>
                <p className="text-sm text-white/80">
                  - {t("forgot_password.quote_attrib")}
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
              <h1 className="text-2xl font-bold text-title mb-4">{t("forgot_password.check_email_title")}</h1>
              <p className="text-gray-600 mb-6">
                {t("forgot_password.check_email_subtitle")} <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {t("forgot_password.spam_notice")}
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  {t("forgot_password.resend_email")}
                </button>
                <Link
                  to="/auth/login"
                  className="block text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  {t("forgot_password.back_to_login")}
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
              <h3 className="text-xl font-bold mb-4">{t("forgot_password.connect_with_us")}</h3>
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
                {t("forgot_password.quote_text")}
              </blockquote>
              <p className="text-sm text-white/80">
                - {t("forgot_password.quote_attrib")}
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
              <h1 className="text-2xl font-bold text-title mb-2">{t("forgot_password.title")}</h1>
              <p className="text-gray-600">{t("forgot_password.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  {t("forgot_password.email")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder={t("forgot_password.email_placeholder")}
                  />
                </div>
                {touched && error && (
                  <p className="text-red-500 text-sm mt-1">{t("forgot_password.email_required")}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                {t("forgot_password.reset_button")}
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