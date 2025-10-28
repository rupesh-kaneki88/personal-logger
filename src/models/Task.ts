import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  time?: string;
  priority?: 'Low' | 'Medium' | 'High';
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  googleCalendarEventId?: string;
}

const TaskSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  time: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  googleCalendarEventId: { type: String },
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
