# Dokumentacja GetLos_T - Spis Treści

> **Centralny punkt dostępu do całej dokumentacji projektu**

## Start Szybki

| Dokument | Opis | Dla kogo |
|----------|------|----------|
| [FIRST_RUN.md](../Quick_start_dev/FIRST_RUN.md) | Pierwsze uruchomienie krok po kroku | Początkujący |
| [QUICK_START.md](../Quick_start_dev/QUICK_START.md) | Szybkie polecenia uruchomienia | Podstawowy |
| [README.md](../README.md) | Główna dokumentacja projektu | Wszyscy |

---

## Dokumentacja Modułów

### Backend
| Dokument | Opis |
|----------|------|
| [backend/docs/README.md](../backend/docs/README.md) | API, endpointy, modele danych |
| [backend/schema.py](../backend/schema.py) | Schematy Pydantic (request/response) |
| [backend/models.py](../backend/models.py) | Modele SQLAlchemy (baza danych) |
| [backend/main.py](../backend/main.py) | Główny plik aplikacji FastAPI |

### Frontend
| Dokument | Opis |
|----------|------|
| [frontend/docs/README.md](../frontend/docs/README.md) | Komponenty React, routing, styling |
| [frontend/src/types/index.ts](../frontend/src/types/index.ts) | TypeScript interfaces |
| [frontend/src/services/api.ts](../frontend/src/services/api.ts) | API client (TanStack Query) |

---

## Integracje i Funkcjonalności

### Synchronizacja z Lotto.pl API
| Dokument | Opis | Status |
|----------|------|--------|
| [LOTTO_API_SYNC.md](LOTTO_API_SYNC.md) | Pełna dokumentacja integracji API | ✅ Kompletna (200+ linii) |
| [Quick_start_dev/LOTTO_SYNC_QUICKSTART.md](../Quick_start_dev/LOTTO_SYNC_QUICKSTART.md) | 6-krokowy przewodnik konfiguracji | ⚡ Quick Start |
| [backend/lotto_api.py](../backend/lotto_api.py) | Kod klienta API | 💻 Implementacja |

**Kluczowe informacje:**
- Wymaga klucza API z kontakt@lotto.pl
- Automatyczne pobieranie wyników
- Detekcja duplikatów
- Endpoint: `POST /sync-lotto`

### Zarządzanie Danymi
| Dokument | Opis | Funkcje |
|----------|------|---------|
| [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md) | Zarządzanie historią losowań | 💾 Backup, Restore, Persistence |

**Główne funkcje:**
- Automatyczne zachowanie danych (SQLite)
- Ręczne dodawanie losowań
- Backup/Export do JSON
- Import z JSON
- Persistence między rebuildami Docker

---

## Instalacja i Wdrożenie

| Dokument | Opis |
|----------|------|
| [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) | Szczegółowy przewodnik instalacji |
| [DEPLOYMENT.md](../DEPLOYMENT.md) | Wdrożenie produkcyjne |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Jak kontrybuować do projektu |

---

## Docker

### Docker Compose Files
| Plik | Tryb | Opis |
|------|------|------|
| [docker-compose.yml](../docker-compose.yml) | **Production** | Stabilna wersja produkcyjna |
| [docker-compose.dev.yml](../docker-compose.dev.yml) | **Development** | Hot reload, debugging |

### Skrypty Zarządzające (Quick_start_dev/)
| Skrypt | Funkcja |
|--------|---------|
| `start-prod.bat` | Start produkcyjny (docker-compose.yml) |
| `start-backend.bat` | Start tylko backendu (dev) |
| `start-frontend.bat` | Start tylko frontendu (dev) |
| `restart-all.bat` | Restart wszystkich kontenerów |
| `stop-all.bat` | Stop wszystkich kontenerów |
| `logs.bat` | Wyświetl logi wszystkich serwisów |
| `logs-backend.bat` | Wyświetl logi backendu |
| `logs-frontend.bat` | Wyświetl logi frontendu |

**Dokumentacja skryptów:**
- [Quick_start_dev/INDEX.md](../Quick_start_dev/INDEX.md)

---

## Migracje i Historie Zmian

| Dokument | Opis |
|----------|------|
| [Quick_start_dev/MIGRATION_SUMMARY.md](../Quick_start_dev/MIGRATION_SUMMARY.md) | Historia migracji systemu |
| [Quick_start_dev/REORGANIZATION_SUMMARY.md](../Quick_start_dev/REORGANIZATION_SUMMARY.md) | Reorganizacja struktury projektu |
| [TODO.md](../TODO.md) | Planowane funkcje i zadania |

---

## Wizualizacje

| Dokument | Opis |
|----------|------|
| [VISUALIZATION.md](VISUALIZATION.md) | Diagramy architektury, flow API, UI mockupy |

---

## Podsumowania i Notatki

| Dokument | Opis |
|----------|------|
| [SUMMARY_FOR_USER.md](SUMMARY_FOR_USER.md) | Kompletne podsumowanie projektu dla użytkownika |
| [input from chat gpt - organized.md](../input%20from%20chat%20gpt%20-%20organized.md) | Notatki z ChatGPT |
| [docs/chat_GPT_input.md](chat_GPT_input.md) | Archiwum inputów z ChatGPT |

---

## Testowanie

| Plik | Opis |
|------|------|
| [backend/test_backend.py](../backend/test_backend.py) | Testy jednostkowe backendu |
| [backend/test_lotto_api.py](../backend/test_lotto_api.py) | Testy klienta API Lotto.pl |

---

## Jak używać tej dokumentacji?

### Dla nowych użytkowników:
1. Zacznij od [README.md](../README.md) - przegląd projektu
2. Przejdź do [FIRST_RUN.md](../Quick_start_dev/FIRST_RUN.md) - pierwsze uruchomienie
3. Jeśli chcesz API sync: [LOTTO_SYNC_QUICKSTART.md](../Quick_start_dev/LOTTO_SYNC_QUICKSTART.md)

### Dla deweloperów:
1. Backend: [backend/docs/README.md](../backend/docs/README.md)
2. Frontend: [frontend/docs/README.md](../frontend/docs/README.md)
3. API: [LOTTO_API_SYNC.md](LOTTO_API_SYNC.md)
4. Data: [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md)

### Dla użytkowników końcowych:
1. [QUICK_START.md](../Quick_start_dev/QUICK_START.md) - uruchomienie
2. [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md) - zarządzanie danymi
3. [SUMMARY_FOR_USER.md](SUMMARY_FOR_USER.md) - pełna instrukcja

### Dla administratorów:
1. [DEPLOYMENT.md](../DEPLOYMENT.md) - wdrożenie
2. [docker-compose.yml](../docker-compose.yml) - konfiguracja produkcyjna
3. [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) - instalacja

---

## Szukasz konkretnej informacji?

### Problem: "Jak uruchomić aplikację?"
→ [FIRST_RUN.md](../Quick_start_dev/FIRST_RUN.md) lub [QUICK_START.md](../Quick_start_dev/QUICK_START.md)

### Problem: "Jak skonfigurować API Lotto.pl?"
→ [LOTTO_SYNC_QUICKSTART.md](../Quick_start_dev/LOTTO_SYNC_QUICKSTART.md)

### Problem: "Dane znikają po rebuild"
→ [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md) - sekcja "Scenariusz 1: Rebuild aplikacji"

### Problem: "Jak dodać losowania ręcznie?"
→ [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md) - sekcja "Ręczne dodawanie losowań"

### Problem: "Jak zrobić backup danych?"
→ [DATA_MANAGEMENT.md](DATA_MANAGEMENT.md) - sekcja "Backup do pliku JSON"

### Problem: "CORS error w przeglądarce"
→ [LOTTO_API_SYNC.md](LOTTO_API_SYNC.md) - sekcja "Troubleshooting"

### Problem: "Jak przetestować API?"
→ [backend/docs/README.md](../backend/docs/README.md) - sekcja "API Testing"

### Problem: "Jak dodać nową strategię generowania?"
→ [backend/docs/README.md](../backend/docs/README.md) - sekcja "Algorithms"

---

## Wsparcie

- **Issues**: [GitHub Issues](https://github.com/qqbek24/GetLos_T/issues)
- **Dokumentacja kontrybucji**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Email Lotto.pl API**: kontakt@lotto.pl (dla klucza API)

---

## Mapa Projektu

```
GetLos_T/
├── docs/                             # Dokumentacja centralna
│   ├── INDEX.md                      # ← TEN PLIK (spis treści)
│   ├── LOTTO_API_SYNC.md            # Integracja API
│   ├── DATA_MANAGEMENT.md           # Zarządzanie danymi
│   ├── INSTALLATION_GUIDE.md        # Przewodnik instalacji
│   ├── SUMMARY_FOR_USER.md          # Podsumowanie dla użytkownika
│   ├── VISUALIZATION.md             # Diagramy
│   ├── API_EXAMPLES.md              # Przykłady API
│   ├── AUTO_FETCH_PLAN.md           # Plan auto-fetch
│   └── chat_GPT_input.md            # Notatki
│
├── backend/                          # Backend FastAPI
│   ├── docs/README.md               # Dokumentacja API
│   ├── main.py                      # Główna aplikacja
│   ├── models.py                    # Modele bazy danych
│   ├── schema.py                    # Schematy Pydantic
│   ├── db.py                        # Konfiguracja DB
│   ├── lotto_api.py                 # Klient API Lotto.pl
│   ├── test_backend.py              # Testy
│   ├── test_lotto_api.py            # Testy API
│   ├── requirements.txt             # Dependencje Python
│   └── data/
│       └── app.db                   # Baza SQLite
│
├── frontend/                         # Frontend React
│   ├── docs/README.md               # Dokumentacja UI
│   ├── src/
│   │   ├── App.tsx                  # Główny komponent
│   │   ├── pages/                   # Strony (Dashboard, History, etc.)
│   │   ├── components/              # Komponenty (Layout, NumbersBall)
│   │   ├── services/api.ts          # API client
│   │   └── types/index.ts           # TypeScript interfaces
│   └── package.json                 # Dependencje Node
│
├── Quick_start_dev/                  # Skrypty zarządzające
│   ├── INDEX.md                     # Spis skryptów
│   ├── FIRST_RUN.md                 # Pierwsze uruchomienie
│   ├── QUICK_START.md               # Quick start
│   ├── LOTTO_SYNC_QUICKSTART.md    # API sync quick start
│   ├── start-prod.bat               # Start produkcyjny
│   ├── start-backend.bat            # Start backend dev
│   ├── start-frontend.bat           # Start frontend dev
│   ├── restart-all.bat              # Restart wszystkich
│   ├── stop-all.bat                 # Stop wszystkich
│   └── logs*.bat                    # Logi
│
├── Docker/
│   ├── docker-compose.yml           # Production setup
│   ├── docker-compose.dev.yml       # Development setup
│   ├── backend/Dockerfile           # Backend image
│   └── frontend/Dockerfile          # Frontend image
│
└── README.md                         # Główna dokumentacja
```

---

**Ostatnia aktualizacja:** 2026-01-11  
**Wersja dokumentacji:** 2.0  
**Maintainer:** qqbek24
