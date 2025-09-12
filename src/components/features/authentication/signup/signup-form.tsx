import React, { useState, useMemo } from "react";
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
import locations from '@/components/common/locations.json';
import { SelectSearch } from "@/components/ui/select-search";

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
  userTypeCategory: string;
  otherType: string;
  // Additional fields (optional)
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  nearByHealthCenter?: string;
  // Role-specific
  schoolName?: string;
  schoolAddress?: string;
  churchName?: string;
  churchAddress?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  healthCenterName?: string;
  healthCenterAddress?: string;
  epiDistrict?: string;
}

function SignupForm({ className = "" }: SignupFormProps) {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    userType: "",
    userTypeCategory: "",
    otherType: ""
  });

  const [currentStep, setCurrentStep] = useState(1);
  const { t } = useTranslation();
  const { signup, isSigningUp: isLoading } = useAuth();

  // Locations data (provinces -> districts -> sectors -> cells -> villages)
  type Village = { name: string };
  type Cell = { name: string; villages: Village[] };
  type Sector = { name: string; cells: Cell[] };
  type District = { name: string; sectors: Sector[] };
  type Province = { name: string; districts: District[] };
  const [provinces, setProvinces] = React.useState<Province[]>(locations.provinces);
  const [selectedDistrict, setSelectedDistrict] = React.useState<District | null>(null);
  const [selectedSector, setSelectedSector] = React.useState<Sector | null>(null);
  const [selectedCell, setSelectedCell] = React.useState<Cell | null>(null);
  const [selectedVillage, setSelectedVillage] = React.useState<Village | null>(null);
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  const userTypes = [
    {
      title: "Community Members",
      options: [
        { value: "volunteers", label: "Volunteers" },
        { value: "youth_leaders", label: "Youth Leaders" },
        { value: "local_government_leaders", label: "Local Government Leaders" },
        { value: "school_representatives", label: "School representatives" },
        { value: "beneficiaries", label: "Beneficiaries" },
        { value: "religious_community_representatives", label: "Religious Community Representatives" },
        { value: "general_population", label: "General Population" },
      ],
    },
    {
      title: "Health service providers",
      options: [
        { value: "nurses", label: "Nurses" },
        { value: "chw", label: "CHW" },
        { value: "epi_managers", label: "EPI managers" },
        { value: "doctors", label: "Doctors" },
        { value: "health_facility_managers", label: "Health Facility Managers" },
        { value: "anc", label: "ANC" },
        { value: "cho", label: "CHO" },
        { value: "frontline_health_workers", label: "Frontline Health workers" },
      ],
    },
    {
      title: "RICH Members",
      options: [
        { value: "religious_leaders", label: "Religious Leaders" },
        { value: "rich_members_representatives", label: "Rich members representatives" },
      ],
    }
  ];

  const needsAdditionalSteps = form.userType && [
    'school_representatives',
    'religious_community_representatives',
    'doctors',
    'nurses',
    'chw',
    'anc',
    'cho',
    'frontline_health_workers',
    'epi_managers',
    'health_facility_managers'
  ].includes(form.userType);

  const needsLocationStep = form.userType && !['general_population', 'unicef', 'rbc'].includes(form.userType);

  // Fixed to maximum 2 steps
  const totalSteps = 2;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Reset location fields when user type changes
    if (name === 'userType') {
      setForm(prev => ({
        ...prev,
        [name]: value,
        district: undefined,
        sector: undefined,
        cell: undefined,
        village: undefined
      }));

      // Reset location state
      setSelectedDistrict(null);
      setSelectedSector(null);
      setSelectedCell(null);
      setSelectedVillage(null);
    }

    // Reset userType when category changes
    if (name === 'userTypeCategory') {
      setForm(prev => ({ ...prev, userType: "" }));
      setExpandedCategory(value);
    }
  };

  const handleCategoryToggle = (categoryTitle: string) => {
    if (expandedCategory === categoryTitle) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryTitle);
      // Only update category if not already set, to preserve user selection
      setForm(prev => ({
        ...prev,
        userTypeCategory: categoryTitle
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!form.fullName.trim()) {
          toast.error(t("signup.full_name_required"));
          return false;
        }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          toast.error(t("signup.email_invalid"));
          return false;
        }
        if (!form.phone.trim()) {
          toast.error(t("signup.phone_required"));
          return false;
        }
        if (!form.password.trim()) {
          toast.error(t("signup.password_required"));
          return false;
        }
        if (form.password.length < 6) {
          toast.error(t("signup.password_min_length"));
          return false;
        }
        if (!form.userTypeCategory.trim()) {
          toast.error(t("signup.user_type_category_required"));
          return false;
        }
        if (!form.userType.trim()) {
          toast.error(t("signup.user_type_required"));
          return false;
        }
        if (form.userType === "other" && !form.otherType.trim()) {
          toast.error(t("signup.other_type_required"));
          return false;
        }
        return true;

      case 2:
        // Validate location if needed
        if (needsLocationStep) {
          if (!form.district) {
            toast.error(t("signup.district_required"));
            return false;
          }
          if (!form.sector) {
            toast.error(t("signup.sector_required"));
            return false;
          }
          if (!form.cell) {
            toast.error(t("signup.cell_required"));
            return false;
          }
          if (!form.village) {
            toast.error(t("signup.village_required"));
            return false;
          }
        }
        // Validate additional details if needed
        if (needsAdditionalSteps) {
          if (form.userType === "school_representatives" && !form.schoolName?.trim()) {
            toast.error(t("signup.school_name_required"));
            return false;
          }
          if (form.userType === "religious_community_representatives" && !form.churchName?.trim()) {
            toast.error(t("signup.church_name_required"));
            return false;
          }
          if (form.userType === "doctors" && !form.hospitalName?.trim()) {
            toast.error(t("signup.hospital_name_required"));
            return false;
          }
          if (
            ["nurses", "chw", "anc", "cho", "frontline_health_workers"].includes(form.userType) &&
            !form.healthCenterName?.trim()
          ) {
            toast.error(t("signup.health_center_name_required"));
            return false;
          }
          if (form.userType === "epi_managers" && !form.nearByHealthCenter?.trim()) {
            toast.error(t("signup.nearby_health_center_required"));
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = (e: any) => {
    e.preventDefault();
    if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(totalSteps)) return;

    try {
      // Derive top-level userType from the selected option group title
      const selectedGroup = userTypes.find(g => g.options.some(o => o.value === form.userType));
      const groupTitle = selectedGroup?.title || '';
      // Normalize to required backend values
      const userTypeForBackend =
        groupTitle === 'Community' ? 'community'
          : groupTitle === 'Stakeholders' ? 'stakeholders'
            : groupTitle; // 'Religious Leaders' | 'Health Services Providers'

      const payload: any = {
        name: form.fullName,
        email: form.email || undefined,
        phone: form.phone,
        password: form.password,
        roleType: form.userType || 'general_population',
        userType: userTypeForBackend || undefined,
        // Additional optional fields (removed nationalId)
        district: form.district,
        sector: form.sector,
        cell: form.cell,
        village: form.village,
        nearByHealthCenter: form.nearByHealthCenter,
        schoolName: form.schoolName,
        schoolAddress: form.schoolAddress,
        churchName: form.churchName,
        churchAddress: form.churchAddress,
        hospitalName: form.hospitalName,
        hospitalAddress: form.hospitalAddress,
        healthCenterName: form.healthCenterName,
        healthCenterAddress: form.healthCenterAddress,
        epiDistrict: form.epiDistrict,
      };

      await signup(payload);
    } catch (error: any) {
      toast.error(error?.message || t('signup.error_creating'), {
        position: "bottom-center",
        theme: "dark"
      });
    }
  };

  // Step 1: Basic Information + User Type Selection
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
      className="absolute top-0 left-0 w-full space-y-6"
    >
      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('signup.basic_information')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">{t('signup.full_name_label')} *</label>
            <div className="relative">
              <AiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 border border-primary/30 rounded-lg outline-primary/50 text-base sm:text-sm"
                placeholder={t('signup.full_name_placeholder')}
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">{t('signup.phone_label')} *</label>
            <div className="relative">
              <AiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 border border-primary/30 rounded-lg outline-primary/50 text-base sm:text-sm"
                placeholder={t('signup.phone_placeholder')}
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">{t('signup.email_label_optional')}</label>
            <div className="relative">
              <AiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 border border-primary/30 rounded-lg outline-primary/50 text-base sm:text-sm"
                placeholder={t('signup.email_placeholder')}
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">{t('signup.password_label')} *</label>
            <div className="relative">
              <AiOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 border border-primary/30 rounded-lg outline-primary/50 text-base sm:text-sm"
                placeholder={t('signup.password_placeholder')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Type Selection */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('signup.who_are_you')} *</h2>

        {/* Category Selection with Expandable Options */}
        <div className="mb-4">
          <label className="block mb-3 text-sm font-medium text-gray-700">{t('signup.select_category')} *</label>
          <div className="space-y-3">
            {userTypes.map((group, index) => (
              <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Category Header */}
                <div
                  onClick={() => handleCategoryToggle(group.title)}
                  className={`flex items-center justify-between cursor-pointer p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-200 ${expandedCategory === group.title ? 'bg-primary/5 border-primary/30' : 'hover:border-primary/30'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${form.userTypeCategory === group.title
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                      }`}>
                      {form.userTypeCategory === group.title && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-900 font-medium text-sm sm:text-base">{group.title}</span>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">
                        {group.options.length} options available
                      </p>
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${expandedCategory === group.title ? 'rotate-180' : ''
                    }`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expandable Options */}
                {expandedCategory === group.title && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t pl-10 border-gray-200 bg-gray-50/50"
                  >
                    <div className="p-1">
                      {group.options.map((option) => (
                        <div key={option.value}>
                          <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white border border-transparent hover:border-primary/20 transition-colors duration-200 min-h-[30px]">
                            <input
                              type="radio"
                              name="userType"
                              value={option.value}
                              checked={form.userType === option.value}
                              onChange={handleRadioChange}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-700 text-sm sm:text-base">{option.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {form.userType === "other" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <input
                type="text"
                name="otherType"
                value={form.otherType}
                onChange={handleChange}
                className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
                placeholder={t('signup.specify_role_placeholder')}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const districts: District[] = React.useMemo(() => provinces.flatMap(p => p.districts || []), [provinces]);

  // Step 2: Location Details (combined with additional details if needed)
  const renderStep2 = () => {
    // Skip location step if not needed, go directly to additional details
    if (!needsLocationStep && needsAdditionalSteps) {
      return renderAdditionalDetails();
    }

    // Show location step
    return (
      <motion.div
        key="step2"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={sectionVariants}
        transition={springTransition}
        className="space-y-4"
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('signup.location_details')}</h2>

        <div className="space-y-4 sm:space-y-6">
          {/* District with SelectSearch */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('signup.district_label')} *</label>
            <SelectSearch
              options={districts.map(d => ({ label: d.name, value: d.name }))}
              value={selectedDistrict?.name}
              dropdownClassName="w-full border border-gray-300 bg-gray-50"
              onChange={(val) => {
                const d = districts.find(x => x.name === val) || null;
                setSelectedDistrict(d);
                setSelectedSector(null);
                setSelectedCell(null);
                setSelectedVillage(null);
                setForm(prev => ({
                  ...prev,
                  district: val,
                  sector: undefined,
                  cell: undefined,
                  village: undefined
                }));
              }}
              placeholder={t('signup.search_or_select_district')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('signup.sector_label')} *</label>
            <SelectSearch
              options={(selectedDistrict?.sectors || []).map(s => ({ label: s.name, value: s.name }))}
              value={selectedSector?.name}
              dropdownClassName="w-full border border-gray-300 bg-gray-50"
              onChange={(val) => {
                const s = selectedDistrict?.sectors.find(x => x.name === val) || null;
                setSelectedSector(s);
                setSelectedCell(null);
                setSelectedVillage(null);
                setForm(prev => ({
                  ...prev,
                  sector: val,
                  cell: undefined,
                  village: undefined
                }));
              }}
              placeholder={t('signup.select_sector_placeholder')}
              disabled={!selectedDistrict}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('signup.cell_label')} *</label>
            <SelectSearch
              options={(selectedSector?.cells || []).map(c => ({ label: c.name, value: c.name }))}
              value={selectedCell?.name}
              dropdownClassName="w-full border border-gray-300 bg-gray-50"
              onChange={(val) => {
                const c = selectedSector?.cells.find(x => x.name === val) || null;
                setSelectedCell(c);
                setSelectedVillage(null);
                setForm(prev => ({
                  ...prev,
                  cell: val,
                  village: undefined
                }));
              }}
              placeholder={t('signup.select_cell_placeholder')}
              disabled={!selectedSector}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('signup.village_label')} *</label>
            <SelectSearch
              options={(selectedCell?.villages || []).map(v => ({ label: v.name, value: v.name }))}
              value={selectedVillage?.name}
              dropdownClassName="w-full border border-gray-300 bg-gray-50"
              onChange={(val) => {
                const v = (selectedCell?.villages || []).find(x => x.name === val) || null;
                setSelectedVillage(v);
                setForm(prev => ({
                  ...prev,
                  village: val
                }));
              }}
              placeholder={t('signup.select_village_placeholder')}
              disabled={!selectedCell}
            />
          </div>
        </div>

        {/* If additional details are needed and this is step 2, also show them */}
        {needsAdditionalSteps && (
          <div className="mt-8">
            {renderAdditionalDetailsContent()}
          </div>
        )}
      </motion.div>
    );
  };

  const renderAdditionalDetailsContent = () => (
    <div className="space-y-4">
      {/* Health Worker */}
      {form.userType === 'health_facility_managers' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {t('signup.nearby_health_center_label')} *
          </label>
          <input
            type="text"
            name="nearByHealthCenter"
            value={form.nearByHealthCenter || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 sm:p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-base sm:text-sm"
            placeholder={t('signup.nearby_health_center_placeholder')}
            required
          />
        </div>
      )}

      {/* School Representative */}
      {form.userType === 'school_representatives' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t('signup.school_name_label')} *
            </label>
            <input
              type="text"
              name="schoolName"
              value={form.schoolName || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              placeholder={t('signup.school_name_placeholder')}
              required
            />
          </div>
        </>
      )}

      {/* Religious Community Representative */}
      {form.userType === 'religious_community_representatives' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t('signup.church_mosque_name_label')} *
            </label>
            <input
              type="text"
              name="churchName"
              value={form.churchName || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              placeholder={t('signup.church_mosque_name_placeholder')}
              required
            />
          </div>
        </>
      )}

      {/* Doctors */}
      {form.userType === 'doctors' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t('signup.hospital_name_label')} *
            </label>
            <input
              type="text"
              name="hospitalName"
              value={form.hospitalName || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              placeholder={t('signup.hospital_name_placeholder')}
              required
            />
          </div>
        </>
      )}

      {/* Nurses, CHW, ANC, CHO, Frontline Health Workers */}
      {['nurses', 'chw', 'anc', 'cho', 'frontline_health_workers'].includes(form.userType) && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t('signup.health_center_name_label')} *
            </label>
            <input
              type="text"
              name="healthCenterName"
              value={form.healthCenterName || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              placeholder={t('signup.health_center_name_placeholder')}
              required
            />
          </div>
        </>
      )}
    </div>
  );

  const renderAdditionalDetails = () => (
    <motion.div
      key="additional-details"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
      className="space-y-4"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('signup.additional_details')}</h2>
      {renderAdditionalDetailsContent()}
    </motion.div>
  );

  const shouldShowStep = (step: number) => {
    if (step === 1) return true; // Always show step 1
    if (step === 2) {
      // Step 2 shows location and/or additional details
      return needsLocationStep || needsAdditionalSteps;
    }
    return false;
  };

  // Calculate actual total steps based on user type
  const actualTotalSteps = useMemo(() => {
    if (!needsLocationStep && !needsAdditionalSteps) return 1;
    return 2; // Always max 2 steps
  }, [needsLocationStep, needsAdditionalSteps]);

  const getDynamicHeight = () => {
    if (currentStep === 1) {
      let baseHeight = 410;
      userTypes.forEach(group => {
        if (group.title === expandedCategory) {
          baseHeight += group.options.length * 44 + 60;
        } else {
          baseHeight += 60;
        }
      });
      if (form.userType === "other") {
        baseHeight += 60;
      }
      return baseHeight;
    }

    if (currentStep === 2) {
      if (needsLocationStep) {
        return needsAdditionalSteps ? 470 : 400;
      }
      return 200;
    }

    return 400;
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640; // Tailwind sm breakpoint
  const dynamicHeight = getDynamicHeight() * (isMobile ? 1.2 : 1); // 30% taller on mobile

  return (
    <div className={`col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none ${className}`}>
      <div className={`${currentStep >= 2 ? "max-w-2xl" : "max-w-xl"} mx-auto p-4 sm:p-6 lg:p-8`}>
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">{t('signup.create_title')}</h1>
          {actualTotalSteps > 1 && (
            <div className="flex justify-center mb-4">
              {Array.from({ length: actualTotalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${currentStep >= step ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {step}
                  </div>
                  {step < actualTotalSteps && (
                    <div className={`w-6 sm:w-8 h-1 ${currentStep > step ? "bg-primary" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className={`relative`}
            style={{ minHeight: `${dynamicHeight}px` }}
          >
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && shouldShowStep(2) && renderStep2()}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center text-primary hover:text-primary-dark transition-colors"
              >
                <FiChevronLeft className="mr-1" /> {t('signup.back')}
              </button>
            ) : (
              <span></span>
            )}

            {currentStep < actualTotalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex cursor-pointer items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors w-full sm:w-auto justify-center min-h-[44px]"
              >
                {t('signup.next')} <FiChevronRight className="ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex cursor-pointer items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center min-h-[44px]"
              >
                {isLoading ? t('signup.creating') : t('signup.create_account')}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t('signup.already_have_account')}{" "}
            <Link to="/auth/login" className="text-primary hover:text-primary-dark transition-colors">
              {t('signup.sign_in_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;