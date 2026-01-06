import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/index.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import accountRoutes from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import goalRoutes from './routes/goal.routes.js';
import aiRoutes from './routes/ai.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import investmentRoutes from './routes/investment.routes.js';
import billRoutes from './routes/bill.routes.js';
import exportRoutes from './routes/export.routes.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
    origin: config.client.url,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Apply global rate limiting
app.use('/api', apiLimiter);

import { sanitizeMongo, sanitizeXss, preventHpp, customSanitize } from './middleware/sanitize.js';
import compression from 'compression';

// ... imports

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Security: Sanitization & HPP
app.use(sanitizeMongo); // Prevent NoSQL injection
app.use(sanitizeXss);   // Prevent XSS
app.use(preventHpp);    // Prevent HTTP Parameter Pollution
app.use(customSanitize); // Custom trimming

// Cookie parser
app.use(cookieParser());

// HTTP request logging
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    }));
}

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '💰 WealthWise API',
        version: '1.0.0',
        documentation: '/health for status',
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'WealthWise API is running',
        environment: config.env,
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/export', exportRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
