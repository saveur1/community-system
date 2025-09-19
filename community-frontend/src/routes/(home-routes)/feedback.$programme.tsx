// src/routes/programmes/$id.tsx
import { createFileRoute, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaCalendarAlt,
  FaFileAlt,
  FaComments,
  FaPhoneAlt,
  FaGlobe,
} from "react-icons/fa";
import { useState } from "react";

export const Route = createFileRoute("/(home-routes)/feedback/$programme")({
  component: ProgramDetailsPage,
});

function ProgramDetailsPage() {
  const { programme } = useParams({ from: "/(home-routes)/feedback/$programme" });

  // Fake program data (would be fetched from API)
  const program = {
    programme,
    name: "Immunization Program",
    description:
      "This program aims to ensure 100% vaccination coverage across all districts, focusing on reaching vulnerable and hard-to-reach populations.",
    coverage: "86%",
    dropout: "7%",
    targetPopulation: "Children under 5 years",
    upcomingEvents: [
      { date: "2025-08-20", title: "District Vaccination Drive" },
      { date: "2025-09-05", title: "Health Awareness Week" },
    ],
    resources: [
      { label: "Vaccination Guide PDF", link: "#" },
      { label: "Awareness Video", link: "#" },
    ],
    contact: {
      phone: "+250 783 250 033",
      email: "info@santechrwanda.com",
      website: "https://www.santechrwanda.com",
    },
  };

  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Feedback submitted!");
    setFeedback("");
  };

  return (
    <>
      <div className="">
        <div className="relative h-48 md:h-60 shadow shadow-primary overflow-hidden">
          <img src="/images/header.png" className="absolute -z-10 top-0 left-0 w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200/30 to-gray-200/10" />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-20 h-full flex flex-col items-center justify-center px-4"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-title text-center drop-shadow">{program.name}</h1>
            <p className="mt-2 text-gray-600/90 text-center max-w-3xl px-2 hidden md:block">
              {program.description}
            </p>
          </motion.div>
        </div>

        <div className="px-4 md:px-6 max-w-6xl mx-auto space-y-6 mt-6">

          {/* KPIs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <StatCard icon={<FaChartLine />} label="Coverage" value={program.coverage} />
            <StatCard icon={<FaChartLine />} label="Dropout" value={program.dropout} />
            <StatCard icon={<FaChartLine />} label="Target Group" value={program.targetPopulation} />
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaCalendarAlt /> Upcoming Events
            </h2>
            <ul className="mt-5 flex flex-col gap-y-4">
              {program.upcomingEvents.map((event, i) => (
                <li key={i} className="border-b border-gray-300 last:border-0 pb-2">
                  <span className="font-medium text-gray-800">{event.date}</span> - <span className="text-gray-600">{event.title}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaFileAlt /> Resources
            </h2>
            <ul className="mt-3 space-y-2">
              {program.resources.map((res, i) => (
                <li key={i}>
                  <a href={res.link} className="text-primary hover:underline">
                    {res.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Feedback Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaComments /> Give Feedback
            </h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts..."
              className="mt-3 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
            <button
              type="submit"
              className="mt-3 px-5 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 transition-colors font-medium shadow-sm"
            >
              Submit
            </button>
          </motion.form>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaPhoneAlt className="bg-primary text-white rounded-full w-10 h-10 p-2" /> Contact
            </h2>
            <p className="mt-2">Phone: {program.contact.phone}</p>
            <p className="mt-2">Email: {program.contact.email}</p>
            <a
              href={program.contact.website}
              className="flex items-center text-primary hover:underline mt-2"
            >
              <FaGlobe className="mr-1" /> Visit Website
            </a>
          </motion.div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-4"
    >
      <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 leading-snug">{value}</h3>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </motion.div>
  );
}
