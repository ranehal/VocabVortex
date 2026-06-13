import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    await dbConnect();
    const { movieId } = await params;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
