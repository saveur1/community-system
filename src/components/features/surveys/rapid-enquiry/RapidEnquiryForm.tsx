import { useState, type FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaClock, FaLink, FaBullseye, FaCalendarAlt } from 'react-icons/fa'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6'
import DateTimePicker from '../../../ui/date-time'

interface RapidEnquiryFormProps {
  title: string
  scheduledAt: Date | null
  status: 'draft' | 'scheduled' | 'active'
  onTitleChange: (title: string) => void
  onScheduledAtChange: (date: Date | null) => void
  onStatusChange: (status: 'draft' | 'scheduled' | 'active') => void
}

const RapidEnquiryForm: FC<RapidEnquiryFormProps> = ({
  title,
  scheduledAt,
  status,
  onTitleChange,
  onScheduledAtChange,
  onStatusChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const { t } = useTranslation()

  const [isDateTimeOpen, setIsDateTimeOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(scheduledAt)
  const [selectedHour, setSelectedHour] = useState<string>(
    scheduledAt ? String(new Date(scheduledAt).getHours()).padStart(2, '0') : '00'
  )
  const [selectedMinute, setSelectedMinute] = useState<string>(
    scheduledAt ? String(new Date(scheduledAt).getMinutes()).padStart(2, '0') : '00'
  )

  // Keep local state in sync when parent value changes externally
  useEffect(() => {
    setSelectedDate(scheduledAt)
    if (scheduledAt) {
      const d = new Date(scheduledAt)
      setSelectedHour(String(d.getHours()).padStart(2, '0'))
      setSelectedMinute(String(d.getMinutes()).padStart(2, '0'))
    }
  }, [scheduledAt])

  const updateScheduledAt = (date: Date | null, hour: string, minute: string) => {
    if (!date) {
      onScheduledAtChange(null)
      return
    }
    const composed = new Date(date)
    composed.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0)
    onScheduledAtChange(composed)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <div
        className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 hover:rounded-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaLink className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Rapid Enquiry Information</h2>
        </div>
        {isExpanded ? (
          <FaChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <FaChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FaBullseye className="w-4 h-4" />
              Enquiry Title
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter a descriptive title for your rapid enquiry"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            {!title && (
              <p className="text-xs text-gray-500 mt-1">
                A clear, descriptive title helps visitors understand your enquiry's purpose
              </p>
            )}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
                { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
                { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200"
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => onStatusChange(e.target.value as 'draft' | 'scheduled' | 'active')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Draft: Not visible to visitors • Scheduled: Will be published at the scheduled time • Active: Currently visible to visitors
            </p>
          </div>

          {status === 'scheduled' && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <FaCalendarAlt className="w-4 h-4" />
                Schedule
              </label>
              <DateTimePicker
                isOpen={isDateTimeOpen}
                onClose={() => setIsDateTimeOpen(false)}
                title="Pick schedule date & time"
                selectedDate={selectedDate}
                selectedHour={selectedHour}
                selectedMinute={selectedMinute}
                onDateChange={(d) => {
                  setSelectedDate(d)
                  updateScheduledAt(d, selectedHour, selectedMinute)
                }}
                onHourChange={(h) => {
                  setSelectedHour(h)
                  updateScheduledAt(selectedDate, h, selectedMinute)
                }}
                onMinuteChange={(m) => {
                  setSelectedMinute(m)
                  updateScheduledAt(selectedDate, selectedHour, m)
                }}
                trigger={
                  <button
                    type="button"
                    onClick={() => setIsDateTimeOpen(true)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    {selectedDate ? (
                      <span className="text-gray-900">
                        {selectedDate.toLocaleDateString()} {selectedHour}:{selectedMinute}
                      </span>
                    ) : (
                      <span className="text-gray-500">Select date and time</span>
                    )}
                  </button>
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Set a future date and time to schedule when this enquiry becomes active
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RapidEnquiryForm
