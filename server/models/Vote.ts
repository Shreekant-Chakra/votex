import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  userId: mongoose.Types.ObjectId;
  electionId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VoteSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true }
}, { timestamps: true });

// Ensure a user can only vote once per election
VoteSchema.index({ userId: 1, electionId: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema);
