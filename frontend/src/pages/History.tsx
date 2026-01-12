import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  IconButton,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
} from '@mui/material'
import { ICONS } from '@/config/icons'
import { api } from '../services/api'
import NumbersBall from '../components/NumbersBall'
import type { Pick, Draw } from '../types'

export default function History() {
  const [tab, setTab] = useState<'picks' | 'draws'>('picks')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [manualDialogOpen, setManualDialogOpen] = useState(false)
  const [manualNumbers, setManualNumbers] = useState<string>('')
  const [manualDate, setManualDate] = useState<string>('')
  const queryClient = useQueryClient()

  const { data: picksData, isLoading: picksLoading, isFetching: picksFetching } = useQuery({
    queryKey: ['picks', page, rowsPerPage],
    queryFn: () => api.getPicks(rowsPerPage, page * rowsPerPage),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  })

  const { data: drawsData, isLoading: drawsLoading, isFetching: drawsFetching } = useQuery({
    queryKey: ['draws', page, rowsPerPage],
    queryFn: () => api.getDraws(rowsPerPage, page * rowsPerPage),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  })

  const picks = picksData?.items || []
  const draws = drawsData?.items || []
  const picksTotal = picksData?.total || 0
  const drawsTotal = drawsData?.total || 0
  const picksTotalPages = picksData?.total_pages || 1
  const drawsTotalPages = drawsData?.total_pages || 1

  // Prefetch next page for better UX
  const prefetchNextPage = () => {
    if (tab === 'picks' && page + 1 < picksTotalPages) {
      queryClient.prefetchQuery({
        queryKey: ['picks', page + 1, rowsPerPage],
        queryFn: () => api.getPicks(rowsPerPage, (page + 1) * rowsPerPage),
      })
    } else if (tab === 'draws' && page + 1 < drawsTotalPages) {
      queryClient.prefetchQuery({
        queryKey: ['draws', page + 1, rowsPerPage],
        queryFn: () => api.getDraws(rowsPerPage, (page + 1) * rowsPerPage),
      })
    }
  }

  // Prefetch on mount and when page/tab changes
  useEffect(() => {
    prefetchNextPage()
  }, [page, tab, picksTotalPages, drawsTotalPages])
  
  // Reset page when switching tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: 'picks' | 'draws') => {
    setTab(newValue)
    setPage(0)
    // Prefetch first page of new tab
    setTimeout(prefetchNextPage, 100)
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (tab === 'picks') {
        return api.deletePick(id)
      } else {
        return api.deleteDraw(id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tab] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
  })

  const clearAllMutation = useMutation({
    mutationFn: () => {
      if (tab === 'picks') {
        return api.clearAllPicks()
      } else {
        return api.clearAllDraws()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tab] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const syncLottoMutation = useMutation({
    mutationFn: () => api.syncLottoResults(),
    onSuccess: (data) => {
      if (data.success) {
        setSyncResult({
          type: 'success',
          message: data.message + (data.new_draws > 0 ? ` (${data.new_draws} nowych losowań)` : ''),
        })
        queryClient.invalidateQueries({ queryKey: ['draws'] })
        queryClient.invalidateQueries({ queryKey: ['stats'] })
      } else {
        setSyncResult({
          type: 'error',
          message: data.error || data.message,
        })
      }
      // Auto-hide after 5 seconds
      setTimeout(() => setSyncResult(null), 5000)
    },
    onError: (error: any) => {
      setSyncResult({
        type: 'error',
        message: error.message || 'Błąd połączenia z API',
      })
      setTimeout(() => setSyncResult(null), 5000)
    },
  })

  const manualDrawMutation = useMutation({
    mutationFn: (data: { draws: { numbers: number[]; date?: string }[] }) => api.addManualDraw(data),
    onSuccess: (data) => {
      setSyncResult({
        type: 'success',
        message: data.message,
      })
      queryClient.invalidateQueries({ queryKey: ['draws'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setManualDialogOpen(false)
      setManualNumbers('')
      setManualDate('')
      setTimeout(() => setSyncResult(null), 5000)
    },
    onError: (error: any) => {
      setSyncResult({
        type: 'error',
        message: error.message || 'Błąd dodawania losowania',
      })
      setTimeout(() => setSyncResult(null), 5000)
    },
  })

  const exportMutation = useMutation({
    mutationFn: () => api.exportDraws(),
    onSuccess: (data) => {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lotto-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      setSyncResult({
        type: 'success',
        message: `Wyeksportowano ${data.count} losowań`,
      })
      setTimeout(() => setSyncResult(null), 3000)
    },
  })

  const handleDelete = (id: number) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      deleteMutation.mutate(itemToDelete)
    }
  }

  const handleCopyNumbers = (numbers: number[]) => {
    navigator.clipboard.writeText(numbers.join(', '))
    alert('Liczby skopiowane do schowka!')
  }

  const handleManualAdd = () => {
    // Parse numbers from input
    const numbersArray = manualNumbers
      .split(/[\s,;]+/)
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 49)

    if (numbersArray.length !== 6) {
      setSyncResult({
        type: 'error',
        message: 'Wprowadź dokładnie 6 liczb od 1 do 49',
      })
      setTimeout(() => setSyncResult(null), 3000)
      return
    }

    if (new Set(numbersArray).size !== 6) {
      setSyncResult({
        type: 'error',
        message: 'Wszystkie liczby muszą być unikalne',
      })
      setTimeout(() => setSyncResult(null), 3000)
      return
    }

    const draw: { numbers: number[]; date?: string } = {
      numbers: numbersArray.sort((a, b) => a - b),
    }

    if (manualDate) {
      draw.date = manualDate
    }

    manualDrawMutation.mutate({ draws: [draw] })
  }

  const getSum = (numbers: number[]) => numbers.reduce((sum, num) => sum + num, 0)

  const renderPicks = () => {
    if (picksLoading) {
      return <Typography>Ładowanie...</Typography>
    }

    if (picks.length === 0) {
      return (
        <Alert severity="info">
          Brak wygenerowanych układów. Przejdź do zakładki "Generuj" aby utworzyć nowe układy.
        </Alert>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {picks.map((pick: Pick) => (
          <Box
            key={pick.id}
            sx={{
              py: 1,
              px: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              borderLeft: 3,
              borderColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Chip label={pick.strategy} size="small" color="primary" sx={{ minWidth: 90 }} />
              <NumbersBall numbers={pick.numbers} size="small" />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                Σ {getSum(pick.numbers)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(pick.created_at).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
              </Typography>
            </Box>
            <Box>
              <IconButton size="small" onClick={() => handleCopyNumbers(pick.numbers)} color="primary">
                <ICONS.Copy fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(pick.id)} color="error">
                <ICONS.Delete fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  const renderDraws = () => {
    if (drawsLoading) {
      return <Typography>Ładowanie...</Typography>
    }

    if (draws.length === 0) {
      return (
        <Alert severity="info">
          Brak historycznych losowań. Wgraj plik CSV z historycznymi wynikami w zakładce "Dashboard".
        </Alert>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {draws.map((draw: Draw) => {
          // Check if source contains a date (YYYY-MM-DD format)
          const isSourceDate = draw.source && /^\d{4}-\d{2}-\d{2}$/.test(draw.source)
          const displayDate = isSourceDate 
            ? new Date(draw.source!).toLocaleDateString('pl-PL')
            : new Date(draw.created_at).toLocaleDateString('pl-PL')
          
          return (
            <Box
              key={draw.id}
              sx={{
                py: 1,
                px: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                borderLeft: 3,
                borderColor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Typography variant="body2" fontWeight={600} color="secondary" sx={{ minWidth: 100 }}>
                  {displayDate}
                </Typography>
                <NumbersBall numbers={draw.numbers} size="small" />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  Σ {getSum(draw.numbers)}
                </Typography>
              </Box>
              <Box>
                <IconButton size="small" onClick={() => handleCopyNumbers(draw.numbers)} color="primary">
                  <ICONS.Copy fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(draw.id)} color="error">
                  <ICONS.Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  const currentCount = tab === 'picks' ? picksTotal : drawsTotal
  const currentTotalPages = tab === 'picks' ? picksTotalPages : drawsTotalPages
  const isFetching = tab === 'picks' ? picksFetching : drawsFetching
  const currentLabel = tab === 'picks' ? 'układów' : 'losowań'

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ICONS.LibraryBooks color="primary" fontSize="large" /> Historia
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tab} onChange={handleTabChange}>
              <Tab label={`Wygenerowane Układy (${picksTotal})`} value="picks" />
              <Tab label={`Historyczne Losowania (${drawsTotal})`} value="draws" />
            </Tabs>
          </Box>

          {currentCount > 0 && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Łącznie: {currentCount} {currentLabel}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {tab === 'draws' && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={syncLottoMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <ICONS.Sync />}
                      onClick={() => syncLottoMutation.mutate()}
                      disabled={syncLottoMutation.isPending}
                    >
                      {syncLottoMutation.isPending ? 'Synchronizacja...' : 'Synchronizuj z Lotto.pl'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<ICONS.Add />}
                      onClick={() => setManualDialogOpen(true)}
                    >
                      Dodaj ręcznie
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<ICONS.Download />}
                      onClick={() => exportMutation.mutate()}
                      disabled={exportMutation.isPending}
                    >
                      Backup
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<ICONS.DeleteAll />}
                  onClick={() => clearAllMutation.mutate()}
                  disabled={clearAllMutation.isPending}
                >
                  Usuń Wszystkie
                </Button>
              </Box>
            </Box>
          )}

          {/* Sync Result Alert */}
          {syncResult && (
            <Alert severity={syncResult.type} sx={{ mb: 2 }} onClose={() => setSyncResult(null)}>
              {syncResult.message}
            </Alert>
          )}

          {tab === 'picks' ? renderPicks() : renderDraws()}
          
          {/* Pagination Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Na stronę</InputLabel>
                <Select
                  value={rowsPerPage}
                  label="Na stronę"
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setPage(0)
                  }}
                >
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                Strona {page + 1} z {currentTotalPages} {isFetching && <CircularProgress size={12} sx={{ ml: 1 }} />}
              </Typography>
            </Box>
            <Pagination 
              count={currentTotalPages}
              page={page + 1} 
              onChange={(_, value) => {
                setPage(value - 1)
                setTimeout(prefetchNextPage, 100)
              }}
              color="primary"
              showFirstButton
              showLastButton
              disabled={isFetching}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
        <DialogContent>
          <Typography>
            Czy na pewno chcesz usunąć ten {tab === 'picks' ? 'układ' : 'wynik losowania'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Anuluj</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Usuwanie...' : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Draw Dialog */}
      <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj losowanie ręcznie</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              Użyj tej opcji gdy synchronizacja z API nie działa lub chcesz dodać starsze wyniki.
            </Alert>
            
            <TextField
              fullWidth
              label="Liczby (6 liczb od 1 do 49)"
              placeholder="np. 5, 12, 23, 34, 39, 45, 49"
              value={manualNumbers}
              onChange={(e) => setManualNumbers(e.target.value)}
              helperText="Wprowadź 6 liczb oddzielonych spacjami, przecinkami lub średnikami"
            />
            
            <TextField
              fullWidth
              label="Data losowania (opcjonalnie)"
              type="date"
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Format: RRRR-MM-DD"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualDialogOpen(false)}>Anuluj</Button>
          <Button
            onClick={handleManualAdd}
            color="primary"
            variant="contained"
            disabled={manualDrawMutation.isPending || !manualNumbers}
          >
            {manualDrawMutation.isPending ? 'Dodawanie...' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
