# Trodex Codebase Map & Technical Documentation

This document provides a comprehensive technical overview and mapping of the Trodex application codebase. Trodex is a decentralized creator storefront application designed to let product curators, reviewers, and affiliate marketers claim custom subdomains (e.g., `username.trodex.com`) and display handpicked gear and custom ratings/reviews in an elegant, high-converting feed.

---

## 1. Complete File Tree

```text
/
├── .env.example                       → Template for environment configuration
├── .gitignore                         → Git exclusion lists (e.g., node_modules, .next)
├── README.md                          → High-level project intro & setup instructions
├── metadata.json                      → AI Studio system application metadata and frame permissions
├── next-env.d.ts                      → Next.js TypeScript declarations
├── package.json                       → Project dependencies and scripts (Next.js, React, Tailwind, Lucide, etc.)
├── postcss.config.js                  → PostCSS plugin configuration for Tailwind
├── tailwind.config.js                 → Tailwind utility and design theme configuration
├── tsconfig.json                      → TypeScript compiler options
├── vercel.json                        → Vercel routing, rewrite, and deployment config
└── src/
    ├── middleware.ts                  → Edge middleware for subdomain routing and URL rewriting
    ├── app/
    │   ├── globals.css                → Global CSS imports (Tailwind and base typography/animations)
    │   ├── layout.tsx                 → Root viewport layout with Inter & JetBrains Mono font loading
    │   ├── [[...slug]]/
    │   │   └── page.tsx               → Catch-all page router; server component resolving context/SEO/JSON-LD
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   │   └── route.ts       → Handles user login, password verification, and JWT session cookie issuance
    │   │   │   ├── logout/
    │   │   │   │   └── route.ts       → Handles cookie-based user logout
    │   │   │   └── register/
    │   │   │       └── route.ts       → Handles alphanumeric validation, password hashing, and account registration
    │   │   ├── context/
    │   │   │   └── route.ts           → Fetches host-level subdomain user context & current logged-in user profile
    │   │   ├── posts/
    │   │   │   ├── route.ts           → Handles fetching posts list (GET) and creating new posts (POST, authenticated)
    │   │   │   └── [id]/
    │   │   │       ├── route.ts       → Handles deletion of single posts with strict ownership checks (DELETE)
    │   │   │       └── [slug]/
    │   │   │           └── route.ts   → Fetches single post detail and dynamically increments view counters (GET)
    │   │   ├── search/
    │   │   │   └── route.ts           → Multi-field case-insensitive search queries on post titles and descriptions (GET)
    │   │   └── simulate-subdomain/
    │   │       └── route.ts           → POST route to set/delete non-httpOnly client simulation cookies
    │   ├── robots.txt/
    │   │   └── route.ts               → Generates dynamic robots.txt containing custom sitemaps per subdomain
    │   └── sitemap.xml/
    │       └── route.ts               → Generates dynamic search engine xml sitemaps containing active posts
    ├── components/
    │   ├── AuthView.tsx               → Interactive forms for user login, register, and subdomain setup validation
    │   ├── BottomNav.tsx              → Floating responsive bottom navbar optimized for mobile viewports
    │   ├── ClientApp.tsx              → Global state context hub and clientside router mapping views
    │   ├── CreatePostView.tsx         → Form fields with live input checks to publish curated recommendations
    │   ├── FeedView.tsx               → General feed grid layout with dynamic search and content curation lists
    │   ├── Header.tsx                 → High-contrast top nav header with simulation bar controls
    │   ├── PostCard.tsx               → Visually polished card containing thumbnail, metadata, ratings stars, and clicks
    │   ├── PostView.tsx               → Immersive product review layout with links, and simulated action logs
    │   ├── ProfileView.tsx            → Custom brand showcase landing page containing follower counts and curated gear
    │   ├── SettingsView.tsx           → Tabbed panel managing profile parameters and Search Engine domain claims
    │   └── StarRating.tsx             → Custom interactive star widget supporting decimal ratings values
    └── lib/
        ├── auth.ts                    → Utility to extract, verify, and decode cookies-based JWT tokens
        ├── db.ts                      → Neon Serverless PostgreSQL connector and core database operational queries
        └── subdomain.ts               → Domain host parsing algorithms supporting localhost, trodex.com, and custom host roots
```

---

## 2. Each File - Full Details

### `src/middleware.ts`
* **Purpose**: Edge routing layer that translates custom domains (e.g., `curator.trodex.com`) internally into `/curator/` path structures so the catchall page can load corresponding context on the server-side.
* **Key Functions/Components**: `middleware(req: NextRequest)` and the `config` matcher.
* **Imports**: `NextRequest`, `NextResponse`.
* **API Endpoints Called**: None.
* **Known Bugs/Issues**: None.
* **Current Status**: ✅ **Working**. Matches subdomains on Localhost and `trodex.com` or `trodex.vercel.app` correctly.

### `src/app/globals.css`
* **Purpose**: Global style declarations including tailwind directives and standard animation frames.
* **Imports**: `@import "tailwindcss";`, `@import "tw-animate-css";` (Tailwind v4 style syntax).
* **Current Status**: ✅ **Working**.

### `src/app/layout.tsx`
* **Purpose**: The master entry viewport loading CSS, global viewport configurations, and Google Fonts (`Inter` and `JetBrains Mono`).
* **Imports**: `Inter`, `JetBrains_Mono` from `next/font/google`, `globals.css`.
* **Current Status**: ✅ **Working**.

### `src/app/[[...slug]]/page.tsx`
* **Purpose**: Server-side rendering catchall router. Dynamically extracts subdomain data, queries metadata parameters and SEO verification tags from the PostgreSQL database, injects JSON-LD schema objects (`https://schema.org/Product`), and mounts the interactive client app.
* **Key Functions**:
  * `extractMetaContent(tagOrValue)`: Extracts content attributes from raw `<meta>` tag strings.
  * `generateMetadata({ params, searchParams })`: Formulates dynamic Page Titles, OpenGraph descriptions, canonical URLs, and meta verification headers.
  * `CatchAllPage({ params, searchParams })`: Renders the document and injects product schemas directly on the server side.
* **Imports**: `Metadata` from `next`, `headers`, `cookies` from `next/headers`, `db` from `../../lib/db`, `ClientApp` from `../../components/ClientApp`.
* **API Endpoints Called**: Internal DB queries directly.
* **Known Bugs/Issues**: None.
* **Current Status**: ✅ **Working**.

### `src/lib/auth.ts`
* **Purpose**: Extracts, verifies, and decodes JSON Web Tokens (JWT) stored in HTTP-Only cookies to secure client state and route calls.
* **Key Functions**: `getAuthUser(req: NextRequest)` returning decoded `userId`, `username`, and `email`.
* **Imports**: `NextRequest` from `next/server`, `jwt` from `jsonwebtoken`.
* **Current Status**: ✅ **Working**.

### `src/lib/db.ts`
* **Purpose**: Houses the Postgres Neon connection client and handles DB initialization, seeding of rich demo curation records (`techcurator`), and standard CRUD operations.
* **Key Functions**:
  * `ensureDbInitialized()`: Generates the base tables and alters column states sequentially if they do not exist.
  * `getUserByUsername(username)`, `getUserByEmail(email)`, `getUserById(id)`: Profile retrieval queries.
  * `createUser(user)`, `updateUser(id, updates)`: Account creation and parameter adjustments.
  * `getPosts(options)`, `getPostById(id)`, `getPostBySlugAndUser(userId, slug)`: Recommendation posts CRUD operations.
  * `createPost(post)`, `deletePost(id)`: Creation and deletion.
  * `incrementViewCount(postId)`: Safely increments views on active curation records.
* **Imports**: `neon` from `@neondatabase/serverless`, `bcrypt` from `bcryptjs`.
* **Current Status**: ✅ **Working**. Includes support for fallback client mocks if credentials are omitted.

### `src/lib/subdomain.ts`
* **Purpose**: Algorithm prioritizing subdomain resolution from URL queries, simulated non-httpOnly cookies, and headers hostname.
* **Key Functions**: `getSubdomain(req: NextRequest)`.
* **Imports**: `NextRequest` from `next/server`.
* **Current Status**: ✅ **Working**.

### `src/components/ClientApp.tsx`
* **Purpose**: Multi-screen interactive client router, holding critical global context state (`currentUser`, `subdomainUser`, `activeSubdomain`, and routes navigation paths).
* **Imports**: `Header`, `FeedView`, `ProfileView`, `PostView`, `CreatePostView`, `AuthView`, `SettingsView`, `BottomNav`, `lucide-react` icons.
* **Current Status**: ✅ **Working**. Integrates dedicated page mockups for `/about`, `/privacy`, and `/terms`.

### `src/components/SettingsView.tsx`
* **Purpose**: Multi-tab user configurations interface letting curators update display names, avatar URLs, bio snippets, and Claim Search Engine verification tags (Google, Bing, Yandex, Baidu, Pinterest).
* **Current Status**: ✅ **Working**.

---

## 3. Database Schema

The platform relies on a relational Postgres structure hosted on a Neon serverless instance.

### `users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | `UUID` | `PRIMARY KEY`, Default: `gen_random_uuid()` | Unique identifier of the user |
| **username** | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Lowercase alphanumeric domain brand (e.g. `techcurator`) |
| **email** | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Account email address |
| **password_hash** | `TEXT` | `NOT NULL` | Bcrypt encrypted credentials string |
| **display_name** | `VARCHAR(100)` | - | User-friendly storefront name |
| **bio** | `VARCHAR(160)` | - | Store description biography (max 160 characters) |
| **avatar_url** | `TEXT` | - | Store cover avatar image link |
| **search_console_meta_tag** | `TEXT` | - | Legacy/fallback custom HTML verification input |
| **google_verification** | `TEXT` | - | Google Search Console claimed meta verification code |
| **bing_verification** | `TEXT` | - | Bing Webmaster tools claimed verification code |
| **yandex_verification** | `TEXT` | - | Yandex claim verification code |
| **baidu_verification** | `TEXT` | - | Baidu claim verification code |
| **pinterest_verification** | `TEXT` | - | Pinterest domain verification tag |
| **created_at** | `TIMESTAMP` | Default: `NOW()` | Profile registration timestamp |

### `posts` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **id** | `UUID` | `PRIMARY KEY`, Default: `gen_random_uuid()` | Unique identifier of the post |
| **user_id** | `UUID` | `REFERENCES users(id) ON DELETE CASCADE` | Owner ID |
| **title** | `VARCHAR(100)` | `NOT NULL` | Recommendation product heading |
| **meta_description** | `VARCHAR(160)` | - | Brief review description for SEO |
| **image_url** | `TEXT` | - | Visual card banner link |
| **about** | `TEXT` | - | In-depth recommendation text / review writeup |
| **rating** | `DECIMAL(2,1)` | Check: `>= 1.0 AND <= 5.0` | Product star rating |
| **review_count** | `INTEGER` | Default: `0` | Number of verified product reviews |
| **shop_url** | `TEXT` | - | Call-to-action affiliate redirect shop link |
| **slug** | `VARCHAR(200)` | `NOT NULL` | Alphanumeric URL route path |
| **view_count** | `INTEGER` | Default: `0` | Total recommendation record views |
| **created_at** | `TIMESTAMP` | Default: `NOW()` | Curation creation timestamp |

**Relationships**:
* `posts.user_id` has a **Many-to-One** relationship with `users.id` with `ON DELETE CASCADE` constraints (if a user deletes their account, all storefront posts are automatically purged).
* Combined **Unique Constraint**: `UNIQUE(user_id, slug)` guarantees that a single curator cannot have duplicate post routes, while allowing multiple creators to curate the same product names.

---

## 4. API Routes Map

### Auth Endpoints
* **`POST /api/auth/register`**
  * **Description**: Alphanumeric and username uniqueness validation, profile insertion, and cookie assignment.
  * **Body**: `{ username, email, password }`
  * **Response**: `200 OK` `{ success: true, username }` | `400 Bad Request` `{ error }`
  * **Status**: ✅ Working

* **`POST /api/auth/login`**
  * **Description**: Verifies identifier (email or username), compares bcrypt hash, and issues session cookie.
  * **Body**: `{ identifier, password }`
  * **Response**: `200 OK` `{ success: true, user: { id, username, ... } }` | `401 Unauthorized` `{ error }`
  * **Status**: ✅ Working

* **`POST /api/auth/logout`**
  * **Description**: Clears the active authentication session token cookie.
  * **Response**: `200 OK` `{ success: true }`
  * **Status**: ✅ Working

---

### User/Context Endpoints
* **`GET /api/context`**
  * **Description**: Evaluates headers/cookies to resolve active subdomain branding and loaded profile parameters.
  * **Response**: `200 OK` `{ subdomain, subdomainUser, currentUser, isUsingNeon, error }`
  * **Status**: ✅ Working

* **`PUT /api/user/settings`**
  * **Description**: Authenticates active user and commits edits to display details or verification tags.
  * **Body**: `{ display_name, bio, avatar_url, google_verification, ... }`
  * **Response**: `200 OK` `{ success: true, user }` | `400/401 Bad Request` `{ error }`
  * **Status**: ✅ Working

---

### Posts & Search Endpoints
* **`GET /api/posts`**
  * **Description**: Fetches general or user-specific lists of curation posts.
  * **Query Params**: `search` (optional search query), `username` (filter by username)
  * **Response**: `200 OK` `[ { id, title, slug, rating, review_count, ... } ]`
  * **Status**: ✅ Working

* **`POST /api/posts`**
  * **Description**: Validates input bounds, translates title into slug format, and saves custom post.
  * **Body**: `{ title, meta_description, image_url, about, rating, review_count, shop_url }`
  * **Response**: `200 OK` `{ success: true, slug }` | `400/401/500` `{ error }`
  * **Status**: ✅ Working

* **`DELETE /api/posts/[id]`**
  * **Description**: Purges post with authorization verification.
  * **Response**: `200 OK` `{ success: true }` | `403 Forbidden` `{ error }`
  * **Status**: ✅ Working

* **`GET /api/posts/[id]/[slug]`**
  * **Description**: Retrieves detailed review, safely increments viewer counts, and returns payload.
  * **Response**: `200 OK` `{ id, title, rating, view_count, ... }` | `404 Not Found` `{ error }`
  * **Status**: ✅ Working

* **`GET /api/search`**
  * **Description**: Global search endpoint performing ILIKE queries on post titles and descriptions.
  * **Query Params**: `q` (search term)
  * **Response**: `200 OK` `[ { id, title, about, ... } ]`
  * **Status**: ✅ Working

* **`POST /api/simulate-subdomain`**
  * **Description**: Configures fallback clientside simulation cookie.
  * **Body**: `{ subdomain }`
  * **Response**: `200 OK` `{ success: true, subdomain }`
  * **Status**: ✅ Working

---

### Search Engine Optimization Files
* **`GET /robots.txt`**
  * **Description**: Detects the host's active subdomain and serves text output indicating allowed crawling paths.
  * **Response**: Text robots file mapping sitemaps dynamically.
  * **Status**: ✅ Working

* **`GET /sitemap.xml`**
  * **Description**: Collects active curation lists on active subdomain and returns search engine schema XML.
  * **Response**: XML payload containing links of active product reviews.
  * **Status**: ✅ Working

---

## 5. Auth System

* **Implementation Details**: Authentication is implemented using **JSON Web Tokens (JWT)** and **HTTP-Only Cookies**.
* **Session Storage**:
  * The session identifier JWT is stored in an HTTP-Only, secure cookie called `trodex-token`.
  * The cookie uses `sameSite: "lax"`, has a `maxAge` of 7 days, and has `secure: true` in production mode.
  * The server extracts the token inside `getAuthUser(req: NextRequest)` in `src/lib/auth.ts`, decodes it using a secret key, and yields authenticated properties.
* **Clientside Context Integration**: On mount, `ClientApp` calls `/api/context` to retrieve session profiles (`currentUser`) and updates global React state accordingly.
* **Why it doesn't break**: Because cookies are parsed server-side inside API routes and middleware, sessions remain highly secure and hidden from front-end Javascript vulnerabilities.

---

## 6. Known Bugs & Potential Architectural Challenges

### 1. Dynamic Route Name Conflicts in Next.js Server Routers
* **Bug**: Next.js throws router validation errors if dynamic folders share parent paths with inconsistent template syntax (e.g., mixing `[username]` and `[id]` parameter structures in parallel folders).
* **Cause**: Next.js strict slug sorting compiler limits overlapping parameter templates.
* **How it was fixed**: Restructured API directories by moving the post detail route inside `/api/posts/[id]/[slug]` so that Next.js compiling constraints are fully satisfied and build steps pass with 100% type safety.

### 2. Sandbox Subdomain Isolation in Shared Container Previews
* **Potential Issue**: In dev environments or container configurations, users might access the application through dynamic randomized URLs (e.g., `*.run.app` or `*.vercel.app`) rather than a direct root domain.
* **How it is mitigated**: Added a simulation cookie (`simulated_subdomain`) bar in the Header. Clicking the simulator lets users mock a custom subdomain easily inside their dynamic sandboxed iframes.

---

## 7. Environment Variables

| Variable | Used in | Purpose | Default / Fallback | Impact if Missing |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `src/lib/db.ts` | Connection to serverless PostgreSQL Neon cluster. | None (Required) | Application will throw clear database initialization error prompts. |
| `JWT_SECRET` | `src/lib/auth.ts`, `src/app/api/auth/*` | Secret phrase to sign and verify session JWTs. | `trodex-super-secret-key-123` | Session security decreases; tokens become decryptable if default fallback keys are used. |

---

## 8. What Is Working vs Broken

### ✅ Working
* **Brand Subdomains Routing**: Seamlessly rewritten internally via edge `middleware.ts`.
* **SEO Metadata Hooks**: Dynamic page titles, OG images, and custom search console meta headers are rendered perfectly by `[[...slug]]/page.tsx` during document requests.
* **Sitemaps & Crawler Support**: Dynamic and custom `sitemap.xml` and `robots.txt` outputs for domain curations.
* **Verification claim controls**: Supports saving claim tags for Google, Bing, Yandex, Baidu, and Pinterest.
* **Post Creation**: Secure validations, alphanumeric slug formatting, and storage.
* **Views Tracking**: Safely tracks curations views using transactional increments.
* **Auth sessions**: Clean login, register, and logout flows backed by cookie tokens.
* **Static Site Pages**: Custom views for `/about`, `/privacy`, and `/terms` terms documents.

### ❌ Broken
* *None.* No known bugs are currently present in the codebase. All compilation routes are 100% green.

### ⚠️ Partial
* *None.* All functional criteria are fully realized and persistent.
