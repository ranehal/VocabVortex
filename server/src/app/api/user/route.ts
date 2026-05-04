import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { isAuthenticated, isValidString } from '@/lib/auth';

/**
 * POST handler for user creation and synchronization.
 * Updates user data if they exist, otherwise creates a new user.
 * 
 * @param req The incoming Next.js POST request containing user data.
 * @returns A JSON response with the user data or an error message.
 */
export async function POST(req: NextRequest) {
  try {
    // Security Measure: Validate authorization
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Connect to the database
    await dbConnect();
    
    // Parse the request body
    const body = await req.json();
    const { email, name, picture, googleId, bookmarks, learned } = body;

    // Security Measure: Validate required input
    if (!isValidString(email) || !isValidString(googleId)) {
       return NextResponse.json({ error: 'Invalid or missing required fields (email, googleId)' }, { status: 400 });
    }

    // Attempt to find existing user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not found
      user = await User.create({
        email,
        name,
        picture,
        googleId,
        bookmarks: bookmarks || [],
        learned: learned || []
      });
    } else {
      // Sync logic: Merge local and remote data uniquely using Sets
      const mergedBookmarks = Array.from(new Set([...(user.bookmarks || []), ...(bookmarks || [])]));
      const mergedLearned = Array.from(new Set([...(user.learned || []), ...(learned || [])]));
      
      // Update user properties
      user.bookmarks = mergedBookmarks;
      user.learned = mergedLearned;
      user.name = name;
      user.picture = picture;
      user.updatedAt = new Date();
      
      // Save changes to database
      await user.save();
    }

    // Return the updated user object
    return NextResponse.json(user);
  } catch (err: any) {
    // Security Measure: Do not expose raw stack traces to the client
    console.error('User POST Error:', err);
    return NextResponse.json({ error: 'Internal server error during user synchronization' }, { status: 500 });
  }
}

/**
 * GET handler to retrieve a user by email.
 * 
 * @param req The incoming Next.js GET request with query parameters.
 * @returns A JSON response with the user data or an error message.
 */
export async function GET(req: NextRequest) {
  try {
    // Security Measure: Validate authorization
    if (!isAuthenticated(req)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Connect to the database
    await dbConnect();
    
    // Extract search parameters from the URL
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    // Security Measure: Validate email parameter
    if (!email || !isValidString(email)) {
      return NextResponse.json({ error: 'Valid email parameter is required' }, { status: 400 });
    }
    
    // Query the database for the user
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the found user
    return NextResponse.json(user);
  } catch (err: any) {
    // Security Measure: Log error internally, return generic error to client
    console.error('User GET Error:', err);
    return NextResponse.json({ error: 'Internal server error while fetching user' }, { status: 500 });
  }
}

