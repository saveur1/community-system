import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { FiUser, FiKey, FiMail } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

interface LoginFormProps {
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ className = "" }) => {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const { t } = useTranslation();
  const { login, isLoggingIn: isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const isEmail = form.email.includes('@');
    return isEmail && form.password.trim().length >= 6;
  };

  const handleGoogleLogin = () => {
    toast.info("Google login integration coming soon!", { position: "top-center" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please enter a valid email and password (min 6 characters)", { 
        position: "top-center" 
      });
      return;
    }
    await login({
      email: form.email,
      password: form.password
    });
  };

  return (
    <div className={`col-span-3 lg:col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none ${className}`}>
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
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Email or Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  placeholder="Enter your email or phone number"
                  required
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

          <div className="mt-6 space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {/* Alternative Login Options */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors"
              >
                <FaGoogle className="w-5 h-5 mr-2" />
                Continue with Google
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
  );
};

export default LoginForm;