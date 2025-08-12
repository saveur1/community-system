import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Link } from "@tanstack/react-router";
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineLock
} from "react-icons/ai";
import {
  FiUserPlus,
  FiChevronRight,
  FiChevronLeft,
  FiLinkedin,
  FiFacebook,
  FiInstagram,
  FiTwitter
} from "react-icons/fi";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30
};

function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    userType: "",
    otherType: ""
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, userType: e.target.value });
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!form.fullName.trim()) {
          toast.error("Please enter your full name");
          return false;
        }
        if (!form.phone.trim() || form.phone.length < 10) {
          toast.error("Please enter a valid phone number");
          return false;
        }
        return true;
      case 2:
        if (!form.email.trim() || !form.email.includes('@')) {
          toast.error("Please enter a valid email address");
          return false;
        }
        if (!form.password.trim() || form.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return false;
        }
        return true;
      case 3:
        if (!form.userType) {
          toast.error("Please select who you are");
          return false;
        }
        if (form.userType === "other" && !form.otherType.trim()) {
          toast.error("Please specify your role");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Account created successfully!", { position: "top-center" });
      }, 1500);
    }
  };

  const userTypes = [
    { value: "community", label: "Community Member" },
    { value: "religious", label: "Religious Leader" },
    { value: "stakeholder", label: "Stakeholder" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/10 to-dark-blue/10 flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-white rounded-xl border border-gray-300 shadow-lg w-full max-w-4xl flex flex-col lg:grid lg:grid-cols-5 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        {/* Left Side - Branding */}
        <div className="hidden lg:flex col-span-2 bg-primary flex-col items-center p-8 relative">
          <img
            src="/images/clouds-2x-right.png"
            alt="cloud shadow"
            className="absolute right-0 top-0 h-full"
          />
          <div className="text-white relative z-10 flex flex-col justify-between h-full">
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white/80"><FiTwitter size={24} /></a>
                <a href="#" className="hover:text-white/80"><FiInstagram size={24} /></a>
                <a href="#" className="hover:text-white/80"><FiFacebook size={24} /></a>
                <a href="#" className="hover:text-white/80"><FiLinkedin size={24} /></a>
              </div>
            </div>
            <div>
              <blockquote className="italic pr-8 mb-2">
                "Join our community and be part of the change."
              </blockquote>
              <p className="text-sm text-white/80">- Community Initiative</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none">
          <div className="max-w-md mx-auto p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUserPlus className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
              <div className="flex justify-center mb-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                        }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 h-1 ${currentStep > step ? "bg-primary" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={`relative ${(currentStep==3)? (form.userType === "other"? "h-60": "h-44") : "h-44"} overflow-hidden`}>
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={sectionVariants}
                      transition={springTransition}
                      className="absolute top-0 left-0 w-full"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Full Name *</label>
                          <div className="relative">
                            <AiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              name="fullName"
                              value={form.fullName}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number *</label>
                          <div className="relative">
                            <AiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={sectionVariants}
                      transition={springTransition}
                      className="absolute top-0 left-0 w-full"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Email Address *</label>
                          <div className="relative">
                            <AiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                              placeholder="you@example.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">Password *</label>
                          <div className="relative">
                            <AiOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={sectionVariants}
                      transition={springTransition}
                      className="absolute top-0 left-0 w-full"
                    >
                      <label className="block mb-3 text-sm font-medium text-gray-700">Who are you? *</label>
                      <div className="space-y-3">
                        {userTypes.map((type) => (
                          <label key={type.value} className="block">
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                value={type.value}
                                className="outline-none w-4 h-4 text-primary"
                                checked={form.userType === type.value}
                                onChange={handleRadioChange}
                              />
                              <span className="text-gray-700">{type.label}</span>
                            </div>
                          </label>
                        ))}
                        {form.userType === "other" && (
                          <div className="mt-3">
                            <input
                              type="text"
                              name="otherType"
                              value={form.otherType}
                              onChange={handleChange}
                              className="w-full border outline-none border-primary/30 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                              placeholder="Specify your role"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center text-primary"
                  >
                    <FiChevronLeft className="mr-1" /> Back
                  </button>
                ) : (
                  <span></span>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                  >
                    Next <FiChevronRight className="ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Creating..." : "Create Account"}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;
