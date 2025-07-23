# Deployment Guide for EMSI Career Center

## Prerequisites
- Node.js 14.0.0 or higher
- Vercel CLI installed (`npm i -g vercel`)
- Git repository initialized

## Environment Variables
Set these in Vercel dashboard or `.env` file:
- `JWT_SECRET` - Secret key for JWT tokens (required)
- `NODE_ENV` - Set to "production" for production deployment
- `PORT` - Server port (default: 3000)

## Deployment Steps

### 1. Using Vercel CLI
```bash
# Install dependencies
npm install

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# For production deployment
vercel --prod
```

### 2. Using Git Integration
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel will auto-deploy on push

### 3. Manual Configuration in Vercel Dashboard
1. Go to Project Settings > Environment Variables
2. Add: `JWT_SECRET` with a secure random string
3. Add: `NODE_ENV` set to "production"

## Post-Deployment

### Verify Deployment
- Main site: https://your-domain.vercel.app
- API health: https://your-domain.vercel.app/api/health
- Admin login: https://your-domain.vercel.app/admin-login

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT**: Change the admin password immediately after deployment!

## Data Persistence
Currently using in-memory storage. For production:
1. Use `server-new.js` with PostgreSQL
2. Set database environment variables
3. Run `npm run init-db` to initialize database

## Security Checklist
- [ ] Change JWT_SECRET from default
- [ ] Update admin credentials
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Review CORS settings
- [ ] Set up monitoring/logging