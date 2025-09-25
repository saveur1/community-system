import { type FC, type ReactNode } from 'react'
import Modal, { ModalBody, ModalFooter, ModalButton } from './modal'
import CustomCalendar from './calendar'
import { SelectDropdown } from './select'

interface DateTimePickerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  selectedDate: Date | null
  selectedHour: string
  selectedMinute: string
  onDateChange: (date: Date | null) => void
  onHourChange: (hour: string) => void
  onMinuteChange: (minute: string) => void
  trigger?: ReactNode
  embedded?: boolean
  minDate?: Date
}

const DateTimePicker: FC<DateTimePickerProps> = ({
  isOpen,
  onClose,
  title,
  selectedDate,
  selectedHour,
  selectedMinute,
  onDateChange,
  onHourChange,
  onMinuteChange,
  trigger,
  embedded = false,
  minDate
}) => {
  const handleSave = () => {
    // If user didn't select date/time, default to current values
    const now = new Date()
    const ensureDate = selectedDate ?? now
    const ensureHour = selectedHour && selectedHour.length > 0 ? selectedHour : String(now.getHours()).padStart(2, '0')
    const ensureMinute = selectedMinute && selectedMinute.length > 0 ? selectedMinute : String(now.getMinutes()).padStart(2, '0')

    // Only fire updates if values differ or were missing
    if (!selectedDate) {
      onDateChange(ensureDate)
    }
    if (!selectedHour || selectedHour.length === 0) {
      onHourChange(ensureHour)
    }
    if (!selectedMinute || selectedMinute.length === 0) {
      onMinuteChange(ensureMinute)
    }

    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const content = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CustomCalendar 
        selectedDate={selectedDate} 
        setSelectedDate={onDateChange}
        minDate={minDate}
      />
      <div>
        <div className="mb-3 text-sm text-gray-700 dark:text-gray-300 font-medium">Time</div>
        <div className="grid grid-cols-2 gap-4">
          <SelectDropdown
            label="Hour"
            value={selectedHour}
            onChange={onHourChange}
            options={Array.from({ length: 24 }).map((_, i) => ({
              label: String(i).padStart(2, "0"),
              value: String(i).padStart(2, "0"),
            }))}
          />
          <SelectDropdown
            label="Minute"
            value={selectedMinute}
            onChange={onMinuteChange}
            options={Array.from({ length: 60 }).map((_, i) => ({
              label: String(i).padStart(2, "0"),
              value: String(i).padStart(2, "0"),
            }))}
          />
        </div>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          {selectedDate
            ? `Selected: ${selectedDate.toLocaleDateString()} ${selectedHour}:${selectedMinute}`
            : "Pick a date"}
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return <>{content}</>
  }

  return (
    <>
      {trigger}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="lg"
        closeOnOverlayClick
      >
        <ModalBody>
          {content}
        </ModalBody>
        <ModalFooter>
          <ModalButton variant="secondary" onClick={handleCancel}>
            Close
          </ModalButton>
          <ModalButton onClick={handleSave}>Save</ModalButton>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default DateTimePicker
