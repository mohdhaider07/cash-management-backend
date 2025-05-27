import { Request, Response } from "express";
import Collection from "../models/Collection";
import Deposit from "../models/Deposit";
import asyncRequestHandler from "../middlewares/asyncRequestHandler";

export const employeePaymentReport = asyncRequestHandler(
  {},
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get all employees matching search
    const employees = await Collection.db
      .collection("employees")
      .find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      })
      .toArray();

    // For each employee, get all collections and all deposits
    const report = await Promise.all(
      employees.map(async (emp: any) => {
        // All collections for this employee
        const collections = await Collection.find({ employeeId: emp._id });
        // All deposits for this employee
        const deposits = await Deposit.find({ employeeId: emp._id });

        // If no collections and no deposits, still show the employee
        if (collections.length === 0 && deposits.length === 0) {
          return [
            {
              collectionAmount: null,
              collectionDate: null,
              employeeDetails: {
                _id: emp._id,
                name: emp.name,
                location: emp.location,
                address: emp.address,
                createdAt: emp.createdAt,
                updatedAt: emp.updatedAt,
                __v: emp.__v,
              },
              depositAmount: null,
              depositDate: null,
              collectionId: null,
              difference: null,
            },
          ];
        }

        // For each collection, match with its deposits
        const collectionRows: any[] = [];
        for (const col of collections) {
          const colDeposits = deposits.filter(
            (d: any) => d.collectionId && d.collectionId.equals(col._id)
          );
          if (colDeposits.length > 0) {
            const totalDeposited = colDeposits.reduce(
              (sum: number, d: any) => sum + (d.amount || 0),
              0
            );
            colDeposits.forEach((deposit: any, idx: number) => {
              collectionRows.push({
                collectionAmount: idx === 0 ? col.mmCollection : null,
                collectionDate: idx === 0 ? col.collectionDate : null,
                employeeDetails:
                  idx === 0
                    ? {
                        _id: emp._id,
                        name: emp.name,
                        location: emp.location,
                        address: emp.address,
                        createdAt: emp.createdAt,
                        updatedAt: emp.updatedAt,
                        __v: emp.__v,
                      }
                    : null,
                depositAmount: deposit.amount,
                depositDate: deposit.depositDate,
                collectionId: col._id,
                difference:
                  idx === colDeposits.length - 1
                    ? (col.mmCollection || 0) - totalDeposited
                    : null,
              });
            });
          } else {
            collectionRows.push({
              collectionAmount: col.mmCollection,
              collectionDate: col.collectionDate,
              employeeDetails: {
                _id: emp._id,
                name: emp.name,
                location: emp.location,
                address: emp.address,
                createdAt: emp.createdAt,
                updatedAt: emp.updatedAt,
                __v: emp.__v,
              },
              depositAmount: null,
              depositDate: null,
              collectionId: col._id,
              difference: col.mmCollection || 0,
            });
          }
        }

        // Deposits not linked to any collection
        const orphanDeposits = deposits.filter((d: any) => !d.collectionId);
        const orphanRows = orphanDeposits.map((deposit: any) => ({
          collectionAmount: null,
          collectionDate: null,
          employeeDetails: {
            _id: emp._id,
            name: emp.name,
            location: emp.location,
            address: emp.address,
            createdAt: emp.createdAt,
            updatedAt: emp.updatedAt,
            __v: emp.__v,
          },
          depositAmount: deposit.amount,
          depositDate: deposit.depositDate,
          collectionId: null,
          difference: deposit.amount,
        }));

        return [...collectionRows, ...orphanRows];
      })
    );

    // Flatten and paginate
    const flatReport = report.flat();
    const total = flatReport.length;
    const paginated = flatReport.slice(skip, skip + Number(limit));
    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      report: paginated,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    });
  }
);

export const getSummaryStats = asyncRequestHandler(
  {},
  async (req: Request, res: Response) => {
    // Get total MM collection
    const totalCollection = await Collection.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$mmCollection" },
        },
      },
    ]);

    // Get total deposits
    const totalDeposit = await Deposit.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalCollectionAmount = totalCollection[0]?.total || 0;
    const totalDepositAmount = totalDeposit[0]?.total || 0;
    const differenceAmount = totalCollectionAmount - totalDepositAmount;

    res.status(200).json({
      totalCollection: totalCollectionAmount,
      totalDeposit: totalDepositAmount,
      difference: differenceAmount,
    });
  }
);

export const getOutstandingReport = asyncRequestHandler(
  {},
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get all employees
    const employees = await Collection.db
      .collection("employees")
      .find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      })
      .toArray();

    // For each employee, calculate totalCollection, totalDeposits, recentDeposit, outstandingAmount
    const report = await Promise.all(
      employees.map(async (emp: any) => {
        // Total collection for this employee
        const collections = await Collection.find({ employeeId: emp._id });
        const totalCollection = collections.reduce(
          (sum, c) => sum + (c.mmCollection || 0),
          0
        );

        // All deposits for this employee
        const deposits = await Deposit.find({ employeeId: emp._id });
        const totalDeposits = deposits.reduce(
          (sum, d) => sum + (d.amount || 0),
          0
        );
        const recentDeposit =
          deposits.length > 0
            ? deposits.reduce(
                (max, d) => (d.depositDate > max ? d.depositDate : max),
                deposits[0].depositDate
              )
            : null;

        return {
          employeeId: emp._id,
          employeeName: emp.name,
          employeeLocation: emp.location,
          employeeAddedDate: emp.createdAt,
          totalCollection,
          totalDeposits,
          recentDeposit,
          outstandingAmount: totalCollection - totalDeposits,
        };
      })
    );

    // Sort by outstanding amount
    report.sort((a, b) => b.outstandingAmount - a.outstandingAmount);

    // Paginate
    const paginated = report.slice(skip, skip + Number(limit));

    res.status(200).json({
      data: paginated,
      total: report.length,
      page: Number(page),
      limit: Number(limit),
    });
  }
);
