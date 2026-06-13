import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const DEMO_USERS = [
  { email: 'nehal2@vortex.com', name: 'nehal2', xp: 2450, picture: '🚀' },
  { email: 'arafat@vortex.com', name: 'arafat', xp: 2100, picture: '🦊' },
  { email: 'user11@vortex.com', name: 'user11', xp: 1850, picture: '🤖' },
  { email: 'sakib@vortex.com', name: 'sakib', xp: 1600, picture: '🦁' },
  { email: 'alamin@vortex.com', name: 'alamin', xp: 1420, picture: '🐼' },
  { email: 'blabla@vortex.com', name: 'blabla', xp: 1200, picture: '🦄' },
  { email: 'guest_legend@vortex.com', name: 'Guest', xp: 850, picture: '👤' }
];

export async function GET() {
  try {
    await dbConnect();
    
    for (const u of DEMO_USERS) {
      await User.findOneAndUpdate(
        { email: u.email },
        { ...u, googleId: 'demo-id-' + u.name, level: Math.floor(u.xp / 500) + 1 },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ message: 'Demo users seeded successfully' });
  } catch (err: any) {
    console.error('Seeding Error:', err);
    return NextResponse.json({ error: 'Failed to seed demo users' }, { status: 500 });
  }
}
