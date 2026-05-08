import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';

/**
 * Basic SRT Parser
 * Format:
 * 1
 * 00:00:01,000 --> 00:00:04,000
 * Text
 */
function parseSRT(srt: string) {
  const lines = srt.replace(/\r/g, '').split('\n');
  const dialogues = [];
  let current: any = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if it's an index (number)
    if (/^\d+$/.test(line)) {
      if (current.en) dialogues.push(current);
      current = {};
    } 
    // Check if it's a timestamp
    else if (line.includes('-->')) {
      const parts = line.split(' --> ');
      current.timestamp = parts[0].split(',')[0]; // Simplify 00:00:01,000 to 00:00:01
    } 
    // Otherwise it's dialogue text
    else {
      current.en = current.en ? `${current.en} ${line}` : line;
    }
  }
  if (current.en) dialogues.push(current);
  return dialogues;
}

/**
 * AI Translation Helper
 * Translates English text to Bengali using Groq
 */
async function translateToBengali(text: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `Translate the following movie subtitles to Bengali. Keep the tone natural and cinematic. 
    Return ONLY the Bengali translation text. 
    Text: "${text}"`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });

    const result = await response.json();
    return result.choices[0]?.message?.content?.trim();
  } catch (e) {
    console.error("Translation error:", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { title, year, srt, posterEmoji, translate } = await req.json();

    if (!title || !srt) {
      return NextResponse.json({ error: 'Title and SRT content are required' }, { status: 400 });
    }

    let dialogues = parseSRT(srt);

    // If translation requested, translate in chunks (limited for demo/performance)
    if (translate) {
      // For large SRTs, we should only translate a few or use a more efficient batching
      // Here we translate the first 50 to keep it fast
      const subset = dialogues.slice(0, 50);
      for (let d of subset) {
        d.bn = await translateToBengali(d.en);
      }
    }

    const movie = await Movie.create({
      title,
      year: year || new Date().getFullYear().toString(),
      posterEmoji: posterEmoji || '🎬',
      dialogues
    });

    return NextResponse.json(movie);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
