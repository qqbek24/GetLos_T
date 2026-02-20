# GetLos_T

Intelligent system for predicting and analyzing Lotto results based on historical data.

 for how app looks and work, check address [GetLost_T](https://remarkable-lollipop-803d8b.netlify.app/)

> **[Full Documentation → docs/INDEX.md](docs/INDEX.md)** | [Quick Start](Quick_start_dev/) | [Backend](backend/docs/) | [Frontend](frontend/docs/)**

## Technology Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: React 18 + TypeScript + Material UI + Vite
- **Docker**: Docker Compose for easy deployment
- **Styles**: Material UI with custom gradient theme
- **Machine Learning**: scikit-learn for AI predictions

## Features

### Main Functions
- **6 Generation Strategies**: Random, Hot Numbers, Cold Numbers, Balanced, Combo Based, **AI Prediction**
- **Historical Analysis**: Number frequency, most common pairs and triples
- **CSV Import**: Upload historical lottery results
- **Lotto.pl Synchronization**: Automatic fetching of latest results from official API
- **Manual Draw Addition**: Backup when API is unavailable
- **Backup/Restore**: Export and import data to JSON
- **Persistence**: Automatic data retention between rebuilds
- **Statistics**: Frequency visualization, hot/cold numbers
- **History**: Review generated picks and historical draws

### Strategies

1. **Random** - Completely random number selection
2. **Hot Numbers** - Prefers frequently occurring numbers in history
3. **Cold Numbers** - Prefers rarely occurring numbers
4. **Balanced** - Mix of frequent and rare numbers
5. **Combo Based** - Based on most common pairs and triples from history
6. **AI Prediction** 🧠 ✨ **NEW!** - Machine learning prediction using RandomForest
   - Analyzes historical patterns and sequences
   - Extracts 10 features per draw (sum, even count, range, frequency, gaps)
   - Trains 49 binary classifiers (one per number)
   - Smart selection: top 3 high-probability + 2-3 medium-probability + weighted random
   - Requires minimum 20 historical draws
   - **[Full AI Documentation → docs/AI_STRATEGY.md](docs/AI_STRATEGY.md)**

### Lotto.pl API Synchronization

The application has integration with the official Totalizator Sportowy API:
- Automatic fetching of latest Lotto results
- Detection of missing draws
- One-click synchronization
- Manual draw addition (fallback)
- Backup/Restore to JSON
- Full integration documentation

**[API Configuration Guide → docs/LOTTO_API_SYNC.md](docs/LOTTO_API_SYNC.md)**
**[Data Management → docs/DATA_MANAGEMENT.md](docs/DATA_MANAGEMENT.md)**
**[Quick Start → Quick_start_dev/LOTTO_SYNC_QUICKSTART.md](Quick_start_dev/LOTTO_SYNC_QUICKSTART.md)**

## Quick Start

**[Detailed startup guide → Quick_start_dev/FIRST_RUN.md](Quick_start_dev/FIRST_RUN.md)**

### Method 1: Docker (Recommended)

#### Development Mode
```bash
# Start everything
Quick_start_dev\start-dev.bat

# Or separately:
Quick_start_dev\start-backend.bat
Quick_start_dev\start-frontend.bat

# Stop everything
Quick_start_dev\stop-all.bat

# Restart
Quick_start_dev\restart-all.bat

# View logs
Quick_start_dev\logs.bat
```

> 💡 All management scripts are located in [`Quick_start_dev/`](Quick_start_dev/) folder

#### Production Mode
```bash
Quick_start_dev\start-prod.bat
```

### Method 2: Manual (without Docker)

📖 **[Backend Documentation → backend/docs/README.md](backend/docs/README.md)**
📖 **[Frontend Documentation → frontend/docs/README.md](frontend/docs/README.md)**

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Application Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
GetLos_T/
├── backend/                 # FastAPI Backend
│   ├── docs/               # 📖 Backend Documentation
│   │   └── README.md       # API docs, endpoints, models
│   ├── main.py             # Main FastAPI application
│   ├── models.py           # SQLAlchemy models
│   ├── schema.py           # Pydantic schemas
│   ├── db.py               # Database configuration
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend Dockerfile
├── frontend/               # React Frontend
│   ├── docs/               # 📖 Frontend Documentation
│   │   └── README.md       # Components, pages, architecture
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Layout.tsx
│   │   │   └── NumbersBall.tsx
│   │   ├── pages/         # Application pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Generate.tsx
│   │   │   ├── History.tsx
│   │   │   └── Stats.tsx
│   │   ├── services/      # API client
│   │   │   └── api.ts
│   │   ├── types/         # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx        # Main component
│   │   ├── main.tsx       # Entry point
│   │   └── theme.ts       # Material UI theme
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── Quick_start_dev/        # 🚀 Quick Start Scripts & Docs
│   ├── start-dev.bat      # Start development
│   ├── start-prod.bat     # Start production
│   ├── start-backend.bat  # Start backend only
│   ├── start-frontend.bat # Start frontend only
│   ├── stop-all.bat       # Stop all services
│   ├── restart-all.bat    # Restart all services
│   ├── restart-backend.bat
│   ├── restart-frontend.bat
│   ├── logs.bat           # View all logs
│   ├── logs-backend.bat
│   ├── logs-frontend.bat
│   ├── QUICK_START.md     # Quick start guide
│   ├── FIRST_RUN.md       # First run tutorial
│   └── MIGRATION_SUMMARY.md # Migration details
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
├── stop-all.bat           # Stop all services
│   ├── QUICK_START.md     # Quick start guide
│   ├── FIRST_RUN.md       # First run tutorial
│   └── MIGRATION_SUMMARY.md # Migration details
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
└── README.md              # This file
```

## 🛠️ Management Files

📂 **All management files are located in [`Quick_start_dev/`](Quick_start_dev/)**

### Start
- `start-dev.bat` - Start development mode (hot reload)
- `start-prod.bat` - Start production mode
- `start-backend.bat` - Backend only
- `start-frontend.bat` - Frontend only

### Stop & Restart
- `stop-all.bat` - Stop all services
- `restart-all.bat` - Restart all services
- `restart-backend.bat` - Restart backend
- `restart-frontend.bat` - Restart frontend

### Logs
- `logs.bat` - View logs of all services
- `logs-backend.bat` - Backend logs
- `logs-frontend.bat` - Frontend logs

📖 **[Full instructions → Quick_start_dev/QUICK_START.md](Quick_start_dev/QUICK_START.md)**

## 📊 API Endpoints

📖 **[Detailed API documentation → backend/docs/README.md](backend/docs/README.md)**

### Draws (Historical Lottery Draws)
- `POST /draws/upload-csv` - Upload CSV file with history
- `GET /draws/` - Get all draws
- `GET /draws/{id}` - Get specific draw
- `DELETE /draws/{id}` - Delete draw
- `DELETE /draws/clear` - Delete all draws

### Picks (Generated Number Sets)
- `POST /picks/generate` - Generate new number sets
- `GET /picks/` - Get all picks
- `GET /picks/{id}` - Get specific pick
- `DELETE /picks/{id}` - Delete pick
- `DELETE /picks/clear` - Delete all picks

### Statistics
- `GET /stats/` - Get full statistics
- `POST /validate` - Validate number set

## 🎨 Frontend - React Components

📖 **[Szczegółowa dokumentacja Frontend → frontend/docs/README.md](frontend/docs/README.md)**

### Pages
- **Dashboard**: Stats cards, CSV upload, quick actions, recent picks
- **Generate**: Strategy selection, count input, results display with copy/clear
- **History**: Tabs for picks/draws, delete functionality, clear all
- **Stats**: Frequency grid, hot/cold numbers visualization, pairs/triples

### Components
- **Layout**: AppBar with gradient, tabs navigation, footer
- **NumbersBall**: Reusable number display with size/gradient variants

### Services
- **api.ts**: Axios client with 10 typed API methods
- **types/index.ts**: TypeScript interfaces for all data models

## 🔧 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Docker Development
```bash
# Build and start
docker-compose -f docker-compose.dev.yml up --build

# Stop
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## 📝 CSV Format for Import

```csv
Data Losowania,Liczba 1,Liczba 2,Liczba 3,Liczba 4,Liczba 5,Liczba 6
2024-01-01,5,12,23,34,41,49
2024-01-08,3,15,22,28,36,47
...
```

**Notes:**
- Numbers must be in range 1-49
- Date in YYYY-MM-DD format
- 6 unique numbers in each row

## 🐛 Troubleshooting

### Docker Issues
```bash
# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build

# Remove volumes and rebuild
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build

# Check logs
logs.bat

# Check specific service
logs-backend.bat
logs-frontend.bat
```

### Port Conflicts
If ports 8000 or 5173 are occupied, edit `docker-compose.dev.yml`:
```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Change 8000 to another
  frontend:
    ports:
      - "5174:5173"  # Change 5173 to another
```

### Frontend Not Connecting to Backend
1. Check if backend is running: http://localhost:8000/docs
2. Check `VITE_API_URL` in `docker-compose.dev.yml`
3. View logs: `logs-frontend.bat`

### Database Issues
```bash
# Delete database and start fresh
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

## 📚 API Documentation

After starting the backend, interactive documentation is available:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🎓 How to Use

### 1. Upload Historical Data
1. Go to Dashboard
2. Click "Upload CSV" or drag and drop file
3. Wait for import and analysis

### 2. Generate Number Sets
1. Go to "Generate"
2. Select strategy (including AI Prediction!)
3. Set number of sets (1-10)
4. Click "Generate"
5. Copy to clipboard or save

### 3. Browse Statistics
1. Go to "Statistics"
2. View number frequency
3. Check hot/cold numbers
4. Analyze most common pairs and triples

### 4. History
1. Go to "History"
2. View all generated picks
3. Browse historical draws
4. Delete unnecessary entries

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📖 Documentation

> 📖 **[🔍 Full Documentation Index → docs/INDEX.md](docs/INDEX.md)**

### 🚀 Quick Start & Scripts
- **[Quick_start_dev/](Quick_start_dev/)** - All management scripts and quick start guides
  - [FIRST_RUN.md](Quick_start_dev/FIRST_RUN.md) - First launch
  - [QUICK_START.md](Quick_start_dev/QUICK_START.md) - Quick start in 5 minutes
  - [LOTTO_SYNC_QUICKSTART.md](Quick_start_dev/LOTTO_SYNC_QUICKSTART.md) - API configuration in 6 steps

### 🔄 Integrations and Features
- **[docs/LOTTO_API_SYNC.md](docs/LOTTO_API_SYNC.md)** - Full Lotto.pl API synchronization documentation
- **[docs/DATA_MANAGEMENT.md](docs/DATA_MANAGEMENT.md)** - Data management, backup, restore, persistence
- **[docs/AI_STRATEGY.md](docs/AI_STRATEGY.md)** - AI Prediction strategy - machine learning documentation
- **[docs/INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md)** - Detailed installation guide
- **[docs/VISUALIZATION.md](docs/VISUALIZATION.md)** - Architecture and flow diagrams

### 💻 Technical Documentation
- **[backend/docs/](backend/docs/)** - Backend Documentation
  - API endpoints, models, strategies, configuration
- **[frontend/docs/](frontend/docs/)** - Frontend Documentation
  - React components, pages, architecture, Material UI

### 📦 Deployment
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to the project

## 📄 License

MIT License - see LICENSE file for details

---

**Note**: This application is for entertainment and educational purposes. We do not guarantee lottery winnings! 🍀
