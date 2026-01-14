import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6f00', // Pomarańczowy jak w transport app
      light: '#ff9800',
      dark: '#e65100',
    },
    secondary: {
      main: '#455a64', // Ciemny szaroniebieski
      light: '#607d8b',
      dark: '#37474f',
    },
    error: {
      main: '#e53935',
      dark: '#c62828',
      light: '#ff5252',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#29b6f6',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#263238', // Delikatniejszy ciemny jak w transport app
      paper: '#37474f',   // Jaśniejszy odcień dla card
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 13, // Zmniejszony z 14
    h1: {
      fontWeight: 700,
      color: '#ffffff',
      fontSize: '2rem', // Zmniejszony
    },
    h2: {
      fontWeight: 700,
      color: '#ffffff',
      fontSize: '1.75rem',
    },
    h3: {
      fontWeight: 600,
      color: '#ffffff',
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      color: '#b0bec5',
      fontSize: '1.25rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#37474f', // Ciemnoszary navbar
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px', // Zmniejszony z 10px 24px
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(77, 182, 172, 0.4)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#ff6f00',
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(255, 111, 0, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#37474f',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          border: '1px solid #455a64',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px', // Zmniejszony z 16px (domyslnie 16px ale może być więcej)
          '&:last-child': {
            paddingBottom: '16px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#37474f',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#455a64',
            '& fieldset': {
              borderColor: '#546e7a',
            },
            '&:hover fieldset': {
              borderColor: '#ff6f00',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6f00',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#b0bec5',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#455a64',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            color: '#ffffff',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#455a64',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        colorDefault: {
          backgroundColor: '#455a64',
          color: '#b0bec5',
        },
        colorPrimary: {
          backgroundColor: '#ff6f00',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#546e7a',
          color: '#ffffff',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
        standardSuccess: {
          backgroundColor: '#1b5e20',
          color: '#a5d6a7',
        },
        standardInfo: {
          backgroundColor: '#37474f',
          color: '#b0bec5',
          border: '1px solid #546e7a',
        },
        standardWarning: {
          backgroundColor: '#e65100',
          color: '#ffcc80',
        },
        standardError: {
          backgroundColor: '#b71c1c',
          color: '#ef9a9a',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#607d8b',
          '&.Mui-checked': {
            color: '#ff6f00',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ff6f00',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ff6f00',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 111, 0, 0.12)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 111, 0, 0.16)',
            '&:hover': {
              backgroundColor: 'rgba(255, 111, 0, 0.24)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 111, 0, 0.08)',
            color: '#ff6f00',
          },
        },
      },
    },
  },
})

export default theme
