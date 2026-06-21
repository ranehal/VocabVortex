import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { note, action } = await req.json();

    if (!note || !action) {
      return NextResponse.json({ error: 'Note and action are required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let prompt = "";

    switch (action) {
      case 'fix':
        prompt = `You are a professional editor. Fix all grammar, spelling, and punctuation errors in the following note. Keep the tone and meaning exactly as it is, but make it perfect English. 
        Return ONLY the corrected text without any preamble or explanation.
        
        Note: "${note}"`;
        break;
      case 'summarize':
        prompt = `Summarize the following note into a concise version. Preserve the key points but make it significantly shorter.
        Return ONLY the summarized text.
        
        Note: "${note}"`;
        break;
      case 'expand':
        prompt = `Expand on the following note. Add more details, examples, and context to make it a more comprehensive piece of writing while keeping the original intent and tone.
        Return ONLY the expanded text.
        
        Note: "${note}"`;
        break;
      case 'highlight':
        prompt = `Identify the most important or sophisticated vocabulary words in the following note. Re-write the note, but put [HL] before and [/HL] after those specific words.
        Return ONLY the processed text.
        
        Note: "${note}"`;
        break;
      case 'simplify':
        prompt = `Simplify the language in the following note to make it easier to understand (around A2/B1 level). Use simpler synonyms and shorter sentences.
        Return ONLY the simplified text.
        
        Note: "${note}"`;
        break;
      case 'translate':
        prompt = `Translate the following note into Bengali. Keep the meaning accurate.
        Return ONLY the Bengali translation.
        
        Note: "${note}"`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: 'AI service failure', details: errorData }, { status: 502 });
    }

    const result = await response.json();
    const processedNote = result.choices[0].message.content.trim();

    return NextResponse.json({ processedNote });
  } catch (err: any) {
    console.error('AI Process Note Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
