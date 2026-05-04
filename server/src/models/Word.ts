/**
 * Word Model Module
 * Defines the Mongoose schema and model for Dictionary/Vocabulary Words.
 */
import mongoose from 'mongoose';

/**
 * Mongoose Schema for a Word.
 * Stores comprehensive educational content for a vocabulary word,
 * including its definition, phonetic spelling, stories, and grammar drills.
 * This structure is tailored to the AI-generated output from Groq.
 */
const WordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  level: { type: String, required: true },
  story: { type: String, required: true },
  drills: [{ sentence: String, explanation: String }],
  bengaliDefinition: { type: String },
  // Dictionary fields for "Google-like" info
  phonetic: { type: String },
  partOfSpeech: { type: String },
  synonyms: [{ type: String }],
  antonyms: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Export the model, preventing recompilation errors in serverless environments
export default mongoose.models.Word || mongoose.model('Word', WordSchema);

