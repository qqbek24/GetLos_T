# Backend Documentation

## FastAPI Application

### Overview
GetLos_T backend is a FastAPI application that provides REST API for lottery number generation and analysis.

### Architecture

```
backend/
├── main.py          # Main FastAPI application
├── models.py        # SQLAlchemy ORM models
├── schema.py        # Pydantic schemas
├── db.py            # Database configuration
├── requirements.txt # Python dependencies
└── Dockerfile       # Docker configuration
```

### Models

#### HistoricalDraw
Stores historical lottery draw results.

```python
class HistoricalDraw(Base):
    id: int (primary key)
    numbers: List[int] (6 numbers, 1-49)
    draw_date: str (YYYY-MM-DD)
    created_at: datetime
```

#### Pick
Stores generated lottery picks.

```python
class Pick(Base):
    id: int (primary key)
    numbers: List[int] (6 numbers, 1-49)
    strategy: str (random/hot/cold/balanced/combo_based)
    created_at: datetime
```

### API Endpoints

#### Draws

**POST /draws/upload-csv**
- Upload CSV file with historical draws
- Format: `Data Losowania,Liczba 1,Liczba 2,Liczba 3,Liczba 4,Liczba 5,Liczba 6`
- Returns: List of created draws

**GET /draws/**
- Get all historical draws
- Returns: List of draws

**GET /draws/{id}**
- Get specific draw by ID
- Returns: Single draw

**DELETE /draws/{id}**
- Delete specific draw
- Returns: Success message

**DELETE /draws/clear**
- Delete all draws
- Returns: Success message

#### Picks

**POST /picks/generate**
- Generate new lottery picks
- Body: `{ "strategy": "balanced", "count": 1 }`
- Strategies: random, hot, cold, balanced, combo_based
- Returns: List of generated picks

**GET /picks/**
- Get all generated picks
- Returns: List of picks

**GET /picks/{id}**
- Get specific pick by ID
- Returns: Single pick

**DELETE /picks/{id}**
- Delete specific pick
- Returns: Success message

**DELETE /picks/clear**
- Delete all picks
- Returns: Success message

#### Statistics

**GET /stats/**
- Get comprehensive statistics
- Returns: Statistics object with:
  - total_draws: int
  - total_picks: int
  - unique_combinations: int
  - number_frequency: Dict[int, int]
  - most_common_number: int
  - least_common_number: int
  - hot_numbers: List[int]
  - cold_numbers: List[int]
  - most_common_pairs: List[Pair]
  - most_common_triples: List[Triple]

**POST /validate**
- Validate if numbers are unique and not in history
- Body: `{ "numbers": [1,2,3,4,5,6] }`
- Returns: `{ "is_valid": true/false, "reason": "..." }`

### Generation Strategies

#### 1. Random
Completely random selection of 6 numbers from 1-49.

#### 2. Hot Numbers
Prefers numbers that appear frequently in historical draws.
- Uses number_frequency statistics
- Weighted random selection

#### 3. Cold Numbers
Prefers numbers that appear rarely in historical draws.
- Inverts frequency weights
- Weighted random selection

#### 4. Balanced
Mix of hot and cold numbers.
- 3 hot numbers
- 3 cold numbers

#### 5. Combo Based
Based on most common pairs and triples from history.
- Builds numbers from frequent combinations
- Fills remaining with weighted random

### Database

**SQLite** (Development)
- File: `data/getlos_dev.db`
- Automatic creation on first run
- Migrations handled by SQLAlchemy

**PostgreSQL** (Production - Optional)
- Set `DATABASE_URL` environment variable
- Format: `postgresql://user:pass@host:5432/dbname`

### Configuration

Environment variables:
- `DATABASE_URL` - Database connection string (default: SQLite)

### Running

#### Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Production
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Docker
```bash
# Development
docker-compose -f docker-compose.dev.yml up backend

# Production
docker-compose up backend
```

### API Documentation

Automatic interactive documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Dependencies

```txt
fastapi==0.115.0
sqlalchemy==2.0.35
uvicorn[standard]==0.32.0
pydantic==2.10.3
python-multipart==0.0.12
```

### Error Handling

All endpoints return proper HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (invalid data)
- 404: Not Found
- 500: Internal Server Error

### CORS

CORS is enabled for all origins in development:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Testing

```bash
# Run tests (if available)
pytest

# Test API manually
curl http://localhost:8000/docs
```

### Performance

- Database queries are optimized with proper indexes
- Number generation is efficient with weighted random
- Statistics are calculated on-demand (consider caching for large datasets)

### Security Considerations

- Input validation with Pydantic schemas
- SQL injection prevention with SQLAlchemy ORM
- CORS configured for production
- No authentication (add if needed for production)

### Future Improvements

- [ ] Add caching for statistics
- [ ] Add authentication/authorization
- [ ] Add rate limiting
- [ ] Add background tasks for CSV processing
- [ ] Add WebSocket for real-time updates
- [ ] Add more advanced algorithms
- [ ] Add unit tests
- [ ] Add integration tests

### Troubleshooting

**Port already in use**
```bash
# Find process
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F
```

**Database locked**
```bash
# Remove database file
rm data/getlos_dev.db

# Restart application
```

**Import errors**
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Support

For issues, check:
1. API documentation: http://localhost:8000/docs
2. Logs in terminal
3. Database file exists: `data/getlos_dev.db`
4. Python version: 3.8+
