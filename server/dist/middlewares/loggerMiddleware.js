import logger from "../utils/logger.js";
export function loggerMiddleware(req, res, next) {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const { method, originalUrl } = req;
        const { statusCode } = res;
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms - IP: ${ip} - UA: ${userAgent}`;
        if (statusCode >= 500) {
            logger.error(logMessage);
        }
        else if (statusCode >= 400) {
            logger.warn(logMessage);
        }
        else {
            logger.info(logMessage);
        }
    });
    next();
}
