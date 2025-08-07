import React from "react";
import { FaTwitter, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronRight, FaGlobe } from "react-icons/fa";

const MainFooter: React.FC = () => {
  return (
    <footer className="bg-white text-gray-800 pt-24 pb-7 px-4 sm:px-6 lg:px-8 font-['Inter']">

      {/* Wave divider */}
      <div className="relative -top-12 h-12 w-full overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 w-full h-full"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            className="fill-current text-primary"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            className="fill-current text-primary"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className="fill-current text-primary"
          ></path>
        </svg>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-xl font-bold">R</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-title to-dark-blue bg-clip-text text-transparent">
                RICH CLS
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Empowering faith-based health initiatives through community insights. Your voice drives our improvements.
            </p>
            <div className="flex items-center space-x-3">
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all text-primary hover:scale-110">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all text-primary hover:scale-110">
                <FaFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all text-primary hover:scale-110">
                <FaInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-5 text-success">Stakeholders</h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="flex items-center text-gray-600 hover:text-success transition-colors group">
                  <FaChevronRight className="w-3 h-3 mr-2 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  RICH
                </a>
              </li>
              <li>
                <a href="/projects" className="flex items-center text-gray-600 hover:text-success transition-colors group">
                  <FaChevronRight className="w-3 h-3 mr-2 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  RBC
                </a>
              </li>
              <li>
                <a href="/impact" className="flex items-center text-gray-600 hover:text-success transition-colors group">
                  <FaChevronRight className="w-3 h-3 mr-2 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  UNICEF
                </a>
              </li>
              <li>
                <a href="/join" className="flex items-center text-gray-600 hover:text-success transition-colors group">
                  <FaChevronRight className="w-3 h-3 mr-2 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  EPI Supervisors
                </a>
              </li>
            </ul>
          </div>

          {/* Health Topics */}
          <div>
            <h4 className="text-lg font-bold mb-5 text-success">Health Topics</h4>
            <ul className="space-y-3">
              <li>
                <a href="/immunization" className="flex items-center text-gray-600 hover:text-success transition-colors group">
                  <FaChevronRight className="w-3 h-3 mr-2 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  Immunization
                </a>
              </li>
              <li>
                <a href="/maternal" className="flex items-center text-gray-600 hover:text-success transition-colors group">
                  <FaChevronRight className="w-3 h-3 mr-2 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  Maternal Health
                </a>
              </li>
              <li>
                <a href="/hiv" className="flex items-center text-gray-600 hover:text-success transition-colors group">
                  <FaChevronRight className="w-3 h-3 mr-2 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  HIV/AIDS
                </a>
              </li>
              <li>
                <a href="/malaria" className="flex items-center text-gray-600 hover:text-success transition-colors group">
                  <FaChevronRight className="w-3 h-3 mr-2 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  Malaria Prevention
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-5 text-success">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">Kigali-Gasabo, Kimihurura, KN14 Avenue, KG 621</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                <a href="tel:+250788123456" className="text-gray-600 hover:text-success transition-colors"> +250788307845</a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                <a href="mailto:info@rich.org.rw" className="text-gray-600 hover:text-success transition-colors"> info@rwandainterfaith.org</a>
              </li>
              <li className="flex items-center">
                <FaGlobe className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                <a href="https://www.rwandainterfaith.org" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-success transition-colors">www.rwandainterfaith.org</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 mt-12 pt-5 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 md:mb-0">
            © 2025 Rwanda Interfaith Council on Health (RICH). All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="/privacy" className="text-sm text-gray-500 hover:text-white hover:bg-success px-2 py-1 rounded transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-sm text-gray-500 hover:text-white hover:bg-success px-2 py-1 rounded transition-colors">
              Terms of Service
            </a>
            <a href="/cookies" className="text-sm text-gray-500 hover:text-white hover:bg-success px-2 py-1 rounded transition-colors">
              SAN TECH
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;