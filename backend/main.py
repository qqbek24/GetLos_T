"""
GetLos_T - Main FastAPI Application
Lottery number prediction system
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import csv, io, random, math, os
from collections import Counter
from itertools import combinations
from dotenv import load_dotenv
import numpy as np
from sklearn.ensemble import RandomForestClassifier

from db import get_db, init_db
from models import HistoricalDraw, Pick, norm_key
from schema import (
    Numbers, Stats, Strategy, GenerateRequest, 
    UploadResponse, DrawResponse, PickResponse, SyncLottoResponse,
    ManualDrawRequest, BackupResponse
)
from lotto_api import get_last_results_for_lotto, parse_lotto_draw, LottoAPIError

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
    """Initialize database tables on application startup"""
    init_db()


# ========== Helper Functions ==========

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
    universe = list(range(1, 53))
    
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
    Upload CSV file with historical lottery draws
    Supported formats:
    - Just numbers: 1,2,3,4,5,6
    - With date: 2024-01-15,1,2,3,4,5,6
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "File must be CSV format")
    
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
                "source": date_str if date_str else "csv_upload"
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


@app.get("/picks", response_model=List[PickResponse])
def list_picks(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    List generated picks with pagination (most recent first)
    """
    picks = db.query(Pick).order_by(Pick.created_at.desc()).offset(offset).limit(limit).all()
    return picks


@app.get("/draws", response_model=List[DrawResponse])
def list_draws(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    List historical draws with pagination (most recent draws first)
    Sorts by source field (YYYY-MM-DD date) if available, otherwise by created_at
    """
    draws = db.query(HistoricalDraw).order_by(
        HistoricalDraw.source.desc().nullslast(),
        HistoricalDraw.created_at.desc()
    ).offset(offset).limit(limit).all()
    return draws


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
    1. Checks the latest draw date in your database
    2. Fetches new results from Lotto.pl API
    3. Adds missing draws to your history
    
    Requirements:
    - LOTTO_API_SECRET_KEY must be configured in .env
    - Get your API key from: kontakt@lotto.pl
    - More info: https://developers.lotto.pl/
    """
    try:
        # Fetch latest results from Lotto.pl API
        api_results = await get_last_results_for_lotto()
        
        if not api_results:
            return SyncLottoResponse(
                success=True,
                new_draws=0,
                message="No new results available from Lotto.pl API"
            )
        
        # Get the latest draw date from our database
        latest_db_draw = db.query(HistoricalDraw).filter(
            HistoricalDraw.source.isnot(None)
        ).order_by(
            HistoricalDraw.source.desc()
        ).first()
        
        latest_db_date = latest_db_draw.source if latest_db_draw else None
        
        # Process and add new draws
        new_draws_count = 0
        latest_synced_date = None
        
        for draw_data in api_results:
            parsed = parse_lotto_draw(draw_data)
            
            if not parsed or not parsed["numbers"]:
                continue
            
            numbers = parsed["numbers"]
            draw_date = parsed["draw_date"]
            
            # Skip if this draw is older or equal to what we have
            if latest_db_date and draw_date and draw_date <= latest_db_date:
                continue
            
            # Check if this draw already exists
            key = norm_key(numbers)
            existing = db.query(HistoricalDraw).filter_by(key=key).first()
            
            if existing:
                continue
            
            # Add new draw
            new_draw = HistoricalDraw(
                numbers=numbers,
                key=key,
                source=draw_date  # Store date in source field
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
        
        # Add new draw
        new_draw = HistoricalDraw(
            numbers=numbers,
            key=key,
            source=date_str if date_str else "manual_entry"
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
        
        for draw in draws:
            if "numbers" not in draw:
                continue
            
            numbers = sorted(draw["numbers"])
            date_str = draw.get("date")
            
            # Create key
            key = norm_key(numbers)
            
            # Check if already exists
            existing = db.query(HistoricalDraw).filter_by(key=key).first()
            if existing:
                continue
            
            # Add new draw
            new_draw = HistoricalDraw(
                numbers=numbers,
                key=key,
                source=date_str if date_str else "import"
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
