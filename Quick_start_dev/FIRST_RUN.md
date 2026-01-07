# Pierwsze Uruchomienie GetLos_T 🚀

## Krok po Kroku

### 1. Sprawdź Wymagania
```bash
# Sprawdź Docker
docker --version
docker-compose --version
```

Jeśli nie masz Docker Desktop:
- Windows/Mac: Pobierz z https://www.docker.com/products/docker-desktop
- Linux: `sudo apt-get install docker docker-compose`

### 2. Uruchom Aplikację

#### Opcja A: Quick Start (Zalecana)
```bash
# Windows - kliknij dwukrotnie
start-dev.bat
```

#### Opcja B: Ręcznie
```bash
cd c:\Users\qqbek\Documents\GitHub\GetLos_T
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Sprawdź Status

Otwórz:
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:8000/docs

Powinieneś zobaczyć:
- Frontend: Dashboard aplikacji GetLos_T
- Backend: Swagger UI dokumentacja API

### 4. Import Danych Testowych

1. Przejdź na Dashboard (http://localhost:5173)
2. Kliknij "Wgraj CSV" lub przeciągnij plik
3. Przykładowy format CSV:

```csv
Data Losowania,Liczba 1,Liczba 2,Liczba 3,Liczba 4,Liczba 5,Liczba 6
2024-01-01,5,12,23,34,41,49
2024-01-08,3,15,22,28,36,47
2024-01-15,7,14,21,33,42,48
```

4. Poczekaj na import
5. Zobaczysz zaktualizowane statystyki

### 5. Wygeneruj Pierwsze Układy

1. Przejdź do "Generuj" (drugi tab)
2. Wybierz strategię (np. "Balanced")
3. Ustaw ilość: 3
4. Kliknij "Generuj"
5. Zobacz wyniki!

### 6. Eksploruj Funkcje

**Dashboard** - Główny panel
- Statystyki (liczba losowań, układów, unikalnych kombinacji)
- CSV upload
- Ostatnie wygenerowane układy

**Generuj** - Tworzenie nowych układów
- 5 strategii do wyboru
- Generowanie 1-10 układów naraz
- Kopiowanie do schowka

**Historia** - Przeglądanie danych
- Tab "Wygenerowane Układy" - Twoje prognozy
- Tab "Historyczne Losowania" - Wgrane dane CSV
- Usuwanie pojedynczych wpisów lub wszystkich

**Statystyki** - Analiza danych
- Częstotliwość liczb (1-49)
- Top 10 hot/cold numbers
- Najczęstsze pary i trójki

### 7. Zatrzymanie Aplikacji

```bash
# Kliknij dwukrotnie
stop-all.bat

# Lub ręcznie
docker-compose -f docker-compose.dev.yml down
```

### 8. Restart

```bash
# Restart wszystkiego
restart-all.bat

# Tylko backend
restart-backend.bat

# Tylko frontend
restart-frontend.bat
```

### 9. Zobacz Logi

```bash
# Wszystkie logi
logs.bat

# Tylko backend
logs-backend.bat

# Tylko frontend
logs-frontend.bat
```

## Troubleshooting

### Problem: Port 8000 zajęty
```bash
# Sprawdź co używa portu
netstat -ano | findstr :8000

# Zabij proces
taskkill /PID <numer_PID> /F

# Lub zmień port w docker-compose.dev.yml
```

### Problem: Port 5173 zajęty
```bash
# Sprawdź co używa portu
netstat -ano | findstr :5173

# Zabij proces
taskkill /PID <numer_PID> /F
```

### Problem: Docker nie działa
```bash
# Restart Docker Desktop (Windows/Mac)
# Sprawdź czy Docker Desktop jest uruchomiony

# Linux - restart service
sudo systemctl restart docker
```

### Problem: Kontenery nie startują
```bash
# Rebuild wszystkiego
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

### Problem: Frontend pokazuje błędy API
```bash
# Sprawdź czy backend działa
curl http://localhost:8000/docs

# Zobacz logi backendu
logs-backend.bat

# Restart backendu
restart-backend.bat
```

### Problem: Baza danych jest pusta
```bash
# Usuń starą bazę i zacznij od nowa
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up

# Wgraj dane CSV ponownie
```

## Podsumowanie Komend

| Komenda | Opis |
|---------|------|
| `start-dev.bat` | Uruchom development mode |
| `start-prod.bat` | Uruchom production mode |
| `stop-all.bat` | Zatrzymaj wszystko |
| `restart-all.bat` | Restart wszystkiego |
| `logs.bat` | Zobacz logi |
| `start-backend.bat` | Tylko backend |
| `start-frontend.bat` | Tylko frontend |

## Następne Kroki

1. Wgraj swoje historyczne dane CSV
2. Wypróbuj wszystkie 5 strategii
3. Porównaj wyniki
4. Sprawdź statystyki i częstotliwości
5. Generuj układy i kopiuj do schowka

## Pliki Konfiguracyjne

- `docker-compose.dev.yml` - Development setup
- `docker-compose.yml` - Production setup
- `frontend/package.json` - Frontend dependencies
- `backend/requirements.txt` - Backend dependencies

## Porty

- **5173** - Frontend (React + Vite)
- **8000** - Backend (FastAPI)

## Dane

Wszystkie dane są przechowywane w:
- SQLite database: `backend/data/getlos_dev.db`
- Docker volume: `backend_data_dev`

## Pomoc

Jeśli masz problemy:
1. Sprawdź sekcję Troubleshooting powyżej
2. Zobacz logi: `logs.bat`
3. Sprawdź Docker Desktop (czy kontenery są zielone)
4. Odwiedź http://localhost:8000/docs (API docs)
5. Przeczytaj README.md

---

**Gotowe do użycia!** 🎉

Powodzenia z aplikacją GetLos_T! 🍀
