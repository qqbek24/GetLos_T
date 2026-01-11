import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Chip,
} from '@mui/material'
import { ContentCopy, Delete } from '@mui/icons-material'
import { ICONS, STRATEGY_CONFIG } from '@/config/icons'
import { api } from '../services/api'
import NumbersBall from '../components/NumbersBall'
import type { Strategy, Pick } from '../types'

export default function Generate() {
  const [strategy, setStrategy] = useState<Strategy>('balanced')
  const [count, setCount] = useState(1)
  const [generatedPicks, setGeneratedPicks] = useState<Pick[]>([])

  const generateMutation = useMutation({
    mutationFn: () => api.generatePicks({ strategy, count }),
    onSuccess: (data) => {
      setGeneratedPicks(data)
    },
  })

  // Pobierz strategie z konfiguracji
  const strategies = Object.entries(STRATEGY_CONFIG).map(([key, config]) => ({
    value: key as Strategy,
    label: config.label,
    description: config.description,
    icon: config.icon,
  }))

  // Kolory dla ikon strategii
  const getStrategyColor = (strategyValue: string) => {
    switch (strategyValue) {
      case 'hot':
        return '#f44336' // Czerwony
      case 'cold':
      case 'balanced':
        return '#2196f3' // Niebieski
      case 'random':
        return '#ff9800' // Pomarańczowy
      case 'combo_based':
        return '#9c27b0' // Fioletowy
      case 'ai':
        return '#00bcd4' // Cyjan (AI)
      default:
        return 'inherit'
    }
  }

  const selectedStrategy = strategies.find(s => s.value === strategy)

  const handleGenerate = () => {
    generateMutation.mutate()
  }

  const handleCopyToClipboard = () => {
    const text = generatedPicks
      .map((pick, i) => `Układ ${i + 1}: ${pick.numbers.join(', ')}`)
      .join('\n')
    navigator.clipboard.writeText(text)
    alert('Skopiowano do schowka!')
  }

  const getSum = (numbers: number[]) => numbers.reduce((sum, num) => sum + num, 0)

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        <ICONS.GenerateTitleIcon color="primary" fontSize="large" /> Generuj Nowe Układy
      </Typography>

      {/* Settings Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Ustawienia Generowania
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Strategia</InputLabel>
            <Select
              value={strategy}
              label="Strategia"
              onChange={(e) => setStrategy(e.target.value as Strategy)}
              renderValue={(value) => {
                const selected = strategies.find(s => s.value === value)
                if (!selected) return value
                const IconComponent = selected.icon
                const iconColor = getStrategyColor(selected.value)
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconComponent fontSize="small" sx={{ color: iconColor }} />
                    {selected.label}
                  </Box>
                )
              }}
            >
              {strategies.map((s) => {
                const IconComponent = s.icon
                const iconColor = getStrategyColor(s.value)
                return (
                  <MenuItem key={s.value} value={s.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconComponent fontSize="small" sx={{ color: iconColor }} />
                    {s.label}
                  </MenuItem>
                )
              })}
            </Select>
            {selectedStrategy && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {selectedStrategy.description}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Ilość układów do wygenerowania"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value))))}
            inputProps={{ min: 1, max: 10 }}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<ICONS.Generate />}
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Generowanie...' : 'Generuj'}
          </Button>

          {generateMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(generateMutation.error as any)?.response?.data?.detail || 'Błąd podczas generowania'}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Results */}
      {generatedPicks.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <ICONS.StarsGeneratedNumbers color="info" fontSize="medium" /> Wygenerowane Układy
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {generatedPicks.map((pick, index) => (
                <Box
                  key={pick.id}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    borderLeft: 4,
                    borderColor: 'primary.main',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Układ #{index + 1}
                    </Typography>
                    <Chip label={pick.strategy} color="primary" size="small" />
                  </Box>

                  <NumbersBall numbers={pick.numbers} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Suma: {getSum(pick.numbers)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(pick.created_at).toLocaleString('pl-PL')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={handleCopyToClipboard}
              >
                Kopiuj do Schowka
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setGeneratedPicks([])}
              >
                Wyczyść
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card sx={{ bgcolor: 'info.lighter' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            <ICONS.InfoIcon fontSize="medium" color="info" /> Informacje o Strategiach
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Random:</strong> Całkowicie losowy wybór 6 liczb
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Hot:</strong> Preferuje liczby, które często pojawiały się w historii
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Cold:</strong> Preferuje liczby, które rzadko się pojawiały
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Balanced:</strong> Mieszanka 3 częstych i 3 rzadkich liczb
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>Combo Based:</strong> Oparte na najczęstszych parach i trójkach z historii
            </Typography>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            Wszystkie wygenerowane układy są unikalne i nie powtarzają się z historią!
          </Alert>
        </CardContent>
      </Card>
    </Box>
  )
}
