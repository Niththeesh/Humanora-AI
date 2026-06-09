# Deployment Guide - HumanWrite Pro

This guide covers deploying HumanWrite Pro to various platforms.

## 📋 Pre-deployment Checklist

- [ ] All tests pass locally
- [ ] Environment variables configured
- [ ] Build succeeds without errors
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] No console errors in dev tools
- [ ] Performance optimized

---

## 🚀 Vercel (Recommended for Frontend)

### Frontend Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/humanwrite-pro.git
git branch -M main
git push -u origin main
```

2. **Deploy Frontend**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Click Deploy

3. **Set Environment Variables** (if needed)
   - Project Settings → Environment Variables
   - Add any needed variables

4. **Configure API**
   - Frontend will need backend URL
   - Update API calls in code or create `.env.production`

---

## 🟢 Heroku (Recommended for Backend)

### Backend Deployment

1. **Install Heroku CLI**
```bash
# Windows (Chocolatey)
choco install heroku-cli

# macOS (Homebrew)
brew tap heroku/brew && brew install heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
cd backend
heroku create humanwrite-pro-api

# Or with specific name
heroku create your-app-name
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
```

5. **Deploy**
```bash
git push heroku main
# or
git push heroku master
```

6. **View Logs**
```bash
heroku logs --tail
```

7. **App URL**
```
https://your-app-name.herokuapp.com
```

### Update Frontend to Use Heroku Backend
```typescript
// In frontend API calls
const API_URL = 'https://your-app-name.herokuapp.com/api'

// Or use environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

---

## 🐳 Docker Deployment

### Create Docker Image

1. **Backend Dockerfile**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

2. **Frontend Dockerfile**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

3. **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

4. **Build and Run**
```bash
# Build
docker build -t humanwrite-pro-backend ./backend
docker build -t humanwrite-pro-frontend ./frontend

# Run
docker run -p 5000:5000 humanwrite-pro-backend
docker run -p 3000:80 humanwrite-pro-frontend

# Or with Docker Compose
docker-compose up --build
```

---

## ☁️ AWS Deployment

### Lambda + API Gateway (Backend)

1. **Prepare Code**
```bash
cd backend
npm run build
zip -r function.zip dist node_modules
```

2. **Create Lambda Function**
   - AWS Console → Lambda
   - Create Function
   - Runtime: Node.js 18
   - Upload `function.zip`

3. **Add API Gateway**
   - Create new REST API
   - Create resource `/api`
   - Create method `POST`
   - Set Lambda integration

4. **Deploy API**
   - Actions → Deploy API
   - Stage: `prod`

### S3 + CloudFront (Frontend)

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Create S3 Bucket**
   - AWS Console → S3
   - Create bucket
   - Enable static website hosting

3. **Upload Files**
```bash
aws s3 sync dist/ s3://your-bucket-name
```

4. **Create CloudFront Distribution**
   - AWS Console → CloudFront
   - Create distribution
   - Set origin to S3 bucket

---

## 🔄 Netlify (Frontend Alternative)

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your GitHub repository

2. **Configure Build**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add Environment Variables**
   - Site settings → Build & deploy
   - Environment → Edit variables
   ```
   VITE_API_URL=https://your-backend.com/api
   ```

4. **Deploy**
   - Automatic deployment on push to main

---

## 🔐 Environment Variables

### Frontend (.env.production)
```env
VITE_API_URL=https://api.humanwrite-pro.com
VITE_APP_NAME=HumanWrite Pro
```

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://humanwrite-pro.vercel.app
```

---

## 📊 Performance Optimization

### Frontend
```bash
# Build optimization
npm run build

# Check bundle size
npm install -g serve
serve -s dist
```

### Backend
- Enable gzip compression
- Implement caching headers
- Use database for persistence (future)

---

## 🔍 Monitoring

### Logging
- Use cloud provider's logging (CloudWatch, Heroku Logs, Vercel Logs)
- Monitor API response times
- Track error rates

### Analytics
- Add application monitoring (New Relic, DataDog)
- Monitor user sessions
- Track feature usage

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install && npm run build
      - run: git push https://heroku.com/humanwrite-pro-api.git main

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install && npm run build
      - uses: vercel/action@master
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🔗 Domain Configuration

### Custom Domain on Vercel
1. Project settings → Domains
2. Add custom domain
3. Update DNS records per Vercel instructions

### Custom Domain on Heroku
1. App settings → Domains
2. Add domain
3. Update DNS CNAME record

---

## 📈 Scaling

### Backend Scaling
- Use serverless (Lambda) for auto-scaling
- Enable Heroku dyno scaling
- Use dedicated database for performance

### Frontend Scaling
- CDN (CloudFront, Vercel Edge Network)
- Static asset caching
- Code splitting and lazy loading

---

## 🔐 Security

- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Validate/sanitize all inputs
- [ ] Use security headers

---

## 🧪 Testing Before Deploy

```bash
# Test locally
cd frontend && npm run build && npm run preview
cd backend && npm run build && npm start

# Test API
curl https://your-api.com/api/health
```

---

## 📞 Rollback

### Vercel
- Dashboard → Deployments
- Click deployment to rollback
- Previous versions available

### Heroku
```bash
heroku releases
heroku rollback v50  # Rollback to version 50
```

---

## 🎯 Summary

| Platform | Frontend | Backend | Cost | Ease |
|----------|----------|---------|------|------|
| Vercel   | ✅      | ✅      | Free | ⭐⭐⭐⭐⭐ |
| Netlify  | ✅      | ⚠️      | Free | ⭐⭐⭐⭐⭐ |
| Heroku   | ⚠️      | ✅      | 💰  | ⭐⭐⭐⭐ |
| AWS      | ✅      | ✅      | 💰  | ⭐⭐⭐ |
| Docker   | ✅      | ✅      | 💰  | ⭐⭐  |

---

**Recommended Stack:**
- Frontend: **Vercel** (fast, free, optimized for React)
- Backend: **Heroku** or **Railway** (easy, affordable)

---

**Last Updated**: April 11, 2026
