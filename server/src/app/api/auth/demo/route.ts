import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vortex-secret-key-123';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name } = await req.json();
    const displayName = (name || 'Demo User').trim().substring(0, 30);
    const email = `demo_${displayName.toLowerCase().replace(/\s+/g, '_')}@vocabvortex.demo`;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: displayName,
        picture: '',
        googleId: `demo_${Date.now()}`,
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
    console.error('Demo Auth Error:', err);
    return NextResponse.json({ error: 'Demo login failed' }, { status: 500 });
  }
}
