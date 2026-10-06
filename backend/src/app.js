import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/index.js';
import logger, { morganStream } from './utils/logger.js';
import v1Router from './routes/v1/index.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import AppError from './utils/AppError.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));

if (config.env !== 'test') {
  app.use(morgan('combined', { stream: morganStream }));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
    },
  });
});

app.use('/api/v1', v1Router);

app.all('{*path}', (req, res, next) => {
  next(AppError.notFound('Route not found'));
});

app.use(errorHandler);

export default app;
