import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';
import mongoose from 'mongoose';
import { isAuthenticated, isValidString } from '@/lib/auth';

/**
 * POST handler to generate and store educational content for a given word.
 * Uses Groq AI to generate dictionary information and drills.
 * 
 * @param req The incoming Next.js POST request containing word and level.
 * @returns A JSON response with the generated word content or an error message.
 */
export async function POST(req: NextRequest) {
  try {
    // Security Measure: Validate authorization
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Connect to database with proper error handling instead of silent catch
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error("Database connection failed during POST /api/word:", dbErr);
      // We can continue if we want to rely purely on the AI fallback, 
      // but it's better to log the error properly.
    }

    // Parse the request body
    const body = await req.json();
    const { word, level } = body;

    // Security Measure: Validate input
    if (!isValidString(word) || !isValidString(level)) {
       return NextResponse.json({ error: 'Invalid or missing required fields (word, level)' }, { status: 400 });
    }

    // 1. Try to find existing word in DB first to save AI API calls
    try {
      if (mongoose.connection.readyState === 1) {
        // Security Measure: Sanitize input for regex to prevent ReDoS
        const sanitizedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingWord = await Word.findOne({ word: new RegExp(`^${sanitizedWord}$`, 'i'), level });
        if (existingWord) return NextResponse.json(existingWord);
      }
    } catch (dbReadErr) {
      console.error("Error reading from database:", dbReadErr);
    }

    // Retrieve API key securely from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("Configuration Error: GROQ_API_KEY is not set.");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Construct the prompt for the AI model
    const prompt = `You are a VocabVortex AI mentor. Create educational content for the word "${word}" at ${level} level. 
    Return ONLY a valid JSON object with this exact structure:
    {
      "word": "${word}",
      "phonetic": "/.../",
      "partOfSpeech": "noun/verb/adj",
      "synonyms": ["syn1", "syn2"],
      "antonyms": ["ant1", "ant2"],
      "story": "A 4-sentence story using the word contextually.",
      "drills": [
        { "sentence": "A simple declarative sentence.", "explanation": "Grammar insight." },
        { "sentence": "A question using the word.", "explanation": "Usage insight." },
        { "sentence": "A complex sentence with a sub-clause.", "explanation": "Contextual insight." },
        { "sentence": "An imperative or command sentence.", "explanation": "Tone insight." },
        { "sentence": "A conditional (if...) sentence.", "explanation": "Logic insight." },
        { "sentence": "A sentence using a synonym/variation.", "explanation": "Alternative insight." }
      ],
      "bengaliDefinition": "Bengali meaning"
    }`;

    // 2. Call the external AI API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error("External API Error:", await response.text());
      return NextResponse.json({ error: 'Failed to communicate with AI service' }, { status: 502 });
    }

    const result = await response.json();
    
    if (!result.choices || !result.choices[0]?.message?.content) {
      return NextResponse.json({ error: 'Invalid response from AI service' }, { status: 500 });
    }

    // Parse the generated content
    const content = JSON.parse(result.choices[0].message.content);

    // 3. Save the newly generated content to DB for future use
    try {
      if (mongoose.connection.readyState === 1) {
        await Word.create({ word, level, ...content });
      }
    } catch (saveErr) {
      console.error("Error saving new word to database:", saveErr);
      // We still return the content even if DB save fails
    }

    return NextResponse.json({ ...content });
  } catch (err: any) {
    // Security Measure: Generic error response for unhandled exceptions
    console.error('Word POST Error:', err);
    return NextResponse.json({ error: 'Internal server error while processing word' }, { status: 500 });
  }
}

/**
 * GET handler to retrieve recent words from the database.
 * 
 * @param req The incoming Next.js GET request.
 * @returns A JSON response with an array of recent words or an error message.
 */
export async function GET(req: NextRequest) {
  try {
    // Security Measure: Validate authorization
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Connect to the database
    await dbConnect();
    
    // Fetch the 20 most recently created words
    const words = await Word.find({}).sort({ createdAt: -1 }).limit(20);
    
    return NextResponse.json(words);
  } catch (err: any) {
    // Bug Fix: Log the error and return a proper error status instead of silently returning []
    console.error('Word GET Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve words from the database' }, { status: 500 });
  }
}

