// LoginLeftCard.tsx
import React from "react";
import { FiLinkedin, FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";

const LoginLeftCard: React.FC = () => {
  return (
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
  );
};

export default LoginLeftCard;