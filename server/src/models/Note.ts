import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  title: { type: String, default: 'Untitled' },
  content: { type: String, default: '' },
  lastSynced: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
