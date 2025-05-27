import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  _id: number;
  name: string;
  location: string;
}

const EmployeeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEmployee>("Employee", EmployeeSchema);
