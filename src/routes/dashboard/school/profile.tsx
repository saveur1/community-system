import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, 
  FiShare2, 
  FiMessageSquare, 
  FiCalendar,
  FiClock,
  FiFileText,
  FiFolder,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEye,
  FiEdit3,
  FiTrash2
} from 'react-icons/fi';
import { FaEdit } from 'react-icons/fa';

export const Route = createFileRoute('/dashboard/school/profile')({
    component: SchoolProfile,
})

function SchoolProfile() {
  const [activeTab, setActiveTab] = useState('Overview');

  // Tabs tailored for school profile in a community listening tool
  const tabs = ['Overview', 'Students', 'Immunization', 'Documents', 'Staff'];

  // Mock school meta & metrics (replace with API later)
  const school = {
    name: 'University of Rwanda',
    district: 'Nyarugenge',
    type: 'Public',
    level: 'University',
  };

  const metrics = {
    totalStudents: 12840,
    vaccinatedPct: 76,
    femaleVaccinatedPct: 81,
    maleVaccinatedPct: 71,
    outreachSessions: 12,
  };

  const byGrade = [
    { grade: 'Year 1', students: 3800, vaccinatedPct: 72 },
    { grade: 'Year 2', students: 3200, vaccinatedPct: 75 },
    { grade: 'Year 3', students: 2800, vaccinatedPct: 79 },
    { grade: 'Year 4', students: 2040, vaccinatedPct: 82 },
  ];

  const femaleShareByGrade = [
    { grade: 'Year 1', femalePct: 46 },
    { grade: 'Year 2', femalePct: 49 },
    { grade: 'Year 3', femalePct: 51 },
    { grade: 'Year 4', femalePct: 53 },
  ];

  const staff = [
    { name: 'Head Teacher', person: 'Alice U.', initials: 'AU', color: 'bg-indigo-500' },
    { name: 'Nurse', person: 'Ben K.', initials: 'BK', color: 'bg-emerald-500' },
    { name: 'Parent Liaison', person: 'Clara N.', initials: 'CN', color: 'bg-rose-500' },
    { name: 'EPI Focal', person: 'David M.', initials: 'DM', color: 'bg-sky-500' },
  ];

  const documents = [
    { name: 'School Vaccination Policy.pdf', size: '2.1 MB', date: '15 Jan, 2025', type: 'PDF' },
    { name: 'Outreach Plan 2025.docx', size: '860 KB', date: '10 Jan, 2025', type: 'Word' },
    { name: 'Community Feedback Summary.xlsx', size: '540 KB', date: '28 Dec, 2024', type: 'Excel' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">School Summary</h3>
        <p className="text-gray-600 leading-relaxed">
          Snapshot of {school.name} and its engagement with the community immunization program in {school.district}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Total Students</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalStudents.toLocaleString()}</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Vaccinated (%)</h4>
          <p className="text-2xl font-bold text-success mt-1">{metrics.vaccinatedPct}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-success rounded" style={{ width: `${metrics.vaccinatedPct}%` }}></div>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Female Vaccinated (%)</h4>
          <p className="text-2xl font-bold text-primary mt-1">{metrics.femaleVaccinatedPct}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-primary rounded" style={{ width: `${metrics.femaleVaccinatedPct}%` }}></div>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Outreach Sessions (12 mo)</h4>
          <p className="text-2xl font-bold text-title mt-1">{metrics.outreachSessions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Vaccination by Grade</h4>
          <div className="space-y-3">
            {byGrade.map((g) => (
              <div key={g.grade}>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{g.grade} • {g.students.toLocaleString()} students</span>
                  <span className="font-medium text-success">{g.vaccinatedPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-success rounded" style={{ width: `${g.vaccinatedPct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Female Share by Grade</h4>
          <div className="space-y-3">
            {femaleShareByGrade.map((g) => (
              <div key={g.grade}>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{g.grade}</span>
                  <span className="font-medium text-primary">{g.femalePct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-primary rounded" style={{ width: `${g.femalePct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Upload
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Size</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Modified</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <FiFileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-gray-900 font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-500">{doc.size}</td>
                  <td className="py-4 px-6 text-gray-500">{doc.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiEye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiDownload className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiEdit3 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
          <span className="text-sm text-gray-500">Showing 1 to 5 of 12 entries</span>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-200 rounded-lg">
              <FiChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded">1</button>
            <button className="px-3 py-1 hover:bg-gray-200 rounded">2</button>
            <button className="px-3 py-1 hover:bg-gray-200 rounded">3</button>
            <button className="p-2 hover:bg-gray-200 rounded-lg">
              <FiChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Enrollment</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Total Students</h4>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalStudents.toLocaleString()}</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Female Share</h4>
          <p className="text-2xl font-bold text-primary mt-1">49%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-primary rounded" style={{ width: `49%` }}></div>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Special Needs Students</h4>
          <p className="text-2xl font-bold text-blue-700 mt-1">124</p>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">By Grade</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Grade</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Students</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Vaccinated (%)</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Female (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {byGrade.map((g, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-6">{g.grade}</td>
                  <td className="py-3 px-6">{g.students.toLocaleString()}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <span>{g.vaccinatedPct}%</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded">
                        <div className="h-2 bg-emerald-500 rounded" style={{ width: `${g.vaccinatedPct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <span>{femaleShareByGrade[i]?.femalePct}%</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded">
                        <div className="h-2 bg-fuchsia-500 rounded" style={{ width: `${femaleShareByGrade[i]?.femalePct}%` }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderImmunization = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Immunization Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Vaccinated (%)</h4>
          <p className="text-2xl font-bold text-success mt-1">{metrics.vaccinatedPct}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-success rounded" style={{ width: `${metrics.vaccinatedPct}%` }}></div>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Female Vaccinated (%)</h4>
          <p className="text-2xl font-bold text-primary mt-1">{metrics.femaleVaccinatedPct}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-primary rounded" style={{ width: `${metrics.femaleVaccinatedPct}%` }}></div>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Male Vaccinated (%)</h4>
          <p className="text-2xl font-bold text-primary mt-1">{metrics.maleVaccinatedPct}%</p>
          <div className="mt-2 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-primary rounded" style={{ width: `${metrics.maleVaccinatedPct}%` }}></div>
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm text-gray-500">Outreach Sessions (12 mo)</h4>
          <p className="text-2xl font-bold text-title mt-1">{metrics.outreachSessions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Coverage by Grade</h4>
          <div className="space-y-3">
            {byGrade.map((g) => (
              <div key={g.grade}>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{g.grade}</span>
                  <span className="font-medium text-success">{g.vaccinatedPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-success rounded" style={{ width: `${g.vaccinatedPct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Campaigns & Sessions</h4>
          <ul className="space-y-3 text-gray-700">
            <li>HPV Catch-up Day • 25 Aug 2025</li>
            <li>Community Q&A Forum • 05 Sep 2025</li>
            <li>Parent-Teacher Outreach • 14 Sep 2025</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">School Staff</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((m, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${m.color} rounded-full flex items-center justify-center`}>
                <span className="text-white font-semibold">{m.initials}</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{m.person}</h4>
                <p className="text-sm text-gray-500">{m.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview': return renderOverview();
      case 'Students': return renderStudents();
      case 'Immunization': return renderImmunization();
      case 'Documents': return renderDocuments();
      case 'Staff': return renderStaff();
      default: return renderOverview();
    }
  };

  return (
    <div className="max-w-8xl mx-auto pt-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">UR</span>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{school.district}</span>
                  <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">{school.type}</span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiFolder className="w-4 h-4 mr-2" />
                    {school.level}
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    Academic Year : 2024 / 2025
                  </div>
                  <div className="flex items-center">
                    <FiClock className="w-4 h-4 mr-2" />
                    Last Update : 20 Aug, 2025
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FaEdit className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FiShare2 className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FiMessageSquare className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex">
          <div className="flex-1 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolProfile;