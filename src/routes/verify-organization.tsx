import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Link } from '@tanstack/react-router';
import { AiOutlineUser, AiOutlinePhone } from 'react-icons/ai';
import { FiLock, FiLinkedin, FiFacebook, FiInstagram, FiTwitter, FiCheckCircle } from 'react-icons/fi';
import { useOrganizationSignup } from '@/hooks/useOrganizationSignup';
import MainHeader from '@/components/layouts/main-header';
import Footer from '@/components/layouts/main-footer/main-footer';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.7, type: "spring" as const },
  }),
};

function VerifyOrganizationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    password: false,
  });
  const { token } = Route.useSearch();
  const signupMutation = useOrganizationSignup();
  const { t } = useTranslation();

  const validate = () => {
    return {
      name: !name.trim(),
      phone: !phone.trim(),
      password: !password.trim() || password.length < 6,
    };
  };

  const errors = validate();

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
    setTouched({ name: true, phone: true, password: true });

    if (Object.values(errors).some(error => error)) {
      showErrorToast("Please fill in all required fields correctly");
      return;
    }

    if (!token) {
      showErrorToast('Invalid verification link');
      return;
    }

    setIsSubmitting(true);
    try {
      await signupMutation.mutateAsync({
        token,
        name,
        password,
        phone,
        organizationId: '', // This should come from the token or be handled by the API
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-dark-blue/10 flex items-center justify-center px-4 py-8">
        <motion.div
          className="bg-white rounded-xl border border-gray-300 shadow-lg w-full max-w-md text-center p-8"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          custom={1}
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Verification Link</h1>
          <p className="text-gray-600 mb-6">This verification link is invalid or has expired.</p>
          <Link
            to="/auth/login"
            className="inline-block bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <MainHeader />
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
                <h3 className="text-xl font-bold mb-4">Connect with us</h3>
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

              {/* Welcome Message */}
              <div className="rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Welcome to Your Organization</h2>
                <p className="text-white/90 mb-4">
                  Complete your account setup to get started with your organization's journey.
                </p>
                <blockquote className="italic mb-2 pr-8">
                  "Success is not final, failure is not fatal: it is the courage to continue that counts."
                </blockquote>
                <p className="text-sm text-white/80">
                  - Winston Churchill
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Verification Form */}
          <div className="col-span-3 lg:col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none">
            <div className="w-full max-w-md mx-auto p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="w-8 h-8 text-success" />
                </div>
                <h1 className="text-2xl font-bold text-title mb-2">Set Up Your Account</h1>
                <p className="text-gray-600">Complete your organization account setup</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched({ ...touched, name: true })}
                      className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-sm mt-1">Full name is required</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <AiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => setTouched({ ...touched, phone: true })}
                      className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  {touched.phone && errors.phone && (
                    <p className="text-red-500 text-sm mt-1">Phone number is required</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute('/verify-organization')({
  component: VerifyOrganizationPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string,
  }),
});