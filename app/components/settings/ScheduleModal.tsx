import { Modal, FormLayout, Text, Select, TextField, Banner } from "@shopify/polaris";

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  reportFrequency: string;
  reportDay: string;
  reportTime: string;
  onFrequencyChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onSave: () => void;
}

const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const dayOptions = [
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
];

/**
 * Report Schedule Modal Component
 * 
 * Modal for configuring automated report schedule
 */
export function ScheduleModal({
  open,
  onClose,
  reportFrequency,
  reportDay,
  reportTime,
  onFrequencyChange,
  onDayChange,
  onTimeChange,
  onSave,
}: ScheduleModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Set Report Schedule"
      primaryAction={{
        content: "Save Schedule",
        onAction: onSave,
      }}
    >
      <Modal.Section>
        <FormLayout>
          <Text as="p" variant="bodyMd">
            Configure when you want to receive automated customer insight reports.
          </Text>

          <Select
            label="Report Frequency"
            options={frequencyOptions}
            value={reportFrequency}
            onChange={onFrequencyChange}
          />

          {reportFrequency === "weekly" && (
            <Select
              label="Day of Week"
              options={dayOptions}
              value={reportDay}
              onChange={onDayChange}
            />
          )}

          <TextField
            label="Time"
            value={reportTime}
            onChange={onTimeChange}
            type="time"
            helpText="Time in 24-hour format"
            autoComplete="off"
          />

          <Banner tone="success">
            <p>
              Reports will be automatically generated and sent to your email address.
            </p>
          </Banner>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
}

