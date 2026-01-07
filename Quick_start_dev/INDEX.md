# GetLos_T - Spis Treści 📑

## 📂 Struktura Dokumentacji

### 🚀 Quick Start
```
Quick_start_dev/
├── README.md              ← START TUTAJ
├── FIRST_RUN.md          ← Pierwsze uruchomienie (szczegółowy przewodnik)
├── QUICK_START.md        ← Szybki start (5 minut)
└── MIGRATION_SUMMARY.md  ← Historia zmian (Vue → React)
```

### 📖 Dokumentacja Techniczna
```
backend/docs/
└── README.md             ← FastAPI, endpoints, modele, strategie

frontend/docs/
└── README.md             ← React, Material UI, komponenty, architektury
```

### 🔧 Skrypty Zarządzające
```
Quick_start_dev/
├── start-dev.bat         ← Uruchom development
├── start-prod.bat        ← Uruchom production
├── stop-all.bat          ← Zatrzymaj wszystko
├── restart-all.bat       ← Restart wszystkiego
├── logs.bat              ← Zobacz wszystkie logi
└── ...                   ← i więcej skryptów
```

## 🎯 Gdzie Zacząć?

### Jestem nowym użytkownikiem
1. **[Quick_start_dev/FIRST_RUN.md](FIRST_RUN.md)** - Zacznij tutaj!
   - Krok po kroku
   - Troubleshooting
   - Przykłady użycia

### Chcę szybko uruchomić
1. **[Quick_start_dev/QUICK_START.md](QUICK_START.md)** - 5 minut
   - Minimalna konfiguracja
   - Podstawowe komendy

### Jestem developerem
1. **[Backend Docs](../backend/docs/README.md)** - FastAPI szczegóły
   - API endpoints
   - Modele danych
   - Strategie generowania
   
2. **[Frontend Docs](../frontend/docs/README.md)** - React szczegóły
   - Komponenty
   - Architektury
   - Material UI theme

### Chcę wiedzieć co się zmieniło
1. **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)** - Vue → React
   - Lista zmian
   - Nowe pliki
   - Usunięte pliki

## 📋 Mapa Projektu

```
GetLos_T/
│
├── Quick_start_dev/          📂 Skrypty i quick start docs
│   ├── *.bat                 🔧 Skrypty Windows
│   ├── FIRST_RUN.md         📖 Pierwsze uruchomienie
│   ├── QUICK_START.md       📖 Szybki start
│   └── MIGRATION_SUMMARY.md 📖 Historia zmian
│
├── backend/                  🐍 Python FastAPI
│   ├── docs/                📖 Dokumentacja backend
│   ├── main.py              🎯 Główna aplikacja
│   ├── models.py            💾 Modele bazy danych
│   ├── schema.py            📋 Schematy Pydantic
│   └── ...
│
├── frontend/                 ⚛️ React + TypeScript
│   ├── docs/                📖 Dokumentacja frontend
│   ├── src/
│   │   ├── components/      🧩 Komponenty React
│   │   ├── pages/          📄 Strony aplikacji
│   │   ├── services/       🔌 API client
│   │   └── types/          📝 TypeScript types
│   └── ...
│
├── docker-compose.yml        🐳 Production setup
├── docker-compose.dev.yml    🐳 Development setup
└── README.md                 📖 Główny README

```

## 🔗 Szybkie Linki

### Dokumentacja
- [Główny README](../README.md)
- [Backend Documentation](../backend/docs/README.md)
- [Frontend Documentation](../frontend/docs/README.md)

### Quick Start
- [Pierwsze Uruchomienie](FIRST_RUN.md)
- [Szybki Start](QUICK_START.md)
- [Migracja Vue→React](MIGRATION_SUMMARY.md)

### Konfiguracja
- [Docker Compose Dev](../docker-compose.dev.yml)
- [Docker Compose Prod](../docker-compose.yml)

## 💡 Najczęściej Używane Komendy

```bash
# Start development
Quick_start_dev\start-dev.bat

# Zobacz logi
Quick_start_dev\logs.bat

# Restart wszystkiego
Quick_start_dev\restart-all.bat

# Zatrzymaj
Quick_start_dev\stop-all.bat
```

## 🆘 Potrzebuję Pomocy

### Problem z uruchomieniem?
→ [FIRST_RUN.md - Troubleshooting](FIRST_RUN.md#troubleshooting)

### Problem z API?
→ [Backend Docs - Troubleshooting](../backend/docs/README.md#troubleshooting)

### Problem z Frontend?
→ [Frontend Docs - Troubleshooting](../frontend/docs/README.md#troubleshooting)

### Docker nie działa?
→ [QUICK_START.md - Docker Issues](QUICK_START.md#docker-nie-działa)

## 📞 Kontakt & Wsparcie

1. Sprawdź odpowiednią dokumentację
2. Zobacz sekcję Troubleshooting
3. Sprawdź logi: `logs.bat`
4. Otwórz issue na GitHub

---

**Powodzenia!** 🍀
