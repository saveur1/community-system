import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Link } from "@tanstack/react-router";
import useAuth from "@/hooks/useAuth";
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineLock
} from "react-icons/ai";
import {
  FiUserPlus,
  FiChevronRight,
  FiChevronLeft
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

interface SignupFormProps {
  className?: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  userType: string;
  otherType: string;
}

function SignupForm({ className = "" }: SignupFormProps) {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    userType: "",
    otherType: ""
  });

  const [currentStep, setCurrentStep] = useState(1);
  const { t } = useTranslation();
  const { signup, isSigningUp: isLoading } = useAuth();

  const userTypes = [
    { 
      title: "Community",
      options: [
        { value: "local_citizen", label: "Local Citizen" },
        { value: "health_worker", label: "Community Health Worker" },
        { value: "local_influencer", label: "Local Influencer" },
        { value: "school_director", label: "School Director" },
      ]
    },
    { 
      title: "Religious Leaders",
      options: [
        { value: "religious_influencer", label: "Religious Influencer" },
        { value: "pastor", label: "Pastor" },
        { value: "church_mosque_rep", label: "Church/Mosque Representative" }
      ]
    },
    { 
      title: "Health Services Providers",
      options: [
        { value: "nurse", label: "Nurse" },
        { value: "local_health_center", label: "Local Health Center" },
        { value: "epi_supervisor", label: "EPI Supervisor" }
      ]
    },
    { 
      title: "Stakeholders",
      options: [
        { value: "unicef", label: "UNICEF" },
        { value: "rbc", label: "RBC" }
      ]
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, userType: value });
    showVerificationWarning(value);
  };

  const showVerificationWarning = (userType: string) => {
    const communityTypes = ['local_citizen'];
    if (!communityTypes.includes(userType)) {
      toast.dismiss();
      toast.warning('You will need to be verified before logging in', {
        autoClose: false,
        theme: "colored",
        closeOnClick: true,
        draggable: true,
        closeButton: true,
        position: "bottom-center"
      });
    } else {
      toast.dismiss();
    }
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

  const nextStep = (e: any) => {
    e.preventDefault();
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      return;
    }
    
    if (!validateStep(currentStep)) return;

    const userData = {
      name: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      roleType: form.userType === 'other' ? form.otherType : form.userType
    };

    await signup(userData);
  };

  const renderStep1 = () => (
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
              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg outline-primary/50"
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
              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg outline-primary/50"
              placeholder="(+250) 783 250 033"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
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
              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg outline-primary/50"
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
              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg outline-primary/50"
              placeholder="Enter your password"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
      className="absolute top-0 left-0 w-full"
    >
      <label className="block mb-3 text-lg font-medium text-gray-700">Who are you? *</label>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {userTypes.map((group, index) => (
          <div key={index} className="mb-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{group.title}</h3>
            <div className="space-y-1">
              {group.options.map((option) => (
                <div key={option.value}>
                  <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="userType"
                      value={option.value}
                      checked={form.userType === option.value}
                      onChange={handleRadioChange}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700 text-sm">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {form.userType === "other" && (
        <div className="mt-4">
          <input
            type="text"
            name="otherType"
            value={form.otherType}
            onChange={handleChange}
            className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
            placeholder="Specify your role"
          />
        </div>
      )}
    </motion.div>
  );


  return (
    <div className={`col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none ${className}`}>
      <div className={`${currentStep === 3 ? "max-w-2xl" : "max-w-md"} mx-auto p-6 sm:p-8`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <div className="flex justify-center mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
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
          <div className={`relative ${currentStep === 3 ? "h-[440px]" : "h-[180px]"} overflow-hidden`}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </AnimatePresence>
          </div>

          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center text-primary hover:text-primary-dark transition-colors"
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
                className="flex cursor-pointer items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                Next <FiChevronRight className="ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex cursor-pointer items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Create Account"}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary hover:text-primary-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;