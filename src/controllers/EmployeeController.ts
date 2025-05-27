import { Request, Response } from "express";
import { z } from "zod";
import asyncRequestHandler from "../middlewares/asyncRequestHandler";
import Employee, { IEmployee } from "../models/Employee";

// Validation Schemas
const createEmployeeSchema = z.object({
  name: z.string(),
  location: z.string(),
});

// Create new employee
export const createEmployee = asyncRequestHandler(
  { body: createEmployeeSchema },
  async (req: Request, res: Response) => {
    const { name, location } = req.body;

    const employee = new Employee({ name, location });
    await employee.save();

    res.status(201).json({ message: "Employee created", employee });
  }
);

// Get all employees
export const getAllEmployees = asyncRequestHandler(
  {},
  async (req: Request, res: Response) => {
    const employees = await Employee.find();
    res.json({ employees });
  }
);

// Get employee by ID
export const getEmployeeById = asyncRequestHandler(
  {},
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404);
      throw new Error("Employee not found");
    }
    res.json({ employee });
  }
);

// Update employee
const updateEmployeeSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
});

export const updateEmployee = asyncRequestHandler(
  { body: updateEmployeeSchema },
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) {
      res.status(404);
      throw new Error("Employee not found");
    }
    res.json({ message: "Employee updated", employee: updated });
  }
);

// Delete employee
export const deleteEmployee = asyncRequestHandler(
  {},
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404);
      throw new Error("Employee not found");
    }
    res.json({ message: "Employee deleted" });
  }
);
