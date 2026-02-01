import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import { Language } from '@mui/icons-material'
import CasinoIcon from '@mui/icons-material/Casino'
import useLabels from '../hooks/useLabels'
import { useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { getLabel, setLanguage, currentLanguage } = useLabels()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleLanguageMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    handleLanguageMenuClose()
  }

  const tabs = [
    { label: getLabel('navigation.dashboard', 'Dashboard'), path: '/' },
    { label: getLabel('navigation.generate', 'Generuj'), path: '/generate' },
    { label: getLabel('navigation.history', 'Historia'), path: '/history' },
    { label: getLabel('navigation.stats', 'Statystyki'), path: '/stats' },
  ]

  const currentTab = tabs.findIndex(tab => tab.path === location.pathname)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="static"
        sx={{
          bgcolor: '#37474f',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3, md: 0 }, py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CasinoIcon sx={{ mr: 2, fontSize: 28 }} />
              <Box>
                <Typography variant="h6" component="h1" fontWeight={700}>
                  {getLabel('app.title', 'GetLos_T')}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {getLabel('app.subtitle', 'Aplikacja do losowania prognozowanych układów')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tabs
                value={currentTab !== -1 ? currentTab : 0}
                onChange={(_, newValue) => navigate(tabs[newValue].path)}
                textColor="inherit"
                TabIndicatorProps={{
                  style: { backgroundColor: '#ff6f00' }
                }}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    minWidth: 90,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      color: '#ff6f00',
                    },
                  },
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab key={index} label={tab.label} />
                ))}
              </Tabs>
              
              <IconButton
                onClick={handleLanguageMenuOpen}
                sx={{ color: 'white' }}
                aria-label="select language"
              >
                <Language />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleLanguageMenuClose}
              >
                <MenuItem 
                  onClick={() => handleLanguageChange('pl')}
                  selected={currentLanguage === 'pl'}
                >
                  🇵🇱 Polski
                </MenuItem>
                <MenuItem 
                  onClick={() => handleLanguageChange('en')}
                  selected={currentLanguage === 'en'}
                >
                  🇬🇧 English
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          bgcolor: 'background.paper',
          py: 3,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {getLabel('footer.copyright', '© 2026 GetLos_T - Lottery Prediction System')}
        </Typography>
      </Box>
    </Box>
  )
}
