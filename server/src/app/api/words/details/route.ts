import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Word from '@/models/Word';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { words } = body;

    if (!Array.isArray(words)) {
      return NextResponse.json({ error: 'Words must be an array' }, { status: 400 });
    }

    const details = await Promise.all(words.map(async (w) => {
      // Find case-insensitive
      const sanitizedWord = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const found = await Word.findOne({ word: new RegExp(`^${sanitizedWord}$`, 'i') });
      if (found) return found;
      
      // If not found, return an object indicating missing details
      return { word: w, synonyms: [], bengaliDefinition: null, isMissing: true };
    }));

    return NextResponse.json(details);
  } catch (err: any) {
    console.error('Words Bulk POST Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
