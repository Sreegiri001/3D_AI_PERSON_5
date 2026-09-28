import os, json, sqlite3
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
DB = os.path.join(os.path.dirname(__file__), "chatbot.db")

def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    con = db()
    con.execute("""CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
    )""")
    con.execute("""CREATE TABLE IF NOT EXISTS memories(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
    )""")
    con.commit(); con.close()

def call_gemini(message, history):
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    if not api_key:
        return "Gemini API key is not configured. Add GEMINI_API_KEY to your .env file."
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = os.getenv("SYSTEM_PROMPT",
            "You are a friendly 3D AI person assistant. Be helpful, concise, and conversational.")
        contents = [{"role":"user","parts":[{"text":prompt}]}]
        for item in history[-12:]:
            contents.append({"role": item["role"], "parts":[{"text": item["content"]}]})
        contents.append({"role":"user","parts":[{"text":message}]})
        response = client.models.generate_content(model=model, contents=contents)
        return getattr(response, "text", None) or "I couldn't generate a response."
    except Exception as e:
        return f"AI service error: {type(e).__name__}: {e}"

@app.route("/")
def index():
    return render_template("index.html")

@app.get("/api/history")
def history():
    con = db()
    rows = con.execute("SELECT role, content, created_at FROM messages ORDER BY id").fetchall()
    con.close()
    return jsonify([dict(r) for r in rows])

@app.post("/api/chat")
def chat():
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error":"Message is empty"}), 400
    con = db()
    rows = con.execute("SELECT role, content FROM messages ORDER BY id").fetchall()
    history = [dict(r) for r in rows]
    answer = call_gemini(message, history)
    now = datetime.now().isoformat(timespec="seconds")
    con.execute("INSERT INTO messages(role,content,created_at) VALUES(?,?,?)", ("user", message, now))
    con.execute("INSERT INTO messages(role,content,created_at) VALUES(?,?,?)", ("model", answer, now))
    con.commit(); con.close()
    return jsonify({"reply": answer})

@app.post("/api/clear")
def clear():
    con = db()
    con.execute("DELETE FROM messages")
    con.commit(); con.close()
    return jsonify({"ok": True})

@app.get("/api/features")
def features():
    with open(os.path.join("static","data","features.json"), encoding="utf-8") as f:
        return jsonify(json.load(f))

init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
