import mongoose from 'mongoose';

const WordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  level: { type: String, required: true },
  story: { type: String, required: true },
  drills: [{ sentence: String, explanation: String }],
  bengaliDefinition: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Word || mongoose.model('Word', WordSchema);
