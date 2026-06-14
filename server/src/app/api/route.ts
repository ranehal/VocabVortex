import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'Vortex API is Online', timestamp: new Date().toISOString() });
}
