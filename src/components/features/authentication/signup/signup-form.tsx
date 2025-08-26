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
import { CustomDropdown } from "@/components/ui/dropdown";
import { SelectDropdown } from "@/components/ui/select";

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
  const [provinces, setProvinces] = React.useState<Province[]>([]);
  const [districtQuery, setDistrictQuery] = React.useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState<District | null>(null);
  const [selectedSector, setSelectedSector] = React.useState<Sector | null>(null);
  const [selectedCell, setSelectedCell] = React.useState<Cell | null>(null);
  const [selectedVillage, setSelectedVillage] = React.useState<Village | null>(null);
  // Control district dropdown open state to avoid closing when focusing search
  const [isDistrictOpen, setIsDistrictOpen] = React.useState(false);

  React.useEffect(() => {
    // Fetch locations.json from public
    fetch("/locations.json")
      .then(res => res.json())
      .then((data) => {
        if (data?.provinces) setProvinces(data.provinces as Province[]);
      })
      .catch(() => {
        // Silent fail but keep UX alive
      });
  }, []);

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
    'epi_supervisor'
  ].includes(form.userType);
  
  const needsLocationStep = form.userType && !['local_influencer', 'unicef', 'rbc'].includes(form.userType);
  const totalSteps = needsLocationStep ? (needsAdditionalSteps ? 5 : 4) : (needsAdditionalSteps ? 4 : 3);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Show verification warning for certain user types
    if (name === 'userType') {
      showVerificationWarning(value);
      
      // Reset location fields when user type changes
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
    }
  };

  const showVerificationWarning = (userType: string) => {
    const communityTypes = ['local_citizen'];
    if (!communityTypes.includes(userType)) {
      toast.dismiss();
      toast.warning(t('signup.verify_before_login'), {
        autoClose: false,
        theme: "dark",
        closeOnClick: true,
        draggable: true,
        closeButton: true,
        position: "bottom-center"
      });
    } else {
      toast.dismiss();
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!form.fullName.trim()) {
          toast.error(t('signup.validation.full_name_required'));
          return false;
        }
        if (!form.email.trim()) {
          toast.error(t('signup.validation.email_required'));
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          toast.error(t('signup.validation.email_invalid'));
          return false;
        }
        if (!form.phone.trim()) {
          toast.error(t('signup.validation.phone_required'));
          return false;
        }
        if (!form.password.trim()) {
          toast.error(t('signup.validation.password_required'));
          return false;
        }
        if (form.password.length < 6) {
          toast.error(t('signup.validation.password_min_length'));
          return false;
        }
        return true;
      
      case 2:
        if (!form.userTypeCategory.trim()) {
          toast.error(t('signup.validation.user_type_category_required'));
          return false;
        }
        return true;
      
      case 3:
        if (!form.userType.trim()) {
          toast.error(t('signup.validation.user_type_required'));
          return false;
        }
        if (form.userType === 'other' && !form.otherType.trim()) {
          toast.error(t('signup.validation.other_type_required'));
          return false;
        }
        return true;
      
      case 4:
        // Location validation for users who need it
        if (needsLocationStep) {
          if (!form.district) {
            toast.error(t('signup.validation.district_required'));
            return false;
          }
          if (!form.sector) {
            toast.error(t('signup.validation.sector_required'));
            return false;
          }
          if (!form.cell) {
            toast.error(t('signup.validation.cell_required'));
            return false;
          }
          if (!form.village) {
            toast.error(t('signup.validation.village_required'));
            return false;
          }
        }
        return true;
      
      case 5:
        // Additional details validation
        if (form.userType === 'school_representatives' && !form.schoolName?.trim()) {
          toast.error(t('signup.validation.school_name_required'));
          return false;
        }
        if (form.userType === 'religious_community_representatives' && !form.churchName?.trim()) {
          toast.error(t('signup.validation.church_name_required'));
          return false;
        }
        if (form.userType === 'doctors' && !form.hospitalName?.trim()) {
          toast.error(t('signup.validation.hospital_name_required'));
          return false;
        }
        if (['nurses', 'chw', 'anc', 'cho', 'frontline_health_workers'].includes(form.userType) && !form.healthCenterName?.trim()) {
          toast.error(t('signup.validation.health_center_name_required'));
          return false;
        }
        if (form.userType === 'epi_managers' && !form.nearByHealthCenter?.trim()) {
          toast.error(t('signup.validation.nearby_health_center_required'));
          return false;
        }
        if (form.userType === 'epi_supervisor' && !form.epiDistrict?.trim()) {
          toast.error(t('signup.validation.epi_district_required'));
          return false;
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
        roleType: form.userType || 'local_influencer',
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
      toast.error(error?.message || t('signup.error_creating'),{
        position: "bottom-center",
        theme: "dark"
      });
    }
  };

  // Combined Step 1: Basic Information (name, phone, email, password)
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">{t('signup.full_name_label')} *</label>
          <div className="relative">
            <AiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg outline-primary/50"
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
              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg outline-primary/50"
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
              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg outline-primary/50"
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
              className="w-full pl-10 pr-4 py-3 border border-primary/30 rounded-lg outline-primary/50"
              placeholder={t('signup.password_placeholder')}
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
    >
      <label className="block mb-3 text-lg font-medium text-gray-700">{t('signup.select_category')} *</label>
      <div className="grid grid-cols-1 gap-4 w-full">
        {userTypes.map((group, index) => (
          <div key={index} className="mb-3">
            <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200 hover:border-primary/30">
              <input
                type="radio"
                name="userTypeCategory"
                value={group.title}
                checked={form.userTypeCategory === group.title}
                onChange={handleRadioChange}
                className="h-5 w-5 text-primary focus:ring-primary"
              />
              <div>
                <span className="text-gray-900 font-medium text-base">{group.title}</span>
                <p className="text-gray-600 text-sm mt-1">
                  {group.options.length} options available
                </p>
              </div>
            </label>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const districts: District[] = React.useMemo(() => provinces.flatMap(p => p.districts || []), [provinces]);
  const filteredDistricts = React.useMemo(() => (districtQuery
    ? districts.filter(d => d.name.toLowerCase().includes(districtQuery.toLowerCase()))
    : districts), [districts, districtQuery]);

  const renderStep3 = () => {
    const selectedCategory = userTypes.find(group => group.title === form.userTypeCategory);
    
    return (
      <motion.div
        key="step3"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={sectionVariants}
        transition={springTransition}
      >
        <label className="block mb-3 text-lg font-medium text-gray-700">{t('signup.who_are_you')} *</label>
        <p className="text-sm text-gray-600 mb-4">Category: <span className="font-medium">{form.userTypeCategory}</span></p>
        <div className="grid grid-cols-1 gap-3 w-full">
          {selectedCategory?.options.map((option) => (
            <div key={option.value}>
              <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-300 hover:border-primary/30 transition-colors duration-200">
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
          )) || []}
        </div>
        {form.userType === "other" && (
          <div className="mt-4">
            <input
              type="text"
              name="otherType"
              value={form.otherType}
              onChange={handleChange}
              className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
              placeholder={t('signup.specify_role_placeholder')}
            />
          </div>
        )}
      </motion.div>
    );
  };

  // Combined Step 4: Location Details
  const renderStep4 = () => {
    // Only show location step if needed
    if (!needsLocationStep) return null;
    
    return (
      <motion.div
        key="location-step"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={sectionVariants}
        transition={springTransition}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold mb-4">{t('signup.location_details')}</h2>
        
        {/* Location Selection - Single Column Layout */}
        <div className="space-y-4">
          {/* District with search */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('signup.district_label')} *</label>
            <CustomDropdown
              trigger={
                <div className="w-full cursor-default rounded-md bg-white py-2.5 pr-2 pl-3 text-left border border-gray-300 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm">
                  <span className="flex items-center">
                    <span className={`block truncate ${selectedDistrict ? 'text-gray-900' : 'text-gray-500'}`}>
                      {selectedDistrict ? selectedDistrict.name : t('signup.search_or_select_district')}
                    </span>
                  </span>
                </div>
              }
              dropdownClassName="w-full max-h-72 overflow-auto rounded-md p-2 text-base shadow-lg border border-gray-300 overflow-hidden bg-gray-50 sm:text-sm"
              position="bottom-right"
              isOpen={isDistrictOpen}
              onToggle={setIsDistrictOpen}
              closeOnClick={false}
            >
              <div className="p-2">
                <input
                  type="text"
                  className="w-full border border-gray-300 outline-primary rounded-md p-2 mb-2 text-sm"
                  placeholder={t('signup.search_district_placeholder')}
                  value={districtQuery}
                  onChange={(e) => setDistrictQuery(e.target.value)}
                />
                <div className="max-h-56 overflow-auto">
                  {filteredDistricts.map((d) => (
                    <div
                      key={d.name}
                      onClick={() => {
                        setSelectedDistrict(d);
                        setDistrictQuery("");
                        setSelectedSector(null);
                        setSelectedCell(null);
                        setSelectedVillage(null);
                        setForm(prev => ({
                          ...prev,
                          district: d.name,
                          sector: undefined,
                          cell: undefined,
                          village: undefined
                        }));
                        setIsDistrictOpen(false);
                      }}
                      className={`px-3 py-2 cursor-pointer hover:bg-primary hover:text-white ${
                        selectedDistrict?.name === d.name ? 'bg-indigo-50 text-[#004f64] font-semibold' : ''
                      }`}
                    >
                      {d.name}
                    </div>
                  ))}
                </div>
              </div>
            </CustomDropdown>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('signup.sector_label')} *</label>
            <SelectDropdown
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

          {/* Cell */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('signup.cell_label')} *</label>
            <SelectDropdown
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

          {/* Village */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('signup.village_label')} *</label>
            <SelectDropdown
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
      </motion.div>
    );
  };

  // Combined Step 5: All Additional Details
  const renderStep5 = () => {
    const hasAdditionalFields = [
      'school_representatives',
      'religious_community_representatives',
      'doctors',
      'nurses',
      'chw',
      'anc',
      'cho',
      'frontline_health_workers',
      'epi_managers',
      'epi_supervisor'
    ].includes(form.userType);

    // Don't show this step if there are no additional fields for this user type
    if (!hasAdditionalFields) {
      return null;
    }

    return (
      <motion.div
        key="additional-details"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={sectionVariants}
        transition={springTransition}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold mb-4">{t('signup.additional_details')}</h2>
        
        <div className="space-y-4">
          {/* Health Worker */}
          {form.userType === 'epi_managers' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t('signup.nearby_health_center_label')} *
              </label>
              <input
                type="text"
                name="nearByHealthCenter"
                value={form.nearByHealthCenter || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
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
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {t('signup.school_address_label')}
                </label>
                <input
                  type="text"
                  name="schoolAddress"
                  value={form.schoolAddress || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  placeholder={t('signup.school_address_placeholder')}
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
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {t('signup.church_mosque_address_label')}
                </label>
                <input
                  type="text"
                  name="churchAddress"
                  value={form.churchAddress || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  placeholder={t('signup.church_mosque_address_placeholder')}
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
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {t('signup.hospital_address_label')}
                </label>
                <input
                  type="text"
                  name="hospitalAddress"
                  value={form.hospitalAddress || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  placeholder={t('signup.hospital_address_placeholder')}
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
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  {t('signup.health_center_address_label')}
                </label>
                <input
                  type="text"
                  name="healthCenterAddress"
                  value={form.healthCenterAddress || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  placeholder={t('signup.health_center_address_placeholder')}
                />
              </div>
            </>
          )}

          {/* EPI Supervisor */}
          {form.userType === 'epi_supervisor' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {t('signup.epi_district_label')} *
              </label>
              <SelectDropdown
                options={districts.map(d => ({ label: d.name, value: d.name }))}
                value={form.epiDistrict}
                onChange={(val) => setForm(prev => ({ ...prev, epiDistrict: val }))}
                placeholder={t('signup.select_district')}
                dropdownClassName="w-full border border-gray-300 bg-white rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none ${className}`}>
      <div className={`${currentStep >= 2 ? "max-w-2xl" : "max-w-xl"} mx-auto sm:p-8`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('signup.create_title')}</h1>
          <div className="flex justify-center mb-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step}
                </div>
                {step < totalSteps && (
                  <div className={`w-8 h-1 ${currentStep > step ? "bg-primary" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`relative ${currentStep >= 2 ? "min-h-[440px]" : "min-h-[240px]"}`}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && needsLocationStep && renderStep4()}
              {currentStep === 5 && needsLocationStep && renderStep5()}
            </AnimatePresence>
          </div>

          <div className="flex justify-between mt-8">
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

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex cursor-pointer items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
              >
                {t('signup.next')} <FiChevronRight className="ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex cursor-pointer items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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