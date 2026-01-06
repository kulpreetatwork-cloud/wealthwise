import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import Bill from '../models/Bill.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { emitToUser } from '../sockets/index.js';
import logger from '../utils/logger.js';

/**
 * Process recurring transactions daily at midnight
 */
const processRecurringTransactions = cron.schedule('0 0 * * *', async () => {
    logger.info('Running recurring transactions job...');

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find transactions with recurring rules due today
        const recurringTransactions = await Transaction.find({
            isRecurring: true,
            'recurringRule.nextDate': { $lte: today },
            'recurringRule.endDate': { $gte: today },
        });

        for (const transaction of recurringTransactions) {
            // Create new transaction instance
            const newTransaction = new Transaction({
                userId: transaction.userId,
                accountId: transaction.accountId,
                type: transaction.type,
                amount: transaction.amount,
                category: transaction.category,
                subcategory: transaction.subcategory,
                description: `${transaction.description} (Recurring)`,
                merchant: transaction.merchant,
                date: today,
                isRecurring: false,
                tags: transaction.tags,
            });

            await newTransaction.save();

            // Calculate next occurrence
            const nextDate = calculateNextDate(
                transaction.recurringRule.nextDate,
                transaction.recurringRule.frequency
            );

            // Update the recurring rule
            await Transaction.findByIdAndUpdate(transaction._id, {
                'recurringRule.nextDate': nextDate,
            });

            // Notify user
            await Notification.create({
                userId: transaction.userId,
                type: 'transaction_created',
                title: 'Recurring Transaction Processed',
                message: `Your recurring ${transaction.type} of $${transaction.amount} for ${transaction.category} has been recorded.`,
                data: { transactionId: newTransaction._id },
            });

            emitToUser(transaction.userId.toString(), 'transaction:created', newTransaction);

            logger.info(`Processed recurring transaction: ${transaction._id}`);
        }

        logger.info(`Processed ${recurringTransactions.length} recurring transactions`);
    } catch (error) {
        logger.error('Error processing recurring transactions:', error);
    }
}, { scheduled: false });

/**
 * Check for upcoming and overdue bills daily at 8 AM
 */
const checkBillReminders = cron.schedule('0 8 * * *', async () => {
    logger.info('Running bill reminder job...');

    try {
        const today = new Date();
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        // Find upcoming bills (due in next 3 days)
        const upcomingBills = await Bill.find({
            status: 'pending',
            dueDate: { $gte: today, $lte: threeDaysFromNow },
        });

        for (const bill of upcomingBills) {
            const daysUntilDue = Math.ceil((bill.dueDate - today) / (1000 * 60 * 60 * 24));

            await Notification.create({
                userId: bill.userId,
                type: 'bill_reminder',
                title: 'Upcoming Bill Reminder',
                message: `${bill.name} ($${bill.amount}) is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}.`,
                priority: daysUntilDue <= 1 ? 'high' : 'medium',
                data: { billId: bill._id },
            });

            emitToUser(bill.userId.toString(), 'notification:new', {
                type: 'bill_reminder',
                title: 'Upcoming Bill',
                message: `${bill.name} is due soon`,
            });
        }

        // Find overdue bills
        const overdueBills = await Bill.find({
            status: 'pending',
            dueDate: { $lt: today },
        });

        for (const bill of overdueBills) {
            await Bill.findByIdAndUpdate(bill._id, { status: 'overdue' });

            await Notification.create({
                userId: bill.userId,
                type: 'bill_reminder',
                title: 'Overdue Bill Alert',
                message: `${bill.name} ($${bill.amount}) is overdue! Please pay immediately.`,
                priority: 'high',
                data: { billId: bill._id },
            });

            emitToUser(bill.userId.toString(), 'notification:new', {
                type: 'bill_overdue',
                title: 'Bill Overdue',
                message: `${bill.name} is overdue!`,
            });
        }

        logger.info(`Processed ${upcomingBills.length} upcoming and ${overdueBills.length} overdue bills`);
    } catch (error) {
        logger.error('Error checking bill reminders:', error);
    }
}, { scheduled: false });

/**
 * Cleanup expired refresh tokens weekly on Sundays at 2 AM
 */
const cleanupExpiredTokens = cron.schedule('0 2 * * 0', async () => {
    logger.info('Running token cleanup job...');

    try {
        await User.cleanupExpiredTokens();
        logger.info('Expired tokens cleaned up successfully');
    } catch (error) {
        logger.error('Error cleaning up tokens:', error);
    }
}, { scheduled: false });

/**
 * Calculate next occurrence date based on frequency
 */
const calculateNextDate = (currentDate, frequency) => {
    const next = new Date(currentDate);

    switch (frequency) {
        case 'daily':
            next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
        default:
            next.setMonth(next.getMonth() + 1);
    }

    return next;
};

/**
 * Initialize all scheduled jobs
 */
export const initializeJobs = () => {
    processRecurringTransactions.start();
    checkBillReminders.start();
    cleanupExpiredTokens.start();

    logger.info('Scheduled jobs initialized');
};

/**
 * Stop all scheduled jobs
 */
export const stopJobs = () => {
    processRecurringTransactions.stop();
    checkBillReminders.stop();
    cleanupExpiredTokens.stop();

    logger.info('Scheduled jobs stopped');
};

export default {
    initializeJobs,
    stopJobs,
};
