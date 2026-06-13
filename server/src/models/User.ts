/**
 * User Model Module
 * Defines the Mongoose schema and model for User data.
 */
import mongoose from 'mongoose';

/**
 * Mongoose Schema for a User.
 * Represents a user in the VocabVortex application, storing their authentication
 * details (via Google) and their learning progress (bookmarks and learned words).
 */
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  picture: { type: String },
  googleId: { type: String },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  bookmarks: [{ type: String }],
  learned: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
});

// Export the model, preventing recompilation errors in serverless environments
export default mongoose.models.User || mongoose.model('User', UserSchema);

