import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LexFlowPassage from '@/models/LexFlowPassage';

export async function GET() {
  try {
    await dbConnect();
    const passages = await LexFlowPassage.find({}).sort({ order: 1 });
    return NextResponse.json(passages);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const passage = await LexFlowPassage.create(body);
    return NextResponse.json(passage);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
