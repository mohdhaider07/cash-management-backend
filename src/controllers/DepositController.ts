import { Request, Response } from "express";
import { z } from "zod";
import asyncRequestHandler from "../middlewares/asyncRequestHandler";
import Deposit from "../models/Deposit";
import Collection from "../models/Collection";

const createSchema = z.object({
  employeeId: z.string(),
  amount: z.number().positive(),
  depositDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
});

export const createDeposit = asyncRequestHandler(
  { body: createSchema },
  async (req: Request, res: Response) => {
    const { employeeId, amount, depositDate } = req.body;

    // Fetch all uncleared collections for the employee
    const collections = await Collection.find({
      employeeId,
      cleared: false,
    }).sort({ collectionDate: 1 });

    let remainingAmount = amount;

    // Allocate deposit to collections
    for (const collection of collections) {
      if (remainingAmount <= 0) break;

      // Calculate the total allocated amount for this collection
      const totalAllocated = await Deposit.aggregate([
        { $match: { collectionId: collection._id } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const allocatedAmount =
        totalAllocated.length > 0 ? totalAllocated[0].total : 0;
      const remainingCollectionAmount =
        collection.mmCollection - allocatedAmount;

      if (remainingCollectionAmount <= 0) continue;

      const allocationAmount = Math.min(
        remainingAmount,
        remainingCollectionAmount
      );

      // Create deposit with collection reference
      await Deposit.create({
        employeeId,
        amount: allocationAmount,
        depositDate: new Date(depositDate),
        collectionId: collection._id,
      });

      remainingAmount -= allocationAmount;

      // Mark collection as cleared if fully allocated
      if (remainingCollectionAmount === allocationAmount) {
        collection.cleared = true;
        await collection.save();
      }
    }

    // If there's any remaining amount, create a new deposit without a collection reference
    if (remainingAmount > 0) {
      await Deposit.create({
        employeeId,
        amount: remainingAmount,
        depositDate: new Date(depositDate),
        collectionId: null,
      });
    }

    res.status(201).json({ message: "Deposit processed successfully" });
  }
);

// GET /deposits?employeeId=...
export const getDepositsByEmployee = asyncRequestHandler(
  {},
  async (req: Request, res: Response) => {
    const { employeeId } = req.query;

    const filter = employeeId ? { employeeId } : {};
    const deposits = await Deposit.find(filter)
      .populate("employeeId", "name")
      .sort({ depositDate: 1 });

    res.json({ deposits });
  }
);
