# GetLos_T 🎲

Inteligentny system do przewidywania i analizy wyników losowań Lotto oparty na historycznych danych.

> 🚀 **[Quick Start → Quick_start_dev/](Quick_start_dev/)** | 📖 **[Backend Docs](backend/docs/)** | 📖 **[Frontend Docs](frontend/docs/)**

## 🚀 Stack Technologiczny

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: React 18 + TypeScript + Material UI + Vite
- **Docker**: Docker Compose dla łatwego wdrożenia
- **Style**: Material UI z custom gradient theme

## 📋 Funkcjonalności

### ✨ Główne Funkcje
- **5 Strategii Generowania**: Random, Hot Numbers, Cold Numbers, Balanced, Combo Based
- **Analiza Historyczna**: Częstotliwość liczb, najczęstsze pary i trójki
- **Import CSV**: Wgrywanie historycznych wyników losowań
- **Statystyki**: Wizualizacja częstotliwości, hot/cold numbers
- **Historia**: Przegląd wygenerowanych układów i historycznych losowań

### 🎯 Strategie

1. **Random** - Całkowicie losowy wybór liczb
2. **Hot Numbers** - Preferuje często występujące liczby w historii
3. **Cold Numbers** - Preferuje rzadko występujące liczby
4. **Balanced** - Mieszanka częstych i rzadkich liczb
5. **Combo Based** - Oparte na najczęstszych parach i trójkach z historii

## 🏃 Quick Start

📚 **[Szczegółowy przewodnik uruchomienia → Quick_start_dev/FIRST_RUN.md](Quick_start_dev/FIRST_RUN.md)**

### Metoda 1: Docker (Zalecana)

#### Development Mode
```bash
# Uruchom wszystko
Quick_start_dev\start-dev.bat

# Lub osobno:
Quick_start_dev\start-backend.bat
Quick_start_dev\start-frontend.bat

# Zatrzymaj wszystko
Quick_start_dev\stop-all.bat

# Restart
Quick_start_dev\restart-all.bat

# Logi
Quick_start_dev\logs.bat
```

> 💡 Wszystkie skrypty zarządzające znajdują się w folderze [`Quick_start_dev/`](Quick_start_dev/)

#### Production Mode
```bash
Quick_start_dev\start-prod.bat
```

### Metoda 2: Ręcznie (bez Docker)

📖 **[Dokumentacja Backend → backend/docs/README.md](backend/docs/README.md)**
📖 **[Dokumentacja Frontend → frontend/docs/README.md](frontend/docs/README.md)**

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Dostęp do Aplikacji

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 Struktura Projektu

```
GetLos_T/
├── backend/                 # FastAPI Backend
│   ├── docs/               # 📖 Backend Documentation
│   │   └── README.md       # API docs, endpoints, models
│   ├── main.py             # Główna aplikacja FastAPI
│   ├── models.py           # SQLAlchemy modele
│   ├── schema.py           # Pydantic schematy
│   ├── db.py               # Konfiguracja bazy danych
│   ├── requirements.txt    # Zależności Pythona
│   └── Dockerfile          # Dockerfile backendu
├── frontend/               # React Frontend
│   ├── docs/               # 📖 Frontend Documentation
│   │   └── README.md       # Components, pages, architecture
│   ├── src/
│   │   ├── components/    # Komponenty React
│   │   │   ├── Layout.tsx
│   │   │   └── NumbersBall.tsx
│   │   ├── pages/         # Strony aplikacji
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Generate.tsx
│   │   │   ├── History.tsx
│   │   │   └── Stats.tsx
│   │   ├── services/      # API client
│   │   │   └── api.ts
│   │   ├── types/         # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx        # Główny komponent
│   │   ├── main.tsx       # Entry point
│   │   └── theme.ts       # Material UI theme
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── Quick_start_dev/        # 🚀 Quick Start Scripts & Docs
│   ├── start-dev.bat      # Start development
│   ├── start-prod.bat     # Start production
│   ├── start-backend.bat  # Start backend only
│   ├── start-frontend.bat # Start frontend only
│   ├── stop-all.bat       # Stop all services
│   ├── restart-all.bat    # Restart all services
│   ├── restart-backend.bat
│   ├── restart-frontend.bat
│   ├── logs.bat           # View all logs
│   ├── logs-backend.bat
│   ├── logs-frontend.bat
│   ├── QUICK_START.md     # Quick start guide
│   ├── FIRST_RUN.md       # First run tutorial
│   └── MIGRATION_SUMMARY.md # Migration details
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
├── stop-all.bat           # Stop all services
│   ├── QUICK_START.md     # Quick start guide
│   ├── FIRST_RUN.md       # First run tutorial
│   └── MIGRATION_SUMMARY.md # Migration details
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
└── README.md              # This file
```

## 🛠️ Pliki Zarządzania

📂 **Wszystkie pliki zarządzające znajdują się w [`Quick_start_dev/`](Quick_start_dev/)**

### Start
- `start-dev.bat` - Uruchom tryb deweloperski (hot reload)
- `start-prod.bat` - Uruchom tryb produkcyjny
- `start-backend.bat` - Tylko backend
- `start-frontend.bat` - Tylko frontend

### Stop & Restart
- `stop-all.bat` - Zatrzymaj wszystkie serwisy
- `restart-all.bat` - Restart wszystkich serwisów
- `restart-backend.bat` - Restart backendu
- `restart-frontend.bat` - Restart frontendu

### Logs
- `logs.bat` - Zobacz logi wszystkich serwisów
- `logs-backend.bat` - Logi backendu
- `logs-frontend.bat` - Logi frontendu

📖 **[Pełna instrukcja → Quick_start_dev/QUICK_START.md](Quick_start_dev/QUICK_START.md)**

## 📊 API Endpoints

📖 **[Szczegółowa dokumentacja API → backend/docs/README.md](backend/docs/README.md)**

### Draws (Historyczne Losowania)
- `POST /draws/upload-csv` - Wgraj plik CSV z historią
- `GET /draws/` - Pobierz wszystkie losowania
- `GET /draws/{id}` - Pobierz konkretne losowanie
- `DELETE /draws/{id}` - Usuń losowanie
- `DELETE /draws/clear` - Usuń wszystkie losowania

### Picks (Wygenerowane Układy)
- `POST /picks/generate` - Generuj nowe układy
- `GET /picks/` - Pobierz wszystkie układy
- `GET /picks/{id}` - Pobierz konkretny układ
- `DELETE /picks/{id}` - Usuń układ
- `DELETE /picks/clear` - Usuń wszystkie układy

### Statistics
- `GET /stats/` - Pobierz pełne statystyki
- `POST /validate` - Waliduj układ liczb

## 🎨 Frontend - React Components

📖 **[Szczegółowa dokumentacja Frontend → frontend/docs/README.md](frontend/docs/README.md)**

### Pages
- **Dashboard**: Stats cards, CSV upload, quick actions, recent picks
- **Generate**: Strategy selection, count input, results display with copy/clear
- **History**: Tabs for picks/draws, delete functionality, clear all
- **Stats**: Frequency grid, hot/cold numbers visualization, pairs/triples

### Components
- **Layout**: AppBar with gradient, tabs navigation, footer
- **NumbersBall**: Reusable number display with size/gradient variants

### Services
- **api.ts**: Axios client with 10 typed API methods
- **types/index.ts**: TypeScript interfaces for all data models

## 🔧 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Docker Development
```bash
# Build and start
docker-compose -f docker-compose.dev.yml up --build

# Stop
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## 📝 Format CSV dla Importu

```csv
Data Losowania,Liczba 1,Liczba 2,Liczba 3,Liczba 4,Liczba 5,Liczba 6
2024-01-01,5,12,23,34,41,49
2024-01-08,3,15,22,28,36,47
...
```

**Uwagi:**
- Liczby muszą być w zakresie 1-49
- Data w formacie YYYY-MM-DD
- 6 unikalnych liczb w każdym rzędzie

## 🐛 Troubleshooting

### Docker Issues
```bash
# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build

# Remove volumes and rebuild
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build

# Check logs
logs.bat

# Check specific service
logs-backend.bat
logs-frontend.bat
```

### Port Conflicts
Jeśli porty 8000 lub 5173 są zajęte, edytuj `docker-compose.dev.yml`:
```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Zmień 8000 na inny
  frontend:
    ports:
      - "5174:5173"  # Zmień 5173 na inny
```

### Frontend nie łączy się z Backend
1. Sprawdź czy backend działa: http://localhost:8000/docs
2. Sprawdź `VITE_API_URL` w `docker-compose.dev.yml`
3. Zobacz logi: `logs-frontend.bat`

### Database Issues
```bash
# Usuń bazę danych i rozpocznij od nowa
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

## 📚 Dokumentacja API

Po uruchomieniu backendu dostępna jest interaktywna dokumentacja:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🎓 Jak używać

### 1. Wgraj Dane Historyczne
1. Przejdź do Dashboard
2. Kliknij "Wgraj CSV" lub przeciągnij plik
3. Poczekaj na import i analizę

### 2. Generuj Układy
1. Przejdź do "Generuj"
2. Wybierz strategię
3. Ustaw ilość układów (1-10)
4. Kliknij "Generuj"
5. Kopiuj do schowka lub zapisz

### 3. Przeglądaj Statystyki
1. Przejdź do "Statystyki"
2. Zobacz częstotliwość liczb
3. Sprawdź hot/cold numbers
4. Analizuj najczęstsze pary i trójki

### 4. Historia
1. Przejdź do "Historia"
2. Zobacz wszystkie wygenerowane układy
3. Przeglądaj historyczne losowania
4. Usuń niepotrzebne wpisy

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## � Dokumentacja

### Quick Start & Skrypty
- **[Quick_start_dev/](Quick_start_dev/)** - Wszystkie skrypty zarządzające i quick start guides
  - [FIRST_RUN.md](Quick_start_dev/FIRST_RUN.md) - Pierwsze uruchomienie
  - [QUICK_START.md](Quick_start_dev/QUICK_START.md) - Szybki start w 5 minut
  - [MIGRATION_SUMMARY.md](Quick_start_dev/MIGRATION_SUMMARY.md) - Detale migracji

### Dokumentacja Techniczna
- **[backend/docs/](backend/docs/)** - Dokumentacja Backend
  - API endpoints, modele, strategie, konfiguracja
- **[frontend/docs/](frontend/docs/)** - Dokumentacja Frontend
  - Komponenty React, strony, architektury, Material UI

## �📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Created with ❤️ for lottery enthusiasts

---

**Note**: Aplikacja służy celom rozrywkowym i edukacyjnym. Nie gwarantujemy wygranej w loterii! 🍀
