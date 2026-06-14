import { NextRequest, NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { sentence } = await req.json();
    if (!sentence?.trim()) {
      return NextResponse.json({ error: 'No sentence provided' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server not configured with GROQ_API_KEY' }, { status: 500 });
    }

    const system = `You are an English grammar analysis assistant. Analyze the given English sentence and break it into clauses and/or phrases.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "text": "<the clause or phrase text>",
    "type": "<e.g. main clause, subordinate clause, noun phrase, verb phrase, prepositional phrase, etc.>",
    "syntax": "<grammatical role: e.g. Subject + Verb + Object>",
    "meaning": "<Bengali meaning of this part>",
    "buildUp": ["<shortest form>", "<add more>", "<full form>"]
  }
]
Return 2–5 segments. BuildUp should show how the clause is built step by step (1–4 lines).`;

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Sentence: "${sentence.trim()}"` },
        ],
        temperature: 0.5,
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Groq error: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const segments = JSON.parse(cleaned);

    return NextResponse.json(segments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Analysis failed' }, { status: 500 });
  }
}
