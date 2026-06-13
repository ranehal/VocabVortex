import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { isAuthenticated } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();

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
