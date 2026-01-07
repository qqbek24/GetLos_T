# Automatyczne Pobieranie Wyników - Plan Implementacji

## 🎯 Cel
Automatyczne pobieranie nowych wyników losowań z oficjalnych źródeł i dodawanie do bazy danych.

## 🔍 Źródła danych (do ustalenia)

**Do sprawdzenia:**
- Jakie jest źródło oficjalnych wyników losowań?
- Czy istnieje oficjalne API?
- Czy trzeba scrape'ować stronę WWW?
- Jak często odbywają się losowania? (np. 2x w tygodniu)

## 📋 Wymagania

1. **Scheduler** - uruchamianie w określonych dniach/godzinach
2. **Scraper/API Client** - pobieranie danych
3. **Parser** - ekstrakcja liczb z HTML/JSON
4. **Validator** - sprawdzenie czy dane są poprawne
5. **Deduplikator** - czy wynik już nie istnieje w bazie
6. **Logger** - rejestrowanie sukcesów/błędów
7. **Notifier** (opcjonalnie) - powiadomienia o nowych wynikach

## 🛠️ Technologie

### Opcja 1: APScheduler (Python)
```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.add_job(fetch_new_results, 'cron', day_of_week='wed,sat', hour=21)
scheduler.start()
```

### Opcja 2: Celery + Redis
- Bardziej zaawansowane
- Lepsze dla produkcji
- Wymaga Redis

### Opcja 3: Cron Job (Linux)
```bash
# /etc/crontab
0 21 * * 3,6 cd /path/to/app && python fetch_results.py
```

## 📁 Struktura plików

```
backend/
├── scheduler/
│   ├── __init__.py
│   ├── scheduler.py       # APScheduler setup
│   ├── fetcher.py         # Pobieranie danych
│   ├── parser.py          # Parsowanie
│   └── config.py          # Konfiguracja (URL, dni, etc)
├── main.py                # Dodać scheduler.start()
└── requirements.txt       # +APScheduler, requests, beautifulsoup4
```

## 🔧 Implementacja (Szkic)

### 1. Fetcher (`scheduler/fetcher.py`)

```python
import requests
from bs4 import BeautifulSoup
from typing import List, Optional

class ResultsFetcher:
    """Pobiera wyniki z oficjalnej strony"""
    
    def __init__(self, url: str):
        self.url = url
    
    def fetch_latest(self) -> Optional[List[int]]:
        """
        Pobierz najnowszy wynik losowania
        Returns: [num1, num2, num3, num4, num5, num6] lub None
        """
        try:
            response = requests.get(self.url, timeout=10)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # TODO: Zidentyfikować selektory CSS
            # Przykład (do dostosowania):
            numbers_elements = soup.select('.lottery-number')
            numbers = [int(el.text.strip()) for el in numbers_elements]
            
            if len(numbers) == 6 and all(1 <= n <= 52 for n in numbers):
                return sorted(numbers)
            
            return None
            
        except Exception as e:
            print(f"Error fetching results: {e}")
            return None
```

### 2. Scheduler (`scheduler/scheduler.py`)

```python
from apscheduler.schedulers.background import BackgroundScheduler
from .fetcher import ResultsFetcher
from models import HistoricalDraw, norm_key
from db import SessionLocal

class LotteryScheduler:
    """Scheduler do automatycznego pobierania wyników"""
    
    def __init__(self, url: str):
        self.fetcher = ResultsFetcher(url)
        self.scheduler = BackgroundScheduler()
    
    def fetch_and_save(self):
        """Pobierz i zapisz nowy wynik"""
        print("Fetching latest lottery results...")
        
        numbers = self.fetcher.fetch_latest()
        
        if not numbers:
            print("No new results found")
            return
        
        key = norm_key(numbers)
        
        # Zapisz do bazy
        db = SessionLocal()
        try:
            existing = db.query(HistoricalDraw).filter_by(key=key).first()
            
            if existing:
                print(f"Results {numbers} already exist")
            else:
                new_draw = HistoricalDraw(
                    numbers=numbers,
                    key=key,
                    source="auto_fetch"
                )
                db.add(new_draw)
                db.commit()
                print(f"✅ New results saved: {numbers}")
                
        except Exception as e:
            print(f"Error saving results: {e}")
            db.rollback()
        finally:
            db.close()
    
    def start(self):
        """Start scheduler"""
        # Losowania np. w środę i sobotę o 21:00
        self.scheduler.add_job(
            self.fetch_and_save,
            'cron',
            day_of_week='wed,sat',
            hour=21,
            minute=5
        )
        
        # Opcjonalnie: test job co 1h (development)
        # self.scheduler.add_job(self.fetch_and_save, 'interval', hours=1)
        
        self.scheduler.start()
        print("🚀 Lottery scheduler started")
    
    def stop(self):
        """Stop scheduler"""
        self.scheduler.shutdown()
```

### 3. Integracja w main.py

```python
# main.py
from scheduler.scheduler import LotteryScheduler

# ... reszta kodu ...

# Konfiguracja
LOTTERY_URL = "https://example.com/lottery/results"  # TODO: Rzeczywisty URL
lottery_scheduler = None

@app.on_event("startup")
def startup_event():
    """Initialize database and scheduler on startup"""
    init_db()
    
    # Start scheduler
    global lottery_scheduler
    lottery_scheduler = LotteryScheduler(LOTTERY_URL)
    lottery_scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    """Stop scheduler on shutdown"""
    if lottery_scheduler:
        lottery_scheduler.stop()

# Opcjonalny endpoint do manualnego triggera
@app.post("/admin/fetch-results")
def manual_fetch():
    """Manually trigger results fetch"""
    if lottery_scheduler:
        lottery_scheduler.fetch_and_save()
        return {"message": "Fetch triggered"}
    return {"error": "Scheduler not running"}
```

### 4. Requirements

```txt
# Dodać do requirements.txt
APScheduler==3.10.4
beautifulsoup4==4.12.2
requests==2.31.0
```

## 🧪 Testowanie

```python
# test_fetcher.py
def test_fetcher():
    fetcher = ResultsFetcher("URL")
    results = fetcher.fetch_latest()
    assert results is not None
    assert len(results) == 6
    assert all(1 <= n <= 52 for n in results)
```

## 📝 Konfiguracja

```python
# scheduler/config.py
LOTTERY_CONFIG = {
    "url": "https://example.com/lottery",
    "schedule": {
        "day_of_week": "wed,sat",  # Środa i sobota
        "hour": 21,
        "minute": 5
    },
    "retry": {
        "max_attempts": 3,
        "delay_seconds": 60
    }
}
```

## 🚦 Etapy Implementacji

1. **Research** (1-2h)
   - [ ] Znaleźć oficjalne źródło danych
   - [ ] Sprawdzić strukturę HTML/API
   - [ ] Zidentyfikować selektory CSS lub API endpoints

2. **Basic Fetcher** (2h)
   - [ ] Implementacja fetcher.py
   - [ ] Testy manualne
   - [ ] Walidacja danych

3. **Scheduler Setup** (1h)
   - [ ] APScheduler konfiguracja
   - [ ] Integracja z main.py
   - [ ] Test na development

4. **Error Handling** (1h)
   - [ ] Retry logic
   - [ ] Logging
   - [ ] Notyfikacje przy błędach

5. **Testing** (1h)
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] Monitoring w produkcji

## 🔐 Bezpieczeństwo

- [ ] Rate limiting (żeby nie DDOSować źródła)
- [ ] User-Agent header
- [ ] Timeout dla requestów
- [ ] Error handling
- [ ] Logging wszystkich fetch attempts

## 📈 Monitoring

```python
# Dodać endpoint do sprawdzania statusu
@app.get("/admin/scheduler-status")
def scheduler_status():
    return {
        "running": lottery_scheduler is not None,
        "next_run": lottery_scheduler.scheduler.get_jobs()[0].next_run_time if lottery_scheduler else None,
        "last_fetch": "..."  # Z bazy danych
    }
```

## 💡 Uwagi

1. **Respect robots.txt** - sprawdź czy strona pozwala na scraping
2. **Oficjalne API** - jeśli istnieje, użyj zamiast scrapingu
3. **Backup plan** - manualny upload CSV jako fallback
4. **Timezone** - ustaw prawidłową strefę czasową dla schedulera

---

## 🎯 Następne kroki

1. **Zbadaj źródło danych** - jaka jest oficjalna strona z wynikami?
2. **Zaimplementuj prototyp** - podstawowy fetcher
3. **Testuj** - upewnij się że działa stabilnie
4. **Deploy** - uruchom na produkcji

---

**Status:** 📋 Planowanie  
**Priorytet:** ⭐⭐⭐ Średni (po basic features)  
**Estymacja:** 6-8 godzin pracy
