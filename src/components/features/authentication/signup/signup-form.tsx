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
  otherType: string;
  // Additional fields (optional)
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  nationalId?: string;
  preferredLanguage?: string;
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
      title: "Community",
      options: [
        { value: "local_citizen", label: "Local Citizen" },
        { value: "health_worker", label: "Community Health Worker" },
        { value: "local_influencer", label: "Local Influencer" },
        { value: "school_director", label: "School Director" },
      ]
    },
    { 
      title: "Religious Leaders",
      options: [
        { value: "religious_influencer", label: "Religious Influencer" },
        { value: "pastor", label: "Pastor" },
        { value: "church_mosque_rep", label: "Church/Mosque Representative" }
      ]
    },
    { 
      title: "Health Services Providers",
      options: [
        { value: "nurse", label: "Nurse" },
        { value: "local_health_center", label: "Local Health Center" },
        { value: "epi_supervisor", label: "EPI Supervisor" }
      ]
    },
    { 
      title: "Stakeholders",
      options: [
        { value: "unicef", label: "UNICEF" },
        { value: "rbc", label: "RBC" }
      ]
    }
  ];

  const isStakeholder = (t: string) => ['unicef','rbc'].includes(t);
  const needsAdditionalSteps = form.userType && !['local_citizen'].includes(form.userType) && !isStakeholder(form.userType);
  const showsStep6 = needsAdditionalSteps && !['local_influencer'].includes(form.userType);
  const totalSteps = 3 + (needsAdditionalSteps ? 2 : 0) + (showsStep6 ? 1 : 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm({ ...form, userType: value });
    showVerificationWarning(value);
    // Reset additional steps data when userType changes
    setSelectedDistrict(null); setSelectedSector(null); setSelectedCell(null); setSelectedVillage(null);
    setForm((prev) => ({
      ...prev,
      district: undefined,
      sector: undefined,
      cell: undefined,
      village: undefined,
      nationalId: undefined,
      preferredLanguage: undefined,
      nearByHealthCenter: undefined,
      schoolName: undefined,
      schoolAddress: undefined,
      churchName: undefined,
      churchAddress: undefined,
      hospitalName: undefined,
      hospitalAddress: undefined,
      healthCenterName: undefined,
      healthCenterAddress: undefined,
      epiDistrict: undefined,
    }));
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

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!form.fullName.trim()) {
          toast.error(t('signup.please_enter_name'),{
            position: "bottom-center",
            theme: "dark"
          });
          return false;
        }
        if (!form.phone.trim() || form.phone.length < 10) {
          toast.error(t('signup.please_enter_phone'),{
            position: "bottom-center",
            theme: "dark"
          });
          return false;
        }
        return true;
      case 2:
        if (form.email.trim() && !form.email.includes('@')) {
          toast.error("Please enter a valid email address",{
            position: "bottom-center",
            theme: "dark"
          });
          return false;
        }
        if (!form.password.trim() || form.password.length < 6) {
          toast.error("Password must be at least 6 characters",{
            position: "bottom-center",
            theme: "dark"
          });
          return false;
        }
        return true;
      case 3:
        if (!form.userType) {
          toast.error("Please select a user type",{
            position: "bottom-center",
            theme: "dark"
          });
          return false;
        }
        return true;
      case 4:
        // If additional steps enabled, require district-sector-cell-village
        if (needsAdditionalSteps) {
          if (!form.district || !form.sector || !form.cell || !form.village) {
            toast.error("Please complete location selection (district, sector, cell, village)", { position: "bottom-center", theme: "dark" });
            return false;
          }
        }
        return true;
      case 5:
        if (needsAdditionalSteps) {
          if (!form.nationalId || form.nationalId.trim().length < 10) {
            toast.error("Please enter a valid National ID", { position: "bottom-center", theme: "dark" });
            return false;
          }
          if (!form.preferredLanguage) {
            toast.error("Please select Preferred Language", { position: "bottom-center", theme: "dark" });
            return false;
          }
        }
        return true;
      case 6:
        if (showsStep6) {
          switch (form.userType) {
            case 'health_worker':
              if (!form.nearByHealthCenter) { toast.error("Please provide Nearby Health Center", { position: "bottom-center", theme: "dark" }); return false; }
              break;
            case 'school_director':
              if (!form.schoolName || !form.schoolAddress) { toast.error("Please provide School name and address", { position: "bottom-center", theme: "dark" }); return false; }
              break;
            case 'religious_influencer':
            case 'pastor':
            case 'church_mosque_rep':
              if (!form.churchName || !form.churchAddress) { toast.error("Please provide Church/Mosque name and address", { position: "bottom-center", theme: "dark" }); return false; }
              break;
            case 'nurse':
              if (!form.hospitalName || !form.hospitalAddress) { toast.error(t('signup.provide_hospital'), { position: "bottom-center", theme: "dark" }); return false; }
              break;
            case 'local_health_center':
              if (!form.healthCenterName || !form.healthCenterAddress) { toast.error(t('signup.provide_health_center'), { position: "bottom-center", theme: "dark" }); return false; }
            break;
          case 'epi_supervisor':
            if (!form.epiDistrict) { toast.error(t('signup.select_epi_district'), { position: "bottom-center", theme: "dark" }); return false; }
            break;
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
      roleType: form.userType || 'local_influencer',
      userType: userTypeForBackend || undefined,
      // Additional optional fields
      district: form.district,
      sector: form.sector,
      cell: form.cell,
      village: form.village,
      nationalId: form.nationalId,
      preferredLanguage: form.preferredLanguage,
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
    <div className="space-y-4">
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
      className="absolute top-0 left-0 w-full"
    >
      <div className="space-y-4">
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

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
    >
      <label className="block mb-3 text-lg font-medium text-gray-700">{t('signup.who_are_you')} *</label>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {userTypes.map((group, index) => (
          <div key={index} className="mb-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{group.title}</h3>
            <div className="space-y-1">
              {group.options.map((option) => (
                <div key={option.value}>
                  <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
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
              ))}
            </div>
          </div>
        ))}
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

  const districts: District[] = React.useMemo(() => provinces.flatMap(p => p.districts || []), [provinces]);
  const filteredDistricts = React.useMemo(() => (districtQuery
    ? districts.filter(d => d.name.toLowerCase().includes(districtQuery.toLowerCase()))
    : districts), [districts, districtQuery]);

  const renderStep4 = () => (
    <motion.div
      key="step4"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
    >
      <h2 className="text-xl font-semibold mb-4">{t('signup.location_details')}</h2>
      {/* District with search using CustomDropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.district_label')}</label>
        <CustomDropdown
          trigger={<div className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-2.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 sm:text-sm">
            <span className="col-start-1 row-start-1 flex items-center pr-6">
              <span className={`block truncate ${selectedDistrict ? 'text-gray-900' : 'text-gray-500'}`}>
                {selectedDistrict ? selectedDistrict.name : t('signup.search_or_select_district')}
              </span>
            </span>
          </div>}
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
                    setSelectedDistrict(d); setDistrictQuery("");
                    setSelectedSector(null); setSelectedCell(null); setSelectedVillage(null);
                    setForm(prev => ({ ...prev, district: d.name, sector: undefined, cell: undefined, village: undefined }));
                    setIsDistrictOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-primary hover:text-white ${selectedDistrict?.name === d.name ? 'bg-indigo-50 text-[#004f64] font-semibold' : ''}`}
                >
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </CustomDropdown>
      </div>

      {/* Sector */}
      <div className="mb-4">
        <SelectDropdown
          label={t('signup.sector_label')}
          options={(selectedDistrict?.sectors || []).map(s => ({ label: s.name, value: s.name }))}
          value={selectedSector?.name}
          dropdownClassName="border border-gray-300 bg-gray-50"
          onChange={(val) => {
            const s = selectedDistrict?.sectors.find(x => x.name === val) || null;
            setSelectedSector(s);
            setSelectedCell(null); setSelectedVillage(null);
            setForm(prev => ({ ...prev, sector: val, cell: undefined, village: undefined }));
          }}
          placeholder={t('signup.select_sector_placeholder')}
        />
      </div>

      {/* Cell */}
      <div className="mb-4">
        <SelectDropdown
          label={t('signup.cell_label')}
          options={(selectedSector?.cells || []).map(c => ({ label: c.name, value: c.name }))}
          value={selectedCell?.name}
          dropdownClassName="border border-gray-300 bg-gray-50"
          onChange={(val) => {
            const c = selectedSector?.cells.find(x => x.name === val) || null;
            setSelectedCell(c);
            setSelectedVillage(null);
            setForm(prev => ({ ...prev, cell: val, village: undefined }));
          }}
          placeholder={t('signup.select_cell_placeholder')}
          disabled={!selectedSector}
        />
      </div>

      {/* Village */}
      <div className="mb-2">
        <SelectDropdown
          label={t('signup.village_label')}
          dropdownClassName="border border-gray-300 bg-gray-50"
          options={(selectedCell?.villages || []).map(v => ({ label: v.name, value: v.name }))}
          value={selectedVillage?.name}
          onChange={(val) => {
            const v = (selectedCell?.villages || []).find(x => x.name === val) || null;
            setSelectedVillage(v);
            setForm(prev => ({ ...prev, village: val }));
          }}
          placeholder={t('signup.select_village_placeholder')}
          disabled={!selectedCell}
        />
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div
      key="step5"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
    >
      <h2 className="text-xl font-semibold mb-4">{t('signup.identification')}</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.national_id_label')}</label>
        <input
          type="text"
          name="nationalId"
          value={form.nationalId || ''}
          onChange={handleChange}
          className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
          placeholder={t('signup.national_id_placeholder')}
        />
      </div>
      <div>
        <SelectDropdown
          label={t('signup.preferred_language_label')}
          dropdownClassName="border border-gray-300 bg-gray-50"
          options={[
            { label: 'Kinyarwanda', value: 'kinyarwanda' },
            { label: 'English', value: 'english' },
            { label: 'French', value: 'french' },
            { label: 'Swahili', value: 'swahili' },
          ]}
          value={form.preferredLanguage}
          onChange={(val) => setForm(prev => ({ ...prev, preferredLanguage: val }))}
          placeholder={t('signup.select_language_placeholder')}
        />
      </div>
    </motion.div>
  );

  const renderStep6 = () => (
    <motion.div
      key="step6"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
    >
      <h2 className="text-xl font-semibold mb-4">{t('signup.additional_details')}</h2>
      {form.userType === 'health_worker' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.nearby_health_center_label')}</label>
          <input
            type="text"
            name="nearByHealthCenter"
            value={form.nearByHealthCenter || ''}
            onChange={handleChange}
            className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
            placeholder={t('signup.nearby_health_center_placeholder')}
          />
        </div>
      )}

      {form.userType === 'school_director' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.school_name_label')}</label>
            <input
              type="text"
              name="schoolName"
              value={form.schoolName || ''}
              onChange={handleChange}
              className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
              placeholder={t('signup.school_name_placeholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.school_address_label')}</label>
            <input
              type="text"
              name="schoolAddress"
              value={form.schoolAddress || ''}
              onChange={handleChange}
              className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
              placeholder={t('signup.school_address_placeholder')}
            />
          </div>
        </div>
      )}

      {['religious_influencer','pastor','church_mosque_rep'].includes(form.userType) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.church_mosque_name_label')}</label>
            <input
              type="text"
              name="churchName"
              value={form.churchName || ''}
              onChange={handleChange}
              className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
              placeholder={t('signup.church_mosque_name_placeholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.church_mosque_address_label')}</label>
            <input
              type="text"
              name="churchAddress"
              value={form.churchAddress || ''}
              onChange={handleChange}
              className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
              placeholder={t('signup.church_mosque_address_placeholder')}
            />
          </div>
        </div>
      )}

      {form.userType === 'nurse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.hospital_name_label')}</label>
            <input
              type="text"
              name="hospitalName"
              value={form.hospitalName || ''}
              onChange={handleChange}
              className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
              placeholder={t('signup.hospital_name_placeholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.hospital_address_label')}</label>
            <input
              type="text"
              name="hospitalAddress"
              value={form.hospitalAddress || ''}
              onChange={handleChange}
              className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
              placeholder={t('signup.hospital_address_placeholder')}
            />
          </div>
        </div>
      )}

      {form.userType === 'local_health_center' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.health_center_name_label')}</label>
            <input
              type="text"
              name="healthCenterName"
              value={form.healthCenterName || ''}
              onChange={handleChange}
              className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
              placeholder={t('signup.health_center_name_placeholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.health_center_address_label')}</label>
            <input
              type="text"
              name="healthCenterAddress"
              value={form.healthCenterAddress || ''}
              onChange={handleChange}
              className="w-full border outline-none border-primary/30 rounded-lg p-3 outline-primary/50"
              placeholder={t('signup.health_center_address_placeholder')}
            />
          </div>
        </div>
      )}

      {form.userType === 'epi_supervisor' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">{t('signup.epi_district_label')}</label>
          <SelectDropdown
            options={districts.map(d => ({ label: d.name, value: d.name }))}
            value={form.epiDistrict}
            onChange={(val) => setForm(prev => ({ ...prev, epiDistrict: val }))}
            placeholder={t('signup.select_district')}
          />
        </div>
      )}
    </motion.div>
  );
  return (
    <div className={`col-span-3 bg-white rounded-xl lg:rounded-r-xl lg:rounded-l-none ${className}`}>
      <div className={`${currentStep >= 3 ? "max-w-2xl" : "max-w-md"} mx-auto p-6 sm:p-8`}>
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
          <div className={`relative ${currentStep >= 3 ? "min-h-[440px]" : "min-h-[180px]"}`}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && needsAdditionalSteps && renderStep4()}
              {currentStep === 5 && needsAdditionalSteps && renderStep5()}
              {currentStep === 6 && showsStep6 && renderStep6()}
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