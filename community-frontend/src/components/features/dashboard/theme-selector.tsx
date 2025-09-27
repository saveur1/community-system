import { CustomDropdown } from "@/components/ui/dropdown";
import { useTheme, type ThemeMode } from "@/providers/theme-provider";
import { HiCheck, HiDesktopComputer, HiMoon, HiSun } from "react-icons/hi";

// ThemeSelector Component
const ThemeSelector: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const themeOptions = [
    {
      mode: 'system' as ThemeMode,
      label: 'System',
      icon: <HiDesktopComputer className="w-4 h-4" />,
      description: 'Use system preference',
    },
    {
      mode: 'light' as ThemeMode,
      label: 'Light',
      icon: <HiSun className="w-4 h-4" />,
      description: 'Light theme',
    },
    {
      mode: 'dark' as ThemeMode,
      label: 'Dark',
      icon: <HiMoon className="w-4 h-4" />,
      description: 'Dark theme',
    },
  ];

  const getCurrentThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <HiSun className="w-5 h-5 text-gray-600 dark:text-gray-200" />;
      case 'dark':
        return <HiMoon className="w-5 h-5 text-gray-600 dark:text-gray-200" />;
      default:
        return (
          <HiDesktopComputer className="w-5 h-5 text-gray-600 dark:text-gray-200" />
        );
    }
  };

  return (
    <CustomDropdown
      trigger={
        <button
          className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          type="button"
          aria-label="Change theme"
        >
          {getCurrentThemeIcon()}
        </button>
      }
      position="bottom-right"
      dropdownClassName="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/10 dark:ring-gray-500/40 overflow-hidden"
      closeOnClick={true}
    >
      <div className="py-1">
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Theme
          </h3>
        </div>
        {themeOptions.map((option) => (
          <button
            key={option.mode}
            onClick={() => toggleTheme(option.mode)}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-3">
                {option.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </div>
            {theme === option.mode && (
              <HiCheck className="w-4 h-4 text-primary-600 dark:text-white" />
            )}
          </button>
        ))}
      </div>
    </CustomDropdown>
  );
};


export default ThemeSelector;