// --- DOM Elements ---
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const sfxToggleBtn = document.getElementById("sfxToggleBtn");
const ttsToggleBtn = document.getElementById("ttsToggleBtn");
const languageSelect = document.getElementById("languageSelect");

const sysTimeEl = document.getElementById("sysTime");
const arcReactor = document.getElementById("arcReactor");
const reactorStatusText = document.getElementById("reactorStatusText");

const apiInput = document.getElementById("apiInput");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
const clearApiKeyBtn = document.getElementById("clearApiKeyBtn");

const cpuBar = document.getElementById("cpuBar");
const cpuText = document.getElementById("cpuText");
const syncBar = document.getElementById("syncBar");
const syncText = document.getElementById("syncText");
const latencyText = document.getElementById("latencyText");
const tempText = document.getElementById("tempText");

const quickNoteInput = document.getElementById("quickNoteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");
const canvas = document.getElementById("waveformCanvas");

// --- State Variables ---
let sfxEnabled = true;
let ttsEnabled = true;
let assistantState = "idle"; // idle, listening, thinking, speaking, error
let geminiApiKey = "";

// --- System Clock ---
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, "0");
    sysTimeEl.textContent = `${hoursStr}:${minutes}:${seconds} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// --- Theme Selector ---
const themeBtns = document.querySelectorAll("[data-set-theme]");
themeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const selectedTheme = btn.getAttribute("data-set-theme");
        document.body.setAttribute("data-theme", selectedTheme);
        themeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        playSFX("click");
        localStorage.setItem("edith-theme", selectedTheme);
    });
});

// Load saved theme
const savedTheme = localStorage.getItem("edith-theme") || "edith";
const activeBtn = document.querySelector(`[data-set-theme="${savedTheme}"]`);
if (activeBtn) {
    document.body.setAttribute("data-theme", savedTheme);
    themeBtns.forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
}

// --- Audio SFX Synthesizer (Web Audio API) ---
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSFX(type) {
    if (!sfxEnabled) return;
    try {
        initAudio();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === "click") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
        } else if (type === "boot") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === "listening") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(900, now + 0.06);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === "message") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.setValueAtTime(750, now + 0.08);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
        } else if (type === "error") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(130, now);
            osc.frequency.linearRampToValueAtTime(85, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    } catch (e) {
        console.warn("AudioContext failed", e);
    }
}

// SFX and Vocalizer TTS toggles
sfxToggleBtn.addEventListener("click", () => {
    sfxEnabled = !sfxEnabled;
    sfxToggleBtn.classList.toggle("active", sfxEnabled);
    playSFX("click");
});

ttsToggleBtn.addEventListener("click", () => {
    ttsEnabled = !ttsEnabled;
    ttsToggleBtn.classList.toggle("active", ttsEnabled);
    playSFX("click");
});

// Play boot sound on first body click
document.body.addEventListener("click", () => {
    playSFX("boot");
}, { once: true });

// --- Secure API Credentials Store ---
function loadApiKey() {
    geminiApiKey = localStorage.getItem("edith-api-key") || "";
    if (geminiApiKey) {
        apiInput.value = "••••••••••••••••••••••••";
        apiInput.disabled = true;
        saveApiKeyBtn.textContent = "LINKED";
        saveApiKeyBtn.disabled = true;
    } else {
        apiInput.value = "";
        apiInput.disabled = false;
        saveApiKeyBtn.textContent = "LINK";
        saveApiKeyBtn.disabled = false;
    }
}

saveApiKeyBtn.addEventListener("click", () => {
    const key = apiInput.value.trim();
    if (key) {
        localStorage.setItem("edith-api-key", key);
        loadApiKey();
        playSFX("message");
        addConsoleMessage("SYSTEM", "Secure Neural API Linked. Gemini AI mode activated.");
    }
});

clearApiKeyBtn.addEventListener("click", () => {
    localStorage.removeItem("edith-api-key");
    loadApiKey();
    playSFX("error");
    addConsoleMessage("SYSTEM", "Neural API link cleared. Falling back to local offline protocols.");
});

loadApiKey();

// --- Speech Synthesis (Vocalizer TTS) ---
function speakText(text) {
    if (!ttsEnabled) return;
    if (!("speechSynthesis" in window)) return;

    // Filter out commands/URLs
    const cleanText = text.replace(/\[OPEN_URL\].*/g, "").replace(/\[SYSTEM ERROR\].*/g, "System alert").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = languageSelect.value;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    utterance.onstart = () => {
        setAssistantState("speaking");
    };
    utterance.onend = () => {
        setAssistantState("idle");
    };
    utterance.onerror = () => {
        setAssistantState("idle");
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

// --- Assistant Visual State Handler ---
function setAssistantState(state) {
    assistantState = state;
    arcReactor.className = "reactor-inner-core " + state;

    if (state === "idle") {
        reactorStatusText.textContent = "STABLE (100%)";
    } else if (state === "listening") {
        reactorStatusText.textContent = "LISTENING VOICE...";
    } else if (state === "thinking") {
        reactorStatusText.textContent = "THINKING PROTOCOLS...";
    } else if (state === "speaking") {
        reactorStatusText.textContent = "VOCALIZING RESPONSE...";
    } else if (state === "error") {
        reactorStatusText.textContent = "SYSTEM ALERT";
    }
}
setAssistantState("idle");

// --- Canvas Voice Waveform Visualizer ---
const ctx = canvas.getContext("2d");
let wavePhase = 0;

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawWaveform() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    const style = getComputedStyle(document.body);
    const neonColor = style.getPropertyValue('--neon-color').trim() || '#00f3ff';
    const rgbStr = hexToRgb(neonColor);

    const numWaves = 3;

    for (let i = 0; i < numWaves; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rgbStr}, ${0.8 - (i * 0.25)})`;

        let amplitude = 2;
        let frequency = 0.015;

        if (assistantState === "listening") {
            amplitude = 12 + Math.sin(Date.now() * 0.01) * 3;
            frequency = 0.045 + (i * 0.01);
        } else if (assistantState === "speaking") {
            amplitude = 16 + Math.sin(Date.now() * 0.02) * 5;
            frequency = 0.038 + (i * 0.005);
        } else if (assistantState === "thinking") {
            amplitude = 4 + Math.sin(Date.now() * 0.005) * 1.5;
            frequency = 0.075;
        }

        for (let x = 0; x < canvas.width; x++) {
            // Apply a bell curve envelope to secure endpoints at 0
            const envelope = Math.sin((x / canvas.width) * Math.PI);
            const y = (canvas.height / 2) + Math.sin(x * frequency - wavePhase + (i * Math.PI / 3)) * amplitude * envelope;

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    wavePhase += 0.08;
    requestAnimationFrame(drawWaveform);
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    const num = parseInt(hex, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
requestAnimationFrame(drawWaveform);

// --- Telemetry Diagnostics Simulator ---
function updateDiagnostics() {
    // Generate slight random variations
    const cpu = (35 + Math.random() * 12).toFixed(1);
    const sync = (93 + Math.random() * 5).toFixed(1);
    const lat = Math.floor(38 + Math.random() * 10);
    const temp = (35.8 + Math.random() * 1.8).toFixed(1);

    cpuBar.style.width = `${cpu}%`;
    cpuText.textContent = `${cpu}%`;
    syncBar.style.width = `${sync}%`;
    syncText.textContent = `${sync}%`;
    latencyText.textContent = `${lat} ms`;
    tempText.textContent = `${temp}°C`;
}
setInterval(updateDiagnostics, 1800);
updateDiagnostics();

// --- Message Logging ---
function getTimestamp() {
    const now = new Date();
    return `[${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}]`;
}

function addConsoleMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("terminal-msg");
    if (sender === "USER") {
        msgDiv.classList.add("user");
    } else {
        msgDiv.classList.add("bot");
    }

    const timeSpan = document.createElement("span");
    timeSpan.classList.add("timestamp");
    timeSpan.textContent = getTimestamp();

    const senderStrong = document.createElement("strong");
    senderStrong.classList.add("sender");
    senderStrong.textContent = `${sender}:`;

    const textNode = document.createTextNode(` ${text}`);

    msgDiv.appendChild(timeSpan);
    msgDiv.appendChild(senderStrong);
    msgDiv.appendChild(textNode);

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Chat Actions ---
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addConsoleMessage("USER", message);
    userInput.value = "";
    playSFX("click");
    setAssistantState("thinking");

    // Secure key payload if enabled
    const keyToUse = localStorage.getItem("edith-api-key") || "";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Gemini-Key": keyToUse
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        const reply = data.reply;

        setAssistantState("idle");

        if (reply.startsWith("[OPEN_URL]")) {
            const url = reply.replace("[OPEN_URL]", "").trim();
            addConsoleMessage("EDITH", `Redirect protocol initiated. Navigating to: ${url}`);
            window.open(url, "_blank");
            playSFX("message");
            speakText("Opening requested node.");
        } else {
            addConsoleMessage("EDITH", reply);
            playSFX("message");
            speakText(reply);
        }

        // Auto reload notes when user says notes saved or deleted
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("save note") || lowerMsg.includes("clear memory")) {
            setTimeout(fetchNotes, 800);
        }

    } catch (error) {
        setAssistantState("error");
        playSFX("error");
        addConsoleMessage("EDITH", "SYSTEM FAIL: Neural backend connection severed.");
    }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

clearChatBtn.addEventListener("click", () => {
    chatBox.innerHTML = `<div class="terminal-msg bot"><span class="timestamp">${getTimestamp()}</span> <strong class="sender">EDITH:</strong> Console buffers purged. Ready.</div>`;
    playSFX("error");
});

// --- Speech Recognition ---
voiceBtn.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        addConsoleMessage("EDITH", "SYSTEM LINK ERROR: Vocal sensor driver missing on this browser.");
        playSFX("error");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = languageSelect.value;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setAssistantState("listening");
    playSFX("listening");
    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = () => {
        setAssistantState("error");
        playSFX("error");
        addConsoleMessage("EDITH", "SYSTEM LINK ERROR: Vocal pattern matching failed.");
    };

    recognition.onend = () => {
        if (assistantState === "listening") {
            setAssistantState("idle");
        }
    };
});

// --- Notes CRUD Handler (Vault) ---
async function fetchNotes() {
    try {
        const response = await fetch("/api/notes");
        const data = await response.json();
        renderNotesList(data.notes);
    } catch (e) {
        console.error("Failed to load notes vault", e);
    }
}

async function addNote() {
    const content = quickNoteInput.value.trim();
    if (!content) return;

    playSFX("click");
    try {
        const response = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content })
        });
        const data = await response.json();
        quickNoteInput.value = "";
        renderNotesList(data.notes);
        playSFX("message");
    } catch (e) {
        console.error("Failed to store note", e);
    }
}

async function deleteNote(id) {
    playSFX("click");
    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: "DELETE"
        });
        const data = await response.json();
        renderNotesList(data.notes);
        playSFX("error");
    } catch (e) {
        console.error("Failed to purge note", e);
    }
}

function renderNotesList(notes) {
    notesList.innerHTML = "";
    if (!notes || notes.length === 0) {
        notesList.innerHTML = `<div class="vault-empty">No secure items archived.</div>`;
        return;
    }

    notes.forEach(note => {
        const item = document.createElement("div");
        item.classList.add("vault-item");

        const textSpan = document.createElement("span");
        textSpan.classList.add("text");
        textSpan.textContent = note.content;

        const delBtn = document.createElement("button");
        delBtn.classList.add("delete-btn");
        delBtn.innerHTML = "🗑️";
        delBtn.title = "Purge Archive Item";
        delBtn.addEventListener("click", () => deleteNote(note.id));

        item.appendChild(textSpan);
        item.appendChild(delBtn);
        notesList.appendChild(item);
    });
}

addNoteBtn.addEventListener("click", addNote);
quickNoteInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addNote();
    }
});

// Initial boot fetch
fetchNotes();