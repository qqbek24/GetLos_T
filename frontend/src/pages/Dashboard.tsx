import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Assessment,
  Casino,
  Upload,
  History as HistoryIcon,
} from '@mui/icons-material'
import { api } from '../services/api'
import NumbersBall from '../components/NumbersBall'

export default function Dashboard() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const { data: recentPicks } = useQuery({
    queryKey: ['recentPicks'],
    queryFn: () => api.getPicks(5),
  })

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadMessage(null)

    try {
      const result = await api.uploadCSV(selectedFile)
      setUploadMessage({ type: 'success', text: result.message })
      setSelectedFile(null)
    } catch (error: any) {
      setUploadMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Błąd podczas przesyłania pliku',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Dashboard
      </Typography>

      {/* Quick Stats */}
      {statsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color="secondary">
                  {stats?.total_draws || 0}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Historia Losowań
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pokrycie: {stats?.coverage_pct.toFixed(8)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Casino sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color="secondary">
                  {stats?.total_picks || 0}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Wygenerowane Typy
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h3" fontWeight={700} color="secondary">
                  {stats?.avg_sum.toFixed(1) || 0}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Średnia Suma
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Min: {stats?.min_sum} | Max: {stats?.max_sum}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Upload CSV */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            📁 Wgraj Historię Losowań
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Prześlij plik CSV z historycznymi losowaniami (każdy wiersz = 6 liczb od 1 do 52)
          </Typography>

          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              aria-label="Upload CSV file"
              style={{
                padding: '0.5rem',
                border: '2px dashed #667eea',
                borderRadius: '5px',
                width: '100%',
                cursor: 'pointer',
              }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={handleFileUpload}
            disabled={!selectedFile || uploading}
            fullWidth
          >
            {uploading ? 'Przesyłanie...' : 'Wgraj Plik'}
          </Button>

          {uploadMessage && (
            <Alert severity={uploadMessage.type} sx={{ mt: 2 }}>
              {uploadMessage.text}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            ⚡ Szybkie Akcje
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<Casino />} onClick={() => navigate('/generate')}>
              Generuj Nowe Liczby
            </Button>
            <Button variant="outlined" startIcon={<HistoryIcon />} onClick={() => navigate('/history')}>
              Zobacz Historię
            </Button>
            <Button variant="outlined" startIcon={<Assessment />} onClick={() => navigate('/stats')}>
              Statystyki Szczegółowe
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Picks */}
      {recentPicks && recentPicks.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              🎯 Ostatnie Wygenerowane
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentPicks.map((pick) => (
                <Box
                  key={pick.id}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <NumbersBall numbers={pick.numbers} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        mb: 0.5,
                      }}
                    >
                      {pick.strategy}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(pick.created_at).toLocaleString('pl-PL')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
