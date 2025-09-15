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
  trigger
}) => {
  const handleSave = () => {
    onClose()
  }

  const handleCancel = () => {
    onClose()
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomCalendar 
              selectedDate={selectedDate} 
              setSelectedDate={onDateChange} 
            />
            <div>
              <div className="mb-3 text-sm text-gray-700 font-medium">Time</div>
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
              <div className="mt-4 text-xs text-gray-500">
                {selectedDate
                  ? `Selected: ${selectedDate.toLocaleDateString()} ${selectedHour}:${selectedMinute}`
                  : "Pick a date"}
              </div>
            </div>
          </div>
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
