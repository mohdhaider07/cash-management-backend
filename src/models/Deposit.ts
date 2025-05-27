import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDeposit extends Document {
  employeeId: Types.ObjectId;
  collectionId?: Types.ObjectId; // Optional, if you want to link to a collection
  amount: number;
  depositDate: Date;
}

const DepositSchema: Schema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: false, // Optional, if you want to link to a collection
    },
    amount: { type: Number, required: true },
    depositDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDeposit>("Deposit", DepositSchema);
