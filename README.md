# Trodex - Curated Creator Stores with SEO & Custom Subdomains

Trodex is a modern, high-performance full-stack web application designed for curated product reviewers and affiliate store owners. Creators can register their unique username subdomain (e.g., `username.trodex.com`) and publish beautiful, search-optimized product review cards complete with dynamic aggregate star ratings, custom affiliate shop buttons, and rich descriptive texts.

---

## 🚀 Key Features

* **Subdomain Store Simulation**: Real-time simulated routing for creator stores (e.g., `janesmith.trodex.com` or `techcurator.trodex.com`) via a robust URL parser and cookie-based preview toolbar.
* **Dynamic SEO Engine**: Server-side page decoration that injects customized meta descriptions, canonical URLs, Open Graph headers, and Google Search Console tags into the template HTML dynamically based on the current subdomain or product slug.
* **JSON-LD Product Schemas**: Automatically generates and injects schema-compliant JSON-LD product data markup for search engine crawlers to trigger rich product snippets.
* **On-the-fly Sitemaps & robots.txt**: Custom server routes serving dynamic sitemap XML and robots.txt structures tailored to the specific subdomain requested.
* **Dual Persistence Layer**: Seamless fallback mechanism. Uses high-performance Neon PostgreSQL when `DATABASE_URL` is configured, or falls back to a robust JSON-based local database for easy testing.
* **Space Grotesk & Inter Typography**: Stylized minimalist high-contrast theme built with custom display typography, precise margins, negative space, and smooth layout animations.

---

## 🛠️ Tech Stack & Libraries

* **Frontend**: React 18 with TypeScript and Vite.
* **Styling**: Tailwind CSS with custom theme variables.
* **Animations**: `motion` (by Framer) for smooth transitions.
* **Icons**: `lucide-react` for crisp stroke illustrations.
* **Backend**: Express (Node.js) serving as both the API server and the dynamic SEO file-serving engine.
* **Database**: Neon serverless SQL client (PostgreSQL) or Local filesystem JSON database.

---

## 📂 Configuration & Setup

### Environment Variables

To configure and run the application, populate the keys defined in your `.env` file (refer to `.env.example`):

```bash
# Copy template
cp .env.example .env
```

* `JWT_SECRET`: Secret key used for signing session cookies.
* `DATABASE_URL`: (Optional) Connection string to provision tables automatically on Neon PostgreSQL. If omitted, the app persists locally.
* `GEMINI_API_KEY`: (Optional) For any external model-based feature integrations.

---

## 💻 Developer Guide

### Standard Commands

* **Development Mode**: Boots the Express server with local tsx compilation, mounting Vite as a middleware.
  ```bash
  npm run dev
  ```
* **Build Applet**: Packs the frontend inside `dist/` and compiles the backend TypeScript code into a single, optimized CJS file `dist/server.cjs` using `esbuild`.
  ```bash
  npm run build
  ```
* **Production Start**: Launches the self-contained production bundle.
  ```bash
  npm run start
  ```
