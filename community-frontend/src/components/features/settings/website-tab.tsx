// components/settings/WebsiteTab.tsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit3, FiUpload, FiSave, FiTrash2, FiLoader, FiTrendingUp } from 'react-icons/fi';
import { 
  FaUsers, FaChild, FaHeart, FaUserMd, FaChurch, FaHospital, 
  FaGraduationCap, FaHandsHelping, FaBrain, FaShieldAlt, FaUserFriends 
} from 'react-icons/fa';
import { MdVolunteerActivism, MdFamilyRestroom, MdSchool } from 'react-icons/md';
import { BiHealth } from 'react-icons/bi';
import { SelectDropdown } from '@/components/ui/select';
import { useSettings, useUpdateSettings, useAddSlideshow, useUpdateSlideshow, useDeleteSlideshow, useAddImpact, useUpdateImpact, useDeleteImpact } from '@/hooks/useSettings';
import { uploadToCloudinary } from '@/utility/logicFunctions';
import { toast } from 'react-toastify';

interface SlideImage {
  id: string;
  url: string;
  alt: string;
  statistics: {
    title: string;
    label: string;
    value: string;
  };
  isNew?: boolean;
}

interface ImpactStat {
  id: string;
  icon: string;
  value: string;
  label: string;
  color: string;
  isNew?: boolean;
}

const iconOptions = [
  { label: 'Users', value: 'FaUsers' },
  { label: 'Child', value: 'FaChild' },
  { label: 'Heart', value: 'FaHeart' },
  { label: 'Medical', value: 'FaUserMd' },
  { label: 'Education', value: 'FaGraduationCap' },
  { label: 'Helping', value: 'FaHandsHelping' },
  { label: 'Brain', value: 'FaBrain' },
  { label: 'Shield', value: 'FaShieldAlt' },
  { label: 'Hospital', value: 'FaHospital' },
  { label: 'Church', value: 'FaChurch' },
  { label: 'User Friends', value: 'FaUserFriends' },
  { label: 'Family Restroom', value: 'MdFamilyRestroom' },
  { label: 'Volunteer Activism', value: 'MdVolunteerActivism' },
  { label: 'School', value: 'MdSchool' },
  { label: 'Health', value: 'BiHealth' },
  { label: 'Trending Up', value: 'FiTrendingUp' }
];

const colorOptions = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-yellow-500', label: 'Yellow' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-indigo-500', label: 'Indigo' },
  { value: 'bg-gray-500', label: 'Gray' },
  { value: 'bg-orange-500', label: 'Orange' },
  { value: 'bg-teal-500', label: 'Teal' },
  { value: 'bg-cyan-500', label: 'Cyan' },
  { value: 'bg-lime-500', label: 'Lime' },
  { value: 'bg-amber-500', label: 'Amber' },
  { value: 'bg-emerald-500', label: 'Emerald' },
  { value: 'bg-rose-500', label: 'Rose' },
  { value: 'bg-violet-500', label: 'Violet' },
  { value: 'bg-sky-500', label: 'Sky' }
];

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'FaUsers': FaUsers,
    'FaChild': FaChild,
    'FaHeart': FaHeart,
    'MdVolunteerActivism': MdVolunteerActivism,
    'MdFamilyRestroom': MdFamilyRestroom,
    'FaUserMd': FaUserMd,
    'MdSchool': MdSchool,
    'FaChurch': FaChurch,
    'FaHospital': FaHospital,
    'FaGraduationCap': FaGraduationCap,
    'FaHandsHelping': FaHandsHelping,
    'FaBrain': FaBrain,
    'BiHealth': BiHealth,
    'FaShieldAlt': FaShieldAlt,
    'FaUserFriends': FaUserFriends,
    'FiTrendingUp': FiTrendingUp
  };
  
  const IconComponent = iconMap[iconName];
  return IconComponent || FaUsers; // Default fallback
};

export const WebsiteTab: React.FC = () => {
  // Hooks
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useSettings();
  const updateSettings = useUpdateSettings();
  const addSlideshow = useAddSlideshow();
  const updateSlideshow = useUpdateSlideshow();
  const deleteSlideshow = useDeleteSlideshow();
  const addImpact = useAddImpact();
  const updateImpact = useUpdateImpact();
  const deleteImpact = useDeleteImpact();

  // State
  const [websiteName, setWebsiteName] = useState('');
  const [websiteDescription, setWebsiteDescription] = useState('');
  const [heroSlides, setHeroSlides] = useState<SlideImage[]>([]);
  const [impactStats, setImpactStats] = useState<ImpactStat[]>([]);
  const [activeTab, setActiveTab] = useState<'hero' | 'impacts' | 'general'>('general');
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());

  // Initialize data from API
  useEffect(() => {
    if (settings) {
      setWebsiteName(settings.websiteName || '');
      setWebsiteDescription(settings.websiteDescription || '');
      
      // Transform slideshows
      const slides: SlideImage[] = (settings.slideshows || []).map(slide => ({
        id: slide.id,
        url: slide.imageUrl,
        alt: slide.altText,
        statistics: {
          title: slide.statisticsTitle,
          label: slide.statisticsLabel,
          value: slide.statisticsValue
        }
      }));
      setHeroSlides(slides);
      
      // Transform impacts
      const impacts: ImpactStat[] = (settings.impacts || []).map(impact => ({
        id: impact.id,
        icon: impact.icon,
        value: impact.value,
        label: impact.label,
        color: impact.color
      }));
      setImpactStats(impacts);
    }
  }, [settings]);

  // Helper functions
  const updateSlide = (id: string, field: string, value: string) => {
    setHeroSlides(slides => slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    ));
  };

  const updateSlideStats = (id: string, field: string, value: string) => {
    setHeroSlides(slides => slides.map(slide => 
      slide.id === id ? { 
        ...slide, 
        statistics: { ...slide.statistics, [field]: value }
      } : slide
    ));
  };

  const updateImpactStat = (id: string, field: string, value: string) => {
    setImpactStats(stats => stats.map(stat => 
      stat.id === id ? { ...stat, [field]: value } : stat
    ));
  };

  const addSlide = () => {
    const newSlide: SlideImage = {
      id: `new_${Date.now()}`,
      url: '',
      alt: 'New slide',
      statistics: { title: 'New Statistic', label: 'New metric', value: '0' },
      isNew: true
    };
    setHeroSlides([...heroSlides, newSlide]);
    setSelectedSlide(heroSlides.length);
  };

  const addImpactStatLocal = () => {
    const newStat: ImpactStat = {
      id: `new_${Date.now()}`,
      icon: 'FaUsers',
      value: '0',
      label: 'New Impact',
      color: 'bg-blue-500',
      isNew: true
    };
    setImpactStats([...impactStats, newStat]);
  };

  const removeSlide = (id: string) => {
    setHeroSlides(slides => slides.filter(slide => slide.id !== id));
    if (selectedSlide >= heroSlides.length - 1) {
      setSelectedSlide(Math.max(0, heroSlides.length - 2));
    }
  };

  const removeImpactStat = (id: string) => {
    setImpactStats(stats => stats.filter(stat => stat.id !== id));
  };

  // Image upload handler
  const handleImageUpload = async (slideId: string, file: File) => {
    if (!settings?.id) {
      toast.error('Settings not loaded');
      return;
    }

    setUploadingImages(prev => new Set(prev).add(slideId));
    
    try {
      const uploadResult = await uploadToCloudinary(file, {
        folder: 'website-settings/slideshows',
        onProgress: (_) => {
          // You could show progress here if needed
        }
      });

      // Update local state
      setHeroSlides(slides => slides.map(slide => 
        slide.id === slideId ? { ...slide, url: uploadResult.secureUrl } : slide
      ));

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(slideId);
        return newSet;
      });
    }
  };

  // Save functions
  const saveGeneralSettings = async () => {
    if (!settings?.id) {
      toast.error('Settings not loaded');
      return;
    }

    try {
      await updateSettings.mutateAsync({
        settingsId: settings.id,
        payload: {
          websiteName,
          websiteDescription
        }
      });
    } catch (error) {
      console.error('Failed to save general settings:', error);
    }
  };

  const saveSlideshow = async (slide: SlideImage) => {
    if (!settings?.id) {
      toast.error('Settings not loaded');
      return;
    }

    try {
      if (slide.isNew) {
        await addSlideshow.mutateAsync({
          settingsId: settings.id,
          payload: {
            imageUrl: slide.url,
            altText: slide.alt,
            statisticsTitle: slide.statistics.title,
            statisticsLabel: slide.statistics.label,
            statisticsValue: slide.statistics.value,
            order: heroSlides.indexOf(slide)
          }
        });
        // Remove isNew flag after successful creation
        setHeroSlides(slides => slides.map(s => 
          s.id === slide.id ? { ...s, isNew: false } : s
        ));
      } else {
        await updateSlideshow.mutateAsync({
          slideshowId: slide.id,
          payload: {
            imageUrl: slide.url,
            altText: slide.alt,
            statisticsTitle: slide.statistics.title,
            statisticsLabel: slide.statistics.label,
            statisticsValue: slide.statistics.value,
            order: heroSlides.indexOf(slide)
          }
        });
      }
    } catch (error) {
      console.error('Failed to save slideshow:', error);
    }
  };

  const deleteSlideshowFunction = async (slideId: string) => {
    const slide = heroSlides.find(s => s.id === slideId);
    if (!slide) return;

    if (slide.isNew) {
      // Just remove from local state if it's new
      removeSlide(slideId);
    } else {
      try {
        await deleteSlideshow.mutateAsync(slideId);
        removeSlide(slideId);
      } catch (error) {
        console.error('Failed to delete slideshow:', error);
      }
    }
  };

  const saveImpact = async (impact: ImpactStat) => {
    if (!settings?.id) {
      toast.error('Settings not loaded');
      return;
    }

    try {
      if (impact.isNew) {
        await addImpact.mutateAsync({
          settingsId: settings.id,
          payload: {
            icon: impact.icon,
            value: impact.value,
            label: impact.label,
            color: impact.color,
            order: impactStats.indexOf(impact)
          }
        });
        // Remove isNew flag after successful creation
        setImpactStats(stats => stats.map(s => 
          s.id === impact.id ? { ...s, isNew: false } : s
        ));
      } else {
        await updateImpact.mutateAsync({
          impactId: impact.id,
          payload: {
            icon: impact.icon,
            value: impact.value,
            label: impact.label,
            color: impact.color,
            order: impactStats.indexOf(impact)
          }
        });
      }
    } catch (error) {
      console.error('Failed to save impact:', error);
    }
  };

  const deleteImpactStat = async (impactId: string) => {
    const impact = impactStats.find(s => s.id === impactId);
    if (!impact) return;

    if (impact.isNew) {
      // Just remove from local state if it's new
      removeImpactStat(impactId);
    } else {
      try {
        await deleteImpact.mutateAsync(impactId);
        removeImpactStat(impactId);
      } catch (error) {
        console.error('Failed to delete impact:', error);
      }
    }
  };

  // Loading states
  const isLoading = settingsLoading || 
    updateSettings.isPending || 
    addSlideshow.isPending || 
    updateSlideshow.isPending || 
    deleteSlideshow.isPending ||
    addImpact.isPending ||
    updateImpact.isPending ||
    deleteImpact.isPending;

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading settings...</span>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load settings</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Website Settings</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'general' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'hero' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Hero Section
          </button>
          <button
            onClick={() => setActiveTab('impacts')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'impacts' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Impact Stats
          </button>
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-200">General Settings</h4>
            <button onClick={saveGeneralSettings} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
              <FiSave className="w-4 h-4" /> Save
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website Name</label>
              <input
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={websiteDescription}
                onChange={(e) => setWebsiteDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hero' && (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-200">Hero Slideshow</h4>
            <button onClick={addSlide} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
              <FiPlus className="w-4 h-4" /> Add Slide
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {heroSlides.map((slide, i) => (
              <div key={slide.id} className={`relative group border-2 rounded-lg ${selectedSlide === i ? 'border-primary' : 'border-gray-200 dark:border-gray-600'}`}>
                {slide.url ? (
                  <img src={slide.url} alt={slide.alt} className="w-full h-20 object-cover rounded" />
                ) : (
                  <div className="w-full h-20 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded">
                    {uploadingImages.has(slide.id) ? (
                      <FiLoader className="w-6 h-6 text-gray-400 animate-spin" />
                    ) : (
                      <FiUpload className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                  <button onClick={() => setSelectedSlide(i)} className="text-white p-2 hover:bg-white hover:text-gray-700 rounded">
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                  <label className="text-white p-2 hover:bg-white hover:text-gray-700 rounded cursor-pointer">
                    <FiUpload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(slide.id, file);
                      }}
                    />
                  </label>
                  {heroSlides.length > 1 && (
                    <button onClick={() => deleteSlideshowFunction(slide.id)} className="text-white p-2 hover:bg-red-500 hover:bg-opacity-80 rounded">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {slide.isNew && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">New</div>
                )}
              </div>
            ))}
          </div>

          {heroSlides[selectedSlide] && (
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-center">
                <h5 className="font-medium text-gray-900 dark:text-gray-100">Edit Slide {selectedSlide + 1}</h5>
                <button 
                  onClick={() => saveSlideshow(heroSlides[selectedSlide])}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark disabled:opacity-50"
                >
                  {isLoading ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiSave className="w-3 h-3" />}
                  Save
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Image Alt Text"
                  value={heroSlides[selectedSlide].alt}
                  onChange={(e) => updateSlide(heroSlides[selectedSlide].id, 'alt', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                />
                <input
                  placeholder="Statistics Title"
                  value={heroSlides[selectedSlide].statistics.title}
                  onChange={(e) => updateSlideStats(heroSlides[selectedSlide].id, 'title', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                />
                <input
                  placeholder="Statistics Label"
                  value={heroSlides[selectedSlide].statistics.label}
                  onChange={(e) => updateSlideStats(heroSlides[selectedSlide].id, 'label', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                />
                <input
                  placeholder="Statistics Value"
                  value={heroSlides[selectedSlide].statistics.value}
                  onChange={(e) => updateSlideStats(heroSlides[selectedSlide].id, 'value', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'impacts' && (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-200">Impact Statistics</h4>
            <button onClick={addImpactStatLocal} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
              <FiPlus className="w-4 h-4" /> Add Stat
            </button>
          </div>

          <div className="space-y-4">
            {impactStats.map((stat) => {
              const IconComponent = getIconComponent(stat.icon);
              return (
                <div key={stat.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                <SelectDropdown
                  options={iconOptions}
                  value={stat.icon}
                  onChange={(value) => updateImpactStat(stat.id, 'icon', value)}
                  className="w-40"
                />
                <SelectDropdown
                  options={colorOptions}
                  value={stat.color}
                  onChange={(value) => updateImpactStat(stat.id, 'color', value)}
                  className="w-32"
                />
                <input
                  placeholder="Label"
                  value={stat.label}
                  onChange={(e) => updateImpactStat(stat.id, 'label', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                />
                <input
                  placeholder="Value"
                  value={stat.value}
                  onChange={(e) => updateImpactStat(stat.id, 'value', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveImpact(stat)}
                    disabled={isLoading}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-2 disabled:opacity-50"
                    title="Save"
                  >
                    {isLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteImpactStat(stat.id)}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 disabled:opacity-50"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                {stat.isNew && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">New</div>
                )}
              </div>
            )})}
          </div>

          {impactStats.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No impact statistics yet. Add your first statistic to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Hero Preview Section */}
      {activeTab === 'hero' && heroSlides.length > 0 && (
        <div className="mt-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-4">Hero Preview</h4>
          <div className="relative bg-gradient-to-r from-primary to-primary-dark rounded-lg overflow-hidden h-64 md:h-72 lg:h-80">
            {/* Background Image */}
            {heroSlides[selectedSlide]?.url && (
              <div className="absolute inset-0">
                <img 
                  src={heroSlides[selectedSlide].url} 
                  alt={heroSlides[selectedSlide].alt}
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-primary/60"></div>
              </div>
            )}
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-between p-8">
              {/* Left side - Text content */}
              <div className="flex-1 text-white">
                <div className="mb-4">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    Give feedback now
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Community<br />Listening
                </h1>
                <p className="text-lg text-white/90 font-light mb-4">FOR YOU</p>
                <p className="text-white/80 text-sm max-w-md">
                  {websiteDescription || 'Amplifying community voices through faith-based collaboration.'}
                </p>
              </div>

              {/* Right side - Statistics card */}
              {heroSlides[selectedSlide]?.statistics && (
                <div className="bg-white/10 backdrop-blur-md text-white p-6 rounded-xl shadow-lg max-w-xs">
                  <h3 className="text-lg font-semibold mb-3">
                    {heroSlides[selectedSlide].statistics.title}
                  </h3>
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-sm text-blue-100 block">
                      {heroSlides[selectedSlide].statistics.label}
                    </span>
                    <span className="text-xl font-bold">
                      {heroSlides[selectedSlide].statistics.value}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-4 left-8 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === selectedSlide ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};