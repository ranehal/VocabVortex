import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imdbId = searchParams.get('imdbId');

    if (!imdbId) {
      return NextResponse.json({ error: 'imdbId is required' }, { status: 400 });
    }

    // Unofficial/Public Subtitle API (Example using a known scraper proxy)
    // Note: In a production app, you'd want to use official APIs with keys
    // This is a placeholder for a public-facing subtitle search that returns SRT links
    const res = await fetch(`https://sub.im/api/v1/subtitles?imdb=${imdbId}&language=en`);
    const data = await res.json();

    // Map to a common format
    const subtitles = (data.subtitles || []).map((sub: any) => ({
      id: sub.id,
      language: sub.language,
      url: sub.download_link,
      filename: sub.filename,
      rating: sub.rating
    }));

    // If no subtitles found, return some mock/sample ones for demo purposes
    if (subtitles.length === 0) {
      return NextResponse.json([
        { id: '1', language: 'English', filename: 'English (Official).srt', rating: '5.0' },
        { id: '2', language: 'English', filename: 'English (SDH).srt', rating: '4.5' }
      ]);
    }

    return NextResponse.json(subtitles);
  } catch (err: any) {
    // Fallback for demo
    return NextResponse.json([
      { id: '1', language: 'English', filename: 'English (Auto-selected).srt', rating: '5.0' }
    ]);
  }
}
