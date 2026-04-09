import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  name: string;
  image: string;
  electionId: mongoose.Types.ObjectId;
  voteCount: number;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema: Schema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'Election', required: true },
  voteCount: { type: Number, default: 0 },
  bio: { type: String }
}, { timestamps: true });

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
