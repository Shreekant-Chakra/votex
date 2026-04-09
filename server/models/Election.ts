import mongoose, { Schema, Document } from 'mongoose';

export interface IElection extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const ElectionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed'], 
    default: 'upcoming' 
  }
}, { timestamps: true });

export default mongoose.model<IElection>('Election', ElectionSchema);
