"""
GetLos_T - Main FastAPI Application
Lottery number prediction system
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import csv, io, random, math, os, json
import yaml
from pathlib import Path
from collections import Counter
from itertools import combinations
from dotenv import load_dotenv
import numpy as np
from sklearn.ensemble import RandomForestClassifier

from db import get_db, init_db
from models import HistoricalDraw, Pick, DrawSchedule, norm_key
from schema import (
    Numbers, Stats, Strategy, GenerateRequest, 
    UploadResponse, DrawResponse, PickResponse, SyncLottoResponse,
    ManualDrawRequest, BackupResponse, BatchDeleteRequest,
    IntegrityReport, IntegrityIssue, IntegrityFixResponse,
    DrawScheduleCreate, DrawScheduleResponse
)
from lotto_api import (
    get_last_results_for_lotto, 
    parse_lotto_draw, 
    LottoAPIError, 
    get_results_by_date_range,
    fetch_multiple_draws_by_dates
)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="GetLos_T - Lotto Predictor",
    description="Aplikacja do losowania prognozowanych układów 6 liczb (1-49)",
    version="1.0.0"
)

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:80").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    """Initialize database tables and load schedules from YAML on startup"""
    init_db()
    load_schedules_from_yaml()


def load_schedules_from_yaml():
    """Load draw schedules from YAML file on startup"""
    yaml_file = Path("draw_schedules.yaml")
    
    if not yaml_file.exists():
        return
    
    try:
        with open(yaml_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        if not data or 'schedules' not in data:
            return
        
        db = next(get_db())
        
        # Check if schedules already exist
        existing_count = db.query(DrawSchedule).count()
        if existing_count > 0:
            return
        
        # Add schedules from YAML
        schedules_data = data['schedules']
        for schedule_data in schedules_data:
            schedule = DrawSchedule(
                date_from=schedule_data['date_from'],
                date_to=schedule_data.get('date_to'),
                weekdays=schedule_data['weekdays'],
                description=schedule_data.get('description')
            )
            db.add(schedule)
        
        db.commit()
    except Exception as e:
        print(f"[!] Blad przy ladowaniu harmonogramow z YAML: {e}")




def parse_csv_bytes(b: bytes) -> List[tuple]:
    """
    Parse CSV bytes and extract draw data
    Supports formats:
    - Just 6 numbers: 1,2,3,4,5,6
    - With date: 2024-01-15,1,2,3,4,5,6
    Returns list of tuples: (numbers_list, optional_date_string)
    """
    out = []
    text = b.decode("utf-8", errors="ignore")
    reader = csv.reader(io.StringIO(text))
    
    for row in reader:
        if not row:
            continue
            
        nums = []
        date_str = None
        
        # Check if first cell looks like a date (YYYY-MM-DD or similar)
        first_cell = row[0].strip() if row else ""
        if first_cell and ("-" in first_cell or "/" in first_cell):
            # Likely a date, skip it for number parsing
            date_str = first_cell
            cells_to_parse = row[1:]
        else:
            cells_to_parse = row
        
        # Extract numbers from remaining cells
        for cell in cells_to_parse:
            # Handle different separators
            for token in cell.replace(";", ",").replace(" ", ",").split(","):
                token = token.strip()
                if token.isdigit():
                    n = int(token)
                    if 1 <= n <= 49 and n not in nums:
                        nums.append(n)
                if len(nums) >= 6:
                    break
            if len(nums) >= 6:
                break
        
        if len(nums) >= 6:
            out.append((sorted(nums[:6]), date_str))
    
    return out


def histogram_1_49(rows: List[List[int]]) -> List[int]:
    """Calculate frequency of each number (1-49)"""
    freq = [0] * 49
    for row in rows:
        for n in row:
            freq[n - 1] += 1
    return freq


def get_top_pairs_triples(rows: List[List[int]], top_n: int = 30):
    """
    Return most frequent pairs and triples
    Used for combo_based strategy
    """
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


def pick_with_ai(all_rows: List[List[int]], freq: List[int]) -> List[int]:
    """
    AI-based prediction using machine learning
    Analyzes historical patterns, sequences, and statistical features
    """
    if not all_rows or len(all_rows) < 20:
        # Not enough data for AI, fallback to balanced
        return pick_with_strategy(freq, "balanced", all_rows)
    
    # Prepare features from historical data
    features = []
    labels = []
    
    # Create training data from sequences
    for i in range(len(all_rows) - 1):
        current = all_rows[i]
        next_draw = all_rows[i + 1]
        
        # Features: frequency, sum, even/odd ratio, gaps
        feature_vec = [
            sum(current),  # Sum of numbers
            len([n for n in current if n % 2 == 0]),  # Even count
            max(current) - min(current),  # Range
            freq[current[0] - 1] if current else 0,  # Freq of first number
            freq[current[-1] - 1] if current else 0,  # Freq of last number
        ]
        
        # Add gap features (differences between consecutive numbers)
        gaps = [current[j+1] - current[j] for j in range(len(current)-1)]
        feature_vec.extend(gaps + [0] * (5 - len(gaps)))  # Pad to 5 gaps
        
        features.append(feature_vec)
        
        # Label: binary vector indicating which numbers appeared
        label = [1 if i in next_draw else 0 for i in range(1, 50)]
        labels.append(label)
    
    # Train multiple binary classifiers (one per number)
    X = np.array(features)
    y = np.array(labels)
    
    # Predict probabilities for each number
    predictions = []
    for num_idx in range(49):
        if len(np.unique(y[:, num_idx])) > 1:  # Only if we have both classes
            clf = RandomForestClassifier(n_estimators=10, max_depth=5, random_state=42)
            clf.fit(X, y[:, num_idx])
            
            # Use last draw as input for prediction
            last_draw = all_rows[-1]
            test_feature = [
                sum(last_draw),
                len([n for n in last_draw if n % 2 == 0]),
                max(last_draw) - min(last_draw),
                freq[last_draw[0] - 1],
                freq[last_draw[-1] - 1],
            ]
            gaps = [last_draw[j+1] - last_draw[j] for j in range(len(last_draw)-1)]
            test_feature.extend(gaps + [0] * (5 - len(gaps)))
            
            prob = clf.predict_proba([test_feature])[0][1]  # Probability of appearing
        else:
            prob = freq[num_idx] / (sum(freq) + 1)  # Fallback to frequency
        
        predictions.append((num_idx + 1, prob))
    
    # Sort by probability and select top numbers with some randomness
    predictions.sort(key=lambda x: x[1], reverse=True)
    
    # Smart selection: mix high-probability numbers with some randomness
    picks = set()
    
    # Take top 3 most probable
    for num, _ in predictions[:8]:
        picks.add(num)
        if len(picks) >= 3:
            break
    
    # Add 2-3 numbers from medium probability (weighted random)
    mid_prob = predictions[8:25]
    weights = [p[1] for p in mid_prob]
    if sum(weights) > 0:
        selected = np.random.choice(
            [p[0] for p in mid_prob],
            size=min(3, len(mid_prob)),
            replace=False,
            p=np.array(weights) / sum(weights)
        )
        # Convert numpy.int64 to Python int
        picks.update([int(x) for x in selected])
    
    # Fill remaining if needed
    while len(picks) < 6:
        remaining = [n for n in range(1, 50) if n not in picks]
        picks.add(random.choice(remaining))
    
    # Convert numpy.int64 to Python int (JSON serializable)
    result = [int(x) for x in sorted(list(picks)[:6])]
    return result


def pick_with_strategy(
    freq: List[int], 
    strategy: Strategy, 
    all_rows: Optional[List[List[int]]] = None
) -> List[int]:
    """
    Generate 6 numbers using specified strategy
    
    Strategies:
    - random: Pure random selection
    - hot: Favor frequently drawn numbers
    - cold: Favor rarely drawn numbers
    - balanced: Mix of hot (3) and cold (3) numbers
    - combo_based: Based on frequent pairs/triples
    - ai: Machine learning prediction based on patterns
    """
    universe = list(range(1, 50))
    
    # AI strategy
    if strategy == "ai":
        if all_rows and len(all_rows) >= 20:
            return pick_with_ai(all_rows, freq)
        else:
            # Not enough data, fallback to balanced
            strategy = "balanced"
    
    # Random strategy
    if strategy == "random":
        return sorted(random.sample(universe, 6))
    
    # If no frequency data, fall back to random
    if sum(freq) == 0:
        return sorted(random.sample(universe, 6))
    
    # Hot/Cold strategies
    if strategy in ("hot", "cold"):
        if strategy == "hot":
            weights = [f for f in freq]
        else:  # cold
            max_freq = max(freq)
            weights = [max_freq + 1 - f for f in freq]
        
        weights = [max(w, 1) for w in weights]
        picks = set()
        attempts = 0
        
        while len(picks) < 6 and attempts < 1000:
            n = random.choices(universe, weights=weights, k=1)[0]
            picks.add(n)
            attempts += 1
        
        # Fill remaining if needed
        while len(picks) < 6:
            picks.add(random.choice(universe))
        
        return sorted(list(picks)[:6])
    
    # Balanced strategy
    if strategy == "balanced":
        idx_sorted = sorted(range(49), key=lambda i: freq[i], reverse=True)
        hot_pool = [i + 1 for i in idx_sorted[:13]]
        cold_pool = [i + 1 for i in idx_sorted[-13:]]
        
        picks = set()
        picks.update(random.sample(hot_pool, min(3, len(hot_pool))))
        picks.update(random.sample(cold_pool, min(3, len(cold_pool))))
        
        while len(picks) < 6:
            picks.add(random.randint(1, 49))
        
        return sorted(list(picks)[:6])
    
    # Combo-based strategy
    if strategy == "combo_based":
        if not all_rows:
            return sorted(random.sample(universe, 6))
        
        top_pairs, top_triples = get_top_pairs_triples(all_rows, top_n=30)
        
        # Calculate weights based on pair/triple frequency
        combo_weights = Counter()
        for combo in top_pairs + top_triples:
            for n in combo:
                combo_weights[n] += 1
        
        weights = [combo_weights.get(i, 1) for i in range(1, 53)]
        
        picks = set()
        attempts = 0
        
        while len(picks) < 6 and attempts < 1000:
            n = random.choices(universe, weights=weights, k=1)[0]
            picks.add(n)
            attempts += 1
        
        while len(picks) < 6:
            picks.add(random.choice(universe))
        
        return sorted(list(picks)[:6])
    
    return sorted(random.sample(universe, 6))


def ensure_new_combo(candidate: List[int], forbidden_keys: set[str]) -> List[int]:
    """
    Ensure combination is unique (not in history or picks)
    """
    tries = 0
    cand = candidate
    
    while norm_key(cand) in forbidden_keys:
        cand = sorted(random.sample(range(1, 50), 6))
        tries += 1
        
        if tries > 5000:
            raise RuntimeError("Could not find unique combination after many attempts")
    
    return cand


# ========== API Endpoints ==========

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "app": "GetLos_T",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.post("/upload-csv", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload CSV or JSON file with historical lottery draws
    
    CSV formats supported:
    - Just numbers: 1,2,3,4,5,6
    - With date: 2024-01-15,1,2,3,4,5,6
    
    JSON format (backup):
    {
      "draws": [
        {"numbers": [1,2,3,4,5,6], "date": "2024-01-15"},
        ...
      ]
    }
    """
    filename_lower = file.filename.lower()
    
    # Check if JSON backup file
    if filename_lower.endswith(".json"):
        data = await file.read()
        try:
            backup_data = json.loads(data)
            if not isinstance(backup_data, dict) or "draws" not in backup_data:
                raise HTTPException(400, "Invalid JSON format. Expected: {\"draws\": [...]}")
            
            draws = backup_data.get("draws", [])
            if not draws:
                raise HTTPException(400, "No draws found in JSON backup")
            
            inserted = 0
            duplicates = 0
            keys_seen = set()
            
            for draw in draws:
                nums = draw.get("numbers")
                date_str = draw.get("date")
                
                if not nums or len(nums) != 6:
                    continue
                
                nums_sorted = tuple(sorted(nums))
                k = norm_key(nums_sorted)
                
                if k in keys_seen:
                    duplicates += 1
                    continue
                
                keys_seen.add(k)
                
                # Check if already exists in database
                existing = db.query(HistoricalDraw).filter_by(key=k).first()
                if not existing:
                    draw_data = {
                        "numbers": list(nums_sorted),
                        "key": k,
                        "source": date_str if date_str else "json_backup",
                        "draw_system_id": None
                    }
                    db.add(HistoricalDraw(**draw_data))
                    inserted += 1
                else:
                    duplicates += 1
            
            db.commit()
            
            return UploadResponse(
                success=True,
                total_processed=len(draws),
                new_draws=inserted,
                duplicates=duplicates,
                message=f"Successfully imported {inserted} new draws from JSON backup, {duplicates} duplicates skipped"
            )
            
        except json.JSONDecodeError:
            raise HTTPException(400, "Invalid JSON file")
    
    # CSV handling
    if not filename_lower.endswith(".csv"):
        raise HTTPException(400, "File must be CSV or JSON format")
    
    data = await file.read()
    rows = parse_csv_bytes(data)
    
    if not rows:
        raise HTTPException(400, "No valid 6-number rows found in CSV")
    
    inserted = 0
    duplicates = 0
    keys_seen = set()
    
    for nums, date_str in rows:
        k = norm_key(nums)
        if k in keys_seen:
            duplicates += 1
            continue
        
        keys_seen.add(k)
        
        # Check if already exists in database
        existing = db.query(HistoricalDraw).filter_by(key=k).first()
        if not existing:
            draw_data = {
                "numbers": nums,
                "key": k,
                "source": date_str if date_str else "csv_upload",
                "draw_system_id": None  # CSV uploads don't have draw system ID
            }
            db.add(HistoricalDraw(**draw_data))
            inserted += 1
        else:
            duplicates += 1
    
    db.commit()
    
    return UploadResponse(
        success=True,
        total_processed=len(rows),
        new_draws=inserted,
        duplicates=duplicates,
        message=f"Successfully added {inserted} new draws, {duplicates} duplicates skipped"
    )


@app.get("/stats", response_model=Stats)
def get_stats(db: Session = Depends(get_db)):
    """
    Get statistics about historical draws
    """
    all_draws = db.query(HistoricalDraw).all()
    all_picks = db.query(Pick).all()
    all_rows = [draw.numbers for draw in all_draws]
    
    if not all_rows:
        return Stats(
            total_draws=0,
            total_picks=len(all_picks),
            coverage_pct=0.0,
            freq=[0] * 49,
            min_sum=0,
            max_sum=0,
            avg_sum=0.0,
            most_frequent=[],
            least_frequent=[]
        )
    
    freq = histogram_1_49(all_rows)
    total_combinations = math.comb(49, 6)
    
    # Get most and least frequent numbers
    freq_with_nums = [(i + 1, f) for i, f in enumerate(freq)]
    most_freq = sorted(freq_with_nums, key=lambda x: x[1], reverse=True)[:10]
    least_freq = sorted(freq_with_nums, key=lambda x: x[1])[:10]
    
    return Stats(
        total_draws=len(all_rows),
        total_picks=len(all_picks),
        coverage_pct=round(100.0 * len(all_rows) / total_combinations, 10),
        freq=freq,
        min_sum=min((sum(r) for r in all_rows)),
        max_sum=max((sum(r) for r in all_rows)),
        avg_sum=round(sum(sum(r) for r in all_rows) / len(all_rows), 2),
        most_frequent=most_freq,
        least_frequent=least_freq
    )


@app.post("/generate", response_model=List[PickResponse])
def generate_picks(
    request: GenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generate new lottery picks using specified strategy
    """
    # Get forbidden keys (history + existing picks)
    hist_keys = {h.key for h in db.query(HistoricalDraw.key).all()}
    pick_keys = {p.key for p in db.query(Pick.key).all()}
    forbidden = hist_keys | pick_keys
    
    # Get historical data for strategy
    all_rows = [h.numbers for h in db.query(HistoricalDraw).all()]
    freq = histogram_1_49(all_rows) if all_rows else [0] * 49
    
    results = []
    
    for _ in range(request.count):
        # Generate candidate
        candidate = pick_with_strategy(freq, request.strategy, all_rows)
        
        # Ensure uniqueness
        candidate = ensure_new_combo(candidate, forbidden)
        k = norm_key(candidate)
        
        # Save to database
        new_pick = Pick(
            numbers=candidate,
            key=k,
            strategy=request.strategy
        )
        db.add(new_pick)
        forbidden.add(k)
        results.append(new_pick)
    
    db.commit()
    
    # Refresh to get created_at timestamps
    for pick in results:
        db.refresh(pick)
    
    return results


@app.post("/add-pick", response_model=PickResponse)
def add_custom_pick(payload: Numbers, db: Session = Depends(get_db)):
    """
    Add a custom pick manually (must be unique)
    """
    numbers = payload.numbers
    k = norm_key(numbers)
    
    # Check if already exists in history or picks
    exists_in_history = db.query(HistoricalDraw).filter_by(key=k).first() is not None
    exists_in_picks = db.query(Pick).filter_by(key=k).first() is not None
    
    if exists_in_history:
        raise HTTPException(400, "These numbers already exist in historical draws")
    
    if exists_in_picks:
        raise HTTPException(400, "These numbers already exist in generated picks")
    
    # Add new pick
    new_pick = Pick(
        numbers=numbers,
        key=k,
        strategy="manual"
    )
    db.add(new_pick)
    db.commit()
    db.refresh(new_pick)
    
    return new_pick


@app.get("/picks")
def list_picks(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    List generated picks with pagination (most recent first)
    Returns paginated response with total count
    """
    total = db.query(Pick).count()
    picks = db.query(Pick).order_by(Pick.created_at.desc()).offset(offset).limit(limit).all()
    page = (offset // limit) + 1 if limit > 0 else 1
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    
    return {
        "items": picks,
        "total": total,
        "page": page,
        "per_page": limit,
        "total_pages": total_pages
    }


@app.get("/draws")
def list_draws(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    List historical draws with pagination (most recent draws first)
    Sorts by source field (YYYY-MM-DD date) if available, otherwise by created_at
    Returns paginated response with total count
    """
    total = db.query(HistoricalDraw).count()
    draws = db.query(HistoricalDraw).order_by(
        HistoricalDraw.source.desc().nullslast(),
        HistoricalDraw.created_at.desc()
    ).offset(offset).limit(limit).all()
    page = (offset // limit) + 1 if limit > 0 else 1
    total_pages = (total + limit - 1) // limit if limit > 0 else 1
    
    return {
        "items": draws,
        "total": total,
        "page": page,
        "per_page": limit,
        "total_pages": total_pages
    }


# ========== DELETE Endpoints - /all MUST come before /{id} ==========

@app.delete("/picks/all")
def clear_all_picks(db: Session = Depends(get_db)):
    """
    Clear all generated picks
    """
    count = db.query(Pick).count()
    db.query(Pick).delete()
    db.commit()
    
    return {"success": True, "deleted": count}


@app.delete("/draws/all")
def clear_all_draws(db: Session = Depends(get_db)):
    """
    Clear all historical draws (use with caution!)
    """
    count = db.query(HistoricalDraw).count()
    db.query(HistoricalDraw).delete()
    db.commit()
    
    return {"success": True, "deleted": count}


@app.delete("/draws/batch")
def delete_draws_batch(request: BatchDeleteRequest, db: Session = Depends(get_db)):
    """
    Delete multiple historical draws at once
    """
    if not request.ids:
        return {"success": True, "deleted": 0}
    
    deleted = db.query(HistoricalDraw).filter(HistoricalDraw.id.in_(request.ids)).delete(synchronize_session=False)
    db.commit()
    
    return {"success": True, "deleted": deleted}


@app.delete("/draws/{draw_id}")
def delete_draw(draw_id: int, db: Session = Depends(get_db)):
    """
    Delete a specific historical draw
    """
    draw = db.get(HistoricalDraw, draw_id)
    if not draw:
        raise HTTPException(404, "Draw not found")
    
    db.delete(draw)
    db.commit()
    
    return {"success": True, "message": "Draw deleted"}


@app.delete("/picks/batch")
def delete_picks_batch(request: BatchDeleteRequest, db: Session = Depends(get_db)):
    """
    Delete multiple picks at once
    """
    if not request.ids:
        return {"success": True, "deleted": 0}
    
    deleted = db.query(Pick).filter(Pick.id.in_(request.ids)).delete(synchronize_session=False)
    db.commit()
    
    return {"success": True, "deleted": deleted}


@app.delete("/picks/{pick_id}")
def delete_pick(pick_id: int, db: Session = Depends(get_db)):
    """
    Delete a specific pick
    """
    pick = db.get(Pick, pick_id)
    if not pick:
        raise HTTPException(404, "Pick not found")
    
    db.delete(pick)
    db.commit()
    
    return {"success": True, "message": "Pick deleted"}


@app.post("/validate", response_model=dict)
def validate_numbers(payload: Numbers, db: Session = Depends(get_db)):
    """
    Validate a set of numbers and check if it exists in history
    """
    numbers = payload.numbers
    k = norm_key(numbers)
    
    exists_in_history = db.query(HistoricalDraw).filter_by(key=k).first() is not None
    exists_in_picks = db.query(Pick).filter_by(key=k).first() is not None
    
    return {
        "numbers": numbers,
        "key": k,
        "exists_in_history": exists_in_history,
        "exists_in_picks": exists_in_picks,
        "is_unique": not (exists_in_history or exists_in_picks)
    }


@app.get("/pairtriple-stats")
def pairtriple_stats(limit: int = 20, db: Session = Depends(get_db)):
    """
    Get most frequent pairs and triples from historical data
    """
    all_rows = [h.numbers for h in db.query(HistoricalDraw).all()]
    
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


@app.post("/sync-lotto", response_model=SyncLottoResponse)
async def sync_lotto_results(db: Session = Depends(get_db)):
    """
    Synchronize lottery results with Lotto.pl official API
    
    This endpoint:
    1. Fetches the latest draw from API (gets newest drawSystemId)
    2. Checks highest drawSystemId in database
    3. Fills gaps by fetching draws for missing dates (Tue, Thu, Sat)
    
    Uses drawSystemId to track which draws are missing and avoid duplicates.
    
    Requirements:
    - LOTTO_API_SECRET_KEY must be configured in .env
    - Get your API key from: kontakt@lotto.pl
    """
    try:
        # Step 1: Fetch latest result to get the newest draw system ID
        latest_api_results = await get_last_results_for_lotto(limit=1)
        
        if not latest_api_results:
            return SyncLottoResponse(
                success=True,
                new_draws=0,
                message="No results available from Lotto.pl API"
            )
        
        # Parse the latest draw
        latest_parsed = None
        for draw_data in latest_api_results:
            parsed = parse_lotto_draw(draw_data)
            if parsed:
                latest_parsed = parsed
                break
        
        if not latest_parsed:
            return SyncLottoResponse(
                success=True,
                new_draws=0,
                message="Could not parse API response"
            )
        
        latest_api_id = latest_parsed["draw_system_id"]
        latest_api_date = latest_parsed["draw_date"]
        
        # Step 2: Check our database for the highest draw_system_id
        max_db_draw = db.query(HistoricalDraw).filter(
            HistoricalDraw.draw_system_id.isnot(None)
        ).order_by(
            HistoricalDraw.draw_system_id.desc()
        ).first()
        
        max_db_id = max_db_draw.draw_system_id if max_db_draw else 0
        max_db_date = max_db_draw.source if max_db_draw else None
        
        # Step 3: Check if we need to fetch anything
        if latest_api_id and max_db_id >= latest_api_id:
            return SyncLottoResponse(
                success=True,
                new_draws=0,
                message=f"Database is up to date (latest draw ID: {max_db_id})"
            )
        
        # Step 4: Calculate date range for missing draws
        # If we have draws in DB, start from day after last draw
        # Otherwise, fetch last 30 days
        if max_db_date:
            start_date = datetime.fromisoformat(max_db_date) + timedelta(days=1)
        else:
            start_date = datetime.now() - timedelta(days=30)
        
        end_date = datetime.fromisoformat(latest_api_date) if latest_api_date else datetime.now()
        
        # Step 5: Fetch all draws in the date range (only Tue, Thu, Sat)
        api_results = await fetch_multiple_draws_by_dates(start_date, end_date)
        
        # Step 6: Process and add new draws
        new_draws_count = 0
        latest_synced_date = None
        
        for draw_data in api_results:
            parsed = parse_lotto_draw(draw_data)
            
            if not parsed or not parsed["numbers"]:
                continue
            
            numbers = parsed["numbers"]
            draw_date = parsed["draw_date"]
            draw_sys_id = parsed["draw_system_id"]
            
            # Check if this draw already exists (by key OR draw_system_id)
            key = norm_key(numbers)
            existing = db.query(HistoricalDraw).filter(
                (HistoricalDraw.key == key) | 
                (HistoricalDraw.draw_system_id == draw_sys_id)
            ).first()
            
            if existing:
                # Update draw_system_id if missing
                if not existing.draw_system_id and draw_sys_id:
                    existing.draw_system_id = draw_sys_id
                    db.commit()
                continue
            
            # Get next sequential ID
            max_seq = db.query(func.max(HistoricalDraw.sequential_id)).scalar() or 0
            
            # Add new draw
            new_draw = HistoricalDraw(
                numbers=numbers,
                key=key,
                source=draw_date,
                draw_system_id=draw_sys_id,
                sequential_id=max_seq + 1
            )
            db.add(new_draw)
            new_draws_count += 1
            
            if not latest_synced_date or (draw_date and draw_date > latest_synced_date):
                latest_synced_date = draw_date
        
        db.commit()
        
        message = f"Successfully synced {new_draws_count} new draw(s) from Lotto.pl"
        if new_draws_count == 0:
            message = "Database is up to date. No new draws found."
        
        return SyncLottoResponse(
            success=True,
            new_draws=new_draws_count,
            latest_draw_date=latest_synced_date,
            message=message
        )
        
    except LottoAPIError as e:
        return SyncLottoResponse(
            success=False,
            new_draws=0,
            message="Failed to sync with Lotto.pl API",
            error=str(e)
        )
    except Exception as e:
        return SyncLottoResponse(
            success=False,
            new_draws=0,
            message="Unexpected error during sync",
            error=str(e)
        )


@app.post("/manual-draw", response_model=UploadResponse)
def add_manual_draw(request: ManualDrawRequest, db: Session = Depends(get_db)):
    """
    Manually add one or more lottery draws
    
    Use this when:
    - Sync with Lotto.pl is not working
    - You have results from other sources
    - You want to add historical data manually
    
    Example request:
    {
        "draws": [
            {"numbers": [5, 12, 23, 34, 45, 49], "date": "2024-01-15"},
            {"numbers": [3, 17, 28, 31, 42, 50], "date": "2024-01-12"}
        ]
    }
    """
    inserted = 0
    duplicates = 0
    
    for draw in request.draws:
        numbers = sorted(draw["numbers"])
        date_str = draw.get("date", None)
        
        # Create key
        key = norm_key(numbers)
        
        # Check if already exists
        existing = db.query(HistoricalDraw).filter_by(key=key).first()
        
        if existing:
            duplicates += 1
            continue
        
        # Get next sequential ID
        max_seq = db.query(func.max(HistoricalDraw.sequential_id)).scalar() or 0
        
        # Add new draw
        new_draw = HistoricalDraw(
            numbers=numbers,
            key=key,
            source=date_str if date_str else "manual_entry",
            draw_system_id=None,  # Manual entries don't have draw system ID
            sequential_id=max_seq + 1
        )
        db.add(new_draw)
        inserted += 1
    
    db.commit()
    
    return UploadResponse(
        success=True,
        total_processed=len(request.draws),
        new_draws=inserted,
        duplicates=duplicates,
        message=f"Successfully added {inserted} new draw(s), {duplicates} duplicate(s) skipped"
    )


@app.get("/export-draws")
def export_draws_to_json(db: Session = Depends(get_db)):
    """
    Export all historical draws to JSON format
    Use this to backup your database
    """
    draws = db.query(HistoricalDraw).order_by(HistoricalDraw.source.desc()).all()
    
    export_data = [
        {
            "numbers": draw.numbers,
            "date": draw.source,
            "created_at": draw.created_at.isoformat() if draw.created_at else None
        }
        for draw in draws
    ]
    
    return {
        "success": True,
        "count": len(export_data),
        "draws": export_data,
        "exported_at": datetime.now().isoformat()
    }


@app.post("/import-draws", response_model=BackupResponse)
def import_draws_from_json(draws_data: dict, db: Session = Depends(get_db)):
    """
    Import draws from JSON backup
    
    Example request:
    {
        "draws": [
            {"numbers": [5,12,23,34,45,49], "date": "2024-01-15"},
            {"numbers": [3,17,28,31,42,50], "date": "2024-01-12"}
        ]
    }
    """
    try:
        if "draws" not in draws_data:
            return BackupResponse(
                success=False,
                count=0,
                message="Invalid format: 'draws' field required",
                error="Missing 'draws' array"
            )
        
        draws = draws_data["draws"]
        inserted = 0
        
        # Sort draws by date to assign sequential IDs
        draws_with_dates = []
        for draw in draws:
            if "numbers" not in draw:
                continue
            date_str = draw.get("date")
            if date_str:
                draws_with_dates.append((date_str, draw))
        
        # Sort by date (oldest first)
        draws_with_dates.sort(key=lambda x: x[0])
        
        # Get current max sequential_id
        max_seq = db.query(func.max(HistoricalDraw.sequential_id)).scalar() or 0
        current_seq = max_seq
        
        for date_str, draw in draws_with_dates:
            numbers = sorted(draw["numbers"])
            
            # Create key
            key = norm_key(numbers)
            
            # Check if already exists
            existing = db.query(HistoricalDraw).filter_by(key=key).first()
            if existing:
                continue
            
            # Increment sequential ID
            current_seq += 1
            
            # Add new draw with sequential ID
            new_draw = HistoricalDraw(
                numbers=numbers,
                key=key,
                source=date_str,
                draw_system_id=None,  # Imported data doesn't have draw system ID
                sequential_id=current_seq
            )
            db.add(new_draw)
            inserted += 1
        
        db.commit()
        
        return BackupResponse(
            success=True,
            count=inserted,
            message=f"Successfully imported {inserted} draw(s)"
        )
        
    except Exception as e:
        return BackupResponse(
            success=False,
            count=0,
            message="Import failed",
            error=str(e)
        )


def get_expected_weekdays_for_date(date_obj: datetime.date, db: Session) -> List[int]:
    """
    Get expected weekdays for draws based on date and configured schedules
    Returns list of weekday numbers (0=Mon, 1=Tue, ..., 6=Sun)
    If no schedule found, returns default [1, 3, 5] (Tue, Thu, Sat)
    """
    schedules = db.query(DrawSchedule).order_by(DrawSchedule.date_from).all()
    
    if not schedules:
        # Default: Tue, Thu, Sat
        return [1, 3, 5]
    
    date_str = str(date_obj)
    
    # Find matching schedule for this date
    for schedule in schedules:
        from_date = schedule.date_from
        to_date = schedule.date_to or "9999-12-31"  # No end = ongoing
        
        if from_date <= date_str <= to_date:
            return schedule.weekdays
    
    # If before all schedules, use first schedule's days
    if date_str < schedules[0].date_from:
        return schedules[0].weekdays
    
    # If after all schedules, use last schedule's days
    return schedules[-1].weekdays


@app.get("/verify-integrity", response_model=IntegrityReport)
def verify_integrity(db: Session = Depends(get_db)):
    """
    Verify data integrity and report issues
    
    Checks for:
    - Duplicate draws (same numbers or draw_system_id)
    - Missing dates (gaps in Tuesday/Thursday/Saturday draws)
    - Gaps in draw_system_id sequence
    - Broken sequential_id numbering
    """
    issues = []
    
    # Get all draws ordered by date
    all_draws = db.query(HistoricalDraw).filter(
        HistoricalDraw.source.isnot(None)
    ).order_by(HistoricalDraw.source).all()
    
    total_draws = len(all_draws)
    
    if total_draws == 0:
        return IntegrityReport(
            success=True,
            has_issues=False,
            total_draws=0,
            issues=[],
            summary="No draws to verify"
        )
    
    # 1. Check for duplicates by key
    seen_keys = {}
    duplicate_count = 0
    for draw in all_draws:
        if draw.key in seen_keys:
            duplicate_count += 1
            issues.append(IntegrityIssue(
                type="duplicate",
                severity="error",
                description=f"Duplicate draw found: {draw.numbers} (date: {draw.source})",
                details={"id": draw.id, "duplicate_of": seen_keys[draw.key], "key": draw.key}
            ))
        else:
            seen_keys[draw.key] = draw.id
    
    # 2. Check for duplicates by draw_system_id
    draws_with_api_id = [d for d in all_draws if d.draw_system_id is not None]
    if draws_with_api_id:
        seen_api_ids = {}
        for draw in draws_with_api_id:
            if draw.draw_system_id in seen_api_ids:
                duplicate_count += 1
                issues.append(IntegrityIssue(
                    type="duplicate",
                    severity="error",
                    description=f"Duplicate draw_system_id: {draw.draw_system_id}",
                    details={"id": draw.id, "duplicate_of": seen_api_ids[draw.draw_system_id]}
                ))
            else:
                seen_api_ids[draw.draw_system_id] = draw.id
    
    # 3. Check for gaps in draw_system_id
    if draws_with_api_id and len(draws_with_api_id) > 1:
        api_ids = sorted([d.draw_system_id for d in draws_with_api_id])
        min_id, max_id = api_ids[0], api_ids[-1]
        expected_count = max_id - min_id + 1
        actual_count = len(set(api_ids))
        
        if actual_count < expected_count:
            missing_count = expected_count - actual_count
            issues.append(IntegrityIssue(
                type="gap_in_sequence",
                severity="warning",
                description=f"Missing {missing_count} draw(s) in draw_system_id sequence ({min_id}-{max_id})",
                details={"min_id": min_id, "max_id": max_id, "missing_count": missing_count}
            ))
    
    # 4. Check for missing dates (gaps in draw schedule)
    # Only check from 2007 onwards (when API has reliable data)
    # Uses configured draw schedules to determine expected days
    API_RELIABLE_START_DATE_CHECK = datetime(2007, 1, 1).date()
    
    draws_with_dates = db.query(HistoricalDraw).filter(
        HistoricalDraw.source.isnot(None)
    ).order_by(HistoricalDraw.source).all()
    
    if len(draws_with_dates) > 1:
        try:
            dates = [datetime.fromisoformat(d.source).date() for d in draws_with_dates if d.source and len(d.source) == 10]
            if dates:
                # Use API reliable start date or actual min date, whichever is later
                min_date = max(min(dates), API_RELIABLE_START_DATE_CHECK)
                max_date = max(dates)
                
                # Generate expected dates using dynamic schedules
                expected_dates = []
                current = min_date
                while current <= max_date:
                    expected_weekdays = get_expected_weekdays_for_date(current, db)
                    if current.weekday() in expected_weekdays:
                        expected_dates.append(current)
                    current += timedelta(days=1)
                
                actual_dates = set(dates)
                missing_dates = [d for d in expected_dates if d not in actual_dates]
                
                if missing_dates:
                    # Include full list of missing dates for detailed view
                    missing_dates_str = [str(d) for d in missing_dates]

                    # Add harmonogram context for missing dates
                    # Group missing dates by applicable harmonogram
                    schedule_contexts = []
                    for missing_date in missing_dates:
                        schedule = db.query(DrawSchedule).filter(
                            DrawSchedule.date_from <= missing_date,
                            DrawSchedule.date_to >= missing_date
                        ).first()

                        if schedule:
                            weekdays_names = []
                            for wd in sorted(schedule.weekdays):
                                wd_name = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][wd]
                                weekdays_names.append(wd_name[:3])

                            context = f"Period {schedule.date_from}-{schedule.date_to}: scheduled {', '.join(weekdays_names)}"
                            if context not in schedule_contexts:
                                schedule_contexts.append(context)

                    issues.append(IntegrityIssue(
                        type="missing_date",
                        severity="warning",
                        description=f"Missing {len(missing_dates)} draw date(s) between {min_date} and {max_date}",
                        details={
                            "count": len(missing_dates),
                            "first_missing": str(missing_dates[0]),
                            "last_missing": str(missing_dates[-1]),
                            "missing_dates": missing_dates_str,
                            "schedule_context": schedule_contexts
                        }
                    ))
        except ValueError:
            pass  # Skip if dates are invalid
    
    # 5. Check sequential_id integrity
    draws_with_seq = [d for d in all_draws if d.sequential_id is not None]
    if draws_with_seq:
        seq_ids = [d.sequential_id for d in draws_with_seq]
        expected_seq = list(range(1, len(draws_with_seq) + 1))
        
        if sorted(seq_ids) != expected_seq:
            issues.append(IntegrityIssue(
                type="broken_sequential_id",
                severity="warning",
                description="Sequential IDs are not continuous 1,2,3...",
                details={"expected_max": len(draws_with_seq), "actual_ids": len(set(seq_ids))}
            ))
    
    # Generate summary
    has_issues = len(issues) > 0
    if has_issues:
        error_count = len([i for i in issues if i.severity == "error"])
        warning_count = len([i for i in issues if i.severity == "warning"])
        summary = f"Found {error_count} error(s) and {warning_count} warning(s)"
    else:
        summary = "No integrity issues found"
    
    # Calculate reference metadata
    API_RELIABLE_START_DATE = datetime(2007, 1, 1).date()
    lottery_start_date = None
    lottery_start_sequential_id = None
    api_reliable_start_sequential_id = None
    historical_era_draws_count = None
    
    if all_draws:
        # Find oldest draw
        oldest_draw = all_draws[0]
        lottery_start_date = oldest_draw.source
        lottery_start_sequential_id = oldest_draw.sequential_id
        
        # Find first draw from API reliable era
        for draw in all_draws:
            try:
                draw_date = datetime.fromisoformat(draw.source).date()
                if draw_date >= API_RELIABLE_START_DATE:
                    api_reliable_start_sequential_id = draw.sequential_id
                    break
            except (ValueError, AttributeError):
                continue
        
        # Count draws in historical era (before 2007)
        historical_era_draws_count = sum(1 for d in all_draws 
            if d.source and datetime.fromisoformat(d.source).date() < API_RELIABLE_START_DATE)
    
    # Save to config.yaml
    try:
        import yaml
        from pathlib import Path
        
        config_path = Path(__file__).parent / "config.yaml"
        config_data = {
            "lottery_start_date": lottery_start_date,
            "lottery_start_sequential_id": lottery_start_sequential_id,
            "api_reliable_start_date": str(API_RELIABLE_START_DATE),
            "api_reliable_start_sequential_id": api_reliable_start_sequential_id,
            "historical_era_draws_count": historical_era_draws_count,
            "historical_era_end_date": str(API_RELIABLE_START_DATE - timedelta(days=1)),
            "last_verified_date": datetime.now().isoformat(),
            "total_draws_count": total_draws,
            "version": "1.0"
        }
        
        with open(config_path, 'w') as f:
            yaml.dump(config_data, f, default_flow_style=False, allow_unicode=True)
    except Exception:
        pass  # Non-critical if config save fails
    
    return IntegrityReport(
        success=True,
        has_issues=has_issues,
        total_draws=total_draws,
        issues=issues,
        summary=summary,
        lottery_start_date=lottery_start_date,
        lottery_start_sequential_id=lottery_start_sequential_id,
        api_reliable_start_date=str(API_RELIABLE_START_DATE),
        api_reliable_start_sequential_id=api_reliable_start_sequential_id,
        historical_era_draws_count=historical_era_draws_count
    )


@app.post("/check-missing-dates")
async def check_missing_dates(dates: List[str], db: Session = Depends(get_db)):
    """
    Check if missing dates actually exist in Lotto.pl API
    Returns status for each date: exists_in_api, exists_in_db, should_add
    """
    from schema import Numbers
    
    results = []
    
    for date_str in dates:
        try:
            date_obj = datetime.fromisoformat(date_str).date()
            
            # Check if exists in database
            exists_in_db = db.query(HistoricalDraw).filter(
                HistoricalDraw.source == date_str
            ).first() is not None
            
            # Check API
            exists_in_api = False
            api_numbers = None
            api_draw_id = None
            
            try:
                api_results = await fetch_multiple_draws_by_dates(date_obj, date_obj)
                if api_results:
                    parsed = parse_lotto_draw(api_results[0])
                    if parsed and parsed["numbers"]:
                        exists_in_api = True
                        api_numbers = parsed["numbers"]
                        api_draw_id = parsed["draw_system_id"]
            except Exception:
                pass
            
            results.append({
                "date": date_str,
                "exists_in_db": exists_in_db,
                "exists_in_api": exists_in_api,
                "should_add": exists_in_api and not exists_in_db,
                "api_numbers": api_numbers,
                "api_draw_id": api_draw_id,
                "weekday": date_obj.strftime("%A")
            })
            
        except Exception as e:
            results.append({
                "date": date_str,
                "exists_in_db": False,
                "exists_in_api": False,
                "should_add": False,
                "error": str(e)
            })
    
    return {
        "success": True,
        "total_checked": len(dates),
        "results": results
    }


@app.post("/fix-integrity", response_model=IntegrityFixResponse)
async def fix_integrity(db: Session = Depends(get_db)):
    """
    Automatically fix data integrity issues
    
    Actions:
    - Remove duplicate draws (keeps oldest by created_at)
    - Fill gaps in draw dates by fetching from Lotto.pl API
    - Renumber sequential_ids to be continuous 1,2,3...
    """
    try:
        duplicates_removed = 0
        gaps_filled = 0
        
        # 1. Remove duplicates by key
        all_draws = db.query(HistoricalDraw).order_by(HistoricalDraw.created_at).all()
        seen_keys = {}
        to_delete = []
        
        for draw in all_draws:
            if draw.key in seen_keys:
                to_delete.append(draw.id)
                duplicates_removed += 1
            else:
                seen_keys[draw.key] = draw.id
        
        if to_delete:
            db.query(HistoricalDraw).filter(HistoricalDraw.id.in_(to_delete)).delete(synchronize_session=False)
            db.commit()
        
        # 2. Remove duplicates by draw_system_id
        draws_with_api_id = db.query(HistoricalDraw).filter(
            HistoricalDraw.draw_system_id.isnot(None)
        ).order_by(HistoricalDraw.created_at).all()
        
        seen_api_ids = {}
        to_delete_api = []
        
        for draw in draws_with_api_id:
            if draw.draw_system_id in seen_api_ids:
                to_delete_api.append(draw.id)
                duplicates_removed += 1
            else:
                seen_api_ids[draw.draw_system_id] = draw.id
        
        if to_delete_api:
            db.query(HistoricalDraw).filter(HistoricalDraw.id.in_(to_delete_api)).delete(synchronize_session=False)
            db.commit()
        
        # 3. Fill gaps by fetching from API (only from 2007 onwards)
        API_RELIABLE_START_DATE = datetime(2007, 1, 1).date()
        
        draws_with_dates = db.query(HistoricalDraw).filter(
            HistoricalDraw.source.isnot(None)
        ).order_by(HistoricalDraw.source).all()
        
        if len(draws_with_dates) > 1:
            try:
                dates = [datetime.fromisoformat(d.source).date() for d in draws_with_dates if d.source and len(d.source) == 10]
                if dates:
                    # Only check for gaps from API reliable start date onwards
                    min_date = max(min(dates), API_RELIABLE_START_DATE)
                    max_date = max(dates)
                    
                    # Generate missing dates using dynamic schedules
                    expected_dates = []
                    current = min_date
                    while current <= max_date:
                        expected_weekdays = get_expected_weekdays_for_date(current, db)
                        if current.weekday() in expected_weekdays:
                            expected_dates.append(current)
                        current += timedelta(days=1)
                    
                    actual_dates = set(dates)
                    missing_dates = [d for d in expected_dates if d not in actual_dates]
                    
                    # Fetch missing draws from API
                    if missing_dates:
                        # Increase limit to 50 at a time
                        for missing_date in missing_dates[:50]:
                            try:
                                api_results = await fetch_multiple_draws_by_dates(missing_date, missing_date)
                                
                                for draw_data in api_results:
                                    parsed = parse_lotto_draw(draw_data)
                                    if parsed and parsed["numbers"]:
                                        key = norm_key(parsed["numbers"])
                                        
                                        # Check if not exists (by key and draw_system_id)
                                        existing_by_key = db.query(HistoricalDraw).filter_by(key=key).first()
                                        existing_by_api_id = None
                                        if parsed["draw_system_id"]:
                                            existing_by_api_id = db.query(HistoricalDraw).filter_by(
                                                draw_system_id=parsed["draw_system_id"]
                                            ).first()
                                        
                                        if not existing_by_key and not existing_by_api_id:
                                            max_seq = db.query(func.max(HistoricalDraw.sequential_id)).scalar() or 0
                                            new_draw = HistoricalDraw(
                                                numbers=parsed["numbers"],
                                                key=key,
                                                source=parsed["draw_date"],
                                                draw_system_id=parsed["draw_system_id"],
                                                sequential_id=max_seq + 1
                                            )
                                            db.add(new_draw)
                                            gaps_filled += 1
                            except Exception:
                                continue  # Skip this date if API fails
                        
                        db.commit()
            except Exception:
                pass  # Skip if date parsing fails
        
        # 4. Renumber sequential_ids
        all_draws_sorted = db.query(HistoricalDraw).filter(
            HistoricalDraw.source.isnot(None)
        ).order_by(HistoricalDraw.source).all()
        
        sequential_ids_fixed = 0
        for idx, draw in enumerate(all_draws_sorted, start=1):
            if draw.sequential_id != idx:
                draw.sequential_id = idx
                sequential_ids_fixed += 1
        
        db.commit()
        
        message = f"Fixed: {duplicates_removed} duplicates removed"
        if gaps_filled > 0:
            message += f", {gaps_filled} gaps filled"
        if sequential_ids_fixed > 0:
            message += f", {sequential_ids_fixed} sequential IDs renumbered"
        
        return IntegrityFixResponse(
            success=True,
            duplicates_removed=duplicates_removed,
            gaps_filled=gaps_filled,
            sequential_ids_fixed=sequential_ids_fixed,
            message=message
        )
        
    except Exception as e:
        return IntegrityFixResponse(
            success=False,
            duplicates_removed=0,
            gaps_filled=0,
            sequential_ids_fixed=0,
            message="Fix failed",
            error=str(e)
        )


# ========== Draw Schedule Management ==========

@app.get("/draw-schedules", response_model=List[DrawScheduleResponse])
def list_draw_schedules(db: Session = Depends(get_db)):
    """Get all configured draw schedules ordered by date_from"""
    schedules = db.query(DrawSchedule).order_by(DrawSchedule.date_from).all()
    return schedules


@app.post("/draw-schedules", response_model=DrawScheduleResponse)
def create_draw_schedule(schedule: DrawScheduleCreate, db: Session = Depends(get_db)):
    """Create new draw schedule period"""
    new_schedule = DrawSchedule(
        date_from=schedule.date_from,
        date_to=schedule.date_to,
        weekdays=schedule.weekdays,
        description=schedule.description
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule


@app.put("/draw-schedules/{schedule_id}", response_model=DrawScheduleResponse)
def update_draw_schedule(schedule_id: int, schedule: DrawScheduleCreate, db: Session = Depends(get_db)):
    """Update existing draw schedule"""
    existing = db.query(DrawSchedule).filter_by(id=schedule_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    existing.date_from = schedule.date_from
    existing.date_to = schedule.date_to
    existing.weekdays = schedule.weekdays
    existing.description = schedule.description
    db.commit()
    db.refresh(existing)
    return existing


@app.delete("/draw-schedules/{schedule_id}")
def delete_draw_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Delete draw schedule"""
    schedule = db.query(DrawSchedule).filter_by(id=schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    db.delete(schedule)
    db.commit()
    return {"success": True, "message": f"Schedule {schedule_id} deleted"}


@app.post("/draw-schedules/initialize")
def initialize_default_schedules(db: Session = Depends(get_db)):
    """Initialize with default Lotto schedule (current: Tue, Thu, Sat)"""
    # Check if any schedules exist
    existing_count = db.query(DrawSchedule).count()
    if existing_count > 0:
        return {"success": False, "message": "Schedules already exist", "count": existing_count}
    
    # Add default schedule for modern era (2017-present: Tue, Thu, Sat)
    default_schedule = DrawSchedule(
        date_from="2017-01-01",
        date_to=None,  # ongoing
        weekdays=[1, 3, 5],  # Tuesday, Thursday, Saturday
        description="Era współczesna (wt, czw, sob)"
    )
    db.add(default_schedule)
    db.commit()
    
    return {"success": True, "message": "Default schedule created", "count": 1}


@app.post("/check-pick-hits")
def check_pick_hits(db: Session = Depends(get_db)):
    """
    Check all picks against historical draws to see if any numbers matched.
    Returns list of picks with their best matches in history.
    """
    from collections import defaultdict
    
    picks = db.query(Pick).all()
    draws = db.query(HistoricalDraw).filter(HistoricalDraw.source.isnot(None)).all()
    
    results = []
    
    for pick in picks:
        pick_numbers = set(pick.numbers)
        best_match = {
            "pick_id": pick.id,
            "pick_numbers": pick.numbers,
            "pick_key": pick.key,
            "pick_strategy": pick.strategy,
            "pick_created_at": pick.created_at.isoformat(),
            "best_hit_count": 0,
            "matches": []
        }
        
        # Check against all draws
        for draw in draws:
            draw_numbers = set(draw.numbers)
            hit_count = len(pick_numbers & draw_numbers)
            
            if hit_count >= 3:  # Only report 3+ matches
                match_info = {
                    "draw_id": draw.id,
                    "draw_numbers": draw.numbers,
                    "draw_date": draw.source,
                    "draw_sequential_id": draw.sequential_id,
                    "hit_count": hit_count,
                    "matched_numbers": sorted(list(pick_numbers & draw_numbers))
                }
                best_match["matches"].append(match_info)
                
                if hit_count > best_match["best_hit_count"]:
                    best_match["best_hit_count"] = hit_count
        
        # Sort matches by hit_count descending, then by date descending
        best_match["matches"].sort(key=lambda x: (x["hit_count"], x["draw_date"]), reverse=True)
        
        results.append(best_match)
    
    # Sort results by best hit count descending
    results.sort(key=lambda x: x["best_hit_count"], reverse=True)
    
    return {
        "success": True,
        "total_picks": len(picks),
        "total_draws": len(draws),
        "picks_with_hits": len([r for r in results if r["best_hit_count"] >= 3]),
        "results": results
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
