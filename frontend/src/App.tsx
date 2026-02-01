import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { LanguageProvider } from './contexts/LanguageContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import History from './pages/History'
import Stats from './pages/Stats'

function App() {
  return (
    <LanguageProvider>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </Layout>
      </Box>
    </LanguageProvider>
  )
}

export default App
