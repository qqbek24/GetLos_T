# API Examples - GetLos_T

Przykłady wywołań API dla różnych operacji.

## Base URL

```
Development: http://localhost:8000
Production: https://your-domain.com
```

---

## GET /stats - Pobierz Statystyki

```bash
curl http://localhost:8000/stats
```

**Response:**
```json
{
  "total_draws": 150,
  "total_picks": 25,
  "coverage_pct": 0.0000012,
  "freq": [12, 15, 8, 10, ...],
  "min_sum": 45,
  "max_sum": 285,
  "avg_sum": 156.5,
  "most_frequent": [[23, 18], [45, 16], ...],
  "least_frequent": [[3, 2], [17, 3], ...]
}
```

---

## POST /upload-csv - Wgraj Plik CSV

```bash
curl -X POST http://localhost:8000/upload-csv \
  -F "file=@losowania.csv"
```

**Response:**
```json
{
  "success": true,
  "total_processed": 100,
  "new_draws": 85,
  "duplicates": 15,
  "message": "Successfully added 85 new draws, 15 duplicates skipped"
}
```

---

## POST /generate - Generuj Nowe Układy

### Random Strategy
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "random",
    "count": 3
  }'
```

### Hot Strategy
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "hot",
    "count": 1
  }'
```

### Balanced Strategy
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "strategy": "balanced",
    "count": 5
  }'
```

**Response:**
```json
[
  {
    "id": 1,
    "numbers": [5, 12, 23, 34, 45, 52],
    "key": "05-12-23-34-45-52",
    "strategy": "balanced",
    "created_at": "2026-01-07T10:30:00Z"
  },
  {
    "id": 2,
    "numbers": [3, 9, 14, 27, 31, 48],
    "key": "03-09-14-27-31-48",
    "strategy": "balanced",
    "created_at": "2026-01-07T10:30:01Z"
  }
]
```

---

## GET /picks - Lista Wygenerowanych Typów

```bash
# Ostatnich 50 (domyślnie)
curl http://localhost:8000/picks

# Ostatnich 100
curl http://localhost:8000/picks?limit=100
```

**Response:**
```json
[
  {
    "id": 25,
    "numbers": [7, 13, 19, 25, 38, 44],
    "key": "07-13-19-25-38-44",
    "strategy": "combo_based",
    "created_at": "2026-01-07T12:00:00Z"
  },
  ...
]
```

---

## GET /draws - Lista Historycznych Losowań

```bash
curl http://localhost:8000/draws?limit=50
```

**Response:**
```json
[
  {
    "id": 150,
    "numbers": [2, 11, 18, 24, 33, 49],
    "key": "02-11-18-24-33-49",
    "created_at": "2026-01-05T20:00:00Z",
    "source": "csv_upload"
  },
  ...
]
```

---

## ✅ POST /validate - Waliduj Układ

```bash
curl -X POST http://localhost:8000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "numbers": [5, 12, 23, 34, 45, 52]
  }'
```

**Response:**
```json
{
  "numbers": [5, 12, 23, 34, 45, 52],
  "key": "05-12-23-34-45-52",
  "exists_in_history": true,
  "exists_in_picks": false,
  "is_unique": false
}
```

---

## GET /pairtriple-stats - Statystyki Par i Trójek

```bash
curl http://localhost:8000/pairtriple-stats?limit=10
```

**Response:**
```json
{
  "pairs": [
    {"numbers": [5, 12], "count": 15},
    {"numbers": [23, 34], "count": 12},
    ...
  ],
  "triples": [
    {"numbers": [5, 12, 23], "count": 8},
    {"numbers": [34, 45, 52], "count": 6},
    ...
  ]
}
```

---

## DELETE /picks/{id} - Usuń Pick

```bash
curl -X DELETE http://localhost:8000/picks/25
```

**Response:**
```json
{
  "success": true,
  "message": "Pick deleted"
}
```

---

## DELETE /picks/all - Wyczyść Wszystkie Picks

```bash
curl -X DELETE http://localhost:8000/picks/all
```

**Response:**
```json
{
  "success": true,
  "deleted": 25
}
```

---

## 🧹 DELETE /draws/all - Wyczyść Całą Historię

**⚠️ UWAGA: Nieodwracalna operacja!**

```bash
curl -X DELETE http://localhost:8000/draws/all
```

**Response:**
```json
{
  "success": true,
  "deleted": 150
}
```

---

## Python Examples

```python
import requests

BASE_URL = "http://localhost:8000"

# Generuj 3 układy strategią "balanced"
response = requests.post(f"{BASE_URL}/generate", json={
    "strategy": "balanced",
    "count": 3
})
picks = response.json()
print(f"Generated {len(picks)} picks")

# Pobierz statystyki
stats = requests.get(f"{BASE_URL}/stats").json()
print(f"Total draws: {stats['total_draws']}")
print(f"Coverage: {stats['coverage_pct']}%")

# Wgraj CSV
with open("losowania.csv", "rb") as f:
    files = {"file": f}
    response = requests.post(f"{BASE_URL}/upload-csv", files=files)
    print(response.json())
```

---

## JavaScript/Node.js Examples

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Generuj układy
async function generatePicks() {
  const response = await axios.post(`${BASE_URL}/generate`, {
    strategy: 'hot',
    count: 5
  });
  console.log('Generated:', response.data);
}

// Pobierz statystyki
async function getStats() {
  const response = await axios.get(`${BASE_URL}/stats`);
  console.log('Stats:', response.data);
}

// Upload CSV
async function uploadCSV(filePath) {
  const FormData = require('form-data');
  const fs = require('fs');
  
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  
  const response = await axios.post(`${BASE_URL}/upload-csv`, form, {
    headers: form.getHeaders()
  });
  console.log('Upload result:', response.data);
}

generatePicks();
getStats();
```

---

## Vue.js/Frontend Example

```javascript
import api from '@/services/api'

// Generuj
const picks = await api.generatePicks('balanced', 3)
console.log(picks)

// Statystyki
const stats = await api.getStats()
console.log(stats)

// Upload
const file = event.target.files[0]
const result = await api.uploadCSV(file)
console.log(result)
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "File must be CSV format"
}
```

### 404 Not Found
```json
{
  "detail": "Pick not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "numbers"],
      "msg": "All numbers must be in range 1-52",
      "type": "value_error"
    }
  ]
}
```

---

## Testing API

### Postman
Import collection: `docs/GetLos_T.postman_collection.json` (TODO)

### Thunder Client (VS Code)
Import collection: `docs/GetLos_T.thunder_collection.json` (TODO)

### Swagger UI
Najłatwiej: http://localhost:8000/docs

---

## More Examples

Zobacz również:
- Backend test: `backend/test_backend.py`
- Frontend service: `frontend/src/services/api.js`
