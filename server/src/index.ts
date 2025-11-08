import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
/* ROUTE IMPORTS */
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import saleRoutes from "./routes/saleRoutes";
import summaryRoutes from "./routes/summaryRoutes";
import customerRoutes from "./routes/customerRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import userRoutes from "./routes/userRoutes";
import auditRoutes from "./routes/auditRoutes";
import { authMiddleware } from "./middleware/authMiddleware";
/* CONFIGURATIONS */
dotenv.config();
const app = express();

const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : undefined;

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins ?? true,
    credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);

app.use(authMiddleware);

/* ROUTES */
app.use("/dashboard", dashboardRoutes); // http://localhost:8000/dashboard
app.use("/products", productRoutes); // http://localhost:8000/products
app.use("/sales", saleRoutes); // http://localhost:8000/sales
app.use("/purchases", purchaseRoutes); // http://localhost:8000/purchases
app.use("/customers", customerRoutes); // http://localhost:8000/customers
app.use("/summary", summaryRoutes); // http://localhost:8000/summary
app.use("/users", userRoutes); // http://localhost:8000/users
app.use("/audit-logs", auditRoutes); // http://localhost:8000/audit-logs

/* SERVER */
const port = Number(process.env.PORT) || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});