# 🚀 Deployment Guide

This guide covers deploying your Calendar App to production on various platforms.

## 🌟 Recommended: Deploy to Vercel

Vercel is the easiest way to deploy Next.js apps (created by the Next.js team).

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial calendar app commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/calendar-app.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Select your repository
4. Click "Import"

### Step 3: Configure Environment Variables
1. In Vercel project settings, go to "Environment Variables"
2. Add all variables from `.env.local`:
   - `DATABASE_URL` (MongoDB)
   - `POSTGRES_URL` (if using PostgreSQL)
   - `NEXT_PUBLIC_FIREBASE_*` (all Firebase keys)
   - `FIREBASE_ADMIN_SDK_KEY`
   - `NODE_ENV=production`

### Step 4: Deploy
Click "Deploy" and wait for deployment to complete.

Your app will be live at: `https://your-project.vercel.app`

---

## 🔧 Docker Deployment

Build and run your app in a Docker container.

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
```

### Create .dockerignore
```
node_modules
.next
.git
.gitignore
README.md
.env
.env.local
```

### Build and Run
```bash
# Build Docker image
docker build -t calendar-app .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="mongodb://host.docker.internal:27017/calendar" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  calendar-app
```

---

## ☁️ AWS Deployment

### Option 1: AWS Amplify (Easiest)

1. Push code to GitHub
2. Go to AWS Amplify console
3. Connect your repository
4. Configure build settings
5. Add environment variables
6. Deploy

### Option 2: AWS EC2

1. Launch EC2 instance (Ubuntu recommended)
2. SSH into instance
3. Install Node.js and dependencies
4. Clone repository
5. Build project: `npm run build`
6. Run server: `npm start`
7. Setup reverse proxy (nginx)
8. Configure SSL certificate (Let's Encrypt)

---

## 🌐 Google Cloud Platform

### Deploy to Cloud Run

```bash
# Create service account
gcloud iam service-accounts create calendar-app-runner

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/calendar-app

# Deploy to Cloud Run
gcloud run deploy calendar-app \
  --image gcr.io/PROJECT_ID/calendar-app \
  --platform managed \
  --memory 512Mi \
  --region us-central1 \
  --set-env-vars DATABASE_URL="your-mongodb-url"
```

---

## 🟦 Azure Deployment

### Deploy to Azure App Service

```bash
# Install Azure CLI
# Login to Azure
az login

# Create resource group
az group create --name calendar-app-rg --location eastus

# Create app service plan
az appservice plan create \
  --name calendar-app-plan \
  --resource-group calendar-app-rg \
  --sku B1 --is-linux

# Create web app
az webapp create \
  --resource-group calendar-app-rg \
  --plan calendar-app-plan \
  --name calendar-app-unique-name \
  --runtime "node|18-lts"

# Deploy from GitHub
az webapp deployment github-actions add \
  --repo-url https://github.com/YOUR_USERNAME/calendar-app \
  --branch main \
  --resource-group calendar-app-rg \
  --webapp-name calendar-app-unique-name
```

---

## 🔐 Production Checklist

Before deploying to production:

- [ ] Update `NODE_ENV` to `production`
- [ ] Set up secure environment variables
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS/SSL certificate
- [ ] Setup database backups
- [ ] Configure Firebase for production
- [ ] Setup monitoring and logging
- [ ] Create CI/CD pipeline
- [ ] Test all features in staging
- [ ] Setup error tracking (Sentry)
- [ ] Configure rate limiting
- [ ] Setup log rotation
- [ ] Test database failover
- [ ] Create runbook for common issues

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- Built into Vercel dashboard
- View real-time traffic
- Performance metrics
- Error tracking

### Google Analytics
```javascript
// Add to pages/_document.tsx
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry Error Tracking
```bash
npm install @sentry/nextjs
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🎯 Performance Optimization

Before production deployment:

1. **Enable compression**
   - Add `compress` middleware
   - Enable gzip in nginx

2. **Optimize images**
   - Use Next.js Image component
   - Implement lazy loading

3. **Minify assets**
   - Next.js does this automatically
   - Check bundle size: `npm run build`

4. **Enable caching**
   - Configure browser cache headers
   - Setup CDN

5. **Database indexing**
   - Add indexes to frequently queried fields
   - Monitor query performance

---

## 📚 Further Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Docs](https://docs.docker.com/)
- [AWS Docs](https://docs.aws.amazon.com/)
- [Google Cloud Docs](https://cloud.google.com/docs)
- [Azure Docs](https://docs.microsoft.com/en-us/azure/)

---

## 💡 Quick Deployment Commands

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**Docker:**
```bash
docker build -t calendar-app . && docker run -p 3000:3000 calendar-app
```

**Traditional VPS:**
```bash
npm run build
npm start  # or use PM2: pm2 start npm -- start
```

---

Good luck with your deployment! 🚀
