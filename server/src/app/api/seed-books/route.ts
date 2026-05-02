import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

export async function GET() {
  try {
    await dbConnect();

    await Book.deleteMany({});

    await Book.create([
      {
        title: 'The Alchemist Practice',
        author: 'Practice Version',
        level: 'A2',
        coverEmoji: '📘',
        chapters: [
          {
            title: 'Chapter 1',
            level: 'A2',
            text: "THE BOY'S NAME WAS (ছেলেটির নাম ছিল) SANTIAGO. DUSK was falling (সন্ধ্যা পড়ছিল), and he arrived (সে পৌঁছাল) with his herd (তার পশুপাল নিয়ে) at an abandoned church (একটি পরিত্যক্ত গির্জায়)."
          },
          {
            title: 'Chapter 2',
            level: 'B1',
            text: "He had learned (সে শিখেছিল) that the world was full of signs (পৃথিবী সংকেতে ভরা), but people often ignored them (কিন্তু মানুষ প্রায়ই সেগুলো উপেক্ষা করে)."
          }
        ]
      },
      {
        title: 'Easy English Reader',
        author: 'VocabVortex',
        level: 'A1',
        coverEmoji: '📗',
        chapters: [
          {
            title: 'A Simple Morning',
            level: 'A1',
            text: "I wake up early (আমি সকালে তাড়াতাড়ি উঠি). I drink water (আমি পানি পান করি). Then I go to school (তারপর আমি স্কুলে যাই)."
          }
        ]
      }
    ]);

    return NextResponse.json({
      message: 'Books inserted successfully'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}