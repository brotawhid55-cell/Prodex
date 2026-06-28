# Trodex
SEO-first product marketing platform for 
e-commerce sellers.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Neon PostgreSQL
- NextAuth.js
- Tailwind CSS
- Vercel (hosting)

## Setup Guide

### Step 1: Clone & Install
git clone <your-repo-url>
cd trodex
npm install

### Step 2: Database Setup
1. Go to https://neon.tech
2. Create account → New Project → name: trodex
3. Go to Dashboard → Connection Details
4. Copy the "Pooled connection" string

### Step 3: Environment Variables
cp .env.example .env.local
Fill in all values in .env.local

### Step 4: Run Locally
npm run dev
Open http://localhost:3000

### Step 5: Deploy to Vercel
1. Push to GitHub
2. Import repo in vercel.com
3. Go to Settings → Environment Variables
4. Add all 4 variables from .env.example
5. Redeploy

## Features
- User registration and login
- Product post creation with image URL
- Pinterest-style masonry feed
- Star ratings (★★★★★)
- Each user gets subdomain: username.trodex.com
- Google Search Console verification support
- Auto sitemap per user profile
- JSON-LD schema markup per post
- Open Graph tags for social sharing

## Subdomain Setup (Production)
Add wildcard domain in Vercel:
Domains → Add → *.trodex.com
