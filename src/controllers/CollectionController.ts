import { Request, Response } from "express";
import { z } from "zod";
import asyncRequestHandler from "../middlewares/asyncRequestHandler";
import Collection from "../models/Collection";
import Deposit from "../models/Deposit";

const createSchema = z.object({
  employeeId: z.string(),
  mmCollection: z.number().min(1).positive(),
  collectionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
});

export const createCollectionWithAllocation = asyncRequestHandler(
  { body: createSchema },
  async (req: Request, res: Response) => {
    const { employeeId, mmCollection, collectionDate } = req.body;

    // Create the collection
    const collection = await Collection.create({
      employeeId,
      mmCollection,
      collectionDate: new Date(collectionDate),
      cleared: false,
    });

    // Fetch all deposits without a collection reference for the employee
    const deposits = await Deposit.find({
      employeeId,
      collectionId: null,
    }).sort({ depositDate: 1 });

    for (const deposit of deposits) {
      // Calculate the total allocated amount for this collection
      const totalAllocated = await Deposit.aggregate([
        { $match: { collectionId: collection._id } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const allocatedAmount =
        totalAllocated.length > 0 ? totalAllocated[0].total : 0;
      const remainingCollectionAmount =
        collection.mmCollection - allocatedAmount;

      if (remainingCollectionAmount <= 0) break;

      const allocationAmount = Math.min(
        remainingCollectionAmount,
        deposit.amount
      );

      // Update deposit
      deposit.amount -= allocationAmount;

      // If the deposit is fully allocated to this collection
      if (deposit.amount === 0) {
        deposit.collectionId = collection._id;
        await deposit.save();
      } else {
        // If the deposit amount exceeds the collection amount
        await Deposit.create({
          employeeId: deposit.employeeId,
          amount: deposit.amount, // Remaining unallocated amount
          depositDate: deposit.depositDate,
          collectionId: null, // No collection reference
        });

        // Update the original deposit to reflect the allocated amount
        deposit.amount = allocationAmount;
        deposit.collectionId = collection._id;
        await deposit.save();
      }

      // Mark collection as cleared if fully allocated
      if (remainingCollectionAmount === allocationAmount) {
        collection.cleared = true;
        await collection.save();
      }
    }

    res.status(201).json({
      message: "Collection created and deposits allocated",
      collection,
    });
  }
);

// GET /collections?employeeId=...
export const getCollections = asyncRequestHandler(
  {},
  async (req: Request, res: Response) => {
    const { employeeId } = req.query;
    const filter = employeeId ? { employeeId } : {};

    const collections = await Collection.find(filter)
      .populate("employeeId", "name")
      .sort({ collectionDate: 1 });

    res.json({ collections });
  }
);
