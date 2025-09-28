import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  timestamp: Date;
  content: string;
  category?: string;
  duration?: number;
}

const LogSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  content: { type: String, required: true },
  category: { type: String },
  duration: { type: Number },
});

export default mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
