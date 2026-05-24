import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { isAuthenticated, isValidString } from '@/lib/auth';

/**
 * POST handler to award XP to a user.
 * Increments XP and potentially updates level.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { email, xpToAdd } = body;

    if (!isValidString(email) || typeof xpToAdd !== 'number') {
      return NextResponse.json({ error: 'Invalid email or xpToAdd' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Award XP
    user.xp = (user.xp || 0) + xpToAdd;

    // Simple leveling logic: level up every 500 XP
    const newLevel = Math.floor(user.xp / 500) + 1;
    if (newLevel > (user.level || 1)) {
      user.level = newLevel;
    }

    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({ xp: user.xp, level: user.level });
  } catch (err: any) {
    console.error('XP Update Error:', err);
    return NextResponse.json({ error: 'Failed to update XP' }, { status: 500 });
  }
}
