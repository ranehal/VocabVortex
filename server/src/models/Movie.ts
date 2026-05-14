import mongoose from 'mongoose';

const DialogueSchema = new mongoose.Schema({
  speaker: { type: String },
  timestamp: { type: String },
  en: { type: String, required: true },
  bn: { type: String },
});

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: String },
  posterEmoji: { type: String, default: '🎬' },
  dialogues: [DialogueSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Movie || mongoose.model('Movie', MovieSchema);
