import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use a free unofficial IMDb search API for suggestions
    const res = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    // Map to a common format
    const suggestions = (data.description || []).map((item: any) => ({
      title: item['#TITLE'],
      year: item['#YEAR'],
      imdbId: item['#IMDB_ID'],
      poster: item['#IMG_POSTER'],
      rank: item['#RANK']
    }));

    return NextResponse.json(suggestions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
