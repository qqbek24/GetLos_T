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
} from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Dashboard', path: '/' },
    { label: 'Generuj', path: '/generate' },
    { label: 'Historia', path: '/history' },
    { label: 'Statystyki', path: '/stats' },
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
                  GetLos_T
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Aplikacja do losowania prognozowanych układów
                </Typography>
              </Box>
            </Box>
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
          © 2026 GetLos_T - Lottery Prediction System
        </Typography>
      </Box>
    </Box>
  )
}
