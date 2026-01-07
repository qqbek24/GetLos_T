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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          <CasinoIcon sx={{ mr: 2, fontSize: 32 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" fontWeight={700}>
              GetLos_T
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Aplikacja do losowania prognozowanych układów
            </Typography>
          </Box>
        </Toolbar>
        <Tabs
          value={currentTab !== -1 ? currentTab : 0}
          onChange={(_, newValue) => navigate(tabs[newValue].path)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            px: 2,
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: 'white',
              },
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
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
