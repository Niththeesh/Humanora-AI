# SPEC.md — Humanora AI Humanizer & AI-Likelihood Detector Upgrade

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: Requirements and plan finalized. Execution unlocked.

---

## 1. Problem Diagnosis & Findings (Step 0)

### 1.1 Production App & `/docs` Freshness
- **Finding**: Root `index.html` redirects immediately via `<meta http-equiv="refresh" content="0; url=./docs/" />` and `window.location.replace("./docs/...")`.
- **Root Cause of Stale Production**: The `/docs` directory is a static distribution folder built by `npm run build` (which triggers `npm run build:docs` copying `frontend/dist` to `docs`). Frontend source edits in `frontend/src` do not reflect in `/docs` until a full root build is executed.

### 1.2 Engine Execution & Fallback Tracing
- **Finding**: In `backend/.env`, `GEMINI_API_KEY` is configured and `GEMINI_MODEL=gemini-3.5-flash-lite`.
- **Root Cause of Silent Fallbacks**:
  1. In `backend/src/services/geminiService.ts`, when cloud calls fail, timeout, or encounter quota limits, the error is caught and routed directly to `executeLocalFallback` without surfacing an explicit indicator or badge in the API response or UI.
  2. In `frontend/src/App.tsx`, if the backend is down or unreachable (such as when testing the static bundle directly in `/docs`), it silently executes `clientHumanize` in `clientHumanizer.ts`.
  3. No visual badge in the UI currently informs the user whether their text was transformed by the Gemini cloud model or the local/browser fallback engine.

### 1.3 Why Output Quality Was Weak
- **Local Fallback (`humanizationService.ts` & `clientHumanizer.ts`)**:
  - The engine performed basic regex-based string replacements (e.g., swapping "Furthermore," for "Also, ", and "plays a crucial role in" for "is key to").
  - It did not restructure sentences, did not split or combine sentences, did not reorder clauses, and did not break the uniform sentence length distribution. AI detectors easily flagged the identical sentence and clause structures.
- **Gemini Pipeline (`geminiService.ts`)**:
  - Used a single-pass monolithic prompt without a self-critique/refinement pass.
  - Did not enforce sentence-length variance (mixing short 5-word sentences with longer 30-word analytical ones).
  - Temperature (~0.9) and topP (~0.95) parameters were omitted, letting the model fall back to default lower temperatures that produce formulaic AI prose.
  - Did not rewrite paragraph-by-paragraph with strict anti-cliché and varied-syntax instructions.

---

## 2. Proposed Architecture & Implementation Plan

### Step 1: Improve Gemini Humanization Pipeline (`backend/src/services/geminiService.ts`)
- **System Prompt & Settings**:
  - Temperature: `0.9`, TopP: `0.95`.
  - Strict paragraph-by-paragraph rewriting preserving all empirical facts, numbers, dates, citations (APA, MLA, IEEE, Chicago), direct quotes, and original semantics. Zero fabrication.
  - Rhythm & Cadence: Strongly vary sentence lengths (mix punchy 5-word sentences and complex 30-word sentences), vary sentence openings (participial phrases, prepositional phrases, dependent clauses), use organic transitions, natural contractions where mode allows.
  - Ban AI clichés: "delve", "furthermore", "moreover", "in conclusion", "it is important to note", "plays a crucial role", "tapestry", "landscape", triplet lists ("X, Y, and Z"), and robotic throat-clearing.
  - Prompt injection defense: Treat user draft strictly as raw data.
  - Two-Pass Pipeline:
    - Pass 1: Comprehensive paragraph-level rewrite with cadence modulation.
    - Pass 2: Self-critique pass that inspects Pass 1 output for lingering formulaic phrases, repetitive openings, or stiff rhythm and refines them.
  - Maintain support for all existing modes (Natural, Academic, Professional, Casual, Concise, Expand, etc.), tone, and complexity sliders.

### Step 2: Improve Local Fallback Engine (`backend` & `frontend`)
- Upgrade both `backend/src/services/humanizationService.ts` and `frontend/src/utils/clientHumanizer.ts`:
  - Add intelligent sentence splitting and merging based on clauses and conjunctions.
  - Implement clause reordering (e.g., preposing dependent clauses, participial openers).
  - Implement synonym variation with a sliding no-repeat window (avoid repeating the same substitute word).
  - Remove cliché phrases and replace with diversified phrasing.
  - Safeguard numbers, citations, quotes, and technical entities through deterministic token shielding.
  - Add a prominent, polished "Local Fallback Engine" badge in the UI when fallback is used.

### Step 3: Build AI-Likelihood Detector (Honest Heuristics + Optional LLM Style Check)
- **Backend API**: `POST /api/detect` in `backend/src/routes/ai.ts` and `aiController.ts`:
  - Calculate verifiable heuristic signals:
    - Sentence-length variance / standard deviation (Burstiness score)
    - Lexical diversity (Type-Token Ratio)
    - Repeated n-gram rate (repetitive syntax pattern score)
    - AI-cliché phrase density
    - Transitional word uniformity
    - Paragraph uniformity
  - Calculate combined honest AI-Likelihood score (0–100%) and categorise into Low / Medium / High.
  - Identify highlighted sentences with specific diagnostic reasons.
  - Optional Gemini style analysis for deep syntactic critique when configured.
  - Strict honest disclaimer: "Estimate based on writing patterns. Not equivalent to Turnitin/GPTZero and not a guarantee." Never claim detector bypass.
- **Frontend AI Detector Panel**:
  - Build `AIDetectorPanel.tsx` (replacing the unused mock `AIDetectionMeter.tsx`).
  - Provide an interactive "Before vs After" comparison card showing initial vs humanized scores side-by-side.
  - Show highlighted sentences, detected patterns, and actionable feedback.
  - Add a standalone "Check AI Score" trigger on the input editor so users can inspect text before humanizing.

### Step 4: Verification, Testing & Build
- Add automated backend test suite in `backend/tests/api.test.ts` for `POST /api/detect` (empty text, oversized text, normal text).
- Run `npm test --prefix backend`.
- Run root `npm run build` so `frontend/dist` is compiled and synced to `docs/`.
- Verify with 3 diverse sample AI texts, proving:
  1. Facts, numbers, citations are 100% preserved.
  2. Detector scores drop significantly.
  3. Visual UI renders properly.

### Step 5: Git Commit & State Update
- Follow atomic commit conventions: `type(scope): description`.
- Update `.gsd/STATE.md`.

