import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { word, level } = await req.json();

    // Check if word already exists in DB
    const existingWord = await Word.findOne({ word: new RegExp(`^${word}$`, 'i'), level });
    if (existingWord) {
      return NextResponse.json(existingWord);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
    }

    const systemPrompt = `You are a VocabVortex AI mentor. Create educational content for the word "${word}" at ${level} level. 
    Return the response in JSON format:
    {
      "story": "A 4-sentence story using the word contextually.",
      "drills": [
        { "sentence": "A unique sentence using the word.", "explanation": "A deep insight into why this usage is effective." },
        ... (generate 6 drills)
      ],
      "bengaliDefinition": "Bengali meaning"
    }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate content for: ${word}` }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const result = await response.json();
    const content = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);

    const newWord = await Word.create({
      word,
      level,
      ...content
    });

    return NextResponse.json(newWord);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const words = await Word.find({}).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json(words);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
