// components/feedback/TextFeedback.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { TextFeedbackProps } from "@/types/feedback-types";
import AnimatedTextarea from "@/components/ui/animated-textarea";

const TextFeedback: React.FC<TextFeedbackProps> = ({
  form,
  onFormChange,
}) => {
  const { t } = useTranslation();

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onFormChange({ message: e.target.value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2 mt-4 sm:mt-6"
    >
      <AnimatedTextarea
        label={t('feedback.feedback_field')}
        value={form.message}
        onChange={handleMessageChange}
        required
        aria-required="true"
        minHeight="120px"
      />
    </motion.div>
  );
};

export default TextFeedback;