import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'Low' | 'Medium' | 'High';
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
}

const TaskSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
