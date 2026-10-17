# Humanora AI — Write Naturally. Express Authentically.

> **Humanora AI** is a premium-quality AI writing improvement platform inspired by professional writing assistants such as StealthWriter. It transforms robotic, rigid drafts into authentic, fluent human writing while strictly preserving facts, citations, proper nouns, and the author's original meaning.

[![Humanora AI](https://img.shields.io/badge/Humanora-AI-amber)](https://github.com/Niththeesh/Humanora-AI)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Niththeesh%2FHumanora--AI-181717?logo=github)](https://github.com/Niththeesh/Humanora-AI)
![Gemini 4 Argon](https://img.shields.io/badge/Google%20Gemini-4%20Argon-blue)
![Supabase PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-emerald)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Express](https://img.shields.io/badge/Express-4.18-gray)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎨 Brand Identity

- **Brand Name**: **Humanora AI**
- **Tagline**: **Write Naturally. Express Authentically.**
- **Pictorial Identity**: A stylized feather integrated seamlessly with a human facial profile, symbolizing the fusion of human voice and writer's craft.
- **Design Aesthetic**: Matte charcoal & deep black backgrounds (`#0a0a0d`, `#121216`), crisp white typography, amber-gold accents (`#e5a93c`, `#ffd066`), subtle glassmorphic surfaces, and responsive layouts across mobile, tablet, and desktop.

---

## 🚀 Key Features

### 1. 10 Specialized Writing Improvement Modes
1. **Natural Rewrite**: Eliminates robotic stiffness, modulates sentence cadence, and produces organic human flow.
2. **Academic Clarity**: Scholarly, rigorous phrasing with formal transitions, intellectual precision, and zero invented citations.
3. **Professional Writing**: Polished workplace prose for emails, proposals, and client memos.
4. **Casual Writing**: Friendly, conversational tone using warm diction and natural phrasing.
5. **Concise Writing**: Eliminates bloat, throat-clearing, and repetition while retaining 100% of essential facts.
6. **Expand for Clarity**: Clarifies technical assertions with illustrative nuance without hallucinating new claims.
7. **Grammar Correction**: Rectifies syntax, agreement, and typographical errors with surgical precision.
8. **Tone Adjustment**: Calibrates formality anywhere along a 0–100% slider from austere formal to relaxed casual.
9. **Paraphrasing**: Restructures sentence syntax and introduces fresh vocabulary while retaining identical meaning.
10. **Summarization**: Synthesizes multi-paragraph documents into high-density executive takeaways.

### 2. Dual-Engine Intelligence
- **Google Gemini 3.8 Flash / 1.5 Flash Cloud Engine**: High-fidelity AI text transformation using Google's official Gen AI SDK.
- **High-Precision Local Linguistic Engine**: Embedded offline fallback that activates automatically when cloud APIs are unavailable or when offline, guaranteeing zero downtime.

### 3. Factual Safeguards & Input Protection
- **Fact Preservation**: Never alters dates, numbers, figures, citations, or quotations.
- **Prompt Injection Defense**: Treats user pasted text strictly as data, neutralizing attempts to override system prompt instructions.
- **Honest Standards**: Does NOT fabricate AI detection scores or promise deceitful detector evasion.

### 4. Interactive Workspace & Analysis
- **Side-by-Side Diff Comparison**: Highlights modified words and syntactical modulations in amber-gold.
- **Real-Time Quality Metrics**: Evaluates Readability, Syntactic Clarity, Lexical Variety, and Engagement.
- **Export Options**: One-click clipboard copy, plain text (`.txt`), Word document (`.docx`), and Markdown (`.md`).
- **Batch Document Processing**: Multi-file drag-and-drop processing for up to 10 documents.
- **Saved Session History**: PostgreSQL-backed or local session history with 1-click reload and deletion.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vite 5, React 18, TypeScript, Bespoke Charcoal & Amber-Gold Vanilla CSS Tokens.
- **Backend**: Node.js, Express 4.18, TypeScript, `@google/genai` (Google Gen AI SDK), `@supabase/supabase-js`.
- **Database**: Supabase PostgreSQL with versioned SQL migrations and in-memory session fallback.
- **Security**: Server-side credential isolation, rate limiting (30 req/min), CORS headers, security headers (nosniff, X-Frame-Options DENY).

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+ and npm installed
- Git

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd "AI Humanizer"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration
Copy the template file to `.env` in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

Configure your variables in `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Google Gemini API Key (Server-only secret)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# Supabase Credentials (Optional for durable cloud persistence)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> **Note**: If `GEMINI_API_KEY` is not provided, Humanora AI immediately operates via the built-in Local Linguistic Engine without crashing or throwing errors!

### 3. Start Development Servers
**Terminal 1 — Backend API Server:**
```bash
cd backend
npm run dev
```
*Backend runs on `http://localhost:5000`*

**Terminal 2 — Frontend Dev Server:**
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173` (proxies `/api` to port 5000)*

Open your browser at **`http://localhost:5173`**.

---

## 🔑 How to Obtain a Free Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google Account.
3. Click **"Get API key"** in the sidebar.
4. Click **"Create API key"** (select or create a Google Cloud project).
5. Copy the generated key and paste it as `GEMINI_API_KEY=AIzaSy...` in `backend/.env`.
6. Restart your backend server. The header indicator will show: `⚡ Gemini 3.8 Flash Live`.

**Free Tier Quotas (Google Developer Tier)**:
- Up to 15 RPM (requests per minute) on Flash models.
- Up to 1 million TPM (tokens per minute).
- Up to 1,500 RPD (requests per day) for free.

---

## 🗄️ Database Setup (Supabase PostgreSQL)

If you wish to persist writing sessions in PostgreSQL:
1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** in your Supabase project dashboard.
4. Copy the entire contents of [`backend/migrations/001_initial_schema.sql`](file:///c:/Users/Sritharan%20Niththeesh/OneDrive%20-%20%E6%B5%AE%E5%85%89%E6%B5%85%E5%A4%8F/Documents/Visual%20Studio%202022/Desktop/AI%20Humanizer/backend/migrations/001_initial_schema.sql) and click **Run**.
5. Copy your Project URL and service role secret key into `backend/.env`.

---

## 🧪 Automated Testing

Humanora AI includes a self-contained test suite validating health endpoints, input guards, 50k character boundaries, transformation, history persistence, deletion, and backward compatibility:

```bash
cd backend
npm run test
```

Expected output:
```
--- Starting Humanora AI Automated API Test Suite ---
  [PASS] GET /api/health returns 200 with service status
  [PASS] GET /api/ai/config returns available modes & quotas
  [PASS] POST /api/ai/transform rejects empty text with 400
  [PASS] POST /api/ai/transform rejects missing text with 400
  [PASS] POST /api/ai/transform rejects oversized text (>50k chars)
  [PASS] POST /api/ai/transform successfully processes text
  [PASS] GET /api/history returns saved transformations
  [PASS] GET /api/history/:id retrieves specific item
  [PASS] DELETE /api/history/:id deletes item
  [PASS] POST /api/humanize preserves backward compatibility
  [PASS] POST /api/batch processes document list

Test Run Summary: 11 passed, 0 failed
```

To verify production frontend build:
```bash
cd frontend
npm run build
```

---

## 🌐 Free Deployment Guide

### Option 1: Render (Free Web Service)
1. Fork or push this repository to GitHub.
2. Create a new Web Service on [Render](https://render.com).
3. Set Root Directory to `backend`.
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`
6. Add Environment Variables: `GEMINI_API_KEY`, `NODE_ENV=production`.
7. For the frontend, deploy to Vercel or Render Static Site pointing to `frontend/dist`.

### Option 2: Railway or Fly.io
Deploy the Express server as a Node.js service and serve the static Vite build directly or via CDN.

---

## ⚖️ Ethics & Responsible AI Use

Humanora AI is committed to honest, authentic writing improvement:
- **No Detector Deception Claims**: We do not claim 100% bypass of AI detectors or fabricate artificial scores.
- **Academic Integrity**: Intended for polishing, clarifying, and humanizing the author's original drafts—not for deceptive submission of third-party content.
- **Data Privacy**: Text is not logged permanently or used to train third-party AI models.

---

## 📄 License
This project is licensed under the MIT License.
