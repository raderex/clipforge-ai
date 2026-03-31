# 🔥 ClipForge — AI Video Clipper

> Open-source, local-first AI video clipper with Whop integration. Your data, your machine.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                       │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ URLInput │  │WhopRules │  │ Settings │  │Pipeline│ │
│  │          │  │          │  │          │  │ Status │ │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └────────┘ │
│       │              │                                   │
│       └──────┬───────┘                                   │
│              ▼                                           │
│     POST /api/process                                    │
│     { url, api_key, whop_rules }                         │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────┐
│              PYTHON BACKEND (localhost:8420)              │
│                                                          │
│  Step 1: yt-dlp ─────────────────► Download video        │
│              │                                           │
│  Step 2: Whisper (small) ────────► Transcribe audio      │
│              │                                           │
│  Step 3: Qwen 3.5 2B (vision) ──► Score keyframes        │
│              │                                           │
│  Step 4: Gemini 2.5 (brain) ────► Select best clips      │
│              │     ▲                                     │
│              │     │                                     │
│              │  Whop Rules injected into Gemini prompt   │
│              │                                           │
│  Step 5: FFmpeg ─────────────────► Render final clips     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## How Everything Is Wired Up

### Frontend → Backend Communication

1. **User pastes a video URL** in the `URLInput` component
2. **User configures Whop rules** in the `WhopRules` tab (optional)
3. On submit, the frontend sends a `POST /api/process` request to `localhost:8420` with:
   - `url` — the video URL
   - `api_key` — Gemini API key
   - `whop_rules` — content guidelines from Whop
4. Frontend polls `GET /api/status` to track pipeline progress
5. `PipelineStatus` component visualizes each stage in real-time

### Backend Pipeline (5 stages)

| Stage | Tool | What It Does |
|-------|------|-------------|
| **Download** | `yt-dlp` | Downloads video from 1000+ supported sites |
| **Transcribe** | `Whisper small` | Converts audio to timestamped text segments |
| **Vision** | `Qwen 3.5 2B` | Extracts keyframes every 5s, scores visual engagement (1-10) |
| **Brain** | `Gemini 2.5` | Analyzes transcript + vision scores + **Whop rules** to select optimal clips |
| **Export** | `FFmpeg` | Renders final clip files with proper encoding |

### Whop Rules Integration

The Whop rules flow is:

```
WhopRules component → state → POST body → Gemini prompt injection → clip filtering
```

Rules are injected into the Gemini 2.5 prompt as a mandatory constraint section. The AI is instructed to **skip any clip that violates the rules**, ensuring all exported content complies with your Whop community guidelines.

Example rules:
- "No profanity in clips"
- "Must include a hook in the first 3 seconds"
- "Keep clips under 60 seconds"
- "Vertical format preferred (9:16)"

### Dashboard Layout

```
┌──────────────────────────────────────────┐
│              Header (sticky)             │
├────────┬─────────────────────────────────┤
│        │                                 │
│ Sidebar│   Main Content Area             │
│        │                                 │
│ • Clip │   Clipper: URL input, pipeline, │
│ • Rules│            clip results         │
│ • Stack│   Rules:   Whop rules editor    │
│ • Config│  Stack:   AI tool breakdown    │
│        │   Config:  Model settings       │
│        │                                 │
├────────┴─────────────────────────────────┤
│         Mobile: Bottom tab nav           │
└──────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Python 3 + Flask + Flask-CORS |
| Video Download | yt-dlp |
| Transcription | OpenAI Whisper (small model) |
| Vision Analysis | Qwen 3.5 2B (local GPU) |
| AI Brain | Google Gemini 2.5 (API) |
| Video Rendering | FFmpeg |

## Getting Started

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
pip install yt-dlp openai-whisper transformers torch pillow flask flask-cors
python public/clipforge_backend.py --server
```

### CLI Mode
```bash
python public/clipforge_backend.py --url "https://youtube.com/watch?v=..." --api-key "YOUR_GEMINI_KEY"
```

## Environment Variables

| Variable | Description |
|----------|------------|
| `GEMINI_API_KEY` | Google Gemini 2.5 API key |

## License

Open-source. Your data stays on your machine.
