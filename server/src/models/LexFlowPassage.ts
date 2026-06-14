import mongoose from 'mongoose';

const WordPairSchema = new mongoose.Schema({
  english: { type: String, required: true },
  bengali: { type: String, required: true },
}, { _id: false });

const LexFlowPassageSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  passage: { type: String, required: true },
  level: { type: String, default: 'A2' },
  words: [WordPairSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.LexFlowPassage ||
  mongoose.model('LexFlowPassage', LexFlowPassageSchema);
