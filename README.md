# 3D AI Person Chatbot — 500+ Feature Framework

A Flask + Google Gemini web chatbot with a Three.js 3D humanoid avatar with animated mouth/head while speaking, browser voice controls, chat history, memory-ready architecture, settings, and a catalog of 500+ planned/implemented feature points.

## Run locally

1. Install Python 3.10+.
2. Create a virtual environment:
   `python -m venv .venv`
3. Activate it on Windows:
   `.venv\Scripts\activate`
4. Install:
   `pip install -r requirements.txt`
5. Copy `.env.example` to `.env`.
6. Add your Gemini API key.
7. Run:
   `python app.py`
8. Open `http://127.0.0.1:5000`

## Notes

- The avatar is generated procedurally in Three.js, so no copyrighted character asset is bundled.
- Speech recognition and speech synthesis use browser APIs where supported. During speech synthesis, the avatar mouth opens/closes and the head subtly moves.
- Gemini calls are server-side; never put your API key in frontend JavaScript.
- `static/data/features.json` contains 500+ feature definitions grouped by module.
- Many feature definitions are extension points; the core chat, history, 3D avatar, voice UI, settings, theme, export, and feature browser are wired into this starter.

## Deployment

Render configuration is included. Add `GEMINI_API_KEY` as a secret environment variable.
