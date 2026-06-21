import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an English grammar analysis assistant. Analyze the given English sentence and break it into clauses and/or phrases.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "text": "<the clause or phrase text>",
    "type": "<e.g. main clause, subordinate clause, noun phrase, verb phrase, prepositional phrase, etc.>",
    "syntax": "<grammatical role: e.g. Subject + Verb + Object>",
    "syntaxMap": [{"term": "Subject", "words": "<actual words>"}, {"term": "Verb", "words": "<actual words>"}],
    "meaning": "<Bengali meaning of this part>",
    "buildUp": ["<shortest form> (<Bengali>)", "<add one word> (<Bengali>)", "<full form> (<Bengali>)"]
  }
]
Return 2-5 segments. BuildUp: 3-4 steps, each step appends to the previous (show incremental build). syntaxMap maps each syntax term to the actual words in the clause.`;

export async function POST(req: NextRequest) {
  try {
    const { sentence } = await req.json();
    if (!sentence?.trim()) {
      return NextResponse.json({ error: 'Sentence is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Sentence: "${sentence.trim()}"` },
        ],
        temperature: 0.4,
        max_tokens: 1400,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'AI service error', detail: err }, { status: 502 });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '';

    const arrayMatch = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed) && parsed.length) {
        return NextResponse.json({ clauses: parsed });
      }
    }

    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ clauses: parsed });
  } catch (err: any) {
    console.error('Analyze Clause Error:', err);
    return NextResponse.json({ error: 'Failed to analyze clause' }, { status: 500 });
  }
}
