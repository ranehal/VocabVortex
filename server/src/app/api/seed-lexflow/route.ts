import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LexFlowPassage from '@/models/LexFlowPassage';

export async function GET() {
  try {
    await dbConnect();
    await LexFlowPassage.deleteMany({});

    await LexFlowPassage.create([
      {
        order: 1,
        level: 'A2',
        passage: "Santiago was a young shepherd boy who traveled across the land with his sheep. He had a dream about finding treasure near the Egyptian pyramids. His journey taught him that the world has a language that everyone can understand.",
        words: [
          { english: 'shepherd', bengali: 'রাখাল' },
          { english: 'treasure', bengali: 'ধন' },
          { english: 'journey', bengali: 'যাত্রা' },
          { english: 'dream', bengali: 'স্বপ্ন' },
          { english: 'language', bengali: 'ভাষা' },
          { english: 'pyramids', bengali: 'পিরামিড' },
          { english: 'traveled', bengali: 'ভ্রমণ করেছিল' },
          { english: 'understand', bengali: 'বোঝা' },
          { english: 'taught', bengali: 'শিখিয়েছিল' },
          { english: 'world', bengali: 'পৃথিবী' },
        ],
      },
      {
        order: 2,
        level: 'B1',
        passage: "The alchemist told Santiago that when you want something with all your heart, the entire universe conspires to help you achieve it. Personal legend is the path that destiny has chosen for each person on Earth.",
        words: [
          { english: 'alchemist', bengali: 'আলকেমিস্ট' },
          { english: 'universe', bengali: 'মহাবিশ্ব' },
          { english: 'conspires', bengali: 'ষড়যন্ত্র করে' },
          { english: 'achieve', bengali: 'অর্জন করা' },
          { english: 'destiny', bengali: 'ভাগ্য' },
          { english: 'legend', bengali: 'কিংবদন্তি' },
          { english: 'personal', bengali: 'ব্যক্তিগত' },
          { english: 'chosen', bengali: 'বেছে নেওয়া' },
          { english: 'entire', bengali: 'সম্পূর্ণ' },
          { english: 'heart', bengali: 'হৃদয়' },
        ],
      },
      {
        order: 3,
        level: 'B1',
        passage: "Fatima was a woman of the desert who believed that love should never hold a person back from pursuing their personal legend. True love supports freedom and growth rather than creating fear or dependency.",
        words: [
          { english: 'desert', bengali: 'মরুভূমি' },
          { english: 'believed', bengali: 'বিশ্বাস করতেন' },
          { english: 'pursuing', bengali: 'অনুসরণ করা' },
          { english: 'freedom', bengali: 'স্বাধীনতা' },
          { english: 'growth', bengali: 'বিকাশ' },
          { english: 'dependency', bengali: 'নির্ভরতা' },
          { english: 'supports', bengali: 'সমর্থন করে' },
          { english: 'creating', bengali: 'তৈরি করা' },
          { english: 'rather', bengali: 'বরং' },
          { english: 'hold back', bengali: 'আটকে রাখা' },
        ],
      },
      {
        order: 4,
        level: 'B2',
        passage: "Omens are signs that the universe sends to guide people toward their destiny. A wise person learns to read these signs in everyday events — the flight of birds, the movement of the wind, or a conversation with a stranger.",
        words: [
          { english: 'omens', bengali: 'শুভ-অশুভ লক্ষণ' },
          { english: 'guide', bengali: 'পথ দেখানো' },
          { english: 'everyday', bengali: 'প্রতিদিনকার' },
          { english: 'stranger', bengali: 'অপরিচিত' },
          { english: 'movement', bengali: 'গতি' },
          { english: 'conversation', bengali: 'কথোপকথন' },
          { english: 'flight', bengali: 'উড়ান' },
          { english: 'sends', bengali: 'পাঠায়' },
          { english: 'toward', bengali: 'দিকে' },
          { english: 'wise', bengali: 'জ্ঞানী' },
        ],
      },
      {
        order: 5,
        level: 'B2',
        passage: "The Soul of the World is a positive force that communicates through universal language. It exists within everything — in minerals, plants, animals, and people alike. Recognizing it requires patience and a silent mind.",
        words: [
          { english: 'force', bengali: 'শক্তি' },
          { english: 'communicates', bengali: 'যোগাযোগ করে' },
          { english: 'universal', bengali: 'সর্বজনীন' },
          { english: 'minerals', bengali: 'খনিজ পদার্থ' },
          { english: 'patience', bengali: 'ধৈর্য' },
          { english: 'recognizing', bengali: 'চেনা' },
          { english: 'requires', bengali: 'দরকার' },
          { english: 'silent', bengali: 'নিরব' },
          { english: 'positive', bengali: 'ইতিবাচক' },
          { english: 'exists', bengali: 'বিদ্যমান' },
        ],
      },
    ]);

    return NextResponse.json({ message: 'LexFlow passages seeded successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
