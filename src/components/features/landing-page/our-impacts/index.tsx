import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaHeart,
  FaChild,
  FaUserMd,
  FaGraduationCap,
  FaHandsHelping,
  FaBrain,
  FaShieldAlt,
  FaHospital,
  FaChurch,
  FaUserFriends,
} from 'react-icons/fa';
import {
  MdFamilyRestroom,
  MdVolunteerActivism,
  MdSchool
} from 'react-icons/md';
import {
  BiHealth
} from 'react-icons/bi';
import { FiTrendingUp } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface StatCard {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

const statsData: StatCard[] = [
  {
    icon: <FaUsers className="w-8 h-8" />,
    value: "2M+",
    label: "Community Members Reached",
    color: "bg-blue-500"
  },
  {
    icon: <FaChild className="w-8 h-8" />,
    value: "5,854+",
    label: "Children Enrolled in ECD Programs",
    color: "bg-pink-500"
  },
  {
    icon: <FaHeart className="w-8 h-8" />,
    value: "2,720+",
    label: "GBV Victims Supported",
    color: "bg-red-500"
  },
  {
    icon: <MdVolunteerActivism className="w-8 h-8" />,
    value: "3,784+",
    label: "Religious Volunteers",
    color: "bg-green-500"
  },
  {
    icon: <MdFamilyRestroom className="w-8 h-8" />,
    value: "3,464+",
    label: "Households in ECD Programs",
    color: "bg-purple-500"
  },
  {
    icon: <FaUserMd className="w-8 h-8" />,
    value: "180+",
    label: "Health Workers Trained",
    color: "bg-teal-500"
  },
  {
    icon: <MdSchool className="w-8 h-8" />,
    value: "19+",
    label: "Model ECD Centers",
    color: "bg-orange-500"
  },
  {
    icon: <FaChurch className="w-8 h-8" />,
    value: "128+",
    label: "Religious Leaders Trained",
    color: "bg-indigo-500"
  },
  {
    icon: <FaHospital className="w-8 h-8" />,
    value: "135+",
    label: "Health Centers Partnered",
    color: "bg-cyan-500"
  },
  {
    icon: <FaGraduationCap className="w-8 h-8" />,
    value: "285+",
    label: "ECD Animateurs",
    color: "bg-amber-500"
  },
  {
    icon: <FaHandsHelping className="w-8 h-8" />,
    value: "60+",
    label: "Family Counsellors",
    color: "bg-rose-500"
  },
  {
    icon: <FaBrain className="w-8 h-8" />,
    value: "10K+",
    label: "Mental Health Messages Delivered",
    color: "bg-violet-500"
  },
  {
    icon: <BiHealth className="w-8 h-8" />,
    value: "500K+",
    label: "SBC Intervention Beneficiaries",
    color: "bg-emerald-500"
  },
  {
    icon: <FaShieldAlt className="w-8 h-8" />,
    value: "6+",
    label: "Isange One Stop Centers Supported",
    color: "bg-lime-500"
  },
  {
    icon: <FaUserFriends className="w-8 h-8" />,
    value: "144+",
    label: "Youth Group Leaders Engaged",
    color: "bg-sky-500"
  },
  {
    icon: <FiTrendingUp className="w-8 h-8" />,
    value: "16+",
    label: "Districts with ECD Centers",
    color: "bg-yellow-500"
  }
];

const statsVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      delay: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const OurImpacts: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm"
      variants={statsVariants}
      initial="hidden"
      animate="visible"
    >

      <div className="max-w-8xl mx-auto py-2 px-3 sm:px-4">
        <div className="px-1 sm:px-2 text-center mb-3 sm:mb-4">
          <motion.h2 className="text-lg sm:text-2xl font-bold text-title">Our Impacts</motion.h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 border border-gray-200 p-3 sm:p-4 rounded-xl bg-gray-50 backdrop-blur-sm hover:bg-white/50 transition-colors group"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className={`${stat.color} text-white p-2.5 sm:p-3 rounded-full group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600 leading-snug">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default OurImpacts;