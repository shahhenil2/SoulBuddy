const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { HfInference } = require("@huggingface/inference");

// Initialize Express app and Hugging Face Inference API
const app = express();
const hf = new HfInference("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"); // Replace with your Hugging Face API key

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set views directory
app.use(express.static(path.join(__dirname, "public2"))); // Set public directory

// Suggestions for all moods
const SUGGESTIONS = {
  Positive: [
    "Keep up the positive vibes! How about sharing your happiness with a friend?",
    "You’re doing great! Take some time to enjoy a fun activity you love.",
    "Your positivity is inspiring! Write down three things you’re grateful for today.",
  ],
  Negative: [
    "It’s okay to feel down sometimes. Try a deep breathing exercise to find calm.",
    "Consider journaling your thoughts to better understand your emotions.",
    "You might feel better after a short walk or a favorite calming activity.",
  ],
  Neutral: [
    "Feeling neutral is a good baseline. Why not try a new hobby or activity today?",
    "Explore mindfulness to stay balanced and connected to the present moment.",
    "Take a break and listen to your favorite music or a soothing podcast.",
  ],
  Stressed: [
    "Stress can be overwhelming. Try a quick 5-minute meditation.",
    "Step away from tasks for a bit and focus on deep breaths.",
    "Make a to-do list to break big tasks into smaller steps.",
  ],
  Anxious: [
    "Practice grounding techniques like the 5-4-3-2-1 method to calm your mind.",
    "Focus on your breath and count to ten slowly.",
    "Reach out to a trusted friend or loved one to share how you're feeling.",
  ],
  Happy: [
    "Happiness is contagious! Celebrate this moment with a small treat for yourself.",
    "Use your joy to inspire others. Compliment someone you care about.",
    "Reflect on what made you happy and plan to do it again.",
  ],
  Sad: [
    "It's okay to feel sad. Give yourself permission to take it slow.",
    "Talk to someone you trust about how you're feeling.",
    "Try writing down your thoughts to process your emotions better.",
  ],
  Tired: [
    "Take a short nap or do some restorative yoga.",
    "Wind down with a calming book or a warm cup of tea.",
    "Ensure a good night's rest to recharge your energy.",
  ],
  Relaxed: [
    "Enjoy the peace and savor the calmness around you.",
    "Stretch with yoga or listen to relaxing music.",
    "Stay in this serene moment and enjoy the calm.",
  ],
  Excited: [
    "Channel your energy into a fun project or activity!",
    "Share your excitement with a friend who'll celebrate with you.",
    "Use this energy to tackle something you've been putting off.",
  ],
  Confused: [
    "Break the situation into smaller steps and focus on one thing at a time.",
    "Ask yourself specific questions to clarify what you're unsure about.",
    "Write down your thoughts and identify patterns to find clarity.",
    "Talk to someone you trust to gain a fresh perspective.",
    "Take a break and revisit the problem when your mind feels clearer.",
  ],
  Bored: [
    "Try exploring a new hobby or skill you've been curious about.",
    "Change your routine with a walk or a new podcast.",
    "Use this time to rest and recharge for something exciting.",
  ],
};

// Keywords for critical detection
const CRITICAL_KEYWORDS = [
  "suicide", "kill myself", "end it all", "no way out", "self-harm",
  "hurt myself", "worthless", "want to die", "life is pointless",
  "cut myself", "tired of living", "giving up", "kill", "die",
];

// Emotion-to-Mood Mapping
const EMOTION_MOOD_MAP = {
  joy: "Happy",
  sadness: "Sad",
  anger: "Stressed",
  fear: "Anxious",
  neutral: "Neutral",
  surprise: "Excited",
  disgust: "Negative",
  confusion: "Confused",
};

// Detect critical situations
function detectCritical(input) {
  if (!input || typeof input !== "string") return false;
  return CRITICAL_KEYWORDS.some((keyword) => input.toLowerCase().includes(keyword));
}

// Analyze emotions using Hugging Face with explicit "confused" handling
async function analyzeEmotion(input) {
  if (!input || typeof input !== "string" || input.trim() === "") {
    throw new Error("Invalid input: 'text' or 'inputs' must be specified and non-empty.");
  }

  try {
    // Explicitly check for "confused" keywords in the input
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("confused") || lowerInput.includes("unsure")) {
      return { mood: "Confused", confidence: 1.0 }; // Override to Confused
    }

    const result = await hf.textClassification({
      model: "j-hartmann/emotion-english-distilroberta-base",
      inputs: input,
    });

    const topEmotion = result[0];
    return {
      mood: EMOTION_MOOD_MAP[topEmotion.label] || "Neutral",
      confidence: topEmotion.score,
    };
  } catch (error) {
    console.error("Error during emotion analysis:", error);
    throw new Error("Failed to analyze emotion. Please try again.");
  }
}

// Handle negations in user input
function detectNegation(input, mood) {
  const negationPatterns = [
    { pattern: /\bnot\s+happy\b/i, mood: "Negative" },
    { pattern: /\bnot\s+sad\b/i, mood: "Positive" },
    { pattern: /\bnot\s+anxious\b/i, mood: "Relaxed" },
    { pattern: /\bnot\s+tired\b/i, mood: "Energetic" },
    { pattern: /\bnot\s+stressed\b/i, mood: "Calm" },
    { pattern: /\bnot\s+bored\b/i, mood: "Curious" },
    { pattern: /\bnever\s+happy\b/i, mood: "Negative" },
    { pattern: /\bnever\s+sad\b/i, mood: "Positive" },
    { pattern: /\bnever\s+anxious\b/i, mood: "Relaxed" },
    { pattern: /\bnever\s+tired\b/i, mood: "Energetic" },
    { pattern: /\bnever\s+stressed\b/i, mood: "Calm" },
    { pattern: /\bnever\s+bored\b/i, mood: "Curious" },
  ];

  for (const { pattern, mood: correctedMood } of negationPatterns) {
    if (pattern.test(input)) {
      return correctedMood;
    }
  }
  return mood;
}

// Serve the home page
app.get("/", (req, res) => {
  res.render("mood_analy");
});

// Handle analysis
app.post("/analyze", async (req, res) => {
  const userInput = req.body.user_input;

  if (!userInput || typeof userInput !== "string" || userInput.trim() === "") {
    return res.redirect("/");
  }

  // Detect critical situations first
  if (detectCritical(userInput)) {
    return res.render("critical_alert2");
  }

  try {
    const { mood, confidence } = await analyzeEmotion(userInput);
    const refinedMood = detectNegation(userInput, mood);

    const suggestions = SUGGESTIONS[refinedMood] || ["Take care of yourself and stay positive!"];
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

    res.render("mood_result2", {
      user_input: userInput,
      mood: refinedMood,
      suggestion: suggestion,
    });
  } catch (error) {
    console.error("Error during analysis:", error);
    return res.redirect("/");
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});