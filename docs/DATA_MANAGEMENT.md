# Zarządzanie Danymi - Historia Losowań

## Podsumowanie

Aplikacja **automatycznie zachowuje** wszystkie dane losowań między rebuildami. Dodatkowo oferuje:

1. Automatyczna synchronizacja z API Lotto.pl
2. Ręczne dodawanie losowań
3. Backup/Restore do pliku JSON
4. Trwałe przechowywanie w SQLite

---

## Gdzie są przechowywane dane?

### Lokalizacja bazy danych:
```
backend/data/app.db
```

Ta baza danych SQLite **automatycznie się zachowuje** między uruchomieniami aplikacji.

### Co jest przechowywane:
- **Historyczne losowania** (`historical_draws`)
- **Wygenerowane układy** (`picks`)
- **Metadane** (daty, źródła, klucze)

---

## Metody zarządzania danymi

### 1. **Synchronizacja z API Lotto.pl** (Automatyczna)

**W aplikacji:**
1. Otwórz zakładkę **Historia** → **Historyczne Losowania**
2. Kliknij **"Synchronizuj z Lotto.pl"**
3. Aplikacja pobierze najnowsze wyniki

**API Endpoint:**
```bash
POST http://localhost:8001/sync-lotto
```

**Jak działa:**
- Sprawdza ostatnią datę w bazie
- Pobiera nowsze wyniki z API
- Dodaje tylko brakujące losowania
- Pomija duplikaty

---

### 2. **Ręczne dodawanie losowań** 🆕

Użyj gdy:
- Synchronizacja API nie działa
- Masz wyniki z innego źródła
- Chcesz dodać starsze dane

**W aplikacji:**
1. Historia → Historyczne Losowania
2. Kliknij **"Dodaj ręcznie"**
3. Wpisz 6 liczb (np. `5, 12, 23, 34, 45, 49`)
4. (Opcjonalnie) Dodaj datę `RRRR-MM-DD`
5. Kliknij **"Dodaj"**

**API Endpoint:**
```bash
POST http://localhost:8001/manual-draw
Content-Type: application/json

{
  "draws": [
    {
      "numbers": [5, 12, 23, 34, 45, 49],
      "date": "2024-01-15"
    },
    {
      "numbers": [3, 17, 28, 31, 42, 50],
      "date": "2024-01-12"
    }
  ]
}
```

**Odpowiedź:**
```json
{
  "success": true,
  "total_processed": 2,
  "new_draws": 2,
  "duplicates": 0,
  "message": "Successfully added 2 new draw(s), 0 duplicate(s) skipped"
}
```

---

### 3. **Backup do pliku JSON** 🆕

**W aplikacji:**
1. Historia → Historyczne Losowania
2. Kliknij **"Backup"**
3. Plik `lotto-backup-YYYY-MM-DD.json` zostanie pobrany

**API Endpoint:**
```bash
GET http://localhost:8001/export-draws
```

**Format pliku backup:**
```json
{
  "success": true,
  "count": 127,
  "draws": [
    {
      "numbers": [5, 12, 23, 34, 45, 49],
      "date": "2024-01-15",
      "created_at": "2024-01-15T22:00:00"
    }
  ],
  "exported_at": "2024-01-16T10:30:00"
}
```

---

### 4. **Restore z pliku JSON** 🆕

**API Endpoint:**
```bash
POST http://localhost:8001/import-draws
Content-Type: application/json

{
  "draws": [
    {
      "numbers": [5, 12, 23, 34, 45, 49],
      "date": "2024-01-15"
    }
  ]
}
```

**Odpowiedź:**
```json
{
  "success": true,
  "count": 127,
  "message": "Successfully imported 127 draw(s)"
}
```

---

## Scenariusze użycia

### Scenariusz 1: Rebuild aplikacji (Docker/Vite)

**Problem:** Obawa o utratę danych po rebuild

**Rozwiązanie:** 
Dane są **automatycznie zachowane** w `backend/data/app.db`
- Plik bazy SQLite nie jest usuwany przy rebuild
- Wszystkie losowania pozostają nietknięte

**Weryfikacja:**
```bash
# Sprawdź czy plik istnieje
ls backend/data/app.db

# Sprawdź rozmiar (jeśli > 0, dane są)
du -h backend/data/app.db
```

---

### Scenariusz 2: Synchronizacja API nie działa przez kilka dni

**Problem:** API Lotto.pl było niedostępne przez 3 dni, brakuje wyników

**Rozwiązanie:**

**Opcja A: Automatyczna synchronizacja (gdy API działa)**
1. Kliknij "Synchronizuj z Lotto.pl"
2. Aplikacja automatycznie pobierze wszystkie brakujące wyniki

**Opcja B: Ręczne dodanie**
1. Znajdź wyniki na stronie Lotto.pl lub w innych źródłach
2. Użyj przycisku "Dodaj ręcznie"
3. Wprowadź liczby i datę dla każdego losowania

---

### Scenariusz 3: Przeniesienie danych na inny komputer

**Problem:** Chcę przenieść historię losowań na inny komputer

**Rozwiązanie:**

**Metoda 1: Kopiowanie bazy danych**
```bash
# Na starym komputerze
cp backend/data/app.db ~/lotto-backup.db

# Przenieś plik na nowy komputer (USB/email/cloud)

# Na nowym komputerze
cp ~/lotto-backup.db backend/data/app.db
```

**Metoda 2: Backup JSON**
1. Stary komputer: Kliknij "Backup" → pobierz JSON
2. Przenieś plik JSON
3. Nowy komputer: 
   ```bash
   curl -X POST http://localhost:8001/import-draws \
     -H "Content-Type: application/json" \
     -d @lotto-backup-2024-01-15.json
   ```

---

### Scenariusz 4: Usunięcie całej bazy przez pomyłkę

**Problem:** Przypadkowo usunąłem wszystkie dane

**Rozwiązanie:**

**Jeśli masz backup:**
1. Użyj endpoint `/import-draws` z plikiem backup JSON
2. Lub skopiuj stary plik `app.db`

**Jeśli nie masz backup:**
1. Uruchom synchronizację z API - pobierze ostatnie wyniki
2. Dla starszych danych: użyj CSV import lub ręcznego dodawania

---

## Struktura bazy danych

### Tabela: `historical_draws`

| Kolumna | Typ | Opis |
|---------|-----|------|
| `id` | INTEGER | Unikalny identyfikator |
| `numbers` | JSON | Lista 6 liczb [5,12,23,34,45,49] |
| `key` | STRING | Klucz unikalności "05-12-23-34-45-49" |
| `source` | STRING | Data losowania lub źródło ("2024-01-15") |
| `created_at` | DATETIME | Data dodania do bazy |

### Indeksy:
- `key` - UNIQUE (zapobiega duplikatom)
- `id` - PRIMARY KEY

---

## Bezpieczeństwo danych

### Automatyczne zabezpieczenia:

1. **Unikalne klucze** - Niemożliwe dodanie duplikatów
   ```python
   key = "05-12-23-34-45-49"  # Sortowane, zero-padded
   ```

2. **Walidacja danych** - Backend sprawdza:
   - Czy jest dokładnie 6 liczb
   - Czy liczby są w zakresie 1-52
   - Czy wszystkie są unikalne

3. **Transakcje SQLite** - Atomowość operacji
   - Albo wszystkie dane się zapisują
   - Albo żadne (w przypadku błędu)

---

## Testowanie

### Test 1: Sprawdź czy dane się zachowują

```bash
# 1. Dodaj losowanie
curl -X POST http://localhost:8001/manual-draw \
  -H "Content-Type: application/json" \
  -d '{"draws":[{"numbers":[1,2,3,4,5,6],"date":"2024-01-01"}]}'

# 2. Zrestartuj backend
# Ctrl+C i ponownie: uvicorn main:app --reload

# 3. Sprawdź czy dane są
curl http://localhost:8001/draws
```

### Test 2: Backup i Restore

```bash
# 1. Eksport
curl http://localhost:8001/export-draws > backup.json

# 2. Usuń wszystkie dane
curl -X DELETE http://localhost:8001/draws/all

# 3. Import
curl -X POST http://localhost:8001/import-draws \
  -H "Content-Type: application/json" \
  -d @backup.json

# 4. Sprawdź
curl http://localhost:8001/draws
```

---

## FAQ

### Czy muszę robić backup ręcznie?

**Nie** - baza SQLite automatycznie się zachowuje w pliku `backend/data/app.db`.  
Backup JSON jest opcjonalny - użyteczny do:
- Przenoszenia danych
- Archiwizacji
- Współdzielenia z innymi

### Co się stanie przy rebuild Docker?

Jeśli używasz **Docker volumes** (jak w `docker-compose.yml`):
```yaml
volumes:
  - ./backend/data:/app/data
```
Dane **są zachowane** - volume montuje lokalny folder.

### Czy mogę edytować bazę danych ręcznie?

**Tak**, ale ostrożnie:
```bash
sqlite3 backend/data/app.db

# Przykłady:
SELECT COUNT(*) FROM historical_draws;
SELECT * FROM historical_draws ORDER BY source DESC LIMIT 10;
DELETE FROM historical_draws WHERE id = 123;
```

### Jak duża może być baza?

SQLite obsługuje:
- Do **281 TB** danych
- Miliony rekordów

Dla Lotto (2-3 losowania tygodniowo):
- Rok: ~150 rekordów
- 10 lat: ~1500 rekordów
- Rozmiar: **kilka KB** do **kilku MB**

---

## Rozwiązywanie problemów

### Problem: Baza danych nie istnieje

```bash
# Sprawdź
ls -la backend/data/

# Jeśli brak folderu:
mkdir -p backend/data

# Uruchom backend - baza zostanie utworzona automatycznie
cd backend
uvicorn main:app --reload
```

### Problem: "Database is locked"

```bash
# Sprawdź czy nie działa druga instancja backendu
ps aux | grep uvicorn

# Zamknij wszystkie:
pkill -f uvicorn

# Uruchom ponownie
uvicorn main:app --reload
```

### Problem: Duplikaty w bazie

```bash
# Backend automatycznie pomija duplikaty
# Jeśli chcesz wyczyścić ręcznie:

sqlite3 backend/data/app.db
DELETE FROM historical_draws 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM historical_draws 
  GROUP BY key
);
```

---

## Zobacz też

- [LOTTO_API_SYNC.md](LOTTO_API_SYNC.md) - Synchronizacja z API
- [README.md](README.md) - Dokumentacja główna
- [backend/docs/README.md](backend/docs/README.md) - Dokumentacja backendu
