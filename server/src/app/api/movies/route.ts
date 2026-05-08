import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    let movies;
    if (query) {
      movies = await Movie.find({ title: { $regex: query, $options: 'i' } })
        .select('-dialogues') // Don't return dialogues in search results
        .sort({ createdAt: -1 });
    } else {
      movies = await Movie.find({})
        .select('-dialogues')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(movies);
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

    const movie = await Movie.create(body);

    return NextResponse.json(movie);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
