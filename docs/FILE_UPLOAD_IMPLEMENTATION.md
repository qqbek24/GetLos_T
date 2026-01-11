# File Upload Component Implementation

## Overview
Zaimplementowano profesjonalny komponent do wgrywania plików z funkcją drag-and-drop, wzorowany na `transport-request-form-app`.

## Zmiany

### Nowe Komponenty

#### 1. **FileUpload.tsx**
- Lokalizacja: `frontend/src/components/FileUpload.tsx`
- Drag-and-drop interface używający `react-dropzone`
- Obsługa wielu typów plików (CSV, PDF, JPG, PNG)
- Walidacja rozmiaru plików
- Podgląd obrazów
- Pełne wsparcie TypeScript

**Użycie:**
```tsx
import FileUpload from '../components/FileUpload'

<FileUpload
  onFilesChange={handleFilesChange}
  maxFiles={1}
  maxSize={10 * 1024 * 1024}
  clearFiles={clearFiles}
  labels={labels.fileUpload}
/>
```

#### 2. **useLabels.ts**
- Lokalizacja: `frontend/src/hooks/useLabels.ts`
- Hook do zarządzania labelami aplikacji
- Przygotowany pod internacjonalizację (i18n)
- Asynchroniczne ładowanie z `public/labels.json`

**Użycie:**
```tsx
import useLabels from '../hooks/useLabels'

const { labels, getLabel } = useLabels()
const title = getLabel('dashboard.title', 'Dashboard')
```

#### 3. **labels.json**
- Lokalizacja: `frontend/public/labels.json`
- Centralna konfiguracja wszystkich tekstów w aplikacji
- Struktura:
  - `app` - globalne ustawienia
  - `navigation` - menu nawigacji
  - `dashboard` - strona Dashboard
  - `fileUpload` - komponent FileUpload
  - `generate` - strona Generate
  - `history` - strona History
  - `stats` - strona Stats
  - `common` - wspólne elementy

### Zaktualizowane Pliki

#### Dashboard.tsx
- Dodano import `FileUpload` i `useLabels`
- Zamieniono prosty `<input type="file">` na komponent `FileUpload`
- Zintegrowano system labeli:
  - Tytuły sekcji
  - Opisy
  - Teksty przycisków
  - Komunikaty błędów
- Dodano Material-UI ikony: `FolderOpen`, `Bolt`, `Stars`

#### tsconfig.json
- Dodano `"allowJs": true` dla kompatybilności z JavaScript

### Zależności

#### Nowe Pakiety
- `react-dropzone` - drag-and-drop functionality
  
Instalacja:
```bash
npm install react-dropzone
```

## Struktura Plików

```
frontend/
├── public/
│   └── labels.json              # Centralne teksty aplikacji
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx       # Komponent drag-drop
│   │   └── FileUpload.css       # Style dla FileUpload
│   ├── hooks/
│   │   └── useLabels.ts         # Hook do labeli
│   └── pages/
│       └── Dashboard.tsx        # Zaktualizowana strona
```

## Internacjonalizacja (i18n)

### Dodawanie Nowych Języków

1. Utwórz nowy plik: `public/labels-en.json`
2. Skopiuj strukturę z `labels.json`
3. Przetłumacz wartości
4. Użyj w komponencie:
```tsx
const { labels, getLabel } = useLabels('en')
```

### Przykład Multi-Language

```tsx
// Polski (domyślny)
const { labels, getLabel } = useLabels('pl')

// Angielski
const { labels, getLabel } = useLabels('en')

// Niemiecki
const { labels, getLabel } = useLabels('de')
```

## TypeScript Support

### Typy

```typescript
// FileUpload
import { UploadedFile } from '../components/FileUpload'

interface UploadedFile {
  file: File
  id: number
  name: string
  size: number
  type: string
  preview: string | null
}

// useLabels
import { Labels, UseLabelsReturn } from '../hooks/useLabels'

interface UseLabelsReturn {
  labels: Labels
  loading: boolean
  error: string | null
  getLabel: (path: string, defaultValue?: string) => string
}
```

## Testowanie

### Lokalne Testowanie
1. Uruchom dev server:
```bash
cd frontend
npm run dev
```

2. Otwórz `http://localhost:5173`
3. Przetestuj:
   - Drag-and-drop pliku CSV
   - Kliknięcie w obszar upload
   - Walidacja rozmiaru pliku
   - Usuwanie pliku
   - Upload i przetwarzanie

### Produkcja
```bash
cd frontend
npm run build
```

## Migracja z JSX na TSX

Wszystkie pliki JavaScript zostały przekonwertowane na TypeScript:
- ✅ `FileUpload.jsx` → `FileUpload.tsx`
- ✅ `useLabels.js` → `useLabels.ts`
- ✅ Usunięto niepotrzebne pliki `.d.ts`
- ✅ Pełne wsparcie typów
- ✅ Zero błędów TypeScript

## Kolejne Kroki

1. **Zastosuj labels w innych stronach:**
   - Generate.tsx
   - History.tsx
   - Stats.tsx

2. **Dodaj więcej języków:**
   - Utwórz `labels-en.json`
   - Dodaj selektor języka w Layout

3. **Rozszerz FileUpload:**
   - Obsługa batch upload
   - Progress bar dla dużych plików
   - Kompresja przed wysyłką

## Zobacz Również

- [FileUpload Component](../components/FileUpload.tsx)
- [useLabels Hook](../hooks/useLabels.ts)
- [Labels Configuration](../../public/labels.json)
- [Dashboard Implementation](../pages/Dashboard.tsx)
