from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

from database import init_db, save_note_db, get_notes_db, clear_notes_db

app = Flask(__name__)

MEMORY_FILE = "memory.json"


def load_memory():
    if not os.path.exists(MEMORY_FILE):
        default_memory = {
            "user_name": "",
            "notes": [],
            "chat_history": []
        }
        with open(MEMORY_FILE, "w", encoding="utf-8") as f:
            json.dump(default_memory, f, indent=4)

    with open(MEMORY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_memory(data):
    with open(MEMORY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)


def get_time_text():
    return datetime.now().strftime("%I:%M %p")


def get_date_text():
    return datetime.now().strftime("%d %B %Y")


def public_command_reply(msg: str):
    msg = msg.lower().strip()

    if "open youtube" in msg:
        return "[OPEN_URL]https://www.youtube.com"

    if "open google" in msg:
        return "[OPEN_URL]https://www.google.com"

    if "open github" in msg:
        return "[OPEN_URL]https://github.com"

    if "open linkedin" in msg:
        return "[OPEN_URL]https://www.linkedin.com"

    return None


def fallback_ai_reply(user_message, memory):
    msg = user_message.lower().strip()

    url_command = public_command_reply(user_message)
    if url_command:
        return url_command

    if msg.startswith("my name is "):
        name = user_message[11:].strip()
        if name:
            memory["user_name"] = name
            save_memory(memory)
            return f"Identity stored successfully. Welcome, {name}. I will remember you."
        return "Please provide a valid name."

    if msg in ["what is my name", "who am i", "tell my name"]:
        if memory["user_name"]:
            return f"Your name is {memory['user_name']}."
        return "I do not know your name yet. Tell me by typing: My name is Kathirvel."

    if "time" in msg:
        return f"The current time is {get_time_text()}."

    if "date" in msg or "today" in msg:
        return f"Today is {get_date_text()}."

    if msg.startswith("save note "):
        note = user_message[10:].strip()
        if note:
            memory["notes"].append(note)
            save_note_db(note)
            save_memory(memory)
            return f"Note saved successfully: {note}"
        return "I could not find any note content to save."

    if msg in ["show my notes", "show notes", "my notes"]:
        notes = get_notes_db()
        if not notes:
            return "No notes are stored yet."
        return "Here are your saved notes:\n- " + "\n- ".join(notes)

    if "hello" in msg or "hi" in msg or "hey" in msg:
        user_name = memory.get("user_name", "")
        if user_name:
            return f"Hello {user_name}. EDITH systems are online and ready for your command."
        return "Hello. EDITH systems are online and ready."

    if "how are you" in msg:
        return "All systems are stable. I am functioning perfectly."

    if "who are you" in msg:
        return (
            "I am your EDITH-style personal assistant with voice support, memory, note saving, "
            "and public web deployment support."
        )

    if "clear memory" in msg:
        memory["user_name"] = ""
        memory["notes"] = []
        memory["chat_history"] = []
        clear_notes_db()
        save_memory(memory)
        return "Memory cleared successfully."

    if "help" in msg:
        return (
            "Available commands:\n"
            "- My name is Kathirvel\n"
            "- What is my name\n"
            "- What is the time\n"
            "- What is today's date\n"
            "- Save note buy laptop\n"
            "- Show my notes\n"
            "- Open YouTube\n"
            "- Open Google\n"
            "- Open GitHub\n"
            "- Open LinkedIn\n"
            "- Clear memory"
        )

    if "python" in msg:
        return (
            "Python is a simple and powerful programming language used for web development, "
            "AI, automation, data analysis, and many software projects."
        )

    if "html" in msg:
        return (
            "HTML is the standard language used to create the structure of a web page, "
            "such as headings, paragraphs, buttons, and forms."
        )

    if "motivate me" in msg or "motivation" in msg:
        user_name = memory.get("user_name", "champion")
        return f"Keep going, {user_name}. Every small step you take today builds your future success."

    if "project" in msg:
        return (
            "A good project should have a clear goal, clean design, working features, "
            "proper testing, and a professional presentation."
        )

    return (
        "I received your message. This public version is running in deploy mode with a built-in "
        "assistant brain. You can later connect a real AI API for smarter conversation."
    )


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply": "Empty input received."})

    memory = load_memory()

    memory["chat_history"].append({
        "role": "user",
        "message": user_message,
        "timestamp": str(datetime.now())
    })

    reply = fallback_ai_reply(user_message, memory)

    memory["chat_history"].append({
        "role": "assistant",
        "message": reply,
        "timestamp": str(datetime.now())
    })

    save_memory(memory)

    return jsonify({"reply": reply})


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))