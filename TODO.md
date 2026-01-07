# Development Tasks TODO

## ✅ Zrobione (Starter)
- [x] Backend FastAPI setup
- [x] Frontend Vue.js setup
- [x] Docker & Docker Compose konfiguracja
- [x] Podstawowe endpointy API
- [x] UI komponenty (Dashboard, Generate, History, Stats)
- [x] Upload CSV funkcjonalność
- [x] Strategie generowania (random, hot, cold, balanced, combo_based)
- [x] Statystyki i analiza danych

## 🚧 Do zrobienia (Funkcjonalności)

### Priorytet 1 - Automatyczne pobieranie wyników
- [ ] Scheduler/Cron job do automatycznego pobierania
- [ ] Web scraper dla strony z losowaniami
- [ ] API endpoint do manualnego triggera aktualizacji
- [ ] Walidacja nowych danych przed zapisem
- [ ] Notyfikacje o nowych wynikach

### Priorytet 2 - Rozszerzona analiza
- [ ] Dashboard z wykresami (Chart.js lub Plotly)
- [ ] Analiza trendów czasowych
- [ ] Predykcja na podstawie ML (opcjonalne)
- [ ] Export statystyk do PDF/Excel
- [ ] Historia zmian w czasie

### Priorytet 3 - UX Improvements
- [ ] Dark mode
- [ ] Responsywny design (mobile)
- [ ] Loading skeletons
- [ ] Animacje i transitions
- [ ] Toast notifications

### Priorytet 4 - Deployment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Testy jednostkowe (pytest dla backend)
- [ ] Testy E2E (Playwright/Cypress)
- [ ] Production docker-compose
- [ ] Environment configs dla prod

### Priorytet 5 - Security & Performance
- [ ] Rate limiting
- [ ] API authentication (opcjonalne)
- [ ] Caching (Redis)
- [ ] Database optimization (indices)
- [ ] Error tracking (Sentry)

## 💡 Pomysły na przyszłość
- [ ] Multi-user support (rejestracja/login)
- [ ] Zapisywanie ulubionych strategii
- [ ] Porównywanie wyników z rzeczywistymi losowaniami
- [ ] Social sharing
- [ ] Mobile app (React Native?)

## 🐛 Known Issues
- Brak walidacji rozmiaru pliku CSV (dodać limit)
- Brak paginacji dla długich list
- Trzeba odświeżać stronę po upload CSV
