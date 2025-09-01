import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/breadcrum';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { SelectDropdown } from '@/components/ui/select';
import locations from '@/components/common/locations.json';
import { useRolesList } from '@/hooks/useRoles';
import { useCreateUser } from '@/hooks/useUsers';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// Location types
type Village = { name: string };
type Cell = { name: string; villages: Village[] };
type Sector = { name: string; cells: Cell[] };
type District = { name: string; sectors: Sector[] };
type Province = { name: string; districts: District[] };

const AddUserPage = () => {
  const navigate = useNavigate();
  const { category } = Route.useSearch();
  const { mutate: createUser, isPending } = useCreateUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    userType: category || '',
    roleId: '',
  });

  const { data: rolesResp } = useRolesList({});

  const totalSteps = 3; // 1. Info, 2. Location, 3. Role/Details

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'district') {
      setFormData(prev => ({ ...prev, sector: '', cell: '', village: '' }));
    } else if (name === 'sector') {
      setFormData(prev => ({ ...prev, cell: '', village: '' }));
    } else if (name === 'cell') {
      setFormData(prev => ({ ...prev, village: '' }));
    } else if (name === 'userType') {
      setFormData(prev => ({ ...prev, roleId: '' }));
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phoneNumber,
      userType: formData.userType,
      address: `${formData.village}, ${formData.cell}, ${formData.sector}, ${formData.district}`,
      roleIds: [formData.roleId],
    };

    createUser(payload, {
      onSuccess: () => {
        navigate({ to: '/dashboard/accounts' });
      },
    });
  };

  const toLabel = (name: string) =>
    name
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const districtOptions = useMemo(() => {
    return locations.provinces.flatMap((p: Province) => p.districts.map((d: District) => ({ value: d.name, label: d.name })));
  }, []);

  const sectorOptions = useMemo(() => {
    const selectedDistrict = locations.provinces
      .flatMap((p: Province) => p.districts)
      .find((d: District) => d.name === formData.district);
    return selectedDistrict?.sectors.map((s: Sector) => ({ value: s.name, label: s.name })) ?? [];
  }, [formData.district]);

  const cellOptions = useMemo(() => {
    const selectedDistrict = locations.provinces
      .flatMap((p: Province) => p.districts)
      .find((d: District) => d.name === formData.district);
    const selectedSector = selectedDistrict?.sectors.find((s: Sector) => s.name === formData.sector);
    return selectedSector?.cells.map((c: Cell) => ({ value: c.name, label: c.name })) ?? [];
  }, [formData.district, formData.sector]);

  const villageOptions = useMemo(() => {
    const selectedDistrict = locations.provinces
      .flatMap((p: Province) => p.districts)
      .find((d: District) => d.name === formData.district);
    const selectedSector = selectedDistrict?.sectors.find((s: Sector) => s.name === formData.sector);
    const selectedCell = selectedSector?.cells.find((c: Cell) => c.name === formData.cell);
    return selectedCell?.villages.map((v: Village) => ({ value: v.name, label: v.name })) ?? [];
  }, [formData.district, formData.sector, formData.cell]);

  const roleGroups = useMemo(() => {
    const list = rolesResp?.result ?? [];
    const map = new Map<string, { title: string; options: { value: string; label: string }[] }>();
    for (const r of list) {
      const cat = r.category?.trim() || 'Other';
      if (!map.has(cat)) {
        map.set(cat, { title: cat, options: [] });
      }
      map.get(cat)!.options.push({ value: r.id, label: toLabel(r.name) });
    }
    return Array.from(map.values());
  }, [rolesResp]);

  const userTypeOptions = useMemo(() => roleGroups.map(g => ({ value: g.title, label: g.title })), [roleGroups]);
  const roleOptions = useMemo(() => {
    const selectedGroup = roleGroups.find(g => g.title === formData.userType);
    return selectedGroup?.options ?? [];
  }, [formData.userType, roleGroups]);

  // Compute singular entity label based on category
  const entityLabel = useMemo(() => {
    const c = (category || '').trim();
    switch (c) {
      case 'Stakeholders':
        return 'Stakeholder';
      case 'RICH Members':
        return 'RICH Member';
      case 'Health service providers':
        return 'Health Provider';
      case 'Community Members':
        return 'Community Member';
      default:
        return 'User';
    }
  }, [category]);

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{entityLabel} Information</h3>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter user's full name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter email address"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="Enter phone number"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Location Details</h3>
      <SelectDropdown
        label="District"
        value={formData.district}
        onChange={(value) => handleSelectChange('district', value)}
        options={districtOptions}
        placeholder="Select a district"
      />
      <SelectDropdown
        label="Sector"
        value={formData.sector}
        onChange={(value) => handleSelectChange('sector', value)}
        options={sectorOptions}
        placeholder="Select a sector"
        disabled={!formData.district}
      />
      <SelectDropdown
        label="Cell"
        value={formData.cell}
        onChange={(value) => handleSelectChange('cell', value)}
        options={cellOptions}
        placeholder="Select a cell"
        disabled={!formData.sector}
      />
      <SelectDropdown
        label="Village"
        value={formData.village}
        onChange={(value) => handleSelectChange('village', value)}
        options={villageOptions}
        placeholder="Select a village"
        disabled={!formData.cell}
      />
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
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Role and Additional Details</h3>
      {!category && (
        <SelectDropdown
          label="User Category"
          value={formData.userType}
          onChange={(value) => handleSelectChange('userType', value)}
          options={userTypeOptions}
          placeholder="Select a category"
        />
      )}
      {category ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">User Role</label>
          <div className="space-y-2">
            {roleOptions.map((opt) => (
              <label key={opt.value} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                <input
                  type="radio"
                  name="roleId"
                  value={opt.value}
                  checked={formData.roleId === opt.value}
                  onChange={(e) => handleSelectChange('roleId', e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="text-gray-700 text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <SelectDropdown
          label="User Role"
          value={formData.roleId}
          onChange={(value) => handleSelectChange('roleId', value)}
          options={roleOptions}
          placeholder="Select a role"
          disabled={!formData.userType}
        />
      )}
    </motion.div>
  );

  return (
    <div>
      <Breadcrumb
        title={`Add ${entityLabel}`}
        items={['Dashboard', 'Accounts', `Add ${entityLabel}`]}
        className="absolute top-0 left-0 w-full"
      />

      <div className="pt-16 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg drop-shadow-xl p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <motion.form
            layout
            transition={{ duration: 0.3, type: 'spring', bounce: 0.2 }}
            onSubmit={e => e.preventDefault()}
            className="relative"
          >
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </AnimatePresence>
          </motion.form>

          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="mr-2" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Next
                <FiChevronRight className="ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Creating...' : `Create ${entityLabel}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/accounts/add-new')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: search.category as string | undefined,
    };
  },
  component: AddUserPage,
});
