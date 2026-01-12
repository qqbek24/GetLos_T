# Aplikacja do losowania prognozowanego układu 6 liczb

## Opis projektu

Aplikacja do losowania prognozowanego układu 6 liczb z zakresu od 1 do 52, mając do dyspozycji historyczne losowania i wiedzę, że nie mogą się powtarzać wylosowane układy.

## 🎯 Cel aplikacji

Wylosować nową, prognozowaną kombinację 6 liczb z zakresu 1–52:

- niepowtarzającą się z żadnym układem z historii
- opcjonalnie opartą o analizę statystyczną (np. częstość występowania liczb, par, sumy itp.)
- z możliwością eksportu wyników (np. CSV, TXT)
- z interfejsem webowym

## 💼 Wymagania użytkownika

**Wybrana wersja:** Aplikacja webowa z FastAPI + React

### Funkcjonalności:
- Opcja dodania pliku CSV z danymi historycznymi, konwertowane do JSON
- Opcja zachowania historii użytych wytypowanych liczb
- Analiza danych historycznych i typowanie niepowtarzających się zestawów 6 liczb
- Gwarancja braku powtórzeń kombinacji w historii

---

## ⚙️ Wariant CLI (Python)

Prosta wersja konsolowa do szybkiego testowania:

```python
import random
import csv

# --- wczytanie historii z pliku CSV ---
def wczytaj_historię(plik):
    historia = []
    with open(plik, newline='') as f:
        reader = csv.reader(f)
        for wiersz in reader:
            liczby = tuple(sorted(map(int, wiersz)))
            historia.append(liczby)
    return historia

# --- losowanie nowego układu ---
def losuj_nową(historia):
    wszystkie = set(historia)
    while True:
        układ = tuple(sorted(random.sample(range(1, 53), 6)))
        if układ not in wszystkie:
            return układ

# --- przykładowe użycie ---
if __name__ == "__main__":
    historia = wczytaj_historię("losowania.csv")
    nowy = losuj_nową(historia)
    print("Nowy prognozowany układ:", nowy)
```

### Przykładowy plik CSV

```csv
5,12,23,34,45,52
3,9,14,27,31,48
...
```

---

# Backend — FastAPI

## Struktura plików

```
backend/
├─ main.py
├─ models.py
├─ db.py
├─ schema.py
└─ requirements.txt
```

## requirements.txt

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic==2.8.2
SQLAlchemy==2.0.35
python-multipart==0.0.9
```

## db.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

## models.py

```python
from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.types import JSON
from db import Base

def norm_key(nums: list[int]) -> str:
    s = sorted(nums)
    return "-".join(f"{n:02d}" for n in s)

class HistoricalDraw(Base):
    __tablename__ = "historical_draws"
    id = Column(Integer, primary_key=True, index=True)
    # 6 liczb (posortowane) jako JSON + klucz unikalności
    numbers = Column(JSON, nullable=False)
    key = Column(String, unique=True, index=True, nullable=False)

class Pick(Base):
    __tablename__ = "picks"
    id = Column(Integer, primary_key=True, index=True)
    numbers = Column(JSON, nullable=False)
    key = Column(String, unique=True, index=True, nullable=False)
    strategy = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("key", name="uq_pick_key"),
    )
```

## schema.py

```python
from pydantic import BaseModel, Field, conlist, validator
from typing import Literal, List

class Numbers(BaseModel):
    numbers: conlist(int, min_length=6, max_length=6)

    @validator("numbers")
    def validate_range(cls, v):
        if any(n < 1 or n > 52 for n in v):
            raise ValueError("Numbers must be in 1..52")
        if len(set(v)) != 6:
            raise ValueError("Numbers must be unique")
        return sorted(v)

class Stats(BaseModel):
    total_draws: int
    coverage_pct: float
    freq: List[int]  # indeks 0 -> liczba 1, itd.
    min_sum: int
    max_sum: int
    avg_sum: float

Strategy = Literal["random", "hot", "cold", "balanced", "combo_based"]
```

## main.py

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
import csv, io, random, math
from collections import Counter
from itertools import combinations

from db import Base, engine, SessionLocal
from models import HistoricalDraw, Pick, norm_key
from schema import Numbers, Stats, Strategy

app = FastAPI(title="Lotto Predictor 1–52", version="1.0.0")

# CORS – dostosuj do origin frontendu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# ---------- Helpers ----------
def get_db():
    from sqlalchemy.orm import Session
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def parse_csv_bytes(b: bytes) -> List[List[int]]:
    """
    Akceptuje różne CSV. Każdy wiersz:
    - może mieć wiele kolumn; wyciągamy pierwszych 6 intów z zakresu 1..52
    - ignorujemy linie, gdzie nie ma pełnych 6 liczb
    """
    out = []
    text = b.decode("utf-8", errors="ignore")
    reader = csv.reader(io.StringIO(text))
    for row in reader:
        nums = []
        for cell in row:
            for token in cell.replace(";", ",").replace(" ", ",").split(","):
                if token.strip().isdigit():
                    n = int(token.strip())
                    if 1 <= n <= 52:
                        nums.append(n)
                if len(nums) >= 6:
                    break
            if len(nums) >= 6:
                break
        if len(nums) >= 6:
            uniq6 = sorted(list(dict.fromkeys(nums)))
            if len(uniq6) >= 6:
                out.append(sorted(uniq6[:6]))
    return out

def histogram_1_52(rows: List[List[int]]) -> List[int]:
    freq = [0]*52
    for r in rows:
        for n in r:
            freq[n-1] += 1
    return freq

def get_top_pairs_triples(rows: list[list[int]], top_n: int = 30):
    """Zwraca najczęstsze pary i trójki (do strategii combo_based)."""
    pair_counter = Counter()
    triple_counter = Counter()
    for draw in rows:
        for pair in combinations(sorted(draw), 2):
            pair_counter[pair] += 1
        for triple in combinations(sorted(draw), 3):
            triple_counter[triple] += 1
    top_pairs = [set(p) for p, _ in pair_counter.most_common(top_n)]
    top_triples = [set(t) for t, _ in triple_counter.most_common(top_n)]
    return top_pairs, top_triples

def pick_with_strategy(freq: List[int], strategy: Strategy, all_rows: Optional[list[list[int]]] = None) -> List[int]:
    universe = list(range(1, 53))
    
    if strategy == "random":
        return sorted(random.sample(universe, 6))

    if sum(freq) == 0:
        return sorted(random.sample(universe, 6))

    if strategy in ("hot", "cold"):
        weights = [f if strategy=="hot" else (max(freq)+1 - f) for f in freq]
        weights = [max(w, 1) for w in weights]
        picks = set()
        while len(picks) < 6:
            n = random.choices(universe, weights=weights, k=1)[0]
            picks.add(n)
        return sorted(picks)

    if strategy == "balanced":
        idx_sorted = sorted(range(52), key=lambda i: freq[i], reverse=True)
        hot_pool = [i+1 for i in idx_sorted[:13]]
        cold_pool = [i+1 for i in idx_sorted[-13:]]
        picks = set(random.sample(hot_pool, 3) + random.sample(cold_pool, 3))
        while len(picks) < 6:
            picks.add(random.randint(1,52))
        return sorted(picks)

    if strategy == "combo_based":
        if not all_rows:
            return sorted(random.sample(universe, 6))
        
        top_pairs, top_triples = get_top_pairs_triples(all_rows, top_n=30)
        
        # Ustal wagi dla liczb – częściej występujących w top parach/trójkach
        combo_weights = Counter()
        for combo in top_pairs + top_triples:
            for n in combo:
                combo_weights[n] += 1
        
        weights = [combo_weights.get(i, 1) for i in range(1, 53)]
        
        picks = set()
        while len(picks) < 6:
            n = random.choices(universe, weights=weights, k=1)[0]
            picks.add(n)
        return sorted(picks)

    return sorted(random.sample(universe, 6))

def ensure_new_combo(candidate: List[int], forbidden_keys: set[str]) -> List[int]:
    """Gwarantuje brak powtórzeń (zarówno historycznych, jak i już zapisanych picków)."""
    tries = 0
    cand = candidate
    while norm_key(cand) in forbidden_keys:
        cand = sorted(random.sample(range(1,53), 6))
        tries += 1
        if tries > 5000:
            raise RuntimeError("Nie udało się znaleźć nowej kombinacji po wielu próbach.")
    return cand

# ---------- Endpoints ----------
@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Wgraj plik CSV.")
    data = await file.read()
    rows = parse_csv_bytes(data)
    if not rows:
        raise HTTPException(400, "Nie znaleziono żadnych 6-liczbowych wierszy 1..52.")

    from sqlalchemy.orm import Session
    inserted = 0
    keys_seen = set()
    with SessionLocal() as db:
        for r in rows:
            k = norm_key(r)
            if k in keys_seen:
                continue
            keys_seen.add(k)
            if not db.query(HistoricalDraw).filter_by(key=k).first():
                db.add(HistoricalDraw(numbers=r, key=k))
                inserted += 1
        db.commit()

        all_rows = [hd.numbers for hd in db.query(HistoricalDraw).all()]
        freq = histogram_1_52(all_rows)
        stats = {
            "total_draws": len(all_rows),
            "coverage_pct": round(100.0 * len(all_rows) / math.comb(52,6), 10),
            "freq": freq,
            "min_sum": min((sum(r) for r in all_rows), default=0),
            "max_sum": max((sum(r) for r in all_rows), default=0),
            "avg_sum": (sum(map(sum, all_rows))/len(all_rows)) if all_rows else 0.0
        }

    return {"inserted": inserted, "stats": stats}

@app.get("/stats", response_model=Stats)
def get_stats():
    from sqlalchemy.orm import Session
    with SessionLocal() as db:
        all_rows = [hd.numbers for hd in db.query(HistoricalDraw).all()]
    freq = histogram_1_52(all_rows)
    total = len(all_rows)
    return Stats(
        total_draws=total,
        coverage_pct=round(100.0 * total / math.comb(52,6), 10),
        freq=freq,
        min_sum=min((sum(r) for r in all_rows), default=0),
        max_sum=max((sum(r) for r in all_rows), default=0),
        avg_sum=(sum(map(sum, all_rows))/total) if total else 0.0
    )

@app.post("/generate")
def generate(n: int = 1, strategy: Strategy = "balanced"):
    if n < 1 or n > 50:
        raise HTTPException(400, "n musi być w zakresie 1..50")

    from sqlalchemy.orm import Session
    with SessionLocal() as db:
        hist_keys = {h.key for h in db.query(HistoricalDraw.key).all()}
        pick_keys = {p.key for p in db.query(Pick.key).all()}
        forbidden = hist_keys | pick_keys
        all_rows = [hd.numbers for hd in db.query(HistoricalDraw).all()]
        freq = histogram_1_52(all_rows)

        results = []
        for _ in range(n):
            cand = pick_with_strategy(freq, strategy, all_rows)
            cand = ensure_new_combo(cand, forbidden)
            k = norm_key(cand)
            db.add(Pick(numbers=cand, key=k, strategy=strategy))
            forbidden.add(k)
            results.append(cand)
        db.commit()

    return {"generated": results, "strategy": strategy}

@app.get("/picks")
def list_picks():
    from sqlalchemy.orm import Session
    with SessionLocal() as db:
        picks = db.query(Pick).order_by(Pick.created_at.desc()).all()
    return [
        {"id": p.id, "numbers": p.numbers, "strategy": p.strategy, "created_at": p.created_at}
        for p in picks
    ]

@app.delete("/picks/{pick_id}")
def delete_pick(pick_id: int):
    from sqlalchemy.orm import Session
    with SessionLocal() as db:
        p = db.get(Pick, pick_id)
        if not p:
            raise HTTPException(404, "Nie znaleziono wpisu.")
        db.delete(p)
        db.commit()
    return {"ok": True}

@app.post("/validate", response_model=Numbers)
def validate_numbers(payload: Numbers):
    """Walidacja zestawu i informacja, czy istnieje w historii."""
    numbers = payload.numbers
    k = norm_key(numbers)
    from sqlalchemy.orm import Session
    with SessionLocal() as db:
        exists = db.query(HistoricalDraw).filter_by(key=k).first() is not None
    return JSONResponse({"numbers": numbers, "exists_in_history": exists})

@app.get("/pairtriple-stats")
def pairtriple_stats(limit: int = 20):
    """
    Zwraca najczęstsze pary i trójki z danych historycznych.
    limit – ile najwyżej pozycji zwrócić dla każdej kategorii
    """
    from sqlalchemy.orm import Session
    with SessionLocal() as db:
        all_rows = [hd.numbers for hd in db.query(HistoricalDraw).all()]

    if not all_rows:
        return {"pairs": [], "triples": []}

    pair_counter = Counter()
    triple_counter = Counter()

    for draw in all_rows:
        for pair in combinations(sorted(draw), 2):
            pair_counter[pair] += 1
        for triple in combinations(sorted(draw), 3):
            triple_counter[triple] += 1

    top_pairs = pair_counter.most_common(limit)
    top_triples = triple_counter.most_common(limit)

    return {
        "pairs": [{"numbers": list(p), "count": c} for p, c in top_pairs],
        "triples": [{"numbers": list(t), "count": c} for t, c in top_triples]
    }

@app.get("/pair-network")
def pair_network(limit: int = 100):
    """
    Zwraca sieć par liczbowych (dla wizualizacji).
    limit – ile najczęstszych par uwzględnić.
    """
    from sqlalchemy.orm import Session
    with SessionLocal() as db:
        all_rows = [hd.numbers for hd in db.query(HistoricalDraw).all()]

    if not all_rows:
        return {"nodes": [], "edges": []}

    pair_counter = Counter()
    for draw in all_rows:
        for pair in combinations(sorted(draw), 2):
            pair_counter[pair] += 1

    top_pairs = pair_counter.most_common(limit)
    nodes_set = set()
    edges = []

    max_count = top_pairs[0][1] if top_pairs else 1
    for (a, b), count in top_pairs:
        nodes_set.update([a, b])
        edges.append({
            "from": a,
            "to": b,
            "value": count,
            "width": 1 + (count / max_count) * 5
        })

    nodes = [{"id": n, "label": str(n), "value": 10} for n in sorted(nodes_set)]
    return {"nodes": nodes, "edges": edges}
```

---

# Frontend — React (Vite)

## Struktura plików

```
frontend/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx
   └─ App.jsx
```

## package.json

```json
{
  "name": "lotto-predictor-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.8"
  }
}
```

## vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

## index.html

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lotto Predictor 1–52</title>
    <script type="text/javascript" src="https://unpkg.com/vis-network@9.1.6/standalone/umd/vis-network.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## src/main.jsx

```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
```

## src/App.jsx

```jsx
import React, { useEffect, useMemo, useState, useRef } from 'react'

const API = 'http://localhost:8000'

function pretty(arr){ return arr?.join(' - ') }

export default function App(){
  const [stats, setStats] = useState(null)
  const [csvInfo, setCsvInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [picks, setPicks] = useState([])
  const [n, setN] = useState(3)
  const [strategy, setStrategy] = useState('balanced')
  const [file, setFile] = useState(null)
  const [pairTriple, setPairTriple] = useState(null)
  const [networkData, setNetworkData] = useState(null)
  const networkRef = useRef(null)
  const [limit, setLimit] = useState(100)

  const fetchStats = async() => {
    const r = await fetch(`${API}/stats`)
    if(r.ok){ setStats(await r.json()) }
  }

  const fetchPicks = async() => {
    const r = await fetch(`${API}/picks`)
    if(r.ok){ setPicks(await r.json()) }
  }

  const fetchPairTriple = async () => {
    const r = await fetch(`${API}/pairtriple-stats`)
    if (r.ok) setPairTriple(await r.json())
  }

  const fetchNetwork = async () => {
    const r = await fetch(`${API}/pair-network?limit=${limit}`)
    if (r.ok) setNetworkData(await r.json())
  }

  useEffect(() => { 
    fetchStats()
    fetchPicks()
    fetchPairTriple()
    fetchNetwork()
  }, [])

  useEffect(() => {
    if (!networkData || !networkRef.current) return
    const { Network } = window.vis
    const options = {
      nodes: {
        shape: 'circle',
        color: '#2e86de',
        font: { color: '#fff', size: 14 },
      },
      edges: {
        color: { color: '#999', highlight: '#ff6b6b' },
        smooth: false,
      },
      physics: {
        stabilization: true,
        barnesHut: { gravitationalConstant: -3000 },
      },
      interaction: { hover: true },
    }
    new Network(networkRef.current, networkData, options)
  }, [networkData])

  const upload = async(e) => {
    e.preventDefault()
    if(!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch(`${API}/upload-csv`, { method: 'POST', body: fd })
    const data = await r.json()
    setCsvInfo(data)
    setLoading(false)
    fetchStats()
  }

  const generate = async() => {
    setLoading(true)
    const r = await fetch(`${API}/generate?n=${n}&strategy=${strategy}`, { method: 'POST' })
    const data = await r.json()
    setLoading(false)
    fetchPicks()
    alert(`Wygenerowano: \n${data.generated.map(pretty).join('\n')}`)
  }

  const deletePick = async(id) => {
    await fetch(`${API}/picks/${id}`, { method: 'DELETE' })
    fetchPicks()
  }

  const maxFreq = useMemo(()=> stats ? Math.max(...stats.freq) : 0, [stats])

  return (
    <div style={{fontFamily:'system-ui, sans-serif', margin:'2rem auto', maxWidth:900}}>
      <h1>Lotto Predictor 1–52</h1>

      <section style={{border:'1px solid #ddd', padding:'1rem', borderRadius:8, marginBottom:'1rem'}}>
        <h2>1) Wgraj historię (CSV)</h2>
        <form onSubmit={upload}>
          <input type="file" accept=".csv" onChange={e=>setFile(e.target.files[0])}/>
          <button type="submit" disabled={loading} style={{marginLeft:8}}>
            {loading ? 'Przetwarzanie...' : 'Wyślij'}
          </button>
        </form>
        <p style={{marginTop:8, color:'#555'}}>
          Format elastyczny: z każdego wiersza wyciągamy pierwszych 6 liczb 1..52.
        </p>
        {csvInfo && (
          <div style={{marginTop:8, background:'#f7fafc', padding:'0.75rem', borderRadius:6}}>
            <div><b>Dodano rekordów:</b> {csvInfo.inserted}</div>
            <div><b>Łącznie w bazie:</b> {csvInfo.stats.total_draws}</div>
          </div>
        )}
      </section>

      <section style={{border:'1px solid #ddd', padding:'1rem', borderRadius:8, marginBottom:'1rem'}}>
        <h2>2) Statystyki</h2>
        {!stats ? <div>Brak danych.</div> : (
          <>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12}}>
              <Stat label="Liczba losowań" value={stats.total_draws}/>
              <Stat label="Pokrycie kombinacji" value={`${stats.coverage_pct}%`}/>
              <Stat label="Suma min" value={stats.min_sum}/>
              <Stat label="Suma max" value={stats.max_sum}/>
              <Stat label="Suma avg" value={stats.avg_sum.toFixed(2)}/>
            </div>
            <div style={{marginTop:12}}>
              <b>Częstości liczb (1–52)</b>
              <div style={{display:'grid', gridTemplateColumns:'repeat(13,1fr)', gap:8, marginTop:8}}>
                {stats.freq.map((f, i)=>(
                  <div key={i} style={{border:'1px solid #eee', borderRadius:6, padding:'6px'}}>
                    <div style={{fontSize:12, color:'#777'}}>#{i+1}</div>
                    <div style={{fontWeight:600}}>{f}</div>
                    <div style={{height:4, background:'#eee', borderRadius:2, marginTop:4}}>
                      <div style={{
                        height:4,
                        width: maxFreq ? `${(f/maxFreq)*100}%` : 0,
                        background: '#2e86de'
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {pairTriple && (
        <section style={{border:'1px solid #ddd', padding:'1rem', borderRadius:8, marginBottom:'1rem'}}>
          <h2>3) Częstości par i trójek</h2>
          <div style={{display:'flex', gap:40}}>
            <div>
              <h3>Top pary</h3>
              <table>
                <thead><tr><th>Para</th><th>Ilość</th></tr></thead>
                <tbody>
                  {pairTriple.pairs.map((p,i)=>(
                    <tr key={i}>
                      <td>{p.numbers.join(' - ')}</td>
                      <td style={{textAlign:'right'}}>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3>Top trójki</h3>
              <table>
                <thead><tr><th>Trójka</th><th>Ilość</th></tr></thead>
                <tbody>
                  {pairTriple.triples.map((t,i)=>(
                    <tr key={i}>
                      <td>{t.numbers.join(' - ')}</td>
                      <td style={{textAlign:'right'}}>{t.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section style={{border:'1px solid #ddd', padding:'1rem', borderRadius:8, marginBottom:'1rem'}}>
        <h2>4) Wizualizacja sieci par liczbowych</h2>
        <div style={{marginBottom:8}}>
          <label>Top&nbsp;par: </label>
          <input
            type="number"
            min={10}
            max={300}
            step={10}
            value={limit}
            onChange={e => setLimit(parseInt(e.target.value))}
            style={{width:80}}
          />
          <button onClick={fetchNetwork} style={{marginLeft:8}}>Odśwież</button>
        </div>
        <div
          ref={networkRef}
          style={{height:'500px', border:'1px solid #ccc', borderRadius:'6px'}}
        />
      </section>

      <section style={{border:'1px solid #ddd', padding:'1rem', borderRadius:8, marginBottom:'1rem'}}>
        <h2>5) Generuj typy</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <label>Strategia:&nbsp;
            <select value={strategy} onChange={e=>setStrategy(e.target.value)}>
              <option value="balanced">balanced</option>
              <option value="hot">hot</option>
              <option value="cold">cold</option>
              <option value="random">random</option>
              <option value="combo_based">combo_based (pary/trójki)</option>
            </select>
          </label>
          <label>Ile propozycji:&nbsp;
            <input type="number" min={1} max={50} value={n} onChange={e=>setN(parseInt(e.target.value || 1))}/>
          </label>
          <button onClick={generate} disabled={loading}>{loading ? 'Generuję...' : 'Generuj i zapisz'}</button>
        </div>
        <p style={{marginTop:8, color:'#555'}}>Każdy wygenerowany zestaw jest zapisywany i sprawdzany przeciw historii – bez powtórek.</p>
      </section>

      <section style={{border:'1px solid #ddd', padding:'1rem', borderRadius:8}}>
        <h2>6) Twoje zapisane typy</h2>
        {!picks.length ? <div>Brak zapisanych.</div> : (
          <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
            {picks.map(p=>(
              <li key={p.id} style={{border:'1px solid #eee', borderRadius:8, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:600}}>{pretty(p.numbers)}</div>
                  <div style={{fontSize:12, color:'#777'}}>strategia: {p.strategy} • {new Date(p.created_at).toLocaleString()}</div>
                </div>
                <button onClick={()=>deletePick(p.id)} style={{background:'#fff'}}>Usuń</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({label, value}){
  return (
    <div style={{border:'1px solid #eee', borderRadius:6, padding:'10px'}}>
      <div style={{fontSize:12, color:'#666'}}>{label}</div>
      <div style={{fontSize:18, fontWeight:700}}>{value}</div>
    </div>
  )
}
```

---

# Uruchomienie projektu

## Backend

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Frontend

```bash
cd frontend
npm i
npm run dev
```

Otwórz: http://localhost:5173

---

# Format CSV (elastyczny)

- Każda linia musi zawierać co najmniej 6 liczb w zakresie 1–52
- Aplikacja znajdzie pierwsze 6 liczb w wierszu (ignoruje resztę)
- Duplikaty w wierszu są usuwane; zestaw jest sortowany
- Na potrzeby unikalności tworzony jest klucz w postaci "01-05-12-..."

---

# Strategie prognozowania

## random
Jednorodne losowanie 6 z 52

## hot
Wagi proporcjonalne do częstości w historii (liczby "gorące")

## cold
Odwrotne wagi (preferuje "zimne")

## balanced
Miesza po 3 liczby z puli najczęstszych i najrzadszych

## combo_based
Preferuje liczby często występujące w parach i trójkach z historii:
- Analizuje top 30 par i trójek
- Przypisuje wyższe wagi liczbom z tych kombinacji
- Losuje proporcjonalnie do wag

W każdym przypadku wynik jest sprawdzany, czy nie wystąpił w historii ani w zapisanych typach.

---

# Przykładowe API

## Upload CSV
```
POST /upload-csv
```

## Statystyki
```
GET /stats
```

## Analiza par/trójek
```
GET /pairtriple-stats?limit=20
```

## Sieć par (wizualizacja)
```
GET /pair-network?limit=100
```

## Generowanie typów
```
POST /generate?n=3&strategy=combo_based
```

## Lista zapisanych typów
```
GET /picks
```

## Usunięcie typu
```
DELETE /picks/{pick_id}
```

## Walidacja zestawu
```
POST /validate
```

---

# Uwagi końcowe

- Przestrzeń kombinacji: C(52,6) ≈ 20,35 mln
- Backend zawsze sprawdza brak powtórek w bazie
- Limit bezpieczeństwa: 5000 prób generowania unikalnej kombinacji
- Wizualizacja sieci pokazuje powiązania między liczbami
- Interaktywny graf pozwala na eksplorację zależności
