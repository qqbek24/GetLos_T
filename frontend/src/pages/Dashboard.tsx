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
import { FolderOpen, Bolt, Stars } from '@mui/icons-material'
import { ICONS } from '@/config/icons'
import { api } from '../services/api'
import NumbersBall from '../components/NumbersBall'
import FileUpload, { type UploadedFile } from '../components/FileUpload'
import useLabels from '../hooks/useLabels'

export default function Dashboard() {
  const navigate = useNavigate()
  const { labels, getLabel } = useLabels()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [clearFiles, setClearFiles] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const { data: recentPicksResponse } = useQuery({
    queryKey: ['recentPicks'],
    queryFn: () => api.getPicks(5),
  })

  const recentPicks = recentPicksResponse?.items || []

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files)
  }

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) return

    setUploading(true)
    setUploadMessage(null)

    try {
      const file = uploadedFiles[0].file // Bierzemy pierwszy plik
      const result = await api.uploadCSV(file)
      setUploadMessage({ type: 'success', text: result.message })
      setClearFiles(true)
      setTimeout(() => setClearFiles(false), 100)
    } catch (error: any) {
      setUploadMessage({
        type: 'error',
        text: error.response?.data?.detail || getLabel('fileUpload.uploadError', 'Błąd podczas przesyłania pliku'),
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
                <ICONS.Stats sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
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
                <ICONS.Logo sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
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
                <ICONS.Stats sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
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
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderOpen fontSize="small" /> {getLabel('dashboard.uploadSection.title', 'Wgraj Historię Losowań')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {getLabel('dashboard.uploadSection.description', 'Prześlij plik CSV z historycznymi losowaniami (każdy wiersz = 6 liczb od 1 do 49)')}
          </Typography>

          <FileUpload
            onFilesChange={handleFilesChange}
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
            clearFiles={clearFiles}
            labels={labels.fileUpload || {}}
          />

          <Button
            variant="contained"
            startIcon={<ICONS.Upload />}
            onClick={handleFileUpload}
            disabled={uploadedFiles.length === 0 || uploading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {uploading 
              ? getLabel('dashboard.uploadSection.uploading', 'Przesyłanie...') 
              : getLabel('dashboard.uploadSection.uploadButton', 'Wgraj Plik')
            }
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
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bolt fontSize="small" /> {getLabel('dashboard.quickActions.title', 'Szybkie Akcje')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<ICONS.Generate />} onClick={() => navigate('/generate')}>
              {getLabel('dashboard.quickActions.generateNew', 'Generuj Nowe Liczby')}
            </Button>
            <Button variant="outlined" startIcon={<ICONS.History />} onClick={() => navigate('/history')}>
              {getLabel('dashboard.quickActions.viewHistory', 'Zobacz Historię')}
            </Button>
            <Button variant="outlined" startIcon={<ICONS.Stats />} onClick={() => navigate('/stats')}>
              {getLabel('dashboard.quickActions.viewStats', 'Statystyki Szczegółowe')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Picks */}
      {recentPicks && recentPicks.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Stars fontSize="small" /> {getLabel('dashboard.recentPicks.title', 'Ostatnie Wygenerowane')}
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
