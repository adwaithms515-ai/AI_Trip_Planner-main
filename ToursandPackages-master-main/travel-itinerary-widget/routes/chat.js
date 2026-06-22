import { Router } from "express";
import { createLogger } from "../lib/logger.js";

const router = Router();
const log    = createLogger("chat");

router.post("/", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const groqKey   = process.env.GROQ_API_KEY;

  if (!nvidiaKey && !groqKey) {
    // Elegant simulated response informing developer how to configure keys
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    let responseText = "Hello! I am TourMate, your AI Travel Assistant. Currently, my live AI brain is in standby mode. To activate me using Groq or NVIDIA NIM APIs, please configure the `GROQ_API_KEY` or `NVIDIA_API_KEY` in your `.env` file.";
    
    const userQuery = lastUserMessage.toLowerCase();
    if (userQuery.includes("hello") || userQuery.includes("hi")) {
      responseText = "Hello there! 🌴 I'm TourMate, your AI companion. I can help you find premium packages, construct itineraries, or discover top local sights! \n\n*Note for developer: Add a GROQ_API_KEY or NVIDIA_API_KEY to the .env file to power this with real AI!*";
    } else if (userQuery.includes("package") || userQuery.includes("tour")) {
      responseText = "We offer standard ecotourism bookings, wildlife safari packages, nature trails, and more! Tell me what kind of trip you want, and once you set up my Groq or NVIDIA API key, I'll build custom guides for you.";
    } else if (userQuery.includes("help") || userQuery.includes("how to")) {
      responseText = "Need help? No problem! I can suggest sights, plan transport, and design itineraries. Just add your `GROQ_API_KEY` (from console.groq.com) to your `.env` file to fully unlock my capabilities.";
    } else if (userQuery.includes("beach") || userQuery.includes("water") || userQuery.includes("dive")) {
      responseText = "Ah, a water lover! 🌊 Our diving and boating packages are incredible. Set up my API keys to let me recommend the exact spots on the map!";
    }

    return res.json({
      role: "assistant",
      content: responseText
    });
  }

  try {
    let url, key, model;

    if (nvidiaKey) {
      url = "https://integrate.api.nvidia.com/v1/chat/completions";
      key = nvidiaKey;
      model = "meta/llama-3.1-8b-instruct";
    } else {
      url = "https://api.groq.com/openai/v1/chat/completions";
      key = groqKey;
      model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    }

    const systemPrompt = {
      role: "system",
      content: "You are 'TourMate', a premium, highly engaging AI travel assistant for the Tours & Packages platform. You answer user queries about travel, tourism packages, local attractions, and itinerary planning. Keep responses professional, warm, structured with bullet points or emojis where appropriate, and brief (under 130 words) so they look outstanding in a floating mobile/web chat window."
    };

    const apiMessages = [
      systemPrompt,
      ...messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
    ];

    const aiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => "");
      throw new Error(`AI Gateway responded with ${aiRes.status}: ${errText}`);
    }

    const aiData = await aiRes.json();
    const content = aiData?.choices?.[0]?.message?.content;

    res.json({
      role: "assistant",
      content: content || "I'm sorry, I encountered an issue generating a response."
    });
  } catch (error) {
    log.error("Chat backend endpoint error", { message: error.message });
    res.status(500).json({ error: error.message || "Failed to process chat response" });
  }
});

export default router;
