import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { SxProps, Theme } from '@mui/material'

interface MuiDatePickerFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: boolean
  helperText?: string
  required?: boolean
  width?: string | number
  format?: string
  size?: 'small' | 'medium'
  sx?: SxProps<Theme>
}

export default function MuiDatePickerField({
  label,
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  width,
  format = 'dd/MM/yyyy',
  size = 'small',
  sx,
}: MuiDatePickerFieldProps) {
  // Convert string (YYYY-MM-DD) to Date object
  const dateValue = value ? new Date(value) : null

  const handleChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      // Convert Date to YYYY-MM-DD string
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    } else {
      onChange('')
    }
  }

  return (
    <DatePicker
      label={label}
      value={dateValue}
      onChange={handleChange}
      slotProps={{
        textField: {
          error,
          helperText,
          margin: 'normal',
          size,
          required,
          sx: {
            width: width || '100%',
            ...sx,
          },
          InputLabelProps: {
            shrink: true,
            sx: required ? { '& .MuiFormLabel-asterisk': { color: '#dc3545' } } : undefined,
          },
        },
        actionBar: { actions: ['today', 'clear'] },
      }}
      format={format}
    />
  )
}
