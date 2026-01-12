# Synchronizacja z API Lotto.pl

## Opis

Aplikacja GetLos_T posiada funkcję automatycznej synchronizacji wyników losowań Lotto z oficjalnego API Totalizatora Sportowego (Lotto.pl).

## Jak uzyskać klucz API

1. **Wyślij prośbę o dostęp** do API Lotto.pl:
   - Email: **kontakt@lotto.pl**
   - Lub przez formularz: https://www.lotto.pl/kontakt

2. **W wiadomości podaj**:
   - Imię i nazwisko
   - Nazwa firmy (jeśli dotyczy)
   - Adres email
   - Numer telefonu
   - Cel użycia API (np. "Aplikacja do analizy danych loterii")

3. **Otrzymasz klucz API** (przykład):
   ```
   GNq0pdsAAW2fPgXokLyZ4a8pJ1KEkKaj7kPICqQVbwg=
   ```

## Konfiguracja

### Backend

1. Utwórz plik `.env` w katalogu `backend/` (jeśli nie istnieje):
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Otwórz plik `backend/.env` i wpisz swój klucz API:
   ```env
   ENVIRONMENT=development
   DATABASE_URL=sqlite:///./data/app.db
   CORS_ORIGINS=["http://localhost:5173","http://localhost:80"]
   
   # Lotto.pl API Configuration
   LOTTO_API_SECRET_KEY=TwójKluczAPITutaj
   ```

3. Zainstaluj nowe zależności:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

   Lub bezpośrednio:
   ```bash
   pip install httpx==0.27.0
   ```

## Jak używać

### Z poziomu aplikacji (Frontend)

1. Otwórz aplikację w przeglądarce
2. Przejdź do zakładki **"Historia"**
3. Kliknij zakładkę **"Historyczne Losowania"**
4. Kliknij przycisk **"Synchronizuj z Lotto.pl"**

Aplikacja automatycznie:
- Sprawdzi najnowsze losowanie w Twojej bazie danych
- Pobierze nowsze wyniki z API Lotto.pl
- Doda brakujące losowania do historii

### Z poziomu API (Backend)

Możesz również wywołać endpoint bezpośrednio:

```bash
curl -X POST http://localhost:8001/sync-lotto
```

Odpowiedź:
```json
{
  "success": true,
  "new_draws": 3,
  "latest_draw_date": "2026-01-11",
  "message": "Successfully synced 3 new draw(s) from Lotto.pl"
}
```

## 📊 Struktura danych API

API Lotto.pl zwraca dane w formacie:

```json
[
  {
    "drawSystemId": 12345,
    "drawDate": "2026-01-11T21:40:00Z",
    "gameType": "Lotto",
    "results": [
      {
        "numbers": [5, 12, 23, 34, 45, 49]
      }
    ]
  }
]
```

Aplikacja automatycznie przetwarza te dane i zapisuje jako:
- `numbers`: Lista 6 liczb (1-52)
- `source`: Data losowania (YYYY-MM-DD)
- `key`: Unikalny klucz (np. "05-12-23-34-45-49")

## 🔍 Dostępne endpointy API Lotto.pl

Aplikacja wykorzystuje następujące endpointy:

### Ostatnie wyniki dla Lotto
```
GET https://developers.lotto.pl/api/open/v1/lotteries/draw-results/last-results-per-game?gameType=Lotto
```

### Wyniki dla określonej daty
```
GET https://developers.lotto.pl/api/open/v1/lotteries/draw-results/by-date?drawDate=2026-01-11T21:40:00Z
```

### Nagłówki wymagane przez API
```
accept: application/json
secret: TwójKluczAPI
```

## ❌ Rozwiązywanie problemów

### Błąd: "LOTTO_API_SECRET_KEY not configured"

**Przyczyna**: Brak klucza API w pliku `.env`

**Rozwiązanie**:
1. Sprawdź czy plik `backend/.env` istnieje
2. Upewnij się że dodałeś linię: `LOTTO_API_SECRET_KEY=TwójKlucz`
3. Zrestartuj backend

### Błąd: "Unauthorized: Invalid API key"

**Przyczyna**: Nieprawidłowy klucz API

**Rozwiązanie**:
1. Sprawdź czy klucz został poprawnie skopiowany (bez spacji)
2. Upewnij się że klucz jest aktywny
3. Skontaktuj się z Lotto.pl jeśli problem się powtarza

### Błąd: "Network error"

**Przyczyna**: Brak połączenia z API Lotto.pl

**Rozwiązanie**:
1. Sprawdź połączenie internetowe
2. Sprawdź czy API Lotto.pl jest dostępne: https://developers.lotto.pl/
3. Sprawdź firewall/proxy

### Komunikat: "No new results available"

**Przyczyna**: Baza danych jest aktualna

**Znaczenie**: Wszystkie dostępne wyniki są już w bazie danych. To normalne zachowanie gdy nie było nowych losowań od ostatniej synchronizacji.

## Dokumentacja API Lotto.pl

- Strona główna: https://developers.lotto.pl/
- Dokumentacja Swagger: https://developers.lotto.pl/swagger/index.html
- Autoryzacja: https://developers.lotto.pl/#section/Autoryzacja

## Bezpieczeństwo

**WAŻNE**:
- **NIE commituj** pliku `.env` do repozytorium Git
- Plik `.env` jest w `.gitignore` - nie będzie wysłany do GitHub
- Klucz API jest prywatny - nie udostępniaj go publicznie
- Każdy użytkownik musi uzyskać własny klucz API

## Kontakt

W razie pytań dotyczących API:
- Email: kontakt@lotto.pl
- Strona: https://www.lotto.pl/kontakt
