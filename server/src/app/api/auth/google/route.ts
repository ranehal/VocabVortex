import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vortex-secret-key-123';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

async function getGooglePayload(idToken?: string, accessToken?: string) {
  // Strategy 1: verify id_token via Google's tokeninfo endpoint
  if (idToken) {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    const data = await res.json();
    if (res.ok && data.email) {
      // Optionally verify audience
      if (GOOGLE_CLIENT_ID && data.aud && data.aud !== GOOGLE_CLIENT_ID) {
        throw new Error(`Token audience mismatch: got ${data.aud}`);
      }
      return data;
    }
    console.warn('id_token tokeninfo failed:', data.error_description || data.error);
  }

  // Strategy 2: use access_token to call userinfo endpoint
  if (accessToken) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (res.ok && data.email) return data;
    console.warn('userinfo failed:', data.error?.message || data.error);
  }

  throw new Error('Could not verify Google identity with either token');
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { idToken, accessToken } = body;

    if (!idToken && !accessToken) {
      return NextResponse.json({ error: 'idToken or accessToken is required' }, { status: 400 });
    }

    const payload = await getGooglePayload(idToken, accessToken);

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return NextResponse.json({ error: 'No email in Google payload' }, { status: 401 });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: name || email.split('@')[0],
        picture: picture || '',
        googleId: googleId || email,
        xp: 0,
        level: 1,
        bookmarks: [],
        learned: [],
      });
    }

    const sessionToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ user, sessionToken });
  } catch (err: any) {
    console.error('Google Auth Error:', err);
    return NextResponse.json(
      { error: 'Authentication failed', detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
