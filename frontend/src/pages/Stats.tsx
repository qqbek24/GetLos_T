import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Paper,
  LinearProgress,
} from '@mui/material'
import { ICONS } from '@/config/icons'
import { api } from '../services/api'
import NumbersBall from '../components/NumbersBall'
import type { Stats, PairTripleStats } from '../types'

export default function StatsPage() {
  const { data: stats, isLoading, isError } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })
  
  const { data: pairTripleStats } = useQuery<PairTripleStats>({
    queryKey: ['pairTripleStats'],
    queryFn: () => api.getPairTripleStats(20),
    enabled: !!stats && stats.total_draws > 0,
  })

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          <ICONS.Stats_chart color="primary" fontSize='large' /> Statystyki
        </Typography>
        <LinearProgress />
      </Box>
    )
  }

  if (isError || !stats) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          <ICONS.Stats_chart color="error" fontSize='large' /> Statystyki
        </Typography>
        <Alert severity="error">
          Nie udało się pobrać statystyk. Upewnij się, że wgrałeś dane historyczne.
        </Alert>
      </Box>
    )
  }

  if (stats.total_draws === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          <ICONS.Stats_chart color="primary" fontSize='large' /> Statystyki
        </Typography>
        <Alert severity="info">
          Brak danych historycznych. Wgraj plik CSV z wynikami losowań w zakładce "Dashboard".
        </Alert>
      </Box>
    )
  }

  // Obliczenia na podstawie freq array (index 0 = number 1)
  const maxFreq = Math.max(...stats.freq)
  const minFreq = Math.min(...stats.freq)
  
  // Najczęstsza i najrzadsza liczba
  const mostCommon = stats.most_frequent[0]?.[0] || 0
  const leastCommon = stats.least_frequent[0]?.[0] || 0
  
  // Top 10 hot/cold numbers z most_frequent/least_frequent
  const hotNumbers = stats.most_frequent.slice(0, 10).map(([num]) => num)
  const coldNumbers = stats.least_frequent.slice(0, 10).map(([num]) => num)

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        <ICONS.Stats_chart color="primary" fontSize='large'/> Statystyki
      </Typography>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* @ts-expect-error - MUI v7 Grid item prop works at runtime */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ICONS.Favorite color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Losowania
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="primary">
                {stats.total_draws}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Łączna liczba losowań w bazie
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* @ts-expect-error - MUI v7 Grid item prop works at runtime */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ICONS.Hot color="error" />
                <Typography variant="h6" fontWeight={600}>
                  Najczęstsza
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="error.main">
                {mostCommon}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Wystąpień: {stats.freq[mostCommon - 1] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* @ts-expect-error - MUI v7 Grid item prop works at runtime */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ICONS.Cold color="info" />
                <Typography variant="h6" fontWeight={600}>
                  Najrzadsza
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} color="info.main">
                {leastCommon}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Wystąpień: {stats.freq[leastCommon - 1] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Frequency Grid */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            <ICONS.CalculateIcon color="info" fontSize='medium' /> Częstotliwość Liczb (1-49)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Im cieplejszy kolor, tym częściej liczba wystąpiła w losowaniach
          </Typography>

          <Grid container spacing={1}>
            {Array.from({ length: 52 }, (_, i) => i + 1).map((num) => {
              const freq = stats.freq[num - 1] || 0
              const percentage = maxFreq > minFreq ? ((freq - minFreq) / (maxFreq - minFreq)) * 100 : 50

              let gradient = 'default'
              if (percentage > 66) gradient = 'hot'
              else if (percentage < 33) gradient = 'cold'

              return (
                // @ts-expect-error - MUI v7 Grid item prop works at runtime
                <Grid item xs={2} sm={1.5} md={1} key={num}>
                  <Paper
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${percentage}%`,
                        bgcolor: gradient === 'hot' ? 'error.light' : gradient === 'cold' ? 'info.light' : 'grey.200',
                        opacity: 0.3,
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <Typography variant="h6" fontWeight={700} sx={{ position: 'relative' }}>
                      {num}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ position: 'relative' }}>
                      {freq}
                    </Typography>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Hot Numbers */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ICONS.Hot color="error" />
            <Typography variant="h6" fontWeight={600}>
              TOP 10 Najczęstszych Liczb
            </Typography>
          </Box>
          <NumbersBall numbers={hotNumbers} gradient="hot" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Te liczby pojawiały się najczęściej w historycznych losowaniach
          </Typography>
        </CardContent>
      </Card>

      {/* Cold Numbers */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ICONS.Cold color="info" />
            <Typography variant="h6" fontWeight={600}>
              TOP 10 Najrzadszych Liczb
            </Typography>
          </Box>
          <NumbersBall numbers={coldNumbers} gradient="cold" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Te liczby pojawiały się najrzadziej w historycznych losowaniach
          </Typography>
        </CardContent>
      </Card>

      {/* Most Common Pairs */}
      {pairTripleStats && pairTripleStats.pairs.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <ICONS.Top2 color="info" /> TOP 5 Najczęstszych Par
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pairTripleStats.pairs.slice(0, 5).map((pair, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" fontWeight={700} color="primary">
                      #{index + 1}
                    </Typography>
                    <NumbersBall numbers={pair.numbers} size="small" gradient="gold" />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" fontWeight={700}>
                      {pair.count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      wystąpień
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Most Common Triples */}
      {pairTripleStats && pairTripleStats.triples.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              <ICONS.Top3 color="info" /> TOP 5 Najczęstszych Trójek
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pairTripleStats.triples.slice(0, 5).map((triple, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" fontWeight={700} color="secondary">
                    #{index + 1}
                  </Typography>
                  <NumbersBall numbers={triple.numbers} size="small" gradient="gold" />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" fontWeight={700}>
                    {triple.count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    wystąpień
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>
      )}
    </Box>
  )
}
