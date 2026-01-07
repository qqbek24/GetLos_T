# Quick Start Scripts & Documentation 🚀

Ten folder zawiera wszystkie skrypty i dokumentację potrzebną do szybkiego uruchomienia i zarządzania aplikacją GetLos_T.

## 📂 Zawartość

### 🔧 Skrypty Zarządzające (.bat)

#### Start
- **`start-dev.bat`** - Uruchom w trybie development (hot reload, SQLite)
- **`start-prod.bat`** - Uruchom w trybie production
- **`start-backend.bat`** - Uruchom tylko backend
- **`start-frontend.bat`** - Uruchom tylko frontend

#### Stop & Restart
- **`stop-all.bat`** - Zatrzymaj wszystkie serwisy
- **`restart-all.bat`** - Zrestartuj wszystkie serwisy
- **`restart-backend.bat`** - Zrestartuj backend
- **`restart-frontend.bat`** - Zrestartuj frontend

#### Logs
- **`logs.bat`** - Zobacz logi wszystkich serwisów
- **`logs-backend.bat`** - Zobacz logi backendu
- **`logs-frontend.bat`** - Zobacz logi frontendu

### 📚 Dokumentacja

- **`FIRST_RUN.md`** - Przewodnik pierwszego uruchomienia krok po kroku
- **`QUICK_START.md`** - Szybki start w 5 minut
- **`MIGRATION_SUMMARY.md`** - Szczegóły migracji z Vue.js do React

## 🎯 Quick Start

### 1. Pierwsze Uruchomienie
```bash
# Kliknij dwukrotnie lub uruchom w terminalu
start-dev.bat
```

### 2. Sprawdź Status
- Frontend: http://localhost:5173
- Backend: http://localhost:8000/docs

### 3. Zatrzymaj
```bash
stop-all.bat
```

## 📖 Dokumentacja Szczegółowa

### Dla Nowych Użytkowników
1. Przeczytaj **[FIRST_RUN.md](FIRST_RUN.md)** - szczegółowy przewodnik
2. Zobacz **[QUICK_START.md](QUICK_START.md)** - szybki start

### Dla Developerów
1. **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)** - techniczne detale
2. **[../backend/docs/README.md](../backend/docs/README.md)** - dokumentacja backend
3. **[../frontend/docs/README.md](../frontend/docs/README.md)** - dokumentacja frontend

## 🔄 Typowe Scenariusze

### Uruchomienie Development
```bash
start-dev.bat
# Aplikacja działa z hot reload
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

### Restart Po Zmianach
```bash
# Tylko backend
restart-backend.bat

# Tylko frontend
restart-frontend.bat

# Wszystko
restart-all.bat
```

### Debugging
```bash
# Zobacz logi
logs.bat

# Tylko backend logs
logs-backend.bat

# Tylko frontend logs
logs-frontend.bat
```

### Zatrzymanie
```bash
stop-all.bat
```

## ⚙️ Wymagania

- **Docker Desktop** (Windows/Mac) lub Docker + Docker Compose (Linux)
- **2GB wolnego miejsca** na dysku
- **Porty**: 8000 (backend), 5173 (frontend)

## 🐛 Troubleshooting

### Port zajęty
```bash
# Sprawdź co zajmuje port
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Zabij proces
taskkill /PID <numer_PID> /F
```

### Docker nie działa
```bash
# Restart Docker Desktop
# Lub usuń kontenery i uruchom ponownie
stop-all.bat
start-dev.bat
```

### Błędy w logach
```bash
# Sprawdź logi
logs.bat

# Rebuild kontenerów
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

## 📝 Notatki

- Wszystkie skrypty używają **`docker-compose.dev.yml`** dla trybu development
- Tryb production używa **`docker-compose.yml`**
- Baza danych SQLite znajduje się w **`backend/data/`**
- Frontend używa **Vite** z hot reload
- Backend używa **Uvicorn** z auto-reload

## 🔗 Linki

- [Główny README](../README.md)
- [Backend Dokumentacja](../backend/docs/README.md)
- [Frontend Dokumentacja](../frontend/docs/README.md)
- [Docker Compose Dev](../docker-compose.dev.yml)
- [Docker Compose Prod](../docker-compose.yml)

## 💡 Wskazówki

1. **Zawsze uruchamiaj z poziomu głównego katalogu projektu**
2. **Używaj `logs.bat` do debugowania problemów**
3. **Restart często rozwiązuje problemy** - `restart-all.bat`
4. **Po zmianach w package.json/requirements.txt** - rebuild kontenerów
5. **Sprawdzaj Docker Desktop** - czy kontenery są zielone

---

**Powodzenia!** 🎉

Jeśli masz problemy, sprawdź:
1. [FIRST_RUN.md](FIRST_RUN.md) - rozwiązania typowych problemów
2. [QUICK_START.md](QUICK_START.md) - troubleshooting section
3. Docker Desktop logs
