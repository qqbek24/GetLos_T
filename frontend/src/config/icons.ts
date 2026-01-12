/**
 * Centralna konfiguracja ikon Material-UI
 * 
 * Użycie:
 * import { ICONS } from '@/config/icons'
 * <ICONS.Dashboard />
 */

// Import wszystkich używanych ikon
import {
  // Nawigacja i główne
  Casino,
  CasinoOutlined,
  Dashboard as DashboardIcon,
  Assessment,
  History as HistoryIcon,
  FolderOpen,
  Bolt,
  Stars,
  AutoAwesome,
  Description,
  AttachFileOutlined,
  LibraryBooks,
  InsertChartOutlined,
  CalculateOutlined,
  InfoOutlined,
  
  // Akcje
  Upload,
  UploadFile,
  Download,
  Add,
  Delete,
  DeleteSweep,
  ContentCopy,
  Sync,
  
  // Trendy i status
  TrendingUp,
  TrendingDown,
  Star,
  Shuffle,
  GpsFixed,
  Psychology,
  Filter2Outlined,
  Filter3Outlined,
    
  // Inne
  Circle,
} from '@mui/icons-material'

/**
 * Obiekt z wszystkimi ikonami używanymi w aplikacji
 * Ułatwia zarządzanie i podmianę ikon w jednym miejscu
 */
export const ICONS = {
  // === NAWIGACJA I GŁÓWNE ===
  Logo: Casino,              // Logo aplikacji w AppBar
  Dashboard: DashboardIcon,  // Ikona Dashboard
  Stats: Assessment,         // Ikona Statystyk
  Stats_chart: InsertChartOutlined, // Ikona wykresu/statystyk
  History: HistoryIcon,      // Ikona Historii
  Generate: Casino,          // Ikona Generowania (przycisk)
  GenerateTitleIcon: CasinoOutlined, // Ikona Generowania (tytuł strony)
  FolderOpen: FolderOpen,    // Ikona do otwierania plików
  Bolt: Bolt,                // Ikona błyskawicy (szybkie akcje)
  Stars: Stars,              // Ikona gwiazdek (ulubione/statystyki)
  StarsGeneratedNumbers: AutoAwesome, // Ikona do oznaczania wygenerowanych liczb
  LibraryBooks: LibraryBooks,// Ikona książek (historia)
  DescriptionIcon: Description, // Ikona dokumentu/plików
  AttachFileOutlinedIcon: AttachFileOutlined, // Ikona załączników/plików
  CalculateIcon: CalculateOutlined,  // Ikona kalkulatora/statystyk
  InfoIcon: InfoOutlined,    // Ikona informacji/pomocy

  // === AKCJE ===
  Upload: Upload,            // Upload plików CSV
  UploadFileIcon: UploadFile,  // Upload plików CSV (alternatywna)
  Download: Download,        // Download/Backup
  Add: Add,                  // Dodawanie (ręczne losowanie)
  Delete: Delete,            // Usuwanie pojedynczego elementu
  DeleteAll: DeleteSweep,    // Usuwanie wszystkich
  Copy: ContentCopy,         // Kopiowanie do schowka
  Sync: Sync,                // Synchronizacja z API
  
  // === TRENDY I STATUS ===
  Hot: TrendingUp,           // Hot numbers (często występujące)
  Cold: TrendingDown,        // Cold numbers (rzadko występujące)
  Favorite: Star,            // Ulubione / popularne
  Top2: Filter2Outlined,     // Top 2
  Top3: Filter3Outlined,     // Top 3
  
  // === WIZUALNE ===
  Ball: Circle,              // Kula do wyświetlania liczb (opcjonalne)
} as const

/**
 * Typy dla autocomplete w edytorze
 */
export type IconName = keyof typeof ICONS

/**
 * Konfiguracja strategii z ikonami
 * Używane w Generate.tsx
 */
export const STRATEGY_CONFIG = {
  random: {
    icon: Shuffle,
    label: 'Random',
    description: 'Całkowicie losowy wybór liczb',
  },
  hot: {
    icon: TrendingUp,
    label: 'Hot Numbers',
    description: 'Preferuje liczby często występujące w historii',
  },
  cold: {
    icon: TrendingDown,
    label: 'Cold Numbers',
    description: 'Preferuje liczby rzadko występujące w historii',
  },
  balanced: {
    icon: Star,
    label: 'Balanced',
    description: 'Mieszanka częstych i rzadkich liczb',
  },
  combo_based: {
    icon: GpsFixed,
    label: 'Combo Based',
    description: 'Oparte na najczęstszych parach i trójkach',
  },
  ai: {
    icon: Psychology,
    label: 'AI Prediction',
    description: 'Predykcja AI na podstawie analizy wzorców i danych historycznych',
  },
} as const

/**
 * Helper do pobierania ikony po nazwie
 */
export const getIcon = (name: IconName) => ICONS[name]

/**
 * Przykłady użycia:
 * 
 * // W komponencie:
 * import { ICONS } from '../config/icons'
 * <Button startIcon={<ICONS.Upload />}>Upload</Button>
 * 
 * // Dynamicznie:
 * import { getIcon } from '../config/icons'
 * const IconComponent = getIcon('Upload')
 * <IconComponent />
 * 
 * // Z typowaniem:
 * import { IconName } from '../config/icons'
 * const iconName: IconName = 'Dashboard'
 */
