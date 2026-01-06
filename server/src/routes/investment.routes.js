import express from 'express';
import {
    getInvestments,
    getInvestment,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    getPortfolioSummary,
} from '../controllers/investment.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, investmentRules, commonRules } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getPortfolioSummary);

router.route('/')
    .get(getInvestments)
    .post(validate(investmentRules.create), createInvestment);

router.route('/:id')
    .all(validate([commonRules.mongoId()]))
    .get(getInvestment)
    .put(updateInvestment)
    .delete(deleteInvestment);

export default router;
