# Przewodnik Instalacji - Synchronizacja z Lotto.pl

## Co zostało dodane

### Nowe pliki:
```
backend/
  ├── lotto_api.py              NOWY - Klient API Lotto.pl
  ├── test_lotto_api.py         NOWY - Skrypt testowy
  └── .env                      NOWY - Plik konfiguracyjny

docs/
  ├── LOTTO_API_SYNC.md         NOWY - Pełna dokumentacja
  └── Quick_start_dev/
      └── LOTTO_SYNC_QUICKSTART.md  NOWY - Szybki start
```

### Zmodyfikowane pliki:
```
backend/
  ├── .env.example              Dodano LOTTO_API_SECRET_KEY
  ├── requirements.txt          Dodano httpx
  ├── main.py                   Dodano endpoint /sync-lotto
  └── schema.py                 Dodano SyncLottoResponse

frontend/
  ├── src/types/index.ts        Dodano SyncLottoResponse
  ├── src/services/api.ts       Dodano syncLottoResults()
  └── src/pages/History.tsx     Dodano przycisk synchronizacji

README.md                       Aktualizacja dokumentacji
```

## Instalacja

### Krok 1: Zaktualizuj kod

Jeśli używasz Git:
```bash
git pull origin dev
```

Lub pobierz ręcznie zmodyfikowane pliki.

### Krok 2: Zainstaluj nowe zależności backendu

```bash
cd backend
pip install httpx==0.27.0
```

Lub zainstaluj wszystkie zależności ponownie:
```bash
pip install -r requirements.txt
```

### Krok 3: Skonfiguruj klucz API (opcjonalne na razie)

Plik `backend/.env` został już utworzony z domyślnymi wartościami.

**Gdy otrzymasz klucz API od Lotto.pl:**

1. Otwórz `backend/.env`
2. Znajdź linię: `LOTTO_API_SECRET_KEY=your_api_key_here`
3. Zamień `your_api_key_here` na swój prawdziwy klucz

### Krok 4: Przetestuj instalację

#### Test 1: Uruchom backend
```bash
cd backend
uvicorn main:app --reload --port 8001
```

Sprawdź czy nie ma błędów przy starcie.

#### Test 2: Sprawdź endpoint
Otwórz: http://localhost:8001/docs

Powinieneś zobaczyć nowy endpoint: `POST /sync-lotto`

#### Test 3: Test API (gdy masz klucz)
```bash
cd backend
python test_lotto_api.py
```

### Krok 5: Przetestuj frontend

1. Uruchom frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Otwórz aplikację: http://localhost:5173

3. Przejdź do **Historia** → **Historyczne Losowania**

4. Sprawdź czy widzisz przycisk **"Synchronizuj z Lotto.pl"**

## 🧪 Testowanie bez klucza API

**Możesz już teraz przetestować całą funkcjonalność** (bez rzeczywistego pobierania danych):

1. Kliknij przycisk "Synchronizuj z Lotto.pl"
2. Powinieneś zobaczyć komunikat błędu:
   ```
   LOTTO_API_SECRET_KEY not configured.
   Get your API key from kontakt@lotto.pl
   ```

To jest **poprawne zachowanie** - oznacza że wszystko działa, tylko brakuje klucza API.

## 📋 Checklist

- [ ] ✅ Zainstalowano httpx (`pip list | grep httpx`)
- [ ] ✅ Backend uruchamia się bez błędów
- [ ] ✅ Endpoint `/sync-lotto` widoczny w dokumentacji API
- [ ] ✅ Frontend wyświetla przycisk "Synchronizuj z Lotto.pl"
- [ ] ✅ Kliknięcie przycisku pokazuje komunikat o braku klucza
- [ ] ⏳ Wysłano prośbę o klucz API do Lotto.pl
- [ ] ⏳ Otrzymano klucz API i dodano do `.env`
- [ ] ⏳ Test `test_lotto_api.py` przeszedł pomyślnie
- [ ] ⏳ Synchronizacja działa i pobiera wyniki

## 🆘 Rozwiązywanie problemów

### ImportError: No module named 'httpx'

```bash
pip install httpx==0.27.0
```

### ModuleNotFoundError: No module named 'lotto_api'

Upewnij się że uruchamiasz backend z katalogu `backend/`:
```bash
cd backend
python -m uvicorn main:app --reload
```

### Przycisk synchronizacji nie pojawia się

1. Sprawdź czy frontend został przeładowany
2. Wyczyść cache przeglądarki (Ctrl+Shift+R)
3. Sprawdź konsolę przeglądarki (F12) czy są błędy

### Backend nie startuje

1. Sprawdź czy wszystkie zależności są zainstalowane:
   ```bash
   pip install -r requirements.txt
   ```

2. Sprawdź czy plik `.env` istnieje w `backend/`

3. Sprawdź logi błędów

## 📞 Kontakt do Lotto.pl

Aby uzyskać klucz API:
- **Email**: kontakt@lotto.pl
- **Formularz**: https://www.lotto.pl/kontakt
- **Dokumentacja**: https://developers.lotto.pl/

W wiadomości podaj:
- Imię i nazwisko
- Nazwa firmy (opcjonalnie)
- Email
- Telefon
- Cel: "Aplikacja do analizy danych loterii"

---

## 🎉 Gotowe!

Po wykonaniu tych kroków:
- ✅ Kod jest zaktualizowany
- ✅ Zależności są zainstalowane
- ✅ Aplikacja działa
- ⏳ Czekasz na klucz API

Gdy otrzymasz klucz - wpisz go do `.env` i wszystko będzie działać! 🚀
