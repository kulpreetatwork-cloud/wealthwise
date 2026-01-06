import express from 'express';
import {
    getBills,
    getBill,
    createBill,
    updateBill,
    deleteBill,
    markBillPaid,
    getBillsSummary,
    getUpcomingBills,
    getOverdueBills,
} from '../controllers/bill.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, billRules, commonRules } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getBillsSummary);
router.get('/upcoming', getUpcomingBills);
router.get('/overdue', getOverdueBills);

router.route('/')
    .get(getBills)
    .post(validate(billRules.create), createBill);

router.route('/:id')
    .all(validate([commonRules.mongoId()]))
    .get(getBill)
    .put(updateBill)
    .delete(deleteBill);

router.post('/:id/pay', markBillPaid);

export default router;
