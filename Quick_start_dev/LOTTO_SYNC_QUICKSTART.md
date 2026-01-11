# ⚡ Szybki Start - Synchronizacja z Lotto.pl

## 1️⃣ Uzyskaj klucz API (jednorazowo)

Napisz email na **kontakt@lotto.pl** lub użyj formularza: https://www.lotto.pl/kontakt

Podaj:
- Imię i nazwisko
- Email
- Telefon
- Cel: "Aplikacja do analizy danych loterii"

Otrzymasz klucz API przykładowo:
```
GNq0pdsAAW2fPgXokLyZ4a8pJ1KEkKaj7kPICqQVbwg=
```

## 2️⃣ Skonfiguruj aplikację

### Opcja A: Ręcznie

1. Skopiuj przykładowy plik konfiguracyjny:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Otwórz `backend/.env` i wklej swój klucz:
   ```env
   LOTTO_API_SECRET_KEY=TwójKluczAPITutaj
   ```

### Opcja B: Z linii komend

**Windows (PowerShell):**
```powershell
cd backend
Copy-Item .env.example .env
Add-Content .env "`nLOTTO_API_SECRET_KEY=TwójKluczAPITutaj"
```

**Linux/Mac:**
```bash
cd backend
cp .env.example .env
echo "LOTTO_API_SECRET_KEY=TwójKluczAPITutaj" >> .env
```

## 3️⃣ Zainstaluj zależności

```bash
cd backend
pip install httpx==0.27.0
```

Lub zainstaluj wszystkie:
```bash
pip install -r requirements.txt
```

## 4️⃣ Przetestuj połączenie

```bash
cd backend
python test_lotto_api.py
```

Powinieneś zobaczyć:
```
✅ Pobrano X losowanie(ń)
📅 Data: 2026-01-11
🎱 Liczby: 5, 12, 23, 34, 45, 49
```

## 5️⃣ Uruchom aplikację

```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload --port 8001

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 6️⃣ Synchronizuj wyniki

1. Otwórz aplikację: http://localhost:5173
2. Przejdź do **Historia** → **Historyczne Losowania**
3. Kliknij **"Synchronizuj z Lotto.pl"**

✅ Gotowe! Brakujące wyniki zostały pobrane.

## 🔧 Rozwiązywanie problemów

### Problem: "LOTTO_API_SECRET_KEY not configured"
➡️ Sprawdź czy plik `backend/.env` istnieje i zawiera klucz

### Problem: "Unauthorized: Invalid API key"
➡️ Sprawdź czy klucz w `.env` jest poprawny (bez spacji)

### Problem: "No new results available"
➡️ To normalne - baza jest aktualna, nie ma nowych losowań

## 📚 Więcej informacji

Zobacz pełną dokumentację: [LOTTO_API_SYNC.md](LOTTO_API_SYNC.md)
