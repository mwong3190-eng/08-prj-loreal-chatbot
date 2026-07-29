/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Paste your Cloudflare Worker URL here.
const workerUrl = "https://lorealworker.mwong3190.workers.dev/";

function addMessage(text, role) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return message;
}

function showThinkingMessage() {
  return addMessage("Thinking...", "assistant");
}

// Set initial message
addMessage("👋 Hello! How can I help you today?", "assistant");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) {
    return;
  }

  addMessage(message, "user");
  userInput.value = "";

  const loadingMessage = showThinkingMessage();

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful L'Oréal beauty assistant. Answer only questions about L'Oréal products, skincare, haircare, makeup, fragrances, and beauty routines. If the user asks about unrelated topics, politely refuse and redirect them to beauty, product recommendations, or routine advice.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    loadingMessage.textContent = reply;
  } catch (error) {
    loadingMessage.textContent = `Sorry, something went wrong: ${error.message}`;
  }
});
