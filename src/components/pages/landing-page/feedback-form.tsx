import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sectionVariants } from ".";

function FeedbackForm() {
  const [form, setForm] = useState({
    name: "",
    programmes: [] as string[], // Changed to array for multiple selection
    otherProgramme: "", // New field for "Others" input
    message: ""
  });

  const [touched, setTouched] = useState({
    name: false,
    programmes: false,
    message: false
  });

  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleProgrammeChange = (value: string) => {
    setTouched({ ...touched, programmes: true });
    setForm(prev => {
      const newProgrammes = prev.programmes.includes(value)
        ? prev.programmes.filter(p => p !== value)
        : [...prev.programmes, value];
      return { ...prev, programmes: newProgrammes };
    });
  };

  const validate = () => {
    return {
      name: !form.name.trim(),
      programmes: form.programmes.length === 0 && !form.otherProgramme.trim(),
      message: !form.message.trim()
    };
  };

  const errors = validate();
  const isValid = !errors.name && !errors.programmes && !errors.message;

  const showErrorToast = (message: string) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, programmes: true, message: true });

    if (!isValid) {
      if (errors.name) showErrorToast(t('validation.name_required'));
      if (errors.programmes) showErrorToast(t('validation.programme_required'));
      if (errors.message) showErrorToast(t('validation.message_required'));
      return;
    }

    // Form is valid - proceed with submission
    setSubmitted(true);
    setForm({ name: "", programmes: [], otherProgramme: "", message: "" });
    toast.success(t('feedback.success_message'), {
      position: "top-center",
      autoClose: 3000,
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Programme options for checkboxes
  const programmeOptions = [
    { value: "HIV/AIDS", label: "HIV/AIDS" },
    { value: "Immunization", label: "Immunization (SUGIRA MWANA)" },
    { value: "Mental Health", label: "Mental Health (Baho Neza)" },
    { value: "Malaria", label: "Malaria SBC" },
    { value: "Data-Driven Health", label: "Data-Driven Health" }
  ];

  return (
    <motion.form
      className="bg-white rounded-lg border border-primary shadow p-6 max-lg:p-4 md:p-8 w-full max-w-md max-lg:max-w-lg flex flex-col gap-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
      custom={-1}
      aria-label="Feedback Form"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-title mb-2">{t('feedback.feedback_title')}</h2>

      <label className="text-sm font-medium text-gray-700" htmlFor="name">
        {t('feedback.feedback_name')} <span className="text-red-500">*</span>
      </label>
      <input
        className="border border-primary rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        type="text"
        id="name"
        name="name"
        placeholder="Jane Doe"
        value={form.name}
        onChange={handleChange}
        onBlur={() => setTouched({ ...touched, name: true })}
        aria-required="false"
      />

      <div>
        <label className="text-sm font-medium text-gray-700">
          {t('feedback.programme')} <span className="text-red-500">*</span>
        </label>
        
        <div className="mt-2 space-y-3">
          {programmeOptions.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="checkbox"
                id={`programme-${option.value}`}
                name="programmes"
                value={option.value}
                checked={form.programmes.includes(option.value)}
                onChange={() => handleProgrammeChange(option.value)}
                className="h-4 w-4 text-primary focus:ring-primary border-primary rounded cursor-pointer"
              />
              <label
                htmlFor={`programme-${option.value}`}
                className="ml-3 block text-sm text-gray-700 cursor-pointer hover:text-gray-900"
              >
                {option.label}
              </label>
            </div>
          ))}
          
          {/* Others option with text input */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="programme-other"
              name="programmes"
              checked={form.otherProgramme.trim() !== ""}
              onChange={() => {
                setTouched({ ...touched, programmes: true });
                if (form.otherProgramme.trim() === "") {
                  setForm(prev => ({ ...prev, otherProgramme: "Other" }));
                } else {
                  setForm(prev => ({ ...prev, otherProgramme: "" }));
                }
              }}
              className="h-4 w-4 text-primary focus:ring-primary border-primary rounded cursor-pointer"
            />
            <label
              htmlFor="programme-other"
              className="ml-3 block text-sm text-gray-700 cursor-pointer hover:text-gray-900"
            >
              Others
            </label>
          </div>
          
          {form.otherProgramme.trim() !== "" && (
            <input
              type="text"
              name="otherProgramme"
              value={form.otherProgramme}
              onChange={handleChange}
              className="mt-2 border border-primary rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Please specify"
            />
          )}
        </div>
      </div>

      <label className="text-sm font-medium text-gray-700" htmlFor="message">
        {t('feedback.feedback_field')} <span className="text-red-500">*</span>
      </label>
      <textarea
        className="border border-primary rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[90px]"
        id="message"
        name="message"
        placeholder={t('feedback.placeholder')}
        value={form.message}
        onChange={handleChange}
        onBlur={() => setTouched({ ...touched, message: true })}
        required
        aria-required="true"
      />

      <motion.button
        type="submit"
        className="mt-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2 rounded-lg shadow transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Submit Feedback"
        disabled={submitted}
      >
        {submitted ? t('feedback.thank_you') : t('feedback.feedback_button')}
      </motion.button>
    </motion.form>
  );
}

export default FeedbackForm;