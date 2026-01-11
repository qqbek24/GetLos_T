# 🎨 Wizualizacja - Synchronizacja z Lotto.pl API

## 🎯 Przegląd Integracji

```
┌────────────────────────────────────────────────────────────────────┐
│                         APLIKACJA GETLOS_T                         │
│                                                                    │
│  ┌──────────────────────┐         ┌─────────────────────────┐   │
│  │      FRONTEND        │         │        BACKEND          │   │
│  │   (React + MUI)      │         │   (FastAPI + SQLite)    │   │
│  │                      │         │                         │   │
│  │  📱 Historia →       │         │  POST /sync-lotto       │   │
│  │  Historyczne         │────────▶│                         │   │
│  │  Losowania           │ axios   │  1️⃣ Sprawdź ostatnią   │   │
│  │                      │         │     datę w bazie        │   │
│  │  🔘 [Synchronizuj]   │         │                         │   │
│  │     z Lotto.pl       │         │  2️⃣ Pobierz z API      │───┐
│  │                      │         │     Lotto.pl            │   │
│  │  ✅ Wynik: +3 nowe   │◀────────│                         │   │
│  │     losowania        │ JSON    │  3️⃣ Porównaj daty      │   │
│  └──────────────────────┘         │                         │   │
│                                    │  4️⃣ Zapisz nowe        │   │
│                                    │     do bazy            │   │
│                                    │                         │   │
│                                    │  5️⃣ Zwróć raport       │   │
│                                    └─────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
                                              │
                                              │ HTTPS
                                              │ Header: secret
                                              ▼
           ┌────────────────────────────────────────────────┐
           │         🌐 API LOTTO.PL (Oficjalne)          │
           │    https://developers.lotto.pl/api/...        │
           │                                               │
           │  GET /lotteries/draw-results/                │
           │      last-results-per-game?gameType=Lotto     │
           │                                               │
           │  Response:                                    │
           │  [{                                           │
           │    "drawSystemId": 12345,                     │
           │    "drawDate": "2026-01-11T21:40:00Z",       │
           │    "gameType": "Lotto",                       │
           │    "results": [{                              │
           │      "numbers": [5,12,23,34,45,49]           │
           │    }]                                         │
           │  }]                                           │
           └────────────────────────────────────────────────┘
```

---

## 🗂️ Struktura Plików

```
GetLos_T/
│
├── 📁 backend/
│   ├── 🆕 lotto_api.py              # Klient API Lotto.pl
│   │   ├── get_last_results_for_lotto()
│   │   ├── parse_lotto_draw()
│   │   └── LottoAPIError
│   │
│   ├── 📝 main.py                   # Główna aplikacja
│   │   └── [+] POST /sync-lotto    # Nowy endpoint
│   │
│   ├── 🆕 test_lotto_api.py        # Skrypt testowy
│   ├── 📝 schema.py                # Schematy Pydantic
│   │   └── [+] SyncLottoResponse
│   ├── 📝 requirements.txt         # Zależności
│   │   └── [+] httpx==0.27.0
│   ├── 🆕 .env                     # Konfiguracja
│   │   └── LOTTO_API_SECRET_KEY=...
│   └── 📝 .env.example             # Przykład konfiguracji
│
├── 📁 frontend/
│   └── src/
│       ├── 📁 types/
│       │   └── 📝 index.ts         # Typy TypeScript
│       │       └── [+] SyncLottoResponse
│       ├── 📁 services/
│       │   └── 📝 api.ts           # Klient API
│       │       └── [+] syncLottoResults()
│       └── 📁 pages/
│           └── 📝 History.tsx      # Strona Historia
│               └── [+] Przycisk "Synchronizuj"
│
└── 📁 docs/
    ├── 🆕 LOTTO_API_SYNC.md        # Pełna dokumentacja
    ├── 🆕 INSTALLATION_GUIDE.md    # Instrukcja instalacji
    ├── 🆕 SUMMARY_FOR_USER.md      # Podsumowanie
    ├── 🆕 VISUALIZATION.md         # Ten plik
    └── 📁 Quick_start_dev/
        └── 🆕 LOTTO_SYNC_QUICKSTART.md  # Szybki start
```

**Legenda:**
- 🆕 = Nowy plik
- 📝 = Zmodyfikowany plik
- [+] = Dodana funkcjonalność

---

## 🔄 Przepływ Danych (Szczegółowo)

### 1️⃣ Użytkownik klika przycisk

```
Frontend (History.tsx)
│
├─ Stan: syncLottoMutation
├─ Akcja: syncLottoMutation.mutate()
│
└─▶ api.syncLottoResults()
    │
    └─▶ POST http://localhost:8001/sync-lotto
```

### 2️⃣ Backend przetwarza request

```
Backend (main.py)
│
├─ Endpoint: @app.post("/sync-lotto")
│
├─ 1. Pobierz ostatnią datę z bazy:
│   └─ db.query(HistoricalDraw)
│      .filter(source != null)
│      .order_by(source DESC)
│      .first()
│   └─ Rezultat: latest_db_date = "2026-01-08"
│
├─ 2. Wywołaj API Lotto.pl:
│   └─ await get_last_results_for_lotto()
│
├─ 3. Przetwórz odpowiedź:
│   └─ FOR EACH draw IN api_results:
│       ├─ parse_lotto_draw(draw)
│       ├─ IF draw_date > latest_db_date:
│       │   └─ Dodaj do bazy
│       └─ ELSE: pomiń (już mamy)
│
└─ 4. Zwróć raport:
    └─ {
        success: true,
        new_draws: 3,
        latest_draw_date: "2026-01-11",
        message: "Successfully synced 3 new draw(s)"
      }
```

### 3️⃣ API Lotto.pl zwraca dane

```
lotto_api.py
│
├─ get_last_results_for_lotto()
│   │
│   ├─ Sprawdź klucz API w .env
│   │   └─ LOTTO_API_SECRET_KEY
│   │
│   ├─ Przygotuj request:
│   │   URL: https://developers.lotto.pl/api/open/v1/
│   │        lotteries/draw-results/last-results-per-game
│   │   Headers: {
│   │     "accept": "application/json",
│   │     "secret": "API_KEY"
│   │   }
│   │   Params: { "gameType": "Lotto" }
│   │
│   ├─ Wyślij request (httpx)
│   │
│   └─ Obsłuż odpowiedź:
│       ├─ 200 OK → Zwróć dane
│       ├─ 401 Unauthorized → Błędny klucz
│       ├─ 404 Not Found → Brak wyników
│       └─ Inne → LottoAPIError
│
└─ parse_lotto_draw(data)
    │
    ├─ Wyciągnij: results[0].numbers
    ├─ Wyciągnij: drawDate
    ├─ Wyciągnij: drawSystemId
    │
    └─ Zwróć: {
        numbers: [5,12,23,34,45,49],
        draw_date: "2026-01-11",
        draw_system_id: 12345
      }
```

### 4️⃣ Zapisz do bazy danych

```
Backend (main.py)
│
└─ FOR EACH parsed_draw:
    │
    ├─ Utwórz klucz: norm_key(numbers)
    │   └─ "05-12-23-34-45-49"
    │
    ├─ Sprawdź duplikat:
    │   └─ db.query(HistoricalDraw).filter_by(key=...).first()
    │   └─ IF exists: SKIP
    │
    └─ Dodaj nowy:
        └─ new_draw = HistoricalDraw(
            numbers=[5,12,23,34,45,49],
            key="05-12-23-34-45-49",
            source="2026-01-11"
          )
        └─ db.add(new_draw)
        └─ db.commit()
```

### 5️⃣ Frontend wyświetla wynik

```
Frontend (History.tsx)
│
├─ onSuccess(data):
│   │
│   ├─ IF data.success:
│   │   ├─ Pokaż Alert sukcesu
│   │   │   └─ "Successfully synced 3 new draw(s)"
│   │   │
│   │   ├─ Odśwież dane:
│   │   │   ├─ queryClient.invalidateQueries(['draws'])
│   │   │   └─ queryClient.invalidateQueries(['stats'])
│   │   │
│   │   └─ Auto-ukryj po 5s
│   │
│   └─ ELSE:
│       └─ Pokaż Alert błędu
│           └─ data.error
│
└─ onError(error):
    └─ Pokaż Alert błędu
        └─ "Błąd połączenia z API"
```

---

## 🎨 UI - Widok w Aplikacji

```
┌─────────────────────────────────────────────────────────────────┐
│  GetLos_T                                        👤 User        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📚 Historia                                                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [Wygenerowane Układy]  [Historyczne Losowania (127)] ✓ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Łącznie: 127 losowań                                          │
│                                                                 │
│  [🔄 Synchronizuj z Lotto.pl]  [🗑️ Usuń Wszystkie]           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ✅ Successfully synced 3 new draw(s) from Lotto.pl  [✖] │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 2026-01-11  ⚫ 5  12  23  34  45  49    Σ 168  [📋] [🗑] │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ 2026-01-09  ⚫ 3  17  28  31  42  50    Σ 171  [📋] [🗑] │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ 2026-01-07  ⚫ 8  14  25  36  44  47    Σ 174  [📋] [🗑] │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Strona 1    [25 ▼]     [◄◄] [◄] [1] [2] [►] [►►]            │
└─────────────────────────────────────────────────────────────────┘
```

### Stan przycisku podczas synchronizacji:

**Przed kliknięciem:**
```
┌────────────────────────────────────┐
│ 🔄 Synchronizuj z Lotto.pl        │
└────────────────────────────────────┘
```

**Podczas pobierania:**
```
┌────────────────────────────────────┐
│ ⏳ Synchronizacja...               │  (disabled, spinner)
└────────────────────────────────────┘
```

**Po sukcesie:**
```
┌──────────────────────────────────────────────────────┐
│ ✅ Successfully synced 3 new draw(s) from Lotto.pl  │
└──────────────────────────────────────────────────────┘
(Auto-znika po 5 sekundach)
```

**Po błędzie:**
```
┌──────────────────────────────────────────────────────┐
│ ❌ LOTTO_API_SECRET_KEY not configured              │
└──────────────────────────────────────────────────────┘
```

---

## 🔐 Autoryzacja - Jak Działa

```
Twoja aplikacja                     API Lotto.pl
     │                                   │
     │  1. REQUEST:                      │
     ├──────────────────────────────────▶│
     │  GET /last-results-per-game       │
     │  Headers:                         │
     │    accept: application/json       │
     │    secret: GNq0pdsAAW...bwg=     │ ◄── Klucz z .env
     │                                   │
     │  2. WERYFIKACJA:                  │
     │                              ┌────┴────┐
     │                              │ Sprawdź │
     │                              │  klucz  │
     │                              └────┬────┘
     │                                   │
     │  3a. VALID KEY (200 OK):          │
     │◀──────────────────────────────────┤
     │  {                                │
     │    drawSystemId: 12345,           │
     │    numbers: [...]                 │
     │  }                                │
     │                                   │
     │  3b. INVALID KEY (401):           │
     │◀──────────────────────────────────┤
     │  { error: "Unauthorized" }        │
     │                                   │
```

---

## 📊 Baza Danych - Co się Zapisuje

### Tabela: `historical_draws`

```sql
┌────┬────────────────────────────┬──────────────────────┬────────────┬────────────────────┐
│ id │ numbers                    │ key                  │ source     │ created_at         │
├────┼────────────────────────────┼──────────────────────┼────────────┼────────────────────┤
│ 1  │ [5,12,23,34,45,49]        │ 05-12-23-34-45-49   │ 2026-01-11 │ 2026-01-11 22:00  │
│ 2  │ [3,17,28,31,42,50]        │ 03-17-28-31-42-50   │ 2026-01-09 │ 2026-01-09 22:00  │
│ 3  │ [8,14,25,36,44,47]        │ 08-14-25-36-44-47   │ 2026-01-07 │ 2026-01-07 22:00  │
└────┴────────────────────────────┴──────────────────────┴────────────┴────────────────────┘
     ▲                             ▲                      ▲
     │                             │                      │
   Główne liczby              Unikalny klucz         Data losowania
   (JSON array)               (sortowane, zero-pad)  (z API Lotto.pl)
```

### Jak synchronizacja wykrywa nowe losowania:

```python
# 1. Pobierz ostatnią datę z bazy
latest_db_date = "2026-01-07"  # z pola 'source'

# 2. API Lotto.pl zwraca:
api_results = [
    { drawDate: "2026-01-11", ... },  # ✅ NOWSZE - dodaj
    { drawDate: "2026-01-09", ... },  # ✅ NOWSZE - dodaj
    { drawDate: "2026-01-07", ... },  # ❌ RÓWNE - pomiń
    { drawDate: "2026-01-05", ... },  # ❌ STARSZE - pomiń
]

# 3. Rezultat:
# Dodano 2 nowe losowania (2026-01-11, 2026-01-09)
```

---

## 🧪 Testowanie - Scenariusze

### ✅ Test 1: Bez klucza API
```
Akcja: Kliknij "Synchronizuj z Lotto.pl"
Oczekiwany rezultat: 
  ❌ Alert: "LOTTO_API_SECRET_KEY not configured"
```

### ✅ Test 2: Z nieprawidłowym kluczem
```
Akcja: Ustaw LOTTO_API_SECRET_KEY=nieprawidlowy_klucz
Oczekiwany rezultat:
  ❌ Alert: "Unauthorized: Invalid API key"
```

### ✅ Test 3: Z prawidłowym kluczem (baza pusta)
```
Akcja: Kliknij "Synchronizuj z Lotto.pl"
Oczekiwany rezultat:
  ✅ Alert: "Successfully synced X new draw(s)"
  ✅ Nowe losowania pojawiają się na liście
```

### ✅ Test 4: Z prawidłowym kluczem (baza aktualna)
```
Akcja: Kliknij "Synchronizuj z Lotto.pl" drugi raz
Oczekiwany rezultat:
  ✅ Alert: "Database is up to date. No new draws found."
```

### ✅ Test 5: Python test script
```bash
cd backend
python test_lotto_api.py
```
Oczekiwany output:
```
🧪 Test połączenia z API Lotto.pl
✅ Znaleziono klucz API: GNq0pdsAAW...
📡 Próba połączenia z API Lotto.pl...
✅ Pobrano 1 losowanie(ń)
--- Losowanie 1 ---
📅 Data: 2026-01-11
🎱 Liczby: 5, 12, 23, 34, 45, 49
🔑 ID: 12345
✅ Test zakończony pomyślnie!
```

---

## 📚 Dokumentacja - Gdzie Znaleźć Co

| Co potrzebujesz | Gdzie szukać |
|----------------|-------------|
| **Jak uzyskać klucz API** | `LOTTO_API_SYNC.md` sekcja "Jak uzyskać klucz API" |
| **Instalacja krok po kroku** | `INSTALLATION_GUIDE.md` |
| **Szybki start (6 kroków)** | `Quick_start_dev/LOTTO_SYNC_QUICKSTART.md` |
| **Rozwiązywanie problemów** | `LOTTO_API_SYNC.md` sekcja "Rozwiązywanie problemów" |
| **Kod API klienta** | `backend/lotto_api.py` |
| **Endpoint backendu** | `backend/main.py` linia ~520 (`/sync-lotto`) |
| **Przycisk w UI** | `frontend/src/pages/History.tsx` linia ~245 |
| **Dokumentacja API Lotto.pl** | https://developers.lotto.pl/ |
| **To podsumowanie** | `SUMMARY_FOR_USER.md` |

---

## 🎯 Następne Kroki (Co dalej?)

1. **Zainstaluj httpx**
   ```bash
   pip install httpx==0.27.0
   ```

2. **Wyślij prośbę o API key**
   - Email: kontakt@lotto.pl
   - Formularz: https://www.lotto.pl/kontakt

3. **Przetestuj (gdy otrzymasz klucz)**
   ```bash
   python backend/test_lotto_api.py
   ```

4. **Używaj w aplikacji**
   - Kliknij przycisk "Synchronizuj z Lotto.pl"
   - Ciesz się automatyczną synchronizacją! 🎉

---

**Wszystko gotowe! 🚀**
