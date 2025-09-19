import { useState, type FC, useEffect } from 'react'
// import { useTranslation } from 'react-i18next'
import { FaLink, FaBullseye, FaCalendarAlt } from 'react-icons/fa'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa6'
import DateTimePicker from '@/components/ui/date-time'

interface RapidEnquiryFormProps {
  title: string
  startDate: Date | null
  endDate: Date | null
  status: 'draft' | 'active'
  onTitleChange: (title: string) => void
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  onStatusChange: (status: 'draft' | 'active') => void
}

const RapidEnquiryForm: FC<RapidEnquiryFormProps> = ({
  title,
  startDate,
  endDate,
  status,
  onTitleChange,
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  // const { t } = useTranslation()

  const [isStartDateTimeOpen, setIsStartDateTimeOpen] = useState(false)
  const [isEndDateTimeOpen, setIsEndDateTimeOpen] = useState(false)
  
  const [startSelectedDate, setStartSelectedDate] = useState<Date | null>(startDate)
  const [startSelectedHour, setStartSelectedHour] = useState<string>(
    startDate ? String(new Date(startDate).getHours()).padStart(2, '0') : '00'
  )
  const [startSelectedMinute, setStartSelectedMinute] = useState<string>(
    startDate ? String(new Date(startDate).getMinutes()).padStart(2, '0') : '00'
  )

  const [endSelectedDate, setEndSelectedDate] = useState<Date | null>(endDate)
  const [endSelectedHour, setEndSelectedHour] = useState<string>(
    endDate ? String(new Date(endDate).getHours()).padStart(2, '0') : '00'
  )
  const [endSelectedMinute, setEndSelectedMinute] = useState<string>(
    endDate ? String(new Date(endDate).getMinutes()).padStart(2, '0') : '00'
  )

  // Keep local state in sync when parent values change externally
  useEffect(() => {
    setStartSelectedDate(startDate)
    if (startDate) {
      const d = new Date(startDate)
      setStartSelectedHour(String(d.getHours()).padStart(2, '0'))
      setStartSelectedMinute(String(d.getMinutes()).padStart(2, '0'))
    }
  }, [startDate])

  useEffect(() => {
    setEndSelectedDate(endDate)
    if (endDate) {
      const d = new Date(endDate)
      setEndSelectedHour(String(d.getHours()).padStart(2, '0'))
      setEndSelectedMinute(String(d.getMinutes()).padStart(2, '0'))
    }
  }, [endDate])

  const updateStartDate = (date: Date | null, hour: string, minute: string) => {
    if (!date) {
      onStartDateChange(null)
      return
    }
    const composed = new Date(date)
    composed.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0)
    onStartDateChange(composed)
  }

  const updateEndDate = (date: Date | null, hour: string, minute: string) => {
    if (!date) {
      onEndDateChange(null)
      return
    }
    const composed = new Date(date)
    composed.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0)
    onEndDateChange(composed)
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FaCalendarAlt className="w-4 h-4" />
              Start Date & Time
            </label>
            <DateTimePicker
              isOpen={isStartDateTimeOpen}
              onClose={() => setIsStartDateTimeOpen(false)}
              title="Pick start date & time"
              selectedDate={startSelectedDate}
              selectedHour={startSelectedHour}
              selectedMinute={startSelectedMinute}
              onDateChange={(d) => {
                setStartSelectedDate(d)
                updateStartDate(d, startSelectedHour, startSelectedMinute)
              }}
              onHourChange={(h) => {
                setStartSelectedHour(h)
                updateStartDate(startSelectedDate, h, startSelectedMinute)
              }}
              onMinuteChange={(m) => {
                setStartSelectedMinute(m)
                updateStartDate(startSelectedDate, startSelectedHour, m)
              }}
              trigger={
                <button
                  type="button"
                  onClick={() => setIsStartDateTimeOpen(true)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  {startSelectedDate ? (
                    <span className="text-gray-900">
                      {startSelectedDate.toLocaleDateString()} {startSelectedHour}:{startSelectedMinute}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select start date and time</span>
                  )}
                </button>
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              When this rapid enquiry becomes available to visitors
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FaCalendarAlt className="w-4 h-4" />
              End Date & Time
            </label>
            <DateTimePicker
              isOpen={isEndDateTimeOpen}
              onClose={() => setIsEndDateTimeOpen(false)}
              title="Pick end date & time"
              selectedDate={endSelectedDate}
              selectedHour={endSelectedHour}
              selectedMinute={endSelectedMinute}
              onDateChange={(d) => {
                setEndSelectedDate(d)
                updateEndDate(d, endSelectedHour, endSelectedMinute)
              }}
              onHourChange={(h) => {
                setEndSelectedHour(h)
                updateEndDate(endSelectedDate, h, endSelectedMinute)
              }}
              onMinuteChange={(m) => {
                setEndSelectedMinute(m)
                updateEndDate(endSelectedDate, endSelectedHour, m)
              }}
              trigger={
                <button
                  type="button"
                  onClick={() => setIsEndDateTimeOpen(true)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  {endSelectedDate ? (
                    <span className="text-gray-900">
                      {endSelectedDate.toLocaleDateString()} {endSelectedHour}:{endSelectedMinute}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select end date and time</span>
                  )}
                </button>
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              When this rapid enquiry stops accepting responses
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
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
                    onChange={(e) => onStatusChange(e.target.value as 'draft' | 'active')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Draft: Not visible to visitors • Active: Currently visible to visitors
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RapidEnquiryForm
