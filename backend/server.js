const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cluster = require('cluster');
const os = require('os');

const { connectMongoDB, connectMySQL, sequelize } = require('./config/db.js');
const logger = require('./config/logger.js');
const requestLogger = require('./middleware/requestLogger.js');

const productRoutes = require('./routes/product.js');
const authRoutes = require('./routes/auth.js');
const orderRoutes = require('./routes/order.js');
const weatherRoutes = require('./routes/weather.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use(requestLogger);

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/weather', weatherRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error'
  });
});

const bootApp = async () => {
  try {
    await connectMongoDB();
    await connectMySQL();

    const isPrimary = cluster.isPrimary || cluster.isMaster;

    if (isPrimary) {
      logger.info(`Primary process ${process.pid} running. Syncing databases...`);
      console.log(`Primary process ${process.pid} running. Syncing databases...`);
      
      await sequelize.sync({ alter: true });
      logger.info('DB models synced.');
      console.log('DB models synced.');

      const numCPUs = os.cpus().length || 1;
      logger.info(`Spawning ${numCPUs} worker processes...`);
      console.log(`Spawning ${numCPUs} worker processes...`);

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker) => {
        logger.error(`Worker process ${worker.process.pid} terminated. Restarting...`);
        console.error(`Worker process ${worker.process.pid} terminated. Restarting...`);
        cluster.fork();
      });
    } else {
      app.listen(PORT, () => {
        logger.info(`Worker process ${process.pid} listening on port ${PORT}`);
        console.log(`Worker process ${process.pid} listening on port ${PORT}`);
      });
    }
  } catch (error) {
    logger.error(`Failed to bootstrap cluster: ${error.message}`);
    console.error(`Failed to bootstrap cluster: ${error.message}`);
  }
};

bootApp();

module.exports = app;
