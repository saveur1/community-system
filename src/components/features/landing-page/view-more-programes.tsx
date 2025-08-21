
import { useState } from "react";
import { CustomDropdown } from "@/components/ui/dropdown";
import { useTranslation } from "react-i18next";

const dummyProgrammes = [
  { value: "hiv", label: "HIV/AIDS" },
  { value: "immunization", label: "Immunization (SUGIRA MWANA)" },
  { value: "mental", label: "Mental Health (Baho Neza)" },
  { value: "malaria", label: "Malaria SBC" },
  { value: "nutrition", label: "Nutrition" },
  { value: "data", label: "Data-Driven Health" },
];

interface ViewMoreProgramsProps {
  dropDownPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}
const ViewMorePrograms = ({ dropDownPosition = "bottom-right" }: ViewMoreProgramsProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const [other, setOther] = useState("");
  const { t } = useTranslation();

  const handleCheck = (value: string) => {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleOtherCheck = () => {
    setIsOtherOpen((value) => {
      if (value == false)
        setOther("");

      return !value;
    })

  };

  return (
    <CustomDropdown
      trigger={
        <button type="button" className="text-primary underline bg-transparent px-0 py-0 font-medium text-sm cursor-pointer hover:text-primary-dark">
          {t("button.view_more")}
        </button>
      }
      dropdownClassName="min-w-96 rounded-md bg-success shadow-lg ring-1 ring-black/10 p-4"
      closeOnClick={false}
      position={dropDownPosition}
    >
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white mb-2">{t("feedback.programme_more")}</h4>
        <div className="grid grid-cols-2 gap-2">
          {dummyProgrammes.map(option => (
            <label key={option.value} className="flex items-center text-gray-200 gap-2 text-sm cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => handleCheck(option.value)}
                className="h-4 w-4 text-gray-200 accent-title focus:ring-title border-gray-200 rounded cursor-pointer"
              />
              {option.label}
            </label>
          ))}
          {/* Other option */}
          <label className="flex items-center text-gray-200 gap-2 text-sm cursor-pointer col-span-2 hover:text-white">
            <input
              type="checkbox"
              checked={isOtherOpen}
              onChange={handleOtherCheck}
              className="h-4 w-4 text-gray-200 accent-title focus:ring-title border-gray-200 rounded cursor-pointer"
            />
            Other
          </label>

          {isOtherOpen && (
            <input
              type="text"
              value={other}
              onChange={e => setOther(e.target.value)}
              className="col-span-2 mt-1 border bg-gray-300/30 border-gray-200 placeholder:text-gray-300/80 text-white rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
              placeholder="Please specify"
            />
          )}
        </div>
      </div>
    </CustomDropdown>
  );
};

export default ViewMorePrograms;
