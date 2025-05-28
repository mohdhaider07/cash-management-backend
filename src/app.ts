import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes";
import collectionRoutes from "./routes/collectionRoutes";
import depositRoutes from "./routes/depositRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import adminRoutes from "./routes/adminRoutes";

import connectDB from "./config/db";
import errorHandler from "./middlewares/errorMiddleware";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
const whitelist = [
  "http://localhost:5173",
  "https://cash-management-lyart.vercel.app",
  "https://www.cash-management-frontend.vercel.app",
  ,
];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
// setup the logger
app.use(morgan("dev"));
connectDB();

// health check
app.get("/", (req, res) => {
  res.send("API is running....");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API is running....");
});

export default app;
