import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  reportContent: string;
  title: string;
}

const ReportSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  reportContent: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
