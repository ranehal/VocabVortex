import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    try {
      await dbConnect();
    } catch (dbErr) {
      console.warn("DB Connection failed");
    }

    const { word, level } = await req.json();

    // 1. Try DB first
    try {
      if (mongoose.connection.readyState === 1) {
        const existingWord = await Word.findOne({ word: new RegExp(`^${word}$`, 'i'), level });
        if (existingWord) return NextResponse.json(existingWord);
      }
    } catch (e) {}

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not set in .env' }, { status: 500 });
    }

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

    // Calling Groq API
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

    const result = await response.json();
    
    if (!result.choices || !result.choices[0]?.message?.content) {
      return NextResponse.json({ error: 'AI Failure' }, { status: 500 });
    }

    const content = JSON.parse(result.choices[0].message.content);

    // 2. Save to DB if possible
    try {
      if (mongoose.connection.readyState === 1) {
        await Word.create({ word, level, ...content });
      }
    } catch (saveErr) {}

    return NextResponse.json({ ...content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const words = await Word.find({}).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(words);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}
