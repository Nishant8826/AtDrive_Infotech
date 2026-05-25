const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    const apiMeta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    const userMeta = req.user 
      ? { id: req.user.id, username: req.user.username } 
      : 'anonymous';

    logger.info(`HTTP ${req.method} ${req.originalUrl}`, {
      api: apiMeta,
      user: userMeta
    });
  });

  next();
};

module.exports = requestLogger;
