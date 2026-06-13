import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { isAuthenticated, isValidString } from '@/lib/auth';

/**
 * POST handler for user creation and synchronization.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    
    const body = await req.json();
    const { email, name, picture, googleId, bookmarks, learned } = body;

    if (!isValidString(email) || !isValidString(googleId)) {
       return NextResponse.json({ error: 'Invalid or missing required fields (email, googleId)' }, { status: 400 });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        picture,
        googleId,
        bookmarks: bookmarks || [],
        learned: learned || []
      });
    } else {
      const mergedBookmarks = Array.from(new Set([...(user.bookmarks || []), ...(bookmarks || [])]));
      const mergedLearned = Array.from(new Set([...(user.learned || []), ...(learned || [])]));
      
      user.bookmarks = mergedBookmarks;
      user.learned = mergedLearned;
      user.name = name;
      user.picture = picture;
      user.updatedAt = new Date();
      
      await user.save();
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error('User POST Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET handler to retrieve a user by email.
 */
export async function GET(req: NextRequest) {
  try {
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email || !isValidString(email)) {
      return NextResponse.json({ error: 'Valid email parameter is required' }, { status: 400 });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error('User GET Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
