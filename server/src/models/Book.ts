import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, default: 'A2' },
  text: { type: String, required: true },
});

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  level: { type: String, default: 'A2' },
  coverEmoji: { type: String, default: '📘' },
  chapters: [ChapterSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Book || mongoose.model('Book', BookSchema);