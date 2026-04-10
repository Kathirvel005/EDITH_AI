const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const speakToggleBtn = document.getElementById("speakToggleBtn");
const languageSelect = document.getElementById("languageSelect");

let voiceReplyEnabled = true;

function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function speakText(text) {
    if (!voiceReplyEnabled) return;
    if (!("speechSynthesis" in window)) return;

    const cleanText = text.replace(/\[OPEN_URL\].*/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = languageSelect.value;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function handleSpecialReply(reply) {
    if (reply.startsWith("[OPEN_URL]")) {
        const url = reply.replace("[OPEN_URL]", "").trim();
        addMessage(`Opening: ${url}`, "ai");
        window.open(url, "_blank");
        speakText("Opening website");
        return true;
    }
    return false;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        const reply = data.reply;

        if (!handleSpecialReply(reply)) {
            addMessage(reply, "ai");
            speakText(reply);
        }
    } catch (error) {
        addMessage("System error. Backend connection failed.", "ai");
    }
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

clearChatBtn.addEventListener("click", () => {
    chatBox.innerHTML = `<div class="message ai">Chat screen cleared. EDITH ready.</div>`;
});

speakToggleBtn.addEventListener("click", () => {
    voiceReplyEnabled = !voiceReplyEnabled;
    addMessage(`Voice reply ${voiceReplyEnabled ? "enabled" : "disabled"}.`, "ai");
});

voiceBtn.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        addMessage("Speech recognition is not supported in this browser.", "ai");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = languageSelect.value;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    addMessage("Listening...", "ai");
    recognition.start();

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = function () {
        addMessage("Voice recognition failed. Please try again.", "ai");
    };
});