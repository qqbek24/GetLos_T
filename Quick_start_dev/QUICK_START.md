# GetLos_T - Quick Start Guide 🚀

## Szybkie Uruchomienie (5 minut)

### Wymagania
- Docker Desktop (Windows/Mac) lub Docker + Docker Compose (Linux)
- 2GB wolnego miejsca na dysku

### Krok 1: Pobierz Projekt
```bash
git clone https://github.com/youruser/GetLos_T.git
cd GetLos_T
```

### Krok 2: Uruchom
```bash
# Windows
start-dev.bat

# Linux/Mac
chmod +x start-dev.sh
./start-dev.sh

# Lub bezpośrednio Docker
docker-compose -f docker-compose.dev.yml up -d
```

### Krok 3: Otwórz Aplikację
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs

### Krok 4: Import Danych
1. Przygotuj plik CSV z historycznymi losowaniami
2. Przejdź do Dashboard
3. Kliknij "Wgraj CSV"
4. Wybierz plik

### Krok 5: Generuj Układy
1. Przejdź do "Generuj"
2. Wybierz strategię (np. Balanced)
3. Kliknij "Generuj"

Gotowe! 🎉

## Format CSV

```csv
Data Losowania,Liczba 1,Liczba 2,Liczba 3,Liczba 4,Liczba 5,Liczba 6
2024-01-01,5,12,23,34,41,49
2024-01-08,3,15,22,28,36,47
```

## Komendy Zarządzania

### Start
```bash
start-dev.bat          # Development mode
start-prod.bat         # Production mode
start-backend.bat      # Backend only
start-frontend.bat     # Frontend only
```

### Stop & Restart
```bash
stop-all.bat           # Stop everything
restart-all.bat        # Restart everything
restart-backend.bat    # Restart backend
restart-frontend.bat   # Restart frontend
```

### Logi
```bash
logs.bat               # All logs
logs-backend.bat       # Backend logs
logs-frontend.bat      # Frontend logs
```

## Troubleshooting

### Port Zajęty
```bash
# Sprawdź co zajmuje port
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Zabij proces
taskkill /PID <PID> /F
```

### Docker Nie Działa
```bash
# Restart Docker Desktop
# Lub rebuild containers
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

### Błędy Frontend
```bash
# Sprawdź logi
logs-frontend.bat

# Rebuild frontend
cd frontend
npm install
cd ..
docker-compose -f docker-compose.dev.yml up --build frontend
```

### Błędy Backend
```bash
# Sprawdź logi
logs-backend.bat

# Rebuild backend
cd backend
pip install -r requirements.txt
cd ..
docker-compose -f docker-compose.dev.yml up --build backend
```

## Lokalne Uruchomienie (bez Docker)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Następne Kroki

1. Przeczytaj [README.md](README.md) dla pełnej dokumentacji
2. Zobacz [API Docs](http://localhost:8000/docs) dla szczegółów API
3. Eksperymentuj z różnymi strategiami!

## Pomoc

Jeśli masz problemy:
1. Sprawdź logi: `logs.bat`
2. Przeczytaj [Troubleshooting](#troubleshooting)
3. Zobacz Backend logs: http://localhost:8000/docs
4. Otwórz Issue na GitHub

---

Powodzenia! 🍀
