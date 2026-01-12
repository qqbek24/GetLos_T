# Lista Ikon Material-UI używanych w aplikacji GetLos_T

## Gdzie znajdziesz ikony?

Centralna konfiguracja: `frontend/src/config/icons.ts`

## Używane ikony Material-UI

### Nawigacja i główne
| Komponent | Ikona MUI | Gdzie używane | Opis |
|-----------|-----------|---------------|------|
| Logo | `Casino` | Layout.tsx (AppBar) | Logo aplikacji |
| Dashboard | `Dashboard` | Dashboard.tsx | Ikona strony głównej |
| Stats | `Assessment` | Stats.tsx, Dashboard.tsx | Statystyki |
| History | `History` | History.tsx, Dashboard.tsx | Historia |
| Generate | `Casino` | Generate.tsx | Generowanie układów |

### Akcje
| Komponent | Ikona MUI | Gdzie używane | Opis |
|-----------|-----------|---------------|------|
| Upload | `Upload` | Dashboard.tsx | Upload plików CSV |
| Download | `Download` | History.tsx | Pobieranie backup |
| Add | `Add` | History.tsx | Dodawanie ręczne |
| Delete | `Delete` | Generate.tsx, History.tsx | Usuwanie pojedyncze |
| DeleteAll | `DeleteSweep` | History.tsx | Usuwanie wszystkich |
| Copy | `ContentCopy` | Generate.tsx, History.tsx | Kopiowanie |
| Sync | `Sync` | History.tsx | Synchronizacja API |

### Trendy i wizualne
| Komponent | Ikona MUI | Gdzie używane | Opis |
|-----------|-----------|---------------|------|
| Hot | `TrendingUp` | Stats.tsx | Hot numbers |
| Cold | `TrendingDown` | Stats.tsx | Cold numbers |
| Favorite | `Star` | Stats.tsx | Popularne kombinacje |

## Jak używać

### Import centralny (zalecane)
```tsx
import { ICONS } from '@/config/icons'

// W komponencie:
<Button startIcon={<ICONS.Upload />}>Upload</Button>
```

### Import bezpośredni
```tsx
import { Casino, Upload, Delete } from '@mui/icons-material'

<Button startIcon={<Casino />}>Generuj</Button>
```

## Strategie - emoji vs ikony

Obecnie w `Generate.tsx` używane są emoji dla strategii:
- 🎲 Random → można zmienić na `Casino`
- 🔥 Hot → można zmienić na `TrendingUp`
- ❄️ Cold → można zmienić na `TrendingDown`
- ⚖️ Balanced → można zmienić na `Star`
- 🎯 Combo Based → można zmienić na `Casino`

### Jak zamienić emoji na ikony:

W `frontend/src/pages/Generate.tsx`:
```tsx
// PRZED (z emoji):
const strategies = [
  { value: 'random', label: '🎲 Random', description: '...' },
  { value: 'hot', label: '🔥 Hot', description: '...' },
]

// PO (z ikonami MUI):
import { Casino, TrendingUp, TrendingDown, Star } from '@mui/icons-material'

const strategies = [
  { value: 'random', label: 'Random', icon: Casino, description: '...' },
  { value: 'hot', label: 'Hot Numbers', icon: TrendingUp, description: '...' },
  { value: 'cold', label: 'Cold Numbers', icon: TrendingDown, description: '...' },
  { value: 'balanced', label: 'Balanced', icon: Star, description: '...' },
  { value: 'combo_based', label: 'Combo Based', icon: Casino, description: '...' },
]

// W renderze:
{strategies.map(s => (
  <MenuItem key={s.value} value={s.value}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <s.icon fontSize="small" />
      {s.label}
    </Box>
  </MenuItem>
))}
```

## Wszystkie dostępne ikony Material-UI

Przeglądaj: https://mui.com/material-ui/material-icons/

### Często używane kategorie:

**Akcje:**
- `Add`, `Remove`, `Edit`, `Delete`, `Close`, `Check`, `Clear`
- `Save`, `Search`, `Refresh`, `Sync`, `Download`, `Upload`

**Nawigacja:**
- `Home`, `Dashboard`, `Menu`, `ArrowBack`, `ArrowForward`
- `ExpandMore`, `ExpandLess`, `ChevronLeft`, `ChevronRight`

**Komunikacja:**
- `Email`, `Phone`, `Chat`, `Notifications`, `Warning`, `Info`, `Error`

**Pliki:**
- `Folder`, `FolderOpen`, `InsertDriveFile`, `CloudUpload`, `CloudDownload`

**Media:**
- `Play`, `Pause`, `Stop`, `VolumeUp`, `VolumeOff`

**Trendy:**
- `TrendingUp`, `TrendingDown`, `TrendingFlat`, `ShowChart`

## Zmiana ikony - przykłady

### Przykład 1: Zmiana ikony synchronizacji
```tsx
// W History.tsx, zmień:
import { Sync } from '@mui/icons-material'  // stara ikona
// na:
import { CloudSync } from '@mui/icons-material'  // nowa ikona

// Lub w config/icons.ts:
Sync: CloudSync,  // zamiast Sync: Sync,
```

### Przykład 2: Dodanie nowej ikony
```tsx
// 1. W config/icons.ts dodaj:
import { Settings } from '@mui/icons-material'

export const ICONS = {
  // ...existing icons
  Settings: Settings,  // nowa ikona
}

// 2. Użyj w komponencie:
import { ICONS } from '../config/icons'
<Button startIcon={<ICONS.Settings />}>Ustawienia</Button>
```

## Pliki do edycji

Jeśli chcesz zmienić ikony, edytuj te pliki:
- `frontend/src/config/icons.ts` - centralna konfiguracja
- `frontend/src/pages/Dashboard.tsx` - ikony Dashboard
- `frontend/src/pages/Generate.tsx` - ikony i emoji strategii
- `frontend/src/pages/History.tsx` - ikony akcji
- `frontend/src/pages/Stats.tsx` - ikony trendów
- `frontend/src/components/Layout.tsx` - logo w AppBar
