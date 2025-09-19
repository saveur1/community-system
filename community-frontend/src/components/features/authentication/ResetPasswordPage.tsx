import React, { useState } from "react";
import { motion } from "framer-motion";
// import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "@tanstack/react-router";
import { AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiShield, FiLinkedin, FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { useAuth } from '@/hooks/useAuth';
import { useSearch } from '@tanstack/react-router';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.7, type: "spring" as const },
  }),
};

function ResetPasswordPage() {
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const search = useSearch({ from: '/auth/reset-password' });
  const token = (search as any)?.token || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    return {
      password: !form.password.trim() || form.password.length < 6,
      confirmPassword: !form.confirmPassword.trim() || form.password !== form.confirmPassword,
    };
  };

  const errors = validate();
  const isValid = !errors.password && !errors.confirmPassword;

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
    setTouched({ password: true, confirmPassword: true });

    if (!isValid) {
      if (errors.password) showErrorToast("Password must be at least 6 characters");
      if (errors.confirmPassword) showErrorToast("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise<void>((resolve, reject) => {
        resetPassword(
          { token, newPassword: form.password },
          {
            onSuccess: () => resolve(),
            onError: () => reject(),
          }
        );
      });
      setIsSuccess(true);
      toast.success("Password reset successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (_) {
      // error handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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

          {/* Right Side - Success Form */}
          <div className="col-span-3 lg:col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none">
            <div className="w-full max-w-md mx-auto p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-title mb-4">Password Reset Successfully</h1>
              <p className="text-gray-600 mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Link
                to="/auth/login"
                className="inline-block bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                Sign In
              </Link>
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

        {/* Right Side - Reset Password Form */}
        <div className="col-span-3 lg:col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none">
          <div className="w-full max-w-md mx-auto p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-title mb-2">Reset Your Password</h1>
              <p className="text-gray-600">Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={() => setTouched({ ...touched, password: true })}
                    className="w-full pl-10 pr-12 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <AiOutlineEyeInvisible className="w-5 h-5" /> : <AiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                    className="w-full pl-10 pr-12 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <AiOutlineEyeInvisible className="w-5 h-5" /> : <AiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include at least one number</li>
                  <li>• Include at least one special character</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/auth/login"
                className="text-primary hover:text-primary-dark font-medium transition-colors"
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

export default ResetPasswordPage;