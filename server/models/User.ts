import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  profileImage?: string;
  hasVoted: mongoose.Types.ObjectId[]; // Array of election IDs
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profileImage: { type: String },
  hasVoted: [{ type: Schema.Types.ObjectId, ref: 'Election' }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
