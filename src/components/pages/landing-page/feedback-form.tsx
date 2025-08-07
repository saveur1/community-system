import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sectionVariants } from ".";
import { SelectDropdown } from "@/components/ui/select";

function FeedbackForm() {
  const [form, setForm] = useState({
    name: "",
    programme: "", // Changed from phone to programme
    message: ""
  });

  const [touched, setTouched] = useState({
    name: false,
    programme: false, // Changed from phone to programme
    message: false
  });

  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProgrammeChange = (value: string) => {
    setForm({ ...form, programme: value });
    setTouched({ ...touched, programme: true });
  };

  const validate = () => {
    return {
      name: !form.name.trim(),
      programme: !form.programme.trim(), // Changed from phone to programme
      message: !form.message.trim()
    };
  };

  const errors = validate();
  const isValid = !errors.name && !errors.programme && !errors.message;

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
    setTouched({ name: true, programme: true, message: true });

    if (!isValid) {
      if (errors.name) showErrorToast(t('validation.name_required'));
      if (errors.programme) showErrorToast(t('validation.programme_required'));
      if (errors.message) showErrorToast(t('validation.message_required'));
      return;
    }

    // Form is valid - proceed with submission
    setSubmitted(true);
    setForm({ name: "", programme: "", message: "" });
    toast.success(t('feedback.success_message'), {
      position: "top-center",
      autoClose: 3000,
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Prepare dropdown options from programmes
  const programmeOptions = [
    { value: "HIV/AIDS", label: "HIV/AIDS" },
    { value: "Immunization", label: "Immunization (SUGIRA MWANA)" },
    { value: "Mental Health", label: "Mental Health (Baho Neza)" },
    { value: "Malaria", label: "Malaria SBC" },
    { value: "Data-Driven Health", label: "Data-Driven Health" }
  ]

  return (
    <>
      <motion.form
        className="bg-white rounded-lg border self-start border-gray-300 shadow p-6 md:p-8 w-full max-w-md flex flex-col gap-4"
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
          className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${touched.name && errors.name ? "border-red-500" : "border-gray-300"
            }`}
          type="text"
          id="name"
          name="name"
          placeholder="Jane Doe"
          value={form.name}
          onChange={handleChange}
          onBlur={() => setTouched({ ...touched, name: true })}
          required
          aria-required="true"
          aria-invalid={!!(touched.name && errors.name)}
        />

        <label className="text-sm font-medium text-gray-700">
          {t('feedback.programme')} <span className="text-red-500">*</span>
        </label>
        
        <SelectDropdown
          options={programmeOptions}
          value={form.programme}
          onChange={handleProgrammeChange}
          placeholder={t('feedback.select_programme')}
          dropdownClassName="border-blue-500"
          aria-required="true"
        />

        <label className="text-sm font-medium text-gray-700" htmlFor="message">
          {t('feedback.feedback_field')} <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[90px] ${touched.message && errors.message ? "border-red-500" : "border-gray-300"
            }`}
          id="message"
          name="message"
          placeholder={t('feedback.placeholder')}
          value={form.message}
          onChange={handleChange}
          onBlur={() => setTouched({ ...touched, message: true })}
          required
          aria-required="true"
          aria-invalid={!!(touched.message && errors.message)}
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
    </>
  );
}

export default FeedbackForm;