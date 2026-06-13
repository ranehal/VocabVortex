import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';
import mongoose from 'mongoose';
import { isAuthenticated, isValidString } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { word, level } = body;

    if (!isValidString(word) || !isValidString(level)) {
       return NextResponse.json({ error: 'Invalid or missing required fields' }, { status: 400 });
    }

    try {
      const sanitizedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existingWord = await Word.findOne({ word: new RegExp(`^${sanitizedWord}$`, 'i'), level });
      if (existingWord) return NextResponse.json(existingWord);
    } catch (dbReadErr) {
      console.error("Error reading from database:", dbReadErr);
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const prompt = `You are a VocabVortex AI mentor. Create educational content for the word "${word}" at ${level} level. 
    Return ONLY a valid JSON object structure:
    {
      "word": "${word}",
      "phonetic": "/.../",
      "partOfSpeech": "noun/verb/adj",
      "synonyms": ["syn1", "syn2"],
      "antonyms": ["ant1", "ant2"],
      "story": "A 4-sentence story using the word contextually.",
      "drills": [
        { "sentence": "...", "explanation": "..." },
        { "sentence": "...", "explanation": "..." },
        { "sentence": "...", "explanation": "..." },
        { "sentence": "...", "explanation": "..." },
        { "sentence": "...", "explanation": "..." },
        { "sentence": "...", "explanation": "..." }
      ],
      "bengaliDefinition": "..."
    }`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq AI API Failure:", response.status, errorData);
      return NextResponse.json({ error: 'AI service failure', details: errorData }, { status: 502 });
    }

    const result = await response.json();
    const content = JSON.parse(result.choices[0].message.content);

    try {
      await Word.create({ word, level, ...content });
    } catch (saveErr) {
      console.error("Error saving to DB:", saveErr);
    }

    return NextResponse.json({ ...content });
  } catch (err: any) {
    console.error('Word POST Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    await dbConnect();
    const words = await Word.find({}).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(words);
  } catch (err: any) {
    console.error('Word GET Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve words' }, { status: 500 });
  }
}
