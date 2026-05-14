import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';
import zlib from 'zlib';

/**
 * Basic SRT Parser
 */
function parseSRT(srt: string) {
  const lines = srt.replace(/\r/g, '').split('\n');
  const dialogues = [];
  let current: any = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if it's an index (number)
    if (/^\d+$/.test(line)) {
      if (current.en) dialogues.push(current);
      current = {};
    } 
    // Check if it's a timestamp
    else if (line.includes('-->')) {
      const parts = line.split(' --> ');
      current.timestamp = parts[0].split(',')[0]; 
    } 
    // Otherwise it's dialogue text
    else {
      // Remove basic HTML tags from subtitle text
      const cleanLine = line.replace(/<\/?[^>]+(>|$)/g, "");
      current.en = current.en ? `${current.en} ${cleanLine}` : cleanLine;
    }
  }
  if (current.en) dialogues.push(current);
  return dialogues;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { imdbId, title, year, posterEmoji } = await req.json();

    if (!imdbId || !title) {
      return NextResponse.json({ error: 'imdbId and title are required' }, { status: 400 });
    }

    // Strip "tt" prefix if present
    const id = imdbId.replace('tt', '');
    
    // 1. Fetch subtitle metadata from OpenSubtitles
    const osRes = await fetch(`https://rest.opensubtitles.org/search/imdbid-${id}/sublanguageid-eng`, {
      headers: {
        'User-Agent': 'TemporaryUserAgent'
      }
    });
    
    const subs = await osRes.json();
    
    if (!subs || subs.length === 0) {
      return NextResponse.json({ error: 'No English subtitles found on OpenSubtitles for this movie.' }, { status: 404 });
    }

    // 2. Sort by downloads to get the best quality
    subs.sort((a: any, b: any) => parseInt(b.SubDownloadsCnt) - parseInt(a.SubDownloadsCnt));
    const bestSub = subs[0];
    
    // 3. Download the GZ file
    const gzRes = await fetch(bestSub.SubDownloadLink, {
      headers: { 'User-Agent': 'TemporaryUserAgent' }
    });
    const arrayBuffer = await gzRes.arrayBuffer();
    
    // 4. Decompress
    const buffer = Buffer.from(arrayBuffer);
    const srtContent = zlib.gunzipSync(buffer).toString('utf8');
    
    // 5. Parse
    const dialogues = parseSRT(srtContent);
    
    if (dialogues.length === 0) {
      return NextResponse.json({ error: 'Failed to parse subtitles.' }, { status: 500 });
    }

    // 6. Save to DB
    const movie = await Movie.create({
      title,
      year: year || new Date().getFullYear().toString(),
      posterEmoji: posterEmoji || '🎬',
      dialogues
    });

    return NextResponse.json(movie);
  } catch (err: any) {
    console.error("External Import Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
