import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { FiUser, FiKey, FiMail, FiPhone } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { appUrl } from "@/utility/validateEnvs";

interface LoginFormProps {
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ className = "" }) => {
  const [loginType, setLoginType] = useState<'email' | 'phone' | 'username'>('phone');
  const [form, setForm] = useState({
    email: "",
    phone: "",
    username: "",
    password: ""
  });
  const { t, i18n } = useTranslation();
  const { login, isLoggingIn: isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // const validateForm = () => {
  //   if (loginType === 'email') {
  //     const isEmail = form.email.includes('@');
  //     return isEmail && form.password.trim().length >= 6;
  //   } else if (loginType === 'phone') {
  //     const isPhone = form.phone.trim().length >= 10;
  //     return isPhone && form.password.trim().length >= 6;
  //   } else {
  //     return form.username.trim().length >= 3 && form.password.trim().length >= 6;
  //   }
  // };

  const handleGoogleLogin = () => {
    window.location.href=`${appUrl}/api/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Localized validation
    if (loginType === 'email') {
      const isEmail = form.email.includes('@');
      if (!isEmail) {
        toast.error(t('login.email_required'), { position: 'top-center' });
        return;
      }
      if (form.password.trim().length < 6) {
        toast.error(t('login.password_required'), { position: 'top-center' });
        return;
      }
    } else {
      const isPhone = form.phone.trim().length >= 10;
      if (!isPhone) {
        toast.error(t('login.phone_required'), { position: 'top-center' });
        return;
      }
      if (form.password.trim().length < 6) {
        toast.error(t('login.password_required'), { position: 'top-center' });
        return;
      }
    }
    
    await login({
      type: loginType,
      phone: form.phone,
      email: form.email,
      // username: form.username,
      password: form.password
    });
  };

  const switchLoginType = (type: 'email' | 'phone' | 'username') => {
    setLoginType(type);
    // Clear form when switching
    setForm({
      email: "",
      phone: "",
      username: "",
      password: ""
    });
  };

  const formVariants = {
    enter: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const
      }
    },
    exit: {
      x: -20,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn" as const
      }
    }
  };

  const buttonVariants = {
    tap: { scale: 0.98 },
    hover: { scale: 1.02 }
  };

  return (
    <div className={`col-span-3 lg:col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none ${className}`}>
      <div className={`w-full ${i18n.language === 'en' ? 'max-w-md' : 'max-w-lg'} mx-auto p-6 bg-white rounded-2xl overflow-hidden`}>
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-title mb-2">
            {t('login.title')}
          </h1>
        </div>

        {/* Login Type Toggle */}
        <div className="mb-6">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <motion.button
              type="button"
              onClick={() => switchLoginType('phone')}
              className={`flex-1 flex items-center justify-center py-2 px-2 rounded-md font-medium text-sm transition-colors ${
                loginType === 'phone'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPhone className="w-4 h-4 mr-1" />
              {t('login.phone')}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => switchLoginType('email')}
              className={`flex-1 flex items-center justify-center py-2 px-2 rounded-md font-medium text-sm transition-colors ${
                loginType === 'email'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiMail className="w-4 h-4 mr-1" />
              {t('login.email')}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => switchLoginType('username')}
              className={`flex-1 flex items-center justify-center py-2 px-2 rounded-md font-medium text-sm transition-colors ${
                loginType === 'username'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiUser className="w-4 h-4 mr-1" />
              {t('login.username', 'Username')}
            </motion.button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={loginType}
              variants={formVariants}
              initial="exit"
              animate="enter"
              exit="exit"
              className="space-y-4"
            >
              <div>
                <div className="space-y-4">
                  {loginType === 'email' ? (
                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        {t('login.email')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder={t('login.email_placeholder')}
                        />
                      </div>
                    </div>
                  ) : loginType === 'phone' ? (
                    <div className="space-y-1">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        {t('login.phone')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder={t('login.phone_placeholder')}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        {t('login.username', 'Username')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="username"
                          name="username"
                          type="text"
                          autoComplete="username"
                          required
                          value={form.username}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder={t('login.username_placeholder', 'Enter your username')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    {t('login.password')} <span className="text-red-500">*</span>
                  </label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    {t('login.forgot_password')}
                  </Link>
                </div>
                <div className="relative">
                  <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder={t('login.password_placeholder')}
                    required
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 space-y-4">
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {isLoading ? t('login.signing_in') : t('login.sign_in')}
            </motion.button>

            {/* Google Login Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('login.or_continue_with')}</span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              {t('login.continue_with_google')}
            </motion.button>
          </div>
        </form>

        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-600">
            {t('login.no_account')}{" "}
            <Link
              to="/auth/signup"
              className="text-primary hover:text-primary-dark font-medium transition-colors"
            >
              {t('login.sign_up')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;