import { useState } from 'react'
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
} from '@mui/material'
import { Delete, DeleteSweep, ContentCopy } from '@mui/icons-material'
import { api } from '../services/api'
import NumbersBall from '../components/NumbersBall'
import type { Pick, Draw } from '../types'

export default function History() {
  const [tab, setTab] = useState<'picks' | 'draws'>('picks')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const queryClient = useQueryClient()

  const { data: picks = [], isLoading: picksLoading } = useQuery({
    queryKey: ['picks', page, rowsPerPage],
    queryFn: () => api.getPicks(rowsPerPage, page * rowsPerPage),
  })

  const { data: draws = [], isLoading: drawsLoading } = useQuery({
    queryKey: ['draws', page, rowsPerPage],
    queryFn: () => api.getDraws(rowsPerPage, page * rowsPerPage),
  })
  
  // Reset page when switching tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: 'picks' | 'draws') => {
    setTab(newValue)
    setPage(0)
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
                <ContentCopy fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(pick.id)} color="error">
                <Delete fontSize="small" />
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
                  <ContentCopy fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(draw.id)} color="error">
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  const currentCount = tab === 'picks' ? picks.length : draws.length
  const currentLabel = tab === 'picks' ? 'układów' : 'losowań'

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        📚 Historia
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tab} onChange={handleTabChange}>
              <Tab label={`Wygenerowane Układy (${picks.length})`} value="picks" />
              <Tab label={`Historyczne Losowania (${draws.length})`} value="draws" />
            </Tabs>
          </Box>

          {currentCount > 0 && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Łącznie: {currentCount} {currentLabel}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteSweep />}
                onClick={() => clearAllMutation.mutate()}
                disabled={clearAllMutation.isPending}
              >
                Usuń Wszystkie
              </Button>
            </Box>
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
                Strona {page + 1}
              </Typography>
            </Box>
            <Pagination 
              count={10} 
              page={page + 1} 
              onChange={(_, value) => setPage(value - 1)}
              color="primary"
              showFirstButton
              showLastButton
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
    </Box>
  )
}
