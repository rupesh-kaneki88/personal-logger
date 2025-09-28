import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String },
  email: { type: String, unique: true },
  image: { type: String },
  emailVerified: { type: Date },
});

export default models.User || mongoose.model<IUser>('User', UserSchema);
