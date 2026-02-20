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
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from '@mui/material'
import { ICONS } from '@/config/icons'
import { api } from '../services/api'
import NumbersBall from '../components/NumbersBall'
import MuiDatePickerField from '../components/MuiDatePickerField'
import type { Pick, Draw, IntegrityReport, ValidateResponse, DrawSchedule, DrawScheduleCreate } from '../types'
import useAdmin from '../hooks/useAdmin'
import useLabels from '../hooks/useLabels'

export default function History() {
  const { getLabel } = useLabels()
  const [tab, setTab] = useState<'picks' | 'draws' | 'schedules' | 'hits'>('picks')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null)
  const [integrityDialogOpen, setIntegrityDialogOpen] = useState(false)
  const [manualDialogOpen, setManualDialogOpen] = useState(false)
  const [manualPickDialogOpen, setManualPickDialogOpen] = useState(false)
  const [manualNumbers, setManualNumbers] = useState<string>('')
  const [manualDate, setManualDate] = useState<string>('')
  const [manualPickNumbers, setManualPickNumbers] = useState<string>('')
  const [validationResult, setValidationResult] = useState<ValidateResponse | null>(null)
  const [missingDatesCheck, setMissingDatesCheck] = useState<any>(null)
  const [isCheckingDates, setIsCheckingDates] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<DrawSchedule | null>(null)
  const [scheduleDateFrom, setScheduleDateFrom] = useState<string>('')
  const [hitsData, setHitsData] = useState<any>(null)
  const [isCheckingHits, setIsCheckingHits] = useState(false)
  const [scheduleDateTo, setScheduleDateTo] = useState<string>('')
  const [scheduleWeekdays, setScheduleWeekdays] = useState<number[]>([1, 3, 5])
  const [scheduleDescription, setScheduleDescription] = useState<string>('')
  const [dateFilterFrom, setDateFilterFrom] = useState<string>('')
  const [dateFilterTo, setDateFilterTo] = useState<string>('')
  const [jumpToPage, setJumpToPage] = useState<string>('')
  const queryClient = useQueryClient()
  const isAdmin = useAdmin()

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

  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => api.getDrawSchedules(),
    enabled: tab === 'schedules',
  })

  const schedules = schedulesData || []

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
  const handleTabChange = (_: React.SyntheticEvent, newValue: 'picks' | 'draws' | 'schedules' | 'hits') => {
    setTab(newValue)
    setPage(0)
    setSelectedItems([]) // Reset selection when changing tabs
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
      setSelectedItems([])
    },
  })

  const deleteSelectedMutation = useMutation({
    mutationFn: (ids: number[]) => {
      if (tab === 'picks') {
        return api.deletePicksBatch(ids)
      } else {
        return api.deleteDrawsBatch(ids)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tab] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setSelectedItems([])
    },
  })

  const syncLottoMutation = useMutation({
    mutationFn: () => api.syncLottoResults(),
    onSuccess: (data) => {
      if (data.success) {
        setSyncResult({
          type: 'success',
          message: data.message + (data.new_draws > 0 ? ` (${data.new_draws} ${getLabel('history.sync.newDraws')})` : ''),
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
        message: getLabel('history.export.success').replace('{{count}}', data.count.toString()),
      })
      setTimeout(() => setSyncResult(null), 3000)
    },
  })

  const verifyIntegrityMutation = useMutation({
    mutationFn: () => api.verifyIntegrity(),
    retry: false,
    onSuccess: (data) => {
      setIntegrityReport(data)
      // Show success message if no issues
      if (!data.has_issues) {
        setSyncResult({
          type: 'success',
          message: 'Sprawdzenie integralności zakończone: brak problemów'
        })
        setTimeout(() => setSyncResult(null), 3000)
      }
    },
    onError: (error: any) => {
      console.error('Error verifying integrity:', error)
      setIntegrityReport(null)
      setSyncResult({
        type: 'error',
        message: 'Błąd sprawdzania integralności. Spróbuj ponownie później lub odśwież stronę.'
      })
      setTimeout(() => setSyncResult(null), 5000)
    },
  })

  const fixIntegrityMutation = useMutation({
    mutationFn: () => api.fixIntegrity(),
    onSuccess: (data) => {
      setSyncResult({
        type: 'success',
        message: data.message,
      })
      queryClient.invalidateQueries({ queryKey: ['draws'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setIntegrityReport(null)
      // Re-verify after fix
      setTimeout(() => verifyIntegrityMutation.mutate(), 1000)
      setTimeout(() => setSyncResult(null), 5000)
    },
    onError: (error: any) => {
      setSyncResult({
        type: 'error',
        message: error.message || 'Błąd naprawiania integralności',
      })
      setTimeout(() => setSyncResult(null), 5000)
    },
  })

  // Auto-verify integrity when tab is "draws" (only once)
  // DISABLED to save DB queries - use manual button instead
  // useEffect(() => {
  //   if (tab === 'draws' && drawsTotal > 0 && !integrityChecked) {
  //     verifyIntegrityMutation.mutate()
  //     setIntegrityChecked(true)
  //   }
  //   // Reset flag when leaving draws tab
  //   if (tab !== 'draws') {
  //     setIntegrityChecked(false)
  //   }
  // }, [tab, drawsTotal, integrityChecked])

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

  const handleToggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const currentItems = tab === 'picks' ? picks : draws
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(currentItems.map((item) => item.id))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      setBatchDeleteDialogOpen(true)
    }
  }

  const confirmBatchDelete = () => {
    deleteSelectedMutation.mutate(selectedItems)
    setBatchDeleteDialogOpen(false)
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
        message: getLabel('history.validation.enterExactly6Numbers', 'Wprowadź dokładnie 6 liczb od 1 do 49'),
      })
      setTimeout(() => setSyncResult(null), 3000)
      return
    }

    if (new Set(numbersArray).size !== 6) {
      setSyncResult({
        type: 'error',
        message: getLabel('history.validation.uniqueNumbers', 'Wszystkie liczby muszą być unikalne'),
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

  const handleManualPickValidate = async () => {
    // Parse and validate numbers
    const numbersArray = manualPickNumbers
      .split(/[\s,;]+/)
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 49)

    if (numbersArray.length !== 6) {
      setSyncResult({
        type: 'error',
        message: getLabel('history.validation.enterExactly6Numbers', 'Wprowadź dokładnie 6 liczb od 1 do 49'),
      })
      setTimeout(() => setSyncResult(null), 3000)
      return
    }

    if (new Set(numbersArray).size !== 6) {
      setSyncResult({
        type: 'error',
        message: getLabel('history.validation.uniqueNumbers', 'Wszystkie liczby muszą być unikalne'),
      })
      setTimeout(() => setSyncResult(null), 3000)
      return
    }

    // Validate against history and picks
    try {
      const result = await api.validateNumbers(numbersArray.sort((a, b) => a - b))
      setValidationResult(result)
    } catch (error) {
      setSyncResult({
        type: 'error',
        message: 'Błąd walidacji liczb',
      })
      setTimeout(() => setSyncResult(null), 3000)
    }
  }

  const handleManualPickAdd = async () => {
    // Parse numbers
    const numbersArray = manualPickNumbers
      .split(/[\s,;]+/)
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 49)
      .sort((a, b) => a - b)

    try {
      await api.addCustomPick(numbersArray)
      
      setSyncResult({
        type: 'success',
        message: 'Dodano układ do wygenerowanych',
      })
      
      queryClient.invalidateQueries({ queryKey: ['picks'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setManualPickDialogOpen(false)
      setManualPickNumbers('')
      setValidationResult(null)
      setTimeout(() => setSyncResult(null), 3000)
    } catch (error: any) {
      setSyncResult({
        type: 'error',
        message: error.response?.data?.detail || 'Błąd dodawania układu',
      })
      setTimeout(() => setSyncResult(null), 3000)
    }
  }

  const handleCheckMissingDates = async () => {
    const missingDateIssue = integrityReport?.issues.find(i => i.type === 'missing_date')
    if (!missingDateIssue?.details?.missing_dates) return

    setIsCheckingDates(true)
    try {
      const result = await api.checkMissingDates(missingDateIssue.details.missing_dates)
      setMissingDatesCheck(result)
    } catch (error) {
      console.error('Error checking missing dates:', error)
    } finally {
      setIsCheckingDates(false)
    }
  }

  const createScheduleMutation = useMutation({
    mutationFn: (schedule: DrawScheduleCreate) => api.createDrawSchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setSyncResult({ type: 'success', message: 'Harmonogram utworzony' })
      setScheduleDialogOpen(false)
      resetScheduleForm()
      setTimeout(() => setSyncResult(null), 3000)
    },
    onError: (error: any) => {
      setSyncResult({ type: 'error', message: error.response?.data?.detail || 'Błąd tworzenia harmonogramu' })
      setTimeout(() => setSyncResult(null), 5000)
    },
  })

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, schedule }: { id: number; schedule: DrawScheduleCreate }) => 
      api.updateDrawSchedule(id, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setSyncResult({ type: 'success', message: 'Harmonogram zaktualizowany' })
      setScheduleDialogOpen(false)
      resetScheduleForm()
      setTimeout(() => setSyncResult(null), 3000)
    },
    onError: (error: any) => {
      setSyncResult({ type: 'error', message: error.response?.data?.detail || 'Błąd aktualizacji harmonogramu' })
      setTimeout(() => setSyncResult(null), 5000)
    },
  })

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: number) => api.deleteDrawSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setSyncResult({ type: 'success', message: 'Harmonogram usunięty' })
      setTimeout(() => setSyncResult(null), 3000)
    },
    onError: (error: any) => {
      setSyncResult({ type: 'error', message: error.response?.data?.detail || 'Błąd usuwania harmonogramu' })
      setTimeout(() => setSyncResult(null), 5000)
    },
  })

  const initializeSchedulesMutation = useMutation({
    mutationFn: () => api.initializeDefaultSchedules(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setSyncResult({ type: 'success', message: 'Utworzono domyślny harmonogram' })
      setTimeout(() => setSyncResult(null), 3000)
    },
  })

  const resetScheduleForm = () => {
    setEditingSchedule(null)
    setScheduleDateFrom('')
    setScheduleDateTo('')
    setScheduleWeekdays([1, 3, 5])
    setScheduleDescription('')
  }

  const handleOpenScheduleDialog = (schedule?: DrawSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule)
      setScheduleDateFrom(schedule.date_from)
      setScheduleDateTo(schedule.date_to || '')
      setScheduleWeekdays(schedule.weekdays)
      setScheduleDescription(schedule.description || '')
    } else {
      resetScheduleForm()
    }
    setScheduleDialogOpen(true)
  }

  const handleSaveSchedule = () => {
    if (!scheduleDateFrom) {
      setSyncResult({ type: 'error', message: 'Podaj datę początkową' })
      setTimeout(() => setSyncResult(null), 3000)
      return
    }

    if (scheduleWeekdays.length === 0) {
      setSyncResult({ type: 'error', message: getLabel('history.validation.selectAtLeastOneDay', 'Wybierz przynajmniej jeden dzień tygodnia') })
      setTimeout(() => setSyncResult(null), 3000)
      return
    }

    const schedule: DrawScheduleCreate = {
      date_from: scheduleDateFrom,
      date_to: scheduleDateTo || undefined,
      weekdays: scheduleWeekdays.sort((a, b) => a - b),
      description: scheduleDescription || undefined,
    }

    if (editingSchedule) {
      updateScheduleMutation.mutate({ id: editingSchedule.id, schedule })
    } else {
      createScheduleMutation.mutate(schedule)
    }
  }

  const handleToggleWeekday = (day: number) => {
    setScheduleWeekdays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const getSum = (numbers: number[]) => numbers.reduce((sum, num) => sum + num, 0)

  const renderPicks = () => {
    if (picksLoading) {
      return <Typography>Ładowanie...</Typography>
    }

    if (picks.length === 0) {
      return (
        <Alert severity="info">
          {getLabel('history.noGeneratedPicks', 'Brak wygenerowanych układów. Przejdź do zakładki "Generuj" aby utworzyć nowe układy.')}
        </Alert>
      )
    }

    const allSelected = picks.length > 0 && selectedItems.length === picks.length

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Select All Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 2 }}>
          <Checkbox
            checked={allSelected}
            indeterminate={selectedItems.length > 0 && selectedItems.length < picks.length}
            onChange={handleSelectAll}
          />
          <Typography variant="body2" color="text.secondary">
            {selectedItems.length > 0 ? `${getLabel('history.selected', 'Zaznaczono')}: ${selectedItems.length}` : getLabel('history.actions.selectAll', 'Zaznacz wszystkie')}
          </Typography>
        </Box>

        {picks.map((pick: Pick) => (
          <Box
            key={pick.id}
            sx={{
              py: 1,
              px: 2,
              bgcolor: selectedItems.includes(pick.id) ? 'action.selected' : 'background.default',
              borderRadius: 1,
              borderLeft: 3,
              borderColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Checkbox
                checked={selectedItems.includes(pick.id)}
                onChange={() => handleToggleSelect(pick.id)}
              />
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
              {isAdmin && (
                <IconButton size="small" onClick={() => handleDelete(pick.id)} color="error">
                  <ICONS.Delete fontSize="small" />
                </IconButton>
              )}
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

    // Apply date filter
    const filteredDraws = draws.filter((draw: Draw) => {
      if (!dateFilterFrom && !dateFilterTo) return true
      if (!draw.source || !/^\d{4}-\d{2}-\d{2}$/.test(draw.source)) return true
      
      // Parse draw date (YYYY-MM-DD format)
      const drawDate = draw.source
      
      // Compare as strings (YYYY-MM-DD format allows direct string comparison)
      if (dateFilterFrom && dateFilterFrom > drawDate) return false
      if (dateFilterTo && dateFilterTo < drawDate) return false
      return true
    })

    if (filteredDraws.length === 0) {
      return (
        <Alert severity="info">
          {draws.length === 0 
            ? getLabel('history.noHistoricalDraws', 'Brak historycznych losowań. Wgraj plik CSV z historycznymi wynikami w zakładce "Dashboard".')
            : `${getLabel('history.noDrawsInPeriod', 'Brak losowań w wybranym okresie')}. ${dateFilterFrom ? `Od: ${dateFilterFrom}` : ''} ${dateFilterTo ? `Do: ${dateFilterTo}` : ''}`}
        </Alert>
      )
    }

    const allSelected = filteredDraws.length > 0 && selectedItems.length === filteredDraws.length

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Select All Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 2 }}>
          <Checkbox
            checked={allSelected}
            indeterminate={selectedItems.length > 0 && selectedItems.length < filteredDraws.length}
            onChange={handleSelectAll}
          />
          <Typography variant="body2" color="text.secondary">
            {selectedItems.length > 0 ? `${getLabel('history.selected', 'Zaznaczono')}: ${selectedItems.length}` : getLabel('history.actions.selectAll', 'Zaznacz wszystkie')}
          </Typography>
          {(dateFilterFrom || dateFilterTo) && (
            <Typography variant="caption" color="primary" sx={{ ml: 'auto' }}>
              {getLabel('history.messages.filterActive', 'Filtr aktywny: {{filtered}} z {{total}}').replace('{{filtered}}', filteredDraws.length.toString()).replace('{{total}}', draws.length.toString())}
            </Typography>
          )}
        </Box>

        {filteredDraws.map((draw: Draw) => {
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
                bgcolor: selectedItems.includes(draw.id) ? 'action.selected' : 'background.default',
                borderRadius: 1,
                borderLeft: 3,
                borderColor: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Checkbox
                  checked={selectedItems.includes(draw.id)}
                  onChange={() => handleToggleSelect(draw.id)}
                />
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
                {isAdmin && (
                  <IconButton size="small" onClick={() => handleDelete(draw.id)} color="error">
                    <ICONS.Delete fontSize="small" />
                  </IconButton>
                )}
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
  const currentLabel = tab === 'picks' ? getLabel('history.types.picks') : getLabel('history.types.draws')

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ICONS.LibraryBooks color="primary" fontSize="large" /> {getLabel('history.title', 'Historia')}
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tab} onChange={handleTabChange}>
              <Tab label={`${getLabel('history.generatedPicks', 'Wygenerowane Układy')} (${picksTotal})`} value="picks" />
              <Tab label={`${getLabel('history.historicalDraws', 'Historyczne Losowania')} (${drawsTotal})`} value="draws" />
              <Tab label={`${getLabel('history.drawSchedules', 'Harmonogramy')} (${schedules.length})`} value="schedules" />
              <Tab label={getLabel('history.hits.tabTitle', 'Trafienia')} value="hits" icon={<ICONS.Search />} iconPosition="start" />
            </Tabs>
          </Box>

          {currentCount > 0 && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {getLabel('history.totalCount', 'Łącznie')}: {currentCount} {currentLabel}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedItems.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<ICONS.Delete />}
                    onClick={handleDeleteSelected}
                    disabled={deleteSelectedMutation.isPending}
                  >
                    {deleteSelectedMutation.isPending ? getLabel('history.actions.deleting', 'Usuwanie...') : `${getLabel('history.actions.deleteSelected', 'Usuń zaznaczone')} (${selectedItems.length})`}
                  </Button>
                )}
                {tab === 'picks' && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<ICONS.Add />}
                    onClick={() => setManualPickDialogOpen(true)}
                  >
                    Dodaj ręcznie
                  </Button>
                )}
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
                      {syncLottoMutation.isPending ? getLabel('history.actions.syncing', 'Synchronizacja...') : getLabel('history.actions.sync', 'Synchronizuj z Lotto.pl')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<ICONS.Add />}
                      onClick={() => setManualDialogOpen(true)}
                    >
                      {getLabel('history.actions.addManually', 'Dodaj ręcznie')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<ICONS.Download />}
                      onClick={() => exportMutation.mutate()}
                      disabled={exportMutation.isPending}
                    >
                      {getLabel('history.actions.backup', 'Backup')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="info"
                      size="small"
                      startIcon={verifyIntegrityMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <ICONS.Search />}
                      onClick={() => verifyIntegrityMutation.mutate()}
                      disabled={verifyIntegrityMutation.isPending}
                    >
                      {getLabel('history.actions.verifyIntegrity', 'Sprawdź Integralność')}
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
                  {getLabel('history.actions.deleteAll', 'Usuń Wszystkie')}
                </Button>
              </Box>
            </Box>
          )}

          {/* Date Filter (only for draws tab) */}
          {tab === 'draws' && (
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <MuiDatePickerField
                label={getLabel('history.dateFilter.from')}
                value={dateFilterFrom}
                onChange={setDateFilterFrom}
                size="small"
                format="dd/MM/yyyy"
                width={180}
              />
              <MuiDatePickerField
                label={getLabel('history.dateFilter.to')}
                value={dateFilterTo}
                onChange={setDateFilterTo}
                size="small"
                format="dd/MM/yyyy"
                width={180}
              />
              {(dateFilterFrom || dateFilterTo) && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setDateFilterFrom('')
                    setDateFilterTo('')
                  }}
                  sx={{ mt: '16px' }}
                >
                  {getLabel('history.actions.clearFilter', 'Wyczyść filtr')}
                </Button>
              )}
            </Box>
          )}

          {/* Action buttons always visible for picks tab */}
          {tab === 'picks' && isAdmin && currentCount === 0 && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<ICONS.Add />}
                onClick={() => setManualPickDialogOpen(true)}
              >
                Dodaj ręcznie
              </Button>
            </Box>
          )}

          {/* Sync Result Alert */}
          {syncResult && (
            <Alert severity={syncResult.type} sx={{ mb: 2 }} onClose={() => setSyncResult(null)}>
              {syncResult.message}
            </Alert>
          )}

          {/* Integrity Loading Indicator */}
          {tab === 'draws' && verifyIntegrityMutation.isPending && (
            <Alert severity="info" sx={{ mb: 2 }} icon={<CircularProgress size={20} />}>
              <strong>Sprawdzam integralność danych...</strong>
            </Alert>
          )}

          {/* Integrity Alert */}
          {tab === 'draws' && integrityReport && integrityReport.has_issues && (
            <Alert 
              severity="warning" 
              sx={{ mb: 2 }}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setIntegrityDialogOpen(true)}
                  >
                    Pokaż szczegóły
                  </Button>
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => fixIntegrityMutation.mutate()}
                    disabled={fixIntegrityMutation.isPending}
                    startIcon={fixIntegrityMutation.isPending ? <CircularProgress size={16} /> : null}
                  >
                    {fixIntegrityMutation.isPending ? 'Naprawiam...' : 'Napraw'}
                  </Button>
                </Box>
              }
            >
              <strong>Problemy z integralnością danych:</strong> {integrityReport.summary}
              <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                {integrityReport.issues.slice(0, 3).map((issue, idx) => (
                  <li key={idx}>{issue.description}</li>
                ))}
                {integrityReport.issues.length > 3 && (
                  <li>...i {integrityReport.issues.length - 3} innych</li>
                )}
              </Box>
            </Alert>
          )}

          {tab === 'picks' && renderPicks()}
          {tab === 'draws' && renderDraws()}
          {tab === 'schedules' && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {getLabel('history.schedules.manageDescription')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {schedules.length === 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => initializeSchedulesMutation.mutate()}
                      disabled={initializeSchedulesMutation.isPending}
                    >
                      {initializeSchedulesMutation.isPending ? 'Tworzę...' : 'Utwórz domyślny'}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ICONS.Add />}
                    onClick={() => handleOpenScheduleDialog()}
                  >
                    {getLabel('history.schedules.addSchedule')}
                  </Button>
                </Box>
              </Box>

              {schedulesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : schedules.length === 0 ? (
                <Alert severity="info">
                  {getLabel('history.noSchedules', 'Brak harmonogramów. Dodaj pierwszy harmonogram aby określić dni losowań dla różnych okresów.')}
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>{getLabel('history.schedules.tableHeaders.fromDate')}</strong></TableCell>
                        <TableCell><strong>{getLabel('history.schedules.tableHeaders.toDate')}</strong></TableCell>
                        <TableCell><strong>{getLabel('history.schedules.tableHeaders.weekdays')}</strong></TableCell>
                        <TableCell><strong>{getLabel('history.schedules.tableHeaders.description')}</strong></TableCell>
                        <TableCell align="right"><strong>{getLabel('history.schedules.tableHeaders.actions')}</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {schedules.map((schedule) => {
                        const weekdayNames = getLabel('history.weekdays.short')
                        
                        return (
                          <TableRow key={schedule.id}>
                            <TableCell>{new Date(schedule.date_from).toLocaleDateString('pl-PL')}</TableCell>
                            <TableCell>
                              {schedule.date_to 
                                ? new Date(schedule.date_to).toLocaleDateString('pl-PL')
                                : <em>{getLabel('history.schedules.currently')}</em>
                              }
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {schedule.weekdays.map(d => (
                                  <Chip key={d} label={weekdayNames[d]} size="small" />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>{schedule.description || '-'}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenScheduleDialog(schedule)}
                                color="primary"
                              >
                                <ICONS.Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (confirm(getLabel('history.dialogs.confirmDeleteSchedule', 'Czy na pewno chcesz usunąć ten harmonogram?'))) {
                                    deleteScheduleMutation.mutate(schedule.id)
                                  }
                                }}
                                color="error"
                              >
                                <ICONS.Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {tab === 'hits' && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {getLabel('history.hits.description')}
                </Typography>
                <Button
                  variant="contained"
                  onClick={async () => {
                    setIsCheckingHits(true)
                    try {
                      const data = await api.checkPickHits()
                      setHitsData(data)
                    } catch (error) {
                      console.error('Error checking hits:', error)
                    } finally {
                      setIsCheckingHits(false)
                    }
                  }}
                  disabled={isCheckingHits}
                  startIcon={isCheckingHits ? <CircularProgress size={20} /> : <ICONS.Search />}
                >
                  {isCheckingHits ? getLabel('history.actions.checking', 'Sprawdzam...') : getLabel('history.actions.checkHits', 'Sprawdź trafienia')}
                </Button>
              </Box>

              {hitsData && (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>{getLabel('history.hits.checked').replace('{{picks}}', hitsData.total_picks.toString()).replace('{{draws}}', hitsData.total_draws.toString())}</strong>
                    <br />
                    <strong>{getLabel('history.hits.found').replace('{{count}}', hitsData.picks_with_hits.toString())}</strong>
                  </Alert>

                  {hitsData.results.filter((r: any) => r.best_hit_count >= 3).map((result: any, idx: number) => (
                    <Card key={idx} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                          <NumbersBall numbers={result.pick_numbers} />
                          <Chip 
                            label={getLabel('history.hits.best').replace('{{count}}', result.best_hit_count.toString())}
                            color={result.best_hit_count === 6 ? 'error' : result.best_hit_count === 5 ? 'warning' : 'default'}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {result.pick_strategy} • {new Date(result.pick_created_at).toLocaleString('pl-PL')}
                        </Typography>

                        {result.matches.slice(0, 5).map((match: any, midx: number) => (
                          <Box key={midx} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Chip 
                                label={getLabel('history.hits.hitCount').replace('{{count}}', match.hit_count.toString())}
                                size="small"
                                color={match.hit_count === 6 ? 'error' : match.hit_count === 5 ? 'warning' : match.hit_count === 4 ? 'info' : 'default'}
                              />
                              <Typography variant="body2">
                                {match.draw_date}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {match.draw_numbers.map((num: number) => {
                                  const isMatched = match.matched_numbers.includes(num)
                                  return (
                                    <Avatar
                                      key={num}
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        background: isMatched 
                                          ? 'linear-gradient(135deg, #ff6f00 0%, #f57c00 100%)'
                                          : 'linear-gradient(135deg, #546e7a 0%, #455a64 100%)',
                                        boxShadow: isMatched ? '0 0 8px rgba(255, 111, 0, 0.6)' : '0 2px 4px rgba(0,0,0,0.2)',
                                      }}
                                    >
                                      {num}
                                    </Avatar>
                                  )
                                })}
                              </Box>
                            </Box>
                          </Box>
                        ))}
                        {result.matches.length > 5 && (
                          <Typography variant="caption" color="text.secondary">
                            {getLabel('history.hits.moreHits').replace('{{count}}', (result.matches.length - 5).toString())}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {hitsData.results.filter((r: any) => r.best_hit_count >= 3).length === 0 && (
                    <Alert severity="info">
                      {getLabel('history.hits.noHits', 'Brak układów z 3+ trafieniami')}
                    </Alert>
                  )}
                </>
              )}
            </Box>
          )}
          
          {/* Pagination Controls */}
          {tab !== 'schedules' && tab !== 'hits' && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>{getLabel('history.pagination.rowsPerPage')}</InputLabel>
                  <Select
                    value={rowsPerPage}
                    label={getLabel('history.pagination.rowsPerPage')}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value))
                      setPage(0)
                      setSelectedItems([]) // Reset selection when changing page size
                    }}
                  >
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={200}>200</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  {getLabel('history.pagination.page', 'Strona')} {page + 1} {getLabel('history.pagination.of', 'z')} {currentTotalPages} {isFetching && <CircularProgress size={12} sx={{ ml: 1 }} />}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    size="small"
                    label={getLabel('history.pagination.page', 'Strona')}
                    type="number"
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const pageNum = parseInt(jumpToPage)
                        if (pageNum >= 1 && pageNum <= currentTotalPages) {
                          setPage(pageNum - 1)
                          setJumpToPage('')
                          setSelectedItems([])
                          setTimeout(prefetchNextPage, 100)
                        }
                      }
                    }}
                    sx={{ width: 110 }}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ inputProps: { min: 1, max: currentTotalPages } }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const pageNum = parseInt(jumpToPage)
                      if (pageNum >= 1 && pageNum <= currentTotalPages) {
                        setPage(pageNum - 1)
                        setJumpToPage('')
                        setSelectedItems([])
                        setTimeout(prefetchNextPage, 100)
                      }
                    }}
                    disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > currentTotalPages}
                  >
                    {getLabel('history.pagination.jumpTo')}
                  </Button>
                </Box>
              </Box>
              <Pagination 
                count={currentTotalPages}
                page={page + 1} 
                onChange={(_, value) => {
                  setPage(value - 1)
                  setSelectedItems([]) // Reset selection when changing pages
                  setTimeout(prefetchNextPage, 100)
                }}
                color="primary"
                showFirstButton
                showLastButton
                disabled={isFetching}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{getLabel('history.dialogs.confirmDelete', 'Potwierdzenie usunięcia')}</DialogTitle>
        <DialogContent>
          <Typography>
            {getLabel('history.dialogs.confirmDeleteSingle', 'Czy na pewno chcesz usunąć ten {{type}}?').replace('{{type}}', getLabel(tab === 'picks' ? 'history.types.pick' : 'history.types.draw', tab === 'picks' ? 'układ' : 'wynik losowania'))}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{getLabel('common.cancel', 'Anuluj')}</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? getLabel('history.actions.deleting', 'Usuwanie...') : getLabel('common.delete', 'Usuń')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={batchDeleteDialogOpen} onClose={() => setBatchDeleteDialogOpen(false)}>
        <DialogTitle>{getLabel('history.dialogs.confirmDelete', 'Potwierdzenie usunięcia')}</DialogTitle>
        <DialogContent>
          <Typography>
            {getLabel('history.dialogs.confirmDeleteBatch', 'Czy na pewno chcesz usunąć {{count}} {{type}}?').replace('{{count}}', selectedItems.length.toString()).replace('{{type}}', getLabel(tab === 'picks' ? 'history.types.picks' : 'history.types.draws', tab === 'picks' ? 'układów' : 'wyników losowań'))}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDeleteDialogOpen(false)}>{getLabel('common.cancel', 'Anuluj')}</Button>
          <Button
            onClick={confirmBatchDelete}
            color="error"
            variant="contained"
            disabled={deleteSelectedMutation.isPending}
          >
            {deleteSelectedMutation.isPending ? getLabel('history.actions.deleting', 'Usuwanie...') : getLabel('common.delete', 'Usuń')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Draw Dialog */}
      <Dialog open={manualDialogOpen} onClose={() => setManualDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{getLabel('history.dialogs.addDrawManually', 'Dodaj losowanie ręcznie')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              {getLabel('history.dialogs.useThisOptionInfo', 'Użyj tej opcji gdy synchronizacja z API nie działa lub chcesz dodać starsze wyniki.')}
            </Alert>
            
            <TextField
              fullWidth
              label={getLabel('history.dialogs.numbersLabel', 'Liczby (6 liczb od 1 do 49)')}
              placeholder={getLabel('history.dialogs.numbersPlaceholder', 'np. 5, 12, 23, 34, 39, 45, 49')}
              value={manualNumbers}
              onChange={(e) => setManualNumbers(e.target.value)}
              helperText={getLabel('history.validation.enter6NumbersHelper', 'Wprowadź 6 liczb oddzielonych spacjami, przecinkami lub średnikami')}
            />
            
            <MuiDatePickerField
              label={getLabel('history.dialogs.drawDateLabel', 'Data losowania (opcjonalnie)')}
              value={manualDate}
              onChange={(v) => setManualDate(v || '')}
              format="dd.MM.yyyy"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualDialogOpen(false)}>{getLabel('common.cancel', 'Anuluj')}</Button>
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

      {/* Integrity Details Dialog */}
      <Dialog 
        open={integrityDialogOpen} 
        onClose={() => setIntegrityDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Szczegóły problemów z integralnością</DialogTitle>
        <DialogContent>
          {integrityReport && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>{integrityReport.summary}</strong>
              </Alert>
              
              {/* Reference Information */}
              {integrityReport.lottery_start_date && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Informacje referencyjne
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Najstarsze losowanie:</strong> {integrityReport.lottery_start_date} 
                      {integrityReport.lottery_start_sequential_id && ` (ID: ${integrityReport.lottery_start_sequential_id})`}
                    </Typography>
                    
                    {integrityReport.historical_era_draws_count !== undefined && (
                      <Typography variant="body2">
                        <strong>Era historyczna (przed {integrityReport.api_reliable_start_date}):</strong>{' '}
                        {integrityReport.historical_era_draws_count} losowań
                      </Typography>
                    )}
                    
                    {integrityReport.api_reliable_start_sequential_id && (
                      <Typography variant="body2">
                        <strong>Pierwsza weryfikowalna data ({integrityReport.api_reliable_start_date}):</strong>{' '}
                        Sequential ID: {integrityReport.api_reliable_start_sequential_id}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.85em' }}>
                      Weryfikacja brakujących losowań dotyczy tylko danych od {integrityReport.api_reliable_start_date},
                      gdzie API Lotto.pl ma kompletne dane.
                    </Typography>
                  </Box>
                </Box>
              )}
              
              <Typography variant="h6" gutterBottom>
                Znalezione problemy ({integrityReport.issues.length}):
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {integrityReport.issues.map((issue, idx) => (
                  <Alert 
                    key={idx} 
                    severity={issue.severity === 'error' ? 'error' : issue.severity === 'info' ? 'info' : 'warning'}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2" component="div">
                      <strong>{issue.type}:</strong> {issue.description}
                      
                      {/* Show schedule context for missing_date issue */}
                      {issue.type === 'missing_date' && issue.details?.schedule_context && Array.isArray(issue.details.schedule_context) && issue.details.schedule_context.length > 0 && (
                        <Box sx={{ mt: 1, pl: 1, borderLeft: '3px solid currentColor' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.9em', mb: 1 }}>
                            <strong>Harmonogramy dla brakujących dat:</strong>
                          </Typography>
                          {issue.details.schedule_context.map((ctx: string, cidx: number) => (
                            <Typography key={cidx} variant="body2" sx={{ fontSize: '0.85em', mb: 0.5, color: 'text.secondary' }}>
                              • {ctx}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      
                      {/* Show button to check missing dates if this is missing_date issue */}
                      {issue.type === 'missing_date' && issue.details?.missing_dates && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleCheckMissingDates}
                            disabled={isCheckingDates}
                            startIcon={isCheckingDates ? <CircularProgress size={16} /> : null}
                          >
                            {isCheckingDates ? getLabel('history.actions.checking', 'Sprawdzam...') : getLabel('history.actions.checkInAPI', 'Sprawdź w API Lotto.pl')}
                          </Button>
                        </Box>
                      )}
                      
                      {issue.details && !issue.details.missing_dates && (
                        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>
                          {typeof issue.details === 'string' ? issue.details : JSON.stringify(issue.details)}
                        </Typography>
                      )}
                    </Typography>
                  </Alert>
                ))}
              </Box>
              
              {/* Missing Dates Check Results Table */}
              {missingDatesCheck && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Szczegóły brakujących dat ({missingDatesCheck.total_checked}):
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Sprawdzono każdą datę w API Lotto.pl. Zielone = istnieje w API, czerwone = nie ma w API
                  </Alert>
                  
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Data</strong></TableCell>
                          <TableCell><strong>Dzień tygodnia</strong></TableCell>
                          <TableCell><strong>W bazie</strong></TableCell>
                          <TableCell><strong>W API</strong></TableCell>
                          <TableCell><strong>Liczby z API</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {missingDatesCheck.results.map((result: any, idx: number) => (
                          <TableRow 
                            key={idx}
                            sx={{ 
                              bgcolor: result.exists_in_api 
                                ? 'rgba(76, 175, 80, 0.08)' // Delikatny zielony
                                : result.weekday === 'Saturday' || result.weekday === 'Tuesday' || result.weekday === 'Thursday'
                                  ? 'rgba(229, 57, 53, 0.08)' // Delikatny czerwony
                                  : 'transparent',
                              '&:hover': {
                                bgcolor: result.exists_in_api 
                                  ? 'rgba(76, 175, 80, 0.15)' 
                                  : result.weekday === 'Saturday' || result.weekday === 'Tuesday' || result.weekday === 'Thursday'
                                    ? 'rgba(229, 57, 53, 0.15)'
                                    : 'rgba(255, 111, 0, 0.08)',
                              }
                            }}
                          >
                            <TableCell>{result.date}</TableCell>
                            <TableCell>{result.weekday || 'N/A'}</TableCell>
                            <TableCell>
                              {result.exists_in_db 
                                ? <Chip label="TAK" size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#a5d6a7', fontWeight: 600 }} /> 
                                : <Chip label="NIE" size="small" sx={{ bgcolor: 'rgba(229, 57, 53, 0.2)', color: '#ef9a9a', fontWeight: 600 }} />
                              }
                            </TableCell>
                            <TableCell>
                              {result.exists_in_api 
                                ? <Chip label="TAK" size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#a5d6a7', fontWeight: 600 }} /> 
                                : <Chip label="NIE" size="small" sx={{ bgcolor: 'rgba(229, 57, 53, 0.2)', color: '#ef9a9a', fontWeight: 600 }} />
                              }
                            </TableCell>
                            <TableCell>
                              {result.api_numbers ? result.api_numbers.join(', ') : '-'}
                            </TableCell>
                            <TableCell>
                              {result.should_add && (
                                <Chip label="Dodaj" size="small" sx={{ bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#a5d6a7', fontWeight: 600 }} />
                              )}
                              {!result.exists_in_api && (
                                <Chip label="Nie było" size="small" sx={{ bgcolor: 'rgba(144, 164, 174, 0.2)', color: '#b0bec5', fontWeight: 600 }} />
                              )}
                              {result.exists_in_db && (
                                <Chip label="OK" size="small" sx={{ bgcolor: 'rgba(66, 165, 245, 0.2)', color: '#90caf9', fontWeight: 600 }} />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIntegrityDialogOpen(false)}>Zamknij</Button>
          <Button
            onClick={() => {
              fixIntegrityMutation.mutate()
              setIntegrityDialogOpen(false)
            }}
            color="primary"
            variant="contained"
            disabled={fixIntegrityMutation.isPending}
          >
            Napraw teraz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Pick Dialog */}
      <Dialog 
        open={manualPickDialogOpen} 
        onClose={() => setManualPickDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>{getLabel('history.dialogs.addPickManually', 'Dodaj układ ręcznie')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
              {getLabel('history.validation.enter6NumbersDescription', 'Wprowadź 6 liczb od 1 do 49. System sprawdzi czy układ nie istnieje w historii losowań ani wygenerowanych układach.')}
            </Alert>
            
            <TextField
              fullWidth
              label={getLabel('history.dialogs.numbersLabel', 'Liczby (6 liczb od 1 do 49)')}
              placeholder="np. 5, 12, 23, 34, 39, 45"
              value={manualPickNumbers}
              onChange={(e) => setManualPickNumbers(e.target.value)}
              helperText={getLabel('history.validation.enter6NumbersHelper', 'Wprowadź 6 liczb oddzielonych spacjami, przecinkami lub średnikami')}
            />
            
            {validationResult && (
              <Alert 
                severity={
                  validationResult.exists_in_history || validationResult.exists_in_picks 
                    ? 'error' 
                    : validationResult.is_unique 
                      ? 'success' 
                      : 'info'
                }
              >
                {validationResult.exists_in_history && (
                  <Typography variant="body2">{getLabel('history.validation.existsInHistory', 'Ten układ już istnieje w historii losowań')}</Typography>
                )}
                {validationResult.exists_in_picks && (
                  <Typography variant="body2">{getLabel('history.validation.existsInPicks', 'Ten układ już istnieje w wygenerowanych')}</Typography>
                )}
                {validationResult.is_unique && (
                  <Typography variant="body2">{getLabel('history.validation.isUnique', 'Układ jest unikalny - możesz go dodać')}</Typography>
                )}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualPickDialogOpen(false)}>{getLabel('common.cancel', 'Anuluj')}</Button>
          <Button
            onClick={handleManualPickValidate}
            color="secondary"
            variant="outlined"
            disabled={!manualPickNumbers}
          >
            Sprawdź
          </Button>
          <Button
            onClick={handleManualPickAdd}
            color="primary"
            variant="contained"
            disabled={!validationResult?.is_unique}
          >
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchedule ? getLabel('history.schedules.editSchedule') : getLabel('history.schedules.addSchedule')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              Określ okres dat i dni tygodnia, w których odbywały się losowania. 
              Dni: 0=Poniedziałek, 1=Wtorek, 2=Środa, 3=Czwartek, 4=Piątek, 5=Sobota, 6=Niedziela
            </Alert>
            
            <MuiDatePickerField
              label="Data początkowa"
              value={scheduleDateFrom}
              onChange={(v) => setScheduleDateFrom(v || '')}
              format="dd.MM.yyyy"
              error={!scheduleDateFrom}
            />
            
            <MuiDatePickerField
              label={getLabel('history.schedules.toDateLabel')}
              value={scheduleDateTo}
              onChange={(v) => setScheduleDateTo(v || '')}
              format="dd.MM.yyyy"
              helperText={getLabel('history.schedules.toDateHelper')}
            />
            
            <Box>
              <Typography variant="body2" gutterBottom fontWeight={600}>
                Dni tygodnia:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((name, idx) => (
                  <Chip
                    key={idx}
                    label={name}
                    onClick={() => handleToggleWeekday(idx)}
                    color={scheduleWeekdays.includes(idx) ? 'primary' : 'default'}
                    variant={scheduleWeekdays.includes(idx) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Wybrane: {scheduleWeekdays.sort((a, b) => a - b).join(', ')}
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Opis (opcjonalnie)"
              value={scheduleDescription}
              onChange={(e) => setScheduleDescription(e.target.value)}
              multiline
              rows={2}
              placeholder="np. Era współczesna (wt, czw, sob)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Anuluj</Button>
          <Button
            onClick={handleSaveSchedule}
            color="primary"
            variant="contained"
            disabled={createScheduleMutation.isPending || updateScheduleMutation.isPending}
          >
            {(createScheduleMutation.isPending || updateScheduleMutation.isPending) 
              ? 'Zapisuję...' 
              : editingSchedule ? 'Zaktualizuj' : 'Dodaj'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )

}
