# CreatorFlow AI — Smart Automation for Content Creators

A production-oriented full-stack web application built to help content creators automate repetitive work while retaining human control over every AI-generated deliverable and external action.

---

## 1. Overview & Brand Identity

**CreatorFlow AI** centralizes the creator workflow into seven specialized automation modules, a Human Approval Center, a Visual Content Calendar, an Audit History log, and Brand Kit management.

### Design System & Visual Tokens
- **Primary Green**: `#71A832` (Actions, active links, progress badges, approved states)
- **Primary Hover Green**: `#5B8A26`
- **Ivory Background**: `#FFFFF0` (Application canvas, empty-state backgrounds)
- **White Cards**: `#FFFFFF` with warm subtle borders (`#E8E6DF`)
- **Primary Text**: Dark Charcoal (`#1F2937`)
- **Secondary Text**: Muted Gray (`#6B7280`)

---

## 2. Seven Automation Modules

1. **Automated Content Planning** (`/automations/planning`):
   - Trend research engine, audience pain point extraction, and competitor content gap detection.
   - Relevance score methodology: Weighted formula (`40% Search Velocity + 35% Audience Pain Point Frequency + 25% Low Competition Index`).
   - 7-day and 30-day roadmap calendars with source URLs and retrieval timestamps.

2. **Video Editing & Repurposing** (`/automations/video`):
   - Natural language editing instruction parser (translates instructions like *"Remove silences > 1.8s and reframe to vertical"* into validated FFmpeg timeline commands).
   - Candidate clip highlight detection with timestamp windows (`00:30 - 01:15`) and speech hook snippets.
   - Subtitle generator and burned subtitle styling in Brand Kit colors.

3. **Automatic Publishing & Scheduling** (`/automations/publishing`):
   - Multi-platform constraint validation (character limits, video ratios, hashtag quotas).
   - Idempotency-backed scheduling queue (blocks duplicate accidental posts to identical accounts/times).
   - Manual publish fallback with one-click copy when platform OAuth is disconnected.

4. **Performance Analysis** (`/automations/analytics`):
   - Audience retention cliff analysis (visual curve over the first 4 minutes).
   - Top-performing content audit and watch time comparisons.
   - Evidence-based AI recommendations with explicit citations to empirical viewer behavior.

5. **Sponsorship & Brand Deal Management** (`/automations/sponsorships`):
   - Natural language email parser: extracts brand name, contact, proposed budget, requested deliverables, deadlines, and usage rights.
   - Creator rate card comparison (evaluates against standard rates: Dedicated $2,800, Integrated $1,400, Post $750).
   - Suggested negotiation response draft generator and active deliverables tracker.

6. **Thumbnail & Graphic Creation** (`/automations/thumbnails`):
   - Scalable vector (SVG) engine rendering 16:9, 9:16, and 1:1 layouts.
   - Brand Kit color (#71A832), font, and badge sticker styling.
   - High-CTR split-contrast visual hierarchy.

7. **Script, Caption & Post Generation** (`/automations/scripts`):
   - Multi-platform draft generator: video scripts with hooks, chapters, CTA, formatted LinkedIn posts, and Instagram captions with hashtags.
   - Empirical fact-check warnings to prevent hallucinated claims.
   - Feedback-driven regeneration that preserves version history (v1 and v2 coexist).

---

## 3. Universal Automation Lifecycle & Approval Gate

Every module adheres to the universal 7-step lifecycle:
1. **Collect Requirements**: Validated input forms with inline constraint feedback.
2. **Start Automation**: Creates persistent `AutomationRun` record in SQLite/PostgreSQL with `RUNNING` status and logs lifecycle events.
3. **Generate Output**: AI provider / service abstraction processes the request and persists `ContentAsset` + `ContentVersion`.
4. **Universal Approval Card**:
   - Deliverable preview (SVG render, script outline, clips timeline, or deal memo).
   - Output summary and Quality Assurance notices.
   - Controls: **Approve / Like**, **Dislike / Request Improvements**, **Edit Deliverable**, **Regenerate**, **Save Draft**.
5. **On Approval**: Marks decision as `APPROVED`, records creator timestamp, version number, notes, and unlocks downstream actions (e.g., calendar scheduling).
6. **On Dislike (Feedback Loop)**:
   - Opens modal with selectable reasons (*Wrong tone*, *Poor quality*, *Not relevant*, *Incorrect info*, *Missing details*, *Does not match brand*).
   - Collects required explanation and specific improvements.
   - Generates an improved version (Version N+1) that coexists with previous versions.
7. **Shared Content Editor**: Reusable modal to edit title, body, format, inspect version history, copy text, or export to TXT/JSON.

---

## 4. Technology Stack

- **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Route Handlers with service-layer architecture (`/src/services`).
- **Database & ORM**: Prisma ORM with SQLite (`file:./dev.db`) for zero-friction local development, easily configurable to PostgreSQL.
- **Authentication**: Bcrypt password hashing, signed JWT sessions with `jose`, HTTP-only secure cookies.
- **Testing**: Vitest test suite covering all 22 user journeys.

---

## 5. Quick Start Instructions

### Prerequisites
- Node.js (v18.0.0 or higher, tested on v24.18.0)
- npm or npm.cmd

### Installation
```bash
# 1. Clone repository and navigate to root directory
cd AutomationforContentCreators

# 2. Install dependencies
npm.cmd install

# 3. Synchronize database schema
npm.cmd run db:push

# 4. Seed database with default creator account and sample workflows
npm.cmd run db:seed

# 5. Start development server
npm.cmd run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Default Credentials
- **Email**: `creator@creatorflow.io`
- **Password**: `Password123!`
*(Or click "Fill Demo Credentials" on the login page)*

---

## 6. Environment Configuration

Copy `.env.example` to `.env`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication & Sessions
JWT_SECRET="creatorflow_development_secret_key_9876543210_abcdef"
APP_URL="http://localhost:3000"

# AI Provider Configuration (Optional)
# If left empty, CreatorFlow operates in built-in deterministic demo engine with truthful indicators
AI_PROVIDER="demo" # or "openai", "anthropic", "gemini"
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GEMINI_API_KEY=""

# Media & Storage
STORAGE_PROVIDER="local"
STORAGE_LOCAL_PATH="./public/uploads"
FFMPEG_PATH=""

# Platform API Integrations (Optional)
YOUTUBE_CLIENT_ID=""
YOUTUBE_CLIENT_SECRET=""
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
INSTAGRAM_CLIENT_ID=""
INSTAGRAM_CLIENT_SECRET=""
TIKTOK_CLIENT_ID=""
TIKTOK_CLIENT_SECRET=""
```

---

## 7. Running Automated Tests

Run the full automated test suite verifying all 22 core journeys:

```bash
npm.cmd run test
```

Tests verify:
- User signup, password hashing, and JWT security.
- Unauthorized workspace boundary isolation.
- Form validations and platform character limits.
- Asset persistence and version creation.
- Automation run lifecycle (`RUNNING` → `AWAITING_APPROVAL` → `APPROVED`).
- Feedback submission and version preservation (v1 and v2 coexisting).
- Idempotency blocking duplicate scheduled releases.
- Disconnected platform failure handling and manual fallback.
- Sponsorship rate card comparison calculations.
- Natural language video instruction parsing into edit plans.
- Truthful AI provider disclosure states.

---

## 8. Integration Statuses & Disclosures

| Integration | Current Status | Notes |
| :--- | :--- | :--- |
| **Database** | **Connected (SQLite / dev.db)** | Fully relational with Prisma schema, indexes, and cascades |
| **Authentication** | **Connected** | Secure bcrypt + JWT session cookies |
| **Media Storage** | **Connected** | Local persistent storage in `/public/uploads` |
| **AI LLM** | **Deterministic Engine / Demo** | Set `OPENAI_API_KEY` in `.env` to activate live GPT-4o calls |
| **FFmpeg** | **Simulation / Edit-Plan Mode** | Discloses status; if system FFmpeg is in PATH, hardware rendering activates |

---

CreatorFlow AI is an all-in-one smart automation platform for content creators. It automates content planning, video editing, publishing, performance analysis, sponsorship management, graphic creation, and script generation with AI-powered workflows and human approval.

