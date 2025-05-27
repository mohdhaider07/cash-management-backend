import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICollection extends Document {
  employeeId: Types.ObjectId;
  mmCollection: number;
  collectionDate: Date;
  cleared: boolean;
}

const CollectionSchema: Schema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    mmCollection: { type: Number, required: true },
    collectionDate: { type: Date, required: true },
    cleared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ICollection>("Collection", CollectionSchema);
