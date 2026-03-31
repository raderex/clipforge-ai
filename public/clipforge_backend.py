#!/usr/bin/env python3
"""
ClipForge - AI Video Clipper Backend
Open-source, local-first video clipping pipeline.

Stack:
  - yt-dlp: Video download
  - Whisper (small): Transcription
  - Qwen 3.5 2B: Vision analysis (frame scoring)
  - Gemini 2.5: Brain (clip selection & reasoning)
  - FFmpeg: Final clip rendering

Usage:
  python clipforge_backend.py --url "https://youtube.com/watch?v=..." --api-key "YOUR_GEMINI_KEY"

Requirements:
  pip install yt-dlp openai-whisper transformers torch pillow flask flask-cors
  # Also needs ffmpeg installed system-wide
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

# ─── Configuration ───────────────────────────────────────────────────────────

DEFAULT_WHISPER_MODEL = "small"
DEFAULT_VISION_MODEL = "Qwen/Qwen2.5-VL-2B-Instruct"  # Qwen 3.5 2B equivalent
DEFAULT_MAX_CLIP_DURATION = 60
DEFAULT_OUTPUT_FORMAT = "mp4"
OUTPUT_DIR = Path("./clipforge_output")


def ensure_deps():
    """Check required tools are installed."""
    for cmd in ["yt-dlp", "ffmpeg", "ffprobe"]:
        if subprocess.run(["which", cmd], capture_output=True).returncode != 0:
            print(f"[ERROR] '{cmd}' not found. Install it first.")
            sys.exit(1)


# ─── Step 1: Download Video ─────────────────────────────────────────────────

def download_video(url: str, output_dir: Path) -> Path:
    """Download video using yt-dlp."""
    print(f"\n[1/5] ⬇ Downloading video...")
    output_template = str(output_dir / "source.%(ext)s")
    cmd = [
        "yt-dlp",
        "-f", "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
        "--merge-output-format", "mp4",
        "-o", output_template,
        "--no-playlist",
        url,
    ]
    subprocess.run(cmd, check=True)
    # Find the downloaded file
    for f in output_dir.glob("source.*"):
        if f.suffix in [".mp4", ".mkv", ".webm"]:
            print(f"  ✓ Downloaded: {f.name}")
            return f
    raise FileNotFoundError("Download failed - no video file found")


# ─── Step 2: Transcribe with Whisper ────────────────────────────────────────

def transcribe_video(video_path: Path, model_name: str = DEFAULT_WHISPER_MODEL) -> list[dict]:
    """Transcribe video using OpenAI Whisper (local)."""
    print(f"\n[2/5] 🎙 Transcribing with Whisper ({model_name})...")
    import whisper

    model = whisper.load_model(model_name)
    result = model.transcribe(str(video_path), verbose=False)

    segments = []
    for seg in result["segments"]:
        segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip(),
        })

    print(f"  ✓ Transcribed {len(segments)} segments")
    return segments


# ─── Step 3: Vision Analysis with Qwen ──────────────────────────────────────

def extract_keyframes(video_path: Path, interval_sec: int = 5) -> list[Path]:
    """Extract keyframes from video at regular intervals."""
    frames_dir = video_path.parent / "frames"
    frames_dir.mkdir(exist_ok=True)

    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-vf", f"fps=1/{interval_sec}",
        "-q:v", "2",
        str(frames_dir / "frame_%04d.jpg"),
        "-y", "-loglevel", "error",
    ]
    subprocess.run(cmd, check=True)

    frames = sorted(frames_dir.glob("frame_*.jpg"))
    print(f"  Extracted {len(frames)} keyframes")
    return frames


def analyze_frames_with_vision(frames: list[Path]) -> list[dict]:
    """Score frames using Qwen vision model for visual engagement."""
    print(f"\n[3/5] 👁 Analyzing frames with Qwen vision model...")

    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from PIL import Image

        model_name = DEFAULT_VISION_MODEL
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_name, trust_remote_code=True, device_map="auto"
        )

        frame_scores = []
        for i, frame_path in enumerate(frames):
            image = Image.open(frame_path)
            prompt = (
                "Rate this video frame for social media clip potential on a scale of 1-10. "
                "Consider: visual appeal, action/motion, text on screen, face visibility, "
                "emotional intensity. Reply with just the number."
            )

            inputs = tokenizer.apply_chat_template(
                [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": prompt}]}],
                return_tensors="pt",
                add_generation_prompt=True,
            )

            outputs = model.generate(inputs, max_new_tokens=10)
            score_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

            try:
                score = int("".join(c for c in score_text if c.isdigit())[:1]) or 5
            except (ValueError, IndexError):
                score = 5

            frame_scores.append({
                "frame_index": i,
                "timestamp": i * 5,  # Based on extraction interval
                "score": score,
                "path": str(frame_path),
            })

        print(f"  ✓ Scored {len(frame_scores)} frames")
        return frame_scores

    except ImportError:
        print("  ⚠ Qwen model not available, using uniform scores")
        return [
            {"frame_index": i, "timestamp": i * 5, "score": 5, "path": str(f)}
            for i, f in enumerate(frames)
        ]


# ─── Step 4: Brain - Gemini Clip Selection ──────────────────────────────────

def select_clips_with_gemini(
    transcript: list[dict],
    frame_scores: list[dict],
    api_key: str,
    video_duration: float,
    max_clip_duration: int = DEFAULT_MAX_CLIP_DURATION,
) -> list[dict]:
    """Use Gemini 2.5 to intelligently select the best clips."""
    print(f"\n[4/5] 🧠 Selecting clips with Gemini 2.5...")

    import requests

    prompt = f"""You are ClipForge, an AI that selects the best clips from a video for social media.

VIDEO DURATION: {video_duration:.0f} seconds

TRANSCRIPT (with timestamps):
{json.dumps(transcript[:100], indent=2)}

VISUAL ENGAGEMENT SCORES (1-10 per 5-second interval):
{json.dumps(frame_scores[:50], indent=2)}

TASK: Select 3-6 clips that would perform best on social media (TikTok, YouTube Shorts, Instagram Reels).

For each clip, provide:
- title: catchy short title
- start_time: start in seconds
- end_time: end in seconds (max {max_clip_duration}s duration)
- score: viral potential 0-100
- tags: list of relevant tags
- reason: why this clip will perform well

Return ONLY valid JSON array of clips. No markdown, no explanation."""

    # Inject Whop rules if provided
    if whop_rules:
        prompt += f"""

IMPORTANT - WHOP COMMUNITY RULES (must be enforced):
{whop_rules}

Only select clips that comply with ALL the above Whop rules. If a potential clip violates any rule, skip it."""

    headers = {
        "Content-Type": "application/json",
    }

    # Using Gemini API directly
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2048},
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()

    result = response.json()
    text = result["candidates"][0]["content"]["parts"][0]["text"]

    # Parse JSON from response
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]

    clips = json.loads(text)
    print(f"  ✓ Selected {len(clips)} clips")
    return clips


# ─── Step 5: Render Clips with FFmpeg ────────────────────────────────────────

def render_clips(
    video_path: Path,
    clips: list[dict],
    output_dir: Path,
    output_format: str = DEFAULT_OUTPUT_FORMAT,
) -> list[Path]:
    """Render final clips using FFmpeg."""
    print(f"\n[5/5] 🎬 Rendering clips with FFmpeg...")

    rendered = []
    clips_dir = output_dir / "clips"
    clips_dir.mkdir(exist_ok=True)

    for i, clip in enumerate(clips):
        start = clip["start_time"]
        end = clip["end_time"]
        duration = end - start
        safe_title = "".join(c if c.isalnum() or c in " -_" else "" for c in clip.get("title", f"clip_{i}"))
        output_path = clips_dir / f"{i+1:02d}_{safe_title[:40]}.{output_format}"

        cmd = [
            "ffmpeg",
            "-ss", str(start),
            "-i", str(video_path),
            "-t", str(duration),
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            "-y",
            "-loglevel", "error",
            str(output_path),
        ]

        subprocess.run(cmd, check=True)
        rendered.append(output_path)
        print(f"  ✓ Clip {i+1}: {output_path.name} ({duration:.0f}s)")

    return rendered


# ─── API Server (for React frontend) ────────────────────────────────────────

def run_api_server(port: int = 8420):
    """Run Flask API server for the React frontend."""
    from flask import Flask, jsonify, request
    from flask_cors import CORS
    import threading

    app = Flask(__name__)
    CORS(app)

    # Store processing state
    state = {"stage": "idle", "clips": [], "error": None}

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "version": "0.1.0"})

    @app.route("/api/status", methods=["GET"])
    def status():
        return jsonify(state)

    @app.route("/api/process", methods=["POST"])
    def process():
        data = request.json
        url = data.get("url")
        api_key = data.get("api_key", os.environ.get("GEMINI_API_KEY", ""))

        if not url:
            return jsonify({"error": "URL required"}), 400
        if not api_key:
            return jsonify({"error": "Gemini API key required"}), 400

        def run_pipeline():
            try:
                work_dir = Path(tempfile.mkdtemp(prefix="clipforge_"))

                state["stage"] = "downloading"
                state["error"] = None
                video_path = download_video(url, work_dir)

                # Get video duration
                probe = subprocess.run(
                    ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                     "-of", "default=noprint_wrappers=1:nokey=1", str(video_path)],
                    capture_output=True, text=True,
                )
                duration = float(probe.stdout.strip())

                state["stage"] = "transcribing"
                transcript = transcribe_video(video_path)

                state["stage"] = "analyzing"
                frames = extract_keyframes(video_path)
                frame_scores = analyze_frames_with_vision(frames)

                state["stage"] = "clipping"
                clips = select_clips_with_gemini(transcript, frame_scores, api_key, duration)

                OUTPUT_DIR.mkdir(exist_ok=True)
                rendered = render_clips(video_path, clips, OUTPUT_DIR)

                state["stage"] = "done"
                state["clips"] = [
                    {**c, "file": str(r)} for c, r in zip(clips, rendered)
                ]

            except Exception as e:
                state["stage"] = "idle"
                state["error"] = str(e)
                print(f"[ERROR] {e}")

        thread = threading.Thread(target=run_pipeline, daemon=True)
        thread.start()
        return jsonify({"status": "started"})

    print(f"\n🔥 ClipForge API running on http://localhost:{port}")
    print(f"   Connect your frontend to this address\n")
    app.run(host="0.0.0.0", port=port, debug=False)


# ─── CLI Entry Point ────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="ClipForge - AI Video Clipper (Local & Open-Source)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--url", help="Video URL to process")
    parser.add_argument("--api-key", help="Gemini API key (or set GEMINI_API_KEY env)")
    parser.add_argument("--whisper-model", default=DEFAULT_WHISPER_MODEL)
    parser.add_argument("--max-duration", type=int, default=DEFAULT_MAX_CLIP_DURATION)
    parser.add_argument("--format", default=DEFAULT_OUTPUT_FORMAT, choices=["mp4", "webm", "mov"])
    parser.add_argument("--server", action="store_true", help="Run as API server for frontend")
    parser.add_argument("--port", type=int, default=8420)
    args = parser.parse_args()

    if args.server:
        run_api_server(args.port)
        return

    if not args.url:
        parser.error("--url is required (or use --server mode)")

    api_key = args.api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        parser.error("Gemini API key required (--api-key or GEMINI_API_KEY env)")

    ensure_deps()

    print("=" * 60)
    print("  🔥 CLIPFORGE - AI Video Clipper")
    print("  Open-source · Local-first · Your data, your machine")
    print("=" * 60)

    work_dir = Path(tempfile.mkdtemp(prefix="clipforge_"))
    OUTPUT_DIR.mkdir(exist_ok=True)

    video_path = download_video(args.url, work_dir)

    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(video_path)],
        capture_output=True, text=True,
    )
    duration = float(probe.stdout.strip())

    transcript = transcribe_video(video_path, args.whisper_model)
    frames = extract_keyframes(video_path)
    frame_scores = analyze_frames_with_vision(frames)
    clips = select_clips_with_gemini(transcript, frame_scores, api_key, duration, args.max_duration)
    rendered = render_clips(video_path, clips, OUTPUT_DIR, args.format)

    print(f"\n{'=' * 60}")
    print(f"  ✅ Done! {len(rendered)} clips saved to {OUTPUT_DIR}/clips/")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()
