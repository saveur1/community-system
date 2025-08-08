import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Link } from "@tanstack/react-router";
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone } from "react-icons/ai";
import { FiUserPlus, FiChevronRight, FiChevronLeft } from "react-icons/fi";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Fixed TypeScript type for transition
const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30
};

function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    hasEmail: false,
    phone: "",
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
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
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
        return true;
      case 2:
        // Skip validation for email since it's optional
        return true;
      case 3:
        if (!form.phone.trim() || form.phone.length < 10) {
          toast.error("Please enter a valid phone number (at least 10 digits)");
          return false;
        }
        return true;
      case 4:
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Account created successfully!", {
          position: "top-center",
          autoClose: 3000,
        });
      }, 1500);
    }
  };

  const userTypes = [
    { value: "community", label: "Community Member", description: "Community health advisors, local influencers, school directors" },
    { value: "religious", label: "Religious Leader", description: "Regional influencers, pastors, church representatives" },
    { value: "stakeholder", label: "Stakeholder", description: "RICH, UNICEF, RBC, EPI Supervisors" },
    { value: "other", label: "Other", description: "Specify your role if not listed above" }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 to-dark-blue/5 flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-white rounded-xl border border-primary/20 shadow-lg p-8 max-w-md w-full"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={springTransition}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-title mb-2">Create Your Account</h1>
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-8 h-1 ${
                      currentStep > step ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`relative ${currentStep === 4 ?(form.userType === "other"? "h-64" : "h-56") : "h-40"} overflow-hidden`}>
            <AnimatePresence custom={currentStep} mode="wait">
              {/* Step 1: Full Name */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={sectionVariants}
                  transition={springTransition}
                  className="absolute top-0 left-0 w-full"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm text-gray-500 mb-3">Enter your complete first and last name as it appears on official documents</p>
                      <div className="relative">
                        <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                  </div>
                </motion.div>
              )}

              {/* Step 2: Email */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={sectionVariants}
                  transition={springTransition}
                  className="absolute top-0 left-0 w-full"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Email Address (Optional)
                      </label>
                      <p className="text-sm text-gray-500 mb-3">If you have an email, enter it here for account recovery and notifications</p>
                      <div className="relative">
                        <AiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                  </div>
                </motion.div>
              )}

              {/* Step 3: Phone Number */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={sectionVariants}
                  transition={springTransition}
                  className="absolute top-0 left-0 w-full"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm text-gray-500 mb-3">Enter your mobile number - we'll send a verification code to this number</p>
                      <div className="relative">
                        <AiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                          placeholder="250 123 456 789"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: User Type */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={sectionVariants}
                  transition={springTransition}
                  className="absolute top-0 left-0 w-full"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Who are you? <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm text-gray-500 mb-3">Select the option that best describes your role in the community</p>
                      <div className="space-y-3">
                        {userTypes.map((type) => (
                          <div key={type.value} className="flex items-start">
                            <input
                              type="radio"
                              id={type.value}
                              name="userType"
                              value={type.value}
                              checked={form.userType === type.value}
                              onChange={handleRadioChange}
                              className="h-4 w-4 text-primary focus:ring-primary border-primary rounded-full mt-1"
                            />
                            <div className="ml-3">
                              <label
                                htmlFor={type.value}
                                className="block text-sm text-gray-700"
                              >
                                {type.label}
                              </label>
                              {/* <p className="text-xs text-gray-500">{type.description}</p> */}
                            </div>
                          </div>
                        ))}
                        {form.userType === "other" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.2 }}
                            className="ml-7 mt-2"
                          >
                            <input
                              type="text"
                              name="otherType"
                              value={form.otherType}
                              onChange={handleChange}
                              className="w-full pl-3 pr-4 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm"
                              placeholder="Please describe your role"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
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
                className="flex items-center text-primary py-2 px-4 rounded-lg font-medium hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors"
              >
                <FiChevronLeft className="mr-1" />
                Back
              </button>
            ) : (
              <div></div> // Empty div to maintain space
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                Next
                <FiChevronRight className="ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary hover:text-primary-dark font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;