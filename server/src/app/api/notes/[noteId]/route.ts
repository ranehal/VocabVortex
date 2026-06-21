import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Note from '@/models/Note';
export async function DELETE(req: NextRequest, { params }: { params: { noteId: string } }) {
  try {
    await dbConnect();
    const { noteId } = params;
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    await Note.findOneAndDelete({ _id: noteId, userEmail: email });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
