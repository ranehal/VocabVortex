import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'vortex-secret-key-123';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        picture,
        googleId,
        xp: 0,
        level: 1,
        bookmarks: [],
        learned: []
      });
    }

    // Create Session Token
    const sessionToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      user,
      sessionToken
    });
  } catch (err: any) {
    console.error('Google Auth Error:', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
