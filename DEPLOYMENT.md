# GetLos_T - Deployment Guide

## 🚀 Opcje Deploymentu

### 1. Render.com (Rekomendowane - DARMOWE)

#### Backend (Web Service)
1. Połącz GitHub repo
2. Utwórz nowy Web Service
3. Konfiguracja:
   ```
   Name: getlost-backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
   Root Directory: backend
   ```
4. Environment Variables:
   ```
   ENVIRONMENT=production
   DATABASE_URL=sqlite:///./data/app.db
   CORS_ORIGINS=https://twoja-domena.onrender.com
   ```

#### Frontend (Static Site)
1. Utwórz nowy Static Site
2. Konfiguracja:
   ```
   Name: getlost-frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   Root Directory: frontend
   ```
3. Environment Variables:
   ```
   VITE_API_URL=https://getlost-backend.onrender.com
   ```

**Koszt:** FREE (z limitami)
**Czas deploy:** ~5-10 minut

---

### 2. Railway.app

```bash
# Zainstaluj Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# Dodaj environment variables w dashboard
```

**Koszt:** $5/miesiąc (starter plan)
**Czas deploy:** ~3 minuty

---

### 3. Fly.io (Docker)

```bash
# Zainstaluj Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Backend
cd backend
fly launch
fly deploy

# Frontend
cd frontend
fly launch
fly deploy
```

**Koszt:** FREE tier dostępny
**Czas deploy:** ~5 minut

---

### 4. DigitalOcean App Platform

1. Połącz GitHub
2. Wybierz repo i branch
3. Auto-detect wykryje Docker setup
4. Skonfiguruj environment variables
5. Deploy

**Koszt:** $5/miesiąc (basic)
**Czas deploy:** ~10 minut

---

### 5. Heroku

#### Backend
```bash
# Utwórz Procfile w backend/
web: uvicorn main:app --host 0.0.0.0 --port $PORT

# Deploy
heroku create getlost-backend
git subtree push --prefix backend heroku main
```

#### Frontend
```bash
# Utwórz static.json w frontend/
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  }
}

heroku create getlost-frontend
heroku buildpacks:add heroku/nodejs
git subtree push --prefix frontend heroku main
```

**Koszt:** $7/miesiąc per dyno
**Czas deploy:** ~5-10 minut

---

### 6. VPS (Ubuntu 22.04)

```bash
# 1. Zainstaluj Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Zainstaluj Docker Compose
sudo apt install docker-compose

# 3. Sklonuj repo
git clone https://github.com/qqbek24/GetLos_T.git
cd GetLos_T

# 4. Utwórz .env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edytuj .env files z produkcyjnymi wartościami
nano backend/.env
nano frontend/.env

# 5. Uruchom
docker-compose up -d

# 6. Setup Nginx (opcjonalnie)
sudo apt install nginx
# Skonfiguruj reverse proxy
```

**Koszt:** Od $5/miesiąc (DigitalOcean, Linode)
**Czas setup:** ~20-30 minut

---

## 🔐 Environment Variables (Produkcja)

### Backend (.env)
```env
ENVIRONMENT=production
DATABASE_URL=sqlite:///./data/app.db
CORS_ORIGINS=["https://twoja-domena.com"]
```

### Frontend (.env)
```env
VITE_API_URL=https://api.twoja-domena.com
```

---

## 📊 Porównanie

| Platform | Koszt | Łatwość | Docker | SSL | DB |
|----------|-------|---------|--------|-----|-----|
| Render.com | FREE | ⭐⭐⭐⭐⭐ | ✅ | ✅ | Volume |
| Railway | $5 | ⭐⭐⭐⭐⭐ | ✅ | ✅ | Volume |
| Fly.io | FREE | ⭐⭐⭐⭐ | ✅ | ✅ | Volume |
| DigitalOcean | $5 | ⭐⭐⭐⭐ | ✅ | ✅ | Volume |
| Heroku | $7 | ⭐⭐⭐ | ❌ | ✅ | Addon |
| VPS | $5+ | ⭐⭐ | ✅ | Manual | ✅ |

---

## 🎯 Rekomendacja

**Dla startu:** Render.com (FREE)
**Dla produkcji:** Railway.app lub DigitalOcean
**Dla pełnej kontroli:** VPS z Docker Compose

---

## 🔄 CI/CD (GitHub Actions)

Przykładowy workflow w pliku `.github/workflows/deploy.yml` można dodać później.

---

## 📝 Checklist przed deploymentem

- [ ] Testy działają lokalnie
- [ ] Environment variables skonfigurowane
- [ ] CORS origins zaktualizowane
- [ ] Database backup strategy
- [ ] SSL certyfikat (auto na większości platform)
- [ ] Monitoring setup (opcjonalnie)
- [ ] Error tracking (Sentry - opcjonalnie)

---

Powodzenia! 🚀
