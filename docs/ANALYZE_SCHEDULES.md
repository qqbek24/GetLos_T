# Analiza Harmonogramów Losowań

## Pliki

### `analyze_schedules.py`
Skrypt do analizy historycznych harmonogramów na podstawie danych w bazie.

**Funkcjonalność:**
- Pobiera wszystkie losowania z API
- Analizuje dni tygodnia dla każdej daty
- Automatycznie detektuje zmiany harmonogramu
- Zapisuje wyniki do pliku `backend/draw_schedules.yaml`

**Uruchomienie:**
```bash
python analyze_schedules.py
```

**Wynik:**
- Plik `backend/draw_schedules.yaml` zawiera wszystkie odkryte harmonogramy
- Harmonogramy są automatycznie ładowane przy starcie aplikacji

### `add_all_schedules.py`
Skrypt do dodania harmonogramów z YAML do API (opcjonalnie).

**Użycie:**
```bash
python add_all_schedules.py
```

Harmonogramy są automatycznie ładowane z YAML przy starcie backend, więc ten skrypt jest opcjonalny.

### `cleanup.py`
Skrypt do usunięcia zbędnych plików.

**Uruchomienie:**
```bash
python cleanup.py
```

## Harmonogramy

Plik `backend/draw_schedules.yaml` zawiera 6 harmonogramów na przestrzeni 69 lat:

| Period | Dni | Liczba Losowań |
|--------|-----|---|
| 1957-01-27 → 1984-03-24 | Niedziela (6) | ~270 |
| 1984-03-25 → 1984-06-23 | Sob, Ndz (5,6) | ~26 |
| 1984-06-24 → 1991-09-14 | Sobota (5) | ~240 |
| 1991-09-15 → 2007-08-25 | Śr, So (2,5) | ~2100 |
| 2007-08-26 → 2007-11-24 | Wt,Śr,Cz,So (1,2,3,5) | ~39 |
| 2007-11-25 → bieżący | Wt, Cz, So (1,3,5) | ~4500 |

## Wpływ na aplikację

### ✅ Weryfikacja integralności
- Teraz zna rzeczywiste harmonogramy dla każdego okresu
- Nie raportuje fałszywych błędów (np. "brakuje wtorku w 1984")
- Prawidłowo szuka brakujących dat

### ✅ Brak emoji
- Wszystkie emoji usunięte z Python skryptów
- Emoji w Frontend zamienione na Material-UI Chips
- Ikony z Material-UI dla spójności UI

### ✅ Trwałość danych
- Harmonogramy zapisane w YAML
- Ładowane automatycznie przy starcie
- Możliwość łatwej modyfikacji ręcznej

## Architektura

```
Backend:
  - draw_schedules.yaml - definicje harmonogramów
  - main.py - ładuje YAML przy starcie
  - models.py - DrawSchedule model
  
Frontend:
  - History.tsx - zarządzanie harmonogramami
  - api.ts - endpoints CRUD
```

## Zmiana harmonogramów

Możesz edytować `backend/draw_schedules.yaml` ręcznie i restarttować aplikację.
Format YAML:

```yaml
schedules:
  - date_from: "YYYY-MM-DD"
    date_to: "YYYY-MM-DD"  # opcjonalne
    weekdays: [0, 1, 2]    # 0=Pn, 1=Wt, 2=Śr, 3=Cz, 4=Pt, 5=So, 6=Nd
    description: "Opis"
```
