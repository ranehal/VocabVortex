import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query
      .replace(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i, '')
      .replace(/[\.\_\-]/g, ' ')
      .replace(/\b(1080p|720p|480p|x264|x265|hevc|web-rip|webrip|bluray|brrip|hdtv|aac|dts|dd5\.1)\b/gi, '')
      .trim();

    let imdbId = null;
    let movieTitle = cleanQuery;

    try {
        const imdbRes = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(cleanQuery)}`, { signal: AbortSignal.timeout(5000) });
        if (imdbRes.ok) {
            const imdbData = await imdbRes.json();
            const firstResult = imdbData.description?.[0];
            if (firstResult) {
                imdbId = firstResult['#IMDB_ID'];
                movieTitle = firstResult['#TITLE'] || movieTitle;
            }
        }
    } catch (e) {
        console.error("IMDB Search failed:", e);
    }

    if (imdbId) {
        try {
            const subRes = await fetch(`https://sub.im/api/v1/subtitles?imdb=${imdbId}&language=en`, { signal: AbortSignal.timeout(5000) });
            if (subRes.ok) {
                const subData = await subRes.json();
                const subtitles = (subData.subtitles || []).map((sub: { id: string; language: string; download_link: string; filename: string; rating: string }) => ({
                    id: sub.id,
                    language: sub.language,
                    url: sub.download_link,
                    filename: sub.filename,
                    rating: sub.rating
                }));

                if (subtitles.length > 0) {
                    return NextResponse.json(subtitles);
                }
            }
        } catch (e) {
            console.error("Subtitle search failed:", e);
        }
    }

    // Fallback/Mock data if nothing found or service down
    return NextResponse.json([
        { 
            id: 'mock-auto', 
            language: 'English', 
            filename: `${movieTitle} (Auto-found).srt`, 
            rating: '5.0', 
            isMock: true,
            info: 'Service temporarily unavailable, using placeholder.'
        }
    ]);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error("Search Subtitles Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
