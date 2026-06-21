import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Note from '@/models/Note';
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const notes = await Note.find({ userEmail: email }).sort({ updatedAt: -1 });
    return NextResponse.json(notes);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { userEmail, title, content, noteId } = await req.json();

    if (!userEmail) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    let note;
    if (noteId) {
      note = await Note.findOneAndUpdate(
        { _id: noteId, userEmail },
        { title, content, updatedAt: new Date() },
        { new: true }
      );
    } else {
      note = await Note.create({ userEmail, title, content });
    }

    return NextResponse.json(note);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
