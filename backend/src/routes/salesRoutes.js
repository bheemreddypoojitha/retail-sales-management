import express from "express";
import {
  getSalesData,
  getFilterOptions,
} from "../controllers/salesController.js";

const router = express.Router();
router.get("/data", getSalesData);
router.get("/filters", getFilterOptions);

export default router;
