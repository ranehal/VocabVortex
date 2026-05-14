import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';

export async function GET() {
  try {
    await dbConnect();

    // Clear existing movies
    await Movie.deleteMany({});

    const seedMovies = [
      {
        title: "The Shawshank Redemption",
        year: "1994",
        posterEmoji: "⛓️",
        dialogues: [
          { speaker: "Red", timestamp: "00:15:30", en: "Hope is a dangerous thing (আশা একটি বিপজ্জনক জিনিস). Hope can drive a man insane (আশা একজন মানুষকে পাগল করে দিতে পারে).", bn: "আশা একটি বিপজ্জনক জিনিস। আশা একজন মানুষকে পাগল করে দিতে পারে।" },
          { speaker: "Andy", timestamp: "00:45:10", en: "Get busy living (বেঁচে থাকায় ব্যস্ত হও) or get busy dying (অথবা মরায় ব্যস্ত হও).", bn: "বেঁচে থাকায় ব্যস্ত হও অথবা মরায় ব্যস্ত হও।" },
          { speaker: "Red", timestamp: "02:12:00", en: "I hope I can make it across the border (আমি আশা করি আমি সীমান্ত পার হতে পারব). I hope to see my friend and shake his hand (আমি আমার বন্ধুর সাথে দেখা করতে এবং তার সাথে হাত মিলাতে আশা করি).", bn: "আমি আশা করি আমি সীমান্ত পার হতে পারব। আমি আমার বন্ধুর সাথে দেখা করতে এবং তার সাথে হাত মিলাতে আশা করি।" }
        ]
      },
      {
        title: "Inception",
        year: "2010",
        posterEmoji: "🌀",
        dialogues: [
          { speaker: "Cobb", timestamp: "00:05:20", en: "An idea is like a virus (একটি ধারণা ভাইরাসের মতো). Resilient (সহনশীল), highly contagious (অত্যন্ত সংক্রামক).", bn: "একটি ধারণা ভাইরাসের মতো। সহনশীল, অত্যন্ত সংক্রামক।" },
          { speaker: "Arthur", timestamp: "00:30:15", en: "You mustn't be afraid to dream a little bigger (তোমাকে একটু বড় স্বপ্ন দেখতে ভয় পেলে চলবে না), darling.", bn: "তোমাকে একটু বড় স্বপ্ন দেখতে ভয় পেলে চলবে না, ডার্লিং।" },
          { speaker: "Mal", timestamp: "01:50:45", en: "Do you think you can build a prison of memories (তুমি কি মনে করো তুমি স্মৃতির একটি কারাগার তৈরি করতে পারবে) to lock me in?", bn: "তুমি কি মনে করো তুমি স্মৃতির একটি কারাগার তৈরি করতে পারবে আমাকে আটকে রাখার জন্য?" }
        ]
      },
      {
        title: "The Dark Knight",
        year: "2008",
        posterEmoji: "🦇",
        dialogues: [
          { speaker: "Joker", timestamp: "00:20:10", en: "Why so serious (এত সিরিয়াস কেন)?", bn: "এত সিরিয়াস কেন?" },
          { speaker: "Harvey Dent", timestamp: "00:55:30", en: "You either die a hero (তুমি হয়তো বীর হিসেবে মরবে) or you live long enough to see yourself become the villain (অথবা তুমি নিজেকে ভিলেন হতে দেখার জন্য যথেষ্ট সময় বেঁচে থাকবে).", bn: "তুমি হয়তো বীর হিসেবে মরবে অথবা তুমি নিজেকে ভিলেন হতে দেখার জন্য যথেষ্ট সময় বেঁচে থাকবে।" },
          { speaker: "Alfred", timestamp: "01:10:00", en: "Some men just want to watch the world burn (কিছু মানুষ শুধু দুনিয়াটা জ্বলতে দেখতে চায়).", bn: "কিছু মানুষ শুধু দুনিয়াটা জ্বলতে দেখতে চায়।" }
        ]
      }
    ];

    await Movie.insertMany(seedMovies);

    return NextResponse.json({ message: 'Movie database seeded successfully!' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
