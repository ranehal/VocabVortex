import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET() {
  try {
    await dbConnect();

    const books = await Book.find({})
      .sort({ createdAt: -1 });

    return NextResponse.json(books);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    const book = await Book.create({
      title: body.title,
      author: body.author,
      level: body.level,
      coverEmoji: body.coverEmoji,
      chapters: body.chapters,
    });

    return NextResponse.json(book);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}