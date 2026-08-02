# E.D.I.T.H. AI // Advanced Tactical Command Console

> **Enhanced Digital Intelligence for Tactical Human Assistance**
> An interactive, glassmorphic sci-fi HUD console inspired by Stark Industries' E.D.I.T.H. system, featuring real-time AI logic, voice support, audio synthesis, and a secure data retrieval vault.

---

## ⚡ Key Core Technologies

* **Unified Cognitive Brain (Dual Mode):**
  * **Neural API Mode:** Configure your Gemini API Key in the UI console to activate the modern **Gemini 2.0 Flash** model with custom E.D.I.T.H. character directives.
  * **Offline Logic Mode:** Automatically falls back to local database note searches and keyword pattern matching when no API Key is provided.
* **Canvas Voice Visualizer:** Draws glowing curves matching your active speech state (idle, listening, thinking, speaking) on an HTML5 2D Canvas.
* **Synthesized Web Audio SFX:** Real-time generation of futuristic sound waves (clicks, sweeps, error alerts) synthesized on-the-fly directly in the browser.
* **Database Vault (SQLite):** Interactive database interface showing stored entries and supporting creation and deletion in real-time.
* **Diagnostic Telemetry:** A live, fluctuating indicator matrix showing simulated CPU load, core temperature, latency, and neural sync parameters.
* **Multi-Theme Glow Core:** Hot-swap HUD colors between **E.D.I.T.H.** (Cyan), **J.A.R.V.I.S.** (Gold), **F.R.I.D.A.Y.** (Red), and **V.E.R.O.N.I.C.A.** (Purple).

---

## 📂 File Architecture

* `app.py` — Flask backend handling routing, notes REST API endpoints, and the Gemini 2.0 client integrations.
* `database.py` — SQLite database abstraction layers mapping notes table and processing CRUD requests.
* `static/`
  * `style.css` — High-tech grid overlays, scanline sweeps, glassmorphic container themes, and custom glowing elements.
  * `script.js` — Client-side logic coordinating Web Audio API, voice recognition, canvas loops, and UI interactions.
* `templates/index.html` — Responsive semantic interface structuring the 3-panel command dashboard.
* `requirements.txt` — Frozen dependencies list containing Flask, Gunicorn, and the unified Google GenAI SDK.
* `.gitignore` — Stage filters preventing local caches and SQLite database files from staging.

---

## ⚙️ Installation & Deployment

### 1. Initialize Virtual Environment
Clone the repository locally, navigate to the folder, and run:
```bash
# Create local virtual environment
py -m venv .venv

# Activate and install required dependencies
.venv\Scripts\python -m pip install -r requirements.txt
```

### 2. Launch Console Server
```bash
# Start Flask server
.venv\Scripts\python app.py
```
By default, the application serves locally on port `8080` (accessible at `http://127.0.0.1:8080`).

---

## 🎮 Operations Manual

1. **Activate Voice:** Click the Microphone `🎤` button to start speech recognition (supports both English and Tamil vocal options).
2. **Link Gemini:** Input your Gemini API key in the **Secure Neural API Link** field and click `LINK`.
3. **Database Vault:** Enter notes in the **Data Retrieval Vault** input field or voice commands like *"save note buy laptop"* to add records. Click the trash `🗑️` icon to purge entries.
4. **Change Theme:** Use the `E`, `J`, `F`, `V` buttons in the color glow panel to instantly swap styling variables.
