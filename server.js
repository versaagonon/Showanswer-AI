const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "YOUR_API_KEY_HERE_GEMINI";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(" Gemini Proxy is running");
});

app.post("/ask", async (req, res) => {
  try {
    const userText = req.body.text;
    if (!userText) {
      return res.status(400).json({ answer: " No input text provided" });
    }

    const geminiPayload = {
      contents: [
        {
          parts: [{ text: userText }]
        }
      ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload)
    });

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || " No answer available.";
    res.json({ answer });

  } catch (err) {
    console.error(" Proxy error:", err.message);
    res.status(500).json({ answer: "Server Error: " + err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Gemini Proxy listening on http://localhost:${PORT}`);
});
