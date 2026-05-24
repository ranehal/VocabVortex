import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { isAuthenticated } from '@/lib/auth';

/**
 * GET handler to retrieve the leaderboard.
 * Returns top users sorted by XP.
 */
export async function GET(req: NextRequest) {
  try {
    // Security Measure: Validate authorization (optional for leaderboard, but let's keep it consistent)
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();

    // Fetch top 10 users by XP
    const topUsers = await User.find({})
      .select('name picture xp level')
      .sort({ xp: -1 })
      .limit(10);

    return NextResponse.json(topUsers);
  } catch (err: any) {
    console.error('Leaderboard GET Error:', err);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
