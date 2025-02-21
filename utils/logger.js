const winston = require("winston");
require("winston-daily-rotate-file");

// 📌 Configuration du transport de logs (rotation quotidienne)
const transport = new winston.transports.DailyRotateFile({
  filename: "logs/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

// 📌 Création du logger
const logger = winston.createLogger({
  level: "info", // Niveau de log (info, warn, error)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Affichage dans la console
    transport, // Sauvegarde dans un fichier
  ],
});

module.exports = logger;
