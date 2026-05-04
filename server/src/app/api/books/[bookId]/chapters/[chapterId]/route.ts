import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET(
  req: Request,
  context: { params: Promise<{ bookId: string; chapterId: string }> }
) {
  try {
    await dbConnect();

    const { bookId, chapterId } = await context.params;

    const book = await Book.findById(bookId);

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found', bookId },
        { status: 404 }
      );
    }

    const chapter = book.chapters.id(chapterId);

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found', chapterId },
        { status: 404 }
      );
    }

    return NextResponse.json({
      bookTitle: book.title,
      chapterTitle: chapter.title,
      level: chapter.level,
      text: chapter.text,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}