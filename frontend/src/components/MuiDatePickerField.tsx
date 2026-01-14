import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { SxProps, Theme, useTheme } from '@mui/material'
import './MuiDatePickerField.css'

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
  const theme = useTheme()
  
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
          className: 'mui-date-picker-field',
          sx: {
            width: width || '100%',
            boxSizing: 'border-box',
            // Override hover/focus colors from CSS with theme colors
            '& :hover fieldset': {
              borderColor: error ? theme.palette.error.main : `${theme.palette.primary.main} !important`,
            },
            '& .Mui-focused fieldset': {
              borderColor: error ? theme.palette.error.main : `${theme.palette.primary.main} !important`,
              borderWidth: '2px !important',
            },
            '& .Mui-focused:hover fieldset': {
              borderColor: error ? theme.palette.error.main : `${theme.palette.primary.main} !important`,
            },
            ...sx,
          },
          InputLabelProps: {
            shrink: true,
            sx: required ? { '& .MuiFormLabel-asterisk': { color: theme.palette.error.main } } : undefined,
          },
        },
        actionBar: { actions: ['today', 'clear'] },
      }}
      format={format}
    />
  )
}
