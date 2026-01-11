# AI Prediction Strategy

## Overview
Strategia AI wykorzystuje uczenie maszynowe (Machine Learning) do predykcji liczb na podstawie analizy danych historycznych i wzorców.

## Technologia
- **Biblioteka**: scikit-learn (RandomForestClassifier)
- **Model**: Random Forest - zespół drzew decyzyjnych
- **Typ**: Klasyfikacja binarna (dla każdej liczby 1-49)

## Jak działa?

### 1. Przygotowanie danych treningowych
- Analizuje sekwencje historycznych losowań
- Dla każdego losowania tworzy wektor cech (features):
  - Suma liczb w poprzednim losowaniu
  - Liczba parzystych liczb
  - Zakres (max - min)
  - Częstotliwość pierwszej i ostatniej liczby
  - Luki między kolejnymi liczbami (gaps)

### 2. Trening modelu
- Dla każdej liczby (1-49) trenuje osobny klasyfikator
- Uczy się wzorców: "Jeśli w poprzednim losowaniu było X, to liczba Y ma szansę pojawić się"
- Wykorzystuje 10 drzew decyzyjnych (n_estimators=10)

### 3. Predykcja
- Na podstawie ostatniego losowania przewiduje prawdopodobieństwo dla każdej liczby
- Sortuje liczby według prawdopodobieństwa
- **Strategia selekcji**:
  - 3 liczby z najwyższym prawdopodobieństwem (top 8)
  - 2-3 liczby ze średniego prawdopodobieństwa (ważony losowy wybór)
  - Pozostałe losowo z pozostałych liczb

### 4. Fallback
Jeśli jest za mało danych (< 20 losowań):
- Automatycznie przełącza się na strategię "balanced"
- Gwarantuje zawsze poprawny wynik

## Cechy (Features) używane w modelu

| Cecha | Opis | Przykład |
|-------|------|----------|
| Sum | Suma wszystkich liczb | 150 |
| Even Count | Ile liczb parzystych | 3 |
| Range | Max - Min | 42 |
| First Freq | Częstotliwość 1. liczby | 25 |
| Last Freq | Częstotliwość ostatniej liczby | 18 |
| Gaps (5x) | Różnice między kolejnymi liczbami | [2, 5, 8, 3, 15] |

## Zalety strategii AI

✅ **Uczenie się wzorców** - Wykrywa ukryte zależności w danych  
✅ **Adaptacja** - Im więcej danych, tym lepsze predykcje  
✅ **Probabilistyczne podejście** - Nie tylko top liczby, ale inteligentna mieszanka  
✅ **Niepowtarzalność** - Każde wywołanie daje inne wyniki (element losowości)  

## Ograniczenia

⚠️ **Wymaga danych** - Minimum 20 losowań historycznych  
⚠️ **Nie gwarantuje wygranej** - To tylko analiza statystyczna  
⚠️ **Obliczeniowo** - Wolniejsze niż proste strategie  

## Kiedy używać?

- ✅ Gdy masz bogatą historię losowań (50+ wyników)
- ✅ Gdy chcesz eksperymentować z ML
- ✅ Gdy szukasz "inteligentniejszej" strategii niż losowa
- ❌ Gdy masz mało danych (< 20 losowań)
- ❌ Gdy potrzebujesz szybkiego wyniku

## Porównanie ze standardowymi strategiami

| Strategia | Podstawa | Złożoność | Wymagania |
|-----------|----------|-----------|-----------|
| Random | Losowość | Niska | Brak |
| Hot | Częstotliwość | Niska | Historia |
| Cold | Rzadkość | Niska | Historia |
| Balanced | Hot + Cold | Średnia | Historia |
| Combo Based | Pary/Trójki | Średnia | Historia |
| **AI** | **ML Pattern** | **Wysoka** | **20+ losowań** |

## Przykład użycia

### Frontend
```typescript
// Wybór strategii AI
setStrategy('ai')

// Wywołanie generowania
const result = await api.generatePicks({ strategy: 'ai', count: 1 })
```

### Backend API
```python
POST /api/picks/generate
{
  "strategy": "ai",
  "count": 1
}

Response:
[
  {
    "numbers": [5, 12, 23, 31, 38, 45],
    "strategy": "ai"
  }
]
```

## Potencjalne ulepszenia (TODO)

- [ ] Dodanie więcej cech (parzystość/nieparzystość całego zestawu)
- [ ] Analiza długoterminowych trendów (miesiące/lata)
- [ ] Użycie sieci neuronowych (TensorFlow/PyTorch)
- [ ] Cache'owanie wytrenowanego modelu
- [ ] A/B testing z innymi strategiami
- [ ] Walidacja krzyżowa (cross-validation)

## Kod

Implementacja znajduje się w:
- **Backend**: `backend/main.py` → funkcja `pick_with_ai()`
- **Frontend**: `frontend/src/config/icons.ts` → `STRATEGY_CONFIG.ai`
- **Types**: `frontend/src/types/index.ts` → dodano 'ai' do typu Strategy

## Instalacja zależności

```bash
# Backend
pip install scikit-learn==1.3.2 numpy==1.26.2

# Lub rebuild Docker
docker-compose up -d --build
```

## Testowanie

```bash
# Test manualny przez API
curl -X POST http://localhost:8000/api/picks/generate \
  -H "Content-Type: application/json" \
  -d '{"strategy": "ai", "count": 3}'

# Wynik powinien zawierać 3 układy wygenerowane przez AI
```

## Uwagi techniczne

- Model **nie jest persystowany** między wywołaniami (trenuje się każdorazowo)
- Trening zajmuje ~100-500ms dla 100-500 losowań
- Dla bardzo dużej ilości danych (1000+) można rozważyć cache'owanie
- RandomForest jest deterministyczny (random_state=42), ale końcowy wybór ma element losowości

## Autor

Implementacja: AI Strategy dla GetLos_T  
Data: 2026-01-11  
Wersja: 1.0
