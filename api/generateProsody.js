// Import the Google Generative AI library
const { GoogleGenerativeAI } = require('@google/generative-ai');

// This is the main function Vercel will run.
// `req` is the incoming request from your frontend.
// `res` is the response we will send back.
export default async function handler(req, res) {
  // 1. --- SECURITY AND SETUP ---
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get the secret API key from environment variables
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // 2. --- GET DATA FROM THE FRONTEND ---
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required in the request body.' });
  }

  // 3. --- DEFINE THE PROMPT FOR GEMINI ---
  const prompt = `You are a speech director AI. Your task is to take a sentence, break it into expressive segments, and assign speech parameters (pitch, rate, volume) to each segment to make it sound natural and emotional. 
  - The 'pitch' should be between 0.5 and 1.5.
  - The 'rate' should be between 0.8 and 1.2.
  - Respond ONLY with a valid JSON array of objects, where each object contains a 'segment' and its 'params'.
  Text: "${text}"`;

  try {
    // 4. --- CALL THE GEMINI API ---
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponseText = response.text();
    
    // 5. --- CLEAN AND SEND THE RESPONSE ---
    // Clean the response: Gemini might wrap the JSON in markdown backticks.
    aiResponseText = aiResponseText.replace(/```json\n|```/g, '').trim();
    
    // Parse the cleaned text into a JSON object
    const prosodyArray = JSON.parse(aiResponseText);
    
    // Send the successful JSON response back to the frontend
    res.status(200).json(prosodyArray);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate speech prosody.' });
  }
}