import express from 'express';
import { getSalesData, getFilterOptions } from '../controllers/salesController.js';

const router = express.Router();
router.get('/', getSalesData);
router.get('/filters', getFilterOptions);

export default router;