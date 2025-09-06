// src/utils/logger.ts
import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize, errors } = format;
// Formato personalizado para logs
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
const logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), // para imprimir stack trace en errores
    logFormat),
    transports: [
        new transports.Console(),
        // Puedes agregar archivo si quieres:
        // new transports.File({ filename: "logs/error.log", level: "error" }),
        // new transports.File({ filename: "logs/combined.log" }),
    ],
    exitOnError: false,
});
export default logger;
